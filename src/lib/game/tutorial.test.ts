/**
 * Tutorial / Onboarding Tests — US-013
 */

import { describe, it, expect } from "vitest";
import {
  TUTORIAL_STEPS,
  TUTORIAL_ORDER,
  createTutorialState,
  canAdvanceStep,
  advanceTutorialStep,
  skipTutorial,
  startTutorial,
  getCurrentStep,
  isFirstStep,
  isLastStep,
  describeTutorialProgress,
} from "./tutorial";
import type { DeadGridState, DeadGridProfile } from "./state";

const makeState = (overrides: Partial<DeadGridState> = {}): DeadGridState => ({
  hasStarted: false,
  day: 0,
  missions: [],
  survivors: [],
  buildings: [],
  resources: [],
  selectedMissionTeamIds: [],
  objectives: [],
  activityLog: [],
  threatLevel: "Watching",
  isNight: false,
  nightReward: {},
  ...overrides,
} as unknown as DeadGridState);

const makeProfile = (overrides: Partial<DeadGridProfile> = {}): DeadGridProfile => ({
  version: 3,
  blueprintShards: 0,
  lifetimeRuns: 0,
  highestDayReached: 0,
  unlockedNodes: [],
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
  ...overrides,
});

describe("Tutorial / Onboarding (US-013)", () => {
  describe("TUTORIAL_STEPS registry", () => {
    it("has all four steps in correct order", () => {
      expect(TUTORIAL_ORDER).toEqual(["intro", "first_mission", "night_defense", "rewards"]);
    });

    it("each step has required fields", () => {
      for (const step of Object.values(TUTORIAL_STEPS)) {
        expect(step.id).toBeTruthy();
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
        expect(step.actionRequired).toBeTruthy();
        expect(step.hint).toBeTruthy();
      }
    });
  });

  describe("createTutorialState", () => {
    it("returns fresh tutorial state", () => {
      const state = createTutorialState();
      expect(state.currentStep).toBe("intro");
      expect(state.stepHistory).toEqual([]);
      expect(state.completed).toBe(false);
      expect(state.skipped).toBe(false);
      expect(state.started).toBe(false);
    });
  });

  describe("canAdvanceStep", () => {
    it("always allows advancing from intro", () => {
      expect(canAdvanceStep("intro", makeState(), makeProfile())).toBe(true);
    });

    it("blocks first_mission if no run started", () => {
      expect(canAdvanceStep("first_mission", makeState(), makeProfile())).toBe(false);
    });

    it("allows first_mission if run started with missions", () => {
      expect(canAdvanceStep("first_mission", makeState({ hasStarted: true, missions: [1] }), makeProfile())).toBe(true);
    });

    it("blocks night_defense if day 1", () => {
      expect(canAdvanceStep("night_defense", makeState({ day: 1 }), makeProfile())).toBe(false);
    });

    it("allows night_defense if day > 1", () => {
      expect(canAdvanceStep("night_defense", makeState({ day: 2 }), makeProfile())).toBe(true);
    });

    it("blocks rewards if no lifetime runs", () => {
      expect(canAdvanceStep("rewards", makeState(), makeProfile())).toBe(false);
    });

    it("allows rewards after first run", () => {
      expect(canAdvanceStep("rewards", makeState(), makeProfile({ lifetimeRuns: 1 }))).toBe(true);
    });
  });

  describe("advanceTutorialStep", () => {
    it("advances from intro to first_mission", () => {
      const tutorial = createTutorialState();
      const state = makeState({ hasStarted: true, missions: [1] });
      const result = advanceTutorialStep(tutorial, state, makeProfile());
      expect(result).not.toBeNull();
      expect(result!.currentStep).toBe("first_mission");
      expect(result!.stepHistory).toEqual(["intro"]);
    });

    it("completes tutorial on last step", () => {
      const tutorial = createTutorialState();
      tutorial.currentStep = "rewards";
      const state = makeState({ day: 2, hasStarted: true, missions: [1] });
      const profile = makeProfile({ lifetimeRuns: 1 });
      const result = advanceTutorialStep(tutorial, state, profile);
      expect(result).not.toBeNull();
      expect(result!.completed).toBe(true);
    });

    it("returns null if step can't advance", () => {
      const tutorial = createTutorialState();
      tutorial.currentStep = "first_mission";
      const state = makeState({ hasStarted: false });
      expect(advanceTutorialStep(tutorial, state, makeProfile())).toBeNull();
    });

    it("returns null if tutorial already completed", () => {
      const tutorial = createTutorialState();
      tutorial.completed = true;
      expect(advanceTutorialStep(tutorial, makeState(), makeProfile())).toBeNull();
    });

    it("returns null if tutorial already skipped", () => {
      const tutorial = createTutorialState();
      tutorial.skipped = true;
      expect(advanceTutorialStep(tutorial, makeState(), makeProfile())).toBeNull();
    });
  });

  describe("skipTutorial", () => {
    it("marks tutorial as skipped and completed", () => {
      const tutorial = createTutorialState();
      const result = skipTutorial(tutorial);
      expect(result.skipped).toBe(true);
      expect(result.completed).toBe(true);
    });

    it("does not mutate original", () => {
      const tutorial = createTutorialState();
      const result = skipTutorial(tutorial);
      expect(result.skipped).toBe(true);
      expect(tutorial.skipped).toBe(false);
    });
  });

  describe("startTutorial", () => {
    it("marks tutorial as started", () => {
      const tutorial = createTutorialState();
      const result = startTutorial(tutorial);
      expect(result.started).toBe(true);
    });
  });

  describe("getCurrentStep", () => {
    it("returns current step info", () => {
      const tutorial = createTutorialState();
      const step = getCurrentStep(tutorial);
      expect(step).toBeTruthy();
      expect(step!.id).toBe("intro");
    });

    it("returns null for completed tutorial", () => {
      const tutorial = createTutorialState();
      tutorial.completed = true;
      expect(getCurrentStep(tutorial)).toBeNull();
    });

    it("returns null for skipped tutorial", () => {
      const tutorial = createTutorialState();
      tutorial.skipped = true;
      expect(getCurrentStep(tutorial)).toBeNull();
    });
  });

  describe("isFirstStep / isLastStep", () => {
    it("identifies first and last steps", () => {
      const tutorial = createTutorialState();
      expect(isFirstStep(tutorial)).toBe(true);
      expect(isLastStep(tutorial)).toBe(false);

      tutorial.currentStep = "rewards";
      expect(isLastStep(tutorial)).toBe(true);
    });
  });

  describe("describeTutorialProgress", () => {
    it("returns correct messages", () => {
      const tutorial = createTutorialState();
      expect(describeTutorialProgress(tutorial)).toBe("Tutorial not started");

      const started = startTutorial(tutorial);
      expect(describeTutorialProgress(started)).toContain("Step 1/4");

      const completed: any = { ...started, completed: true };
      expect(describeTutorialProgress(completed)).toBe("Tutorial completed");

      const skipped = skipTutorial(started);
      expect(describeTutorialProgress(skipped)).toBe("Tutorial skipped");
    });
  });
});
