/**
 * Profile Currency Ledger Unit Tests - US-002
 */

import { describe, it, expect } from "vitest";
import { earnShards, spendShards, canAffordShards, applyRewardShards } from "./profile-currency";
import type { DeadGridProfile } from "./state";

const makeProfile = (shards = 0): DeadGridProfile => ({
  version: 1,
  blueprintShards: shards,
  lifetimeRuns: 0,
  highestDayReached: 0,
  unlockedNodes: [],
  lastEarnedBlueprintShards: 0,
  lastRunOutcome: null,
  commander: null,
});

describe("Profile Currency Ledger", () => {
  describe("earnShards", () => {
    it("increases the balance by the earned amount", () => {
      const result = earnShards(makeProfile(10), 5);
      expect(result.blueprintShards).toBe(15);
      expect(result.lastEarnedBlueprintShards).toBe(5);
    });

    it("returns a new profile and never mutates the input", () => {
      const original = makeProfile(10);
      const result = earnShards(original, 5);
      expect(original.blueprintShards).toBe(10);
      expect(result).not.toBe(original);
    });

    it("never produces a negative balance and clamps negative earns to 0", () => {
      const result = earnShards(makeProfile(10), -5);
      expect(result.blueprintShards).toBe(10);
      expect(result.lastEarnedBlueprintShards).toBe(0);
    });

    it("clamps a corrupt negative starting balance to a non-negative result", () => {
      const result = earnShards(makeProfile(-100), 5);
      expect(result.blueprintShards).toBe(5);
    });

    it("floors fractional amounts to integers", () => {
      const result = earnShards(makeProfile(0), 3.9);
      expect(result.blueprintShards).toBe(3);
    });

    it("treats NaN/Infinity earns as 0", () => {
      expect(earnShards(makeProfile(7), Number.NaN).blueprintShards).toBe(7);
      expect(earnShards(makeProfile(7), Number.POSITIVE_INFINITY).blueprintShards).toBe(7);
    });
  });

  describe("spendShards", () => {
    it("deducts shards when affordable", () => {
      const { ok, profile } = spendShards(makeProfile(10), 4);
      expect(ok).toBe(true);
      expect(profile.blueprintShards).toBe(6);
    });

    it("rejects an overspend and leaves the profile unchanged", () => {
      const original = makeProfile(3);
      const { ok, profile, reason } = spendShards(original, 5);
      expect(ok).toBe(false);
      expect(profile).toBe(original);
      expect(profile.blueprintShards).toBe(3);
      expect(reason).toBeTruthy();
    });

    it("allows spending the entire balance", () => {
      const { ok, profile } = spendShards(makeProfile(8), 8);
      expect(ok).toBe(true);
      expect(profile.blueprintShards).toBe(0);
    });

    it("rejects non-positive spends without changing the profile", () => {
      const original = makeProfile(10);
      expect(spendShards(original, 0).ok).toBe(false);
      expect(spendShards(original, -3).ok).toBe(false);
      expect(spendShards(original, -3).profile).toBe(original);
    });

    it("does not mutate the input profile on a successful spend", () => {
      const original = makeProfile(10);
      const { profile } = spendShards(original, 4);
      expect(original.blueprintShards).toBe(10);
      expect(profile).not.toBe(original);
    });
  });

  describe("canAffordShards", () => {
    it("returns true only when balance covers the amount", () => {
      const p = makeProfile(5);
      expect(canAffordShards(p, 5)).toBe(true);
      expect(canAffordShards(p, 6)).toBe(false);
      expect(canAffordShards(p, 0)).toBe(false);
    });
  });
});

describe("applyRewardShards (first-loss bonus)", () => {
  const makeVictoryProfile = (shards = 0, lastOutcome: DeadGridProfile["lastRunOutcome"] = null): DeadGridProfile => ({
    version: 2,
    blueprintShards: shards,
    lifetimeRuns: 0,
    highestDayReached: 0,
    unlockedNodes: [],
    lastEarnedBlueprintShards: 0,
    lastRunOutcome: lastOutcome,
    commander: null,
    profileProgress: { firstLossRewardClaimed: false },
  });

  it("earns normal amount on victory", () => {
    const p = makeVictoryProfile(10);
    const result = applyRewardShards(p, 5, "victory");
    expect(result.blueprintShards).toBe(15);
    expect(result.lastEarnedBlueprintShards).toBe(5);
  });

  it("doubles shards on first defeat (first-loss bonus = double)", () => {
    // Profile has no prior defeat → first loss
    const p = makeVictoryProfile(10, null);
    const result = applyRewardShards(p, 5, "defeat");
    expect(result.blueprintShards).toBe(20); // 10 + 5*2
    expect(result.lastEarnedBlueprintShards).toBe(10);
  });

  it("does NOT double on subsequent defeats", () => {
    // Profile already has a defeat → not first loss
    const p = makeVictoryProfile(10, "defeat");
    const result = applyRewardShards(p, 5, "defeat");
    expect(result.blueprintShards).toBe(15); // Normal amount
  });

  it("doubles only once — subsequent defeats remain normal", () => {
    const p = makeVictoryProfile(15, "defeat");
    const r1 = applyRewardShards(p, 3, "defeat");
    expect(r1.blueprintShards).toBe(18); // 15 + 3

    const r2 = applyRewardShards(r1, 4, "defeat");
    expect(r2.blueprintShards).toBe(22); // 18 + 4 (normal)
  });

  it("doubles are clamped by earnShards non-negative invariant", () => {
    const p = makeVictoryProfile(0);
    const result = applyRewardShards(p, -5, "defeat");
    // Negative earn is clamped to 0 by earnShards
    expect(result.blueprintShards).toBe(0);
  });

  it("does not mutate input profile", () => {
    const p = makeVictoryProfile(10, null);
    applyRewardShards(p, 5, "defeat");
    expect(p.blueprintShards).toBe(10);
  });

  it("preserves other profile fields through applyRewardShards", () => {
    const p = makeVictoryProfile(10, null);
    const result = applyRewardShards(p, 5, "defeat");
    expect(result.version).toBe(2);
    expect(result.lifetimeRuns).toBe(0);
    expect(result.lastEarnedBlueprintShards).toBe(10);
    expect(result.profileProgress).toEqual({ firstLossRewardClaimed: false });
  });
});
