"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  ShieldCheck,
  Leaf,
  Utensils,
  Truck,
} from "lucide-react";
import { company, meals, gallery, galleryCategories, galleryPreview, documents } from "../data";

export function Eyebrow({ children, light = false }) {
  return (
    <p className={`eyebrow${light ? " light" : ""}`}>
      <span />
      {children}
    </p>
  );
}
export function ButtonLink({ children, href, className = "", ...props }) {
  return (
    <a href={href} className={`button ${className}`} {...props}>
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef(null);
  const trigger = useRef(null);
  const links = [
    ["Dịch vụ", "/giai-phap/"],
    ["Về chúng tôi", "/gioi-thieu/"],
    ["Thực đơn", "/thuc-don/"],
    ["Hình ảnh thực tế", "/hinh-anh/"],
    ["FAQ", "/#faq"],
  ];
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <header ref={ref} className="site-header">
      <div className="header-inner">
        <a href="/" className="brand" aria-label="Thúy Luân — Trang chủ">
          <img
            src="/assets/logo.png"
            width="150"
            height="123"
            alt="Logo Thúy Luân"
          />
          <span>
            THÚY LUÂN<small>INDUSTRIAL CATERING</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {links.map(([title, href]) => (
            <a
              key={href}
              href={href}
              aria-current={
                !href.includes("#") && pathname.startsWith(href)
                  ? "page"
                  : undefined
              }
            >
              {title}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <ButtonLink href="/lien-he/" className="dark header-quote">
            Nhận báo giá
          </ButtonLink>
          <button
            ref={trigger}
            className="menu-trigger"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="site-menu"
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="site-menu" className="expanded-menu" aria-label="Menu mở rộng">
          {[
            ["Trang chủ", "/"],
            ["Dịch vụ", "/giai-phap/"],
            ["Về chúng tôi", "/gioi-thieu/"],
            ["Thực đơn tham khảo", "/thuc-don/"],
            ["Hình ảnh thực tế", "/hinh-anh/"],
            ["FAQ", "/#faq"],
            ["Chứng chỉ – Chứng nhận", "/#certificates"],
            ["Góc chia sẻ", "/tin-tuc/"],
            ["Liên hệ & báo giá", "/lien-he/"],
          ].map(([title, href], i) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              {title}
              <ArrowUpRight size={19} />
            </a>
          ))}
          <a href={`tel:${company.phone}`} className="menu-phone">
            <Phone size={17} />
            {company.phoneDisplay}
          </a>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Eyebrow light>CÙNG NHAU TẠO NÊN GIÁ TRỊ</Eyebrow>
          <h2>
            Bữa ăn tốt hơn.
            <br />
            Hợp tác bền lâu hơn.
          </h2>
        </div>
        <ButtonLink href="/lien-he/" className="gold">
          Trao đổi nhu cầu của bạn
        </ButtonLink>
      </div>
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="/" className="footer-wordmark">
            THÚY LUÂN<span>®</span>
          </a>
          <p>
            Chăm chút từng bữa ăn.
            <br />
            Đồng hành cùng doanh nghiệp.
          </p>
          <span className="footer-location">
            <span />
            Ninh Bình · Miền Bắc
          </span>
        </div>
        <div>
          <p className="footer-label">KHÁM PHÁ</p>
          <a href="/giai-phap/">Giải pháp cung ứng</a>
          <a href="/thuc-don/">Thực đơn tham khảo</a>
          <a href="/hinh-anh/">Hình ảnh thực tế</a>
          <a href="/#certificates">Chứng chỉ – Chứng nhận</a>
          <a href="/gioi-thieu/">Về Thúy Luân</a>
        </div>
        <div>
          <p className="footer-label">KẾT NỐI</p>
          <a href={`tel:${company.phone}`}>
            {company.phoneDisplay}
            <ArrowUpRight size={14} />
          </a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={company.zalo} target="_blank" rel="noopener noreferrer">
            Trao đổi qua Zalo
            <ArrowUpRight size={14} />
          </a>
          <a href="/tin-tuc/">Góc chia sẻ</a>
        </div>
        <div>
          <p className="footer-label">THÔNG TIN DOANH NGHIỆP</p>
          <p>{company.legalName}</p>
          <p>{company.address}</p>
          <p>Mã số thuế: {company.taxId}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Thúy Luân. Chất lượng tạo nên thương
          hiệu.
        </span>
        <a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a>
        <a href="#top" aria-label="Trở về đầu trang">
          Lên đầu trang <ArrowUpRight size={15} />
        </a>
      </div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, children, compact = false }) {
  return (
    <section
      id="main"
      className={`page-intro wrap ${compact ? "compact" : ""}`}
    >
      <div className="breadcrumbs">
        <a href="/">Trang chủ</a>
        <span>/</span>
        <span>{eyebrow}</span>
      </div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      {children && <p className="intro-description">{children}</p>}
    </section>
  );
}

export function Modal({ open, onClose, children, label, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      d.showModal();
      document.body.style.overflow = "hidden";
    } else {
      d.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`modal ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <button
          className="modal-close circle-button"
          aria-label="Đóng"
          onClick={onClose}
        >
          <X size={21} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

export function PhotoGallery({ preview = false }) {
  const [filter, setFilter] = useState("Tất cả");
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (preview) return;
    const slug = new URLSearchParams(window.location.search).get("loai");
    const category = galleryCategories.find((item) => item.slug === slug);
    if (category) setFilter(category.label);
  }, [preview]);
  const chosen = preview ? galleryPreview : gallery;
  const filtered = chosen.filter(
    (x) => filter === "Tất cả" || x.category === filter,
  );
  useEffect(() => {
    if (active === null) return;
    const listener = (e) => {
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % filtered.length);
      if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + filtered.length) % filtered.length);
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [active, filtered.length]);
  return (
    <>
      {!preview && (
        <div className="filter-tabs">
          {["Tất cả", ...galleryCategories.map((item) => item.label)].map((x) => (
            <button
              key={x}
              className={filter === x ? "active" : ""}
              aria-pressed={filter === x}
              onClick={() => {
                setFilter(x);
                setActive(null);
              }}
            >
              {x}
            </button>
          ))}
        </div>
      )}
      <div className={`photo-grid ${preview ? "preview" : ""}`}>
        {filtered.map((p, i) => (
          <button
            className="photo-tile"
            key={p.image}
            onClick={() => setActive(i)}
            aria-label={`Xem ảnh: ${p.title}`}
          >
            <img
              src={p.image}
              alt={p.title}
              width={p.width ?? 960}
              height={p.height ?? 720}
              loading="lazy"
            />
            <span>
              {p.category}
              <span className="photo-expand">
                <Plus size={18} />
              </span>
            </span>
          </button>
        ))}
      </div>
      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        label="Thư viện hình ảnh"
        className="photo-modal"
      >
        {active !== null && filtered[active] && (
          <>
            <img
              className="lightbox-image"
              src={filtered[active].image}
              alt={filtered[active].title}
            />
            <div className="lightbox-controls">
              <button
                className="circle-button"
                aria-label="Ảnh trước"
                onClick={() =>
                  setActive((active - 1 + filtered.length) % filtered.length)
                }
              >
                <ChevronLeft />
              </button>
              <span>
                {filtered[active].title}
                <small>
                  {active + 1} / {filtered.length}
                </small>
              </span>
              <button
                className="circle-button"
                aria-label="Ảnh tiếp theo"
                onClick={() => setActive((active + 1) % filtered.length)}
              >
                <ChevronRight />
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export function DocumentLibrary() {
  const [active, setActive] = useState(null);
  return (
    <>
      <div className="document-list">
        {documents.map((d, i) => (
          <DocumentItem key={d.image} document={d} number={i + 1} onOpen={() => setActive(i)} />
        ))}
      </div>
      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        label="Tài liệu doanh nghiệp"
        className="document-modal"
      >
        {active !== null && (
          <>
            <h2>{documents[active].title}</h2>
            <img src={documents[active].image} alt={documents[active].title} />
          </>
        )}
      </Modal>
    </>
  );
}

function DocumentItem({ document, number, onOpen }) {
  const Tag = document.href ? "a" : "button";
  return (
    <Tag
      href={document.href}
      type={document.href ? undefined : "button"}
      onClick={document.href ? undefined : onOpen}
    >
      <span className="document-number">0{number}</span>
      <span>
        <strong>{document.title}</strong>
        <small>{document.description}</small>
      </span>
      <ArrowUpRight size={21} />
    </Tag>
  );
}

export function Accordion({ items }) {
  const [active, setActive] = useState(0);
  return (
    <div className="accordion">
      {items.map(([q, a], i) => (
        <div
          className={`accordion-item ${active === i ? "active" : ""}`}
          key={q}
        >
          <h3>
            <button
              aria-expanded={active === i}
              aria-controls={`answer-${i}`}
              onClick={() => setActive(active === i ? null : i)}
            >
              <span>{q}</span>
              {active === i ? <Minus size={20} /> : <Plus size={20} />}
            </button>
          </h3>
          <div id={`answer-${i}`} hidden={active !== i}>
            <p>{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MealCard({ meal, saved = false, onSave, loading = "lazy" }) {
  return (
    <article className="meal-card">
      <div className="meal-image">
        <a href={`/thuc-don/${meal.slug}/`} aria-label={`Xem ${meal.name}`}>
          <img
            src={meal.image}
            alt={`${meal.name} — hình ảnh thực tế Thúy Luân`}
            loading={loading}
            width="960"
            height="720"
          />
        </a>
        <span className="meal-badge">{meal.category}</span>
        {onSave && (
          <button
            className={`save-button ${saved ? "saved" : ""}`}
            aria-label={saved ? `Bỏ lưu ${meal.name}` : `Lưu ${meal.name}`}
            aria-pressed={saved}
            onClick={() => onSave(meal.id)}
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      <div className="meal-card-bottom">
        <div>
          <span className="mini-label">THỰC ĐƠN THAM KHẢO</span>
          <h3>
            <a href={`/thuc-don/${meal.slug}/`}>{meal.name}</a>
          </h3>
        </div>
        <a
          className="circle-button"
          href={`/thuc-don/${meal.slug}/`}
          aria-label={`Chi tiết ${meal.name}`}
        >
          <ArrowUpRight size={20} />
        </a>
      </div>
    </article>
  );
}

export function QuoteForm({ initialMeal = "" }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState(false);
  const form = useRef(null);
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const m = search.get("thuc-don") || initialMeal;
    if (m && form.current) form.current.elements.namedItem("menus").value = m;
  }, [initialMeal]);
  async function submit(e) {
    e.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (values.website) return;
    if (!/^(\+?84|0)[\d\s.()-]{8,14}$/.test(values.phone.trim())) {
      setError("Vui lòng kiểm tra lại số điện thoại.");
      form.current.elements.namedItem("phone").focus();
      return;
    }
    const body = `YÊU CẦU TƯ VẤN CUNG ỨNG SUẤT ĂN\n\nDoanh nghiệp: ${values.company}\nNgười liên hệ: ${values.name}\nĐiện thoại: ${values.phone}\nEmail: ${values.email || "Chưa cung cấp"}\nĐịa điểm phục vụ: ${values.location}\nSố suất/ngày: ${values.quantity}\nCa phục vụ: ${values.shift}\nNgân sách dự kiến: ${values.budget || "Cần tư vấn"}\nThực đơn quan tâm: ${values.menus || "Cần đề xuất"}\nNhu cầu: ${values.message || "Tư vấn phương án và báo giá."}`;
    const endpoint = process.env.NEXT_PUBLIC_QUOTE_ENDPOINT;
    if (endpoint) {
      setStatus("sending");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error();
        setStatus("sent");
        return;
      } catch {
        setStatus("idle");
        setError(
          "Chưa gửi được yêu cầu trực tuyến. Bạn có thể gửi qua email hoặc liên hệ Zalo bên dưới.",
        );
      }
    }
    setDraft({
      body,
      subject: `Tư vấn suất ăn doanh nghiệp — ${values.company}`,
    });
    setCopied(false);
  }
  return (
    <>
      <form className="quote-form" ref={form} onSubmit={submit}>
        <div className="form-heading">
          <span>THÔNG TIN HỢP TÁC</span>
          <span>01 — 02</span>
        </div>
        <h2>
          Doanh nghiệp bạn
          <br />
          đang cần giải pháp nào?
        </h2>
        <div className="form-grid">
          <label className="span-2">
            Tên doanh nghiệp <span>*</span>
            <input
              name="company"
              required
              autoComplete="organization"
              placeholder="Công ty / Nhà máy của bạn"
              maxLength={180}
            />
          </label>
          <label>
            Người liên hệ <span>*</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Họ và tên"
              maxLength={120}
            />
          </label>
          <label>
            Số điện thoại <span>*</span>
            <input
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder="Số điện thoại liên hệ"
              maxLength={24}
            />
          </label>
          <label className="span-2">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email nhận phương án (nếu có)"
              maxLength={200}
            />
          </label>
          <label>
            Địa điểm phục vụ <span>*</span>
            <input
              name="location"
              required
              placeholder="Khu công nghiệp, tỉnh/thành"
              maxLength={240}
            />
          </label>
          <label>
            Số suất dự kiến / ngày <span>*</span>
            <input
              name="quantity"
              required
              type="number"
              min="1"
              max="1000000"
              placeholder="Ví dụ: 500"
            />
          </label>
          <label>
            Ca phục vụ
            <select name="shift" defaultValue="Cần tư vấn">
              <option>Cần tư vấn</option>
              <option>Ca ngày</option>
              <option>Ca đêm</option>
              <option>Nhiều ca</option>
            </select>
          </label>
          <label>
            Ngân sách / suất
            <input
              name="budget"
              placeholder="Ví dụ: 30.000–40.000đ"
              maxLength={100}
            />
          </label>
          <label className="span-2">
            Thực đơn quan tâm
            <input
              name="menus"
              placeholder="Số thực đơn hoặc để chúng tôi đề xuất"
              maxLength={300}
            />
          </label>
          <label className="span-2">
            Chia sẻ thêm về nhu cầu
            <textarea
              name="message"
              rows="3"
              placeholder="Thời gian bắt đầu, hình thức cung ứng, yêu cầu khác…"
              maxLength={2000}
            />
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex="-1" autoComplete="off" />
          </label>
        </div>
        <label className="consent">
          <input type="checkbox" required />
          <span>
            Tôi đồng ý để Thúy Luân sử dụng thông tin trên nhằm tư vấn nhu cầu
            và đã đọc{" "}
            <a
              href="/chinh-sach-bao-mat/"
              target="_blank"
              rel="noopener noreferrer"
            >
              chính sách bảo mật
            </a>
            .
          </span>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {status === "sent" ? (
          <div className="form-success" role="status">
            <Check size={20} />
            Yêu cầu đã được gửi. Cảm ơn doanh nghiệp đã kết nối với Thúy Luân.
          </div>
        ) : (
          <button
            type="submit"
            className="button dark"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Đang gửi…" : "Nhận phương án & báo giá"}
            <ArrowUpRight size={18} />
          </button>
        )}
        <p className="form-footnote">
          Thông tin có dấu * là bắt buộc. Bạn sẽ được xem lại nội dung trước khi
          gửi qua email.
        </p>
      </form>
      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        label="Xem lại yêu cầu hợp tác"
        className="quote-modal"
      >
        {draft && (
          <>
            <Eyebrow>YÊU CẦU CỦA BẠN ĐÃ SẴN SÀNG</Eyebrow>
            <h2>
              Thêm một bước
              <br />
              để bắt đầu hợp tác.
            </h2>
            <p>
              Chọn gửi qua ứng dụng email của bạn hoặc sao chép nội dung để trao
              đổi qua Zalo. Yêu cầu chỉ được gửi khi bạn hoàn tất bước gửi.
            </p>
            <pre>{draft.body}</pre>
            <div className="draft-actions">
              <a
                className="button dark"
                href={`mailto:${company.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
              >
                Mở email để gửi
                <Mail size={18} />
              </a>
              <button
                className="button outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(draft.body);
                    setCopied(true);
                  } catch {
                    setError(
                      "Bạn có thể chọn và sao chép nội dung yêu cầu trong khung trên.",
                    );
                  }
                }}
              >
                {copied ? "Đã sao chép" : "Sao chép nội dung"}
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <a
                className="text-link"
                href={company.zalo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Trao đổi qua Zalo
                <ArrowUpRight size={17} />
              </a>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
