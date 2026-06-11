/**
 * Tutorial / Onboarding Flow — US-013
 *
 * Guides new players through the core game loop:
 * 1. Introduction (what is Dead Grid Outpost)
 * 2. First Mission (send a team)
 * 3. Night Defense (survive the first night)
 * 4. Rewards (claim your first rewards)
 *
 * Rules:
 * - Tutorial progresses forward only.
 * - Can be skipped at any point.
 * - Once completed, cannot regress.
 * - Cannot be re-entered after completion.
 */

import type { DeadGridState, DeadGridProfile } from "./state";

// ============================================================================
// Tutorial Steps
// ============================================================================

export type TutorialStepId = "intro" | "first_mission" | "night_defense" | "rewards";

export type TutorialStep = {
  id: TutorialStepId;
  title: string;
  description: string;
  actionRequired: string; // what the player needs to do
  triggerCondition: (state: DeadGridState, profile: DeadGridProfile) => boolean;
  hint: string;
};

// ============================================================================
// Tutorial State
// ============================================================================

export type TutorialState = {
  currentStep: TutorialStepId;
  stepHistory: TutorialStepId[];
  completed: boolean;
  skipped: boolean;
  started: boolean;
};

// ============================================================================
// Tutorial Step Definitions
// ============================================================================

export const TUTORIAL_STEPS: Record<TutorialStepId, Omit<TutorialStep, "triggerCondition">> = {
  intro: {
    id: "intro",
    title: "Welcome to Dead Grid Outpost",
    description:
      "You are the commander of the last outpost. Manage resources, send teams on missions, and survive each night.",
    actionRequired: "Read the instructions",
    hint: "Tap 'Next' when you're ready to start.",
  },
  first_mission: {
    id: "first_mission",
    title: "Send Your First Mission",
    description:
      "Send a team to scavenge for resources. Pick a route from the mission board.",
    actionRequired: "Send a scavenging mission",
    hint: "Click on a route on the map, then click 'Send Team'.",
  },
  night_defense: {
    id: "night_defense",
    title: "Night Defense",
    description:
      "At night, zombies attack the outpost. Assign survivors to defend positions.",
    actionRequired: "Start night defense",
    hint: "Switch to Night Mode when the day ends.",
  },
  rewards: {
    id: "rewards",
    title: "Claim Your Rewards",
    description:
      "Complete missions and nights to earn resources, shards, and unlock new content.",
    actionRequired: "Complete a mission or night",
    hint: "Check your rewards panel after any action.",
  },
};

// ============================================================================
// Step Order
// ============================================================================

export const TUTORIAL_ORDER: TutorialStepId[] = ["intro", "first_mission", "night_defense", "rewards"];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a fresh tutorial state.
 */
export function createTutorialState(): TutorialState {
  return {
    currentStep: "intro",
    stepHistory: [],
    completed: false,
    skipped: false,
    started: false,
  };
}

/**
 * Check if the tutorial can advance from the current step.
 * Returns true if the step's condition is met.
 */
export function canAdvanceStep(
  stepId: TutorialStepId,
  state: DeadGridState,
  profile: DeadGridProfile,
): boolean {
  const step = TUTORIAL_STEPS[stepId];
  if (!step) return false;

  switch (stepId) {
    case "intro":
      return true; // Always can advance from intro

    case "first_mission":
      // Triggered when player has started a run with missions available
      return state.hasStarted && state.missions.length > 0;

    case "night_defense":
      // Triggered when first night begins
      return state.day > 1;

    case "rewards":
      // Triggered when player has any completed mission or night
      return profile.lifetimeRuns > 0;

    default:
      return false;
  }
}

/**
 * Advance to the next step in the tutorial.
 */
export function advanceTutorialStep(
  tutorial: TutorialState,
  state: DeadGridState,
  profile: DeadGridProfile,
): TutorialState | null {
  if (tutorial.completed || tutorial.skipped) return null;

  const currentIndex = TUTORIAL_ORDER.indexOf(tutorial.currentStep);
  if (currentIndex === -1) return null;

  const nextStepId = TUTORIAL_ORDER[currentIndex + 1];
  if (!nextStepId) {
    // Tutorial complete
    return {
      ...tutorial,
      completed: true,
    };
  }

  if (!canAdvanceStep(nextStepId, state, profile)) return null;

  return {
    ...tutorial,
    currentStep: nextStepId,
    stepHistory: [...tutorial.stepHistory, tutorial.currentStep],
  };
}

/**
 * Skip the tutorial entirely.
 */
export function skipTutorial(tutorial: TutorialState): TutorialState {
  return {
    ...tutorial,
    skipped: true,
    completed: true,
  };
}

/**
 * Mark tutorial as started from the intro step.
 */
export function startTutorial(tutorial: TutorialState): TutorialState {
  return {
    ...tutorial,
    started: true,
  };
}

/**
 * Get the current step definition.
 */
export function getCurrentStep(
  tutorial: TutorialState,
): TutorialStep | null {
  if (tutorial.completed || tutorial.skipped) return null;

  const stepDef = TUTORIAL_STEPS[tutorial.currentStep];
  if (!stepDef) return null;

  // We can't attach triggerCondition here (it needs state/profile),
  // so return the step without it
  return {
    ...stepDef,
    triggerCondition: () => canAdvanceStep(tutorial.currentStep, {} as any, {} as any),
  };
}

/**
 * Check if a step is the first step.
 */
export function isFirstStep(tutorial: TutorialState): boolean {
  return tutorial.currentStep === "intro";
}

/**
 * Check if this is the last step (next would complete tutorial).
 */
export function isLastStep(tutorial: TutorialState): boolean {
  const idx = TUTORIAL_ORDER.indexOf(tutorial.currentStep);
  return idx === TUTORIAL_ORDER.length - 1;
}

/**
 * Get a summary of tutorial progress.
 */
export function describeTutorialProgress(
  tutorial: TutorialState,
): string {
  if (tutorial.skipped) return "Tutorial skipped";
  if (tutorial.completed) return "Tutorial completed";
  if (!tutorial.started) return "Tutorial not started";

  const step = TUTORIAL_STEPS[tutorial.currentStep];
  const idx = TUTORIAL_ORDER.indexOf(tutorial.currentStep);
  return `Step ${idx + 1}/4: ${step?.title ?? "Unknown"}`;
}
