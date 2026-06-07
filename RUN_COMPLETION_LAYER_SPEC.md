# Run Completion Layer Spec

## Goal

Turn the current MVP loop into a more complete run lifecycle by making continuation, aftermath, and terminal states explicit.

This slice should make the prototype feel less like a raw state container and more like a small playable run with a clear beginning, post-night resolution, and end condition.

## Why This Slice First

The current game already supports:

- starting a run
- planning the day
- resolving missions, tasks, recruits, and events
- playing night defense
- persisting state locally

What is still missing is the framing around those systems:

- the landing screen does not clearly present continuation as a first-class option
- night defense resolves directly back into the loop without a strong aftermath screen
- defeat does not yet feel like a full terminal run state

This is the highest-value product gap before adding more content.

## Scope

This slice includes:

1. Explicit `Continue run` on the landing screen
2. Post-defense summary screen
3. Defeat / `Run ended` terminal state
4. Playwright coverage for the new lifecycle paths

This slice does not include:

- new missions, recruits, or event content
- balancing overhaul
- onboarding/tutorial
- CI setup
- major combat mechanic changes

## User Outcomes

After this slice:

- a returning player can explicitly continue a saved run
- a player finishing night defense sees a readable summary before continuing
- a failed defense can end the run in a clear, intentional way
- the landing screen can cleanly branch between new run and continue run

## Product Behavior

### 1. Landing Screen With Continue

If local save data exists and represents an active run:

- show `Continue run`
- keep `Start new run`
- optionally surface a tiny status summary such as:
  - day number
  - threat level
  - last saved label

If no active run exists:

- show only `Start new run`

### 2. Post-Defense Summary

After night defense resolves:

- do not immediately drop the player back into the dashboard
- show an intermediate summary layer with:
  - result: victory or defeat
  - waves cleared
  - reward or loss summary
  - survivor or resource consequences worth highlighting
  - next state hint:
    - `Advance to day X` on victory
    - `Run ended` or `Return to landing` on defeat

The summary should act as the emotional handoff between combat and the next state.

### 3. Terminal Run State

If defeat is severe enough to end the run:

- enter a terminal state instead of silently returning to the loop
- show:
  - outpost lost / run ended messaging
  - final day reached
  - waves cleared or final defense result
  - CTA to return to landing
  - CTA to start a fresh run

The terminal state should clear the active-run path once acknowledged.

## State / Architecture Changes

### State Additions

The existing `DeadGridState` likely needs explicit lifecycle support beyond `phase`.

Candidate additions:

- `phase` expansion or a separate result phase for:
  - `landing`
  - `outpost`
  - `combat`
  - `summary`
  - `ended`
- `lastCombatSummary` may need to become richer or be reused as the source of the summary screen
- a flag or derived rule for whether saved state is resumable from landing

### Save Behavior

- active runs continue to save normally
- terminal acknowledged states should not behave like resumable active runs
- reset/new-run should still clear local state cleanly

## UI Components

Suggested component additions or refactors:

1. `LandingScreen`
   - support `Continue run`
   - support small save summary

2. `RunSummaryScreen`
   - reusable for post-defense aftermath
   - clear CTA to continue

3. `RunEndedScreen`
   - terminal summary
   - CTA to return to landing / start new run

The exact component names can change, but the state transitions should stay explicit.

## Acceptance Criteria

### Continue Run

- When saved active run data exists, landing screen shows `Continue run`
- Clicking `Continue run` restores the outpost state without starting over
- `Start new run` still creates a fresh run from the landing screen

### Post-Defense Summary

- A victory no longer returns directly from combat to the outpost dashboard
- The player first sees a readable summary state
- The summary clearly shows what changed and what comes next

### Terminal State

- A loss severe enough to end the run shows a dedicated run-ended state
- That state does not masquerade as a resumable active run
- Returning to landing does not auto-resume a dead run

### Persistence

- Reload on landing with active save still supports continuation
- Reload during summary or terminal handling behaves predictably
- Reset/new-run clears active resumable state

## Test Plan

Add Playwright coverage for:

1. `landing -> start new run`
2. `landing with save -> continue run`
3. `combat victory -> summary -> continue to next day`
4. `combat defeat -> terminal state -> return to landing`
5. `reset/new run` still clears resumable state correctly

If possible, structure tests so summary and terminal states can be reached deterministically without brittle manual combat play.

## Implementation Tasks

### Task 1: State Model

- Extend game lifecycle state to represent summary and ended states
- Define the conditions that transition combat into summary vs ended
- Ensure saved state hydration handles the new lifecycle shape

### Task 2: Landing Continue Flow

- Update landing screen to detect active saved run
- Add `Continue run` CTA
- Add compact saved-run info block

### Task 3: Victory Summary Screen

- Create the summary UI for successful night resolution
- Show result, key consequences, and continue CTA
- Route continue CTA back into the next day loop

### Task 4: Terminal Run-Ended Screen

- Create the terminal state UI
- Prevent defeated runs from behaving like active resumable runs
- Add clean exit back to landing

### Task 5: Persistence Rules

- Verify save/load semantics for active, summary, and ended states
- Ensure reset/new-run remains correct

### Task 6: Playwright Coverage

- Add tests for continue, summary, and terminal flows
- Keep the original MVP smoke green

## Risks

- If summary and terminal states are bolted onto the current `phase` model carelessly, save/load can become confusing
- If defeat conditions are underdefined, the terminal state may feel arbitrary
- If summary screens are too heavy, they will slow down the loop instead of clarifying it

## Recommended Delivery Order

1. State model for summary / ended
2. Landing `Continue run`
3. Victory summary screen
4. Terminal run-ended screen
5. Persistence cleanup
6. Playwright coverage

## Definition Of Done

This slice is done when:

- the landing screen explicitly supports continuation
- combat resolves through a readable aftermath screen
- defeat can produce a terminal run-ended state
- reset and resume semantics remain clean
- Playwright covers the new lifecycle paths
