/**
 * Commander / Hero / Specialist Layer
 * Starship Mode: Production-ready, stable, scalable
 */

import type { DeadGridProfile } from "./state";

// ============================================================================
// Commander Types & Rarity
// ============================================================================

export type CommanderId = string; // Unique ID per commander instance
export type CommanderRarity = "common" | "rare" | "epic" | "legendary";
export type CommanderPerkBranch = "combat" | "route" | "recovery";

export type CommanderPerk = {
  id: string;
  name: string;
  description: string;
  branch: CommanderPerkBranch;
  tier: 1 | 2 | 3;
  effect: {
    type: "damage_bonus" | "healing_bonus" | "recruit_bonus" | "mission_bonus" | "defense_bonus";
    value: number;
    label: string;
  };
};

export type Commander = {
  id: CommanderId;
  name: string;
  rarity: CommanderRarity;
  level: number; // 1-10
  exp: number; // Experience points
  currentBranch: CommanderPerkBranch;
  unlockedPerks: string[]; // Perk IDs
  equipment: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
};

// ============================================================================
// Commander Perks - 3 Branches
// ============================================================================

export const COMMANDER_PERKS: Record<string, CommanderPerk> = {
  // COMBAT BRANCH
  "combat_1_marksman": {
    id: "combat_1_marksman",
    name: "Marksman Training",
    description: "Improved aim and trigger discipline.",
    branch: "combat",
    tier: 1,
    effect: {
      type: "damage_bonus",
      value: 0.1,
      label: "+10% damage",
    },
  },
  "combat_2_tactical": {
    id: "combat_2_tactical",
    name: "Tactical Advantage",
    description: "Better positioning and cover usage.",
    branch: "combat",
    tier: 2,
    effect: {
      type: "defense_bonus",
      value: 0.15,
      label: "+15% defense",
    },
  },
  "combat_3_elite": {
    id: "combat_3_elite",
    name: "Elite Combat",
    description: "Master-level combat proficiency.",
    branch: "combat",
    tier: 3,
    effect: {
      type: "damage_bonus",
      value: 0.25,
      label: "+25% damage",
    },
  },
  // ROUTE BRANCH
  "route_1_scavenger": {
    id: "route_1_scavenger",
    name: "Scavenger Expert",
    description: "Better at finding resources on missions.",
    branch: "route",
    tier: 1,
    effect: {
      type: "recruit_bonus",
      value: 0.1,
      label: "+10% recruit quality",
    },
  },
  "route_2_explorer": {
    id: "route_2_explorer",
    name: "Master Explorer",
    description: "Discovers hidden routes and shortcuts.",
    branch: "route",
    tier: 2,
    effect: {
      type: "mission_bonus",
      value: 0.15,
      label: "+15% mission success",
    },
  },
  "route_3_vision": {
    id: "route_3_vision",
    name: "Eagle Vision",
    description: "Sees the entire map clearly.",
    branch: "route",
    tier: 3,
    effect: {
      type: "mission_bonus",
      value: 0.2,
      label: "+20% mission success",
    },
  },
  // RECOVERY BRANCH
  "recovery_1_medic": {
    id: "recovery_1_medic",
    name: "Field Medic",
    description: "Better at treating wounds.",
    branch: "recovery",
    tier: 1,
    effect: {
      type: "healing_bonus",
      value: 0.1,
      label: "+10% healing",
    },
  },
  "recovery_2_stabilizer": {
    id: "recovery_2_stabilizer",
    name: "Stabilization Expert",
    description: "Keeps crew stable under pressure.",
    branch: "recovery",
    tier: 2,
    effect: {
      type: "healing_bonus",
      value: 0.2,
      label: "+20% healing",
    },
  },
  "recovery_3_immortal": {
    id: "recovery_3_immortal",
    name: "Immortal Will",
    description: "Unbreakable spirit and resilience.",
    branch: "recovery",
    tier: 3,
    effect: {
      type: "healing_bonus",
      value: 0.3,
      label: "+30% healing",
    },
  },
};

// ============================================================================
// Commander Rarity Bonuses
// ============================================================================

export const COMMANDER_RARITY_BONUSES: Record<CommanderRarity, { expRequired: number; perkSlots: number; statBonus: number }> = {
  common: { expRequired: 100, perkSlots: 1, statBonus: 0.05 },
  rare: { expRequired: 200, perkSlots: 2, statBonus: 0.1 },
  epic: { expRequired: 400, perkSlots: 3, statBonus: 0.15 },
  legendary: { expRequired: 800, perkSlots: 4, statBonus: 0.2 },
};

// ============================================================================
// Commander Creation & Management
// ============================================================================

export function createCommander(
  name: string,
  rarity: CommanderRarity,
): Commander {
  return {
    id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    rarity,
    level: 1,
    exp: 0,
    currentBranch: "combat",
    unlockedPerks: [],
    equipment: {},
  };
}

export function getCommanderPerks(branch: CommanderPerkBranch): CommanderPerk[] {
  return Object.values(COMMANDER_PERKS).filter((perk) => perk.branch === branch);
}

export function canUnlockPerk(commander: Commander, perkId: string): { canUnlock: boolean; reason?: string } {
  const perk = COMMANDER_PERKS[perkId];
  if (!perk) {
    return { canUnlock: false, reason: "Unknown perk" };
  }

  // Check if already unlocked
  if (commander.unlockedPerks.includes(perkId)) {
    return { canUnlock: false, reason: "Already unlocked" };
  }

  // Check tier requirement (must unlock tier 1 before tier 2, etc.)
  const tier = perk.tier;
  if (tier > 1) {
    const parentPerk = Object.values(COMMANDER_PERKS).find(
      (p) => p.branch === perk.branch && p.tier === tier - 1
    );
    if (!parentPerk || !commander.unlockedPerks.includes(parentPerk.id)) {
      return { canUnlock: false, reason: `Requires ${parentPerk?.name || "previous tier"}` };
    }
  }

  // Check perk slot availability
  const rarityBonus = COMMANDER_RARITY_BONUSES[commander.rarity];
  if (commander.unlockedPerks.length >= rarityBonus.perkSlots) {
    return { canUnlock: false, reason: "No perk slots available" };
  }

  return { canUnlock: true };
}

export function unlockPerk(commander: Commander, perkId: string): Commander {
  const { canUnlock, reason } = canUnlockPerk(commander, perkId);
  if (!canUnlock) {
    throw new Error(`Cannot unlock perk: ${reason}`);
  }

  return {
    ...commander,
    unlockedPerks: [...commander.unlockedPerks, perkId],
  };
}

export function gainCommanderExp(commander: Commander, exp: number): Commander {
  let newExp = commander.exp + exp;
  let newLevel = commander.level;
  let newRarity = commander.rarity;

  // Level up logic
  const expPerLevel = 100 * commander.level;
  if (newExp >= expPerLevel) {
    newExp -= expPerLevel;
    newLevel++;

    // Check for rarity upgrade at level 5 and 10
    if (newLevel === 5 && commander.rarity === "common") {
      newRarity = "rare";
    } else if (newLevel === 5 && commander.rarity === "rare") {
      newRarity = "epic";
    } else if (newLevel === 10 && commander.rarity === "epic") {
      newRarity = "legendary";
    }
  }

  return {
    ...commander,
    exp: newExp,
    level: newLevel,
    rarity: newRarity,
  };
}

// ============================================================================
// Commander Effects on Game Systems
// ============================================================================

export type CommanderEffects = {
  damageBonus: number;
  healingBonus: number;
  recruitBonus: number;
  missionBonus: number;
  defenseBonus: number;
};

export function getActiveCommanderEffects(commander: Commander | null): CommanderEffects {
  if (!commander) {
    return {
      damageBonus: 0,
      healingBonus: 0,
      recruitBonus: 0,
      missionBonus: 0,
      defenseBonus: 0,
    };
  }

  const effects: CommanderEffects = {
    damageBonus: 0,
    healingBonus: 0,
    recruitBonus: 0,
    missionBonus: 0,
    defenseBonus: 0,
  };

  // Apply rarity bonus
  const rarityBonus = COMMANDER_RARITY_BONUSES[commander.rarity];
  effects.damageBonus += rarityBonus.statBonus;
  effects.healingBonus += rarityBonus.statBonus;

  // Apply unlocked perks
  for (const perkId of commander.unlockedPerks) {
    const perk = COMMANDER_PERKS[perkId];
    if (!perk) continue;

    switch (perk.effect.type) {
      case "damage_bonus":
        effects.damageBonus += perk.effect.value;
        break;
      case "healing_bonus":
        effects.healingBonus += perk.effect.value;
        break;
      case "recruit_bonus":
        effects.recruitBonus += perk.effect.value;
        break;
      case "mission_bonus":
        effects.missionBonus += perk.effect.value;
        break;
      case "defense_bonus":
        effects.defenseBonus += perk.effect.value;
        break;
    }
  }

  return effects;
}

// ============================================================================
// Profile Integration
// ============================================================================

export function addCommanderToProfile(profile: DeadGridProfile, commander: Commander): DeadGridProfile {
  // Store commander data in unlockedNodes as JSON (temporary solution)
  // In production, would need dedicated commander storage
  const commanderKey = `commander_${commander.id}`;
  const existingNodes = profile.unlockedNodes;
  
  // This is a placeholder - real implementation would need proper storage
  return {
    ...profile,
    unlockedNodes: [...existingNodes, commanderKey],
  };
}
