"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const slides = [
  {
    src: "/assets/home-menu-30-days.jpg",
    alt: "Thực đơn 30 ngày không trùng lặp của Thúy Luân",
  },
  {
    src: "/assets/home-services-poster.jpg",
    alt: "Suất ăn Thúy Luân cho văn phòng, nhà máy và trường học",
  },
  {
    src: "/assets/home-food-menu-poster.jpg",
    alt: "Ấn phẩm thực đơn suất ăn công nghiệp Thúy Luân",
  },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActive((index) => (index + 1) % slides.length);
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [active]);

  return (
    <div className="hero-visual">
      <div className="hero-slide-frame" aria-label="Hình ảnh giới thiệu thực đơn Thúy Luân">
        {slides.map((slide, index) => (
          <div
            className={`hero-slide${index === active ? " is-active" : ""}`}
            key={slide.src}
            aria-hidden={index !== active}
          >
            <img
              className="hero-image"
              src={slide.src}
              alt={slide.alt}
              width="1280"
              height="1280"
              fetchPriority={index === 0 ? "high" : undefined}
              loading="eager"
            />
          </div>
        ))}
      </div>
      <div className="hero-visual-footer">
        <div className="hero-quality-card">
          <div>
            <ShieldCheck size={23} />
            <strong>Chất lượng là ưu tiên</strong>
          </div>
          <p>Giải pháp được xây dựng theo nhu cầu thực tế của từng đối tác.</p>
        </div>
        <div className="hero-slide-dots" role="group" aria-label="Chọn ảnh giới thiệu">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              className={index === active ? "is-active" : ""}
              aria-label={`Ảnh ${index + 1}: ${slide.alt}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
