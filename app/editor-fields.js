import { editableText } from "./editor-content";

const defaults = {
  "Trang chủ": {
    "home.meals.description": "Khám phá hình ảnh suất ăn thực tế. Thực đơn và phương án phục vụ được trao đổi theo nhu cầu từng doanh nghiệp.",
    "home.process.heading1": "Rõ ràng từ bước đầu.",
    "home.process.heading2": "Gắn kết trong dài hạn.",
    "home.gallery.heading1": "Nhìn gần hơn.",
    "home.gallery.heading2": "Tin tưởng nhiều hơn.",
    "home.documents.heading1": "Minh bạch quy trình.",
    "home.documents.heading2": "Thuận lợi thẩm định.",
    "home.documents.description": "Khám phá tài liệu giới thiệu và quy trình từ Thúy Luân. Liên hệ để trao đổi hồ sơ và yêu cầu đánh giá cụ thể của doanh nghiệp.",
    "home.hero.eyebrow": "GIẢI PHÁP SUẤT ĂN CHO DOANH NGHIỆP",
    "home.hero.line1": "Thực đơn lành mạnh",
    "home.hero.line2": "Đầy đủ dinh dưỡng",
    "home.hero.line3": "Đa dạng món ăn",
    "home.hero.description":
      "Giải pháp suất ăn công nghiệp chú trọng chất lượng, sự linh hoạt và trải nghiệm phục vụ, phù hợp với nhịp vận hành của doanh nghiệp.",
    "home.hero.origin":
      "Thực đơn linh hoạt · Hợp tác dài hạn · Tư vấn theo nhu cầu",
    "home.hero.slide1.alt": "Thực đơn 30 ngày không trùng lặp của Thúy Luân",
    "home.hero.slide2.alt":
      "Suất ăn Thúy Luân cho văn phòng, nhà máy và trường học",
    "home.hero.slide3.alt": "Ấn phẩm thực đơn suất ăn công nghiệp Thúy Luân",
    "home.intro":
      "Chúng tôi tin rằng bữa ăn được chăm chút là một phần của doanh nghiệp phát triển bền vững.",
    "home.facts.foundedYear": "2019",
    "home.facts.menuCount": "40+",
    "home.facts.serviceArea": "Miền Bắc",
    "home.solutions.heading1": "Mỗi doanh nghiệp một nhịp.",
    "home.solutions.heading2": "Mỗi bữa ăn một giải pháp.",
    "home.solutions.description":
      "Hiểu đặc thù công việc, lắng nghe nhu cầu thực tế và cùng xây dựng phương án cung ứng phù hợp.",
    "home.solutions.factory.title": "Suất ăn nhà máy",
    "home.solutions.factory.description":
      "Phối hợp theo ca sản xuất, số lượng lao động và điều kiện phục vụ thực tế.",
    "home.solutions.office.title": "Suất ăn văn phòng",
    "home.solutions.office.description":
      "Thực đơn đa dạng cho giờ nghỉ trưa, phù hợp với khẩu vị và ngân sách tập thể.",
    "home.solutions.contract.title": "Cung ứng theo hợp đồng",
    "home.solutions.contract.description":
      "Làm rõ phương án, quy trình phối hợp và tiêu chí chất lượng để đồng hành dài hạn.",
    "home.mission":
      "Mang đến những bữa ăn sạch, ngon, an toàn và chất lượng, trao tận tay từng khách hàng.",
    "home.vision":
      "Trở thành đơn vị cung ứng suất ăn công nghiệp uy tín, đối tác tin cậy đồng hành lâu dài cùng doanh nghiệp.",
    "home.meals.heading1": "Bữa ăn ngon.",
    "home.meals.heading2": "Thêm năng lượng mới.",
  },
  "Giải pháp": {
    "solutions.hero.line1": "Phù hợp với con người.",
    "solutions.hero.line2": "Đồng điệu cùng vận hành.",
    "solutions.intro.description":
      "Bắt đầu từ nhu cầu thực tế để cùng thiết kế phương án suất ăn phù hợp với từng doanh nghiệp.",
    "solutions.process.heading": "Rõ ràng trong từng bước.",
  },
  "Giới thiệu": {
    "about.hero.line1": "Tận tâm với bữa ăn.",
    "about.hero.line2": "Trân trọng từng hợp tác.",
    "about.mission": "Mang đến những bữa ăn Sạch – Ngon – An toàn – Chất lượng, trao tận tay từng khách hàng.",
    "about.vision": "Trở thành đơn vị cung ứng suất ăn công nghiệp uy tín, đối tác tin cậy đồng hành lâu dài cùng doanh nghiệp.",
    "about.facts.foundedYear": "2019",
    "about.facts.menuCount": "40+",
    "about.facts.serviceArea": "Miền Bắc",
    "about.intro.description":
      "Từ năm 2019, Thúy Luân hoạt động trong lĩnh vực cung ứng thực phẩm và suất ăn công nghiệp tại Ninh Bình và khu vực miền Bắc.",
    "about.intro.heading1": "Hiểu giá trị của",
    "about.intro.heading2": "một bữa ăn được chăm chút.",
    "about.organization.description":
      "Từ Tổng giám đốc đến các tổ nấu, sơ chế và phục vụ, mỗi bộ phận có vai trò riêng để bữa ăn được chuẩn bị đúng quy trình.",
    "about.slider.1.alt": "Hoạt động phục vụ bữa ăn tại doanh nghiệp",
    "about.slider.2.alt": "Thiết bị bếp công nghiệp Thúy Luân",
    "about.slider.3.alt": "Bữa ăn tại nhà ăn của doanh nghiệp",
    "about.slider.4.alt": "Nhân viên Thúy Luân tham gia buổi đào tạo",
    "about.slider.5.alt": "Hoạt động Gala Dinner Thúy Luân",
  },
  "Liên hệ": {
    "contact.hero.line1": "Một cuộc trao đổi.",
    "contact.hero.line2": "Khởi đầu của sự đồng hành.",
    "contact.intro.description":
      "Chia sẻ nhu cầu để cùng Thúy Luân xây dựng phương án suất ăn phù hợp với doanh nghiệp.",
    "contact.sidebar.description":
      "Đội ngũ Thúy Luân sẽ cùng doanh nghiệp trao đổi về thực đơn, ngân sách và cách phối hợp phục vụ.",
    "contact.tip":
      "Địa điểm, số suất mỗi ngày, ca phục vụ và ngân sách dự kiến sẽ giúp hai bên đi nhanh hơn tới một phương án phù hợp.",
  },
  "Thực đơn": {
    "menus.hero.line1": "Đa dạng từng bữa ăn.",
    "menus.hero.line2": "Phù hợp từng doanh nghiệp.",
    "menus.intro.description": "22 hình ảnh suất ăn từ Thúy Luân. Lưu những mẫu bạn quan tâm để cùng trao đổi phương án thực đơn và ngân sách.",
  },
  "Góc chia sẻ": {
    "news.hero.line1": "Hiểu hơn về bữa ăn.",
    "news.hero.line2": "Chọn đúng đối tác.",
    "news.intro.description": "Những góc nhìn giúp doanh nghiệp trao đổi rõ nhu cầu và đánh giá phương án cung ứng suất ăn.",
  },
};

export const pageText = Object.fromEntries(
  Object.entries(defaults).flatMap(([section, values]) =>
    Object.entries(values).map(([id, value]) => [
      id,
      editableText(id, value, section),
    ]),
  ),
);
