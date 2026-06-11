/**
 * Action Cost Preview — US-014
 *
 * Shows the cost of actions (recruit, unlock, build, upgrade) before
 * committing. Compares available resources against required costs.
 *
 * Invariants:
 * - Never mutates input state.
 * - Preview is deterministic based on current state.
 * - Can show multiple action types simultaneously.
 */

import type { DeadGridState, DeadGridProfile, ResourceId, BuildingId } from "./state";
import { BUILDING_PREREQUISITES } from "./building-tree";
import type { UNLOCK_NODES, UnlockNodeId } from "./meta-progression";

// ============================================================================
// Action Types
// ============================================================================

export type ActionCostType =
  | "recruit"
  | "unlock_node"
  | "build"
  | "upgrade"
  | "recruit_commander";

// ============================================================================
// Cost Preview Result
// ============================================================================

export type CostPreviewResult = {
  affordable: boolean;
  missingResources: Partial<Record<ResourceId, number>>;
  missingShards: number;
  unmetPrerequisites: string[];
};

// ============================================================================
// Action Cost Definitions
// ============================================================================

export const RECRUIT_COST: Partial<Record<ResourceId, number>> = {
  food: 3,
  scrap: 1,
};

export const RECRUIT_COMMANDER_COST: Partial<Record<ResourceId, number>> = {
  scrap: 20,
  medicine: 5,
  food: 10,
};

export const BUILD_COSTS: Partial<Record<ResourceId, number>> = {
  scrap: 10,
  food: 3,
};

export const UPGRADE_COSTS: Partial<Record<ResourceId, number>> = {
  scrap: 20,
  food: 5,
};

export const NODE_UNLOCK_COSTS: Record<UnlockNodeId, number> = {
  storage_doctrine: 2,
  field_triage: 3,
  watch_rota: 3,
  scavenger_training: 4,
  combat_drills: 4,
  resource_management: 5,
  advanced_tactics: 6,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate the cost preview for an action.
 */
export function previewActionCost(
  state: DeadGridState,
  profile: DeadGridProfile,
  actionType: ActionCostType,
  target?: string,
): CostPreviewResult {
  const available = { ...state.resources.reduce<Record<ResourceId, number>>((acc, r) => {
    acc[r.id] = r.amount;
    return acc;
  }, {} as Record<ResourceId, number>) };

  let cost: Partial<Record<ResourceId, number>> = {};
  let shardCost = 0;
  let prerequisites: string[] = [];

  switch (actionType) {
    case "recruit":
      cost = { ...RECRUIT_COST };
      break;

    case "recruit_commander":
      cost = { ...RECRUIT_COMMANDER_COST };
      break;

    case "unlock_node":
      if (target) {
        shardCost = NODE_UNLOCK_COSTS[target as keyof typeof UNLOCK_NODES] ?? 0;
        // Check node prerequisites from meta-progression
        // For now, assume no prerequisites for simplicity
      }
      break;

    case "build":
      cost = { ...BUILD_COSTS };
      if (target) {
        // Get prerequisites for the building
        const prereqs = BUILDING_PREREQUISITES[target as BuildingId] || [];
        prerequisites = prereqs
          .filter((p) => !profile.unlockedNodes.includes(p.buildingId))
          .map((p) => p.buildingId);
      }
      break;

    case "upgrade":
      cost = { ...UPGRADE_COSTS };
      if (target) {
        const prereqs = BUILDING_PREREQUISITES[target as BuildingId] || [];
        prerequisites = prereqs
          .filter((p) => !profile.unlockedNodes.includes(p.buildingId))
          .map((p) => p.buildingId);
      }
      break;

    default:
      break;
  }

  // Check resource affordability
  const missingResources: Partial<Record<ResourceId, number>> = {};
  for (const [res, needed] of Object.entries(cost)) {
    if (typeof needed === "number" && needed > 0) {
      const have = available[res as ResourceId] ?? 0;
      if (have < needed) {
        missingResources[res as ResourceId] = needed - have;
      }
    }
  }

  // Check shard affordability
  const availableShards = profile.blueprintShards;
  const missingShards = shardCost > 0 ? Math.max(0, shardCost - availableShards) : 0;

  return {
    affordable: Object.keys(missingResources).length === 0 && missingShards === 0 && prerequisites.length === 0,
    missingResources,
    missingShards,
    unmetPrerequisites: prerequisites,
  };
}

/**
 * Get shard cost for an action type.
 */
export function getActionShardCost(
  actionType: ActionCostType,
  target?: string,
): number {
  switch (actionType) {
    case "unlock_node":
      if (!target) return 0;
      return NODE_UNLOCK_COSTS[target as keyof typeof UNLOCK_NODES] ?? 0;
    default:
      return 0;
  }
}

/**
 * Check if an action can be performed.
 */
export function canPerformAction(
  state: DeadGridState,
  profile: DeadGridProfile,
  actionType: ActionCostType,
  target?: string,
): boolean {
  const preview = previewActionCost(state, profile, actionType, target);
  return preview.affordable;
}

/**
 * Format cost preview as a human-readable string.
 */
export function formatCostPreview(preview: CostPreviewResult): string {
  const parts: string[] = [];

  if (preview.missingShards > 0) {
    parts.push(`${preview.missingShards} blueprint shards`);
  }

  for (const [res, amount] of Object.entries(preview.missingResources)) {
    parts.push(`${amount} ${res}`);
  }

  for (const prereq of preview.unmetPrerequisites) {
    parts.push(`unlocked node: ${prereq}`);
  }

  return parts.length > 0 ? `Missing: ${parts.join(", ")}` : "All resources available!";
}
