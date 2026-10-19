import { ChevronDown } from "lucide-react";
import { Eyebrow } from "./site";

const groups = [
  {
    title: "Khu sống",
    steps: [
      {
        number: "01",
        title: "Nhận nguyên liệu",
        image: "/assets/gallery-07.webp",
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
        image: "/assets/gallery-co-so-19.webp",
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
        image: "/assets/gallery-so-che-02.webp",
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
        image: "/assets/gallery-bep-08.webp",
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
        image: "/assets/gallery-thuc-don-01.webp",
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

export default function ProcessingSteps() {
  return (
    <section id="quy-trinh-che-bien" className="processing-section wrap" aria-labelledby="processing-title">
      <div className="processing-heading">
        <div>
          <Eyebrow>QUY TRÌNH CHẾ BIẾN</Eyebrow>
          <h2 id="processing-title">
            Từ nguyên liệu
            <br />
            đến món ăn.
          </h2>
        </div>
        <p>
          Năm bước kiểm soát xuyên suốt từ khu sống đến khu chín. Chọn từng bước
          để xem cách thực hiện.
        </p>
      </div>

      {groups.map((group) => (
        <div className="processing-group" key={group.title}>
          <h3 className="processing-zone"><span>{group.title}</span></h3>
          <div className="processing-list">
            {group.steps.map((step) => (
              <details className="processing-step" key={step.number}>
                <summary>
                  <span className="processing-step-photo">
                    <img src={step.image} alt={step.imageAlt} loading="lazy" />
                    <span className="processing-step-number" aria-hidden="true">{step.number}</span>
                  </span>
                  <span className="processing-step-overview">
                    <span className="processing-step-title">{step.title}</span>
                    <span className="processing-step-highlights">
                      {step.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
                    </span>
                    <span className="processing-step-prompt">
                      <span className="processing-prompt-open">Xem chi tiết</span>
                      <span className="processing-prompt-close">Thu gọn</span>
                      <ChevronDown size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                  </span>
                </summary>
                <div className="processing-step-detail">
                  <h4>Cách thực hiện</h4>
                  <ol>
                    {step.actions.map((action) => <li key={action}>{action}</li>)}
                  </ol>
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}

      <p className="processing-reminder">
        <span>Phân tách sống – chín</span>
        <span>Vệ sinh dụng cụ</span>
        <span>Kiểm soát từng công đoạn</span>
      </p>
    </section>
  );
}
