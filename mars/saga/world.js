import { enrichRoom } from "./rooms-k1b.js";
import { configurePuzzleRoom } from "./puzzles-k1c.js";
// Original game geography. The route condenses Volume 1 locations for play.
export const ROOM_WIDTH = 1100;
export const FLOOR = 600;
const names = [
  "The Heavy Room",
  "Balance gallery",
  "Service pantry",
  "Counterweight hall",
  "Observation loft",
  "Recovery workshop",
  "The line locker",
  "Departure spine",
  "Pressure garden",
  "Radiator walk",
  "Dock inspection",
  "Quiet cargo",
  "Needlewake berth",
  "Crew mess",
  "The tool cradle",
  "Salvage balcony",
  "Winch shaft",
  "Return gantry",
  "Flight stores",
  "Moth cradle",
  "Launch control",
  "The square threshold",
  "Sleeping rails",
  "First contact",
  "The held interval",
  "Low contact",
  "High contact",
  "The listening chamber",
  "The divided beam",
  "The dry foam bypass",
  "The wind return",
  "Below the counterweight",
  "The loaded line",
  "Float and freight",
  "The small heavy crate",
  "The catching chain",
  "The moving return",
  "The pressure pockets",
  "Borrowed light",
  "The listening stair",
];
// Preserve existing story IDs while putting new, authored mechanical bays in
// the continuous route. Room number is an identity, never a route oracle.
export const ROOM_ROUTE=[0,1,2,3,4,5,6,28,29,7,30,8,9,31,10,11,32,12,13,33,14,15,34,16,17,35,18,36,19,37,20,21,22,38,23,24,39,25,26,27];
const tasks = [
  "Find Tavi in the recovery workshop.",
  "Try a running jump. Hold jump to go higher.",
  "There is always time for a biscuit.",
  "The amber bars announce the next sweep.",
  "Climb the upper ledge for a forgotten field note.",
  "Tavi has something practical for you.",
  "Take the recovery line. Reach the far anchor.",
  "Use the line to cross the open service trench.",
  "A quiet route above the pressure fans.",
  "Follow the pale handrails.",
  "Inspect the first recovery seal.",
  "A little distance from the official version.",
  "The ship is bigger when you have to walk through it.",
  "Sera counts people. Beam counts applause.",
  "Collect the second recovery seal.",
  "The long way has the better view.",
  "A line is also a way back.",
  "Open the service return.",
  "Inspect the final recovery seal.",
  "Rook is pretending he has checked everything.",
  "Bring three recovery seals. Launch the Moth.",
  "The rescue brought you here. Follow the contact faces.",
  "Watch. The machine shows its own rhythm.",
  "Inspect the short contacts.",
  "Leave the silence. It belongs here.",
  "Wake the low contact.",
  "Wake the high contact.",
  "Answer the machine. Then bring everybody home.",
];
const patterns = [
  [
    [260, 478, 230],
    [620, 368, 210],
    [810, 485, 180],
  ],
  [
    [200, 475, 160],
    [410, 350, 200],
    [690, 470, 210],
  ],
  [
    [220, 500, 200],
    [480, 390, 180],
    [760, 280, 190],
  ],
  [
    [160, 460, 190],
    [450, 330, 210],
    [760, 465, 170],
  ],
  [
    [200, 490, 170],
    [430, 365, 190],
    [680, 250, 240],
  ],
  [
    [260, 475, 260],
    [650, 380, 180],
    [850, 495, 140],
  ],
  [
    [180, 480, 190],
    [470, 370, 150],
    [740, 480, 210],
  ],
];
const characters = {
  0: "rook",
  2: "sera",
  5: "tavi",
  10: "tavi",
  13: "sera",
  14: "pip",
  18: "tavi",
  19: "rook",
  21: "tavi",
  24: "pip",
  27: "tavi",
};
const secretRooms = new Set([4, 11, 16, 22]);
export const ROOMS = names.map((name, id) => {
  const routeIndex=ROOM_ROUTE.indexOf(id),row = Math.floor(routeIndex / 7),
    column = row % 2 ? 6 - (routeIndex % 7) : routeIndex % 7;
  const zone =
    id>=28?({28:'academy',29:'academy',30:'needlewake',31:'needlewake',32:'needlewake',33:'needlewake',34:'hangar',35:'hangar',36:'hangar',37:'hangar',38:'clock',39:'clock'}[id]):id < 7 ? "academy" : id < 14 ? "needlewake" : id < 21 ? "hangar" : "clock";
  const gap = [3, 8, 12, 15, 18, 22, 26].includes(id)
    ? [460, 180]
    : id === 7
      ? [320, 440]
      : null;
  const platforms = gap
    ? [
        [0, FLOOR, gap[0]],
        [gap[0] + gap[1], FLOOR, 1100 - gap[0] - gap[1]],
      ]
    : [[0, FLOOR, 1100]];
  platforms.push(...patterns[id % 7]);
  // The ability gate has a clear single-anchor swing and generous far landing.
  if (id === 7) platforms.splice(2, 3, [160, 490, 170], [790, 490, 210]);
  const upper = patterns[id % 7][1],
    high = patterns[id % 7][2];
  const terminal = (x, y, label) => ({ x, y, label });
  const challenges = {
    1: [terminal(280, 475, "Test the upper handrail")],
    3: [terminal(810, 600, "Return the counterweight crate")],
    4: [terminal(800, 250, "Chart the observation mast")],
    5: [
      terminal(upper[0] + upper[2] / 2, upper[1], "Release the upper latch"),
      terminal(800, 600, "Secure the lower latch"),
    ],
    8: [
      terminal(280, 475, "Close the first pressure valve"),
      terminal(790, 470, "Close the second pressure valve"),
    ],
    9: [
      terminal(
        upper[0] + upper[2] / 2,
        upper[1],
        "Check the radiator coupling",
      ),
    ],
    11: [
      terminal(upper[0] + upper[2] / 2, upper[1], "Return the cargo manifest"),
    ],
    12: [
      terminal(upper[0] + upper[2] / 2, upper[1], "Set the upper relay"),
      terminal(850, 600, "Close the berth relay"),
    ],
    15: [
      terminal(upper[0] + upper[2] / 2, upper[1], "Unclamp the salvage rail"),
    ],
    16: [terminal(high[0] + high[2] / 2, high[1], "Secure the high winch")],
    17: [
      terminal(upper[0] + upper[2] / 2, upper[1], "Unlock the service return"),
    ],
    19: [
      terminal(280, 600, "Check the pressure seal"),
      terminal(upper[0] + upper[2] / 2, upper[1], "Check the flight harness"),
      terminal(850, 600, "Check the rescue eye"),
    ],
    22: [
      terminal(
        upper[0] + upper[2] / 2,
        upper[1],
        "Observe the separated rails",
      ),
    ],
    24: [
      terminal(upper[0] + upper[2] / 2, upper[1], "Read the empty interval"),
    ],
  };
  return configurePuzzleRoom(enrichRoom({
    id,
    name,
    zone,
    row,
    column,
    task: tasks[id]||"Follow the recovery route.",
    platforms: platforms.map(([x, y, w], index) => ({
      id: `${id}-${index}`,
      x,
      y,
      w,
      h: 22,
      active: true,
    })),
    anchor: { x: id === 7 ? 560 : 550, y: id === 7 ? 220 : 180 },
    gap,
    hazard: [3, 8, 12, 15, 18, 23, 26].includes(id),
    npc: characters[id] || null,
    save: [0, 5, 6, 10, 13, 14, 18, 20, 21, 24, 27].includes(id),
    seal: [10, 14, 18].includes(id),
    secret: secretRooms.has(id),
    challenges: challenges[id] || [],
    sealX: upper[0] + upper[2] / 2,
    sealY: upper[1],
    collectible: id % 3 === 1 || secretRooms.has(id),
    collectibleX: id === 4 ? 800 : 540,
    collectibleY: id === 4 ? 215 : patterns[id % 7][1][1] - 45,
  }));
});
export const SHORTCUTS = [
  {
    id: "pantry-return",
    a: 2,
    b: 10,
    unlocksAt: 10,
    name: "Pantry lift",
    x: 360,
  },
  {
    id: "crew-return",
    a: 9,
    b: 17,
    unlocksAt: 17,
    name: "Crew service lift",
    x: 760,
  },
];
export function roomExits(id, state) {
  const exits = [];
  const index=ROOM_ROUTE.indexOf(id),previous=ROOM_ROUTE[index-1],next=ROOM_ROUTE[index+1];
  if (previous!==undefined && id !== 21)
    exits.push({ to: previous, x: 65, y: FLOOR, label: "Return", side: "left" });
  if (next!==undefined && id !== 20)
    exits.push({
      to: next,
      x: 1035,
      y: FLOOR,
      label: "Onward",
      side: "right",
      locked:
        (id === 6 && !state.tether) || (id === 16 && !state.midbossComplete) ||
        (state.tasks?.[id] || 0) < ROOMS[id].challenges.length,
    });
  for (const link of SHORTCUTS) {
    if (link.a !== id && link.b !== id) continue;
    exits.push({
      to: link.a === id ? link.b : link.a,
      x: link.x,
      y: FLOOR,
      label: link.name,
      shortcut: link.id,
      locked: !state.shortcuts.includes(link.id) && id !== link.unlocksAt,
    });
  }
  if (id === 21 && state.flightComplete)
    exits.push({
      to: 20,
      x: 65,
      y: FLOOR,
      label: "Return to the Moth",
      side: "left",
    });
  if (id === 20 && state.flightComplete)
    exits.push({
      to: 21,
      x: 1035,
      y: FLOOR,
      label: "World Clock",
      side: "right",
    });
  return exits;
}
export function objective(state) {
  if (state.mode === "flight")
    return "Bring Pip home. Keep the rescue line clear.";
  if (state.mode === "duel")
    return "Foam & paint · two ring-outs. Drones bring every cadet back.";
  if (state.complete) return "All five accounted for.";
  if (!state.tether) return "Find the recovery line in the line locker.";
  if (!state.flightComplete)
    return `Prepare the Moth · ${state.seals.length}/3 recovery seals`;
  return `Listen to the World Clock · ${state.contacts.length}/3 observations`;
}
