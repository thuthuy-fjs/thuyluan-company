"use client";

import { useEffect, useId, useRef, useState } from "react";

const key = (text) => String(text).normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("vi").replaceAll("đ", "d");

export default function ImageSelect({ images, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const trigger = useRef(null);
  const input = useRef(null);
  const id = useId();
  const selected = images.find((item) => item.id === value);
  const options = [{ id: "", title: "Ảnh gốc" }, ...images.filter((item) => key(`${item.title || ""} ${item.id}`).includes(key(search)))];
  const choose = (item) => { onChange(item.id); setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  useEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
    const outside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => { if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active, open, id]);
  return <div className="admin-image-select" ref={root}>
    <span className="admin-image-select-label">Chọn ảnh có sẵn</span>
    <button ref={trigger} type="button" role="combobox" aria-label="Chọn ảnh có sẵn" aria-expanded={open} aria-controls={id} aria-haspopup="listbox" onClick={() => { setSearch(""); setActive(0); setOpen(!open); }} onKeyDown={(event) => {
      if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); }
    }}>{selected?.title || selected?.id || "Ảnh gốc"}<span aria-hidden="true">⌄</span></button>
    {open && <div className="admin-image-select-menu" onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); setOpen(false); trigger.current?.focus({ preventScroll: true }); }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length); }
      if (event.key === "Enter") { event.preventDefault(); choose(options[active] || options[0]); }
    }}>
      <input ref={input} type="search" aria-label="Tìm ảnh theo tên" aria-controls={id} aria-activedescendant={`${id}-${active}`} value={search} placeholder="Tìm tên ảnh…" onChange={(event) => { setSearch(event.target.value); setActive(0); }} />
      <div role="listbox" id={id} aria-label="Ảnh có sẵn">
        {options.map((item, index) => <button type="button" role="option" tabIndex={-1} id={`${id}-${index}`} key={item.id} data-image-value={item.id} aria-selected={item.id === value} className={active === index ? "is-highlighted" : ""} onClick={() => choose(item)}>
          <span>{item.title || item.id}</span>{item.width && <small>{item.width} × {item.height}</small>}
        </button>)}
        {options.length === 1 && search && <p>Không tìm thấy ảnh phù hợp với tên đã nhập.</p>}
      </div>
    </div>}
  </div>;
}
