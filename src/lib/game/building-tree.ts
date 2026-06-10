/**
 * Base-Building Fantasy - Building Tree & Synergies
 * Starship Mode: Production-ready, stable, scalable
 */

import type { BuildingId, BuildingState } from "./state";

// ============================================================================
// Building Tree - Prerequisites
// ============================================================================

export type BuildingPrerequisite = {
  buildingId: BuildingId;
  minLevel: number;
};

export const BUILDING_PREREQUISITES: Record<BuildingId, BuildingPrerequisite[]> = {
  workshop: [], // Startbuilding - no prerequisites
  infirmary: [], // Startbuilding - no prerequisites
  storage: [], // Startbuilding - no prerequisites
  watchtower: [
    { buildingId: "storage", minLevel: 2 }, // Requires Storage Level 2
  ],
  command_center: [], // Will be added to BuildingId type
};

// ============================================================================
// Room Synergies
// ============================================================================

export type SynergyEffect = {
  type: "treatment_efficiency" | "reward_retention" | "healing_bonus" | "scrap_yield" | "defense_bonus";
  value: number;
  label: string;
};

export type BuildingSynergy = {
  buildingIds: BuildingId[];
  effect: SynergyEffect;
  description: string;
};

export const BUILDING_SYNERGIES: BuildingSynergy[] = [
  {
    buildingIds: ["infirmary", "workshop"],
    effect: {
      type: "treatment_efficiency",
      value: 1,
      label: "+1 treatment efficiency",
    },
    description: "Infirmary + Workshop: Better treatment protocols",
  },
  {
    buildingIds: ["command_center", "storage"],
    effect: {
      type: "reward_retention",
      value: 0.1,
      label: "+10% reward retention",
    },
    description: "Command Center + Storage: Better logistics coordination",
  },
  {
    buildingIds: ["watchtower", "infirmary"],
    effect: {
      type: "healing_bonus",
      value: 0.5,
      label: "+0.5 healing bonus",
    },
    description: "Watchtower + Infirmary: Faster defender recovery",
  },
  {
    buildingIds: ["workshop", "storage"],
    effect: {
      type: "scrap_yield",
      value: 0.05,
      label: "+5% scrap yield",
    },
    description: "Workshop + Storage: Optimized salvage workflow",
  },
];

// ============================================================================
// Building Tree Utilities
// ============================================================================

export function canUnlockBuilding(
  buildings: BuildingState[],
  buildingId: BuildingId,
): { canUnlock: boolean; reason?: string } {
  const prerequisites = BUILDING_PREREQUISITES[buildingId] || [];

  for (const prereq of prerequisites) {
    const prereqBuilding = buildings.find((b) => b.id === prereq.buildingId);
    if (!prereqBuilding || prereqBuilding.level < prereq.minLevel) {
      return {
        canUnlock: false,
        reason: `Requires ${prereq.buildingId} Level ${prereq.minLevel}`,
      };
    }
  }

  return { canUnlock: true };
}

export function getActiveSynergies(buildings: BuildingState[]): SynergyEffect[] {
  const activeSynergies: SynergyEffect[] = [];

  for (const synergy of BUILDING_SYNERGIES) {
    const allBuildingsActive = synergy.buildingIds.every((buildingId) => {
      const building = buildings.find((b) => b.id === buildingId);
      return building && building.level >= 1;
    });

    if (allBuildingsActive) {
      activeSynergies.push(synergy.effect);
    }
  }

  return activeSynergies;
}

export function describeActiveSynergies(buildings: BuildingState[]): string[] {
  const descriptions: string[] = [];

  for (const synergy of BUILDING_SYNERGIES) {
    const allBuildingsActive = synergy.buildingIds.every((buildingId) => {
      const building = buildings.find((b) => b.id === buildingId);
      return building && building.level >= 1;
    });

    if (allBuildingsActive) {
      descriptions.push(synergy.description);
    }
  }

  return descriptions;
}

// ============================================================================
// Command Center - New Building
// ============================================================================

export const COMMAND_CENTER_EFFECTS: Record<number, { effect: string; statBonus: string }> = {
  1: {
    effect: "Recruit quality improved",
    statBonus: "+1 recruit candidate",
  },
  2: {
    effect: "Route visibility enhanced",
    statBonus: "Better mission preview",
  },
  3: {
    effect: "Commander assignment unlocked",
    statBonus: "Commander slot available",
  },
};

export function getCommandCenterEffect(level: number): { effect: string; statBonus: string } {
  return COMMAND_CENTER_EFFECTS[level] || COMMAND_CENTER_EFFECTS[1];
}
