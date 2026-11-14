// Original Web Audio cues, generated locally from oscillators and a seeded noise bed.
// Voice playback accepts same-origin recordings only.

export class Sound {
  constructor({ context = null } = {}) {
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
    this.musicBus = null;
    this.effectsBase = 0.65;
    this.musicBase = 2.2;
    this.lastMixTime = -Infinity;
    this.variationSeed = 270503;
    this.intensity = 0;
    this.dangerUntil = 0;
    this.listenerX = 0;
    this.lastUpdateTime = 0;
    this.musicBeat = 0;
    this.musicNextTime = 0;
    this.meterSamples = new Float32Array(2048);
    if (context) this.initialise(context);
  }

  initialise(context) {
    this.context = context;
    this.offline = typeof context.startRendering === 'function';
    this.master = context.createGain();
    this.master.gain.value = this.enabled ? 0.7 : 0;
    this.effects = context.createGain();
    this.effects.gain.value = this.effectsBase;
    this.musicBus = context.createGain();
    this.musicBus.gain.value = this.musicBase;
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = -14;
    this.compressor.knee.value = 8;
    this.compressor.ratio.value = 6;
    this.compressor.attack.value = 0.002;
    this.compressor.release.value = 0.12;
    // The final soft knee retains headroom when several heavy hits coincide.
    this.limiter = context.createWaveShaper();
    const curve = new Float32Array(4097);
    const knee = 0.65, ceiling = 0.89125;
    for (let i = 0; i < curve.length; i += 1) {
      const input = (i / (curve.length - 1)) * 2 - 1;
      const magnitude = Math.abs(input);
      const output = magnitude <= knee ? magnitude
        : knee + (ceiling - knee) * (1 - Math.exp(-(magnitude - knee) / (ceiling - knee)));
      curve[i] = Math.sign(input) * output;
    }
    this.limiter.curve = curve;
    this.limiter.oversample = '4x';
    this.meter = context.createAnalyser();
    this.meter.fftSize = this.meterSamples.length;
    this.effectsMakeup = context.createGain();
    this.effectsMakeup.gain.value = 2.2 / 0.65;
    this.effects.connect(this.effectsMakeup);
    this.effectsMakeup.connect(this.master);
    this.musicBus.connect(this.master);
    this.master.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.connect(this.meter);
    this.meter.connect(context.destination);

    // Two short, filtered reflections give the attacks a shared room.
    this.room = context.createGain();
    this.room.gain.value = 0.12;
    this.effectsMakeup.connect(this.room);
    this.roomNodes = [];
    for (const [seconds, pan] of [[0.083, -0.55], [0.127, 0.55]]) {
      const delay = context.createDelay(0.3);
      const filter = context.createBiquadFilter();
      const feedback = context.createGain();
      delay.delayTime.value = seconds;
      filter.type = 'lowpass';
      filter.frequency.value = 1700;
      feedback.gain.value = 0.18;
      this.room.connect(delay);
      delay.connect(filter);
      filter.connect(feedback);
      feedback.connect(delay);
      const panner = context.createStereoPanner?.();
      if (panner) {
        panner.pan.value = pan;
        filter.connect(panner);
        panner.connect(this.master);
      } else filter.connect(this.master);
      this.roomNodes.push({ delay, filter, feedback, panner });
    }

    this.noise = context.createBuffer(1, Math.floor(context.sampleRate * 0.5), context.sampleRate);
    const samples = this.noise.getChannelData(0);
    let seed = 2705;
    for (let i = 0; i < samples.length; i += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      samples[i] = (seed / 4294967296) * 2 - 1;
    }
  }

  async unlock() {
    try {
      if (!this.context) {
        const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Context) return false;
        this.initialise(new Context({ latencyHint: "interactive" }));
      }
      if (this.enabled && !this.paused && !this.offline && this.context.state !== "running")
        await this.context.resume();
      if (this.musicArena && !this.musicTimer && !this.offline) this.music(this.musicArena);
      return this.offline || this.context.state === "running";
    } catch {
      return false;
    }
  }

  get ready() {
    return this.enabled && !this.paused && this.context &&
      (this.offline || this.context.state === "running");
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
      if (!this.offline) this.context.suspend().catch(() => {});
    } else if (!this.paused && !this.offline) this.context.resume().catch(() => {});
  }

  pause() {
    this.paused = true;
    this.stopVoice();
    this.stopEffects();
    if (!this.offline) this.context?.suspend().catch(() => {});
  }

  resume() {
    this.paused = false;
    if (this.enabled && !this.offline) this.context?.resume().catch(() => {});
    if (this.context) this.musicNextTime = this.context.currentTime + 0.025;
  }

  stopEffects() {
    for (const record of [...this.sources]) {
      try { record.node.stop(); } catch {}
      this.releaseSource(record);
    }
    this.lastCue.clear();
  }

  releaseSource(record) {
    record.node.onended = null;
    for (const node of [record.node, record.filter, record.gain, record.panner]) node?.disconnect();
    this.sources.delete(record);
  }

  randomVariation() {
    this.variationSeed = (Math.imul(this.variationSeed, 1664525) + 1013904223) >>> 0;
    return this.variationSeed / 4294967296;
  }

  connectSource(node, gain, filter, pan, bus) {
    const panner = this.context.createStereoPanner?.();
    const destination = bus === "music" ? this.musicBus : this.effects;
    if (panner) {
      panner.pan.value = Math.max(-0.85, Math.min(0.85, pan));
      gain.connect(panner);
      panner.connect(destination);
    } else gain.connect(destination);
    const record = { node, gain, filter, panner, bus };
    this.sources.add(record);
    node.onended = () => this.releaseSource(record);
  }

  tone(frequency, endFrequency, duration = 0.1, volume = 0.12,
    type = "triangle", delay = 0,
    { pan = 0, bus = "effects", pitch = 1, level = 1, at = 0, allowPaused = false } = {}) {
    const feedbackReady = allowPaused && this.enabled && this.context &&
      (this.offline || this.context.state === 'running');
    if ((!this.ready && !feedbackReady) || this.sources.size >= 64) return;
    const context = this.context;
    const start = context.currentTime + at + delay;
    const node = context.createOscillator();
    const gain = context.createGain();
    node.type = type;
    node.frequency.setValueAtTime(Math.max(20, frequency * pitch), start);
    node.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency * pitch), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * level), start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    node.connect(gain);
    this.connectSource(node, gain, null, pan, bus);
    node.start(start);
    node.stop(start + duration + 0.01);
  }

  burst(duration = 0.08, volume = 0.16, cutoff = 1300,
    { pan = 0, bus = "effects", pitch = 1, level = 1, at = 0, delay = 0, allowPaused = false } = {}) {
    const feedbackReady = allowPaused && this.enabled && this.context &&
      (this.offline || this.context.state === 'running');
    if ((!this.ready && !feedbackReady) || this.sources.size >= 64) return;
    const context = this.context, start = context.currentTime + at + delay;
    const node = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    node.buffer = this.noise;
    node.playbackRate.value = pitch;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(Math.max(0.0002, volume * level), start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    node.connect(filter);
    filter.connect(gain);
    this.connectSource(node, gain, filter, pan, bus);
    node.start(start);
    node.stop(start + duration);
  }

  event(event, delay = 0) {
    if (!this.ready) return;
    const key = `${event.type}/${event.player ?? 0}`;
    const now = this.context.currentTime + delay;
    if (
      now - (this.lastCue.get(key) ?? -1) <
      (event.type === "shot" ? 0.045 : 0.025)
    )
      return;
    this.lastCue.set(key, now);
    const options = {
      pan: Math.max(-0.8, Math.min(0.8, ((Number(event.x) || 0) - this.listenerX) / 650)),
      pitch: 0.97 + this.randomVariation() * 0.06,
      level: 0.94 + this.randomVariation() * 0.12,
      at: delay,
    };
    const tone = (frequency, endFrequency, duration, volume, type, offset) =>
      this.tone(frequency, endFrequency, duration, volume, type, offset, options);
    const burst = (duration, volume, cutoff, offset = 0) =>
      this.burst(duration, volume, cutoff, { ...options, delay: offset });
    try {
      if (event.type === "shot") {
        burst(0.018, event.special ? 0.10 : 0.025, 4300);
        tone(event.kind === 'medal' ? 960 : 520, 260, 0.16, event.special ? 0.045 : 0.016, 'sine', 0.018);
        tone(
          event.kind === "air" ? 150 : event.kind === "medal" ? 650 : 420,
          event.kind === "air" ? 60 : 170,
          0.075,
          event.special ? 0.2 : 0.08,
          "triangle",
        );
        if (event.special) burst(0.11, 0.17, 1800);
      } else if (event.type === "hit") {
        const heavy = (event.power || 0) > 600;
        this.dangerUntil = Math.max(this.dangerUntil, now + (heavy ? 1.3 : 0.65));
        burst(0.018, heavy ? 0.10 : 0.04, 4200);
        tone(heavy ? 78 : 260, heavy ? 38 : 120, heavy ? 0.26 : 0.18,
          heavy ? 0.075 : 0.03, 'sine', 0.035);
        burst(
          heavy ? 0.13 : 0.075,
          heavy ? 0.24 : 0.15,
          heavy ? 950 : 1700,
        );
        tone(
          heavy ? 105 : 180,
          45,
          heavy ? 0.18 : 0.11,
          heavy ? 0.22 : 0.13,
        );
      } else if (event.type === "jump") {
        burst(0.025, 0.023, 1500);
        tone(
          event.air ? 380 : 260,
          event.air ? 640 : 460,
          0.065,
          0.045,
          "sine",
        );
      } else if (event.type === "special") {
        this.dangerUntil = Math.max(this.dangerUntil, now + 0.9);
        burst(0.025, 0.07, 3400);
        burst(0.23, 0.05, 1150, 0.05);
        const motif={iona:[320,960,640],rook:[220,660,150],sera:[100,100,800],tavi:[720,440,880],beam:[523,659,784],pip:[440,660,1046]}[event.kind]||[250,500,700];
        motif.forEach((f,i)=>tone(f,f*(event.kind==='rook'?0.7:1.1),event.kind==='sera'?0.2:0.12,0.08,event.kind==='rook'?'sawtooth':'triangle',i*0.09));
        if(event.kind==='sera')burst(0.14,0.12,1000);
      } else if (event.type === 'edge-warning') {
        tone(880, 660, 0.12, 0.11, 'triangle');
        tone(880, 660, 0.12, 0.09, 'triangle', 0.2);
      } else if (event.type === 'ledge' || event.type === 'climb') {
        tone(event.type === 'ledge' ? 280 : 420, 680, 0.12, 0.07, 'triangle');
      } else if (event.type === 'recovery') {
        tone(230, 920, 0.3, 0.10, 'triangle');
      } else if (event.type === "ringout") {
        this.dangerUntil = Math.max(this.dangerUntil, now + 1.2);
        burst(0.023, 0.10, 2100);
        [0, 7, 12].forEach((note, i) => {
          const f = 261.63 * 2 ** (note / 12);
          tone(f, f, 0.22, 0.045, 'triangle', 0.08 + i * 0.065);
        });
        tone(680, 65, 0.38, 0.18);
        tone(350, 110, 0.32, 0.12, "sine", 0.04);
      } else if (event.type === "respawn") {
        tone(300, 600, 0.15, 0.09, "sine");
        tone(450, 900, 0.13, 0.07, "sine", 0.08);
      } else if (event.type === "item" || event.type === "passive") {
        tone(500, 500, 0.11, 0.075, "sine");
        tone(750, 750, 0.13, 0.075, "sine", 0.07);
        tone(1000, 1000, 0.15, 0.065, "sine", 0.14);
      } else if (event.type === "finish") {
        this.intensity = 0.1;
        for (const [index, frequency] of [330, 440, 550, 660].entries())
          tone(frequency, frequency, 0.2, 0.1, "triangle", index * 0.105);
      } else if (event.type === "hazard") {
        tone(220, 200, 0.16, 0.07, "sine");
        tone(220, 200, 0.16, 0.07, "sine", 0.25);
      }
    } catch {
      // Audio availability never interrupts the simulation.
    }
  }

  update(state, camera = null) {
    if (camera && Number.isFinite(camera.x)) this.listenerX = camera.x;
    if (!this.context || !state) return;
    const now = this.context.currentTime;
    if (now - this.lastMixTime >= 0.1) {
      this.lastMixTime = now;
      let effectCount = 0;
      for (const source of this.sources) if (source.bus !== 'music') effectCount += 1;
      // Crowded exchanges retain their weight without a large loudness jump.
      this.effectsBase = 0.65 / Math.sqrt(1 + Math.max(0, effectCount - 12) * 0.16);
      this.effects.gain.setTargetAtTime(this.effectsBase * (this.voice ? 0.34 : 1), now, 0.08);
    }
    const elapsed = Math.min(0.1, Math.max(1 / 120, now - this.lastUpdateTime));
    this.lastUpdateTime = now;
    const fighters = state.fighters || [];
    const load = Math.min(1, Math.max(0, ...fighters.filter(f => f.alive).map(f => (f.damage || 0) / 230)));
    const lastSeconds = state.time > 0 && state.time <= 30 ? 0.72 : 0;
    const danger = now < this.dangerUntil ? 0.9 : 0;
    const target = state.phase === "finished" ? 0.1 : Math.max(load * 0.7, lastSeconds, danger);
    this.intensity += (target - this.intensity) * (1 - Math.exp(-elapsed * 3));
  }

  music(arena) {
    this.musicArena = arena;
    if (!this.context || this.musicTimer || this.offline) return;
    this.musicBeat = 0;
    this.musicNextTime = this.context.currentTime + 0.025;
    this.musicTimer = setInterval(() => this.scheduleMusic(), 50);
    this.scheduleMusic();
  }

  scheduleMusic() {
    if (!this.ready || !this.musicArena) return;
    const now = this.context.currentTime;
    if (this.musicNextTime < now) this.musicNextTime = now + 0.025;
    while (this.musicNextTime < now + 0.13) {
      this.musicBeatAt(this.musicNextTime, this.musicBeat++);
      this.musicNextTime += 0.24;
    }
  }

  musicBeatAt(when, beat) {
    const scores = {
      deck: [0, 7, 12, 7, 3, 7, 10, 7], gravity: [0, 6, 7, 12, 0, 6, 10, 7],
      yard: [0, 10, 7, 3, 12, 7, 15, 10], studio: [0, 4, 7, 12, 11, 7, 4, 7],
      airlock: [0, 0, 7, 3, 0, 10, 6, 7], broadcast: [0, 7, 12, 16, 14, 12, 7, 12],
    };
    const notes = scores[this.musicArena] || scores.deck;
    const base = this.musicArena === "yard" ? 146.83 : this.musicArena === "gravity" ? 110 : 130.81;
    const note = notes[beat % notes.length], f = base * 2 ** (note / 12);
    const at = Math.max(0, when - this.context.currentTime);
    const options = { bus: "music", at, pan: Math.sin(beat * 0.7) * 0.22 };
    this.tone(f, f, 0.20, 0.045, this.musicArena === "studio" ? "triangle" : "sine", 0, options);
    if (beat % 4 === 0) this.tone(base / 2, base / 2, 0.38, 0.055, "triangle", 0, { ...options, pan: 0 });
    if (this.intensity > 0.3 && beat % 2 === 0) {
      this.tone(92, 39, 0.1, 0.06, "sine", 0, { ...options, pan: 0 });
      this.tone(f * 2, f * 2, 0.15, 0.018, "triangle", 0.12, { ...options, pan: -options.pan });
    }
    if (this.intensity > 0.6) {
      this.burst(0.035, 0.018, beat % 2 ? 4600 : 2200, { ...options, pan: beat % 2 ? 0.3 : -0.3 });
      if (beat % 4 === 2) this.tone(f * 1.5, f * 1.5, 0.18, 0.025, "triangle", 0.06, options);
    }
    if (this.musicArena === "broadcast" && beat % 2 === 0)
      this.burst(0.045, 0.022, 2400, options);
  }

  async ui(kind = "tap") {
    if (!this.enabled || !this.context) return;
    if (!this.offline && this.context.state !== 'running') {
      try { await this.context.resume(); } catch { return; }
    }
    if (!this.enabled) return;
    const now = this.context.currentTime;
    if (now - (this.lastCue.get("ui") ?? -1) < 0.035) return;
    this.lastCue.set("ui", now);
    const f = kind === "close" ? 560 : 760;
    this.tone(f, kind === "close" ? 420 : 1060, 0.045, 0.035, "sine", 0, { allowPaused: true });
    this.burst(0.012, 0.018, 3100, { allowPaused: true });
    clearTimeout(this.uiSuspendTimer);
    if (!this.offline && this.paused) this.uiSuspendTimer = setTimeout(() => {
      if (this.paused) this.context.suspend().catch(() => {});
    }, 140);
  }

  medal() {
    if (!this.ready) return;
    this.burst(0.025, 0.06, 2900);
    this.tone(210, 110, 0.11, 0.09);
    this.tone(880, 840, 0.31, 0.055, "sine", 0.018);
    this.tone(1320, 1260, 0.24, 0.025, "sine", 0.026);
  }

  duck(playing) {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.effects.gain.setTargetAtTime(this.effectsBase * (playing ? 0.34 : 1), now, playing ? 0.025 : 0.06);
    this.musicBus.gain.setTargetAtTime(playing ? 0.25 : this.musicBase, now, playing ? 0.02 : 0.14);
  }

  fanfare() {
    if (!this.ready) return;
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
    this.duck(false);
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
      gain.gain.value = 0.42;
      node.connect(gain);
      gain.connect(this.master);
      const voice = { node, gain, text, source, audio: url.href };
      this.voice = voice;
      this.lastVoiceAt = performance.now();
      this.duck(true);
      node.onended = () => {
        node.disconnect();
        gain.disconnect();
        if (this.voice === voice) {
          this.voice = null;
          this.duck(false);
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

  stats() {
    let peak = 0, sum = 0;
    this.meter?.getFloatTimeDomainData(this.meterSamples);
    for (const sample of this.meterSamples) {
      peak = Math.max(peak, Math.abs(sample));
      sum += sample * sample;
    }
    return {
      activeSources: this.sources.size, cachedVoices: this.voiceCache.size,
      intensity: this.intensity, musicBeat: this.musicBeat, ducked: Boolean(this.voice),
      effectsGain: this.effects?.gain.value, musicGain: this.musicBus?.gain.value,
      peakDbFS: 20 * Math.log10(Math.max(peak, 1e-9)),
      rmsDbFS: 10 * Math.log10(Math.max(sum / this.meterSamples.length, 1e-18)),
    };
  }

}
