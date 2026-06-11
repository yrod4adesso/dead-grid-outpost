/**
 * Daily Objectives System Tests — US-012
 */

import { describe, it, expect } from "vitest";
import {
  OBJECTIVE_DEFINITIONS,
  generateDailyObjectives,
  getObjectiveProgression,
  getObjectiveDefinition,
  getObjectiveRewards,
  getDefinitionsByType,
  getCompletedCount,
  getTotalProgress,
  describeObjective,
  createObjectivesFromDefinitions,
} from "./objectives";

describe("Daily Objectives (US-012)", () => {
  describe("OBJECTIVE_DEFINITIONS registry", () => {
    it("has definitions for all types", () => {
      const types = ["send_mission", "unlock_node", "complete_night", "recruit_survivor", "upgrade_building", "defend_checkpoint"];
      for (const t of types) {
        const defs = getDefinitionsByType(t as any);
        expect(defs.length).toBeGreaterThan(0);
      }
    });

    it("each definition has required fields", () => {
      for (const def of Object.values(OBJECTIVE_DEFINITIONS)) {
        expect(def.id).toBeTruthy();
        expect(def.type).toBeTruthy();
        expect(def.title).toBeTruthy();
        expect(def.description).toBeTruthy();
        expect(def.target).toBeGreaterThan(0);
        expect(def.shardReward).toBeGreaterThan(0);
        expect(def.weight).toBeGreaterThan(0);
      }
    });

    it("has at least 3 difficulty tiers for send_mission", () => {
      const missions = getDefinitionsByType("send_mission");
      expect(missions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("generateDailyObjectives", () => {
    it("generates exactly 3 objectives", () => {
      const objectives = generateDailyObjectives();
      expect(objectives.length).toBe(3);
    });

    it("generates objectives with correct initial state", () => {
      const objectives = generateDailyObjectives();
      for (const obj of objectives) {
        expect(obj.progress.current).toBe(0);
        expect(obj.completed).toBe(false);
        expect(obj.definitionId).toBeTruthy();
      }
    });

    it("never generates duplicate objectives", () => {
      const objectives = generateDailyObjectives();
      const ids = objectives.map((o) => o.definitionId);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("generates different objectives on repeated calls", () => {
      const results = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const objs = generateDailyObjectives();
        results.add(objs.map((o) => o.definitionId).join(","));
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("getObjectiveProgression", () => {
    it("returns progression for mission_sent", () => {
      const prog = getObjectiveProgression({} as any, "mission_sent");
      expect(prog.length).toBe(3);
      expect(prog.map((p) => p.objectiveId)).toContain("send_mission_easy");
    });

    it("returns progression for night_defended", () => {
      const prog = getObjectiveProgression({} as any, "night_defended");
      expect(prog).toEqual([{ objectiveId: "complete_night", delta: 1 }]);
    });

    it("returns progression for survivor_recruited", () => {
      const prog = getObjectiveProgression({} as any, "survivor_recruited");
      expect(prog).toEqual([{ objectiveId: "recruit_survivor", delta: 1 }]);
    });

    it("returns empty for unknown action", () => {
      const prog = getObjectiveProgression({} as any, "unknown_action");
      expect(prog).toEqual([]);
    });
  });

  describe("getObjectiveDefinition", () => {
    it("returns the definition by ID", () => {
      const def = getObjectiveDefinition("send_mission_easy");
      expect(def).toBeTruthy();
      expect(def!.id).toBe("send_mission_easy");
      expect(def!.target).toBe(3);
    });

    it("returns null for unknown ID", () => {
      expect(getObjectiveDefinition("nonexistent")).toBeNull();
    });
  });

  describe("getObjectiveRewards", () => {
    it("returns correct rewards for an objective", () => {
      const rewards = getObjectiveRewards("send_mission_hard");
      expect(rewards.shardReward).toBe(10);
      expect(rewards.resources.scrap).toBe(20);
    });

    it("returns empty for unknown objective", () => {
      const rewards = getObjectiveRewards("nonexistent");
      expect(rewards.resources).toEqual({});
      expect(rewards.shardReward).toBe(0);
    });
  });

  describe("getCompletedCount", () => {
    it("counts only completed objectives", () => {
      const objs = [
        { definitionId: "send_mission_easy", progress: { current: 2, target: 3 }, completed: false },
        { definitionId: "complete_night", progress: { current: 3, target: 3 }, completed: true },
        { definitionId: "recruit_survivor", progress: { current: 2, target: 2 }, completed: true },
      ];
      expect(getCompletedCount(objs as any)).toBe(2);
    });
  });

  describe("getTotalProgress", () => {
    it("sums progress across all objectives", () => {
      const objs = [
        { definitionId: "a", progress: { current: 2, target: 3 }, completed: false },
        { definitionId: "b", progress: { current: 1, target: 5 }, completed: false },
      ];
      expect(getTotalProgress(objs as any)).toBe(3);
    });
  });

  describe("describeObjective", () => {
    it("returns a readable progress string", () => {
      const obj = { definitionId: "send_mission_easy", progress: { current: 2, target: 3 }, completed: false };
      const desc = describeObjective(obj as any);
      expect(desc).toContain("Scavenger");
      expect(desc).toContain("2/3");
      expect(desc).toContain("67%");
    });

    it("returns 'Unknown objective' for unknown definition", () => {
      const obj = { definitionId: "nonexistent", progress: { current: 0, target: 1 }, completed: false };
      expect(describeObjective(obj as any)).toBe("Unknown objective");
    });
  });

  describe("createObjectivesFromDefinitions", () => {
    it("creates objectives for given definitions", () => {
      const objs = createObjectivesFromDefinitions(["send_mission_easy", "complete_night"]);
      expect(objs.length).toBe(2);
      expect(objs[0].definitionId).toBe("send_mission_easy");
      expect(objs[1].definitionId).toBe("complete_night");
      for (const obj of objs) {
        expect(obj.progress.current).toBe(0);
        expect(obj.completed).toBe(false);
      }
    });

    it("throws for unknown definition", () => {
      expect(() => createObjectivesFromDefinitions(["nonexistent"])).toThrow();
    });
  });
});
