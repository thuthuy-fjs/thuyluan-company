import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import content from "../app/editor-content.json" with { type: "json" };

const entries = new Map();
const resolve = (src) => {
  const seen = new Set();
  while (content.images?.[src.slice(8)] && !seen.has(src)) {
    seen.add(src);
    src = content.images[src.slice(8)];
  }
  return src;
};
const original = (src) => {
  const id = Object.keys(content.images || {}).find((id) => resolve(`/assets/${id}`) === src);
  return id ? `/assets/${id}` : src;
};
async function scan(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { await scan(file); continue; }
    if (!file.endsWith(".html")) continue;
    const route = path.relative("out", file).replaceAll("\\", "/");
    if (route.startsWith("admin/") || route.startsWith("galleries/") || route === "404.html") continue;
    const html = await readFile(file, "utf8");
    const pageNames = { "index.html": "Trang chủ", "about/index.html": "Về chúng tôi", "menus/index.html": "Thực đơn", "services/index.html": "Dịch vụ", "contacts/index.html": "Liên hệ", "news/index.html": "Góc chia sẻ", "company-profile.html": "Hồ sơ năng lực" };
    const meal = route.match(/^menus\/industrial-meal-(\d+)\//);
    const page = pageNames[route] || (meal ? `Thực đơn · Suất ăn công nghiệp ${meal[1]}` : route.replace(/\/index\.html$/, "").replace(/\.html$/, ""));
    const certificates = /<section\b[^>]*id="certificates"[\s\S]*?<\/section>/g;
    const inspect = (markup, certificate = false) => {
      for (const match of markup.matchAll(/<img\b[^>]*>/g)) {
        const attributes = Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map((entry) => [entry[1], entry[2]]));
        if (!attributes.src?.startsWith("/assets/")) continue;
        const entry = { image: attributes["data-editor-slider-default"] || original(attributes.src), label: page };
        if (attributes["data-editor-slider-slot"]) entry.slot = attributes["data-editor-slider-slot"];
        if (certificate) entry.certificate = true;
        entries.set(JSON.stringify(entry), entry);
      }
    };
    for (const section of html.matchAll(certificates)) inspect(section[0], true);
    inspect(html.replace(certificates, ""));
  }
}
await scan("out");
// Pages inside a certificate modal are only rendered after clicking its cover.
const data = await readFile("app/data.js", "utf8");
const defaults = data.slice(data.indexOf("const existingCertificates"), data.indexOf("export const certificates ="));
for (const match of defaults.matchAll(/image:\s*"(\/assets\/[^\"]+)"/g)) {
  const entry = { image: match[1], label: "Chứng chỉ – Chứng nhận", certificate: true };
  entries.set(JSON.stringify(entry), entry);
}
for (const match of defaults.matchAll(/isoPage\("([^"]+)"/g)) {
  const entry = { image: `/assets/${match[1]}.webp`, label: "Chứng chỉ – Chứng nhận", certificate: true };
  entries.set(JSON.stringify(entry), entry);
}
await writeFile("app/image-usage.json", JSON.stringify([...entries.values()], null, 2) + "\n");
console.log(`Indexed ${entries.size} image placements for safe deletion.`);
