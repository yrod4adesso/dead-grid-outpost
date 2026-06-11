/**
 * Daily Objectives System — US-012
 *
 * Objectives are tasks the player can complete each day/week to earn
 * bonus rewards. They persist between runs and can be completed.
 *
 * Invariants:
 * - Objectives are immutable once created.
 * - Completion state is tracked separately.
 * - Rewards are applied atomically on completion.
 */

import type { DeadGridState, DeadGridProfile } from "./state";
import type { ResourceId } from "./state";

// ============================================================================
// Objective Types
// ============================================================================

export type ObjectiveType =
  | "send_mission"
  | "unlock_node"
  | "complete_night"
  | "recruit_survivor"
  | "upgrade_building"
  | "defend_checkpoint";

export type ObjectiveDefinition = {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  target: number; // e.g., missions to send, nodes to unlock
  reward: Partial<Record<ResourceId, number>>;
  shardReward: number;
  weight: number; // probability weight for selection
};

export type ObjectiveProgress = {
  current: number;
  target: number;
};

export type ObjectiveInstance = {
  definitionId: string;
  progress: ObjectiveProgress;
  completed: boolean;
};

// ============================================================================
// Objective Definitions Registry
// ============================================================================

export const OBJECTIVE_DEFINITIONS: Record<string, ObjectiveDefinition> = {
  send_mission_easy: {
    id: "send_mission_easy",
    type: "send_mission",
    title: "Scavenger",
    description: "Send 3 scavenging missions to the outer ring.",
    target: 3,
    reward: { scrap: 5, food: 2 },
    shardReward: 2,
    weight: 4,
  },
  send_mission_medium: {
    id: "send_mission_medium",
    type: "send_mission",
    title: "Route Explorer",
    description: "Send 5 missions to different route destinations.",
    target: 5,
    reward: { scrap: 10, food: 3, medicine: 2 },
    shardReward: 5,
    weight: 3,
  },
  send_mission_hard: {
    id: "send_mission_hard",
    type: "send_mission",
    title: "Danger Runner",
    description: "Send 8 missions across all danger tiers.",
    target: 8,
    reward: { scrap: 20, food: 5, medicine: 5, ammo: 5 },
    shardReward: 10,
    weight: 2,
  },
  unlock_node: {
    id: "unlock_node",
    type: "unlock_node",
    title: "Tech Explorer",
    description: "Unlock 3 new nodes in the tech tree.",
    target: 3,
    reward: { scrap: 8 },
    shardReward: 4,
    weight: 3,
  },
  complete_night: {
    id: "complete_night",
    type: "complete_night",
    title: "Night Watch",
    description: "Successfully defend your outpost 3 nights in a row.",
    target: 3,
    reward: { scrap: 10, ammo: 3 },
    shardReward: 5,
    weight: 3,
  },
  recruit_survivor: {
    id: "recruit_survivor",
    type: "recruit_survivor",
    title: "Recruiter",
    description: "Recruit 2 new survivors for your outpost.",
    target: 2,
    reward: { scrap: 5, food: 5 },
    shardReward: 3,
    weight: 4,
  },
  upgrade_building: {
    id: "upgrade_building",
    type: "upgrade_building",
    title: "Builder",
    description: "Upgrade or build 2 new buildings.",
    target: 2,
    reward: { scrap: 10, food: 3 },
    shardReward: 4,
    weight: 3,
  },
  defend_checkpoint: {
    id: "defend_checkpoint",
    type: "defend_checkpoint",
    title: "Checkpoint Hero",
    description: "Complete 2 checkpoint defense events.",
    target: 2,
    reward: { scrap: 15, medicine: 5, ammo: 5 },
    shardReward: 8,
    weight: 2,
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a new set of daily objectives.
 * Picks weighted random objectives (up to 3).
 */
export function generateDailyObjectives(): ObjectiveInstance[] {
  const allDefs = Object.values(OBJECTIVE_DEFINITIONS);
  const totalWeight = allDefs.reduce((sum, d) => sum + d.weight, 0);
  const picked: ObjectiveInstance[] = [];
  const usedIds = new Set<string>();

  while (picked.length < 3) {
    let roll = Math.random() * totalWeight;
    for (const def of allDefs) {
      if (usedIds.has(def.id)) continue;
      roll -= def.weight;
      if (roll <= 0) {
        picked.push({
          definitionId: def.id,
          progress: { current: 0, target: def.target },
          completed: false,
        });
        usedIds.add(def.id);
        break;
      }
    }
  }

  return picked;
}

/**
 * Check whether an objective can progress given the action type.
 */
export function getObjectiveProgression(
  state: DeadGridState,
  actionType: string,
): { objectiveId: string; delta: number }[] {
  const progressions: { objectiveId: string; delta: number }[] = [];

  switch (actionType) {
    case "mission_sent":
      progressions.push({ objectiveId: "send_mission_easy", delta: 1 });
      progressions.push({ objectiveId: "send_mission_medium", delta: 1 });
      progressions.push({ objectiveId: "send_mission_hard", delta: 1 });
      break;

    case "night_defended":
      progressions.push({ objectiveId: "complete_night", delta: 1 });
      break;

    case "survivor_recruited":
      progressions.push({ objectiveId: "recruit_survivor", delta: 1 });
      break;

    case "building_upgraded":
      progressions.push({ objectiveId: "upgrade_building", delta: 1 });
      break;

    case "objective_completed":
      progressions.push({ objectiveId: "defend_checkpoint", delta: 1 });
      break;

    default:
      break;
  }

  return progressions;
}

/**
 * Get the definition for an objective by its ID.
 */
export function getObjectiveDefinition(id: string): ObjectiveDefinition | null {
  return OBJECTIVE_DEFINITIONS[id] ?? null;
}

/**
 * Get reward for completing an objective.
 */
export function getObjectiveRewards(definitionId: string): {
  resources: Partial<Record<ResourceId, number>>;
  shardReward: number;
} {
  const def = OBJECTIVE_DEFINITIONS[definitionId];
  if (!def) return { resources: {}, shardReward: 0 };

  return {
    resources: def.reward,
    shardReward: def.shardReward,
  };
}

/**
 * Get all definitions grouped by type.
 */
export function getDefinitionsByType(type: ObjectiveType): ObjectiveDefinition[] {
  return Object.values(OBJECTIVE_DEFINITIONS).filter((d) => d.type === type);
}

/**
 * Get count of completed objectives.
 */
export function getCompletedCount(objectives: ObjectiveInstance[]): number {
  return objectives.filter((o) => o.completed).length;
}

/**
 * Calculate total progress across all objectives.
 */
export function getTotalProgress(objectives: ObjectiveInstance[]): number {
  return objectives.reduce((sum, o) => sum + o.progress.current, 0);
}

/**
 * Describe objective completion for UI.
 */
export function describeObjective(objective: ObjectiveInstance): string {
  const def = OBJECTIVE_DEFINITIONS[objective.definitionId];
  if (!def) return "Unknown objective";

  const pct = Math.min(100, Math.round((objective.progress.current / objective.progress.target) * 100));
  return `${def.title}: ${objective.progress.current}/${objective.progress.target} (${pct}%)`;
}

/**
 * Create a fresh set of objectives with the given definitions.
 * Useful for migrating or initializing.
 */
export function createObjectivesFromDefinitions(
  definitions: string[],
): ObjectiveInstance[] {
  return definitions.map((defId) => {
    const def = OBJECTIVE_DEFINITIONS[defId];
    if (!def) throw new Error(`Unknown objective definition: ${defId}`);

    return {
      definitionId: def.id,
      progress: { current: 0, target: def.target },
      completed: false,
    };
  });
}
