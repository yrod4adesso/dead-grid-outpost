# Day Modifiers Spec

## Goal

Give each day a clearer tactical identity by introducing explicit day-level modifiers that shift one or two planning rules at a time.

This slice should make daily command feel less like the same loop with different numbers and more like a sequence of distinct operational situations.

## Why This Slice Now

The prototype now already has:

- explicit run lifecycle
- threat escalation
- survivor wear pressure
- event and task follow-up consequences

That means the run has memory and medium-term pressure.

The next missing layer is daily texture:

- the player should not only react to threat and roster state
- the day itself should ask a slightly different planning question
- planning should feel contextual before route and defense decisions start

## Scope

This slice includes:

1. Explicit `day modifier` state
2. One active modifier per day
3. Modifier effects that touch one or two systems only
4. Dashboard / defense / mission visibility
5. E2E coverage for persistence and surfacing

This slice does not include:

- broad route-family redesign
- large content expansion
- complex modifier combinations
- procedural stacking of many day effects

## User Outcomes

After this slice:

- day 5 can feel different from day 4 even before route choice
- the player can explain what today's special condition is
- route and defense decisions react to the current modifier

## Product Behavior

### Modifier Rules

The game should have exactly one active day modifier at a time.

Suggested first set:

- `Ration strain`
- `Ammo shortage`
- `Heavy fog`
- `Overcrowded infirmary`
- `Salvage window`

These modifiers should be short, readable, and affect one or two systems each.

### Effect Philosophy

Modifiers should not act like a second threat system.

They should:

- create a temporary planning question
- be understandable from one sentence
- stay narrow enough that the player can adapt

Examples:

- `Ration strain`
  - increases food pressure on safer routes or support actions

- `Ammo shortage`
  - makes high-burn route approaches or defense prep more expensive

- `Heavy fog`
  - worsens route intel and shifts defense copy toward visibility problems

- `Overcrowded infirmary`
  - weakens recovery efficiency for the day

- `Salvage window`
  - improves scrap upside on selected routes

## State / Architecture Changes

### New State Layer

Add explicit day-modifier state to `DeadGridState`.

Suggested shape:

- `activeDayModifier: DayModifier | null`

Suggested type:

- `id`
- `label`
- `detail`
- `effectType`
- effect payload

The model should be serializable and stable across save/load.

### Generation Rule

Recommended first rule:

- generate one modifier when a new successful day begins
- keep it fixed through that whole day
- replace it on the next successful day transition

### Effect Hooks

The initial modifier set should affect at least:

1. mission planning or route copy
2. defense briefing or recovery / resource behavior

Only one modifier needs to affect a given system at once.

## UI Changes

Recommended surfacing:

1. Commander header
   - today's modifier name and one-line explanation

2. Mission board / selection panel
   - if the modifier affects routes, show the effect there

3. Defense gate
   - if the modifier affects defense or recovery, show it in the briefing

4. Summary / activity log
   - note when a new modifier becomes active

The player should never need to infer the modifier from hidden math alone.

## Acceptance Criteria

### State

- Each active day can have one explicit modifier
- The modifier persists across reload
- A new successful day can replace the previous modifier

### Gameplay

- At least three concrete modifiers exist
- At least two gameplay systems are affected across the implemented set
- The modifier changes behavior, not only flavor text

### UX

- The current modifier is visible from the dashboard
- Route or defense panels explain modifier impact when relevant

### Regression Safety

- Threat / wear / follow-up systems still work
- Existing E2E tests stay green

## Test Plan

Add or extend Playwright coverage for:

1. modifier persists across reload
2. modifier is visible on landing resume -> continue path
3. modifier affects relevant route or defense copy

Use deterministic localStorage shaping when needed to avoid brittle path setup.

## Implementation Tasks

### Task 1: Modifier State Model

- add serializable day-modifier type
- add it to `DeadGridState`
- normalize and hydrate safely

### Task 2: Modifier Generation

- generate a modifier for new days
- keep it stable for the active day

### Task 3: Modifier Gameplay Hooks

- connect modifiers to route and/or defense behaviors
- keep effects small and legible

### Task 4: UI Surfacing

- show current modifier in dashboard
- show targeted impact in mission / defense panels

### Task 5: E2E Coverage

- add persistence + visibility checks

## Risks

- Too many simultaneous effects will blur the loop
- If modifiers are too weak, they will feel decorative
- If modifiers overlap too much with threat, the systems will feel redundant

## Recommended Delivery Order

1. Modifier state model
2. Generation
3. Route / defense hooks
4. UI surfacing
5. E2E coverage

## Definition Of Done

This slice is done when:

- each day can carry one clear modifier
- the modifier changes planning in a visible way
- the modifier persists cleanly across save/load
- the player can explain today's special condition from the UI alone
