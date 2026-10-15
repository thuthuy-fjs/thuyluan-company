import { PageIntro } from "../components/site";
import { company } from "../data";
export const metadata = { title: "Chính sách bảo mật" };
export default function PrivacyPage() {
  return (
    <main id="top">
      <PageIntro eyebrow="THÔNG TIN WEBSITE" title="Chính sách bảo mật" />
      <article className="wrap legal-content">
        {[
          [
            "Thông tin bạn cung cấp",
            "Biểu mẫu hợp tác bao gồm thông tin doanh nghiệp, người liên hệ, điện thoại, email và nhu cầu suất ăn. Thông tin được dùng để trao đổi và tư vấn về phương án phục vụ.",
          ],
          [
            "Cách gửi yêu cầu",
            "Ở chế độ email, website tạo nội dung để bạn xem lại, sao chép hoặc gửi bằng ứng dụng email của mình. Biểu mẫu chưa gửi dữ liệu cho đến khi bạn hoàn tất bước gửi. Nếu doanh nghiệp vận hành website kết nối dịch vụ tiếp nhận trực tuyến, thông tin được chuyển đến dịch vụ đó sau khi bạn xác nhận gửi.",
          ],
          [
            "Dữ liệu lưu trên thiết bị",
            "Chức năng lưu thực đơn sử dụng bộ nhớ cục bộ của trình duyệt. Chỉ số hiệu thực đơn được lưu, không gồm thông tin liên hệ. Bạn có thể xóa bằng nút Bỏ chọn tại trang thực đơn hoặc trong cài đặt trình duyệt.",
          ],
          [
            "Liên kết và dịch vụ bên ngoài",
            "Liên kết Zalo, Google Maps và email mở dịch vụ tương ứng theo lựa chọn của bạn. Việc sử dụng những dịch vụ này tuân theo chính sách của nhà cung cấp.",
          ],
          [
            "Liên hệ về thông tin cá nhân",
            `Để trao đổi về việc chỉnh sửa, xóa hoặc sử dụng thông tin đã cung cấp, vui lòng liên hệ ${company.email} hoặc ${company.phoneDisplay}.`,
          ],
        ].map(([t, p]) => (
          <section key={t}>
            <h2>{t}</h2>
            <p>{p}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
