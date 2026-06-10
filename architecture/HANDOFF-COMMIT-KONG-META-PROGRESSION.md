# Handoff: Meta Progression Layer Implementation

**From:** Lord Schema (Architecture Review)  
**To:** Commit Kong (Implementation)  
**Date:** 2026-06-09  
**Mode:** Starship  
**Status:** ✅ GO for Implementation

---

## Task Overview

Implement the Meta Progression Layer gemäß META_PROGRESSION_LAYER_SPEC.md und ADR-001.

**Ziel:** Spieler macht auch bei Defeat langfristigen Fortschritt via Blueprint Shards und Unlock-Tree.

---

## Implementation Tasks

### Task 1: Reward Grant Logic

**File:** `src/lib/game/state.ts`

Implementiere:

```typescript
export function getBlueprintShardReward(
  day: number,
  threatLevel: ThreatLevel,
  outcome: "victory" | "defeat"
): number {
  // Formel:
  // - Victory: base = day, bonus bei höheren Days
  // - Defeat: base = floor(day / 2), minimum 1
  // - Threat-Level Modifier: Watching=1.0, Escalating=1.2, Critical=1.5, Breached=0.8
  
  const baseReward = outcome === "victory" ? day : Math.max(1, Math.floor(day / 2));
  
  const threatMultipliers: Record<ThreatLevel, number> = {
    "Watching": 1.0,
    "Escalating": 1.2,
    "Critical": 1.5,
    "Breached": 0.8
  };
  
  const multiplier = threatMultipliers[threatLevel] || 1.0;
  
  return Math.max(1, Math.floor(baseReward * multiplier));
}

export function applyCombatSummaryProfileReward(
  profile: DeadGridProfile,
  summary: CombatSummary,
  day: number
): DeadGridProfile {
  const shards = getBlueprintShardReward(day, "Escalating", summary.status); // threatLevel from state
  
  return {
    ...profile,
    blueprintShards: profile.blueprintShards + shards,
    lastEarnedBlueprintShards: shards,
    lifetimeRuns: profile.lifetimeRuns + 1,
    highestDayReached: Math.max(profile.highestDayReached, day),
    lastRunOutcome: summary.status
  };
}
```

**Acceptance:**
- Victory Day 3 → 3+ shards
- Defeat Day 3 → 1-2 shards
- Defeat Day 1 → minimum 1 shard

---

### Task 2: Unlock Node Configuration

**File:** `src/lib/game/unlocks.ts` (neu)

```typescript
export type UnlockNode = {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "outpost" | "defense" | "route";
  appliesAt: "run_start";
};

export const UNLOCK_NODES: UnlockNode[] = [
  {
    id: "storage_doctrine",
    name: "Storage Doctrine",
    description: "Expanded reserve capacity. Start each run with +10 storage cap.",
    cost: 5,
    category: "outpost",
    appliesAt: "run_start"
  },
  {
    id: "field_triage",
    name: "Field Triage Kits",
    description: "Better initial medical readiness. Start each run with +1 medicine.",
    cost: 8,
    category: "outpost",
    appliesAt: "run_start"
  },
  {
    id: "watch_rota",
    name: "Watch Rota Drills",
    description: "Improved defense coordination. +0.05 base damage multiplier.",
    cost: 10,
    category: "defense",
    appliesAt: "run_start"
  }
];

export function canUnlockNode(profile: DeadGridProfile, nodeId: string): boolean {
  const node = UNLOCK_NODES.find(n => n.id === nodeId);
  if (!node || profile.unlockedNodes.includes(nodeId)) return false;
  return profile.blueprintShards >= node.cost;
}

export function unlockNode(profile: DeadGridProfile, nodeId: string): DeadGridProfile {
  const node = UNLOCK_NODES.find(n => n.id === nodeId);
  if (!node || !canUnlockNode(profile, nodeId)) return profile;
  
  return {
    ...profile,
    blueprintShards: profile.blueprintShards - node.cost,
    unlockedNodes: [...profile.unlockedNodes, nodeId]
  };
}
```

---

### Task 3: Apply Unlocks to New Run

**File:** `src/lib/game/state.ts`

Modifiziere `createNewGameState()`:

```typescript
export function createNewGameState(profile?: DeadGridProfile): DeadGridState {
  const state = structuredClone(DEFAULT_GAME_STATE);
  state.hasStarted = true;
  state.lastSavedLabel = "Autosaving...";
  
  if (!profile) return state;
  
  // Apply unlocked bonuses
  const unlockedNodes = profile.unlockedNodes;
  
  if (unlockedNodes.includes("storage_doctrine")) {
    // Increase base storage cap - find storage building and adjust
    const storageBuilding = state.buildings.find(b => b.id === "storage");
    if (storageBuilding) {
      // Note: This is a starting bonus, not a building level change
      // We'll handle this via a profileBonus field in the state
      // For now, we add a temporary modifier
    }
  }
  
  if (unlockedNodes.includes("field_triage")) {
    // Start with +1 medicine
    const medicineResource = state.resources.find(r => r.id === "medicine");
    if (medicineResource) {
      medicineResource.amount += 1;
    }
  }
  
  // Note: watch_rota effect applies via getDerivedStats() modifier
  
  return normalizeState(state);
}
```

**Besserer Ansatz:** Füge `profileBonuses` zum State hinzu:

```typescript
export type ProfileBonuses = {
  baseStorageCapBonus: number;
  startingMedicineBonus: number;
  damageMultiplierBonus: number;
};

export function applyProfileBonuses(state: DeadGridState, profile: DeadGridProfile): DeadGridState {
  const bonuses: ProfileBonuses = {
    baseStorageCapBonus: 0,
    startingMedicineBonus: 0,
    damageMultiplierBonus: 0
  };
  
  if (profile.unlockedNodes.includes("storage_doctrine")) {
    bonuses.baseStorageCapBonus = 10;
  }
  
  if (profile.unlockedNodes.includes("field_triage")) {
    bonuses.startingMedicineBonus = 1;
  }
  
  if (profile.unlockedNodes.includes("watch_rota")) {
    bonuses.damageMultiplierBonus = 0.05;
  }
  
  // Store bonuses in state for UI visibility
  // Apply to resources/buildings as needed
  
  return state;
}
```

---

### Task 4: Landing Screen Profile Panel

**File:** `src/app/page.tsx` oder `src/components/dead-grid-app.tsx`

Addiere Profile Summary Panel:

```tsx
function ProfileSummaryPanel() {
  const profile = useGameProfile();
  
  return (
    <div className="profile-panel">
      <h3>Campaign Progress</h3>
      <div className="profile-stats">
        <div className="stat">
          <span className="label">Blueprint Shards</span>
          <span className="value">{profile.blueprintShards}</span>
        </div>
        <div className="stat">
          <span className="label">Highest Day</span>
          <span className="value">{profile.highestDayReached}</span>
        </div>
        <div className="stat">
          <span className="label">Total Runs</span>
          <span className="value">{profile.lifetimeRuns}</span>
        </div>
      </div>
      <button onClick={() => setShowUnlockBoard(true)}>
        Research Board
      </button>
    </div>
  );
}
```

---

### Task 5: Defeat/Summary Reward Surfacing

**File:** `src/components/combat-prototype.tsx`

Modifiziere CombatSummary Darstellung:

```tsx
{combatSummary && (
  <div className="combat-summary">
    <h2>{combatSummary.title}</h2>
    <p>{combatSummary.detail}</p>
    
    <div className="rewards">
      <p>{combatSummary.rewardLabel}</p>
      {!combatSummary.profileRewardGranted && (
        <p className="profile-reward">
          {combatSummary.profileRewardLabel}
        </p>
      )}
    </div>
    
    <button onClick={handleContinue}>
      {combatSummary.status === "victory" ? "Continue" : "Return to Outpost"}
    </button>
  </div>
)}
```

---

### Task 6: Unlock Board Component

**File:** `src/components/unlock-board.tsx` (neu)

```tsx
import { getGameProfileSnapshot, updateGameProfile } from "@/lib/game/store";
import { UNLOCK_NODES, canUnlockNode, unlockNode } from "@/lib/game/unlocks";

export function UnlockBoard() {
  const profile = useGameProfile();
  
  const handleUnlock = (nodeId: string) => {
    const profile = getGameProfileSnapshot();
    if (canUnlockNode(profile, nodeId)) {
      updateGameProfile(p => unlockNode(p, nodeId));
    }
  };
  
  return (
    <div className="unlock-board">
      <h2>Research Board</h2>
      <div className="shards-display">
        Blueprint Shards: {profile.blueprintShards}
      </div>
      
      <div className="unlock-nodes">
        {UNLOCK_NODES.map(node => {
          const isUnlocked = profile.unlockedNodes.includes(node.id);
          const canAfford = canUnlockNode(profile, node.id);
          
          return (
            <div key={node.id} className={`unlock-node ${isUnlocked ? "unlocked" : ""}`}>
              <h3>{node.name}</h3>
              <p>{node.description}</p>
              <div className="cost">
                {isUnlocked ? (
                  <span className="unlocked-label">Unlocked</span>
                ) : (
                  <span>{node.cost} shards</span>
                )}
              </div>
              {!isUnlocked && (
                <button 
                  onClick={() => handleUnlock(node.id)}
                  disabled={!canAfford}
                >
                  Research
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### Task 7: E2E Tests

**File:** `tests/e2e/profile-persistence.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Meta Progression Layer", () => {
  test("profile persists across reload", async ({ page }) => {
    await page.goto("/");
    
    // Simulate earning shards (via defeated run or manual state manipulation)
    // Reload page
    await page.reload();
    
    // Verify shards still present
    // await expect(page.locator(".shards-display")).toContainText(/Blueprint Shards: \d+/);
  });
  
  test("run reset does not clear profile", async ({ page }) => {
    // Grant shards, reset run, verify shards unchanged
  });
  
  test("defeat grants blueprint shards", async ({ page }) => {
    // Lose a run, verify shards increased
  });
  
  test("unlock applies to new run", async ({ page }) => {
    // Unlock node, start new run, verify starting bonus applied
  });
  
  test("existing continue-run still works", async ({ page }) => {
    // Regression test
  });
});
```

---

## Dependencies

- **state.ts:** `getBlueprintShardReward`, `applyCombatSummaryProfileReward`
- **unlocks.ts:** `UNLOCK_NODES`, `canUnlockNode`, `unlockNode`
- **store.ts:** `updateGameProfile` (neu oder erweitern)
- **UI Components:** ProfileSummaryPanel, UnlockBoard, Reward Surfacing

---

## Risks & Notes

1. **Balance:** Start mit konservativen Werten. Playtesting vor Erweiterung.
2. **UI Klarheit:** "Profile Progress" vs "Current Run" klar trennen.
3. **Idempotenz:** `profileRewardGranted` Flag muss bei jedem Reload geprüft werden.
4. **Testing:** E2E Tests vor Merge erforderlich.

---

## Definition of Done

- [ ] `getBlueprintShardReward()` implementiert und getestet
- [ ] `applyCombatSummaryProfileReward()` in `updateGameState()` integriert
- [ ] `UNLOCK_NODES` mit 3 Nodes konfiguriert
- [ ] `createNewGameState()` wendet Unlocks an
- [ ] Landing Screen zeigt Profile Summary
- [ ] Defeat/Summary Screen zeigt Rewards
- [ ] Unlock Board Component funktioniert
- [ ] E2E Tests grün
- [ ] Keine Regression in bestehenden Tests

---

**Handoff Complete.**  
**Ready for Implementation.**
