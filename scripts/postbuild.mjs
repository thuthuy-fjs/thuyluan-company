import { writeFile, readFile } from "node:fs/promises";
import { legacyRedirects } from "../worker/redirects.js";
import content from "../app/editor-content.json" with { type: "json" };
const source = JSON.parse(
  await readFile(
    new URL("../public/assets/source-manifest.json", import.meta.url),
    "utf8",
  ),
);
for (const asset of source) {
  await readFile(new URL(`../public${asset.src}`, import.meta.url));
}
const profile = new URL("../out/ho-so-nang-luc.html", import.meta.url);
let profileHtml = await readFile(profile, "utf8");
for (const target of Object.values(content.images || {}))
  await readFile(new URL(`../public${target}`, import.meta.url));
profileHtml = profileHtml.replace(/\/assets\/([a-zA-Z0-9_.-]+\.(?:webp|png|jpe?g))/gi, (match, file) => {
  const seen = new Set();
  let current = match;
  while (content.images?.[current.slice(8)] && !seen.has(current)) {
    seen.add(current);
    current = content.images[current.slice(8)];
  }
  return seen.has(current) ? match : current;
});
await writeFile(profile, profileHtml);
await writeFile(
  "out/_redirects",
  Object.entries(legacyRedirects)
    .map(([from, to]) => `${from}/ ${to} 301`)
    .join("\n") + "\n",
);
console.log(
  `Validated ${source.length} local image assets and generated legacy redirects.`,
);
