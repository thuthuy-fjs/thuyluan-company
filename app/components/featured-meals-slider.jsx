"use client";

import { useEffect, useRef, useState } from "react";
import { meals } from "../data";
import { MealCard } from "./site";

const sortedMeals = [...meals].sort((a, b) => a.id - b.id);
const slideInterval = 5000;
const fadeDuration = 600;

function getGroup(slide, count) {
  const start = (slide * count) % sortedMeals.length;
  return Array.from(
    { length: count },
    (_, index) => sortedMeals[(start + index) % sortedMeals.length],
  );
}

export default function FeaturedMealsSlider() {
  const [mobile, setMobile] = useState(false);
  const [slide, setSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const nextGrid = useRef(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const count = mobile ? 3 : 6;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let waiting = false;
    const images = [...(nextGrid.current?.querySelectorAll("img") || [])];
    const ready = Promise.all(images.map((image) => image.decode().catch(() => {})));
    const interval = window.setInterval(async () => {
      if (document.visibilityState !== "visible" || waiting) return;
      waiting = true;
      await ready;
      if (!cancelled) setTransitioning(true);
    }, slideInterval);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [slide, count]);

  useEffect(() => {
    if (!transitioning) return;
    const timeout = window.setTimeout(() => {
      setSlide((current) => current + 1);
      setTransitioning(false);
    }, fadeDuration);
    return () => window.clearTimeout(timeout);
  }, [transitioning]);

  return (
    <div
      className="featured-meals-slider"
      role="group"
      aria-label="Các mẫu thực đơn tham khảo"
      aria-live="off"
      data-slide={slide}
      data-count={count}
    >
      <div
        className={`featured-meals ${transitioning ? "is-outgoing" : "is-current"}`}
        key={`${count}-${slide}`}
        aria-hidden={transitioning}
        inert={transitioning || undefined}
      >
        {getGroup(slide, count).map((meal) => (
          <MealCard key={meal.id} meal={meal} loading="eager" />
        ))}
      </div>
      <div
        className={`featured-meals ${transitioning ? "is-incoming" : "is-next"}`}
        key={`${count}-${slide + 1}`}
        ref={nextGrid}
        aria-hidden={!transitioning}
        inert={!transitioning || undefined}
      >
        {getGroup(slide + 1, count).map((meal) => (
          <MealCard key={meal.id} meal={meal} loading="eager" />
        ))}
      </div>
    </div>
  );
}
