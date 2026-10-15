import {
  PageIntro,
  Eyebrow,
  ButtonLink,
  DocumentLibrary,
  PhotoGallery,
} from "../components/site";
import { company } from "../data";
import Certifications from "../components/certifications";
export const metadata = { title: "Về Thúy Luân" };
export default function AboutPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="VỀ THÚY LUÂN"
        title={
          <>
            Tận tâm với bữa ăn.
            <br />
            Trân trọng từng hợp tác.
          </>
        }
      >
        Từ năm 2021, Thúy Luân hoạt động trong lĩnh vực cung ứng thực phẩm và
        suất ăn công nghiệp tại Hà Nam và khu vực miền Bắc.
      </PageIntro>
      <section className="about-intro wrap">
        <img
          src="/assets/gallery-17.webp"
          alt="Hoạt động phục vụ bữa ăn tại doanh nghiệp"
          width="960"
          height="720"
        />
        <div>
          <Eyebrow>CHẤT LƯỢNG TẠO NÊN THƯƠNG HIỆU</Eyebrow>
          <h2>
            Hiểu giá trị của
            <br />
            một bữa ăn được chăm chút.
          </h2>
          <p>
            {company.legalName} xây dựng dịch vụ từ nhu cầu thực tế của doanh
            nghiệp: một bữa ăn phù hợp với người lao động và một phương án phục
            vụ thuận lợi cho hoạt động hằng ngày.
          </p>
          <p>
            Chúng tôi mong muốn lắng nghe yêu cầu về thực đơn, ngân sách, ca làm
            việc và điều kiện phục vụ để cùng đối tác xây dựng cách phối hợp rõ
            ràng.
          </p>
          <div className="about-facts">
            <div>
              <strong>2021</strong>
              <small>Năm thành lập</small>
            </div>
            <div>
              <strong>22</strong>
              <small>Mẫu suất ăn</small>
            </div>
            <div>
              <strong>Miền Bắc</strong>
              <small>Khu vực hoạt động</small>
            </div>
          </div>
        </div>
      </section>
      <Certifications />
      <section className="document-section wrap">
        <div>
          <Eyebrow>CƠ SỞ ĐỂ HIỂU VÀ TIN TƯỞNG</Eyebrow>
          <h2>
            Tìm hiểu tổ chức.
            <br />
            Xem rõ quy trình.
          </h2>
          <p>
            Tài liệu giới thiệu được chuyển từ website hiện tại. Vui lòng liên
            hệ để trao đổi bộ hồ sơ, chứng nhận và điều kiện phục vụ theo yêu
            cầu thẩm định của doanh nghiệp.
          </p>
          <a
            href="/ho-so-nang-luc.html"
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem hồ sơ giới thiệu ↗
          </a>
        </div>
        <DocumentLibrary />
      </section>
      <section className="section wrap related-section">
        <div className="section-heading">
          <div>
            <Eyebrow>HOẠT ĐỘNG THỰC TẾ</Eyebrow>
            <h2>
              Mỗi ngày phục vụ.
              <br />
              Mỗi ngày hoàn thiện.
            </h2>
          </div>
          <ButtonLink className="outline" href="/hinh-anh/">
            Thư viện hình ảnh
          </ButtonLink>
        </div>
        <PhotoGallery preview />
      </section>
    </main>
  );
}
