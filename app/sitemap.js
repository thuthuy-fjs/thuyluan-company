import { meals, articles } from "./data";
export const dynamic = "force-static";
export default function sitemap() {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || "https://suatancongnghiepthuyluan.com";
  return [
    "/",
    "/services/",
    "/about/",
    "/menus/",
    "/galleries/",
    "/contacts/",
    "/news/",
    "/privacy-policies/",
    ...meals.map((m) => `/menus/${m.slug}/`),
    ...articles.map((a) => `/news/${a.slug}/`),
  ].map((path) => ({
    url: new URL(path, origin).href,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
