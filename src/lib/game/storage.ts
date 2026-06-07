import { GAME_VERSION, hydrateLoadedState, type DeadGridState } from "@/lib/game/state";

const STORAGE_KEY = "dead-grid-outpost/save-v1";

export function loadGameState(): DeadGridState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as DeadGridState;

    if (parsed.version !== GAME_VERSION) {
      return null;
    }

    return hydrateLoadedState(parsed);
  } catch {
    return null;
  }
}

export function saveGameState(state: DeadGridState) {
  if (typeof window === "undefined") {
    return state;
  }

  const now = new Date();
  const payload: DeadGridState = {
    ...state,
    lastSavedAt: now.toISOString(),
    lastSavedLabel: `Saved ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  return payload;
}

export function clearGameState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
