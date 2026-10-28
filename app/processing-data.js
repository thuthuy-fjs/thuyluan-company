import { editableData, editableImage } from "./editor-content";

const groups = [
  {
    title: "Khu sống",
    steps: [
      {
        number: "01",
        title: "Nhận nguyên liệu",
        image: editableImage("/assets/gallery-07.webp"),
        imageAlt: "Xe giao nguyên liệu tại cơ sở Thúy Luân",
        highlights: ["Kiểm tra cảm quan, test nhanh", "Cân, đếm; kiểm hạn dùng, chứng từ"],
        actions: [
          "Quan sát màu sắc, trạng thái và mùi của nguyên liệu; thực hiện test nhanh với những mặt hàng cần kiểm tra.",
          "Cân hoặc đếm số lượng thực nhận, đối chiếu với đơn đặt hàng và chứng từ giao hàng.",
          "Kiểm tra tên hàng, đơn vị cung cấp, hạn sử dụng và thông tin xuất xứ trước khi tiếp nhận.",
          "Chuyển nguyên liệu đạt yêu cầu đến khu sơ chế hoặc khu bảo quản phù hợp.",
        ],
      },
      {
        number: "02",
        title: "Rã đông an toàn",
        image: editableImage("/assets/gallery-co-so-19.webp"),
        imageAlt: "Khu bảo quản lạnh tại cơ sở Thúy Luân",
        highlights: ["Tủ mát 0–5°C, thực phẩm bọc kín", "Không rã đông ở nhiệt độ thường hoặc cấp đông lại"],
        actions: [
          "Đưa thực phẩm đông lạnh còn bọc kín vào tủ mát 0–5°C và sắp xếp tách biệt với thực phẩm khác.",
          "Ghi nhận thời điểm bắt đầu, kết thúc rã đông và kiểm tra trạng thái thực phẩm trước khi chế biến.",
          "Khi áp dụng cách rã đông bằng nước chảy theo quy trình, giữ thực phẩm trong bao bì kín và kiểm soát thời gian.",
          "Không rã đông ở nhiệt độ thường và không cấp đông lại thực phẩm đã rã đông.",
        ],
      },
      {
        number: "03",
        title: "Sơ chế riêng từng loại",
        image: editableImage("/assets/gallery-so-che-02.webp"),
        imageAlt: "Khu sơ chế và bồn rửa nguyên liệu tại bếp Thúy Luân",
        highlights: ["Rau rửa 3 lần nước sạch", "Thịt, cá dùng khu vực và dụng cụ riêng"],
        actions: [
          "Loại bỏ phần rau hỏng, rễ và tạp chất; rửa rau 3 lần bằng nước sạch.",
          "Làm sạch thịt, cá; cắt thái theo yêu cầu của từng món trong thực đơn.",
          "Sử dụng dao, thớt và khu vực sơ chế riêng cho từng nhóm nguyên liệu.",
          "Đựng nguyên liệu đã sơ chế trong dụng cụ phù hợp, chuyển sang khu chế biến và vệ sinh dụng cụ sau khi dùng.",
        ],
      },
    ],
  },
  {
    title: "Khu chín",
    steps: [
      {
        number: "04",
        title: "Nấu và chiên",
        image: editableImage("/assets/gallery-bep-08.webp"),
        imageAlt: "Thiết bị và khu nấu ăn tại bếp Thúy Luân",
        highlights: ["Nấu cơm, chế biến theo thực đơn", "Kiểm tra dầu chiên hằng ngày"],
        actions: [
          "Kiểm tra gạo, thiết bị nấu và loại bỏ dị vật trước khi vo, đong nước và nấu cơm.",
          "Chuẩn bị nguyên liệu, định lượng và chế biến từng món theo thực đơn đã thống nhất.",
          "Kiểm tra tình trạng dầu chiên hằng ngày trước khi sử dụng.",
          "Theo dõi quá trình nấu, kiểm tra món đã chín trước khi chuyển sang công đoạn ra đồ.",
        ],
      },
      {
        number: "05",
        title: "Kiểm soát ra đồ chín",
        image: editableImage("/assets/gallery-thuc-don-01.webp"),
        imageAlt: "Suất ăn hoàn thiện trên khay phục vụ",
        highlights: ["Bếp trưởng kiểm tra cảm quan", "Sàng lọc dị vật; che đậy, giữ nóng phù hợp"],
        actions: [
          "Bếp trưởng kiểm tra màu sắc, mùi và vị của món ăn trước khi đưa ra phục vụ.",
          "Nhân sự phụ trách dinh dưỡng quan sát, sàng lọc dị vật trong thành phẩm.",
          "Chuyển món ăn bằng dụng cụ sạch, tách biệt với khu nguyên liệu sống và che đậy sau khi hoàn thiện.",
          "Giữ nóng món cần phục vụ nóng; với món lạnh, làm nguội phù hợp trước khi đậy kín.",
        ],
      },
    ],
  },
];

export const processingGroups = editableData("Quy trình chế biến", groups.map((group, index) => ({
  ...group, id: `zone-${index + 1}`, steps: group.steps.map((step) => ({ ...step, id: step.number })),
})), "about.processing.groups");

export const processingText = editableData("Quy trình chế biến", {
  eyebrow: "QUY TRÌNH CHẾ BIẾN",
  heading1: "Từ nguyên liệu",
  heading2: "đến món ăn.",
  description: "Năm bước kiểm soát xuyên suốt từ khu sống đến khu chín. Chọn từng bước để xem cách thực hiện.",
  actionHeading: "Cách thực hiện",
  openPrompt: "Xem chi tiết",
  closePrompt: "Thu gọn",
  reminders: ["Phân tách sống – chín", "Vệ sinh dụng cụ", "Kiểm soát từng công đoạn"],
}, "about.processing.text");