"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { meals } from "../data";
import { MealCard } from "./site";

const sortedMeals = [...meals].sort((a, b) => a.id - b.id);
const slideInterval = 5000;
const fadeDuration = 600;

function getGroup(slide, count) {
  const total = sortedMeals.length;
  const start = (((slide * count) % total) + total) % total;
  return Array.from(
    { length: count },
    (_, index) => sortedMeals[(start + index) % sortedMeals.length],
  );
}

export default function FeaturedMealsSlider() {
  const [mobile, setMobile] = useState(false);
  const [slide, setSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);
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
    if (transitioning) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let waiting = false;
    const images = [...(nextGrid.current?.querySelectorAll("img") || [])];
    const ready = Promise.all(
      images.map((image) => image.decode().catch(() => {})),
    );
    const interval = window.setInterval(async () => {
      if (document.visibilityState !== "visible" || waiting) return;
      waiting = true;
      await ready;
      if (cancelled) return;
      setDirection(1);
      setTransitioning(true);
    }, slideInterval);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [slide, count, transitioning]);

  useEffect(() => {
    if (!transitioning) return;
    const timeout = window.setTimeout(() => {
      setSlide((current) => current + direction);
      setTransitioning(false);
    }, fadeDuration);
    return () => window.clearTimeout(timeout);
  }, [transitioning, direction]);

  // Manual navigation restarts the 5s autoplay because `slide` changes.
  const go = (step) => {
    if (transitioning) return;
    setDirection(step);
    setTransitioning(true);
  };
  const incoming = slide + (transitioning ? direction : 1);

  return (
    <div className="featured-meals-carousel">
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
          key={`${count}-${incoming}`}
          ref={nextGrid}
          aria-hidden={!transitioning}
          inert={!transitioning || undefined}
        >
          {getGroup(incoming, count).map((meal) => (
            <MealCard key={meal.id} meal={meal} loading="eager" />
          ))}
        </div>
      </div>
      <button
        type="button"
        className="featured-meals-nav is-prev"
        aria-label="Xem nhóm thực đơn trước"
        onClick={() => go(-1)}
      >
        <ChevronLeft size={40} strokeWidth={1.25} />
      </button>
      <button
        type="button"
        className="featured-meals-nav is-next"
        aria-label="Xem nhóm thực đơn tiếp theo"
        onClick={() => go(1)}
      >
        <ChevronRight size={40} strokeWidth={1.25} />
      </button>
    </div>
  );
}
