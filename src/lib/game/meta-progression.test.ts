/**
 * Meta-Progression Unit Tests
 * Starship Mode: Comprehensive test coverage
 */

import { describe, it, expect } from "vitest";
import {
  UNLOCK_NODES,
  canUnlockNode,
  unlockNode,
  getAvailableUnlocks,
  getUnlockedNodes,
  applyUnlockEffectsToState,
  getProfileSummary,
  type DeadGridProfile,
} from "./meta-progression";

const createTestProfile = (shards = 0, unlocked: string[] = []): DeadGridProfile => ({
  version: 1,
  blueprintShards: shards,
  lifetimeRuns: 0,
  highestDayReached: 0,
  unlockedNodes: unlocked,
  lastEarnedBlueprintShards: 0,
  lastRunOutcome: null,
  commander: null,
});

describe("Meta-Progression", () => {
  describe("canUnlockNode", () => {
    it("should allow unlocking a node with no prerequisites and enough shards", () => {
      const profile = createTestProfile(10, []);
      const result = canUnlockNode(profile, "storage_doctrine");
      expect(result.canUnlock).toBe(true);
    });

    it("should deny unlocking without enough shards", () => {
      const profile = createTestProfile(3, []);
      const result = canUnlockNode(profile, "storage_doctrine");
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain("5 blueprint shards");
    });

    it("should deny unlocking if prerequisites are not met", () => {
      const profile = createTestProfile(20, []);
      const result = canUnlockNode(profile, "watch_rota");
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain("Storage Doctrine");
    });

    it("should deny unlocking if already unlocked", () => {
      const profile = createTestProfile(20, ["storage_doctrine"]);
      const result = canUnlockNode(profile, "storage_doctrine");
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain("Already unlocked");
    });
  });

  describe("unlockNode", () => {
    it("should unlock a node and deduct shards", () => {
      const profile = createTestProfile(10, []);
      const unlocked = unlockNode(profile, "storage_doctrine");
      expect(unlocked.blueprintShards).toBe(5);
      expect(unlocked.unlockedNodes).toContain("storage_doctrine");
    });

    it("should unlock nodes in prerequisite order", () => {
      let profile = createTestProfile(20, []);
      profile = unlockNode(profile, "storage_doctrine");
      expect(profile.unlockedNodes).toContain("storage_doctrine");
      
      profile = unlockNode(profile, "watch_rota");
      expect(profile.unlockedNodes).toContain("watch_rota");
    });
  });

  describe("getAvailableUnlocks", () => {
    it("should return only unlockable nodes", () => {
      const profile = createTestProfile(20, []);
      const available = getAvailableUnlocks(profile);
      const ids = available.map((n) => n.id);
      
      expect(ids).toContain("storage_doctrine");
      expect(ids).toContain("field_triage");
      expect(ids).not.toContain("watch_rota"); // Requires storage_doctrine
    });
  });

  describe("applyUnlockEffectsToState", () => {
    it("should apply storage cap bonus", () => {
      const profile = createTestProfile(0, ["storage_doctrine"]);
      const base = { storageLimit: 60, healingBonus: 0, damageMultiplier: 1, scrapYieldMultiplier: 1 };
      const result = applyUnlockEffectsToState(profile, base);
      
      expect(result.storageLimit).toBe(80); // 60 + 20
      expect(result.storageCapBonus).toBe(20);
    });

    it("should apply healing bonus", () => {
      const profile = createTestProfile(0, ["field_triage"]);
      const base = { storageLimit: 60, healingBonus: 1, damageMultiplier: 1, scrapYieldMultiplier: 1 };
      const result = applyUnlockEffectsToState(profile, base);
      
      expect(result.healingBonus).toBe(2); // 1 + 1
    });

    it("should stack multiple unlock effects", () => {
      const profile = createTestProfile(0, ["storage_doctrine", "field_triage"]);
      const base = { storageLimit: 60, healingBonus: 1, damageMultiplier: 1, scrapYieldMultiplier: 1 };
      const result = applyUnlockEffectsToState(profile, base);
      
      expect(result.storageLimit).toBe(80);
      expect(result.healingBonus).toBe(2);
    });
  });

  describe("getProfileSummary", () => {
    it("should calculate correct profile stats", () => {
      const profile = createTestProfile(15, ["storage_doctrine", "field_triage"]);
      profile.lifetimeRuns = 3;
      profile.highestDayReached = 7;
      
      const summary = getProfileSummary(profile);
      
      expect(summary.totalShards).toBe(15);
      expect(summary.runsCompleted).toBe(3);
      expect(summary.highestDay).toBe(7);
      expect(summary.unlockedCount).toBe(2);
    });
  });
});
