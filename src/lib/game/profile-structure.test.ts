/**
 * Profile Data Structure Tests (US-001)
 * Persistent Profile Data Structure
 */

import { describe, it, expect } from "vitest";
import {
  DEFAULT_GAME_PROFILE,
  PROFILE_VERSION,
  hydrateLoadedProfile,
  type DeadGridProfile,
  type ProfileProgress,
} from "./state";

const createProfile = (overrides: Partial<DeadGridProfile> = {}): DeadGridProfile => ({
  version: 1,
  blueprintShards: 0,
  lifetimeRuns: 0,
  highestDayReached: 0,
  unlockedNodes: [],
  lastEarnedBlueprintShards: 0,
  lastRunOutcome: null,
  commander: null,
  profileProgress: { firstLossRewardClaimed: false },
  ...overrides,
});

describe("Profile Data Structure (US-001)", () => {
  describe("DEFAULT_GAME_PROFILE", () => {
    it("should have PROFILE_VERSION 2", () => {
      expect(DEFAULT_GAME_PROFILE.version).toBe(2);
    });

    it("should have profileProgress with firstLossRewardClaimed", () => {
      expect(DEFAULT_GAME_PROFILE.profileProgress).toEqual({ firstLossRewardClaimed: false });
    });

    it("should have all required fields", () => {
      expect(DEFAULT_GAME_PROFILE).toMatchObject({
        version: 2,
        blueprintShards: 0,
        lifetimeRuns: 0,
        highestDayReached: 0,
        unlockedNodes: [],
        lastEarnedBlueprintShards: 0,
        lastRunOutcome: null,
        commander: null,
        profileProgress: { firstLossRewardClaimed: false },
      });
    });
  });

  describe("hydrateLoadedProfile - v1 migration", () => {
    it("should add profileProgress to v1 profiles", () => {
      const v1Profile: DeadGridProfile = {
        version: 1,
        blueprintShards: 5,
        lifetimeRuns: 3,
        highestDayReached: 5,
        unlockedNodes: ["storage_doctrine"],
        lastEarnedBlueprintShards: 2,
        lastRunOutcome: "victory",
        commander: null,
        // profileProgress is missing (v1 didn't have it)
      } as unknown as DeadGridProfile;

      const hydrated = hydrateLoadedProfile(v1Profile);

      expect(hydrated.version).toBe(2);
      expect(hydrated.profileProgress).toEqual({ firstLossRewardClaimed: false });
      // Original values should be preserved
      expect(hydrated.blueprintShards).toBe(5);
      expect(hydrated.lifetimeRuns).toBe(3);
      expect(hydrated.unlockedNodes).toEqual(["storage_doctrine"]);
    });

    it("should preserve existing profileProgress for v2 profiles", () => {
      const v2Profile = createProfile({
        version: 2,
        profileProgress: { firstLossRewardClaimed: true },
        blueprintShards: 10,
      });

      const hydrated = hydrateLoadedProfile(v2Profile);

      expect(hydrated.version).toBe(2);
      expect(hydrated.profileProgress.firstLossRewardClaimed).toBe(true);
      expect(hydrated.blueprintShards).toBe(10);
    });

    it("should handle null/undefined profile gracefully", () => {
      const minimal = createProfile();
      const hydrated = hydrateLoadedProfile(minimal);
      expect(hydrated.profileProgress).toBeDefined();
      expect(hydrated.profileProgress.firstLossRewardClaimed).toBe(false);
    });

    it("should handle profile with no version field", () => {
      const noVersion = createProfile({
        version: undefined as unknown as number,
      });
      const hydrated = hydrateLoadedProfile(noVersion);
      // Should get default profileProgress
      expect(hydrated.profileProgress).toBeDefined();
    });

    it("should preserve unlockedNodes during hydration", () => {
      const profile = createProfile({
        unlockedNodes: ["storage_doctrine", "field_triage"],
      });
      const hydrated = hydrateLoadedProfile(profile);
      expect(hydrated.unlockedNodes).toEqual(["storage_doctrine", "field_triage"]);
    });
  });

  describe("Profile shape - separate from DeadGridState", () => {
    it("should not contain run-specific fields", () => {
      // DeadGridProfile should not have run state fields like resources, buildings, etc.
      expect(DEFAULT_GAME_PROFILE).not.toHaveProperty("resources");
      expect(DEFAULT_GAME_PROFILE).not.toHaveProperty("buildings");
      expect(DEFAULT_GAME_PROFILE).not.toHaveProperty("day");
    });

    it("should only contain persistent fields", () => {
      const expectedFields = new Set([
        "version", "blueprintShards", "lifetimeRuns", "highestDayReached",
        "unlockedNodes", "lastEarnedBlueprintShards", "lastRunOutcome",
        "commander", "profileProgress",
      ]);
      const actualFields = new Set(Object.keys(DEFAULT_GAME_PROFILE));
      expect(actualFields).toEqual(expectedFields);
    });
  });
});
