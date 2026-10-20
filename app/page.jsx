import {
  ArrowUpRight,
  Check,
  Handshake,
  HeartHandshake,
  Leaf,
  Scale,
  ShieldCheck,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import {
  Eyebrow,
  ButtonLink,
  Accordion,
  DocumentLibrary,
} from "./components/site";
import GalleryCategoryShowcase from "./components/gallery-category-showcase";
import { articles, coreValues, process } from "./data";
import Certifications from "./components/certifications";
import FeaturedMealsSlider from "./components/featured-meals-slider";
import HeroSlider from "./components/hero-slider";
import SolutionCards from "./components/solution-cards";

const coreValueIcons = [HeartHandshake, ShieldCheck, Handshake, Scale];

export default function Home() {
  return (
    <main id="top">
      <section id="main" className="hero hero-contained">
        <div className="hero-copy">
          <Eyebrow>GIẢI PHÁP SUẤT ĂN CHO DOANH NGHIỆP</Eyebrow>
          <h1>
            Thực đơn lành mạnh
            <br />
            Đầy đủ dinh dưỡng
            <br />
            <span>Đa dạng món ăn</span>
          </h1>
          <div className="hero-copy-bottom">
            <p>
              Giải pháp suất ăn công nghiệp chú trọng chất lượng, sự linh hoạt
              và trải nghiệm phục vụ, phù hợp với nhịp vận hành của doanh
              nghiệp.
            </p>
            <div className="hero-buttons">
              <ButtonLink href="/lien-he/" className="dark">
                Yêu cầu tư vấn
              </ButtonLink>
              <ButtonLink href="/giai-phap/" className="outline">
                Khám phá dịch vụ
              </ButtonLink>
            </div>
            <p className="hero-origin">
              Thực đơn linh hoạt · Hợp tác dài hạn · Tư vấn theo nhu cầu
            </p>
          </div>
        </div>
        <HeroSlider />
      </section>

      <section id="intro" className="intro-strip wrap">
        <p>
          Chúng tôi tin rằng bữa ăn được chăm chút
          <br className="desktop-break" /> là một phần của doanh nghiệp phát
          triển bền vững.
        </p>
        <div className="intro-facts">
          <div>
            <strong>
              2021<span>↗</span>
            </strong>
            <small>NĂM THÀNH LẬP</small>
          </div>
          <div>
            <strong>
              22<span>+</span>
            </strong>
            <small>THỰC ĐƠN THAM KHẢO</small>
          </div>
          <div>
            <strong>Miền Bắc</strong>
            <small>KHU VỰC PHỤC VỤ</small>
          </div>
        </div>
      </section>

      <section className="solutions-section section wrap" id="solutions">
        <div className="section-heading">
          <div>
            <Eyebrow>GIẢI PHÁP CHO DOANH NGHIỆP</Eyebrow>
            <h2>
              Mỗi doanh nghiệp một nhịp.
              <br />
              Mỗi bữa ăn một giải pháp.
            </h2>
          </div>
          <p>
            Hiểu đặc thù công việc, lắng nghe nhu cầu thực tế và cùng xây dựng
            phương án cung ứng phù hợp.
          </p>
        </div>
        <SolutionCards />
      </section>

      <section className="promise-section">
        <div className="promise-photo">
          <a
            className="promise-infographic"
            href="/assets/kitchen-process-thuy-luan.png"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mở ảnh quy trình bếp ăn Thúy Luân ở kích thước đầy đủ"
          >
            <img
              src="/assets/kitchen-process-thuy-luan.png"
              alt="Quy trình bếp ăn Thúy Luân gồm tám bước, từ tiếp nhận nguyên liệu đến phục vụ khách hàng"
              width="1536"
              height="1024"
              loading="lazy"
            />
          </a>
        </div>
        <div className="promise-copy">
          <Eyebrow light>GIÁ TRỊ CỦA MỘT ĐỐI TÁC</Eyebrow>
          <h2>
            An tâm từng bữa ăn.
            <br />
            Vững vàng mỗi
            <br />
            <em>ngày làm việc.</em>
          </h2>
          <p>
            Được thành lập năm 2021, Thúy Luân hoạt động trong lĩnh vực cung ứng
            thực phẩm và suất ăn công nghiệp tại Ninh Bình và miền Bắc.
          </p>
          <div className="promise-points">
            {[
              [
                ShieldCheck,
                "Chú trọng an toàn",
                "Quan tâm đến nguyên liệu, khâu chế biến và điều kiện phục vụ.",
              ],
              [
                UtensilsCrossed,
                "Thực đơn linh hoạt",
                "Trao đổi phương án phù hợp ngân sách và khẩu vị người lao động.",
              ],
              [
                Truck,
                "Phối hợp xuyên suốt",
                "Thống nhất lịch phục vụ và tiếp nhận phản hồi từ doanh nghiệp.",
              ],
            ].map(([Icon, t, d]) => (
              <div key={t}>
                <Icon size={24} />
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <a className="text-link light" href="/gioi-thieu/">
            Hiểu thêm về Thúy Luân
            <ArrowUpRight size={19} />
          </a>
        </div>
      </section>

      <section id="menu" className="section wrap menu-section">
        <div className="section-heading">
          <div>
            <Eyebrow>ĐA DẠNG MỖI NGÀY</Eyebrow>
            <h2>
              Bữa ăn ngon.
              <br />
              Thêm năng lượng mới.
            </h2>
          </div>
          <div>
            <p>
              Khám phá hình ảnh suất ăn thực tế. Thực đơn và phương án phục vụ
              được trao đổi theo nhu cầu từng doanh nghiệp.
            </p>
            <a className="text-link" href="/thuc-don/">
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
          <a href="/lien-he/">
            Nhận thực đơn đề xuất
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>

      <section id="process" className="process-section section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <Eyebrow>GIÁ TRỊ & HÀNH TRÌNH HỢP TÁC</Eyebrow>
              <h2>
                Rõ ràng từ bước đầu.
                <br />
                Gắn kết trong dài hạn.
              </h2>
            </div>
            <ButtonLink className="outline" href="/lien-he/">
              Bắt đầu trao đổi
            </ButtonLink>
          </div>
          <div className="values-band">
            <div className="values-band-intro">
              <span className="values-band-label">Giá trị cốt lõi</span>
              <p>Nền tảng cho mọi bữa ăn và mọi mối hợp tác của Thúy Luân.</p>
            </div>
            <ul className="values-band-list">
              {coreValues.map((value, index) => {
                const Icon = coreValueIcons[index];
                return (
                  <li key={value.title}>
                    <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                    <h3>{value.title}</h3>
                    <p>{value.text}</p>
                  </li>
                );
              })}
            </ul>
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
          <a href="/hinh-anh/" className="text-link">
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
            href="/ho-so-nang-luc.html"
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
          <a className="text-link" href="/tin-tuc/">
            Xem tất cả bài viết
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="news-grid">
          {articles.map((a) => (
            <a href={`/tin-tuc/${a.slug}/`} className="news-card" key={a.slug}>
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
          <a className="text-link" href="/lien-he/">
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
