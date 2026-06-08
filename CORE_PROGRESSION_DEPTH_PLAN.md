# Core Progression Depth Plan

## Goal

Make later days feel meaningfully different from early days by increasing medium-term consequences across threat, survivors, resources, and route decisions.

The current prototype has a working loop, but many outcomes resolve immediately and then disappear into the next cycle. This plan focuses on adding depth without opening a large content explosion first.

## Why This Is The Next Feature Block

The project now already has:

- explicit start / continue flow
- victory summary
- terminal defeat state
- persistence and regression coverage

That means the run lifecycle is in place.

The next missing value is not another framing feature. It is stronger long-tail pressure:

- day 4 should not feel like day 1 with larger numbers
- survivors should carry more memory of what happened to them
- events and tasks should create follow-up situations
- threat should feel like an evolving layer, not just a label

## Features To Implement

### 1. Threat Escalation Layer

#### Current Gap

`threatLevel` exists, but it is still relatively light and mostly acts as flavor around day count.

#### Feature

Introduce explicit escalating threat states that affect the run more visibly.

Suggested ladder:

- `Watching`
- `Escalating`
- `Critical`
- `Breached`

Suggested effects:

- stronger mission enemy hints
- more dangerous night modifiers
- higher chance of punishing day events
- more expensive recovery pressure in later days

#### Outcome

The player should feel mounting pressure as days advance, even before combat begins.

### 2. Persistent Survivor Wear

#### Current Gap

Survivors can be `ready`, `fatigued`, or `injured`, but the medium-term consequences are still limited.

#### Feature

Deepen survivor wear so repeated missions and defenses shape the next days more strongly.

Suggested additions:

- fatigue carries forward more consistently
- repeated use of the same survivors becomes riskier
- low-readiness survivors reduce route confidence or combat efficiency
- treatment choices become more strategically meaningful

#### Outcome

The player should rotate personnel instead of always using the same optimal units.

### 3. Event And Task Follow-Up Consequences

#### Current Gap

Events and tasks mostly resolve in the moment, then disappear.

#### Feature

Allow selected event/task outcomes to schedule next-day pressure or opportunities.

Suggested examples:

- event decision creates a follow-up event next day
- ignored task increases threat or supply loss
- specific task completion reduces later night pressure
- recruit- or event-related choice unlocks or alters a route

#### Outcome

The player should feel that small decisions have memory.

### 4. Day Modifiers And Run Texture

#### Current Gap

The loop is readable, but daily texture is still limited.

#### Feature

Introduce explicit day-level modifiers that change planning context.

Suggested examples:

- ration strain
- ammo shortage
- heavy fog
- overcrowded infirmary
- salvage window

These should affect one or two systems at a time rather than everything at once.

#### Outcome

Each day should ask a slightly different planning question.

### 5. Route Pressure Diversity

#### Current Gap

Routes rotate, but their strategic role is still close together.

#### Feature

Push route identities further apart.

Suggested route classes:

- high-reward scavenging with higher survivor wear
- safer support routes with lower immediate reward
- threat-reduction routes
- rescue or specialist unlock routes

#### Outcome

Choosing a route should become a strategic decision about the next days, not only the next reward payout.

## Recommended Implementation Order

### Phase 1: Threat + Survivor Consequences

Build first:

1. stronger threat ladder
2. clearer survivor wear carry-over
3. visible effect hooks into missions and defense

Why first:

- highest systemic value
- smallest content footprint
- easiest to feel immediately in playtesting

### Phase 2: Follow-Up Consequences

Build next:

1. event outcomes that create next-day state
2. tasks that reduce or increase later pressure

Why second:

- gives the loop memory
- increases decision weight without needing many new assets

### Phase 3: Day Texture

Build after:

1. day modifiers
2. route role differentiation

Why third:

- best once the system already has deeper pressure rules to modify

## Slice Recommendation

The best next implementation slice is:

## Slice A: Threat And Survivor Pressure

### Included

- stronger threat escalation tiers after repeated days
- visible gameplay effect from higher threat
- more persistent fatigue / injury impact on available teams
- UI copy updates so the player understands the pressure

### Excluded

- new content chains
- major new events
- major route set expansion

### Acceptance Criteria

- later days impose visibly different planning constraints than day 1
- survivor status matters more when choosing mission teams
- threat is felt in gameplay, not only shown as text
- existing tests still pass

## Implementation Tasks

### Task 1: Threat Model

- define the exact thresholds for `Watching`, `Escalating`, `Critical`, `Breached`
- connect threat to at least two gameplay systems
- ensure the level is visible in the UI and summary screens

### Task 2: Survivor Wear Rules

- increase persistence of fatigue and injury consequences
- ensure treatment and rotation have clear strategic value
- prevent the same optimal team from being costless across many days

### Task 3: Mission / Defense Hooks

- make route resolution and/or night defense react to the stronger threat model
- keep the behavior readable rather than hidden

### Task 4: UX Surface

- update threat / survivor-related copy
- show why a unit is risky or why a day is harder

### Task 5: Test Coverage

- add E2E or deterministic state-based tests for:
  - higher-day threat visibility
  - fatigue / injury carry-over relevance
  - non-resumable defeat behavior staying intact

## Risks

- too many coupled changes at once will make balancing noisy
- invisible systemic changes will feel unfair instead of deep
- if fatigue becomes too punitive too quickly, the run may stall instead of deepen

## Design Constraints

- add pressure, not confusion
- prefer a few visible system links over many hidden modifiers
- keep the MVP loop readable
- do not open broad content expansion before the systemic depth is working

## Definition Of Done

This feature block is successful when:

- later days feel materially more dangerous
- survivor management becomes more strategic over time
- short-term decisions create clearer medium-term trade-offs
- the player can explain why a run got harder
