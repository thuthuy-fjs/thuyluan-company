import {
  ArrowUpRight,
  Eye,
  Leaf,
  Target,
} from "lucide-react";
import {
  Eyebrow,
  ButtonLink,
  Accordion,
  DocumentLibrary,
} from "./components/site";
import GalleryCategoryShowcase from "./components/gallery-category-showcase";
import { articles, process } from "./data";
import { pageText } from "./editor-fields";
import { editableImage, editorContent } from "./editor-content";
import Certifications from "./components/certifications";
import FeaturedMealsSlider from "./components/featured-meals-slider";
import HeroSlider from "./components/hero-slider";
import SolutionCards from "./components/solution-cards";
import CoreValuesBoard from "./components/core-values-board";

export default function Home() {
  return (
    <main id="top">
      <section id="main" className="hero hero-contained">
        <div className="hero-copy">
          <Eyebrow>{pageText["home.hero.eyebrow"]}</Eyebrow>
          <h1>
            <span className="hero-line" data-editor-id="home.hero.line1">{pageText["home.hero.line1"]}</span>
            <br />
            <span className="hero-line" data-editor-id="home.hero.line2">{pageText["home.hero.line2"]}</span>
            <br />
            <span data-editor-id="home.hero.line3">{pageText["home.hero.line3"]}</span>
          </h1>
          <div className="hero-copy-bottom">
            <p data-editor-id="home.hero.description">
              {pageText["home.hero.description"]}
            </p>
            <div className="hero-buttons">
              <ButtonLink href="/contacts/" className="dark" data-editor-button="home.hero.consult">
                {editorContent.buttons?.["home.hero.consult"]?.label || "Yêu cầu tư vấn"}
              </ButtonLink>
              <ButtonLink href="/services/" className="outline" data-editor-button="home.hero.services">
                {editorContent.buttons?.["home.hero.services"]?.label || "Khám phá dịch vụ"}
              </ButtonLink>
            </div>
            <p className="hero-origin" data-editor-id="home.hero.origin">
              {pageText["home.hero.origin"]}
            </p>
          </div>
        </div>
        <HeroSlider />
      </section>

      <section id="intro" className="intro-strip wrap">
        <p>
          {pageText["home.intro"]}
        </p>
        <div className="intro-facts">
          <div>
            <strong>
              <span data-editor-id="home.facts.foundedYear">{pageText["home.facts.foundedYear"]}</span><span className="fact-suffix">↗</span>
            </strong>
            <small>NĂM THÀNH LẬP</small>
          </div>
          <div>
            <strong data-editor-id="home.facts.menuCount">{pageText["home.facts.menuCount"]}</strong>
            <small>THỰC ĐƠN THAM KHẢO</small>
          </div>
          <div>
            <strong data-editor-id="home.facts.serviceArea">{pageText["home.facts.serviceArea"]}</strong>
            <small>KHU VỰC PHỤC VỤ</small>
          </div>
        </div>
      </section>

      <section className="solutions-section section wrap" id="solutions">
        <div className="section-heading">
          <div>
            <Eyebrow>GIẢI PHÁP CHO DOANH NGHIỆP</Eyebrow>
            <h2>
              {pageText["home.solutions.heading1"]}
              <br />
              {pageText["home.solutions.heading2"]}
            </h2>
          </div>
          <p>
            {pageText["home.solutions.description"]}
          </p>
        </div>
        <SolutionCards />
      </section>

      <section className="promise-section">
        <div className="promise-copy">
          <h2>Sứ mệnh &amp; Tầm nhìn</h2>
          <div className="promise-direction">
            <article>
              <Target size={25} strokeWidth={1.7} aria-hidden="true" />
              <div>
                <h3>Sứ mệnh</h3>
                <p>
                  {pageText["home.mission"]}
                </p>
              </div>
            </article>
            <article>
              <Eye size={25} strokeWidth={1.7} aria-hidden="true" />
              <div>
                <h3>Tầm nhìn</h3>
                <p>
                  {pageText["home.vision"]}
                </p>
              </div>
            </article>
          </div>
        </div>
        <section className="promise-values" aria-label="Giá trị cốt lõi của Thúy Luân">
          <h2 className="promise-values-title">Giá trị cốt lõi</h2>
          <CoreValuesBoard />
          <a className="promise-values-link" href="/about/">
            Hiểu thêm về Thúy Luân
            <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </section>
        <div className="promise-photo">
          <img
            src={editableImage("/assets/kitchen-process-thuy-luan.png")}
            alt="Quy trình bếp ăn Thúy Luân gồm tám bước, từ tiếp nhận nguyên liệu đến phục vụ khách hàng"
            width="1536"
            height="1024"
            loading="lazy"
          />
        </div>
      </section>

      <section id="menu" className="section wrap menu-section">
        <div className="section-heading">
          <div>
            <Eyebrow>ĐA DẠNG MỖI NGÀY</Eyebrow>
            <h2>
              {pageText["home.meals.heading1"]}
              <br />
              {pageText["home.meals.heading2"]}
            </h2>
          </div>
          <div>
            <p>
              Khám phá hình ảnh suất ăn thực tế. Thực đơn và phương án phục vụ
              được trao đổi theo nhu cầu từng doanh nghiệp.
            </p>
            <a className="text-link" href="/menus/">
              Xem toàn bộ thực đơn
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <FeaturedMealsSlider />
        <div className="menu-note">
          <Leaf size={19} />
          <p>
            Khẩu vị, ngân sách và ca làm việc của bạn là điểm bắt đầu cho thực
            đơn của chúng tôi.
          </p>
          <a href="/contacts/">
            Nhận thực đơn đề xuất
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>

      <section id="process" className="process-section section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <Eyebrow>CÁCH CHÚNG TÔI PHỐI HỢP</Eyebrow>
              <h2>
                Rõ ràng từ bước đầu.
                <br />
                Gắn kết trong dài hạn.
              </h2>
            </div>
            <ButtonLink className="outline" href="/contacts/">
              Bắt đầu trao đổi
            </ButtonLink>
          </div>
          <div className="process-subhead">
            <span>Hành trình hợp tác</span>
            <small>4 bước</small>
          </div>
          <div className="process-grid">
            {process.map(([n, t, d]) => (
              <div className="process-step" key={n}>
                <span className="step-top">
                  <span>{n}</span>
                  <ArrowUpRight size={22} />
                </span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <Certifications />

      <section className="document-section wrap">
        <div>
          <Eyebrow>HIỂU CÁCH CHÚNG TÔI LÀM VIỆC</Eyebrow>
          <h2>
            Minh bạch quy trình.
            <br />
            Thuận lợi thẩm định.
          </h2>
          <p>
            Khám phá tài liệu giới thiệu và quy trình từ Thúy Luân. Liên hệ để
            trao đổi hồ sơ và yêu cầu đánh giá cụ thể của doanh nghiệp.
          </p>
          <a
            className="text-link"
            href="/company-profile.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem hồ sơ giới thiệu
            <ArrowUpRight size={18} />
          </a>
        </div>
        <DocumentLibrary />
      </section>

      <section className="section wrap news-section">
        <div className="section-heading">
          <div>
            <Eyebrow>GÓC CHIA SẺ</Eyebrow>
            <h2>
              Cùng hiểu hơn
              <br />
              về một bữa ăn tốt.
            </h2>
          </div>
          <a className="text-link" href="/news/">
            Xem tất cả bài viết
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="news-grid">
          {articles.map((a) => (
            <a href={`/news/${a.slug}/`} className="news-card" key={a.slug}>
              <div className="news-image">
                <img
                  src={a.image}
                  alt={a.title}
                  width="500"
                  height="480"
                  loading="lazy"
                />
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <span className="mini-label">{a.category}</span>
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="faq" className="faq-section wrap section">
        <div>
          <Eyebrow>TRƯỚC KHI BẮT ĐẦU</Eyebrow>
          <h2>
            Những điều
            <br />
            bạn muốn biết.
          </h2>
          <p>
            Chúng tôi sẵn sàng trao đổi để làm rõ nhu cầu và khả năng phối hợp.
          </p>
          <a className="text-link" href="/contacts/">
            Đặt câu hỏi cho Thúy Luân
            <ArrowUpRight size={17} />
          </a>
        </div>
        <Accordion
          items={[
            [
              "Thúy Luân phục vụ ở khu vực nào?",
              "Thúy Luân hoạt động tại Ninh Bình và khu vực miền Bắc. Vui lòng cung cấp địa điểm, số lượng suất và ca làm việc để đội ngũ đánh giá phương án phục vụ cụ thể.",
            ],
            [
              "Có thể xây dựng thực đơn theo ngân sách không?",
              "Doanh nghiệp có thể chia sẻ ngân sách dự kiến, khẩu vị và yêu cầu thực đơn. Thúy Luân sẽ trao đổi phương án phù hợp trước khi hai bên thống nhất hợp đồng.",
            ],
            [
              "Doanh nghiệp có nhiều ca làm việc thì sao?",
              "Thông tin giờ bắt đầu và kết thúc từng ca, số suất mỗi ca và điều kiện giao nhận sẽ giúp hai bên đánh giá phương án phối hợp phù hợp.",
            ],
            [
              "Làm thế nào để nhận phương án hợp tác?",
              "Bạn có thể điền thông tin tại trang Liên hệ, gửi email hoặc trao đổi trực tiếp qua hotline 0965 600 481. Việc khảo sát, thực đơn và các điều khoản sẽ được thống nhất trong quá trình tư vấn.",
            ],
          ]}
        />
      </section>
    </main>
  );
}
