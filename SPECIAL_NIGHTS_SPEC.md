# Special Nights / Spike Encounters Spec

## Goal

Make night defense feel less predictable by introducing occasional special nights with one strong, readable rule twist.

This slice should not redesign combat.
It should make some nights stand out clearly enough that the player adjusts planning before pressing `Start night defense`.

## Why This Slice Now

The prototype now already has:

- explicit run structure
- threat escalation
- survivor wear pressure
- follow-up consequences
- day modifiers
- route-role diversity

That means the day loop has more strategic texture than before.

The next missing layer is night-phase variety:

- many nights still feel like the same combat handoff with different pressure numbers
- defense briefings already carry a lot of useful state, but not enough true encounter identity
- a small special-night layer can add variety without requiring a full combat rewrite

## Scope

This slice includes:

1. Explicit special-night state
2. Occasional special nights, not every day
3. A small first set of variants
4. Briefing and summary surfacing
5. Gameplay hooks into reward, lane pressure, support, or survival expectations
6. E2E coverage for at least one deterministic special-night path

This slice does not include:

- a full combat-system redesign
- new manual combat mechanics
- broad content expansion for day routes
- many stacked modifiers at once
- cinematic event sequences

## User Outcomes

After this slice:

- some nights feel clearly different before combat starts
- the player can explain what tonight's special rule is
- day planning has more meaning because tonight is not always “normal defense”
- night defense gains variety without becoming unreadable

## Product Behavior

### 1. Special-Night Rules

The game should support an optional night-level encounter variant.

Suggested first set:

- `brute_surge`
- `blackout_grid`
- `thin_supplies`
- `pursuit_spike`

Only one special night should be active at a time.

It should remain readable as a single headline rule, not as a large pile of combat modifiers.

### 2. Encounter Philosophy

Special nights should:

- appear occasionally rather than constantly
- ask a clear planning question
- affect one or two systems strongly
- be visible from the defense gate before combat starts

Examples:

- `brute_surge`
  - heavier frontline pressure
  - stronger brute emphasis
  - maybe better scrap reward for surviving

- `blackout_grid`
  - visibility gets worse than normal blackout behavior
  - targeting / lane-read messaging becomes harsher
  - support value shifts toward stability

- `thin_supplies`
  - lower support or reward comfort
  - resupply language becomes tighter
  - may reduce the night reward floor

- `pursuit_spike`
  - extra wave pressure or stronger pursuit framing
  - likely synergizes with recent noisy or high-yield choices

### 3. Activation Model

Recommended first rule:

- most nights are standard
- some days unlock a special-night variant based on:
  - day number
  - threat pressure
  - possibly recent route / follow-up pressure

The first implementation does not need a complex scheduler.
It only needs a deterministic and legible rule.

Examples:

- day 3+ can begin spawning special nights
- critical threat can bias toward `pursuit_spike` or `brute_surge`
- blackout-adjacent pressure can bias toward `blackout_grid`

### 4. Gameplay Hooks

The initial slice should make special nights affect at least two of:

1. combat blueprint labels
2. enemy mix or wave framing
3. support / healing / recovery expectations
4. reward framing
5. summary / aftermath text

The goal is not simulation depth.
The goal is clear encounter identity.

## State / Architecture Changes

### New State Layer

Add explicit special-night state to `DeadGridState`.

Suggested shape:

- `activeSpecialNight: SpecialNight | null`

Suggested type:

- `id`
- `label`
- `detail`
- `effectType`
- optional lightweight payload

This must be serializable and stable across save/load.

### Blueprint Integration

The special-night layer should integrate at `startNightDefense()`.

Recommended hooks:

- combat blueprint labels
- wave modifier / enemy mix framing
- reward preview adjustment if needed
- support / healing / lane-pressure text if needed

The system should compose with:

- threat level
- day modifiers
- route / follow-up systems

without creating unreadable combinations.

## UI Changes

Recommended surfacing:

1. Defense gate
   - explicit `Special night` row
   - one-line explanation in the briefing

2. Defense queued panel
   - if relevant, include the special-night label in the summary

3. Combat summary / aftermath
   - mention when the player survived or lost a special night

4. Continue run / landing
   - not required for the first slice unless the active save is already queued on a special night

The player should not discover a special night only after combat has started.

## Acceptance Criteria

### State

- A night can carry one explicit special-night variant
- The special-night state persists across reload
- The special-night can be absent on normal nights

### Gameplay

- At least two special-night variants exist
- A special night affects real encounter behavior or pressure messaging
- A special night changes planning, not only lore text

### UX

- The defense gate shows when tonight is special
- The player can tell what the special-night rule is before starting combat
- The aftermath reflects that the encounter was unusual

### Regression Safety

- Standard nights still work
- Threat, day modifiers, and route/follow-up systems still work together
- Existing E2E tests remain green

## Test Plan

Add or extend Playwright coverage for:

1. a deterministic saved state with an active special night
2. special-night visibility in the defense briefing
3. special-night state surviving reload + continue
4. optional summary / aftermath text if the first slice includes it

Use localStorage shaping where needed to keep setup deterministic.

## Implementation Tasks

### Task 1: Special-Night State Model

- add serializable special-night type
- add it to `DeadGridState`
- hydrate and normalize it safely

### Task 2: Activation Rule

- define a first deterministic special-night selection rule
- ensure standard nights still exist

### Task 3: Combat Blueprint Hooks

- connect special nights to defense blueprint labels and pressure
- add small reward / support / framing hooks where useful

### Task 4: UI Surfacing

- show the current special night in the defense gate
- make the special rule easy to scan

### Task 5: E2E Coverage

- add deterministic visibility / persistence coverage

## Risks

- If special nights overlap too heavily with threat or day modifiers, the systems will blur together
- If special nights are too frequent, they stop feeling special
- If the rule text is weak, the slice will feel cosmetic

## Recommended Delivery Order

1. Special-night state model
2. Activation rule
3. Combat blueprint hooks
4. UI surfacing
5. E2E coverage

## Definition Of Done

This slice is done when:

- some nights carry a clear special-encounter identity
- the player can see the special rule before combat starts
- the special-night state survives save/load
- the encounter meaningfully changes night planning without destabilizing the current loop
