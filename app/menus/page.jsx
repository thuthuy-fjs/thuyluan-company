import { PageIntro } from "../components/site";
import Catalog from "./catalog";
export const metadata = { title: "Thực đơn suất ăn công nghiệp" };
export default function MenuPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="THỰC ĐƠN THAM KHẢO"
        title={
          <>
            Đa dạng từng bữa ăn.
            <br />
            Phù hợp từng doanh nghiệp.
          </>
        }
      >
        22 hình ảnh suất ăn từ Thúy Luân. Lưu những mẫu bạn quan tâm để cùng
        trao đổi phương án thực đơn và ngân sách.
      </PageIntro>
      <Catalog />
    </main>
  );
}
