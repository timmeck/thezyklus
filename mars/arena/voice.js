// New game comments, deliberately separate from the unchanged manga recordings.
// Missing recordings are declared by the build, so text fallback makes no 404 request.
export class VoiceDirector {
  constructor(sound, lines = [], { subtitle = () => {}, cooldown = 4.5 } = {}) {
    this.sound = sound;
    this.lines = lines;
    this.subtitle = subtitle;
    this.cooldown = Math.max(3, cooldown) * 1000;
    this.last = -Infinity;
    this.until = 0;
    this.turns = new Map();
  }

  get busy() {
    return Boolean(this.sound.voice || this.sound.voiceLoading || this.sound.voiceAbort || performance.now() < this.until);
  }

  trigger(trigger) {
    const now = performance.now();
    if (this.busy || now - this.last < this.cooldown) return null;
    const candidates = this.lines.filter(line => line.trigger === trigger);
    if (!candidates.length) return null;
    const turn = this.turns.get(trigger) || 0;
    const line = candidates[turn % candidates.length];
    this.turns.set(trigger, turn + 1);
    this.last = now;
    this.until = now + Math.min(4200, Math.max(1800, line.text.split(/\s+/).length * 275));
    this.subtitle(line);
    if (line.audioAvailable) {
      // say() refuses overlap; the common music bus ducks for the actual recording.
      this.sound.say({ text: line.text, audio: line.file, source: line.speaker,
        interrupt: false, optional: true }).then(played => {
        if (played && this.sound.voice) {
          const durationMs=(this.sound.voice.node.buffer?.duration||0)*1000;
          this.until = Math.max(this.until,
            performance.now() + durationMs + 350);
          this.subtitle({...line,durationMs:durationMs+250});
        }
      });
    }
    return line;
  }

  stop() {
    this.sound.stopVoice();
    this.until = 0;
  }
}
