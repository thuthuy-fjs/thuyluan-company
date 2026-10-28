import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "../components/site";
import { articles } from "../data";
import { pageText } from "../editor-fields";
export const metadata = { title: "Góc chia sẻ về suất ăn doanh nghiệp" };
export default function NewsPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="GÓC CHIA SẺ"
        descriptionEditorId="news.intro.description"
        title={
          <>
            <span data-editor-id="news.hero.line1">{pageText["news.hero.line1"]}</span>
            <br />
            <span data-editor-id="news.hero.line2">{pageText["news.hero.line2"]}</span>
          </>
        }
      >
        {pageText["news.intro.description"]}
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
