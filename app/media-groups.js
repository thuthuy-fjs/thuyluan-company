export const galleryCategories = ["Không gian bếp", "Giao nhận", "Phục vụ", "Hoạt động tập thể"];
export const imageCategories = ["Logo", "Suất ăn", ...galleryCategories, "Chứng chỉ – Chứng nhận", "Khác"];

export function initialCategory(id) {
  if (id === "logo.png") return "Logo";
  if (/^(?:menu-photo-|meal-)/.test(id)) return "Suất ăn";
  if (/^(?:business-registration|certificate-|food-safety-site|iso22000-)/.test(id)) return "Chứng chỉ – Chứng nhận";
  const numbered = /^gallery-(\d{2})\./.exec(id);
  if (numbered) {
    const number = Number(numbered[1]);
    return number <= 7 ? "Giao nhận" : number <= 15 || number === 22 ? "Không gian bếp" : "Phục vụ";
  }
  if (/^gallery-(?:bep|co-so|so-che)-/.test(id)) return "Không gian bếp";
  if (/^gallery-(?:tap-the|gala|dao-tao)-/.test(id)) return "Hoạt động tập thể";
  if (/^gallery-(?:phuc-vu|bua-an|thuc-don)-/.test(id)) return "Phục vụ";
  return "Khác";
}

export function normalizedCategory(item) {
  const id = item.id || item.src?.split("/").at(-1) || "";
  if (id === "logo.png" || /^(?:menu-photo-|meal-|business-registration|certificate-|food-safety-site|iso22000-)/.test(id)) return initialCategory(id);
  if (imageCategories.includes(item.category)) return item.category;
  return id.startsWith("upload-") ? "Khác" : initialCategory(id);
}
