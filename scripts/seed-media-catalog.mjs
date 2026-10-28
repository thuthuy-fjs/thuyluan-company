// One-time migration helper. Do not rerun after editors have published media metadata.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { initialCategory } from "../app/media-groups.js";

const root = path.resolve("public/assets");
const files = (await readdir(root)).filter((file) => /\.(?:webp|jpe?g|png)$/i.test(file)).sort();
const result = [];
for (const file of files) {
  const { width, height } = await sharp(path.join(root, file)).metadata();
  result.push({
    id: file,
    src: `/assets/${file}`,
    category: initialCategory(file),
    width,
    height,
    protected: ["Logo", "Chứng chỉ – Chứng nhận"].includes(initialCategory(file)),
  });
}
await writeFile("app/media-catalog.json", JSON.stringify(result, null, 2) + "\n");
console.log(`Cataloged ${result.length} images.`);
