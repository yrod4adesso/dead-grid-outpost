# Route Pressure Diversity Spec

## Goal

Make route selection feel like a medium-term strategic choice instead of a short-term reward pick.

This slice should push route identities further apart so the player is not only asking "what pays best now?" but also "what kind of next day am I buying with this call?"

## Why This Slice Now

The prototype now already has:

- explicit run lifecycle
- stronger threat escalation
- survivor wear pressure
- follow-up consequences
- day modifiers

That means the game can already remember choices and carry pressure forward.

The next missing layer is route role separation:

- routes still resolve too close together strategically
- current route choice is often about payout tuning more than posture
- the loop wants clearer route identities before broad content expansion

## Scope

This slice includes:

1. Explicit route-role differentiation
2. At least four route pressure identities
3. Reward / wear / threat / follow-up hooks that differ by route role
4. UI surfacing so route identity is visible before launch
5. E2E coverage for route-role visibility and effect differences

This slice does not include:

- a major mission-board rewrite
- large new mission content packs
- recruit-specific route trees
- procedural route generation
- broad combat system redesign

## User Outcomes

After this slice:

- route selection feels more strategic across days
- support-style routes feel meaningfully different from high-burn scavenging
- some routes clearly trade immediate reward for lower future pressure
- the player can explain what each route is for before clicking launch

## Product Behavior

### 1. Route Roles

Each mission should carry a clear route role.

Suggested first set:

- `high_yield`
- `support`
- `threat_control`
- `rescue`

These are not just flavor labels. They should shape payout and pressure patterns.

### 2. Role Philosophy

Route roles should answer different planning questions:

- `high_yield`
  - strongest near-term scrap / food / ammo upside
  - higher survivor wear or higher threat carry-over

- `support`
  - lower immediate reward
  - steadier recovery, lower wear, or cleaner next-day posture

- `threat_control`
  - weaker raw payout
  - can reduce threat, soften defense pressure, or prevent escalation

- `rescue`
  - variable or modest resource payout
  - recruit, roster, or specialist-style upside

The point is not perfect balance in one pass.
The point is legible strategic separation.

### 3. Role Hooks

The first implementation should make route roles affect at least:

1. reward profile
2. wear / roster pressure
3. threat or follow-up pressure

Examples:

- `high_yield` routes may add extra wear or future pursuit pressure
- `support` routes may reduce strain or prepare recovery
- `threat_control` routes may reduce or stabilize threat
- `rescue` routes may improve recruit odds or create a positive follow-up

### 4. Mission Board Behavior

The mission board should tell the player what kind of route is being offered before launch.

That means route role must be surfaced in:

- route card copy
- mission selection panel
- approach / resolution preview when relevant

The player should not need to infer role from hidden math or only from the mission title.

## State / Architecture Changes

### New Mission Layer

Add an explicit route-role field to mission state / mission blueprints.

Suggested shape:

- `routeRole: RouteRole`

Suggested type:

- `high_yield`
- `support`
- `threat_control`
- `rescue`

This should remain serializable and stable across save/load.

### Resolution Hooks

Route role should be available during:

- mission rendering
- approach outcome preview
- final mission resolution
- follow-up generation if needed

The implementation should avoid duplicating role logic separately in many UI branches.

## UI Changes

Recommended surfacing:

1. Mission cards
   - route-role label
   - concise strategic description

2. Mission selection panel
   - current route role
   - one-line pressure summary

3. Resolution feedback
   - when a route role added wear, reduced threat, or scheduled a follow-up, say so clearly

4. Continue / summary context
   - no large new screen needed
   - activity log support is enough if the effect is already visible elsewhere

## Acceptance Criteria

### State

- Missions have an explicit role
- Route role survives save/load
- Route role is usable in preview and resolution logic

### Gameplay

- At least four route roles exist
- At least three gameplay systems differ across the implemented roles
- Choosing between at least two routes is no longer only a payout comparison

### UX

- Route role is visible before mission launch
- The player can understand the main trade-off from the UI
- Route-role impact is explained when it changes outcome pressure

### Regression Safety

- Threat, wear, follow-up, and day-modifier systems still work
- Existing E2E coverage stays green

## Test Plan

Add or extend Playwright coverage for:

1. route role is visible in mission selection UI
2. high-yield route shows stronger wear or pressure messaging
3. support or threat-control route shows reduced strain or threat benefit
4. role behavior survives reload when a run is resumed

Use deterministic localStorage shaping where needed to avoid brittle setup.

## Implementation Tasks

### Task 1: Route Role State Model

- add serializable route-role type
- attach it to mission data
- hydrate and normalize safely

### Task 2: Role Assignment

- map current mission set onto the first four route roles
- make the role visible in mission copy

### Task 3: Gameplay Hooks

- apply role-based reward / wear / threat / follow-up hooks
- keep first-pass effects readable and small

### Task 4: UI Surfacing

- surface role label and pressure summary on mission cards and selection panel
- make role effects visible in resolution text where relevant

### Task 5: E2E Coverage

- add route-role visibility and effect checks
- keep persistence expectations stable

## Risks

- If roles overlap too much, the slice will read as flavor instead of strategy
- If roles are too strong, the board may become a single obvious answer each day
- If role hooks duplicate threat and modifier logic poorly, route behavior will become hard to reason about

## Recommended Delivery Order

1. Route-role state model
2. Role assignment and UI labels
3. Gameplay hooks
4. E2E coverage

## Definition Of Done

This slice is done when:

- routes have visible strategic identities
- route choice changes more than immediate payout
- the player can read the main route trade-off before launch
- role behavior survives save/load and keeps existing systems stable
