// MARS · OUT OF ORBIT. Fixed-step, seeded, DOM-free simulation.
// Positions describe the centre of a fighter's feet, with positive y downward.
// The caller supplies one input object per fighter, exactly once per 60 Hz tick.

export const STEP = 1 / 60;
export const BOUNDS = Object.freeze({
  left: -920,
  right: 920,
  top: -680,
  bottom: 750,
});

export const CHARACTERS = Object.freeze([
  {
    id: "iona",
    name: "Iona",
    role: "RECOVERY CADET",
    color: "#ef664c",
    speed: 370,
    weight: 0.88,
    fireRate: 0.30,
    specialName: "The Return Route",
    description:
      "Fast foam bursts. Two air jumps. A grapple that brings you home.",
  },
  {
    id: "rook",
    name: "Rook",
    role: "MOTH PILOT",
    color: "#4bb6d1",
    speed: 325,
    weight: 1,
    fireRate: 0.35,
    specialName: "The Majestic Emergency Exit",
    description: "Paint blaster. A very confident jet-assisted escape.",
  },
  {
    id: "sera",
    name: "Sera",
    role: "NEEDLEWAKE CAPTAIN",
    color: "#bc8be0",
    speed: 270,
    weight: 1.22,
    fireRate: 0.60,
    specialName: "Quiet, please.",
    description:
      "Heavy footing. Precise air slugs. A devastating charged shot.",
  },
  {
    id: "tavi",
    name: "Tavi",
    role: "RECOVERY ENGINEER",
    color: "#70c49b",
    speed: 300,
    weight: 1.06,
    fireRate: 0.42,
    specialName: "One careful adjustment",
    description:
      "Magnetic tool traps. Field repairs. Enthusiasm for dangerous hinges.",
  },
  {
    id: "beam",
    name: "Beam",
    role: "VICTORY WINDOW",
    color: "#e8b94c",
    speed: 300,
    weight: 0.98,
    fireRate: 0.44,
    specialName: "The Golden Rebuttal",
    description: "Arcing medals. A blinding spotlight. A heroic counter-pose.",
  },
  {
    id: "pip",
    name: "Pip",
    role: "COMMS CADET",
    color: "#64c9c4",
    speed: 345,
    weight: 0.96,
    fireRate: 0.34,
    specialName: "Still here!",
    description:
      "Light foam fire. A protective recovery pulse. Earned through cadet training.",
  },
]);

const platform = (id, x, y, w, kind = "fixed") => ({
  id,
  x,
  y,
  w,
  h: 22,
  kind,
});
export const ARENAS = Object.freeze([
  {
    id: "deck",
    name: "Needlewake",
    subtitle: "RECOVERY DECK",
    description:
      "A steady deck. Two high lanes. An excellent place to leave the ship.",
    platforms: [
      platform("deck", -510, 230, 1020),
      platform("port", -470, 15, 300),
      platform("starboard", 170, 15, 300),
      platform("gantry", -130, -175, 260),
    ],
  },
  {
    id: "gravity",
    name: "Gravity Room",
    subtitle: "CENTRIFUGE",
    description:
      "Watch the warning lights. The next gravity cycle changes every jump.",
    platforms: [
      platform("floor", -485, 250, 970),
      platform("left", -500, 25, 280),
      platform("right", 220, 25, 280),
      platform("centre", -145, -155, 290),
    ],
  },
  {
    id: "yard",
    name: "Moth Yard",
    subtitle: "SALVAGE FIELD",
    description:
      "Drifting salvage. Moving footholds. Keep a recovery jump in reserve.",
    platforms: [
      platform("moth", -275, 250, 550),
      platform("left", -590, 40, 270, "drift"),
      platform("right", 320, 40, 270, "drift"),
      platform("upper", -135, -165, 270, "drift"),
    ],
  },
  {
    id: "studio",
    name: "Victory Window",
    subtitle: "LIVE STUDIO",
    description:
      "The scenery is almost structurally sound. Flashing platforms are about to drop.",
    platforms: [
      platform("stage", -490, 250, 980),
      platform("set-left", -500, 20, 270, "scenery"),
      platform("set-right", 230, 20, 270, "scenery"),
      platform("rig", -150, -170, 300),
    ],
  },
  {
    id: "airlock",
    name: "Airlock",
    subtitle: "TRAINING HANGAR",
    description:
      "A warning. A pressure pull. The doors are part of the exercise.",
    platforms: [
      platform("hangar", -480, 240, 960),
      platform("left", -450, 10, 270),
      platform("right", 180, 10, 270),
      platform("bridge", -130, -180, 260),
    ],
  },
]);

export const ITEMS = Object.freeze([
  { id: "biscuit", name: "Emergency biscuit", color: "#dba45e" },
  { id: "medal", name: "Heroic medal", color: "#f2c44b" },
  { id: "tape", name: "Salvage tape", color: "#e9e1bc" },
  { id: "gravity", name: "Gravity switch", color: "#65c9d8" },
]);

const CHARACTER_MAP = Object.fromEntries(
  CHARACTERS.map((character) => [character.id, character]),
);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const sign = (value) => (value < 0 ? -1 : 1);
const approach = (value, target, amount) =>
  value < target
    ? Math.min(value + amount, target)
    : Math.max(value - amount, target);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// All devices and bots enter the same 64-direction simulation lattice.
const AIM_DIRECTIONS = Object.freeze(Array.from({ length: 64 }, (_, index) => {
  const angle = index * Math.PI / 32;
  return Object.freeze({
    aimX: Math.round(Math.cos(angle) * 1e6) / 1e6 || 0,
    aimY: Math.round(Math.sin(angle) * 1e6) / 1e6 || 0,
  });
}));

export function quantizeAim(x, y) {
  const aimX = Number(x), aimY = Number(y);
  if (!Number.isFinite(aimX) || !Number.isFinite(aimY) || Math.hypot(aimX, aimY) < 0.001)
    return { aimX: 0, aimY: 0 };
  const index = (Math.round(Math.atan2(aimY, aimX) * 32 / Math.PI) + 64) % 64;
  return { ...AIM_DIRECTIONS[index] };
}

function random(state) {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}

function event(state, type, detail = {}) {
  state.events.push({ type, tick: state.tick, ...detail });
}

function inputFrame(input = {}) {
  return {
    move: clamp(Number(input.move) || 0, -1, 1),
    jump: Boolean(input.jump),
    shoot: Boolean(input.shoot),
    special: Boolean(input.special),
    ...quantizeAim(input.aimX ?? 0, input.aimY ?? 0),
  };
}

function fighterFor(id, index, controller, stocks, seed) {
  const character = CHARACTER_MAP[id] || CHARACTERS[index % CHARACTERS.length];
  return {
    id: character.id,
    index,
    controller,
    x: (index - 1.5) * 185,
    y: 230,
    vx: 0,
    vy: 0,
    facing: index % 2 === 0 ? 1 : -1,
    aimX: index % 2 === 0 ? 1 : -1,
    aimY: 0,
    damage: 0,
    stocks,
    alive: true,
    grounded: false,
    platformId: null,
    action: "idle",
    actionTime: 0,
    invulnerable: 1.2,
    cooldown: 0,
    specialCooldown: 0,
    specialDuration: 0,
    charge: 0,
    stun: 0,
    slow: 0,
    blind: 0,
    respawn: 0,
    counter: 0,
    jumps: 0,
    maxJumps: character.id === "iona" ? 3 : 2,
    coyote: 0,
    jumpBuffer: 0,
    bufferedJump: false,
    bufferedSpecial: false,
    bufferedShot: null,
    score: 0,
    lastAttacker: -1,
    lastHitTick: -1000,
    assisted: false,
    previousInput: inputFrame(),
    input: inputFrame(),
    ai: {
      nextThink: 0,
      decision: inputFrame(),
      target: -1,
      rng: (seed + index * 104729) >>> 0,
      lastJump: -120,
      lastSpecial: -120,
    },
    stats: {
      shots: 0,
      hits: 0,
      dealt: 0,
      taken: 0,
      ringouts: 0,
      recoveries: 0,
      pickups: 0,
    },
    itemEffects: [],
  };
}

export function createMatch(options = {}) {
  const characters = (options.characters || ["iona", "rook"]).slice(0, 4);
  while (characters.length < 2) characters.push("rook");
  const selectedArena =
    ARENAS.find((arena) => arena.id === options.arena) || ARENAS[0];
  const seed = (Number(options.seed) || 2705) >>> 0;
  const stocks = clamp(Math.floor(Number(options.stocks) || 3), 1, 9);
  const duration = clamp(Number(options.duration) || 150, 10, 600);
  const state = {
    version: 2,
    lesson: options.lesson || null,
    compact: Boolean(options.compact),
    victoryLap: Boolean(options.victoryLap),
    bounds: options.compact ? {left:-470,right:470,top:-680,bottom:680} : BOUNDS,
    cameraFeed: {x:0,width:370},
    scrap: [],
    training: {travel:0,jumps:0,specials:0,points:0,deliveries:0,carrying:false,heavyTime:0,medalTime:0,steadyTime:0,steadyBest:0,capsule:{x:-260,y:12},bayX:170},
    tick: 0,
    time: duration,
    duration,
    rule: options.rule === "timed" ? "timed" : "stocks",
    phase: "playing",
    seed,
    rng: seed,
    difficulty: clamp(Math.floor(Number(options.difficulty) || 0), 0, 2),
    assist: Boolean(options.assist),
    arena: selectedArena.id,
    fighters: characters.map((id, index) =>
      fighterFor(
        id,
        index,
        options.controllers?.[index] || (index === 0 ? "human" : "bot"),
        stocks,
        seed,
      ),
    ),
    platforms: selectedArena.platforms.map((p) => ({
      ...p,
      baseX: p.x,
      baseY: p.y,
      previousX: p.x,
      previousY: p.y,
      active: true,
      warning: false,
    })),
    projectiles: [],
    items: [],
    traps: [],
    events: [],
    winner: null,
    rankings: [],
    hitstop: 0,
    gravity: 790,
    gravityBoost: 0,
    hazard: { phase: "quiet", label: "", direction: 0, strength: 0, nextIn: 7 },
    nextItem: 6,
    nextId: 1,
    stats: { shots: 0, hits: 0, ringouts: 0, items: 0, elapsed: 0 },
  };
  if(state.compact) for(const p of state.platforms) {
    p.x*=0.46;p.baseX=p.x;p.previousX=p.x;p.w*=0.46;
    p.y*=0.78;p.baseY=p.y;p.previousY=p.y;
  }
  if(state.lesson==='salvage') state.nextItem=1;
  const floor = state.platforms[0];
  const spacing = Math.min(190, (floor.w - 140) / state.fighters.length);
  for (const fighter of state.fighters) {
    fighter.x = (fighter.index - (state.fighters.length - 1) / 2) * spacing;
    fighter.y = floor.y;
    fighter.grounded = true;
    fighter.platformId = floor.id;
  }
  state.training.capsule={x:state.platforms[1].x+state.platforms[1].w/2,y:state.platforms[1].y};
  state.training.bayX=floor.x+floor.w*0.8;
  return state;
}

function setAction(fighter, action, duration = 0.15) {
  fighter.action = action;
  fighter.actionTime = duration;
}

function spawnProjectile(state, fighter, options = {}) {
  const character = CHARACTER_MAP[fighter.id];
  const special = Boolean(options.special);
  const aimX = fighter.aimX;
  const aimY = fighter.aimY;
  const speed = options.speed || (fighter.id === "sera" ? 1080 : 860);
  const normalDamage = {
    iona: 7,
    rook: 9.3,
    sera: 12.5,
    tavi: 8,
    beam: 11,
    pip: 9.3,
  };
  const bullet = {
    id: state.nextId++,
    owner: fighter.index,
    x: fighter.x + aimX * 29,
    y: fighter.y - (options.height || 53) + aimY * 29,
    vx: aimX * speed,
    vy: aimY * speed,
    radius:
      options.radius ||
      (fighter.id === "sera" ? 8 : fighter.id === "beam" ? 10 : 7),
    damage: options.damage || normalDamage[fighter.id],
    power: options.power || (fighter.id === "sera" ? 1.12 : 1),
    gravity: fighter.id === "beam" && !special ? 230 : 0,
    life: options.life || 0.9,
    kind:
      options.kind ||
      (fighter.id === "beam"
        ? "medal"
        : fighter.id === "sera"
          ? "air"
          : "foam"),
    color: character.color,
    special,
  };
  state.projectiles.push(bullet);
  fighter.stats.shots += 1;
  if (fighter.index === 0 && (fighter.input.aimX !== 0 || fighter.input.aimY !== 0)) {
    if (aimY < -0.5) state.training.aimUp = true;
    if (aimY > 0.5) state.training.aimDown = true;
  }
  state.stats.shots += 1;
  event(state, "shot", {
    player: fighter.index,
    x: bullet.x,
    y: bullet.y,
    kind: bullet.kind,
    special,
    aimX,
    aimY,
  });
  if (!options.noAction) setAction(fighter, "shoot", special ? 0.35 : 0.17);
  return bullet;
}

function hit(
  state,
  target,
  ownerIndex,
  damage,
  power,
  direction,
  lift = 0.28,
  kind = "foam",
  trajectory = null,
) {
  if (!target.alive || target.respawn > 0 || target.invulnerable > 0)
    return false;
  const attacker = state.fighters[ownerIndex];
  if (target.counter > 0 && kind !== "counter") {
    target.counter = 0;
    target.invulnerable = 0.2;
    if (attacker?.alive && attacker.respawn <= 0) {
      hit(
        state,
        attacker,
        target.index,
        16,
        1.5,
        sign(attacker.x - target.x),
        0.55,
        "counter",
      );
    }
    event(state, "special", {
      player: target.index,
      x: target.x,
      y: target.y - 50,
      kind: "counter",
      name: "A PERFECTLY HEROIC POSE",
    });
    return true;
  }
  const character = CHARACTER_MAP[target.id];
  const assistance = state.assist && target.controller !== "bot" ? 0.8 : 1;
  target.damage = Math.min(300, target.damage + damage);
  const force =
    (((170 + target.damage * 3.3) * power) / Math.pow(character.weight, 0.85)) *
    assistance;
  target.vx = (trajectory?.aimX ?? direction) * force;
  target.vy = trajectory
    ? force * (trajectory.aimY - Math.abs(trajectory.aimX) * lift) - 60
    : -force * lift - 60;
  target.grounded = false;
  target.platformId = null;
  target.stun = Math.min(0.48, 0.12 + force / 2900) * (target.id === "sera" ? 0.75 : 1);
  target.invulnerable = 0.16;
  target.lastAttacker = ownerIndex;
  target.lastHitTick = state.tick;
  target.stats.taken += damage;
  if (attacker) {
    attacker.stats.hits += 1;
    attacker.stats.dealt += damage;
  }
  state.stats.hits += 1;
  if(attacker?.index===0 && attacker.onCamera) state.training.points++;
  if(state.scrap.length<24) state.scrap.push({x:target.x,y:target.y-15,life:6,vy:-90});

  state.hitstop = Math.max(state.hitstop, force > 630 ? 5 : 3);
  setAction(target, force > 520 ? "tumble" : "hit", target.stun + 0.12);
  event(state, "hit", {
    player: ownerIndex,
    target: target.index,
    x: target.x,
    y: target.y - 48,
    power: force,
    damage,
    kind,
    direction,
  });
  return true;
}

function useSpecial(state, fighter) {
  if(fighter.index===0) state.training.specials++;
  fighter.signatureTime=0.8;
  const name = CHARACTER_MAP[fighter.id].specialName;
  event(state, "special", {
    player: fighter.index,
    x: fighter.x,
    y: fighter.y - 45,
    kind: fighter.id,
    name,
  });
  setAction(fighter, "shoot", 0.38);
  if (fighter.id === "iona") {
    const active = state.platforms.filter((p) => p.active);
    const higher = active.filter((p) => p.y < fighter.y - 65);
    let footholds = fighter.grounded && higher.length ? higher : active;
    const aiming = fighter.input.aimX !== 0 || fighter.input.aimY !== 0;
    let directedGrapple = false;
    if (aiming) {
      const directed = footholds.filter(p => {
        const x = clamp(fighter.x + fighter.aimX * 300, p.x + 20, p.x + p.w - 20);
        const dy = p.y - 10 - (fighter.y - 53), dx = x - fighter.x;
        const reach = Math.hypot(dx, dy);
        return reach > 30 && reach < 650 && (dx * fighter.aimX + dy * fighter.aimY) / reach > 0.55;
      });
      if (directed.length) {
        footholds = directed;
        directedGrapple = true;
      }
    }
    const ledge = footholds.reduce((best, p) => {
      const point = { x: clamp(fighter.x + (directedGrapple ? fighter.aimX * 300 : 0), p.x + 20, p.x + p.w - 20), y: p.y };
      const score = Math.hypot(point.x - fighter.x, point.y - fighter.y);
      return !best || score < best.score ? { ...point, score } : best;
    }, null);
    fighter.grapple = ledge
      ? { x: ledge.x, y: ledge.y - 10, life: 0.3 }
      : { x: fighter.x + fighter.facing * 150, y: fighter.y - 220, life: 0.3 };
    const dx = fighter.grapple.x - fighter.x;
    const dy = fighter.grapple.y - fighter.y;
    const reach = Math.max(1, Math.hypot(dx, dy));
    fighter.vx = (dx / reach) * 800;
    fighter.vy = clamp((dy / reach) * 800, -680, 500);
    fighter.grounded = false;
    fighter.jumps = Math.min(fighter.jumps, 1);
    fighter.specialCooldown = 4.2;
    for (const opponent of state.fighters) {
      if (opponent.index !== fighter.index && distance(fighter, opponent) < 150)
        hit(
          state,
          opponent,
          fighter.index,
          10,
          1.08,
          sign(opponent.x - fighter.x),
          0.48,
          "grapple",
        );
    }
  } else if (fighter.id === "rook") {
    fighter.vx = fighter.facing * 730;
    fighter.vy = -520;
    fighter.grounded = false;
    fighter.specialDuration = 0.38;
    fighter.invulnerable = Math.max(fighter.invulnerable, 0.16);
    fighter.specialCooldown = 4.8;
    for (const opponent of state.fighters) {
      if (opponent.index !== fighter.index && distance(fighter, opponent) < 150)
        hit(
          state,
          opponent,
          fighter.index,
          13,
          1.25,
          sign(opponent.x - fighter.x),
          0.45,
          "jet",
        );
    }
  } else if (fighter.id === "sera") {
    fighter.charge = 0.32;
    fighter.specialCooldown = 5;
    fighter.vx *= 0.2;
    setAction(fighter, "shoot", 0.65);
  } else if (fighter.id === "tavi") {
    state.traps.push({
      id: state.nextId++,
      owner: fighter.index,
      x: fighter.x,
      y: fighter.y - 6,
      vy: 0,
      life: 7,
      armed: 0.3,
      radius: 45,
    });
    fighter.damage = Math.max(0, fighter.damage - 6);
    fighter.specialCooldown = 6;
    event(state, "item", {
      player: fighter.index,
      x: fighter.x,
      y: fighter.y - 50,
      kind: "repair",
      amount: 6,
    });
  } else if (fighter.id === "beam") {
    fighter.counter = 0.65;
    fighter.specialDuration = 0.65;
    fighter.specialCooldown = 5;
    for (const opponent of state.fighters) {
      if (
        opponent.index === fighter.index ||
        !opponent.alive ||
        opponent.respawn > 0
      )
        continue;
      if (
        Math.abs(opponent.x - fighter.x) < 280 &&
        Math.abs(opponent.y - fighter.y) < 140
      ) {
        opponent.blind = 1.2;
        opponent.slow = Math.max(opponent.slow, 0.6);
        hit(
          state,
          opponent,
          fighter.index,
          4,
          0.62,
          sign(opponent.x - fighter.x),
          0.36,
          "spotlight",
        );
      }
    }
  } else if (fighter.id === "pip") {
    fighter.vy = -700;
    fighter.vx *= 0.6;
    fighter.grounded = false;
    fighter.invulnerable = Math.max(fighter.invulnerable, 0.65);
    fighter.specialDuration = 0.65;
    fighter.specialCooldown = 5.2;
    for (const opponent of state.fighters) {
      if (opponent.index !== fighter.index && distance(fighter, opponent) < 170)
        hit(
          state,
          opponent,
          fighter.index,
          10,
          1.12,
          sign(opponent.x - fighter.x),
          0.65,
          "bubble",
        );
    }
  }
  if(state.victoryLap)fighter.specialCooldown*=0.72;
}

function updateArena(state) {
  const t = state.tick * STEP;
  let gravity = 790;
  let hazard = {
    phase: "quiet",
    label: "",
    direction: 0,
    strength: 0,
    nextIn: 0,
  };
  for (const p of state.platforms) {
    p.previousX = p.x;
    p.previousY = p.y;
    p.active = true;
    p.warning = false;
  }
  if (state.arena === "gravity") {
    const cycle = t % 17;
    if (cycle > 7 && cycle < 9)
      hazard = {
        phase: "warning",
        label: "GRAVITY SHIFT INCOMING",
        direction: 0,
        strength: 0,
        nextIn: 9 - cycle,
      };
    else if (cycle >= 9 && cycle < 14) {
      gravity = 470;
      const direction = Math.floor(t / 17) % 2 ? -1 : 1;
      hazard = {
        phase: "active",
        label: "GRAVITY IS DRIFTING",
        direction,
        strength: 135,
        nextIn: 14 - cycle,
      };
    }
  } else if (state.arena === "yard") {
    for (const p of state.platforms) {
      if (p.kind !== "drift") continue;
      const offset =
        p.id === "left" ? 0 : p.id === "right" ? Math.PI : Math.PI / 2;
      p.x = p.baseX + Math.sin(t * 0.48 + offset) * 66;
      p.y = p.baseY + Math.sin(t * 0.66 + offset) * 40;
    }
    hazard = {
      phase: "quiet",
      label: "SALVAGE ON THE MOVE",
      direction: 0,
      strength: 0,
      nextIn: 0,
    };
  } else if (state.arena === "studio") {
    const cycle = t % 15;
    const fallingId = Math.floor(t / 15) % 2 ? "set-left" : "set-right";
    const p = state.platforms.find((candidate) => candidate.id === fallingId);
    if (cycle >= 7 && cycle < 9) {
      p.warning = true;
      hazard = {
        phase: "warning",
        label: "SCENERY HAS AMBITIONS",
        direction: 0,
        strength: 0,
        nextIn: 9 - cycle,
      };
    } else if (cycle >= 9 && cycle < 12.5) {
      p.y = p.baseY + Math.min(500, (cycle - 9) * 180);
      p.active = cycle < 10.5;
      hazard = {
        phase: "active",
        label: "A SPECTACULAR SET CHANGE",
        direction: 0,
        strength: 0,
        nextIn: 12.5 - cycle,
      };
    } else {
      p.y = p.baseY;
    }
    for (const other of state.platforms) {
      if (other.kind === "scenery" && other.id !== fallingId)
        other.y = other.baseY;
    }
  } else if (state.arena === "airlock") {
    const cycle = t % 18;
    const direction = Math.floor(t / 18) % 2 ? -1 : 1;
    if (cycle >= 8 && cycle < 10.5)
      hazard = {
        phase: "warning",
        label: "PRESSURE EXERCISE INCOMING",
        direction,
        strength: 0,
        nextIn: 10.5 - cycle,
      };
    else if (cycle >= 10.5 && cycle < 15)
      hazard = {
        phase: "active",
        label: "AIRLOCK PULL",
        direction,
        strength: 270,
        nextIn: 15 - cycle,
      };
  }
  if(state.lesson==='lowg') gravity*=0.8;
  if(state.lesson==='centrifuge') {
    const cycle=t%16;
    if(cycle>=6 && cycle<8) hazard={phase:'warning',label:'HEAVY-g IN 2 SECONDS',direction:0,strength:0,nextIn:8-cycle};
    else if(cycle>=8 && cycle<14) {gravity=1450;hazard={phase:'active',label:'HEAVY-g / KEEP YOUR FOOTING',direction:0,strength:0,nextIn:14-cycle};}
  }
  // Generic one-g footing exercise. Its released name and briefing belong to
  // the build-time volume package, never to this shared simulation module.
  if(state.lesson==='steady') {
    gravity=1450;
    hazard={phase:'quiet',label:'',direction:0,strength:0,nextIn:0};
  }
  if (state.gravityBoost > 0 && state.lesson !== 'steady') gravity *= 0.63;
  if (hazard.phase !== state.hazard.phase && hazard.phase !== "quiet")
    event(state, "hazard", { ...hazard, x: 0, y: -260 });
  state.gravity = gravity;
  state.hazard = hazard;
}

function landOnPlatform(state, fighter, oldY) {
  if (fighter.vy < 0) return;
  let landing = null;
  for (const p of state.platforms) {
    if (!p.active || fighter.x < p.x - 10 || fighter.x > p.x + p.w + 10)
      continue;
    const previousSurface = p.previousY ?? p.y;
    if (
      oldY <= previousSurface + 6 &&
      fighter.y >= p.y &&
      (!landing || p.y < landing.y)
    )
      landing = p;
  }
  if (!landing) return;
  const wasFalling=fighter.vy>200, airJumps=fighter.jumps;
  fighter.y = landing.y;
  fighter.vy = 0;
  if(wasFalling) setAction(fighter,fighter.action==='tumble'||fighter.action==='hit'?'getup':'land',fighter.action==='tumble'?0.32:0.16);
  if(fighter.id==='pip' && airJumps>1 && (fighter.passiveCooldown||0)<=0) {
    fighter.damage=Math.max(0,fighter.damage-3);fighter.passiveCooldown=5;
    event(state,'passive',{player:fighter.index,x:fighter.x,y:fighter.y-70,kind:'second-chance'});
  }
  fighter.grounded = true;
  fighter.platformId = landing.id;
  fighter.jumps = 0;
  fighter.coyote = 0.1;
  fighter.assisted = false;
  if (fighter.stun <= 0 && fighter.action === "tumble")
    setAction(fighter, "idle", 0);
}

function ringout(state, fighter) {
  if (state.rule !== "timed") fighter.stocks -= 1;
  fighter.stats.recoveries += 1;
  state.stats.ringouts += 1;
  const attacker =
    state.tick - fighter.lastHitTick < 480
      ? state.fighters[fighter.lastAttacker]
      : null;
  if (attacker && attacker.index !== fighter.index) {
    if(!['camera','final'].includes(state.lesson) || attacker.onCamera) attacker.score += state.victoryLap?2:1;
    attacker.stats.ringouts += 1;
  }
  event(state, "ringout", {
    player: fighter.index,
    target: attacker?.index ?? -1,
    x: clamp(fighter.x, BOUNDS.left, BOUNDS.right),
    y: clamp(fighter.y, BOUNDS.top, BOUNDS.bottom),
    damage: fighter.damage,
    stocks: fighter.stocks,
  });
  fighter.vx = 0;
  fighter.vy = 0;
  fighter.alive = fighter.stocks > 0;
  fighter.respawn = fighter.alive ? 1.4 : 0;
  fighter.damage = 0;
  if(fighter.index===0) state.training.carrying=false;
  fighter.grapple = null;
  fighter.counter = 0;
  fighter.charge = 0;
  fighter.specialDuration = 0;
  fighter.stun = 0;
  fighter.slow = 0;
  fighter.blind = 0;
  fighter.itemEffects = [];
  setAction(fighter, "tumble", 1.4);
}

function recoverFighter(state, fighter) {
  const floor = state.platforms[0];
  fighter.x = clamp(
    (fighter.index - (state.fighters.length - 1) / 2) * 120,
    floor.x + 50,
    floor.x + floor.w - 50,
  );
  fighter.y = -235;
  fighter.vx = 0;
  fighter.vy = 25;
  fighter.invulnerable = 2.2;
  fighter.grounded = false;
  fighter.platformId = null;
  fighter.jumps = 0;
  fighter.specialCooldown = Math.min(fighter.specialCooldown, 1);
  fighter.previousInput = inputFrame();
  fighter.lastAttacker = -1;
  fighter.lastHitTick = -1000;
  setAction(fighter, "jump", 0.3);
  event(state, "respawn", {
    player: fighter.index,
    x: fighter.x,
    y: fighter.y,
  });
}

function applyRecoil(fighter, force) {
  fighter.vx -= fighter.aimX * force;
  // Keep grounded footing. The existing airborne kick follows the shot vector.
  if (!fighter.grounded) fighter.vy -= fighter.aimY * force;
}

function updateFighter(state, fighter, suppliedInput) {
  const input = inputFrame(suppliedInput);
  if (fighter.bufferedShot && !input.shoot) {
    input.shoot = true;
    Object.assign(input, fighter.bufferedShot);
  }
  fighter.bufferedShot = null;
  fighter.input = input;
  const jumpPressed =
    fighter.bufferedJump || (input.jump && !fighter.previousInput.jump);
  const specialPressed =
    fighter.bufferedSpecial ||
    (input.special && !fighter.previousInput.special);
  fighter.bufferedJump = false;
  fighter.bufferedSpecial = false;
  fighter.previousInput = { ...input };
  if (!fighter.alive) return;
  if (fighter.respawn > 0) {
    fighter.respawn = Math.max(0, fighter.respawn - STEP);
    if (fighter.respawn === 0) recoverFighter(state, fighter);
    return;
  }
  const character = CHARACTER_MAP[fighter.id];
  fighter.itemEffects = (fighter.itemEffects || [])
    .map(effect => ({...effect, remaining: Math.max(0, effect.remaining - STEP)}))
    .filter(effect => effect.remaining > 0);
  for (const timer of [
    "cooldown",
    "signatureTime",
    "passiveCooldown",
    "specialCooldown",
    "specialDuration",
    "stun",
    "slow",
    "blind",
    "counter",
    "invulnerable",
    "actionTime",
  ])
    fighter[timer] = Math.max(0, (fighter[timer] || 0) - STEP);
  if (fighter.grapple) {
    fighter.grapple.life -= STEP;
    if (fighter.grapple.life <= 0) fighter.grapple = null;
  }
  if (fighter.grounded) {
    const support = state.platforms.find(
      (p) => p.id === fighter.platformId && p.active,
    );
    if (
      support &&
      fighter.x >= support.x - 12 &&
      fighter.x <= support.x + support.w + 12
    ) {
      fighter.x += support.x - support.previousX;
      fighter.y = support.y;
      fighter.coyote = 0.1;
    } else {
      fighter.grounded = false;
      fighter.platformId = null;
    }
  }
  if (!fighter.grounded) fighter.coyote = Math.max(0, fighter.coyote - STEP);
  fighter.jumpBuffer = jumpPressed
    ? 0.13
    : Math.max(0, fighter.jumpBuffer - STEP);
  const canAct = fighter.stun <= 0;
  if (canAct) {
    const speed = character.speed * (fighter.slow > 0 ? 0.42 : 1) * (state.compact?0.76:1) / (1+(fighter.medalMass||0)*0.25);
    if (Math.abs(input.move) > 0.1) {
      fighter.facing = sign(input.move);
      fighter.vx = approach(
        fighter.vx,
        input.move * speed,
        (fighter.grounded ? 2450 : fighter.id==="iona"?1142:1020) * STEP,
      );
    } else {
      fighter.vx = approach(
        fighter.vx,
        0,
        (fighter.grounded ? 2400 : 330) * STEP,
      );
    }
    if (input.aimX !== 0 || input.aimY !== 0) {
      fighter.aimX = input.aimX;
      fighter.aimY = input.aimY;
      if (Math.abs(input.aimX) > 0.001) fighter.facing = sign(input.aimX);
    } else {
      fighter.aimX = fighter.facing;
      fighter.aimY = 0;
    }
    const canJump =
      fighter.grounded ||
      fighter.coyote > 0 ||
      fighter.jumps < fighter.maxJumps;
    if (fighter.jumpBuffer > 0 && canJump && fighter.charge <= 0) {
      // Walking off the ledge consumes the ground jump, while coyote time preserves it.
      if (!fighter.grounded && fighter.coyote <= 0 && fighter.jumps === 0)
        fighter.jumps = 1;
      if (fighter.jumps < fighter.maxJumps) {
        fighter.vy = -(fighter.id === "iona"
          ? 640
          : fighter.id === "sera"
            ? 590
            : 615);
        if(state.compact) fighter.vy*=0.88;
        fighter.vy/=1+(fighter.medalMass||0)*0.1;
        fighter.jumps += 1;
        if(fighter.index===0) state.training.jumps++;
        fighter.grounded = false;
        fighter.platformId = null;
        fighter.coyote = 0;
        fighter.jumpBuffer = 0;
        setAction(fighter, "jump", 0.16);
        event(state, "jump", {
          player: fighter.index,
          x: fighter.x,
          y: fighter.y,
          air: fighter.jumps > 1,
        });
      }
    }
    if (specialPressed && fighter.specialCooldown <= 0 && fighter.charge <= 0)
      useSpecial(state, fighter);
    if (input.shoot && fighter.cooldown <= 0 && fighter.charge <= 0) {
      spawnProjectile(state, fighter);
      fighter.cooldown = character.fireRate;
      applyRecoil(fighter, fighter.id === "sera" ? 48 : 16);
    }
  } else {
    fighter.vx = fighter.vx * 0.992 + input.move * 200 * STEP;
  }
  if (fighter.charge > 0) {
    fighter.charge = Math.max(0, fighter.charge - STEP);
    if (fighter.charge === 0 && fighter.stun <= 0) {
      spawnProjectile(state, fighter, {
        special: true,
        damage: 22,
        power: 1.65,
        radius: 17,
        speed: 1250,
        kind: "pressure",
        life: 0.9,
      });
      applyRecoil(fighter, 160);
    }
  }
  if (!fighter.grounded) fighter.vy += state.gravity * STEP;
  fighter.vx += state.hazard.direction * state.hazard.strength * STEP;
  fighter.vx = clamp(fighter.vx, -1550, 1550);
  fighter.vy = clamp(fighter.vy, -1200, 1250);
  const oldY = fighter.y;
  fighter.x += fighter.vx * STEP;
  fighter.y += fighter.vy * STEP;
  if (!fighter.grounded) landOnPlatform(state, fighter, oldY);
  // Human assistance supplies one modest safety nudge per airborne excursion.
  if (
    state.assist &&
    fighter.controller !== "bot" &&
    !fighter.assisted &&
    fighter.y > 430 &&
    fighter.vy > 0 &&
    Math.abs(fighter.x) < 760
  ) {
    fighter.assisted = true;
    fighter.vy = -550;
    fighter.vx = -sign(fighter.x) * 350;
    event(state, "special", {
      player: fighter.index,
      x: fighter.x,
      y: fighter.y,
      kind: "assist",
      name: "RECOVERY ASSIST",
    });
  }
  if (
    fighter.x < state.bounds.left ||
    fighter.x > state.bounds.right ||
    fighter.y > state.bounds.bottom ||
    fighter.y < state.bounds.top
  ) {
    ringout(state, fighter);
    return;
  }
  if(fighter.index===0) state.training.travel+=Math.abs(input.move)*Math.abs(fighter.vx)*STEP;
  if(fighter.id==='rook' && !fighter.grounded) fighter.specialCooldown=Math.max(0,fighter.specialCooldown-STEP*0.25);
  if(fighter.id==='beam' && fighter.onCamera) fighter.damage=Math.max(0,fighter.damage-1.0*STEP);
  if (fighter.actionTime <= 0)
    fighter.action = fighter.grounded
      ? Math.abs(fighter.vx) > 35
        ? "run"
        : "idle"
      : fighter.stun > 0
        ? "tumble"
        : "jump";
}

function segmentHitsFighter(x1, y1, x2, y2, fighter, radius) {
  // Swept point versus expanded body avoids tunnelling by fast pressure slugs.
  const left = fighter.x - 19 - radius;
  const right = fighter.x + 19 + radius;
  const top = fighter.y - 87 - radius;
  const bottom = fighter.y - 7 + radius;
  let near = 0;
  let far = 1;
  for (const [start, delta, min, max] of [
    [x1, x2 - x1, left, right],
    [y1, y2 - y1, top, bottom],
  ]) {
    if (Math.abs(delta) < 0.000001) {
      if (start < min || start > max) return false;
      continue;
    }
    let enter = (min - start) / delta;
    let exit = (max - start) / delta;
    if (enter > exit) [enter, exit] = [exit, enter];
    near = Math.max(near, enter);
    far = Math.min(far, exit);
    if (near > far) return false;
  }
  return near <= 1 && far >= 0;
}

function updateProjectiles(state) {
  for (const bullet of state.projectiles) {
    const oldX = bullet.x;
    const oldY = bullet.y;
    bullet.x += bullet.vx * STEP;
    bullet.y += bullet.vy * STEP;
    bullet.vy += bullet.gravity * STEP;
    bullet.life -= STEP;
    for (const fighter of state.fighters) {
      if (
        fighter.index === bullet.owner ||
        !fighter.alive ||
        fighter.respawn > 0 ||
        fighter.invulnerable > 0
      )
        continue;
      if (
        segmentHitsFighter(
          oldX,
          oldY,
          bullet.x,
          bullet.y,
          fighter,
          bullet.radius,
        )
      ) {
        if (
          hit(
            state,
            fighter,
            bullet.owner,
            bullet.damage,
            bullet.power,
            sign(bullet.vx),
            bullet.special ? 0.22 : 0.28,
            bullet.kind,
            quantizeAim(bullet.vx, bullet.vy),
          )
        ) {
          bullet.life = 0;
          break;
        }
      }
    }
  }
  state.projectiles = state.projectiles.filter(
    (bullet) =>
      bullet.life > 0 &&
      Math.abs(bullet.x) < 1100 &&
      bullet.y < 850 &&
      bullet.y > -800,
  );
}

function updateTraps(state) {
  for (const trap of state.traps) {
    trap.life -= STEP;
    trap.armed = Math.max(0, trap.armed - STEP);
    const support = state.platforms.find(
      (p) => p.id === trap.platformId && p.active,
    );
    if (support) {
      trap.x += support.x - support.previousX;
      trap.y += support.y - support.previousY;
    }
    const oldY = trap.y;
    trap.vy += state.gravity * STEP;
    trap.y += trap.vy * STEP;
    trap.platformId = null;
    for (const p of state.platforms) {
      if (
        p.active &&
        trap.x >= p.x &&
        trap.x <= p.x + p.w &&
        oldY <= p.y &&
        trap.y >= p.y
      ) {
        trap.y = p.y;
        trap.vy = 0;
        trap.platformId = p.id;
        break;
      }
    }
    if (trap.armed > 0) continue;
    for (const fighter of state.fighters) {
      if (
        fighter.index !== trap.owner &&
        Math.abs(fighter.x - trap.x) < 55 &&
        Math.abs(fighter.y - trap.y) < 80
      ) {
        if (
          hit(
            state,
            fighter,
            trap.owner,
            16,
            1.38,
            sign(fighter.x - trap.x),
            0.8,
            "trap",
          )
        ) {
          fighter.slow = 1.4;
          trap.life = 0;
          break;
        }
      }
    }
  }
  state.traps = state.traps.filter((trap) => trap.life > 0 && trap.y < 800);
}

function collectItem(state, fighter, item) {
  fighter.stats.pickups += 1;
  state.stats.items += 1;
  if (item.kind === "biscuit")
    fighter.damage = Math.max(0, fighter.damage - 32);
  const showEffect = (recipient, kind, duration) => {
    recipient.itemEffects = (recipient.itemEffects || []).filter(effect => effect.kind !== kind);
    recipient.itemEffects.push({kind, duration, remaining: duration});
  };
  if (item.kind === "medal") {
    fighter.invulnerable = 3;
    showEffect(fighter, 'medal', 3);
  }
  if (item.kind === "tape") {
    for (const other of state.fighters) {
      if (other.index !== fighter.index && other.alive && other.respawn <= 0)
        {
          other.slow = 2.5;
          showEffect(other, 'tape', 2.5);
        }
    }
  }
  if (item.kind === "gravity") {
    state.gravityBoost = 5;
    for(const other of state.fighters)if(other.alive && other.respawn<=0) showEffect(other,'gravity',5);
  }
  event(state, "item", {
    player: fighter.index,
    x: fighter.x,
    y: fighter.y - 65,
    kind: item.kind,
    duration: {medal:3,tape:2.5,gravity:5}[item.kind] || 0,
  });
  item.life = 0;
}

function updateItems(state) {
  state.nextItem -= STEP;
  state.gravityBoost = Math.max(0, state.gravityBoost - STEP);
  if (state.nextItem <= 0) {
    const kind = ITEMS[Math.floor(random(state) * ITEMS.length)].id;
    state.items.push({
      id: state.nextId++,
      kind,
      x: (random(state) - 0.5) * 680,
      y: -390,
      vy: 70,
      life: 14,
      landed: false,
    });
    state.nextItem = state.lesson==="salvage" ? 3 : 9 + random(state) * 4;
    event(state, "drop", { kind, x: state.items.at(-1).x, y: -390 });
  }
  for (const item of state.items) {
    item.life -= STEP;
    const support = state.platforms.find(
      (p) => p.id === item.platformId && p.active,
    );
    if (support) {
      item.x += support.x - support.previousX;
      item.y += support.y - support.previousY;
    }
    const oldY = item.y;
    item.vy += state.gravity * 0.35 * STEP;
    item.y += item.vy * STEP;
    item.platformId = null;
    item.landed = false;
    for (const p of state.platforms) {
      if (
        p.active &&
        item.x > p.x &&
        item.x < p.x + p.w &&
        oldY <= p.y - 14 &&
        item.y >= p.y - 14
      ) {
        item.y = p.y - 14;
        item.vy = 0;
        item.landed = true;
        item.platformId = p.id;
        break;
      }
    }
    for (const fighter of state.fighters) {
      if (
        fighter.alive &&
        fighter.respawn <= 0 &&
        Math.abs(fighter.x - item.x) < 35 &&
        item.y > fighter.y - 110 &&
        item.y < fighter.y + 20
      ) {
        collectItem(state, fighter, item);
        break;
      }
    }
  }
  state.items = state.items.filter((item) => item.life > 0 && item.y < 790);
}

export function finishMatch(state) {
  state.rankings = state.fighters
    .map((f) => f.index)
    .sort((a, b) => {
      const first = state.fighters[a];
      const second = state.fighters[b];
      if (state.rule === "timed") {
        const firstNet = first.score - first.stats.recoveries;
        const secondNet = second.score - second.stats.recoveries;
        return (
          secondNet - firstNet ||
          second.score - first.score ||
          first.stats.recoveries - second.stats.recoveries ||
          first.damage - second.damage ||
          a - b
        );
      }
      return (
        second.stocks - first.stocks ||
        second.score - first.score ||
        first.damage - second.damage ||
        second.stats.dealt - first.stats.dealt ||
        a - b
      );
    });
  state.winner = state.rankings[0];
  state.phase = "finished";
  const winner = state.fighters[state.winner];
  winner.action = "victory";
  winner.actionTime = 99;
  event(state, "finish", { player: state.winner, x: winner.x, y: winner.y });
}

function updateTraining(state) {
  const t=state.training,lead=state.fighters.slice().sort((a,b)=>(b.score*8+b.stats.hits)-(a.score*8+a.stats.hits)||a.index-b.index)[0];
  state.cameraFeed.x=Math.sin(state.tick/60*0.31)*(state.compact?125:330);
  state.cameraFeed.width=state.compact?250:420;
  for(const f of state.fighters){
    f.onCamera=f.alive && f.respawn<=0 && Math.abs(f.x-state.cameraFeed.x)<state.cameraFeed.width/2;
    f.medalMass=['medal','final'].includes(state.lesson)&&f===lead?Math.min(2.5,0.4+state.tick/3600):0;
  }
  const f=state.fighters[0];
  if(f.alive && f.respawn<=0){
    if(state.lesson==='centrifuge' && state.gravity>1000 && f.grounded)t.heavyTime+=STEP;
    if(f.medalMass>0)t.medalTime+=STEP;
    if(state.lesson==='rescue'){
      const capsule=t.capsule;
      if(!t.carrying && Math.abs(f.x-capsule.x)<65 && Math.abs(f.y-capsule.y)<110){
        t.carrying=true;
        event(state,'item',{player:0,x:f.x,y:f.y-70,kind:'capsule'});
      }
      if(t.carrying && Math.abs(f.x-t.bayX)<70 && f.grounded && f.platformId===state.platforms[0].id){
        t.deliveries++;t.carrying=false;
        const next=state.platforms[1+(t.deliveries%2)];
        t.capsule={x:next.x+next.w/2,y:next.y};
        event(state,'item',{player:0,x:f.x,y:f.y-90,kind:'delivery'});
      }
    }
  }
  for(const part of state.scrap){
    part.life-=STEP;part.vy+=state.gravity*STEP;const oldY=part.y;part.y+=part.vy*STEP;
    for(const p of state.platforms)if(p.active&&part.x>p.x&&part.x<p.x+p.w&&oldY<=p.y&&part.y>=p.y){part.y=p.y;part.vy=0;break;}
    for(const tavi of state.fighters)if(tavi.id==='tavi'&&(tavi.passiveCooldown||0)<=0&&tavi.alive&&tavi.respawn<=0&&Math.abs(tavi.x-part.x)<50&&Math.abs(tavi.y-part.y)<90){
      part.life=0;tavi.passiveCooldown=3;tavi.damage=Math.max(0,tavi.damage-4);tavi.specialCooldown=Math.max(0,tavi.specialCooldown-0.35);
      event(state,'passive',{player:tavi.index,x:tavi.x,y:tavi.y-70,kind:'salvage'});break;
    }
  }
  state.scrap=state.scrap.filter(p=>p.life>0&&p.y<750);
}

export function stepMatch(state, inputs = []) {
  state.events = [];
  if (state.phase !== "playing") return state;
  state.tick += 1;
  state.time = Math.max(0, state.duration - state.tick * STEP);
  state.stats.elapsed = state.tick * STEP;
  if (state.hitstop > 0) {
    state.hitstop -= 1;
    for (const fighter of state.fighters) {
      const input = inputFrame(inputs[fighter.index]);
      fighter.bufferedJump ||= input.jump && !fighter.previousInput.jump;
      fighter.bufferedSpecial ||=
        input.special && !fighter.previousInput.special;
      if (input.shoot) fighter.bufferedShot = { aimX: input.aimX, aimY: input.aimY };
    }
    if (state.time === 0) finishMatch(state);
    return state;
  }
  updateArena(state);
  updateTraining(state);
  for (const fighter of state.fighters)
    updateFighter(state, fighter, inputs[fighter.index]);
  updateProjectiles(state);
  updateTraps(state);
  updateItems(state);
  if(state.lesson==='steady') {
    const f=state.fighters[0], t=state.training;
    // Evaluate after this tick's movement and contacts: a jump or impact on
    // the deadline cannot be counted as another standing frame.
    if(f.alive && f.respawn<=0 && f.grounded && f.stun<=0) {
      t.steadyTicks=(t.steadyTicks||0)+1;
    } else t.steadyTicks=0;
    t.steadyTime=t.steadyTicks*STEP;
    t.steadyBest=Math.max(t.steadyBest||0,t.steadyTime);
  }
  if (
    state.time === 0 ||
    (state.rule !== "timed" &&
      state.fighters.filter((fighter) => fighter.alive).length <= 1)
  )
    finishMatch(state);
  return state;
}

function botRandom(ai) {
  ai.rng = (Math.imul(ai.rng, 1664525) + 1013904223) >>> 0;
  return ai.rng / 4294967296;
}

export function botInput(state, index) {
  const fighter = state.fighters[index];
  if (
    !fighter ||
    !fighter.alive ||
    fighter.respawn > 0 ||
    state.phase !== "playing"
  )
    return inputFrame();
  const ai = fighter.ai;
  const reaction = [23, 14, 8][state.difficulty] + (fighter.blind > 0 ? 10 : 0);
  if (state.tick < ai.nextThink) {
    return { ...ai.decision, jump: false, special: false };
  }
  ai.nextThink = state.tick + reaction;
  const opponents = state.fighters.filter(
    (other) => other.index !== index && other.alive && other.respawn <= 0,
  );
  if (!opponents.length) return inputFrame();
  const target = opponents.reduce(
    (best, other) =>
      !best || distance(fighter, other) < distance(fighter, best)
        ? other
        : best,
    null,
  );
  ai.target = target.index;
  let destination = target.x;
  let targetY = target.y;
  const item = state.items.find(
    (candidate) =>
      candidate.landed &&
      Math.abs(candidate.x - fighter.x) < 350 &&
      (candidate.kind !== "biscuit" || fighter.damage > 25),
  );
  if (item && botRandom(ai) < 0.7) {
    destination = item.x;
    targetY = item.y + 14;
  }
  const availablePlatforms = state.platforms.filter(
    (p) => p.active && !p.warning,
  );
  const beneath = availablePlatforms
    .filter(
      (p) =>
        p.y >= fighter.y - 25 &&
        p.x - 10 <= fighter.x &&
        p.x + p.w + 10 >= fighter.x,
    )
    .sort((a, b) => a.y - b.y)[0];
  const recovery = !beneath && !fighter.grounded;
  let jump = false;
  let special = false;
  let move = 0;
  if (recovery) {
    const nearest = availablePlatforms.reduce((best, p) => {
      const x = clamp(fighter.x, p.x + 45, p.x + p.w - 45);
      const score = Math.hypot(x - fighter.x, p.y - fighter.y);
      return !best || score < best.score ? { x, y: p.y, score } : best;
    }, null);
    destination = nearest?.x ?? 0;
    move = clamp((destination - fighter.x) / 75, -1, 1);
    const descending = fighter.vy > -100;
    jump =
      descending &&
      fighter.y > -360 &&
      state.tick - ai.lastJump > 24 &&
      fighter.jumps < fighter.maxJumps;
    special =
      descending &&
      fighter.y > -360 &&
      fighter.specialCooldown <= 0 &&
      (fighter.jumps >= fighter.maxJumps || fighter.y > 350) &&
      ["iona", "rook", "pip"].includes(fighter.id);
  } else {
    const delta = destination - fighter.x;
    const preferredRange =
      fighter.id === "sera" ? 300 : fighter.id === "tavi" ? 135 : 220;
    if (Math.abs(delta) > preferredRange || Math.abs(targetY - fighter.y) > 110)
      move = sign(delta);
    else if (Math.abs(delta) < 90 && fighter.id !== "tavi")
      move = -sign(delta) * 0.8;
    else if (sign(delta) !== fighter.facing) move = sign(delta) * 0.14;
    // Fighters reach a higher tier by first moving beneath its accessible edge.
    if (targetY < fighter.y - 100) {
      const step = availablePlatforms
        .filter((p) => p.y < fighter.y - 70 && p.y > fighter.y - 330)
        .sort(
          (a, b) =>
            Math.abs(a.x + a.w / 2 - fighter.x) -
            Math.abs(b.x + b.w / 2 - fighter.x),
        )[0];
      if (step) {
        const approachX = clamp(fighter.x, step.x + 35, step.x + step.w - 35);
        move = clamp((approachX - fighter.x) / 65, -1, 1);
        jump =
          Math.abs(approachX - fighter.x) < 130 &&
          state.tick - ai.lastJump > 32 &&
          fighter.grounded;
      }
    } else if (
      fighter.grounded &&
      botRandom(ai) < [0.035, 0.05, 0.075][state.difficulty]
    )
      jump = true;
    // An AI uses the same recovery resources as a human and respects stage edges.
    const support = availablePlatforms.find((p) => p.id === fighter.platformId);
    if (
      support &&
      ((move > 0 && fighter.x > support.x + support.w - 55) ||
        (move < 0 && fighter.x < support.x + 55))
    ) {
      if (Math.abs(target.x) < 610 && target.y < fighter.y + 120)
        jump = state.tick - ai.lastJump > 30;
      else move = -sign(fighter.x) * 0.65;
    }
    const inSpecialRange =
      Math.abs(target.x - fighter.x) <
        (fighter.id === "sera" ? 530 : fighter.id === "beam" ? 275 : 150) &&
      Math.abs(target.y - fighter.y) < 125;
    special =
      inSpecialRange &&
      fighter.specialCooldown <= 0 &&
      botRandom(ai) < [0.22, 0.48, 0.7][state.difficulty];
    if (
      fighter.id === "tavi" &&
      fighter.damage > 45 &&
      fighter.specialCooldown <= 0
    )
      special = true;
  }
  // A visible, armed floor trap is a jumpable obstacle for every cadet. The
  // same reaction interval still applies; no unpublished input is inspected.
  const approachingTrap = state.traps.find(trap =>
    trap.owner !== fighter.index && trap.life > 0 && trap.armed < 0.45 &&
    Math.abs(trap.y - fighter.y) < 85 &&
    Math.abs(trap.x - fighter.x) < 100 &&
    (Math.abs(trap.x - fighter.x) < 65 || sign(trap.x - fighter.x) === sign(move)));
  if(approachingTrap && fighter.grounded && state.tick-ai.lastJump>30) jump=true;
  const horizontal = target.x - fighter.x;
  const vertical = target.y - fighter.y;
  const range = Math.hypot(horizontal, vertical);
  // One held angular error per visible reaction, with a broad cone on Easy.
  const aimError = (botRandom(ai) - 0.5) * [0.64, 0.32, 0.14][state.difficulty];
  const arc = fighter.id === 'beam' ? 0.5 * 230 * Math.pow(range / 860, 2) : 0;
  const angle = Math.atan2(vertical - arc, horizontal) + aimError;
  const aimX = Math.cos(angle), aimY = Math.sin(angle);
  const shoot =
    range < 780 &&
    botRandom(ai) > [0.38, 0.17, 0.04][state.difficulty];
  if (jump) ai.lastJump = state.tick;
  if (special) ai.lastSpecial = state.tick;
  ai.decision = inputFrame({ move, jump, shoot, special,
    aimX: recovery && special ? 0 : aimX, aimY: recovery && special ? 0 : aimY });
  return { ...ai.decision };
}

export function snapshot(state) {
  return JSON.parse(JSON.stringify(state));
}
