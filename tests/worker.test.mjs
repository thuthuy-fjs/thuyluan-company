import test from "node:test";
import assert from "node:assert/strict";
import worker, { handleQuote } from "../worker/index.js";
import { handleAdmin, replacementFor } from "../worker/admin.js";
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
    "https://example.com/thuc-don/suat-an-cong-nghiep-21/",
  );
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

test("replacement selection stays within category and aspect ratio", () => {
  const old = { category: "Phục vụ", width: 1200, height: 800 };
  assert.equal(replacementFor(old, [{ id: "wrong", category: "Suất ăn", width: 1200, height: 800 }]), null);
  assert.equal(replacementFor(old, [{ id: "tall", category: "Phục vụ", width: 600, height: 1200 }]), null);
  assert.equal(replacementFor(old, [{ id: "good", category: "Phục vụ", width: 1100, height: 700 }]).id, "good");
});

test("deleting a photo updates every mapped use in one Git commit", async () => {
  const env = { ...adminEnv(), GITHUB_TOKEN: "test", GITHUB_OWNER: "owner", GITHUB_REPO: "repo" };
  const login = await handleAdmin(adminRequest("login", { pin: env.ADMIN_PIN }), env);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const content = { version: 1, text: {}, images: { "other.webp": "/assets/old.webp" }, galleryAdditions: [{ image: "/assets/old.webp", category: "Phục vụ", title: "Ảnh cũ" }] };
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
    if (path.endsWith("/contents/app/editor-content.json")) return Response.json({ content: encoded(content) });
    if (path.endsWith("/contents/app/media-catalog.json")) return Response.json({ content: encoded(media) });
    if (path.endsWith("/contents/public/assets/source-manifest.json")) return Response.json({ content: encoded([]) });
    if (path.endsWith("/git/commits/head")) return Response.json({ tree: { sha: "base" } });
    if (path.endsWith("/git/trees")) { tree = JSON.parse(options.body).tree; return Response.json({ sha: "new-tree" }); }
    if (path.endsWith("/git/commits")) return Response.json({ sha: "new-head" });
    if (path.endsWith("/git/refs/heads/main")) return Response.json({ ok: true });
    throw Error(`Unexpected GitHub path: ${path}`);
  };
  try {
    const response = await handleAdmin(adminRequest("publish", { baseHead: "head", text: {}, uploads: [], deletes: ["old.webp"], replacements: {} }, cookie), env);
    assert.equal(response.status, 200, await response.text());
    const nextContent = JSON.parse(tree.find((item) => item.path === "app/editor-content.json").content);
    assert.equal(nextContent.images["old.webp"], "/assets/similar.webp");
    assert.equal(nextContent.images["other.webp"], "/assets/similar.webp");
    assert.equal(nextContent.galleryAdditions[0].image, "/assets/similar.webp");
    assert.equal(tree.find((item) => item.path === "public/assets/old.webp").sha, null);
  } finally { globalThis.fetch = originalFetch; }
});

test("publishing an uploaded image adds the binary and gallery entry to one Git commit", async () => {
  const env = { ...adminEnv(), GITHUB_TOKEN: "test", GITHUB_OWNER: "owner", GITHUB_REPO: "repo" };
  const login = await handleAdmin(adminRequest("login", { pin: env.ADMIN_PIN }), env);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const content = { version: 1, text: {}, images: {}, galleryAdditions: [] };
  const encoded = (value) => Buffer.from(JSON.stringify(value)).toString("base64");
  const id = "upload-00000000-0000-4000-8000-000000000000.png";
  const documentId = "upload-00000000-0000-4000-8000-000000000001.png";
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9HMV4AAAAASUVORK5CYII=";
  let tree;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path.endsWith("/git/ref/heads/main")) return Response.json({ object: { sha: "head" } });
    if (path.endsWith("/contents/app/editor-content.json")) return Response.json({ content: encoded(content) });
    if (path.endsWith("/contents/app/media-catalog.json")) return Response.json({ content: encoded([]) });
    if (path.endsWith("/contents/public/assets/source-manifest.json")) return Response.json({ content: encoded([]) });
    if (path.endsWith("/git/blobs")) return Response.json({ sha: "image-blob" });
    if (path.endsWith("/git/commits/head")) return Response.json({ tree: { sha: "base" } });
    if (path.endsWith("/git/trees")) { tree = JSON.parse(options.body).tree; return Response.json({ sha: "new-tree" }); }
    if (path.endsWith("/git/commits")) return Response.json({ sha: "new-head" });
    if (path.endsWith("/git/refs/heads/main")) return Response.json({ ok: true });
    throw Error(`Unexpected GitHub path: ${path}`);
  };
  try {
    const response = await handleAdmin(adminRequest("publish", {
      baseHead: "head", text: {}, deletes: [], replacements: {}, uploads: [
        { id, base64: png, width: 1, height: 1, category: "Suất ăn", title: "Ảnh mới", addToGallery: true, galleryCategory: "Phục vụ" },
        { id: documentId, base64: png, width: 1, height: 1, category: "Tài liệu và nhận diện", title: "Ảnh tài liệu", addToGallery: false },
      ],
    }, cookie), env);
    assert.equal(response.status, 200, await response.text());
    assert.equal(tree.find((item) => item.path === `public/assets/${id}`).sha, "image-blob");
    const nextContent = JSON.parse(tree.find((item) => item.path === "app/editor-content.json").content);
    assert.equal(nextContent.galleryAdditions[0].image, `/assets/${id}`);
    const nextMedia = JSON.parse(tree.find((item) => item.path === "app/media-catalog.json").content);
    assert.equal(nextMedia[0].width, 1);
    assert.equal(nextMedia.find((item) => item.id === documentId).protected, true);
  } finally { globalThis.fetch = originalFetch; }
});
