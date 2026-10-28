"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { collectiveShowcasePhotos, galleryShowcase } from "../data";
import { Modal } from "./site";
import { editableImage, editableSliderImage } from "../editor-content";

const video = {
  src: "/assets/video-gioi-thieu-thuy-luan.mp4",
  poster: editableImage("/assets/video-gioi-thieu-thuy-luan-poster.webp"),
};

export default function GalleryCategoryShowcase({ homePage = false }) {
  const [activeImage, setActiveImage] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.documentElement.dataset.adminPreview !== "true") setActiveImage((index) => index + 1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div className="photo-grid preview gallery-category-showcase">
        {galleryShowcase.map((category) => {
          const photos =
            homePage && category.slug === "team-activities"
              ? collectiveShowcasePhotos
              : category.photos;
          return (
            <a
              className="photo-tile"
              href={`/galleries/?category=${category.slug}`}
              aria-label={`Xem thư viện ${category.label}`}
              key={category.slug}
            >
              {photos.map((photo, index) => (
                <img
                  className={`gallery-slide${index === activeImage % photos.length ? " is-active" : ""}`}
                  src={homePage ? editableSliderImage(`home.gallery.${category.slug}.${index + 1}`, photo.image) : photo.image}
                  data-editor-slider-slot={homePage ? `home.gallery.${category.slug}.${index + 1}` : undefined}
                  data-editor-slider-default={homePage ? photo.image : undefined}
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
          );
        })}
      </div>
      {homePage && (
        <>
          <button
            className="gallery-video-feature"
            type="button"
            onClick={() => setVideoOpen(true)}
            aria-label="Phát video giới thiệu Thúy Luân"
          >
            <span className="gallery-video-feature-visual">
              <img src={video.poster} alt="" width="854" height="480" loading="lazy" />
              <span className="gallery-video-play" aria-hidden="true">
                <Play size={28} fill="currentColor" />
              </span>
            </span>
            <span className="gallery-video-feature-copy">
              <span className="mini-label">VIDEO THÚY LUÂN</span>
              <strong>Những khoảnh khắc của Thúy Luân</strong>
              <span>Hoạt động phục vụ, gặp gỡ và những dấu mốc của tập thể.</span>
              <span className="gallery-video-feature-action">
                Xem video <Play size={17} aria-hidden="true" />
              </span>
            </span>
          </button>
          <Modal
            open={videoOpen}
            onClose={() => setVideoOpen(false)}
            label="Video giới thiệu Thúy Luân"
            className="gallery-video-modal"
          >
            {videoOpen && (
              <video
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster={video.poster}
              >
                <source src={video.src} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            )}
          </Modal>
        </>
      )}
    </>
  );
}
