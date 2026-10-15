"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
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
  const selected = active !== null ? certificates[active] : null;
  return (
    <section id="certificates" className="certificates-section section wrap">
      <div className="section-heading">
        <div>
          <Eyebrow>HỒ SƠ TỪ THÚY LUÂN</Eyebrow>
          <h2>Chứng chỉ – Chứng nhận</h2>
        </div>
        <p>
          Hồ sơ doanh nghiệp, an toàn thực phẩm và đào tạo. Chọn tài liệu để xem
          bản đầy đủ.
        </p>
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
        <span>Nhấn vào ảnh để xem rõ nội dung và tải tài liệu.</span>
        <a className="text-link" href="/lien-he/">
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
            <img
              className="certificate-full"
              src={selected.image}
              alt={selected.title}
            />
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
              <a href={selected.image} download className="text-link">
                Tải bản đầy đủ
                <Download size={16} />
              </a>
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
