import {
  GAME_VERSION,
  PROFILE_VERSION,
  hydrateLoadedProfile,
  hydrateLoadedState,
  type DeadGridProfile,
  type DeadGridState,
} from "@/lib/game/state";

const STORAGE_KEY = "dead-grid-outpost/save-v1";
const PROFILE_STORAGE_KEY = "dead-grid-outpost/profile-v1";

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

export function loadGameProfile(): DeadGridProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as DeadGridProfile;

    if (parsed.version !== PROFILE_VERSION) {
      return null;
    }

    return hydrateLoadedProfile(parsed);
  } catch {
    return null;
  }
}

export function saveGameProfile(profile: DeadGridProfile) {
  if (typeof window === "undefined") {
    return profile;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

  return profile;
}

export function clearGameState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
