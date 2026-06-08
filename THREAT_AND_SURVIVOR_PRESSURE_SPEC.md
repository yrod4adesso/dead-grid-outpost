# Threat And Survivor Pressure Spec

## Goal

Make later days feel mechanically harsher than early days by turning threat and survivor wear into visible planning constraints instead of mostly descriptive labels.

This slice should be the first real progression-depth pass after the run lifecycle and persistence work. The target is not to add lots of new content, but to make the current content produce stronger medium-term pressure.

## Why This Slice First

The prototype already supports:

- start / continue / reset flow
- day planning loop
- night defense resolution
- victory summary and terminal defeat
- save persistence and regression coverage

The next biggest gap is systemic depth:

- `threatLevel` exists but does not yet drive enough gameplay
- survivors accumulate too little long-tail pressure
- day 4 still risks feeling too close to day 1 with slightly larger numbers

This slice solves that without requiring a large narrative or content expansion first.

## Scope

This slice includes:

1. Stronger threat escalation thresholds
2. Threat effects that hit at least two gameplay systems
3. More persistent survivor wear across missions and defense
4. Clear UI surfacing for the new pressure rules
5. E2E coverage for the new pressure behavior

This slice does not include:

- new event chains
- new route families
- new recruit archetypes
- major combat mechanic rewrite
- day modifier system

## User Outcomes

After this slice:

- later days feel more dangerous before combat even starts
- players are pushed to rotate survivors instead of overusing the same team
- threat feels like an active system, not just a banner label
- fatigue, injury, and treatment choices matter more in the next day

## Product Behavior

### 1. Threat Ladder

Threat should move through explicit tiers:

- `Watching`
- `Escalating`
- `Critical`
- `Breached`

Suggested threshold model:

- `Watching`: day 1-2 baseline pressure
- `Escalating`: sustained progress into day 3+ or rising day-state pressure
- `Critical`: late-day or repeated unresolved strain
- `Breached`: terminal failure state

The exact thresholds can be day-based at first, but the code should be structured so later slices can also raise threat from events and tasks.

### 2. Threat Effects

Higher threat must change gameplay in at least two ways.

Recommended initial hooks:

1. Mission pressure
   - more severe `enemyHint`
   - slightly harsher reward/risk framing or route pressure messaging

2. Night defense pressure
   - stronger lane-pressure copy
   - more hostile wave modifier selection
   - reduced margin for weak survivor readiness

3. Recovery / operating pressure
   - treatment or recovery becomes more valuable under higher threat
   - later slices may add direct resource tax, but this slice can start with survivor efficiency pressure

The main point is that a player should notice the difference before entering combat and while preparing the roster.

### 3. Survivor Wear Rules

Survivor wear should become more persistent and strategically relevant.

Recommended rules for this slice:

- survivors used on missions become more likely to stay `fatigued`
- survivors used for night defense should also contribute to wear
- fatigued survivors should still be usable, but with weaker contribution than `ready`
- injured survivors remain the highest-cost condition and should continue to interact with treatment
- recovery should no longer flatten too quickly back to full readiness

This slice does not need a new status taxonomy yet. It should deepen the existing `ready` / `fatigued` / `injured` model first.

### 4. Readiness And Team Quality

Low-readiness survivors should produce weaker results in visible ways.

Recommended first effects:

- `fatigued` survivors count less effectively toward derived building / defense output
- mission team selection should communicate that sending worn survivors increases risk
- defense briefing should reflect weaker line quality if too many non-ready survivors are assigned

The implementation can use light modifiers rather than complicated formulas, as long as the pressure is obvious.

## State / Architecture Changes

### Threat Modeling

The current `threatLevel: string` is flexible but too loose.

Recommended direction:

- introduce a `ThreatLevel` union type
- derive or explicitly set threat through a dedicated helper
- centralize threat transitions so future event/task consequences can reuse the same system

Suggested helper surface:

- `getThreatLevelForState(state)` or
- `updateThreatLevel(state, context)`

For this slice, a deterministic day-driven baseline is acceptable if the helper remains extensible.

### Survivor Pressure Modeling

The current survivor status model can stay:

- `ready`
- `fatigued`
- `injured`

But the system around it should become stricter:

- mission resolution should mark wear more aggressively
- defense aftermath should also apply wear
- derived stats should distinguish between `ready` and `fatigued` instead of treating all non-injured states too similarly

### Derived Stats

`getDerivedStats()` is the natural place to express reduced efficiency from worn squads.

Recommended behavior:

- `ready` survivors contribute full value
- `fatigued` survivors contribute partial value
- `injured` survivors contribute no active value

This should affect at least:

- defense crew quality
- building bonuses from assignments
- possibly perk activation if no fully ready survivor is present

## UI Changes

The dashboard should explain the new pressure without overwhelming the player.

Recommended surfacing:

1. Commander / header area
   - stronger threat descriptor
   - short line explaining what the current threat tier changes

2. Mission board
   - clearer risk copy tied to threat
   - team selection hint when fatigued survivors are included

3. Defense gate
   - line quality / roster pressure hint
   - current threat influence visible in the briefing

4. Survivor cards
   - readiness explanation tightened
   - fatigue / injury should read as actionable planning information, not flavor

5. Summary screens
   - victory summary should reflect current threat pressure
   - defeat screen should remain aligned with `Breached`

## Acceptance Criteria

### Threat

- Threat is represented by a constrained model, not freeform drift
- Day 1 and later days produce visibly different threat tiers
- Higher threat affects at least two gameplay systems
- Threat impact is visible in the outpost UI before combat begins

### Survivor Wear

- Reusing the same survivors across day and night creates noticeably more pressure
- Fatigued survivors are still usable but clearly weaker than ready survivors
- Treatment and rotation decisions become more strategically meaningful

### UX

- The player can tell why the current day is more dangerous than an earlier one
- The player can tell when lineup quality is degraded by fatigue or injury

### Regression Safety

- Existing run lifecycle flows still work
- Existing persistence flows still work
- Existing E2E tests remain green

## Test Plan

Add or extend Playwright coverage for:

1. Day progression into a higher threat tier
2. Resume flow still preserving threat and survivor states
3. Repeated survivor usage causing visible wear on the next cycle
4. Defense briefing reflecting degraded readiness

Suggested test style:

- prefer deterministic day advancement and state assertions over brittle combat micromanagement
- reuse existing smoke and persistence flows where possible

## Implementation Tasks

### Task 1: Threat Type And Thresholds

- add an explicit threat type
- define threshold rules for `Watching`, `Escalating`, `Critical`, `Breached`
- centralize threat updates in state helpers

### Task 2: Threat Gameplay Hooks

- connect threat to mission pressure presentation
- connect threat to defense briefing / combat blueprint pressure
- ensure the effects are visible in UI copy and summaries

### Task 3: Survivor Wear Persistence

- make mission usage apply stronger ongoing fatigue pressure
- make night defense also apply wear
- keep treatment meaningful as the main mitigation path

### Task 4: Readiness-Based Effectiveness

- update derived stats so `fatigued` survivors contribute less than `ready`
- surface degraded roster quality in the defense gate and survivor panels
- ensure assignment effects remain readable

### Task 5: E2E Coverage

- add deterministic tests for threat progression and survivor wear carry-over
- keep current smoke and persistence coverage passing

## Risks

- If threat rises too aggressively, the prototype can feel unfair instead of deeper
- If fatigued survivors become too weak, roster choice collapses instead of broadening
- If UI copy is not updated alongside systems, the new pressure will feel arbitrary

## Recommended Delivery Order

1. Threat type and thresholds
2. Survivor wear persistence rules
3. Readiness-based derived stats
4. UI surfacing in dashboard and defense gate
5. E2E coverage

## Definition Of Done

This slice is done when:

- later days create visibly stronger pressure than early days
- threat changes gameplay, not just text
- survivor wear carries forward in a meaningful way
- the dashboard explains the pressure clearly enough for playtesting
- regression coverage still passes
