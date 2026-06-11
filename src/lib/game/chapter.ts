/**
 * Chapter Progression System - US-009
 *
 * Defines chapter gates with milestone unlocks. Each chapter has a set of
 * milestones that require days survived, blueprint shards, and optional node
 * prerequisites before they can be unlocked.
 *
 * Rules:
 * - Milestones must be unlocked in order (index 0 first, then 1, …).
 * - Unlocking a milestone deducts shards and advances progress for its chapter.
 * - currentChapter tracks the most-recently-unlocked chapter.
 * - completedChapters records chapters whose highest milestone is reached.
 * - Never mutates input; always returns a new profile object.
 */

import type { DeadGridProfile } from "./state";
import { UNLOCK_NODES } from "./meta-progression";

// ============================================================================
// Chapter Types
// ============================================================================

/** Unique identifiers for the three campaign chapters. */
export type ChapterId = "zone_alpha" | "zone_beta" | "zone_gamma";

/** A single milestone within a chapter that gates deeper progress. */
export type ChapterMilestone = {
  dayThreshold: number;   // minimum highestDayReached to attempt
  shardCost: number;      // blueprint shards required
  requiredNodes?: string[]; // optional UNLOCK_NODES prerequisites
  description: string;
};

/** Full chapter definition — static data. */
export type Chapter = {
  id: ChapterId;
  name: string;
  description: string;
  milestones: ChapterMilestone[];
  color: string;
};

// ============================================================================
// Chapter Registry
// ============================================================================

/** All registered chapters, keyed by their ChapterId. */
export const CHAPTERS: Record<ChapterId, Chapter> = {
  zone_alpha: {
    id: "zone_alpha",
    name: "Zone Alpha — Safe Perimeter",
    description: "The outer ring of surviving settlements.",
    color: "#34d399",
    milestones: [
      { dayThreshold: 1, shardCost: 0, description: "Starting zone" },
      { dayThreshold: 5, shardCost: 5, description: "Extend patrol range" },
      { dayThreshold: 12, shardCost: 10, description: "Secure supply routes" },
    ],
  },
  zone_beta: {
    id: "zone_beta",
    name: "Zone Beta — Overgrown Districts",
    description: "Once-busy commercial streets, now reclaimed by nature.",
    color: "#60a5fa",
    milestones: [
      { dayThreshold: 15, shardCost: 15, description: "Push into the green zone" },
      { dayThreshold: 22, shardCost: 20, description: "Establish forward base" },
      { dayThreshold: 30, shardCost: 25, description: "Clear central junction" },
    ],
  },
  zone_gamma: {
    id: "zone_gamma",
    name: "Zone Gamma — Dead Core",
    description: "The heart of the outbreak — where it started.",
    color: "#f87171",
    milestones: [
      { dayThreshold: 35, shardCost: 30, description: "Enter the dead zone" },
      { dayThreshold: 45, shardCost: 40, description: "Reach outbreak epicenter" },
      { dayThreshold: 60, shardCost: 50, description: "Seal the source" },
    ],
  },
};

/** Ordered list of chapter IDs (alpha → beta → gamma). */
export const CHAPTER_ORDER: ChapterId[] = ["zone_alpha", "zone_beta", "zone_gamma"];

// ============================================================================
// Helpers
// ============================================================================

/** Look up a chapter by id (throws on unknown id). */
function getChapter(id: ChapterId): Chapter {
  const chapter = CHAPTERS[id];
  if (!chapter) {
    throw new Error(`Unknown chapter: ${id}`);
  }
  return chapter;
}

// ============================================================================
// getCurrentChapter
// ============================================================================

/**
 * Determine which chapter is currently active based on the profile's
 * highest day survived. Returns the chapter whose first milestone the
 * player has most recently unlocked (or whose day threshold is met).
 */
export function getCurrentChapter(profile: DeadGridProfile): ChapterId {
  const { highestDayReached } = profile;
  const { chapterProgress } = profile.profileProgress;

  // If no chapter progress exists yet (migration gap), start at zone_alpha.
  if (!chapterProgress) {
    return determineChapterByDay(highestDayReached);
  }

  // Check if a later chapter's first milestone has been unlocked.
  // We walk chapters in order; whichever has milestone 0 reached and whose
  // dayThreshold ≤ highestDayReached is the current chapter.
  let bestChapter: ChapterId = chapterProgress.currentChapter ?? "zone_alpha";

  for (const chapId of CHAPTER_ORDER) {
    const milestoneProgress = chapterProgress.milestoneProgress[chapId] ?? 0;
    const chapter = getChapter(chapId);
    const milestone = chapter.milestones[0];

    if (milestoneProgress >= 0 && highestDayReached >= milestone.dayThreshold) {
      bestChapter = chapId;
    }
  }

  return bestChapter;
}

/** Pure day-to-chapter mapping (used by migration & tests). */
function determineChapterByDay(day: number): ChapterId {
  if (day >= CHAPTERS.zone_gamma.milestones[0].dayThreshold) return "zone_gamma";
  if (day >= CHAPTERS.zone_beta.milestones[0].dayThreshold) return "zone_beta";
  return "zone_alpha";
}

// ============================================================================
// canUnlockMilestone
// ============================================================================

/** Result of a milestone-can-unlock check. */
export type UnlockMilestoneResult = {
  canUnlock: boolean;
  reason?: string;
};

/**
 * Check whether the given milestone can be unlocked.
 *
 * Prerequisites:
 * 1. All prior milestones in the same chapter must be completed.
 * 2. The profile's highestDayReached must meet the milestone's dayThreshold.
 * 3. The profile must have enough blueprintShards.
 * 4. Any requiredNodes must already be in the profile's unlockedNodes.
 */
export function canUnlockMilestone(
  profile: DeadGridProfile,
  chapterId: ChapterId,
  milestoneIndex: number,
): UnlockMilestoneResult {
  const chapter = getChapter(chapterId);
  const milestone = chapter.milestones[milestoneIndex];

  if (!milestone) {
    return { canUnlock: false, reason: "Milestone index out of range" };
  }

  // Check that all prior milestones are completed (sequential unlock).
  for (let i = 0; i < milestoneIndex; i++) {
    const prev = chapter.milestones[i];
    if (prev.shardCost > 0) {
      // Prior milestones with cost must already be paid; we infer this by
      // checking milestoneProgress: prior indices must be reached.
    }
    // Milestone progress at prior indices must indicate completion.
    // For cost=0 milestones (like the starting zone), they are auto-completed.
  }

  const milestoneProgress = (profile.profileProgress.chapterProgress?.milestoneProgress[chapterId] ?? 0) + 1;
  // Prior milestone (index - 1) must be reached: milestoneProgress must be >= milestoneIndex + 1
  // Because milestoneProgress stores "highest reached index + 1" effectively — actually
  // milestoneProgress stores the 0-based index. So for milestoneIndex > 0, we need
  // milestoneProgress >= milestoneIndex (meaning the prior one was reached).
  // Let's check: if milestoneIndex === 0, no prior needed. If milestoneIndex === 1,
  // milestoneProgress must be >= 1 (meaning index 0 was reached).
  if (milestoneIndex > 0) {
    const progress = profile.profileProgress.chapterProgress?.milestoneProgress[chapterId] ?? 0;
    if (progress < milestoneIndex) {
      return { canUnlock: false, reason: "Must complete prior milestones first" };
    }
  }

  // Day threshold
  if (profile.highestDayReached < milestone.dayThreshold) {
    return {
      canUnlock: false,
      reason: `Requires day ${milestone.dayThreshold} reached (current best: ${profile.highestDayReached})`,
    };
  }

  // Shard cost
  if (profile.blueprintShards < milestone.shardCost) {
    return {
      canUnlock: false,
      reason: `Requires ${milestone.shardCost} blueprint shards (have ${profile.blueprintShards})`,
    };
  }

  // Required unlock nodes
  if (milestone.requiredNodes) {
    for (const nodeId of milestone.requiredNodes) {
      if (!profile.unlockedNodes.includes(nodeId)) {
        const node = UNLOCK_NODES[nodeId as keyof typeof UNLOCK_NODES];
        const name = node?.name ?? nodeId;
        return { canUnlock: false, reason: `Requires ${name}` };
      }
    }
  }

  return { canUnlock: true };
}

// ============================================================================
// unlockMilestone
// ============================================================================

/**
 * Unlock a milestone, deducting shards and advancing progress.
 * Returns a new profile object; the original is never mutated.
 *
 * Side-effects captured in the returned profile:
 * - Deducts shardCost from blueprintShards.
 * - Advances milestoneProgress for the chapter to milestoneIndex + 1.
 * - If the chapter's highest milestone is now reached, adds it to
 *   completedChapters and advances currentChapter to the next chapter
 *   (if one exists and its first milestone dayThreshold is met).
 */
export function unlockMilestone(
  profile: DeadGridProfile,
  chapterId: ChapterId,
  milestoneIndex: number,
): DeadGridProfile {
  const chapter = getChapter(chapterId);
  const milestone = chapter.milestones[milestoneIndex];

  if (!milestone) {
    throw new Error(`Milestone index ${milestoneIndex} out of range for chapter ${chapterId}`);
  }

  const result = canUnlockMilestone(profile, chapterId, milestoneIndex);
  if (!result.canUnlock) {
    throw new Error(`Cannot unlock milestone: ${result.reason}`);
  }

  const currentProgress = profile.profileProgress.chapterProgress?.milestoneProgress[chapterId] ?? 0;

  // New milestone progress: the highest reached index becomes milestoneIndex + 1
  // because milestoneProgress stores "how many milestones have been reached"
  // (0-based index + 1). After unlocking index N, progress = N + 1.
  const newProgress = milestoneIndex + 1;

  const completedChapters = profile.profileProgress.chapterProgress?.completedChapters ? [...profile.profileProgress.chapterProgress.completedChapters] : [];
  const currentChapter = profile.profileProgress.chapterProgress?.currentChapter ?? "zone_alpha";

  // Check if this completes the chapter (milestoneIndex is the last one)
  const isLastMilestone = milestoneIndex === chapter.milestones.length - 1;
  if (isLastMilestone && !completedChapters.includes(chapterId)) {
    completedChapters.push(chapterId);
  }

  // Advance currentChapter if chapter is complete and a next chapter exists
  let nextChapter = currentChapter;
  if (isLastMilestone && !completedChapters.includes(chapterId)) {
    // Already handled above
  } else if (isLastMilestone && completedChapters.includes(chapterId)) {
    // Find the next chapter whose first milestone dayThreshold is met
    const chapterIdx = CHAPTER_ORDER.indexOf(chapterId);
    for (let i = chapterIdx + 1; i < CHAPTER_ORDER.length; i++) {
      const nextChap = CHAPTER_ORDER[i];
      const nextChapterData = getChapter(nextChap);
      if (profile.highestDayReached >= nextChapterData.milestones[0].dayThreshold) {
        nextChapter = nextChap;
        break;
      }
    }
  }

  return {
    ...profile,
    blueprintShards: profile.blueprintShards - milestone.shardCost,
    profileProgress: {
      ...profile.profileProgress,
      chapterProgress: {
        currentChapter: nextChapter,
        milestoneProgress: {
          ...profile.profileProgress.chapterProgress?.milestoneProgress,
          [chapterId]: newProgress,
        },
        completedChapters,
      },
    },
  };
}

// ============================================================================
// getAvailableMilestones
// ============================================================================

/** An individual available-milestone entry returned by getAvailableMilestones. */
export type AvailableMilestone = {
  chapterId: ChapterId;
  milestoneIndex: number;
  milestone: ChapterMilestone;
  canUnlock: boolean;
  reason?: string;
};

/**
 * Return all milestone opportunities across all chapters, indicating which
 * are currently unlockable and why the others are not.
 *
 * Only includes the next-unlocked milestone per chapter (not all milestones).
 */
export function getAvailableMilestones(profile: DeadGridProfile): AvailableMilestone[] {
  const results: AvailableMilestone[] = [];

  for (const chapterId of CHAPTER_ORDER) {
    const chapter = getChapter(chapterId);
    const progress = profile.profileProgress.chapterProgress?.milestoneProgress[chapterId] ?? 0;
    // The next milestone to unlock is at index == progress (0-based, progress
    // tells us how many are already done).
    const nextIndex = progress;

    if (nextIndex < chapter.milestones.length) {
      const milestone = chapter.milestones[nextIndex];
      const result = canUnlockMilestone(profile, chapterId, nextIndex);
      results.push({
        chapterId,
        milestoneIndex: nextIndex,
        milestone,
        canUnlock: result.canUnlock,
        reason: result.reason,
      });
    }
  }

  return results;
}

// ============================================================================
// Chapter helpers for UI
// ============================================================================

/** Return chapter data for a given chapter id. */
export function getChapterData(id: ChapterId): Chapter {
  return getChapter(id);
}

/** Return the color for a chapter, or a default gray if unknown. */
export function getChapterColor(id: ChapterId): string {
  return CHAPTERS[id]?.color ?? "#9ca3af";
}

/** Return the description for a chapter. */
export function getChapterDescription(id: ChapterId): string {
  return CHAPTERS[id]?.description ?? "Unknown chapter.";
}

/** Check if a chapter is fully completed. */
export function isChapterComplete(profile: DeadGridProfile, chapterId: ChapterId): boolean {
  if (!profile.profileProgress.chapterProgress?.completedChapters) return false;
  return profile.profileProgress.chapterProgress.completedChapters.includes(chapterId);
}
