import {
  CHARACTERS,
  ARENAS,
  createMatch,
  stepMatch,
  botInput,
  snapshot,
} from "./engine.js";
import { Renderer, PLAYER_COLORS, preloadArt } from "./renderer.js";
import { InputManager } from "./input.js";
import { Sound } from "./audio.js";
import RELEASE from "./release.js";
import {COURSE,RANKS,SIGNATURES,COMMS,CHECK_LABELS,assess,progressText} from './academy.js';
import {FleetScreen,renderCourse} from './fleet.js';

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
let resetTouchControls = () => {};
const sound = new Sound();
sound.set(record.sound);
const fleet=new FleetScreen(sound,RELEASE.voices);
const input = new InputManager({
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
  clearTimeout(finishTimer);
  clearTimeout(broadcastTimer);
  $("#result").close();
  $("#broadcast").classList.remove("visible");
  match = createMatch({
    ...options,
    rule: mode==="academy"?"timed":roundRule,
    duration: mode==="academy"?COURSE[lessonIndex].duration:150,
    compact: matchMedia("(max-width:600px) and (orientation:portrait)").matches,
    victoryLap:mode==="victory"&&record.lessons.filter(l=>l?.passed).length===7,
    stocks: 3,
    seed: ++seedCounter,
    assist: record.assist,
  });
  matchBindings = options.bindings;
  playing = true;
  paused = false;
  resultShown = false;
  countdown = rematch ? 1.1 : 2.1;
  countdownWord = "";
  accumulator = 0;
  hudTick = -1;
  lastCommentTick = 0;
  performanceSamples.length = 0;
  runLog.length = 0;
  $("#lobby").hidden = true;
  $("#game").hidden = false;
  $("#pause-overlay").hidden = true;
  document.body.style.overflow = "hidden";
  $("#match-label").textContent = ARENAS.find(
    (arena) => arena.id === match.arena,
  ).name.toUpperCase();
  $("#round-label").textContent =
    (mode === "academy" ? 'CADET '+(lessonIndex+1)+' / 7' : mode === "gauntlet"
      ? `GAUNTLET ${gauntlet.round + 1} / 6`
      : match.rule === "timed"
        ? "TIMED TRAINING"
        : "THREE RECOVERIES") + (record.assist ? " / ASSIST" : "");
  $("#keyboard-hint").textContent =
    mode === "local"
      ? "P1 A D / W / F G   ·   P2 ← → / ↑ / K L   ·   P3 N M / H / Y-Z U   ·   P4 NUMPAD   ·   ESC PAUSE"
      : "A D MOVE   ·   W / SPACE JUMP   ·   F FIRE   ·   G SPECIAL   ·   ESC PAUSE";
  input.clear();
  $("#signature-flash").hidden=true;signaturePriorityUntil=0;slowMoment=0;
  resetTouchControls();
  input.setActive(true);
  renderer.resize();
  renderer.reset();
  renderHud(true);
  $("#arena-canvas").focus({ preventScroll: true });
  await sound.unlock();
  sound.resume();
  launchPending=true;
  input.setActive(false);
  await fleet.show({lesson:mode==="academy"?COURSE[lessonIndex]:COURSE[mode==="gauntlet"?gauntlet.round:Math.max(0,ARENAS.findIndex(a=>a.id===match.arena))]});
  launchPending=false;
  if(!playing)return;
  sound.music(match.arena);
  input.clear();input.setActive(true);lastFrame=performance.now();
  $("#arena-canvas").focus({preventScroll:true});
}

function pauseMatch(
  reason = "Training paused. Everybody stays exactly where they are.",
) {
  if (!playing || paused || resultShown) return;
  paused = true;
  accumulator = 0;
  input.clear();
  resetTouchControls();
  sound.pause();
  $("#pause-reason").textContent = reason;
  $("#pause-overlay").hidden = false;
  $("#resume").focus({ preventScroll: true });
}

function resumeMatch() {
  if (!playing || !paused) return;
  paused = false;
  accumulator = 0;
  lastFrame = performance.now();
  $("#pause-overlay").hidden = true;
  input.clear();
  input.setActive(true);
  sound.resume();
  $("#arena-canvas").focus({ preventScroll: true });
}

function returnToLobby() {
  clearTimeout(finishTimer);
  clearTimeout(broadcastTimer);
  playing = false;
  paused = false;
  resultShown = false;
  $("#result").close();
  $("#game").hidden = true;
  $("#lobby").hidden = false;
  $("#pause-overlay").hidden = true;
  $("#broadcast").classList.remove("visible");
  input.clear();
  resetTouchControls();
  input.setActive(false);
  sound.pause();
  document.body.style.overflow = "";
  renderCrew();
  renderSlots();
  renderCharacter();
  refreshCourse();
  previewRenderer.resize();
  $("#start").focus({ preventScroll: true });
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
  $("#lesson-objective").hidden=mode!=="academy";
  if(mode==="academy")$("#lesson-objective").innerHTML="<b>"+COURSE[lessonIndex].title.toUpperCase()+"</b>"+progressText(match);
  $("#lesson-coach").hidden=mode!=="academy"||match.tick>1200;
  if(mode==="academy"&&match.tick<=1200){
    const t=match.training;
    $("#lesson-coach").textContent=lessonIndex===0? t.travel<110?"MOVE / A D · left stick":t.jumps<2?"JUMP / W or SPACE · A on controller · UP touch":match.fighters[0].stats.hits<3?"FIRE / F · X on controller · FIRE touch":t.specials<1?"SPECIAL / G · B on controller · SPECIAL touch":"OBJECTIVES MET / Practise until the bell.":COURSE[lessonIndex].order;
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
  container.querySelector("span").textContent = `BEAM / ${source}`;
  container.querySelector("p").textContent = text;
  container.classList.add("visible");
  if (audio) sound.say({ text, audio, source });
  broadcastTimer = setTimeout(
    () => container.classList.remove("visible"),
    duration,
  );
}

function processEvents(events) {
  renderer.events(events);
  for (const event of events) {
    sound.event(event);
    if (event.type === "ringout" && match.tick - lastCommentTick > 160) {
      const comments = event.target<0?COMMS.own:COMMS.ringout;
      const quote = RELEASE.voices.find((voice) => voice.id === "recovery");
      if (match.stats.ringouts % 3 === 0 && quote)
        broadcast(quote.text, { ...quote, duration: 6000 });
      else broadcast(comments[(match.stats.ringouts - 1) % comments.length]);
      lastCommentTick = match.tick;
    }
    if(event.type==='special' && characterById[match.fighters[event.player]?.id] && !['assist','counter'].includes(event.kind) && (matchBindings[event.player]!=='bot'||performance.now()>signaturePriorityUntil)){
      const f=match.fighters[event.player],c=characterById[f.id],flash=$("#signature-flash");
      clearTimeout(signatureTimer);signaturePriorityUntil=performance.now()+1100;flash.hidden=false;flash.querySelector('img').src='assets/'+f.id+'.webp';
      flash.querySelector('strong').textContent=c.specialName;flash.querySelector('span').textContent=c.name+' / '+SIGNATURES[f.id].passive;
      signatureTimer=setTimeout(()=>flash.hidden=true,1100);
    }
    if(event.type==='hit' && event.power>600){
      if(!record.reduced)slowMoment=0.22;
      if(match.tick-lastCommentTick>260){broadcast(COMMS.heavy[event.tick%2],{source:'DECK INSTRUCTOR'});lastCommentTick=match.tick;}
    }
    if(event.type==='ringout' && !record.reduced)slowMoment=0.3;
    if (event.type === "finish") finishRound();
  }
}

function finishRound() {
  if (resultShown) return;
  resultShown = true;
  input.setActive(false);
  input.clear();
  record.rounds++;
  if(mode==="academy"){
    assessment=assess(match,lessonIndex);
    if(assessment.passed){
      const previous=record.lessons[lessonIndex];
      if(!previous?.passed || ['B','A','A+'].indexOf(assessment.grade)>['B','A','A+'].indexOf(previous.grade)) record.lessons[lessonIndex]={passed:true,grade:assessment.grade};
    }
  }
  if(mode==="academy"&&assessment)assessment.rank=RANKS[record.lessons.filter(l=>l?.passed).length];
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
  finishTimer = setTimeout(async()=>{
    await fleet.show({lesson:mode==="academy"?COURSE[lessonIndex]:COURSE[Math.max(0,ARENAS.findIndex(a=>a.id===match.arena))],after:true});
    showResult();
    if(mode==="academy"&&assessment?.passed)sound.fanfare();
  },950);
}

function medalName() {
  if(mode==="victory")return "THE GOLDEN ORDER OF OPTIONAL ENTHUSIASM";
  if(mode==="academy")return COURSE[lessonIndex].medal;
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
  $("#result").showModal();
  const voice = RELEASE.voices.find((voice) => voice.id === "finish");
  if (voice) {
    $("#result-voice").textContent = `“${voice.text}” — BEAM / ${voice.source}`;
    // The unchanged recording already played in the post-fight broadcast.
  }
}

function nextRound() {
  startMatch({ rematch: true, advance: true });
}

async function saveResult() {
  if (!match) return;
  const button = $("#save-result");
  button.disabled = true;
  $("#export-status").textContent = "Preparing your local result image…";
  try {
    const { resultPNG } = await import("./export.js");
    const blob = mode==="academy" ? await (await import('./certificate.js')).certificatePNG(match,{lesson:COURSE[lessonIndex],assessment,service:record.service,index:lessonIndex,lessons:record.lessons,assist:record.assist}) : await resultPNG(match, {
      medal: medalName(),
      mode,
      assist: record.assist,
      gauntlet: gauntlet.complete,
    });
    const url = URL.createObjectURL(blob),
      anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = mode==="academy"?"MARS-cadet-certificate-"+(lessonIndex+1)+".png":"MARS-out-of-orbit-result.png";
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
  renderer.reduced = enabled;
  previewRenderer.reduced = enabled;
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
    input.setTouch(
      "aimY",
      Math.abs(dy) < 0.25 ? 0 : Math.max(-0.65, Math.min(0.65, dy * 0.65)),
    );
  }
  function release() {
    pointer = null;
    knob.style.transform = "";
    input.setTouch("move", 0);
    input.setTouch("aimY", 0);
  }
  resets.push(release);
  stick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (pointer !== null) return;
    pointer = event.pointerId;
    stick.setPointerCapture(pointer);
    update(event);
  });
  stick.addEventListener("pointermove", (event) => {
    if (event.pointerId === pointer) update(event);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    stick.addEventListener(name, (event) => {
      if (event.pointerId === pointer) release();
    });
  for (const action of ["jump", "shoot", "special"]) {
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
                : input.read(matchBindings[index]),
            );
            stepMatch(match, inputs);
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

function refreshCourse(){
  let bonus=$("#mode-victory");
  if(!bonus){
    bonus=document.createElement('button');bonus.id='mode-victory';bonus.dataset.mode='victory';bonus.textContent='Victory Lap';bonus.type='button';
    bonus.setAttribute('aria-pressed','false');bonus.addEventListener('click',()=>chooseMode('victory'));$("#modes").append(bonus);
  }
  bonus.hidden=record.lessons.filter(l=>l?.passed).length!==7;
  renderCourse(record,lessonIndex,index=>{
    lessonIndex=index;chooseMode('academy');refreshCourse();
    $('#setup').scrollIntoView({behavior:record.reduced?'instant':'smooth',block:'start'});
  });
}
$('#quick-start').addEventListener('click',()=>{
  chooseMode('academy');startMatch();
});
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
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $("#game").requestFullscreen();
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
addEventListener("resize", () => {
  renderer.resize();
  previewRenderer.resize();
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
    botExhibition(){if(!match)return;matchBindings=match.fighters.map(()=>"bot");match.fighters.forEach(f=>f.controller="bot");renderHud(true);},
    get academy(){return {lessonIndex,assessment,record:JSON.parse(JSON.stringify(record)),mode,feedOpen:fleet.open,camera:{...renderer.camera},canvas:{width:renderer.width,height:renderer.height},spriteHeight:98*renderer.camera.scale};},
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
        processEvents(match.events);
      }
      renderHud();
    },
  };
}
