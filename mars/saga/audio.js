import {scoreBeat} from "./score.js";
// Procedural score and effects with recorded dialogue and a tonal fallback.
export class SagaAudio {
  constructor() {
    this.enabled = true;
    this.zone = "academy";
    this.nextBeat = 0;
    this.beat = 0;
    this.danger = false;
  }
  async start() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.36;
      this.compressor=this.context.createDynamicsCompressor();this.compressor.threshold.value=-14;this.compressor.ratio.value=3;
      this.master.connect(this.compressor);this.compressor.connect(this.context.destination);
      this.capture = this.context.createMediaStreamDestination();
      this.compressor.connect(this.capture);
      this.noise=this.context.createBuffer(1,this.context.sampleRate,this.context.sampleRate);
      const data=this.noise.getChannelData(0);let seed=2705;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
    }
    await this.context.resume();
    this.nextBeat = this.context.currentTime;
  }
  setEnabled(value) {
    this.enabled = value;
    if (!value) this.stopLine();
    if (this.master)
      this.master.gain.setTargetAtTime(
        value ? 0.36 : 0,
        this.context.currentTime,
        0.1,
      );
  }
  tone(frequency, duration = 0.15, volume = 0.1, type = "sine", delay = 0) {
    if (!this.context || !this.enabled) return;
    const time = this.context.currentTime + delay,
      oscillator = this.context.createOscillator(),
      gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume * (this.speaking ? 0.42 : 1), time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }
  update(zone, danger = false) {
    this.zone = zone;
    this.danger = danger;
    if (!this.context || !this.enabled || this.context.state !== "running")
      return;
    scoreBeat(this,zone,danger);
  }

  drum(kind,delay=0,volume=.08){
    if(!this.context||!this.enabled)return;
    volume *= this.speaking ? 0.42 : 1;
    if(kind==='kick'){
      const t=this.context.currentTime+delay,o=this.context.createOscillator(),g=this.context.createGain();
      o.frequency.setValueAtTime(115,t);o.frequency.exponentialRampToValueAtTime(38,t+.15);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.24);return;
    }
    const t=this.context.currentTime+delay,source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),gain=this.context.createGain();
    source.buffer=this.noise;filter.type='highpass';filter.frequency.value=kind==='hat'?6500:1400;
    gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.0001,t+(kind==='hat'?.055:.16));
    source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start(t);source.stop(t+.2);
  }
  effect(type) {
    const heavy=['hit','bump','ringout','module-cleared','catch-hit','midboss','shield','disabled','sweep'].includes(type);
    if(heavy){this.drum('kick',0,type==='ringout'?.28:.17);this.drum('snare',.015,.09);}

    const notes = {
      jump: [300, 500],
      line: [180, 730],
      note: [523, 784],
      seal: [440, 659],
      contact: [164.81, 246.94],
      save: [330, 440],
      bump: [95, 60],
      recover: [240, 330],
      shortcut: [392, 587],
      tether: [392, 784],
      shot: [880, 640],
      rescue: [440, 880],
    };
    const pair = notes[type] || ({hit:[90,55],ringout:[160,440],special:[220,660],disabled:[220,440],shield:[150,480],"catch-hit":[110,550],"module-cleared":[330,660],midboss:[392,784],warning:[220,220]})[type];
    if (!pair) return;
    this.tone(pair[0], 0.1, 0.12, "triangle");
    this.tone(pair[1], 0.2, 0.055, "sine", 0.05);
  }
  voice(speaker) {
    const frequency =
      { iona: 330, rook: 180, tavi: 220, sera: 146, pip: 270, beam: 240 }[
        speaker
      ] || 220;
    this.tone(frequency, 0.09, 0.06, "triangle");
    this.tone(frequency * 1.18, 0.11, 0.035, "sine", 0.08);
  }
  stopLine() {
    this.lineToken = (this.lineToken || 0) + 1;
    this.lineAbort?.abort();
    this.lineAbort = null;
    if (this.lineSource) {
      this.lineSource.onended = null;
      try {
        this.lineSource.stop();
      } catch {}
      this.lineSource.disconnect();
    }
    this.lineGain?.disconnect();
    this.lineGain = null;
    this.lineSource = null;
    this.speaking = false;
  }
  async say(url, speaker) {
    this.stopLine();
    if (!this.enabled) return false;
    if (!url) {
      this.voice(speaker);
      return false;
    }
    const token = this.lineToken;
    this.speaking = true;
    try {
      this.lineBuffers ||= new Map();
      let buffer = this.lineBuffers.get(url);
      if (!buffer) {
        const controller = new AbortController();
        this.lineAbort = controller;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Voice unavailable');
        buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        if (token !== this.lineToken) return false;
        this.lineBuffers.set(url, buffer);
      }
      if (token !== this.lineToken || !this.enabled) return false;
      this.lineAbort = null;
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.value = 0.8;
      source.connect(gain);
      gain.connect(this.master);
      this.lineSource = source;
      this.lineGain = gain;
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (token === this.lineToken) {
          this.speaking = false;
          this.lineSource = null;
          this.lineGain = null;
        }
      };
      source.start();
      return true;
    } catch {
      if (token === this.lineToken) {
        this.lineAbort = null;
        this.speaking = false;
        this.voice(speaker);
      }
      return false;
    }
  }
}
