import {
  CHARACTERS,
  ARENAS,
  createMatch,
  stepMatch,
  botInput,
  snapshot,
  finishMatch,
} from "./engine.js";
import { Renderer, PLAYER_COLORS, preloadArt } from "./renderer.js";
import { InputManager } from "./input.js";
import { Sound } from "./audio.js";
import RELEASE from "./release.js";
import {COURSE,RANKS,SIGNATURES,COMMS,CHECK_LABELS,assess,progressText,applyVolumeContent} from './academy.js';
import {FleetScreen,renderCourse} from './fleet.js';
import {VoiceDirector} from './voice.js';
import {getDailyDrill,readDailyBest,saveDailyResult,dailyShareText,dailyPNG,assessDailyDrill,dailyProgressText} from './daily.js';
import {sharePrepared,PLAY_URL} from './share.js';
import {ArenaViewport} from './viewport.js';

applyVolumeContent(RELEASE);

const $ = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const qaEnabled =
  ["127.0.0.1", "localhost"].includes(location.hostname) &&
  new URLSearchParams(location.search).has("qa");
const characterById = Object.fromEntries(
  CHARACTERS.map((character) => [character.id, character]),
);
const STORAGE = "mars-out-of-orbit-v1";
const defaults = {
  version: 1,
  rounds: 0,
  lessons: [],
  seen: [],
  legacyPip: false,
  service: String(Math.floor(100000+Math.random()*899999)),
  gauntlets: 0,
  sound: true,
  assist: false,
  reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
};
let record = { ...defaults };
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE));
  if (stored?.version === 1) {
    record.rounds = Math.max(
      0,
      Math.min(999999, Math.floor(Number(stored.rounds) || 0)),
    );
    record.gauntlets = Math.max(
      0,
      Math.min(999999, Math.floor(Number(stored.gauntlets) || 0)),
    );
    record.lessons=Array.isArray(stored.lessons)?stored.lessons.slice(0,7).map(l=>l&&typeof l==='object'?{passed:l.passed===true,grade:['A+','A','B'].includes(l.grade)?l.grade:'B'}:null):[];
    record.seen=Array.isArray(stored.seen)?stored.seen.filter(id=>characterById[id]):[];
    record.legacyPip=typeof stored.legacyPip==='boolean'?stored.legacyPip:!Array.isArray(stored.lessons)&&record.rounds>=3;
    if(/^\d{6}$/.test(stored.service))record.service=stored.service;
    for (const key of ["sound", "assist", "reduced"])
      if (typeof stored[key] === "boolean") record[key] = stored[key];
  }
} catch {}

function saveRecord() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(record));
  } catch {}
}
let lessonIndex=Math.max(0,Math.min(6,record.lessons.findIndex(l=>!l?.passed)<0?record.lessons.length:record.lessons.findIndex(l=>!l?.passed))),
  assessment=null,signatureTimer=0,signaturePriorityUntil=0,slowMoment=0,launchPending=false;
let mode = "academy",
  activeSeat = 0,
  arenaId = "deck",
  roundRule = "timed";
let seats = [
  { character: "iona", binding: "keyboard1" },
  { character: "rook", binding: "bot" },
  { character: "sera", binding: "bot" },
  { character: "tavi", binding: "bot" },
];
let match = null,
  matchBindings = [],
  playing = false,
  paused = false,
  resultShown = false;
let countdown = 0,
  countdownWord = "",
  accumulator = 0,
  lastFrame = performance.now(),
  hudTick = -1;
let previewMatch = createMatch({
  characters: ["iona", "rook", "sera", "beam"],
  controllers: ["bot", "bot", "bot", "bot"],
  difficulty: 1,
  arena: "deck",
  seed: 1411,
});
let previewAccumulator = 0,
  previewVisible = true,
  seedCounter = 2705;
let gauntlet = { round: 0, complete: false, won: false };
let finishTimer = 0,
  broadcastTimer = 0,
  toastTimer = 0,
  lastCommentTick = 0;
let dailyDrill=null,dailyResult=null,volumeDrill=null,preparedShare=null,shareGeneration=0;
let resetTouchControls = () => {};
const sound = new Sound();
sound.set(record.sound);
const fleet=new FleetScreen(sound,RELEASE.voices);
const director=new VoiceDirector(sound,RELEASE.voiceLines,{subtitle:line=>{ $('#combat-comms').classList.toggle('voice-active',line.audioAvailable===true);broadcast(line.text,{source:line.speaker.toUpperCase(),duration:line.durationMs||Math.max(3000,line.text.split(/\s+/).length*350)}); }});
const input = new InputManager({
  onInputMethod: (method,padIndex) => {
    viewport.setMethod(method);
    if(playing&&mode!=='local'&&matchBindings.length){
      if(method==='gamepad'&&Number.isInteger(padIndex))matchBindings[0]='gamepad'+padIndex;
      else if(method==='keyboard'||method==='mouse')matchBindings[0]='keyboard1';
    }
  },
  onPause: () => {
    if (playing) paused ? resumeMatch() : pauseMatch();
  },
  onGamepadChange: () =>
    queueMicrotask(() => {
      if (playing)
        pauseMatch(
          "Controller connection changed. Check the crew before continuing.",
        );
      else renderSlots();
    }),
});
const previewRenderer = new Renderer($("#preview"), {
  preview: true,
  reduced: record.reduced,
});
const renderer = new Renderer($("#arena-canvas"), { reduced: record.reduced });
let powerSaving=false;
const viewport=new ArenaViewport({
  onResize:()=>{renderer.resize();previewRenderer.resize();},
  onRotate:()=>{resetTouchControls();pauseMatch('The arena turned with you. Ready when you are.');renderer.cameraInitialized=false;},
  onMethod:method=>{resetTouchControls();if(playing&&mode!=='local'&&method==='touch')matchBindings[0]='keyboard1';},
  onReduced:enabled=>setReduced(enabled),
});
input.bindMouse($('#arena-canvas'), (clientX, clientY) => {
  const fighter = match?.fighters[0];
  if (!fighter) return { aimX: 0, aimY: 0 };
  const box = $('#arena-canvas').getBoundingClientRect(), camera = renderer.camera;
  return {
    aimX: camera.x + (clientX - box.left - renderer.width / 2) / camera.scale - fighter.x,
    aimY: camera.y + (clientY - box.top - renderer.height / 2) / camera.scale - (fighter.y - 53),
  };
});
$('#effects-setting').checked=record.reduced;
function showLobbyPanel(panel){
  $('#lobby').dataset.panel=panel;
  for(const button of all('.deck-nav [data-panel]'))button.setAttribute('aria-pressed',String(button.dataset.panel===panel));
  previewRenderer.resize();
}
for(const button of all('.deck-nav [data-panel]'))button.addEventListener('click',()=>showLobbyPanel(button.dataset.panel));
for(const button of all('.setup-tabs [data-setup]'))button.addEventListener('click',()=>{
  $('#lobby').dataset.setup=button.dataset.setup;
  for(const choice of all('.setup-tabs [data-setup]'))choice.setAttribute('aria-pressed',String(choice===button));
});
$('.cover-jump').addEventListener('click',e=>{e.preventDefault();showLobbyPanel('setup');});
$('.skip-link').addEventListener('click',()=>showLobbyPanel('setup'));
$('#settings-open').addEventListener('click',()=>$('#settings').showModal());
$('#settings-game').addEventListener('click',()=>$('#settings').showModal());
// Use the browser's exposed power signals; no unsupported battery mode is guessed.
const connection=navigator.connection;
function applyPowerSaving(enabled){
  powerSaving=enabled;renderer.reduced=record.reduced||enabled;previewRenderer.reduced=record.reduced||enabled;
  renderer.ratioCap=enabled?1:undefined;renderer.resize();
}
if(connection?.saveData)applyPowerSaving(true);
navigator.getBattery?.().then(battery=>{
  const update=()=>applyPowerSaving(Boolean(connection?.saveData||(!battery.charging&&battery.level<=.2)));
  battery.addEventListener('levelchange',update);battery.addEventListener('chargingchange',update);update();
}).catch(()=>{});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)setReduced(true);});
const performanceSamples = [];
const runLog = [];

function notify(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
}

function isPipUnlocked() {
  return record.legacyPip || Boolean(record.lessons[2]?.passed);
}

function renderCrew() {
  const container = $("#crew-grid");
  container.replaceChildren();
  for (const character of CHARACTERS) {
    const locked = character.id === "pip" && !isPipUnlocked();
    const status = locked
      ? "PASS LESSON 03"
      : character.id === "pip"
        ? "RECOVERED"
        : "READY";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "crew-card" + (locked ? " locked" : "");
    button.dataset.character = character.id;
    button.setAttribute(
      "aria-pressed",
      String(seats[activeSeat].character === character.id),
    );
    button.setAttribute(
      "aria-label",
      `${character.name} ${status}. ${locked ? "Complete Camera suitability." : `Choose for seat ${activeSeat + 1}.`}`,
    );
    const image = new Image();
    image.src = `assets/${character.id}.webp`;
    image.alt = "";
    image.width = 420;
    image.height = 520;
    image.loading = "lazy";
    const name = document.createElement("span");
    name.className = "crew-name";
    name.textContent = character.name.toUpperCase();
    const tag = document.createElement("span");
    tag.className = "crew-tag";
    tag.textContent = status;
    button.append(image, name, document.createTextNode(" "), tag);
    button.addEventListener("click", () => {
      if (locked) {
        notify(
          "Pip joins after passing lesson 3: Camera suitability.",
        );
        return;
      }
      seats[activeSeat].character = character.id;
      renderCrew();
      renderSlots();
      renderCharacter();
      if(!record.seen.includes(character.id)){
        record.seen.push(character.id);saveRecord();
        sound.unlock().then(()=>fleet.show({character,lesson:COURSE[lessonIndex]}));
      }
    });
    container.append(button);
  }
  $("#unlock-note").textContent = isPipUnlocked()
    ? "Pip recovered. The whole crew is here."
    : "Pip joins after passing lesson 3: Camera suitability.";
}

function renderCharacter() {
  const character = characterById[seats[activeSeat].character];
  const readout = $("#character-readout");
  readout.replaceChildren();
  const description = document.createElement("span");
  const name = document.createElement("strong");
  name.textContent = `SEAT ${activeSeat + 1} / ${character.name.toUpperCase()} `;
  description.append(name, document.createTextNode(character.description));
  const special = document.createElement("span");
  special.className = "special-label";
  special.textContent = 'ϟ '+character.specialName+' / '+SIGNATURES[character.id].passive;
  special.title=SIGNATURES[character.id].detail;
  const passive=document.createElement('small');passive.className='passive-note';passive.textContent=SIGNATURES[character.id].detail;
  readout.append(description, special,passive);
}

function bindingLabel(binding) {
  if (binding === "bot") return "Computer";
  if (binding === "empty") return "Empty seat";
  if (binding.startsWith("gamepad"))
    return `Controller ${Number(binding.slice(7)) + 1}`;
  return `Keyboard ${binding.slice(8)}`;
}

function renderSlots() {
  const container = $("#player-slots");
  container.replaceChildren();
  const connected = input.connected();
  const bindings = [
    "keyboard1",
    "keyboard2",
    "keyboard3",
    "keyboard4",
    "gamepad0",
    "gamepad1",
    "gamepad2",
    "gamepad3",
    "bot",
    "empty",
  ];
  seats.forEach((seat, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "player-slot" + (index === activeSeat ? " active" : "");
    wrapper.style.setProperty("--slot-color", PLAYER_COLORS[index]);
    const button = document.createElement("button");
    button.className = "seat-select";
    button.type = "button";
    button.dataset.seat = String(index);
    button.disabled=["academy","gauntlet"].includes(mode)&&index>0;
    button.setAttribute(
      "aria-label",
      `0${index + 1} ${characterById[seat.character].name}. Edit seat ${index + 1}.`,
    );
    button.setAttribute("aria-pressed", String(index === activeSeat));
    const number = document.createElement("b");
    number.textContent = `0${index + 1}`;
    const name = document.createElement("span");
    name.textContent = characterById[seat.character].name.toUpperCase();
    button.append(number, document.createTextNode(" "), name);
    button.addEventListener("click", () => {
      activeSeat = index;
      renderSlots();
      renderCrew();
      renderCharacter();
    });
    const select = document.createElement("select");
    select.setAttribute("aria-label", `Input for seat ${index + 1}`);
    select.dataset.inputSeat = String(index);
    for (const binding of bindings) {
      if (mode !== "local" && index === 0 && ["bot", "empty"].includes(binding))
        continue;
      if (mode !== "local" && index > 0 && !["bot", "empty"].includes(binding))
        continue;
      const option = document.createElement("option");
      option.value = binding;
      const gamepadIndex = Number(binding.slice(7));
      option.textContent =
        bindingLabel(binding) +
        (binding.startsWith("gamepad") &&
        !connected.some((pad) => pad.index === gamepadIndex)
          ? " · connect"
          : "");
      option.selected = binding === seat.binding;
      select.append(option);
    }
    select.disabled = ["gauntlet","academy"].includes(mode) && index > 0;
    select.addEventListener("change", () => {
      seat.binding = select.value;
      if (!["bot", "empty"].includes(seat.binding)) {
        seats.forEach((other, otherIndex) => {
          if (otherIndex !== index && other.binding === seat.binding)
            other.binding = "bot";
        });
      }
      renderSlots();
    });
    wrapper.append(button, select);
    container.append(wrapper);
  });
  const humanCount = seats.filter(
    (seat) => !["bot", "empty"].includes(seat.binding),
  ).length;
  $("#input-notice").textContent =
    mode === "local" && humanCount < 2
      ? "Assign two or more human seats for local crew play."
      : "";
}

function chooseMode(next) {
  mode = next;
  gauntlet = { round: 0, complete: false, won: false };
  activeSeat = 0;
  for (const button of all("[data-mode]"))
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
  seats[0].binding = "keyboard1";
  seats[1].binding = mode === "local" ? "keyboard2" : "bot";
  seats[2].binding = mode === "gauntlet" ? "empty" : "bot";
  seats[3].binding = mode === "gauntlet" ? "empty" : "bot";
  if(mode==="academy"){
    const opponents=lessonIndex===0?["rook"]:lessonIndex<4?["rook","tavi"]:["rook","sera","beam"];
    for(let i=1;i<4;i++){seats[i].character=opponents[i-1]||seats[i].character;seats[i].binding=opponents[i-1]?"bot":"empty";}
    $("#arena-select").value=COURSE[lessonIndex].arena;
    $("#arena-description").textContent=COURSE[lessonIndex].rule;
    $("#difficulty").value=lessonIndex<2?"0":"1";
  }else{
    $("#arena-select").value=arenaId;
    $("#arena-description").textContent=ARENAS.find(a=>a.id===arenaId).description;
  }
  all("[data-rule]").forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rule===(mode==="academy"?"timed":roundRule))));
  $('[data-rule="timed"]').textContent=(mode==="academy"?COURSE[lessonIndex].duration:150)+' seconds';
  $("#arena-select").disabled = ["gauntlet","academy"].includes(mode);
  $("#difficulty").disabled=mode==="academy";
  all("[data-rule]").forEach(b=>b.disabled=mode==="academy");
  $("#start strong").textContent=mode==="academy"?"LESSON "+String(lessonIndex+1).padStart(2,'0'):"TRAINING";
  $("#mode-description").textContent = {
    academy: COURSE[lessonIndex].title+' / '+COURSE[lessonIndex].target,
    victory:"GRADUATE BONUS / Gold studio. Double ring-out points. Faster specials.",
    solo: "You against the fleet. 150 seconds to make your case.",
    local: "Two to four humans. Share a keyboard or connect controllers.",
    gauntlet:
      "Six training fights. Win each to earn Beam’s most excessive medal.",
  }[mode];
  renderSlots();
  renderCrew();
  renderCharacter();
}

function currentOptions(gauntletRound = gauntlet.round) {
  if(mode==='daily')return {characters:[dailyDrill.character,...dailyDrill.bots],controllers:['human','bot','bot'],bindings:['keyboard1','bot','bot'],...dailyDrill};
  if(mode==='volume')return {characters:[volumeDrill.character,...volumeDrill.bots],controllers:['human',...volumeDrill.bots.map(()=>'bot')],bindings:['keyboard1',...volumeDrill.bots.map(()=>'bot')],arena:volumeDrill.arena,lesson:volumeDrill.lesson,difficulty:volumeDrill.difficulty};
  if(mode==="academy"){
    const opponents=lessonIndex===0?["rook"]:lessonIndex<4?["rook","tavi"]:["rook","sera","beam"];
    return {characters:[seats[0].character,...opponents],controllers:["human",...opponents.map(()=>"bot")],bindings:[seats[0].binding,...opponents.map(()=>"bot")],arena:COURSE[lessonIndex].arena,difficulty:lessonIndex<2?0:1,lesson:COURSE[lessonIndex].id};
  }
  if (mode === "gauntlet") {
    const opponents = [
      ["rook"],
      ["tavi"],
      ["sera"],
      ["rook", "beam"],
      ["iona", "tavi"],
      ["sera", "rook", "beam"],
    ][gauntletRound];
    return {
      characters: [seats[0].character, ...opponents],
      controllers: ["human", ...opponents.map(() => "bot")],
      bindings: [seats[0].binding, ...opponents.map(() => "bot")],
      arena: ARENAS[gauntletRound % ARENAS.length].id,
      difficulty: Math.max(
        Number($("#difficulty").value),
        gauntletRound > 3 ? 2 : gauntletRound > 1 ? 1 : 0,
      ),
    };
  }
  const active = seats.filter((seat) => seat.binding !== "empty");
  return {
    characters: active.map((seat) => seat.character),
    controllers: active.map((seat) =>
      seat.binding === "bot" ? "bot" : "human",
    ),
    bindings: active.map((seat) => seat.binding),
    arena: mode==="victory"?"studio":arenaId,
    difficulty: Number($("#difficulty").value),
  };
}

async function startMatch({ rematch = false, advance = false } = {}) {
  if(launchPending || fleet.open)return;
  sound.resume();const audioReady=sound.unlock();
  const priorLesson=lessonIndex,priorAssessment=assessment;
  if(mode==="academy" && advance && assessment?.passed)lessonIndex=lessonIndex===6?0:lessonIndex+1;
  const nextGauntletRound =
    mode === "gauntlet"
      ? gauntlet.complete
        ? 0
        : Math.min(5, gauntlet.round + (advance && gauntlet.won ? 1 : 0))
      : 0;
  const options = currentOptions(nextGauntletRound);
  if (options.characters.length < 2) {
    notify("Training needs at least two occupied seats.");
    return;
  }
  const humans = options.bindings.filter((binding) => binding !== "bot");
  if (mode === "local" && humans.length < 2) {
    notify("Choose a keyboard or controller for at least two seats.");
    return;
  }
  if (
    matchMedia("(pointer:coarse)").matches &&
    mode === "local" &&
    humans.some((binding) => binding.startsWith("keyboard"))
  ) {
    notify(
      "Local crew uses physical keyboards or controllers. Touch controls serve seat 1.",
    );
  }
  const connected = input.connected();
  const missing = humans.find(
    (binding) =>
      binding.startsWith("gamepad") &&
      !connected.some((pad) => pad.index === Number(binding.slice(7))),
  );
  if (missing) {
    lessonIndex=priorLesson;assessment=priorAssessment;
    notify(
      `Connect ${bindingLabel(missing).toLowerCase()} and press a button to join.`,
    );
    return;
  }
  if (mode === "gauntlet")
    gauntlet = { round: nextGauntletRound, complete: false, won: false };
  assessment=null;
  preparedShare=null;shareGeneration++;dailyResult=null;
  clearTimeout(finishTimer);
  clearTimeout(broadcastTimer);
  $("#result").close();
  $("#broadcast").classList.remove("visible");
  match = createMatch({
    ...options,
    rule: ['academy','daily','volume','quick'].includes(mode)?"timed":roundRule,
    duration: mode==="academy"?COURSE[lessonIndex].duration:mode==='daily'?dailyDrill.duration:mode==='volume'?volumeDrill.duration:150,
    compact: mode==='daily'?dailyDrill.compact:matchMedia("(max-width:600px) and (orientation:portrait)").matches,
    victoryLap:mode==="victory"&&record.lessons.filter(l=>l?.passed).length===7,
    stocks: 3,
    seed: mode==='daily'?dailyDrill.seed:++seedCounter,
    assist: mode==='daily'?false:record.assist,
  });
  matchBindings = options.bindings;
  playing = true;
  paused = false;
  resultShown = false;
  countdown = mode==='quick'?0:mode==='daily'?.65:rematch ? 1.1 : 2.1;
  countdownWord = "";
  accumulator = 0;
  hudTick = -1;
  lastCommentTick = 0;
  performanceSamples.length = 0;
  runLog.length = 0;
  $("#lobby").hidden = true;
  $("#game").hidden = false;
  $('#game').classList.remove('is-paused');
  document.documentElement.classList.add('arena-playing');
  viewport.schedule();$('#home-screen-tip').hidden=true;
  $("#pause-overlay").hidden = true;
  $("#pause-overlay").removeAttribute("aria-modal");
  document.body.style.overflow = "hidden";
  $("#match-label").textContent = ARENAS.find(
    (arena) => arena.id === match.arena,
  ).name.toUpperCase();
  $("#round-label").textContent =
    (mode==='daily'?'DAILY DRILL / '+dailyDrill.label:mode==='quick'?'QUICK FIGHT':mode==='volume'?'VOLUME '+volumeDrill.volume+' / FIELD DRILL':mode === "academy" ? 'CADET '+(lessonIndex+1)+' / 7' : mode === "gauntlet"
      ? `GAUNTLET ${gauntlet.round + 1} / 6`
      : match.rule === "timed"
        ? "TIMED TRAINING"
        : "THREE RECOVERIES") + (record.assist&&mode!=='daily' ? " / ASSIST" : "");
  $("#keyboard-hint").textContent =
    mode === "local"
      ? "P1 WASD / SPACE / F G · P2 ARROWS / R SHIFT / K L · P3 N M I , / H / Y U · P4 NUM 4 6 8 2 / 5 / 0 ."
      : "WASD MOVE / AIM · SPACE JUMP · F FIRE · G SPECIAL · MOUSE AIM / CLICK FIRE · ESC PAUSE";
  input.clear();
  $("#signature-flash").hidden=true;signaturePriorityUntil=0;slowMoment=0;
  resetTouchControls();
  input.setActive(true);
  renderer.resize();
  renderer.reset();
  renderHud(true);
  $("#arena-canvas").focus({ preventScroll: true });
  await audioReady;
  sound.resume();
  if(!['quick','daily','volume'].includes(mode)){
    launchPending=true;
    input.setActive(false);
    await fleet.show({lesson:mode==="academy"?COURSE[lessonIndex]:COURSE[mode==="gauntlet"?gauntlet.round:Math.max(0,ARENAS.findIndex(a=>a.id===match.arena))]});
    launchPending=false;
  }
  if(!playing)return;
  sound.music(match.arena);
  director.trigger(mode==='quick'?'quick':mode==='daily'?'daily':mode==='academy'?'lesson:'+COURSE[lessonIndex].id:'start');
  input.clear();input.setActive(true);lastFrame=performance.now();
  $("#arena-canvas").focus({preventScroll:true});
}

function pauseMatch(
  reason = "Training paused. Everybody stays exactly where they are.",
) {
  if (!playing || paused || resultShown) return;
  paused = true;
  $('#home-screen-tip').hidden=true;
  accumulator = 0;
  input.clear();
  resetTouchControls();
  sound.pause();
  director.stop();
  $("#pause-reason").textContent = reason;
  $("#pause-overlay").hidden = false;
  $('#pause-overlay').setAttribute('role','dialog');$('#pause-overlay').setAttribute('aria-modal','true');$('#pause-overlay').setAttribute('aria-label','Training paused');
  $('#game').classList.add('is-paused');
  $("#resume").focus({ preventScroll: true });
}

function resumeMatch() {
  if (!playing || !paused) return;
  paused = false;
  accumulator = 0;
  lastFrame = performance.now();
  $("#pause-overlay").hidden = true;
  $("#pause-overlay").removeAttribute("aria-modal");
  $('#game').classList.remove('is-paused');
  input.clear();
  input.setActive(true);
  sound.resume();
  $("#arena-canvas").focus({ preventScroll: true });
}

function returnToLobby() {
  const destination=resultShown&&mode==='quick'?'course':'setup';
  clearTimeout(finishTimer);
  clearTimeout(broadcastTimer);
  playing = false;
  paused = false;
  resultShown = false;
  $("#result").close();
  $("#game").hidden = true;
  $("#lobby").hidden = false;
  document.documentElement.classList.remove('arena-playing');
  $('#game').classList.remove('is-paused');$('#home-screen-tip').hidden=true;
  $("#pause-overlay").hidden = true;
  $("#pause-overlay").removeAttribute("aria-modal");
  $("#broadcast").classList.remove("visible");
  input.clear();
  resetTouchControls();
  input.setActive(false);
  sound.pause();
  director.stop();
  clearTimeout(signatureTimer);$('#signature-flash').hidden=true;
  document.body.style.overflow = "";
  if(['quick','daily','volume'].includes(mode))chooseMode('academy');
  renderCrew();
  renderSlots();
  renderCharacter();
  refreshCourse();
  refreshDaily();
  previewRenderer.resize();
  showLobbyPanel(destination);$(destination==='course'?'#course-map button:not(:disabled)':'#start').focus({ preventScroll: true });
}

function renderHud(force = false) {
  if (!match) return;
  const container = $("#fighter-hud");
  if (force) {
    container.replaceChildren();
    for (const f of match.fighters) {
      const card = document.createElement("div");
      card.className = "hud-card" + (match.rule === "timed" ? " timed" : "");
      card.dataset.player = f.index;
      card.style.setProperty("--slot-color", PLAYER_COLORS[f.index]);
      card.innerHTML = `<img src="assets/${f.id}.webp" alt=""><div class="hud-name"><span>${characterById[f.id].name.toUpperCase()}</span><small>P${f.index + 1} ${matchBindings[f.index] === "bot" ? "CPU" : ""}</small></div><div class="strain-row"><strong class="strain-number">0</strong><span class="strain-label">STRAIN</span></div><div class="recovery-pips"><i></i><i></i><i></i></div><span class="hud-special">SPECIAL READY</span><div class="special-bar"><i></i></div>`;
      const net = document.createElement("span");
      net.className = "net-score";
      card.querySelector(".recovery-pips").append(net);
      container.append(card);
    }
  }
  for (const f of match.fighters) {
    const card = container.children[f.index];
    if (!card) continue;
    card.classList.toggle("eliminated", !f.alive);
    const strain = card.querySelector(".strain-number");
    strain.textContent = Math.round(f.damage);
    strain.style.color =
      f.damage > 120 ? "#ff9875" : f.damage > 65 ? "#f1cf87" : "#f2ebdc";
    card.setAttribute(
      "aria-label",
      `${characterById[f.id].name}, ${Math.round(f.damage)} strain, ${match.rule === "timed" ? `${f.score - f.stats.recoveries} net score` : `${f.stocks} recoveries remaining`}`,
    );
    card.querySelector(".net-score").textContent =
      match.rule === "timed"
        ? `NET ${f.score - f.stats.recoveries > 0 ? "+" : ""}${f.score - f.stats.recoveries}`
        : "";
    [...card.querySelectorAll(".recovery-pips i")].forEach((pip, index) =>
      pip.classList.toggle("spent", index >= f.stocks),
    );
    card.querySelector(".special-bar i").style.transform =
      `scaleX(${Math.max(0, 1 - f.specialCooldown / 7)})`;
    card.querySelector(".hud-special").textContent =
      f.specialCooldown > 0
        ? `SPECIAL ${f.specialCooldown.toFixed(1)}s`
        : "SPECIAL READY";
  }
  $("#lesson-objective").hidden=!['academy','daily','volume'].includes(mode);
  if(['academy','daily'].includes(mode))$("#lesson-objective").innerHTML="<b>"+(mode==='daily'?'DAILY / ':'')+COURSE[mode==='daily'?dailyDrill.lessonIndex:lessonIndex].title.toUpperCase()+"</b>"+(mode==='daily'?dailyProgressText(match,dailyDrill):progressText(match));
  if(mode==='volume')$('#lesson-objective').textContent=volumeDrill.title+' / '+Math.min(volumeDrill.goal,match.training.steadyTime||0).toFixed(1)+' / '+volumeDrill.goal+' s';
  $("#lesson-coach").hidden=mode!=="academy"||match.tick>1200;
  if(mode==="academy"&&match.tick<=1200){
    const t=match.training;
    $("#lesson-coach").textContent=lessonIndex===0? t.travel<110?"MOVE / A D · left stick":t.jumps<2?"JUMP / SPACE · A on controller · JUMP touch":!t.aimUp?"AIM UP / drag FIRE ↑ · right stick ↑ · W + F":!t.aimDown?"AIM DOWN / drag FIRE ↓ · right stick ↓ · S + F":match.fighters[0].stats.hits<3?"LAND 3 HITS / aim at a cadet, then fire":t.specials<1?"SPECIAL / G · B on controller · SPECIAL touch":"OBJECTIVES MET / Practise until the bell.":COURSE[lessonIndex].order;
  }
  const seconds = Math.ceil(match.time);
  $("#clock").textContent =
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  $("#clock").classList.toggle("warning", seconds <= 20);
  const hazard = match.hazard;
  $("#hazard-banner").textContent = hazard?.label || "";
  $("#hazard-banner").classList.toggle(
    "visible",
    Boolean(hazard && hazard.phase !== "quiet" && hazard.label),
  );
}

function broadcast(
  text,
  { audio = null, source = "GAME COMMENTARY", duration = 3200 } = {},
) {
  clearTimeout(broadcastTimer);
  const container = $("#broadcast");
  container.querySelector("span").textContent = /BEAM|DECK INSTRUCTOR/.test(source)?source:`BEAM / ${source}`;
  container.querySelector("p").textContent = text;
  container.classList.add("visible");
  if (audio) sound.say({ text, audio, source });
  broadcastTimer = setTimeout(
    () => {container.classList.remove("visible");$('#combat-comms').classList.remove('voice-active');},
    duration,
  );
}

function processEvents(events) {
  renderer.events(events);
  for (const event of events) {
    sound.event(event);
    if (event.type === "ringout" && match.tick - lastCommentTick > 160) {
      director.trigger(event.target<0?'own':'ringout');
      lastCommentTick = match.tick;
    }
    if(event.type==='special' && characterById[match.fighters[event.player]?.id] && !['assist','counter'].includes(event.kind) && (matchBindings[event.player]!=='bot'||performance.now()>signaturePriorityUntil)){
      const f=match.fighters[event.player],c=characterById[f.id],flash=$("#signature-flash");
      clearTimeout(signatureTimer);signaturePriorityUntil=performance.now()+1100;flash.hidden=false;flash.querySelector('img').src='assets/'+f.id+'.webp';
      flash.querySelector('strong').textContent=c.specialName;flash.querySelector('span').textContent=c.name+' / '+SIGNATURES[f.id].passive;
      signatureTimer=setTimeout(()=>flash.hidden=true,1000);
    }
    if(event.type==='hit' && event.power>600){
      if(!record.reduced)slowMoment=0.22;
      if(match.tick-lastCommentTick>260){director.trigger('heavy');lastCommentTick=match.tick;}
    }
    if(event.type==='ringout' && !record.reduced)slowMoment=0.3;
    if(event.type==='item'&&event.player===0)director.trigger('item');
    if (event.type === "finish") finishRound();
  }
}

function finishRound() {
  if (resultShown) return;
  resultShown = true;
  input.setActive(false);
  input.clear();
  record.rounds++;
  const oldRank=record.lessons.filter(l=>l?.passed).length;
  if(mode==="academy"){
    assessment=assess(match,lessonIndex);
    if(assessment.passed){
      const previous=record.lessons[lessonIndex];
      if(!previous?.passed || ['B','A','A+'].indexOf(assessment.grade)>['B','A','A+'].indexOf(previous.grade)) record.lessons[lessonIndex]={passed:true,grade:assessment.grade};
    }
  }
  if(mode==="academy"&&assessment)assessment.rank=RANKS[record.lessons.filter(l=>l?.passed).length];
  if(mode==='daily'){
    assessment=assessDailyDrill(match,dailyDrill);
    dailyResult={seconds:match.tick/60,grade:assessment.grade,passed:assessment.passed};
    dailyResult.saved=saveDailyResult(dailyDrill,dailyResult);
  }
  if(mode==='volume')assessment={passed:(match.training.steadyBest||0)>=volumeDrill.goal,grade:(match.training.steadyBest||0)>=volumeDrill.goal?'A':'RETAKE'};
  saveRecord();
  if (mode === "gauntlet") {
    gauntlet.won = match.winner === 0;
    if (gauntlet.won && gauntlet.round === 5) {
      gauntlet.complete = true;
      record.gauntlets++;
      saveRecord();
    }
  }
  $("#countdown").textContent = "RECOVERED!";
  sound.stopVoice();
  if(['quick','daily','volume'].includes(mode)){
    finishTimer=setTimeout(()=>{showResult();director.trigger((mode==='daily'||mode==='volume'?assessment?.passed:match.winner===0)?'win':'loss');},650);
    return;
  }
  finishTimer = setTimeout(async()=>{
    await fleet.show({lesson:mode==="academy"?COURSE[lessonIndex]:COURSE[Math.max(0,ARENAS.findIndex(a=>a.id===match.arena))],after:true});
    showResult();
    if(mode==="academy"&&assessment?.passed)sound.fanfare();
    director.trigger(mode==='academy'&&!assessment?.passed?'retake':mode==='academy'&&lessonIndex===6?'graduate':record.lessons.filter(l=>l?.passed).length>oldRank?'rank':match.winner===0?'win':'loss');
  },950);
}

function medalName() {
  if(mode==="victory")return "THE GOLDEN ORDER OF OPTIONAL ENTHUSIASM";
  if(mode==="academy")return COURSE[lessonIndex].medal;
  if(mode==='daily')return 'DAILY DRILL / '+dailyDrill.label;
  if(mode==='volume')return volumeDrill.title.toUpperCase();
  if (mode === "gauntlet" && gauntlet.complete)
    return "THE SIXFOLD ORDER OF REMARKABLY VERTICAL CONDUCT";
  const names = [
    "THE ORDER OF INTENTIONAL DESCENT",
    "THE MEDAL FOR OUTSTANDING HORIZONTAL PROGRESS",
    "THE GRAND CROSS OF EVENTUAL LANDING",
    "THE DISTINGUISHED SERVICE TO THE OUTSIDE",
    "THE ORDER OF EXCESSIVE PERSONAL MOMENTUM",
  ];
  return names[(record.rounds - 1) % names.length];
}

function showResult() {
  if (!playing || !match) return;
  $('#result-voice').textContent='';
  $("#countdown").textContent = "";
  const winner = match.fighters[match.winner];
  $("#result-eyebrow").textContent =
    mode === "gauntlet"
      ? gauntlet.complete
        ? "SIX FIGHTS. ONE EXTREMELY HEAVY HONOUR."
        : `BEAM’S GAUNTLET / FIGHT ${gauntlet.round + 1} OF 6`
      : "AN ENTIRELY PLANNED OUTCOME";
  $("#result-title").replaceChildren(
    document.createTextNode(
      `${characterById[winner.id].name.toUpperCase()} TAKES`,
    ),
    document.createElement("br"),
  );
  const emphasis = document.createElement("em");
  emphasis.textContent = "THE GLORY.";
  $("#result-title").append(emphasis);
  $("#medal-name").textContent = medalName();
  const scores = $("#scoreboard");
  scores.replaceChildren();
  const header = document.createElement("div");
  header.className = "score-row header";
  header.innerHTML =
    match.rule === "timed"
      ? "<span></span><span>CREW</span><span>NET SCORE</span><span>RECOVERIES</span>"
      : "<span></span><span>CREW</span><span>RING-OUTS</span><span>REMAINING</span>";
  scores.append(header);
  match.rankings.forEach((index, rank) => {
    const f = match.fighters[index],
      row = document.createElement("div");
    row.className = "score-row" + (rank === 0 ? " winner" : "");
    for (const value of [
      String(rank + 1),
      `${characterById[f.id].name}${matchBindings[index] === "bot" ? " · CPU" : ""}`,
      String(match.rule === "timed" ? f.score - f.stats.recoveries : f.score),
      String(match.rule === "timed" ? f.stats.recoveries : f.stocks),
    ]) {
      const span = document.createElement("span");
      span.textContent = value;
      row.append(span);
    }
    scores.append(row);
  });
  let note = `${match.stats.hits} training hits. ${match.stats.ringouts} recoveries. Everyone accounted for.`;

  if (mode === "gauntlet")
    note += gauntlet.complete
      ? " Six fights complete. Beam has authorised an unreasonable medal."
      : gauntlet.won
        ? " Next training ground cleared for entry."
        : "The fleet requests one more attempt at this fight.";
  $("#result-note").textContent = note;
  $("#rematch").replaceChildren(
    document.createTextNode(
      mode === "gauntlet"
        ? gauntlet.complete
          ? "Run the gauntlet again"
          : gauntlet.won
            ? "Next fight"
            : "Retry this fight"
        : "Immediate rematch",
    ),
  );
  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  $("#rematch").append(arrow);
  $("#export-status").textContent =
    "© Tim Mecklenburg · Saved on this device.";
  $("#academy-assessment").hidden=mode!=="academy";
  $("#save-result").textContent=mode==="academy"?"Save cadet certificate PNG ↓":"Save result PNG ↓";
  if(mode==="academy" && assessment){
    $("#result-eyebrow").textContent='FLEET HANDBOOK / LESSON '+(lessonIndex+1)+' OF 7';
    $("#result-title").innerHTML=COURSE[lessonIndex].title.toUpperCase()+'<br><em>'+(assessment.passed?'PASSED.':'RETAKE.')+'</em>';
    $("#academy-assessment").innerHTML='<strong>'+assessment.grade+'</strong><b>'+assessment.rank+'</b><p>'+assessment.comment+'</p><p>'+assessment.checks.map((ok,i)=>(ok?'✓':'○')+' '+CHECK_LABELS[lessonIndex][i]).join(' &nbsp; ')+'</p>';
    $("#result-note").textContent=progressText(match)+(assessment.passed&&lessonIndex===2?' / PIP RECRUITED':assessment.passed&&lessonIndex===6?' / VICTORY LAP UNLOCKED':'');
    $("#rematch").textContent=assessment.passed?(lessonIndex===6?'Begin a new course ↗':'Next lesson ↗'):'Retry this lesson ↗';
  }
  if(mode==='quick'){
    $('#result-eyebrow').textContent='QUICK FIGHT / '+characterById[match.fighters[0].id].name.toUpperCase();
    $('#result-note').textContent=note+' Ready for your next posting? The cadet course starts with the controls.';
    $('#rematch').textContent='Fight again ↗';
    $('#back-lobby').textContent='Explore the cadet course';
  }else $('#back-lobby').textContent='Change crew';
  if(mode==='daily'){
    $('#result-eyebrow').textContent='DAILY DRILL / '+dailyDrill.label+' / EUROPE · BERLIN';
    $('#result-title').innerHTML='TODAY’S DRILL.<br><em>'+(assessment.passed?Math.ceil(dailyResult.seconds)+' SECONDS.':'RETAKE.')+'</em>';
    $('#academy-assessment').hidden=false;
    $('#academy-assessment').textContent='RANK '+assessment.grade+' / '+COURSE[dailyDrill.lessonIndex].title;
    $('#result-note').textContent=(dailyResult.saved.improved?'PERSONAL BEST / ':assessment.passed?'DRILL COMPLETE / ':'TRY AGAIN / ')+dailyProgressText(match,dailyDrill);
    $('#result-voice').textContent='Same crew. Same arena. Same sequence. A new drill at midnight in Berlin.';
    $('#save-result').textContent='Save daily card PNG ↓';$('#rematch').textContent='Retry today’s drill ↗';
  }
  if(mode==='volume'){
    $('#result-eyebrow').textContent='VOLUME '+volumeDrill.volume+' / FIELD DRILL';
    $('#result-title').textContent=volumeDrill.title.toUpperCase()+'. '+(assessment.passed?'PASSED.':'RETAKE.');
    $('#result-note').textContent=volumeDrill.rule;$('#rematch').textContent='Repeat the drill ↗';
  }
  $("#result").showModal();
  viewport.showHomeTip();
  const voice = RELEASE.voices.find((voice) => voice.id === "finish");
  if (voice&&!['daily','volume','quick'].includes(mode)) {
    $("#result-voice").textContent = `“${voice.text}” — BEAM / ${voice.source}`;
    // The unchanged recording already played in the post-fight broadcast.
  }
  prepareShareImage();
}

function nextRound() {
  startMatch({ rematch: true, advance: true });
}

async function resultImage() {
  const {resultPNG}=await import('./export.js');
  return mode==='daily'?dailyPNG(dailyDrill,dailyResult):mode==='academy'?(await import('./certificate.js')).certificatePNG(match,{lesson:COURSE[lessonIndex],assessment,service:record.service,index:lessonIndex,lessons:record.lessons,assist:record.assist}):resultPNG(match,{medal:medalName(),mode,assist:record.assist,gauntlet:gauntlet.complete});
}

async function prepareShareImage(){
  const generation=++shareGeneration;
  $('#share-result').disabled=true;$('#post-on-x').hidden=true;
  try{
    const blob=await resultImage();if(generation!==shareGeneration)return;
    const text=mode==='daily'?dailyShareText(dailyDrill,dailyResult):mode==='academy'?'MARS cadet course · '+COURSE[lessonIndex].title+' · '+assessment.grade+' · '+assessment.rank+' · '+PLAY_URL:(mode==='quick'?'MARS Quick Fight':'MARS Out of Orbit')+' · '+characterById[match.fighters[0].id].name+' · '+(match.winner===0?'victory':'everyone recovered')+' · '+PLAY_URL;
    preparedShare={blob,text,filename:mode==='daily'?'MARS-daily-'+dailyDrill.dateKey+'.png':mode==='academy'?'MARS-cadet-certificate-'+(lessonIndex+1)+'.png':'MARS-out-of-orbit-result.png',title:'MARS · Out of Orbit'};
    $('#share-result').disabled=false;
  }catch{$('#export-status').textContent='Image preparation failed. Try Save PNG again.';}
}

async function saveResult() {
  if (!match) return;
  const button = $("#save-result");
  button.disabled = true;
  $("#export-status").textContent = "Preparing your local result image…";
  try {
    const blob=preparedShare?.blob||await resultImage();
    const url = URL.createObjectURL(blob),
      anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = preparedShare?.filename||(mode==="academy"?"MARS-cadet-certificate-"+(lessonIndex+1)+".png":"MARS-out-of-orbit-result.png");
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    $("#export-status").textContent = "PNG saved. © Tim Mecklenburg.";
  } catch {
    $("#export-status").textContent =
      "The image could not be saved. Try the PNG button again.";
  } finally {
    button.disabled = false;
  }
}

function setSound(enabled) {
  record.sound = enabled;
  saveRecord();
  sound.set(enabled);
  $("#sound-lobby").textContent = enabled ? "Sound on" : "Sound off";
  $("#sound-lobby").setAttribute("aria-pressed", String(enabled));
  $("#sound-game").setAttribute("aria-pressed", String(enabled));
  $("#sound-game").textContent = enabled ? "♪" : "♩";
  $("#sound-game").setAttribute(
    "aria-label",
    enabled ? "Mute game sound" : "Enable game sound",
  );
}

function setReduced(enabled) {
  record.reduced = enabled;
  renderer.reduced = enabled||powerSaving;
  previewRenderer.reduced = enabled||powerSaving;
  $('#effects-setting').checked=enabled;
  $("#reduced-motion").checked = enabled;
  saveRecord();
}

function bindTouch() {
  const stick = $("#stick"),
    knob = $("#stick-knob");
  let pointer = null;
  const resets = [];
  function update(event) {
    const box = stick.getBoundingClientRect();
    const radius = box.width * 0.32;
    const dx = (event.clientX - box.left - box.width / 2) / radius,
      dy = (event.clientY - box.top - box.height / 2) / radius;
    const length = Math.max(1, Math.hypot(dx, dy));
    knob.style.transform = `translate(${(dx / length) * radius * 0.66}px,${(dy / length) * radius * 0.66}px)`;
    input.setTouch(
      "move",
      Math.abs(dx) < 0.15 ? 0 : Math.max(-1, Math.min(1, dx)),
    );
  }
  function release() {
    pointer = null;
    knob.style.transform = "";
    input.setTouch("move", 0);
  }
  resets.push(release);
  stick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (pointer !== null) return;
    pointer = event.pointerId;
    stick.setPointerCapture(pointer);
    viewport.pulse(8);
    update(event);
  });
  stick.addEventListener("pointermove", (event) => {
    if (event.pointerId === pointer) update(event);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    stick.addEventListener(name, (event) => {
      if (event.pointerId === pointer) release();
    });
  const fire = $('#touch-shoot'), fireKnob = $('#aim-knob');
  let firePointer = null, origin = null;
  function aim(event) {
    const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
    const length = Math.hypot(dx, dy), radius = fire.clientWidth * 0.34;
    const reach = Math.min(length, radius);
    fireKnob.style.transform = length > 0 ? `translate(${dx / length * reach}px,${dy / length * reach}px)` : '';
    fire.classList.toggle('aiming', length >= 7);
    input.setTouchAim(length >= 7 ? dx / length : 0, length >= 7 ? dy / length : 0);
  }
  function releaseFire(cancelled = false) {
    firePointer = null;
    origin = null;
    fire.classList.remove('active', 'aiming');
    fireKnob.style.transform = '';
    input.setTouch('shoot', false);
    input.setTouchAim(0, 0);
    if (cancelled) {
      input.cancelTouchShot();
    }
  }
  resets.push(() => releaseFire(true));
  fire.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (firePointer !== null) return;
    firePointer = event.pointerId;
    origin = { x: event.clientX, y: event.clientY };
    fire.setPointerCapture(firePointer);
    fire.classList.add('active');
    input.setTouchAim(0, 0);
    input.setTouch('shoot', true);
    viewport.pulse();
  });
  fire.addEventListener('pointermove', event => {
    if (event.pointerId === firePointer) aim(event);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
    fire.addEventListener(name, event => {
      if (event.pointerId === firePointer) releaseFire(name !== 'pointerup');
    });
  for (const action of ["jump", "special"]) {
    const button = $(`#touch-${action}`);
    const pointers = new Set();
    resets.push(() => {
      pointers.clear();
      button.classList.remove("active");
      input.setTouch(action, false);
    });
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      pointers.add(event.pointerId);
      button.setPointerCapture(event.pointerId);
      button.classList.add("active");
      input.setTouch(action, true);
      viewport.pulse();
    });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
      button.addEventListener(name, (event) => {
        pointers.delete(event.pointerId);
        if (!pointers.size) {
          button.classList.remove("active");
          input.setTouch(action, false);
        }
      });
  }
  resetTouchControls = () => {
    for (const reset of resets) reset();
  };
  addEventListener("blur", resetTouchControls);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetTouchControls();
  });
}

function frame(now) {
  const rawDelta = (now - lastFrame) / 1000,
    dt = Math.min(rawDelta, 0.08);
  lastFrame = now;
  if(playing&&!paused&&!document.hidden&&rawDelta>.025&&rawDelta<.15){renderer.slowFrames=(renderer.slowFrames||0)+1;}
  else renderer.slowFrames=Math.max(0,(renderer.slowFrames||0)-.5);
  if(renderer.slowFrames>90&&renderer.ratio>1){renderer.ratioCap=1;renderer.reduced=true;renderer.resize();}
  input.pollGamepads();
  if (!document.hidden) {
    if (playing) {
      if (!paused && !resultShown && !fleet.open) {
        if (qaEnabled) {
          performanceSamples.push(rawDelta * 1000);
          if (performanceSamples.length > 3600) performanceSamples.shift();
        }
        if (countdown > 0) {
          countdown = Math.max(0, countdown - dt);
          const word =
            countdown > 1.1
              ? "READY?"
              : countdown > 0.3
                ? "STAY BRIGHT."
                : "GO!";
          if (word !== countdownWord) {
            countdownWord = word;
            $("#countdown").textContent = word;
          }
          if (countdown === 0) {
            $("#countdown").textContent = "";

          }
        } else {
          accumulator += dt*(slowMoment>0?0.36:1);
          slowMoment=Math.max(0,slowMoment-dt);
          while (accumulator >= 1 / 60 && !resultShown) {
            const inputs = match.fighters.map((fighter, index) =>
              matchBindings[index] === "bot"
                ? botInput(match, index)
                : input.read(matchBindings[index], index === 0),
            );
            stepMatch(match, inputs);
            completeDrill();
            processEvents(match.events);
            accumulator -= 1 / 60;
            if (qaEnabled && runLog.length < 12000)
              runLog.push(inputs.map((value) => ({ ...value })));
          }
        }
      }
      renderer.draw(match, paused ? 0 : dt);
      if (match.tick !== hudTick && (match.tick % 5 === 0 || resultShown)) {
        renderHud();
        hudTick = match.tick;
      }
    } else if (previewVisible && !$("#guide").open && !$("#credits").open) {
      previewAccumulator += dt;
      while (previewAccumulator >= 1 / 60) {
        stepMatch(
          previewMatch,
          previewMatch.fighters.map((fighter, index) =>
            botInput(previewMatch, index),
          ),
        );
        previewRenderer.events(previewMatch.events);
        previewAccumulator -= 1 / 60;
        if (previewMatch.phase === "finished")
          previewMatch = createMatch({
            characters: ["iona", "rook", "sera", "beam"],
            controllers: ["bot", "bot", "bot", "bot"],
            difficulty: 1,
            arena: arenaId,
            seed: 1411,
          });
      }
      previewRenderer.draw(previewMatch, dt);
    }
  }
  requestAnimationFrame(frame);
}

function completeDrill(){
  if(match.phase!=='playing')return;
  if(mode==='daily'&&assessDailyDrill(match,dailyDrill).passed)finishMatch(match);
  if(mode==='volume'&&(match.training.steadyBest||0)>=volumeDrill.goal)finishMatch(match);
}

function refreshDaily(){
  const today=getDailyDrill(),best=readDailyBest(today);
  $('#daily-date').textContent=today.label;
  $('#daily-description').textContent=COURSE[today.lessonIndex].title+' / '+characterById[today.character].name+' / '+today.target;
  $('#daily-best').textContent=best?'YOUR BEST / '+best.seconds.toFixed(2)+' s · Rank '+best.grade:'YOUR BEST / Your first flight is still ahead.';
}

function startQuickFight(){
  if(playing||launchPending||fleet.open)return;
  chooseMode('solo');mode='quick';roundRule='timed';
  const cast=CHARACTERS.filter(c=>c.id!=='pip'||isPipUnlocked()),pick=values=>values[Math.floor(Math.random()*values.length)];
  seats[0]={character:pick(cast).id,binding:'keyboard1'};
  const opponents=cast.filter(c=>c.id!==seats[0].character).sort(()=>Math.random()-.5);
  seats[1]={character:opponents[0].id,binding:'bot'};seats[2]={character:opponents[1].id,binding:'bot'};seats[3].binding='empty';
  arenaId=pick(ARENAS).id;$('#difficulty').value='1';
  startMatch();
}

function startDaily(){
  if(playing||launchPending||fleet.open)return;
  dailyDrill=getDailyDrill();mode='daily';startMatch();
}

function refreshCourse(){
  let bonus=$("#mode-victory");
  if(!bonus){
    bonus=document.createElement('button');bonus.id='mode-victory';bonus.dataset.mode='victory';bonus.textContent='Victory Lap';bonus.type='button';
    bonus.setAttribute('aria-pressed','false');bonus.addEventListener('click',()=>chooseMode('victory'));$("#modes").append(bonus);
  }
  bonus.hidden=record.lessons.filter(l=>l?.passed).length!==7;
  renderCourse(record,lessonIndex,index=>{
    lessonIndex=index;chooseMode('academy');refreshCourse();
    showLobbyPanel('setup');$('#start').focus({preventScroll:true});
  });
}
$('#quick-start').addEventListener('click',()=>{
  chooseMode('academy');startMatch();
});
$('#quick-fight').addEventListener('click',startQuickFight);
$('#daily-start').addEventListener('click',startDaily);
for(const drill of RELEASE.volumeDrills||[]){
  const b=document.createElement('button');b.type='button';b.className='volume-drill';b.textContent='VOL. '+drill.volume+' / '+drill.title+' ↗';
  b.addEventListener('click',()=>{if(playing||fleet.open||launchPending)return;volumeDrill=drill;mode='volume';startMatch();});$('#volume-drills').append(b);
}
$('#watch-feed').addEventListener('click',async()=>{
  await sound.unlock();sound.resume();await fleet.show({lesson:COURSE[lessonIndex]});sound.pause();
});

for (const arena of ARENAS) {
  const option = document.createElement("option");
  option.value = arena.id;
  option.textContent = arena.name;
  $("#arena-select").append(option);
}
$("#arena-description").textContent = ARENAS[0].description;
$("#arena-select").addEventListener("change", () => {
  arenaId = $("#arena-select").value;
  const arena = ARENAS.find((arena) => arena.id === arenaId);
  $("#arena-description").textContent = arena.description;
  $("#preview-arena").textContent = arena.name.toUpperCase();
  previewMatch = createMatch({
    characters: ["iona", "rook", "sera", "beam"],
    controllers: ["bot", "bot", "bot", "bot"],
    difficulty: 1,
    arena: arenaId,
    seed: 1411,
  });
  previewRenderer.reset();
});
for (const button of all("[data-mode]"))
  button.addEventListener("click", () => chooseMode(button.dataset.mode));
for (const button of all("[data-rule]"))
  button.addEventListener("click", () => {
    roundRule = button.dataset.rule;
    for (const choice of all("[data-rule]"))
      choice.setAttribute(
        "aria-pressed",
        String(choice.dataset.rule === roundRule),
      );
  });
$("#start").addEventListener("click", () => startMatch());
$("#pause").addEventListener("click", () => pauseMatch());
$("#resume").addEventListener("click", resumeMatch);
for (const eventName of ["keydown", "keyup"]) {
  $("#pause-overlay").addEventListener(eventName, (event) => {
    if (event.code === "Space") event.stopPropagation();
  });
}
$("#restart").addEventListener("click", () => startMatch({ rematch: true }));
$("#leave").addEventListener("click", returnToLobby);
$("#game-menu").addEventListener("click", (event) => {
  event.preventDefault();
  pauseMatch();
});
$("#rematch").addEventListener("click", nextRound);
$("#back-lobby").addEventListener("click", returnToLobby);
$("#save-result").addEventListener("click", saveResult);
$('#share-result').addEventListener('click',()=>{
  if(!preparedShare)return;
  sharePrepared(preparedShare,{onFallback:result=>{
    $('#post-on-x').href=result.intent;$('#post-on-x').hidden=false;
    $('#export-status').textContent='PNG downloaded. Add it to your post with the prepared text.';
  }}).then(result=>{if(result.method==='native'&&!result.cancelled)$('#export-status').textContent='Shared. Everyone accounted for.';});
});
$("#result").addEventListener("cancel", (event) => {
  event.preventDefault();
  returnToLobby();
});
$("#sound-lobby").addEventListener("click", () => {
  setSound(!record.sound);
  sound.unlock();
});
$("#sound-game").addEventListener("click", () => {
  setSound(!record.sound);
  sound.unlock();
});
$("#assist").checked = record.assist;
$("#assist").addEventListener("change", () => {
  record.assist = $("#assist").checked;
  saveRecord();
});
$("#reduced-motion").checked = record.reduced;
$("#reduced-motion").addEventListener("change", () =>
  setReduced($("#reduced-motion").checked),
);
$("#guide-open").addEventListener("click", () => $("#guide").showModal());
$("#credits-open").addEventListener("click", () => $("#credits").showModal());
for (const button of all("[data-close]"))
  button.addEventListener("click", () =>
    document.getElementById(button.dataset.close).close(),
  );
$("#fullscreen").addEventListener("click", async () => {
  try {
    await viewport.fullscreen();
  } catch {
    notify("Fullscreen is unavailable in this browser.");
  }
});
$("#erase-record").addEventListener("click", () => {
  record = { ...defaults,lessons:[],seen:[] };lessonIndex=0;refreshCourse();
  saveRecord();
  setSound(record.sound);
  setReduced(record.reduced);
  $("#assist").checked = record.assist;
  seats.forEach((seat) => {
    if (seat.character === "pip") seat.character = "iona";
  });
  renderCrew();
  renderSlots();
  renderCharacter();
  $("#erase-feedback").textContent =
    "Local course record reset. Pip joins after lesson 3.";
});
addEventListener("blur", () =>
  pauseMatch("The window lost focus. Resume when the crew is ready."),
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseMatch("The broadcast paused while you were away.");
  lastFrame = performance.now();
});
$('#pause-overlay').addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const buttons=all('#pause-overlay button'),first=buttons[0],last=buttons.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
new IntersectionObserver(
  (entries) => {
    previewVisible = entries[0].isIntersecting;
    previewAccumulator = 0;
  },
  { threshold: 0 },
).observe($("#preview"));
bindTouch();
chooseMode("academy");
refreshCourse();
refreshDaily();setInterval(()=>{if(!playing)refreshDaily();},60000);
renderCrew();
renderSlots();
renderCharacter();
setSound(record.sound);
performance.mark("arena-ready");
requestAnimationFrame(frame);
if ("requestIdleCallback" in window)
  requestIdleCallback(preloadArt, { timeout: 1000 });
else setTimeout(preloadArt, 100);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js", { scope: "./" })
    .then(async (registration) => {
      await navigator.serviceWorker.ready;
      const worker =
        registration.active || registration.waiting || registration.installing;
      if (worker?.state === "activated")
        $("#offline-status").textContent = "READY OFFLINE";
      else
        worker?.addEventListener("statechange", () => {
          if (worker.state === "activated")
            $("#offline-status").textContent = "READY OFFLINE";
        });
    })
    .catch(() => {
      $("#offline-status").textContent = "Offline copy unavailable";
    });
} else $("#offline-status").textContent = "Local browser play";

// Local-only instrumentation for reproducible browser QA and input recordings.
if (qaEnabled) {
  window.MARS_ARENA = {
    get viewport(){return {method:viewport.method,preferences:{...viewport.preferences},ratio:renderer.ratio,powerSaving,input:{active:input.active,suspended:input.suspended}};},
    botExhibition(){if(!match)return;matchBindings=match.fighters.map(()=>"bot");match.fighters.forEach(f=>f.controller="bot");renderHud(true);},
    get academy(){return {lessonIndex,assessment,record:JSON.parse(JSON.stringify(record)),mode,feedOpen:fleet.open,camera:{...renderer.camera},canvas:{width:renderer.width,height:renderer.height},spriteHeight:98*renderer.camera.scale};},
    get audio(){return {initialized:Boolean(sound.context),state:sound.context?.state,voice:Boolean(sound.voice),enabled:sound.enabled};},
    voiceTest(trigger){return director.trigger(trigger);},
    get daily(){return {drill:dailyDrill,result:dailyResult};},
    get visibility(){
      const canvas=$('#arena-canvas').getBoundingClientRect();
      return {camera:{...renderer.camera},viewport:{width:innerWidth,height:innerHeight},signature:$('#signature-flash').getBoundingClientRect().toJSON(),canvas:canvas.toJSON(),fighters:match?.fighters.map(f=>({index:f.index,id:f.id,controller:f.controller,alive:f.alive,respawn:f.respawn,x:canvas.left+renderer.width/2+(f.x-renderer.camera.x)*renderer.camera.scale,y:canvas.top+renderer.height/2+(f.y-renderer.camera.y)*renderer.camera.scale,height:86*renderer.camera.scale,width:65*renderer.camera.scale})),effects:renderer.effects.map(e=>({type:e.type,life:e.life}))};
    },
    visibilityFixture(kind){
      if(!match)return;
      match=createMatch({characters:['iona','rook','beam'],controllers:['human','bot','bot'],arena:'deck',seed:333,compact:match.compact,lesson:'lowg'});
      matchBindings=['keyboard1','bot','bot'];renderHud(true);
      countdown=0;$('#countdown').textContent='';slowMoment=0;
      match.fighters.forEach((f,i)=>{f.x=(i-1)*130;f.y=match.platforms[0].y;f.vx=0;f.vy=0;f.grounded=true;f.respawn=0;f.invulnerable=2;f.alive=true;});
      const f=match.fighters[0];f.x=0;renderer.reset();renderer.updateCamera(match,1);
      if(kind==='impact'){
        renderer.events([{type:'hit',x:0,y:f.y-50,power:840,target:0,tick:match.tick},{type:'special',player:0,kind:f.id,x:0,y:f.y},{type:'special',player:1,kind:match.fighters[1].id,x:130,y:f.y}]);
        f.action='hit';f.actionTime=.4;f.damage=150;
      }
      if(kind==='threat'){
        match.fighters[1].x=360;match.fighters[1].charge=.5;
        match.projectiles.push({owner:1,x:430,y:f.y-50,vx:-400,vy:0,gravity:0,radius:10,life:2,kind:'foam',damage:10,power:200});
      }
      if(kind==='items'){
        f.itemEffects=[{kind:'medal',duration:3,remaining:2.5},{kind:'gravity',duration:5,remaining:4}];match.gravityBoost=4;f.invulnerable=2.5;
        renderer.events([{type:'item',player:0,kind:'medal',x:f.x,y:f.y}]);
      }
    },
    get state() {
      return match ? snapshot(match) : null;
    },
    get performance() {
      const samples = performanceSamples.slice().sort((a, b) => a - b);
      return {
        frames: samples.length,
        meanMs:
          samples.reduce((sum, value) => sum + value, 0) /
          (samples.length || 1),
        p95Ms: samples[Math.floor(samples.length * 0.95)] || 0,
      };
    },
    get inputs() {
      return runLog;
    },
    get paused() {
      return paused;
    },
    finishFixture(winner = 0) {
      if (!match || match.phase !== "playing") return;
      match.fighters[winner].score += 50;
      match.fighters[winner].stocks = 9;
      match.tick = Math.round(match.duration * 60) - 1;
      stepMatch(match, []);
      processEvents(match.events);
      renderHud();
    },
    simulate(ticks = 1, inputs = null) {
      if (!match || match.phase !== "playing") return;
      countdown = 0;
      $("#countdown").textContent = "";
      for (
        let i = 0;
        i < Math.min(36000, ticks) && match.phase === "playing";
        i++
      ) {
        stepMatch(
          match,
          typeof inputs==="function"?inputs(match):inputs || match.fighters.map((f, index) => botInput(match, index)),
        );
        completeDrill();
        processEvents(match.events);
      }
      renderHud();
    },
  };
}
