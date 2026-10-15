import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { PageIntro, Eyebrow, QuoteForm } from "../components/site";
import { company } from "../data";
export const metadata = { title: "Kết nối hợp tác & nhận báo giá" };
export default function ContactPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="KẾT NỐI HỢP TÁC"
        title={
          <>
            Một cuộc trao đổi.
            <br />
            Khởi đầu của sự đồng hành.
          </>
        }
      >
        Chia sẻ nhu cầu để cùng Thúy Luân xây dựng phương án suất ăn phù hợp với
        doanh nghiệp.
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
            Đội ngũ Thúy Luân sẽ cùng doanh nghiệp trao đổi về thực đơn, ngân
            sách và cách phối hợp phục vụ.
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
              Địa điểm, số suất mỗi ngày, ca phục vụ và ngân sách dự kiến sẽ
              giúp hai bên đi nhanh hơn tới một phương án phù hợp.
            </p>
          </div>
        </aside>
        <QuoteForm />
      </div>
    </main>
  );
}
