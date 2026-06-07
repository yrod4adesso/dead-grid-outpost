import { DEFAULT_GAME_STATE, type DeadGridState } from "@/lib/game/state";
import { clearGameState, loadGameState, saveGameState } from "@/lib/game/storage";

type Listener = () => void;

const listeners = new Set<Listener>();
let hasBootstrappedClientState = false;
let currentState: DeadGridState = DEFAULT_GAME_STATE;

export function subscribeGameState(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getGameSnapshot() {
  if (!hasBootstrappedClientState) {
    currentState = loadGameState() ?? DEFAULT_GAME_STATE;
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
  } else {
    clearGameState();
    currentState = nextState;
  }

  listeners.forEach((listener) => listener());
}
