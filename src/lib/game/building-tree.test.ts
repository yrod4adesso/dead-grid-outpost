/**
 * Base-Building Unit Tests
 * Starship Mode: Comprehensive test coverage
 */

import { describe, it, expect } from "vitest";
import {
  canUnlockBuilding,
  getActiveSynergies,
  describeActiveSynergies,
  BUILDING_PREREQUISITES,
  BUILDING_SYNERGIES,
} from "./building-tree";
import type { BuildingState } from "./state";

const createBuilding = (id: string, level: number): BuildingState => ({
  id: id as BuildingState["id"],
  name: id,
  category: "Test",
  level,
  summary: "Test building",
  effect: "Test effect",
  isFocused: false,
});

describe("Building Tree", () => {
  describe("canUnlockBuilding", () => {
    it("should allow unlocking buildings with no prerequisites", () => {
      const buildings: BuildingState[] = [];
      const result = canUnlockBuilding(buildings, "workshop");
      expect(result.canUnlock).toBe(true);
    });

    it("should deny unlocking if prerequisite not met", () => {
      const buildings: BuildingState[] = [createBuilding("storage", 1)];
      const result = canUnlockBuilding(buildings, "watchtower");
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain("Storage Level 2");
    });

    it("should allow unlocking if prerequisite met", () => {
      const buildings: BuildingState[] = [createBuilding("storage", 2)];
      const result = canUnlockBuilding(buildings, "watchtower");
      expect(result.canUnlock).toBe(true);
    });
  });

  describe("getActiveSynergies", () => {
    it("should return no synergies when buildings not present", () => {
      const buildings: BuildingState[] = [];
      const synergies = getActiveSynergies(buildings);
      expect(synergies.length).toBe(0);
    });

    it("should activate Infirmary + Workshop synergy", () => {
      const buildings: BuildingState[] = [
        createBuilding("infirmary", 1),
        createBuilding("workshop", 2),
      ];
      const synergies = getActiveSynergies(buildings);
      const treatmentSynergy = synergies.find((s) => s.type === "treatment_efficiency");
      expect(treatmentSynergy).toBeDefined();
      expect(treatmentSynergy?.value).toBe(1);
    });

    it("should activate Workshop + Storage synergy", () => {
      const buildings: BuildingState[] = [
        createBuilding("workshop", 1),
        createBuilding("storage", 1),
      ];
      const synergies = getActiveSynergies(buildings);
      const scrapSynergy = synergies.find((s) => s.type === "scrap_yield");
      expect(scrapSynergy).toBeDefined();
      expect(scrapSynergy?.value).toBe(0.05);
    });
  });

  describe("describeActiveSynergies", () => {
    it("should describe active synergies", () => {
      const buildings: BuildingState[] = [
        createBuilding("infirmary", 1),
        createBuilding("workshop", 2),
      ];
      const descriptions = describeActiveSynergies(buildings);
      expect(descriptions.some((d) => d.includes("Infirmary + Workshop"))).toBe(true);
    });
  });
});
