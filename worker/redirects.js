const mealSlug = (n) => `industrial-meal-${n}`;

/** Old Vietnamese article slugs and their English replacements. */
const articleSlugs = {
  "cac-tieu-chi-cung-cap-suat-an-cong-nghiep-dat-chuan":
    "standard-industrial-meal-supply-criteria",
  "chon-lua-va-bao-quan-dung-cach": "proper-food-selection-and-storage",
  "suat-an-can-doi-ve-dinh-duong-va-hai-hoa-ve-khau-vi-la-nhu-the-nao":
    "balanced-nutritious-and-tasty-meals",
};

export const legacyRedirects = {
  "/product-category/suat-an-cong-nghiep": "/menus/",
  "/category/tin-tuc": "/news/",
  "/mua": "/menus/",
  "/mua/suat-an-cong-nghiep-13-2": `/menus/${mealSlug(21)}/`,
  "/mua/suat-an-cong-nghiep-14-2": `/menus/${mealSlug(22)}/`,
  "/mua/suat-an-cong-nghiep-07-2": `/menus/${mealSlug("08")}/`,
  ...Object.fromEntries(
    Array.from({ length: 22 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return [
        [`/mua/suat-an-cong-nghiep-${n}`, `/menus/${mealSlug(n)}/`],
        [`/thuc-don/suat-an-cong-nghiep-${n}`, `/menus/${mealSlug(n)}/`],
      ];
    }).flat(),
  ),
  ...Object.fromEntries(
    Object.entries(articleSlugs).flatMap(([from, to]) => [
      [`/${from}`, `/news/${to}/`],
      [`/tin-tuc/${from}`, `/news/${to}/`],
    ]),
  ),
  "/ho-so-nang-luc.html": "/company-profile.html",
};

/** Vietnamese route prefixes renamed to English; sub-paths keep their slug. */
export const legacyPrefixes = {
  "/chinh-sach-bao-mat": "/privacy-policies",
  "/giai-phap": "/services",
  "/gioi-thieu": "/about",
  "/hinh-anh": "/galleries",
  "/lien-he": "/contacts",
  "/thuc-don": "/menus",
  "/tin-tuc": "/news",
};

export function findLegacyRedirect(pathname) {
  const canonical = pathname.replace(/\/$/, "") || "/";
  if (legacyRedirects[canonical]) return legacyRedirects[canonical];
  const [, first, ...rest] = canonical.split("/");
  const target = legacyPrefixes[`/${first}`];
  return target ? `${[target, ...rest].join("/")}/` : null;
}
