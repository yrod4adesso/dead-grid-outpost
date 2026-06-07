# Dead Grid Outpost Missing Features Plan

## Goal

Capture the next missing features for `dead-grid-outpost` in a durable plan so implementation can continue without losing scope, priorities, or acceptance intent.

## Current Product Snapshot

The current prototype already includes:

- Start screen with local save resume behavior
- Outpost dashboard with building summaries and upgrades
- Resource economy with visible pressure
- Mission, event, recruit, and task flows
- Night defense combat phase
- Persistent browser-local save state
- Basic end-to-end smoke coverage

Current gaps are less about raw MVP existence and more about progression depth, run structure, and release hardening.

## Priority Order

1. Run Completion Layer
2. QA and persistence hardening
3. Core progression depth
4. Content expansion
5. UX productization and docs

## P1: Run Completion Layer

### Problem

The game loop works, but the run still feels like a state machine instead of a full run lifecycle. The player can act, but the product does not yet strongly frame continuation, failure, or completion.

### Scope

- Add an explicit `Continue run` entry path on the landing screen when save data exists
- Add a clearer `Run ended` / `Outpost lost` state after meaningful defeat
- Add a `Day summary` or `Night summary` handoff after defense resolution
- Make run transitions feel intentional instead of implicit

### Acceptance Criteria

- A saved run is visible as something the player can continue, not only auto-resume
- A failed or ended run has a readable terminal state
- The player sees a short summary after night resolution before dropping back into the next loop
- The flow from day planning to combat to aftermath is easy to follow

## P1: QA And Persistence Hardening

### Problem

The current test surface proves only a small MVP path. The product now needs stronger regression protection around the real interaction paths.

### Scope

- Add Playwright coverage for:
  - resume / reset
  - recruit flow
  - day event resolution
  - task completion
  - defeat / run-end behavior
- Verify local save persistence across multi-step flows
- Optionally add CI for `lint`, `build`, and `test:e2e`

### Acceptance Criteria

- Core interaction paths have deterministic E2E coverage
- Save/load survives reloads across multiple state transitions
- A future feature pass can be validated without relying only on manual playtesting

## P1: Core Progression Depth

### Problem

The systems exist, but medium-term consequences are still light. Many choices resolve immediately and do not yet create enough long-tail pressure.

### Scope

- Make threat escalation more visible across days
- Increase medium-term consequences on survivors and resources
- Let event and task outcomes create follow-up pressure or opportunities
- Strengthen the feeling that later days are materially different from early days

### Acceptance Criteria

- Day 3+ feels different from day 1 beyond numbers alone
- Survivor and resource decisions create visible downstream effects
- The player has to adapt strategy rather than only repeat the same loop

## P2: Content Expansion

### Problem

The prototype loop is working, but replay variety is still limited.

### Scope

- Add more mission variants
- Add more event chains and follow-up events
- Add more recruit archetypes and trait combinations
- Add more task variants
- Add special nights or spike encounters

### Acceptance Criteria

- Repeated runs surface meaningfully different combinations of choices
- The player sees more than a small repeating pool of scenarios
- Build and crew composition matter more over time

## P2: UX Productization

### Problem

The UX is much better than the initial MVP, but it still behaves like a strong prototype rather than a polished small game.

### Scope

- Add a light onboarding layer for the day loop
- Improve action availability feedback for locked or exhausted choices
- Refine the run log / activity feed for readability
- Tighten state summaries and outcome messaging

### Acceptance Criteria

- New players can understand the loop without guessing
- Locked and unavailable actions are clearly explained
- Important feedback is scannable during and after each phase

## P2: Docs And Repo Polish

### Problem

The repo is now public, but the docs still read like boilerplate and do not represent the actual product.

### Scope

- Replace the generated README with a real project overview
- Document controls, setup, testing, and current scope
- Add a short roadmap section
- Clarify prototype status and next milestones

### Acceptance Criteria

- A new developer understands what the game is and how to run it
- The repo reflects the actual project instead of default Next.js scaffolding

## Recommended Implementation Sequence

### Phase 1

- Run Completion Layer
- Reset / continue / summary UX
- Defeat / terminal run handling

### Phase 2

- QA and persistence hardening
- Expand E2E coverage
- Stabilize regression checks

### Phase 3

- Core progression depth
- More visible strategic consequences

### Phase 4

- Content expansion
- More variety in missions, events, recruits, and nights

### Phase 5

- UX productization and docs pass

## Suggested First Build Slice

If implementation starts immediately, the first slice should be:

1. Explicit `Continue run` on landing
2. Post-defense summary screen
3. Defeat / run-ended state
4. Playwright coverage for those flows

This gives the prototype a more complete run loop before expanding content.

## Notes

- The highest-value missing feature is not visual polish; it is stronger run structure
- The highest engineering risk is thin regression coverage
- Content expansion should come after the run lifecycle feels complete enough to carry it
