import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "../components/site";
import { articles } from "../data";
export const metadata = { title: "Góc chia sẻ về suất ăn doanh nghiệp" };
export default function NewsPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="GÓC CHIA SẺ"
        title={
          <>
            Hiểu hơn về bữa ăn.
            <br />
            Chọn đúng đối tác.
          </>
        }
      >
        Những góc nhìn giúp doanh nghiệp trao đổi rõ nhu cầu và đánh giá phương
        án cung ứng suất ăn.
      </PageIntro>
      <section className="wrap news-page">
        <div className="news-grid">
          {articles.map((a) => (
            <a href={`/news/${a.slug}/`} className="news-card" key={a.slug}>
              <div className="news-image">
                <img src={a.image} alt={a.title} width="500" height="480" />
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
    </main>
  );
}
