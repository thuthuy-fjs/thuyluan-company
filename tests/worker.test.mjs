import test from "node:test";
import assert from "node:assert/strict";
import worker, { handleQuote } from "../worker/index.js";
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
