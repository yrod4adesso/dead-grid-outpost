"use client";

import { useSyncExternalStore } from "react";
import { getGameProfileSnapshot, subscribeGameState, updateGameState } from "@/lib/game/store";
import {
  getCommanderPerks,
  canUnlockPerk,
  unlockPerk,
  gainCommanderExp,
  createCommander,
  getActiveCommanderEffects,
  COMMANDER_PERKS,
  COMMANDER_RARITY_BONUSES,
  type Commander,
  type CommanderPerkBranch,
} from "@/lib/game/commander";
import { saveGameProfile, loadGameProfile } from "@/lib/game/storage";

function useCommanderData() {
  const profile = useSyncExternalStore(subscribeGameState, getGameProfileSnapshot, () => ({
    commander: null,
  }));

  const commander = profile.commander as Commander | null;
  const effects = getActiveCommanderEffects(commander);

  return { commander, effects };
}

export function CommanderPanel() {
  const { commander, effects } = useCommanderData();

  if (!commander) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold text-amber-400 mb-3">Commander</h2>
        <div className="text-slate-400 text-sm">
          No commander assigned yet. Complete special missions or events to recruit one!
        </div>
      </div>
    );
  }

  const rarityColors = {
    common: "text-slate-300",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-amber-400",
  };

  const branchIcons: Record<CommanderPerkBranch, string> = {
    combat: "⚔️",
    route: "🗺️",
    recovery: "❤️",
  };

  const handleUnlockPerk = (perkId: string) => {
    if (!commander) return;

    const { canUnlock, reason } = canUnlockPerk(commander, perkId);
    if (!canUnlock) {
      alert(reason || "Cannot unlock this perk");
      return;
    }

    try {
      const updatedCommander = unlockPerk(commander, perkId);
      
      // Update profile
      const profile = loadGameProfile();
      if (profile) {
        profile.commander = updatedCommander;
        saveGameProfile(profile);
        
        // Trigger re-render
        updateGameState((state) => state);
      }
    } catch (error) {
      console.error("Failed to unlock perk:", error);
      alert("Failed to unlock perk");
    }
  };

  const handleTestGainExp = () => {
    if (!commander) return;
    
    const updatedCommander = gainCommanderExp(commander, 50);
    
    const profile = loadGameProfile();
    if (profile) {
      profile.commander = updatedCommander;
      saveGameProfile(profile);
      updateGameState((state) => state);
    }
  };

  const currentPerks = getCommanderPerks(commander.currentBranch);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Commander</h2>
          <div className={`text-sm font-semibold ${rarityColors[commander.rarity]}`}>
            {commander.name} • {commander.rarity.toUpperCase()} • Lvl {commander.level}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">XP</div>
          <div className="text-amber-400 font-bold">{commander.exp} / {100 * commander.level}</div>
        </div>
      </div>

      {/* Active Branch */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{branchIcons[commander.currentBranch]}</span>
          <span className="text-sm font-semibold text-slate-300 uppercase">
            {commander.currentBranch} Specialization
          </span>
        </div>

        {/* Unlocked Perks */}
        <div className="space-y-2 mb-4">
          {commander.unlockedPerks.map((perkId) => {
            const perk = COMMANDER_PERKS[perkId];
            if (!perk) return null;
            return (
              <div key={perkId} className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-emerald-400">{perk.name}</div>
                    <div className="text-xs text-slate-400">{perk.description}</div>
                  </div>
                  <div className="text-xs text-emerald-400 font-bold">{perk.effect.label}</div>
                </div>
              </div>
            );
          })}
          {commander.unlockedPerks.length === 0 && (
            <div className="text-sm text-slate-500 italic">No perks unlocked yet</div>
          )}
        </div>

        {/* Available Perks to Unlock */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Available Perks</h3>
          <div className="space-y-2">
            {currentPerks.map((perk) => {
              const { canUnlock, reason } = commander ? canUnlockPerk(commander, perk.id) : { canUnlock: false, reason: "No commander" };
              const isUnlocked = commander?.unlockedPerks.includes(perk.id);
              
              if (isUnlocked) return null;

              return (
                <button
                  key={perk.id}
                  onClick={() => handleUnlockPerk(perk.id)}
                  disabled={!canUnlock}
                  className={`w-full text-left rounded p-2 border transition-all ${
                    canUnlock
                      ? "bg-slate-700 hover:bg-slate-600 border-slate-600"
                      : "bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {perk.name} <span className="text-xs text-slate-400">(Tier {perk.tier})</span>
                      </div>
                      <div className="text-xs text-slate-400">{perk.description}</div>
                      {!canUnlock && reason && (
                        <div className="text-xs text-amber-400 mt-1">⚠️ {reason}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-sm">{perk.effect.label}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Effects */}
      <div className="border-t border-slate-700 pt-3 mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Active Bonuses</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {effects.damageBonus > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-1 text-center">
              <div className="text-red-400 font-bold">+{Math.round(effects.damageBonus * 100)}%</div>
              <div className="text-slate-400">Damage</div>
            </div>
          )}
          {effects.healingBonus > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded p-1 text-center">
              <div className="text-green-400 font-bold">+{Math.round(effects.healingBonus * 100)}%</div>
              <div className="text-slate-400">Healing</div>
            </div>
          )}
          {effects.missionBonus > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-1 text-center">
              <div className="text-blue-400 font-bold">+{Math.round(effects.missionBonus * 100)}%</div>
              <div className="text-slate-400">Mission</div>
            </div>
          )}
          {effects.defenseBonus > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-1 text-center">
              <div className="text-purple-400 font-bold">+{Math.round(effects.defenseBonus * 100)}%</div>
              <div className="text-slate-400">Defense</div>
            </div>
          )}
          {effects.recruitBonus > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-1 text-center">
              <div className="text-amber-400 font-bold">+{Math.round(effects.recruitBonus * 100)}%</div>
              <div className="text-slate-400">Recruits</div>
            </div>
          )}
        </div>
      </div>

      {/* Test Button (Development) */}
      <button
        onClick={handleTestGainExp}
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-1 rounded transition-colors"
      >
        Dev: +50 XP (Test)
      </button>
    </div>
  );
}
