export const legacyRedirects = {
  "/product-category/suat-an-cong-nghiep": "/thuc-don/",
  "/category/tin-tuc": "/tin-tuc/",
  "/mua": "/thuc-don/",
  "/mua/suat-an-cong-nghiep-13-2": "/thuc-don/suat-an-cong-nghiep-21/",
  "/mua/suat-an-cong-nghiep-14-2": "/thuc-don/suat-an-cong-nghiep-22/",
  "/mua/suat-an-cong-nghiep-07-2": "/thuc-don/suat-an-cong-nghiep-08/",
  ...Object.fromEntries(
    Array.from({ length: 22 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return [
        `/mua/suat-an-cong-nghiep-${n}`,
        `/thuc-don/suat-an-cong-nghiep-${n}/`,
      ];
    }),
  ),
  "/cac-tieu-chi-cung-cap-suat-an-cong-nghiep-dat-chuan":
    "/tin-tuc/cac-tieu-chi-cung-cap-suat-an-cong-nghiep-dat-chuan/",
  "/chon-lua-va-bao-quan-dung-cach": "/tin-tuc/chon-lua-va-bao-quan-dung-cach/",
  "/suat-an-can-doi-ve-dinh-duong-va-hai-hoa-ve-khau-vi-la-nhu-the-nao":
    "/tin-tuc/suat-an-can-doi-ve-dinh-duong-va-hai-hoa-ve-khau-vi-la-nhu-the-nao/",
};
