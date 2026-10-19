"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { galleryShowcase } from "../data";

export default function GalleryCategoryShowcase() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveImage((index) => (index + 1) % 5);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="photo-grid preview gallery-category-showcase">
      {galleryShowcase.map((category) => (
        <a
          className="photo-tile"
          href={`/hinh-anh/?loai=${category.slug}`}
          aria-label={`Xem thư viện ${category.label}`}
          key={category.slug}
        >
          {category.photos.map((photo, index) => (
            <img
              className={`gallery-slide${index === activeImage ? " is-active" : ""}`}
              src={photo.image}
              alt=""
              width={photo.width ?? 960}
              height={photo.height ?? 720}
              loading={index === 0 ? "eager" : "lazy"}
              aria-hidden="true"
              key={photo.image}
            />
          ))}
          <span>
            {category.label}
            <span className="photo-expand" aria-hidden="true">
              <ArrowUpRight size={18} />
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
