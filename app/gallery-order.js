// Admin uploads are appended to the media catalog when saved.
export function newestGalleryFirst(gallery, media) {
  const order = new Map(media.map((item, index) => [item.src, item.id.startsWith("upload-") ? index : -1]));
  return [...gallery].sort((a, b) => (order.get(b.image) ?? -1) - (order.get(a.image) ?? -1));
}
