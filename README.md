# Thúy Luân — Premium Corporate Food Service

Website tiếng Việt cho doanh nghiệp cần tìm đối tác cung ứng suất ăn. Giao diện viết bằng **JavaScript / React JSX**, xuất HTML tĩnh bằng Next.js; Worker dùng JavaScript ESM và Cloudflare Workers Static Assets. Không cần Node.js server khi triển khai.

## Chạy và build

Yêu cầu Node.js 22.14 trở lên, npm.

```bash
npm ci
npm run dev
```

Mở `http://localhost:3000`. Build và xem bằng Cloudflare runtime:

```bash
npm run build
npm run preview
```

`out/` chứa HTML, CSS, JS và ảnh; `worker/index.js` phục vụ tài nguyên, chuyển hướng URL cũ và cung cấp API báo giá tùy chọn. `wrangler.jsonc` đã khai báo binding `ASSETS`. Local workerd cần GLIBC 2.35 trở lên trên Linux; nếu máy cũ hơn, dùng `npm run preview:static` để xem đúng bản build bằng Node.js tại `http://localhost:4173`.

## Triển khai Cloudflare Workers

```bash
npx wrangler login
npm run build
npm run deploy
```

Với Workers Builds kết nối GitHub: **Build command** là `npm run build`, **Deploy command** là `npx wrangler deploy`. Tên Worker: `thuy-luan-corporate-food-service`. Gắn domain trong Cloudflare Dashboard. Đặt `NEXT_PUBLIC_SITE_URL` trước khi build để sitemap và Open Graph dùng đúng domain.

`npm run build:worker` build và kiểm tra gói Worker với `wrangler deploy --dry-run`, không phát hành website.

## Chức năng

- Trang chủ, giới thiệu, giải pháp, thư viện ảnh, liên hệ, góc chia sẻ và chính sách bảo mật.
- 22 mẫu suất ăn, tìm kiếm, lọc, sắp xếp, phân trang và trang chi tiết riêng.
- Lưu/so sánh thực đơn trên trình duyệt; đưa các mẫu đã chọn sang yêu cầu báo giá.
- Lọc ảnh, xem phóng lớn, điều khiển bằng phím mũi tên và Escape.
- 9 bản scan chứng chỉ/chứng nhận từ website cũ, xem ảnh gốc và tải tài liệu.
- Nút nổi hotline 0965 600 481 và Zalo trên máy tính, điện thoại.
- Xem/tải tài liệu quy trình; hồ sơ giới thiệu có chức năng in thành PDF.
- Gọi điện, Zalo, email, Google Maps; menu điện thoại và FAQ.
- Biểu mẫu kiểm tra đầu vào và cho xem lại nội dung trước khi gửi.
- Metadata từng trang, sitemap, robots và chuyển hướng URL WordPress cũ.

## Nhận yêu cầu báo giá

**Mặc định:** form tạo nội dung email khi thông tin hợp lệ. Khách xem lại, mở email để gửi tới `thuyluancompany@gmail.com` hoặc sao chép để trao đổi qua Zalo. Website không báo đã gửi thành công khi chưa có dịch vụ nhận thực sự.

**Gửi trực tiếp qua Worker:** kết nối một webhook HTTPS có khả năng lưu yêu cầu/gửi thông báo, ví dụ CRM hay dịch vụ email của doanh nghiệp. Cấu hình bí mật trên Cloudflare:

```bash
npx wrangler secret put QUOTE_WEBHOOK_URL
npx wrangler secret put QUOTE_WEBHOOK_TOKEN
```

Đặt `NEXT_PUBLIC_QUOTE_ENDPOINT=/api/quote` khi build và triển khai lại. Token tùy chọn nếu webhook có cơ chế xác thực khác. Không đặt token trong biến `NEXT_PUBLIC_*` hay commit `.dev.vars`.

API kiểm tra nguồn gửi, loại nội dung, kích thước và dữ liệu bắt buộc. Chỉ trả thành công khi webhook phản hồi thành công; khi lỗi, giao diện vẫn cung cấp email/Zalo. Chưa có dịch vụ email/CRM nào được kết nối tự động.

## Ảnh và thông tin gốc

Logo, thực đơn, ảnh vận hành và tài liệu được chuyển từ `suatancongnghiepthuyluan.com` theo yêu cầu. Ảnh WebP lưu tại `public/assets/`; nguồn từng ảnh ở `public/assets/source-manifest.json`. Không sao chép PHP hoặc plugin WordPress.

Thông tin công ty, hotline, email, mã số thuế và địa chỉ được giữ theo website gốc. Nội dung hướng tới khách hàng doanh nghiệp, không thêm khách hàng, chứng nhận hoặc số liệu năng lực chưa xác nhận. Tài liệu quy trình không được gắn nhãn chứng nhận.

Phông Be Vietnam Pro lưu tại `public/fonts/`. Chỉnh nội dung ở `app/data.js`, giao diện ở `app/page.jsx`, `app/components/site.jsx` và `app/globals.css`.

## Kiểm tra

```bash
npm test
npm run build
npm run preview -- --port 4173
```

Trong terminal thứ hai: `npm run test:browser`. Playwright dùng Chrome tại `/usr/bin/google-chrome`; sửa `executablePath` trong `playwright.config.js` nếu máy khác. Kiểm tra điều hướng, ảnh, bố cục điện thoại, lọc/lưu thực đơn, yêu cầu báo giá và thư viện ảnh. Unit test Worker dùng yêu cầu giả lập, không gửi ra ngoài.
