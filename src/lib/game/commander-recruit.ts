/**
 * Commander Recruitment - One-time starter commander or special event
 */

import { createCommander, type CommanderRarity } from "./commander";
import { loadGameProfile, saveGameProfile } from "./storage";

export type CommanderRecruitResult = {
  success: boolean;
  commander: ReturnType<typeof createCommander> | null;
  message: string;
};

/**
 * Recruit a starter commander (one-time only)
 * Returns a rare commander for new players
 */
export function recruitStarterCommander(): CommanderRecruitResult {
  const profile = loadGameProfile();
  if (!profile) {
    return {
      success: false,
      commander: null,
      message: "Profile not found. Start a game first.",
    };
  }

  if (profile.commander) {
    return {
      success: false,
      commander: null,
      message: "You already have a commander!",
    };
  }

  // Create a rare starter commander
  const starterNames = [
    "Captain Vance",
    "Sergeant Mara",
    "Dr. Chen",
    "Commander Reyes",
    "Lieutenant Fox",
  ];

  const name = starterNames[Math.floor(Math.random() * starterNames.length)];
  const commander = createCommander(name, "rare");

  // Save to profile
  profile.commander = commander;
  saveGameProfile(profile);

  return {
    success: true,
    commander,
    message: `Recruited ${commander.name} (Rare Commander)!`,
  };
}

/**
 * Check if player can recruit a starter commander
 */
export function canRecruitStarterCommander(): { canRecruit: boolean; reason?: string } {
  const profile = loadGameProfile();
  if (!profile) {
    return { canRecruit: false, reason: "No profile found" };
  }

  if (profile.commander) {
    return { canRecruit: false, reason: "Already has a commander" };
  }

  return { canRecruit: true };
}
