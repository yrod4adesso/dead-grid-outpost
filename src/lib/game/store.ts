import { DEFAULT_GAME_STATE, type DeadGridState } from "@/lib/game/state";
import { clearGameState, loadGameState, saveGameState } from "@/lib/game/storage";

type Listener = () => void;

const listeners = new Set<Listener>();
let hasBootstrappedClientState = false;
let currentState: DeadGridState = DEFAULT_GAME_STATE;
let resumableState: DeadGridState | null = null;

export function subscribeGameState(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getGameSnapshot() {
  if (!hasBootstrappedClientState) {
    const loadedState = loadGameState();
    resumableState = loadedState?.hasStarted && loadedState.phase !== "ended" ? loadedState : null;
    currentState = loadedState?.phase === "ended" ? loadedState : DEFAULT_GAME_STATE;
    hasBootstrappedClientState = true;
  }

  return currentState;
}

export function getServerGameSnapshot() {
  return DEFAULT_GAME_STATE;
}

export function updateGameState(updater: (state: DeadGridState) => DeadGridState) {
  const nextState = updater(getGameSnapshot());

  if (nextState.hasStarted) {
    currentState = saveGameState(nextState);
    resumableState = currentState.phase === "ended" ? null : currentState;
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
