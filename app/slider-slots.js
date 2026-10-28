const solutionGroups = ["factory", "office", "contract"];
const galleryGroups = ["service", "kitchen", "team-activities", "delivery"];

export const sliderSlotIds = new Set([
  ...Array.from({ length: 3 }, (_, index) => `home.hero.banner.${index + 1}`),
  ...solutionGroups.flatMap((group) => Array.from({ length: 5 }, (_, index) => `home.solutions.${group}.${index + 1}`)),
  ...galleryGroups.flatMap((group) => Array.from({ length: 5 }, (_, index) => `home.gallery.${group}.${index + 1}`)),
]);

const names = {
  banner: "Ảnh đầu trang",
  factory: "Suất ăn nhà máy", office: "Suất ăn văn phòng", contract: "Cung ứng theo hợp đồng",
  service: "Phục vụ", kitchen: "Không gian bếp", "team-activities": "Hoạt động tập thể", delivery: "Giao nhận",
};

export function sliderSlotLabel(slot) {
  const parts = slot.split(".");
  return `${names[parts[2]] || "Slider"} · ảnh ${parts[3]}`;
}
