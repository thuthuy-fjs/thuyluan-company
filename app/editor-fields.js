import { editableText } from "./editor-content";

const defaults = {
  "Trang chủ": {
    "home.hero.eyebrow": "GIẢI PHÁP SUẤT ĂN CHO DOANH NGHIỆP",
    "home.hero.line1": "Thực đơn lành mạnh",
    "home.hero.line2": "Đầy đủ dinh dưỡng",
    "home.hero.line3": "Đa dạng món ăn",
    "home.hero.description": "Giải pháp suất ăn công nghiệp chú trọng chất lượng, sự linh hoạt và trải nghiệm phục vụ, phù hợp với nhịp vận hành của doanh nghiệp.",
    "home.hero.origin": "Thực đơn linh hoạt · Hợp tác dài hạn · Tư vấn theo nhu cầu",
    "home.hero.slide1.alt": "Thực đơn 30 ngày không trùng lặp của Thúy Luân",
    "home.hero.slide2.alt": "Suất ăn Thúy Luân cho văn phòng, nhà máy và trường học",
    "home.hero.slide3.alt": "Ấn phẩm thực đơn suất ăn công nghiệp Thúy Luân",
    "home.intro": "Chúng tôi tin rằng bữa ăn được chăm chút là một phần của doanh nghiệp phát triển bền vững.",
    "home.solutions.heading1": "Mỗi doanh nghiệp một nhịp.",
    "home.solutions.heading2": "Mỗi bữa ăn một giải pháp.",
    "home.solutions.description": "Hiểu đặc thù công việc, lắng nghe nhu cầu thực tế và cùng xây dựng phương án cung ứng phù hợp.",
    "home.solutions.factory.title": "Suất ăn nhà máy",
    "home.solutions.factory.description": "Phối hợp theo ca sản xuất, số lượng lao động và điều kiện phục vụ thực tế.",
    "home.solutions.office.title": "Suất ăn văn phòng",
    "home.solutions.office.description": "Thực đơn đa dạng cho giờ nghỉ trưa, phù hợp với khẩu vị và ngân sách tập thể.",
    "home.solutions.contract.title": "Cung ứng theo hợp đồng",
    "home.solutions.contract.description": "Làm rõ phương án, quy trình phối hợp và tiêu chí chất lượng để đồng hành dài hạn.",
    "home.mission": "Mang đến những bữa ăn sạch, ngon, an toàn và chất lượng, trao tận tay từng khách hàng.",
    "home.vision": "Trở thành đơn vị cung ứng suất ăn công nghiệp uy tín, đối tác tin cậy đồng hành lâu dài cùng doanh nghiệp.",
    "home.meals.heading1": "Bữa ăn ngon.",
    "home.meals.heading2": "Thêm năng lượng mới.",
  },
  "Giải pháp": {
    "solutions.intro.description": "Bắt đầu từ nhu cầu thực tế để cùng thiết kế phương án suất ăn phù hợp với từng doanh nghiệp.",
    "solutions.process.heading": "Rõ ràng trong từng bước.",
  },
  "Giới thiệu": {
    "about.intro.description": "Từ năm 2021, Thúy Luân hoạt động trong lĩnh vực cung ứng thực phẩm và suất ăn công nghiệp tại Ninh Bình và khu vực miền Bắc.",
    "about.intro.heading1": "Hiểu giá trị của",
    "about.intro.heading2": "một bữa ăn được chăm chút.",
    "about.organization.description": "Từ Tổng giám đốc đến các tổ nấu, sơ chế và phục vụ, mỗi bộ phận có vai trò riêng để bữa ăn được chuẩn bị đúng quy trình.",
    "about.slider.1.alt": "Hoạt động phục vụ bữa ăn tại doanh nghiệp",
    "about.slider.2.alt": "Thiết bị bếp công nghiệp Thúy Luân",
    "about.slider.3.alt": "Bữa ăn tại nhà ăn của doanh nghiệp",
    "about.slider.4.alt": "Nhân viên Thúy Luân tham gia buổi đào tạo",
    "about.slider.5.alt": "Hoạt động Gala Dinner Thúy Luân",
  },
  "Liên hệ": {
    "contact.intro.description": "Chia sẻ nhu cầu để cùng Thúy Luân xây dựng phương án suất ăn phù hợp với doanh nghiệp.",
    "contact.sidebar.description": "Đội ngũ Thúy Luân sẽ cùng doanh nghiệp trao đổi về thực đơn, ngân sách và cách phối hợp phục vụ.",
    "contact.tip": "Địa điểm, số suất mỗi ngày, ca phục vụ và ngân sách dự kiến sẽ giúp hai bên đi nhanh hơn tới một phương án phù hợp.",
  },
};

export const pageText = Object.fromEntries(
  Object.entries(defaults).flatMap(([section, values]) =>
    Object.entries(values).map(([id, value]) => [id, editableText(id, value, section)]),
  ),
);
