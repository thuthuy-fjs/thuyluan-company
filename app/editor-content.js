import content from "./editor-content.json";

const fields = new Map();
const reservedKeys = new Set(["id", "slug", "href", "zalo", "source", "extension", "category", "group", "n", "number"]);

export function editableText(id, fallback, section = "Nội dung") {
  fields.set(id, { id, section, defaultValue: fallback });
  return typeof content.text[id] === "string" ? content.text[id] : fallback;
}

export function editableImage(src) {
  if (typeof src !== "string" || !src.startsWith("/assets/")) return src;
  const seen = new Set();
  let current = src;
  while (current.startsWith("/assets/") && !seen.has(current)) {
    seen.add(current);
    const next = content.images[current.slice("/assets/".length)];
    if (!next) return current;
    current = next;
  }
  return src;
}

export function editableSliderImage(slot, fallback) {
  return editableImage(content.sliderImages?.[slot] || fallback);
}

function segment(value, index) {
  const identity = value && typeof value === "object" && !Array.isArray(value)
    ? value.id ?? value.slug ?? value.image
    : undefined;
  return identity === undefined ? String(index) : String(identity).replace(/^\/assets\//, "");
}

export function editableData(section, value, path = section, key = "") {
  if (Array.isArray(value))
    return value.map((item, index) => editableData(section, item, `${path}.${segment(item, index)}`, key));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([name, item]) => [
        name,
        editableData(section, item, `${path}.${name}`, name),
      ]),
    );
  if (typeof value !== "string") return value;
  if (value.startsWith("/assets/")) return editableImage(value);
  if (
    reservedKeys.has(key) ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    /^\d+$/.test(value) ||
    !/\p{L}/u.test(value)
  ) return value;
  return editableText(path, value, section);
}

export function getEditableFields() {
  return [...fields.values()].sort((a, b) => a.section.localeCompare(b.section, "vi") || a.id.localeCompare(b.id));
}

export { content as editorContent };
