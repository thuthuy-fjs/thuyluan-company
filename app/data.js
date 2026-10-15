export const company = {
  name: "Thúy Luân",
  legalName: "Công ty TNHH Thương mại Dịch vụ Thúy Luân",
  phone: "0965600481",
  phoneDisplay: "0965 600 481",
  email: "thuyluancompany@gmail.com",
  address: "139 Tô Vĩnh Diện, Phường Thanh Châu, Thành phố Phủ Lý, Hà Nam",
  taxId: "0700854039",
  zalo: "https://zalo.me/0965600481",
};

// Original names and photographs, preserved from the source website.
const originalNumbers = [
  21, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 1, 2,
];
export const meals = originalNumbers.map((number, index) => ({
  id: number,
  slug: `suat-an-cong-nghiep-${String(number).padStart(2, "0")}`,
  name: `Suất ăn công nghiệp ${String(number).padStart(2, "0")}`,
  image: `/assets/meal-${String(index + 1).padStart(2, "0")}.webp`,
  category: [5, 8, 15].includes(number) ? "Đổi vị" : "Khay cơm",
  description: [5, 8, 15].includes(number)
    ? "Một lựa chọn đổi vị cho thực đơn luân phiên của doanh nghiệp."
    : "Gợi ý khay cơm đa dạng cho bữa ăn hằng ngày tại doanh nghiệp.",
}));

export const gallery = Array.from({ length: 24 }, (_, i) => ({
  image: `/assets/gallery-${String(i + 1).padStart(2, "0")}.webp`,
  category:
    i < 7 ? "Giao nhận" : i < 15 || i === 21 ? "Không gian bếp" : "Phục vụ",
  title:
    i < 7
      ? "Phương tiện và hoạt động giao nhận"
      : i < 15 || i === 21
        ? "Khu vực bếp và chuẩn bị suất ăn"
        : "Bữa ăn tại doanh nghiệp",
}));

export const certificates = [
  {
    title: "Giấy chứng nhận an toàn thực phẩm",
    category: "An toàn thực phẩm",
    extension: "webp",
  },
  {
    title: "Giấy chứng nhận an toàn thực phẩm",
    category: "An toàn thực phẩm",
    extension: "webp",
  },
  {
    title: "Xác nhận tập huấn kiến thức ATTP",
    category: "Đào tạo",
    extension: "webp",
  },
  {
    title: "Đăng ký địa điểm kinh doanh",
    category: "Hồ sơ doanh nghiệp",
    extension: "webp",
  },
  {
    title: "Giấy chứng nhận đăng ký doanh nghiệp",
    category: "Hồ sơ doanh nghiệp",
    extension: "webp",
  },
  {
    title: "Thông tin đăng ký doanh nghiệp",
    category: "Hồ sơ doanh nghiệp",
    extension: "webp",
  },
  {
    title: "Đăng ký doanh nghiệp",
    category: "Hồ sơ doanh nghiệp",
    extension: "jpeg",
  },
  {
    title: "Thông tin doanh nghiệp",
    category: "Hồ sơ doanh nghiệp",
    extension: "jpeg",
  },
  {
    title: "An toàn thực phẩm",
    category: "An toàn thực phẩm",
    extension: "jpeg",
  },
].map((item, index) => ({
  ...item,
  id: `certificate-${String(index + 1).padStart(2, "0")}`,
  image: `/assets/certificate-${String(index + 1).padStart(2, "0")}.${item.extension}`,
  thumbnail: `/assets/certificate-${String(index + 1).padStart(2, "0")}-preview.webp`,
}));

export const documents = [
  {
    title: "Sơ đồ tổ chức",
    image: "/assets/document-organization.png",
    description: "Cơ cấu tổ chức và phối hợp vận hành.",
  },
  {
    title: "Giá trị phục vụ",
    image: "/assets/document-values.png",
    description: "Định hướng chất lượng và giá trị cốt lõi.",
  },
  {
    title: "Quy trình chế biến",
    image: "/assets/document-process.png",
    description: "Các bước tổ chức chế biến và phục vụ.",
  },
  {
    title: "Thiết lập bếp ăn",
    image: "/assets/document-setup.png",
    description: "Phương án tổ chức không gian bếp.",
  },
];

export const articles = [
  {
    slug: "cac-tieu-chi-cung-cap-suat-an-cong-nghiep-dat-chuan",
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
    slug: "chon-lua-va-bao-quan-dung-cach",
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
    slug: "suat-an-can-doi-ve-dinh-duong-va-hai-hoa-ve-khau-vi-la-nhu-the-nao",
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
];

export const process = [
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
];
