import test from "node:test";
import assert from "node:assert/strict";
import worker, { handleQuote } from "../worker/index.js";
import { handleAdmin } from "../worker/admin.js";
import { imageUsage } from "../app/image-usage.js";
import { readFile } from "node:fs/promises";
import { galleryCategories, initialCategory } from "../app/media-groups.js";

test("bundled images use the requested admin groups", async () => {
  const media = JSON.parse(await readFile(new URL("../app/media-catalog.json", import.meta.url)));
  assert.equal(media.filter((item) => item.category === "Logo").length, 1);
  for (const item of media) assert.equal(item.category, initialCategory(item.id), item.id);
  assert.equal(media.filter((item) => galleryCategories.includes(item.category)).length, 107);
});
const valid = {
  company: "Công ty thử nghiệm",
  name: "Nguyễn An",
  phone: "0965600481",
  location: "Ninh Bình",
  quantity: "500",
  email: "buyer@example.com",
};
const request = (body = valid, init = {}) =>
  new Request("https://example.com/api/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://example.com",
      ...init.headers,
    },
    body: JSON.stringify(body),
    ...init,
  });
test("does not report successful delivery without a recipient", async () => {
  const r = await handleQuote(request(), {});
  assert.equal(r.status, 503);
});
test("rejects invalid payloads before calling recipient", async () => {
  for (const data of [
    { ...valid, phone: "abc" },
    { ...valid, quantity: "-1" },
    { ...valid, email: "x" },
    { ...valid, company: "" },
    { ...valid, message: "x".repeat(2001) },
    null,
  ]) {
    const r = await handleQuote(
      request(data),
      { QUOTE_WEBHOOK_URL: "https://recipient.example.com" },
      () => {
        throw Error("Must not send");
      },
    );
    assert.equal(r.status, 400);
  }
});
test("rejects cross-origin requests and oversized bodies", async () => {
  assert.equal(
    (
      await handleQuote(
        request(valid, {
          headers: {
            "Content-Type": "application/json",
            Origin: "https://other.example",
          },
        }),
        {},
      )
    ).status,
    403,
  );
  assert.equal(
    (await handleQuote(request({ ...valid, message: "x".repeat(17000) }), {}))
      .status,
    413,
  );
});
test("success requires real recipient acknowledgement", async () => {
  let sent;
  const env = {
    QUOTE_WEBHOOK_URL: "https://recipient.example.com",
    QUOTE_WEBHOOK_TOKEN: "test-token",
  };
  const response = await handleQuote(request(), env, async (url, options) => {
    sent = JSON.parse(options.body);
    assert.equal(options.headers.Authorization, "Bearer test-token");
    return new Response("{}", { status: 200 });
  });
  assert.equal(response.status, 200);
  assert.equal(sent.company, valid.company);
  assert.equal(sent.type, "corporate-catering-inquiry");
  assert.equal(
    (
      await handleQuote(
        request(),
        env,
        async () => new Response("", { status: 500 }),
      )
    ).status,
    502,
  );
});
test("keeps original product URLs with permanent redirects", async () => {
  const r = await worker.fetch(
    new Request("https://example.com/mua/suat-an-cong-nghiep-13-2/"),
    {},
  );
  assert.equal(r.status, 301);
  assert.equal(
    r.headers.get("location"),
    "https://example.com/menus/industrial-meal-21/",
  );
});
test("redirects Vietnamese route paths to English ones", async () => {
  for (const [from, to] of [
    ["/thuc-don/suat-an-cong-nghiep-19/", "/menus/industrial-meal-19/"],
    ["/tin-tuc/chon-lua-va-bao-quan-dung-cach/", "/news/proper-food-selection-and-storage/"],
    ["/gioi-thieu/", "/about/"],
    ["/hinh-anh", "/galleries/"],
    ["/lien-he/?x=1", "/contacts/?x=1"],
    ["/ho-so-nang-luc.html", "/company-profile.html"],
  ]) {
    const r = await worker.fetch(new Request(`https://example.com${from}`), {});
    assert.equal(r.status, 301);
    assert.equal(r.headers.get("location"), `https://example.com${to}`);
  }
});

const adminEnv = () => ({ ADMIN_PIN: "1234567890", ADMIN_SESSION_SECRET: "a-long-test-secret-for-signed-cookies" });
const adminRequest = (path, data, cookie) => new Request(`https://example.com/api/admin/${path}`, {
  method: data === undefined ? "GET" : "POST",
  headers: { ...(data === undefined ? {} : { Origin: "https://example.com", "Content-Type": "application/json" }), ...(cookie ? { Cookie: cookie } : {}) },
  ...(data === undefined ? {} : { body: JSON.stringify(data) }),
});

test("admin PIN creates a protected session and rejects wrong codes", async () => {
  const env = adminEnv();
  assert.equal((await handleAdmin(adminRequest("state"), env)).status, 401);
  for (let i = 0; i < 6; i++) assert.equal((await handleAdmin(adminRequest("login", { pin: "0000000000" }), env)).status, 401);
  const success = await handleAdmin(adminRequest("login", { pin: env.ADMIN_PIN }), env);
  assert.equal(success.status, 200);
  const cookie = success.headers.get("set-cookie").split(";")[0];
  assert.match(cookie, /^__Host-thuyluan_admin=/);
  assert.equal((await handleAdmin(adminRequest("session", undefined, cookie), env)).status, 200);
  assert.equal((await (await handleAdmin(adminRequest("session", undefined, cookie), env)).json()).authenticated, true);
  assert.equal((await (await handleAdmin(adminRequest("session", undefined, `${cookie}x`), env)).json()).authenticated, false);
});

test("image usage follows replacements and current slots and certificate pages", () => {
  const entries = [{ image: "/assets/old.webp", label: "Trang chủ" }, { image: "/assets/default.webp", label: "Trang chủ", slot: "home.solutions.factory.1" }];
  const content = { images: { "old.webp": "/assets/new.webp" }, sliderImages: { "home.solutions.factory.1": "/assets/selected.webp" }, certificates: [{ title: "ISO", pages: [{ image: "/assets/document.webp" }] }] };
  assert.deepEqual(imageUsage("old.webp", content, entries), []);
  assert.deepEqual(imageUsage("new.webp", content, entries), ["Trang chủ"]);
  assert.deepEqual(imageUsage("default.webp", content, entries), []);
  assert.ok(imageUsage("selected.webp", content, entries).some((label) => label.includes("Suất ăn nhà máy")));
  assert.deepEqual(imageUsage("document.webp", content, entries), ["Chứng nhận ISO · trang 1"]);
  assert.deepEqual(imageUsage("unused.webp", content, entries), []);
});

test("saving a draft updates every mapped photo use without changing published", async () => {
  const env = { ...adminEnv(), GITHUB_TOKEN: "test", GITHUB_OWNER: "owner", GITHUB_REPO: "repo" };
  const login = await handleAdmin(adminRequest("login", { pin: env.ADMIN_PIN }), env);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const content = { version: 1, text: {}, images: { "other.webp": "/assets/old.webp" }, sliderImages: { "home.gallery.service.1": "/assets/old.webp" }, galleryAdditions: [{ image: "/assets/old.webp", category: "Phục vụ", title: "Ảnh cũ" }] };
  const media = [
    { id: "old.webp", src: "/assets/old.webp", category: "Phục vụ", width: 1200, height: 800, protected: false },
    { id: "similar.webp", src: "/assets/similar.webp", category: "Phục vụ", width: 1100, height: 700, protected: false },
  ];
  const encoded = (value) => Buffer.from(JSON.stringify(value)).toString("base64");
  let tree;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path.endsWith("/git/ref/heads/main")) return Response.json({ object: { sha: "head" } });
    if (path.endsWith("/git/ref/heads/main-draft")) return Response.json({ message: "Not Found" }, { status: 404 });
    if (path.endsWith("/contents/app/editor-content.json")) return Response.json({ content: encoded(content) });
    if (path.endsWith("/contents/app/media-catalog.json")) return Response.json({ content: encoded(media) });
    if (path.endsWith("/git/commits/head")) return Response.json({ tree: { sha: "base" } });
    if (path.endsWith("/git/trees")) { tree = JSON.parse(options.body).tree; return Response.json({ sha: "new-tree" }); }
    if (path.endsWith("/git/commits")) return Response.json({ sha: "new-head" });
    if (path.endsWith("/git/refs")) return Response.json({ ok: true });
    if (path.endsWith("/git/refs/heads/main")) return Response.json({ ok: true });
    throw Error(`Unexpected GitHub path: ${path}`);
  };
  try {
    const blocked = await handleAdmin(adminRequest("draft", { baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: ["old.webp"], replacements: {} }, cookie), env);
    assert.equal(blocked.status, 400);
    assert.match((await blocked.json()).error, /Hãy chọn ảnh thay thế/);
    assert.equal(tree, undefined);
    const response = await handleAdmin(adminRequest("draft", { baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: ["old.webp"], replacements: { "old.webp": "similar.webp" } }, cookie), env);
    assert.equal(response.status, 200, await response.text());
    const nextContent = JSON.parse(tree.find((item) => item.path === "app/editor-content.json").content);
    assert.equal(nextContent.images["old.webp"], "/assets/similar.webp");
    assert.equal(nextContent.images["other.webp"], "/assets/similar.webp");
    assert.equal(nextContent.sliderImages["home.gallery.service.1"], "/assets/similar.webp");
    assert.equal(nextContent.galleryAdditions.length, 0);
    assert.equal(tree.find((item) => item.path === "public/assets/old.webp").sha, null);
    content.sliderImages = {};
    const unused = await handleAdmin(adminRequest("draft", { baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: ["old.webp"], replacements: {} }, cookie), env);
    assert.equal(unused.status, 200, await unused.text());
    const deletedContent = JSON.parse(tree.find((item) => item.path === "app/editor-content.json").content);
    assert.deepEqual(deletedContent.images, {});
    assert.deepEqual(deletedContent.galleryAdditions, []);
    const linkEdit = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: [], replacements: {},
      buttons: { "home.hero.consult": { label: "Tư vấn", href: "/wrong/" } },
    }, cookie), env);
    assert.equal(linkEdit.status, 400);
    const zaloEdit = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: [], replacements: {},
      buttons: { "footer.zalo": { label: "Trao đổi qua Zalo", href: "https://zalo.me/0912345678" } },
    }, cookie), env);
    assert.equal(zaloEdit.status, 200, await zaloEdit.text());
    const invalidZalo = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: [], replacements: {},
      buttons: { "footer.zalo": { label: "Zalo", href: "javascript:alert(1)" } },
    }, cookie), env);
    assert.equal(invalidZalo.status, 400);
    const colorEdit = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: [], replacements: {},
      theme: { accent: "#a15323" },
    }, cookie), env);
    assert.equal(colorEdit.status, 400);
    const invalidSlot = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, uploads: [], deletes: [], replacements: {},
      sliderImages: { "home.gallery.unknown.1": "/assets/similar.webp" },
    }, cookie), env);
    assert.equal(invalidSlot.status, 400);
  } finally { globalThis.fetch = originalFetch; }
});

test("publishing a gallery image and replacement logo keeps one logo", async () => {
  const env = { ...adminEnv(), GITHUB_TOKEN: "test", GITHUB_OWNER: "owner", GITHUB_REPO: "repo" };
  const login = await handleAdmin(adminRequest("login", { pin: env.ADMIN_PIN }), env);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const content = { version: 1, text: {}, images: {}, galleryAdditions: [] };
  const encoded = (value) => Buffer.from(JSON.stringify(value)).toString("base64");
  const id = "upload-00000000-0000-4000-8000-000000000000.png";
  const documentId = "upload-00000000-0000-4000-8000-000000000001.png";
  const certificatePageId = "upload-00000000-0000-4000-8000-000000000002.png";
  const oldDocumentId = "logo.png";
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9HMV4AAAAASUVORK5CYII=";
  let tree;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path.endsWith("/git/ref/heads/main")) return Response.json({ object: { sha: "head" } });
    if (path.endsWith("/git/ref/heads/main-draft")) return Response.json({ message: "Not Found" }, { status: 404 });
    if (path.endsWith("/contents/app/editor-content.json")) return Response.json({ content: encoded(content) });
    if (path.endsWith("/contents/app/media-catalog.json")) return Response.json({ content: encoded([{ id: oldDocumentId, src: `/assets/${oldDocumentId}`, category: "Logo", width: 1, height: 1, protected: true }]) });
    if (path.endsWith("/git/blobs")) return Response.json({ sha: "image-blob" });
    if (path.endsWith("/git/commits/head")) return Response.json({ tree: { sha: "base" } });
    if (path.endsWith("/git/trees")) { tree = JSON.parse(options.body).tree; return Response.json({ sha: "new-tree" }); }
    if (path.endsWith("/git/commits")) return Response.json({ sha: "new-head" });
    if (path.endsWith("/git/refs")) return Response.json({ ok: true });
    if (path.endsWith("/git/refs/heads/main")) return Response.json({ ok: true });
    throw Error(`Unexpected GitHub path: ${path}`);
  };
  try {
    const removeLogo = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, deletes: [oldDocumentId], replacements: {}, uploads: [],
    }, cookie), env);
    assert.equal(removeLogo.status, 400);
    assert.match((await removeLogo.json()).error, /Logo/);
    const emptyCertificate = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, deletes: [], replacements: {}, uploads: [],
      certificates: [{ id: "certificate-new", title: "Chứng nhận lỗi", category: "ISO 22000", pages: [] }],
    }, cookie), env);
    assert.equal(emptyCertificate.status, 400);
    assert.match((await emptyCertificate.json()).error, /1 đến 12 trang/);
    const response = await handleAdmin(adminRequest("draft", {
      baseHead: "head", basePublishedHead: "head", text: {}, deletes: [oldDocumentId], replacements: { [oldDocumentId]: documentId }, sliderImages: { "home.solutions.office.2": `/assets/${id}` },
      certificates: [{ id: "certificate-new", title: "Chứng nhận mới", category: "ISO 22000", pages: [{ title: "Trang 1", image: `/assets/${certificatePageId}` }] }],
      uploads: [
        { id, base64: png, width: 1, height: 1, category: "Phục vụ", title: "Ảnh mới" },
        { id: documentId, base64: png, width: 1, height: 1, category: "Logo", title: "Logo mới" },
        { id: certificatePageId, base64: png, width: 1, height: 1, category: "Chứng chỉ – Chứng nhận", title: "Trang 1" },
      ],
    }, cookie), env);
    assert.equal(response.status, 200, await response.text());
    assert.equal(tree.find((item) => item.path === `public/assets/${id}`).sha, "image-blob");
    assert.equal(tree.find((item) => item.path === `public/assets/${oldDocumentId}`).sha, null);
    const nextContent = JSON.parse(tree.find((item) => item.path === "app/editor-content.json").content);
    assert.equal(nextContent.images[oldDocumentId], `/assets/${documentId}`);
    assert.equal(nextContent.galleryAdditions[0].image, `/assets/${id}`);
    assert.equal(nextContent.galleryAdditions[0].category, "Phục vụ");
    assert.equal(nextContent.sliderImages["home.solutions.office.2"], `/assets/${id}`);
    assert.equal(nextContent.certificates[0].pages[0].image, `/assets/${certificatePageId}`);
    const nextMedia = JSON.parse(tree.find((item) => item.path === "app/media-catalog.json").content);
    assert.equal(nextMedia[0].width, 1);
    assert.equal(nextMedia.find((item) => item.id === documentId).protected, true);
    assert.equal(nextMedia.filter((item) => item.category === "Logo").length, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test("publishing copies the saved draft assets and JSON to published, then syncs draft", async () => {
  const env = { ...adminEnv(), GITHUB_TOKEN: "test", GITHUB_OWNER: "owner", GITHUB_REPO: "repo" };
  const login = await handleAdmin(adminRequest("login", { pin: env.ADMIN_PIN }), env);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const newId = "upload-00000000-0000-4000-8000-000000000000.png";
  const draftContent = { version: 1, text: { "home.hero.line1": "Bữa ăn mới" }, images: { "old.webp": `/assets/${newId}` }, galleryAdditions: [], theme: { accent: "#a15323" }, buttons: {} };
  const oldMedia = [{ id: "old.webp", src: "/assets/old.webp" }];
  const draftMedia = [{ id: newId, src: `/assets/${newId}` }];
  const encoded = (value) => Buffer.from(JSON.stringify(value)).toString("base64");
  let tree;
  const updated = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const ref = parsed.searchParams.get("ref");
    if (path.endsWith("/git/ref/heads/main")) return Response.json({ object: { sha: "head" } });
    if (path.endsWith("/git/ref/heads/main-draft")) return Response.json({ object: { sha: "draft-head" } });
    if (path.endsWith("/contents/app/editor-content.json")) return Response.json({ content: encoded(ref === "main-draft" ? draftContent : { version: 1, text: {}, images: {}, galleryAdditions: [] }) });
    if (path.endsWith("/contents/app/media-catalog.json")) return Response.json({ content: encoded(ref === "main-draft" ? draftMedia : oldMedia) });
    if (path.endsWith(`/contents/public/assets/${newId}`)) return Response.json({ sha: "asset-blob" });
    if (path.endsWith("/compare/head...draft-head")) return Response.json({ status: "ahead" });
    if (path.endsWith("/git/commits/head")) return Response.json({ tree: { sha: "base" } });
    if (path.endsWith("/git/trees")) { tree = JSON.parse(options.body).tree; return Response.json({ sha: "new-tree" }); }
    if (path.endsWith("/git/commits")) return Response.json({ sha: "published-new" });
    if (path.endsWith("/git/refs/heads/main") || path.endsWith("/git/refs/heads/main-draft")) { updated.push({ path, ...JSON.parse(options.body) }); return Response.json({ ok: true }); }
    throw Error(`Unexpected GitHub path: ${path}`);
  };
  try {
    const response = await handleAdmin(adminRequest("publish", { draftHead: "draft-head", publishedHead: "head" }, cookie), env);
    assert.equal(response.status, 200, await response.text());
    assert.equal(tree.find((item) => item.path === `public/assets/${newId}`).sha, "asset-blob");
    assert.equal(tree.find((item) => item.path === "public/assets/old.webp").sha, null);
    assert.equal(JSON.parse(tree.find((item) => item.path === "app/editor-content.json").content).text["home.hero.line1"], "Bữa ăn mới");
    assert.equal(updated.find((item) => item.path.endsWith("/main")).force, false);
    assert.equal(updated.find((item) => item.path.endsWith("/main-draft")).force, true);
  } finally { globalThis.fetch = originalFetch; }
});
