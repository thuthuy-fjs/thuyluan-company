import { Phone } from "lucide-react";
import { company } from "../data";

export default function FloatingContact() {
  return (
    <nav className="floating-contact" aria-label="Liên hệ nhanh">
      <a
        className="floating-phone"
        href={`tel:${company.phone}`}
        aria-label={`Gọi ${company.phoneDisplay}`}
      >
        <span className="floating-phone-icon">
          <Phone size={20} fill="currentColor" />
        </span>
        <span>{company.phoneDisplay}</span>
      </a>
      <a
        className="floating-zalo"
        href={company.zalo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo với Thúy Luân"
        title="Chat Zalo với Thúy Luân"
      >
        <img src="/assets/zalo.png" alt="Zalo" width="300" height="300" />
        <span className="floating-zalo-label">Chat Zalo</span>
      </a>
    </nav>
  );
}
