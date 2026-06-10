# Meta Progression Layer Spec

## Goal

Add a persistent profile-level progression layer that survives run failure and makes repeat runs feel like forward movement instead of full resets.

This slice should not require a backend.
It should build on the existing browser-local persistence model and keep the current run loop intact.

## Why This Slice Now

The prototype now already has:

- a full run loop with start, continue, victory summary, and terminal defeat
- browser-local persistence for the active run
- threat, survivor pressure, follow-up consequences, day modifiers, and special nights
- broader mission, event, task, and recruit variety

That means the game now supports meaningful runs.

The next missing value is long-term return motivation:

- losing a run still feels too close to a total reset
- the player has little account-level reason to re-enter after failure
- the current systems have enough depth to benefit from unlocks that carry across runs

This is the highest-value bridge from "good prototype loop" to "full product structure".

## Scope

This slice includes:

1. A persistent profile progression model outside `DeadGridState`
2. One permanent currency earned from run outcomes
3. A small first unlock tree or research board
4. At least one unlock hook into existing outpost or combat systems
5. Landing and outpost UI surfacing for profile progress
6. Persistence and E2E coverage for the new profile layer

This slice does not include:

- backend accounts or cloud sync
- monetization systems
- large multi-page meta menus
- hero equipment inventories
- guild, PvP, or alliance systems
- a broad rewrite of the active run loop

## User Outcomes

After this slice:

- failure still grants meaningful long-term progress
- the player has a clear reason to start another run
- repeated runs can differ because the profile unlock state changes
- the outpost begins to feel like part of a broader campaign instead of a single isolated attempt

## Product Behavior

### 1. Separate Profile Layer

The game should keep two persistence layers:

1. active run state
2. persistent profile progress

The active run remains what `Continue run` resumes.

The new profile layer should survive:

- run victories
- run defeats
- manual fresh starts
- page reloads

It should not be wiped when the player resets only the current run.

### 2. Permanent Currency

Introduce one simple permanent currency.

Suggested framing:

- `Blueprint shards`
- `Command data`
- `Salvage intel`

Recommended behavior:

- earned at end-of-run moments and selected milestones
- higher days or stronger outcomes grant more
- defeat should still grant some amount
- visible enough that the player understands the meta reward

The first implementation should prefer clarity over economy complexity.

### 3. Small Unlock Tree

Add a compact first unlock board rather than a broad meta economy.

Recommended first categories:

- outpost infrastructure
- defense doctrine
- route intel

Recommended first unlock count:

- 3 to 5 unlock nodes total

Good first unlock examples:

- `Storage doctrine`
  - higher starting storage cap or cleaner early salvage retention

- `Field triage kits`
  - small starting treatment bonus or reduced early treatment friction

- `Watch rota drills`
  - slightly stronger early-night defense stats

- `Route scouting maps`
  - better early mission visibility, safer support route economics, or cleaner first-day route framing

The first slice should keep unlock effects small but real.

### 4. Unlock Hook Philosophy

The new profile layer should plug into systems that already exist.

Good targets:

- initial building state
- early starting resources
- treatment throughput
- support charges or defense prep quality
- route preview quality
- recruit-board quality or candidate variety

Avoid:

- adding a second full gameplay layer with separate rules
- unlocks that are so large they invalidate the current balance
- invisible bonuses with no UI explanation

### 5. Reward Timing

The profile reward loop should surface at clear moments.

Recommended first timing:

- defeat screen
- victory summary / day-advance summary when a milestone is hit
- landing screen with visible total profile currency

The player should understand:

- what they earned
- why they earned it
- what they can spend it on next

## State / Architecture Changes

### 1. New Profile Model

Add a separate serializable profile object.

Recommended shape:

- `version`
- `currency`
- `lifetimeRuns`
- `highestDayReached`
- `unlockedNodes`
- optional `lastEarnedCurrency`

Suggested type name:

- `DeadGridProfile`

This should not be nested inside `DeadGridState`.

It should be stored separately so:

- run reset does not clear profile progress
- save migration stays easier to reason about
- future profile growth does not bloat the active run state

### 2. Storage Layer

Extend the storage helpers with separate profile persistence.

Recommended direction:

- keep the current run save key for `DeadGridState`
- add a second localStorage key for `DeadGridProfile`
- add hydration and normalization rules for profile data

The profile layer should use versioning and safe fallbacks just like the run layer.

### 3. Runtime Store Integration

The store model will need a lightweight profile access path.

Recommended first pass:

- load profile on bootstrap
- expose getter for current profile snapshot
- expose updater for profile changes
- keep run and profile updates explicit rather than tightly coupled magic

This reduces confusion around:

- when run state changes
- when meta rewards are granted
- when permanent unlocks should apply

### 4. New-Run Application

Unlocks should apply when a fresh run is created, not by mutating a live run retroactively unless a specific unlock requires it.

Recommended behavior:

- `createNewGameState()` should accept or derive profile progress
- apply starting bonuses there
- keep the currently active run stable once started

This keeps profile progression legible:

- unlock now
- benefit starts next run

That is easier to explain and balance than live retroactive mutation.

## UI Changes

### 1. Landing Screen

Add visible profile-level progress on the landing screen.

Recommended surfacing:

- permanent currency total
- highest day reached
- small `Research` / `Upgrades` preview or button area

This should make the landing page feel like a campaign hub, not only a save-resume entry screen.

### 2. Defeat And Summary Surfacing

Add meta reward language to:

- terminal defeat state
- victory / aftermath screen when relevant

The player should never wonder whether the run contributed to long-term progress.

### 3. Outpost Dashboard

Add light visibility for unlocked profile bonuses during a run.

Examples:

- `Profile bonus active`
- small labels in building / defense / route panels

The UI should explain where the bonus is coming from, not only apply it silently.

### 4. Unlock Board

The first unlock board can stay compact.

It does not need to be a full-screen tech-tree production yet.

A simple panel or card group is enough if it clearly shows:

- node name
- cost
- effect
- unlocked / locked state

## Acceptance Criteria

### State

- The game has a separate persistent profile model
- Resetting or ending a run does not erase profile progress
- Profile data survives reload

### Progression

- Each run can grant permanent currency
- At least 3 unlock nodes exist
- At least 1 unlock affects actual gameplay in a visible way

### UX

- The landing screen shows profile progress
- Defeat or summary screens show permanent rewards earned
- Unlock effects are visible enough that players can understand them

### Regression Safety

- `Continue run` still only concerns the active run state
- Existing save/load behavior still works
- Existing run loop and E2E tests remain green

## Test Plan

Add or extend coverage for:

1. profile data persists across reload
2. run reset does not clear profile progress
3. defeat grants permanent currency
4. starting a new run after an unlock applies the expected bonus
5. existing continue-run behavior remains intact

Use deterministic localStorage shaping where helpful so the tests do not depend on long manual play setup.

## Implementation Tasks

### Task 1: Profile State Model

- define `DeadGridProfile`
- add defaults, normalization, and versioning
- add separate storage helpers

### Task 2: Reward Grant Rules

- define how much permanent currency a run grants
- connect reward grants to defeat and/or milestone summary points
- keep the first formula readable

### Task 3: Unlock Board

- define the first 3 to 5 unlock nodes
- implement cost, unlock status, and effect application
- keep the node effects small but clearly useful

### Task 4: New-Run Hook Integration

- apply unlocked bonuses to fresh runs
- surface the applied bonuses in UI copy where relevant

### Task 5: UI Surfacing

- landing screen profile panel
- defeat / summary permanent-reward surfacing
- compact unlock board presentation

### Task 6: E2E Coverage

- add deterministic profile persistence and unlock-application tests

## Risks

- If unlock effects are too small, the feature will feel cosmetic
- If unlock effects are too large, early-game balance will collapse
- If run and profile persistence blur together, reset behavior will become confusing
- If rewards are only shown at defeat, successful runs may feel oddly under-rewarded

## Recommended Delivery Order

1. profile model and storage
2. permanent currency grant rules
3. first unlock board
4. new-run bonus application
5. UI surfacing
6. E2E coverage

## Definition Of Done

This slice is done when:

- the player can fail a run and still make permanent progress
- at least one future run starts differently because of unlocked profile bonuses
- the game now has a clear campaign-level reason to replay
- the new meta layer lands without breaking the active run loop
