import { expect, test } from "@playwright/test";

test("resolved mission progress survives reload and explicit continue", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();
  await expect(page.getByRole("heading", { name: /outpost halcyon/i })).toBeVisible();

  await page.getByRole("button", { name: /market sweep/i }).click();
  await page.getByRole("button", { name: /fast entry/i }).click();

  await expect(page.getByText(/mission resolved: market sweep/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /market sweep/i })).toContainText(/cleared/i);

  await page.reload();

  await expect(page.getByRole("button", { name: /continue run/i })).toBeVisible();
  await expect(page.getByText(/saved run ready/i)).toBeVisible();

  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByRole("heading", { name: /outpost halcyon/i })).toBeVisible();
  await expect(page.getByText(/mission resolved: market sweep/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /market sweep/i })).toContainText(/cleared/i);
});

test("returning from a terminal run clears resume eligibility across reload", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.phase = "ended";
    parsed.day = 4;
    parsed.threatLevel = "Breached";
    parsed.combatBlueprint = null;
    parsed.lastCombatSummary = {
      status: "defeat",
      title: "Barricade failed",
      detail: "The line collapsed after 1 cleared wave group.",
      rewardLabel: "Lost 2 food, 3 ammo",
      wavesCleared: 1,
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();

  await expect(page.getByText(/run ended/i)).toBeVisible();
  await page.getByRole("button", { name: /return to landing/i }).click();
  await expect(page.getByRole("button", { name: /continue run/i })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("button", { name: /continue run/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /start new run/i })).toBeVisible();
});
