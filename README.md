# Dead Grid Outpost

`Dead Grid Outpost` is a browser-first survival command prototype built with Next.js.

You run a small shelter through a repeating loop:

- start or continue a run
- manage the outpost
- send teams on routes
- resolve day events and tasks
- recruit and assign survivors
- survive the night defense
- review the result and continue or lose the run

The project is designed as a playable prototype, not just a UI mock. It already includes local save state, a combat phase, run summaries, a terminal defeat state, and end-to-end test coverage for the core loop.

## Project Purpose

This project explores a compact survival game structure with:

- clear day-to-night run flow
- meaningful resource pressure
- survivor assignment and recovery decisions
- route selection with immediate consequences
- replayable browser-based night defense
- persistent local campaign state

The current focus is on making the run lifecycle feel complete and testable before expanding content depth.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Playwright for end-to-end tests

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
```

Run the production server locally:

```bash
npm run start
```

## Testing

Lint the project:

```bash
npm run lint
```

Run end-to-end tests:

```bash
npm run test:e2e
```

The current Playwright coverage includes:

- start -> mission -> night defense smoke path
- explicit continue-run flow
- victory summary flow
- terminal run-ended flow
- persistence across reload and resume

## Bedienungsanleitung

## 1. Run starten

Beim Start siehst du den Landing Screen.

- `Start new run` startet einen frischen Durchlauf
- `Continue run` erscheint, wenn ein lokaler Spielstand vorhanden ist
- im Save-Block siehst du Tag, Threat-Level und den letzten Save-Zeitpunkt

## 2. Tagesphase im Outpost

Nach dem Start landest du im Haupt-Dashboard.

Wichtige Bereiche:

- `Outpost Dashboard`
  - Gebäude auswählen
  - Upgrades kaufen
  - passive Werte wie Storage, Healing oder Defense verbessern

- `Mission board`
  - eine Route auswählen
  - verfügbare Survivors für das Team bestimmen
  - einen Ansatz wie schneller oder sicherer Eintritt wählen

- `Survivor assignments`
  - Survivors auf Defense, Workshop, Infirmary, Storage oder Watchtower setzen
  - verletzte Survivors priorisieren oder behandeln

- `Recruitment board`
  - neue Kandidaten ansehen
  - Rolle, Kosten und Bonus prüfen
  - gezielt rekrutieren

- `Day events`
  - kurze Feldentscheidungen mit direktem Trade-off
  - ersetzen nicht das Mission Board, sondern ergänzen es

- `Outpost task queue`
  - kleine sichere Fortschrittsaktionen
  - gut für kontrollierte Verbesserungen ohne vollen Route-Einsatz

- `Recent activity`
  - Log der letzten wichtigen Entscheidungen und Folgen

## 3. Nachtverteidigung starten

Wenn du bereit bist:

- im Bereich `Defense gate` auf `Start night defense` klicken

Dann wechselst du in die spielbare Combat-Phase.

## 4. Steuerung im Kampf

In der Night Defense verteidigst du den linken Barrikadenabschnitt gegen mehrere Wellen.

Steuerung:

- `Lane 1 / 2 / 3`
  - priorisierte Lane auswählen

- Zielpriorität wählen:
  - `Front`
  - `Runner`
  - `Brute`
  - `Elite`

- `Manual burst`
  - per Button
  - oder mit `Space`

- `Auto-fire`
  - an- oder ausschalten

- Support-Fähigkeiten:
  - `Medkit`
  - `Barricade patch`
  - `Focus fire`
  - `Lane shield`
  - `Stun flare`

Ziel:

- möglichst viele Wellen überstehen
- Base und Spieler gesund halten
- den Barrikadenbruch verhindern

## 5. Nach dem Kampf

Bei Sieg:

- du siehst eine Victory Summary
- dort stehen Resultat, Wellenzahl und Rewards
- mit `Advance to day X` gehst du zurück in den nächsten Tagesloop

Bei Niederlage:

- du landest in einem terminalen `Run ended`-State
- der Run ist dann nicht mehr über `Continue run` fortsetzbar
- du kannst:
  - `Return to landing`
  - `Start fresh run`

## 6. Speichern und Fortsetzen

Das Spiel speichert lokal im Browser.

Wichtig:

- aktive Runs können vom Landing Screen über `Continue run` fortgesetzt werden
- beendete Runs werden nicht mehr als fortsetzbar angeboten
- `Reset run` im Dashboard verwirft den aktiven Run und bringt dich zurück zum Landing Screen

## Aktueller Stand

Bereits enthalten:

- Landing Screen mit Start- und Continue-Flow
- browser-lokale Persistenz
- Outpost-, Mission-, Event-, Recruit- und Task-Systeme
- Night-Defense-Combat
- Victory Summary
- terminaler Niederlagen-State
- E2E-Regressionstests

Noch im Ausbau:

- mehr Content-Varianz
- tiefere Progression über mehrere Tage
- weitere Hardening- und CI-Schritte
- bessere Produkt-Dokumentation und Polishing

## Repo-Hinweise

Wichtige Dateien:

- `src/components/dead-grid-app.tsx`
- `src/components/combat-prototype.tsx`
- `src/lib/game/state.ts`
- `src/lib/game/store.ts`
- `tests/e2e/`
- `MISSING_FEATURES_PLAN.md`
- `RUN_COMPLETION_LAYER_SPEC.md`
