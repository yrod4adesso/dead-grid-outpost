export const GAME_VERSION = 12;
import type { ChapterId } from "./chapter";
import { getActiveCommanderEffects, type Commander } from "./commander";
import { canUnlockBuilding, getActiveSynergies, describeActiveSynergies } from "./building-tree";
import { applyUnlockEffectsToState } from "./meta-progression";
import { earnShards, applyRewardShards } from "./profile-currency";
export const PROFILE_VERSION = 3;

export type ResourceId = "food" | "scrap" | "medicine" | "ammo";
export type GamePhase = "outpost" | "combat" | "summary" | "ended";
export type ThreatLevel = "Watching" | "Escalating" | "Critical" | "Breached";
export type DayModifierId =
  | "ration-strain"
  | "ammo-shortage"
  | "heavy-fog"
  | "overcrowded-infirmary"
  | "salvage-window";
export type SpecialNightId = "brute_surge" | "blackout_grid" | "thin_supplies" | "pursuit_spike";
export type BuildingId = "workshop" | "infirmary" | "storage" | "watchtower" | "command_center";
export type SurvivorRole = "fighter" | "scavenger" | "medic" | "builder";
export type SurvivorAssignment = BuildingId | "defense" | null;
export type SurvivorStatus = "ready" | "fatigued" | "injured";
export type ZombieType = "walker" | "runner" | "brute";
export type MissionKind = "scavenge" | "rescue" | "cache" | "breach";
export type RouteRole = "high_yield" | "support" | "threat_control" | "rescue";

export type MissionApproach = {
  id: string;
  label: string;
  detail: string;
  rewardModifier: Partial<Record<ResourceId, number>>;
  cost?: Partial<Record<ResourceId, number>>;
};

export type MissionApproachOutcome = {
  reward: Partial<Record<ResourceId, number>>;
  cost: Partial<Record<ResourceId, number>>;
  bonusLabel: string;
};

export type Mission = {
  id: string;
  title: string;
  zone: string;
  difficulty: "low" | "medium" | "high";
  kind: MissionKind;
  routeRole: RouteRole;
  description: string;
  rewardLabel: string;
  risk: string;
  duration: string;
  enemyHint: string;
  reward: Partial<Record<ResourceId, number>>;
  approaches: [MissionApproach, MissionApproach];
};

export type OutpostTask = {
  id: string;
  title: string;
  description: string;
  owner: string;
  duration: string;
  rewardLabel: string;
  reward: Partial<Record<ResourceId, number>>;
};

export type BuildingState = {
  id: BuildingId;
  name: string;
  category: string;
  level: number;
  summary: string;
  effect: string;
  isFocused: boolean;
};

export type SurvivorState = {
  id: string;
  name: string;
  role: SurvivorRole;
  assignment: SurvivorAssignment;
  status: SurvivorStatus;
  trait: string;
};

export type RecruitmentCandidate = {
  id: string;
  name: string;
  role: SurvivorRole;
  trait: string;
  profileTag: string;
  cost: Partial<Record<ResourceId, number>>;
  bonusLabel: string;
  availability: string;
};

export type DayEventChoice = {
  id: string;
  label: string;
  effectLabel: string;
  reward: Partial<Record<ResourceId, number>>;
  recruitsBonus?: number;
};

export type DayEvent = {
  id: string;
  title: string;
  detail: string;
  risk: string;
  window: string;
  choices: [DayEventChoice, DayEventChoice];
};

export type PendingConsequence = {
  id: string;
  sourceType: "event" | "task" | "mission";
  sourceTitle: string;
  label: string;
  detail: string;
  triggerDay: number;
  timing: "next_day";
  effectType: "threat_shift" | "resource_bundle";
  threatDelta?: number;
  reward?: Partial<Record<ResourceId, number>>;
};

export type DayModifier = {
  id: DayModifierId;
  label: string;
  detail: string;
  effectType: "resource_pressure" | "intel_pressure" | "recovery_pressure" | "salvage_boost";
};

export type SpecialNight = {
  id: SpecialNightId;
  label: string;
  detail: string;
  effectType: "enemy_pressure" | "visibility_pressure" | "supply_pressure" | "pursuit_pressure";
};

export type ActivityLogEntry = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

export type Objective = {
  id: string;
  title: string;
  detail: string;
};

export type ResourceCardState = {
  id: ResourceId;
  label: string;
  amount: number;
  delta: number;
  context: string;
};

export type CombatBlueprint = {
  arenaLabel: string;
  waves: number[];
  baseHp: number;
  playerHp: number;
  damageMultiplier: number;
  healingBonus: number;
  autoFireInterval: number;
  manualCooldown: number;
  focusDuration: number;
  shieldDuration: number;
  flarePrimaryDuration: number;
  flareSecondaryDuration: number;
  reward: Partial<Record<ResourceId, number>>;
  enemyTypes: ZombieType[];
  waveModifier: "surge" | "fortified" | "blackout";
  waveModifierLabel: string;
  lanePressureLabel: string;
  activePerkLabels: string[];
  supportCharges: {
    medkit: number;
    patch: number;
    focus: number;
    shield: number;
    flare: number;
  };
};

export type CombatSummary = {
  status: "victory" | "defeat";
  title: string;
  detail: string;
  rewardLabel: string;
  wavesCleared: number;
  profileReward: number;
  profileRewardLabel: string;
  profileRewardGranted: boolean;
  specialNightLabel?: string;
  specialNightDetail?: string;
};

export type CommanderData = {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  level: number;
  exp: number;
  currentBranch: "combat" | "route" | "recovery";
  unlockedPerks: string[];
};

export type ProfileProgress = {
  firstLossRewardClaimed: boolean;
  chapterProgress: {
    currentChapter: ChapterId;
    milestoneProgress: Record<ChapterId, number>; // index of highest reached milestone (0-based)
    completedChapters: ChapterId[];
  };
  rewardChests: Record<string, boolean>;
};

export type DeadGridProfile = {
  version: number;
  blueprintShards: number;
  lifetimeRuns: number;
  highestDayReached: number;
  unlockedNodes: string[];
  lastEarnedBlueprintShards: number;
  lastRunOutcome: CombatSummary["status"] | null;
  commander: CommanderData | null;
  profileProgress: ProfileProgress;
};

export type BuildingStats = {
  storageLimit: number;
  damageMultiplier: number;
  healingBonus: number;
  scrapYieldMultiplier: number;
  assignedDefense: number;
  autoFireInterval: number;
  manualCooldown: number;
  focusDuration: number;
  shieldDuration: number;
  flarePrimaryDuration: number;
  flareSecondaryDuration: number;
  activePerkLabels: string[];
};

const THREAT_LEVELS: ThreatLevel[] = ["Watching", "Escalating", "Critical", "Breached"];
const DAY_MODIFIER_ROTATION: DayModifier[] = [
  {
    id: "ration-strain",
    label: "Ration strain",
    detail: "Food reserves are tight today. Safer planning and slow pulls will feel more expensive.",
    effectType: "resource_pressure",
  },
  {
    id: "ammo-shortage",
    label: "Ammo shortage",
    detail: "Magazine reserves are thin. High-burn calls need cleaner execution today.",
    effectType: "resource_pressure",
  },
  {
    id: "heavy-fog",
    label: "Heavy fog",
    detail: "Route intel and lane reads are muddy. Visibility calls stay worse through this whole shift.",
    effectType: "intel_pressure",
  },
  {
    id: "overcrowded-infirmary",
    label: "Overcrowded infirmary",
    detail: "Recovery throughput is stressed. Rotation and treatment choices carry extra weight today.",
    effectType: "recovery_pressure",
  },
  {
    id: "salvage-window",
    label: "Salvage window",
    detail: "A narrow recovery window opened. Scrap opportunities are cleaner than usual for one day.",
    effectType: "salvage_boost",
  },
];

const SPECIAL_NIGHT_ROTATION: SpecialNight[] = [
  {
    id: "brute_surge",
    label: "Brute surge",
    detail: "Heavy bodies are converging on the line tonight. Expect harsher impact lanes and a tougher front.",
    effectType: "enemy_pressure",
  },
  {
    id: "blackout_grid",
    label: "Blackout grid",
    detail: "The perimeter is dropping into a deeper blackout. Lane reads and visibility calls will be worse than usual.",
    effectType: "visibility_pressure",
  },
  {
    id: "thin_supplies",
    label: "Thin supplies",
    detail: "Resupply buffers are strained tonight. Support comfort is thinner and the reward floor is less forgiving.",
    effectType: "supply_pressure",
  },
  {
    id: "pursuit_spike",
    label: "Pursuit spike",
    detail: "Recent noise and movement pulled extra attention onto the perimeter. Expect a faster pressure climb.",
    effectType: "pursuit_pressure",
  },
];

const MISSION_DIFFICULTY_MULTIPLIER: Record<Mission["difficulty"], number> = {
  low: 0.95,
  medium: 1.08,
  high: 1.22,
};

export type DeadGridState = {
  version: number;
  hasStarted: boolean;
  phase: GamePhase;
  outpostName: string;
  day: number;
  threatLevel: ThreatLevel;
  selectedMissionId: string;
  selectedMissionTeamIds: string[];
  selectedTreatmentIds: string[];
  selectedTaskId: string;
  selectedRecruitId: string;
  selectedEventId: string;
  lastSavedAt: string | null;
  lastSavedLabel: string;
  resources: ResourceCardState[];
  activeDayModifier: DayModifier | null;
  activeSpecialNight: SpecialNight | null;
  buildings: BuildingState[];
  survivors: SurvivorState[];
  recruitPool: RecruitmentCandidate[];
  dayEvents: DayEvent[];
  missions: Mission[];
  tasks: OutpostTask[];
  pendingConsequences: PendingConsequence[];
  activityLog: ActivityLogEntry[];
  objectives: Objective[];
  combatBlueprint: CombatBlueprint | null;
  lastCombatSummary: CombatSummary | null;
};

export type CombatOutcome = {
  status: "victory" | "defeat";
  wavesCleared: number;
  reward: Partial<Record<ResourceId, number>>;
};

const RESOURCE_LABELS: Record<ResourceId, string> = {
  food: "Food",
  scrap: "Scrap",
  medicine: "Medicine",
  ammo: "Ammo",
};

const RESOURCE_BASE_CONTEXT: Record<ResourceId, string> = {
  food: "4 days at current rationing",
  scrap: "Repairs and upgrades",
  medicine: "Recovery and triage",
  ammo: "Reserved for night defense",
};

const MISSION_BLUEPRINTS: Array<{
  kind: MissionKind;
  routeRole: RouteRole;
  title: string;
  zonePrefix: string;
  description: string;
  reward: Partial<Record<ResourceId, number>>;
  risk: string;
  duration: string;
  enemyHint: string;
}> = [
  {
    kind: "scavenge",
    routeRole: "support",
    title: "Market Sweep",
    zonePrefix: "Grid C",
    description: "Sweep abandoned kiosks and cracked apartment entries for dry goods and loose salvage.",
    reward: { food: 6, scrap: 2 },
    risk: "Stragglers only",
    duration: "45 min",
    enemyHint: "Mostly walkers",
  },
  {
    kind: "scavenge",
    routeRole: "support",
    title: "Shelter Run",
    zonePrefix: "Grid F",
    description: "Pull sealed food tins and blankets from a half-collapsed shelter corridor before looters loop back.",
    reward: { food: 5, medicine: 1, scrap: 1 },
    risk: "Tight interior lanes",
    duration: "50 min",
    enemyHint: "Walkers in clusters",
  },
  {
    kind: "rescue",
    routeRole: "rescue",
    title: "Clinic Cache",
    zonePrefix: "Grid D",
    description: "Move through a damaged emergency clinic and recover sealed trauma kits before dusk.",
    reward: { medicine: 5, ammo: 2 },
    risk: "Fast approach lanes",
    duration: "60 min",
    enemyHint: "Runners reported",
  },
  {
    kind: "rescue",
    routeRole: "rescue",
    title: "Signal Tower Extract",
    zonePrefix: "Grid A",
    description: "Push to a broken relay tower and pull trapped survivors plus med crates before the signal fire dies.",
    reward: { medicine: 4, food: 2, ammo: 1 },
    risk: "Open rooftop exposure",
    duration: "65 min",
    enemyHint: "Runners and walkers below",
  },
  {
    kind: "breach",
    routeRole: "high_yield",
    title: "Depot Breach",
    zonePrefix: "Grid B",
    description: "Break into a maintenance depot, cut the locks and tow salvage back under time pressure.",
    reward: { scrap: 9, ammo: 4 },
    risk: "Dense noise pocket",
    duration: "75 min",
    enemyHint: "Brutes possible",
  },
  {
    kind: "breach",
    routeRole: "high_yield",
    title: "Freight Lockdown",
    zonePrefix: "Grid H",
    description: "Crack open a jammed freight pen and strip machine parts before the noise wakes the whole corridor.",
    reward: { scrap: 8, ammo: 3, food: 1 },
    risk: "Alarm-prone shell",
    duration: "70 min",
    enemyHint: "Brutes and runners near the choke",
  },
  {
    kind: "cache",
    routeRole: "threat_control",
    title: "Supply Cache",
    zonePrefix: "Grid E",
    description: "Reach a hidden drop site beneath an old station overpass and secure ration crates.",
    reward: { food: 4, ammo: 3, scrap: 2 },
    risk: "Broken sightlines",
    duration: "55 min",
    enemyHint: "Mixed walkers and runners",
  },
  {
    kind: "cache",
    routeRole: "threat_control",
    title: "Checkpoint Sweep",
    zonePrefix: "Grid G",
    description: "Clear an old checkpoint lane, secure leftover crates, and cut pursuit lines before dusk stacks pressure.",
    reward: { ammo: 3, food: 3, scrap: 1 },
    risk: "Exposed approach lane",
    duration: "55 min",
    enemyHint: "Walkers screening the lane",
  },
];

const DAY_EVENT_BLUEPRINTS: Array<{
  title: string;
  detail: string;
  risk: string;
  rewardChoice: Omit<DayEventChoice, "id">;
  safeChoice: Omit<DayEventChoice, "id">;
}> = [
  {
    title: "Transit flare",
    detail: "A flare pops near the outer tramline. It could be a trap or a stranded runner trying to signal.",
    risk: "Open exposure",
    rewardChoice: {
      label: "Investigate",
      effectLabel: "+scrap and ammo, one extra recruit option",
      reward: { scrap: 5, ammo: 2 },
      recruitsBonus: 1,
    },
    safeChoice: {
      label: "Hold position",
      effectLabel: "+food, lower exposure",
      reward: { food: 3 },
    },
  },
  {
    title: "Broken ration convoy",
    detail: "A half-burned ration truck sits between sectors. Quick access is possible if the outpost moves fast.",
    risk: "Noise bloom",
    rewardChoice: {
      label: "Strip the convoy",
      effectLabel: "+food and medicine",
      reward: { food: 5, medicine: 2 },
    },
    safeChoice: {
      label: "Take only sealed crates",
      effectLabel: "+food, safer return",
      reward: { food: 3 },
    },
  },
  {
    title: "Collapsed relay post",
    detail: "A relay scaffold fell across a junction. Salvage crews want to strip it before the weather turns.",
    risk: "Structural instability",
    rewardChoice: {
      label: "Send the rig crew",
      effectLabel: "+scrap and medicine recovery",
      reward: { scrap: 6, medicine: 1 },
    },
    safeChoice: {
      label: "Mark and bypass",
      effectLabel: "+ammo cache only",
      reward: { ammo: 3 },
    },
  },
  {
    title: "Flooded underpass",
    detail: "Storm runoff has flooded a low underpass. There may be sealed crates in the waterline if someone moves before dusk.",
    risk: "Cold exposure",
    rewardChoice: {
      label: "Wade in",
      effectLabel: "+scrap and food, but leaves recovery pressure tomorrow",
      reward: { scrap: 4, food: 2 },
    },
    safeChoice: {
      label: "Hook the top crates",
      effectLabel: "+ammo and safer return",
      reward: { ammo: 2, food: 1 },
    },
  },
  {
    title: "Rooftop signal nest",
    detail: "A scavenger beacon is pulsing from a rooftop nest. It could reveal a clean route corridor or draw unwanted eyes.",
    risk: "Line-of-sight exposure",
    rewardChoice: {
      label: "Climb and mark routes",
      effectLabel: "+ammo and medicine, lowers tomorrow pressure",
      reward: { ammo: 2, medicine: 2 },
    },
    safeChoice: {
      label: "Stay below the skyline",
      effectLabel: "+food and steady supplies",
      reward: { food: 2, scrap: 1 },
    },
  },
];

const TASK_BLUEPRINTS: OutpostTask[] = [
  {
    id: "ration-sort",
    title: "Sort ration stock",
    description: "Repack damaged food crates before spoilage spreads through the shelter.",
    owner: "Quartermaster Vale",
    duration: "20 min",
    rewardLabel: "+3 food stability",
    reward: { food: 3 },
  },
  {
    id: "ammo-tally",
    title: "Audit ammo lockers",
    description: "Count magazines and mark bad rounds so the night line does not stall later.",
    owner: "Armorer Sera",
    duration: "15 min",
    rewardLabel: "+4 ammo",
    reward: { ammo: 4 },
  },
  {
    id: "med-triage",
    title: "Prep field triage",
    description: "Stage bandages and antibiotics in the infirmary for quick-return scavenger teams.",
    owner: "Medic Rune",
    duration: "25 min",
    rewardLabel: "+2 medicine, +1 food",
    reward: { medicine: 2, food: 1 },
  },
  {
    id: "barrier-patch",
    title: "Patch barrier seams",
    description: "Bolt fresh plating across stress fractures before tonight's lane pressure finds the weak points.",
    owner: "Builder Oren",
    duration: "30 min",
    rewardLabel: "+2 scrap, +1 ammo",
    reward: { scrap: 2, ammo: 1 },
  },
  {
    id: "signal-relay",
    title: "Tune signal relay",
    description: "Retune the rooftop relay so runner crews can pass cleaner route pings through the static.",
    owner: "Scout Inez",
    duration: "18 min",
    rewardLabel: "+2 scrap, +1 medicine",
    reward: { scrap: 2, medicine: 1 },
  },
];

const INITIAL_BUILDINGS: BuildingState[] = [
  {
    id: "workshop",
    name: "Workshop",
    category: "Fabrication",
    level: 1,
    summary: "Turns field salvage into reliable kit and improves how much scrap every raid brings home.",
    effect: describeBuildingEffect("workshop", 1),
    isFocused: true,
  },
  {
    id: "infirmary",
    name: "Infirmary",
    category: "Recovery",
    level: 1,
    summary: "Stabilizes defenders after nightfall and improves post-combat healing throughput.",
    effect: describeBuildingEffect("infirmary", 1),
    isFocused: false,
  },
  {
    id: "storage",
    name: "Storage",
    category: "Logistics",
    level: 1,
    summary: "Expands reserve capacity so the outpost can actually keep what scavengers recover.",
    effect: describeBuildingEffect("storage", 1),
    isFocused: false,
  },
  {
    id: "watchtower",
    name: "Watchtower",
    category: "Defense",
    level: 1,
    summary: "Improves firing angles over the barricade and boosts lane-defense lethality.",
    effect: describeBuildingEffect("watchtower", 1),
    isFocused: false,
  },
  {
    id: "command_center",
    name: "Command Center",
    category: "Command",
    level: 0, // Locked initially - requires prerequisites
    summary: "Coordinates recruitment and route planning. Unlocks with Workshop Level 3 and Infirmary Level 2.",
    effect: "Locked - Requires Workshop Level 3 + Infirmary Level 2",
    isFocused: false,
  },
];

const INITIAL_SURVIVORS: SurvivorState[] = [
  {
    id: "survivor-vale",
    name: "Vale",
    role: "scavenger",
    assignment: "workshop",
    status: "ready",
    trait: "Salvage nose",
  },
  {
    id: "survivor-rune",
    name: "Rune",
    role: "medic",
    assignment: "infirmary",
    status: "ready",
    trait: "Steady hands",
  },
  {
    id: "survivor-sable",
    name: "Sable",
    role: "fighter",
    assignment: "defense",
    status: "ready",
    trait: "Lane anchor",
  },
  {
    id: "survivor-oren",
    name: "Oren",
    role: "builder",
    assignment: "storage",
    status: "ready",
    trait: "Rig specialist",
  },
];

const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: "obj-1",
    title: "Secure today's scavenging route",
    detail: "Pick one route from the mission board and send a team before the light falls.",
  },
  {
    id: "obj-2",
    title: "Stabilize one outpost system",
    detail: "Upgrade or assign one unit before the night defense begins.",
  },
  {
    id: "obj-3",
    title: "Hold the barricade at night",
    detail: "Start the night defense and keep the outpost standing through the full wave package.",
  },
  {
    id: "obj-4",
    title: "Grow the survivor roster",
    detail: "Bring one new survivor into the outpost to expand assignments and night coverage.",
  },
];

const INITIAL_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: "log-1",
    title: "Shelter ledger initialized",
    detail: "Local save support is active. The outpost can now keep campaign state entirely in browser storage.",
    timestamp: "Boot",
  },
  {
    id: "log-2",
    title: "Perimeter systems synced",
    detail: "Routes, survivor assignments, upgrades and night defense all feed the same local campaign state.",
    timestamp: "Init",
  },
];

export const DEFAULT_GAME_STATE: DeadGridState = {
  version: GAME_VERSION,
  hasStarted: false,
  phase: "outpost",
  outpostName: "Outpost Halcyon",
  day: 1,
  threatLevel: "Watching",
  selectedMissionId: generateMissionSet(1)[0].id,
  selectedMissionTeamIds: INITIAL_SURVIVORS.filter((survivor) => survivor.assignment !== "defense")
    .slice(0, 2)
    .map((survivor) => survivor.id),
  selectedTreatmentIds: [],
  selectedTaskId: generateTaskSet(1)[0].id,
  selectedRecruitId: generateRecruitPool(1, INITIAL_SURVIVORS.length)[0].id,
  selectedEventId: generateDayEvents(1)[0].id,
  lastSavedAt: null,
  lastSavedLabel: "No save yet",
  resources: buildInitialResources(),
  activeDayModifier: generateDayModifier(1),
  activeSpecialNight: null,
  buildings: INITIAL_BUILDINGS,
  survivors: INITIAL_SURVIVORS,
  recruitPool: generateRecruitPool(1, INITIAL_SURVIVORS.length),
  dayEvents: generateDayEvents(1),
  missions: generateMissionSet(1),
  tasks: generateTaskSet(1),
  pendingConsequences: [],
  activityLog: INITIAL_ACTIVITY_LOG,
  objectives: INITIAL_OBJECTIVES,
  combatBlueprint: null,
  lastCombatSummary: null,
};


// Global profile reference for unlock effects
let currentProfile: DeadGridProfile | null = null;

export function setCurrentProfile(profile: DeadGridProfile | null): void {
  currentProfile = profile;
}

export function getCurrentProfile(): DeadGridProfile | null {
  return currentProfile;
}

export const DEFAULT_GAME_PROFILE: DeadGridProfile = {
  version: PROFILE_VERSION,
  blueprintShards: 0,
  lifetimeRuns: 0,
  highestDayReached: 0,
  unlockedNodes: [],
  lastEarnedBlueprintShards: 0,
  lastRunOutcome: null,
  commander: null,
  profileProgress: { firstLossRewardClaimed: false, chapterProgress: { currentChapter: "zone_alpha" as ChapterId, milestoneProgress: { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, completedChapters: [] }, rewardChests: {} },
};

export function createLandingGameState(): DeadGridState {
  return normalizeState(structuredClone(DEFAULT_GAME_STATE));
}

export function createNewGameState(): DeadGridState {
  const baseState = normalizeState({
    ...structuredClone(DEFAULT_GAME_STATE),
    hasStarted: true,
    lastSavedLabel: "Autosaving...",
  });

  // Apply meta-progression unlock effects if profile is available
  if (currentProfile) {
    const derivedStats = getDerivedStats(baseState.buildings, baseState.survivors);
    const unlockedStats = applyUnlockEffectsToState(currentProfile, derivedStats);
    
    // Apply storage cap bonus
    baseState.resources = baseState.resources.map((res) => {
      if (res.id === "scrap") {
        return {
          ...res,
          amount: Math.min(res.amount + unlockedStats.storageCapBonus - 60, res.amount),
        };
      }
      return res;
    });
  }

  return baseState;
}

export function hydrateLoadedState(state: DeadGridState): DeadGridState {
  return normalizeState({
    ...structuredClone(DEFAULT_GAME_STATE),
    ...state,
    resources: state.resources ?? structuredClone(DEFAULT_GAME_STATE.resources),
    activeDayModifier: state.activeDayModifier ?? generateDayModifier(state.day ?? DEFAULT_GAME_STATE.day),
    activeSpecialNight: state.activeSpecialNight ?? null,
    buildings: state.buildings ?? structuredClone(DEFAULT_GAME_STATE.buildings),
    survivors: state.survivors ?? structuredClone(DEFAULT_GAME_STATE.survivors),
    recruitPool: state.recruitPool ?? structuredClone(DEFAULT_GAME_STATE.recruitPool),
    dayEvents: state.dayEvents ?? structuredClone(DEFAULT_GAME_STATE.dayEvents),
    missions:
      state.missions?.map((mission) => ({
        ...mission,
        routeRole: mission.routeRole ?? getRouteRoleForMissionKind(mission.kind),
      })) ?? structuredClone(DEFAULT_GAME_STATE.missions),
    tasks: state.tasks ?? generateTaskSet(state.day ?? DEFAULT_GAME_STATE.day),
    pendingConsequences: state.pendingConsequences ?? [],
    activityLog: state.activityLog ?? structuredClone(DEFAULT_GAME_STATE.activityLog),
    objectives: state.objectives ?? structuredClone(DEFAULT_GAME_STATE.objectives),
    combatBlueprint: state.combatBlueprint ?? null,
    lastCombatSummary: state.lastCombatSummary ?? null,
  });
}


export function hydrateLoadedProfile(profile: DeadGridProfile): DeadGridProfile {
  const base = {
    ...structuredClone(DEFAULT_GAME_PROFILE),
    ...profile,
    unlockedNodes: profile.unlockedNodes ?? [],
  };

  // PROFILE_VERSION migration: add profileProgress for v2
  if (profile.version < 2 && profile.version != null) {
    base.profileProgress = { firstLossRewardClaimed: false, chapterProgress: { currentChapter: "zone_alpha" as ChapterId, milestoneProgress: { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 }, completedChapters: [] }, rewardChests: {} };
    base.version = 2;
  }

  // PROFILE_VERSION migration: add chapterProgress for v3
  if (profile.version < 3 && profile.version != null) {
    if (!base.profileProgress.chapterProgress) {
      base.profileProgress.chapterProgress = {
        currentChapter: "zone_alpha",
        milestoneProgress: { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 },
        completedChapters: [],
      };
    }
    if (!base.profileProgress.rewardChests) {
      base.profileProgress.rewardChests = {};
    }
    base.version = 3;
  }

  if (!base.profileProgress) {
    base.profileProgress = {
      firstLossRewardClaimed: false,
      chapterProgress: {
        currentChapter: "zone_alpha" as ChapterId,
        milestoneProgress: { zone_alpha: 0, zone_beta: 0, zone_gamma: 0 },
        completedChapters: [],
      },
      rewardChests: {},
    };
  }

  return base;
}
export function toggleMissionTeamMember(state: DeadGridState, survivorId: string): DeadGridState {
  const survivor = state.survivors.find((entry) => entry.id === survivorId);

  if (!survivor || survivor.assignment === "defense" || survivor.status === "injured") {
    return state;
  }

  const selected = state.selectedMissionTeamIds.includes(survivorId);
  const nextTeam = selected
    ? state.selectedMissionTeamIds.filter((id) => id !== survivorId)
    : [...state.selectedMissionTeamIds, survivorId].slice(-2);

  return {
    ...state,
    selectedMissionTeamIds: nextTeam,
  };
}

export function toggleTreatmentPriority(state: DeadGridState, survivorId: string): DeadGridState {
  const survivor = state.survivors.find((entry) => entry.id === survivorId);

  if (!survivor || survivor.status === "ready") {
    return state;
  }

  const slots = getTreatmentSlotCount(state);
  const selected = state.selectedTreatmentIds.includes(survivorId);
  const nextTreatmentIds = selected
    ? state.selectedTreatmentIds.filter((id) => id !== survivorId)
    : [...state.selectedTreatmentIds, survivorId].slice(-slots);

  return {
    ...state,
    selectedTreatmentIds: nextTreatmentIds,
  };
}

export function getTreatmentSlotCount(state: Pick<DeadGridState, "buildings">) {
  return getInfirmaryTreatmentSlotCount(
    state.buildings,
    "survivors" in state ? (state as Pick<DeadGridState, "survivors">).survivors : [],
  );
}

export function resolveSelectedMission(state: DeadGridState): DeadGridState {
  const mission = state.missions.find((entry) => entry.id === state.selectedMissionId);

  if (!mission || !hasAnyRewardValue(mission.reward)) {
    return state;
  }

  return withAppliedReward(
    {
      ...state,
      missions: state.missions.map((entry) =>
        entry.id === mission.id
          ? { ...entry, title: `${entry.title} // cleared`, rewardLabel: "Route exhausted", reward: {} }
          : entry,
      ),
      activityLog: [
        createLogEntry(
          `Mission resolved: ${mission.title}`,
          `${mission.zone} returned ${mission.rewardLabel.toLowerCase()}. Dusk pressure is rising.`,
        ),
        ...state.activityLog.slice(0, 5),
      ],
    },
    scaleMissionReward(mission, state.day),
    mission.title,
    { applyWorkshopBonus: true },
  );
}

export function resolveMissionApproach(
  state: DeadGridState,
  missionId: string,
  approachId: string,
): DeadGridState {
  const mission = state.missions.find((entry) => entry.id === missionId);
  const approach = mission?.approaches.find((entry) => entry.id === approachId);

  if (!mission || !approach || !hasAnyRewardValue(mission.reward)) {
    return state;
  }

  const availableMissionTeam = state.survivors.filter(
    (survivor) =>
      state.selectedMissionTeamIds.includes(survivor.id) &&
      survivor.assignment !== "defense" &&
      survivor.status !== "injured",
  );

  if (availableMissionTeam.length === 0) {
    return state;
  }

  const outcome = getMissionApproachOutcome(state, mission, approach);
  const spentCost = invertReward(outcome.cost);
  const nextSurvivors = applyMissionWear(state.survivors, state.selectedMissionTeamIds, mission, approach);
  const pendingConsequence = createPendingMissionConsequence(mission, approach, state.day);
  const recruitBonus = getMissionRecruitBonus(mission, approach);

  const intermediateState = withAppliedReward(
    {
      ...state,
      survivors: nextSurvivors,
      pendingConsequences: pendingConsequence
        ? [pendingConsequence, ...state.pendingConsequences].slice(0, 4)
        : state.pendingConsequences,
      recruitPool:
        recruitBonus > 0
          ? extendRecruitPool(state.recruitPool, state.day, state.survivors.length, recruitBonus)
          : state.recruitPool,
      missions: state.missions.map((entry) =>
        entry.id === mission.id
          ? { ...entry, title: `${entry.title} // cleared`, rewardLabel: "Route exhausted", reward: {} }
          : entry,
      ),
      activityLog: [
        createLogEntry(
          `Mission resolved: ${mission.title}`,
          `${approach.label} secured ${describeReward(outcome.reward).toLowerCase()}. ${outcome.bonusLabel}${
            pendingConsequence ? ` Follow-up queued: ${pendingConsequence.label.toLowerCase()}.` : ""
          }${recruitBonus > 0 ? ` Recruitment board widened by ${recruitBonus} candidate.` : ""}`,
        ),
        ...state.activityLog.slice(0, 5),
      ],
    },
    outcome.reward,
    mission.title,
    { applyWorkshopBonus: true },
  );

  return normalizeState({
    ...intermediateState,
    resources: applyRewardToResources(
      intermediateState.resources,
      spentCost,
      `${mission.title} approach cost`,
      getDerivedStats(intermediateState.buildings, intermediateState.survivors).storageLimit,
    ),
  });
}

export function getMissionApproachOutcome(
  state: DeadGridState,
  mission: Mission,
  approach: MissionApproach,
): MissionApproachOutcome {
  const baseReward = scaleMissionReward(mission, state.day);
  const reward = mergeRewards(baseReward, approach.rewardModifier);
  const cost = { ...(approach.cost ?? {}) };
  const bonuses: string[] = [];
  const dayModifier = state.activeDayModifier;

  const missionTeam = state.survivors.filter((survivor) =>
    state.selectedMissionTeamIds.includes(survivor.id),
  );
  const fatiguedMissionTeam = missionTeam.filter((survivor) => survivor.status === "fatigued");
  const activeMissionTeam = missionTeam.filter(
    (survivor) => survivor.status === "ready" && survivor.assignment !== "defense",
  );
  const hasScavenger = activeMissionTeam.some((survivor) => survivor.role === "scavenger");
  const hasMedic = activeMissionTeam.some((survivor) => survivor.role === "medic");
  const hasFighter = activeMissionTeam.some((survivor) => survivor.role === "fighter");
  const hasBuilder = activeMissionTeam.some((survivor) => survivor.role === "builder");

  if ((mission.kind === "scavenge" || mission.kind === "cache") && hasScavenger) {
    reward.scrap = (reward.scrap ?? 0) + 1;
    bonuses.push("Scavenger added +1 scrap");
  }

  if (
    activeMissionTeam.some(
      (survivor) => survivor.trait === "Salvage nose" || survivor.trait === "Scrap hound",
    )
  ) {
    reward.scrap = (reward.scrap ?? 0) + 1;
    bonuses.push("Trait added +1 scrap");
  }

  if (
    approach.label === "Careful pull" &&
    activeMissionTeam.some((survivor) => survivor.trait === "Route memory")
  ) {
    reward.food = (reward.food ?? 0) + 1;
    bonuses.push("Route memory added +1 food");
  }

  if (
    mission.routeRole === "support" &&
    approach.label === "Careful pull" &&
    activeMissionTeam.some((survivor) => survivor.trait === "Quiet step")
  ) {
    reward.food = (reward.food ?? 0) + 1;
    cost.food = Math.max(0, (cost.food ?? 0) - 1);
    bonuses.push("Quiet step added +1 support food");
    bonuses.push("Quiet step cut support food cost by 1");
  }

  if (mission.kind === "rescue" && hasMedic) {
    reward.medicine = (reward.medicine ?? 0) + 1;
    bonuses.push("Medic added +1 medicine");
  }

  if (mission.kind === "rescue" && activeMissionTeam.some((survivor) => survivor.trait === "Field stitch")) {
    reward.medicine = (reward.medicine ?? 0) + 1;
    bonuses.push("Field stitch added +1 rescue medicine");
  }

  if (approach.label === "Fast entry" && hasFighter) {
    cost.ammo = Math.max(0, (cost.ammo ?? 0) - 1);
    bonuses.push("Fighter cut ammo cost by 1");
  }

  if (
    approach.label === "Fast entry" &&
    activeMissionTeam.some(
      (survivor) => survivor.trait === "Light touch" || survivor.trait === "Breach runner",
    )
  ) {
    cost.ammo = Math.max(0, (cost.ammo ?? 0) - 1);
    bonuses.push("Trait cut ammo cost by 1");
  }

  if (mission.kind === "breach" && hasBuilder) {
    reward.scrap = (reward.scrap ?? 0) + 1;
    bonuses.push("Builder recovered +1 scrap");
  }

  if (
    mission.kind === "breach" &&
    activeMissionTeam.some((survivor) => survivor.trait === "Frame welder")
  ) {
    reward.scrap = (reward.scrap ?? 0) + 1;
    bonuses.push("Frame welder added +1 scrap");
  }

  if (mission.routeRole === "high_yield") {
    reward.scrap = (reward.scrap ?? 0) + 1;
    bonuses.push("High-yield route added +1 scrap");
  }

  if (mission.routeRole === "support" && approach.label === "Careful pull") {
    reward.food = (reward.food ?? 0) + 1;
    bonuses.push("Support route added +1 food");
  }

  if (mission.routeRole === "rescue") {
    reward.medicine = (reward.medicine ?? 0) + 1;
    bonuses.push("Rescue route added +1 medicine");
  }

  if (fatiguedMissionTeam.length > 0) {
    if (approach.label === "Fast entry") {
      cost.ammo = (cost.ammo ?? 0) + 1;
      bonuses.push(`Fatigued route crew added +1 ammo strain`);
    } else {
      cost.food = (cost.food ?? 0) + 1;
      bonuses.push(`Fatigued route crew added +1 food strain`);
    }
  }

  if (dayModifier?.id === "ration-strain" && approach.label === "Careful pull") {
    cost.food = (cost.food ?? 0) + 1;
    bonuses.push("Ration strain added +1 food cost");
  }

  if (dayModifier?.id === "ammo-shortage" && approach.label === "Fast entry") {
    cost.ammo = (cost.ammo ?? 0) + 1;
    bonuses.push("Ammo shortage added +1 ammo cost");
  }

  if (dayModifier?.id === "heavy-fog") {
    bonuses.push("Heavy fog degraded route intel");
  }

  if (
    dayModifier?.id === "salvage-window" &&
    (mission.kind === "scavenge" || mission.kind === "breach")
  ) {
    reward.scrap = (reward.scrap ?? 0) + 2;
    bonuses.push("Salvage window added +2 scrap");
  }

  if (dayModifier?.id === "overcrowded-infirmary" && fatiguedMissionTeam.length > 0) {
    cost.medicine = (cost.medicine ?? 0) + 1;
    bonuses.push("Overcrowded infirmary added +1 medicine strain");
  }

  return {
    reward,
    cost,
    bonusLabel:
      bonuses.length > 0
        ? `${bonuses.join(" // ")} // Team: ${missionTeam.map((survivor) => survivor.name).join(", ")}`
        : approach.detail,
  };
}

export function resolveOutpostTask(state: DeadGridState): DeadGridState {
  const task = state.tasks.find((entry) => entry.id === state.selectedTaskId);

  if (!task || !hasAnyRewardValue(task.reward)) {
    return state;
  }

  const pendingConsequence = createPendingTaskConsequence(task, state.day);

  return withAppliedReward(
    {
      ...state,
      tasks: rotateTask(state.tasks, task.id),
      pendingConsequences: pendingConsequence
        ? [pendingConsequence, ...state.pendingConsequences].slice(0, 4)
        : state.pendingConsequences,
      activityLog: [
        createLogEntry(
          `Task completed: ${task.title}`,
          pendingConsequence
            ? `${task.owner} finished the task and secured ${task.rewardLabel.toLowerCase()}. Follow-up queued: ${pendingConsequence.label.toLowerCase()}.`
            : `${task.owner} finished the task and secured ${task.rewardLabel.toLowerCase()}.`,
        ),
        ...state.activityLog.slice(0, 5),
      ],
    },
    scaleTaskReward(task, state.day),
    task.title,
  );
}

export function resolveDayEvent(
  state: DeadGridState,
  eventId: string,
  choiceId: string,
): DeadGridState {
  const event = state.dayEvents.find((entry) => entry.id === eventId);
  const choice = event?.choices.find((entry) => entry.id === choiceId);

  if (!event || !choice) {
    return state;
  }

  const nextEvents = state.dayEvents.filter((entry) => entry.id !== eventId);
  const pendingConsequence = createPendingEventConsequence(event, choice, state.day);
  let nextState = withAppliedReward(
    {
      ...state,
      dayEvents: nextEvents,
      pendingConsequences: pendingConsequence
        ? [pendingConsequence, ...state.pendingConsequences].slice(0, 4)
        : state.pendingConsequences,
      selectedEventId: nextEvents[0]?.id ?? "",
      activityLog: [
        createLogEntry(
          `Event resolved: ${event.title}`,
          pendingConsequence
            ? `${choice.label} chosen. ${choice.effectLabel} Follow-up queued: ${pendingConsequence.label.toLowerCase()}.`
            : `${choice.label} chosen. ${choice.effectLabel}`,
        ),
        ...state.activityLog.slice(0, 5),
      ],
    },
    choice.reward,
    event.title,
  );

  const recruitsBonus = choice.recruitsBonus ?? 0;

  if (recruitsBonus > 0) {
    nextState = normalizeState({
      ...nextState,
      recruitPool: extendRecruitPool(
        nextState.recruitPool,
        state.day,
        state.survivors.length,
        recruitsBonus,
      ),
    });
  }

  return nextState;
}

export function canRecruitSurvivor(state: DeadGridState) {
  const candidate = state.recruitPool.find((entry) => entry.id === state.selectedRecruitId);

  if (!candidate) {
    return false;
  }

  return Object.entries(candidate.cost).every(([key, value]) => {
    const resource = state.resources.find((entry) => entry.id === key);
    return (resource?.amount ?? 0) >= (value ?? 0);
  });
}

export function getTreatmentCost(
  state: DeadGridState,
  survivorId: string,
): Partial<Record<ResourceId, number>> {
  const survivor = state.survivors.find((entry) => entry.id === survivorId);

  if (!survivor || survivor.status === "ready") {
    return {};
  }

  return { medicine: getTreatmentMedicineCostForSurvivor(state, survivor) };
}

export function canTreatSurvivor(state: DeadGridState, survivorId: string) {
  const survivor = state.survivors.find((entry) => entry.id === survivorId);

  if (!survivor || survivor.status === "ready") {
    return false;
  }

  const cost = getTreatmentCost(state, survivorId);
  return Object.entries(cost).every(([key, value]) => {
    const resource = state.resources.find((entry) => entry.id === key);
    return (resource?.amount ?? 0) >= (value ?? 0);
  });
}

export function treatSurvivor(state: DeadGridState, survivorId: string): DeadGridState {
  const survivor = state.survivors.find((entry) => entry.id === survivorId);

  if (!survivor || !canTreatSurvivor(state, survivorId)) {
    return state;
  }

  const cost = getTreatmentCost(state, survivorId);
  const nextStatus: SurvivorStatus = survivor.status === "injured" ? "fatigued" : "ready";

  return normalizeState({
    ...state,
    survivors: state.survivors.map((entry) =>
      entry.id === survivorId ? { ...entry, status: nextStatus } : entry,
    ),
    resources: applyRewardToResources(
      state.resources,
      invertReward(cost),
      "Field treatment",
      getDerivedStats(state.buildings, state.survivors).storageLimit,
    ),
    activityLog: [
      createLogEntry(
        `Treatment applied: ${survivor.name}`,
        `${survivor.name} moved from ${survivor.status} to ${nextStatus} for ${describeReward(cost).toLowerCase()}.`,
      ),
      ...state.activityLog.slice(0, 5),
    ],
  });
}

export function recruitSurvivor(state: DeadGridState): DeadGridState {
  const candidate = state.recruitPool.find((entry) => entry.id === state.selectedRecruitId);

  if (!candidate || !canRecruitSurvivor(state)) {
    return state;
  }

  const nextSurvivors: SurvivorState[] = [
    ...state.survivors,
    {
      id: `survivor-${candidate.id}`,
      name: candidate.name,
      role: candidate.role,
      assignment: null,
      status: "ready",
      trait: candidate.trait,
    },
  ];
  const nextPool = state.recruitPool.filter((entry) => entry.id !== candidate.id);
  const nextSelectedRecruitId = nextPool[0]?.id ?? "";

  return normalizeState({
    ...state,
    survivors: nextSurvivors,
    recruitPool: nextPool,
    selectedRecruitId: nextSelectedRecruitId,
    resources: applyRewardToResources(
      state.resources,
      invertReward(candidate.cost),
      "Recruitment",
      getDerivedStats(state.buildings, nextSurvivors).storageLimit,
    ),
    activityLog: [
      createLogEntry(
        `Recruit joined: ${candidate.name}`,
        `${candidate.name} entered the outpost as a ${candidate.profileTag.toLowerCase()} (${candidate.role}). ${candidate.bonusLabel}`,
      ),
      ...state.activityLog.slice(0, 5),
    ],
  });
}

export function toggleBuildingFocus(
  state: DeadGridState,
  buildingId: DeadGridState["buildings"][number]["id"],
): DeadGridState {
  return {
    ...state,
    buildings: state.buildings.map((building) => ({
      ...building,
      isFocused: building.id === buildingId,
    })),
  };
}

export function assignSurvivor(
  state: DeadGridState,
  survivorId: string,
  assignment: SurvivorAssignment,
): DeadGridState {
  const survivor = state.survivors.find((entry) => entry.id === survivorId);

  if (!survivor) {
    return state;
  }

  return normalizeState({
    ...state,
    survivors: state.survivors.map((entry) =>
      entry.id === survivorId ? { ...entry, assignment } : entry,
    ),
    activityLog: [
      createLogEntry(
        `Assignment updated: ${survivor.name}`,
        `${survivor.name} is now assigned to ${formatAssignmentLabel(assignment)}.`,
      ),
      ...state.activityLog.slice(0, 5),
    ],
  });
}

export function startNightDefense(state: DeadGridState): DeadGridState {
  const stats = getDerivedStats(state.buildings, state.survivors);
  const threatLevel = getThreatLevelForState(state);
  const waveModifier = getWaveModifierForThreat(threatLevel, state.day);
  const dayModifier = state.activeDayModifier;
  const specialNight =
    state.activeSpecialNight ?? generateSpecialNight(state.day, threatLevel, state.pendingConsequences);
  const effectiveHealingBonus =
    dayModifier?.id === "overcrowded-infirmary" || specialNight?.id === "thin_supplies"
      ? Math.max(0, stats.healingBonus - 1)
      : stats.healingBonus;
  const rewardPreview = applySpecialNightToReward(
    applyDayModifierToNightReward(getNightRewardPreview(state), dayModifier),
    specialNight,
  );
  const specialWaveModifier = getSpecialNightWaveModifier(waveModifier, specialNight);

  return {
    ...state,
    phase: "combat",
    activeSpecialNight: specialNight,
    combatBlueprint: {
      arenaLabel: `Perimeter East // Day ${state.day}`,
      waves: getSpecialNightWaves(state.day, specialNight),
      baseHp: 120 + state.day * 6 + stats.assignedDefense * 6,
      playerHp: 90 + state.day * 4,
      damageMultiplier: stats.damageMultiplier,
      healingBonus: effectiveHealingBonus,
      autoFireInterval: stats.autoFireInterval,
      manualCooldown: stats.manualCooldown,
      focusDuration: stats.focusDuration,
      shieldDuration: stats.shieldDuration,
      flarePrimaryDuration: stats.flarePrimaryDuration,
      flareSecondaryDuration: stats.flareSecondaryDuration,
      reward: rewardPreview,
      enemyTypes: getEnemyTypesForSpecialNight(getEnemyTypesForThreat(threatLevel, state.day), specialNight),
      waveModifier: specialWaveModifier,
      waveModifierLabel: applySpecialNightToWaveLabel(
        applyDayModifierToWaveLabel(getWaveModifierLabel(specialWaveModifier, threatLevel), dayModifier),
        specialNight,
      ),
      lanePressureLabel: applySpecialNightToLanePressure(
        applyDayModifierToLanePressure(getLanePressureLabel(specialWaveModifier, threatLevel), dayModifier),
        specialNight,
      ),
      activePerkLabels: specialNight
        ? [...stats.activePerkLabels, `Special night: ${specialNight.label}`]
        : stats.activePerkLabels,
      supportCharges: getSpecialNightSupportCharges(
        {
          medkit: 1 + Math.min(1, effectiveHealingBonus),
          patch: 1 + Math.min(1, Math.floor(state.day / 4)),
          focus: 1 + Math.min(1, Math.floor(stats.assignedDefense / 2)),
          shield: 1 + Math.min(1, Math.floor(state.day / 3)),
          flare: 1 + Math.min(1, Math.floor(state.day / 3)),
        },
        specialNight,
      ),
    },
    activityLog: [
      createLogEntry(
        "Night defense started",
        specialNight
          ? `Barricade teams are locking into a ${specialNight.label.toLowerCase()} cycle. ${specialNight.detail}`
          : `Barricade teams are locking into ${state.day === 1 ? "the first" : "another"} night cycle.`,
      ),
      ...state.activityLog.slice(0, 5),
    ],
  };
}

export function resolveCombatOutcome(state: DeadGridState, outcome: CombatOutcome): DeadGridState {
  const victory = outcome.status === "victory";
  const stats = getDerivedStats(state.buildings, state.survivors);
  const nextDay = victory ? state.day + 1 : state.day;
  const nextTasks = victory ? generateTaskSet(nextDay) : state.tasks;
  const resolvedSpecialNight = state.activeSpecialNight;
  const pendingResolution = victory
    ? resolvePendingConsequencesForDay(state.pendingConsequences, nextDay)
    : { remaining: state.pendingConsequences, logs: [], reward: {}, threatDelta: 0 };
  const nextThreatLevel = victory
    ? shiftThreatLevel(getThreatLevelForDay(nextDay), pendingResolution.threatDelta)
    : "Breached";

  let nextState: DeadGridState = {
    ...state,
    day: nextDay,
    phase: victory ? "summary" : "ended",
    threatLevel: nextThreatLevel,
    combatBlueprint: null,
    activeDayModifier: victory ? generateDayModifier(nextDay) : state.activeDayModifier,
    activeSpecialNight: victory ? generateSpecialNight(nextDay, nextThreatLevel, pendingResolution.remaining) : state.activeSpecialNight,
    survivors: recoverSurvivorsAfterNight(state.survivors, victory, stats.healingBonus),
    recruitPool: victory ? generateRecruitPool(nextDay, state.survivors.length) : state.recruitPool,
    selectedRecruitId: victory
      ? generateRecruitPool(nextDay, state.survivors.length)[0]?.id ?? state.selectedRecruitId
      : state.selectedRecruitId,
    dayEvents: victory ? generateDayEvents(nextDay) : state.dayEvents,
    selectedEventId: victory ? generateDayEvents(nextDay)[0]?.id ?? state.selectedEventId : state.selectedEventId,
    missions: victory ? generateMissionSet(nextDay) : state.missions,
    selectedMissionId: victory ? generateMissionSet(nextDay)[0].id : state.selectedMissionId,
    tasks: nextTasks,
    selectedTaskId: victory ? nextTasks[0]?.id ?? state.selectedTaskId : state.selectedTaskId,
    pendingConsequences: pendingResolution.remaining,
  };

  if (victory) {
    nextState = withAppliedReward(nextState, outcome.reward, "Night defense", {
      applyWorkshopBonus: true,
      addHealingBonus: true,
    });
    if (hasAnyRewardValue(pendingResolution.reward)) {
      nextState = withAppliedReward(nextState, pendingResolution.reward, "Queued consequence");
    }
  } else {
    nextState = withAppliedReward(nextState, { food: -2, ammo: -3 }, "Night defense loss");

    if (stats.healingBonus > 0) {
      nextState = withAppliedReward(nextState, { medicine: stats.healingBonus }, "Infirmary recovery");
    }
  }

  nextState = applyAutoTreatment(nextState);

  const rewardLabel = victory
    ? describeReward({
        ...applyWorkshopBonusToReward(outcome.reward, stats.scrapYieldMultiplier),
        medicine: stats.healingBonus > 0 ? stats.healingBonus : undefined,
      })
    : stats.healingBonus > 0
      ? `Lost 2 food, 3 ammo, recovered ${stats.healingBonus} medicine`
      : "Lost 2 food, 3 ammo";
  const profileReward = getBlueprintShardReward(victory ? nextState.day : state.day, nextThreatLevel, outcome.status);

  return normalizeState({
    ...nextState,
    lastCombatSummary: {
      status: outcome.status,
      title: victory ? "Perimeter held" : "Barricade failed",
      detail: victory
        ? resolvedSpecialNight
          ? `The ${resolvedSpecialNight.label.toLowerCase()} was held. All ${outcome.wavesCleared} wave groups were cleared before the line broke.`
          : `All ${outcome.wavesCleared} wave groups were cleared before the line broke.`
        : resolvedSpecialNight
          ? `The line collapsed during the ${resolvedSpecialNight.label.toLowerCase()} after ${outcome.wavesCleared} cleared wave groups.`
          : `The line collapsed after ${outcome.wavesCleared} cleared wave groups.`,
      rewardLabel,
      wavesCleared: outcome.wavesCleared,
      profileReward,
      profileRewardLabel: `Earned ${profileReward} blueprint shard${profileReward === 1 ? "" : "s"}`,
      profileRewardGranted: false,
      specialNightLabel: resolvedSpecialNight?.label,
      specialNightDetail: resolvedSpecialNight?.detail,
    },
    activityLog: [
      ...pendingResolution.logs,
      createLogEntry(
        victory ? "Night defense won" : "Night defense lost",
        victory
          ? resolvedSpecialNight
            ? `The outpost survived the ${resolvedSpecialNight.label.toLowerCase()}, secured ${rewardLabel.toLowerCase()}, and rolls into day ${nextState.day} with fresh routes.`
            : `The outpost secured ${rewardLabel.toLowerCase()} and rolls into day ${nextState.day} with fresh routes.`
          : resolvedSpecialNight
            ? `The perimeter broke during the ${resolvedSpecialNight.label.toLowerCase()}. Supply loss has been logged and the infirmary is stabilizing survivors.`
            : "The perimeter broke. Supply loss has been logged and the infirmary is stabilizing survivors.",
      ),
      ...nextState.activityLog.slice(0, 5),
    ],
  });
}

export function continueFromCombatSummary(state: DeadGridState): DeadGridState {
  if (state.phase !== "summary") {
    return state;
  }

  return normalizeState({
    ...state,
    phase: "outpost",
  });
}

export function canUpgradeBuilding(state: DeadGridState, buildingId: BuildingId) {
  const building = state.buildings.find((entry) => entry.id === buildingId);

  if (!building || building.level >= 5) {
    return false;
  }

  const cost = getBuildingUpgradeCost(building);
  return Object.entries(cost).every(([key, value]) => {
    const resource = state.resources.find((entry) => entry.id === key);
    return (resource?.amount ?? 0) >= (value ?? 0);
  });
}

export function upgradeBuilding(state: DeadGridState, buildingId: BuildingId): DeadGridState {
  const building = state.buildings.find((entry) => entry.id === buildingId);

  if (!building || building.level >= 5 || !canUpgradeBuilding(state, buildingId)) {
    return state;
  }

  const cost = getBuildingUpgradeCost(building);
  const nextBuildings = state.buildings.map((entry) => {
    if (entry.id !== buildingId) {
      return entry;
    }

    const nextLevel = entry.level + 1;
    return {
      ...entry,
      level: nextLevel,
      effect: describeBuildingEffect(entry.id, nextLevel),
    };
  });

  const spentResources = applyRewardToResources(
    state.resources,
    invertReward(cost),
    "Building upgrade",
    getDerivedStats(nextBuildings, state.survivors).storageLimit,
  );

  return normalizeState({
    ...state,
    buildings: nextBuildings,
    resources: spentResources,
    activityLog: [
      createLogEntry(
        `Building upgraded: ${building.name}`,
        `${building.name} reached level ${building.level + 1}. ${describeBuildingEffect(
          building.id,
          building.level + 1,
        )}`,
      ),
      ...state.activityLog.slice(0, 5),
    ],
  });
}

export function getSelectedBuilding(state: DeadGridState) {
  return state.buildings.find((building) => building.isFocused) ?? state.buildings[0];
}

export function getSelectedRecruitCandidate(state: DeadGridState) {
  return state.recruitPool.find((candidate) => candidate.id === state.selectedRecruitId) ?? null;
}

export function getSelectedDayEvent(state: DeadGridState) {
  return state.dayEvents.find((event) => event.id === state.selectedEventId) ?? null;
}

export function getSelectedBuildingSurvivors(state: DeadGridState, buildingId: BuildingId) {
  return state.survivors.filter((survivor) => survivor.assignment === buildingId);
}

export function getBuildingUpgradeCost(building: BuildingState): Partial<Record<ResourceId, number>> {
  const nextLevel = Math.min(building.level + 1, 5);

  switch (building.id) {
    case "workshop":
      return {
        scrap: 8 + nextLevel * 4,
        ammo: nextLevel >= 4 ? 3 : 1,
      };
    case "infirmary":
      return {
        scrap: 7 + nextLevel * 3,
        medicine: 2 + nextLevel,
      };
    case "storage":
      return {
        scrap: 9 + nextLevel * 4,
        food: nextLevel >= 4 ? 3 : 2,
      };
    case "watchtower":
      return {
        scrap: 9 + nextLevel * 4,
        ammo: 1 + nextLevel,
      };
    case "command_center":
      return {
        scrap: 15 + nextLevel * 5,
        ammo: 2 + nextLevel * 2,
      };
  }
}

export function getDerivedStats(
  buildings: BuildingState[],
  survivors: SurvivorState[] = [],
  commanderEffects?: {
    damageBonus: number;
    healingBonus: number;
    recruitBonus: number;
    missionBonus: number;
    defenseBonus: number;
  } | null,
): BuildingStats {
  const readySurvivors = survivors.filter((survivor) => survivor.status === "ready");
  const operationalSurvivors = survivors.filter((survivor) => survivor.status !== "injured");
  const storageLevel = getBuildingLevel(buildings, "storage");
  const watchtowerLevel = getBuildingLevel(buildings, "watchtower");
  const infirmaryLevel = getBuildingLevel(buildings, "infirmary");
  const workshopLevel = getBuildingLevel(buildings, "workshop");
  const weightedAssignmentCount = (assignment: SurvivorAssignment) =>
    operationalSurvivors
      .filter((survivor) => survivor.assignment === assignment)
      .reduce((sum, survivor) => sum + getSurvivorOperationalWeight(survivor.status), 0);
  const assignedDefense = weightedAssignmentCount("defense");

  const fighterBonus = readySurvivors.some(
    (survivor) => survivor.role === "fighter" && survivor.assignment === "defense",
  )
    ? 0.1
    : 0;
  const scavengerBonus = readySurvivors.some(
    (survivor) => survivor.role === "scavenger" && survivor.assignment === "workshop",
  )
    ? 0.1
    : 0;
  const medicBonus = readySurvivors.some(
    (survivor) => survivor.role === "medic" && survivor.assignment === "infirmary",
  )
    ? 1
    : 0;
  const builderStorageBonus = readySurvivors.some(
    (survivor) => survivor.role === "builder" && survivor.assignment === "storage",
  )
    ? 10
    : 0;
  const builderTowerBonus = readySurvivors.some(
    (survivor) => survivor.role === "builder" && survivor.assignment === "watchtower",
  )
    ? 0.06
    : 0;
  const traitStorageBonus = readySurvivors
    .filter((survivor) => survivor.assignment === "storage")
    .reduce((sum, survivor) => sum + getTraitStorageBonus(survivor.trait), 0);
  const traitDamageBonus = readySurvivors
    .filter((survivor) => survivor.assignment === "defense" || survivor.assignment === "watchtower")
    .reduce((sum, survivor) => sum + getTraitDamageBonus(survivor.trait), 0);
  const traitHealingBonus = readySurvivors
    .filter((survivor) => survivor.assignment === "infirmary")
    .reduce((sum, survivor) => sum + getTraitHealingBonus(survivor.trait), 0);
  const traitScrapBonus = readySurvivors
    .filter((survivor) => survivor.assignment === "workshop")
    .reduce((sum, survivor) => sum + getTraitScrapYieldBonus(survivor.trait), 0);
  const watchtowerCrew = weightedAssignmentCount("watchtower");
  const defenseCrew = weightedAssignmentCount("defense");
  const autoFireInterval =
    0.42 -
    Math.min(0.08, (watchtowerLevel - 1) * 0.015) -
    Math.min(0.03, watchtowerCrew * 0.01) -
    getTraitAutoFireBonus(readySurvivors.map((survivor) => survivor.trait));
  const manualCooldown =
    0.75 -
    Math.min(0.12, defenseCrew * 0.025) -
    (readySurvivors.some((survivor) => survivor.trait === "Cold aim") ? 0.04 : 0);
  const focusDuration =
    5.5 +
    Math.min(1.2, (watchtowerLevel - 1) * 0.25) +
    getTraitFocusBonus(readySurvivors.map((survivor) => survivor.trait));
  const shieldDuration =
    6 +
    Math.min(1.4, defenseCrew * 0.3) +
    getTraitShieldBonus(readySurvivors.map((survivor) => survivor.trait));
  const flarePrimaryDuration =
    4.8 +
    Math.min(1, infirmaryLevel * 0.15) +
    (readySurvivors.some((survivor) => survivor.trait === "Fast hands") ? 0.4 : 0);
  const flareSecondaryDuration =
    2.2 +
    Math.min(0.8, infirmaryLevel * 0.12) +
    (readySurvivors.some((survivor) => survivor.trait === "Steady hands") ? 0.3 : 0);
  const activePerkLabels = [
    watchtowerLevel > 1 ? `Watchtower fire control: faster auto-fire` : null,
    defenseCrew >= 1 ? `Defense crew: quicker manual burst recovery` : null,
    infirmaryLevel > 1 ? `Infirmary support: longer flare disruption` : null,
    readySurvivors.some((survivor) => survivor.trait === "Lane anchor")
      ? "Lane anchor: extended focus window"
      : null,
    readySurvivors.some((survivor) => survivor.trait === "Wall hold")
      ? "Wall hold: stronger shield duration"
      : null,
    readySurvivors.some((survivor) => survivor.trait === "Shock brace")
      ? "Shock brace: reinforced shield window"
      : null,
    readySurvivors.some((survivor) => survivor.trait === "Cable eye")
      ? "Cable eye: sharper watchtower cadence"
      : null,
    readySurvivors.some((survivor) => survivor.trait === "Turret tuner")
      ? "Turret tuner: steadier watchtower cadence"
      : null,
  ].filter((entry): entry is string => Boolean(entry));

  // Apply Commander effects
  const cmdDamageBonus = commanderEffects?.damageBonus ?? 0;
  const cmdHealingBonus = commanderEffects?.healingBonus ?? 0;
  const cmdDefenseBonus = commanderEffects?.defenseBonus ?? 0;

  return {
    storageLimit: 60 + (storageLevel - 1) * 20 + builderStorageBonus + traitStorageBonus,
    damageMultiplier: 1 + (watchtowerLevel - 1) * 0.12 + fighterBonus + builderTowerBonus + traitDamageBonus + cmdDamageBonus,
    healingBonus: infirmaryLevel - 1 + medicBonus + traitHealingBonus + cmdHealingBonus,
    scrapYieldMultiplier: 1 + (workshopLevel - 1) * 0.14 + scavengerBonus + traitScrapBonus,
    assignedDefense: Number((assignedDefense + cmdDefenseBonus * 10).toFixed(1)),
    autoFireInterval: Math.max(0.28, Number(autoFireInterval.toFixed(2))),
    manualCooldown: Math.max(0.45, Number(manualCooldown.toFixed(2))),
    focusDuration: Number(focusDuration.toFixed(1)),
    shieldDuration: Number(shieldDuration.toFixed(1)),
    flarePrimaryDuration: Number(flarePrimaryDuration.toFixed(1)),
    flareSecondaryDuration: Number(flareSecondaryDuration.toFixed(1)),
    activePerkLabels,
  };
}

export function getNightRewardPreview(state: DeadGridState): Partial<Record<ResourceId, number>> {
  const stats = getDerivedStats(state.buildings, state.survivors);

  return applyWorkshopBonusToReward(
    {
      scrap: 4 + Math.floor(state.day * 0.85),
      food: 2 + Math.floor(state.day / 4),
      ammo: 4 + Math.floor(state.day * 0.65),
    },
    stats.scrapYieldMultiplier,
  );
}

export function getThreatLevelForDay(day: number): ThreatLevel {
  if (day <= 2) {
    return "Watching";
  }

  if (day <= 4) {
    return "Escalating";
  }

  return "Critical";
}

export function getThreatLevelForState(
  state: Pick<DeadGridState, "day" | "phase" | "threatLevel">,
): ThreatLevel {
  if (state.phase === "ended") {
    return "Breached";
  }

  return THREAT_LEVELS.includes(state.threatLevel) ? state.threatLevel : getThreatLevelForDay(state.day);
}

export function getThreatEffectSummary(threatLevel: ThreatLevel): string {
  switch (threatLevel) {
    case "Watching":
      return "Baseline perimeter pressure. Routes stay readable and recovery windows remain manageable.";
    case "Escalating":
      return "Enemy movement thickens. Route pressure climbs and the defense line starts seeing reinforced lanes.";
    case "Critical":
      return "The grid is slipping. Route intel worsens, lane pressure spikes, and worn crews become a real liability.";
    case "Breached":
    default:
      return "The perimeter is broken. This run has already crossed into terminal loss conditions.";
  }
}

export function getThreatMissionPressureLabel(threatLevel: ThreatLevel): string {
  switch (threatLevel) {
    case "Watching":
      return "Route pressure: manageable";
    case "Escalating":
      return "Route pressure: climbing";
    case "Critical":
      return "Route pressure: critical";
    case "Breached":
    default:
      return "Route pressure: collapsed";
  }
}

export function getRouteRoleLabel(routeRole: RouteRole): string {
  switch (routeRole) {
    case "high_yield":
      return "High yield";
    case "support":
      return "Support";
    case "threat_control":
      return "Threat control";
    case "rescue":
      return "Rescue";
  }
}

export function getRouteRoleSummary(routeRole: RouteRole): string {
  switch (routeRole) {
    case "high_yield":
      return "Big near-term payout with harsher wear and louder fallout if the crew is already strained.";
    case "support":
      return "Steadier route with lower burn and cleaner crew posture than pure salvage pushes.";
    case "threat_control":
      return "Pressure-management route built to keep tomorrow's perimeter and threat curve steadier.";
    case "rescue":
      return "Roster-first route that favors people, treatment, and downstream stability over raw scrap.";
  }
}

export function getThreatDefensePressureLabel(threatLevel: ThreatLevel): string {
  switch (threatLevel) {
    case "Watching":
      return "Perimeter strain is stable";
    case "Escalating":
      return "Perimeter strain is rising";
    case "Critical":
      return "Perimeter strain is severe";
    case "Breached":
    default:
      return "Perimeter breach confirmed";
  }
}

export function getDayModifierForState(
  state: Pick<DeadGridState, "day" | "activeDayModifier">,
): DayModifier | null {
  return state.activeDayModifier ?? generateDayModifier(state.day);
}

export function getDayModifierImpactSummary(modifier: DayModifier | null): string {
  if (!modifier) {
    return "No day modifier active.";
  }

  return modifier.detail;
}

export function getDayModifierMissionImpact(modifier: DayModifier | null): string {
  if (!modifier) {
    return "No route modifier active.";
  }

  switch (modifier.id) {
    case "ration-strain":
      return "Careful pulls cost extra food today.";
    case "ammo-shortage":
      return "Fast entry burns extra ammo today.";
    case "heavy-fog":
      return "Route intel is degraded and hostile reads are less reliable.";
    case "overcrowded-infirmary":
      return "Worn teams are harder to stabilize after the run.";
    case "salvage-window":
      return "Scavenge and breach routes can return bonus scrap today.";
  }
}

export function getDayModifierDefenseImpact(modifier: DayModifier | null): string {
  if (!modifier) {
    return "No defense modifier active.";
  }

  switch (modifier.id) {
    case "ration-strain":
      return "Food pressure stays high even if the line holds.";
    case "ammo-shortage":
      return "Ammunition discipline matters more during defense prep.";
    case "heavy-fog":
      return "Visibility is poor. Lane reads and pressure calls stay murkier.";
    case "overcrowded-infirmary":
      return "Post-defense recovery is less efficient today.";
    case "salvage-window":
      return "If the line holds, salvage recovery should pay better than normal.";
  }
}

export function formatAssignmentLabel(assignment: SurvivorAssignment) {
  switch (assignment) {
    case "workshop":
      return "Workshop";
    case "infirmary":
      return "Infirmary";
    case "storage":
      return "Storage";
    case "watchtower":
      return "Watchtower";
    case "defense":
      return "Night Defense";
    default:
      return "Unassigned";
  }
}

export function getTraitEffectLabel(trait: string) {
  switch (trait) {
    case "Salvage nose":
    case "Scrap hound":
      return "+1 mission scrap on scavenging routes";
    case "Route memory":
      return "+1 food on careful mission pulls";
    case "Quiet step":
      return "+1 food on support-route careful pulls";
    case "Light touch":
      return "-1 ammo on fast mission entry";
    case "Steady hands":
    case "Dose keeper":
    case "Calm triage":
      return "-1 treatment medicine when active in infirmary";
    case "Fast hands":
      return "+1 infirmary recovery";
    case "Field stitch":
      return "+1 medicine on rescue missions";
    case "Cold aim":
      return "+0.05 defense damage";
    case "Wall hold":
      return "+0.03 defense damage";
    case "Lane anchor":
      return "+0.5 focus duration";
    case "Shock brace":
      return "+0.5 shield duration";
    case "Breach runner":
      return "-1 ammo on breach-style fast entry";
    case "Frame welder":
      return "+1 breach scrap";
    case "Cable eye":
      return "+0.04 watchtower damage";
    case "Turret tuner":
      return "Faster watchtower auto-fire";
    case "Rig calm":
      return "+5 storage limit";
    case "Rig specialist":
      return "+4 storage limit, +0.02 defense damage";
    default:
      return "Trait active in role-specific situations";
  }
}

function generateMissionSet(day: number): Mission[] {
  const threatLevel = getThreatLevelForDay(day);
  const routeRoleOrder = selectRotatingEntries<RouteRole>(
    ["support", "rescue", "high_yield", "threat_control"],
    4,
    day,
    3,
  );
  const routeRoleBlueprintOffset: Record<RouteRole, number> = {
    support: 0,
    rescue: 1,
    high_yield: 0,
    threat_control: 1,
  };
  const selectedBlueprints = routeRoleOrder.map((routeRole) => {
    const blueprintsForRole = MISSION_BLUEPRINTS.filter((blueprint) => blueprint.routeRole === routeRole);
    return blueprintsForRole[
      (Math.max(day, 1) - 1 + routeRoleBlueprintOffset[routeRole]) % blueprintsForRole.length
    ];
  });

  return selectedBlueprints.map((blueprint, index) => {
    const difficulty = getMissionDifficulty(day, index);
    const zoneNumber = ((day + index) % 6) + 1;
    const missionId = `${blueprint.kind}-${day}-${index}`;
    return {
      id: missionId,
      title: `${blueprint.title} // ${getMissionVariant(day, index)}`,
      zone: `${blueprint.zonePrefix}-${zoneNumber}`,
      difficulty,
      kind: blueprint.kind,
      routeRole: blueprint.routeRole,
      description: blueprint.description,
      rewardLabel: describeReward(scaleMissionReward({ ...blueprint, difficulty }, day)),
      risk: blueprint.risk,
      duration: blueprint.duration,
      enemyHint: getEnemyHintForMission(day, difficulty, blueprint.enemyHint, threatLevel),
      reward: blueprint.reward,
      approaches: createMissionApproaches(missionId, blueprint.kind, difficulty, day),
    };
  });
}

function getRouteRoleForMissionKind(kind: MissionKind): RouteRole {
  switch (kind) {
    case "breach":
      return "high_yield";
    case "cache":
      return "threat_control";
    case "rescue":
      return "rescue";
    case "scavenge":
    default:
      return "support";
  }
}

function getMissionDifficulty(day: number, index: number): Mission["difficulty"] {
  if (day <= 1) {
    return index === 0 ? "low" : "medium";
  }

  if (day <= 3) {
    return index === 2 ? "high" : "medium";
  }

  return index === 0 ? "medium" : "high";
}

function getMissionVariant(day: number, index: number) {
  const variants = ["Short Window", "Dust Route", "Last Light", "Open Channel"];
  return variants[(day + index) % variants.length];
}

function getEnemyTypesForThreat(threatLevel: ThreatLevel, day: number): ZombieType[] {
  if (threatLevel === "Watching" && day <= 1) {
    return ["walker", "runner"];
  }

  if (threatLevel === "Watching" || threatLevel === "Escalating") {
    return ["walker", "runner", "runner"];
  }

  return ["walker", "runner", "brute"];
}

function getWaveModifierForThreat(
  threatLevel: ThreatLevel,
  day: number,
): CombatBlueprint["waveModifier"] {
  if (threatLevel === "Watching") {
    return "surge";
  }

  if (threatLevel === "Escalating" || day <= 4) {
    return "fortified";
  }

  return "blackout";
}

function getWaveModifierLabel(modifier: CombatBlueprint["waveModifier"], threatLevel: ThreatLevel) {
  switch (modifier) {
    case "surge":
      return `Surge lanes: faster spawn rhythm under ${threatLevel.toLowerCase()} pressure`;
    case "fortified":
      return `Fortified dead: heavier brute front under ${threatLevel.toLowerCase()} pressure`;
    case "blackout":
    default:
      return `Blackout: visibility loss and harsher lane swings at ${threatLevel.toLowerCase()} threat`;
  }
}

function getLanePressureLabel(modifier: CombatBlueprint["waveModifier"], threatLevel: ThreatLevel) {
  switch (modifier) {
    case "surge":
      return `Pulse swarms overload one lane at a time while threat stays ${threatLevel.toLowerCase()}`;
    case "fortified":
      return "Crusher packs stack into reinforced breach lanes as threat escalates";
    case "blackout":
    default:
      return "Shadow surges shift across the perimeter with poor visibility and almost no recovery margin";
  }
}

function getEnemyHintForMission(
  day: number,
  difficulty: Mission["difficulty"],
  baseHint: string,
  threatLevel: ThreatLevel,
) {
  if (threatLevel === "Critical") {
    return difficulty === "high"
      ? "Brutes and runners massing // route window collapsing"
      : `${baseHint} // hostile grid saturation`;
  }

  if (day >= 4 && difficulty === "high") {
    return "Brutes and runners reported";
  }

  if (threatLevel === "Escalating" || (day >= 2 && difficulty !== "low")) {
    return `${baseHint} // pressure climbing`;
  }

  return baseHint;
}

function createMissionApproaches(
  missionId: string,
  kind: MissionKind,
  difficulty: Mission["difficulty"],
  day: number,
): [MissionApproach, MissionApproach] {
  const pressure = difficulty === "high" ? 2 : difficulty === "medium" ? 1 : 0;

  return [
    {
      id: `${missionId}-fast`,
      label: "Fast entry",
      detail: "Quick sweep with higher burn rate but better immediate return.",
      rewardModifier: {
        scrap: kind === "breach" ? 1 + pressure : 1 + Math.min(pressure, 1),
        ammo: kind === "cache" ? 1 : 0,
      },
      cost: {
        ammo: 1 + pressure,
      },
    },
    {
      id: `${missionId}-careful`,
      label: "Careful pull",
      detail: "Slower route with lower burn and a steadier recovery package.",
      rewardModifier: {
        food: kind === "scavenge" ? 1 + Math.min(day >= 3 ? 1 : 0, 1) : 1,
        medicine: kind === "rescue" ? 2 : day >= 3 ? 1 : 0,
      },
      cost: {
        food: pressure > 0 ? 1 : 0,
      },
    },
  ];
}

function generateRecruitPool(day: number, survivorCount: number): RecruitmentCandidate[] {
  const names = ["Mira", "Knox", "Ivo", "Tess", "Nadi", "Pike", "Lumen", "Rook"];
  const roleCycle: SurvivorRole[] = ["fighter", "scavenger", "medic", "builder"];

  return Array.from({ length: 3 }, (_, index) => {
    const role = roleCycle[(day + survivorCount + index) % roleCycle.length];
    const name = names[(day * 2 + survivorCount + index) % names.length];
    const profile = getRecruitProfile(role, day, index);

    return {
      id: `recruit-${day}-${survivorCount}-${index}`,
      name,
      role,
      trait: profile.trait,
      profileTag: profile.profileTag,
      cost: profile.cost,
      bonusLabel: profile.bonusLabel,
      availability: profile.availability,
    };
  });
}

function extendRecruitPool(
  currentPool: RecruitmentCandidate[],
  day: number,
  survivorCount: number,
  bonusCount: number,
) {
  const bonusPool = Array.from({ length: bonusCount }, (_, index) =>
    generateRecruitPool(day + index, survivorCount + index + 1)[0],
  ).filter((candidate): candidate is RecruitmentCandidate => Boolean(candidate));

  return [...currentPool, ...bonusPool];
}

function generateDayEvents(day: number): DayEvent[] {
  const selectedBlueprints = selectRotatingEntries(DAY_EVENT_BLUEPRINTS, 2, day, 2);

  return selectedBlueprints.map((blueprint, index) => ({
    id: `event-${day}-${index}`,
    title: blueprint.title,
    detail: blueprint.detail,
    risk: blueprint.risk,
    window: `Day ${day} // ${index === 0 ? "Early shift" : "Late shift"}`,
    choices: [
      {
        ...blueprint.rewardChoice,
        id: `event-${day}-${index}-choice-a`,
      },
      {
        ...blueprint.safeChoice,
        id: `event-${day}-${index}-choice-b`,
      },
    ],
  }));
}

function getRecruitCost(role: SurvivorRole, day: number, index: number): Partial<Record<ResourceId, number>> {
  const pressure = Math.min(day - 1, 3);
  const slotTax = Math.min(index, 1);

  switch (role) {
    case "fighter":
      return { food: 3 + pressure, ammo: 1 + pressure + slotTax };
    case "scavenger":
      return { food: 2 + pressure, scrap: 3 + pressure + slotTax };
    case "medic":
      return { food: 2 + pressure, medicine: 2 + pressure + slotTax };
    case "builder":
      return { food: 2 + pressure, scrap: 3 + pressure, ammo: slotTax };
  }
}

function getRecruitProfile(role: SurvivorRole, day: number, index: number) {
  const trait = getRecruitTrait(role, day, index);
  const specialistBand = day >= 4 && index === 2;
  const cost = getRecruitCost(role, day, index);

  if (specialistBand) {
    return {
      trait,
      profileTag: getRecruitProfileTag(role, trait, true),
      cost: {
        ...cost,
        food: (cost.food ?? 0) + 1,
        [role === "fighter" ? "ammo" : role === "medic" ? "medicine" : "scrap"]:
          ((role === "fighter" ? cost.ammo : role === "medic" ? cost.medicine : cost.scrap) ?? 0) + 1,
      },
      bonusLabel: getRecruitBonusLabel(role, trait, true),
      availability: getRecruitAvailability(day, index, true),
    };
  }

  return {
    trait,
    profileTag: getRecruitProfileTag(role, trait, false),
    cost,
    bonusLabel: getRecruitBonusLabel(role, trait, false),
    availability: getRecruitAvailability(day, index, false),
  };
}

function getRecruitProfileTag(role: SurvivorRole, trait: string, specialist: boolean) {
  if (specialist) {
    switch (role) {
      case "fighter":
        return "Defense specialist";
      case "scavenger":
        return trait === "Quiet step" ? "Support specialist" : "Route specialist";
      case "medic":
        return "Recovery specialist";
      case "builder":
        return "Structure specialist";
    }
  }

  switch (role) {
    case "fighter":
      return "Frontline recruit";
    case "scavenger":
      return "Route recruit";
    case "medic":
      return "Recovery recruit";
    case "builder":
      return "Structure recruit";
  }
}

function getRecruitTrait(role: SurvivorRole, day: number, index: number) {
  const traits: Record<SurvivorRole, string[]> = {
    fighter: ["Breach runner", "Cold aim", "Wall hold", "Lane anchor", "Shock brace"],
    scavenger: ["Salvage nose", "Route memory", "Light touch", "Scrap hound", "Quiet step"],
    medic: ["Steady hands", "Fast hands", "Dose keeper", "Calm triage", "Field stitch"],
    builder: ["Frame welder", "Cable eye", "Rig calm", "Rig specialist", "Turret tuner"],
  };

  return traits[role][(day + index) % traits[role].length];
}

function getRecruitBonusLabel(role: SurvivorRole, trait: string, specialist: boolean) {
  const specialistTag = specialist ? " Specialist pull." : "";

  switch (role) {
    case "fighter":
      if (trait === "Lane anchor" || trait === "Shock brace") {
        return `Best assigned to Night Defense for steadier frontline control.${specialistTag}`;
      }
      return `Best assigned to Night Defense for stronger lane pressure.${specialistTag}`;
    case "scavenger":
      if (trait === "Quiet step" || trait === "Route memory") {
        return `Best routed through support missions and the Workshop economy.${specialistTag}`;
      }
      return `Best assigned to the Workshop for better scrap yield.${specialistTag}`;
    case "medic":
      if (trait === "Field stitch" || trait === "Calm triage") {
        return `Best assigned to rescue support and infirmary recovery.${specialistTag}`;
      }
      return `Best assigned to the Infirmary for stronger recovery.${specialistTag}`;
    case "builder":
      if (trait === "Turret tuner" || trait === "Rig specialist") {
        return `Best assigned to Watchtower or Storage for stronger structural control.${specialistTag}`;
      }
      return `Best assigned to Storage or the Watchtower for structural bonuses.${specialistTag}`;
  }
}

function getRecruitAvailability(day: number, index: number, specialist: boolean) {
  const windows = specialist
    ? ["Relay clinic", "Fortified stairwell", "Watchline annex", "Signal tower camp"]
    : ["Holding gate", "Transit shelter", "Storm drain camp", "Supply checkpoint"];
  const pressureLabel = day >= 4 ? "late pressure" : day >= 2 ? "mid shift" : "early shift";
  return `${windows[(day + index) % windows.length]} // day ${day} // ${pressureLabel}`;
}

function buildInitialResources(): ResourceCardState[] {
  return (Object.keys(RESOURCE_LABELS) as ResourceId[]).map((id) => ({
    id,
    label: RESOURCE_LABELS[id],
    amount: { food: 24, scrap: 31, medicine: 12, ammo: 42 }[id],
    delta: 0,
    context: RESOURCE_BASE_CONTEXT[id],
  }));
}

function generateDayModifier(day: number): DayModifier {
  return DAY_MODIFIER_ROTATION[(Math.max(day, 1) - 1) % DAY_MODIFIER_ROTATION.length];
}

function generateSpecialNight(
  day: number,
  threatLevel: ThreatLevel,
  pendingConsequences: PendingConsequence[],
): SpecialNight | null {
  if (day < 3) {
    return null;
  }

  const hasPursuitPressure = pendingConsequences.some((consequence) => (consequence.threatDelta ?? 0) > 0);

  if (threatLevel === "Critical" && day % 2 === 1) {
    return SPECIAL_NIGHT_ROTATION.find((night) => night.id === "pursuit_spike") ?? null;
  }

  if (day % 6 === 0) {
    return SPECIAL_NIGHT_ROTATION.find((night) => night.id === "thin_supplies") ?? null;
  }

  if (day % 5 === 0) {
    return SPECIAL_NIGHT_ROTATION.find((night) => night.id === "blackout_grid") ?? null;
  }

  if (hasPursuitPressure || day % 4 === 0) {
    return SPECIAL_NIGHT_ROTATION.find((night) => night.id === "brute_surge") ?? null;
  }

  return null;
}

function normalizeState(state: DeadGridState): DeadGridState {
  const stats = getDerivedStats(state.buildings, state.survivors);
  const recruitPool = state.recruitPool ?? [];
  const dayEvents = state.dayEvents ?? [];
  const tasks = state.tasks ?? [];
  const pendingConsequences = state.pendingConsequences ?? [];
  const treatmentSlots = getInfirmaryTreatmentSlotCount(state.buildings, state.survivors);
  const selectedRecruitId =
    recruitPool.some((candidate) => candidate.id === state.selectedRecruitId)
      ? state.selectedRecruitId
      : (recruitPool[0]?.id ?? "");
  const selectedEventId =
    dayEvents.some((event) => event.id === state.selectedEventId)
      ? state.selectedEventId
      : (dayEvents[0]?.id ?? "");
  const selectedTaskId =
    tasks.some((task) => task.id === state.selectedTaskId)
      ? state.selectedTaskId
      : (tasks[0]?.id ?? "");
  const selectedTreatmentIds = (state.selectedTreatmentIds ?? [])
    .filter((id) => state.survivors.some((survivor) => survivor.id === id && survivor.status !== "ready"))
    .slice(0, treatmentSlots);
  const selectedMissionTeamIds = (state.selectedMissionTeamIds ?? [])
    .filter((id) =>
      state.survivors.some(
        (survivor) =>
          survivor.id === id &&
          survivor.assignment !== "defense" &&
          survivor.status !== "injured",
      ),
    )
    .slice(0, 2);

  return {
    ...state,
    threatLevel: getThreatLevelForState(state),
    activeDayModifier: getDayModifierForState(state),
    activeSpecialNight:
      state.activeSpecialNight ?? generateSpecialNight(state.day, getThreatLevelForState(state), pendingConsequences),
    recruitPool,
    dayEvents,
    tasks,
    pendingConsequences,
    selectedTaskId,
    selectedMissionTeamIds,
    selectedTreatmentIds,
    selectedRecruitId,
    selectedEventId,
    resources: state.resources.map((resource) => {
      const amount = Math.min(resource.amount, stats.storageLimit);

      return {
        ...resource,
        amount,
        context: `${RESOURCE_BASE_CONTEXT[resource.id]} // ${amount}/${stats.storageLimit}`,
      };
    }),
    lastCombatSummary: state.lastCombatSummary
      ? {
          ...state.lastCombatSummary,
          profileReward: state.lastCombatSummary.profileReward ?? 0,
          profileRewardLabel:
            state.lastCombatSummary.profileRewardLabel ??
            `Earned ${state.lastCombatSummary.profileReward ?? 0} blueprint shard${
              (state.lastCombatSummary.profileReward ?? 0) === 1 ? "" : "s"
            }`,
          profileRewardGranted: state.lastCombatSummary.profileRewardGranted ?? true,
        }
      : null,
  };
}

function withAppliedReward(
  state: DeadGridState,
  reward: Partial<Record<ResourceId, number>>,
  context: string,
  options?: {
    applyWorkshopBonus?: boolean;
    addHealingBonus?: boolean;
  },
): DeadGridState {
  const stats = getDerivedStats(state.buildings, state.survivors);
  let nextReward = reward;

  if (options?.applyWorkshopBonus) {
    nextReward = applyWorkshopBonusToReward(nextReward, stats.scrapYieldMultiplier);
  }

  if (options?.addHealingBonus && stats.healingBonus > 0) {
    nextReward = {
      ...nextReward,
      medicine: (nextReward.medicine ?? 0) + stats.healingBonus,
    };
  }

  return normalizeState({
    ...state,
    resources: applyRewardToResources(state.resources, nextReward, context, stats.storageLimit),
  });
}

function applyRewardToResources(
  resources: ResourceCardState[],
  reward: Partial<Record<ResourceId, number>>,
  context: string,
  storageLimit: number,
): ResourceCardState[] {
  return resources.map((resource) => {
    const delta = reward[resource.id] ?? 0;

    return {
      ...resource,
      amount: Math.max(0, Math.min(storageLimit, resource.amount + delta)),
      delta,
      context: delta === 0 ? resource.context : `${context} resolved`,
    };
  });
}

function mergeRewards(
  base: Partial<Record<ResourceId, number>>,
  modifier: Partial<Record<ResourceId, number>>,
): Partial<Record<ResourceId, number>> {
  const merged: Partial<Record<ResourceId, number>> = { ...base };

  for (const [key, value] of Object.entries(modifier) as [ResourceId, number][]) {
    merged[key] = (merged[key] ?? 0) + value;
  }

  return merged;
}

function hasAnyRewardValue(reward: Partial<Record<ResourceId, number>>) {
  return Object.values(reward).some((value) => typeof value === "number" && value > 0);
}

function computeTreatmentMedicineCost(status: SurvivorStatus, healingBonus: number) {
  const baseMedicine = status === "injured" ? 2 : 1;
  return Math.max(1, baseMedicine - Math.min(healingBonus, baseMedicine - 1));
}

function getTreatmentMedicineCostForSurvivor(
  state: Pick<DeadGridState, "buildings" | "survivors">,
  survivor: Pick<SurvivorState, "status">,
) {
  const stats = getDerivedStats(state.buildings, state.survivors);
  const activeInfirmaryTraitBonus = state.survivors.some(
    (entry) =>
      entry.status === "ready" &&
      entry.assignment === "infirmary" &&
      (
        entry.trait === "Steady hands" ||
        entry.trait === "Dose keeper" ||
        entry.trait === "Calm triage"
      ),
  )
    ? 1
    : 0;

  return Math.max(
    1,
    computeTreatmentMedicineCost(survivor.status, stats.healingBonus) - activeInfirmaryTraitBonus,
  );
}

function getTraitStorageBonus(trait: string) {
  if (trait === "Rig calm") {
    return 5;
  }

  if (trait === "Rig specialist") {
    return 4;
  }

  return 0;
}

function getSurvivorOperationalWeight(status: SurvivorStatus) {
  switch (status) {
    case "ready":
      return 1;
    case "fatigued":
      return 0.5;
    case "injured":
    default:
      return 0;
  }
}

function getTraitDamageBonus(trait: string) {
  if (trait === "Cold aim") {
    return 0.05;
  }

  if (trait === "Wall hold") {
    return 0.03;
  }

  if (trait === "Cable eye") {
    return 0.04;
  }

  if (trait === "Rig specialist") {
    return 0.02;
  }

  return 0;
}

function getTraitHealingBonus(trait: string) {
  return trait === "Fast hands" ? 1 : 0;
}

function getTraitScrapYieldBonus(trait: string) {
  if (trait === "Scrap hound") {
    return 0.04;
  }

  if (trait === "Salvage nose") {
    return 0.02;
  }

  return 0;
}

function getTraitAutoFireBonus(traits: string[]) {
  return traits.reduce((sum, trait) => {
    if (trait === "Cable eye") {
      return sum + 0.015;
    }

    if (trait === "Turret tuner") {
      return sum + 0.01;
    }

    return sum;
  }, 0);
}

function getTraitFocusBonus(traits: string[]) {
  return traits.reduce((sum, trait) => {
    if (trait === "Lane anchor") {
      return sum + 0.5;
    }

    return sum;
  }, 0);
}

function getTraitShieldBonus(traits: string[]) {
  return traits.reduce((sum, trait) => {
    if (trait === "Wall hold") {
      return sum + 0.7;
    }

    if (trait === "Shock brace") {
      return sum + 0.5;
    }

    return sum;
  }, 0);
}

function getInfirmaryTreatmentSlotCount(
  buildings: BuildingState[],
  survivors: Pick<SurvivorState, "status" | "assignment" | "trait">[] = [],
) {
  const infirmaryLevel = getBuildingLevel(buildings, "infirmary");
  const calmTriageBonus = survivors.some(
    (survivor) =>
      survivor.status === "ready" &&
      survivor.assignment === "infirmary" &&
      survivor.trait === "Calm triage",
  )
    ? 1
    : 0;
  return 1 + Math.floor((infirmaryLevel - 1) / 2) + calmTriageBonus;
}

function applyAutoTreatment(state: DeadGridState): DeadGridState {
  const slots = getInfirmaryTreatmentSlotCount(state.buildings, state.survivors);
  const prioritized = state.selectedTreatmentIds.slice(0, slots);
  let survivors = [...state.survivors];
  let remainingMedicine =
    state.resources.find((resource) => resource.id === "medicine")?.amount ?? 0;
  let treatedCount = 0;

  for (const survivorId of prioritized) {
    const survivor = survivors.find((entry) => entry.id === survivorId);

    if (!survivor || survivor.status === "ready") {
      continue;
    }

    const medicineCost = getTreatmentMedicineCostForSurvivor(
      { buildings: state.buildings, survivors },
      survivor,
    );

    if (remainingMedicine < medicineCost) {
      continue;
    }

    remainingMedicine -= medicineCost;
    treatedCount += 1;
    survivors = survivors.map((entry) =>
      entry.id === survivorId
        ? { ...entry, status: entry.status === "injured" ? "fatigued" : "ready" }
        : entry,
    );
  }

  if (treatedCount === 0) {
    return state;
  }

  return {
    ...state,
    survivors,
    resources: state.resources.map((resource) =>
      resource.id === "medicine"
        ? {
            ...resource,
            amount: remainingMedicine,
            delta: resource.amount - remainingMedicine === 0 ? resource.delta : -(resource.amount - remainingMedicine),
            context: "Infirmary treatment cycle",
          }
        : resource,
    ),
    activityLog: [
      createLogEntry(
        "Infirmary cycle completed",
        `${treatedCount} survivor${treatedCount > 1 ? "s" : ""} received prioritized treatment.`,
      ),
      ...state.activityLog.slice(0, 5),
    ],
  };
}

function applyMissionWear(
  survivors: SurvivorState[],
  teamIds: string[],
  mission: Mission,
  approach: MissionApproach,
): SurvivorState[] {
  const supportStabilized = mission.routeRole === "support" && approach.label === "Careful pull";
  const shouldInjure = !supportStabilized && (mission.routeRole === "high_yield" || mission.difficulty === "high" || approach.label === "Fast entry");
  const team = survivors.filter((survivor) => teamIds.includes(survivor.id));
  const injuryTargetId = shouldInjure
    ? team.find((survivor) => survivor.status === "fatigued")?.id ?? team[0]?.id ?? null
    : null;

  return survivors.map((survivor) => {
    if (!teamIds.includes(survivor.id)) {
      return survivor;
    }

    if (injuryTargetId && survivor.id === injuryTargetId) {
      return {
        ...survivor,
        status: "injured",
      };
    }

    return {
      ...survivor,
      status: survivor.status === "injured" ? "injured" : "fatigued",
    };
  });
}

function createPendingMissionConsequence(
  mission: Mission,
  approach: MissionApproach,
  day: number,
): PendingConsequence | null {
  const triggerDay = day + 1;

  if (mission.routeRole === "high_yield") {
    return {
      id: `pending-mission-${mission.id}`,
      sourceType: "mission",
      sourceTitle: mission.title,
      label: "Hot salvage trail",
      detail: "Tomorrow's route board inherits louder pursuit pressure from the high-yield haul.",
      triggerDay,
      timing: "next_day",
      effectType: "threat_shift",
      threatDelta: 1,
    };
  }

  if (mission.routeRole === "threat_control") {
    return {
      id: `pending-mission-${mission.id}`,
      sourceType: "mission",
      sourceTitle: mission.title,
      label: "Pressure lane stabilized",
      detail: "The route trims tomorrow's threat carry and gives the perimeter a cleaner setup.",
      triggerDay,
      timing: "next_day",
      effectType: "threat_shift",
      threatDelta: -1,
    };
  }

  if (mission.routeRole === "support" && approach.label === "Careful pull") {
    return {
      id: `pending-mission-${mission.id}`,
      sourceType: "mission",
      sourceTitle: mission.title,
      label: "Steady supply buffer",
      detail: "The slower support route leaves a small next-day cushion for food and medicine.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { food: 1, medicine: 1 },
    };
  }

  return null;
}

function getMissionRecruitBonus(mission: Mission, approach: MissionApproach) {
  if (mission.routeRole === "rescue" && approach.label === "Careful pull") {
    return 1;
  }

  return 0;
}

function recoverSurvivorsAfterNight(
  survivors: SurvivorState[],
  victory: boolean,
  healingBonus: number,
): SurvivorState[] {
  const frontlineIds = new Set(
    survivors
      .filter((survivor) => survivor.assignment === "defense" || survivor.assignment === "watchtower")
      .map((survivor) => survivor.id),
  );
  const fatigueRecoveryUnlocked = healingBonus >= 2;

  return survivors.map((survivor) => {
    if (survivor.status === "injured" && healingBonus > 0) {
      return {
        ...survivor,
        status: "fatigued",
      };
    }

    if (frontlineIds.has(survivor.id)) {
      if (survivor.status === "fatigued" && !victory) {
        return {
          ...survivor,
          status: "injured",
        };
      }

      if (survivor.status === "ready") {
        return {
          ...survivor,
          status: "fatigued",
        };
      }
    }

    if (survivor.status === "fatigued" && victory && fatigueRecoveryUnlocked) {
      return {
        ...survivor,
        status: "ready",
      };
    }

    return survivor;
  });
}

function getBlueprintShardReward(
  day: number,
  threatLevel: ThreatLevel,
  outcome: CombatOutcome["status"],
) {
  const threatBonus = Math.min(2, THREAT_LEVELS.indexOf(threatLevel));
  const dayBonus = outcome === "victory" ? Math.floor(Math.max(day - 1, 0) / 3) : Math.floor(Math.max(day - 1, 0) / 2);
  const base = outcome === "victory" ? 1 : 3;

  return base + dayBonus + threatBonus;
}

function applyWorkshopBonusToReward(
  reward: Partial<Record<ResourceId, number>>,
  scrapYieldMultiplier: number,
): Partial<Record<ResourceId, number>> {
  if (!reward.scrap || reward.scrap <= 0) {
    return reward;
  }

  return {
    ...reward,
    scrap: Math.round(reward.scrap * scrapYieldMultiplier),
  };
}

function applyDayModifierToNightReward(
  reward: Partial<Record<ResourceId, number>>,
  dayModifier: DayModifier | null,
): Partial<Record<ResourceId, number>> {
  if (!dayModifier) {
    return reward;
  }

  if (dayModifier.id === "salvage-window") {
    return {
      ...reward,
      scrap: (reward.scrap ?? 0) + 2,
    };
  }

  if (dayModifier.id === "ration-strain") {
    return {
      ...reward,
      food: Math.max(0, (reward.food ?? 0) - 1),
    };
  }

  return reward;
}

function applyDayModifierToWaveLabel(label: string, dayModifier: DayModifier | null) {
  if (dayModifier?.id === "heavy-fog") {
    return `${label} // visibility loss persists`;
  }

  if (dayModifier?.id === "overcrowded-infirmary") {
    return `${label} // triage support reduced`;
  }

  return label;
}

function applyDayModifierToLanePressure(label: string, dayModifier: DayModifier | null) {
  if (dayModifier?.id === "heavy-fog") {
    return `${label} Visibility remains patchy across all lanes.`;
  }

  if (dayModifier?.id === "ammo-shortage") {
    return `${label} Resupply discipline is tighter than usual.`;
  }

  return label;
}

function getSpecialNightWaves(day: number, specialNight: SpecialNight | null): CombatBlueprint["waves"] {
  const baseWaves: CombatBlueprint["waves"] = [
    3 + Math.min(day - 1, 2),
    4 + Math.min(day - 1, 2),
    5 + Math.min(day - 1, 2),
  ];

  if (specialNight?.id === "pursuit_spike") {
    return [baseWaves[0], baseWaves[1], baseWaves[2] + 1];
  }

  if (specialNight?.id === "brute_surge") {
    return [baseWaves[0] + 1, baseWaves[1], baseWaves[2]];
  }

  return baseWaves;
}

function getSpecialNightWaveModifier(
  waveModifier: CombatBlueprint["waveModifier"],
  specialNight: SpecialNight | null,
): CombatBlueprint["waveModifier"] {
  if (specialNight?.id === "blackout_grid") {
    return "blackout";
  }

  if (specialNight?.id === "brute_surge") {
    return "fortified";
  }

  if (specialNight?.id === "pursuit_spike") {
    return "surge";
  }

  return waveModifier;
}

function getEnemyTypesForSpecialNight(
  enemyTypes: ZombieType[],
  specialNight: SpecialNight | null,
): ZombieType[] {
  if (specialNight?.id === "brute_surge") {
    return [...enemyTypes, "brute"];
  }

  if (specialNight?.id === "pursuit_spike") {
    return [...enemyTypes, "runner"];
  }

  return enemyTypes;
}

function getSpecialNightSupportCharges(
  supportCharges: CombatBlueprint["supportCharges"],
  specialNight: SpecialNight | null,
) {
  if (specialNight?.id === "thin_supplies") {
    return {
      ...supportCharges,
      medkit: Math.max(1, supportCharges.medkit - 1),
      patch: Math.max(1, supportCharges.patch - 1),
    };
  }

  return supportCharges;
}

function applySpecialNightToReward(
  reward: Partial<Record<ResourceId, number>>,
  specialNight: SpecialNight | null,
) {
  if (specialNight?.id === "brute_surge") {
    return {
      ...reward,
      scrap: (reward.scrap ?? 0) + 2,
    };
  }

  if (specialNight?.id === "thin_supplies") {
    return {
      ...reward,
      food: Math.max(0, (reward.food ?? 0) - 1),
    };
  }

  return reward;
}

function applySpecialNightToWaveLabel(label: string, specialNight: SpecialNight | null) {
  if (!specialNight) {
    return label;
  }

  return `${label} // ${specialNight.label.toLowerCase()}`;
}

function applySpecialNightToLanePressure(label: string, specialNight: SpecialNight | null) {
  if (specialNight?.id === "brute_surge") {
    return `${label} Heavy impacts are expected on the front lane rotation.`;
  }

  if (specialNight?.id === "blackout_grid") {
    return `${label} Grid visibility is worse than the normal blackout pattern.`;
  }

  if (specialNight?.id === "thin_supplies") {
    return `${label} Support comfort is thinner than usual tonight.`;
  }

  if (specialNight?.id === "pursuit_spike") {
    return `${label} Pursuit pressure is accelerating faster than a standard night.`;
  }

  return label;
}

function invertReward(reward: Partial<Record<ResourceId, number>>) {
  const inverted: Partial<Record<ResourceId, number>> = {};

  for (const [key, value] of Object.entries(reward) as [ResourceId, number][]) {
    inverted[key] = -value;
  }

  return inverted;
}

function getBuildingLevel(buildings: BuildingState[], buildingId: BuildingId) {
  return buildings.find((building) => building.id === buildingId)?.level ?? 1;
}

function rotateTask(tasks: OutpostTask[], resolvedId: string): OutpostTask[] {
  return tasks.map((task) => {
    if (task.id === resolvedId) {
      return {
        ...task,
        title: `${task.title} // done`,
        rewardLabel: "Queue resting",
        description: "This task is already complete for the current day.",
        reward: {},
      };
    }

    return task;
  });
}

function generateTaskSet(day: number): OutpostTask[] {
  return selectRotatingEntries(TASK_BLUEPRINTS, 3, day, 2).map((task) => structuredClone(task));
}

function selectRotatingEntries<T>(pool: T[], count: number, seedDay: number, step = 1): T[] {
  if (pool.length === 0 || count <= 0) {
    return [];
  }

  const safeCount = Math.min(count, pool.length);
  const normalizedSeed = Math.max(seedDay, 1) - 1;
  const safeStep = Math.max(step, 1);
  const selected: T[] = [];
  const usedIndices = new Set<number>();
  let cursor = normalizedSeed % pool.length;

  while (selected.length < safeCount) {
    if (!usedIndices.has(cursor)) {
      selected.push(pool[cursor]);
      usedIndices.add(cursor);
    }

    cursor = (cursor + safeStep) % pool.length;

    while (usedIndices.has(cursor) && usedIndices.size < pool.length) {
      cursor = (cursor + 1) % pool.length;
    }
  }

  return selected;
}

function createPendingEventConsequence(
  event: DayEvent,
  choice: DayEventChoice,
  day: number,
): PendingConsequence | null {
  const isRiskyChoice = choice.id.endsWith("choice-a");
  const triggerDay = day + 1;

  if (event.title === "Transit flare" && isRiskyChoice) {
    return {
      id: `pending-event-${event.id}`,
      sourceType: "event",
      sourceTitle: event.title,
      label: "Noise trail coming in",
      detail: "Tomorrow's route board will inherit extra pursuit pressure from the flare response.",
      triggerDay,
      timing: "next_day",
      effectType: "threat_shift",
      threatDelta: 1,
    };
  }

  if (event.title === "Transit flare" && !isRiskyChoice) {
    return {
      id: `pending-event-${event.id}`,
      sourceType: "event",
      sourceTitle: event.title,
      label: "Quiet ration window",
      detail: "Holding position leaves a small support window that can pay out supplies tomorrow.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { food: 2, ammo: 1 },
    };
  }

  if (event.title === "Flooded underpass" && isRiskyChoice) {
    return {
      id: `pending-event-${event.id}`,
      sourceType: "event",
      sourceTitle: event.title,
      label: "Cold recovery backlog",
      detail: "The soaked pull strains tomorrow's infirmary and adds a small medicine burden to recovery.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { medicine: 1 },
    };
  }

  if (event.title === "Flooded underpass" && !isRiskyChoice) {
    return {
      id: `pending-event-${event.id}`,
      sourceType: "event",
      sourceTitle: event.title,
      label: "Dry crate reserve",
      detail: "The safer pull leaves a tidy reserve package for the next day.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { food: 1, ammo: 1 },
    };
  }

  if (event.title === "Rooftop signal nest" && isRiskyChoice) {
    return {
      id: `pending-event-${event.id}`,
      sourceType: "event",
      sourceTitle: event.title,
      label: "Marked quiet corridor",
      detail: "The rooftop mark trims tomorrow's pursuit pressure and gives the board a cleaner next-day read.",
      triggerDay,
      timing: "next_day",
      effectType: "threat_shift",
      threatDelta: -1,
    };
  }

  if (event.title === "Rooftop signal nest" && !isRiskyChoice) {
    return {
      id: `pending-event-${event.id}`,
      sourceType: "event",
      sourceTitle: event.title,
      label: "Low skyline stockpile",
      detail: "The lower-risk pull leaves a modest support package for tomorrow's planners.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { food: 2, scrap: 1 },
    };
  }

  if (isRiskyChoice) {
    return {
      id: `pending-event-${event.id}`,
      sourceType: "event",
      sourceTitle: event.title,
      label: "Tomorrow pressure spike",
      detail: "The aggressive field call leaves a delayed pressure ripple for the next day.",
      triggerDay,
      timing: "next_day",
      effectType: "threat_shift",
      threatDelta: 1,
    };
  }

  return {
    id: `pending-event-${event.id}`,
    sourceType: "event",
    sourceTitle: event.title,
    label: "Tomorrow support package",
    detail: "The safer call creates a modest follow-up supply window on the next day.",
    triggerDay,
    timing: "next_day",
    effectType: "resource_bundle",
    reward: { food: 2 },
  };
}

function createPendingTaskConsequence(task: OutpostTask, day: number): PendingConsequence | null {
  const triggerDay = day + 1;

  if (task.id === "barrier-patch") {
    return {
      id: `pending-task-${task.id}-${day}`,
      sourceType: "task",
      sourceTitle: task.title,
      label: "Shored lane plating",
      detail: "Fresh plating buys the next barricade cycle a little breathing room and trims tomorrow's threat pressure.",
      triggerDay,
      timing: "next_day",
      effectType: "threat_shift",
      threatDelta: -1,
    };
  }

  if (task.id === "signal-relay") {
    return {
      id: `pending-task-${task.id}-${day}`,
      sourceType: "task",
      sourceTitle: task.title,
      label: "Courier route ping",
      detail: "The tuned relay leaves a small route-support package waiting for tomorrow's planners.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { ammo: 1, food: 1 },
    };
  }

  if (task.id === "ammo-tally") {
    return {
      id: `pending-task-${task.id}-${day}`,
      sourceType: "task",
      sourceTitle: task.title,
      label: "Locked ammo reserve",
      detail: "The locker audit prepares extra magazines for tomorrow's line.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { ammo: 2 },
    };
  }

  if (task.id === "med-triage") {
    return {
      id: `pending-task-${task.id}-${day}`,
      sourceType: "task",
      sourceTitle: task.title,
      label: "Prepared triage buffer",
      detail: "Field triage prep reduces tomorrow's threat carry by one step if the line holds.",
      triggerDay,
      timing: "next_day",
      effectType: "threat_shift",
      threatDelta: -1,
    };
  }

  if (task.id === "ration-sort") {
    return {
      id: `pending-task-${task.id}-${day}`,
      sourceType: "task",
      sourceTitle: task.title,
      label: "Stabilized ration crates",
      detail: "Sorted rations create a small next-day food cushion.",
      triggerDay,
      timing: "next_day",
      effectType: "resource_bundle",
      reward: { food: 2 },
    };
  }

  return null;
}

function resolvePendingConsequencesForDay(
  consequences: PendingConsequence[],
  nextDay: number,
) {
  const due = consequences.filter((consequence) => consequence.triggerDay <= nextDay);
  const remaining = consequences.filter((consequence) => consequence.triggerDay > nextDay);
  const reward = due.reduce<Partial<Record<ResourceId, number>>>((sum, consequence) => {
    if (consequence.effectType !== "resource_bundle" || !consequence.reward) {
      return sum;
    }

    for (const [key, value] of Object.entries(consequence.reward) as [ResourceId, number][]) {
      sum[key] = (sum[key] ?? 0) + value;
    }

    return sum;
  }, {});
  const threatDelta = due.reduce((sum, consequence) => sum + (consequence.threatDelta ?? 0), 0);
  const logs = due.map((consequence) =>
    createLogEntry(
      `Consequence resolved: ${consequence.label}`,
      `${consequence.sourceTitle} landed on day ${nextDay}. ${consequence.detail}`,
    ),
  );

  return {
    remaining,
    logs,
    reward,
    threatDelta,
  };
}

function shiftThreatLevel(base: ThreatLevel, delta: number): ThreatLevel {
  if (base === "Breached" || delta === 0) {
    return base;
  }

  const safeLevels: ThreatLevel[] = ["Watching", "Escalating", "Critical"];
  const currentIndex = safeLevels.indexOf(base);
  const nextIndex = Math.max(0, Math.min(safeLevels.length - 1, currentIndex + delta));
  return safeLevels[nextIndex];
}

function createLogEntry(title: string, detail: string): ActivityLogEntry {
  return {
    id: `${title}-${Date.now()}`,
    title,
    detail,
    timestamp: new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  };
}

export function applyCombatSummaryProfileReward(
  profile: DeadGridProfile,
  summary: CombatSummary,
  day: number,
): DeadGridProfile {
  const hasOutcome = summary.status !== null && summary.status !== undefined;
  
  let updatedProfile: DeadGridProfile;
  
  if (hasOutcome) {
    // Use applyRewardShards to honor first-loss bonus (double shards on first defeat)
    updatedProfile = applyRewardShards(
      profile,
      summary.profileReward,
      summary.status as NonNullable<DeadGridProfile["lastRunOutcome"]>,
    );
  } else {
    // Fallback to simple earn (edge case: no outcome)
    updatedProfile = earnShards(profile, summary.profileReward);
  }
  
  return hydrateLoadedProfile({
    ...updatedProfile,
    lifetimeRuns: updatedProfile.lifetimeRuns + (summary.status === "defeat" ? 1 : 0),
    highestDayReached: Math.max(updatedProfile.highestDayReached, day),
    lastRunOutcome: summary.status,
  });
}

function describeReward(reward: Partial<Record<ResourceId, number>>) {
  const parts = Object.entries(reward)
    .filter((entry): entry is [ResourceId, number] => typeof entry[1] === "number" && entry[1] > 0)
    .map(([key, value]) => `+${value} ${key}`);

  return parts.join(", ");
}

function describeBuildingEffect(buildingId: BuildingId, level: number) {
  switch (buildingId) {
    case "storage":
      return `Storage cap ${60 + (level - 1) * 20}.`;
    case "watchtower":
      return `Combat damage +${Math.round((1 + (level - 1) * 0.12 - 1) * 100)}%.`;
    case "infirmary":
      return `Post-combat healing +${level - 1} medicine.`;
    case "workshop":
      return `Scrap yield +${Math.round((1 + (level - 1) * 0.14 - 1) * 100)}%.`;
    case "command_center":
      if (level === 1) return "Recruit quality improved (+1 candidate).";
      if (level === 2) return "Route visibility enhanced (better mission preview).";
      return "Commander assignment unlocked (commander slot available).";
  }
}

function scaleMissionReward(
  mission: Pick<Mission, "reward" | "difficulty">,
  day: number,
): Partial<Record<ResourceId, number>> {
  const dayMultiplier = 1 + Math.min((day - 1) * 0.06, 0.36);
  const difficultyMultiplier = MISSION_DIFFICULTY_MULTIPLIER[mission.difficulty];

  return scaleReward(mission.reward, dayMultiplier * difficultyMultiplier);
}

function scaleTaskReward(
  task: OutpostTask,
  day: number,
): Partial<Record<ResourceId, number>> {
  const dayBonus = 1 + Math.min((day - 1) * 0.03, 0.15);
  return scaleReward(task.reward, dayBonus);
}

function scaleReward(
  reward: Partial<Record<ResourceId, number>>,
  multiplier: number,
): Partial<Record<ResourceId, number>> {
  const scaled: Partial<Record<ResourceId, number>> = {};

  for (const [key, value] of Object.entries(reward) as [ResourceId, number][]) {
    scaled[key] = Math.max(1, Math.round(value * multiplier));
  }

  return scaled;
}
