// Portable preview of the exact exported assets, with the real Worker handler.
// Useful on systems whose GLIBC is older than the local workerd requirement.
import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import worker from "../worker/index.js";
const root = path.resolve("out");
const port = Number(process.env.PORT || process.argv[2] || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
};
const ASSETS = {
  async fetch(request) {
    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    let file = path.resolve(root, "." + pathname);
    if (!file.startsWith(root + path.sep) && file !== root)
      return new Response("Forbidden", { status: 403 });
    if (request.method !== "GET" && request.method !== "HEAD")
      return new Response("Method not allowed", { status: 405 });
    try {
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!pathname.endsWith("/")) {
          url.pathname += "/";
          return Response.redirect(url, 308);
        }
        file = path.join(file, "index.html");
      }
      const body = await readFile(file);
      return new Response(request.method === "HEAD" ? null : body, {
        headers: {
          "Content-Type":
            types[path.extname(file)] || "application/octet-stream",
        },
      });
    } catch {
      return new Response(
        request.method === "HEAD"
          ? null
          : await readFile(path.join(root, "404.html")),
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }
  },
};
http
  .createServer(async (req, res) => {
    try {
      const body = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 17000) {
          res.writeHead(413);
          res.end();
          return;
        }
        body.push(chunk);
      }
      const request = new Request(
        `http://${req.headers.host || `localhost:${port}`}${req.url}`,
        {
          method: req.method,
          headers: req.headers,
          ...(!["GET", "HEAD"].includes(req.method)
            ? { body: Buffer.concat(body) }
            : {}),
        },
      );
      const result = await worker.fetch(request, { ASSETS });
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(Buffer.from(await result.arrayBuffer()));
    } catch {
      res.writeHead(500);
      res.end("Preview server error");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Static build preview: http://localhost:${port}`),
  );
