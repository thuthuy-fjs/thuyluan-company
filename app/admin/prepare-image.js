// Encode before upload so previews and the published asset use the same bytes.
export async function prepareImage(file, category) {
  if (!/^image\/(?:png|jpeg|webp)$/.test(file.type) || file.size > 4_000_000)
    throw new Error("Chỉ nhận PNG, JPG hoặc WebP tối đa 4 MB mỗi ảnh.");
  const bitmap = await createImageBitmap(file);
  try {
    const documentImage = category === "Chứng chỉ – Chứng nhận";
    const maxSide = documentImage ? 2560 : 1920;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Không thể xử lý ảnh. Hãy thử lại.");
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", documentImage || category === "Logo" ? 0.95 : 0.84));
    if (!blob || blob.type !== "image/webp")
      throw new Error("Trình duyệt chưa hỗ trợ chuyển ảnh sang WebP. Hãy dùng Chrome hoặc Edge mới.");
    if (blob.size > 4_000_000) throw new Error("Ảnh sau xử lý vượt 4 MB. Hãy chọn ảnh nhỏ hơn.");
    return {
      file: new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }),
      width,
      height,
    };
  } finally {
    bitmap.close();
  }
}
