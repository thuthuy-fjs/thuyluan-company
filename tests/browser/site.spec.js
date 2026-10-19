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
  await expect(page.locator(".hero-slide.is-active .hero-image")).toBeVisible();
  expect(
    await page
      .locator(".hero-slide.is-active .hero-image")
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
  await expect(
    page.getByRole("combobox", { name: "Sắp xếp thực đơn" }),
  ).toHaveCount(0);
  for (const [pageNumber, start, end] of [
    [1, 1, 9],
    [2, 10, 18],
    [3, 19, 22],
  ]) {
    await page
      .getByRole("button", { name: `Trang ${pageNumber}`, exact: true })
      .click();
    await expect(page.locator(".meal-card h3")).toHaveText(
      Array.from(
        { length: end - start + 1 },
        (_, index) =>
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
  await expect(page.locator(".photo-tile")).toHaveCount(87);
  await expect(page.locator('.photo-tile img[src="/assets/home-served-meal.jpg"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Hoạt động", exact: true }).click();
  await expect(page.locator(".photo-tile")).toHaveCount(12);
  await expect(page.locator(".photo-tile").first()).toHaveAttribute(
    "aria-label",
    /Gala Dinner Thúy Luân 2026/,
  );
  await page
    .getByRole("button", { name: "Không gian bếp", exact: true })
    .click();
  await expect(page.locator(".photo-tile")).toHaveCount(42);
  await page.locator(".photo-tile").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lightbox-controls small")).toHaveText("2 / 42");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("home gallery folders rotate five photos every three seconds and open their categories", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const folders = page.locator(".gallery-category-showcase .photo-tile");
  await expect(folders).toHaveCount(4);
  const folderList = await folders.all();
  const categorySlugs = ["phuc-vu", "khong-gian-bep", "hoat-dong", "giao-nhan"];
  for (const [index, folder] of folderList.entries()) {
    await expect(folder.locator("img")).toHaveCount(5);
    await expect(folder).toHaveAttribute("href", `/hinh-anh/?loai=${categorySlugs[index]}`);
  }
  const firstImages = await Promise.all(
    folderList.map((folder) => folder.locator("img.is-active").getAttribute("src")),
  );
  await page.clock.runFor(3000);
  for (const [index, folder] of folderList.entries()) {
    await expect(folder.locator("img.is-active")).not.toHaveAttribute("src", firstImages[index]);
  }

  await page.getByRole("link", { name: "Xem thư viện Hoạt động" }).click();
  await expect(page).toHaveURL(/\/hinh-anh\/\?loai=hoat-dong$/);
  await expect(page.getByRole("button", { name: "Hoạt động", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".gallery-page .photo-tile")).toHaveCount(12);
});

test("about introduction rotates five company photos every three seconds", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/gioi-thieu/");
  const slider = page.locator(".about-intro-visual");
  await expect(slider.locator("img")).toHaveCount(5);
  const active = slider.locator("img.is-active");
  await expect(active).toHaveAttribute("src", "/assets/gallery-17.webp");
  await page.clock.runFor(3000);
  await expect(active).toHaveAttribute("src", "/assets/gallery-bep-07.webp");
});

test("about activities use the same rotating photo folders as home", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/gioi-thieu/");
  await expect(page.locator(".document-section")).toHaveCount(0);
  const folders = page.locator(".related-section .gallery-category-showcase .photo-tile");
  await expect(folders).toHaveCount(4);
  const slugs = ["phuc-vu", "khong-gian-bep", "hoat-dong", "giao-nhan"];
  for (const [index, folder] of (await folders.all()).entries()) {
    await expect(folder.locator("img")).toHaveCount(5);
    await expect(folder).toHaveAttribute("href", `/hinh-anh/?loai=${slugs[index]}`);
  }
  const firstImage = await folders.first().locator("img.is-active").getAttribute("src");
  await page.clock.runFor(3000);
  await expect(folders.first().locator("img.is-active")).not.toHaveAttribute("src", firstImage);
  await page.getByRole("link", { name: "Xem thư viện Hoạt động" }).click();
  await expect(page).toHaveURL(/\/hinh-anh\/\?loai=hoat-dong$/);
});

test("about page shows five processing steps with expandable instructions", async ({
  page,
}) => {
  await page.goto("/gioi-thieu/");
  const kitchenLayout = page.locator(".org-chart + .core-values + .kitchen-layout");
  await expect(kitchenLayout).toHaveCount(1);
  await expect(kitchenLayout.getByRole("heading", { name: "Phương án tổ chức không gian bếp." })).toBeVisible();
  await expect(kitchenLayout.getByRole("link", { name: /Xem ảnh đầy đủ/ })).toHaveCount(0);
  const layoutImage = kitchenLayout.locator("img");
  await layoutImage.scrollIntoViewIfNeeded();
  await layoutImage.evaluate((image) => image.decode());
  expect(await layoutImage.evaluate((image) => [image.naturalWidth, image.naturalHeight])).toEqual([1024, 1536]);
  const imageBox = await kitchenLayout.locator(".kitchen-layout-figure").boundingBox();
  const headingBox = await kitchenLayout.locator(".core-values-heading").boundingBox();
  expect(imageBox.x + imageBox.width).toBeLessThan(headingBox.x);
  const section = page.locator(".kitchen-layout + .processing-section");
  await expect(section).toHaveCount(1);
  const organizationImage = page.locator(".org-chart-figure img");
  await expect(organizationImage).toHaveAttribute("src", "/assets/document-organization.png");
  await organizationImage.evaluate((image) => image.decode());
  expect(await organizationImage.evaluate((image) => [image.naturalWidth, image.naturalHeight])).toEqual([1122, 1402]);
  await expect(section.getByRole("heading", { name: "Từ nguyên liệu đến món ăn." })).toBeVisible();
  await expect(section.locator(".processing-zone")).toHaveText(["Khu sống", "Khu chín"]);
  const steps = section.locator(".processing-step");
  await expect(steps).toHaveCount(5);
  for (const [index, title] of [
    "Nhận nguyên liệu",
    "Rã đông an toàn",
    "Sơ chế riêng từng loại",
    "Nấu và chiên",
    "Kiểm soát ra đồ chín",
  ].entries()) {
    const step = steps.nth(index);
    await expect(step.locator("summary")).toContainText(title);
    await step.locator("summary").click();
    await expect(step).toHaveAttribute("open", "");
    await expect(step.getByRole("heading", { name: "Cách thực hiện" })).toBeVisible();
    await expect(step.locator(".processing-step-detail li")).toHaveCount(4);
  }
  await steps.first().locator("summary").click();
  await expect(steps.first()).not.toHaveAttribute("open", "");
});

test("home processing document opens the interactive five-step section", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".document-section .document-list").getByRole("button", {
    name: /Sơ đồ tổ chức/,
  }).click();
  await expect(page.getByRole("dialog").locator("a[download]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  const link = page.locator(".document-section .document-list").getByRole("link", {
    name: /Quy trình chế biến/,
  });
  await expect(link).toHaveAttribute("href", "/gioi-thieu/#quy-trinh-che-bien");
  await link.click();
  await expect(page).toHaveURL(/\/gioi-thieu\/#quy-trinh-che-bien$/);
  const section = page.locator("#quy-trinh-che-bien");
  await expect(section).toBeInViewport();
  await section.locator(".processing-step summary").first().click();
  await expect(section.locator(".processing-step").first()).toHaveAttribute("open", "");
});

test("home menu cycles through sorted groups of six or three every five seconds", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const grid = page.locator(
    ".menu-section .featured-meals[aria-hidden='false']",
  );
  const names = (numbers) =>
    numbers.map(
      (number) => `Suất ăn công nghiệp ${String(number).padStart(2, "0")}`,
    );
  await expect(grid.locator(".meal-card")).toHaveCount(6);
  await expect(grid.locator(".meal-card h3")).toHaveText(
    names([1, 2, 3, 4, 5, 6]),
  );
  await expect(grid).toHaveCSS("grid-template-columns", /px .*px .*px/);
  await page.clock.runFor(4000);
  await expect(grid.locator(".meal-card h3")).toHaveText(
    names([1, 2, 3, 4, 5, 6]),
  );
  await page.clock.runFor(1000);
  await expect(grid.locator(".meal-card h3")).toHaveText(
    names([7, 8, 9, 10, 11, 12]),
  );
  await page.clock.runFor(6000);
  await expect(grid.locator(".meal-card h3")).toHaveText(
    names([13, 14, 15, 16, 17, 18]),
  );
  await page.clock.runFor(6000);
  await expect(grid.locator(".meal-card h3")).toHaveText(
    names([19, 20, 21, 22, 1, 2]),
  );

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(grid.locator(".meal-card")).toHaveCount(6);
  await expect(grid).toHaveCSS("grid-template-columns", /px .*px .*px/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(grid.locator(".meal-card")).toHaveCount(3);
  await expect(grid.locator(".meal-card h3")).toHaveText(names([10, 11, 12]));
  await expect(grid).toHaveCSS("grid-template-columns", /^[\d.]+px$/);
  await page.clock.runFor(5000);
  await expect(grid.locator(".meal-card h3")).toHaveText(names([13, 14, 15]));
});

test("hero cycles through the three supplied posters every three seconds", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const activeImage = page.locator(".hero-slide.is-active img");
  await expect(activeImage).toHaveAttribute(
    "src",
    "/assets/home-menu-30-days.jpg",
  );
  await page.clock.runFor(2000);
  await expect(activeImage).toHaveAttribute(
    "src",
    "/assets/home-menu-30-days.jpg",
  );
  await page.clock.runFor(1000);
  await expect(activeImage).toHaveAttribute(
    "src",
    "/assets/home-services-poster.jpg",
  );
  await page.clock.runFor(3000);
  await expect(activeImage).toHaveAttribute(
    "src",
    "/assets/home-food-menu-poster.jpg",
  );
  await page.clock.runFor(3000);
  await expect(activeImage).toHaveAttribute(
    "src",
    "/assets/home-menu-30-days.jpg",
  );
  await page.getByRole("button", { name: /^Ảnh 3:/ }).click();
  await expect(activeImage).toHaveAttribute(
    "src",
    "/assets/home-food-menu-poster.jpg",
  );
});

test("each solution card rotates five supplied photos every five seconds", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const cards = page.locator(".solution-card");
  await expect(cards).toHaveCount(3);
  await cards.first().scrollIntoViewIfNeeded();
  for (const [index, group] of ["factory", "office", "contract"].entries()) {
    await expect(cards.nth(index).locator(".solution-slide")).toHaveCount(5);
    await expect(
      cards.nth(index).locator(".solution-slide.is-active img"),
    ).toHaveAttribute("src", `/assets/solution-${group}-01.jpg`);
  }
  await page.clock.runFor(4000);
  await expect(
    cards.first().locator(".solution-slide.is-active img"),
  ).toHaveAttribute("src", "/assets/solution-factory-01.jpg");
  await page.clock.runFor(1000);
  for (const [index, group] of ["factory", "office", "contract"].entries()) {
    await expect(
      cards.nth(index).locator(".solution-slide.is-active img"),
    ).toHaveAttribute("src", `/assets/solution-${group}-02.jpg`);
  }
  await page.clock.runFor(15000);
  await expect(
    cards.first().locator(".solution-slide.is-active img"),
  ).toHaveAttribute("src", "/assets/solution-factory-05.jpg");
  await page.clock.runFor(5000);
  await expect(
    cards.first().locator(".solution-slide.is-active img"),
  ).toHaveAttribute("src", "/assets/solution-factory-01.jpg");
  await expect(cards.first()).toHaveAttribute("href", "/giai-phap/#nha-may");
});

test("solution detail page reuses the five-photo sliders and keeps their five-second timing", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/giai-phap/");
  const sections = page.locator(".service-detail");
  await expect(sections).toHaveCount(3);
  await sections.first().scrollIntoViewIfNeeded();
  for (const [index, group] of ["factory", "office", "contract"].entries()) {
    await expect(sections.nth(index).locator(".solution-slide")).toHaveCount(5);
    await expect(
      sections.nth(index).locator(".solution-slide.is-active img"),
    ).toHaveAttribute("src", `/assets/solution-${group}-01.jpg`);
  }
  await page.clock.runFor(4000);
  await expect(
    sections.first().locator(".solution-slide.is-active img"),
  ).toHaveAttribute("src", "/assets/solution-factory-01.jpg");
  await page.clock.runFor(1000);
  for (const [index, group] of ["factory", "office", "contract"].entries()) {
    await expect(
      sections.nth(index).locator(".solution-slide.is-active img"),
    ).toHaveAttribute("src", `/assets/solution-${group}-02.jpg`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(sections.first().locator(".service-detail-image")).toBeVisible();
});

test("ISO certificates show one cover per document and all three pages when opened", async ({
  page,
}) => {
  await page.goto("/");
  const grid = page.locator(".certificate-grid");
  const cards = grid.locator(".certificate-card");
  await expect(cards).toHaveCount(10);
  await expect(cards.first()).toContainText(
    "Giấy chứng nhận đăng ký doanh nghiệp",
  );
  await expect(cards.nth(2)).toContainText("bếp Đồng Văn");
  await expect(cards.last()).toContainText("Đăng ký địa điểm kinh doanh số 01");
  const expectAlignedCaptions = async (columns) => {
    const tops = await cards.evaluateAll((items) =>
      items.map(
        (item) =>
          item.querySelector(".certificate-caption").getBoundingClientRect()
            .top,
      ),
    );
    for (let start = 0; start < tops.length; start += columns) {
      const row = tops.slice(start, start + columns);
      expect(Math.max(...row) - Math.min(...row)).toBeLessThanOrEqual(1);
    }
  };
  expect(
    (
      await grid.evaluate(
        (element) => getComputedStyle(element).gridTemplateColumns,
      )
    ).split(" ").length,
  ).toBe(5);
  await expectAlignedCaptions(5);
  await cards.first().click();
  await expect(page.getByRole("dialog").locator("a[download]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  for (const [index, id] of [
    [1, "head-office"],
    [2, "dong-van"],
    [3, "chau-son"],
  ]) {
    await cards.nth(index).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText(`${index + 1} / 10`);
    await expect(dialog.locator(".certificate-page")).toHaveCount(3);
    await expect(dialog.locator(".certificate-full").first()).toHaveAttribute(
      "src",
      `/assets/iso22000-${id}-vi.webp`,
    );
    await expect(dialog.locator(".certificate-full").nth(2)).toHaveAttribute(
      "src",
      `/assets/iso22000-${id}-decision.webp`,
    );
    await expect(dialog.locator("a[download]")).toHaveCount(0);
    await dialog.locator(".certificate-page").last().scrollIntoViewIfNeeded();
    expect(
      await dialog.evaluate((element) => element.scrollTop),
    ).toBeGreaterThan(0);
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 1024, height: 900 });
  await expectAlignedCaptions(3);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    (
      await grid.evaluate(
        (element) => getComputedStyle(element).gridTemplateColumns,
      )
    ).split(" ").length,
  ).toBe(2);
  await expectAlignedCaptions(2);
});

test("quote validates fields and prepares a real email without claiming delivery", async ({
  page,
}) => {
  await page.goto("/lien-he/");
  await page.locator("input[name=company]").fill("Doanh nghiệp thử nghiệm");
  await page.locator("input[name=name]").fill("Nguyễn An");
  await page.locator("input[name=phone]").fill("123");
  await page.locator("input[name=location]").fill("Ninh Bình");
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
  await expect(page.locator(".hero-slide.is-active")).toHaveCSS("opacity", "1");
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
