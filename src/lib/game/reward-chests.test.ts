/**
 * Reward Chests Unit Tests — US-011
 */

import { describe, it, expect } from "vitest";
import {
  REWARD_CHESTS,
  getRewardChest,
  openRewardChest,
  hasOpenedChest,
  getAvailableChests,
  getChapterChestPotential,
  describeOpenedChests,
  type RewardChest,
} from "./reward-chests";
import type { ChapterId, DeadGridProfile } from "./state";

const makeProfile = (
  shards = 0,
  chapterId: ChapterId = "zone_alpha",
  milestoneProgress: Record<ChapterId, number> = { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 },
  rewardChests: Record<string, boolean> = {},
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
    rewardChests,
  },
});

describe("Reward Chests (US-011)", () => {
  describe("REWARD_CHESTS registry", () => {
    it("has chests for all chapters", () => {
      const chapterIds: ChapterId[] = ["zone_alpha", "zone_beta", "zone_gamma"];
      for (const cid of chapterIds) {
        for (let i = 0; i < (cid === "zone_alpha" ? 3 : 4); i++) {
          const key = `${cid}/${i}`;
          expect(REWARD_CHESTS[key]).toBeTruthy();
          expect(REWARD_CHESTS[key]!.chapterId).toBe(cid);
          expect(REWARD_CHESTS[key]!.milestoneIndex).toBe(i);
        }
      }
    });

    it("has chest properties for each chest", () => {
      const chests = Object.values(REWARD_CHESTS);
      for (const chest of chests) {
        expect(chest.id).toMatch(/chest_/);
        expect(chest.title).toBeTruthy();
        expect(chest.description).toBeTruthy();
        expect(chest.shardReward).toBeGreaterThan(0);
      }
    });
  });

  describe("getRewardChest", () => {
    it("returns the correct chest for a chapter milestone", () => {
      const chest = getRewardChest("zone_alpha", 0);
      expect(chest).toBeTruthy();
      expect(chest!.title).toBe("Welcome Chest");
    });

    it("returns null for non-existent milestone", () => {
      expect(getRewardChest("zone_alpha", 99)).toBeNull();
    });
  });

  describe("hasOpenedChest", () => {
    it("returns false when chest has not been opened", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, {});
      expect(hasOpenedChest(p, "zone_alpha", 0)).toBe(false);
    });

    it("returns true when chest has been opened", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, { "zone_alpha/0": true });
      expect(hasOpenedChest(p, "zone_alpha", 0)).toBe(true);
    });
  });

  describe("openRewardChest", () => {
    it("grants shard rewards and marks chest as opened", () => {
      const p = makeProfile(10, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, {});
      const chest = getRewardChest("zone_alpha", 0)!;
      const result = openRewardChest(p, "zone_alpha", 0);

      expect(result.blueprintShards).toBe(10 + chest.shardReward);
      expect(result.profileProgress.rewardChests["zone_alpha/0"]).toBe(true);
      expect(p.profileProgress.rewardChests["zone_alpha/0"]).toBeUndefined();
    });

    it("does not mutate the input profile", () => {
      const p = makeProfile(10, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, {});
      const result = openRewardChest(p, "zone_alpha", 0);
      expect(p.blueprintShards).toBe(10);
      expect(p.profileProgress.rewardChests["zone_alpha/0"]).toBeUndefined();
    });

    it("throws when chest does not exist", () => {
      const p = makeProfile(10, "zone_alpha", {});
      expect(() => openRewardChest(p, "zone_alpha", 99)).toThrow();
    });

    it("throws when chest already opened", () => {
      const p = makeProfile(10, "zone_alpha", {}, { "zone_alpha/0": true });
      expect(() => openRewardChest(p, "zone_alpha", 0)).toThrow();
    });

    it("grants correct shard rewards for zone_beta", () => {
      const chest = getRewardChest("zone_beta", 2)!;
      const p = makeProfile(5, "zone_beta", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, {});
      const result = openRewardChest(p, "zone_beta", 2);
      expect(result.blueprintShards).toBe(5 + chest.shardReward);
      expect(result.profileProgress.rewardChests["zone_beta/2"]).toBe(true);
    });
  });

  describe("getAvailableChests", () => {
    it("returns only unopened chests for a chapter", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, { "zone_alpha/0": true });
      const available = getAvailableChests(p, "zone_alpha");
      expect(available.length).toBeGreaterThan(0);
      expect(available).not.toContainEqual(expect.objectContaining({ milestoneIndex: 0 }));
    });

    it("returns empty array when all chests opened", () => {
      const openedChests: Record<string, boolean> = {};
      for (let i = 0; i < 3; i++) openedChests[`zone_alpha/${i}`] = true;
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, openedChests);
      const available = getAvailableChests(p, "zone_alpha");
      expect(available).toEqual([]);
    });
  });

  describe("getChapterChestPotential", () => {
    it("sums rewards from all available chests", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, {});
      const potential = getChapterChestPotential(p, "zone_alpha");
      expect(potential.shardReward).toBeGreaterThan(0);
      expect(potential.resources.scrap).toBeGreaterThan(0);
    });

    it("excludes already opened chests from potential", () => {
      const p = makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, { "zone_alpha/0": true });
      const potential = getChapterChestPotential(p, "zone_alpha");
      const fullPotential = getChapterChestPotential(
        makeProfile(0, "zone_alpha", { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, {}),
        "zone_alpha"
      );
      expect(potential.shardReward).toBeLessThan(fullPotential.shardReward);
    });
  });

  describe("describeOpenedChests", () => {
    it("lists opened chests", () => {
      const p = makeProfile(0, "zone_alpha", {}, { "zone_alpha/0": true });
      const desc = describeOpenedChests(p, "zone_alpha");
      expect(desc).toContain("Opened");
      expect(desc).toContain("Welcome Chest");
    });

    it("returns message when no chests opened", () => {
      const p = makeProfile(0, "zone_alpha", {}, {});
      const desc = describeOpenedChests(p, "zone_alpha");
      expect(desc).toContain("No chests opened");
    });
  });
});
