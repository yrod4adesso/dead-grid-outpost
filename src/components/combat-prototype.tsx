"use client";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CombatBlueprint, CombatOutcome, ZombieType } from "@/lib/game/state";

type CombatPrototypeProps = {
  blueprint: CombatBlueprint;
  onResolve: (outcome: CombatOutcome) => void;
};

type Zombie = {
  id: number;
  type: ZombieType;
  elite: boolean;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  lane: number;
  damage: number;
  sprintTriggered: boolean;
  stunTimer: number;
};

type Bullet = {
  id: number;
  x: number;
  y: number;
  vx: number;
  damage: number;
};

type TargetPriority = "front" | "runner" | "brute" | "elite";

type RuntimeSnapshot = {
  playerHp: number;
  baseHp: number;
  waveIndex: number;
  waveCount: number;
  zombiesLeft: number;
  autoFire: boolean;
  manualReady: boolean;
  selectedLane: number;
  targetPriority: TargetPriority;
  pressureLane: number;
  pressureActive: boolean;
  medkitCharges: number;
  patchCharges: number;
  focusCharges: number;
  shieldCharges: number;
  flareCharges: number;
  focusActive: boolean;
};

const WIDTH = 880;
const HEIGHT = 420;
const LANE_Y = [118, 210, 302];

export function CombatPrototype({ blueprint, onResolve }: CombatPrototypeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<{
    bullets: Bullet[];
    zombies: Zombie[];
    animationFrame: number | null;
    spawnTimer: number;
    autoFireTimer: number;
    manualCooldown: number;
    waveIndex: number;
    spawnedInWave: number;
    clearedWaves: number;
    nextId: number;
    playerHp: number;
    baseHp: number;
    focusFireTimer: number;
    focusTargetPriority: TargetPriority;
    laneShieldTimers: number[];
    pressureLane: number;
    pressurePulseTimer: number;
    pressureActiveTimer: number;
    medkitCharges: number;
    patchCharges: number;
    focusCharges: number;
    shieldCharges: number;
    flareCharges: number;
    finished: boolean;
  } | null>(null);

  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>({
    playerHp: blueprint.playerHp,
    baseHp: blueprint.baseHp,
    waveIndex: 1,
    waveCount: blueprint.waves[0],
    zombiesLeft: blueprint.waves.reduce((sum, count) => sum + count, 0),
    autoFire: true,
    manualReady: true,
    selectedLane: 1,
    targetPriority: "front",
    pressureLane: 1,
    pressureActive: false,
    medkitCharges: blueprint.supportCharges.medkit,
    patchCharges: blueprint.supportCharges.patch,
    focusCharges: blueprint.supportCharges.focus,
    shieldCharges: blueprint.supportCharges.shield,
    flareCharges: blueprint.supportCharges.flare,
    focusActive: false,
  });
  const [autoFireEnabled, setAutoFireEnabled] = useState(true);
  const [selectedLane, setSelectedLane] = useState(1);
  const [targetPriority, setTargetPriority] = useState<TargetPriority>("front");

  const totalZombies = useMemo(
    () => blueprint.waves.reduce((sum, count) => sum + count, 0),
    [blueprint.waves],
  );

  const finishCombat = useEffectEvent((outcome: CombatOutcome) => {
    onResolve(outcome);
  });

  const fireShot = useEffectEvent((manual: boolean) => {
    triggerShot(
      runtimeRef.current,
      manual,
      blueprint.damageMultiplier,
      selectedLane,
      targetPriority,
      blueprint.manualCooldown,
    );
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    runtimeRef.current = {
      bullets: [],
      zombies: [],
      animationFrame: null,
      spawnTimer: 0.7,
      autoFireTimer: 0,
      manualCooldown: 0,
      waveIndex: 0,
      spawnedInWave: 0,
      clearedWaves: 0,
      nextId: 1,
      playerHp: blueprint.playerHp,
      baseHp: blueprint.baseHp,
      focusFireTimer: 0,
      focusTargetPriority: "front",
      laneShieldTimers: [0, 0, 0],
      pressureLane: 1,
      pressurePulseTimer: 4.8,
      pressureActiveTimer: 0,
      medkitCharges: blueprint.supportCharges.medkit,
      patchCharges: blueprint.supportCharges.patch,
      focusCharges: blueprint.supportCharges.focus,
      shieldCharges: blueprint.supportCharges.shield,
      flareCharges: blueprint.supportCharges.flare,
      finished: false,
    };

    let lastFrame = performance.now();

    const updateSnapshot = () => {
      const runtime = runtimeRef.current;

      if (!runtime) {
        return;
      }

      const remaining =
        totalZombies -
        (runtime.clearedWaves > 0
          ? blueprint.waves.slice(0, runtime.clearedWaves).reduce((sum, count) => sum + count, 0)
          : 0) -
        runtime.zombies.filter((zombie) => zombie.hp <= 0).length -
        runtime.bullets.filter((bullet) => bullet.damage < 0).length;

      setSnapshot({
        playerHp: runtime.playerHp,
        baseHp: runtime.baseHp,
        waveIndex: Math.min(runtime.waveIndex + 1, blueprint.waves.length),
        waveCount: blueprint.waves[runtime.waveIndex] ?? blueprint.waves[blueprint.waves.length - 1],
        zombiesLeft: Math.max(0, remaining),
        autoFire: autoFireEnabled,
        manualReady: runtime.manualCooldown <= 0,
        selectedLane,
        targetPriority,
        pressureLane: runtime.pressureLane,
        pressureActive: runtime.pressureActiveTimer > 0,
        medkitCharges: runtime.medkitCharges,
        patchCharges: runtime.patchCharges,
        focusCharges: runtime.focusCharges,
        shieldCharges: runtime.shieldCharges,
        flareCharges: runtime.flareCharges,
        focusActive: runtime.focusFireTimer > 0,
      });
    };

    const spawnZombie = () => {
      const runtime = runtimeRef.current;

      if (!runtime || runtime.finished) {
        return;
      }

      const waveSize = blueprint.waves[runtime.waveIndex];

      if (runtime.spawnedInWave >= waveSize) {
        return;
      }

      const lane = pickSpawnLane(runtime);
      const typePool: ZombieType[] = blueprint.enemyTypes.length > 0 ? blueprint.enemyTypes : ["walker"];
      const type = typePool[(runtime.nextId + runtime.waveIndex + lane) % typePool.length];
      const elite = shouldSpawnElite(runtime, type, lane, blueprint.waveModifier);
      const stats = getZombieStats(type, runtime.waveIndex, elite);

      runtime.zombies.push({
        id: runtime.nextId++,
        type,
        elite,
        x: WIDTH - 70,
        y: LANE_Y[lane],
        hp: stats.hp,
        maxHp: stats.hp,
        speed: stats.speed + lane * 2,
        lane,
        damage: stats.damage,
        sprintTriggered: false,
        stunTimer: 0,
      });
      runtime.spawnedInWave += 1;
    };

    const render = () => {
      const runtime = runtimeRef.current;

      if (!runtime) {
        return;
      }

      context.clearRect(0, 0, WIDTH, HEIGHT);
      context.fillStyle = "#08131c";
      context.fillRect(0, 0, WIDTH, HEIGHT);

      context.fillStyle = "#142230";
      context.fillRect(0, 60, WIDTH, HEIGHT - 120);

      for (const y of LANE_Y) {
        const laneIndex = LANE_Y.indexOf(y);
        context.strokeStyle = "rgba(255,255,255,0.07)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, y + 34);
        context.lineTo(WIDTH, y + 34);
        context.stroke();
        if (runtime.pressureActiveTimer > 0 && runtime.pressureLane === laneIndex) {
          context.fillStyle = "rgba(231,86,86,0.12)";
          context.fillRect(96, y - 38, WIDTH - 120, 78);
        }
        if (runtime.laneShieldTimers[laneIndex] > 0) {
          context.fillStyle = "rgba(92,205,179,0.18)";
          context.fillRect(48, y - 34, 52, 72);
        }
      }

      context.fillStyle = "#263746";
      context.fillRect(28, 82, 42, 258);
      context.fillStyle = "#f39d4a";
      context.fillRect(70, 82, 12, 258);

      context.fillStyle = "#65d3c6";
      context.beginPath();
      context.arc(112, LANE_Y[1], 18, 0, Math.PI * 2);
      context.fill();

      runtime.bullets.forEach((bullet) => {
        context.fillStyle = "#ffd188";
        context.beginPath();
        context.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        context.fill();
      });

      runtime.zombies.forEach((zombie) => {
        const visual = getZombieVisual(zombie.type);
        context.fillStyle = visual.body;
        context.fillRect(zombie.x - 16, zombie.y - 20, 32, 40);
        context.fillStyle = visual.head;
        context.fillRect(zombie.x - 14, zombie.y - 32, 28, 8);
        context.fillStyle = visual.accent;
        context.fillRect(zombie.x - 18, zombie.y + 14, 36, 4);
        if (zombie.elite) {
          context.strokeStyle = "#ffe27a";
          context.lineWidth = 2;
          context.strokeRect(zombie.x - 19, zombie.y - 35, 38, 55);
        }
        context.fillStyle = "#0f1a22";
        context.fillRect(zombie.x - 12, zombie.y - 30, (zombie.hp / zombie.maxHp) * 24, 4);
      });

      context.fillStyle = "#edf3f7";
      context.font = '700 18px var(--font-body), sans-serif';
      context.fillText(blueprint.arenaLabel, 24, 34);
      context.font = '500 14px var(--font-body), sans-serif';
      context.fillStyle = "rgba(237,243,247,0.72)";
      context.fillText(`Wave ${runtime.waveIndex + 1}/${blueprint.waves.length}`, 24, 390);
      context.fillText(`Player HP ${Math.max(0, Math.round(runtime.playerHp))}`, 230, 34);
      context.fillText(`Base HP ${Math.max(0, Math.round(runtime.baseHp))}`, 380, 34);
      context.fillText(`Zombies ${runtime.zombies.length}`, 520, 34);
      if (runtime.pressureActiveTimer > 0) {
        context.fillStyle = "#ffb08b";
        context.fillText(`Pressure lane ${runtime.pressureLane + 1}`, 666, 34);
      }
    };

    const tick = (now: number) => {
      const runtime = runtimeRef.current;

      if (!runtime) {
        return;
      }

      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;

      runtime.spawnTimer -= dt;
      runtime.autoFireTimer -= dt;
      runtime.manualCooldown -= dt;
      runtime.focusFireTimer -= dt;
      runtime.pressurePulseTimer -= dt;
      runtime.pressureActiveTimer = Math.max(0, runtime.pressureActiveTimer - dt);
      runtime.laneShieldTimers = runtime.laneShieldTimers.map((timer) => Math.max(0, timer - dt));

      if (runtime.pressurePulseTimer <= 0) {
        runtime.pressureLane = (runtime.pressureLane + runtime.waveIndex + 1) % LANE_Y.length;
        runtime.pressureActiveTimer = getPressureDuration(blueprint.waveModifier);
        runtime.pressurePulseTimer = getPressureCooldown(blueprint.waveModifier);
      }

      if (runtime.spawnTimer <= 0) {
        spawnZombie();
        runtime.spawnTimer = getSpawnCooldown(blueprint.waveModifier);
      }

      if (autoFireEnabled && runtime.autoFireTimer <= 0) {
        fireShot(false);
        runtime.autoFireTimer = blueprint.autoFireInterval;
      }

      runtime.bullets = runtime.bullets
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.vx * dt,
        }))
        .filter((bullet) => bullet.x < WIDTH + 20);

      runtime.zombies = runtime.zombies
        .map((zombie) => {
          const stunTimer = Math.max(0, zombie.stunTimer - dt);
          const speed =
            stunTimer > 0
              ? 0
              : zombie.type === "runner" && !zombie.sprintTriggered && zombie.x < WIDTH * 0.68
              ? zombie.speed * 1.45
              : zombie.speed;
          const pressureBoost =
            runtime.pressureActiveTimer > 0 && zombie.lane === runtime.pressureLane ? 1.12 : 1;

          return {
            ...zombie,
            x: zombie.x - speed * pressureBoost * dt,
            stunTimer,
            sprintTriggered:
              zombie.sprintTriggered || (zombie.type === "runner" && zombie.x < WIDTH * 0.68),
          };
        })
        .filter((zombie) => {
          if (zombie.x <= 92) {
            const shieldFactor = runtime.laneShieldTimers[zombie.lane] > 0 ? 0.35 : 1;
            const pressureFactor =
              runtime.pressureActiveTimer > 0 && zombie.lane === runtime.pressureLane ? 1.25 : 1;
            runtime.playerHp -= zombie.damage * shieldFactor * pressureFactor;
            runtime.baseHp -= Math.max(4, Math.round(zombie.damage * 0.7 * shieldFactor * pressureFactor));
            return false;
          }

          return zombie.hp > 0;
        });

      runtime.bullets.forEach((bullet) => {
        runtime.zombies.forEach((zombie) => {
          if (Math.abs(bullet.x - zombie.x) < 18 && Math.abs(bullet.y - zombie.y) < 20) {
            const focusMatch =
              runtime.focusFireTimer > 0 &&
              isPriorityMatch(zombie, runtime.focusTargetPriority);
            zombie.hp -=
              runtime.focusFireTimer > 0
                ? bullet.damage * (focusMatch ? 1.7 : 1.35)
                : bullet.damage;
            bullet.damage = -1;
          }
        });
      });

      runtime.bullets = runtime.bullets.filter((bullet) => bullet.damage > 0);
      runtime.zombies = runtime.zombies.filter((zombie) => zombie.hp > 0);

      const waveSize = blueprint.waves[runtime.waveIndex];
      if (runtime.spawnedInWave >= waveSize && runtime.zombies.length === 0) {
        runtime.clearedWaves += 1;
        runtime.waveIndex += 1;
        runtime.spawnedInWave = 0;
      }

      if (runtime.playerHp <= 0 || runtime.baseHp <= 0) {
        runtime.finished = true;
        finishCombat({
          status: "defeat",
          wavesCleared: runtime.clearedWaves,
          reward: {},
        });
        return;
      }

      if (runtime.waveIndex >= blueprint.waves.length) {
        runtime.finished = true;
        finishCombat({
          status: "victory",
          wavesCleared: blueprint.waves.length,
          reward: blueprint.reward,
        });
        return;
      }

      render();
      updateSnapshot();
      runtime.animationFrame = window.requestAnimationFrame(tick);
    };

    runtimeRef.current.animationFrame = window.requestAnimationFrame(tick);

    return () => {
      const runtime = runtimeRef.current;

      if (runtime?.animationFrame) {
        window.cancelAnimationFrame(runtime.animationFrame);
      }
    };
  }, [autoFireEnabled, blueprint, selectedLane, targetPriority, totalZombies]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        fireShot(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <section className="grid gap-5 rounded-[2rem] border border-white/10 bg-black/25 p-5 shadow-2xl shadow-black/25 backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#08131c]">
        <canvas
          className="aspect-[22/10] h-auto w-full"
          height={HEIGHT}
          ref={canvasRef}
          width={WIDTH}
        />
      </div>

      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Night defense</p>
          <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.12em] text-white">
            {blueprint.arenaLabel}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Hold the left barricade while the infected close from the outer lanes. Auto-fire keeps the line
            working; manual burst lets you spike a target with <span className="text-white">Space</span> or the
            control below.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--accent-soft)]">
            {blueprint.waveModifierLabel}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#ffb08b]">
            {blueprint.lanePressureLabel}
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <CombatStat label="Player HP" value={`${Math.max(0, Math.round(snapshot.playerHp))}`} />
          <CombatStat label="Base HP" value={`${Math.max(0, Math.round(snapshot.baseHp))}`} />
          <CombatStat label="Current wave" value={`${snapshot.waveIndex}/${blueprint.waves.length}`} />
          <CombatStat label="Wave size" value={`${snapshot.waveCount}`} />
          <CombatStat label="Priority lane" value={`Lane ${snapshot.selectedLane + 1}`} />
          <CombatStat label="Target profile" value={formatTargetPriority(snapshot.targetPriority)} />
          <CombatStat
            label="Lane pressure"
            value={snapshot.pressureActive ? `Lane ${snapshot.pressureLane + 1} under strain` : "Cycling"}
          />
          <CombatStat label="Hostiles" value={formatEnemyRoster(blueprint.enemyTypes)} />
          <CombatStat label="Wave modifier" value={blueprint.waveModifierLabel} />
          <CombatStat label="Tower damage" value={`x${blueprint.damageMultiplier.toFixed(2)}`} />
          <CombatStat label="Infirmary recovery" value={`+${blueprint.healingBonus} medicine`} />
          <CombatStat
            label="Support charges"
            value={`M${snapshot.medkitCharges} / P${snapshot.patchCharges} / F${snapshot.focusCharges} / S${snapshot.shieldCharges} / L${snapshot.flareCharges}`}
          />
          <CombatStat label="Reward on victory" value={describeReward(blueprint.reward)} />
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="grid grid-cols-3 gap-2">
            {LANE_Y.map((_, index) => (
              <button
                className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  selectedLane === index
                    ? "border-[var(--accent)] bg-[rgba(243,157,74,0.12)] text-white"
                    : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                }`}
                key={`lane-${index}`}
                onClick={() => setSelectedLane(index)}
                type="button"
              >
                Lane {index + 1}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["front", "runner", "brute", "elite"] as const).map((priority) => (
              <button
                className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  targetPriority === priority
                    ? "border-[#ffb08b] bg-[rgba(255,176,139,0.12)] text-white"
                    : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                }`}
                key={priority}
                onClick={() => setTargetPriority(priority)}
                type="button"
              >
                {formatTargetPriority(priority)}
              </button>
            ))}
          </div>
          <button
            className="rounded-full bg-[var(--signal)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#031816] transition hover:brightness-110"
            onClick={() =>
              triggerShot(
                runtimeRef.current,
                true,
                blueprint.damageMultiplier,
                selectedLane,
                targetPriority,
                blueprint.manualCooldown,
              )
            }
            type="button"
          >
            Manual burst {snapshot.manualReady ? "ready" : "cooldown"}
          </button>
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:border-white/40 hover:text-white"
            onClick={() => setAutoFireEnabled((current) => !current)}
            type="button"
          >
            Auto-fire {snapshot.autoFire ? "on" : "off"}
          </button>
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition enabled:hover:border-white/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={snapshot.medkitCharges <= 0 || snapshot.playerHp >= blueprint.playerHp}
            onClick={() => applySupport(runtimeRef.current, "medkit", blueprint)}
            type="button"
          >
            Medkit {snapshot.medkitCharges}
          </button>
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition enabled:hover:border-white/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={snapshot.patchCharges <= 0 || snapshot.baseHp >= blueprint.baseHp}
            onClick={() => applySupport(runtimeRef.current, "patch", blueprint)}
            type="button"
          >
            Barricade patch {snapshot.patchCharges}
          </button>
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition enabled:hover:border-white/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={snapshot.focusCharges <= 0 || snapshot.focusActive}
            onClick={() => applySupport(runtimeRef.current, "focus", blueprint, undefined, targetPriority)}
            type="button"
          >
            Focus fire {snapshot.focusActive ? formatTargetPriority(targetPriority) : snapshot.focusCharges}
          </button>
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition enabled:hover:border-white/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={snapshot.shieldCharges <= 0}
            onClick={() => applySupport(runtimeRef.current, "shield", blueprint, selectedLane, targetPriority)}
            type="button"
          >
            Lane shield {snapshot.shieldCharges}
          </button>
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80 transition enabled:hover:border-white/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={snapshot.flareCharges <= 0}
            onClick={() => applySupport(runtimeRef.current, "flare", blueprint, selectedLane, targetPriority)}
            type="button"
          >
            Stun flare {snapshot.flareCharges}
          </button>
          <p className="text-sm text-white/55">
            Compact combat readout with clear lane telemetry and persistent run state.
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-soft)]">Active combat perks</p>
          <CombatStat label="Auto-fire cadence" value={`${blueprint.autoFireInterval.toFixed(2)}s`} />
          <CombatStat label="Manual burst cooldown" value={`${blueprint.manualCooldown.toFixed(2)}s`} />
          <CombatStat label="Focus window" value={`${blueprint.focusDuration.toFixed(1)}s`} />
          <CombatStat label="Shield duration" value={`${blueprint.shieldDuration.toFixed(1)}s`} />
          <CombatStat
            label="Flare control"
            value={`${blueprint.flarePrimaryDuration.toFixed(1)}s / ${blueprint.flareSecondaryDuration.toFixed(1)}s`}
          />
          <div className="grid gap-2 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            {blueprint.activePerkLabels.length > 0 ? (
              blueprint.activePerkLabels.map((perk) => (
                <p className="text-sm text-white/75" key={perk}>
                  {perk}
                </p>
              ))
            ) : (
              <p className="text-sm text-white/45">No additional combat perks are active tonight.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CombatStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function describeReward(reward: CombatBlueprint["reward"]) {
  return Object.entries(reward)
    .map(([key, value]) => `+${value} ${key}`)
    .join(", ");
}

function triggerShot(
  runtime: {
    bullets: Bullet[];
    zombies: Zombie[];
    manualCooldown: number;
    nextId: number;
    finished: boolean;
  } | null,
  manual: boolean,
  damageMultiplier: number,
  preferredLane?: number,
  targetPriority: TargetPriority = "front",
  manualCooldownDuration = 0.75,
) {
  if (!runtime || runtime.finished) {
    return;
  }

  if (manual && runtime.manualCooldown > 0) {
    return;
  }

  const priorityZombies =
    typeof preferredLane === "number"
      ? runtime.zombies.filter((zombie) => zombie.lane === preferredLane)
      : runtime.zombies;
  const targetPool = priorityZombies.length > 0 ? priorityZombies : runtime.zombies;
  const filteredByPriority = filterZombiesByPriority(targetPool, targetPriority);
  const finalPool = filteredByPriority.length > 0 ? filteredByPriority : targetPool;
  const target = finalPool.reduce<Zombie | null>((closest, zombie) => {
    if (!closest || zombie.x < closest.x) {
      return zombie;
    }

    return closest;
  }, null);

  if (!target) {
    return;
  }

  const playerX = 112;
  const playerY = target.y;
  const dx = target.x - playerX;
  const dy = target.y - playerY;
  const length = Math.max(1, Math.hypot(dx, dy));

  runtime.bullets.push({
    id: runtime.nextId++,
    x: playerX,
    y: playerY,
    vx: (dx / length) * 540,
    damage: Math.round((manual ? 28 : 18) * damageMultiplier),
  });

  if (manual) {
    runtime.manualCooldown = manualCooldownDuration;
  }
}

function applySupport(
  runtime: {
    zombies: Zombie[];
    playerHp: number;
    baseHp: number;
    focusFireTimer: number;
    focusTargetPriority: TargetPriority;
    laneShieldTimers: number[];
    medkitCharges: number;
    patchCharges: number;
    focusCharges: number;
    shieldCharges: number;
    flareCharges: number;
    finished: boolean;
  } | null,
  support: "medkit" | "patch" | "focus" | "shield" | "flare",
  blueprint: CombatBlueprint,
  selectedLane?: number,
  targetPriority: TargetPriority = "front",
) {
  if (!runtime || runtime.finished) {
    return;
  }

  switch (support) {
    case "medkit":
      if (runtime.medkitCharges <= 0) return;
      runtime.medkitCharges -= 1;
      runtime.playerHp = Math.min(blueprint.playerHp, runtime.playerHp + 26);
      return;
    case "patch":
      if (runtime.patchCharges <= 0) return;
      runtime.patchCharges -= 1;
      runtime.baseHp = Math.min(blueprint.baseHp, runtime.baseHp + 24);
      return;
    case "focus":
      if (runtime.focusCharges <= 0 || runtime.focusFireTimer > 0) return;
      runtime.focusCharges -= 1;
      runtime.focusFireTimer = blueprint.focusDuration;
      runtime.focusTargetPriority = targetPriority;
      return;
    case "shield":
      if (runtime.shieldCharges <= 0 || typeof selectedLane !== "number") return;
      runtime.shieldCharges -= 1;
      runtime.laneShieldTimers[selectedLane] =
        (targetPriority === "brute" || targetPriority === "elite"
          ? blueprint.shieldDuration + 1.1
          : blueprint.shieldDuration);
      return;
    case "flare":
      if (runtime.flareCharges <= 0 || typeof selectedLane !== "number") return;
      runtime.flareCharges -= 1;
      runtime.zombies = runtime.zombies.map((zombie) =>
        zombie.lane === selectedLane
          ? {
              ...zombie,
              stunTimer: isPriorityMatch(zombie, targetPriority)
                ? Math.max(zombie.stunTimer, blueprint.flarePrimaryDuration)
                : Math.max(zombie.stunTimer, blueprint.flareSecondaryDuration),
            }
          : zombie,
      );
  }
}

function filterZombiesByPriority(zombies: Zombie[], targetPriority: TargetPriority) {
  switch (targetPriority) {
    case "runner":
      return zombies.filter((zombie) => zombie.type === "runner");
    case "brute":
      return zombies.filter((zombie) => zombie.type === "brute");
    case "elite":
      return zombies.filter((zombie) => zombie.elite);
    case "front":
    default:
      return zombies;
  }
}

function isPriorityMatch(zombie: Zombie, targetPriority: TargetPriority) {
  switch (targetPriority) {
    case "runner":
      return zombie.type === "runner";
    case "brute":
      return zombie.type === "brute";
    case "elite":
      return zombie.elite;
    case "front":
    default:
      return true;
  }
}

function formatTargetPriority(targetPriority: TargetPriority) {
  switch (targetPriority) {
    case "runner":
      return "Runner lock";
    case "brute":
      return "Brute lock";
    case "elite":
      return "Elite lock";
    case "front":
    default:
      return "Frontline";
  }
}

function getZombieStats(type: ZombieType, waveIndex: number, elite = false) {
  const waveBonus = waveIndex * 5;
  const eliteHpFactor = elite ? 1.4 : 1;
  const eliteSpeedFactor = elite ? 1.08 : 1;
  const eliteDamageFactor = elite ? 1.3 : 1;

  switch (type) {
    case "runner":
      return {
        hp: Math.round((22 + waveBonus) * eliteHpFactor),
        speed: Math.round((38 + waveIndex * 6) * eliteSpeedFactor),
        damage: Math.round((9 + waveIndex * 2) * eliteDamageFactor),
      };
    case "brute":
      return {
        hp: Math.round((44 + waveBonus * 2) * eliteHpFactor),
        speed: Math.round((18 + waveIndex * 4) * eliteSpeedFactor),
        damage: Math.round((16 + waveIndex * 3) * eliteDamageFactor),
      };
    case "walker":
    default:
      return {
        hp: Math.round((28 + waveBonus) * eliteHpFactor),
        speed: Math.round((24 + waveIndex * 5) * eliteSpeedFactor),
        damage: Math.round((10 + waveIndex * 2) * eliteDamageFactor),
      };
  }
}

function getSpawnCooldown(modifier: CombatBlueprint["waveModifier"]) {
  switch (modifier) {
    case "surge":
      return 0.62;
    case "fortified":
      return 0.92;
    case "blackout":
    default:
      return 1.05;
  }
}

function getPressureCooldown(modifier: CombatBlueprint["waveModifier"]) {
  switch (modifier) {
    case "surge":
      return 5.2;
    case "fortified":
      return 6.2;
    case "blackout":
    default:
      return 6.8;
  }
}

function getPressureDuration(modifier: CombatBlueprint["waveModifier"]) {
  switch (modifier) {
    case "surge":
      return 3.2;
    case "fortified":
      return 4.4;
    case "blackout":
    default:
      return 4;
  }
}

function pickSpawnLane(runtime: {
  nextId: number;
  pressureLane: number;
  pressureActiveTimer: number;
}) {
  if (runtime.pressureActiveTimer > 0 && runtime.nextId % 3 !== 0) {
    return runtime.pressureLane;
  }

  return runtime.nextId % LANE_Y.length;
}

function shouldSpawnElite(
  runtime: { waveIndex: number; pressureLane: number; pressureActiveTimer: number; nextId: number },
  type: ZombieType,
  lane: number,
  modifier: CombatBlueprint["waveModifier"],
) {
  if (runtime.pressureActiveTimer <= 0 || lane !== runtime.pressureLane || type === "walker") {
    return false;
  }

  const threshold = modifier === "fortified" ? 2 : 3;
  return (runtime.nextId + runtime.waveIndex + lane) % threshold === 0;
}

function getZombieVisual(type: ZombieType) {
  switch (type) {
    case "runner":
      return {
        body: "#cf7b4a",
        head: "#ffd0a9",
        accent: "#ffb261",
      };
    case "brute":
      return {
        body: "#8f3e55",
        head: "#d59cb0",
        accent: "#e5658b",
      };
    case "walker":
    default:
      return {
        body: "#bf4d3a",
        head: "#f6a48f",
        accent: "#df7967",
      };
  }
}

function formatEnemyRoster(enemyTypes: ZombieType[]) {
  const labels = Array.from(new Set(enemyTypes)).map((type) => {
    switch (type) {
      case "runner":
        return "Runners";
      case "brute":
        return "Brutes";
      case "walker":
      default:
        return "Walkers";
    }
  });

  return labels.join(" / ");
}
