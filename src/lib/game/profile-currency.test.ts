/**
 * Profile Currency Ledger Unit Tests - US-002
 */

import { describe, it, expect } from "vitest";
import { earnShards, spendShards, canAffordShards } from "./profile-currency";
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
