import placements from "./image-usage.json" with { type: "json" };
import { sliderSlotLabel } from "./slider-slots.js";

export function resolveImage(src, images = {}) {
  const seen = new Set();
  while (src?.startsWith("/assets/") && images[src.slice(8)] && !seen.has(src)) {
    seen.add(src);
    src = images[src.slice(8)];
  }
  return src;
}

export function imageUsage(id, content, entries = placements) {
  const src = `/assets/${id}`;
  const uses = new Set();
  for (const entry of entries) {
    if (entry.certificate && Array.isArray(content.certificates)) continue;
    const image = entry.slot ? content.sliderImages?.[entry.slot] || entry.image : entry.image;
    if (resolveImage(image, content.images) === src)
      uses.add(entry.slot ? `${entry.label} · ${sliderSlotLabel(entry.slot)}` : entry.certificate ? `${entry.label} · Chứng chỉ – Chứng nhận` : entry.label);
  }
  for (const [slot, image] of Object.entries(content.sliderImages || {}))
    if (resolveImage(image, content.images) === src) uses.add(`Trang chủ · ${sliderSlotLabel(slot)}`);
  for (const certificate of content.certificates || [])
    certificate.pages.forEach((page, index) => {
      if (resolveImage(page.image, content.images) === src) uses.add(`Chứng nhận ${certificate.title} · trang ${index + 1}`);
    });
  return [...uses];
}
