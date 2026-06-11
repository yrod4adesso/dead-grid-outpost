/**
 * Threat Summary Tests — US-015
 */

import { describe, it, expect } from "vitest";
import {
  calculateThreatLevel,
  describeThreatLevel,
  getThreatLevelColor,
  getThreatAdvice,
  calculateThreatScore,
  getThreatSummary,
} from "./threat-summary";
import type { DeadGridState } from "./state";

const makeState = (overrides: Partial<DeadGridState> = {}): DeadGridState => ({
  hasStarted: true,
  day: 1,
  missions: [],
  survivors: [],
  buildings: [],
  resources: [],
  selectedMissionTeamIds: [],
  objectives: [],
  activityLog: [],
  threatLevel: "Watching",
  phase: "outpost",
  nightReward: {},
  ...overrides,
} as unknown as DeadGridState);

describe("Threat Summary (US-015)", () => {
  describe("calculateThreatLevel", () => {
    it("returns Watching for low day with resources", () => {
      const state = makeState({
        day: 5,
        phase: "outpost",
        resources: [
          { id: "scrap", amount: 50 },
          { id: "medicine", amount: 20 },
        ],
        survivors: [{ id: "s1", assignment: "defense" as any }],
      });
      expect(calculateThreatLevel(state)).toBe("Watching");
    });

    it("returns Escalating for medium day with low resources", () => {
      const state = makeState({
        day: 12,
        phase: "outpost",
        resources: [
          { id: "scrap", amount: 5 },
          { id: "medicine", amount: 3 },
        ],
        survivors: [],
      });
      expect(calculateThreatLevel(state)).toBe("Escalating");
    });

    it("returns Critical for high day with very low resources", () => {
      const state = makeState({
        day: 25,
        phase: "outpost",
        resources: [
          { id: "scrap", amount: 5 },
          { id: "medicine", amount: 3 },
        ],
        survivors: [],
      });
      expect(calculateThreatLevel(state)).toBe("Critical");
    });

    it("returns Breached at night with insufficient defenders", () => {
      const state = makeState({
        day: 10,
        phase: "combat",
        resources: [
          { id: "scrap", amount: 50 },
          { id: "medicine", amount: 20 },
        ],
        survivors: [], // No defenders
      });
      expect(calculateThreatLevel(state)).toBe("Breached");
    });
  });

  describe("describeThreatLevel", () => {
    it("returns description for Watching", () => {
      expect(describeThreatLevel("Watching")).toContain("low");
    });

    it("returns description for Escalating", () => {
      expect(describeThreatLevel("Escalating")).toContain("increasing");
    });

    it("returns description for Critical", () => {
      expect(describeThreatLevel("Critical")).toContain("critical");
    });

    it("returns description for Breached", () => {
      expect(describeThreatLevel("Breached")).toContain("BREACH");
    });
  });

  describe("getThreatLevelColor", () => {
    it("returns green for Watching", () => {
      expect(getThreatLevelColor("Watching")).toBe("#22c55e");
    });

    it("returns amber for Escalating", () => {
      expect(getThreatLevelColor("Escalating")).toBe("#f59e0b");
    });

    it("returns red for Critical", () => {
      expect(getThreatLevelColor("Critical")).toBe("#ef4444");
    });

    it("returns dark red for Breached", () => {
      expect(getThreatLevelColor("Breached")).toBe("#7f1d1d");
    });
  });

  describe("getThreatAdvice", () => {
    it("returns advice for Watching", () => {
      const advice = getThreatAdvice("Watching", makeState());
      expect(advice.length).toBeGreaterThan(0);
      expect(advice[0]).toContain("scavenging");
    });

    it("returns urgent advice for Critical", () => {
      const advice = getThreatAdvice("Critical", makeState());
      expect(advice[0]).toContain("URGENT");
    });

    it("returns emergency advice for Breached", () => {
      const advice = getThreatAdvice("Breached", makeState());
      expect(advice[0]).toContain("EMERGENCY");
    });
  });

  describe("calculateThreatScore", () => {
    it("returns low score for low day with resources", () => {
      const state = makeState({
        day: 1,
        resources: [
          { id: "scrap", amount: 100 },
          { id: "medicine", amount: 50 },
          { id: "food", amount: 50 },
        ],
        survivors: [{ id: "s1", assignment: "defense" as any }],
      });
      const score = calculateThreatScore(state);
      expect(score).toBeLessThan(50);
    });

    it("returns high score for high day with no resources", () => {
      const state = makeState({
        day: 30,
        resources: [],
        survivors: [],
      });
      const score = calculateThreatScore(state);
      expect(score).toBeGreaterThan(50);
    });

    it("increases score at night", () => {
      const state = makeState({
        day: 10,
        phase: "combat",
        resources: [
          { id: "scrap", amount: 50 },
          { id: "medicine", amount: 20 },
        ],
        survivors: [],
      });
      const nightScore = calculateThreatScore(state);
      const dayState = { ...state, phase: "outpost" };
      const dayScore = calculateThreatScore(dayState);
      expect(nightScore).toBeGreaterThan(dayScore);
    });

    it("returns 0-100 range", () => {
      const state = makeState();
      const score = calculateThreatScore(state);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("getThreatSummary", () => {
    it("returns complete summary object", () => {
      const state = makeState({
        day: 5,
        resources: [
          { id: "scrap", amount: 50 },
          { id: "medicine", amount: 20 },
        ],
        survivors: [],
      });
      const summary = getThreatSummary(state);
      expect(summary.level).toBeTruthy();
      expect(summary.score).toBeGreaterThanOrEqual(0);
      expect(summary.score).toBeLessThanOrEqual(100);
      expect(summary.description).toBeTruthy();
      expect(summary.color).toBeTruthy();
      expect(summary.advice.length).toBeGreaterThan(0);
    });
  });
});
