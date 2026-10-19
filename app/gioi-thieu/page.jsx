import { ArrowUpRight } from "lucide-react";
import { PageIntro, Eyebrow } from "../components/site";
import { company, coreValues } from "../data";
import Certifications from "../components/certifications";
import AboutIntroSlider from "../components/about-intro-slider";
import GalleryCategoryShowcase from "../components/gallery-category-showcase";
import ProcessingSteps from "../components/processing-steps";
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
        suất ăn công nghiệp tại Ninh Bình và khu vực miền Bắc.
      </PageIntro>
      <section className="about-intro wrap">
        <AboutIntroSlider />
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
      <section className="org-chart wrap" aria-labelledby="org-chart-title">
        <div className="core-values-heading">
          <Eyebrow>SƠ ĐỒ TỔ CHỨC</Eyebrow>
          <h2 id="org-chart-title">
            Bộ máy rõ ràng.
            <br />
            Phối hợp nhịp nhàng.
          </h2>
          <p>
            Từ Tổng giám đốc đến các tổ nấu, sơ chế và phục vụ, mỗi bộ phận có
            vai trò riêng để bữa ăn được chuẩn bị đúng quy trình.
          </p>
        </div>
        <figure className="org-chart-figure">
          <img
            src="/assets/document-organization.png"
            alt="Sơ đồ tổ chức công ty Thúy Luân từ Tổng giám đốc đến các phòng và tổ vận hành"
            width="1122"
            height="1402"
            loading="lazy"
          />
        </figure>
      </section>
      <section className="core-values wrap" aria-labelledby="core-values-title">
        <div className="core-values-heading">
          <Eyebrow>GIÁ TRỊ CỐT LÕI</Eyebrow>
          <h2 id="core-values-title">
            Bốn giá trị
            <br />
            dẫn dắt Thúy Luân.
          </h2>
          <p>
            Những nguyên tắc chúng tôi giữ trong từng bữa ăn, từng giao dịch và
            từng mối quan hệ hợp tác.
          </p>
        </div>
        <div className="core-values-board">
          <ol className="core-values-grid">
            {coreValues.map((value, index) => (
              <li key={value.title} className="core-value">
                <span className="core-value-number" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </li>
            ))}
          </ol>
          <div className="core-values-badge" aria-hidden="true">
            <span>Giá trị</span>
            <strong>Cốt lõi</strong>
            <small>của Thúy Luân</small>
          </div>
        </div>
      </section>
      <section className="kitchen-layout wrap" aria-labelledby="kitchen-layout-title">
        <div className="core-values-heading">
          <Eyebrow>QUY TRÌNH THIẾT LẬP BẾP</Eyebrow>
          <h2 id="kitchen-layout-title">
            Phương án tổ chức
            <br />
            không gian bếp.
          </h2>
          <p>
            Năm bước triển khai gồm khảo sát, thiết kế bản vẽ 2D, dựng phối cảnh
            3D, lắp đặt hệ thống bếp và vận hành thử trước khi bàn giao.
          </p>
        </div>
        <figure className="kitchen-layout-figure">
          <img
            src="/assets/kitchen-layout-process.png"
            alt="Quy trình thiết lập bếp công nghiệp gồm khảo sát mặt bằng, thiết kế 2D và 3D, lắp đặt, vận hành thử và bàn giao"
            width="1024"
            height="1536"
            loading="lazy"
          />
        </figure>
      </section>
      <ProcessingSteps />
      <Certifications />
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
          <a href="/hinh-anh/" className="text-link">
            Khám phá thư viện hình ảnh
            <ArrowUpRight size={18} />
          </a>
        </div>
        <GalleryCategoryShowcase />
      </section>
    </main>
  );
}
