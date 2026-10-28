import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const content = JSON.parse(await readFile(new URL("../../app/editor-content.json", import.meta.url)));
const media = JSON.parse(await readFile(new URL("../../app/media-catalog.json", import.meta.url)));

test("admin edits text, selects a replacement, previews, and publishes one revision", async ({ page }) => {
  let authenticated = false;
  let published;
  await page.route("**/api/admin/session", (route) => route.fulfill({ json: { authenticated } }));
  await page.route("**/api/admin/login", async (route) => {
    expect(route.request().postDataJSON().pin).toBe("1234567890");
    authenticated = true;
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/admin/state", (route) => route.fulfill({ json: { head: "abc123", content, media, source: [] } }));
  await page.route("**/api/admin/publish", async (route) => {
    published = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true, commit: "abcdef123456" } });
  });

  await page.goto("/admin/");
  await expect(page.getByRole("heading", { name: "Nhập mã PIN" })).toBeVisible();
  await page.getByLabel("Mã PIN quản trị").fill("1234567890");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "Chỉnh sửa website" })).toBeVisible();

  await page.getByPlaceholder("Tìm nội dung hoặc ảnh…").fill("home.hero.line1");
  await page.locator(".admin-field input").fill("Bữa ăn mới mỗi ngày");
  await page.getByRole("button", { name: "Hình ảnh" }).click();
  await page.getByPlaceholder("Tìm nội dung hoặc ảnh…").fill("gallery-phuc-vu-01.webp");
  await page.getByText("Xóa ảnh này khi xuất bản").click();
  await page.locator(".admin-upload input[type=file]").setInputFiles({
    name: "new-photo.png", mimeType: "image/png",
    buffer: await readFile(new URL("../../public/assets/zalo.png", import.meta.url)),
  });
  await page.getByRole("button", { name: /Xem trước/ }).click();
  await expect(page.getByText("Bữa ăn mới mỗi ngày")).toBeVisible();
  await expect(page.getByText("Ảnh mới (1)")).toBeVisible();
  await expect(page.getByText(/gallery-phuc-vu-01.webp/)).toBeVisible();
  await page.getByRole("button", { name: "Xuất bản" }).click();
  await expect(page.getByText(/Đã tạo phiên bản abcdef12/)).toBeVisible();
  expect(published.baseHead).toBe("abc123");
  expect(published.text["home.hero.line1"]).toBe("Bữa ăn mới mỗi ngày");
  expect(published.deletes).toContain("gallery-phuc-vu-01.webp");
  expect(published.replacements["gallery-phuc-vu-01.webp"]).toBeTruthy();
  expect(published.uploads).toHaveLength(1);
  expect(published.uploads[0].id).toMatch(/^upload-.*\.png$/);
});
