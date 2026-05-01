import { test, expect, request } from "@playwright/test";

test("админский флоу: логин → одобрение заявки → проверка статуса", async ({
  page,
}) => {
  const stamp = Date.now();
  const recipient = `e2e-${stamp}@test.local`;
  const lastName = `User${stamp}`;
  const trpc = await request.newContext({ baseURL: "http://localhost:3000" });
  const submitRes = await trpc.post("/api/trpc/applications.submitJoin", {
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
    data: {
      json: {
        firstName: "E2E",
        lastName,
        email: recipient,
        institute: "Тестовый институт",
        course: 2,
        motivation:
          "Заявка из автотеста Playwright для проверки админского флоу.",
      },
    },
  });
  expect(submitRes.ok()).toBeTruthy();

  await page.goto("/login");
  await page.locator('input[type="email"]').fill("admin@sno.local");
  await page.locator('input[type="password"]').fill("admin123");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();

  await page.goto("/admin/applications");
  await expect(page.getByText(lastName)).toBeVisible();
  const row = page.locator("tr", { hasText: lastName });
  await row.getByRole("button", { name: "Одобрить" }).click();
  await page.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.getByText(/Статус обновлён/i)).toBeVisible({
    timeout: 10000,
  });

  const listApi = await request.newContext({ baseURL: "http://localhost:3000" });
  const cookies = await page.context().cookies();
  const cookieHeader = cookies
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const listRes = await listApi.get(
    "/api/trpc/applications.listJoin?input=" +
      encodeURIComponent('{"json":{"status":"approved"}}'),
    { headers: { cookie: cookieHeader } },
  );
  expect(listRes.ok()).toBeTruthy();
  const body = (await listRes.json()) as {
    result: { data: { json: Array<{ lastName: string; status: string }> } };
  };
  const ours = body.result.data.json.find((a) => a.lastName === lastName);
  expect(ours).toBeDefined();
  expect(ours?.status).toBe("approved");

  await page.goto("/members");
  await expect(page.getByText(lastName)).toBeVisible();
});

test("гость не видит ссылок на админку и страницы CRUD", async ({ page }) => {
  await page.goto("/admin/members");
  await expect(page).toHaveURL(/\/login$/);
});
