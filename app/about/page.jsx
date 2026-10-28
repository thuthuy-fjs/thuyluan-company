import { ArrowUpRight, Eye, Target } from "lucide-react";
import { PageIntro, Eyebrow } from "../components/site";
import { company } from "../data";
import { editableImage } from "../editor-content";
import { pageText } from "../editor-fields";
import Certifications from "../components/certifications";
import AboutIntroSlider from "../components/about-intro-slider";
import GalleryCategoryShowcase from "../components/gallery-category-showcase";
import ProcessingSteps from "../components/processing-steps";
import CoreValuesBoard from "../components/core-values-board";
export const metadata = { title: "Về Thúy Luân" };
export default function AboutPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="VỀ THÚY LUÂN"
        title={
          <>
            <span data-editor-id="about.hero.line1">{pageText["about.hero.line1"]}</span>
            <br />
            <span data-editor-id="about.hero.line2">{pageText["about.hero.line2"]}</span>
          </>
        }
      >
        {pageText["about.intro.description"]}
      </PageIntro>
      <section className="about-intro wrap">
        <AboutIntroSlider />
        <div>
          <Eyebrow>CHẤT LƯỢNG TẠO NÊN THƯƠNG HIỆU</Eyebrow>
          <h2>
            {pageText["about.intro.heading1"]}
            <br />
            {pageText["about.intro.heading2"]}
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
              <strong data-editor-id="about.facts.foundedYear">{pageText["about.facts.foundedYear"]}</strong>
              <small>Năm thành lập</small>
            </div>
            <div>
              <strong data-editor-id="about.facts.menuCount">{pageText["about.facts.menuCount"]}</strong>
              <small>Mẫu suất ăn</small>
            </div>
            <div>
              <strong data-editor-id="about.facts.serviceArea">{pageText["about.facts.serviceArea"]}</strong>
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
            {pageText["about.organization.description"]}
          </p>
        </div>
        <figure className="org-chart-figure">
          <a href={editableImage("/assets/document-organization.png")} target="_blank" rel="noopener noreferrer">
            <img
              src={editableImage("/assets/document-organization.png")}
              alt="Sơ đồ tổ chức công ty Thúy Luân từ Tổng giám đốc đến các phòng và tổ vận hành"
              width="1536"
              height="1024"
              loading="lazy"
            />
          </a>
          <figcaption>Mở ảnh để xem sơ đồ kích thước đầy đủ</figcaption>
        </figure>
      </section>
      <section className="mission-vision wrap" aria-labelledby="mission-vision-title">
        <div className="mission-vision-heading">
          <h2 id="mission-vision-title">Sứ mệnh &amp; Tầm nhìn</h2>
        </div>
        <div className="mission-vision-grid">
          <article className="mission-vision-card">
            <div className="mission-vision-card-heading">
              <span className="mission-vision-icon" aria-hidden="true">
                <Target size={24} strokeWidth={2} />
              </span>
              <h3>Sứ mệnh</h3>
            </div>
            <p data-editor-id="about.mission">
              {pageText["about.mission"]}
            </p>
          </article>
          <article className="mission-vision-card">
            <div className="mission-vision-card-heading">
              <span className="mission-vision-icon" aria-hidden="true">
                <Eye size={24} strokeWidth={2} />
              </span>
              <h3>Tầm nhìn</h3>
            </div>
            <p data-editor-id="about.vision">
              {pageText["about.vision"]}
            </p>
          </article>
        </div>
      </section>
      <section className="core-values wrap" aria-labelledby="core-values-title">
        <div className="core-values-heading">
          <Eyebrow>GIÁ TRỊ CỐT LÕI</Eyebrow>
          <h2 id="core-values-title">Bốn giá trị dẫn dắt Thúy Luân.</h2>
          <p>
            Những nguyên tắc chúng tôi giữ trong từng bữa ăn, từng giao dịch và
            từng mối quan hệ hợp tác.
          </p>
        </div>
        <CoreValuesBoard />
      </section>
      <section
        id="quy-trinh-thiet-lap-bep"
        className="kitchen-layout wrap"
        aria-labelledby="kitchen-layout-title"
      >
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
        <ol className="kitchen-layout-steps" aria-label="Năm bước thiết lập bếp">
          <li>
            <span className="kitchen-layout-step-number" aria-hidden="true">01</span>
            <div>
              <h3>Khảo sát mặt bằng</h3>
              <p>Khảo sát thực tế tại địa điểm triển khai.</p>
            </div>
          </li>
          <li>
            <span className="kitchen-layout-step-number" aria-hidden="true">02</span>
            <div>
              <h3>Thiết kế bản vẽ 2D</h3>
              <p>Lên phương án bố trí mặt bằng bếp.</p>
            </div>
          </li>
          <li>
            <span className="kitchen-layout-step-number" aria-hidden="true">03</span>
            <div>
              <h3>Duyệt 2D &amp; thiết kế 3D</h3>
              <p>Chốt bản vẽ 2D, lên phối cảnh 3D.</p>
            </div>
          </li>
          <li>
            <span className="kitchen-layout-step-number" aria-hidden="true">04</span>
            <div>
              <h3>Lắp đặt hệ thống bếp</h3>
              <p>Triển khai lắp đặt bếp theo thiết kế.</p>
            </div>
          </li>
          <li>
            <span className="kitchen-layout-step-number" aria-hidden="true">05</span>
            <div>
              <h3>Vận hành thử &amp; bàn giao</h3>
              <p>Vận hành thử, đưa bếp vào hoạt động.</p>
            </div>
          </li>
        </ol>
      </section>
      <ProcessingSteps />
      <Certifications />
      <section className="section wrap gallery-section">
        <div className="section-heading">
          <div>
            <Eyebrow>TỪ NHỮNG ĐIỀU THỰC TẾ</Eyebrow>
            <h2>
              Nhìn gần hơn.
              <br />
              Tin tưởng nhiều hơn.
            </h2>
          </div>
          <a href="/galleries/" className="text-link">
            Khám phá thư viện hình ảnh
            <ArrowUpRight size={18} />
          </a>
        </div>
        <GalleryCategoryShowcase homePage />
      </section>
    </main>
  );
}
