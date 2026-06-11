/**
 * Chapter Reward Chests — US-011
 *
 * When a player completes a chapter milestone that grants a chest,
 * the chest can be opened once to claim its rewards.
 *
 * Invariants:
 * - Each chapter/milestone has at most one chest.
 * - Chests can only be opened once.
 * - Opening a chest applies rewards atomically.
 */

import type { DeadGridProfile } from "./state";
import type { ResourceId } from "./state";
import type { ChapterId } from "./chapter";

// ============================================================================
// Reward Chest Definition
// ============================================================================

export type RewardChest = {
  id: string;
  chapterId: ChapterId;
  milestoneIndex: number;
  title: string;
  description: string;
  reward: Partial<Record<ResourceId, number>>;
  shardReward: number;
};

// ============================================================================
// Opened Chest Tracking
// ============================================================================

export type RewardChestState = {
  opened: boolean;
};

// ============================================================================
// Reward Chest Registry
// Zone Alpha: modest rewards
// Zone Beta: better rewards
// Zone Gamma: substantial rewards
// ============================================================================

export const REWARD_CHESTS: Record<string, RewardChest> = {
  // ── Zone Alpha ──────────────────────────────────────────────────────
  "zone_alpha/0": {
    id: "chest_alpha_start",
    chapterId: "zone_alpha",
    milestoneIndex: 0,
    title: "Welcome Chest",
    description: "Starting supplies for your first patrol.",
    reward: { scrap: 5, food: 2 },
    shardReward: 3,
  },
  "zone_alpha/1": {
    id: "chest_alpha_patrol",
    chapterId: "zone_alpha",
    milestoneIndex: 1,
    title: "Patrol Rewards",
    description: "Supplies recovered during extended perimeter patrols.",
    reward: { scrap: 10, food: 3 },
    shardReward: 5,
  },
  "zone_alpha/2": {
    id: "chest_alpha_supply",
    chapterId: "zone_alpha",
    milestoneIndex: 2,
    title: "Supply Route Chest",
    description: "The secured supply route yields additional resources.",
    reward: { scrap: 15, food: 5, medicine: 2 },
    shardReward: 10,
  },

  // ── Zone Beta ───────────────────────────────────────────────────────
  "zone_beta/0": {
    id: "chest_beta_entry",
    chapterId: "zone_beta",
    milestoneIndex: 0,
    title: "Green Zone Cache",
    description: "Abandoned warehouses in the overgrown district hide useful supplies.",
    reward: { scrap: 20, food: 5, medicine: 3 },
    shardReward: 12,
  },
  "zone_beta/1": {
    id: "chest_beta_greenzone",
    chapterId: "zone_beta",
    milestoneIndex: 1,
    title: "District Cache",
    description: "A fortified cache found during the Green Zone Breach.",
    reward: { scrap: 30, food: 8, medicine: 5, ammo: 3 },
    shardReward: 18,
  },
  "zone_beta/2": {
    id: "chest_beta_forward",
    chapterId: "zone_beta",
    milestoneIndex: 2,
    title: "Forward Base Supplies",
    description: "Equipment hoarded at the forward base — everything you need.",
    reward: { scrap: 40, food: 10, medicine: 8, ammo: 5 },
    shardReward: 25,
  },
  "zone_beta/3": {
    id: "chest_beta_junction",
    chapterId: "zone_beta",
    milestoneIndex: 3,
    title: "Central Junction Cache",
    description:
      "The cleared junction reveals a massive hidden stash of resources.",
    reward: { scrap: 50, food: 12, medicine: 10, ammo: 8 },
    shardReward: 35,
  },

  // ── Zone Gamma ──────────────────────────────────────────────────────
  "zone_gamma/0": {
    id: "chest_gamma_entry",
    chapterId: "zone_gamma",
    milestoneIndex: 0,
    title: "Dead Zone Cache",
    description: "The dead zone holds dark secrets and valuable spoils.",
    reward: { scrap: 60, food: 15, medicine: 12, ammo: 8 },
    shardReward: 40,
  },
  "zone_gamma/1": {
    id: "chest_gamma_deadzone",
    chapterId: "zone_gamma",
    milestoneIndex: 1,
    title: "Outbreak Cache",
    description: "A hardened container near the outbreak epicenter.",
    reward: { scrap: 80, food: 20, medicine: 15, ammo: 12 },
    shardReward: 55,
  },
  "zone_gamma/2": {
    id: "chest_gamma_epicenter",
    chapterId: "zone_gamma",
    milestoneIndex: 2,
    title: "Epicenter Cache",
    description: "At the heart of the outbreak — maximum loot, maximum risk.",
    reward: { scrap: 100, food: 25, medicine: 20, ammo: 15 },
    shardReward: 70,
  },
  "zone_gamma/3": {
    id: "chest_gamma_source",
    chapterId: "zone_gamma",
    milestoneIndex: 3,
    title: "The Source Cache",
    description:
      "The final seal — the original outbreak node yields the ultimate cache.",
    reward: { scrap: 150, food: 30, medicine: 25, ammo: 20 },
    shardReward: 100,
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the chest reward definition for a chapter milestone.
 * Returns null if no chest exists at this milestone.
 */
export function getRewardChest(
  chapterId: ChapterId,
  milestoneIndex: number,
): RewardChest | null {
  const key = `${chapterId}/${milestoneIndex}`;
  return REWARD_CHESTS[key] ?? null;
}

/**
 * Check whether a specific chest has already been opened.
 */
export function hasOpenedChest(
  profile: DeadGridProfile,
  chapterId: ChapterId,
  milestoneIndex: number,
): boolean {
  const openedChests = profile.profileProgress.rewardChests;
  const key = `${chapterId}/${milestoneIndex}`;
  return !!openedChests[key];
}

/**
 * Open a reward chest and apply its rewards.
 *
 * Returns a new profile; never mutates the input.
 * Throws if the chest does not exist or has already been opened.
 */
export function openRewardChest(
  profile: DeadGridProfile,
  chapterId: ChapterId,
  milestoneIndex: number,
): DeadGridProfile {
  const chest = getRewardChest(chapterId, milestoneIndex);

  if (!chest) {
    throw new Error(`No reward chest for ${chapterId}/${milestoneIndex}`);
  }

  if (hasOpenedChest(profile, chapterId, milestoneIndex)) {
    throw new Error(`Reward chest already opened: ${chest.id}`);
  }

  const openedChests = { ...profile.profileProgress.rewardChests };
  openedChests[`${chapterId}/${milestoneIndex}`] = true;

  return {
    ...profile,
    blueprintShards: profile.blueprintShards + chest.shardReward,
    profileProgress: {
      ...profile.profileProgress,
      rewardChests: openedChests,
    },
  };
}

/**
 * Get all unopened chests for the given chapter.
 */
export function getAvailableChests(
  profile: DeadGridProfile,
  chapterId: ChapterId,
): RewardChest[] {
  return Object.values(REWARD_CHESTS)
    .filter(
      (c) =>
        c.chapterId === chapterId &&
        !hasOpenedChest(profile, chapterId, c.milestoneIndex)
    );
}

/**
 * Get the total potential reward from all unopened chests in a chapter.
 */
export function getChapterChestPotential(
  profile: DeadGridProfile,
  chapterId: ChapterId,
): { resources: Partial<Record<ResourceId, number>>; shardReward: number } {
  const chests = getAvailableChests(profile, chapterId);

  const resources: Partial<Record<ResourceId, number>> = {};
  let totalShards = 0;

  for (const chest of chests) {
    totalShards += chest.shardReward;
    for (const [res, amount] of Object.entries(chest.reward)) {
      resources[res as ResourceId] = (resources[res as ResourceId] ?? 0) + amount;
    }
  }

  return { resources, shardReward: totalShards };
}

/**
 * Summarize opened chests for display.
 */
export function describeOpenedChests(
  profile: DeadGridProfile,
  chapterId: ChapterId,
): string {
  const opened = Object.entries(REWARD_CHESTS)
    .filter(([key, chest]) => {
      const [chId, idx] = key.split("/");
      return chId === chapterId && hasOpenedChest(profile, chapterId, parseInt(idx));
    })
    .map(([, chest]) => chest.title);

  return opened.length > 0
    ? `Opened: ${opened.join(", ")}`
    : "No chests opened yet.";
}
