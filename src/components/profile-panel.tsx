"use client";

import { useSyncExternalStore } from "react";
import { getGameProfileSnapshot, subscribeGameState } from "@/lib/game/store";
import {
  getProfileSummary,
  getAvailableUnlocks,
  getUnlockedNodes,
  unlockNode,
  canUnlockNode,
  type UnlockNode,
} from "@/lib/game/meta-progression";
import { updateGameState } from "@/lib/game/store";

export function ProfilePanel() {
  const profile = useSyncExternalStore(subscribeGameState, getGameProfileSnapshot, () => ({
    version: 1,
    blueprintShards: 0,
    lifetimeRuns: 0,
    highestDayReached: 0,
    unlockedNodes: [],
    lastEarnedBlueprintShards: 0,
    lastRunOutcome: null,
    commander: null,
  }));

  const summary = getProfileSummary(profile);
  const availableUnlocks = getAvailableUnlocks(profile);
  const unlockedNodes = getUnlockedNodes(profile);

  const handleUnlock = (node: UnlockNode) => {
    const { canUnlock } = canUnlockNode(profile, node.id);
    if (!canUnlock) return;

    try {
      const newProfile = unlockNode(profile, node.id);
      updateGameState((state) => {
        // Profile is updated via setCurrentProfile in store
        return state;
      });
      // Force profile update
      const { loadGameProfile, saveGameProfile } = require("@/lib/game/storage");
      const loaded = loadGameProfile();
      if (loaded) {
        saveGameProfile(newProfile);
      }
    } catch (error) {
      console.error("Failed to unlock:", error);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-amber-400">Outpost Profile</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Blueprint Shards</span>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded font-bold">
            {summary.totalShards}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-slate-700/50 rounded p-2 text-center">
          <div className="text-slate-400">Runs Completed</div>
          <div className="text-white font-bold text-lg">{summary.runsCompleted}</div>
        </div>
        <div className="bg-slate-700/50 rounded p-2 text-center">
          <div className="text-slate-400">Best Day</div>
          <div className="text-white font-bold text-lg">{summary.highestDay}</div>
        </div>
        <div className="bg-slate-700/50 rounded p-2 text-center">
          <div className="text-slate-400">Unlocks</div>
          <div className="text-white font-bold text-lg">
            {summary.unlockedCount}/{summary.unlockedCount + summary.availableUnlocks}
          </div>
        </div>
      </div>

      {availableUnlocks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Available Unlocks</h3>
          <div className="space-y-2">
            {availableUnlocks.map((node) => (
              <button
                key={node.id}
                onClick={() => handleUnlock(node)}
                className="w-full text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded p-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{node.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{node.description}</div>
                    <div className="text-xs text-amber-400 mt-1">{node.effect.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold">{node.cost} shards</div>
                    <div className="text-xs text-slate-500">{node.category}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {unlockedNodes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Active Unlocks</h3>
          <div className="flex flex-wrap gap-2">
            {unlockedNodes.map((node) => (
              <span
                key={node.id}
                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-semibold"
              >
                {node.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
