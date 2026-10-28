import test from "node:test";
import assert from "node:assert/strict";
import { newestGalleryFirst } from "../app/gallery-order.js";

test("new admin images appear first across categories without changing original order", () => {
  const gallery = [
    { image: "/old-a.webp", category: "Phục vụ" },
    { image: "/old-b.webp", category: "Giao nhận" },
    { image: "/first.webp", category: "Phục vụ" },
    { image: "/second.webp", category: "Phục vụ" },
  ];
  const media = [
    { id: "old-a.webp", src: "/old-a.webp" },
    { id: "old-b.webp", src: "/old-b.webp" },
    { id: "upload-first.webp", src: "/first.webp" },
    { id: "upload-other.webp", src: "/not-in-gallery.webp" },
    { id: "upload-second.webp", src: "/second.webp" },
  ];
  const sorted = newestGalleryFirst(gallery, media);
  assert.deepEqual(sorted.map((item) => item.image), ["/second.webp", "/first.webp", "/old-a.webp", "/old-b.webp"]);
  assert.deepEqual(sorted.filter((item) => item.category === "Phục vụ").map((item) => item.image), ["/second.webp", "/first.webp", "/old-a.webp"]);
  assert.equal(gallery[0].image, "/old-a.webp");
});
