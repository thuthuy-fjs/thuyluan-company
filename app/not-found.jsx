import { ButtonLink, PageIntro } from "./components/site";
export default function NotFound() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="404 · KHÔNG TÌM THẤY TRANG"
        title="Cùng trở về đúng nơi."
      >
        Trang bạn đang tìm có thể đã được thay đổi địa chỉ.
      </PageIntro>
      <div className="wrap" style={{ paddingBottom: 80 }}>
        <ButtonLink href="/" className="dark">
          Về trang chủ
        </ButtonLink>
      </div>
    </main>
  );
}
