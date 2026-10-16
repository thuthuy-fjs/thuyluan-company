import { Check } from "lucide-react";
import { PageIntro, Eyebrow, ButtonLink } from "../components/site";
import { process } from "../data";
import ServiceDetailSlider from "../components/service-detail-slider";
export const metadata = { title: "Giải pháp cung ứng suất ăn doanh nghiệp" };
const services = [
  {
    id: "nha-may",
    n: "01",
    title: "Suất ăn nhà máy",
    group: "factory",
    description:
      "Một phương án suất ăn cần phù hợp với nhịp sản xuất. Thúy Luân trao đổi cùng doanh nghiệp về số lượng lao động, thời gian nghỉ giữa ca và điều kiện phục vụ để đề xuất cách phối hợp.",
    items: [
      "Trao đổi số lượng suất theo từng ca",
      "Xem xét địa điểm và điều kiện giao nhận",
      "Đề xuất thực đơn theo ngân sách",
      "Thống nhất đầu mối phối hợp và phản hồi",
    ],
  },
  {
    id: "van-phong",
    n: "02",
    title: "Suất ăn văn phòng",
    group: "office",
    description:
      "Giờ nghỉ trưa là khoảng thời gian nạp lại năng lượng. Cùng Thúy Luân xây dựng thực đơn đa dạng, thuận tiện và phù hợp khẩu vị tập thể tại doanh nghiệp.",
    items: [
      "Thực đơn luân phiên, hạn chế lặp lại",
      "Trao đổi yêu cầu về khẩu vị và món ăn",
      "Xem xét ngân sách và số lượng thực tế",
      "Điều chỉnh từ phản hồi của người dùng bữa",
    ],
  },
  {
    id: "hop-dong",
    n: "03",
    title: "Hợp tác cung ứng dài hạn",
    group: "contract",
    description:
      "Một mối quan hệ hợp tác tốt bắt đầu từ sự rõ ràng. Chúng tôi cùng doanh nghiệp làm rõ phạm vi phục vụ, quy trình giao nhận và tiêu chí đánh giá trước khi triển khai.",
    items: [
      "Khảo sát và thống nhất phương án phục vụ",
      "Trao đổi hồ sơ và các yêu cầu thẩm định",
      "Thống nhất trách nhiệm trong hợp đồng",
      "Phối hợp đánh giá trong quá trình vận hành",
    ],
  },
];
export default function ServicesPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="GIẢI PHÁP CUNG ỨNG"
        title={
          <>
            Phù hợp với con người.
            <br />
            Đồng điệu cùng vận hành.
          </>
        }
      >
        Bắt đầu từ nhu cầu thực tế để cùng thiết kế phương án suất ăn phù hợp
        với từng doanh nghiệp.
      </PageIntro>
      <div className="wrap">
        {services.map((s) => (
          <section id={s.id} key={s.id} className="service-detail">
            <ServiceDetailSlider group={s.group} title={s.title} />
            <div>
              <Eyebrow>GIẢI PHÁP {s.n}</Eyebrow>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              <ul>
                {s.items.map((x) => (
                  <li key={x}>
                    <Check size={17} />
                    {x}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/lien-he/" className="dark">
                Trao đổi phương án phù hợp
              </ButtonLink>
            </div>
          </section>
        ))}
      </div>
      <section className="section process-section">
        <div className="wrap">
          <Eyebrow>TỪ NHU CẦU ĐẾN HỢP TÁC</Eyebrow>
          <h2>Rõ ràng trong từng bước.</h2>
          <div className="process-grid">
            {process.map(([n, t, d]) => (
              <div className="process-step" key={n}>
                <div className="step-top">
                  <span>{n}</span>
                </div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
