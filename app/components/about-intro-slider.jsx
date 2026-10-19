"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    image: "/assets/gallery-17.webp",
    alt: "Hoạt động phục vụ bữa ăn tại doanh nghiệp",
  },
  {
    image: "/assets/gallery-bep-07.webp",
    alt: "Thiết bị bếp công nghiệp Thúy Luân",
  },
  {
    image: "/assets/gallery-bua-an-04.webp",
    alt: "Bữa ăn tại nhà ăn của doanh nghiệp",
  },
  {
    image: "/assets/gallery-dao-tao-03.webp",
    alt: "Nhân viên Thúy Luân tham gia buổi đào tạo",
  },
  {
    image: "/assets/gallery-gala-08.webp",
    alt: "Hoạt động Gala Dinner Thúy Luân",
  },
];

export default function AboutIntroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActive((index) => (index + 1) % slides.length);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="about-intro-visual" role="group" aria-label="Hình ảnh giới thiệu Thúy Luân">
      {slides.map((slide, index) => (
        <img
          className={`about-intro-slide${index === active ? " is-active" : ""}`}
          src={slide.image}
          alt={index === active ? slide.alt : ""}
          aria-hidden={index !== active}
          width="960"
          height="720"
          loading={index === 0 ? "eager" : "lazy"}
          key={slide.image}
        />
      ))}
    </div>
  );
}
