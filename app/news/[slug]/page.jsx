import { notFound } from "next/navigation";
import { articles } from "../../data";
import { PageIntro, ButtonLink, Eyebrow } from "../../components/site";
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return { title: a?.title, description: a?.excerpt };
}
export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  return (
    <main id="top">
      <PageIntro eyebrow={article.category} title={article.title}>
        {article.excerpt}
      </PageIntro>
      <div className="article-layout wrap">
        <article className="article-content">
          <img
            src={article.image}
            alt={article.title}
            width="660"
            height="439"
          />
          {article.sections.map(([t, p]) => (
            <section key={t}>
              <h2>{t}</h2>
              <p>{p}</p>
            </section>
          ))}
        </article>
        <aside className="article-sidebar">
          <Eyebrow>KẾT NỐI THÚY LUÂN</Eyebrow>
          <h3>Trao đổi nhu cầu của doanh nghiệp.</h3>
          <p>
            Chúng tôi sẵn sàng lắng nghe và cùng bạn xem xét phương án phù hợp.
          </p>
          <ButtonLink href="/contacts/" className="dark">
            Bắt đầu hợp tác
          </ButtonLink>
          {articles
            .filter((a) => a.slug !== article.slug)
            .map((a) => (
              <a key={a.slug} href={`/news/${a.slug}/`}>
                {a.title} ↗
              </a>
            ))}
        </aside>
      </div>
    </main>
  );
}
