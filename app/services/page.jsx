import { Check } from "lucide-react";
import { PageIntro, Eyebrow, ButtonLink } from "../components/site";
import { process } from "../data";
import { pageText } from "../editor-fields";
import ServiceDetailSlider from "../components/service-detail-slider";
import { services } from "../services-data";
export const metadata = { title: "Giải pháp cung ứng suất ăn doanh nghiệp" };
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
        {pageText["solutions.intro.description"]}
      </PageIntro>
      <div className="wrap">
        {services.map((s) => (
          <section id={s.id} key={s.id} className="service-detail">
            <ServiceDetailSlider group={s.group} title={s.title} />
            <div>
              <Eyebrow>GIẢI PHÁP {s.n}</Eyebrow>
              <h2 data-editor-id={`services.${s.id}.title`}>{s.title}</h2>
              <p data-editor-id={`services.${s.id}.description`}>{s.description}</p>
              <ul>
                {s.items.map((x, index) => (
                  <li key={index} data-editor-id={`services.${s.id}.items.${index}`}>
                    <Check size={17} />
                    {x}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/contacts/" className="dark">
                Trao đổi phương án phù hợp
              </ButtonLink>
            </div>
          </section>
        ))}
      </div>
      <section className="section process-section">
        <div className="wrap">
          <Eyebrow>TỪ NHU CẦU ĐẾN HỢP TÁC</Eyebrow>
          <h2>{pageText["solutions.process.heading"]}</h2>
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
