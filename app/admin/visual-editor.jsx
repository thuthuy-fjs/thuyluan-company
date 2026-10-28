"use client";

import { useEffect, useRef, useState } from "react";
import { articles, meals } from "../data";
import { sliderSlotLabel } from "../slider-slots";

const pages = [
  { path: "/", label: "Trang chủ" },
  { path: "/about/", label: "Về chúng tôi" },
  { path: "/services/", label: "Dịch vụ" },
  { path: "/menus/", label: "Thực đơn" },
  { path: "/galleries/", label: "Hình ảnh thực tế" },
  { path: "/contacts/", label: "Nhận báo giá" },
  { path: "/news/", label: "Góc chia sẻ" },
  ...meals.map((item) => ({ path: `/menus/${item.slug}/`, label: item.name })),
  ...articles.map((item) => ({ path: `/news/${item.slug}/`, label: item.title })),
];

const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();

export default function VisualEditor({ fields, savedText, publishedText = {}, draftText, onChange, buttons, onButtonChange, onImageUpload, onSliderUpload, onSliderChange, sliderImages = {}, replacements, media, deletedIds = [], readOnly = false }) {
  const frameRef = useRef(null);
  const nodesRef = useRef(new Map());
  const annotateRef = useRef(null);
  const syncImagesRef = useRef(null);
  const [page, setPage] = useState("/");
  const [device, setDevice] = useState("desktop");
  const [selectedId, setSelectedId] = useState("");
  const [selectedButton, setSelectedButton] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedSlider, setSelectedSlider] = useState("");
  const [sliderSlots, setSliderSlots] = useState([]);
  const [frameReady, setFrameReady] = useState(false);
  const selectedField = fields.find((field) => field.id === selectedId);

  const annotate = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    const nodes = new Map();
    const byValue = new Map();
    for (const field of fields) {
      for (const value of new Set([draftText[field.id], savedText[field.id] ?? field.defaultValue, publishedText[field.id] ?? field.defaultValue, field.defaultValue])) {
        const key = normalize(value);
        if (!key) continue;
        byValue.set(key, [...(byValue.get(key) || []), field.id]);
      }
    }
    const register = (id, node, element) => {
      if (!node || !element) return;
      if (element.dataset.adminField && element.dataset.adminField !== id) {
        const wrapper = doc.createElement("span");
        wrapper.style.color = "inherit";
        node.parentNode.insertBefore(wrapper, node);
        wrapper.append(node);
        element = wrapper;
      }
      element.dataset.adminField = id;
      nodes.set(id, [...(nodes.get(id) || []), node]);
    };
    const chooseId = (ids) => {
      if (ids.length === 1) return ids[0];
      const preferred = page === "/" ? ["home."]
        : page.startsWith("/services/") ? ["services.", "solutions."]
        : page.startsWith("/about/") ? ["about."]
        : page.startsWith("/contacts/") ? ["contact."]
        : page.startsWith("/menus/industrial-meal-") ? [`meals.${Number(page.match(/-(\d+)\/$/)?.[1])}.`]
        : page.startsWith("/news/") && page !== "/news/" ? [`articles.${page.split("/")[2]}.`] : [];
      for (const prefix of preferred) {
        const matches = ids.filter((id) => id.startsWith(prefix));
        if (matches.length === 1) return matches[0];
      }
      return null;
    };
    for (const element of doc.querySelectorAll("[data-editor-id]")) {
      const id = element.dataset.editorId;
      if (!fields.some((field) => field.id === id)) continue;
      const direct = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && normalize(node.nodeValue));
      register(id, direct, element);
    }
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      const element = node.parentElement;
      if (!element || element.closest("script, style, noscript, textarea, option") || element.parentElement?.closest("[data-admin-field]")) continue;
      if (element.dataset.adminField && nodes.get(element.dataset.adminField)?.includes(node)) continue;
      const ids = [...new Set(byValue.get(normalize(node.nodeValue)) || [])];
      const id = chooseId(ids);
      if (id) register(id, node, element);
    }
    let style = doc.getElementById("admin-visual-style");
    if (!style) {
      style = doc.createElement("style");
      style.id = "admin-visual-style";
      doc.head.append(style);
    }
    style.textContent = readOnly ? "" : `[data-admin-field], [data-editor-button], img[src^="/assets/"], [data-editor-slider-slot] { cursor: pointer !important; } .hero-slide.is-active, .solution-slide.is-active { pointer-events: auto !important; } [data-admin-field]:hover, [data-editor-button]:hover, img[src^="/assets/"]:hover, [data-editor-slider-slot]:hover { outline: 2px dashed #b7742a !important; outline-offset: 4px; border-radius: 3px; } [data-admin-field].admin-selected { outline: 3px solid #b7742a !important; outline-offset: 5px; border-radius: 3px; }`;
    doc.documentElement.dataset.adminPreview = "true";
    const click = (event) => {
      const element = event.target?.nodeType === 1 ? event.target : null;
      const button = element?.closest("[data-editor-button]");
      const target = element?.closest("[data-admin-field], [data-editor-id]");
      const image = element?.closest("img[src]") || element?.closest(".solution-image, .gallery-category-showcase .photo-tile")?.querySelector(".is-active[data-editor-slider-slot], .is-active [data-editor-slider-slot]");
      if (button && !readOnly) {
        event.preventDefault(); event.stopPropagation();
        setSelectedButton(button.dataset.editorButton); setSelectedId(""); setSelectedImageId(""); setSelectedSlider("");
      } else if (target && !readOnly) {
        event.preventDefault();
        event.stopPropagation();
        const id = target.dataset.adminField || target.dataset.editorId;
        if (!nodes.has(id)) {
          const direct = [...target.childNodes].find((item) => item.nodeType === Node.TEXT_NODE && normalize(item.nodeValue));
          register(id, direct, target);
          nodesRef.current = nodes;
        }
        setSelectedId(id);
        setSelectedButton(""); setSelectedImageId(""); setSelectedSlider("");
        if (target.children.length === 0) { target.contentEditable = "plaintext-only"; target.focus(); }
      } else if (image && !readOnly) {
        const originalId = (image.dataset.adminOriginalSrc || image.getAttribute("src"))?.slice(8);
        const currentId = replacements[originalId] || originalId;
        if (image.dataset.editorSliderSlot) {
          event.preventDefault(); event.stopPropagation();
          const card = image.closest(".solution-card, .photo-tile");
          setSliderSlots([...(card?.querySelectorAll("[data-editor-slider-slot]") || [])].map((item) => ({ slot: item.dataset.editorSliderSlot, originalId: (item.dataset.editorSliderDefault || item.dataset.adminOriginalSrc || item.getAttribute("src"))?.slice(8) })));
          setSelectedSlider(image.dataset.editorSliderSlot); setSelectedId(""); setSelectedButton(""); setSelectedImageId("");
        } else if (media.some((item) => item.id === currentId)) {
          event.preventDefault(); event.stopPropagation();
          setSelectedImageId(currentId); setSelectedId(""); setSelectedButton(""); setSelectedSlider("");
        }
      } else if (element?.closest("a, button")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const input = (event) => {
      const element = event.target?.nodeType === 1 ? event.target.closest("[data-admin-field]") : null;
      if (!element?.isContentEditable || readOnly) return;
      const id = element.dataset.adminField;
      const node = [...element.childNodes].find((item) => item.nodeType === Node.TEXT_NODE);
      if (node) nodes.set(id, [node]);
      onChange(id, element.textContent);
    };
    doc.addEventListener("click", click, true);
    doc.addEventListener("input", input, true);
    frameRef.current.__adminCleanup?.();
    frameRef.current.__adminCleanup = () => { doc.removeEventListener("click", click, true); doc.removeEventListener("input", input, true); };
    nodesRef.current = nodes;
    setFrameReady(true);
    for (const [id, entries] of nodes) {
      const field = fields.find((item) => item.id === id);
      const value = draftText[id] ?? savedText[id] ?? field?.defaultValue ?? "";
      for (const entry of entries) if (entry.nodeValue !== value) entry.nodeValue = value;
    }
  };
  annotateRef.current = annotate;

  useEffect(() => {
    for (const [id, nodes] of nodesRef.current) {
      const field = fields.find((item) => item.id === id);
      const value = draftText[id] ?? savedText[id] ?? field?.defaultValue ?? "";
      for (const node of nodes) if (node.isConnected && node.nodeValue !== value) node.nodeValue = value;
    }
  }, [draftText, savedText, fields]);

  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    doc?.querySelectorAll(".admin-selected").forEach((item) => item.classList.remove("admin-selected"));
    if (selectedId) doc?.querySelectorAll("[data-admin-field]").forEach((item) => {
      if (item.dataset.adminField === selectedId) item.classList.add("admin-selected");
    });
  }, [selectedId, frameReady]);

  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    for (const element of doc.querySelectorAll("[data-editor-button]")) {
      const button = buttons[element.dataset.editorButton];
      if (!button) continue;
      const node = [...element.childNodes].find((item) => item.nodeType === Node.TEXT_NODE);
      if (node && node.nodeValue !== button.label) node.nodeValue = button.label;
    }
  }, [buttons, frameReady]);

  const syncImages = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    const lookup = new Map(media.map((item) => [item.id, item]));
    for (const image of doc.querySelectorAll("img[src]")) {
      const original = image.dataset.adminOriginalSrc || image.getAttribute("src");
      if (!original?.startsWith("/assets/")) continue;
      image.dataset.adminOriginalSrc = original;
      const slotTarget = image.dataset.editorSliderSlot && sliderImages[image.dataset.editorSliderSlot]?.slice(8);
      const base = slotTarget || image.dataset.editorSliderDefault?.slice(8) || original.slice(8);
      const target = lookup.get(replacements[base] || base);
      const baseSrc = `/assets/${base}`;
      const next = target?.preview || (target?.id.startsWith("upload-") ? `/api/admin/asset/${target.id}` : target?.src) || (baseSrc.startsWith("/assets/upload-") ? `/api/admin/asset/${base}` : baseSrc);
      if (image.getAttribute("src") !== next) image.setAttribute("src", next);
    }
  };
  syncImagesRef.current = syncImages;
  useEffect(() => { syncImages(); }, [replacements, sliderImages, media, frameReady]);

  const currentSliderSlot = sliderSlots.find((item) => item.slot === selectedSlider);
  const sliderImageId = (entry) => replacements[sliderImages[entry.slot]?.slice(8) || entry.originalId] || sliderImages[entry.slot]?.slice(8) || replacements[entry.originalId] || entry.originalId;
  const sliderItem = currentSliderSlot && media.find((item) => item.id === sliderImageId(currentSliderSlot));
  const sliderReference = currentSliderSlot && (media.find((item) => item.id === currentSliderSlot.originalId) || sliderItem);
  const sliderCandidates = sliderReference ? media.filter((item) => !deletedIds.includes(item.id) && item.category === sliderReference.category && (item.width / item.height) / (sliderReference.width / sliderReference.height) >= 0.7 && (item.width / item.height) / (sliderReference.width / sliderReference.height) <= 1.4) : [];
  const focusSliderSlot = (slot) => {
    setSelectedSlider(slot);
    const doc = frameRef.current?.contentDocument;
    const selected = [...(doc?.querySelectorAll("[data-editor-slider-slot]") || [])].find((item) => item.dataset.editorSliderSlot === slot);
    const card = selected?.closest(".solution-card, .photo-tile");
    if (!card) return;
    for (const image of card.querySelectorAll("[data-editor-slider-slot]")) {
      const slide = image.closest(".solution-slide") || image;
      slide.classList.toggle("is-active", image.dataset.editorSliderSlot === slot);
      slide.setAttribute("aria-hidden", image.dataset.editorSliderSlot === slot ? "false" : "true");
    }
    const index = sliderSlots.findIndex((item) => item.slot === slot);
    card.querySelectorAll(".solution-slide-progress i").forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
  };

  return (
    <div className="admin-visual-editor">
      <div className="admin-visual-controls">
        <label>Trang đang xem
          <select value={page} onChange={(event) => { setFrameReady(false); setSelectedId(""); setSelectedButton(""); setSelectedImageId(""); setSelectedSlider(""); setPage(event.target.value); }}>
            {pages.map((item) => <option value={item.path} key={item.path}>{item.label}</option>)}
          </select>
        </label>
        <div className="admin-device-controls" role="group" aria-label="Kích thước bản xem">
          <button type="button" className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}>Desktop</button>
          <button type="button" className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}>Mobile</button>
        </div>
      </div>
      <div className={`admin-site-frame${device === "mobile" ? " is-mobile" : ""}`}>
        <iframe ref={frameRef} src={page} title={`Bản xem trực tiếp: ${pages.find((item) => item.path === page)?.label}`} onLoad={() => { annotateRef.current(); syncImagesRef.current(); window.setTimeout(() => { annotateRef.current(); syncImagesRef.current(); }, 350); }} />
      </div>
      {!readOnly && selectedField && <aside className="admin-inline-editor" aria-label="Sửa nội dung đã chọn">
        <button type="button" className="admin-inline-close" onClick={() => setSelectedId("")} aria-label="Đóng ô sửa">×</button>
        <small>{selectedField.section}</small>
        <label>Nội dung
          <textarea rows={Math.min(8, Math.max(3, Math.ceil((draftText[selectedId] ?? savedText[selectedId] ?? selectedField.defaultValue).length / 45)))} value={draftText[selectedId] ?? savedText[selectedId] ?? selectedField.defaultValue} onChange={(event) => onChange(selectedId, event.target.value)} />
        </label>
        <button type="button" onClick={() => onChange(selectedId, undefined)}>Khôi phục nội dung gốc</button>
      </aside>}
      {!readOnly && selectedButton && <aside className="admin-inline-editor" aria-label="Thuộc tính nút">
        <button type="button" className="admin-inline-close" onClick={() => setSelectedButton("")} aria-label="Đóng ô sửa">×</button>
        <small>Chỉnh chữ trên nút</small>
        <label>Chữ trên nút<input value={buttons[selectedButton]?.label || ""} onChange={(event) => onButtonChange(selectedButton, { label: event.target.value })} /></label>
      </aside>}
      {!readOnly && selectedImageId && <aside className="admin-inline-editor" aria-label="Thay ảnh trên trang">
        <button type="button" className="admin-inline-close" onClick={() => setSelectedImageId("")} aria-label="Đóng ô sửa">×</button>
        <small>{media.find((item) => item.id === selectedImageId)?.title || "Ảnh đang chọn"}</small>
        <label className="admin-image-picker">Chọn ảnh thay thế<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { if (event.target.files?.length) onImageUpload?.(selectedImageId, event.target.files); event.target.value = ""; }} /></label>
      </aside>}
      {!readOnly && selectedSlider && currentSliderSlot && <aside className="admin-inline-editor admin-slider-editor" aria-label="Thay ảnh trong slider">
        <button type="button" className="admin-inline-close" onClick={() => setSelectedSlider("")} aria-label="Đóng ô sửa">×</button>
        <small>{sliderSlotLabel(selectedSlider)}</small>
        <div className="admin-slider-slots" role="group" aria-label="Các ảnh trong slider">
          {sliderSlots.map((entry) => { const item = media.find((candidate) => candidate.id === sliderImageId(entry)); return <button type="button" key={entry.slot} className={entry.slot === selectedSlider ? "active" : ""} onClick={() => focusSliderSlot(entry.slot)} aria-label={sliderSlotLabel(entry.slot)}><img src={item?.preview || (item?.id.startsWith("upload-") ? `/api/admin/asset/${item.id}` : item?.src) || `/assets/${entry.originalId}`} alt="" /><span>{entry.slot.split(".").at(-1)}</span></button>; })}
        </div>
        <label>Chọn ảnh có sẵn
          <select value={sliderImages[selectedSlider]?.slice(8) || ""} onChange={(event) => onSliderChange(selectedSlider, event.target.value === currentSliderSlot.originalId ? "" : event.target.value)}>
            <option value="">Ảnh gốc</option>
            {sliderCandidates.map((item) => <option key={item.id} value={item.id}>{item.title || item.id} · {item.width} × {item.height}</option>)}
          </select>
        </label>
        <label className="admin-image-picker">Tải ảnh mới cho slide này<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { if (event.target.files?.length) onSliderUpload?.(selectedSlider, sliderItem?.id || currentSliderSlot.originalId, event.target.files); event.target.value = ""; }} /></label>
        <p>Ảnh sẽ được cắt vừa khung khi hiển thị. Thay đổi chỉ áp dụng cho vị trí này.</p>
      </aside>}
    </div>
  );
}
