"use client";

import { useEffect, useState } from "react";
import { solutionPhotos, solutionSlideInterval } from "../solution-photos";

export default function ServiceDetailSlider({ group, title }) {
  const photos = solutionPhotos[group];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActive((index) => (index + 1) % photos.length);
      }
    }, solutionSlideInterval);

    return () => window.clearInterval(interval);
  }, [photos.length]);

  return (
    <div className="service-detail-image" role="group" aria-label={`Hình ảnh ${title}`}>
      {photos.map((photo, index) => (
        <div
          className={`solution-slide${index === active ? " is-active" : ""}`}
          key={photo.src}
          aria-hidden={index !== active}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
      <span className="solution-slide-progress" aria-hidden="true">
        {photos.map((photo, index) => (
          <i className={index === active ? "is-active" : ""} key={photo.src} />
        ))}
      </span>
    </div>
  );
}
