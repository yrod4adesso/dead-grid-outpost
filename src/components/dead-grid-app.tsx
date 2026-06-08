"use client";

import { startTransition, useMemo, useSyncExternalStore } from "react";
import { CombatPrototype } from "@/components/combat-prototype";
import {
  assignSurvivor,
  canUpgradeBuilding,
  canRecruitSurvivor,
  createLandingGameState,
  canTreatSurvivor,
  continueFromCombatSummary,
  DEFAULT_GAME_STATE,
  createNewGameState,
  type BuildingId,
  formatAssignmentLabel,
  getBuildingUpgradeCost,
  getDerivedStats,
  getMissionApproachOutcome,
  getNightRewardPreview,
  getRouteRoleLabel,
  getRouteRoleSummary,
  getSelectedDayEvent,
  getSelectedRecruitCandidate,
  getSelectedBuilding,
  getSelectedBuildingSurvivors,
  getDayModifierImpactSummary,
  getDayModifierMissionImpact,
  getDayModifierDefenseImpact,
  getThreatDefensePressureLabel,
  getThreatEffectSummary,
  getThreatMissionPressureLabel,
  getTraitEffectLabel,
  getTreatmentSlotCount,
  getTreatmentCost,
  recruitSurvivor,
  resolveDayEvent,
  resolveMissionApproach,
  resolveOutpostTask,
  resolveCombatOutcome,
  startNightDefense,
  treatSurvivor,
  toggleTreatmentPriority,
  toggleMissionTeamMember,
  toggleBuildingFocus,
  upgradeBuilding,
  type CombatOutcome,
  type DeadGridState,
  type Mission,
  type OutpostTask,
  type SurvivorAssignment,
} from "@/lib/game/state";
import {
  getGameSnapshot,
  getResumableGameSnapshot,
  getServerGameSnapshot,
  resumeSavedGame,
  updateGameState,
  subscribeGameState,
} from "@/lib/game/store";

export function DeadGridApp() {
  const state = useSyncExternalStore(subscribeGameState, getGameSnapshot, getServerGameSnapshot);
  const resumableState = getResumableGameSnapshot();
  const hasResumeSave = Boolean(resumableState?.hasStarted);

  const selectedMission = useMemo(
    () => state.missions.find((mission) => mission.id === state.selectedMissionId) ?? null,
    [state.missions, state.selectedMissionId],
  );

  const selectedTask = useMemo(
    () => state.tasks.find((task) => task.id === state.selectedTaskId) ?? null,
    [state.selectedTaskId, state.tasks],
  );
  const canCompleteSelectedTask = useMemo(
    () => Boolean(selectedTask && taskHasReward(selectedTask)),
    [selectedTask],
  );
  const selectedBuilding = useMemo(() => getSelectedBuilding(state), [state]);
  const buildingStats = useMemo(
    () => getDerivedStats(state.buildings, state.survivors),
    [state.buildings, state.survivors],
  );
  const selectedUpgradeCost = useMemo(
    () => getBuildingUpgradeCost(selectedBuilding),
    [selectedBuilding],
  );
  const canUpgradeSelectedBuilding = useMemo(
    () => canUpgradeBuilding(state, selectedBuilding.id),
    [selectedBuilding.id, state],
  );
  const nextNightReward = useMemo(() => getNightRewardPreview(state), [state]);
  const assignedToSelectedBuilding = useMemo(
    () => getSelectedBuildingSurvivors(state, selectedBuilding.id),
    [selectedBuilding.id, state],
  );
  const selectedRecruit = useMemo(() => getSelectedRecruitCandidate(state), [state]);
  const canRecruitSelectedSurvivor = useMemo(() => canRecruitSurvivor(state), [state]);
  const selectedEvent = useMemo(() => getSelectedDayEvent(state), [state]);
  const treatmentSlots = useMemo(() => getTreatmentSlotCount(state), [state]);
  const threatSummary = useMemo(() => getThreatEffectSummary(state.threatLevel), [state.threatLevel]);
  const dayModifierSummary = useMemo(
    () => getDayModifierImpactSummary(state.activeDayModifier),
    [state.activeDayModifier],
  );
  const dayModifierDefenseImpact = useMemo(
    () => getDayModifierDefenseImpact(state.activeDayModifier),
    [state.activeDayModifier],
  );
  const threatDefensePressure = useMemo(
    () => getThreatDefensePressureLabel(state.threatLevel),
    [state.threatLevel],
  );
  const defenseRosterPressure = useMemo(() => describeDefenseRosterPressure(state), [state]);

  const beginNewGame = () => {
    startTransition(() => {
      updateGameState(() => createNewGameState());
    });
  };

  const continueSavedGame = () => {
    startTransition(() => {
      resumeSavedGame();
    });
  };

  const resetSave = () => {
    startTransition(() => {
      updateGameState(() => createLandingGameState());
    });
  };

  const selectMission = (missionId: string) => {
    startTransition(() => {
      updateGameState((current) => ({ ...current, selectedMissionId: missionId }));
    });
  };

  const selectTask = (taskId: string) => {
    startTransition(() => {
      updateGameState((current) => ({ ...current, selectedTaskId: taskId }));
    });
  };

  const completeTask = () => {
    startTransition(() => {
      updateGameState((current) => resolveOutpostTask(current));
    });
  };

  const beginNightDefense = () => {
    startTransition(() => {
      updateGameState((current) => startNightDefense(current));
    });
  };

  const finishNightDefense = (outcome: CombatOutcome) => {
    startTransition(() => {
      updateGameState((current) => resolveCombatOutcome(current, outcome));
    });
  };

  const continueAfterSummary = () => {
    startTransition(() => {
      updateGameState((current) => continueFromCombatSummary(current));
    });
  };

  const setBuildingFocus = (buildingId: (typeof DEFAULT_GAME_STATE.buildings)[number]["id"]) => {
    startTransition(() => {
      updateGameState((current) => toggleBuildingFocus(current, buildingId));
    });
  };

  const applyBuildingUpgrade = () => {
    startTransition(() => {
      updateGameState((current) => upgradeBuilding(current, selectedBuilding.id));
    });
  };

  const updateSurvivorAssignment = (survivorId: string, assignment: SurvivorAssignment) => {
    startTransition(() => {
      updateGameState((current) => assignSurvivor(current, survivorId, assignment));
    });
  };

  const selectRecruit = (recruitId: string) => {
    startTransition(() => {
      updateGameState((current) => ({ ...current, selectedRecruitId: recruitId }));
    });
  };

  const addRecruit = () => {
    startTransition(() => {
      updateGameState((current) => recruitSurvivor(current));
    });
  };

  const selectEvent = (eventId: string) => {
    startTransition(() => {
      updateGameState((current) => ({ ...current, selectedEventId: eventId }));
    });
  };

  const resolveEventChoice = (eventId: string, choiceId: string) => {
    startTransition(() => {
      updateGameState((current) => resolveDayEvent(current, eventId, choiceId));
    });
  };

  const resolveSelectedMissionApproach = (approachId: string) => {
    if (!selectedMission) {
      return;
    }

    startTransition(() => {
      updateGameState((current) => resolveMissionApproach(current, selectedMission.id, approachId));
    });
  };

  const updateMissionTeam = (survivorId: string) => {
    startTransition(() => {
      updateGameState((current) => toggleMissionTeamMember(current, survivorId));
    });
  };

  const applyTreatment = (survivorId: string) => {
    startTransition(() => {
      updateGameState((current) => treatSurvivor(current, survivorId));
    });
  };

  const updateTreatmentPriority = (survivorId: string) => {
    startTransition(() => {
      updateGameState((current) => toggleTreatmentPriority(current, survivorId));
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,157,74,0.12),_transparent_36%),linear-gradient(180deg,_#09141d_0%,_#071017_54%,_#05090d_100%)] px-4 py-6 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {!state.hasStarted ? (
          <StartScreen onContinue={continueSavedGame} onNewGame={beginNewGame} resumableState={resumableState} />
        ) : state.phase === "combat" && state.combatBlueprint ? (
          <CombatPrototype blueprint={state.combatBlueprint} onResolve={finishNightDefense} />
        ) : state.phase === "summary" && state.lastCombatSummary ? (
          <RunSummaryScreen onContinue={continueAfterSummary} state={state} />
        ) : state.phase === "ended" && state.lastCombatSummary ? (
          <RunEndedScreen onNewGame={beginNewGame} onReturnToLanding={resetSave} state={state} />
        ) : (
          <>
            <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/25 backdrop-blur">
              <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.4fr_0.9fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)]">
                    Sector grid // day {state.day}
                  </p>
                  <h1 className="mt-3 font-display text-4xl uppercase tracking-[0.14em] text-white md:text-5xl">
                    {state.outpostName}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                    Hold the shelter through a clean command loop: choose a route, assign the crew, harden the
                    outpost, then survive the night push. Every assignment, upgrade, treatment call, and mission
                    team carries forward into the next defense cycle.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Badge label="Status" value="Day Shift" />
                    <Badge label="Threat" value={state.threatLevel} />
                    <Badge label="Modifier" value={state.activeDayModifier?.label ?? "None"} />
                    <Badge label="Save" value={state.lastSavedLabel} />
                  </div>
                  <div className="mt-4 max-w-3xl rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/68">
                    <span className="font-medium text-white">{threatDefensePressure}.</span> {threatSummary}
                  </div>
                  <div className="mt-3 max-w-3xl rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/68">
                    <span className="font-medium text-white">{state.activeDayModifier?.label ?? "No modifier"}.</span>{" "}
                    {dayModifierSummary}
                  </div>
                </div>

                <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">Commander log</p>
                      <p className="mt-2 text-lg font-semibold text-white">Immediate objectives</p>
                    </div>
                    <button
                      className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-[var(--accent)] hover:text-white"
                      onClick={resetSave}
                      type="button"
                    >
                      Reset run
                    </button>
                  </div>
                  {hasResumeSave ? (
                    <div className="rounded-2xl border border-[var(--signal)]/30 bg-[rgba(73,183,172,0.08)] px-4 py-3 text-sm text-white/72">
                      Resumed from local save. Progress continues to autosave after each decision and defense result.
                    </div>
                  ) : null}
                  <ul className="grid gap-3 text-sm text-white/75">
                    {state.objectives.map((objective, index) => (
                      <li
                        className={`rounded-2xl border px-4 py-3 ${
                          index === 0
                            ? "border-[var(--accent)]/35 bg-[rgba(243,157,74,0.08)] shadow-lg shadow-[rgba(243,157,74,0.08)]"
                            : "border-white/8 bg-black/20"
                        }`}
                        key={objective.id}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium text-white">{objective.title}</p>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em] ${
                              index === 0
                                ? "bg-[var(--accent)]/18 text-[var(--accent-soft)]"
                                : "bg-white/6 text-white/45"
                            }`}
                          >
                            {index === 0 ? "Now" : "Queue"}
                          </span>
                        </div>
                        <p className="mt-1 text-white/55">{objective.detail}</p>
                      </li>
                    ))}
                  </ul>
                  {state.lastCombatSummary ? (
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Last defense</p>
                      <p className="mt-2 font-medium text-white">{state.lastCombatSummary.title}</p>
                      <p className="mt-1 text-sm text-white/60">{state.lastCombatSummary.detail}</p>
                      <p className="mt-3 text-sm font-medium text-[var(--accent-soft)]">
                        {state.lastCombatSummary.rewardLabel}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {state.resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
              <div className="grid gap-6">
                <Panel
                  eyebrow="Outpost"
                  title="Dashboard"
                  description="Upgrade one building at a time and watch the outpost profile change immediately. Storage, recovery, defense output, and scrap flow all start here."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {state.buildings.map((building) => (
                      <BuildingStatusCard
                        assignedCount={state.survivors.filter((survivor) => survivor.assignment === building.id).length}
                        key={building.id}
                        building={building}
                        onSelect={setBuildingFocus}
                        selected={building.isFocused}
                      />
                    ))}
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="grid gap-3 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Outpost modifiers</p>
                      <StatRow label="Storage limit" value={`${buildingStats.storageLimit}`} />
                      <StatRow label="Watchtower damage" value={`x${buildingStats.damageMultiplier.toFixed(2)}`} />
                      <StatRow label="Infirmary recovery" value={`+${buildingStats.healingBonus} medicine`} />
                      <StatRow label="Workshop scrap yield" value={`x${buildingStats.scrapYieldMultiplier.toFixed(2)}`} />
                      <StatRow label="Defense crew" value={`${buildingStats.assignedDefense}`} />
                    </div>
                    <div className="grid gap-4">
                      <FocusedBuildingScene
                        assignedSurvivors={assignedToSelectedBuilding.length}
                        building={selectedBuilding}
                      />
                      <UpgradePanel
                        building={selectedBuilding}
                        canUpgrade={canUpgradeSelectedBuilding}
                        cost={selectedUpgradeCost}
                        onUpgrade={applyBuildingUpgrade}
                      />
                    </div>
                  </div>
                </Panel>

                <Panel
                  eyebrow="Operations"
                  title="Mission board"
                  description="Choose one route, commit a team, then decide how hard to press it. Rewards and costs are visible before you send anyone out, but route pressure now tracks the current threat tier."
                >
                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="grid gap-3">
                      {state.missions.map((mission) => (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          onSelect={selectMission}
                          selected={mission.id === state.selectedMissionId}
                        />
                      ))}
                    </div>
                    <MissionSelectionPanel
                      mission={selectedMission}
                      state={state}
                      onResolveApproach={resolveSelectedMissionApproach}
                      onToggleMissionTeam={updateMissionTeam}
                    />
                  </div>
                </Panel>

                <Panel
                  eyebrow="Nightfall"
                  title="Defense gate"
                  description="This is the handoff from day command into the live defense phase. The briefing below shows what tonight can pay out, how strong the line looks, and how much current threat pressure is bending the perimeter."
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                    <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Defense briefing</p>
                      <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
                        East perimeter watch
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        Three pressure waves push the lanes. Auto-fire keeps the line working, while manual
                        burst lets you spike fast targets before they hit the barricade.
                      </p>
                      <div className="mt-4 grid gap-3 text-sm text-white/70">
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Victory reward</span>
                          <span className="font-medium text-white">
                            {formatRewardBundle(nextNightReward)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Combat model</span>
                          <span className="font-medium text-white">Canvas lane defense</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Hostile mix</span>
                          <span className="font-medium text-white">{describeDayEnemyPressure(state.day, state.threatLevel)}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Threat effect</span>
                          <span className="font-medium text-white">{threatDefensePressure}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Day modifier</span>
                          <span className="font-medium text-white">{state.activeDayModifier?.label ?? "None"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Special night</span>
                          <span className="font-medium text-white">{state.activeSpecialNight?.label ?? "Standard night"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Upgrade impact</span>
                          <span className="font-medium text-white">
                            Tower x{buildingStats.damageMultiplier.toFixed(2)} / Heal +{buildingStats.healingBonus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Assigned defenders</span>
                          <span className="font-medium text-white">{buildingStats.assignedDefense}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <span>Roster quality</span>
                          <span className="font-medium text-white">{defenseRosterPressure}</span>
                        </div>
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/65">
                        <span className="font-medium text-white">{state.activeDayModifier?.label ?? "No modifier"}:</span>{" "}
                        {dayModifierDefenseImpact}
                      </div>
                      {state.activeSpecialNight ? (
                        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-100">
                          <span className="font-medium text-white">{state.activeSpecialNight.label}:</span>{" "}
                          {state.activeSpecialNight.detail}
                        </div>
                      ) : null}
                    </div>
                    <SelectionPanel
                      ctaLabel="Start night defense"
                      description="Night defense plays as a contained combat sequence. The result returns to this run and autosaves as soon as the barricade holds or breaks."
                      detailItems={[
                        ["Waves", `${3 + Math.min(state.day - 1, 2)} / ${4 + Math.min(state.day - 1, 2)} / ${5 + Math.min(state.day - 1, 2)}`],
                        ["Player HP", `${90 + state.day * 4}`],
                        ["Base HP", `${120 + state.day * 6}`],
                      ]}
                      disabled={false}
                      eyebrow="Combat start"
                      onCta={beginNightDefense}
                      title="Night defense queued"
                    />
                  </div>
                </Panel>
              </div>

              <div className="grid gap-6">
                <Panel
                  eyebrow="Squad"
                  title="Survivor assignments"
                  description="Each survivor should either support the economy, recover under care, or hold a combat post. Assignment changes apply immediately and shape the next defense."
                >
                  <div className="grid gap-4">
                    <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Focused post</p>
                      <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
                        {selectedBuilding.name}
                      </h3>
                      <p className="mt-3 text-sm text-white/65">
                        Assigned here:{" "}
                        {assignedToSelectedBuilding.length > 0
                          ? assignedToSelectedBuilding.map((survivor) => survivor.name).join(", ")
                          : "Nobody yet"}
                      </p>
                      <p className="mt-3 text-sm text-white/55">
                        Infirmary auto-treatment slots: {treatmentSlots}
                      </p>
                    </div>
                    {state.survivors.map((survivor) => (
                      <SurvivorCard
                        canTreat={canTreatSurvivor(state, survivor.id)}
                        prioritized={state.selectedTreatmentIds.includes(survivor.id)}
                        onTreat={applyTreatment}
                        onTogglePriority={updateTreatmentPriority}
                        key={survivor.id}
                        onAssign={updateSurvivorAssignment}
                        survivor={survivor}
                        treatmentCost={getTreatmentCost(state, survivor.id)}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel
                  eyebrow="Intake"
                  title="Recruitment board"
                  description="Recruit to widen coverage, but remember that every new unit adds pressure on food, medicine, and night planning."
                >
                  <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="grid gap-3">
                      {state.recruitPool.length > 0 ? (
                        state.recruitPool.map((candidate) => (
                          <RecruitCard
                            candidate={candidate}
                            key={candidate.id}
                            onSelect={selectRecruit}
                            selected={candidate.id === state.selectedRecruitId}
                          />
                        ))
                      ) : (
                        <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/65">
                          No candidates waiting. Win the next night cycle to refresh the board.
                        </div>
                      )}
                    </div>
                    <SelectionPanel
                      ctaLabel="Recruit survivor"
                      description={
                        selectedRecruit?.bonusLabel ??
                        "Select a candidate to review their role, cost, and likely assignment fit."
                      }
                      detailItems={[
                        ["Role", selectedRecruit?.role ?? "None"],
                        ["Cost", formatRewardBundle(selectedRecruit?.cost ?? {})],
                        ["Window", selectedRecruit?.availability ?? "N/A"],
                      ]}
                      disabled={!selectedRecruit || !canRecruitSelectedSurvivor}
                      eyebrow="Selected candidate"
                      onCta={addRecruit}
                      title={selectedRecruit?.name ?? "No candidate selected"}
                    />
                  </div>
                </Panel>

                <Panel
                  eyebrow="Signals"
                  title="Day events"
                  description="Day events are short field calls. Use them for quick gains or tradeoffs, not as a substitute for the main mission board."
                >
                  <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="grid gap-3">
                      {state.dayEvents.length > 0 ? (
                        state.dayEvents.map((event) => (
                          <DayEventCard
                            event={event}
                            key={event.id}
                            onSelect={selectEvent}
                            selected={event.id === state.selectedEventId}
                          />
                        ))
                      ) : (
                        <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/65">
                          No active field events. The board refreshes after a successful night cycle.
                        </div>
                      )}
                    </div>
                    <DayEventPanel event={selectedEvent} onResolve={resolveEventChoice} />
                  </div>
                </Panel>

                <Panel
                  eyebrow="Forecast"
                  title="Pending consequences"
                  description="These are queued effects from recent choices. They do not land yet, but the run is already carrying them forward into the next day."
                >
                  <div className="grid gap-3">
                    {state.pendingConsequences.length > 0 ? (
                      state.pendingConsequences.map((consequence) => (
                        <article
                          className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4"
                          key={consequence.id}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-medium text-white">{consequence.label}</p>
                            <span className="text-xs uppercase tracking-[0.22em] text-white/45">
                              Day {consequence.triggerDay}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-white/65">{consequence.detail}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--accent-soft)]">
                            Source: {consequence.sourceTitle}
                          </p>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/65">
                        No queued follow-up pressure. Current event and task decisions are not carrying extra next-day effects yet.
                      </div>
                    )}
                  </div>
                </Panel>

                <Panel
                  eyebrow="Discipline"
                  title="Outpost task queue"
                  description="Tasks are your low-risk momentum tool. Use them when the shelter needs a small push without spending a full route."
                >
                  <div className="grid gap-3">
                    {state.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        onSelect={selectTask}
                        selected={task.id === state.selectedTaskId}
                        task={task}
                      />
                    ))}
                  </div>
                  <div className="mt-4">
                    <SelectionPanel
                      ctaLabel="Complete task"
                      description={selectedTask?.description ?? "Select a task to improve the shelter."}
                      detailItems={[
                        ["Effect", selectedTask?.rewardLabel ?? "None"],
                        ["Owner", selectedTask?.owner ?? "Unassigned"],
                        ["Window", selectedTask?.duration ?? "N/A"],
                      ]}
                      disabled={!canCompleteSelectedTask}
                      eyebrow="Selected task"
                      onCta={completeTask}
                      title={selectedTask?.title ?? "No task selected"}
                    />
                  </div>
                </Panel>

                <Panel
                  eyebrow="Telemetry"
                  title="Recent activity"
                  description="Use this feed as your run log. It shows what changed recently and why the current resource and survivor state looks the way it does."
                >
                  <div className="grid gap-3">
                    {state.activityLog.map((entry) => (
                      <article
                        className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4"
                        key={entry.id}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium text-white">{entry.title}</p>
                          <span className="text-xs uppercase tracking-[0.22em] text-white/45">{entry.timestamp}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/65">{entry.detail}</p>
                      </article>
                    ))}
                  </div>
                </Panel>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StartScreen({
  onContinue,
  onNewGame,
  resumableState,
}: {
  onContinue: () => void;
  onNewGame: () => void;
  resumableState: DeadGridState | null;
}) {
  const canContinue = Boolean(resumableState?.hasStarted);

  return (
    <section className="grid min-h-[calc(100vh-3rem)] items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-white/10 bg-black/25 p-8 shadow-2xl shadow-black/30 backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">Dead Grid: Outpost</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl uppercase tracking-[0.14em] text-white md:text-7xl">
          Hold the line. Feed the shelter. Own the grid.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
          A browser-first survival command loop set inside a fractured evacuation zone. You can establish a
          run, review resources, upgrade the outpost, clear missions, survive the night defense, and keep
          everything safely in local browser storage.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          {canContinue ? (
            <button
              className="rounded-full border border-[var(--signal)]/45 bg-[rgba(73,183,172,0.12)] px-6 py-3 font-medium uppercase tracking-[0.24em] text-[var(--signal)] transition hover:border-[var(--signal)] hover:bg-[rgba(73,183,172,0.18)]"
              onClick={onContinue}
              type="button"
            >
              Continue run
            </button>
          ) : null}
          <button
            className="rounded-full bg-[var(--accent)] px-6 py-3 font-medium uppercase tracking-[0.24em] text-[#1d1308] transition hover:bg-[var(--accent-strong)]"
            onClick={onNewGame}
            type="button"
          >
            Start new run
          </button>
        </div>
        {canContinue ? (
          <div className="mt-5 grid gap-3 rounded-[1.6rem] border border-[var(--signal)]/25 bg-[rgba(73,183,172,0.08)] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--signal)]">Saved run ready</p>
            <div className="grid gap-2 text-sm text-white/72">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/55">Day</span>
                <span className="font-medium text-white">{resumableState?.day}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/55">Threat</span>
                <span className="font-medium text-white">{resumableState?.threatLevel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/55">Saved</span>
                <span className="font-medium text-white">{resumableState?.lastSavedLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/55">Modifier</span>
                <span className="font-medium text-white">{resumableState?.activeDayModifier?.label ?? "None"}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/50">
            Start a new run to establish local campaign state. Once a run exists, it can be continued from this screen.
          </p>
        )}
      </div>

      <aside className="grid gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">MVP systems online</p>
        <div className="grid gap-3">
          {[
            "Startscreen with continue/new-run flow",
            "Outpost dashboard with building summaries",
            "Resource economy with visible pressure",
            "Mission and task selection with immediate resolution",
            "Playable night-defense phase with persistent outcome",
            "Building upgrades from level 1 to 5 with live effects",
            "Survivor roster with assignment-driven bonuses",
            "Visual building states with level identity and occupancy",
            "Balanced upgrade costs and reward scaling",
            "Rotating mission variants with enemy-pressure hints",
            "Multiple zombie types in the lane-defense phase",
            "Browser-local save state for campaign continuity",
          ].map((item) => (
            <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72" key={item}>
              {item}
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

function RunSummaryScreen({
  onContinue,
  state,
}: {
  onContinue: () => void;
  state: DeadGridState;
}) {
  const summary = state.lastCombatSummary;

  if (!summary) {
    return null;
  }

  const isVictory = summary.status === "victory";
  const specialNightLabel = summary.specialNightLabel;
  const specialNightDetail = summary.specialNightDetail;

  return (
    <section className="grid min-h-[calc(100vh-3rem)] items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[2rem] border border-white/10 bg-black/25 p-8 shadow-2xl shadow-black/30 backdrop-blur md:p-10">
        <p
          className={`text-xs uppercase tracking-[0.38em] ${
            isVictory ? "text-[var(--signal)]" : "text-[#ffb08b]"
          }`}
        >
          {isVictory ? "Night defense complete" : "Night defense aftermath"}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl uppercase tracking-[0.14em] text-white md:text-6xl">
          {summary.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">{summary.detail}</p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <StatRow label="Result" value={isVictory ? "Victory" : "Defeat"} />
          <StatRow label="Waves cleared" value={`${summary.wavesCleared}`} />
          <StatRow label="Current day" value={`${state.day}`} />
        </div>
        {specialNightLabel ? (
          <div className="mt-5 rounded-[1.6rem] border border-amber-500/20 bg-amber-500/8 p-5 text-sm text-amber-100">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">Special night</p>
            <p className="mt-3 text-lg font-medium text-white">{specialNightLabel}</p>
            <p className="mt-2 text-sm text-amber-100/85">{specialNightDetail}</p>
          </div>
        ) : null}
        <div className="mt-5 rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Resolution</p>
          <p className="mt-3 text-lg font-medium text-white">{summary.rewardLabel}</p>
          <p className="mt-2 text-sm text-white/60">
            {isVictory
              ? `The outpost rolls into day ${state.day} with refreshed routes, recruits, and field events.`
              : "The line held long enough to report losses, triage survivors, and regroup at the shelter."}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="rounded-full bg-[var(--signal)] px-6 py-3 font-medium uppercase tracking-[0.24em] text-[#031816] transition hover:brightness-110"
            onClick={onContinue}
            type="button"
          >
            {isVictory ? `Advance to day ${state.day}` : "Return to outpost"}
          </button>
        </div>
      </div>

      <aside className="grid gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">After-action brief</p>
        <div className="grid gap-3">
          {specialNightLabel ? (
            <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72">
              Tonight was logged as a <span className="font-medium text-white">{specialNightLabel}</span>.
            </div>
          ) : null}
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72">
            Threat level now sits at <span className="font-medium text-white">{state.threatLevel}</span>.
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72">
            Save state remains active. You can leave now and continue this run later from the landing screen.
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72">
            The recent activity log has already been updated with the night result for later review.
          </div>
        </div>
      </aside>
    </section>
  );
}

function RunEndedScreen({
  onNewGame,
  onReturnToLanding,
  state,
}: {
  onNewGame: () => void;
  onReturnToLanding: () => void;
  state: DeadGridState;
}) {
  const summary = state.lastCombatSummary;

  if (!summary) {
    return null;
  }

  return (
    <section className="grid min-h-[calc(100vh-3rem)] items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[2rem] border border-white/10 bg-black/25 p-8 shadow-2xl shadow-black/30 backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-[0.38em] text-[#ffb08b]">Run ended</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl uppercase tracking-[0.14em] text-white md:text-6xl">
          {summary.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">{summary.detail}</p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <StatRow label="Result" value="Defeat" />
          <StatRow label="Final day" value={`${state.day}`} />
          <StatRow label="Waves cleared" value={`${summary.wavesCleared}`} />
        </div>
        <div className="mt-5 rounded-[1.6rem] border border-[#ffb08b]/20 bg-[rgba(120,21,46,0.16)] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[#ffb08b]">Final report</p>
          <p className="mt-3 text-lg font-medium text-white">{summary.rewardLabel}</p>
          <p className="mt-2 text-sm text-white/60">
            The outpost could not hold this cycle. This run should no longer appear as a resumable campaign from the landing screen.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="rounded-full border border-white/15 px-6 py-3 font-medium uppercase tracking-[0.24em] text-white/80 transition hover:border-white/40 hover:text-white"
            onClick={onReturnToLanding}
            type="button"
          >
            Return to landing
          </button>
          <button
            className="rounded-full bg-[var(--accent)] px-6 py-3 font-medium uppercase tracking-[0.24em] text-[#1d1308] transition hover:bg-[var(--accent-strong)]"
            onClick={onNewGame}
            type="button"
          >
            Start fresh run
          </button>
        </div>
      </div>

      <aside className="grid gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">After-action brief</p>
        <div className="grid gap-3">
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72">
            Threat level closed at <span className="font-medium text-white">{state.threatLevel}</span>.
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72">
            Survivors and supply losses have been logged, but this campaign is no longer eligible for `Continue run`.
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/72">
            Use the landing screen to review the loss or start a fresh command loop.
          </div>
        </div>
      </aside>
    </section>
  );
}

function Panel({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/25 p-5 shadow-xl shadow-black/20 backdrop-blur md:p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-white/45">{eyebrow}</p>
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-3xl uppercase tracking-[0.12em] text-white">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-white/60">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
      <span className="text-[10px] uppercase tracking-[0.24em] text-white/45">{label}</span>
      <span className="ml-2 text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function ResourceCard({ resource }: { resource: DeadGridState["resources"][number] }) {
  const isLoss = resource.delta < 0;
  const deltaClass = isLoss ? "bg-rose-500/12 text-rose-200" : "bg-emerald-500/12 text-emerald-200";
  const cardClass = isLoss
    ? "border-rose-500/20 bg-[linear-gradient(180deg,rgba(120,21,46,0.16),rgba(0,0,0,0.22))]"
    : "border-emerald-500/14 bg-[linear-gradient(180deg,rgba(20,83,45,0.12),rgba(0,0,0,0.22))]";

  return (
    <article className={`rounded-[1.8rem] border p-5 shadow-lg shadow-black/20 ${cardClass}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">{resource.label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-4xl uppercase tracking-[0.1em] text-white">{resource.amount}</p>
          <p className="mt-1 text-sm text-white/60">{resource.context}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${deltaClass}`}>
          {resource.delta >= 0 ? "+" : ""}
          {resource.delta}
        </span>
      </div>
    </article>
  );
}

function MissionCard({
  mission,
  onSelect,
  selected,
}: {
  mission: Mission;
  onSelect: (missionId: string) => void;
  selected: boolean;
}) {
  const isResolved = !missionHasReward(mission);
  const routeRoleLabel = getRouteRoleLabel(mission.routeRole);
  const routeRoleSummary = getRouteRoleSummary(mission.routeRole);

  return (
    <button
      className={`rounded-[1.4rem] border p-4 text-left transition ${
        selected
          ? "border-[var(--accent)] bg-[rgba(243,157,74,0.1)]"
          : isResolved
            ? "border-white/8 bg-white/[0.02] opacity-60"
            : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
      aria-label={`Mission ${mission.title}, ${mission.zone}, ${isResolved ? "cleared" : mission.difficulty}`}
      onClick={() => onSelect(mission.id)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">{mission.zone}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{mission.title}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
          {isResolved ? "Cleared" : mission.difficulty}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/65">{mission.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[var(--signal)]/25 bg-[var(--signal)]/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--signal)]">
          {routeRoleLabel}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
          {formatMissionKind(mission.kind)}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
          {mission.enemyHint}
        </span>
      </div>
      <p className="mt-3 text-sm text-white/55">{routeRoleSummary}</p>
      <p className="mt-4 text-sm font-medium text-[var(--accent-soft)]">{mission.rewardLabel}</p>
    </button>
  );
}

function TaskCard({
  onSelect,
  selected,
  task,
}: {
  onSelect: (taskId: string) => void;
  selected: boolean;
  task: OutpostTask;
}) {
  const isDone = !taskHasReward(task);

  return (
    <button
      className={`rounded-[1.3rem] border p-4 text-left transition ${
        selected
          ? "border-[var(--signal)] bg-[rgba(73,183,172,0.12)]"
          : isDone
            ? "border-white/8 bg-white/[0.02] opacity-60"
            : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
      aria-label={`Task ${task.title}, ${isDone ? "completed" : task.owner}`}
      onClick={() => onSelect(task.id)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-white">{task.title}</h3>
        <span className="text-xs uppercase tracking-[0.22em] text-white/45">
          {isDone ? "Completed" : task.owner}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/65">{task.description}</p>
    </button>
  );
}

function UpgradePanel({
  building,
  canUpgrade,
  cost,
  onUpgrade,
}: {
  building: DeadGridState["buildings"][number];
  canUpgrade: boolean;
  cost: Partial<Record<"food" | "scrap" | "medicine" | "ammo", number>>;
  onUpgrade: () => void;
}) {
  const nextLevel = Math.min(building.level + 1, 5);

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
      <p className="text-xs uppercase tracking-[0.26em] text-white/45">Selected building</p>
      <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">{building.name}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{building.summary}</p>
      <div className="mt-4 grid gap-3">
        <StatRow label="Current level" value={`${building.level}/5`} />
        <StatRow label="State" value={getBuildingStageLabel(building.level)} />
        <StatRow label="Current effect" value={building.effect} />
        <StatRow label="Next target" value={building.level >= 5 ? "Maxed" : `Level ${nextLevel}`} />
        <StatRow label="Upgrade cost" value={formatRewardBundle(cost)} />
      </div>
      <button
        className="mt-5 w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1d1308] transition enabled:hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canUpgrade}
        onClick={onUpgrade}
        type="button"
      >
        {building.level >= 5 ? "Building maxed" : "Upgrade building"}
      </button>
    </div>
  );
}

function BuildingStatusCard({
  assignedCount,
  building,
  onSelect,
  selected,
}: {
  assignedCount: number;
  building: DeadGridState["buildings"][number];
  onSelect: (buildingId: BuildingId) => void;
  selected: boolean;
}) {
  const theme = getBuildingTheme(building.id);

  return (
    <button
      className={`rounded-[1.6rem] border p-4 text-left transition ${
        selected
          ? "border-[var(--accent)] bg-[rgba(243,157,74,0.1)] shadow-lg shadow-[rgba(243,157,74,0.12)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
      aria-label={`Building ${building.name}, level ${building.level}, ${assignedCount} assigned`}
      onClick={() => onSelect(building.id)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">{building.category}</p>
          <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-white">
            {building.name}
          </h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
          Lv {building.level}
        </span>
      </div>

      <div
        className="mt-4 rounded-[1.3rem] border border-white/8 p-4"
        style={{
          backgroundImage: `linear-gradient(180deg, ${theme.glow} 0%, rgba(255,255,255,0.02) 58%, rgba(0,0,0,0.22) 100%)`,
        }}
      >
        <div className="flex h-20 items-end gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const active = index < building.level;
            return (
              <div
                className={`flex-1 rounded-t-2xl border border-white/8 transition ${
                  active ? "" : "opacity-30"
                }`}
                key={`${building.id}-bar-${index}`}
                style={{
                  height: `${32 + index * 10}px`,
                  background: active ? theme.fill : "rgba(255,255,255,0.04)",
                  boxShadow: active ? `0 0 24px ${theme.shadow}` : "none",
                }}
              />
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/55">
          <span>{getBuildingStageLabel(building.level)}</span>
          <span>{assignedCount} assigned</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/70">{building.summary}</p>
      <p className="mt-3 text-sm font-medium text-[var(--accent-soft)]">{building.effect}</p>
    </button>
  );
}

function FocusedBuildingScene({
  assignedSurvivors,
  building,
}: {
  assignedSurvivors: number;
  building: DeadGridState["buildings"][number];
}) {
  const theme = getBuildingTheme(building.id);

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/25">
      <div
        className="px-5 py-5"
        style={{
          backgroundImage: `radial-gradient(circle at top, ${theme.glow}, transparent 48%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
        }}
      >
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Visual state</p>
        <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">{building.name}</h3>
        <div className="mt-5 flex h-28 items-end justify-between gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className={`flex-1 rounded-t-[1.4rem] border border-white/10 ${
                index < building.level ? "" : "opacity-25"
              }`}
              key={`${building.id}-tower-${index}`}
              style={{
                height: `${36 + index * 14}px`,
                background: index < building.level ? theme.fill : "rgba(255,255,255,0.04)",
                boxShadow: index < building.level ? `0 0 20px ${theme.shadow}` : "none",
              }}
            />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatRow label="Stage" value={getBuildingStageLabel(building.level)} />
          <StatRow label="Crew inside" value={`${assignedSurvivors}`} />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function SurvivorCard({
  canTreat,
  onAssign,
  onTreat,
  onTogglePriority,
  prioritized,
  survivor,
  treatmentCost,
}: {
  canTreat: boolean;
  onAssign: (survivorId: string, assignment: SurvivorAssignment) => void;
  onTreat: (survivorId: string) => void;
  onTogglePriority: (survivorId: string) => void;
  prioritized: boolean;
  survivor: DeadGridState["survivors"][number];
  treatmentCost: Partial<Record<"food" | "scrap" | "medicine" | "ammo", number>>;
}) {
  const assignments: SurvivorAssignment[] = [
    "defense",
    "workshop",
    "infirmary",
    "storage",
    "watchtower",
    null,
  ];

  return (
    <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">{survivor.role}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{survivor.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
            {formatAssignmentLabel(survivor.assignment)}
          </span>
          <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${getSurvivorStatusClass(survivor.status)}`}>
            {survivor.status}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-white/65">{survivor.trait}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--accent-soft)]">
        {getTraitEffectLabel(survivor.trait)}
      </p>
      <p className="mt-2 text-sm text-white/50">{describeSurvivorReadiness(survivor.status)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {assignments.map((assignment) => {
          const active = survivor.assignment === assignment;
          return (
            <button
              className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                active
                  ? "border-[var(--accent)] bg-[rgba(243,157,74,0.12)] text-white"
                  : "border-white/10 text-white/65 hover:border-white/30 hover:text-white"
              }`}
              key={`${survivor.id}-${String(assignment)}`}
              onClick={() => onAssign(survivor.id, assignment)}
              type="button"
            >
              {formatAssignmentLabel(assignment)}
            </button>
          );
        })}
      </div>
      {survivor.status !== "ready" ? (
        <div className="mt-4 grid gap-2">
          <button
            className={`w-full rounded-full border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition ${
              prioritized
                ? "border-[var(--accent)] bg-[rgba(243,157,74,0.12)] text-white"
                : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
            }`}
            onClick={() => onTogglePriority(survivor.id)}
            type="button"
          >
            {prioritized ? "Care prioritized" : "Prioritize care"}
          </button>
          <button
            className="w-full rounded-full bg-[var(--signal)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#031816] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canTreat}
            onClick={() => onTreat(survivor.id)}
            type="button"
          >
            Treat survivor {formatRewardBundle(treatmentCost)}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RecruitCard({
  candidate,
  onSelect,
  selected,
}: {
  candidate: NonNullable<ReturnType<typeof getSelectedRecruitCandidate>>;
  onSelect: (recruitId: string) => void;
  selected: boolean;
}) {
  return (
    <button
      className={`rounded-[1.4rem] border p-4 text-left transition ${
        selected
          ? "border-[var(--accent)] bg-[rgba(243,157,74,0.1)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
      aria-label={`Recruit ${candidate.name}, ${candidate.role}, ${candidate.availability}`}
      onClick={() => onSelect(candidate.id)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">{candidate.availability}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{candidate.name}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
          {candidate.role}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/65">{candidate.trait}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--accent-soft)]">
        {getTraitEffectLabel(candidate.trait)}
      </p>
      <p className="mt-2 text-sm text-white/50">{candidate.bonusLabel}</p>
      <p className="mt-4 text-sm font-medium text-[var(--accent-soft)]">
        {formatRewardBundle(candidate.cost)}
      </p>
    </button>
  );
}

function DayEventCard({
  event,
  onSelect,
  selected,
}: {
  event: DeadGridState["dayEvents"][number];
  onSelect: (eventId: string) => void;
  selected: boolean;
}) {
  return (
    <button
      className={`rounded-[1.4rem] border p-4 text-left transition ${
        selected
          ? "border-[var(--accent)] bg-[rgba(243,157,74,0.1)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
      aria-label={`Day event ${event.title}, ${event.window}, ${event.risk}`}
      onClick={() => onSelect(event.id)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">{event.window}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{event.title}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
          {event.risk}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/65">{event.detail}</p>
    </button>
  );
}

function DayEventPanel({
  event,
  onResolve,
}: {
  event: DeadGridState["dayEvents"][number] | null;
  onResolve: (eventId: string, choiceId: string) => void;
}) {
  if (!event) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-black/20 p-5 text-sm text-white/60">
        No active event selected. Resolved field events move into Recent activity, and the board refreshes after the next successful night cycle.
      </div>
    );
  }

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
      <p className="text-xs uppercase tracking-[0.26em] text-white/45">Selected event</p>
      <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">{event.title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{event.detail}</p>
      <dl className="mt-4 grid gap-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Risk</dt>
          <dd className="text-sm font-medium text-white">{event.risk}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Window</dt>
          <dd className="text-sm font-medium text-white">{event.window}</dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-3">
        {event.choices.map((choice) => (
          <button
            className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-[var(--signal)] hover:bg-[rgba(73,183,172,0.08)]"
            key={choice.id}
            onClick={() => onResolve(event.id, choice.id)}
            type="button"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-white">{choice.label}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--accent-soft)]">
                {formatRewardBundle(choice.reward)}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/65">{choice.effectLabel}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectionPanel({
  ctaLabel,
  description,
  detailItems,
  disabled,
  eyebrow,
  onCta,
  title,
}: {
  ctaLabel: string;
  description: string;
  detailItems: [string, string][];
  disabled: boolean;
  eyebrow: string;
  onCta: () => void;
  title: string;
}) {
  const statusLabel = disabled ? "Waiting" : "Ready";

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.26em] text-white/45">{eyebrow}</p>
        <span
          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em] ${
            disabled ? "bg-white/6 text-white/45" : "bg-[var(--signal)]/18 text-[var(--signal)]"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{description}</p>
      <dl className="mt-4 grid gap-3">
        {detailItems.map(([label, value]) => (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3" key={label}>
            <dt className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</dt>
            <dd className="text-sm font-medium text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <button
        className="mt-5 w-full rounded-full bg-[var(--signal)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#031816] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        onClick={onCta}
        type="button"
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function MissionSelectionPanel({
  mission,
  state,
  onResolveApproach,
  onToggleMissionTeam,
}: {
  mission: Mission | null;
  state: DeadGridState;
  onResolveApproach: (approachId: string) => void;
  onToggleMissionTeam: (survivorId: string) => void;
}) {
  if (!mission) {
    return (
      <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5 text-sm text-white/65">
        Select a mission to inspect the route.
      </div>
    );
  }

  const selectedTeam = state.survivors.filter((survivor) => state.selectedMissionTeamIds.includes(survivor.id));
  const readyTeam = selectedTeam.filter((survivor) => survivor.status === "ready");
  const fatiguedTeam = selectedTeam.filter((survivor) => survivor.status === "fatigued");
  const missionAvailable = missionHasReward(mission);
  const threatPressure = getThreatMissionPressureLabel(state.threatLevel);
  const teamPressure = describeMissionTeamPressure(selectedTeam);
  const dayModifierImpact = getDayModifierMissionImpact(state.activeDayModifier);
  const routeRoleLabel = getRouteRoleLabel(mission.routeRole);
  const routeRoleSummary = getRouteRoleSummary(mission.routeRole);

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
      <p className="text-xs uppercase tracking-[0.26em] text-white/45">Selected mission</p>
      <h3 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">{mission.title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{mission.description}</p>
      <dl className="mt-4 grid gap-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Route type</dt>
          <dd className="text-sm font-medium text-white">{formatMissionKind(mission.kind)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Route role</dt>
          <dd className="text-sm font-medium text-white">{routeRoleLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Base reward</dt>
          <dd className="text-sm font-medium text-white">{mission.rewardLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Hostiles</dt>
          <dd className="text-sm font-medium text-white">{mission.enemyHint}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Threat pressure</dt>
          <dd className="text-sm font-medium text-white">{threatPressure}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Day modifier</dt>
          <dd className="text-sm font-medium text-white">{state.activeDayModifier?.label ?? "None"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Window</dt>
          <dd className="text-sm font-medium text-white">{mission.duration}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Team status</dt>
          <dd className="text-sm font-medium text-white">
            {!missionAvailable
              ? "Route already exhausted"
              : readyTeam.length > 0
              ? `${readyTeam.length} ready / ${selectedTeam.length} selected`
              : selectedTeam.length > 0
                ? `${selectedTeam.length} worn / 0 ready`
                : "No team selected"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-white/45">Crew pressure</dt>
          <dd className="text-sm font-medium text-white">{teamPressure}</dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Mission team</p>
        <p className="text-sm text-white/55">
          {missionAvailable
            ? "Pick up to two available survivors. Units locked to Night Defense or marked injured cannot leave the outpost for day operations. Fatigued survivors can still go, but they return less value and add operating strain."
            : "This route has already been cleared for the current day and cannot be resolved again."}
        </p>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/65">
          <span className="font-medium text-white">{routeRoleLabel}:</span> {routeRoleSummary}
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/65">
          <span className="font-medium text-white">{state.activeDayModifier?.label ?? "No modifier"}:</span>{" "}
          {dayModifierImpact}
        </div>
        {fatiguedTeam.length > 0 ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-100">
            Worn crew selected: {fatiguedTeam.map((survivor) => survivor.name).join(", ")}. Route costs and fallout will hit harder.
          </div>
        ) : null}
        <div className="grid gap-2">
          {state.survivors.map((survivor) => {
            const selected = state.selectedMissionTeamIds.includes(survivor.id);
            const locked = survivor.assignment === "defense" || survivor.status === "injured";
            return (
              <button
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-[var(--signal)] bg-[rgba(73,183,172,0.12)]"
                    : "border-white/8 bg-white/[0.03]"
                } ${locked ? "cursor-not-allowed opacity-45" : "hover:border-white/20 hover:bg-white/[0.05]"}`}
                disabled={locked}
                key={survivor.id}
                onClick={() => onToggleMissionTeam(survivor.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white">{survivor.name}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                    {survivor.assignment === "defense"
                      ? "Defense locked"
                      : survivor.status === "injured"
                        ? "Injured"
                        : survivor.role}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/60">
                  {survivor.trait} {" | "} {survivor.status}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {mission.approaches.map((approach) => (
          <MissionApproachButton
            approach={approach}
            key={approach.id}
            mission={mission}
            onResolveApproach={onResolveApproach}
            state={state}
          />
        ))}
      </div>
    </div>
  );
}

function MissionApproachButton({
  approach,
  mission,
  onResolveApproach,
  state,
}: {
  approach: Mission["approaches"][number];
  mission: Mission;
  onResolveApproach: (approachId: string) => void;
  state: DeadGridState;
}) {
  const outcome = getMissionApproachOutcome(state, mission, approach);
  const selectedTeam = state.survivors.filter((survivor) => state.selectedMissionTeamIds.includes(survivor.id));
  const operationalTeam = selectedTeam.filter((survivor) => survivor.status !== "injured");
  const readyTeam = selectedTeam.filter((survivor) => survivor.status === "ready");
  const canResolve = operationalTeam.length > 0 && missionHasReward(mission);

  return (
    <button
      className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition enabled:hover:border-[var(--accent)] enabled:hover:bg-[rgba(243,157,74,0.08)] disabled:cursor-not-allowed disabled:opacity-45"
      disabled={!canResolve}
      onClick={() => onResolveApproach(approach.id)}
      type="button"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold uppercase tracking-[0.16em] text-white">{approach.label}</span>
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--accent-soft)]">
          {formatRewardBundle(outcome.reward)}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/65">{approach.detail}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{outcome.bonusLabel}</p>
      {formatRewardBundle(outcome.cost) !== "None" ? (
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">
          Cost: {formatRewardBundle(outcome.cost)}
        </p>
      ) : null}
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">
        {canResolve
          ? readyTeam.length > 0
            ? `Fresh crew: ${readyTeam.map((survivor) => survivor.name).join(", ")}`
            : `Launching with worn crew only: ${operationalTeam.map((survivor) => survivor.name).join(", ")}`
          : "Select at least one non-injured survivor to launch this route"}
      </p>
    </button>
  );
}

function formatRewardBundle(reward: Partial<Record<"food" | "scrap" | "medicine" | "ammo", number>>) {
  const parts = Object.entries(reward)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] > 0)
    .map(([key, value]) => `+${value} ${key}`);

  return parts.length > 0 ? parts.join(", ") : "None";
}

function missionHasReward(mission: Pick<Mission, "reward">) {
  return Object.values(mission.reward).some((value) => typeof value === "number" && value > 0);
}

function taskHasReward(task: Pick<OutpostTask, "reward">) {
  return Object.values(task.reward).some((value) => typeof value === "number" && value > 0);
}

function getBuildingStageLabel(level: number) {
  if (level <= 1) return "Makeshift";
  if (level === 2) return "Reinforced";
  if (level === 3) return "Operational";
  if (level === 4) return "Hardened";
  return "Fortified";
}

function getBuildingTheme(buildingId: BuildingId) {
  switch (buildingId) {
    case "workshop":
      return {
        fill: "linear-gradient(180deg, rgba(243,157,74,0.95), rgba(153,84,28,0.72))",
        glow: "rgba(243,157,74,0.24)",
        shadow: "rgba(243,157,74,0.28)",
      };
    case "infirmary":
      return {
        fill: "linear-gradient(180deg, rgba(92,205,179,0.95), rgba(25,110,96,0.74))",
        glow: "rgba(92,205,179,0.2)",
        shadow: "rgba(92,205,179,0.24)",
      };
    case "storage":
      return {
        fill: "linear-gradient(180deg, rgba(112,153,233,0.92), rgba(41,67,125,0.76))",
        glow: "rgba(112,153,233,0.2)",
        shadow: "rgba(112,153,233,0.24)",
      };
    case "watchtower":
      return {
        fill: "linear-gradient(180deg, rgba(235,112,101,0.94), rgba(124,44,39,0.76))",
        glow: "rgba(235,112,101,0.22)",
        shadow: "rgba(235,112,101,0.26)",
      };
  }
}

function getSurvivorStatusClass(status: DeadGridState["survivors"][number]["status"]) {
  switch (status) {
    case "injured":
      return "bg-rose-500/12 text-rose-200";
    case "fatigued":
      return "bg-amber-500/12 text-amber-200";
    case "ready":
    default:
      return "bg-emerald-500/12 text-emerald-200";
  }
}

function describeSurvivorReadiness(status: DeadGridState["survivors"][number]["status"]) {
  switch (status) {
    case "injured":
      return "Injured survivors cannot join day missions and should be treated before they return to rotation.";
    case "fatigued":
      return "Fatigued survivors can still exist in the roster, but they are not delivering full assignment value.";
    case "ready":
    default:
      return "Ready survivors can be assigned, recruited into teams, and contribute full role and trait bonuses.";
  }
}

function formatMissionKind(kind?: Mission["kind"]) {
  switch (kind) {
    case "scavenge":
      return "Scavenge run";
    case "rescue":
      return "Rescue run";
    case "cache":
      return "Cache pull";
    case "breach":
      return "Breach op";
    default:
      return "Unknown route";
  }
}

function describeMissionTeamPressure(team: DeadGridState["survivors"]) {
  if (team.length === 0) {
    return "No route crew";
  }

  const readyCount = team.filter((survivor) => survivor.status === "ready").length;
  const fatiguedCount = team.filter((survivor) => survivor.status === "fatigued").length;

  if (fatiguedCount === 0) {
    return "Fresh route crew";
  }

  if (readyCount === 0) {
    return "Fully worn route crew";
  }

  return `${fatiguedCount} worn / ${readyCount} fresh`;
}

function describeDefenseRosterPressure(state: DeadGridState) {
  const frontline = state.survivors.filter(
    (survivor) => survivor.assignment === "defense" || survivor.assignment === "watchtower",
  );

  if (frontline.length === 0) {
    return "No frontline crew";
  }

  const readyCount = frontline.filter((survivor) => survivor.status === "ready").length;
  const fatiguedCount = frontline.filter((survivor) => survivor.status === "fatigued").length;
  const injuredCount = frontline.filter((survivor) => survivor.status === "injured").length;

  if (injuredCount > 0) {
    return `${injuredCount} injured on the line`;
  }

  if (fatiguedCount > 0 && readyCount === 0) {
    return "Frontline fully worn";
  }

  if (fatiguedCount > 0) {
    return `${fatiguedCount} worn / ${readyCount} fresh`;
  }

  return "Frontline fresh";
}

function describeDayEnemyPressure(day: number, threatLevel: DeadGridState["threatLevel"]) {
  if (threatLevel === "Critical") {
    return "Brutes / runners / blackout lanes";
  }

  if (day <= 1) {
    return "Walkers / runners";
  }

  if (day <= 3) {
    return "Heavy runner pressure";
  }

  return "Walkers / runners / brutes";
}
