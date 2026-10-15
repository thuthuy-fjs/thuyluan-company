import { writeFile, readFile } from "node:fs/promises";
import { legacyRedirects } from "../worker/redirects.js";
const source = JSON.parse(
  await readFile(
    new URL("../public/assets/source-manifest.json", import.meta.url),
    "utf8",
  ),
);
for (const asset of source) {
  await readFile(new URL(`../public${asset.src}`, import.meta.url));
}
await writeFile(
  "out/_redirects",
  Object.entries(legacyRedirects)
    .map(([from, to]) => `${from}/ ${to} 301`)
    .join("\n") + "\n",
);
console.log(
  `Validated ${source.length} local image assets and generated legacy redirects.`,
);
