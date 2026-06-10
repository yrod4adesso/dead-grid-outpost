/**
 * Meta-Progression Layer - Unlock Node Configuration
 * Starship Mode: Production-ready, stable, scalable
 */

import type { DeadGridProfile, BuildingId } from "./state";

// ============================================================================
// Unlock Node Types
// ============================================================================

export type UnlockNodeId =
  | "storage_doctrine"
  | "field_triage"
  | "watch_rota"
  | "scavenger_training"
  | "combat_drills"
  | "resource_management"
  | "advanced_tactics";

export type UnlockNodeCategory = "storage" | "recovery" | "defense" | "route" | "combat" | "general";

export type UnlockNode = {
  id: UnlockNodeId;
  name: string;
  category: UnlockNodeCategory;
  description: string;
  cost: number; // Blueprint Shards
  prerequisites: UnlockNodeId[];
  effect: {
    type: "storage_cap" | "healing_bonus" | "defense_bonus" | "scrap_bonus" | "route_intel" | "combat_stat";
    value: number;
    label: string;
  };
  level?: number; // For multi-level unlocks (1-5)
};

// ============================================================================
// Unlock Node Registry (3 First Nodes)
// ============================================================================

export const UNLOCK_NODES: Record<UnlockNodeId, UnlockNode> = {
  storage_doctrine: {
    id: "storage_doctrine",
    name: "Storage Doctrine",
    category: "storage",
    description: "Improved logistics protocols increase storage capacity by 20.",
    cost: 5,
    prerequisites: [],
    effect: {
      type: "storage_cap",
      value: 20,
      label: "+20 storage capacity",
    },
    level: 1,
  },
  field_triage: {
    id: "field_triage",
    name: "Field Triage",
    category: "recovery",
    description: "Advanced triage methods provide +1 medicine healing after night defense.",
    cost: 8,
    prerequisites: [],
    effect: {
      type: "healing_bonus",
      value: 1,
      label: "+1 post-combat healing",
    },
    level: 1,
  },
  watch_rota: {
    id: "watch_rota",
    name: "Watch Rota",
    category: "defense",
    description: "Optimized watch schedules improve defense crew effectiveness by +0.1 damage multiplier.",
    cost: 10,
    prerequisites: ["storage_doctrine"],
    effect: {
      type: "defense_bonus",
      value: 0.1,
      label: "+10% defense damage",
    },
    level: 1,
  },
  scavenger_training: {
    id: "scavenger_training",
    name: "Scavenger Training",
    category: "route",
    description: "Specialized scavenger drills add +1 scrap to all salvage missions.",
    cost: 12,
    prerequisites: ["storage_doctrine"],
    effect: {
      type: "scrap_bonus",
      value: 1,
      label: "+1 scrap per salvage mission",
    },
    level: 1,
  },
  combat_drills: {
    id: "combat_drills",
    name: "Combat Drills",
    category: "combat",
    description: "Regular combat training improves manual burst recovery time.",
    cost: 15,
    prerequisites: ["watch_rota"],
    effect: {
      type: "combat_stat",
      value: 0.05,
      label: "Faster manual recovery",
    },
    level: 1,
  },
  resource_management: {
    id: "resource_management",
    name: "Resource Management",
    category: "general",
    description: "Better resource tracking reduces waste and improves yields.",
    cost: 20,
    prerequisites: ["field_triage", "scavenger_training"],
    effect: {
      type: "storage_cap",
      value: 30,
      label: "+30 storage capacity",
    },
    level: 2,
  },
  advanced_tactics: {
    id: "advanced_tactics",
    name: "Advanced Tactics",
    category: "combat",
    description: "Elite tactics training significantly improves all combat stats.",
    cost: 30,
    prerequisites: ["combat_drills", "watch_rota"],
    effect: {
      type: "defense_bonus",
      value: 0.15,
      label: "+15% defense damage",
    },
    level: 2,
  },
};

// ============================================================================
// Unlock Node Utilities
// ============================================================================

export function getUnlockNode(id: UnlockNodeId): UnlockNode {
  const node = UNLOCK_NODES[id];
  if (!node) {
    throw new Error(`Unknown unlock node: ${id}`);
  }
  return node;
}

export function canUnlockNode(
  profile: DeadGridProfile,
  nodeId: UnlockNodeId,
): { canUnlock: boolean; reason?: string } {
  const node = getUnlockNode(nodeId);

  // Check if already unlocked
  if (profile.unlockedNodes.includes(nodeId)) {
    return { canUnlock: false, reason: "Already unlocked" };
  }

  // Check prerequisites
  for (const prereq of node.prerequisites) {
    if (!profile.unlockedNodes.includes(prereq)) {
      return { canUnlock: false, reason: `Requires ${getUnlockNode(prereq).name}` };
    }
  }

  // Check cost
  if (profile.blueprintShards < node.cost) {
    return { canUnlock: false, reason: `Requires ${node.cost} blueprint shards` };
  }

  return { canUnlock: true };
}

export function unlockNode(profile: DeadGridProfile, nodeId: UnlockNodeId): DeadGridProfile {
  const { canUnlock, reason } = canUnlockNode(profile, nodeId);
  if (!canUnlock) {
    throw new Error(`Cannot unlock ${nodeId}: ${reason}`);
  }

  const node = getUnlockNode(nodeId);

  return {
    ...profile,
    blueprintShards: profile.blueprintShards - node.cost,
    unlockedNodes: [...profile.unlockedNodes, nodeId],
  };
}

export function getAvailableUnlocks(profile: DeadGridProfile): UnlockNode[] {
  return Object.values(UNLOCK_NODES).filter((node) => {
    if (profile.unlockedNodes.includes(node.id)) {
      return false;
    }
    const { canUnlock } = canUnlockNode(profile, node.id);
    return canUnlock;
  });
}

export function getUnlockedNodes(profile: DeadGridProfile): UnlockNode[] {
  return profile.unlockedNodes
    .map((id) => {
      try {
        return getUnlockNode(id as UnlockNodeId);
      } catch {
        return null;
      }
    })
    .filter((node): node is UnlockNode => node !== null);
}

// ============================================================================
// Apply Unlocks to Game State
// ============================================================================

export type AppliedUnlockEffects = {
  storageCapBonus: number;
  unlockHealingBonus: number;
  damageMultiplierBonus: number;
  scrapYieldBonus: number;
  combatStatBonuses: Record<string, number>;
};

export function applyUnlockEffectsToState(
  profile: DeadGridProfile,
  baseState: {
    storageLimit: number;
    healingBonus: number;
    damageMultiplier: number;
    scrapYieldMultiplier: number;
  },
): typeof baseState & AppliedUnlockEffects {
  const unlockedNodes = getUnlockedNodes(profile);

  const effects: AppliedUnlockEffects = {
    storageCapBonus: 0,
    unlockHealingBonus: 0,
    damageMultiplierBonus: 0,
    scrapYieldBonus: 0,
    combatStatBonuses: {},
  };

  for (const node of unlockedNodes) {
    switch (node.effect.type) {
      case "storage_cap":
        effects.storageCapBonus += node.effect.value;
        break;
      case "healing_bonus":
        effects.unlockHealingBonus += node.effect.value;
        break;
      case "defense_bonus":
        effects.damageMultiplierBonus += node.effect.value;
        break;
      case "scrap_bonus":
        effects.scrapYieldBonus += node.effect.value;
        break;
      case "combat_stat":
        effects.combatStatBonuses[node.id] = node.effect.value;
        break;
    }
  }

  return {
    ...baseState,
    storageLimit: baseState.storageLimit + effects.storageCapBonus,
    healingBonus: baseState.healingBonus + effects.unlockHealingBonus,
    damageMultiplier: baseState.damageMultiplier + effects.damageMultiplierBonus,
    scrapYieldMultiplier: baseState.scrapYieldMultiplier + (effects.scrapYieldBonus > 0 ? effects.scrapYieldBonus * 0.1 : 0),
    storageCapBonus: effects.storageCapBonus,
    unlockHealingBonus: effects.unlockHealingBonus,
    damageMultiplierBonus: effects.damageMultiplierBonus,
    scrapYieldBonus: effects.scrapYieldBonus,
    combatStatBonuses: effects.combatStatBonuses,
  };
}

// ============================================================================
// Profile UI Helpers
// ============================================================================

export function getProfileSummary(profile: DeadGridProfile): {
  totalShards: number;
  runsCompleted: number;
  highestDay: number;
  unlockedCount: number;
  availableUnlocks: number;
} {
  const available = getAvailableUnlocks(profile);
  return {
    totalShards: profile.blueprintShards,
    runsCompleted: profile.lifetimeRuns,
    highestDay: profile.highestDayReached,
    unlockedCount: profile.unlockedNodes.length,
    availableUnlocks: available.length,
  };
}

export function formatProfileStats(profile: DeadGridProfile): string {
  const summary = getProfileSummary(profile);
  return `Shards: ${summary.totalShards} | Runs: ${summary.runsCompleted} | Best: Day ${summary.highestDay} | Unlocks: ${summary.unlockedCount}/${summary.unlockedCount + summary.availableUnlocks}`;
}
