import { test, expect } from "@playwright/test";

test("home has real assets, accessible navigation, and no horizontal overflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Thực đơn lành mạnh",
  );
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-image")).toBeVisible();
  expect(
    await page
      .locator(".hero-image")
      .evaluate((i) => i.complete && i.naturalWidth > 0),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/thuyluan-new-desktop.png",
    fullPage: false,
  });
  await page.locator("img").evaluateAll((imgs) =>
    Promise.all(
      imgs.map((i) => {
        i.loading = "eager";
        return i.decode().catch(() => {});
      }),
    ),
  );
  await page.screenshot({ path: "/tmp/thuyluan-new-full.png", fullPage: true });
  const navigation = page.getByRole("navigation", { name: "Điều hướng chính" });
  await expect(navigation.getByRole("link")).toHaveCount(5);
  await expect(
    navigation.getByRole("link", { name: "Dịch vụ", exact: true }),
  ).toHaveAttribute("href", "/giai-phap/");
  await expect(page.locator(".header-quote")).toHaveText("Nhận báo giá");
  await navigation
    .getByRole("link", { name: "Quy trình", exact: true })
    .click();
  await expect(page).toHaveURL(/#process$/);
  await navigation.getByRole("link", { name: "FAQ", exact: true }).click();
  await expect(page).toHaveURL(/#faq$/);
  await page
    .getByRole("button", {
      name: "Có thể xây dựng thực đơn theo ngân sách không?",
    })
    .click();
  await expect(
    page.getByText("Doanh nghiệp có thể chia sẻ ngân sách dự kiến", {
      exact: false,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("catalog uses ascending menu numbers and supports search, saved menus and prefilled quotation", async ({
  page,
}) => {
  await page.goto("/thuc-don/");
  await expect(page.locator(".meal-card")).toHaveCount(9);
  await expect(page.locator(".filter-toolbar .filter-tabs")).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Sắp xếp thực đơn" })).toHaveCount(0);
  for (const [pageNumber, start, end] of [[1, 1, 9], [2, 10, 18], [3, 19, 22]]) {
    await page.getByRole("button", { name: `Trang ${pageNumber}`, exact: true }).click();
    await expect(page.locator(".meal-card h3")).toHaveText(
      Array.from({ length: end - start + 1 }, (_, index) =>
        `Suất ăn công nghiệp ${String(start + index).padStart(2, "0")}`,
      ),
    );
  }
  await page.getByRole("textbox", { name: "Tìm thực đơn" }).fill("19");
  await expect(page.locator(".meal-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Lưu Suất ăn công nghiệp 19", exact: true })
    .click();
  await page.reload();
  await page.getByRole("textbox", { name: "Tìm thực đơn" }).fill("20");
  await page
    .getByRole("button", { name: "Lưu Suất ăn công nghiệp 20", exact: true })
    .click();
  await page.getByRole("button", { name: "So sánh", exact: true }).click();
  await expect(
    page.getByRole("dialog").locator(".compare-grid article"),
  ).toHaveCount(2);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Bỏ lưu Suất ăn công nghiệp 20", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Tìm thực đơn" }).fill("");
  await page.getByRole("button", { name: "Đã lưu (1)", exact: true }).click();
  await expect(page.locator(".meal-card")).toHaveCount(1);
  await page.locator(".saved-tray a").click();
  await expect(page.locator("input[name=menus]")).toHaveValue("Mẫu 19");
});

test("gallery filters photos and supports keyboard lightbox controls", async ({
  page,
}) => {
  await page.goto("/hinh-anh/");
  await expect(page.locator(".photo-tile")).toHaveCount(24);
  await page
    .getByRole("button", { name: "Không gian bếp", exact: true })
    .click();
  await expect(page.locator(".photo-tile")).toHaveCount(9);
  await page.locator(".photo-tile").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lightbox-controls small")).toHaveText("2 / 9");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("quote validates fields and prepares a real email without claiming delivery", async ({
  page,
}) => {
  await page.goto("/lien-he/");
  await page.locator("input[name=company]").fill("Doanh nghiệp thử nghiệm");
  await page.locator("input[name=name]").fill("Nguyễn An");
  await page.locator("input[name=phone]").fill("123");
  await page.locator("input[name=location]").fill("Hà Nam");
  await page.locator("input[name=quantity]").fill("500");
  await page.locator(".consent input").check();
  await page.getByRole("button", { name: "Nhận phương án & báo giá" }).click();
  await expect(page.locator(".quote-form").getByRole("alert")).toContainText(
    "số điện thoại",
  );
  await page.locator("input[name=phone]").fill("0965600481");
  await page.getByRole("button", { name: "Nhận phương án & báo giá" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("pre")).toContainText("Doanh nghiệp thử nghiệm");
  await expect(
    dialog.getByRole("link", { name: "Mở email để gửi" }),
  ).toHaveAttribute("href", /^mailto:thuyluancompany@gmail.com\?/);
  await expect(dialog).toContainText(
    "Yêu cầu chỉ được gửi khi bạn hoàn tất bước gửi.",
  );
});

test("mobile menu, routes, images and layout work at 390 pixels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-copy-bottom")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-image")).toHaveCSS("opacity", "1");
  await expect(page.locator(".floating-phone")).toBeVisible();
  await expect(page.locator(".floating-phone")).toHaveAttribute(
    "href",
    "tel:0965600481",
  );
  await expect(page.locator(".floating-zalo")).toHaveAttribute(
    "href",
    "https://zalo.me/0965600481",
  );
  await page.screenshot({
    path: "/tmp/thuyluan-new-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Menu mở rộng" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Menu mở rộng" })
    .getByRole("link", { name: "Thực đơn tham khảo" })
    .click();
  await expect(page).toHaveURL(/\/thuc-don\//);
  for (const path of [
    "/",
    "/thuc-don/",
    "/gioi-thieu/",
    "/giai-phap/",
    "/hinh-anh/",
    "/lien-he/",
    "/tin-tuc/",
    "/thuc-don/suat-an-cong-nghiep-19/",
  ]) {
    const r = await page.goto(path);
    expect(r.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator("img").evaluateAll((imgs) =>
      Promise.all(
        imgs.map((i) => {
          i.loading = "eager";
          return i.decode().catch(() => {});
        }),
      ),
    );
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) => imgs.every((i) => i.naturalWidth > 0)),
    ).toBe(true);
  }
});
