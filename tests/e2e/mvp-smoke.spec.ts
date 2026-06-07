import { expect, test } from "@playwright/test";

test("mvp smoke path: start, route, defense", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: /start new run/i })).toBeVisible();
  await page.getByRole("button", { name: /start new run/i }).click();

  await expect(page.getByRole("heading", { name: /outpost halcyon/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /mission board/i })).toBeVisible();

  await page.getByRole("button", { name: /market sweep/i }).click();
  await expect(page.getByText(/selected mission/i)).toBeVisible();

  await page.getByRole("button", { name: /fast entry/i }).click();
  await expect(page.getByRole("heading", { name: /recent activity/i })).toBeVisible();
  await expect(page.getByText(/mission resolved: market sweep/i)).toBeVisible();

  await page.getByRole("button", { name: /start night defense/i }).click();
  await expect(page.getByText(/night defense/i)).toBeVisible();
  await expect(page.getByText(/priority lane/i)).toBeVisible();
  await expect(page.getByText(/target profile/i)).toBeVisible();
});
