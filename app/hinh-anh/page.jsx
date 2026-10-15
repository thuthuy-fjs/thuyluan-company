import { PageIntro, PhotoGallery } from "../components/site";
export const metadata = { title: "Thư viện hình ảnh thực tế" };
export default function GalleryPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="HÌNH ẢNH THỰC TẾ"
        title={
          <>
            Nhìn thấy cách làm.
            <br />
            Hiểu thêm giá trị.
          </>
        }
      >
        Từ không gian bếp đến hoạt động giao nhận và phục vụ. Những hình ảnh
        được chuyển từ thư viện của Thúy Luân.
      </PageIntro>
      <section className="wrap gallery-page">
        <PhotoGallery />
      </section>
    </main>
  );
}
