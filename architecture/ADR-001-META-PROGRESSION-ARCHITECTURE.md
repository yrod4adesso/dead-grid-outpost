# ADR-001: Meta Progression Layer Architecture

**Status:** Approved for Implementation  
**Date:** 2026-06-09  
**Decision Owner:** Lord Schema  
**Approved By:** Captain Context (Starship Mode)  
**Related Spec:** META_PROGRESSION_LAYER_SPEC.md

---

## Context

Das Spiel hat einen funktionierenden Run-Loop mit:
- Persistenz für aktive Runs
- Threat/Survivor-Pressure, Day Modifiers, Special Nights
- Vollständiger Victory/Defeat-Logik

**Problem:** Nach einem Run-Ende (besonders Defeat) fühlt sich der Fortschritt zu sehr nach Reset an. Es fehlt eine langfristige Motivationsstruktur, die auch bei Misserfolg sinnvollen Meta-Fortschritt bietet.

**Spec-Vorgabe:** Separate `DeadGridProfile`-Ebene mit:
- Permanenter Währung (Blueprint Shards)
- Kleinem Unlock-Tree (3-5 Nodes)
- Integration in existierende Systeme (Building-Startzustände, Resources, etc.)
- Separate Persistenz von Run-State

---

## Decision

### 1. Architektur-Prinzipien

| Prinzip | Begründung |
|---------|------------|
| **Trennung von Run und Profile** | Run-Reset darf Profile nicht beeinflussen. Separate localStorage keys, separate Versionierung. |
| **Explizite Anwendung bei Run-Start** | Unlocks werden bei `createNewGameState()` angewendet, nicht retroaktiv. Vermeidet versteckte State-Mutationen. |
| **Minimaler Store-Overhead** | Profile wird als separater Snapshot gehalten, nicht im zentralen Store integriert. Reduziert Komplexität. |
| **Versionierung mit Fallbacks** | Beide States (Run + Profile) haben Versionen. Migration erfolgt via `hydrate*()` Funktionen mit safe defaults. |

### 2. State-Struktur

```
┌─────────────────────────────────────────┐
│ DeadGridProfile (persistiert separat)   │
├─────────────────────────────────────────┤
│ version: number                         │
│ blueprintShards: number                 │
│ lifetimeRuns: number                    │
│ highestDayReached: number               │
│ unlockedNodes: string[]                 │
│ lastEarnedBlueprintShards: number       │
│ lastRunOutcome: "victory" | "defeat"    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ DeadGridState (existiert, bleibt)       │
├─────────────────────────────────────────┤
│ ... (aktuelle Struktur)                 │
│ lastCombatSummary.profileReward: number │
│ lastCombatSummary.profileRewardGranted  │
└─────────────────────────────────────────┘
```

**Entscheidung:** Die `profileRewardGranted`-Flagge im `lastCombatSummary` bleibt als Idempotenz-Mechanismus. Sie verhindert doppeltes Granten bei Reload.

### 3. Storage Layer

```typescript
const STORAGE_KEY = "dead-grid-outpost/save-v1";
const PROFILE_STORAGE_KEY = "dead-grid-outpost/profile-v1";
```

**Entscheidung:** Separate keys mit expliziter Versionierung. Keine Kombination in einem Objekt.

### 4. Unlock-Node-Design

**Empfohlene erste Nodes:**

| Node ID | Name | Cost | Effekt | Anwendungspunkt |
|---------|------|------|--------|-----------------|
| `storage_doctrine` | Storage Doctrine | 5 shards | +10 starting storage cap | `createNewGameState()` |
| `field_triage` | Field Triage Kits | 8 shards | +1 starting medicine | `createNewGameState()` |
| `watch_rota` | Watch Rota Drills | 10 shards | +0.05 base damage multiplier | `getDerivedStats()` |
| `route_scouting` | Route Scouting Maps | 12 shards | Bessere Mission-Visibility (UI) | UI-Layer |
| `defensive_fortification` | Defensive Fortification | 15 shards | +2 base barricade HP | `startNightDefense()` |

**Entscheidung:** Start mit 3-5 Nodes. Effekte sind klein aber messbar. Keine retroaktiven Änderungen an laufenden Runs.

### 5. Versionierung und Migration

```typescript
export const GAME_VERSION = 12;
export const PROFILE_VERSION = 1;
```

**Entscheidung:**
- `GAME_VERSION` bleibt für Run-State (aktuell 12)
- `PROFILE_VERSION` startet bei 1
- `hydrateLoadedProfile()` und `hydrateLoadedState()` haben safe fallbacks für fehlende Felder
- Bei Versions-Mismatch wird State/Profile verworfen (current behavior)

### 6. Reward-Grant-Logik

```typescript
// In store.ts: updateGameState()
if (nextState.lastCombatSummary && !nextState.lastCombatSummary.profileRewardGranted) {
  currentProfile = saveGameProfile(
    applyCombatSummaryProfileReward(currentProfile, nextState.lastCombatSummary, nextState.day)
  );
  nextState.lastCombatSummary.profileRewardGranted = true;
}
```

**Entscheidung:** Idempotentes Granting bei jedem State-Update, das ein CombatSummary hat. Vermeidet doppeltes Granten bei Reloads.

---

## Technical Feasibility

### Integration in existierende Codebase

| Bereich | Status | Aufwand |
|---------|--------|---------|
| **State Model** | ✅ `DeadGridProfile` bereits definiert in state.ts | Low |
| **Storage Layer** | ✅ `loadGameProfile()`, `saveGameProfile()` bereits implementiert | Low |
| **Store Integration** | ✅ `getGameProfileSnapshot()`, `updateGameState()` bereits vorhanden | Low |
| **Reward Granting** | ✅ `applyCombatSummaryProfileReward()` Referenz vorhanden (implementierungsbedürftig) | Medium |
| **Unlock Application** | ⚠️ Muss in `createNewGameState()` integriert werden | Medium |
| **UI Surfacing** | ⚠️ Landing Screen, Defeat Screen, Unlock Board fehlen | High |

**Gesamt-Fazit:** Core-Infrastruktur ist bereits vorhanden. Implementation fokussiert auf:
1. `applyCombatSummaryProfileReward()` Funktion
2. `createNewGameState()` mit Profile-Hooks
3. UI-Komponenten für Profile-Display

### Performance-Implikationen

| Metrik | Bewertung |
|--------|-----------|
| **Memory Overhead** | Negligible. Profile ist ~100 Bytes. |
| **Lookup Complexity** | O(1) via localStorage key. Keine Suchen erforderlich. |
| **Render Impact** | Profile wird nur bei Boot und Run-Ende geladen. Kein re-render overhead. |
| **Save/Load Latency** | +1 localStorage write/read. <1ms overhead. |

**Entscheidung:** Keine Performance-Bedenken. O(1) Lookups durch separate keys.

---

## Risks

### 1. Breaking Changes

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| **Version Mismatch führt zu Data Loss** | Medium | High | Versionierung mit klaren Migrations-Hooks. Bei Mismatch: warnen, nicht silent fail. |
| **Profile/Run-Reset Verwirrung** | Low | Medium | Explizite UI-Labels: "Profile Progress" vs "Current Run". |
| **Unlock-Effekte brechen Balance** | Medium | Medium | Start mit kleinen Effekten. Playtesting vor Erweiterung. |

### 2. Savegame Corruption

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| **Corrupt JSON in localStorage** | Low | Medium | Try-catch in `load*()` bereits vorhanden. Fallback zu defaults. |
| **Race Condition bei gleichzeitigen writes** | Very Low | Low | Browser serialisiert localStorage writes. Kein concurrency problem. |
| **Partial write bei Browser-Crash** | Low | Medium | Atomic writes via `setItem()`. JSON ist all-or-nothing. |

### 3. Complexity Creep

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| **Unlocks werden zu komplex** | Medium | Medium | Max 3-5 Nodes im ersten Slice. Klare Dokumentation jedes Effekts. |
| **Profile-Logik infiltriert Run-State** | Low | High | Strikte Trennung: Profile wird nur bei Run-Start angewendet. |
| **Zu viele UI-Punkte** | Medium | Low | Landing Screen + Defeat Screen + compact Unlock Board reicht für MVP. |

---

## Implementation Readiness

### Pre-Requisites (Erfüllt)

- [x] `DeadGridProfile` Type definiert
- [x] Storage helpers (`loadGameProfile`, `saveGameProfile`) vorhanden
- [x] Store-Integration (`getGameProfileSnapshot`) vorhanden
- [x] Game Versioning (`PROFILE_VERSION = 1`) etabliert
- [x] `profileRewardGranted` Flag in `lastCombatSummary` vorhanden

### To-Implement

- [ ] `applyCombatSummaryProfileReward()` Funktion
- [ ] `getBlueprintShardReward()` Logik (basierend auf Day/Outcome)
- [ ] `UNLOCK_NODES` Konfiguration (3-5 Nodes)
- [ ] `applyUnlocksToGameState()` Hook in `createNewGameState()`
- [ ] Landing Screen Profile Panel
- [ ] Defeat/Summary Screen Reward-Surfacing
- [ ] Unlock Board UI-Komponente
- [ ] E2E Tests für Profile Persistence

### Test Coverage Plan

```typescript
// tests/e2e/profile-persistence.spec.ts
test("profile persists across reload", async () => {
  // Grant shards, reload, verify shards unchanged
});

test("run reset does not clear profile", async () => {
  // Grant shards, reset run, verify shards unchanged
});

test("defeat grants blueprint shards", async () => {
  // Lose run, verify shards increased
});

test("unlock applies to new run", async () => {
  // Unlock node, start new run, verify starting bonus applied
});

test("existing continue-run still works", async () => {
  // Regression test: ensure no breakage
});
```

---

## Handoff to Commit Kong

### Scope für Implementation

**In Scope:**
1. `applyCombatSummaryProfileReward()` Implementation
2. `getBlueprintShardReward()` Formel (Day + Outcome)
3. 3-5 Unlock Nodes konfigurieren
4. `createNewGameState()` mit Unlock-Anwendung
5. Landing Screen: Profile Summary Panel
6. Defeat/Summary Screen: Reward-Surfacing
7. Unlock Board: Compact Card View
8. E2E Tests (5 scenarios)

**Out of Scope:**
- Backend-Accounts / Cloud Sync
- Monetization
- Große Tech-Tree-Menüs
- Hero Equipment
- PvP / Guild Systems
- Retroaktive Unlocks in laufenden Runs

### Definition of Done

- [ ] Profile persistiert über Reload
- [ ] Run-Reset löscht Profile nicht
- [ ] Defeat grantet Blueprint Shards
- [ ] Mindestens 1 Unlock beeinflusst Gameplay sichtbar
- [ ] Landing Screen zeigt Profile Progress
- [ ] Defeat Screen zeigt erhaltene Rewards
- [ ] Alle E2E Tests grün
- [ ] Keine Regression in bestehenden Tests

---

## Go/No-Go Recommendation

**Recommendation:** ✅ **GO**

**Begründung:**
1. **Architektur ist solide:** Trennung von Run/Profile ist klar, Versionierung etabliert.
2. **Infrastruktur existiert:** Storage + Store Integration bereits implementiert.
3. **Risiko ist kontrolliert:** Kleine Effekte, keine retroaktiven Änderungen, idempotentes Granting.
4. **Value ist hoch:** Löst das Kernproblem (fehlende langfristige Motivation) ohne Run-Loop zu brechen.
5. **Starship Mode passend:** Production-ready Struktur von Anfang an (Versionierung, separate Keys, Migration).

**Blocker:** Keine.

**Next Steps:**
1. Commit Kong startet Implementation gemäß Handoff-Scope
2. Bugzilla prüft E2E Coverage vor Release
3. Sir NullPointer reviewt Security (localStorage, keine Secrets betroffen)
4. Deployasaurus Rex koordiniert Release nach QA-Freigabe

---

## Appendix: Unlock Node Schema

```typescript
type UnlockNode = {
  id: string;
  name: string;
  description: string;
  cost: number; // blueprintShards
  category: "outpost" | "defense" | "route";
  effect: (profile: DeadGridProfile, state: DeadGridState) => Partial<DeadGridState>;
  appliesAt: "run_start" | "immediate";
};

const UNLOCK_NODES: UnlockNode[] = [
  {
    id: "storage_doctrine",
    name: "Storage Doctrine",
    description: "Expanded reserve capacity. Start each run with +10 storage cap.",
    cost: 5,
    category: "outpost",
    effect: (profile, state) => ({
      // Applied in createNewGameState via baseStorageCap modifier
    }),
    appliesAt: "run_start",
  },
  // ... weitere Nodes
];
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-09  
**Review Status:** Captain Context Approved
