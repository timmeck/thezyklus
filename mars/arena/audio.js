// Original Web Audio cues, generated locally from oscillators and a seeded noise bed.
// Voice playback accepts same-origin recordings only.

export class Sound {
  constructor() {
    this.enabled = true;
    this.paused = false;
    this.context = null;
    this.master = null;
    this.effects = null;
    this.compressor = null;
    this.noise = null;
    this.sources = new Set();
    this.voice = null;
    this.voiceAbort = null;
    this.voiceToken = 0;
    this.voiceCache = new Map();
    this.missingVoices = new Set();
    this.voiceLoading = false;
    this.lastVoiceAt = -Infinity;
    this.lastCue = new Map();
  }

  async unlock() {
    try {
      if (!this.context) {
        const Context =
          globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Context) return false;
        this.context = new Context({ latencyHint: "interactive" });
        this.master = this.context.createGain();
        this.master.gain.value = this.enabled ? 0.7 : 0;
        this.effects = this.context.createGain();
        this.effects.gain.value = 0.65;
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -8;
        this.compressor.knee.value = 12;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.005;
        this.compressor.release.value = 0.08;
        this.effects.connect(this.master);
        this.master.connect(this.compressor);
        this.compressor.connect(this.context.destination);
        this.noise = this.context.createBuffer(
          1,
          Math.floor(this.context.sampleRate * 0.2),
          this.context.sampleRate,
        );
        const samples = this.noise.getChannelData(0);
        let seed = 2705;
        for (let index = 0; index < samples.length; index += 1) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          samples[index] =
            ((seed / 4294967296) * 2 - 1) * (1 - index / samples.length);
        }
      }
      if (this.enabled && !this.paused && this.context.state !== "running")
        await this.context.resume();
      return this.context.state === "running";
    } catch {
      return false;
    }
  }

  set(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.context) return;
    this.master.gain.setValueAtTime(
      this.enabled ? 0.7 : 0,
      this.context.currentTime,
    );
    if (!this.enabled) {
      this.stopVoice();
      this.stopEffects();
      this.context.suspend().catch(() => {});
    } else if (!this.paused) this.context.resume().catch(() => {});
  }

  pause() {
    this.paused = true;
    this.stopVoice();
    this.stopEffects();
    this.context?.suspend().catch(() => {});
  }

  resume() {
    this.paused = false;
    if (this.enabled) this.context?.resume().catch(() => {});
  }

  stopEffects() {
    for (const record of this.sources) {
      try {
        record.node.stop();
      } catch {}
      record.node.disconnect();
      record.filter?.disconnect();
      record.gain.disconnect();
    }
    this.sources.clear();
    this.lastCue.clear();
  }

  tone(
    frequency,
    endFrequency,
    duration = 0.1,
    volume = 0.12,
    type = "triangle",
    delay = 0,
  ) {
    if (this.sources.size >= 24) return;
    const context = this.context;
    const start = context.currentTime + delay;
    const node = context.createOscillator();
    const gain = context.createGain();
    node.type = type;
    node.frequency.setValueAtTime(Math.max(20, frequency), start);
    node.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      start + duration,
    );
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    node.connect(gain);
    gain.connect(this.effects);
    const record = { node, gain };
    this.sources.add(record);
    node.onended = () => {
      node.disconnect();
      gain.disconnect();
      this.sources.delete(record);
    };
    node.start(start);
    node.stop(start + duration + 0.01);
  }

  burst(duration = 0.08, volume = 0.16, cutoff = 1300) {
    if (this.sources.size >= 24) return;
    const context = this.context;
    const start = context.currentTime;
    const node = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    node.buffer = this.noise;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    node.connect(filter);
    filter.connect(gain);
    gain.connect(this.effects);
    const record = { node, gain, filter };
    this.sources.add(record);
    node.onended = () => {
      node.disconnect();
      filter.disconnect();
      gain.disconnect();
      this.sources.delete(record);
    };
    node.start(start);
    node.stop(start + duration);
  }

  event(event) {
    if (
      !this.enabled ||
      this.paused ||
      !this.context ||
      this.context.state !== "running"
    )
      return;
    const key = `${event.type}/${event.player ?? 0}`;
    const now = this.context.currentTime;
    if (
      now - (this.lastCue.get(key) ?? -1) <
      (event.type === "shot" ? 0.045 : 0.025)
    )
      return;
    this.lastCue.set(key, now);
    try {
      if (event.type === "shot") {
        this.tone(
          event.kind === "air" ? 150 : event.kind === "medal" ? 650 : 420,
          event.kind === "air" ? 60 : 170,
          0.075,
          event.special ? 0.2 : 0.08,
          "triangle",
        );
        if (event.special) this.burst(0.11, 0.17, 1800);
      } else if (event.type === "hit") {
        const heavy = (event.power || 0) > 600;
        this.burst(
          heavy ? 0.13 : 0.075,
          heavy ? 0.24 : 0.15,
          heavy ? 950 : 1700,
        );
        this.tone(
          heavy ? 105 : 180,
          45,
          heavy ? 0.18 : 0.11,
          heavy ? 0.22 : 0.13,
        );
      } else if (event.type === "jump") {
        this.tone(
          event.air ? 380 : 260,
          event.air ? 640 : 460,
          0.065,
          0.045,
          "sine",
        );
      } else if (event.type === "special") {
        const motif={iona:[320,960,640],rook:[220,660,150],sera:[100,100,800],tavi:[720,440,880],beam:[523,659,784],pip:[440,660,1046]}[event.kind]||[250,500,700];
        motif.forEach((f,i)=>this.tone(f,f*(event.kind==='rook'?0.7:1.1),event.kind==='sera'?0.2:0.12,0.08,event.kind==='rook'?'sawtooth':'triangle',i*0.09));
        if(event.kind==='sera')this.burst(0.14,0.12,1000);
      } else if (event.type === 'edge-warning') {
        this.tone(880, 660, 0.12, 0.11, 'triangle');
        this.tone(880, 660, 0.12, 0.09, 'triangle', 0.2);
      } else if (event.type === 'ledge' || event.type === 'climb') {
        this.tone(event.type === 'ledge' ? 280 : 420, 680, 0.12, 0.07, 'triangle');
      } else if (event.type === 'recovery') {
        this.tone(230, 920, 0.3, 0.10, 'triangle');
      } else if (event.type === "ringout") {
        this.tone(680, 65, 0.38, 0.18);
        this.tone(350, 110, 0.32, 0.12, "sine", 0.04);
      } else if (event.type === "respawn") {
        this.tone(300, 600, 0.15, 0.09, "sine");
        this.tone(450, 900, 0.13, 0.07, "sine", 0.08);
      } else if (event.type === "item" || event.type === "passive") {
        this.tone(500, 500, 0.11, 0.075, "sine");
        this.tone(750, 750, 0.13, 0.075, "sine", 0.07);
        this.tone(1000, 1000, 0.15, 0.065, "sine", 0.14);
      } else if (event.type === "finish") {
        for (const [index, frequency] of [330, 440, 550, 660].entries())
          this.tone(frequency, frequency, 0.2, 0.1, "triangle", index * 0.105);
      } else if (event.type === "hazard") {
        this.tone(220, 200, 0.16, 0.07, "sine");
        this.tone(220, 200, 0.16, 0.07, "sine", 0.25);
      }
    } catch {
      // Audio availability never interrupts the simulation.
    }
  }

  music(arena) {
    this.musicArena=arena;
    if(this.musicTimer)return;
    this.musicBeat=0;
    this.musicTimer=setInterval(()=>{
      if(!this.context||!this.enabled||this.paused||this.context.state!=='running')return;
      const scores={
        deck:[0,7,12,7,3,7,10,7],gravity:[0,6,7,12,0,6,10,7],
        yard:[0,10,7,3,12,7,15,10],studio:[0,4,7,12,11,7,4,7],
        airlock:[0,0,7,3,0,10,6,7],broadcast:[0,7,12,16,14,12,7,12],
      };
      const notes=scores[this.musicArena]||scores.deck,beat=this.musicBeat++;
      const base=this.musicArena==='yard'?146.83:this.musicArena==='gravity'?110:130.81;
      const note=notes[beat%notes.length],f=base*Math.pow(2,note/12);
      const level=this.voice?0.012:0.027;
      this.tone(f,f,0.19,level,this.musicArena==='studio'?'triangle':'sine');
      if(beat%4===0)this.tone(base/2,base/2,0.31,level*1.1,'triangle');
      if(this.musicArena==='broadcast'&&beat%2===0)this.burst(0.045,0.022,2400);
    },240);
  }

  fanfare() {
    if(!this.context||!this.enabled||this.paused)return;
    [0,7,12,16,19,24].forEach((n,i)=>{
      const f=261.63*Math.pow(2,n/12);this.tone(f,f,0.24,0.08,'triangle',i*0.12);
    });
  }

  stopVoice() {
    this.voiceToken += 1;
    this.voiceAbort?.abort();
    this.voiceAbort = null;
    this.voiceLoading = false;
    if (this.voice) {
      try {
        this.voice.node.stop();
      } catch {}
      this.voice.node.disconnect();
      this.voice.gain.disconnect();
      this.voice = null;
    }
    if (this.effects && this.context)
      this.effects.gain.setTargetAtTime(0.65, this.context.currentTime, 0.05);
  }

  async say({ text = "", audio, source = "", interrupt = false } = {}) {
    if (!audio || !this.enabled || this.paused) return false;
    if (!interrupt && (this.voice || this.voiceLoading ||
      performance.now() - this.lastVoiceAt < 4500)) return false;
    this.stopVoice();
    const token = this.voiceToken;
    this.voiceLoading = true;
    try {
      const url = new URL(
        audio,
        globalThis.document?.baseURI || globalThis.location?.href,
      );
      if (
        url.origin !== globalThis.location?.origin ||
        !["http:", "https:"].includes(url.protocol)
      )
        return false;
      if (this.missingVoices.has(url.href)) return false;
      if (
        !(await this.unlock()) ||
        token !== this.voiceToken ||
        this.paused ||
        !this.enabled
      )
        return false;
      let buffer = this.voiceCache.get(url.href);
      if (!buffer) {
        const controller = new AbortController();
        this.voiceAbort = controller;
        const response = await fetch(url.href, {
          credentials: "same-origin",
          cache: "force-cache",
          signal: controller.signal,
        });
        if (!response.ok) {
          if ([404, 410].includes(response.status)) this.missingVoices.add(url.href);
          return false;
        }
        const encoded = await response.arrayBuffer();
        if (token !== this.voiceToken) return false;
        buffer = await this.context.decodeAudioData(encoded);
        if (token !== this.voiceToken) return false;
        if (this.voiceCache.size >= 8)
          this.voiceCache.delete(this.voiceCache.keys().next().value);
        this.voiceCache.set(url.href, buffer);
      }
      if (token !== this.voiceToken || this.paused || !this.enabled)
        return false;
      this.voiceAbort = null;
      const node = this.context.createBufferSource();
      const gain = this.context.createGain();
      node.buffer = buffer;
      gain.gain.value = 0.95;
      node.connect(gain);
      gain.connect(this.master);
      const voice = { node, gain, text, source, audio: url.href };
      this.voice = voice;
      this.lastVoiceAt = performance.now();
      this.effects.gain.setTargetAtTime(0.22, this.context.currentTime, 0.025);
      node.onended = () => {
        node.disconnect();
        gain.disconnect();
        if (this.voice === voice) {
          this.voice = null;
          this.effects.gain.setTargetAtTime(
            0.65,
            this.context.currentTime,
            0.06,
          );
        }
      };
      node.start();
      return true;
    } catch {
      return false;
    } finally {
      if (token === this.voiceToken) {
        this.voiceLoading = false;
        this.voiceAbort = null;
      }
    }
  }
}
