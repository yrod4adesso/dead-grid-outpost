# Dead Grid Outpost -> Last Z Clone Gap Plan

## Goal

Turn `dead-grid-outpost` from a systems-first survival prototype into a much fuller `Last Z`-style product with stronger retention, broader progression, clearer base fantasy, and more market-ready presentation.

This is not a rewrite plan.

It is a focused roadmap for closing the biggest product gaps between the current playable prototype and a more complete clone-level experience.

## Current Reality

The project already has a real playable loop:

- start or continue a run
- manage the outpost
- choose missions, events, and tasks
- recruit and assign survivors
- survive night defense
- resolve summary or defeat
- continue across multiple days with persistence

It also already has:

- threat and survivor pressure
- follow-up consequences
- day modifiers
- route role diversity
- special nights
- broader mission, event, and task pools
- deeper recruit and survivor variety
- end-to-end regression coverage

That means the foundation is no longer the problem.

The gap is now product depth, fantasy strength, pacing, and presentation.

## What Still Separates It From A Full Last Z-Style Clone

The current build is still missing several high-value layers that make games in this category feel complete:

1. long-term meta progression outside a single run
2. stronger base-building fantasy and room dependency
3. wider combat breadth and clearer power growth
4. higher-impact commander / hero / specialist progression
5. campaign structure with chapters, goals, and unlock arcs
6. stronger reward cadence, chest-like payout rhythm, and retention hooks
7. more polished onboarding, readability, and feedback
8. a much richer visual and juice layer

## Product Principle

Do not try to imitate everything at once.

Build toward clone-level completeness in this order:

1. progression depth
2. base fantasy
3. combat breadth
4. productized pacing
5. presentation polish

This keeps the current prototype intact while adding the systems that create the addictive structure people expect from `Last Z`.

## Block 1: Meta Progression Layer

### Why This Matters

Right now most value lives inside a single run.

A full clone-level product usually gives the player reasons to come back even after failure through permanent growth, unlock tracks, or account-level progression.

### Scope

- Add account-level or profile-level progression outside the active run
- Introduce a persistent currency or blueprint shard economy
- Add permanent unlock tracks for:
  - building tiers
  - commander perks
  - recruit pool expansion
  - support ability upgrades
  - combat stat bands
- Add first-loss and repeat-run reward framing

### Acceptance Criteria

- Losing a run still advances the broader profile
- The player can point to at least one permanent growth axis after each run
- Later runs feel meaningfully different because unlock state changed

### Suggested First Slice

- persistent `profileProgress`
- one permanent currency
- one small research / tech tree
- one unlockable upgrade tier

## Block 2: Base-Building Fantasy

### Why This Matters

The current outpost is strategically useful, but it does not yet feel like a richer base-building fantasy.

In a full clone, rooms, upgrades, dependencies, and visual hierarchy make the shelter itself feel like the player's long-term project.

### Scope

- Expand building identity and specialization
- Add upgrade chains with prerequisites
- Introduce space or slot pressure
- Add room synergies such as:
  - infirmary -> treatment throughput
  - workshop -> support item quality
  - command center -> recruit quality or route visibility
  - storage -> larger reward retention
  - watchtower -> early warning and defense prep
- Add building states that feel distinct across levels

### Acceptance Criteria

- Buildings are not only passive stat labels
- Upgrade order changes strategy
- The base feels like a growing structure, not just a dashboard of numbers

### Suggested First Slice

- prerequisite-based building tree
- one new strategic room
- stronger level-based building hooks

## Block 3: Combat Breadth And Power Curve

### Why This Matters

Night defense already exists, but a fuller clone needs stronger enemy variety, more power-expression, and a more satisfying growth curve.

### Scope

- Add more enemy archetypes
- Add broader support ability progression
- Add clearer weapon / turret / lane-defense upgrades
- Add special combat events inside waves
- Add stronger win/loss variation tied to preparation
- Increase visible relationship between daytime choices and nighttime power

### Acceptance Criteria

- Defense on day 8 does not feel like day 2 with bigger numbers
- Different prep styles produce visibly different combat outcomes
- The player can build toward at least two different defense strengths

### Suggested First Slice

- two new enemy archetypes
- support ability upgrade tiers
- stronger day-prep -> combat stat hooks

## Block 4: Commander / Hero / Specialist Layer

### Why This Matters

Recruit variety improved the crew, but a clone-level product usually has a more central aspirational unit layer: heroes, commanders, or rare specialists with stronger identity and upgrade paths.

### Scope

- Add one named high-impact progression unit class
- Give them levels, equipment, perks, or star-style upgrades
- Let them affect both daytime and defense systems
- Create rarity and aspiration around acquiring or improving them

### Acceptance Criteria

- At least one survivor class feels exceptional rather than interchangeable
- Players can invest in a favorite long-term unit
- This layer changes strategy beyond simple stat gain

### Suggested First Slice

- `Commander` unit type
- 3 perk branches
- persistent commander progression between runs

## Block 5: Campaign Structure And Unlock Arcs

### Why This Matters

The current build is a repeating survival loop.

A full clone usually also has broader structure: stages, chapters, regions, boss gates, or milestone goals that give medium-term direction.

### Scope

- Add chapter or district progression
- Add milestone objectives
- Add unlock-gated content bands
- Add tougher checkpoint nights or boss-style events
- Add map progression framing beyond a single shelter loop

### Acceptance Criteria

- The player has a clear medium-term target, not only survive-one-more-day pressure
- New content unlocks in a structured arc
- Chapter completion feels materially different from one more successful day

### Suggested First Slice

- chapter map with 3 milestone gates
- one checkpoint defense
- unlock rules for later content pools

## Block 6: Reward Cadence And Retention Hooks

### Why This Matters

Prototype loops often have correct systems but weak reward cadence.

Clone-level products are sticky because rewards arrive in a paced, readable, escalating rhythm.

### Scope

- Add clearer reward reveals and payout beats
- Add milestone rewards, crates, caches, or card-like bundles
- Add daily / chapter / streak style objectives if desired
- Add anticipation surfaces for upcoming unlocks
- Add clearer scarcity / spend decisions

### Acceptance Criteria

- The player expects and chases the next reward beat
- Rewards are not only raw resources in a flat list
- Spend vs save tension is stronger across multiple sessions

### Suggested First Slice

- chapter reward chest
- visible next-unlock teaser
- one optional objective track

## Block 7: UX Productization

### Why This Matters

The systems now carry real complexity, but the game still reads like a polished prototype rather than a full consumer product.

### Scope

- stronger onboarding
- clearer panel hierarchy
- better locked-action explanations
- more compact but richer summaries
- better tooltips and reason surfacing
- clearer resource deltas before confirming decisions
- stronger pacing in landing, victory, defeat, and resume flows

### Acceptance Criteria

- A new player can understand why they won or lost
- The dashboard remains readable even as systems expand
- Important decisions become easier to parse at a glance

### Suggested First Slice

- first-session tutorial prompts
- clearer action cost previews
- threat / survivor / modifier summary strip

## Block 8: Visual, Audio, And Feedback Layer

### Why This Matters

This is the biggest difference between "working prototype" and "clone-feeling product".

Without a stronger presentation layer, the systems can be good but still feel smaller than the target reference.

### Scope

- stronger visual theme and UI hierarchy
- more motion and screen-state transitions
- richer combat hit feedback
- room / building progression visuals
- iconography for traits, statuses, and resources
- audio hooks if the project later allows it

### Acceptance Criteria

- The game feels more alive before the player studies the numbers
- Progression is visible, not only textual
- Combat, rewards, and upgrade beats feel satisfying

### Suggested First Slice

- upgrade the visual system for dashboard and combat HUD
- add iconography for core systems
- add key feedback animations for combat and reward beats

## Recommended Build Order

### Phase 1

- Meta Progression Layer
- Base-Building Fantasy

Reason:

These are the two biggest missing pillars if the goal is a true clone-level product rather than a deeper prototype.

### Phase 2

- Combat Breadth And Power Curve
- Commander / Hero / Specialist Layer

Reason:

Once long-term progression exists, combat and roster aspiration become much more meaningful.

### Phase 3

- Campaign Structure And Unlock Arcs
- Reward Cadence And Retention Hooks

Reason:

These layers turn the game from a run simulator into a more productized loop with medium-term goals.

### Phase 4

- UX Productization
- Visual, Audio, And Feedback Layer

Reason:

Polish lands best after the high-value systems are stable enough to surface clearly.

## Immediate Next Spec Recommendation

If the goal is to move toward a real `Last Z`-style clone fast, the next block should be:

## `Meta Progression Layer`

It creates the biggest product leap per unit of code because it changes how failure, repeat runs, unlocks, and retention all feel at once.

### First Task Breakdown

1. Define persistent profile data separate from active run state
2. Add one permanent currency earned from run outcomes
3. Add one small tech tree or research board
4. Connect one existing building or support system to profile unlocks
5. Add persistence, surfacing, and deterministic tests

## Non-Goals For Now

- full monetization systems
- guilds, PvP, or alliance layers
- backend account sync
- large art production pipeline
- total combat rewrite

These can come later if the project keeps growing, but they are not required to cross the gap from prototype to strong clone-style product.

## Definition Of Success

This roadmap succeeds when:

- the game no longer feels like one good run loop with extra systems
- the player has reasons to care across runs, not only within runs
- base growth, roster aspiration, and combat progression reinforce each other
- the product begins to feel like a complete survival game rather than a well-built prototype
