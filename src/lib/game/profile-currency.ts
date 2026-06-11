/**
 * Profile Currency Ledger - US-002
 *
 * Pure helpers for the persistent blueprint-shard economy that lives on the
 * DeadGridProfile (NOT on the active run state DeadGridState). These functions
 * never mutate their input; they return a new profile object.
 *
 * Invariants:
 * - blueprintShards is always a non-negative integer.
 * - Earning clamps any negative/NaN amount to 0 (an earn can never reduce a balance).
 * - Spending is rejected (profile returned unchanged) when the spend would
 *   overdraw the balance, when the amount is non-positive, or when the amount
 *   is not a finite number.
 */

import type { DeadGridProfile } from "./state";

/** Normalize a possibly-dirty numeric balance to a non-negative integer. */
function normalizeBalance(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

/** Normalize an incoming amount to a non-negative integer (0 for invalid input). */
function normalizeAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return Math.floor(amount);
}

/**
 * Earn (add) blueprint shards. The resulting balance is never negative and the
 * amount is clamped so an "earn" can never reduce the balance.
 *
 * Returns a new profile with blueprintShards increased and
 * lastEarnedBlueprintShards set to the amount actually earned.
 */
export function earnShards(profile: DeadGridProfile, amount: number): DeadGridProfile {
  const earned = normalizeAmount(amount);
  const current = normalizeBalance(profile.blueprintShards);
  return {
    ...profile,
    blueprintShards: current + earned,
    lastEarnedBlueprintShards: earned,
  };
}

/** Result of a spend attempt. */
export type SpendResult = {
  /** True when shards were deducted; false when the spend was rejected. */
  ok: boolean;
  /** The resulting profile. Unchanged from input when ok === false. */
  profile: DeadGridProfile;
  /** Human-readable reason when a spend is rejected. */
  reason?: string;
};

/**
 * Spend (deduct) blueprint shards. Rejects (returns the profile unchanged with
 * ok=false) when:
 *  - amount is not a positive finite number, or
 *  - amount exceeds the current balance.
 */
export function spendShards(profile: DeadGridProfile, amount: number): SpendResult {
  const requested = normalizeAmount(amount);
  if (requested <= 0) {
    return { ok: false, profile, reason: "Spend amount must be positive" };
  }

  const current = normalizeBalance(profile.blueprintShards);
  if (requested > current) {
    return {
      ok: false,
      profile,
      reason: `Insufficient shards: have ${current}, need ${requested}`,
    };
  }

  return {
    ok: true,
    profile: {
      ...profile,
      blueprintShards: current - requested,
    },
  };
}

/**
 * Apply a combat-summary shard reward, with first-loss bonus: if the profile
 * has no previous loss (lastRunOutcome !== "defeat"), double the shards earned.
 */
export function applyRewardShards(
  profile: DeadGridProfile,
  reward: number,
  outcome: NonNullable<DeadGridProfile["lastRunOutcome"]>,
): DeadGridProfile {
  const isDefeat = outcome === "defeat";
  const isFirstLoss = profile.lastRunOutcome !== "defeat";
  const doubled = isDefeat && isFirstLoss;
  const finalReward = doubled ? reward * 2 : reward;
  return earnShards(profile, finalReward);
}

/** Convenience: true when the profile can afford the given spend. */
export function canAffordShards(profile: DeadGridProfile, amount: number): boolean {
  const requested = normalizeAmount(amount);
  if (requested <= 0) {
    return false;
  }
  return normalizeBalance(profile.blueprintShards) >= requested;
}
