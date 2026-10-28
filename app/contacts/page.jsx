import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { PageIntro, Eyebrow, QuoteForm } from "../components/site";
import { company } from "../data";
import { pageText } from "../editor-fields";
export const metadata = { title: "Kết nối hợp tác & nhận báo giá" };
export default function ContactPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="KẾT NỐI HỢP TÁC"
        descriptionEditorId="contact.intro.description"
        title={
          <>
            <span data-editor-id="contact.hero.line1">{pageText["contact.hero.line1"]}</span>
            <br />
            <span data-editor-id="contact.hero.line2">{pageText["contact.hero.line2"]}</span>
          </>
        }
      >
        {pageText["contact.intro.description"]}
      </PageIntro>
      <div className="contact-layout wrap">
        <aside className="contact-sidebar">
          <Eyebrow>CHÚNG TÔI SẴN SÀNG LẮNG NGHE</Eyebrow>
          <h2>
            Bắt đầu từ
            <br />
            điều bạn đang cần.
          </h2>
          <p>
            {pageText["contact.sidebar.description"]}
          </p>
          <div className="contact-details">
            <a href={`tel:${company.phone}`}>
              <Phone size={20} />
              <span>
                <small>HOTLINE TƯ VẤN</small>
                <strong>{company.phoneDisplay}</strong>
              </span>
            </a>
            <a className="email-detail" href={`mailto:${company.email}`}>
              <Mail size={20} />
              <span>
                <small>EMAIL HỢP TÁC</small>
                {company.email}
              </span>
            </a>
            <div>
              <MapPin size={20} />
              <span>
                <small>ĐỊA CHỈ LIÊN HỆ</small>
                <address>{company.address}</address>
              </span>
            </div>
          </div>
          <a
            href={company.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-zalo"
          >
            <span>Zalo</span>Trao đổi trực tiếp qua Zalo
            <ArrowUpRight size={16} />
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
            style={{ marginTop: 22 }}
          >
            Xem vị trí trên bản đồ
            <ArrowUpRight size={16} />
          </a>
          <div className="contact-tip">
            <h3>Chuẩn bị cho buổi trao đổi</h3>
            <p>
              {pageText["contact.tip"]}
            </p>
          </div>
        </aside>
        <QuoteForm />
      </div>
    </main>
  );
}
