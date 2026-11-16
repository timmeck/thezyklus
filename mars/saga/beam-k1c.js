// Situational Fleetvision lines for the Volume 1 game adaptation.
// New adaptation recordings are pending Claude; exact original clips are explicitly mapped. Never fetch a missing file by default.
// No line gives a puzzle solution; each is heard at most once per journey.
export const BEAM_CUES = Object.freeze([
  {
    "id": "beam-k1c-duct",
    "event": "task",
    "rooms": [
      2
    ],
    "text": "Excellent low-profile work. The camera is being lowered to match.",
    "mood": "radiant presenter, sincerely impressed; tiny proud pause before the camera",
    "source": "K1C game adaptation; Band 1 p03d, p23a: propaganda reframes an awkward physical achievement.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-duct.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-weight",
    "event": "task",
    "rooms": [
      3
    ],
    "text": "A magnificent victory for personal courage. And the crate.",
    "mood": "broad heroic approval; small extra beat before crediting the crate",
    "source": "K1C game adaptation; Band 1 p23c and p37a-e: heroic mass, ceremonial confidence and an actual load.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-weight.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-net",
    "event": [
      "puzzle-reset",
      "recover"
    ],
    "rooms": [
      7
    ],
    "text": "An inspiring rehearsal. The safety net has requested an autograph.",
    "mood": "warm encouragement, no mockery; absolutely sincere autograph request",
    "source": "K1C game adaptation; Band 1 p03d: Beam turns a safe fall into a broadcast triumph.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-net.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-swing",
    "event": "task",
    "rooms": [
      7
    ],
    "text": "Splendid! A graceful arrival at somewhere else.",
    "mood": "delighted, polished announcement with a slightly uncertain destination",
    "source": "K1C game adaptation; Band 1 p01b and p23a: spectacular movement becomes recruitment copy.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-swing.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-wind",
    "event": "task",
    "rooms": [
      9
    ],
    "text": "A commanding performance. Even the air is taking direction.",
    "mood": "admiring presenter, stresses commanding with unwarranted confidence",
    "source": "K1C game adaptation; Band 1 p01e: physical conditions treated as an attitude.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-wind.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-door",
    "event": "enter",
    "rooms": [
      12
    ],
    "text": "Please keep moving. The door is extremely eager to finish.",
    "mood": "cheerful polite urgency; sincere announcement, not a puzzle instruction",
    "source": "K1C game adaptation; Band 1 p23d-e: cheerful survival announcement beside a moving plate.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-door.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-second-take",
    "event": "puzzle-reset",
    "rooms": [
      12
    ],
    "text": "A second take! Our doors are nothing if not committed.",
    "mood": "bright encouragement, warm reset gag, never scolding",
    "source": "K1C game adaptation; Band 1 p23a: danger reframed as educational production value.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-second-take.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-retirement",
    "event": "midboss",
    "rooms": [
      16
    ],
    "text": "The machine has embraced retirement. We respect a graceful exit.",
    "mood": "ceremonial respect for a safely parked cleaning machine",
    "source": "K1C game adaptation; Band 1 p03d and p37e: Beam's embrace wording, with safe machine retirement.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-retirement.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-foam",
    "event": "task",
    "rooms": [
      18
    ],
    "text": "Every bubble a triumph. We are checking whether medals float.",
    "mood": "enthusiastic announcement; second sentence is a genuine logistical concern",
    "source": "K1C game adaptation; Band 1 p23c and p37c: absurd medals meet practical rescue equipment.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-foam.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-dark",
    "event": "enter",
    "rooms": [
      22
    ],
    "text": "Stay bright. Stay Martian. Please remain alive for the ceremony.",
    "mood": "bright presenter with a brief edge of concern, exact released Band 1 line",
    "source": "Band 1, p23e, V3L23e",
    "adaptation": false,
    "speaker": "Captain Beam",
    "file": "assets/audio/vo/k1c-beam-dark.m4a",
    "status": "neu-K1C",
    "audio": "assets/audio/vo/k1c-beam-dark.m4a"
  },
  {
    "id": "beam-k1c-light",
    "event": "task",
    "rooms": [
      22
    ],
    "text": "Excellent visibility. We saw almost all of that.",
    "mood": "unbroken confidence despite a poor camera view; warm little admission",
    "source": "K1C game adaptation; Band 1 p23a-b: official view stays triumphant when the picture deteriorates.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-light.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-knot",
    "event": "note",
    "rooms": [
      4
    ],
    "special": true,
    "text": "An optional achievement! Entirely compulsory for the highlights.",
    "mood": "beaming approval, absurd editorial priority, no demand on the player",
    "source": "K1C game adaptation; Band 1 p01 and p23: Beam selects a heroic public image from practical work.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-knot.m4a",
    "status": "neu-K1C",
    "adaptation": true
  },
  {
    "id": "beam-k1c-rescue",
    "event": "rescue",
    "text": "Every survivor qualifies for our new Medal of Upright Excellence.",
    "mood": "luminous pride in a completely impractical medal; exact released Band 1 line",
    "source": "Band 1, p23c, V3L23c",
    "adaptation": false,
    "speaker": "Captain Beam",
    "file": "assets/audio/vo/k1c-beam-rescue.m4a",
    "status": "neu-K1C",
    "audio": "assets/audio/vo/k1c-beam-rescue.m4a"
  },
  {
    "id": "beam-k1c-recover",
    "event": "recover",
    "text": "A controlled return! We shall edit the control in later.",
    "mood": "warm matter-of-fact reassurance after a safe return, sincere broadcast confidence",
    "source": "K1C game adaptation; Band 1 p03d and p23a: an awkward safe fall receives a triumphant television description.",
    "speaker": "Captain Beam",
    "file": "assets/voice/beam-k1c-recover.m4a",
    "status": "neu-K1C",
    "adaptation": true
  }
].map(cue => Object.freeze(cue)));

export function chooseBeamCue(state, event) {
  if (!state || !event || state.complete) return null;
  const room = Number.isInteger(event.room) ? event.room : state.room;
  const heard = Array.isArray(state.beamHeard) ? state.beamHeard : [];
  const cue = BEAM_CUES.find(cue => {
    const types = Array.isArray(cue.event) ? cue.event : [cue.event];
    return types.includes(event.type) && !heard.includes(cue.id) &&
      (!cue.rooms || cue.rooms.includes(room)) &&
      (!cue.special || event.special === true);
  });
  if (!cue) return null;
  const now = Number(state.elapsed) || 0;
  if (Number.isFinite(state.beamLastAt) && now - state.beamLastAt < 8) return null;
  state.beamHeard = [...heard, cue.id];
  state.beamLastAt = now;
  return { ...cue, room, audio: cue.audio || null };
}
