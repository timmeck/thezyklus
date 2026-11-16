import { ROOMS, ROOM_ROUTE } from "./world.js";
import { enterRoom, newExplorer, stepExplore, nearby } from "./explore.js";
import {
  newGame,
  loadGame,
  loadSettings,
  saveSettings,
  saveGame,
} from "./store.js";
import { Input } from "./input.js";
import { SagaAudio } from "./audio.js";
import { FIELD_NOTES } from "./notebook.js";
import {MOTION_ASSETS} from './motion-k1c.js';
import {PUZZLES,puzzleHint} from './puzzles-k1c.js';
import {BEAM_CUES,chooseBeamCue} from './beam-k1c.js';
import {installDuelPresentation} from './duel-presentation-k1c.js';
import {
  SagaRenderer,
  loadImage,
  loadZone,
  prepareActors,
  images,
} from "./render.js";

const $ = (id) => document.getElementById(id);
const settings = loadSettings();
document.documentElement.dataset.input = matchMedia('(pointer:coarse)').matches ? 'touch' : 'keyboard';
try {
  if (!localStorage.getItem("mars-saga-settings-v1"))
    settings.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
} catch {
  settings.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
}
let state = loadGame(),
  storyData,
  storyQueue = [],
  storyIndex = 0,
  afterStory = null,
  flightModule,
  duelModule;
let playing = false,
  accumulator = 0,
  last = 0,
  lastSave = 0,
  toastUntil = 0,
  lastHUD = "",
  talkCount = {},
  clockStep = 0,
  clockQuiet = 0,
  roomLoading = false;
let lastControlMode='',nextHUD=0,roomRuleAwaitingAction=false,pendingBeamEvent=null;
const input = new Input(),
  audio = new SagaAudio(),
  renderer = new SagaRenderer($("world"));
const dialogs = ["story", "pause", "settings", "map", "clock", "ending"];
const dialogOpen = () => dialogs.some((id) => $(id).open);
const storyPromise = fetch("story-data.json")
  .then((response) => {
    if (!response.ok) throw new Error("Story could not load.");
    return response.json();
  })
  .then((value) => (storyData = value));
function showToast(message, seconds = 3) {
  if(!message)return;
  if(roomRuleAwaitingAction)return;
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  toastUntil = performance.now() + seconds * 1000;
  refreshNoticeMetric();
}
function refreshNoticeMetric(){
 if(!playing)return;
 const nodes=['context-hint','toast','radio'].map($),bottom=nodes.filter(e=>e.textContent&&getComputedStyle(e).visibility==='visible'&&Number(getComputedStyle(e).opacity)>0).reduce((n,e)=>Math.max(n,e.getBoundingClientRect().bottom),0);
 renderer.noticeBottom=bottom;
}
function beamCue(event,force=false){
 if(roomRuleAwaitingAction&&!force){
  const room=event.room??state.room,eligible=BEAM_CUES.some(c=>(Array.isArray(c.event)?c.event:[c.event]).includes(event.type)&&(!c.rooms||c.rooms.includes(room))&&(!c.special||event.special===true)&&!(state.beamHeard||[]).includes(c.id));
  if(eligible&&!pendingBeamEvent)pendingBeamEvent={...event};return;
 }
 const cue=chooseBeamCue(state,event);if(!cue)return;
 $('radio').textContent='BEAM / '+cue.text;$('radio').classList.add('visible');
 window.clearTimeout(window.radioTimer);window.radioTimer=setTimeout(()=>{$('radio').classList.remove('visible');refreshNoticeMetric()},Math.max(5000,cue.text.split(/\s+/).length/3*1000));
 audio.say(cue.audio,'beam');
 refreshNoticeMetric();
}
function save() {
  if (!state) return;
  const saved = saveGame(state);
  $("save-status").textContent = saved
    ? "Saved on this device. You can take a breath."
    : "This tab is running without a writable save. Keep it open to continue.";
}
function closeDialog(id) {
  if(id==='story')audio.stopLine();
  $(id).close();
  input.clear();
  input.enabled = playing && !dialogOpen();
  if (input.enabled) {
    audio.context?.resume();
    $("world").focus({ preventScroll: true });
  }
}
function openDialog(id) {
  input.clear();
  input.enabled = false;
  $(id).showModal();
  if (["pause", "map", "settings"].includes(id)) audio.context?.suspend();
  else audio.context?.resume();
}
async function prepareRoom() {
  if (!state) return;
  const r = ROOMS[state.room];
  roomRuleAwaitingAction=Boolean(state.mode==='explore'&&!state.complete&&!state.tasks?.[r.id]&&!state.puzzles?.[r.id]?.complete);
  if(roomRuleAwaitingAction){if($('radio').classList.contains('visible'))audio.stopLine();$('radio').classList.remove('visible');$('toast').classList.remove('visible');}
  await loadZone(r.zone);
  const npc = r.npc === "pip" && !state.flightComplete ? null : r.npc;
  if (npc) await prepareActors([npc]);
}
async function showStory(panels, after) {
  await storyPromise;
  storyQueue = panels;
  storyIndex = 0;
  afterStory = after;
  openDialog("story");
  renderStory();
}
function renderStory() {
  const panel = storyQueue[storyIndex];
  $("story-image").src = panel.image;
  $("story-image").alt =
    panel.caption || `${panel.speaker} aboard the recovery fleet`;
  $("story-caption").textContent = panel.caption || "A moment with the crew";
  document.querySelector('.story-volume').textContent=`MARS · VOLUME ONE / ${storyIndex+1} OF ${storyQueue.length}`;
  $("story-speaker").textContent = panel.speaker;
  $("story-line").textContent = panel.text;
  $("story-next").firstChild.textContent =
    storyIndex === storyQueue.length - 1 ? "Onward " : "Continue ";
  audio.say(panel.audio,panel.speaker.toLowerCase().replace("captain ", ""));
}
$("story-next").onclick = async () => {
  storyIndex++;
  if (storyIndex < storyQueue.length) {
    renderStory();
    return;
  }
  closeDialog("story");
  const next = afterStory;
  afterStory = null;
  if (next) await next();
};
async function startGame(continueGame) {
  $("loading").hidden = false;
  try {
    await audio.start();
    audio.setEnabled(settings.sound);
    await storyPromise;
    if (!continueGame || !state) {
      state = newGame(settings);
      state.runId = crypto.randomUUID();
      state.newJourney = true;
    }
    state.settings = { ...settings };
    await Promise.all([
      prepareRoom(),
      prepareActors(["iona"]),
      ...["machine-drone","machine-scrubber","machine-shutter","machine-caretaker"].map(name=>loadImage(name)),
      ...["catwalk","plinth","weight","arch"].map(name=>loadImage(`architecture-${name}`)),
      ...["swing", "crawl", "climb", "brace"].map((pose) =>
        loadImage(`iona-${pose}`),
      ),
      ...MOTION_ASSETS.map(name=>loadImage(name)),
    ]);
    if (state.mode === "flight") await prepareFlight();
    if (state.mode === "duel") await prepareDuel();
    $("landing").hidden = true;
    $("game").hidden = false;
    playing = true;
    input.enabled = true;
    input.clear();
    last = performance.now();
    accumulator = 0;
    $("world").focus();
    save();
    if (!continueGame)
      await showStory(storyData.prolog, () =>
        showToast("Move with the stick. Jump to cross. USE opens doors.", 6),
      );
  } catch (error) {
    showToast(error.message, 8);
    $("landing").hidden = false;
    $("game").hidden = true;
    playing = false;
  } finally {
    $("loading").hidden = true;
  }
}
$("begin").onclick = () => startGame(false);
$("continue").hidden = !state;
$("continue").onclick = () => startGame(true);
async function prepareFlight() {
  flightModule = await import("./flight.js");
  await Promise.all(
    ["mars", "moth-small", "capsule", "debris", "drone", "needlewake"].map(
      (name) => loadImage(`flight-${name}`),
    ),
  );
  await loadImage("machine-counterweight");
  if (!state.flight) state.flight = flightModule.createFlight(state.settings);
}
async function launch() {
  $("loading").hidden = false;
  try {
    await prepareFlight();
    state.mode = "flight";
    input.clear();
    save();
    showToast("Steer · hold FIRE · hold WINCH beside Pip’s capsule.", 7);
  } finally {
    $("loading").hidden = true;
  }
}
async function prepareDuel() {
  duelModule = await import("./duel.js");
  await Promise.all([prepareActors(["rook"]), loadImage("world-yard")]);
  if(!renderer.arenaRenderer){const {Renderer}=await import("./runtime/renderer.js");renderer.arenaRenderer=new Renderer($("world"),{reduced:state.settings.reduced});installDuelPresentation(renderer.arenaRenderer);}
  if(!input.arena){const {InputManager}=await import('./runtime/input.js');input.arena=new InputManager({onPause:pause});input.arena.precisionAim=true;input.duelMode=()=>state.mode==='duel';input.arena.bindMouse($('world'),(x,y)=>{const r=renderer.arenaRenderer,f=state.duel?.match.fighters[0];if(!f)return {};const dx=(x-r.canvasLeft-r.width/2)/r.camera.scale+r.camera.x-f.x,dy=(y-r.canvasTop-r.height/2)/r.camera.scale+r.camera.y-(f.y-53);return {aimX:dx,aimY:dy};});}
  input.arena.setActive(true);
  if (!state.duel) {
    state.duel = duelModule.createDuel(state.settings, innerWidth < 600);
    renderer.arenaRenderer.reset();
  }
}
async function beginDuel() {
  $("loading").hidden = false;
  try {
    await prepareDuel();
    state.mode = "duel";
    input.clear();
    save();
    showToast(
      "Two ring-outs. FIRE throws soft foam. LINE brings you back. Paint washes off.",
      7,
    );
  } finally {
    $("loading").hidden = true;
  }
}
async function finishFlight() {
  state.flightComplete = true;
  state.mode = "explore";
  enterRoom(state, 21, 20);
  await prepareRoom();
  save();
  await showStory(storyData.interludes.return,()=>showToast("Pip is safe. The contact faces are still listening.",6));
}
async function finishChapter() {
  state.duelComplete = true;
  state.complete = true;
  state.mode = "explore";
  save();
  await showStory(storyData.ending, () => {
    const minutes = Math.floor(state.elapsed / 60);
    $("ending-stats").textContent =
      `${state.visited.length}/${ROOMS.length} rooms · ${state.notes.length} field notes · ${state.secrets.length}/4 hidden observations · ${minutes} minutes with the crew`;
    openDialog("ending");
  });
}
async function handleEvents() {
  const events = state.events.splice(0);
  for (const event of events) {
    audio.effect(event.type);
    if(event.type==='enter'){roomRuleAwaitingAction=Boolean(state.mode==='explore'&&!state.complete&&!state.tasks?.[state.room]&&!state.puzzles?.[state.room]?.complete);pendingBeamEvent=null;}
    state.tutorialDone ||= [];
    const learned={jump:'jump',line:'swing',tether:'tether',task:'challenge',seal:'seal',contact:'contact',disabled:'boss'}[event.type];
    if(learned&&!state.tutorialDone.includes(learned))state.tutorialDone.push(learned);
    if(event.type==='enter'&&!state.tutorialDone.includes('exit'))state.tutorialDone.push('exit');
    beamCue(event);
    if (event.type === "enter") {
      state.roomTime = 0;
      await prepareRoom();
      save();
      showToast(ROOMS[state.room].task, 5);
      const scene=storyData.roomScenes?.[state.room];
      if(scene&&!state.sceneSeen.includes(state.room)){state.sceneSeen.push(state.room);await showStory(scene);}
    }
    if (event.type === "save") save();
    if (
      event.type === "recover" ||
      event.type === "hint" ||
      event.type === "task" || event.type === "bump" || event.type === "catch-hit" || event.type === "midboss" || event.type === "disabled"
    )
      showToast(event.text || "Machine grounded.", 4);
    if (event.type === "shortcut") {
      showToast(`${event.name} opened. Your return route is shorter.`, 5);
      save();
    }
    if (event.type === "note") {
      showToast(
        `${event.secret ? 'Hidden observation' : 'Field note'} · ${FIELD_NOTES[state.room]?.title || 'Recovered'}. Read it in the map notebook.`,
      );
      save();
    }
    if (event.type === "seal") {
      state.player.action = "brace";
      state.player.actionTime = 0.5;
      showToast(`Recovery seal checked · ${state.seals.length}/3`);
      save();
    }
    if (event.type === "contact") {
      state.player.action = "brace";
      state.player.actionTime = 0.5;
      showToast(
        event.room === 23
          ? "Two short. One long."
          : event.room === 25
            ? "The low contact answers first."
            : "The high contact. Then the held interval.",
        5,
      );
      save();
    }
    if (event.type === "tether") {
      save();
      await showStory(storyData.interludes.tether, () =>
        showToast(
          "Hold LINE near an amber anchor. Steer to swing. Jump to release.",
          7,
        ),
      );
    }
    if (event.type === "launch") {
      if (state.flightComplete) {
        enterRoom(state, 21, 20);
        await prepareRoom();
        save();
      } else await showStory(storyData.interludes.launch, launch);
    }
    if (event.type === "clock") {
      clockStep = 0;
      clockQuiet = 0;
      $("clock-feedback").textContent = "The contact faces are listening.";
      openDialog("clock");
    }
    if (event.type === "talk") {
      const lines = storyData.residents[event.speaker].filter(
        (line) => !line.requires || state[line.requires],
      );
      if (lines.length) {
        const count = talkCount[event.speaker] || 0;
        talkCount[event.speaker] = count + 1;
        await showStory([lines[count % lines.length]]);
      }
    }
  }
}
function showMap() {
  $("map-grid").replaceChildren();
  $("map-grid").style.setProperty('--map-rows',String(1+Math.max(...ROOMS.map(r=>r.row))));
  $('room-rule-title').textContent=ROOMS[state.room].name+' · room rule';
  $('room-rule-text').textContent=PUZZLES[state.room]?.clue||ROOMS[state.room].task;
  for (const r of ROOMS) {
    const cell = document.createElement("div");
    cell.className = `map-room ${state.room === r.id ? "current" : ""} ${state.visited.includes(r.id) ? "" : "unknown"}`;
    cell.style.gridColumn = String(r.column + 1);
    cell.style.gridRow = String(r.row + 1);
    const routeIndex=ROOM_ROUTE.indexOf(r.id),neighbours=[ROOMS[ROOM_ROUTE[routeIndex-1]],ROOMS[ROOM_ROUTE[routeIndex+1]]].filter(Boolean);
    cell.dataset.east = String(neighbours.some(n=>n.row===r.row&&n.column===r.column+1));
    cell.dataset.south = String(neighbours.some(n=>n.row===r.row+1&&n.column===r.column));
    const label = document.createElement("b");
    label.textContent = state.visited.includes(r.id) ? r.name : "Uncharted";
    cell.append(label);
    const info = document.createElement("small");
    info.textContent = `${state.room === r.id ? "● " : ""}${r.save && state.visited.includes(r.id) ? "◇ " : ""}${state.shortcuts.some((id) => (id === "pantry-return" && [2, 10].includes(r.id)) || (id === "crew-return" && [9, 17].includes(r.id))) ? "↕ " : ""}${state.notes.includes(r.id) ? "✓" : ""}`;
    cell.append(info);
    $("map-grid").append(cell);
  }
  $("map-progress").textContent =
    `${state.visited.length}/${ROOMS.length} rooms charted · ${state.notes.length}/${ROOMS.filter((r) => r.collectible).length} field notes · ${state.secrets.length}/4 hidden observations. Grey cells keep their secrets until you arrive.`;
  $('journal-entries').replaceChildren();
  for(const id of [...state.notes].sort((a,b)=>a-b)){
    const note=FIELD_NOTES[id];if(!note)continue;
    const item=document.createElement('article'),heading=document.createElement('h3'),body=document.createElement('p');
    heading.textContent=`${ROOMS[id].secret?'◇ ':''}${note.title}`;body.textContent=note.text;item.append(heading,body);$('journal-entries').append(item);
  }
  $('journal-count').textContent=`Field notebook · ${state.notes.length}/${ROOMS.filter(r=>r.collectible).length}`;
  openDialog("map");
  $('map').scrollTop=0;
}
function pause() {
  if (!playing || dialogOpen()) return;
  save();
  openDialog("pause");
}
$("map-button").onclick = () => {
  if (state.mode === "explore" && !dialogOpen()) showMap();
  else showToast("The area map is available on foot.");
};
$("pause-button").onclick = pause;
$('duel-help').onclick=()=>{closeDialog('pause');showStory([{image:'assets/panels/p36a.webp',speaker:'Friendly assessment',caption:'FOAM & PAINT / TWO RING-OUTS',text:'Hold FIRE. Aim with movement, the right stick, your pointer, or drag the FIRE button. More paint means more push. Jump to change the angle.'},{image:'assets/panels/p04c.webp',speaker:'The return route',caption:'DRONES CATCH EVERY FALL',text:'Hold LINE for Iona’s return grapple. Watch Rook’s amber warning before his jet escape. Assistance gives longer openings. Calm pace gives more time.'}]);};
$("resume").onclick = () => closeDialog("pause");
$("close-map").onclick = () => closeDialog("map");
$("rescue-reset").onclick = () => {
  if (state.mode === "explore") {
    state.player = newExplorer();
    state.roomTime = 0;
  }
  if (state.mode === "duel") {
    state.duel = duelModule.createDuel(state.settings, innerWidth < 600);
    renderer.arenaRenderer?.reset();
  }
  if (state.mode === "flight") {
    state.flight.hull = state.flight.maxHull;
    state.flight.invulnerable = 4;
    state.flight.ship.x = 260;
    state.flight.ship.y = 375;
  }
  save();
  closeDialog("pause");
};
$("return-title").onclick = () => {
  save();
  closeDialog("pause");
  playing = false;
  input.enabled = false;
  $("game").hidden = true;
  $("landing").hidden = false;
  $("continue").hidden = false;
};
$("end-explore").onclick = () => {
  closeDialog("ending");
  state.mode = "explore";
  enterRoom(state, 27);
  prepareRoom();
};
function settingsDialog() {
  for (const name of ["assist", "calm", "reduced", "sound"])
    $(name).checked = settings[name];
  openDialog("settings");
}
$("landing-settings").onclick = settingsDialog;
$("open-settings").onclick = settingsDialog;
$("close-settings").onclick = () => {
  for (const name of ["assist", "calm", "reduced", "sound"])
    settings[name] = $(name).checked;
  if (state) {
    state.settings = { ...settings };
    if (state.flight) {
      state.flight.assist = settings.assist;
      state.flight.calm = settings.calm;
      state.flight.maxHull = settings.assist ? 6 : 4;
      state.flight.hull = Math.min(state.flight.hull, state.flight.maxHull);
    }
    if (state.duel) {
      state.duel.calm = settings.calm;
      state.duel.match.assist = settings.assist;
    }
  }
  saveSettings(settings);
  audio.setEnabled(settings.sound);
  closeDialog("settings");
};
function tone(high) {
  audio.tone(high ? 246.94 : 164.81, 0.7, 0.22, "sine");
  if (clockStep === 0 && !high) {
    clockStep = 1;
    $("clock-feedback").textContent = "Low. Now the high contact.";
    return;
  }
  if (clockStep === 1 && high) {
    clockStep = 2;
    clockQuiet = performance.now() + 2200;
    $("clock-feedback").textContent =
      "High. Let the empty interval stay empty.";
    return;
  }
  clockStep = 0;
  clockQuiet = 0;
  $("clock-feedback").textContent =
    "Listen again. Low, high, then silence. You can try as often as you need.";
}
$("low-tone").onclick = () => tone(false);
$("high-tone").onclick = () => tone(true);
$("close-clock").onclick = () => closeDialog("clock");
for (const id of dialogs)
  $(id).addEventListener("cancel", (event) => {
    event.preventDefault();
    if (!["story", "ending"].includes(id)) closeDialog(id);
  });
document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing && !dialogOpen()) pause();
});
window.addEventListener("pagehide", save);
window.addEventListener("blur", () => {
  if (playing && !dialogOpen()) pause();
});

function updateHUD() {
  let title, zone, goal, energy, hint;
  if (state.mode === "flight") {
    const hud = flightModule.flightHUD(state.flight);
    title = 'Moth recovery';
    zone = "MOTH · RECOVERY FLIGHT";
    goal = state.flight.sector===3?'Counterweight · use the plate':state.flight.rescued?'Pip aboard · return safely':'Find Pip’s beacon';
    energy = `HULL ${state.flight.hull}/${state.flight.maxHull} · PIP ${state.flight.rescued ? "ABOARD" : "BEACON"}`;
    hint = "";
  } else if (state.mode === "duel") {
    title = "Rook · foam & paint";
    zone = "FRIENDLY ARENA · ROOK";
    goal = state.duel.rookMove ? 'Rook · jet return incoming' : 'Two ring-outs';
    energy = `YOU ${state.duel.match.fighters[0].stocks} · ROOK ${state.duel.match.fighters[1].stocks}`;
    hint = state.duel.match.fighters[0].ledge&&!(state.tutorialDone||[]).includes('duel-climb')?'Tap JUMP to climb back onto the deck.':'';
  } else {
    const r = ROOMS[state.room],
      challenge = r.challenges[state.tasks?.[r.id] || 0];
    title = r.name;
    zone = {
      academy: "ORBITAL ACADEMY ANNEX",
      needlewake: "NEEDLEWAKE · RECOVERY DECK",
      hangar: "ORBITAL ANNEX · MOTH HANGAR",
      clock: "THE WORLD CLOCK",
    }[r.zone];
    goal = r.puzzle&&!state.puzzles?.[r.id]?.complete ? PUZZLES[r.id]?.title||r.subtitle : state.complete?'All five home':!state.tether?'Find the recovery line':!state.flightComplete?`Moth seals · ${state.seals.length}/3`:`Clock contacts · ${state.contacts.length}/3`;
    energy =
      "●".repeat(state.energy) + "○".repeat(Math.max(0, 5 - state.energy));
    const target=nearby(state),learned=state.tutorialDone||[];
    hint = roomRuleAwaitingAction?(PUZZLES[r.id]?.clue||r.task):puzzleHint(state)||(!learned.includes(target?.kind)?target?.label:'')||'';
  }
  const value = [title, zone, goal, energy, hint].join("|");
  if (value === lastHUD) return;
  lastHUD = value;
  $("room-name").textContent = title;
  $("zone-label").textContent = zone;
  $("objective").textContent = goal;
  $("energy").textContent = energy;
  $("context-hint").textContent = hint;
  refreshNoticeMetric();
  $("touch-line").hidden = state.mode === "explore" && !state.tether;
  if(lastControlMode===state.mode)return;
  lastControlMode=state.mode;
  document.documentElement.dataset.mode=state.mode;
  $("map-button").hidden=state.mode!=='explore';
  $("keyboard-hint").innerHTML =
    state.mode === "flight"
      ? "STEER <kbd>W A S D</kbd><span>FIRE <kbd>SPACE / F</kbd></span><span>WINCH <kbd>X</kbd></span>"
      : state.mode === "duel"
        ? "MOVE <kbd>A D</kbd><span>JUMP <kbd>SPACE</kbd></span><span>FIRE <kbd>F / E</kbd></span><span>LINE <kbd>X</kbd></span>"
        : "MOVE <kbd>W A S D</kbd><span>JUMP <kbd>SPACE</kbd></span><span>USE <kbd>E</kbd></span><span>LINE <kbd>X</kbd></span>";
  $("touch-jump").textContent = state.mode === "flight" ? "FIRE" : "JUMP";
  $("touch-jump").setAttribute(
    "aria-label",
    state.mode === "flight" ? "Fire tool impulse" : "Jump",
  );
  $("touch-line").textContent =
    state.mode === "flight"
      ? "WINCH"
      : state.mode === "duel"
        ? "RECOVER"
        : "LINE";
  $("touch-line").setAttribute(
    "aria-label",
    state.mode === "flight"
      ? "Hold the recovery winch"
      : state.mode === "duel"
        ? "Recover to a safe platform"
        : "Hold the recovery line",
  );
  $("world").setAttribute(
    "aria-label",
    state.mode === "flight"
      ? "Pilot the Moth with arrows or WASD. Fire with Space or F. Hold X for the winch. Escape pauses."
      : state.mode === "duel"
        ? "Foam and paint arena. Move with A and D. Space jumps. F fires. X recovers. Escape pauses."
        : "Explore with arrows or WASD. Jump with Space. E interacts. X holds the line. M opens the map. Escape pauses.",
  );
  $("duel-help").hidden=state.mode!=="duel";
  $("touch-action").hidden = state.mode === "flight";
  $("touch-action").textContent = state.mode === "duel" ? "FIRE" : "USE";
  $("touch-action").setAttribute("aria-label",state.mode === "duel" ? "Fire soft foam" : "Interact");
}
async function tick(frame) {
  if (roomLoading) return;
  if (frame.pause) {
    pause();
    return;
  }
  if (frame.map) {
    if (state.mode === "explore") showMap();
    return;
  }
  if (state.mode === "explore") {
    if(roomRuleAwaitingAction&&(Math.abs(frame.x||0)>.15||Math.abs(frame.y||0)>.6||frame.jumpPressed||frame.actionPressed||frame.line&&state.tether)){
      roomRuleAwaitingAction=false;const pending=pendingBeamEvent;pendingBeamEvent=null;if(pending)beamCue(pending,true);
    }
    stepExplore(state, frame);
    if (state.events.length) {
      roomLoading = true;
      try {
        await handleEvents();
      } finally {
        roomLoading = false;
      }
    }
  } else if (state.mode === "flight") {
    flightModule.stepFlight(state.flight, frame);
    state.elapsed += 1 / 60;
    for (const event of state.flight.events){
      audio.effect(event.type === "hit" ? "bump" : event.type);
      if(event.type==='rescue')beamCue({type:'rescue',room:20});
    }
    if (state.flight.done) {
      roomLoading = true;
      try {
        await finishFlight();
      } finally {
        roomLoading = false;
      }
    }
  } else if (state.mode === "duel") {
    renderer.arenaRenderer?.capture(state.duel.match);
    duelModule.stepDuel(state.duel, frame);
    renderer.arenaRenderer?.events(state.duel.events);
    for(const event of state.duel.events){audio.effect(event.type);if(event.type==='climb'&&event.player===0){state.tutorialDone||=[];if(!state.tutorialDone.includes('duel-climb'))state.tutorialDone.push('duel-climb');}}
    state.elapsed += 1 / 60;
    if (state.duel.done) {
      roomLoading = true;
      try {
        await finishChapter();
      } finally {
        roomLoading = false;
      }
    }
    if (state.duel.failed) {
      state.duel = duelModule.createDuel(state.settings, innerWidth < 600);
      renderer.arenaRenderer?.reset();
      showToast(
        "Rook wins this practice. Drones have you. Try again: build foam, then push at the edge.",
        7,
      );
    }
  }
}
let menuPadPrevious = [];
function updateControllerMenu() {
  const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
  const buttons = pad ? pad.buttons.map((button) => button.pressed) : [];
  const pressed = (index) => buttons[index] && !menuPadPrevious[index];
  const opened = dialogs.map((id) => $(id)).filter((dialog) => dialog.open);
  const active =
    opened.find((dialog) => dialog.contains(document.activeElement)) ||
    opened.at(-1);
  if (active || !playing) {
    const panel = active || $("landing");
    const targets = [
      ...panel.querySelectorAll("button:not([disabled]), a, input"),
    ].filter((element) => !element.hidden && element.getClientRects().length);
    const current = targets.indexOf(document.activeElement);
    if (pressed(12) || pressed(13)) {
      const direction = pressed(13) ? 1 : -1;
      targets[
        (Math.max(0, current) + direction + targets.length) % targets.length
      ]?.focus();
    }
    if (active?.id === "map" && (pressed(14) || pressed(15))) {
      document
        .querySelector(".map-viewport")
        .scrollBy({ left: pressed(15) ? 90 : -90, behavior: "instant" });
    }
    if (pressed(0)) {
      const target = targets.includes(document.activeElement)
        ? document.activeElement
        : active?.id === "story"
          ? $("story-next")
          : active?.id === "pause"
            ? $("resume")
            : $("begin");
      target?.click();
    }
    if (
      (pressed(1) || pressed(9)) &&
      active &&
      !["story", "ending"].includes(active.id)
    )
      closeDialog(active.id);
  }
  menuPadPrevious = buttons;
}
let lastOrientation = innerWidth > innerHeight;
window.addEventListener("resize", () => {
  const orientation = innerWidth > innerHeight;
  if (orientation !== lastOrientation && playing && !dialogOpen()) pause();
  lastOrientation = orientation;
});
function animate(now) {
  updateControllerMenu();
  const dt = Math.min(0.08, Math.max(0, (now - last) / 1000 || 0));
  last = now;
  if (playing) {
    // Loading is a separate overlay. Fixed ticks never run behind a dialog.
    if (!dialogOpen() && !roomLoading && $("loading").hidden) {
      accumulator += dt;
      let ticks = 0;
      while (accumulator >= 1 / 60 && ticks < 5) {
        tick(input.read());
        accumulator -= 1 / 60;
        ticks++;
        if (dialogOpen() || roomLoading) break;
      }
      audio.update(
        state.mode === "explore" ? ROOMS[state.room].zone : state.mode,
        state.mode !== "explore" || Boolean(ROOMS[state.room].machine && !state.defeated?.includes(state.room) && state.roomTime%6>2 && state.roomTime%6<4.7) || (state.room===16&&!state.midbossComplete),
      );
    } else {accumulator = 0;if($("story").open)audio.update(state.mode==="explore"?ROOMS[state.room].zone:state.mode,false);}
    if (state.mode === "flight" && flightModule && state.flight) {
      renderer.begin();
      flightModule.drawFlight(renderer.ctx, state.flight, {
        width: renderer.width,
        height: renderer.height,
        images,
        reduced: state.settings.reduced,
      });
    } else if (state.mode === "duel" && duelModule && state.duel)
      renderer.drawDuel(state.duel, now / 1000, state.settings);
    else renderer.drawExplore(state, now / 1000);
    if(now>=nextHUD){updateHUD();nextHUD=now+100;}
    if (now - lastSave > 8000) {
      save();
      lastSave = now;
    }
    if (now > toastUntil&&$("toast").classList.contains('visible')){$("toast").classList.remove("visible");refreshNoticeMetric();}
  }
  if ($("clock").open && clockStep === 2 && now >= clockQuiet) {
    clockStep = 3;
    closeDialog("clock");
    showStory(storyData.interludes.duel, beginDuel);
  }
  if (renderer.last) {
    renderer.frames.push(now - renderer.last);
    if (renderer.frames.length > 900) renderer.frames.shift();
  }
  renderer.last = now;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
const offlineButton = document.createElement("button");
offlineButton.textContent = "Save chapter offline";
offlineButton.id = "offline-download";
$("settings").insertBefore(offlineButton, $("close-settings"));
offlineButton.onclick = async () => {
  if (!("serviceWorker" in navigator)) {
    offlineButton.textContent = "Offline caching needs a local HTTP server";
    return;
  }
  offlineButton.disabled = true;
  offlineButton.textContent = "Preparing offline chapter…";
  try {
    const registration = await navigator.serviceWorker.ready;
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      offlineButton.textContent = event.data.done
        ? "Chapter ready offline"
        : `Saving chapter · ${event.data.current}/${event.data.total}`;
      if (event.data.error) {
        offlineButton.textContent = "Connection interrupted. Try again.";
        offlineButton.disabled = false;
      }
    };
    registration.active.postMessage({ type: "download" }, [channel.port2]);
  } catch {
    offlineButton.textContent = "Offline download unavailable. Try again.";
    offlineButton.disabled = false;
  }
};

// Read-only diagnostics and the actual entry points support reproducible local QA.
window.MARS_SAGA = {
  get state() {
    return state;
  },
  get metrics() {
    return renderer.metrics;
  },
  get frameTimes() {
    return [...renderer.frames];
  },
  get audio() {
    return audio;
  },
  save,
  enterRoom: async (id) => {
    enterRoom(state, id, state.room);
    await prepareRoom();
    save();
  },
  step: (frame) => tick(frame),
  startGame,
  openMap: showMap,
  get input() {
    return input;
  },
};
