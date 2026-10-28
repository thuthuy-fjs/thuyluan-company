"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { solutionPhotos, solutionSlideInterval } from "../solution-photos";
import { pageText } from "../editor-fields";

const solutions = [
  {
    number: "01",
    id: "nha-may",
    title: pageText["home.solutions.factory.title"],
    description: pageText["home.solutions.factory.description"],
    photos: solutionPhotos.factory,
  },
  {
    number: "02",
    id: "van-phong",
    title: pageText["home.solutions.office.title"],
    description: pageText["home.solutions.office.description"],
    photos: solutionPhotos.office,
  },
  {
    number: "03",
    id: "hop-dong",
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
      if (document.visibilityState === "visible") {
        setActive((index) => (index + 1) % solution.photos.length);
      }
    }, solutionSlideInterval);

    return () => window.clearInterval(interval);
  }, [solution.photos.length]);

  return (
    <a
      href={`/giai-phap/#${solution.id}`}
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
              src={photo.src}
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
      <h3>{solution.title}</h3>
      <p>{solution.description}</p>
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
