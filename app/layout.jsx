import "./globals.css";
import "./header.css";
import "./hero.css";
import "./certifications.css";
import { Header, Footer } from "./components/site";
import FloatingContact from "./components/floating-contact";
import { editableImage, editorContent } from "./editor-content";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://suatancongnghiepthuyluan.com",
  ),
  title: {
    default: "Thúy Luân — Bữa ăn tử tế, doanh nghiệp vững bền",
    template: "%s | Thúy Luân",
  },
  description:
    "Giải pháp suất ăn công nghiệp cho nhà máy và doanh nghiệp tại Ninh Bình và miền Bắc. Khám phá thực đơn thực tế, quy trình và trao đổi phương án hợp tác cùng Thúy Luân.",
  icons: { icon: editableImage("/assets/logo.png") },
  openGraph: {
    title: "Thúy Luân — Corporate Food Service",
    description: "Chăm chút từng bữa ăn. Đồng hành cùng doanh nghiệp.",
    images: [{ url: editableImage("/assets/hero-food.webp"), width: 800, height: 600 }],
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body style={{ "--brand-button": editorContent.theme?.button || "#342719", "--brand-accent": editorContent.theme?.accent || "#b7742a" }}>
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        <Header />
        {children}
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
