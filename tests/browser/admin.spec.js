import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const content = JSON.parse(await readFile(new URL("../../app/editor-content.json", import.meta.url)));
const media = JSON.parse(await readFile(new URL("../../app/media-catalog.json", import.meta.url)));
const missingMedia = { id: "missing-demo.webp", src: "/assets/missing-demo.webp", category: "Suất ăn", width: 960, height: 720 };

test("admin edits the live page, saves a draft, then publishes", async ({ page }) => {
  let authenticated = false;
  let saved;
  let draftHead = null;
  let publishedHead = "abc123";
  let currentContent = content;
  let publishedContent = content;
  await page.route("**/api/admin/session", (route) => route.fulfill({ json: { authenticated } }));
  await page.route("**/api/admin/login", async (route) => {
    expect(route.request().postDataJSON().pin).toBe("1234567890");
    authenticated = true;
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/admin/state", (route) => route.fulfill({ json: { head: draftHead || publishedHead, draftHead, publishedHead, hasUnpublishedDraft: Boolean(draftHead && draftHead !== publishedHead), content: currentContent, publishedContent, media: [...media, missingMedia], publishedMedia: [...media, missingMedia] } }));
  await page.route("**/api/admin/draft", async (route) => {
    saved = route.request().postDataJSON();
    draftHead = "draft123456";
    currentContent = { ...content, text: saved.text, sliderImages: saved.sliderImages, certificates: saved.certificates };
    await route.fulfill({ json: { ok: true, draftCommit: draftHead } });
  });
  await page.route("**/api/admin/publish", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ draftHead, publishedHead });
    publishedHead = "publish123456";
    draftHead = publishedHead;
    publishedContent = currentContent;
    await route.fulfill({ json: { ok: true, commit: publishedHead, draftReset: true } });
  });

  await page.goto("/admin/");
  await expect(page.getByRole("heading", { name: "Nhập mã PIN" })).toBeVisible();
  await page.getByLabel("Mã PIN quản trị").fill("1234567890");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "Chỉnh sửa website" })).toBeVisible();

  const officeTitle = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('.solution-card[data-solution="van-phong"] h3');
  await officeTitle.click();
  await expect(page.locator(".admin-inline-editor textarea")).toHaveValue("Suất ăn văn phòng");
  await expect(page.locator(".admin-inline-editor")).not.toContainText("home.solutions.office.title");
  await page.locator(".admin-inline-editor textarea").fill("Suất ăn văn phòng mới");
  await expect(officeTitle).toHaveText("Suất ăn văn phòng mới");
  await page.getByLabel("Trang đang xem").selectOption("/services/");
  const serviceTitle = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('#van-phong h2');
  await expect(serviceTitle).toHaveText("Suất ăn văn phòng");
  await serviceTitle.click();
  await expect(page.locator(".admin-inline-editor textarea")).toHaveValue("Suất ăn văn phòng");
  await page.getByLabel("Trang đang xem").selectOption("/");
  await expect(officeTitle).toHaveText("Suất ăn văn phòng mới");
  await officeTitle.click();
  await page.getByRole("button", { name: "Khôi phục nội dung gốc" }).click();
  const liveHero = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-admin-field="home.hero.line1"]');
  await expect(liveHero).toBeVisible();
  await liveHero.click();
  await liveHero.fill("Bữa ăn mới mỗi ngày");
  await expect(liveHero).toHaveText("Bữa ăn mới mỗi ngày");
  await expect(page.locator(".admin-inline-editor textarea")).toHaveValue("Bữa ăn mới mỗi ngày");
  await page.getByRole("button", { name: "Mobile" }).click();
  expect((await page.locator(".admin-site-frame").boundingBox()).width).toBeLessThan(500);
  await page.getByRole("button", { name: "Desktop" }).click();
  await expect(page.getByRole("button", { name: "Màu sắc" })).toHaveCount(0);
  await expect(page.locator('input[type="color"]')).toHaveCount(0);
  const consult = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-editor-button="home.hero.consult"]');
  await consult.click();
  await expect(page.getByLabel("Liên kết")).toHaveCount(0);
  await page.getByLabel("Chữ trên nút").fill("Tư vấn ngay");
  await expect(consult).toContainText("Tư vấn ngay");
  await expect(consult).toHaveAttribute("href", "/contacts/");
  const heroImage = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator(".hero-slide.is-active img");
  await heroImage.click();
  await page.locator(".admin-image-picker input[type=file]").setInputFiles({
    name: "replacement.png", mimeType: "image/png",
    buffer: await readFile(new URL("../../public/assets/zalo.png", import.meta.url)),
  });
  await expect(page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('.hero-slide img[src^="blob:"]')).toHaveCount(1);
  const factorySlider = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('.solution-card[data-solution="nha-may"] .solution-image');
  await factorySlider.click();
  await expect(page.getByRole("complementary", { name: "Thay ảnh trong slider" })).toBeVisible();
  await expect(page.locator(".admin-slider-slots button")).toHaveCount(5);
  await page.getByRole("button", { name: "Suất ăn nhà máy · ảnh 2" }).click();
  await page.locator(".admin-slider-editor input[type=file]").setInputFiles({
    name: "factory-slide.png", mimeType: "image/png",
    buffer: await readFile(new URL("../../public/assets/zalo.png", import.meta.url)),
  });
  await expect(page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-editor-slider-slot="home.solutions.factory.2"]')).toHaveAttribute("src", /^blob:/);
  const gallerySlider = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('.gallery-category-showcase .photo-tile:first-child');
  await gallerySlider.click();
  await expect(page.locator(".admin-slider-slots button")).toHaveCount(5);
  const currentGalleryId = (await page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-editor-slider-slot="home.gallery.service.1"]').getAttribute("src")).slice(8);
  const galleryReplacement = await page.getByLabel("Chọn ảnh có sẵn").locator("option").evaluateAll((options, currentId) => options.map((option) => option.value).find((id) => id && id !== currentId && id !== "gallery-phuc-vu-01.webp"), currentGalleryId);
  expect(galleryReplacement).toBeTruthy();
  await page.getByLabel("Chọn ảnh có sẵn").selectOption(galleryReplacement);
  await expect(page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-editor-slider-slot="home.gallery.service.1"]')).toHaveAttribute("src", `/assets/${galleryReplacement}`);
  await page.getByLabel("Chọn ảnh có sẵn").selectOption("");
  await expect(page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-editor-slider-slot="home.gallery.service.1"]')).toHaveAttribute("src", `/assets/${currentGalleryId}`);
  await page.getByLabel("Chọn ảnh có sẵn").selectOption(galleryReplacement);
  await page.getByRole("button", { name: "Hình ảnh" }).click();
  await expect(page.getByLabel("Lọc nhóm ảnh")).toHaveValue("Suất ăn");
  await expect(page.getByText("missing-demo.webp")).toHaveCount(0);
  await expect(page.getByText("Thay ảnh đang hiển thị bằng")).toHaveCount(0);
  await page.getByLabel("Lọc nhóm ảnh").selectOption("Phục vụ");
  await page.getByPlaceholder("Tìm nội dung hoặc ảnh…").fill("gallery-phuc-vu-01.webp");
  await page.getByText("Xóa ảnh này trong bản nháp").click();
  await page.getByRole("button", { name: "+ Thêm ảnh" }).click();
  const uploadDialog = page.getByRole("dialog", { name: "Thêm ảnh" });
  await expect(uploadDialog).toBeVisible();
  await uploadDialog.locator("input[type=file]").setInputFiles({
    name: "new-photo.png", mimeType: "image/png",
    buffer: await readFile(new URL("../../public/assets/zalo.png", import.meta.url)),
  });
  await uploadDialog.getByLabel("Nhóm ảnh").selectOption("Không gian bếp");
  await uploadDialog.getByRole("button", { name: "Thêm vào bản nháp" }).click();
  await expect(uploadDialog).toHaveCount(0);
  await expect(page.getByLabel("Lọc nhóm ảnh")).toHaveValue("Không gian bếp");
  await expect(page.locator(".admin-media-card").first().getByLabel("Tên ảnh")).toHaveValue("new-photo");
  await page.getByLabel("Lọc nhóm ảnh").selectOption("Chứng chỉ – Chứng nhận");
  await expect(page.locator(".admin-certificate-item")).toHaveCount(10);
  await page.locator(".admin-certificate-item").first().locator("summary").click();
  await page.locator(".admin-certificate-item").first().locator(".admin-certificate-page input[type=file]").setInputFiles({
    name: "registration-updated.webp", mimeType: "image/webp",
    buffer: await readFile(new URL("../../public/assets/business-registration-2026-preview.webp", import.meta.url)),
  });
  await expect(page.locator(".admin-certificate-item").first().locator("summary img")).toHaveAttribute("src", /^blob:/);
  await page.getByRole("button", { name: /Xem trước/ }).click();
  await expect(page.getByText("Bữa ăn mới mỗi ngày")).toBeVisible();
  await expect(page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-editor-slider-slot="home.solutions.factory.2"]')).toHaveAttribute("src", /^blob:/);
  await expect(page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-editor-slider-slot="home.gallery.service.1"]')).toHaveAttribute("src", `/assets/${galleryReplacement}`);
  await expect(page.getByText("Ảnh mới (4)")).toBeVisible();
  await expect(page.getByText("Ảnh trong slider (2)")).toBeVisible();
  await expect(page.getByText(/Thay hoặc xóa ảnh/)).toBeVisible();
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page.getByText(/Đã lưu bản nháp draft123/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Xem trước (nháp)" })).toBeVisible();
  await expect(page.getByText("Văn bản (1)")).toBeVisible();
  expect(saved.baseHead).toBe("abc123");
  expect(saved.text["home.hero.line1"]).toBe("Bữa ăn mới mỗi ngày");
  expect(saved).not.toHaveProperty("theme");
  expect(saved.buttons["home.hero.consult"].label).toBe("Tư vấn ngay");
  expect(saved.deletes).toContain("gallery-phuc-vu-01.webp");
  expect(saved.deletes).toContain("business-registration-2026.webp");
  expect(saved.replacements["business-registration-2026.webp"]).toMatch(/^upload-.*\.webp$/);
  expect(saved.certificates[0].pages[0].image).toBe(`/assets/${saved.replacements["business-registration-2026.webp"]}`);
  expect(saved.replacements["gallery-phuc-vu-01.webp"]).toBeTruthy();
  expect(saved.uploads).toHaveLength(4);
  expect(saved.uploads[0].category).toBe("Khác");
  expect(saved.uploads[1].category).toBe("Khác");
  expect(saved.uploads.find((item) => item.title === "new-photo").category).toBe("Không gian bếp");
  expect(saved.sliderImages["home.solutions.factory.2"]).toMatch(/^\/assets\/upload-.*\.png$/);
  expect(saved.sliderImages["home.gallery.service.1"]).toBe(`/assets/${galleryReplacement}`);
  expect(saved.uploads[0].id).toMatch(/^upload-.*\.png$/);
  await page.getByRole("button", { name: "Xuất bản" }).click();
  await expect(page.getByText(/Đã xuất bản publish1/)).toBeVisible();
});

test("uploading a logo replaces the existing logo in one draft", async ({ page }) => {
  let saved;
  await page.route("**/api/admin/session", (route) => route.fulfill({ json: { authenticated: true } }));
  await page.route("**/api/admin/state", (route) => route.fulfill({ json: {
    head: "head123", publishedHead: "head123", draftHead: null, hasUnpublishedDraft: false,
    content, publishedContent: content, media, publishedMedia: media,
  } }));
  await page.route("**/api/admin/draft", (route) => {
    saved = route.request().postDataJSON();
    return route.fulfill({ json: { draftCommit: "draft123456" } });
  });
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Hình ảnh" }).click();
  await page.getByLabel("Lọc nhóm ảnh").selectOption("Logo");
  await expect(page.locator(".admin-media-card")).toHaveCount(1);
  await expect(page.getByText("Xóa ảnh này trong bản nháp")).toHaveCount(0);
  await page.getByRole("button", { name: "+ Thêm ảnh" }).click();
  const dialog = page.getByRole("dialog", { name: "Thêm ảnh" });
  await dialog.getByLabel("Nhóm ảnh").selectOption("Logo");
  await dialog.locator("input[type=file]").setInputFiles({
    name: "new-logo.png", mimeType: "image/png",
    buffer: await readFile(new URL("../../public/assets/zalo.png", import.meta.url)),
  });
  await dialog.getByRole("button", { name: "Thay trong bản nháp" }).click();
  await expect(page.locator(".admin-media-card")).toHaveCount(1);
  await expect(page.locator(".admin-media-card").getByLabel("Tên ảnh")).toHaveValue("new-logo");
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page.getByText(/Đã lưu bản nháp/)).toBeVisible();
  expect(saved.deletes).toEqual(["logo.png"]);
  expect(saved.uploads).toHaveLength(1);
  expect(saved.uploads[0].category).toBe("Logo");
  expect(saved.replacements["logo.png"]).toBe(saved.uploads[0].id);
});

test("adding a certificate stores its ordered pages as one item", async ({ page }) => {
  let saved;
  await page.route("**/api/admin/session", (route) => route.fulfill({ json: { authenticated: true } }));
  await page.route("**/api/admin/state", (route) => route.fulfill({ json: {
    head: "head123", publishedHead: "head123", draftHead: null, hasUnpublishedDraft: false,
    content, publishedContent: content, media, publishedMedia: media,
  } }));
  await page.route("**/api/admin/draft", (route) => {
    saved = route.request().postDataJSON();
    return route.fulfill({ json: { draftCommit: "draft123456" } });
  });
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Hình ảnh" }).click();
  await page.getByLabel("Lọc nhóm ảnh").selectOption("Chứng chỉ – Chứng nhận");
  await expect(page.locator(".admin-certificate-item")).toHaveCount(10);
  await page.getByRole("button", { name: "+ Thêm chứng nhận" }).click();
  const form = page.locator(".admin-certificate-create");
  await form.getByLabel("Tên chứng nhận").fill("Chứng nhận mới");
  await form.getByLabel("Loại chứng nhận").fill("ISO 22000");
  const buffer = await readFile(new URL("../../public/assets/zalo.png", import.meta.url));
  await form.locator("input[type=file]").setInputFiles([
    { name: "trang-1.png", mimeType: "image/png", buffer },
    { name: "trang-2.png", mimeType: "image/png", buffer },
    { name: "trang-3.png", mimeType: "image/png", buffer },
  ]);
  await form.getByRole("button", { name: "Tạo chứng nhận" }).click();
  await expect(page.locator(".admin-certificate-item")).toHaveCount(11);
  const added = page.locator(".admin-certificate-item").last();
  await expect(added).toContainText("Chứng nhận mới");
  await expect(added.locator("summary img")).toHaveAttribute("src", /^blob:/);
  await added.locator("summary").click();
  await expect(added.locator(".admin-certificate-page")).toHaveCount(3);
  await added.locator(".admin-certificate-page").last().getByRole("button", { name: "↑ Lên" }).click();
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page.getByText(/Đã lưu bản nháp/)).toBeVisible();
  expect(saved.uploads).toHaveLength(3);
  expect(saved.uploads.every((item) => item.category === "Chứng chỉ – Chứng nhận")).toBe(true);
  expect(saved.certificates).toHaveLength(11);
  expect(saved.certificates.at(-1).pages.map((item) => item.image)).toEqual([saved.uploads[0], saved.uploads[2], saved.uploads[1]].map((item) => `/assets/${item.id}`));
});

test("publishing with unsaved edits saves the draft first", async ({ page }) => {
  const calls = [];
  let draftHead = null;
  await page.route("**/api/admin/session", (route) => route.fulfill({ json: { authenticated: true } }));
  await page.route("**/api/admin/state", (route) => route.fulfill({ json: {
    head: draftHead || "head123", publishedHead: "head123", draftHead, hasUnpublishedDraft: Boolean(draftHead),
    content, publishedContent: content, media, publishedMedia: media,
  } }));
  await page.route("**/api/admin/draft", (route) => {
    calls.push("draft");
    draftHead = "draft123456";
    return route.fulfill({ json: { draftCommit: draftHead } });
  });
  await page.route("**/api/admin/publish", (route) => {
    calls.push("publish");
    expect(route.request().postDataJSON()).toEqual({ draftHead: "draft123456", publishedHead: "head123" });
    return route.fulfill({ json: { ok: true, commit: "publish123456", draftReset: true } });
  });
  await page.goto("/admin/");
  await expect(page.getByRole("button", { name: "Xuất bản" })).toBeDisabled();
  const liveHero = page.frameLocator('iframe[title^="Bản xem trực tiếp"]').locator('[data-admin-field="home.hero.line1"]');
  await liveHero.click();
  await page.locator(".admin-inline-editor textarea").fill("Bữa ăn mới mỗi ngày");
  await expect(page.getByRole("button", { name: "Lưu nháp" })).toBeEnabled();
  await page.getByRole("button", { name: "Xuất bản" }).click();
  await expect(page.getByText(/Đã xuất bản publish1/)).toBeVisible();
  expect(calls).toEqual(["draft", "publish"]);
});
