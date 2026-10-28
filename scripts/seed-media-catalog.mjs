// One-time migration helper. Do not rerun after editors have published media metadata.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/assets");
const files = (await readdir(root)).filter((file) => /\.(?:webp|jpe?g|png)$/i.test(file)).sort();
const categoryFor = (file) => {
  if (/^(?:logo|zalo|certificate|iso22000|business-registration|food-safety|document|kitchen-|home-)/.test(file)) return "Tài liệu và nhận diện";
  if (/^(?:meal|menu-photo|gallery-thuc-don|gallery-bua-an)/.test(file)) return "Suất ăn";
  if (/^(?:gallery-bep|gallery-co-so|gallery-so-che)/.test(file)) return "Không gian bếp";
  if (/^(?:gallery-tap-the|gallery-gala|gallery-dao-tao)/.test(file)) return "Hoạt động";
  if (/^gallery-phuc-vu/.test(file)) return "Phục vụ";
  if (/^solution-/.test(file)) return "Giải pháp";
  if (/^gallery-/.test(file)) return "Thư viện";
  return "Khác";
};
const result = [];
for (const file of files) {
  const { width, height } = await sharp(path.join(root, file)).metadata();
  result.push({
    id: file,
    src: `/assets/${file}`,
    category: categoryFor(file),
    width,
    height,
    protected: /^(?:logo|zalo|certificate|iso22000|business-registration|food-safety|document|kitchen-|home-)/.test(file),
  });
}
await writeFile("app/media-catalog.json", JSON.stringify(result, null, 2) + "\n");
console.log(`Cataloged ${result.length} images.`);
