"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { certificates } from "../data";
import { Modal, Eyebrow } from "./site";

export default function Certifications() {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (active === null) return;
    const navigate = (e) => {
      if (e.key === "ArrowRight")
        setActive((i) => (i + 1) % certificates.length);
      if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + certificates.length) % certificates.length);
    };
    document.addEventListener("keydown", navigate);
    return () => document.removeEventListener("keydown", navigate);
  }, [active]);
  useEffect(() => {
    if (active !== null)
      document.querySelector(".certificate-modal")?.scrollTo(0, 0);
  }, [active]);
  const selected = active !== null ? certificates[active] : null;
  return (
    <section id="certificates" className="certificates-section section wrap">
      <div className="section-heading">
        <div>
          <Eyebrow>HỒ SƠ</Eyebrow>
          <h2>Chứng chỉ – Chứng nhận</h2>
        </div>
        <p>Hồ sơ doanh nghiệp, ISO 22000, an toàn thực phẩm và đào tạo.</p>
      </div>
      <div className="certificate-grid">
        {certificates.map((certificate, index) => (
          <button
            className="certificate-card"
            key={certificate.id}
            onClick={() => setActive(index)}
            aria-label={`Xem chứng nhận ${index + 1}: ${certificate.title}`}
          >
            <div className="certificate-preview">
              <img
                src={certificate.thumbnail}
                alt={certificate.title}
                width="440"
                height="620"
                loading="lazy"
              />
              <span className="certificate-zoom">
                <Plus size={18} />
              </span>
            </div>
            <div className="certificate-caption">
              <small>
                {String(index + 1).padStart(2, "0")} / {certificate.category}
              </small>
              <h3>{certificate.title}</h3>
            </div>
          </button>
        ))}
      </div>
      <div className="certificates-footnote">
        <span>Nhấn vào ảnh để xem rõ nội dung.</span>
        <a className="text-link" href="/contacts/">
          Trao đổi hồ sơ hợp tác
          <ArrowUpRight size={16} />
        </a>
      </div>
      <Modal
        open={selected !== null}
        onClose={() => setActive(null)}
        label="Xem chứng chỉ, chứng nhận"
        className="certificate-modal"
      >
        {selected && (
          <>
            <p className="mini-label">
              CHỨNG CHỈ – CHỨNG NHẬN · {active + 1} / {certificates.length}
            </p>
            <h2>{selected.title}</h2>
            {selected.pages.length > 1 ? (
              <div className="certificate-pages">
                {selected.pages.map((page, pageIndex) => (
                  <figure className="certificate-page" key={page.image}>
                    <figcaption>
                      <span>
                        Trang {pageIndex + 1} / {selected.pages.length} ·{" "}
                        {page.title}
                      </span>
                    </figcaption>
                    <img
                      className="certificate-full"
                      src={page.image}
                      alt={`${selected.title} · trang ${pageIndex + 1}: ${page.title}`}
                    />
                  </figure>
                ))}
              </div>
            ) : (
              <img
                className="certificate-full"
                src={selected.image}
                alt={selected.title}
              />
            )}
            <div className="certificate-modal-actions">
              <button
                className="circle-button"
                aria-label="Chứng nhận trước"
                onClick={() =>
                  setActive(
                    (active - 1 + certificates.length) % certificates.length,
                  )
                }
              >
                <ChevronLeft size={20} />
              </button>
              <span className="certificate-page-count">
                {selected.pages?.length ?? 1} trang tài liệu
              </span>
              <button
                className="circle-button"
                aria-label="Chứng nhận tiếp theo"
                onClick={() => setActive((active + 1) % certificates.length)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
