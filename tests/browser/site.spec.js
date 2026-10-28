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
  ).toHaveAttribute("href", "/services/");
  await expect(page.locator(".header-quote")).toHaveText("Nhận báo giá");
  await navigation
    .getByRole("link", { name: "Hình ảnh thực tế", exact: true })
    .click();
  await expect(page).toHaveURL(/\/galleries\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nhìn thấy cách làm");
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

test("home presents mission, vision and core values together", async ({ page }) => {
  await page.goto("/");
  const section = page.locator(".promise-section");
  await expect(section.getByRole("heading", { name: "Sứ mệnh & Tầm nhìn" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Sứ mệnh", exact: true })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Tầm nhìn", exact: true })).toBeVisible();
  const values = section.locator(".promise-values");
  await expect(values).toHaveAttribute("aria-label", "Giá trị cốt lõi của Thúy Luân");
  await expect(values.locator(".core-value h3")).toHaveText([
    "Tận tâm", "Đạo đức", "Tôn trọng", "Tuân thủ",
  ]);
  await expect(values.locator(".core-value-number")).toHaveText(["1", "2", "3", "4"]);
  await expect(values.locator(".core-values-badge")).toBeVisible();
  await expect(section).not.toContainText("GIÁ TRỊ CỦA MỘT ĐỐI TÁC");
  await expect(page.locator(".process-section .core-values-board")).toHaveCount(0);
  const photoBox = await section.locator(".promise-photo").boundingBox();
  const copyBox = await section.locator(".promise-copy").boundingBox();
  const valuesBox = await values.boundingBox();
  const boardBox = await values.locator(".core-values-board").boundingBox();
  const aboutLink = values.getByRole("link", { name: "Hiểu thêm về Thúy Luân" });
  const linkBox = await aboutLink.boundingBox();
  await expect(aboutLink).toHaveAttribute("href", "/about/");
  expect(photoBox.x).toBeGreaterThan(valuesBox.x + valuesBox.width - 1);
  expect(Math.abs(valuesBox.x - copyBox.x)).toBeLessThan(2);
  expect(valuesBox.y).toBeGreaterThan(copyBox.y + copyBox.height - 1);
  expect(Math.abs(photoBox.y - copyBox.y)).toBeLessThan(2);
  expect(Math.abs(photoBox.y + photoBox.height - valuesBox.y - valuesBox.height)).toBeLessThan(2);
  const photoImage = section.locator(".promise-photo img");
  await expect(photoImage).toHaveAttribute("src", "/assets/kitchen-process-thuy-luan.png");
  const imageBox = await photoImage.boundingBox();
  expect(Math.abs(imageBox.y - copyBox.y)).toBeLessThan(2);
  expect(Math.abs(imageBox.y + imageBox.height - valuesBox.y - valuesBox.height)).toBeLessThan(2);
  await expect(section.locator(".promise-photo a")).toHaveCount(0);
  expect(Math.abs(boardBox.x + boardBox.width / 2 - valuesBox.x - valuesBox.width / 2)).toBeLessThan(2);
  expect(linkBox.y).toBeGreaterThan(boardBox.y + boardBox.height);

  await page.setViewportSize({ width: 1896, height: 1000 });
  const wideCopyBox = await section.locator(".promise-copy").boundingBox();
  const wideValuesBox = await values.boundingBox();
  const wideImageBox = await photoImage.boundingBox();
  expect(Math.abs(wideImageBox.y - wideCopyBox.y)).toBeLessThan(2);
  expect(Math.abs(wideImageBox.y + wideImageBox.height - wideValuesBox.y - wideValuesBox.height)).toBeLessThan(2);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileCopyBox = await section.locator(".promise-copy").boundingBox();
  const mobileValuesBox = await values.boundingBox();
  const mobilePhotoBox = await section.locator(".promise-photo").boundingBox();
  expect(mobileValuesBox.y).toBeGreaterThanOrEqual(mobileCopyBox.y + mobileCopyBox.height - 1);
  expect(mobilePhotoBox.y).toBeGreaterThanOrEqual(mobileValuesBox.y + mobileValuesBox.height - 1);
});

test("catalog uses ascending menu numbers and supports search, saved menus and prefilled quotation", async ({
  page,
}) => {
  await page.goto("/menus/");
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
  await page.goto("/galleries/");
  await expect(page.locator(".photo-tile")).toHaveCount(48);
  await page.getByRole("button", { name: /Xem thêm \(59 ảnh\)/ }).click();
  await expect(page.locator(".photo-tile")).toHaveCount(96);
  await page.getByRole("button", { name: "Hoạt động tập thể", exact: true }).click();
  await expect(page.locator(".photo-tile")).toHaveCount(33);
  await expect(page.locator(".photo-tile").first()).toHaveAttribute(
    "aria-label",
    /Tập thể Thúy Luân tại chương trình tổng kết cuối năm/,
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

test("home gallery keeps all four folders and shows the video separately", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const folders = page.locator(".gallery-category-showcase .photo-tile");
  await expect(folders).toHaveCount(4);
  const folderList = await folders.all();
  const categorySlugs = ["service", "kitchen", "team-activities", "delivery"];
  for (const [index, folder] of folderList.entries()) {
    await expect(folder.locator("img")).toHaveCount(5);
    await expect(folder).toHaveAttribute("href", `/galleries/?category=${categorySlugs[index]}`);
  }
  for (const [index, photo] of ["01", "02", "03", "09", "18"].entries()) {
    await expect(folderList[2].locator("img").nth(index)).toHaveAttribute(
      "src",
      `/assets/gallery-tap-the-${photo}.webp`,
    );
  }
  await expect(folderList[1]).toHaveAttribute("aria-label", "Xem thư viện Không gian bếp");
  const videoFeature = page.locator(".gallery-section > .gallery-video-feature");
  await expect(videoFeature).toHaveAttribute("aria-label", "Phát video giới thiệu Thúy Luân");
  await expect(videoFeature.locator("img")).toHaveAttribute(
    "src",
    "/assets/video-gioi-thieu-thuy-luan-poster.webp",
  );
  await expect(page.locator(".gallery-video-modal video")).toHaveCount(0);
  const firstImages = await Promise.all(
    folderList.map((folder) => folder.locator("img.is-active").getAttribute("src")),
  );
  await page.clock.runFor(3000);
  for (const [index, folder] of folderList.entries()) {
    await expect(folder.locator("img.is-active")).not.toHaveAttribute("src", firstImages[index]);
  }
  await page.clock.runFor(6000);
  await expect(folderList[2].locator("img.is-active")).toHaveAttribute(
    "src",
    "/assets/gallery-tap-the-09.webp",
  );
  await page.clock.runFor(6000);
  await expect(folderList[2].locator("img.is-active")).toHaveAttribute(
    "src",
    "/assets/gallery-tap-the-01.webp",
  );
  await videoFeature.click();
  await expect(page.getByRole("dialog", { name: "Video giới thiệu Thúy Luân" })).toBeVisible();
  await expect(page.locator(".gallery-video-modal video source")).toHaveAttribute(
    "src",
    "/assets/video-gioi-thieu-thuy-luan.mp4",
  );
  await expect
    .poll(() => page.locator(".gallery-video-modal video").evaluate((video) => video.videoWidth))
    .toBe(854);
  await page.getByRole("dialog", { name: "Video giới thiệu Thúy Luân" })
    .getByRole("button", { name: "Đóng" })
    .click();
  await expect(page.locator(".gallery-video-modal video")).toHaveCount(0);

  await page.getByRole("link", { name: "Xem thư viện Hoạt động tập thể" }).click();
  await expect(page).toHaveURL(/\/galleries\/\?category=team-activities$/);
  await expect(page.getByRole("button", { name: "Hoạt động tập thể", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".gallery-page .photo-tile")).toHaveCount(33);
});

test("about introduction rotates five company photos every three seconds", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/about/");
  const slider = page.locator(".about-intro-visual");
  await expect(slider.locator("img")).toHaveCount(5);
  const active = slider.locator("img.is-active");
  await expect(active).toHaveAttribute("src", "/assets/gallery-17.webp");
  await page.clock.runFor(3000);
  await expect(active).toHaveAttribute("src", "/assets/gallery-bep-07.webp");
});

test("about gallery matches the home gallery", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/about/");
  await expect(page.locator(".document-section")).toHaveCount(0);
  const gallery = page.locator(".gallery-section");
  await expect(gallery).toContainText("TỪ NHỮNG ĐIỀU THỰC TẾ");
  await expect(gallery.getByRole("heading", { name: /Nhìn gần hơn.*Tin tưởng nhiều hơn/ })).toBeVisible();
  const folders = gallery.locator(".gallery-category-showcase .photo-tile");
  await expect(folders).toHaveCount(4);
  const slugs = ["service", "kitchen", "team-activities", "delivery"];
  for (const [index, folder] of (await folders.all()).entries()) {
    await expect(folder.locator("img")).toHaveCount(5);
    await expect(folder).toHaveAttribute("href", `/galleries/?category=${slugs[index]}`);
  }
  await expect(folders.nth(2).locator("img").first()).toHaveAttribute(
    "src",
    "/assets/gallery-tap-the-01.webp",
  );
  await expect(gallery.locator(".gallery-video-feature")).toHaveAttribute(
    "aria-label",
    "Phát video giới thiệu Thúy Luân",
  );
  const firstImage = await folders.first().locator("img.is-active").getAttribute("src");
  await page.clock.runFor(3000);
  await expect(folders.first().locator("img.is-active")).not.toHaveAttribute("src", firstImage);
  await page.getByRole("link", { name: "Xem thư viện Hoạt động tập thể" }).click();
  await expect(page).toHaveURL(/\/galleries\/\?category=team-activities$/);
});

test("about page shows five processing steps with expandable instructions", async ({
  page,
}) => {
  await page.goto("/about/");
  const missionVision = page.locator(".org-chart + .mission-vision");
  await expect(missionVision.getByRole("heading", { name: "Sứ mệnh & Tầm nhìn" })).toBeVisible();
  await expect(missionVision.getByRole("heading", { name: "Sứ mệnh", exact: true })).toBeVisible();
  await expect(missionVision.getByRole("heading", { name: "Tầm nhìn", exact: true })).toBeVisible();
  await expect(missionVision).not.toContainText(/Mission|Vision|Clean|Delicious|Safe|Quality/);
  const coreValues = page.locator(".mission-vision + .core-values");
  const valuesSectionBox = await coreValues.boundingBox();
  const valuesHeadingBox = await coreValues.locator(".core-values-heading").boundingBox();
  const valuesBoardBox = await coreValues.locator(".core-values-board").boundingBox();
  expect(valuesBoardBox.y).toBeGreaterThan(valuesHeadingBox.y + valuesHeadingBox.height);
  expect(Math.abs(valuesBoardBox.x + valuesBoardBox.width / 2 - valuesSectionBox.x - valuesSectionBox.width / 2)).toBeLessThan(2);
  const kitchenLayout = page.locator(".core-values + .kitchen-layout");
  await expect(kitchenLayout).toHaveCount(1);
  await expect(kitchenLayout.getByRole("heading", { name: "Phương án tổ chức không gian bếp." })).toBeVisible();
  await expect(kitchenLayout.locator("img")).toHaveCount(0);
  const setupSteps = kitchenLayout.locator(".kitchen-layout-steps > li");
  await expect(setupSteps.locator("h3")).toHaveText([
    "Khảo sát mặt bằng",
    "Thiết kế bản vẽ 2D",
    "Duyệt 2D & thiết kế 3D",
    "Lắp đặt hệ thống bếp",
    "Vận hành thử & bàn giao",
  ]);
  const stepsBox = await kitchenLayout.locator(".kitchen-layout-steps").boundingBox();
  const headingBox = await kitchenLayout.locator(".core-values-heading").boundingBox();
  expect(stepsBox.x).toBeGreaterThan(headingBox.x + headingBox.width);
  const section = page.locator(".kitchen-layout + .processing-section");
  await expect(section).toHaveCount(1);
  const organizationImage = page.locator(".org-chart-figure img");
  const orgFigureBox = await page.locator(".org-chart-figure").boundingBox();
  const orgHeadingBox = await page.locator(".org-chart .core-values-heading").boundingBox();
  expect(orgFigureBox.x).toBeGreaterThan(orgHeadingBox.x + orgHeadingBox.width);
  expect(orgFigureBox.width).toBeLessThanOrEqual(760);
  await expect(organizationImage).toHaveAttribute("src", "/assets/document-organization.png");
  await expect(page.locator(".org-chart-figure a")).toHaveAttribute("href", "/assets/document-organization.png");
  await organizationImage.evaluate((image) => image.decode());
  expect(await organizationImage.evaluate((image) => [image.naturalWidth, image.naturalHeight])).toEqual([1536, 1024]);
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
  await expect(page.locator(".document-section .document-list").getByRole("link", {
    name: /Thiết lập bếp ăn/,
  })).toHaveAttribute("href", "/about/#quy-trinh-thiet-lap-bep");
  const link = page.locator(".document-section .document-list").getByRole("link", {
    name: /Quy trình chế biến/,
  });
  await expect(link).toHaveAttribute("href", "/about/#quy-trinh-che-bien");
  await link.click();
  await expect(page).toHaveURL(/\/about\/#quy-trinh-che-bien$/);
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
  await expect(cards.first()).toHaveAttribute("href", "/services/#nha-may");
});

test("solution detail page reuses the five-photo sliders and keeps their five-second timing", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/services/");
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
  const showMore = page.locator("#certificates").getByRole("button", { name: "Xem thêm", exact: true });
  await expect(cards).toHaveCount(10);
  await expect(showMore).toHaveCount(0);
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
  await page.goto("/contacts/");
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
  await expect(page).toHaveURL(/\/menus\//);
  for (const path of [
    "/",
    "/menus/",
    "/about/",
    "/services/",
    "/galleries/",
    "/contacts/",
    "/news/",
    "/menus/industrial-meal-19/",
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
