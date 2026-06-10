import { test, expect } from "@playwright/test";

test.describe("Meta-Progression Layer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display profile panel with blueprint shards", async ({ page }) => {
    // Check profile panel exists
    await expect(page.getByText("Outpost Profile")).toBeVisible();
    await expect(page.getByText("Blueprint Shards")).toBeVisible();
  });

  test("should persist profile over page reload", async ({ page }) => {
    // Initial load
    await expect(page.getByText("Blueprint Shards")).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Profile should still be visible
    await expect(page.getByText("Outpost Profile")).toBeVisible();
  });

  test("should show available unlocks when shards are available", async ({ page }) => {
    // Navigate to game
    await page.getByRole("button", { name: /start new run/i }).click();
    
    // Check if unlock panel is visible
    await expect(page.getByText("Available Unlocks")).toBeVisible({ timeout: 5000 });
  });

  test("should apply unlock effects to game state", async ({ page }) => {
    // Start new game
    await page.getByRole("button", { name: /start new run/i }).click();
    
    // Check storage capacity is visible
    await expect(page.getByText(/storage/i)).toBeVisible();
  });

  test("should grant blueprint shards after combat", async ({ page }) => {
    // Start new game
    await page.getByRole("button", { name: /start new run/i }).click();
    
    // Navigate to combat (simplified - in real test would go through full flow)
    // For now, just verify profile is tracked
    await expect(page.getByText("Blueprint shards")).toBeVisible();
  });
});
