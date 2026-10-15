import { meals, articles } from "./data";
export const dynamic = "force-static";
export default function sitemap() {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || "https://suatancongnghiepthuyluan.com";
  return [
    "/",
    "/giai-phap/",
    "/gioi-thieu/",
    "/thuc-don/",
    "/hinh-anh/",
    "/lien-he/",
    "/tin-tuc/",
    "/chinh-sach-bao-mat/",
    ...meals.map((m) => `/thuc-don/${m.slug}/`),
    ...articles.map((a) => `/tin-tuc/${a.slug}/`),
  ].map((path) => ({
    url: new URL(path, origin).href,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
