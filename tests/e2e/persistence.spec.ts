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

test("new barrier patch task resolves with its own threat-relief follow-up", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.tasks = [
      {
        id: "barrier-patch",
        title: "Patch barrier seams",
        description: "Bolt fresh plating across stress fractures before tonight's lane pressure finds the weak points.",
        owner: "Builder Oren",
        duration: "30 min",
        rewardLabel: "+2 scrap, +1 ammo",
        reward: { scrap: 2, ammo: 1 },
      },
      ...parsed.tasks.slice(0, 2),
    ];
    parsed.selectedTaskId = "barrier-patch";
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await page.getByRole("button", { name: /patch barrier seams/i }).click();
  await page.getByRole("button", { name: /complete task/i }).click();

  await expect(page.getByText(/shored lane plating/i).first()).toBeVisible();
  await expect(page.getByText(/source: patch barrier seams/i)).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();
  await expect(page.getByText(/shored lane plating/i).first()).toBeVisible();
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

test("active day modifier persists across reload and is visible on continue", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.activeDayModifier = {
      id: "heavy-fog",
      label: "Heavy fog",
      detail: "Route intel and lane reads are muddy. Visibility calls stay worse through this whole shift.",
      effectType: "intel_pressure",
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await expect(page.getByRole("button", { name: /continue run/i })).toBeVisible();
  await expect(page.getByText(/heavy fog/i).first()).toBeVisible();

  await page.getByRole("button", { name: /continue run/i }).click();
  await expect(page.getByText(/^modifier$/i)).toBeVisible();
  await expect(page.getByText(/heavy fog/i).first()).toBeVisible();
});

test("next successful day generates the next day modifier", async ({ page }) => {
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
    parsed.activeDayModifier = {
      id: "ammo-shortage",
      label: "Ammo shortage",
      detail: "Magazine reserves are thin. High-burn calls need cleaner execution today.",
      effectType: "resource_pressure",
    };
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
  await page.getByRole("button", { name: /advance to day 2/i }).click();

  await expect(page.getByText(/^modifier$/i)).toBeVisible();
  await expect(page.getByText(/ammo shortage/i).first()).toBeVisible();
});

test("ammo shortage modifier affects route planning copy and cost preview", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.activeDayModifier = {
      id: "ammo-shortage",
      label: "Ammo shortage",
      detail: "Magazine reserves are thin. High-burn calls need cleaner execution today.",
      effectType: "resource_pressure",
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await page.getByRole("button", { name: /market sweep/i }).click();
  await expect(page.getByText(/high-burn calls need cleaner execution today/i)).toBeVisible();
  await expect(page.getByText(/ammo shortage added \+1 ammo cost/i)).toBeVisible();
});

test("overcrowded infirmary modifier affects defense briefing copy", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.activeDayModifier = {
      id: "overcrowded-infirmary",
      label: "Overcrowded infirmary",
      detail: "Recovery throughput is stressed. Rotation and treatment choices carry extra weight today.",
      effectType: "recovery_pressure",
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByText(/recovery throughput is stressed/i)).toBeVisible();
  await expect(page.getByText(/post-defense recovery is less efficient today/i)).toBeVisible();
});

test("route role persists across reload and is visible on the mission board", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.missions = parsed.missions.map((mission: { kind: string }) => {
      if (mission.kind === "breach") {
        return { ...mission, routeRole: "high_yield" };
      }

      if (mission.kind === "cache") {
        return { ...mission, routeRole: "threat_control" };
      }

      return mission;
    });
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByRole("button", { name: /depot breach/i })).toContainText(/high yield/i);
  await page.getByRole("button", { name: /depot breach/i }).click();
  await expect(page.getByText(/route role/i)).toBeVisible();
  await expect(page.getByText(/big near-term payout with harsher wear/i).first()).toBeVisible();
});

test("threat-control routes queue next-day threat relief", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.missions = [
      {
        id: "cache-test-0",
        title: "Checkpoint Sweep // Short Window",
        zone: "Grid G-2",
        difficulty: "medium",
        kind: "cache",
        routeRole: "threat_control",
        description: "Clear an old checkpoint lane, secure leftover crates, and cut pursuit lines before dusk stacks pressure.",
        rewardLabel: "+3 ammo, +3 food, +1 scrap",
        risk: "Exposed approach lane",
        duration: "55 min",
        enemyHint: "Walkers screening the lane // pressure climbing",
        reward: { ammo: 3, food: 3, scrap: 1 },
        approaches: parsed.missions[0].approaches.map((approach: { id: string; label: string; detail: string; rewardModifier: Record<string, number>; cost: Record<string, number> }, index: number) => ({
          ...approach,
          id: `cache-test-0-${index === 0 ? "fast" : "careful"}`,
        })),
      },
      ...parsed.missions.slice(1),
    ];
    parsed.selectedMissionId = "cache-test-0";
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await page.getByRole("button", { name: /checkpoint sweep \/\/ short window/i }).click();
  await page.getByRole("button", { name: /careful pull/i }).click();

  await expect(page.getByText(/follow-up queued: pressure lane stabilized/i)).toBeVisible();
  await expect(page.getByText(/pressure lane stabilized/i).first()).toBeVisible();
  await expect(page.getByText(/source: checkpoint sweep \/\/ short window/i)).toBeVisible();
});

test("rescue routes can widen the recruitment board", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.missions = [
      {
        id: "rescue-test-0",
        title: "Signal Tower Extract // Last Light",
        zone: "Grid A-4",
        difficulty: "medium",
        kind: "rescue",
        routeRole: "rescue",
        description: "Push to a broken relay tower and pull trapped survivors plus med crates before the signal fire dies.",
        rewardLabel: "+5 medicine, +2 food, +1 ammo",
        risk: "Open rooftop exposure",
        duration: "65 min",
        enemyHint: "Runners and walkers below // pressure climbing",
        reward: { medicine: 4, food: 2, ammo: 1 },
        approaches: parsed.missions[1].approaches.map((approach: { id: string; label: string; detail: string; rewardModifier: Record<string, number>; cost: Record<string, number> }, index: number) => ({
          ...approach,
          id: `rescue-test-0-${index === 0 ? "fast" : "careful"}`,
        })),
      },
      ...parsed.missions.slice(1),
    ];
    parsed.selectedMissionId = "rescue-test-0";
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByRole("button", { name: /recruit survivor/i })).toBeVisible();
  const initialRecruitCount = await page.getByLabel(/^recruit /i).count();

  await page.getByRole("button", { name: /signal tower extract \/\/ last light/i }).click();
  await page.getByRole("button", { name: /careful pull/i }).click();

  await expect(page.getByText(/recruitment board widened by 1 candidate/i)).toBeVisible();
  const widenedRecruitCount = await page.getByLabel(/^recruit /i).count();
  expect(widenedRecruitCount).toBeGreaterThan(initialRecruitCount);
});

test("special night persists across reload and is surfaced in the defense briefing", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.activeSpecialNight = {
      id: "blackout_grid",
      label: "Blackout grid",
      detail: "The perimeter is dropping into a deeper blackout. Lane reads and visibility calls will be worse than usual.",
      effectType: "visibility_pressure",
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByText(/special night/i)).toBeVisible();
  await expect(page.getByText(/blackout grid/i).first()).toBeVisible();
  await expect(page.getByText(/lane reads and visibility calls will be worse than usual/i)).toBeVisible();
});

test("special night is carried into the night summary screen", async ({ page }) => {
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
    parsed.day = 4;
    parsed.activeSpecialNight = {
      id: "brute_surge",
      label: "Brute surge",
      detail: "Heavy bodies are converging on the line tonight. Expect harsher impact lanes and a tougher front.",
      effectType: "enemy_pressure",
    };
    parsed.lastCombatSummary = {
      status: "victory",
      title: "Perimeter held",
      detail: "The brute surge was held. All 3 wave groups were cleared before the line broke.",
      rewardLabel: "+6 scrap, +2 food, +4 ammo",
      wavesCleared: 3,
      specialNightLabel: "Brute surge",
      specialNightDetail: "Heavy bodies are converging on the line tonight. Expect harsher impact lanes and a tougher front.",
    };
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByText(/special night/i)).toBeVisible();
  await expect(page.getByText(/brute surge/i).first()).toBeVisible();
  await expect(page.getByText(/heavy bodies are converging on the line tonight/i)).toBeVisible();
});

test("mission board rotates from a larger route pool across days", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();
  await expect(page.getByRole("button", { name: /market sweep/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /signal tower extract/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /depot breach/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /checkpoint sweep/i })).toBeVisible();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.day = 2;
    parsed.threatLevel = "Escalating";
    parsed.missions = [
      {
        id: "scavenge-2-0",
        title: "Shelter Run // Dust Route",
        zone: "Grid F-3",
        difficulty: "medium",
        kind: "scavenge",
        routeRole: "support",
        description: "Pull sealed food tins and blankets from a half-collapsed shelter corridor before looters loop back.",
        rewardLabel: "+6 food, +1 medicine, +1 scrap",
        risk: "Tight interior lanes",
        duration: "50 min",
        enemyHint: "Walkers in clusters // pressure climbing",
        reward: { food: 5, medicine: 1, scrap: 1 },
        approaches: parsed.missions[0].approaches,
      },
      {
        id: "rescue-2-1",
        title: "Signal Tower Extract // Last Light",
        zone: "Grid A-4",
        difficulty: "medium",
        kind: "rescue",
        routeRole: "rescue",
        description: "Push to a broken relay tower and pull trapped survivors plus med crates before the signal fire dies.",
        rewardLabel: "+5 medicine, +2 food, +1 ammo",
        risk: "Open rooftop exposure",
        duration: "65 min",
        enemyHint: "Runners and walkers below // pressure climbing",
        reward: { medicine: 4, food: 2, ammo: 1 },
        approaches: parsed.missions[1].approaches,
      },
      {
        id: "breach-2-2",
        title: "Freight Lockdown // Open Channel",
        zone: "Grid H-5",
        difficulty: "high",
        kind: "breach",
        routeRole: "high_yield",
        description: "Crack open a jammed freight pen and strip machine parts before the noise wakes the whole corridor.",
        rewardLabel: "+10 scrap, +3 ammo, +1 food",
        risk: "Alarm-prone shell",
        duration: "70 min",
        enemyHint: "Brutes and runners near the choke",
        reward: { scrap: 8, ammo: 3, food: 1 },
        approaches: parsed.missions[2].approaches,
      },
      {
        id: "cache-2-3",
        title: "Checkpoint Sweep // Short Window",
        zone: "Grid G-6",
        difficulty: "medium",
        kind: "cache",
        routeRole: "threat_control",
        description: "Clear an old checkpoint lane, secure leftover crates, and cut pursuit lines before dusk stacks pressure.",
        rewardLabel: "+3 ammo, +3 food, +1 scrap",
        risk: "Exposed approach lane",
        duration: "55 min",
        enemyHint: "Walkers screening the lane // pressure climbing",
        reward: { ammo: 3, food: 3, scrap: 1 },
        approaches: parsed.missions[3].approaches,
      },
    ];
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByRole("button", { name: /shelter run/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /signal tower extract/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /freight lockdown/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /checkpoint sweep/i })).toBeVisible();
});

test("day events rotate from a larger event pool across days", async ({ page }) => {
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
    parsed.dayEvents = [
      {
        id: "event-2-0",
        title: "Broken ration convoy",
        detail: "A half-burned ration truck sits between sectors. Quick access is possible if the outpost moves fast.",
        risk: "Noise bloom",
        window: "Day 2 // Early shift",
        choices: parsed.dayEvents[0].choices,
      },
      {
        id: "event-2-1",
        title: "Collapsed relay post",
        detail: "A relay scaffold fell across a junction. Salvage crews want to strip it before the weather turns.",
        risk: "Structural instability",
        window: "Day 2 // Late shift",
        choices: parsed.dayEvents[1].choices,
      },
    ];
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByRole("button", { name: /broken ration convoy/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /collapsed relay post/i })).toBeVisible();
});

test("task queue rotates from a wider task pool while staying compact", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();
  await expect(page.getByRole("button", { name: /sort ration stock/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /prep field triage/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /tune signal relay/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /patch barrier seams/i })).toHaveCount(0);

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.day = 3;
    parsed.tasks = [
      {
        id: "med-triage",
        title: "Prep field triage",
        description: "Stage bandages and antibiotics in the infirmary for quick-return scavenger teams.",
        owner: "Medic Rune",
        duration: "25 min",
        rewardLabel: "+2 medicine, +1 food",
        reward: { medicine: 2, food: 1 },
      },
      {
        id: "barrier-patch",
        title: "Patch barrier seams",
        description: "Bolt fresh plating across stress fractures before tonight's lane pressure finds the weak points.",
        owner: "Builder Oren",
        duration: "30 min",
        rewardLabel: "+2 scrap, +1 ammo",
        reward: { scrap: 2, ammo: 1 },
      },
      {
        id: "signal-relay",
        title: "Tune signal relay",
        description: "Retune the rooftop relay so runner crews can pass cleaner route pings through the static.",
        owner: "Scout Inez",
        duration: "18 min",
        rewardLabel: "+2 scrap, +1 medicine",
        reward: { scrap: 2, medicine: 1 },
      },
    ];
    parsed.selectedTaskId = "signal-relay";
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await expect(page.getByRole("button", { name: /prep field triage/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /patch barrier seams/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /tune signal relay/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /sort ration stock/i })).toHaveCount(0);
});

test("new rooftop signal nest event creates a distinct follow-up", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start new run/i }).click();

  await page.evaluate(() => {
    const key = "dead-grid-outpost/save-v1";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      throw new Error("expected saved run state");
    }

    const parsed = JSON.parse(raw);
    parsed.dayEvents = [
      {
        id: "event-custom-0",
        title: "Rooftop signal nest",
        detail: "A scavenger beacon is pulsing from a rooftop nest. It could reveal a clean route corridor or draw unwanted eyes.",
        risk: "Line-of-sight exposure",
        window: "Day 1 // Early shift",
        choices: [
          {
            id: "event-custom-0-choice-a",
            label: "Climb and mark routes",
            effectLabel: "+ammo and medicine, lowers tomorrow pressure",
            reward: { ammo: 2, medicine: 2 },
          },
          {
            id: "event-custom-0-choice-b",
            label: "Stay below the skyline",
            effectLabel: "+food and steady supplies",
            reward: { food: 2, scrap: 1 },
          },
        ],
      },
      parsed.dayEvents[1],
    ];
    parsed.selectedEventId = "event-custom-0";
    window.localStorage.setItem(key, JSON.stringify(parsed));
  });

  await page.reload();
  await page.getByRole("button", { name: /continue run/i }).click();

  await page.getByRole("button", { name: /rooftop signal nest/i }).click();
  await page.getByRole("button", { name: /climb and mark routes/i }).click();

  await expect(page.getByText(/follow-up queued: marked quiet corridor/i)).toBeVisible();
  await expect(page.getByText(/marked quiet corridor/i).first()).toBeVisible();
  await expect(page.getByText(/source: rooftop signal nest/i)).toBeVisible();
});
