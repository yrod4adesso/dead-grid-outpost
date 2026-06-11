/**
 * Checkpoint Defense Events Unit Tests - US-010
 */

import { describe, it, expect } from "vitest";
import {
  CHECKPOINT_EVENTS,
  getCheckpointEvent,
  shouldTriggerCheckpoint,
  applyCheckpointRewards,
  describeCheckpointThreat,
  describeCheckpointWaves,
  type DeadGridProfile,
} from "./checkpoint";
import type { ChapterId } from "./chapter";

const makeProfile = (
  shards = 0,
  chapterId: ChapterId = "zone_alpha",
  milestoneProgress: Record<ChapterId, number> = { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 },
): DeadGridProfile => ({
  version: 3,
  blueprintShards: shards,
  lifetimeRuns: 0,
  highestDayReached: 0,
  unlockedNodes: [],
  lastEarnedBlueprintShards: 0,
  lastRunOutcome: null,
  commander: null,
  profileProgress: {
    firstLossRewardClaimed: false,
    chapterProgress: {
      currentChapter: chapterId,
      milestoneProgress,
      completedChapters: [],
    },
  },
});

describe("Checkpoint Defense Events", () => {
  describe("CHECKPOINT_EVENTS registry", () => {
    it("has events for zone alpha milestone 1 and 2", () => {
      expect(getCheckpointEvent("zone_alpha", 1)).toBeTruthy();
      expect(getCheckpointEvent("zone_alpha", 2)).toBeTruthy();
      expect(getCheckpointEvent("zone_alpha", 3)).toBeNull(); // no milestone 3 in alpha
    });

    it("has events for zone beta milestones 1, 2, 3", () => {
      expect(getCheckpointEvent("zone_beta", 1)).toBeTruthy();
      expect(getCheckpointEvent("zone_beta", 2)).toBeTruthy();
      expect(getCheckpointEvent("zone_beta", 3)).toBeTruthy();
    });

    it("has events for zone gamma milestones 1, 2, 3", () => {
      expect(getCheckpointEvent("zone_gamma", 1)).toBeTruthy();
      expect(getCheckpointEvent("zone_gamma", 2)).toBeTruthy();
      expect(getCheckpointEvent("zone_gamma", 3)).toBeTruthy();
    });
  });

  describe("getCheckpointEvent", () => {
    it("returns null for non-existent chapter/milestone", () => {
      expect(getCheckpointEvent("zone_alpha", 99)).toBeNull();
    });

    it("returns event with correct structure", () => {
      const event = getCheckpointEvent("zone_gamma", 3)!;
      expect(event.id).toBe("cap_gamma_source");
      expect(event.chapterId).toBe("zone_gamma");
      expect(event.milestoneIndex).toBe(3);
      expect(event.waves.length).toBeGreaterThan(0);
      expect(event.shardReward).toBeGreaterThan(0);
    });
  });

  describe("shouldTriggerCheckpoint", () => {
    it("returns true when milestone progress meets the threshold", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 2, zone_beta: 0, zone_gamma: 0 });
      expect(shouldTriggerCheckpoint(p, "zone_alpha", 1)).toBe(true);
      expect(shouldTriggerCheckpoint(p, "zone_alpha", 2)).toBe(true);
    });

    it("returns false when milestone progress is below threshold", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 });
      expect(shouldTriggerCheckpoint(p, "zone_alpha", 1)).toBe(false);
    });

    it("returns false for unrelated chapter", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 2, zone_beta: 0, zone_gamma: 0 });
      expect(shouldTriggerCheckpoint(p, "zone_beta", 1)).toBe(false);
    });
  });

  describe("applyCheckpointRewards", () => {
    it("increases blueprint shards by the shard reward amount", () => {
      const p = makeProfile(10, "zone_alpha", { zone_alpha: 1, zone_beta: 0, zone_gamma: 0 });
      const event = getCheckpointEvent("zone_alpha", 1)!;
      const result = applyCheckpointRewards(p, event);
      expect(result.blueprintShards).toBe(10 + event.shardReward);
    });

    it("does not mutate the input profile", () => {
      const p = makeProfile(10, "zone_alpha", { zone_alpha: 1, zone_beta: 0, zone_gamma: 0 });
      const event = getCheckpointEvent("zone_alpha", 1)!;
      applyCheckpointRewards(p, event);
      expect(p.blueprintShards).toBe(10);
    });
  });

  describe("Enemy composition varies by chapter", () => {
    it("zone alpha has walkers and runners, no brutes or horded", () => {
      const event = getCheckpointEvent("zone_alpha", 1)!;
      const enemyTypes = new Set(
        event.waves.flatMap((w) => w.enemies.map((e) => e.type))
      );
      expect(enemyTypes).toContain("walker");
      expect(enemyTypes).toContain("runner");
      expect(enemyTypes).not.toContain("brute");
      expect(enemyTypes).not.toContain("horded");
    });

    it("zone beta has runners and brutes", () => {
      const event = getCheckpointEvent("zone_beta", 1)!;
      const enemyTypes = new Set(
        event.waves.flatMap((w) => w.enemies.map((e) => e.type))
      );
      expect(enemyTypes).toContain("runner");
      expect(enemyTypes).toContain("brute");
      expect(enemyTypes).not.toContain("horded");
    });

    it("zone gamma has horded and brutes", () => {
      const event = getCheckpointEvent("zone_gamma", 1)!;
      const enemyTypes = new Set(
        event.waves.flatMap((w) => w.enemies.map((e) => e.type))
      );
      expect(enemyTypes).toContain("horded");
      expect(enemyTypes).toContain("brute");
    });
  });

  describe("describeCheckpointThreat", () => {
    it("returns a readable string with enemy counts and HP", () => {
      const event = getCheckpointEvent("zone_gamma", 3)!;
      const description = describeCheckpointThreat(event);
      expect(description).toContain(event.title);
      expect(description).toContain(String(event.totalEnemyCount));
      expect(description).toContain(String(event.totalHp));
    });
  });

  describe("describeCheckpointWaves", () => {
    it("returns wave labels joined by arrow", () => {
      const event = getCheckpointEvent("zone_beta", 2)!;
      const waves = describeCheckpointWaves(event);
      expect(waves).toContain("→");
      expect(waves).toContain(event.waves[0].label);
    });
  });
});
