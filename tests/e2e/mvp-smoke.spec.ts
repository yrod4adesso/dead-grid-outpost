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

test("landing can continue a saved run explicitly", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();
  await expect(page.getByRole("heading", { name: /outpost halcyon/i })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("button", { name: /continue run/i })).toBeVisible();
  await expect(page.getByText(/saved run ready/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /outpost halcyon/i })).toHaveCount(0);

  await page.getByRole("button", { name: /continue run/i }).click();
  await expect(page.getByRole("heading", { name: /outpost halcyon/i })).toBeVisible();
});

test("victory summary is shown before returning to the outpost loop", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.phase = "summary";
    parsed.day = 2;
    parsed.threatLevel = "Watching";
    parsed.combatBlueprint = null;
    parsed.lastCombatSummary = {
      status: "victory",
      title: "Perimeter held",
      detail: "All 3 wave groups were cleared before the line broke.",
      rewardLabel: "+4 scrap, +2 food, +4 ammo",
      wavesCleared: 3,
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();

  await page.getByRole("button", { name: /continue run/i }).click();
  await expect(page.getByText(/night defense complete/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /advance to day 2/i })).toBeVisible();

  await page.getByRole("button", { name: /advance to day 2/i }).click();
  await expect(page.getByRole("heading", { name: /outpost halcyon/i })).toBeVisible();
  await expect(page.getByText(/sector grid \/\/ day 2/i)).toBeVisible();
});

test("ended run is terminal and not resumable from landing", async ({ page }) => {
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
    parsed.day = 3;
    parsed.threatLevel = "Breached";
    parsed.combatBlueprint = null;
    parsed.lastCombatSummary = {
      status: "defeat",
      title: "Barricade failed",
      detail: "The line collapsed after 2 cleared wave groups.",
      rewardLabel: "Lost 2 food, 3 ammo",
      wavesCleared: 2,
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();

  await expect(page.getByText(/run ended/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /continue run/i })).toHaveCount(0);

  await page.getByRole("button", { name: /return to landing/i }).click();
  await expect(page.getByRole("button", { name: /start new run/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /continue run/i })).toHaveCount(0);
});
