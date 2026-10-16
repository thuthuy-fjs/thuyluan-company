"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { homePosters } from "../data";
import { Modal } from "./site";

export default function HomePosters() {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (active === null) return;
    const navigate = (event) => {
      if (event.key === "ArrowRight")
        setActive((index) => (index + 1) % homePosters.length);
      if (event.key === "ArrowLeft")
        setActive((index) => (index - 1 + homePosters.length) % homePosters.length);
    };
    document.addEventListener("keydown", navigate);
    return () => document.removeEventListener("keydown", navigate);
  }, [active]);

  const selected = active === null ? null : homePosters[active];
  return (
    <>
      <div className="home-poster-grid">
        {homePosters.map((poster, index) => (
          <button
            className={`home-poster-card${poster.featured ? " featured" : ""}`}
            key={poster.id}
            data-poster-id={poster.id}
            onClick={() => setActive(index)}
            aria-label={`Xem ảnh: ${poster.title}`}
          >
            <span className="home-poster-frame">
              <img
                src={poster.image}
                alt={poster.title}
                width={poster.width}
                height={poster.height}
                loading="lazy"
              />
            </span>
            <span className="home-poster-caption">
              <span>
                <small>{poster.category}</small>
                <strong>{poster.title}</strong>
              </span>
              <span className="home-poster-expand" aria-hidden="true">
                <Plus size={18} />
              </span>
            </span>
          </button>
        ))}
      </div>
      <Modal
        open={selected !== null}
        onClose={() => setActive(null)}
        label="Ấn phẩm Thúy Luân"
        className="home-poster-modal"
      >
        {selected && (
          <>
            <img src={selected.image} alt={selected.title} />
            <div className="home-poster-controls">
              <button
                className="circle-button"
                aria-label="Ảnh trước"
                onClick={() =>
                  setActive((active - 1 + homePosters.length) % homePosters.length)
                }
              >
                <ChevronLeft size={20} />
              </button>
              <span>
                {selected.title}
                <small>{active + 1} / {homePosters.length}</small>
              </span>
              <button
                className="circle-button"
                aria-label="Ảnh tiếp theo"
                onClick={() => setActive((active + 1) % homePosters.length)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
