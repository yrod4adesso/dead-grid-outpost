/**
 * Threat Summary — US-015
 *
 * Calculates and summarizes the current threat level based on:
 * - Building state (active, levels)
 * - Survivor assignments
 * - Current day/night cycle
 * - Wave intensity
 *
 * Threat levels: Watching, Escalating, Critical, Breached
 */

import type { DeadGridState } from "./state";
import type { ThreatLevel } from "./state";

// ============================================================================
// Threat Calculation
// ============================================================================

/**
 * Calculate the current threat level based on state.
 */
export function calculateThreatLevel(state: DeadGridState): ThreatLevel {
  // Breached: combat phase with insufficient defenders
  if (state.phase === "combat") {
    const activeDefenders = state.survivors.filter((s) => s.assignment === "defense").length;
    const totalDefendersNeeded = Math.ceil(state.day / 2); // Rough heuristic

    if (activeDefenders < totalDefendersNeeded / 2) {
      return "Breached";
    }
  }

  // Critical: high day, low resources, few defenders
  if (state.day >= 20) {
    const scrap = state.resources.find((r) => r.id === "scrap")?.amount ?? 0;
    const medicine = state.resources.find((r) => r.id === "medicine")?.amount ?? 0;
    const activeDefenders = state.survivors.filter((s) => s.assignment === "defense").length;

    if (scrap < 10 || medicine < 5 || activeDefenders < 2) {
      return "Critical";
    }
  }

  // Escalating: medium day, moderate resources
  if (state.day >= 10) {
    const scrap = state.resources.find((r) => r.id === "scrap")?.amount ?? 0;
    const medicine = state.resources.find((r) => r.id === "medicine")?.amount ?? 0;

    if (scrap < 20 || medicine < 10) {
      return "Escalating";
    }
  }

  // Watching: default, low threat
  return "Watching";
}

/**
 * Get a description of the current threat level.
 */
export function describeThreatLevel(level: ThreatLevel): string {
  switch (level) {
    case "Watching":
      return "Threat is low. Survivors are resting and resources are stable.";
    case "Escalating":
      return "Threat is increasing. Prepare defenses and gather more resources.";
    case "Critical":
      return "Threat is critical! Defenses are strained. Reinforce immediately!";
    case "Breached":
      return "BREACH DETECTED! The outpost is under heavy attack!";
  }
}

/**
 * Get threat level color for UI.
 */
export function getThreatLevelColor(level: ThreatLevel): string {
  switch (level) {
    case "Watching":
      return "#22c55e"; // green
    case "Escalating":
      return "#f59e0b"; // amber
    case "Critical":
      return "#ef4444"; // red
    case "Breached":
      return "#7f1d1d"; // dark red
  }
}

/**
 * Get actionable advice based on threat level.
 */
export function getThreatAdvice(level: ThreatLevel, state: DeadGridState): string[] {
  const advice: string[] = [];

  switch (level) {
    case "Watching":
      advice.push("Send more scavenging missions.");
      advice.push("Upgrade buildings when possible.");
      if (state.survivors.length < 5) {
        advice.push("Recruit more survivors.");
      }
      break;

    case "Escalating":
      advice.push("Increase defense assignments.");
      advice.push("Stockpile medicine and ammo.");
      advice.push("Complete checkpoint defenses for rewards.");
      break;

    case "Critical":
      advice.push("URGENT: Assign all available survivors to defense!");
      advice.push("Spend shards to unlock defensive nodes.");
      advice.push("Complete any available missions for emergency supplies.");
      break;

    case "Breached":
      advice.push("EMERGENCY: Activate all defensive abilities!");
      advice.push("Use healing items immediately!");
      advice.push("Prepare for the worst — save progress if possible.");
      break;
  }

  return advice;
}

/**
 * Calculate threat score (0-100) for granular display.
 */
export function calculateThreatScore(state: DeadGridState): number {
  let score = 0;

  // Day progression (0-40 points)
  score += Math.min(40, state.day * 2);

  // Resource scarcity (0-30 points)
  const scrap = state.resources.find((r) => r.id === "scrap")?.amount ?? 0;
  const medicine = state.resources.find((r) => r.id === "medicine")?.amount ?? 0;
  const food = state.resources.find((r) => r.id === "food")?.amount ?? 0;

  score += Math.max(0, 30 - scrap);
  score += Math.max(0, 30 - medicine * 3);
  score += Math.max(0, 20 - food * 2);

  // Defense readiness (0-20 points, subtracted)
  const activeDefenders = state.survivors.filter((s) => s.assignment === "defense").length;
  score -= activeDefenders * 5;

  // Combat phase multiplier
  if (state.phase === "combat") {
    score *= 1.5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get threat summary for display.
 */
export function getThreatSummary(state: DeadGridState): {
  level: ThreatLevel;
  score: number;
  description: string;
  color: string;
  advice: string[];
} {
  const level = calculateThreatLevel(state);
  const score = calculateThreatScore(state);

  return {
    level,
    score,
    description: describeThreatLevel(level),
    color: getThreatLevelColor(level),
    advice: getThreatAdvice(level, state),
  };
}
