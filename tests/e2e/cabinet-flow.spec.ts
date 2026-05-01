import { test, expect } from "@playwright/test";
import postgres from "postgres";

test.beforeAll(async () => {
  // Используем 127.0.0.1, а не localhost: на Windows localhost резолвится
  // в ::1 (IPv6), а Docker пробрасывает порт только на IPv4 — postgres-js
  // падает с AggregateError.
  const url =
    process.env.DATABASE_URL ?? "postgres://sno:sno@127.0.0.1:5440/sno";
  const sql = postgres(url.replace("localhost", "127.0.0.1"), {
    max: 1,
    idle_timeout: 1,
    connect_timeout: 5,
  });
  try {
    await sql`DELETE FROM conference_application WHERE email = 'member@sno.local'`;
  } catch (e) {
    // Чистка — best-effort. Если БД недоступна или таблица пустая —
    // всё равно даём тестам шанс запуститься.
    console.warn("[cleanup] skip:", (e as Error).message);
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }
});

test("кабинет участника: вход → подача заявки на конференцию → видна в кабинете", async ({
  page,
  request,
}) => {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("member@sno.local");
  await page.locator('input[type="password"]').fill("member123");
  await page.getByRole("button", { name: "Войти" }).click();

  await page.waitForURL(/\/cabinet$/, { timeout: 10000 });
  await expect(
    page.getByRole("heading", { name: /Ваш профиль в СНО/i }),
  ).toBeVisible();

  const eventsRes = await request.get(
    "/api/trpc/events.list?input=" +
      encodeURIComponent('{"json":{"type":"conference","upcomingOnly":true}}'),
  );
  const eventsBody = (await eventsRes.json()) as {
    result: { data: { json: Array<{ id: string; sections: string[] }> } };
  };
  const conf = eventsBody.result.data.json[0];
  expect(conf, "Должна быть хотя бы одна предстоящая конференция").toBeDefined();

  await page.goto(`/events/${conf.id}`);

  await expect(
    page.getByRole("heading", { name: /Записаться на конференцию/i }),
  ).toBeVisible();
  await expect(
    page.locator("form").getByText("member@sno.local"),
  ).toBeVisible();

  await page.getByRole("button", { name: /Я с докладом/i }).click();

  const stamp = Date.now();
  const topic = `Тема автотеста ${stamp}`;
  await page.locator('input[name="topic"]').fill(topic);
  await page
    .locator('textarea[name="abstract"]')
    .fill("Аннотация из автотеста Playwright.");

  await page
    .locator("form")
    .getByRole("button", { name: /^Записаться$/ })
    .click();

  await expect(page.getByText(/ожидает рассмотрения/i)).toBeVisible({
    timeout: 10000,
  });

  await page.goto("/cabinet");
  await page.getByRole("tab", { name: /Заявки/i }).click();
  await expect(page.getByText(topic)).toBeVisible({ timeout: 5000 });
});

test("админская страница защищена от обычного участника", async ({ page }) => {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("member@sno.local");
  await page.locator('input[type="password"]').fill("member123");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL(/\/cabinet$/, { timeout: 10000 });

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/cabinet$/);
});
