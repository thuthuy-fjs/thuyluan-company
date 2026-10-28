import { legacyRedirects } from "./redirects.js";
import { handleAdmin } from "./admin.js";

const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const limits = {
  company: 180,
  name: 120,
  phone: 24,
  email: 200,
  location: 240,
  quantity: 8,
  shift: 50,
  budget: 100,
  menus: 300,
  message: 2000,
};

export async function handleQuote(request, env, send = fetch) {
  if (request.method !== "POST")
    return json({ error: "Phương thức không được hỗ trợ." }, 405);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Yêu cầu phải có định dạng JSON." }, 415);
  if (Number(request.headers.get("content-length")) > 16000)
    return json({ error: "Nội dung vượt giới hạn." }, 413);
  let body;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Thiếu nội dung." }, 400);
    const chunks = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16000) {
        await reader.cancel();
        return json({ error: "Nội dung vượt giới hạn." }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return json({ error: "Nội dung không hợp lệ." }, 400);
  }
  if (!body || Array.isArray(body) || typeof body !== "object")
    return json({ error: "Nội dung không hợp lệ." }, 400);
  if (body.website) return json({ error: "Yêu cầu không hợp lệ." }, 400);
  const fields = {};
  for (const [key, max] of Object.entries(limits)) {
    if (
      body[key] !== undefined &&
      typeof body[key] !== "string" &&
      typeof body[key] !== "number"
    )
      return json({ error: `Trường ${key} không hợp lệ.` }, 400);
    fields[key] = String(body[key] ?? "").trim();
    if (fields[key].length > max)
      return json({ error: `Trường ${key} vượt giới hạn.` }, 400);
  }
  if (
    !fields.company ||
    !fields.name ||
    !fields.location ||
    !/^(\+?84|0)[\d\s.()-]{8,14}$/.test(fields.phone) ||
    !/^\d+$/.test(fields.quantity) ||
    Number(fields.quantity) < 1 ||
    Number(fields.quantity) > 1000000
  )
    return json({ error: "Vui lòng kiểm tra thông tin bắt buộc." }, 400);
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    return json({ error: "Email không hợp lệ." }, 400);
  // No successful submission is reported until a real configured recipient accepts it.
  if (!env.QUOTE_WEBHOOK_URL)
    return json(
      {
        error:
          "Chưa cấu hình dịch vụ tiếp nhận. Vui lòng gửi qua email hoặc Zalo.",
      },
      503,
    );
  let webhook;
  try {
    webhook = new URL(env.QUOTE_WEBHOOK_URL);
    if (webhook.protocol !== "https:") throw new Error();
  } catch {
    return json({ error: "Dịch vụ tiếp nhận chưa sẵn sàng." }, 503);
  }
  try {
    const response = await send(webhook.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.QUOTE_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${env.QUOTE_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        type: "corporate-catering-inquiry",
        ...fields,
        receivedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    if (!response.ok)
      return json(
        { error: "Dịch vụ tiếp nhận chưa phản hồi thành công." },
        502,
      );
    return json({ ok: true });
  } catch {
    return json(
      { error: "Chưa gửi được yêu cầu. Vui lòng thử email hoặc Zalo." },
      502,
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/admin/")) return handleAdmin(request, env);
    if (url.pathname === "/api/quote") return handleQuote(request, env);
    if (url.pathname === "/api/health")
      return json({ ok: true, service: "thuy-luan-corporate-food-service" });
    if (url.pathname.startsWith("/api/"))
      return json({ error: "Không tìm thấy API." }, 404);
    const canonical = url.pathname.replace(/\/$/, "") || "/";
    const redirect = legacyRedirects[canonical];
    if (redirect) return Response.redirect(new URL(redirect, url.origin), 301);
    const response = await env.ASSETS.fetch(request);
    const secured = new Response(response.body, response);
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/"))
      secured.headers.set("X-Robots-Tag", "noindex, nofollow");
    secured.headers.set("X-Content-Type-Options", "nosniff");
    secured.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    secured.headers.set("X-Frame-Options", "SAMEORIGIN");
    return secured;
  },
};
