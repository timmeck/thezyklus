import { newExplorer } from "./explore.js";
import {ROOMS} from './world.js';
export const SAVE_KEY = "mars-saga-k1-v1";
export const SETTINGS_KEY = "mars-saga-settings-v1";
export const defaults = {
  assist: true,
  calm: false,
  reduced: false,
  sound: true,
};
export function newGame(settings = {}) {
  return {
    version: 1,
    mode: "explore",
    room: 0,
    checkpoint: 0,
    player: newExplorer(),
    elapsed: 0,
    energy: 5,
    tether: false,
    seals: [],
    contacts: [],
    notes: [],
    secrets: [],
    visited: [0],
    shortcuts: [],
    tasks: {},
    openSecrets:[], defeated:[], machineState:{}, midbossComplete:false, sceneSeen:[],
    puzzles:{},deathsByRoom:{},beamHeard:[],
    carryingCrate: false,
    crate: { room: 3, x: 240, y: 600 },
    recoveries: 0,
    flightComplete: false,
    duelComplete: false,
    complete: false,
    events: [],
    settings: { ...defaults, ...settings },
  };
}
export function loadSettings() {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
    };
  } catch {
    return { ...defaults };
  }
}
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
export function saveGame(state) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    let previous = null;
    try {
      previous = JSON.parse(raw || "null");
    } catch {}
    const otherJourney =
      previous?.runId && state.runId && previous.runId !== state.runId;
    if (
      !state.newJourney &&
      (otherJourney || previous?.version > state.version)
    )
      return false;
    if (state.runId && previous?.runId === state.runId) {
      for (const key of [
        "visited",
        "seals",
        "contacts",
        "notes",
        "secrets",
        "shortcuts", "openSecrets", "defeated", "sceneSeen", "beamHeard",
      ]) {
        state[key] = [...new Set([...(previous[key] || []), ...state[key]])];
      }
      for (const key of [
        "tether", "midbossComplete",
        "flightComplete",
        "duelComplete",
        "complete",
      ])
        state[key] = Boolean(state[key] || previous[key]);
      for (const [room, count] of Object.entries(previous.tasks || {}))
        state.tasks[room] = Math.max(state.tasks[room] || 0, count);
      for(const [room,puzzle] of Object.entries(previous.puzzles||{})){
        if(puzzle.complete&&!state.puzzles?.[room]?.complete){state.puzzles||={};state.puzzles[room]=puzzle;}
        if(state.tasks[room]){state.puzzles||={};state.puzzles[room]||=puzzle;state.puzzles[room].complete=true;}
      }
      state.specialFind||=previous.specialFind;
      state.deathsByRoom||={};for(const [room,count]of Object.entries(previous.deathsByRoom||{}))state.deathsByRoom[room]=Math.max(state.deathsByRoom[room]||0,count);
    }
    const copy = {
      ...state,
      events: [],
      player: { ...state.player, rope: null, ledge: null },
      savedAt: Date.now(),
    };
    delete copy.newJourney;
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
    delete state.newJourney;
    return true;
  } catch {
    return false;
  }
}
export function loadGame() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (!data || data.version !== 1) return null;
    const state = {
      ...newGame(loadSettings()),
      ...data,
      events: [],
      settings: loadSettings(),
    };
    state.runId = data.runId || "legacy-k1";
    state.room = Math.max(0, Math.min(ROOMS.length-1, Math.floor(Number(data.room) || 0)));
    for (const key of [
      "visited",
      "seals",
      "contacts",
      "notes",
      "secrets",
      "shortcuts",
      "openSecrets", "defeated", "sceneSeen", "beamHeard",
    ])
      state[key] = Array.isArray(data[key]) ? data[key] : [];
    if (
      !state.player ||
      !Number.isFinite(state.player.x) ||
      !Number.isFinite(state.player.y)
    )
      state.player = newExplorer();
    if(state.duel && state.duel.version!==2)state.duel=null;
    state.player.rope = null;
    state.player.ledge = null;
    return state;
  } catch {
    return null;
  }
}
