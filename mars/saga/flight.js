// MARS Saga. A side-scrolling rescue adaptation of Volume 1.
// The fixed world coordinates keep saves independent of screen orientation.
export const FLIGHT_WIDTH = 1200;
export const FLIGHT_HEIGHT = 720;
export const FLIGHT_BOSS_SPAN = 3600;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const INK = "#071c29";
const PAPER = "#e7debd";
const CYAN = "#9cddd5";
const AMBER = "#efb960";
const RED = "#eb7658";
const SECTOR_ENDS = [66, 136, 210];
const SECTORS = [
  [
    "THE CAPSULE FIELD",
    "Find Pip’s capsule. Hold WINCH close to its blue recovery eye.",
  ],
  [
    "THE CLEARANCE RAIL",
    "Tow a loose plate. Hold WINCH and steer to place it between Moth and danger.",
  ],
  [
    "THE LONG APPROACH",
    "Keep the rescue aboard. Clear the maintenance drones ahead.",
  ],
  [
    "THE COUNTERWEIGHT",
    "Read the warning rail. Clear three exposed machine catches.",
  ],
];

export function createFlight({ assist = false, calm = false } = {}) {
  return {
    version: 1,
    t: 0,
    route: 0,
    sector: 0,
    bossTime: 0,
    assist,
    calm,
    hull: assist ? 6 : 4,
    maxHull: assist ? 6 : 4,
    invulnerable: 2.5,
    rescued: 0,
    scrap: 0,
    shields: 0,
    shots: 0,
    hits: 0,
    recoveries: 0,
    disabled: 0,
    done: false,
    ship: { x: 260, y: 375, vx: 0, vy: 0 },
    plate: { x: 450, y: 420, vx: -36, vy: 0, attached: false, integrity: 5 },
    capsule: { x: 1080, y: 300, progress: 0, visible: false },
    drones: [],
    debris: [],
    projectiles: [],
    pulses: [],
    particles: [],
    fireCooldown: 0,
    hazardClock: 3.6,
    droneClock: 5,
    wave:0, obstacles:[], obstacleClock:18, shake:0,
    nextId: 1,
    events: [],
    checkpoint: 0,
    messageTime: 6,
    message: "Pip’s beacon is ahead. The yellow dummy is a separate seat.",
    boss: {
      width: FLIGHT_BOSS_SPAN,
      module: 0,
      hp: 13,
      maxHp: 13,
      cycle: 0,
      cycleTime: 0,
      phase: "approach",
      warningY: 360,
      beamY: 360,
      openingY: 360,
      cleared: [],
      entered: false,
      latch:0, shieldCharge:0, travel:0,
    },
    rng: 270501,
  };
}

function random(state) {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}

function emit(state, type, detail = {}) {
  state.events.push({ type, ...detail });
}

function message(state, text, seconds = 4) {
  state.message = text;
  state.messageTime = seconds;
}

function spawnDrone(state) {
 const formation=state.wave++%4,base=formation===0?250:formation===1?460:360;
 const patterns=[[[0,0],[120,-90],[120,90]],[[0,-140],[0,0],[0,140],[120,70]],[[0,-160],[120,-80],[240,0],[360,80]],[[0,-120],[100,120],[200,-120],[300,120]]];
 for(const [dx,dy] of patterns[formation]){
  const y=clamp(base+dy,110,610);state.drones.push({id:state.nextId++,x:1320+dx,y,baseY:y,speed:110+state.sector*18,hp:2+ +(state.sector===2),clock:3+dx/200,age:0,warning:0,formation});
 }
 message(state,['CHEVRON ? a clear lane beneath the wings.','COLUMN ? go around the end.','STAIRCASE ? follow the open diagonal.','PAIRS ? read the alternating gap.'][formation],4);emit(state,'formation');
}

function spawnDebris(state) {
  state.debris.push({
    id: state.nextId++,
    x: 1280,
    y: 90 + random(state) * 545,
    radius: 20 + random(state) * 17,
    speed: 92 + random(state) * 45,
    angle: random(state) * 6,
    spin: random(state) - 0.5,
  });
}

function sparks(state, x, y, colour, count = 10) {
  for (let i = 0; i < count; i++) {
    const angle = random(state) * Math.PI * 2;
    const speed = 40 + random(state) * 140;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + random(state) * 0.4,
      colour,
    });
  }
  if (state.particles.length > 100)
    state.particles.splice(0, state.particles.length - 100);
}

function recoverHull(state, x, y) {
  if (state.invulnerable > 0) return;
  state.hits++;
  state.shake=12;state.ship.vx-=100;
  state.hull--;
  state.invulnerable = state.assist ? 2.4 : 1.8;
  sparks(state, x, y, RED, 16);
  emit(state, "hit", { x, y, hull: state.hull });
  if (state.hull > 0) return;
  // The ship returns to the nearest safe part of this route. Pip remains aboard.
  state.recoveries++;
  state.hull = state.maxHull;
  state.invulnerable = 4;
  state.ship = { x: 230, y: 375, vx: 0, vy: 0 };
  state.pulses = [];
  state.debris = [];
  state.drones = [];
  state.projectiles = [];
  if (state.sector < 3) state.route = state.checkpoint;
  else {
    state.boss.hp = state.boss.maxHp;
    state.boss.phase = "telegraph";
    state.boss.cycleTime = 0;
    state.boss.cycle = 0;
  }
  message(state, "Safe recovery. Pip stays aboard. Try a different line.", 5);
  emit(state, "recovery");
}

function updateRescue(state, input, dt) {
  const capsule = state.capsule;
  if (state.rescued || state.route < 15) return;
  if (!capsule.visible) {
    capsule.visible = true;
    message(
      state,
      "Pip’s capsule. Slow down beside the blue eye and hold WINCH.",
      6,
    );
    emit(state, "beacon");
  }
  capsule.x = Math.max(570, capsule.x - 43 * dt);
  capsule.y = 300 + Math.sin(state.t * 0.45) * 36;
  if (input.winch && distance(state.ship, capsule) < 135) {
    capsule.progress = Math.min(1.4, capsule.progress + dt);
    if (capsule.progress < 1.4) return;
    state.rescued = 1;
    capsule.visible = false;
    sparks(state, capsule.x, capsule.y, CYAN, 22);
    message(state, "Pip aboard. The dummy stays with us. Keep going.", 6);
    emit(state, "rescue", { x: capsule.x, y: capsule.y });
  } else {
    capsule.progress = Math.max(0, capsule.progress - dt * 0.4);
  }
}

function updatePlate(state, input, dt) {
  const plate = state.plate;
  const ship = state.ship;
  if (!plate.attached) {
    plate.x = Math.max(425, plate.x - 19 * dt);
    plate.y = 430 + Math.sin(state.t * 0.7) * 32;
    if (input.winch && distance(ship, plate) < 155) {
      plate.attached = true;
      plate.integrity = 5;
      message(
        state,
        "Plate secured. Hold WINCH to brace it ahead. Steer to swing the shield.",
        6,
      );
      emit(state, "hook", { x: plate.x, y: plate.y });
    }
    return;
  }
  const direction = input.winch ? 1 : -1;
  const aimY = clamp(input.y || 0, -1, 1);
  const targetX = ship.x + direction * 108;
  const targetY = ship.y + aimY * 92;
  const damping = Math.exp(-8 * dt);
  plate.vx = plate.vx * damping + (targetX - plate.x) * 34 * dt;
  plate.vy = plate.vy * damping + (targetY - plate.y) * 34 * dt;
  plate.x += plate.vx * dt;
  plate.y += plate.vy * dt;
  const length = distance(ship, plate);
  if (length > 180) {
    plate.x = ship.x + ((plate.x - ship.x) / length) * 180;
    plate.y = ship.y + ((plate.y - ship.y) / length) * 180;
  }
}

function shieldHit(state, object, radius) {
  const plate = state.plate;
  if (!plate.attached || distance(plate, object) > 44 + radius) return false;
  state.shields++;
  plate.integrity--;
  sparks(state, object.x, object.y, AMBER, 8);
  emit(state, "shield", { x: object.x, y: object.y });
  if (plate.integrity <= 0) {
    state.scrap++;
    plate.integrity = 5;
    // Reeling repairs the loose plate. It is a resource loop, never a locked route.
    message(state, "A few dents. The winch pulls the plate straight again.", 3);
  }
  return true;
}

function updateHazards(state, input, dt) {
  const hazardPace = state.assist ? 0.72 : 1;
  state.hazardClock -= dt * hazardPace;
  state.droneClock -= dt * hazardPace;
  if (state.hazardClock <= 0) {
    spawnDebris(state);
    state.hazardClock = state.sector === 1 ? 2.4 : 3.5;
  }
  if (state.droneClock <= 0) {
    spawnDrone(state);
    state.droneClock = state.sector === 2 ? 8 : 10;
  }
  state.obstacles ||= [];state.obstacleClock=(state.obstacleClock??16)-dt;
  if(state.obstacleClock<=0){
    const gapY=230+(state.wave%3)*110;state.obstacles.push({x:1330,gapY,gap:state.assist?310:255,w:110});state.obstacleClock=19;
    message(state,'SERVICE GATE ? the amber edges frame a safe opening.',5);emit(state,'warning');
  }
  for(const gate of state.obstacles){gate.x-=70*dt;const hitX=Math.abs(state.ship.x-(gate.x+55))<95;
   if(hitX&&Math.abs(state.ship.y-gate.gapY)>gate.gap/2-25)recoverHull(state,state.ship.x,state.ship.y);
  }
  state.obstacles=state.obstacles.filter(g=>g.x>-150);
  for (const drone of state.drones) {
    drone.age += dt;
    drone.x -= drone.speed * dt * hazardPace;
    drone.y = drone.baseY + Math.sin(drone.age * 1.25) * 46;
    drone.clock -= dt;
    drone.warning = drone.clock < 0.85 ? 0.85 - drone.clock : 0;
    if (drone.clock <= 0 && drone.x > state.ship.x + 90) {
      const aimY = state.ship.y;
      state.pulses.push({
        x: drone.x - 28,
        y: drone.y,
        vx: -220,
        vy: (aimY - drone.y) * 0.28,
        radius: 10,
      });
      drone.clock = 4;
      emit(state, "drone-fire");
    }
    if (shieldHit(state, drone, 30)) drone.hp = 0;
    else if (distance(state.ship, drone) < 49) {
      recoverHull(state, drone.x, drone.y);
      drone.hp = 0;
    }
  }
  for (const debris of state.debris) {
    debris.x -= debris.speed * dt * hazardPace;
    debris.angle += debris.spin * dt;
    if (shieldHit(state, debris, debris.radius)) debris.x = -200;
    else if (distance(state.ship, debris) < debris.radius + 26) {
      recoverHull(state, debris.x, debris.y);
      debris.x = -200;
    }
  }
  for (const pulse of state.pulses) {
    pulse.x += pulse.vx * dt * hazardPace;
    pulse.y += pulse.vy * dt * hazardPace;
    if (shieldHit(state, pulse, pulse.radius)) pulse.x = -200;
    else if (distance(state.ship, pulse) < pulse.radius + 27) {
      recoverHull(state, pulse.x, pulse.y);
      pulse.x = -200;
    }
  }
  state.drones = state.drones.filter((drone) => drone.x > -100 && drone.hp > 0);
  state.debris = state.debris.filter((debris) => debris.x > -100);
  state.pulses = state.pulses.filter(
    (pulse) => pulse.x > -100 && pulse.y > -50 && pulse.y < 770,
  );
}

function enterBoss(state) {
  state.sector = 3;
  state.boss.entered = true;
  state.obstacles=[];
  state.boss.phase = "telegraph";
  state.boss.cycleTime = 0;
  state.hull = state.maxHull;
  state.invulnerable = 2;
  state.debris = [];
  state.drones = [];
  state.pulses = [];
  message(
    state,
    "A maintenance counterweight spans the route. Watch its warning rail.",
    7,
  );
  emit(state, "boss-enter");
}

function updateBoss(state, dt, input) {
  const boss = state.boss;
  state.bossTime += dt;
  if(input.winch && state.plate.attached && state.ship.x>520 && Math.abs(state.ship.y-[250,460,350][boss.module])<150)boss.latch=Math.min(1,(boss.latch||0)+dt*.9);
  boss.travel=(boss.travel||0)+(boss.module*1200-(boss.travel||0))*Math.min(1,dt*2.2);
  boss.cycleTime += dt;
  const telegraph = state.assist ? 2.7 : 2.2;
  const sweep = 2.5;
  const open = 5.5;
  if (boss.cycleTime < telegraph) {
    if (boss.phase !== "telegraph") {
      boss.warningY = clamp(state.ship.y, 150, 570);
      emit(state, "warning");
    }
    boss.phase = "telegraph";
    boss.beamY = boss.warningY;
  } else if (boss.cycleTime < telegraph + sweep) {
    if (boss.phase !== "sweep") emit(state, "sweep");
    boss.phase = "sweep";
    const sweepProgress = (boss.cycleTime - telegraph) / sweep;
    boss.beamY =
      boss.warningY +
      Math.sin(sweepProgress * Math.PI) * (boss.module % 2 ? -65 : 65);
    const plate = state.plate;
    const shielded =
      plate.attached &&
      plate.x > state.ship.x + 24 &&
      Math.abs(plate.y - boss.beamY) < 64;
    if(shielded){boss.shieldCharge=Math.min(1,(boss.shieldCharge||0)+dt*1.5);if(!boss.shieldSound){emit(state,"shield");boss.shieldSound=true;}}
    if (
      Math.abs(state.ship.y - boss.beamY) < 43 &&
      state.ship.x > 160 &&
      !shielded
    ) {
      recoverHull(state, state.ship.x + 30, boss.beamY);
    }
  } else if (boss.cycleTime < telegraph + sweep + open) {
    if (boss.phase !== "open") emit(state, "catch-open");
    boss.phase = "open";
    boss.openingY = [250, 460, 350][boss.module];
  } else {
    boss.cycle++;
    boss.cycleTime = 0;
    boss.phase = "cooldown";
    boss.warningY = clamp(state.ship.y, 150, 570);
  }
}

function updateShots(state, input, dt) {
  state.fireCooldown = Math.max(0, state.fireCooldown - dt);
  if (input.fire && state.fireCooldown <= 0) {
    state.projectiles.push({
      x: state.ship.x + 42,
      y: state.ship.y,
      vx: 700,
      life: 1.8,
    });
    state.fireCooldown = 0.22;
    state.shots++;
    emit(state, "shot", { x: state.ship.x + 42, y: state.ship.y });
  }
  for (const shot of state.projectiles) {
    shot.x += shot.vx * dt;
    shot.life -= dt;
    for (const drone of state.drones) {
      if (shot.life <= 0 || distance(shot, drone) > 35) continue;
      shot.life = 0;
      drone.hp--;
      sparks(state, drone.x, drone.y, CYAN, 5);
      if (drone.hp === 0) {
        state.disabled++;
        emit(state, "disabled", { x: drone.x, y: drone.y });
      }
    }
    const boss = state.boss;
    if (
      state.sector === 3 &&
      boss.phase === "open" &&
      boss.latch>=1 && (boss.module===0 || boss.shieldCharge>=1) &&
      shot.x >= 745 &&
      shot.x < 800 &&
      Math.abs(shot.y - boss.openingY) < 58
    ) {
      shot.life = 0;
      boss.hp--;
      sparks(state, 770, boss.openingY, AMBER, 6);
      emit(state, "catch-hit");
      if (boss.hp <= 0) {
        boss.cleared.push(boss.module);
        boss.module++;
        boss.latch=0;boss.shieldCharge=0;boss.shieldSound=false;state.shake=16;
        boss.cycleTime = 0;
        boss.phase = "telegraph";
        boss.warningY = clamp(state.ship.y, 150, 570);
        boss.hp = boss.maxHp;
        state.hull = Math.min(state.maxHull, state.hull + 1);
        emit(state, "module-cleared", { module: boss.module });
        message(
          state,
          boss.module < 3
            ? "Catch released. The next rail is coming into view."
            : "Route clear. Five people. One very separate dummy.",
          5,
        );
        if (boss.module === 3) {
          state.done = true;
          boss.phase = "clear";
          emit(state, "complete");
        }
      }
    }
  }
  state.projectiles = state.projectiles.filter(
    (shot) => shot.life > 0 && shot.x < 1250,
  );
}

export function stepFlight(state, input = {}, elapsed = 1 / 60) {
  state.events = [];
  if (state.done) return state;
  const dt = clamp(elapsed, 0, 0.05) * (state.calm ? 0.875 : 1);
  state.t += dt;state.winchHeld=Boolean(input.winch);
  state.shake=Math.max(0,(state.shake||0)-dt*42);
  state.invulnerable = Math.max(0, state.invulnerable - dt);
  state.messageTime = Math.max(0, state.messageTime - dt);
  const x = clamp(Number(input.x) || 0, -1, 1);
  const y = clamp(Number(input.y) || 0, -1, 1);
  const magnitude = Math.max(1, Math.hypot(x, y));
  const ship = state.ship;
  const acceleration = state.plate.attached ? 1550 : 1780;
  const drag = Math.exp(-6.2 * dt);
  ship.vx =
    ship.vx * drag + (((x / magnitude) * acceleration) / 6.2) * (1 - drag);
  ship.vy =
    ship.vy * drag + (((y / magnitude) * acceleration) / 6.2) * (1 - drag);
  ship.x = clamp(ship.x + ship.vx * dt, 80, 830);
  ship.y = clamp(ship.y + ship.vy * dt, 85, 635);
  updatePlate(state, input, dt);
  updateRescue(state, input, dt);
  if (state.sector < 3) {
    // The route waits at a safe beacon if the first recovery needs more time.
    const waiting = state.route >= 52 && !state.rescued;
    if (!waiting) state.route += dt;
    updateHazards(state, input, dt);
    const nextSector = SECTOR_ENDS.findIndex((end) => state.route < end);
    if (nextSector === -1) enterBoss(state);
    else if (nextSector > state.sector) {
      state.sector = nextSector;
      state.checkpoint = SECTOR_ENDS[nextSector - 1];
      state.hull = Math.min(state.maxHull, state.hull + 1);
      message(state, SECTORS[nextSector][1], 7);
      emit(state, "sector", { sector: nextSector });
    }
  } else {
    updateBoss(state, dt, input);
  }
  updateShots(state, input, dt);
  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
  return state;
}

export function flightHUD(state) {
  const sector = SECTORS[state.sector];
  const boss = state.boss;
  let objective = state.messageTime > 0 ? state.message : sector[1];
  if (state.sector === 3 && !state.messageTime) {
    objective = boss.latch<1 ? "APPROACH THE EYE · hold WINCH to pull the amber latch." : boss.module>0&&boss.shieldCharge<1 ? "BRACE PLATE · catch one rail sweep to discharge the shield." :
      boss.phase === "open"
        ? "CATCH OPEN · line up with the amber square and fire."
        : boss.phase === "sweep"
          ? "RAIL MOVING · leave the marked lane or brace a plate."
          : "WARNING RAIL · its marked lane will move next.";
  }
  return {
    title: sector[0],
    objective,
    progress: state.done
      ? 1
      : clamp((state.route + boss.cleared.length * 30) / 300, 0, 0.99),
    hull: state.hull,
    rescued: state.rescued,
    phase: state.sector === 3 ? boss.phase : "sector-" + (state.sector + 1),
  };
}

function polygon(ctx, points, fill, stroke = INK, width = 3) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) ctx.lineTo(point[0], point[1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function rect(ctx, x, y, width, height, fill, stroke = null, lineWidth = 2) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
  }
}

function image(ctx, images, name, x, y, width, height, angle = 0) {
  const art = images["flight-" + name] || images[name];
  const source = art?.image || art;
  if (!source || source.complete === false || !source.width) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(source, -width / 2, -height / 2, width, height);
  ctx.restore();
  return true;
}

function label(ctx, text, x, y, size = 15, colour = PAPER, align = "left") {
  ctx.fillStyle = colour;
  ctx.font = `500 ${size}px Barlow, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function drawStars(ctx, state, reduced) {
  for (let i = 0; i < 70; i++) {
    const speed = 2 + (i % 3) * 3;
    const offset = reduced ? 0 : state.route * speed;
    const x = (((i * 173.91 - offset) % 1200) + 1200) % 1200;
    const y = 35 + ((i * 93.31) % 650);
    rect(ctx, x, y, i % 11 ? 1.5 : 2.5, i % 11 ? 1.5 : 2.5, "#a2c3c25c");
  }
}

function drawRails(ctx, state, reduced) {
  const scroll = reduced ? 0 : state.route * 26;
  const tint = state.sector === 1 ? "#183b49" : "#263a45";
  for (let i = -1; i < 7; i++) {
    const x = i * 270 - (scroll % 270);
    polygon(
      ctx,
      [
        [x, 0],
        [x + 58, 0],
        [x + 58, 76],
        [x + 36, 106],
        [x, 106],
      ],
      tint,
      "#5c777c",
      2,
    );
    rect(ctx, x + 9, 15, 28, 44, "#152b38", "#637e80");
    rect(ctx, x + 6, 82, 35, 5, AMBER);
    polygon(
      ctx,
      [
        [x - 30, 720],
        [x + 58, 720],
        [x + 58, 650],
        [x + 24, 626],
        [x - 30, 648],
      ],
      tint,
      "#5c777c",
      2,
    );
    for (let hatch = 0; hatch < 3; hatch++)
      rect(ctx, x - 15 + hatch * 20, 672, 9, 28, "#4b6269");
  }
  rect(ctx, 0, 0, 1200, 12, "#040f18");
  rect(ctx, 0, 708, 1200, 12, "#040f18");
  rect(ctx, 0, 13, 1200, 3, "#72958b50");
}

function drawPlate(ctx, state) {
  const plate = state.plate;
  ctx.save();
  if (plate.attached) {
    ctx.strokeStyle = "#04131c";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(state.ship.x - 8, state.ship.y + 11);
    ctx.lineTo(plate.x, plate.y);
    ctx.stroke();
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.translate(plate.x, plate.y);
  ctx.rotate(
    plate.attached
      ? Math.atan2(plate.y - state.ship.y, plate.x - state.ship.x)
      : -0.15,
  );
  polygon(
    ctx,
    [
      [-17, -48],
      [15, -42],
      [22, 41],
      [-12, 48],
      [-23, 24],
    ],
    "#b7b9a6",
    INK,
    4,
  );
  rect(ctx, -8, -38, 11, 69, "#526b74");
  rect(ctx, -15, -20, 32, 7, RED);
  for (const y of [-34, 34]) rect(ctx, -9, y, 5, 5, "#f3e7c6");
  ctx.restore();
  if (!plate.attached)
    label(ctx, "LOOSE PLATE", plate.x, plate.y + 77, 14, CYAN, "center");
}

function drawMoth(ctx, state, images, reduced) {
  const ship = state.ship;
  ctx.save();
  ctx.translate(ship.x, ship.y);
  const lean = reduced ? 0 : ship.vy * 0.0003;
  ctx.rotate(lean);
  for (const y of [-18, 18]) {
    const flicker = reduced ? 0 : Math.sin(state.t * 62 + y) * 6;
    polygon(
      ctx,
      [
        [-32, y - 7],
        [-76 - flicker, y],
        [-32, y + 7],
      ],
      "#5cd8d159",
      null,
    );
    polygon(
      ctx,
      [
        [-34, y - 3],
        [-62 - flicker * 0.5, y],
        [-34, y + 3],
      ],
      CYAN,
      null,
    );
  }
  if (state.invulnerable > 0) {
    ctx.strokeStyle = "#a6e5d6a0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 60, 48, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (!image(ctx, images, "moth-small", 0, 0, 94, 158, Math.PI / 2)) {
    polygon(
      ctx,
      [
        [46, 0],
        [-30, -27],
        [-43, -21],
        [-43, 21],
        [-30, 27],
      ],
      PAPER,
      INK,
      4,
    );
    polygon(
      ctx,
      [
        [25, 0],
        [-6, -9],
        [-6, 9],
      ],
      "#112e40",
    );
    for (const y of [-31, 19]) rect(ctx, -31, y, 48, 12, "#bcbca4", INK, 3);
    rect(ctx, -19, -25, 7, 50, RED);
  }
  ctx.restore();
}

function drawCapsule(ctx, state, images, reduced) {
  const capsule = state.capsule;
  if (!capsule.visible || state.rescued) return;
  ctx.save();
  const pulse = reduced ? 1 : 1 + Math.sin(state.t * 4) * 0.05;
  ctx.strokeStyle = "#a2e3db73";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 9]);
  ctx.strokeRect(
    capsule.x - 65 * pulse,
    capsule.y - 81 * pulse,
    130 * pulse,
    162 * pulse,
  );
  ctx.setLineDash([]);
  if (!image(ctx, images, "capsule", capsule.x, capsule.y, 62, 96, 0.08)) {
    polygon(
      ctx,
      [
        [capsule.x - 24, capsule.y - 45],
        [capsule.x + 20, capsule.y - 45],
        [capsule.x + 31, capsule.y - 25],
        [capsule.x + 31, capsule.y + 31],
        [capsule.x + 18, capsule.y + 46],
        [capsule.x - 24, capsule.y + 46],
      ],
      PAPER,
      INK,
      4,
    );
    rect(ctx, capsule.x - 13, capsule.y - 28, 26, 36, "#1e4350", INK);
    rect(ctx, capsule.x + 14, capsule.y - 35, 7, 68, RED);
  }
  // Two visible recovery-eye strokes. The blue eye is the interaction target.
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 4;
  ctx.strokeRect(capsule.x - 43, capsule.y - 9, 15, 18);
  if (capsule.progress > 0) {
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(state.ship.x + 15, state.ship.y + 14);
    ctx.lineTo(capsule.x - 36, capsule.y);
    ctx.stroke();
    rect(
      ctx,
      capsule.x - 52,
      capsule.y + 91,
      (104 * capsule.progress) / 1.4,
      5,
      CYAN,
    );
  }
  label(
    ctx,
    "PIP · RECOVERY EYE",
    capsule.x,
    capsule.y - 102,
    16,
    CYAN,
    "center",
  );
  label(ctx, "HOLD WINCH", capsule.x, capsule.y + 119, 15, PAPER, "center");
  ctx.restore();
}

function drawDrone(ctx, drone, state, images) {
  if (!image(ctx, images, "drone", drone.x, drone.y, 121, 114, -0.18)) {
    rect(ctx, drone.x - 30, drone.y - 22, 60, 44, "#98a9a2", INK, 4);
    rect(ctx, drone.x - 9, drone.y - 9, 18, 18, RED, INK, 3);
    for (const side of [-1, 1]) {
      rect(
        ctx,
        drone.x + side * 33 - 5,
        drone.y + 13,
        10,
        28,
        "#739193",
        INK,
        3,
      );
    }
  }
  if (drone.warning > 0) {
    ctx.strokeStyle = RED + "88";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 9]);
    ctx.beginPath();
    ctx.moveTo(drone.x - 30, drone.y);
    ctx.lineTo(state.ship.x, state.ship.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawBoss(ctx, state, reduced, images) {
  const boss = state.boss;
  const camera = boss.travel || 0;
  ctx.save();
  ctx.translate(-camera, 0);
  const body=images["machine-counterweight"];if(body){ctx.drawImage(body,380,-390,3600,1500);}
  // A continuous 3,600-unit counterweight. The camera follows its three catches.
  for (let module = 0; module < 3; module++) {
    const x = 690 + module * 1200;
    const released = boss.cleared.includes(module);
    polygon(
      ctx,
      [
        [x, -35],
        [x + 880, -35],
        [x + 940, 98],
        [x + 940, 622],
        [x + 880, 755],
        [x, 755],
        [x + 64, 605],
        [x + 64, 115],
      ],
      "#274a52b8",
      "#708786",
      5,
    );
    rect(ctx, x + 118, 20, 720, 680, "#14323f90", "#7a9187", 3);
    for (let step = 0; step < 6; step++) {
      const yy = 32 + step * 121;
      rect(ctx, x + 85, yy, 810, 22, "#65827d", INK, 4);
      rect(ctx, x + 100, yy + 4, 780, 4, "#bdc1a1");
    }
    for (let groove = 0; groove < 8; groove++) {
      rect(ctx, x + 148 + groove * 83, 92, 33, 535, "#173e49", "#345a61", 1);
    }
    const targetY = [250, 460, 350][module];
    polygon(
      ctx,
      [
        [x + 58, targetY - 78],
        [x + 164, targetY - 78],
        [x + 205, targetY],
        [x + 164, targetY + 78],
        [x + 58, targetY + 78],
      ],
      released ? "#1a544e" : "#819184",
      INK,
      5,
    );
    rect(
      ctx,
      x + 50,
      targetY - 47,
      67,
      94,
      released ? "#73bd9a" : "#193c45",
      INK,
      4,
    );
    if (!released && module === boss.module && boss.phase === "open") {
      rect(ctx, x + 50, targetY - 47, 67, 94, AMBER, INK, 4);
      rect(ctx, x + 65, targetY - 29, 37, 58, "#ffe1a0", "#94733d", 3);
    }
    for (const yy of [151, 566]) {
      rect(ctx, x + 630, yy, 128, 35, "#8c8f77", INK, 3);
      rect(ctx, x + 644, yy + 8, 96, 5, released ? CYAN : AMBER);
    }
  }
  ctx.restore();
  if (boss.phase === "telegraph") {
    ctx.fillStyle = "#e8ac4715";
    ctx.fillRect(100, boss.warningY - 48, 900, 96);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 12]);
    for (const yy of [boss.warningY - 48, boss.warningY + 48]) {
      ctx.beginPath();
      ctx.moveTo(105, yy);
      ctx.lineTo(980, yy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    label(ctx, "RAIL WARNING", 130, boss.warningY - 63, 20, AMBER);
  } else if (boss.phase === "sweep") {
    rect(ctx, 150, boss.beamY - 31, 860, 62, "#dc77565c");
    rect(ctx, 150, boss.beamY - 18, 860, 36, "#c8bda0", INK, 4);
    rect(ctx, 150, boss.beamY - 8, 860, 8, "#fff0c1");
    for (let i = 0; i < 22; i++) {
      polygon(
        ctx,
        [
          [165 + i * 39, boss.beamY + 17],
          [180 + i * 39, boss.beamY - 16],
          [193 + i * 39, boss.beamY - 16],
          [178 + i * 39, boss.beamY + 17],
        ],
        "#5d6967",
        null,
      );
    }
  }
  label(
    ctx,
    `CATCH ${Math.min(3, boss.module + 1)} / 3`,
    1060,
    87,
    18,
    AMBER,
    "right",
  );
  label(ctx,`THREE-SCREEN MAINTENANCE BODY / ${Math.round((boss.latch||0)*100)}% LATCH / ${Math.round((boss.shieldCharge||0)*100)}% PLATE`,1060,135,13,CYAN,"right");
  rect(ctx, 840, 106, 220, 7, "#051622");
  rect(ctx, 840, 106, (220 * boss.hp) / boss.maxHp, 7, AMBER);
}

export function drawFlight(
  ctx,
  state,
  { width = 1200, height = 720, images = {}, reduced = false } = {},
) {
  ctx.save();
  ctx.fillStyle = "#061420";
  ctx.fillRect(0, 0, width, height);
  const portrait = width < height;
  const fieldTop = portrait ? 116 : 0;
  const fieldHeight = portrait
    ? Math.max(280, height - fieldTop - 130)
    : height;
  const scale = portrait
    ? fieldHeight / FLIGHT_HEIGHT
    : Math.min(width / FLIGHT_WIDTH, height / FLIGHT_HEIGHT);
  const visibleWidth = width / scale;
  const cameraX = portrait
    ? clamp(
        state.ship.x - visibleWidth * 0.3,
        0,
        Math.max(0, FLIGHT_WIDTH - visibleWidth),
      )
    : 0;
  const left = portrait ? -cameraX * scale : (width - FLIGHT_WIDTH * scale) / 2;
  const top = portrait ? fieldTop : (height - FLIGHT_HEIGHT * scale) / 2;
  if (portrait) {
    ctx.beginPath();
    ctx.rect(0, fieldTop, width, fieldHeight);
    ctx.clip();
  }
  ctx.translate(left+(reduced?0:Math.sin(state.t*153)*(state.shake||0)*scale), top);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.rect(0, 0, FLIGHT_WIDTH, FLIGHT_HEIGHT);
  ctx.clip();
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, "#071526");
  sky.addColorStop(0.55, "#153441");
  sky.addColorStop(1, "#173444");
  rect(ctx, 0, 0, 1200, 720, sky);
  const mars = images["flight-mars"] || images.mars;
  const backdrop = mars?.image || mars;
  if (backdrop && backdrop.complete !== false && backdrop.width) {
    ctx.save();
    ctx.globalAlpha = state.sector === 0 ? 0.55 : 0.24;
    ctx.drawImage(backdrop, 0, 0, 1200, 720);
    ctx.restore();
    rect(ctx, 0, 0, 1200, 720, "#06172955");
  }
  drawStars(ctx, state, reduced);
  if (state.sector < 3) {
    if (state.sector > 0) drawRails(ctx, state, reduced);
    else {
      ctx.save();
      ctx.globalAlpha = 0.25;
      image(ctx, images, "needlewake", 1035, 125, 260, 240, Math.PI / 2);
      ctx.restore();
    }
  } else drawBoss(ctx, state, reduced, images);
  for(const gate of state.obstacles||[]){
    for(const [y,hh] of [[0,gate.gapY-gate.gap/2],[gate.gapY+gate.gap/2,720-gate.gapY-gate.gap/2]]){
      rect(ctx,gate.x,y,gate.w,hh,'#32535c',INK,5);rect(ctx,gate.x+14,y+8,gate.w-28,Math.max(0,hh-16),'#6a8078',INK,3);
      for(let yy=y+20;yy<y+hh-15;yy+=36)rect(ctx,gate.x+20,yy,70,7,AMBER);
    }
    if(gate.x>900)label(ctx,'GATE AHEAD',1050,gate.gapY,19,AMBER,'right');
  }
  for (const debris of state.debris) {
    if (
      !image(
        ctx,
        images,
        "debris",
        debris.x,
        debris.y,
        debris.radius * 2.7,
        debris.radius * 2.7,
        debris.angle,
      )
    ) {
      polygon(
        ctx,
        [
          [debris.x - 21, debris.y - 27],
          [debris.x + 24, debris.y - 12],
          [debris.x + 19, debris.y + 21],
          [debris.x - 29, debris.y + 14],
        ],
        "#7b7d71",
        INK,
        3,
      );
    }
  }
  for (const drone of state.drones) drawDrone(ctx, drone, state, images);
  for (const pulse of state.pulses) {
    rect(ctx, pulse.x - 16, pulse.y - 4, 24, 8, "#f1b36b");
    rect(ctx, pulse.x - 9, pulse.y - 2, 15, 4, "#fff1c3");
  }
  drawCapsule(ctx, state, images, reduced);
  drawPlate(ctx, state);
  drawMoth(ctx, state, images, reduced);
  if(state.sector===3&&state.winchHeld&&state.plate.attached&&state.ship.x>520){
    const yy=[250,460,350][state.boss.module];ctx.strokeStyle=AMBER;ctx.lineWidth=3;ctx.setLineDash([9,5]);ctx.beginPath();ctx.moveTo(state.plate.x,state.plate.y);ctx.lineTo(770,yy);ctx.stroke();ctx.setLineDash([]);
  }
  for (const shot of state.projectiles) {
    rect(ctx, shot.x - 20, shot.y - 5, 30, 10, "#90d9d332");
    rect(ctx, shot.x - 13, shot.y - 2, 23, 4, CYAN);
  }
  if (!reduced) {
    for (const particle of state.particles) {
      ctx.globalAlpha = clamp(particle.life * 2, 0, 1);
      rect(ctx, particle.x, particle.y, 4, 2, particle.colour);
    }
    ctx.globalAlpha = 1;
  }
  if (!portrait) {
    // The broad view has room for field instruments beside the original world.
    label(ctx, state.rescued ? "PIP ABOARD" : "PIP’S BEACON", 29, 40, 17, CYAN);
    label(
      ctx,
      state.plate.attached
        ? `PLATE BRACED · ${state.shields} BLOCKED`
        : "WINCH READY",
      1170,
      40,
      17,
      CYAN,
      "right",
    );
    rect(ctx, 25, 677, 1150, 3, "#708c7a2a");
    rect(ctx, 25, 677, 1150 * flightHUD(state).progress, 3, CYAN);
    for (let i = 0; i < state.maxHull; i++) {
      rect(ctx, 28 + i * 23, 691, 16, 8, i < state.hull ? CYAN : "#284b52");
    }
    label(ctx, SECTORS[state.sector][0], 1170, 701, 14, PAPER, "right");
  }
  ctx.restore();
  if (portrait) {
    ctx.save();
    const fieldBottom = fieldTop + fieldHeight;
    rect(ctx, 0, fieldTop, width, 1, "#89b7b849");
    rect(ctx, 0, fieldBottom - 1, width, 1, "#89b7b849");
    const hud = flightHUD(state);
    rect(ctx, 14, fieldBottom + 10, width - 28, 2, "#708c7a3a");
    rect(ctx, 14, fieldBottom + 10, (width - 28) * hud.progress, 2, CYAN);

    const edgeHint = (target, caption, colour) => {
      const screenX = (target.x - cameraX) * scale;
      if (screenX > 34 && screenX < width - 34) return;
      const right = screenX >= width - 34;
      const y = clamp(
        fieldTop + target.y * scale,
        fieldTop + 38,
        fieldBottom - 38,
      );
      const x = right ? width - 12 : 12;
      ctx.font = "500 13px Barlow, sans-serif";
      const textWidth = ctx.measureText(caption).width;
      const boxX = right ? x - textWidth - 31 : x + 17;
      rect(ctx, boxX - 8, y - 16, textWidth + 16, 31, "#071c29e8", colour, 1);
      label(ctx, caption, boxX, y + 4, 13, colour);
      const direction = right ? 1 : -1;
      polygon(
        ctx,
        [
          [x + direction * 3, y],
          [x - direction * 5, y - 7],
          [x - direction * 5, y + 7],
        ],
        colour,
        null,
      );
    };

    if (state.sector === 3 && !state.done) {
      const catchY = [250, 460, 350][state.boss.module];
      const open = state.boss.phase === "open";
      edgeHint(
        { x: 770, y: catchY },
        open ? "CATCH · OPEN" : "CATCH",
        open ? AMBER : PAPER,
      );
      if (state.boss.phase === "telegraph" || state.boss.phase === "sweep") {
        const railY =
          state.boss.phase === "telegraph"
            ? state.boss.warningY
            : state.boss.beamY;
        if (Math.abs(railY - catchY) > 48)
          edgeHint({ x: 770, y: railY }, "RAIL", RED);
      }
    } else if (state.capsule.visible && !state.rescued) {
      edgeHint(state.capsule, "PIP’S BEACON", CYAN);
    }
    if (!state.plate.attached) edgeHint(state.plate, "LOOSE PLATE", CYAN);
    ctx.restore();
  }
}
