"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { solutionPhotos, solutionSlideInterval } from "../solution-photos";
import { pageText } from "../editor-fields";
import { editableSliderImage } from "../editor-content";

const solutions = [
  {
    number: "01",
    id: "nha-may",
    field: "factory",
    title: pageText["home.solutions.factory.title"],
    description: pageText["home.solutions.factory.description"],
    photos: solutionPhotos.factory,
  },
  {
    number: "02",
    id: "van-phong",
    field: "office",
    title: pageText["home.solutions.office.title"],
    description: pageText["home.solutions.office.description"],
    photos: solutionPhotos.office,
  },
  {
    number: "03",
    id: "hop-dong",
    field: "contract",
    title: pageText["home.solutions.contract.title"],
    description: pageText["home.solutions.contract.description"],
    photos: solutionPhotos.contract,
  },
];

function SolutionCard({ solution }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && document.documentElement.dataset.adminPreview !== "true") {
        setActive((index) => (index + 1) % solution.photos.length);
      }
    }, solutionSlideInterval);

    return () => window.clearInterval(interval);
  }, [solution.photos.length]);

  return (
    <a
      href={`/services/#${solution.id}`}
      className="solution-card"
      data-solution={solution.id}
    >
      <div className="solution-image">
        {solution.photos.map((photo, index) => (
          <div
            className={`solution-slide${index === active ? " is-active" : ""}`}
            key={photo.src}
            aria-hidden={index !== active}
          >
            <img
              data-editor-slider-slot={`home.solutions.${solution.field}.${index + 1}`}
              data-editor-slider-default={photo.defaultSrc}
              src={editableSliderImage(`home.solutions.${solution.field}.${index + 1}`, photo.src)}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
        <span>{solution.number} / GIẢI PHÁP</span>
        <span className="solution-slide-progress" aria-hidden="true">
          {solution.photos.map((_, index) => (
            <i className={index === active ? "is-active" : ""} key={index} />
          ))}
        </span>
        <span className="solution-arrow">
          <ArrowUpRight size={24} />
        </span>
      </div>
      <h3 data-editor-id={`home.solutions.${solution.field}.title`}>{solution.title}</h3>
      <p data-editor-id={`home.solutions.${solution.field}.description`}>{solution.description}</p>
    </a>
  );
}

export default function SolutionCards() {
  return (
    <div className="solution-grid">
      {solutions.map((solution) => (
        <SolutionCard key={solution.id} solution={solution} />
      ))}
    </div>
  );
}
