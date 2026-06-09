# Deeper Recruit / Survivor Variety Spec

## Goal

Make roster-building matter more by deepening survivor identity, recruit profile variety, and role-specific crew value inside the systems that already exist.

This slice should not add a new progression layer or a full class system.
It should make the current survivor, recruit, mission, assignment, and defense loops produce more distinct roster decisions.

## Why This Slice Now

The prototype now already has:

- explicit threat and survivor pressure
- follow-up consequences
- special nights
- larger mission, event, and task pools
- persistent recruitment and survivor assignment

That means the game now has enough surrounding pressure for roster identity to matter more.

The next missing value is not more raw content alone.
It is stronger crew differentiation:

- recruits currently vary, but many decisions still collapse into "take the affordable candidate"
- survivor traits exist, but roster composition is still lighter than the surrounding systems
- mission, outpost, and defense preparation should care more about who is in the crew, not only how many units exist

## Scope

This slice includes:

1. More differentiated survivor traits
2. Stronger role/archetype distinction by recruit profile
3. Broader recruit-candidate variety across days
4. At least one higher-impact later-run recruit pattern
5. UI surfacing so the player can read why a recruit or survivor matters
6. E2E coverage for at least one new recruit/survivor path

This slice does not include:

- a permanent leveling system
- equipment inventories per survivor
- relationship simulation
- specialist ability buttons inside combat
- a broad rewrite of assignment or treatment systems

## User Outcomes

After this slice:

- recruit choices feel strategic instead of mostly economic
- different crews favor different route and defense styles
- the roster panel communicates more than role plus status
- later-run candidates can create real trade-offs instead of just better numbers

## Product Behavior

### 1. Trait Expansion

The current trait set should become broader and more role-shaped.

Recommended first pass:

- add several new traits across all existing roles
- keep traits readable and short
- ensure traits map to existing systems rather than hidden flavor

Good examples:

- `fighter`
  - better manual burst timing
  - shield duration
  - reduced frontline wear under certain pressures
- `scavenger`
  - route yield shaping
  - lower cost on selected route types
  - better support-route efficiency
- `medic`
  - treatment efficiency
  - better triage recovery
  - cleaner worn-crew support
- `builder`
  - better watchtower / storage / barricade value
  - stronger defense prep support
  - improved task or structure-side throughput

### 2. Recruit Profile Variety

Recruit candidates should feel more like profiles and less like interchangeable role tokens.

Recommended first pass:

- widen the recruit trait pool
- vary recruit costs more meaningfully
- vary recruit availability copy and value framing
- allow candidates to signal "safe utility", "route upside", or "defense upside"

This should make the recruitment board feel like a planning board, not only a purchase list.

### 3. Rarer Or Higher-Impact Candidates

Later days should occasionally surface recruits that are more memorable than the baseline pool.

Recommended first pass:

- introduce one lightweight "specialist-style" recruit pattern after the early game
- do not create a new rarity UI system unless necessary
- keep the distinction visible through trait, cost, and bonus framing

Examples:

- more expensive candidate with unusually strong defense trait
- support candidate with route-role synergy
- medic candidate who changes recovery economics

### 4. Stronger System Hooks

The new recruit/survivor variety should plug into systems that already exist.

Good targets:

- mission approach reward/cost shaping
- assignment-derived outpost stats
- treatment cost or recovery value
- defense prep / lane-defense perk shaping
- recruit-board widening effects from routes and events

The point is not more abstract stats.
The point is more visible crew identity.

## State / Architecture Changes

### Keep The Model Light

Prefer extending the existing survivor and recruit data model over inventing a new progression tree.

Good targets:

- recruit generation helpers
- trait pools by role
- trait effect label generation
- derived stats and mission-approach hooks

Avoid:

- nested talent trees
- trait stacking systems that require new persistence complexity
- multiple parallel survivor currencies

### Trait Readability

Trait behavior should stay explainable in one line of UI copy.

If a trait becomes too complex to summarize clearly, it is too complex for this slice.

## UI Changes

This slice should need only moderate UI changes:

1. Survivor cards
   - clearer trait effect language
   - better signal for what a survivor is good at

2. Recruitment board
   - more distinct candidate framing
   - stronger difference between routine and higher-impact recruits

3. Mission / defense planning panels
   - visible crew upsides where relevant
   - clearer explanation of why one team is better suited to a route or defense

No major layout rewrite is required unless a specific trait surfacing need makes it unavoidable.

## Acceptance Criteria

### Variety

- The trait pool is meaningfully broader than the current baseline
- Recruit candidates do not feel interchangeable across repeated runs
- At least one later-run recruit pattern feels distinct from routine candidates

### Strategy

- Roster composition matters more than raw headcount
- Recruit decisions feel more strategic than "buy the cheapest useful role"
- Different crews support different route, assignment, or defense styles

### Regression Safety

- Existing survivor assignment, treatment, mission, recruit, and defense systems still work
- Existing E2E coverage remains green

## Test Plan

Add or extend Playwright coverage for:

1. at least one new recruit profile appearing on the recruitment board
2. at least one differentiated recruit / trait path affecting visible gameplay output
3. persistence of the surfaced recruit/survivor value where relevant

Use localStorage shaping when deterministic setup is easier than waiting for candidate rotation.

## Implementation Tasks

### Task 1: Trait Pool Expansion

- add more traits across current survivor roles
- ensure each role gets clearer identity bands

### Task 2: Recruit Generation Expansion

- widen recruit-profile generation
- vary costs, bonus labels, and availability framing more clearly

### Task 3: System Hook Integration

- connect new recruit/survivor variety to mission, assignment, treatment, or defense logic
- keep the effects visible and readable

### Task 4: Later-Run High-Impact Recruit Pattern

- add at least one memorable later-run candidate style
- keep the implementation light and state-safe

### Task 5: UI Surface And E2E Coverage

- improve recruit/survivor readability in the UI
- add deterministic tests for one or more new paths

## Risks

- If the traits are only cosmetic, the slice will not change roster decisions
- If the traits are too hidden, the player will not trust the system
- If recruit profiles become too strong too early, later balance will flatten
- If later-run candidates are too rare, the slice will feel smaller than intended

## Recommended Delivery Order

1. trait pool expansion
2. recruit generation expansion
3. system-hook integration
4. later-run high-impact recruit pattern
5. UI surface and E2E coverage

## Definition Of Done

This slice is done when:

- the roster has clearer identity and strategic shape
- recruit choices feel meaningfully different across runs
- role and trait combinations affect visible planning outcomes
- the deeper recruit/survivor layer lands without destabilizing the existing loop
