import { PageIntro } from "../components/site";
import Catalog from "./catalog";
import { pageText } from "../editor-fields";
export const metadata = { title: "Thực đơn suất ăn công nghiệp" };
export default function MenuPage() {
  return (
    <main id="top">
      <PageIntro
        eyebrow="THỰC ĐƠN THAM KHẢO"
        descriptionEditorId="menus.intro.description"
        title={
          <>
            <span data-editor-id="menus.hero.line1">{pageText["menus.hero.line1"]}</span>
            <br />
            <span data-editor-id="menus.hero.line2">{pageText["menus.hero.line2"]}</span>
          </>
        }
      >
        {pageText["menus.intro.description"]}
      </PageIntro>
      <Catalog />
    </main>
  );
}
