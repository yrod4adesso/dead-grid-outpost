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

test("critical threat persists across reload and is surfaced in route and defense planning", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.day = 5;
    parsed.threatLevel = "Critical";
    parsed.lastSavedLabel = "Autosaved // day 5";
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();

  await expect(page.getByRole("button", { name: /continue run/i })).toBeVisible();
  await expect(page.getByText(/^critical$/i)).toBeVisible();

  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByText(/perimeter strain is severe/i).first()).toBeVisible();
  await page.getByRole("button", { name: /market sweep/i }).click();
  await expect(page.getByText(/route pressure: critical/i)).toBeVisible();
});

test("mission wear persists across reload and remains visible in survivor cards", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();
  await page.getByRole("button", { name: /market sweep/i }).click();
  await page.getByRole("button", { name: /fast entry/i }).click();

  await expect(page.getByText(/mission resolved: market sweep/i)).toBeVisible();
  await expect(page.getByText(/injured/i).first()).toBeVisible();
  await expect(page.getByText(/fatigued/i).first()).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByText(/injured/i).first()).toBeVisible();
  await expect(page.getByText(/fatigued/i).first()).toBeVisible();
});

test("worn mission crews can still launch but are shown as degraded", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.selectedMissionTeamIds = ["survivor-vale", "survivor-rune"];
    parsed.survivors = parsed.survivors.map((survivor: { id: string; status: string }) =>
      survivor.id === "survivor-vale" || survivor.id === "survivor-rune"
        ? { ...survivor, status: "fatigued" }
        : survivor,
    );
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await page.getByRole("button", { name: /market sweep/i }).click();
  await expect(page.getByText(/2 worn \/ 0 ready/i)).toBeVisible();
  await expect(page.getByText(/fully worn route crew/i)).toBeVisible();

  const fastEntryButton = page.getByRole("button", { name: /fast entry/i });
  await expect(fastEntryButton).toBeEnabled();
  await fastEntryButton.click();
  await expect(page.getByText(/mission resolved: market sweep/i)).toBeVisible();
});

test("event follow-up consequences persist across reload and remain visible", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();
  await page.getByRole("button", { name: /transit flare/i }).click();
  await page.getByRole("button", { name: /investigate/i }).click();

  await expect(page.getByText(/pending consequences/i)).toBeVisible();
  await expect(page.getByText(/noise trail coming in/i).first()).toBeVisible();
  await expect(page.getByText(/source: transit flare/i)).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: /continue run/i })).toBeVisible();

  await page.getByRole("button", { name: /continue run/i }).click();
  await expect(page.getByText(/noise trail coming in/i).first()).toBeVisible();
  await expect(page.getByText(/day 2/i)).toBeVisible();
});

test("task follow-up consequences persist across reload and remain visible", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();
  await page.getByRole("button", { name: /prep field triage/i }).click();
  await page.getByRole("button", { name: /complete task/i }).click();

  await expect(page.getByText(/prepared triage buffer/i).first()).toBeVisible();
  await expect(page.getByText(/source: prep field triage/i)).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();
  await expect(page.getByText(/prepared triage buffer/i).first()).toBeVisible();
});

test("resolved follow-up consequences clear from pending and remain in activity history", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.day = 2;
    parsed.phase = "outpost";
    parsed.pendingConsequences = [];
    parsed.activityLog = [
      {
        id: "resolved-pending-log",
        title: "Consequence resolved: Quiet ration window",
        detail: "Transit flare landed on day 2. Holding position leaves a small support window that can pay out supplies tomorrow.",
        timestamp: "07:20",
      },
      ...parsed.activityLog,
    ];
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByText(/no queued follow-up pressure/i)).toBeVisible();
  await expect(page.getByText(/consequence resolved: quiet ration window/i)).toBeVisible();
});
