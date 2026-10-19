import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Phone } from "lucide-react";
import { meals, company } from "../../data";
import {
  PageIntro,
  Eyebrow,
  ButtonLink,
  MealCard,
} from "../../components/site";
export function generateStaticParams() {
  return meals.map((m) => ({ slug: m.slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = meals.find((m) => m.slug === slug);
  return { title: m?.name || "Thực đơn", description: m?.description };
}
export default async function MealPage({ params }) {
  const { slug } = await params;
  const meal = meals.find((m) => m.slug === slug);
  if (!meal) notFound();
  return (
    <main id="top">
      <PageIntro eyebrow="THỰC ĐƠN THAM KHẢO" title={meal.name} compact>
        {meal.description}
      </PageIntro>
      <div className="meal-detail wrap">
        <div className="meal-detail-photo">
          <img src={meal.image} alt={meal.name} width="960" height="720" />
        </div>
        <div className="meal-detail-info">
          <Eyebrow>HÌNH ẢNH TỪ THÚY LUÂN</Eyebrow>
          <h2>
            Một gợi ý.
            <br />
            Nhiều khả năng điều chỉnh.
          </h2>
          <p>
            Hình ảnh suất ăn do Thúy Luân cung cấp.
            Thành phần, định lượng và lịch luân phiên được trao đổi khi xây dựng
            phương án phục vụ.
          </p>
          <dl className="meal-detail-meta">
            <div>
              <dt>Đối tượng</dt>
              <dd>Nhà máy, doanh nghiệp</dd>
            </div>
            <div>
              <dt>Ngân sách</dt>
              <dd>Tư vấn theo nhu cầu</dd>
            </div>
            <div>
              <dt>Lịch phục vụ</dt>
              <dd>Trao đổi theo ca làm việc</dd>
            </div>
          </dl>
          <ButtonLink
            href={`/lien-he/?thuc-don=${encodeURIComponent(meal.name)}`}
            className="dark"
          >
            Nhận tư vấn thực đơn này
          </ButtonLink>
          <p>
            Để được đề xuất sát nhu cầu, hãy chia sẻ địa điểm, số suất dự kiến
            và ngân sách của doanh nghiệp.
          </p>
          <a className="text-link" href={`tel:${company.phone}`}>
            <Phone size={16} />
            {company.phoneDisplay}
          </a>
        </div>
      </div>
      <section className="related-section section wrap">
        <div className="section-heading">
          <div>
            <Eyebrow>THÊM GỢI Ý CHO BẠN</Eyebrow>
            <h2>Khám phá thực đơn khác.</h2>
          </div>
          <a className="text-link" href="/thuc-don/">
            Xem toàn bộ
            <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="featured-meals">
          {meals
            .filter((m) => m.id !== meal.id)
            .slice(0, 3)
            .map((m) => (
              <MealCard key={m.id} meal={m} />
            ))}
        </div>
      </section>
    </main>
  );
}
