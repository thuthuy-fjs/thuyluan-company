"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Heart,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { meals } from "../data";
import { MealCard, Modal, Eyebrow } from "../components/site";
const storageKey = "thuy-luan-saved-menus";
export default function Catalog() {
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState([]);
  const [page, setPage] = useState(1);
  const [showSaved, setShowSaved] = useState(false);
  const [comparing, setComparing] = useState(false);
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(value))
        setSaved(value.filter((id) => meals.some((m) => m.id === id)));
    } catch {}
  }, []);
  function toggle(id) {
    setSaved((current) => {
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }
  function reset() {
    setSearch("");
    setShowSaved(false);
    setPage(1);
  }
  const filtered = useMemo(() => {
    return meals.filter(
      (m) =>
        (!showSaved || saved.includes(m.id)) &&
        `${m.name} ${m.category} ${m.id}`
          .toLocaleLowerCase("vi")
          .includes(search.trim().toLocaleLowerCase("vi")),
    ).sort((a, b) => a.id - b.id);
  }, [search, saved, showSaved]);
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 9, currentPage * 9);
  return (
    <div className="wrap">
      <div className="filter-toolbar">
        <div className="catalog-controls">
          <label className="search-field">
            <Search size={15} />
            <input
              aria-label="Tìm thực đơn"
              placeholder="Tìm tên hoặc số thực đơn…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
      </div>
      <div className="catalog-meta">
        <span aria-live="polite">
          {filtered.length} thực đơn {showSaved ? "đã lưu" : "phù hợp"}
        </span>
        <button
          aria-pressed={showSaved}
          onClick={() => {
            setShowSaved(!showSaved);
            setPage(1);
          }}
        >
          <Heart size={14} fill={showSaved ? "currentColor" : "none"} />
          Đã lưu ({saved.length})
        </button>
      </div>
      {visible.length ? (
        <div className="catalog-grid">
          {visible.map((m) => (
            <MealCard
              key={m.id}
              meal={m}
              saved={saved.includes(m.id)}
              onSave={toggle}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={29} />
          <h2>Chưa tìm thấy thực đơn phù hợp.</h2>
          <p>Hãy thử số thực đơn khác hoặc xem toàn bộ gợi ý.</p>
          <button className="button outline" onClick={reset}>
            Xem tất cả
            <RotateCcw size={15} />
          </button>
        </div>
      )}
      {pages > 1 && (
        <nav className="pagination" aria-label="Phân trang thực đơn">
          <button
            disabled={currentPage === 1}
            aria-label="Trang trước"
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              aria-label={`Trang ${i + 1}`}
              aria-current={currentPage === i + 1 ? "page" : undefined}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => {
                setPage(i + 1);
                document
                  .querySelector(".filter-toolbar")
                  ?.scrollIntoView({ block: "start", behavior: "smooth" });
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === pages}
            aria-label="Trang tiếp theo"
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </nav>
      )}
      {saved.length > 0 && (
        <div className="saved-tray">
          <Heart size={17} />
          <span>Đã chọn {saved.length} thực đơn</span>
          {saved.length > 1 && (
            <button onClick={() => setComparing(true)}>So sánh</button>
          )}
          <button
            onClick={() => {
              setSaved([]);
              try {
                localStorage.removeItem(storageKey);
              } catch {}
            }}
          >
            Bỏ chọn
          </button>
          <a
            className="button lime"
            href={`/lien-he/?thuc-don=${encodeURIComponent(saved.map((x) => `Mẫu ${String(x).padStart(2, "0")}`).join(", "))}`}
          >
            Nhận đề xuất
            <ArrowUpRight size={16} />
          </a>
        </div>
      )}
      <Modal
        open={comparing}
        onClose={() => setComparing(false)}
        label="So sánh thực đơn đã chọn"
        className="compare-modal"
      >
        <Eyebrow>THỰC ĐƠN ĐANG QUAN TÂM</Eyebrow>
        <h2>Cùng xem các lựa chọn.</h2>
        <p>
          So sánh hình ảnh và nhóm thực đơn. Thành phần, định lượng và ngân sách
          được trao đổi khi tư vấn.
        </p>
        <div className="compare-grid">
          {saved
            .map((id) => meals.find((m) => m.id === id))
            .filter(Boolean)
            .map((m) => (
              <article key={m.id}>
                <img src={m.image} alt={m.name} width="960" height="720" />
                <span className="mini-label">{m.category}</span>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <a className="text-link" href={`/thuc-don/${m.slug}/`}>
                  Xem chi tiết
                  <ArrowUpRight size={15} />
                </a>
              </article>
            ))}
        </div>
        <a
          className="button dark"
          href={`/lien-he/?thuc-don=${encodeURIComponent(saved.map((x) => `Mẫu ${String(x).padStart(2, "0")}`).join(", "))}`}
        >
          Nhận đề xuất từ các mẫu này
          <ArrowUpRight size={17} />
        </a>
      </Modal>
    </div>
  );
}
