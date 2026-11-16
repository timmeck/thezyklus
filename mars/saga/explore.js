import {roomMechanics,solids,liftAt} from "./encounters.js";
import {PUZZLES,nearbyMechanism,useMechanism,puzzleTick,activeAnchor,puzzleState,foamSurface,puzzlePlatforms} from './puzzles-k1c.js';
import { ROOMS, FLOOR, roomExits } from "./world.js";
const approach = (a, b, t) => (a < b ? Math.min(b, a + t) : Math.max(b, a - t));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function newExplorer(x = 140) {
  return {
    x,
    y: FLOOR,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    coyote: 0.13,
    buffer: 0,
    invincible: 0,
    ledge: null,
    rope: null,
    action: "idle",
    actionTime: 0,
  };
}
export function enterRoom(state, id, from) {
  state.room = id;
  state.roomTime = 0;
  const exit = roomExits(id, state).find((e) => e.to === from);
  state.player = newExplorer(exit ? clamp(exit.x, 125, 975) : 140);
  state.roomPulses=[];
  if (exit?.side === "right") state.player.facing = -1;
  if (!state.visited.includes(id)) state.visited.push(id);
  state.events.push({ type: "enter", room: id });
  if (ROOMS[id].save) {
    state.checkpoint = id;
    state.events.push({ type: "save" });
  }
}
export function nearby(state) {
  const p = state.player,
    r = ROOMS[state.room];
  if (p.rope) return { kind: "rope", label: "Release line · jump to launch" };
  if (r.id===16 && !state.midbossComplete && p.x>390) return {kind:"boss",label:state.midboss?.phase==="exposed"?"Hold LINE · pull the amber catch":"Jump the brush. Wait for the amber eye."};
  const mechanism=nearbyMechanism(state);if(mechanism)return mechanism;
  const challenge = r.challenges[state.tasks?.[r.id] || 0];
  if (
    !PUZZLES[r.id] && challenge &&
    Math.abs(p.x - challenge.x) < 85 &&
    Math.abs(p.y - challenge.y) < 45
  )
    return { kind: "challenge", label: challenge.label };
  if (
    !PUZZLES[r.id] && r.id === 3 &&
    !state.tasks?.[3] &&
    !state.carryingCrate &&
    Math.abs(p.x - state.crate.x) < 75 &&
    p.y > 530
  )
    return { kind: "crate", label: "Carry the loose counterweight crate" };
  if (r.id === 6 && !state.tether && Math.abs(p.x - 555) < 115)
    return { kind: "tether", label: "Take the recovery line" };
  if (
    r.seal &&
    !state.seals.includes(r.id) &&
    Math.abs(p.x - r.sealX) < 85 &&
    Math.abs(p.y - r.sealY) < 45
  )
    return { kind: "seal", label: "Inspect recovery seal" };
  if (r.id === 20 && Math.abs(p.x - 850) < 140)
    return {
      kind: "launch",
      label: state.flightComplete
        ? "Return to the World Clock"
        : state.seals.length === 3
          ? "Launch the Moth"
          : `Recovery seals · ${state.seals.length}/3`,
    };
  if (
    [23, 25, 26].includes(r.id) &&
    Math.abs(p.x - (r.contactX||550)) < 110 && Math.abs(p.y-(r.contactY||600))<55 &&
    !state.contacts.includes(r.id)
  )
    return { kind: "contact", label: "Listen to the contact" };
  if (r.id === 27 && Math.abs(p.x - 670) < 150)
    return {
      kind: "clock",
      label: "Answer low. Then high. Leave the silence.",
    };
  const exit = roomExits(r.id, state).find(
    (e) => Math.abs(p.x - e.x) < 70 && p.y > 510,
  );
  if (exit)
    return {
      kind: "exit",
      exit,
      label: exit.locked
        ? challenge
          ? challenge.label
          : "A recovery line opens this route"
        : exit.label,
    };
  if (
    r.npc &&
    r.npc !== "iona" &&
    !(r.npc === "pip" && !state.flightComplete) &&
    Math.abs(p.x - r.npcX) < 100 &&
    Math.abs(p.y - r.npcY) < 55
  )
    return {
      kind: "talk",
      speaker: r.npc,
      label: `Talk to ${r.npc === "sera" ? "Captain Sera" : r.npc[0].toUpperCase() + r.npc.slice(1)}`,
    };
  if (r.save && Math.abs(p.x - 155) < 70 && p.y > 520)
    return { kind: "save", label: "Rest here · save & restore" };
  if(p.grounded&&p.y<580&&!r.blocks.some(b=>p.x>b.x-18&&p.x<b.x+b.w+18&&b.y>=p.y-2&&b.y<p.y+28))return {kind:'drop',label:'Hold DOWN + JUMP to drop through this open catwalk'};
  if (state.tether && Math.hypot(p.x - r.anchor.x, p.y - 70 - r.anchor.y) < 560)
    return { kind: "swing", label: "Hold LINE to swing · jump to release" };
  return null;
}
export function interact(state) {
  const target = nearby(state),
    r = ROOMS[state.room];
  if (!target) return;
  if(target.kind==='mechanism'){useMechanism(state,target.station);return;}
  if (target.kind === "crate") {
    state.carryingCrate = true;
    state.events.push({
      type: "hint",
      text: "Crate secured. The marked cradle is on the far side.",
    });
  }
  if (target.kind === "challenge") {
    if (r.id === 3 && !state.carryingCrate) {
      state.events.push({
        type: "hint",
        text: "The loose crate is beside the entry. Carry it to the cradle.",
      });
      return;
    }
    state.tasks[r.id] = (state.tasks[r.id] || 0) + 1;
    if (r.id === 3) {
      state.carryingCrate = false;
      state.crate = { room: 3, x: 810, y: 600 };
    }
    state.player.action = "brace";
    state.player.actionTime = 0.5;
    state.events.push({
      type: "task",
      text:
        state.tasks[r.id] === r.challenges.length
          ? "Route secured. The onward door is open."
          : r.challenges[state.tasks[r.id]].label,
    });
  }
  if (target.kind === "exit" && !target.exit.locked) {
    if (
      target.exit.shortcut &&
      !state.shortcuts.includes(target.exit.shortcut)
    ) {
      state.shortcuts.push(target.exit.shortcut);
      state.events.push({ type: "shortcut", name: target.exit.label });
    }
    enterRoom(state, target.exit.to, r.id);
  }
  if (target.kind === "tether") {
    state.tether = true;
    state.events.push({ type: "tether" });
  }
  if (target.kind === "seal") {
    state.seals.push(r.id);
    state.events.push({ type: "seal" });
  }
  if (target.kind === "contact") {
    state.contacts.push(r.id);
    state.events.push({ type: "contact", room: r.id });
  }
  if (target.kind === "launch" && state.seals.length === 3) {
    state.events.push({ type: "launch" });
  }
  if (target.kind === "clock" && state.contacts.length === 3)
    state.events.push({ type: "clock" });
  if (target.kind === "clock" && state.contacts.length < 3)
    state.events.push({
      type: "hint",
      text: "Three contact faces. Hear each one before you answer.",
    });
  if (target.kind === "save") {
    state.checkpoint = r.id;
    state.energy = 5;
    state.events.push({ type: "save" });
  }
  if (target.kind === "talk")
    state.events.push({ type: "talk", speaker: target.speaker });
}
export function stepExplore(state, input, dt = 1 / 60) {
  const p = state.player,
    r = ROOMS[state.room],
    pace = state.settings.calm ? 0.875 : 1;
  // Releasing DOWN under a low ceiling keeps the safe pose. It must never
  // eject the actor sideways through the whole service duct.
  const lowCeiling=(p.grounded||p.crouched)&&r.blocks.some(b=>
    p.x+17>b.x&&p.x-17<b.x+b.w&&p.y>=b.y+b.h-1&&
    p.y-108<b.y+b.h&&p.y-47>=b.y+b.h);
  input={...input,crouch:Boolean(input.crouch||lowCeiling)};
  p.crouched=input.crouch;
  dt *= pace;
  state.elapsed += dt;
  state.roomTime = (state.roomTime || 0) + dt;
  roomMechanics(state,input,dt);
  puzzleTick(state,input,dt);
  p.actionTime = Math.max(0, p.actionTime - dt);
  p.invincible = Math.max(0, p.invincible - dt);
  if(!input.line)p.lineLock=false;
  p.drop=Math.max(0,(p.drop||0)-dt);
  if (input.jumpPressed) p.buffer = 0.15;
  else p.buffer = Math.max(0, p.buffer - dt);
  p.coyote = p.grounded ? 0.13 : Math.max(0, p.coyote - dt);
  const inFoam=r.foam&&p.y>540&&p.x>350&&p.x<850;
  const q=PUZZLES[r.id]?puzzleState(state):null;
  const loaded=state.carryingCrate||q?.carry||q?.held!==null&&q?.held!==undefined;
  const speed = loaded ? 265 : input.crouch ? 145 : inFoam ? 215 : 355;
  const sheltered=r.id===9&&q?.values[0]===2&&q?.values[1]===1||r.id===30&&q?.flags.upper===2&&q?.flags.lower===1||r.id===37&&q?.flags.left===false&&q?.flags.right===false&&q?.flags.middle;
  const wind=r.wind&&!sheltered&&state.roomTime%9>4&&state.roomTime%9<8?(Math.floor(state.roomTime/9)%2?1:-1)*110:0;
  p.vx = approach(
    p.vx,
    (input.x || 0) * speed + wind,
    (p.grounded ? 2600 : 1350) * dt,
  );
  if (Math.abs(input.x || 0) > 0.1) p.facing = input.x < 0 ? -1 : 1;
  const canDrop=p.grounded&&r.platforms.some(q=>q.y<580&&Math.abs(q.y-p.y)<5&&p.x>q.x&&p.x<q.x+q.w)&&!r.blocks.some(b=>p.x>b.x-18&&p.x<b.x+b.w+18&&b.y>=p.y-2&&b.y<p.y+28);
  if(input.crouch&&input.jumpPressed&&canDrop){p.drop=.28;p.y+=12;p.vy=100;p.grounded=false;p.coyote=0;p.buffer=0;}
  if (p.ledge) {
    if (input.jumpPressed || input.y < -0.2 || input.x === p.facing) {
      p.x = p.ledge.x + p.facing * 35;
      p.y = p.ledge.y;
      p.vy = 0;
      p.grounded = true;
      p.ledge = null;
      p.action = "climb";
      p.actionTime = 0.28;
    } else if (input.crouch) {
      p.ledge = null;
      p.vy = 60;
      p.invincible = 0.2;
    } else return;
  }
  const anchor=activeAnchor(state,r);
  if (
    input.line &&
    state.tether &&
    !p.rope &&
    !p.lineLock &&
    !p.grounded &&
    Math.hypot(p.x - anchor.x, p.y - 70 - anchor.y) < (r.anchors?360:560)
  ) {
    p.rope = {
      ...anchor,
      length: Math.max(
        160,
        Math.hypot(p.x - anchor.x, p.y - 70 - anchor.y),
      ),
    };
    p.vy = Math.min(p.vy, -90);
    state.events.push({ type: "line" });
  }
  if (p.rope && (!input.line || input.jumpPressed)) {
    p.lineLock=Boolean(input.jumpPressed);
    p.rope = null;
    p.vy = Math.min(p.vy, -360);
    p.vx += p.facing * 140;
    p.buffer = 0;
    state.events.push({ type: "jump" });
  }
  if (p.buffer > 0 && p.coyote > 0 && !p.rope) {
    p.vy = -590;
    p.grounded = false;
    p.coyote = 0;
    p.buffer = 0;
    p.action = "jump";
    p.actionTime = 0.2;
    state.events.push({ type: "jump" });
  }
  if (!input.jump && p.vy < -220 && !p.rope) p.vy += 1350 * dt;
  const oldX = p.x,
    oldY = p.y;
  p.vy += 1400 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.grounded = false;
  if (p.rope) {
    const dx = p.x - p.rope.x,
      dy = p.y - 70 - p.rope.y,
      distance = Math.hypot(dx, dy);
    if (distance > p.rope.length) {
      const nx = dx / distance,
        ny = dy / distance;
      p.x = p.rope.x + nx * p.rope.length;
      p.y = p.rope.y + ny * p.rope.length + 70;
      const radial = p.vx * nx + p.vy * ny;
      p.vx -= radial * nx;
      p.vy -= radial * ny;
    }
    p.vx += (input.x || 0) * 900 * dt;
  }
  for (const platform of [...r.platforms,...puzzlePlatforms(state),...(r.lift?[liftAt(state)]:[])]) {
    if (
      p.drop===0 && p.x > platform.x - 12 &&
      p.x < platform.x + platform.w + 12 &&
      p.vy >= 0 &&
      oldY <= platform.y + 7 &&
      p.y >= platform.y
    ) {
      p.y = platform.y;
      p.vy = 0;
      p.grounded = true;
      p.rope = null;
      if (oldY < platform.y - 30) {
        p.action = "land";
        p.actionTime = 0.14;
      }
    }
    const edge = input.x > 0 ? platform.x : platform.x + platform.w;
    if (
      !p.grounded &&
      !p.rope &&
      p.invincible === 0 &&
      p.vy > 20 &&
      Math.abs(p.x - edge) < 22 &&
      p.y - 70 > platform.y - 22 &&
      p.y - 70 < platform.y + 30 &&
      Math.abs(input.x) > 0.2
    ) {
      p.x = edge - p.facing * 18;
      p.y = platform.y + 70;
      p.vx = p.vy = 0;
      p.ledge = { x: edge, y: platform.y, side: -p.facing };
      p.action = "ledge";
    }
  }
  solids(state,input,oldX,oldY);
  const surface=foamSurface(state,r);
  if(r.foam&&p.x>350&&p.x<850&&p.y>=surface&&p.vy>=0){p.y=surface;p.vy=0;p.grounded=true;}
  p.x = clamp(p.x, 28, 1072);
  const sweep = r.hazard && state.roomTime % 7 > 4 && state.roomTime % 7 < 5.25;
  if (sweep && p.x > 700 && p.x < 900 && p.y > 500 && p.invincible === 0) {
    state.energy -= state.settings.assist ? 0 : 1;
    p.vx = -240;
    p.vy = -260;
    p.invincible = 2;
    state.events.push({ type: "bump" });
  }
  if (p.y > 830 || state.energy <= 0) {
    state.energy = 5;
    state.player = newExplorer(oldX > 700 ? 920 : 180);
    state.player.invincible = 2;
    state.recoveries++;
    state.deathsByRoom||={};state.deathsByRoom[r.id]=(state.deathsByRoom[r.id]||0)+1;
    state.events.push({
      type: "recover",
      text: "Safety line caught you. Try a little earlier.",
    });
  }
  if (!p.actionTime && !p.ledge)
    p.action = p.rope
      ? "swing"
      : lowCeiling ? "crawl" : p.grounded
        ? input.crouch
          ? "crawl"
          : Math.abs(p.vx) > 30
            ? "run"
            : "idle"
        : p.vy > 0
          ? "fall"
          : "jump";
  if (
    r.collectible &&
    (r.id!==4||state.specialFind==='return-knot') &&
    (!r.secret || (state.tether && state.openSecrets?.includes(r.id))) &&
    !state.notes.includes(r.id) &&
    Math.hypot(p.x - r.collectibleX, p.y - 65 - r.collectibleY) < 75
  ) {
    state.notes.push(r.id);
    if (r.secret) state.secrets.push(r.id);
    state.events.push({ type: "note", secret: r.secret });
  }
  if (input.actionPressed) interact(state);
}
