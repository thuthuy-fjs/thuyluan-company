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
        Từ không gian bếp, hoạt động giao nhận và phục vụ đến những sự kiện của
        công ty. Khám phá hình ảnh thực tế từ Thúy Luân.
      </PageIntro>
      <section className="wrap gallery-page">
        <PhotoGallery />
      </section>
    </main>
  );
}
