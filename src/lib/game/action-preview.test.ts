/**
 * Action Cost Preview Tests — US-014
 */

import { describe, it, expect } from "vitest";
import {
  previewActionCost,
  getActionShardCost,
  canPerformAction,
  formatCostPreview,
  RECRUIT_COST,
  RECRUIT_COMMANDER_COST,
  BUILD_COSTS,
  UPGRADE_COSTS,
  NODE_UNLOCK_COSTS,
} from "./action-preview";
import type { DeadGridState, DeadGridProfile } from "./state";

const makeState = (resources: Array<{ id: string; amount: number }> = []): DeadGridState => ({
  hasStarted: true,
  day: 1,
  missions: [],
  survivors: [],
  buildings: [],
  resources: resources as any,
  selectedMissionTeamIds: [],
  objectives: [],
  activityLog: [],
  threatLevel: "Watching",
  isNight: false,
  nightReward: {},
} as unknown as DeadGridState);

const makeProfile = (shards = 0, unlockedNodes: string[] = []): DeadGridProfile => ({
  version: 3,
  blueprintShards: shards,
  lifetimeRuns: 0,
  highestDayReached: 0,
  unlockedNodes,
  lastEarnedBlueprintShards: 0,
  lastRunOutcome: null,
  commander: null,
  profileProgress: {
    firstLossRewardClaimed: false,
    chapterProgress: {
      currentChapter: "zone_alpha",
      milestoneProgress: { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 },
      completedChapters: [],
    },
    rewardChests: {},
  },
});

describe("Action Cost Preview (US-014)", () => {
  describe("RECRUIT_COST", () => {
    it("has food and scrap costs", () => {
      expect(RECRUIT_COST.food).toBe(3);
      expect(RECRUIT_COST.scrap).toBe(1);
    });
  });

  describe("RECRUIT_COMMANDER_COST", () => {
    it("has scrap, medicine, and food costs", () => {
      expect(RECRUIT_COMMANDER_COST.scrap).toBe(20);
      expect(RECRUIT_COMMANDER_COST.medicine).toBe(5);
      expect(RECRUIT_COMMANDER_COST.food).toBe(10);
    });
  });

  describe("BUILD_COSTS", () => {
    it("has scrap and food costs", () => {
      expect(BUILD_COSTS.scrap).toBe(10);
      expect(BUILD_COSTS.food).toBe(3);
    });
  });

  describe("UPGRADE_COSTS", () => {
    it("has scrap and food costs", () => {
      expect(UPGRADE_COSTS.scrap).toBe(20);
      expect(UPGRADE_COSTS.food).toBe(5);
    });
  });

  describe("NODE_UNLOCK_COSTS", () => {
    it("has shard costs for all nodes", () => {
      expect(NODE_UNLOCK_COSTS.storage_doctrine).toBe(2);
      expect(NODE_UNLOCK_COSTS.field_triage).toBe(3);
      expect(NODE_UNLOCK_COSTS.watch_rota).toBe(3);
      expect(NODE_UNLOCK_COSTS.scavenger_training).toBe(4);
      expect(NODE_UNLOCK_COSTS.combat_drills).toBe(4);
      expect(NODE_UNLOCK_COSTS.resource_management).toBe(5);
      expect(NODE_UNLOCK_COSTS.advanced_tactics).toBe(6);
    });
  });

  describe("previewActionCost - recruit", () => {
    it("returns affordable when resources sufficient", () => {
      const state = makeState([
        { id: "food", amount: 10 },
        { id: "scrap", amount: 5 },
      ]);
      const profile = makeProfile();
      const preview = previewActionCost(state, profile, "recruit");
      expect(preview.affordable).toBe(true);
    });

    it("returns missing resources when insufficient", () => {
      const state = makeState([
        { id: "food", amount: 1 },
        { id: "scrap", amount: 0 },
      ]);
      const profile = makeProfile();
      const preview = previewActionCost(state, profile, "recruit");
      expect(preview.affordable).toBe(false);
      expect(preview.missingResources.food).toBe(2);
      expect(preview.missingResources.scrap).toBe(1);
    });
  });

  describe("previewActionCost - unlock_node", () => {
    it("returns affordable when shards sufficient", () => {
      const state = makeState();
      const profile = makeProfile(10);
      const preview = previewActionCost(state, profile, "unlock_node", "storage_doctrine");
      expect(preview.affordable).toBe(true);
      expect(preview.missingShards).toBe(0);
    });

    it("returns missing shards when insufficient", () => {
      const state = makeState();
      const profile = makeProfile(1);
      const preview = previewActionCost(state, profile, "unlock_node", "storage_doctrine");
      expect(preview.affordable).toBe(false);
      expect(preview.missingShards).toBe(1);
    });
  });

  describe("previewActionCost - recruit_commander", () => {
    it("returns affordable when resources sufficient", () => {
      const state = makeState([
        { id: "scrap", amount: 25 },
        { id: "medicine", amount: 6 },
        { id: "food", amount: 12 },
      ]);
      const profile = makeProfile();
      const preview = previewActionCost(state, profile, "recruit_commander");
      expect(preview.affordable).toBe(true);
    });

    it("returns missing resources when insufficient", () => {
      const state = makeState([
        { id: "scrap", amount: 10 },
        { id: "medicine", amount: 0 },
        { id: "food", amount: 5 },
      ]);
      const profile = makeProfile();
      const preview = previewActionCost(state, profile, "recruit_commander");
      expect(preview.affordable).toBe(false);
      expect(preview.missingResources.scrap).toBe(10);
    });
  });

  describe("getActionShardCost", () => {
    it("returns shard cost for unlock_node", () => {
      expect(getActionShardCost("unlock_node", "storage_doctrine")).toBe(2);
      expect(getActionShardCost("unlock_node", "advanced_tactics")).toBe(6);
    });

    it("returns 0 for recruit", () => {
      expect(getActionShardCost("recruit")).toBe(0);
    });
  });

  describe("canPerformAction", () => {
    it("returns true when affordable", () => {
      const state = makeState([
        { id: "food", amount: 10 },
        { id: "scrap", amount: 10 },
      ]);
      const profile = makeProfile(10);
      expect(canPerformAction(state, profile, "recruit")).toBe(true);
    });

    it("returns false when not affordable", () => {
      const state = makeState([
        { id: "food", amount: 0 },
        { id: "scrap", amount: 0 },
      ]);
      const profile = makeProfile(0);
      expect(canPerformAction(state, profile, "recruit")).toBe(false);
    });
  });

  describe("formatCostPreview", () => {
    it("returns 'All resources available' when nothing missing", () => {
      const preview = {
        affordable: true,
        missingResources: {},
        missingShards: 0,
        unmetPrerequisites: [],
      };
      expect(formatCostPreview(preview)).toBe("All resources available!");
    });

    it("lists missing shards", () => {
      const preview = {
        affordable: false,
        missingResources: {},
        missingShards: 5,
        unmetPrerequisites: [],
      };
      expect(formatCostPreview(preview)).toContain("5 blueprint shards");
    });

    it("lists missing resources", () => {
      const preview = {
        affordable: false,
        missingResources: { food: 3, scrap: 2 },
        missingShards: 0,
        unmetPrerequisites: [],
      };
      const result = formatCostPreview(preview);
      expect(result).toContain("food");
      expect(result).toContain("scrap");
    });

    it("lists unmet prerequisites", () => {
      const preview = {
        affordable: false,
        missingResources: {},
        missingShards: 0,
        unmetPrerequisites: ["storage_doctrine", "field_triage"],
      };
      expect(formatCostPreview(preview)).toContain("unlocked node");
    });
  });
});
