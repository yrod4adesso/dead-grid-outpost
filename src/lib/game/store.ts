import {
  DEFAULT_GAME_PROFILE,
  DEFAULT_GAME_STATE,
  applyCombatSummaryProfileReward,
  type DeadGridProfile,
  type DeadGridState,
} from "@/lib/game/state";
import { getActiveCommanderEffects } from "@/lib/game/commander";
import { clearGameState, loadGameProfile, loadGameState, saveGameProfile, saveGameState } from "@/lib/game/storage";
import { setCurrentProfile } from "@/lib/game/state";

type Listener = () => void;

const listeners = new Set<Listener>();
let hasBootstrappedClientState = false;
let currentState: DeadGridState = DEFAULT_GAME_STATE;
let resumableState: DeadGridState | null = null;
let currentProfile: DeadGridProfile = DEFAULT_GAME_PROFILE;

export function subscribeGameState(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getGameSnapshot() {
  if (!hasBootstrappedClientState) {
    let loadedState = loadGameState();
    currentProfile = loadGameProfile() ?? DEFAULT_GAME_PROFILE;

    if (loadedState?.lastCombatSummary && !loadedState.lastCombatSummary.profileRewardGranted) {
      currentProfile = saveGameProfile(
        applyCombatSummaryProfileReward(currentProfile, loadedState.lastCombatSummary, loadedState.day),
      );
      loadedState = saveGameState({
        ...loadedState,
        lastCombatSummary: {
          ...loadedState.lastCombatSummary,
          profileRewardGranted: true,
        },
      });
    }

    resumableState = loadedState?.hasStarted && loadedState.phase !== "ended" ? loadedState : null;
    currentState = loadedState?.phase === "ended" ? loadedState : DEFAULT_GAME_STATE;
    setCurrentProfile(currentProfile);
    hasBootstrappedClientState = true;
  }

  return currentState;
}

export function getServerGameSnapshot() {
  return DEFAULT_GAME_STATE;
}

export function getGameProfileSnapshot() {
  getGameSnapshot();
  return currentProfile;
}

export function getServerGameProfileSnapshot() {
  return DEFAULT_GAME_PROFILE;
}

export function updateGameState(updater: (state: DeadGridState) => DeadGridState) {
  let nextState = updater(getGameSnapshot());

  if (nextState.lastCombatSummary && !nextState.lastCombatSummary.profileRewardGranted) {
    currentProfile = saveGameProfile(
      applyCombatSummaryProfileReward(currentProfile, nextState.lastCombatSummary, nextState.day),
    );
    nextState = {
      ...nextState,
      lastCombatSummary: {
        ...nextState.lastCombatSummary,
        profileRewardGranted: true,
      },
    };
  }

  if (nextState.hasStarted) {
    currentState = saveGameState(nextState);
    resumableState = currentState.phase === "ended" ? null : currentState;
    setCurrentProfile(currentProfile);
  } else {
    clearGameState();
    resumableState = null;
    currentState = nextState;
  }

  listeners.forEach((listener) => listener());
}

export function getResumableGameSnapshot() {
  getGameSnapshot();
  return resumableState;
}

export function resumeSavedGame() {
  const savedState = getResumableGameSnapshot();

  if (!savedState?.hasStarted) {
    return;
  }

  currentState = savedState;
  listeners.forEach((listener) => listener());
}


export function getCommanderEffects() {
  getGameSnapshot();
  return getActiveCommanderEffects(currentProfile.commander as any);
}
