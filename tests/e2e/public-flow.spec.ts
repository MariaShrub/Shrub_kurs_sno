import { test, expect } from "@playwright/test";

test("публичный флоу: главная → состав → подача заявки", async ({ page }) => {

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: /Раскройте свой/i }).first(),
  ).toBeVisible();

  await page.getByRole("link", { name: "Состав" }).first().click();
  await expect(page).toHaveURL("/members");
  await expect(page.getByRole("heading", { name: /Состав СНО/i })).toBeVisible();

  await page.goto("/apply");
  await expect(
    page.getByRole("heading", { name: /Стань частью/i }),
  ).toBeVisible();

  const stamp = Date.now();
  await page.locator('input[name="firstName"]').fill("Тест");
  await page.locator('input[name="lastName"]').fill("Тестов");
  await page.locator('input[name="email"]').fill(`apply-${stamp}@test.local`);
  await page.locator('input[name="institute"]').fill("Институт тестирования");
  await page
    .locator('textarea[name="motivation"]')
    .fill(
      "Хочу вступить в СНО для развития научных навыков и публикации работ.",
    );
  await page.getByRole("button", { name: /Отправить заявку/i }).click();

  await expect(page.getByText("Заявка принята!")).toBeVisible({ timeout: 10000 });
});

test("анонимный пользователь не может попасть в /admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

test("гостю в шапке показывается кнопка Кабинет", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.locator("header").getByRole("link", { name: "Кабинет" }),
  ).toBeVisible();
});
