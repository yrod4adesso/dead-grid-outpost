# Dead Grid Outpost Missing Features Plan

## Goal

Capture the remaining feature blocks for `dead-grid-outpost` in a durable roadmap that reflects the current shipped state instead of the earlier MVP gap list.

This file is now the top-level planning reference for what is still missing after the first major progression and QA passes landed on `main`.

## Current Product Snapshot

The current prototype already includes:

- explicit landing flow with `Start new run` and `Continue run`
- post-defense victory summary
- terminal `Run ended` state for defeats
- browser-local persistence with resumable-save rules
- Playwright regression coverage plus CI
- threat escalation with visible pressure tiers
- persistent survivor wear and readiness pressure
- event and task follow-up consequences
- day modifiers with route and defense hooks
- route pressure diversity with visible route roles
- public README and repo-level setup / test documentation

The product is no longer missing basic run structure.

The remaining gaps are now mostly about:

- encounter variety
- content depth
- stronger roster differentiation
- final UX productization

## Completed Blocks

These blocks are considered done at the roadmap level:

1. Run Completion Layer
2. QA And Persistence Hardening
3. Threat And Survivor Pressure
4. Follow-Up Consequences
5. Day Modifiers And Run Texture
6. Route Pressure Diversity
7. README And Base Repo Productization

## Remaining Priority Order

1. Special Nights / Spike Encounters
2. Content Expansion
3. Deeper Recruit / Survivor Variety
4. UX Productization
5. Docs And Repo Polish Follow-Up

## P1: Special Nights / Spike Encounters

### Problem

Night defense is now mechanically supported by several pressure systems, but the night phase itself still risks feeling too samey across multiple successful days.

### Scope

- Add occasional special nights with one strong rule twist
- Introduce a small first set such as:
  - brute surge night
  - blackout / visibility night
  - scarcity / thin supply night
  - pursuit / pressure-spike night
- Surface special-night rules clearly in the defense briefing
- Hook special nights into reward, wave pressure, or support expectations

### Acceptance Criteria

- At least two special-night variants can appear
- A special night changes player planning, not only flavor text
- The player can tell from the UI what tonight's special rule is
- Existing day modifiers and threat systems still behave coherently with the special-night layer

## P2: Content Expansion

### Problem

The structure is much deeper now, but the content pool is still relatively compact. Repeated runs will still recycle mission, event, and task combinations too quickly.

### Scope

- Add more mission variants inside each current route role
- Add more event chains or event follow-up combinations
- Add more task variants
- Add more route situations that play differently under threat / modifiers
- Expand the pool of special nights after the first slice lands

### Acceptance Criteria

- Repeated runs produce more clearly different boards
- Route, event, and task combinations do not recycle too quickly
- The new systemic layers have enough content to stay interesting over several runs

## P2: Deeper Recruit / Survivor Variety

### Problem

Survivor pressure is much better, but roster identity is still lighter than the surrounding systems now deserve.

### Scope

- Add more differentiated survivor traits
- Add stronger archetype distinctions by role
- Introduce more interesting recruit profiles and rarer candidate mixes
- Optionally add specialist or high-impact recruits later in the run

### Acceptance Criteria

- Roster composition matters more than raw headcount
- Recruit decisions feel more strategic
- Different crews support different route and defense styles

## P2: UX Productization

### Problem

The systems have grown faster than the onboarding and explanation layer. The game is understandable for a returning tester, but still asks too much interpretation from a fresh player.

### Scope

- Add a light onboarding layer for the core loop
- Improve locked / unavailable action explanations
- Refine activity log readability
- Tighten panel summaries for threat, modifiers, follow-ups, and route roles
- Improve scanability where multiple pressure systems now overlap

### Acceptance Criteria

- New players can understand the loop without trial-and-error
- Important pressure systems are easy to read from the dashboard
- Unavailable actions are explained clearly

## P3: Docs And Repo Polish Follow-Up

### Problem

The README is now real, but the broader repo docs can still grow with the project.

### Scope

- Add roadmap notes that match the live implementation state
- Add contributor-oriented notes if development broadens
- Optionally add design notes for systems like threat, follow-ups, and route roles

### Acceptance Criteria

- The repo stays aligned with the real product state
- A new contributor can understand both the current game and the next intended blocks

## Recommended Implementation Sequence

### Phase 1

- Special Nights / Spike Encounters
- keep the slice small and systemic
- use the current defense model instead of redesigning combat

### Phase 2

- Content Expansion
- fill the improved systems with more mission / event / task variety

### Phase 3

- Deeper Recruit / Survivor Variety
- make roster-building decisions matter more across runs

### Phase 4

- UX Productization
- improve learning curve and scanability after the next systemic additions land

### Phase 5

- Docs And Repo Polish Follow-Up

## Suggested Next Build Slice

If implementation starts immediately, the next slice should be:

1. write a focused spec for `Special Nights / Spike Encounters`
2. ship a small first set of special-night variants
3. surface them clearly in the defense briefing
4. add E2E coverage for at least one deterministic special-night path

## Notes

- The biggest missing value is now variety, not base structure
- The next best payoff is making night defense less predictable before doing broad content volume
- Content expansion should build on the new progression systems, not bypass them
