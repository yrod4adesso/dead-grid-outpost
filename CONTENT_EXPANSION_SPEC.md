# Content Expansion Spec

## Goal

Increase run-to-run variety by expanding the content pool inside the systems that already exist.

This slice should not invent a new meta-layer.
It should make the current loop produce more varied boards, follow-ups, and planning situations with relatively low structural risk.

## Why This Slice Now

The prototype now already has:

- threat escalation
- survivor wear pressure
- follow-up consequences
- day modifiers
- route-role diversity
- special nights

That means the game systems are no longer the main bottleneck.

The next missing value is content density:

- repeated runs still recycle a compact mission/event/task pool too quickly
- the new systemic layers need more inputs to stay interesting
- content expansion can now build on stable mechanics instead of landing on top of a thin prototype

## Scope

This slice includes:

1. More mission variants within current route roles
2. More day-event blueprints and follow-up combinations
3. More outpost task variants
4. A slightly larger first special-night pool or special-night reuse patterns
5. E2E coverage for at least one newly expanded content path

This slice does not include:

- a new combat system
- broad recruit-system redesign
- procedural narrative generation
- major UI restructuring
- specialist recruit mechanics as a primary feature

## User Outcomes

After this slice:

- repeated runs show more different boards
- route choice feels less repetitive because route identity now has more than one expression
- events and tasks stop cycling through the same few situations too quickly
- special nights feel like part of a growing content pool instead of a one-off novelty

## Product Behavior

### 1. Mission Expansion

The current route-role model should gain more concrete mission expressions.

Recommended first pass:

- add at least one new blueprint for each existing route role
- keep the roles the same:
  - `high_yield`
  - `support`
  - `threat_control`
  - `rescue`
- vary:
  - reward mix
  - risk framing
  - zone flavor
  - route pressure copy

The point is not to double system complexity.
The point is to stop each role from being represented by only one route identity.

### 2. Event Expansion

The day-event layer should gain more situations and more follow-up diversity.

Recommended first pass:

- add at least 2 new event blueprints
- ensure at least one new event can create a different next-day consequence than the current set
- vary safe vs risky outcomes more clearly

This should deepen decision variety without needing full narrative chains yet.

### 3. Task Expansion

The outpost task layer should feel less static.

Recommended first pass:

- add at least 2 new task blueprints
- connect at least one of them to a follow-up effect
- keep task resolution simple and fast

Tasks should remain the low-risk momentum tool, but with more meaningful board variety.

### 4. Special-Night Pool Expansion

The special-night system should gain a bit more breadth or at least better reuse variety.

Recommended first pass:

- either add 1-2 more special-night variants
- or expand activation / reuse logic so existing variants appear in more distinct contexts

This is secondary to mission/event/task expansion, but still part of the same content-density goal.

## State / Architecture Changes

### Content First, Structure Light

This slice should prefer expanding existing blueprint arrays and selection logic over inventing a new content framework.

Good targets:

- `MISSION_BLUEPRINTS`
- `DAY_EVENT_BLUEPRINTS`
- `INITIAL_TASKS`
- special-night rotation or activation logic

If any helper extraction is needed for readability, keep it small and local.

### Selection Behavior

Content expansion should not simply append everything to the board at once.

It should:

- preserve a compact visible board
- increase the pool from which the board is drawn
- keep runs readable while improving variation

## UI Changes

This slice should need only light UI changes:

1. Mission board
   - more varied route names, zones, and pressure summaries

2. Day events
   - more varied titles and outcomes

3. Task queue
   - more varied task cards and effect labels

No major layout change is required unless a specific content addition demands it.

## Acceptance Criteria

### Content

- The mission pool is larger than the current one-route-per-role baseline
- The day-event pool is meaningfully larger
- The task pool is meaningfully larger
- At least one newly expanded content path hooks into an existing pressure system

### Variety

- Repeated runs are less likely to show the same early board
- Route, event, and task combinations feel less repetitive
- Existing progression systems receive more varied inputs

### Regression Safety

- Existing threat, modifier, follow-up, route-role, and special-night systems still work
- Existing E2E tests remain green

## Test Plan

Add or extend Playwright coverage for:

1. at least one new mission blueprint appearing and resolving correctly
2. at least one new event blueprint appearing and creating the intended effect
3. at least one new task blueprint appearing and resolving correctly

Use localStorage shaping when deterministic setup is easier than repeated random-seeming reruns.

## Implementation Tasks

### Task 1: Mission Blueprint Expansion

- add more mission blueprints inside current route roles
- keep role labeling and route summaries coherent

### Task 2: Event Blueprint Expansion

- add new event situations
- connect at least one of them to a distinct follow-up pattern

### Task 3: Task Blueprint Expansion

- add new tasks
- connect at least one of them to follow-up or pressure effects

### Task 4: Selection / Rotation Tuning

- ensure the board stays compact while drawing from the wider pool
- keep content spread readable

### Task 5: E2E Coverage

- add deterministic checks for one or more new content entries

## Risks

- If the board grows without selection tuning, the UI may feel bloated instead of varied
- If the new content is only cosmetic, the slice will not meaningfully improve replay value
- If too many new blueprints arrive at once, balancing signal may get noisy

## Recommended Delivery Order

1. Mission blueprint expansion
2. Event expansion
3. Task expansion
4. Selection tuning
5. E2E coverage

## Definition Of Done

This slice is done when:

- the visible board pulls from a meaningfully larger content pool
- repeated runs feel less repetitive
- the added content works with the current progression systems
- the expansion lands without destabilizing the existing loop
