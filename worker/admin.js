import { sliderSlotIds } from "../app/slider-slots.js";
import { imageUsage, resolveImage } from "../app/image-usage.js";
import { galleryCategories as galleryGroupNames, imageCategories, normalizedCategory } from "../app/media-groups.js";

const json = (value, status = 200, headers = {}) => Response.json(value, {
  status,
  headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
});
const encoder = new TextEncoder();
const cookieName = (request) => new URL(request.url).protocol === "https:" ? "__Host-thuyluan_admin" : "thuyluan_admin";
const sessionSeconds = 12 * 60 * 60;
const maxBody = 24 * 1024 * 1024;
const galleryCategories = new Set(galleryGroupNames);
const validCategories = new Set(imageCategories);
const normalizeMedia = (items, content) => items.map((item) => {
  const galleryAddition = content.galleryAdditions?.find((entry) => entry.image === item.src);
  const category = item.id.startsWith("upload-") && galleryCategories.has(galleryAddition?.category) && !galleryCategories.has(item.category)
    ? galleryAddition.category : normalizedCategory(item);
  return { ...item, category, protected: category === "Logo" || category === "Chứng chỉ – Chứng nhận" };
});
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
  const branch = env.GITHUB_BRANCH || "main";
  const draftBranch = env.GITHUB_DRAFT_BRANCH || `${branch}-draft`;
  if (draftBranch === branch) throw new Error("Nhánh nháp phải khác nhánh xuất bản.");
  return { owner: env.GITHUB_OWNER, repo: env.GITHUB_REPO, branch, draftBranch };
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
  const { branch, draftBranch } = githubConfig(env);
  const publishedRef = await github(env, `/git/ref/heads/${encodeURIComponent(branch)}`);
  let draftRef;
  try { draftRef = await github(env, `/git/ref/heads/${encodeURIComponent(draftBranch)}`); }
  catch (error) { if (!error.message.startsWith("GitHub 404:")) throw error; }
  const activeBranch = draftRef ? draftBranch : branch;
  const [content, media, publishedContent, publishedMedia] = await Promise.all([
    file(env, "app/editor-content.json", activeBranch),
    file(env, "app/media-catalog.json", activeBranch),
    draftRef ? file(env, "app/editor-content.json", branch) : Promise.resolve(null),
    draftRef ? file(env, "app/media-catalog.json", branch) : Promise.resolve(null),
  ]);
  return {
    head: draftRef?.object.sha || publishedRef.object.sha,
    draftHead: draftRef?.object.sha || null,
    publishedHead: publishedRef.object.sha,
    hasUnpublishedDraft: Boolean(draftRef && draftRef.object.sha !== publishedRef.object.sha),
    content, media: normalizeMedia(media, content), publishedContent: publishedContent || content, publishedMedia: normalizeMedia(publishedMedia || media, publishedContent || content),
  };
}

async function draftAsset(request, env, id) {
  if (!assetId(id)) return json({ error: "Ảnh không hợp lệ." }, 400);
  try {
    const state = await repositoryState(env);
    const inDraft = state.media.some((item) => item.id === id);
    const inPublished = state.publishedMedia.some((item) => item.id === id);
    if (!inDraft && !inPublished) return json({ error: "Không tìm thấy ảnh." }, 404);
    const { branch, draftBranch } = githubConfig(env);
    const asset = await github(env, `/contents/public/assets/${id}?ref=${encodeURIComponent(inDraft && state.draftHead ? draftBranch : branch)}`);
    const data = asset.content && asset.encoding === "base64" ? asset : await github(env, `/git/blobs/${asset.sha}`);
    const bytes = Uint8Array.from(atob(data.content.replace(/\s/g, "")), (char) => char.charCodeAt(0));
    const type = /\.png$/i.test(id) ? "image/png" : /\.webp$/i.test(id) ? "image/webp" : "image/jpeg";
    return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return json({ error: error.message || "Không tải được ảnh." }, 503); }
}

function classify(file) {
  if (/^\x89PNG\r\n\x1a\n/.test(file)) return "png";
  if (file.startsWith("\xff\xd8\xff")) return "jpg";
  if (file.startsWith("RIFF") && file.slice(8, 12) === "WEBP") return "webp";
  return null;
}

function validateText(text) {
  if (!text || typeof text !== "object" || Array.isArray(text) || Object.keys(text).length > 1500) throw new Error("Dữ liệu văn bản không hợp lệ.");
  for (const [key, value] of Object.entries(text))
    if (!/^[\w.-]{1,160}$/.test(key) || typeof value !== "string" || value.length > 10000) throw new Error("Trường văn bản không hợp lệ.");
}

function validateButtons(buttons) {
  if (!buttons || typeof buttons !== "object" || Array.isArray(buttons) || Object.keys(buttons).some((key) => !["home.hero.consult", "home.hero.services"].includes(key))) throw new Error("Thuộc tính nút không hợp lệ.");
  for (const button of Object.values(buttons)) {
    if (!button || typeof button !== "object" || Object.keys(button).some((key) => key !== "label") || typeof button.label !== "string" || !button.label.trim() || button.label.length > 120) throw new Error("Nội dung nút không hợp lệ.");
  }
}

function validateCertificates(certificates, media) {
  if (!Array.isArray(certificates) || certificates.length > 100) throw new Error("Danh sách chứng nhận không hợp lệ.");
  const ids = new Set();
  const usedImages = new Set();
  const available = new Map(media.filter((item) => item.category === "Chứng chỉ – Chứng nhận").map((item) => [item.src, item]));
  for (const certificate of certificates) {
    if (!certificate || typeof certificate !== "object" || !/^[a-z0-9-]{1,100}$/.test(certificate.id || "") || ids.has(certificate.id)) throw new Error("Mã chứng nhận không hợp lệ.");
    ids.add(certificate.id);
    if (typeof certificate.title !== "string" || !certificate.title.trim() || certificate.title.length > 200) throw new Error("Thông tin chứng nhận không hợp lệ.");
    if (!Array.isArray(certificate.pages) || certificate.pages.length < 1 || certificate.pages.length > 12) throw new Error("Chứng nhận phải có từ 1 đến 12 trang.");
    for (const page of certificate.pages) {
      if (!page || typeof page.title !== "string" || !page.title.trim() || page.title.length > 120 || !available.has(page.image) || usedImages.has(page.image)) throw new Error("Trang chứng nhận không hợp lệ hoặc bị trùng.");
      usedImages.add(page.image);
    }
  }
}

async function saveDraft(request, env) {
  if (!sameOrigin(request)) return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
  let body;
  try { body = await readJsonLimited(request, maxBody); } catch { return json({ error: "Dữ liệu xuất bản không hợp lệ hoặc quá lớn." }, 413); }
  try {
    const state = await repositoryState(env);
    if (body.baseHead !== state.head || body.basePublishedHead !== state.publishedHead) return json({ error: "Nội dung đã thay đổi ở phiên khác. Tải lại trang trước khi lưu nháp." }, 409);
    validateText(body.text);
    if (Object.hasOwn(body, "theme")) throw new Error("Không hỗ trợ chỉnh màu sắc.");
    const buttons = body.buttons ?? state.content.buttons ?? {};
    validateButtons(buttons);
    const sliderImages = body.sliderImages ?? state.content.sliderImages ?? {};
    if (!sliderImages || typeof sliderImages !== "object" || Array.isArray(sliderImages) || Object.keys(sliderImages).some((key) => !sliderSlotIds.has(key))) throw new Error("Vị trí ảnh slider không hợp lệ.");
    if (!Array.isArray(body.uploads) || body.uploads.length > 4 || !Array.isArray(body.deletes) || body.deletes.length > 100) throw new Error("Danh sách ảnh không hợp lệ.");
    const media = [...state.media];
    const deleted = new Set(body.deletes);
    if (deleted.size !== body.deletes.length) throw new Error("Danh sách xóa ảnh bị trùng.");
    for (const id of deleted) if (!assetId(id) || !media.some((item) => item.id === id)) throw new Error("Ảnh cần xóa không hợp lệ.");
    const content = { ...state.content, version: 1, text: body.text, buttons, images: { ...state.content.images }, sliderImages: { ...sliderImages }, galleryAdditions: [...(state.content.galleryAdditions || [])] };
    const tree = [];
    for (const upload of body.uploads) {
      if (!assetId(upload.id) || !/^upload-[a-f0-9-]{36}\.(?:webp|png|jpe?g)$/i.test(upload.id) || media.some((item) => item.id === upload.id) || typeof upload.base64 !== "string" || upload.base64.length > 5_400_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(upload.base64)) throw new Error("Ảnh tải lên không hợp lệ.");
      const binary = atob(upload.base64);
      const kind = classify(binary);
      if (!kind || !(kind === "jpg" ? /\.(?:jpg|jpeg)$/i : new RegExp(`\\.${kind}$`, "i")).test(upload.id)) throw new Error("Định dạng ảnh không khớp.");
      if (!Number.isInteger(upload.width) || !Number.isInteger(upload.height) || upload.width < 1 || upload.height < 1 || upload.width > 10000 || upload.height > 10000) throw new Error("Kích thước ảnh không hợp lệ.");
      const category = String(upload.category || "Khác");
      if (!validCategories.has(category)) throw new Error("Nhóm ảnh không hợp lệ.");
      const title = String(upload.title || upload.id).slice(0, 200);
      const blob = await github(env, "/git/blobs", { method: "POST", body: JSON.stringify({ content: upload.base64, encoding: "base64" }) });
      tree.push({ path: `public/assets/${upload.id}`, mode: "100644", type: "blob", sha: blob.sha });
      media.push({ id: upload.id, src: `/assets/${upload.id}`, category, title, width: upload.width, height: upload.height, protected: category === "Logo" || category === "Chứng chỉ – Chứng nhận" });
      if (galleryCategories.has(category)) content.galleryAdditions.push({ image: `/assets/${upload.id}`, category, title });
    }
    const remaining = media.filter((item) => !deleted.has(item.id));
    const replacements = body.replacements && typeof body.replacements === "object" && !Array.isArray(body.replacements) ? body.replacements : {};
    const nextCategory = (item) => body.mediaUpdates?.[item.id]?.category || item.category;
    if (media.some((item) => item.category === "Logo") || remaining.some((item) => nextCategory(item) === "Logo")) {
      if (remaining.filter((item) => nextCategory(item) === "Logo").length !== 1) throw new Error("Nhóm Logo phải có đúng một ảnh.");
    }
    for (const item of media.filter((entry) => entry.category === "Logo" && deleted.has(entry.id))) {
      if (remaining.find((entry) => entry.id === replacements[item.id])?.category !== "Logo") throw new Error("Logo mới phải thay thế logo cũ.");
    }
    for (const item of media.filter((entry) => entry.category === "Logo" && !deleted.has(entry.id))) {
      if (nextCategory(item) !== "Logo") throw new Error("Không thể chuyển logo sang nhóm khác.");
    }
    for (const [oldId, targetId] of Object.entries(replacements)) {
      if (!assetId(oldId) || !assetId(targetId) || !media.some((item) => item.id === oldId) || !remaining.some((item) => item.id === targetId) || oldId === targetId) throw new Error("Ảnh thay thế không hợp lệ.");
      content.images[oldId] = `/assets/${targetId}`;
    }
    for (const id of deleted) {
      const requested = replacements[id] && remaining.find((item) => item.id === replacements[id]);
      const uses = imageUsage(id, { ...content, certificates: body.certificates ?? content.certificates });
      if (!requested && uses.length) throw new Error(`Ảnh đang được dùng tại: ${uses.join("; ")}. Hãy chọn ảnh thay thế trước khi xóa.`);
      if (requested) {
        for (const [key, value] of Object.entries(content.images)) if (value === `/assets/${id}` || resolveImage(value, content.images) === `/assets/${id}`) content.images[key] = requested.src;
        content.images[id] = requested.src;
        for (const [slot, value] of Object.entries(content.sliderImages)) if (value === `/assets/${id}`) content.sliderImages[slot] = requested.src;
      } else {
        for (const [key, value] of Object.entries(content.images)) if (resolveImage(value, content.images) === `/assets/${id}`) delete content.images[key];
      }
      content.galleryAdditions = content.galleryAdditions.filter((item) => item.image !== `/assets/${id}`);
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
    for (const [slot, value] of Object.entries(content.sliderImages)) {
      if (!sliderSlotIds.has(slot) || typeof value !== "string" || !value.startsWith("/assets/") || !remaining.some((item) => item.src === value)) throw new Error("Ảnh trong slider không hợp lệ.");
    }
    const nextMedia = remaining.map((item) => {
      const update = body.mediaUpdates?.[item.id];
      if (!update || typeof update !== "object") return item;
      const category = String(update.category || item.category);
      if (!validCategories.has(category)) throw new Error("Nhóm ảnh không hợp lệ.");
      return { ...item, title: String(update.title || item.title || item.id).slice(0, 200), category, protected: category === "Logo" || category === "Chứng chỉ – Chứng nhận" };
    });
    const nextMediaBySrc = new Map(nextMedia.map((item) => [item.src, item]));
    content.galleryAdditions = content.galleryAdditions
      .filter((entry) => galleryCategories.has(nextMediaBySrc.get(entry.image)?.category))
      .map((entry) => ({ ...entry, category: nextMediaBySrc.get(entry.image).category }));
    if (body.certificates !== undefined) {
      validateCertificates(body.certificates, nextMedia);
      content.certificates = body.certificates.map((certificate) => ({
        id: certificate.id,
        title: certificate.title.trim(),
        category: certificate.title.trim(),
        pages: certificate.pages.map((page) => ({ title: page.title.trim(), image: page.image })),
      }));
      const referenced = new Set(content.certificates.flatMap((certificate) => certificate.pages.map((page) => page.image)));
      for (const upload of body.uploads) if (upload.category === "Chứng chỉ – Chứng nhận" && !referenced.has(`/assets/${upload.id}`)) throw new Error("Ảnh chứng nhận mới chưa thuộc chứng nhận nào.");
    }
    for (const [path, data] of [
      ["app/editor-content.json", content],
      ["app/media-catalog.json", nextMedia],
    ]) tree.push({ path, mode: "100644", type: "blob", content: JSON.stringify(data, null, 2) + "\n" });
    const parent = await github(env, `/git/commits/${state.head}`);
    const nextTree = await github(env, "/git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
    const commit = await github(env, "/git/commits", { method: "POST", body: JSON.stringify({ message: "Save admin draft", tree: nextTree.sha, parents: [state.head] }) });
    const { draftBranch } = githubConfig(env);
    if (state.draftHead) await github(env, `/git/refs/heads/${encodeURIComponent(draftBranch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
    else await github(env, "/git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${draftBranch}`, sha: commit.sha }) });
    return json({ ok: true, draftCommit: commit.sha, replacements: content.images });
  } catch (error) {
    return json({ error: error.message || "Không thể lưu nháp." }, 400);
  }
}

async function publishDraft(request, env) {
  if (!sameOrigin(request)) return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
  let body;
  try { body = await readJsonLimited(request, 1024); } catch { return json({ error: "Yêu cầu không hợp lệ." }, 400); }
  try {
    const state = await repositoryState(env);
    if (!state.draftHead || !state.hasUnpublishedDraft) throw new Error("Chưa có bản nháp để xuất bản.");
    if (body.draftHead !== state.draftHead || body.publishedHead !== state.publishedHead) return json({ error: "Bản nháp hoặc trang đã thay đổi. Tải lại trước khi xuất bản." }, 409);
    const { branch, draftBranch } = githubConfig(env);
    const comparison = await github(env, `/compare/${encodeURIComponent(state.publishedHead)}...${encodeURIComponent(state.draftHead)}`);
    if (comparison.status !== "ahead") return json({ error: "Nhánh xuất bản đã thay đổi sau khi tạo bản nháp. Cần xử lý xung đột trước khi xuất bản." }, 409);
    const [publishedMedia, parent] = await Promise.all([
      file(env, "app/media-catalog.json", branch),
      github(env, `/git/commits/${state.publishedHead}`),
    ]);
    const oldIds = new Set(publishedMedia.map((item) => item.id));
    const newIds = new Set(state.media.map((item) => item.id));
    const tree = [];
    for (const item of state.media) if (!oldIds.has(item.id)) {
      if (!assetId(item.id)) throw new Error("Ảnh mới không hợp lệ.");
      const asset = await github(env, `/contents/public/assets/${item.id}?ref=${encodeURIComponent(draftBranch)}`);
      tree.push({ path: `public/assets/${item.id}`, mode: "100644", type: "blob", sha: asset.sha });
    }
    for (const item of publishedMedia) if (!newIds.has(item.id)) tree.push({ path: `public/assets/${item.id}`, mode: "100644", type: "blob", sha: null });
    for (const [path, data] of [
      ["app/editor-content.json", state.content],
      ["app/media-catalog.json", state.media],
    ]) tree.push({ path, mode: "100644", type: "blob", content: JSON.stringify(data, null, 2) + "\n" });
    const nextTree = await github(env, "/git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
    const commit = await github(env, "/git/commits", { method: "POST", body: JSON.stringify({ message: "Publish admin draft", tree: nextTree.sha, parents: [state.publishedHead] }) });
    await github(env, `/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
    let draftReset = true;
    try { await github(env, `/git/refs/heads/${encodeURIComponent(draftBranch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: true }) }); }
    catch { draftReset = false; }
    return json({ ok: true, commit: commit.sha, draftReset });
  } catch (error) { return json({ error: error.message || "Không thể xuất bản." }, 400); }
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
  if (path.startsWith("/api/admin/asset/") && request.method === "GET") return draftAsset(request, env, path.slice("/api/admin/asset/".length));
  if (path === "/api/admin/state" && request.method === "GET") {
    try { return json(await repositoryState(env)); }
    catch (error) { return json({ error: error.message || "Không tải được dữ liệu." }, 503); }
  }
  if (path === "/api/admin/draft" && request.method === "POST") return saveDraft(request, env);
  if (path === "/api/admin/publish" && request.method === "POST") return publishDraft(request, env);
  return json({ error: "Không tìm thấy API quản trị." }, 404);
}
