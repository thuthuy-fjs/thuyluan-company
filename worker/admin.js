const json = (value, status = 200, headers = {}) => Response.json(value, {
  status,
  headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
});
const encoder = new TextEncoder();
const cookieName = (request) => new URL(request.url).protocol === "https:" ? "__Host-thuyluan_admin" : "thuyluan_admin";
const sessionSeconds = 12 * 60 * 60;
const maxBody = 24 * 1024 * 1024;
const galleryCategories = new Set(["Không gian bếp", "Giao nhận", "Phục vụ", "Hoạt động tập thể"]);
const assetId = (value) => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:webp|png|jpe?g)$/i.test(value);
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64url = (value) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function readJsonLimited(request, limit) {
  if (Number(request.headers.get("content-length")) > limit) throw new Error("Yêu cầu quá lớn.");
  if (!request.headers.get("content-type")?.includes("application/json")) throw new Error("Yêu cầu phải là JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Thiếu nội dung.");
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) { await reader.cancel(); throw new Error("Yêu cầu quá lớn."); }
    chunks.push(value);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(result));
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

async function session(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return false;
  const name = cookieName(request);
  const token = request.headers.get("cookie")?.split(/;\s*/).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
    if (!Number.isSafeInteger(data.exp) || data.exp < Date.now()) return false;
    const actual = await hmac(env.ADMIN_SESSION_SECRET, payload);
    const supplied = fromBase64url(signature);
    if (actual.length !== supplied.length) return false;
    let difference = 0;
    for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ supplied[i];
    return difference === 0;
  } catch { return false; }
}

function cookie(value, request, maxAge) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName(request)}=${value}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${maxAge}`;
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

async function login(request, env) {
  if (!sameOrigin(request)) return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
  if (!/^\d{10,16}$/.test(env.ADMIN_PIN || "") || !env.ADMIN_SESSION_SECRET) return json({ error: "Quản trị chưa được cấu hình." }, 503);
  const now = Date.now();
  let body;
  try { body = await readJsonLimited(request, 256); } catch { return json({ error: "Yêu cầu không hợp lệ." }, 400); }
  const pin = body?.pin;
  if (typeof pin !== "string" || !/^\d{1,16}$/.test(pin)) return json({ error: "Mã PIN không hợp lệ." }, 400);
  const actual = await hmac(env.ADMIN_SESSION_SECRET, `pin:${pin}`);
  const expected = await hmac(env.ADMIN_SESSION_SECRET, `pin:${env.ADMIN_PIN}`);
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ expected[i];
  if (difference !== 0) return json({ error: "Mã PIN không đúng." }, 401);
  const payload = base64url(encoder.encode(JSON.stringify({ exp: now + sessionSeconds * 1000 })));
  const signature = base64url(await hmac(env.ADMIN_SESSION_SECRET, payload));
  return json({ ok: true }, 200, { "Set-Cookie": cookie(`${payload}.${signature}`, request, sessionSeconds) });
}

function githubConfig(env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) throw new Error("Chưa cấu hình kết nối GitHub.");
  return { owner: env.GITHUB_OWNER, repo: env.GITHUB_REPO, branch: env.GITHUB_BRANCH || "main" };
}

async function github(env, route, options = {}) {
  const { owner, repo } = githubConfig(env);
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}${route}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "thuy-luan-admin",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${result.message || "Lỗi kết nối"}`);
  return result;
}

async function file(env, path, branch) {
  const result = await github(env, `/contents/${path}?ref=${encodeURIComponent(branch)}`);
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(result.content.replace(/\s/g, "")), (c) => c.charCodeAt(0))));
}

async function repositoryState(env) {
  const { branch } = githubConfig(env);
  const ref = await github(env, `/git/ref/heads/${encodeURIComponent(branch)}`);
  const [content, media, source] = await Promise.all([
    file(env, "app/editor-content.json", branch),
    file(env, "app/media-catalog.json", branch),
    file(env, "public/assets/source-manifest.json", branch),
  ]);
  return { head: ref.object.sha, content, media, source };
}

function classify(file) {
  if (/^\x89PNG\r\n\x1a\n/.test(file)) return "png";
  if (file.startsWith("\xff\xd8\xff")) return "jpg";
  if (file.startsWith("RIFF") && file.slice(8, 12) === "WEBP") return "webp";
  return null;
}

export function replacementFor(old, candidates) {
  const sameCategory = candidates.filter((item) => item.category === old.category);
  const ratio = old.width / old.height;
  const suitable = sameCategory.filter((item) => {
    const difference = (item.width / item.height) / ratio;
    return difference >= 0.7 && difference <= 1.4;
  });
  if (!suitable.length) return null;
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  return suitable[random % suitable.length];
}

function validateText(text) {
  if (!text || typeof text !== "object" || Array.isArray(text) || Object.keys(text).length > 1500) throw new Error("Dữ liệu văn bản không hợp lệ.");
  for (const [key, value] of Object.entries(text))
    if (!/^[\w.-]{1,160}$/.test(key) || typeof value !== "string" || value.length > 10000) throw new Error("Trường văn bản không hợp lệ.");
}

async function publish(request, env) {
  if (!sameOrigin(request)) return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
  let body;
  try { body = await readJsonLimited(request, maxBody); } catch { return json({ error: "Dữ liệu xuất bản không hợp lệ hoặc quá lớn." }, 413); }
  try {
    const state = await repositoryState(env);
    if (body.baseHead !== state.head) return json({ error: "Nội dung đã thay đổi ở phiên khác. Tải lại trang trước khi xuất bản." }, 409);
    validateText(body.text);
    if (!Array.isArray(body.uploads) || body.uploads.length > 4 || !Array.isArray(body.deletes) || body.deletes.length > 100) throw new Error("Danh sách ảnh không hợp lệ.");
    const media = [...state.media];
    const deleted = new Set(body.deletes);
    if (deleted.size !== body.deletes.length) throw new Error("Danh sách xóa ảnh bị trùng.");
    for (const id of deleted) if (!assetId(id) || !media.some((item) => item.id === id)) throw new Error("Ảnh cần xóa không hợp lệ.");
    const content = { ...state.content, version: 1, text: body.text, images: { ...state.content.images }, galleryAdditions: [...(state.content.galleryAdditions || [])] };
    const tree = [];
    const source = [...state.source];
    for (const upload of body.uploads) {
      if (!assetId(upload.id) || !/^upload-[a-f0-9-]{36}\.(?:webp|png|jpe?g)$/i.test(upload.id) || media.some((item) => item.id === upload.id) || typeof upload.base64 !== "string" || upload.base64.length > 5_400_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(upload.base64)) throw new Error("Ảnh tải lên không hợp lệ.");
      const binary = atob(upload.base64);
      const kind = classify(binary);
      if (!kind || !(kind === "jpg" ? /\.(?:jpg|jpeg)$/i : new RegExp(`\\.${kind}$`, "i")).test(upload.id)) throw new Error("Định dạng ảnh không khớp.");
      if (!Number.isInteger(upload.width) || !Number.isInteger(upload.height) || upload.width < 1 || upload.height < 1 || upload.width > 10000 || upload.height > 10000) throw new Error("Kích thước ảnh không hợp lệ.");
      const category = String(upload.category || "Khác").slice(0, 80);
      const title = String(upload.title || upload.id).slice(0, 200);
      if (upload.addToGallery && !galleryCategories.has(upload.galleryCategory)) throw new Error("Nhóm thư viện ảnh không hợp lệ.");
      const blob = await github(env, "/git/blobs", { method: "POST", body: JSON.stringify({ content: upload.base64, encoding: "base64" }) });
      tree.push({ path: `public/assets/${upload.id}`, mode: "100644", type: "blob", sha: blob.sha });
      media.push({ id: upload.id, src: `/assets/${upload.id}`, category, title, width: upload.width, height: upload.height, protected: false });
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
      source.push({ id: upload.id.replace(/\.[^.]+$/, ""), src: `/assets/${upload.id}`, source: "admin-upload", width: upload.width, height: upload.height, sha256: hash });
      if (upload.addToGallery) content.galleryAdditions.push({ image: `/assets/${upload.id}`, category: upload.galleryCategory, title });
    }
    const remaining = media.filter((item) => !deleted.has(item.id));
    const replacements = body.replacements && typeof body.replacements === "object" && !Array.isArray(body.replacements) ? body.replacements : {};
    for (const [oldId, targetId] of Object.entries(replacements)) {
      if (!assetId(oldId) || !assetId(targetId) || !media.some((item) => item.id === oldId) || !remaining.some((item) => item.id === targetId) || oldId === targetId) throw new Error("Ảnh thay thế không hợp lệ.");
      content.images[oldId] = `/assets/${targetId}`;
    }
    for (const id of deleted) {
      const old = media.find((item) => item.id === id);
      const requested = replacements[id] && remaining.find((item) => item.id === replacements[id]);
      if (old.protected && !requested) throw new Error(`Ảnh ${id} cần chọn ảnh thay thế thủ công.`);
      const chosen = requested || replacementFor(old, remaining.filter((item) => !item.protected));
      if (!chosen) throw new Error(`Không có ảnh phù hợp để thay thế ${id}.`);
      for (const [key, value] of Object.entries(content.images)) if (value === `/assets/${id}`) content.images[key] = chosen.src;
      content.images[id] = chosen.src;
      content.galleryAdditions = content.galleryAdditions.map((item) => item.image === `/assets/${id}` ? { ...item, image: chosen.src } : item);
      tree.push({ path: `public/assets/${id}`, mode: "100644", type: "blob", sha: null });
    }
    for (const [key, value] of Object.entries(content.images)) {
      if (!assetId(key) || !remaining.some((item) => item.src === value)) throw new Error("Tham chiếu ảnh không hợp lệ.");
      const seen = new Set();
      let current = key;
      while (content.images[current]) {
        if (seen.has(current)) throw new Error("Ảnh thay thế tạo vòng lặp.");
        seen.add(current);
        current = content.images[current].slice(8);
      }
    }
    const nextMedia = remaining.map((item) => {
      const update = body.mediaUpdates?.[item.id];
      return update && typeof update === "object" ? { ...item, title: String(update.title || item.title || item.id).slice(0, 200), category: String(update.category || item.category).slice(0, 80) } : item;
    });
    const nextSource = source.filter((item) => !deleted.has(item.src?.slice(8)));
    for (const [path, data] of [
      ["app/editor-content.json", content],
      ["app/media-catalog.json", nextMedia],
      ["public/assets/source-manifest.json", nextSource],
    ]) tree.push({ path, mode: "100644", type: "blob", content: JSON.stringify(data, null, 2) + "\n" });
    const parent = await github(env, `/git/commits/${state.head}`);
    const nextTree = await github(env, "/git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
    const commit = await github(env, "/git/commits", { method: "POST", body: JSON.stringify({ message: "Publish site content from admin", tree: nextTree.sha, parents: [state.head] }) });
    const { branch } = githubConfig(env);
    await github(env, `/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
    return json({ ok: true, commit: commit.sha, replacements: content.images });
  } catch (error) {
    return json({ error: error.message || "Không thể xuất bản." }, 400);
  }
}

export async function handleAdmin(request, env) {
  const path = new URL(request.url).pathname;
  if (path === "/api/admin/login" && request.method === "POST") return login(request, env);
  if (path === "/api/admin/session" && request.method === "GET") return json({ authenticated: await session(request, env) });
  if (path === "/api/admin/logout" && request.method === "POST") {
    if (!sameOrigin(request)) return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
    return json({ ok: true }, 200, { "Set-Cookie": cookie("", request, 0) });
  }
  if (!await session(request, env)) return json({ error: "Cần đăng nhập quản trị." }, 401);
  if (path === "/api/admin/state" && request.method === "GET") {
    try { return json(await repositoryState(env)); }
    catch (error) { return json({ error: error.message || "Không tải được dữ liệu." }, 503); }
  }
  if (path === "/api/admin/publish" && request.method === "POST") return publish(request, env);
  return json({ error: "Không tìm thấy API quản trị." }, 404);
}
