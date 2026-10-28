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

### Chạy trang quản trị trên máy local

`npm run dev` chỉ chạy Next.js nên không có API đăng nhập của Worker. Để thử `/admin/`, tạo file `.env.local` (đã được Git bỏ qua):

```dotenv
ADMIN_PIN=1234567890123456
ADMIN_SESSION_SECRET=thay-bang-chuoi-ngau-nhien-dai-it-nhat-32-byte
GITHUB_TOKEN=thay-bang-fine-grained-token-cua-ban
GITHUB_OWNER=thuthuy-fjs
GITHUB_REPO=thuyluan-company
GITHUB_BRANCH=feature/pin-admin-editor
# GITHUB_DRAFT_BRANCH=feature/pin-admin-editor-draft
```

Đổi PIN thành mã riêng 10–16 chữ số; tạo session secret bằng `openssl rand -hex 32`. Token GitHub cần quyền **Contents: Read and write** chỉ trên repo này. Với cấu hình trên, **Lưu nháp** tạo commit trên `feature/pin-admin-editor-draft`; **Xuất bản** mới tạo commit trên `feature/pin-admin-editor`. Cả hai thao tác đều ghi vào GitHub thật, chưa động đến `main`.

```bash
npm ci
npm run build
node --env-file=.env.local scripts/preview.mjs
```

Mở `http://localhost:4173/admin/`. Sau khi xuất bản, dữ liệu quản trị đọc phiên bản mới từ GitHub, còn trang tĩnh local chỉ cập nhật sau khi dừng preview, chạy `git pull --ff-only`, `npm run build` và mở preview lại. Không cần tài khoản Cloudflare để chạy theo cách này.

## Triển khai Cloudflare Workers

```bash
npx wrangler login
npm run build
npm run deploy
```

Với Workers Builds kết nối GitHub: **Build command** là `npm run build`, **Deploy command** là `npx wrangler deploy`. Tên Worker: `congnghiepthuyluan`. Gắn domain trong Cloudflare Dashboard. Đặt `NEXT_PUBLIC_SITE_URL` trước khi build để sitemap và Open Graph dùng đúng domain.

`npm run build:worker` build và kiểm tra gói Worker với `wrangler deploy --dry-run`, không phát hành website.

## Chức năng

- Trang chủ, giới thiệu, giải pháp, thư viện ảnh, liên hệ, góc chia sẻ và chính sách bảo mật.
- 22 mẫu suất ăn, tìm kiếm, lọc, sắp xếp, phân trang và trang chi tiết riêng.
- Lưu/so sánh thực đơn trên trình duyệt; đưa các mẫu đã chọn sang yêu cầu báo giá.
- Lọc ảnh, xem phóng lớn, điều khiển bằng phím mũi tên và Escape.
- 10 thẻ hồ sơ chứa 16 trang ảnh: đăng ký doanh nghiệp năm 2026, ba bộ ISO 22000 (mỗi bộ mở đủ 3 trang), chứng nhận ATTP và hồ sơ khác; xem ảnh rõ và tải từng trang.
- Nút nổi hotline 0965 600 481 và Zalo trên máy tính, điện thoại.
- Xem/tải tài liệu quy trình; hồ sơ giới thiệu có chức năng in thành PDF.
- Gọi điện, Zalo, email, Google Maps; menu điện thoại và FAQ.
- Biểu mẫu kiểm tra đầu vào và cho xem lại nội dung trước khi gửi.
- Metadata từng trang, sitemap, robots và chuyển hướng URL WordPress cũ.

## Quản trị nội dung và hình ảnh

Trang `/admin/` hiển thị trang thật trong khung desktop/mobile. Bấm chữ để sửa trực tiếp, bấm ảnh để tải tệp thay thế, bấm nút để chỉnh chữ hiển thị; liên kết của nút được giữ cố định trong mã nguồn. Danh sách trường vẫn có cho nội dung không chọn được trực tiếp. Ảnh PNG/JPG/WebP tối đa 4 MB/ảnh, 4 ảnh/lần lưu.

Tab Hình ảnh lọc theo nhóm, mặc định là Suất ăn. Bấm Thêm ảnh để chọn tệp và nhóm trong popup; ảnh vừa thêm xuất hiện đầu danh sách để có thể đổi nhóm tiếp.
Với ảnh đã có, bấm Thay tệp ảnh trên thẻ ảnh, chọn một ảnh mới có tỷ lệ phù hợp rồi lưu nháp. Mọi vị trí dùng ảnh cũ sẽ chuyển sang ảnh mới; tệp cũ được xóa khi xuất bản. Ảnh xem trước và ảnh tài liệu gốc là hai tệp riêng, cần thay từng tệp nếu muốn đổi cả hai.

Với slider ở trang chủ, bấm ảnh để chọn từng vị trí trong dải ảnh thu nhỏ, rồi chọn ảnh cùng nhóm và tỷ lệ hoặc tải ảnh mới. Thay đổi chỉ áp dụng cho vị trí đã chọn; bản nháp giữ nguyên thứ tự và số lượng slide.

**Draft** và **Published** là hai nhánh riêng. Nút **Lưu nháp** tạo commit chứa JSON và ảnh trên nhánh draft, không làm thay đổi trang công khai. **Xuất bản** lấy nội dung và ảnh đã lưu từ draft, tạo commit trên nhánh published rồi đồng bộ draft. Workers Builds chỉ nên theo dõi nhánh published (`main` khi triển khai thật) để tự build trang tĩnh. Không có giao diện lịch sử chỉnh sửa.

Đăng nhập dùng PIN 10–16 chữ số, được kiểm tra trong Worker. Phiên đăng nhập có hiệu lực tối đa 12 giờ. Không gửi PIN hoặc GitHub token vào mã nguồn hay qua chat.

**Thiết lập trên Cloudflare (một lần):**

1. Đăng nhập bằng `npx wrangler login`.
2. Đặt ba secret bằng `npx wrangler secret put ADMIN_PIN`, `npx wrangler secret put ADMIN_SESSION_SECRET`, `npx wrangler secret put GITHUB_TOKEN`. Dùng GitHub fine-grained token chỉ có quyền **Contents: Read and write** trên repo này. Giữ token chỉ trong Cloudflare Secret.
3. Trong Cloudflare Dashboard, kết nối Worker với GitHub repo này bằng Workers Builds: nhánh `main`, build command `npm run build`, deploy command `npx wrangler deploy`.

Nếu thiếu secret, trang công khai vẫn hoạt động, còn đăng nhập quản trị trả thông báo chưa cấu hình. Việc đổi text trong các component chưa được đăng ký cần thêm ID trường trong `app/editor-fields.js`; dữ liệu trong `app/data.js` được đăng ký tự động.

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

Logo, thực đơn, ảnh vận hành và tài liệu ban đầu được chuyển từ `suatancongnghiepthuyluan.com`. Tám ảnh bổ sung và các giấy chứng nhận mới do người dùng cung cấp. Ảnh lưu tại `public/assets/` và được liệt kê trong `app/media-catalog.json`. Không sao chép PHP hoặc plugin WordPress.

Thông tin công ty, hotline, email, mã số thuế và địa chỉ được giữ theo website gốc. Nội dung hướng tới khách hàng doanh nghiệp, không thêm khách hàng, chứng nhận hoặc số liệu năng lực chưa xác nhận. Tài liệu quy trình không được gắn nhãn chứng nhận.

Phông Be Vietnam Pro lưu tại `public/fonts/`. Chỉnh nội dung ở `app/data.js`, giao diện ở `app/page.jsx`, `app/components/site.jsx` và `app/globals.css`.

## Kiểm tra

```bash
npm test
npm run build
npm run preview -- --port 4173
```

Trong terminal thứ hai: `npm run test:browser`. Playwright dùng Chrome tại `/usr/bin/google-chrome`; sửa `executablePath` trong `playwright.config.js` nếu máy khác. Kiểm tra điều hướng, ảnh, bố cục điện thoại, lọc/lưu thực đơn, yêu cầu báo giá và thư viện ảnh. Unit test Worker dùng yêu cầu giả lập, không gửi ra ngoài.
