import uploadedGallery from "./gallery-uploaded.json";
import mediaCatalog from "./media-catalog.json";
import { galleryCategories as galleryGroupNames } from "./media-groups";
import { editableData, editableImage, editorContent } from "./editor-content";

export const company = editableData("Công ty", {
  name: "Thúy Luân",
  legalName: "Công ty TNHH Thương mại Dịch vụ Thúy Luân",
  phone: "0965600481",
  phoneDisplay: "0965 600 481",
  email: "thuyluancompany@gmail.com",
  address: "139 Tô Vĩnh Diện, TDP 12, Phường Phủ Lý, Tỉnh Ninh Bình, Việt Nam",
  taxId: "0700854039",
  zalo: "https://zalo.me/0965600481",
}, "company");

// Preserve the existing menu names and use supplied photos where available.
const originalNumbers = Array.from({ length: 22 }, (_, i) => i + 1);
// Meals 19-22 use the supplied photos meal-01..04 in their original order.
const supplyPhotoNumbers = { 21: 1, 22: 2, 20: 3, 19: 4 };
export const meals = editableData("Thực đơn", originalNumbers.map((number) => ({
  id: number,
  slug: `industrial-meal-${String(number).padStart(2, "0")}`,
  name: `Suất ăn công nghiệp ${String(number).padStart(2, "0")}`,
  image:
    number <= 18
      ? `/assets/menu-photo-2026-${String(number).padStart(2, "0")}.webp`
      : `/assets/meal-${String(supplyPhotoNumbers[number]).padStart(2, "0")}.webp`,
  description: "Gợi ý suất ăn cho thực đơn luân phiên của doanh nghiệp.",
})), "meals");

const originalGallery = [
  ...Array.from({ length: 24 }, (_, i) => ({
    image: `/assets/gallery-${String(i + 1).padStart(2, "0")}.webp`,
    category:
      i < 7 ? "Giao nhận" : i < 15 || i === 21 ? "Không gian bếp" : "Phục vụ",
    title:
      i < 7
        ? "Phương tiện và hoạt động giao nhận"
        : i < 15 || i === 21
          ? "Khu vực bếp và chuẩn bị suất ăn"
          : "Bữa ăn tại doanh nghiệp",
  })),
];

const galleryDetails = [...uploadedGallery, ...originalGallery, ...(editorContent.galleryAdditions || [])];
const galleryDetailsByImage = new Map(galleryDetails.map((photo) => [photo.image, photo]));
const galleryMediaByImage = new Map(mediaCatalog.filter((item) => galleryGroupNames.includes(item.category)).map((item) => [item.src, item]));
const galleryImages = [...new Set([...galleryDetails.map((photo) => photo.image), ...galleryMediaByImage.keys()])];
export const gallery = editableData("Thư viện ảnh", galleryImages
  .map((image) => galleryMediaByImage.get(image))
  .filter(Boolean)
  .map((item) => ({
    ...galleryDetailsByImage.get(item.src),
    image: item.src,
    category: item.category,
    title: item.title || galleryDetailsByImage.get(item.src)?.title || item.id,
    width: item.width,
    height: item.height,
  })), "gallery");
export const galleryCategories = [
  { label: "Không gian bếp", slug: "kitchen" },
  { label: "Giao nhận", slug: "delivery" },
  { label: "Phục vụ", slug: "service" },
  { label: "Hoạt động tập thể", slug: "team-activities" },
];
const galleryShowcaseOrder = ["service", "kitchen", "team-activities", "delivery"];
export const collectiveShowcasePhotos = [
  "/assets/gallery-tap-the-01.webp",
  "/assets/gallery-tap-the-02.webp",
  "/assets/gallery-tap-the-03.webp",
  "/assets/gallery-tap-the-09.webp",
  "/assets/gallery-tap-the-18.webp",
].map((image) => gallery.find((photo) => photo.image === image)).filter(Boolean);
export const galleryShowcase = galleryShowcaseOrder.map((slug) => {
  const category = galleryCategories.find((item) => item.slug === slug);
  const photos = gallery.filter((photo) => photo.category === category.label);
  return {
    ...category,
    photos: Array.from({ length: 5 }, (_, index) =>
      photos[Math.round((index * (photos.length - 1)) / 4)],
    ),
  };
});
export const galleryPreview = [24, 14, 17, 7].map((number) => gallery.find((photo) => photo.image === `/assets/gallery-${String(number).padStart(2, "0")}.webp`)).filter(Boolean);

export const homePosters = editableData("Ấn phẩm", [
  {
    id: "home-food-service-banner",
    title: "Giới thiệu dịch vụ Thúy Luân",
    category: "Giới thiệu",
    width: 1280,
    height: 404,
    featured: true,
  },
  {
    id: "home-services-poster",
    title: "Suất ăn cho văn phòng, nhà máy và trường học",
    category: "Dịch vụ",
    width: 1280,
    height: 1280,
  },
  {
    id: "home-catering-poster",
    title: "Ấn phẩm suất ăn công nghiệp",
    category: "Dịch vụ",
    width: 1280,
    height: 640,
  },
  {
    id: "home-menu-30-days",
    title: "Ấn phẩm thực đơn 30 ngày",
    category: "Thực đơn",
    width: 1280,
    height: 1280,
  },
  {
    id: "home-food-menu-poster",
    title: "Ấn phẩm thực đơn Thúy Luân",
    category: "Thực đơn",
    width: 1280,
    height: 1280,
  },
  {
    id: "home-core-values",
    title: "Giá trị cốt lõi của Thúy Luân",
    category: "Giá trị",
    width: 1280,
    height: 720,
  },
  {
    id: "home-nutrition-guide",
    title: "Thông tin dinh dưỡng và định lượng",
    category: "Dinh dưỡng",
    width: 905,
    height: 1280,
  },
].map((poster) => ({ ...poster, image: `/assets/${poster.id}.jpg` })), "homePosters");

const existingCertificates = [
  {
    id: "certificate-02",
    title: "Giấy chứng nhận ATTP · địa điểm Phủ Lý (2023)",
    category: "Hồ sơ lưu trữ",
    extension: "webp",
  },
  {
    id: "certificate-09",
    title: "Giấy chứng nhận ATTP · địa điểm Đồng Văn (2023)",
    category: "Hồ sơ lưu trữ",
    extension: "jpeg",
  },
  {
    id: "certificate-03",
    title: "Xác nhận tập huấn kiến thức ATTP (2023)",
    category: "Đào tạo",
    extension: "webp",
  },
  {
    id: "certificate-01",
    title: "Giấy chứng nhận ATTP · địa điểm Phủ Lý (2021)",
    category: "Hồ sơ lưu trữ",
    extension: "webp",
  },
  {
    id: "certificate-04",
    title: "Đăng ký địa điểm kinh doanh số 01 (2021)",
    category: "Hồ sơ doanh nghiệp",
    extension: "webp",
  },
].map((item) => ({
  ...item,
  image: `/assets/${item.id}.${item.extension}`,
  thumbnail: `/assets/${item.id}-preview.webp`,
}));

const isoPage = (id, title) => ({
  title,
  image: `/assets/${id}.webp`,
});

const isoCertificates = [
  {
    id: "iso22000-head-office",
    title: "ISO 22000:2018 · trụ sở chính",
    pages: [
      isoPage("iso22000-head-office-vi", "Giấy chứng nhận (tiếng Việt)"),
      isoPage("iso22000-head-office-en", "Giấy chứng nhận (tiếng Anh)"),
      isoPage("iso22000-head-office-decision", "Quyết định chứng nhận"),
    ],
  },
  {
    id: "iso22000-dong-van",
    title: "ISO 22000:2018 · bếp Đồng Văn",
    pages: [
      isoPage("iso22000-dong-van-vi", "Giấy chứng nhận (tiếng Việt)"),
      isoPage("iso22000-dong-van-en", "Giấy chứng nhận (tiếng Anh)"),
      isoPage("iso22000-dong-van-decision", "Quyết định chứng nhận"),
    ],
  },
  {
    id: "iso22000-chau-son",
    title: "ISO 22000:2018 · các điểm Châu Sơn",
    pages: [
      isoPage("iso22000-chau-son-vi", "Giấy chứng nhận (tiếng Việt)"),
      isoPage("iso22000-chau-son-en", "Giấy chứng nhận (tiếng Anh)"),
      isoPage("iso22000-chau-son-decision", "Quyết định chứng nhận"),
    ],
  },
].map((certificate) => ({
  ...certificate,
  category: "ISO 22000 · 3 trang",
  image: certificate.pages[0].image,
  thumbnail: certificate.pages[0].image.replace(".webp", "-preview.webp"),
}));

const newCertificates = [
  ...isoCertificates,
  {
    id: "food-safety-site-04-2026",
    title: "Giấy chứng nhận ATTP · địa điểm Phủ Lý (2026)",
    category: "An toàn thực phẩm",
    image: "/assets/food-safety-site-04-2026.webp",
    thumbnail: "/assets/food-safety-site-04-2026-preview.webp",
  },
];

export const certificates = editableData("Chứng nhận", [
  {
    id: "business-registration-2026",
    title: "Giấy chứng nhận đăng ký doanh nghiệp",
    category: "Hồ sơ doanh nghiệp",
    image: "/assets/business-registration-2026.webp",
    thumbnail: "/assets/business-registration-2026-preview.webp",
  },
  ...newCertificates,
  ...existingCertificates,
], "certificates");

export const documents = editableData("Tài liệu", [
  {
    title: "Sơ đồ tổ chức",
    image: "/assets/document-organization.png",
    description: "Cơ cấu tổ chức và phối hợp vận hành.",
  },
  {
    title: "Quy trình chế biến",
    description: "Xem 5 bước chế biến và cách thực hiện từng bước.",
    href: "/about/#quy-trinh-che-bien",
  },
  {
    title: "Thiết lập bếp ăn",
    description: "Phương án tổ chức không gian bếp.",
    href: "/about/#quy-trinh-thiet-lap-bep",
  },
], "documents");

export const articles = editableData("Bài viết", [
  {
    slug: "standard-industrial-meal-supply-criteria",
    title: "Doanh nghiệp nên đánh giá nhà cung cấp suất ăn như thế nào?",
    category: "Lựa chọn đối tác",
    image: "/assets/news-quality.webp",
    excerpt:
      "Những yếu tố cần trao đổi trước khi bắt đầu một hợp đồng cung ứng suất ăn.",
    sections: [
      [
        "Bắt đầu từ nhu cầu vận hành",
        "Số lượng suất, lịch ca, vị trí phục vụ và ngân sách là cơ sở để xây dựng phương án phù hợp. Doanh nghiệp nên trao đổi cả nhu cầu thường ngày và các thời điểm có thể thay đổi sản lượng.",
      ],
      [
        "Đánh giá quy trình, không chỉ thực đơn",
        "Hãy đề nghị nhà cung cấp giới thiệu nguồn nguyên liệu, khu vực chế biến, cách tổ chức giao nhận và quy trình tiếp nhận phản hồi. Các hồ sơ, chứng nhận và phạm vi áp dụng cần được kiểm tra trực tiếp trong quá trình thẩm định.",
      ],
      [
        "Thống nhất tiêu chí nghiệm thu",
        "Chất lượng cảm quan, định lượng, thời gian phục vụ và cách xử lý tình huống nên được trao đổi cụ thể. Đây là những nội dung giúp hai bên có cùng cách đánh giá trong suốt quá trình hợp tác.",
      ],
      [
        "Dùng thử và hoàn thiện phương án",
        "Một buổi khảo sát hoặc trao đổi thực đơn mẫu giúp làm rõ khẩu vị của người lao động và điều kiện phục vụ tại doanh nghiệp. Kết quả trao đổi là cơ sở để hoàn thiện phương án và hợp đồng.",
      ],
    ],
  },
  {
    slug: "proper-food-selection-and-storage",
    title: "Từ nguyên liệu đến bữa ăn: những điểm cần quan tâm",
    category: "Chất lượng bữa ăn",
    image: "/assets/news-storage.webp",
    excerpt:
      "Chất lượng bữa ăn được hình thành từ nhiều bước trong quá trình chuẩn bị và phục vụ.",
    sections: [
      [
        "Lựa chọn nguyên liệu phù hợp",
        "Một thực đơn tốt bắt đầu từ việc lựa chọn nguyên liệu phù hợp với nhu cầu phục vụ. Đối tác cần trao đổi rõ yêu cầu về xuất xứ, khả năng truy xuất và tiêu chí tiếp nhận nguyên liệu.",
      ],
      [
        "Sắp xếp bảo quản và chế biến",
        "Nguyên liệu cần được phân loại và bố trí theo quy trình của cơ sở. Khi khảo sát nhà cung cấp, doanh nghiệp có thể đề nghị giới thiệu khu vực tiếp nhận, bảo quản, sơ chế và chế biến.",
      ],
      [
        "Chú trọng khâu giao nhận",
        "Điều kiện vận chuyển, thời gian phục vụ và cách bàn giao đều ảnh hưởng tới trải nghiệm bữa ăn. Phương án giao nhận cần phù hợp khoảng cách, ca làm việc và điều kiện thực tế tại nơi phục vụ.",
      ],
    ],
  },
  {
    slug: "balanced-nutritious-and-tasty-meals",
    title: "Thực đơn đa dạng để mỗi giờ nghỉ trưa thêm trọn vẹn",
    category: "Thực đơn doanh nghiệp",
    image: "/assets/news-nutrition.webp",
    excerpt:
      "Xây dựng thực đơn luân phiên phù hợp với ngân sách, ca làm việc và khẩu vị tập thể.",
    sections: [
      [
        "Đa dạng trong từng tuần",
        "Việc luân phiên nhóm nguyên liệu và cách chế biến giúp bữa ăn bớt lặp lại. Doanh nghiệp có thể trao đổi với nhà cung cấp về lịch thực đơn và cách lấy ý kiến người dùng bữa.",
      ],
      [
        "Phù hợp với người lao động",
        "Đặc thù công việc, ca làm việc và khẩu vị tập thể cần được xem xét khi xây dựng thực đơn. Những yêu cầu riêng về dị ứng hoặc chế độ ăn cần được thông báo trước để đánh giá khả năng đáp ứng.",
      ],
      [
        "Ngân sách rõ ràng, phối hợp thuận lợi",
        "Thống nhất ngân sách và cấu phần của suất ăn giúp nhà cung cấp xây dựng đề xuất rõ ràng. Phản hồi định kỳ là cơ sở điều chỉnh món ăn và cải thiện trải nghiệm phục vụ.",
      ],
    ],
  },
], "articles");

export const coreValues = editableData("Giá trị cốt lõi", [
  {
    title: "Tận tâm",
    text: "Làm việc bằng sự tận tụy, nhiệt tình và tâm huyết.",
  },
  {
    title: "Đạo đức",
    text: "Liêm chính, trung thực trong ứng xử và trong tất cả các giao dịch.",
  },
  {
    title: "Tôn trọng",
    text: "Tôn trọng khách hàng, tôn trọng đối tác, tôn trọng người lao động.",
  },
  {
    title: "Tuân thủ",
    text: "Tuân thủ luật pháp, bộ quy tắc ứng xử, các quy chế, chính sách của Nhà nước.",
  },
], "coreValues");

export const process = editableData("Quy trình", [
  [
    "01",
    "Lắng nghe nhu cầu",
    "Trao đổi số lượng suất, ca làm việc, địa điểm và ngân sách của doanh nghiệp.",
  ],
  [
    "02",
    "Đề xuất phương án",
    "Cùng xem xét thực đơn, hình thức cung ứng và cách phối hợp phục vụ.",
  ],
  [
    "03",
    "Thống nhất hợp đồng",
    "Làm rõ phạm vi, lịch phục vụ, tiêu chí chất lượng và trách nhiệm hai bên.",
  ],
  [
    "04",
    "Đồng hành vận hành",
    "Phối hợp giao nhận, tiếp nhận phản hồi và điều chỉnh trong quá trình phục vụ.",
  ],
], "process");
