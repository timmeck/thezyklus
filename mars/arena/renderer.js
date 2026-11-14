import { CHARACTERS, ARENAS, BOUNDS } from "./engine.js";

export const PLAYER_COLORS = ["#ff8160", "#83d7eb", "#d3a4ed", "#b9dc80"];
export const ARENA_BACKGROUNDS = Object.freeze({
  deck: "assets/world-deck.webp",
  gravity: "assets/world-gravity.webp",
  yard: "assets/world-yard.webp",
  studio: "assets/world-studio.webp",
  airlock: "assets/world-airlock.webp",
});
const characters = Object.fromEntries(
  CHARACTERS.map((character) => [character.id, character]),
);
const clamp = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, value));
const lerp = (a, b, amount) => a + (b - a) * amount;
const assets = new Map();

function loadImage(url) {
  if (assets.has(url)) return assets.get(url);
  const entry = { image: new Image(), ready: false };
  entry.image.onload = () => {
    entry.ready = true;
  };
  entry.image.src = url;
  assets.set(url, entry);
  return entry;
}

export function preloadArt() {
  for (const character of CHARACTERS)
    {loadImage('assets/'+character.id+'-atlas.webp');loadImage('assets/'+character.id+'-motion.webp');}
}

function polygon(context, points, fill, stroke, width = 2) {
  context.beginPath();
  context.moveTo(...points[0]);
  for (const point of points.slice(1)) context.lineTo(...point);
  context.closePath();
  if (fill) {
    context.fillStyle = fill;
    context.fill();
  }
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = width;
    context.stroke();
  }
}

function line(context, x1, y1, x2, y2, color, width = 2) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function star(context, x, y, radius, color, rotation = 0) {
  const points = [];
  for (let i = 0; i < 16; i++) {
    const angle = rotation + (i * Math.PI) / 8;
    const r = i % 2 ? radius * 0.36 : radius;
    points.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r]);
  }
  polygon(context, points, color, "#102735", 2);
}

export class Renderer {
  constructor(canvas, { preview = false, reduced = false } = {}) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: false });
    this.preview = preview;
    this.reduced = reduced;
    this.width = 0;
    this.height = 0;
    this.ratio = 1;
    this.camera = { x: 0, y: -20, scale: 0.7 };
    this.effects = [];
    this.shake = 0;
    this.flash = 0;
    this.lastTick = -1;
    this.clock = 0;
    this.previousPositions = new Map();
    this.motionStates = new Map();
    this.spriteShadows = new Map();
    this.dangerUntil = 0;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  resize() {
    const box = this.canvas.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;
    this.width = box.width;
    this.height = box.height;
    const css=getComputedStyle(document.documentElement),safe=name=>parseFloat(css.getPropertyValue(name))||0;
    const touch=document.documentElement.dataset.input==='touch',portrait=this.width<this.height;
    this.safeTop=safe('--safe-top')+(portrait?112:74);
    this.safeLeft=safe('--safe-left');this.safeRight=safe('--safe-right');
    this.safeBottom=safe('--safe-bottom')+(touch?(portrait?128:104):28);
    this.ratio = Math.min(
      devicePixelRatio || 1,
      this.preview ? 1 : matchMedia("(pointer:coarse)").matches ? 1.25 : 1.5,
      this.ratioCap||2,
    );
    const width=Math.round(this.width*this.ratio),height=Math.round(this.height*this.ratio);
    if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;this.cameraInitialized=false;}
  }

  reset() {
    this.effects = [];this.closeup=null;this.medalRain=0;
    this.previousPositions.clear();
    this.motionStates.clear();
    this.dangerUntil = 0;
    this.cameraInitialized = false;
    this.lastTick = -1;
    this.camera = {
      x: 0,
      y: -20,
      scale: Math.min(this.width / 1400, this.height / 780),
    };
    this.shake = 0;
    this.flash = 0;
  }

  events(events) {
    for (const event of events) {
      const position = { x: event.x || 0, y: event.y || 0 };
      if (event.type === "hit") {
        this.dangerUntil = this.clock + 0.85;
        this.shake = Math.max(
          this.shake,
          Math.min(16, 5 + (event.power || 0) * 0.018),
        );
        this.flash = 0.055;
        if(event.power>600 && !this.reduced && !this.preview)this.closeup={player:event.target,life:0.38,total:0.38};
        const words = ["PAK!", "THOOM!", "KRAK!", "WHUMP!"];
        this.effects.push({
          ...position,
          type: "impact",
          life: 0.45,
          total: 0.45,
          power: event.power || 200,
          word: words[(event.tick + event.target) % words.length],
          angle: ((event.tick % 9) - 4) * 0.08,
        });
        for (let i = 0; i < 9; i++)
          this.effects.push({
            ...position,
            type: "spark",
            life: 0.28,
            total: 0.28,
            vx: Math.cos(i * 2.399 + event.tick) * ((i % 3) * 90 + 100),
            vy: Math.sin(i * 2.399 + event.tick) * ((i % 3) * 90 + 100),
            color: i % 2 ? "#f0b64f" : "#c5f4ef",
          });
      }
      if (event.type === "ringout") {
        this.shake = 18;
        if(!this.preview)this.medalRain=1.4;
        this.effects.push({
          x: clamp(position.x, -850, 850),
          y: clamp(position.y, -600, 650),
          type: "recovery",
          life: 1.3,
          total: 1.3,
          player: event.player,
        });
      }
      if (event.type === "respawn")
        this.effects.push({
          ...position,
          type: "drone",
          life: 1.1,
          total: 1.1,
          player: event.player,
        });
      if (event.type === "jump")
        this.effects.push({
          ...position,
          type: "ring",
          life: 0.3,
          total: 0.3,
          color: "#b3e8e2",
        });
      if (event.type === "special")
        { this.dangerUntil = this.clock + 0.85;
        this.effects.push({
          ...position,
          type: "special",
          kind:event.kind,
          life: 0.8,
          total: 0.8,
          player: event.player,
        }); }
      if(event.type==='passive')this.effects.push({...position,type:'pickup',word:event.kind==='salvage'?'SALVAGED!':'SECOND CHANCE',life:0.65,total:0.65});
      if (event.type === "item")
        this.effects.push({
          ...position,
          type: "pickup",
          kind: event.kind,
          player: event.player,
          life: 1.05,
          total: 1.05,
          word:
            {
              biscuit: "EMERGENCY BISCUIT",
              medal: "HEROIC MEDAL",
              tape: "SALVAGE TAPE",
              gravity: "GRAVITY SWITCH",
              repair: "REPAIRED!",
              capsule:"CAPSULE SECURED",
              delivery:"DELIVERED!",
            }[event.kind] || "RECOVERED!",
        });
    }
    if (this.effects.length > 150)
      this.effects.splice(0, this.effects.length - 150);
  }

  updateCamera(state, dt) {
    const visible = state.fighters.filter((f) => f.alive && f.respawn <= 0);
    const xs = visible.map((f) =>
      clamp(f.x, BOUNDS.left + 30, BOUNDS.right - 30),
    );
    const ys = visible.map((f) =>
      clamp(f.y - 50, BOUNDS.top + 30, BOUNDS.bottom - 80),
    );
    const minimumX = Math.min(this.preview ? -510 : -300, ...xs) - 90,
      maximumX = Math.max(this.preview ? 510 : 300, ...xs) + 90;
    const minimumY = Math.min(-175, ...ys) - 70,
      maximumY = Math.max(250, ...ys) + 45;
    const portrait = this.width / this.height < 1;
    const worldWidth = maximumX - minimumX;
    const worldHeight = maximumY - minimumY;
    const insetTop = this.preview?20:this.safeTop;
    const insetBottom = this.preview?10:this.safeBottom;
    let targetScale = Math.min(
      this.width / (worldWidth + (portrait ? 0 : 40)),
      (this.height - insetTop - insetBottom) / worldHeight,
    );
    let targetX = (minimumX + maximumX) / 2;
    const player=state.fighters.find(f=>f.controller!=="bot"&&f.alive&&f.respawn<=0)||visible[0];
    if(portrait && !this.preview && player){
      // Reserve a readable silhouette even at the widest emergency framing.
      const minScale=this.height/8/86;
      const incoming=state.projectiles.some(p=>this.incoming(p,player));
      const bounds=state.bounds||BOUNDS;
      const edge=visible.some(f=>f.x>bounds.right-150||f.x<bounds.left+150||f.y>bounds.bottom-240||f.y<bounds.top+170);
      if(incoming||edge||visible.some(f=>f.index!==player.index&&(f.charge>0||f.specialDuration>0)))this.dangerUntil=this.clock+0.65;
      const danger=this.clock<this.dangerUntil;
      targetScale=minScale*(danger?1:1.16);
      const threats=visible.filter(f=>f.index!==player.index).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x));
      const threat=threats[0];
      const look=threat?clamp((threat.x-player.x)*0.22,-this.width*.17/targetScale,this.width*.17/targetScale):0;
      targetX=player.x+look+clamp(player.vx*.07,-24,24);
      this.camera.minimumScale=minScale;
      this.camera.danger=danger;
    }
    if(!this.preview)targetScale=Math.max(targetScale,this.height/8/86);
    let targetY =
      (minimumY + maximumY) / 2 -
      (insetTop - insetBottom) / 2 / Math.max(targetScale, 0.1);
    if(portrait&&!this.preview){
      if(player)targetY=clamp(player.y-Math.min(135,this.height/(2*targetScale)-35),-300,230);
    }
    if(!this.cameraInitialized){this.camera.x=targetX;this.camera.y=targetY;this.camera.scale=targetScale;this.cameraInitialized=true;}
    const smoothing = 1 - Math.exp(-dt * (portrait?6:5));
    this.camera.x = lerp(this.camera.x, targetX, smoothing);
    this.camera.y = lerp(this.camera.y, targetY, smoothing);
    this.camera.scale = lerp(this.camera.scale, targetScale, smoothing);
    if(!this.preview&&player){
      // Safety bounds outrank smoothing: never lose the local cadet on a fast hit.
      this.camera.scale=Math.max(this.height/8/86,this.camera.scale);
      const s=this.camera.scale,margin=Math.max(38,60*s);
      this.camera.x=clamp(this.camera.x,player.x-this.width/(2*s)+(margin+this.safeRight)/s,player.x+this.width/(2*s)-(margin+this.safeLeft)/s);
      const safeTop=this.safeTop,safeBottom=this.safeBottom;
      this.camera.y=clamp(this.camera.y,player.y-this.height/(2*s)+safeBottom/s,player.y-116+this.height/(2*s)-safeTop/s);
    }
  }

  incoming(p,player){
    if(p.owner===player.index)return false;
    const dx=player.x-p.x,dy=player.y-50-p.y,v2=p.vx*p.vx+(p.vy||0)**2;
    const t=(dx*p.vx+dy*(p.vy||0))/Math.max(1,v2);
    return t>0&&t<1.3&&Math.hypot(dx-p.vx*t,dy-(p.vy||0)*t)<120;
  }

  animateBodies(state,dt){
    for(const f of state.fighters){
      const old=this.motionStates.get(f.index)||{grounded:f.grounded,vx:f.vx,shape:0,sway:0,velocity:0,tick:state.tick};
      if(old.tick!==state.tick&&dt>0){
        if(f.grounded&&!old.grounded&&f.respawn<=0){
          old.shape=-0.12;
          for(let i=0;i<(this.reduced?3:7);i++)this.effects.push({type:'dust',x:f.x+(i-3)*7,y:f.y-3,vx:(i-3)*20,vy:-12-i%3*7,life:.36,total:.36});
        }else if(!f.grounded&&old.grounded&&f.vy<0)old.shape=.085;
        old.velocity+=(clamp(-f.vx*.018,-8,8)-old.sway)*dt*55;
        old.velocity*=Math.exp(-dt*9);old.sway+=old.velocity*dt;
        old.shape*=Math.exp(-dt*13);old.grounded=f.grounded;old.vx=f.vx;old.tick=state.tick;
      }
      this.motionStates.set(f.index,old);
    }
  }

  draw(state, dt = 1 / 60) {
    if (!this.width || !this.height) return;
    const c = this.context,
      w = this.width,
      h = this.height;
    this.clock += dt;
    this.updateCamera(state, dt);
    this.animateBodies(state,dt);
    c.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    this.background(state, w, h);
    // Screen spectacle is also behind the playable silhouettes.
    this.dramaticPanels(state,dt,w,h);
    if(this.flash>0&&!this.reduced&&!this.preview){c.fillStyle=`rgba(249,236,192,${this.flash})`;c.fillRect(0,0,w,h);this.impactBorder(w,h);}
    this.flash=Math.max(0,this.flash-dt);
    const shake = this.reduced || this.preview ? 0 : this.shake;
    const shakeX = Math.sin(this.clock * 149) * shake;
    const shakeY = Math.cos(this.clock * 173) * shake * 0.65;
    this.shake *= Math.exp(-dt * 19);
    c.save();
    c.translate(w / 2 + shakeX, h / 2 + shakeY);
    c.scale(this.camera.scale, this.camera.scale);
    c.translate(-this.camera.x, -this.camera.y);
    this.arenaDetails(state);
    this.trainingArt(state);
    for (const platform of state.platforms) this.platform(platform, state);
    for (const trap of state.traps) this.trap(trap, state);
    for (const item of state.items) this.item(item, state);
    for (const fighter of state.fighters) this.trail(fighter, state);
    for (const projectile of state.projectiles)
      this.projectile(projectile, state);
    this.drawEffects(dt, state);
    for (const fighter of [...state.fighters].sort((a,b)=>Number(a.controller!=='bot')-Number(b.controller!=='bot'))) {
      this.fighter(fighter, state);
      this.aimGuide(fighter, state);
    }
    this.pickupLabels(state);
    this.boundaryArt(state);
    c.restore();
    this.foreground(state, w, h);
    this.screenEdgeFighters(state);
    this.screenEdgeShots(state);
    const vignette = c.createLinearGradient(0, 0, 0, h);
    vignette.addColorStop(0, "#071b2924");
    vignette.addColorStop(0.45, "#071b2900");
    vignette.addColorStop(1, "#071b2933");
    c.fillStyle = vignette;
    c.fillRect(0, 0, w, h);
    this.lastTick = state.tick;
  }


  aimGuide(fighter, state) {
    if (this.preview || fighter.controller === 'bot' || !fighter.alive || fighter.respawn > 0 || state.phase !== 'playing') return;
    if (!fighter.input.aimX && !fighter.input.aimY && !fighter.input.shoot && fighter.charge <= 0) return;
    const c = this.context, x = fighter.aimX, y = fighter.aimY;
    c.save();
    c.translate(fighter.x, fighter.y - 53);
    c.rotate(Math.atan2(y, x));
    c.strokeStyle = '#f7f4dc';
    c.lineWidth = 1.4 / this.camera.scale;
    c.shadowColor = '#102d3b'; c.shadowBlur = 3;
    c.globalAlpha = 0.8;
    c.beginPath(); c.moveTo(35, 0); c.lineTo(86, 0);
    c.moveTo(77, -5); c.lineTo(86, 0); c.lineTo(77, 5); c.stroke();
    c.restore();
  }

  trainingArt(state){
    const c=this.context,cam=state.cameraFeed;
    if(cam){
      const tested=['camera','final'].includes(state.lesson);
      c.save();c.globalAlpha=tested?0.13:0.035;
      polygon(c,[[cam.x-40,-440],[cam.x+40,-440],[cam.x+cam.width/2,300],[cam.x-cam.width/2,300]],'#f7cf70');
      c.globalAlpha=tested?0.8:0.3;c.strokeStyle='#f7cf70';c.lineWidth=2;c.setLineDash([8,10]);c.strokeRect(cam.x-cam.width/2,-300,cam.width,580);c.setLineDash([]);
      c.font='600 14px Condensed';c.fillStyle='#ffe4a2';c.textAlign='center';c.fillText('VICTORY WINDOW / IN FRAME',cam.x,-310);
      c.fillStyle='#d9694c';c.fillRect(cam.x-17,-365,34,22);c.fillStyle='#142e3e';c.fillRect(cam.x-11,-360,15,10);
      c.restore();
    }
    for(const p of state.scrap||[]){c.fillStyle='#c9c9b8';c.fillRect(p.x-5,p.y-9,10,8);line(c,p.x-6,p.y-9,p.x+8,p.y-3,'#d69959',3);}
    if(state.lesson==='rescue'){
      const t=state.training,f=state.fighters[0],x=t.carrying?f.x-25:t.capsule.x,y=t.carrying?f.y-15:t.capsule.y;
      c.save();c.strokeStyle='#86e5e3';c.lineWidth=3;c.strokeRect(t.bayX-65,state.platforms[0].y-55,130,55);
      c.fillStyle='#86e5e3';c.font='600 16px Condensed';c.textAlign='center';c.fillText('RECOVERY BAY',t.bayX,state.platforms[0].y+53);
      if(t.carrying)line(c,f.x,f.y-48,x,y-35,'#ee8c5b',3);
      polygon(c,[[x-17,y],[x+17,y],[x+17,y-39],[x+10,y-48],[x-10,y-48],[x-17,y-39]],'#f3c552','#143343',3);
      c.fillStyle='#163c4c';c.fillRect(x-10,y-34,20,17);c.fillStyle='#b6e8dd';c.fillRect(x-6,y-30,12,7);
      if(!t.carrying){c.fillStyle='#f5d180';c.fillText('PRACTICE CAPSULE',x,y-64);}c.restore();
    }
    if(!this.preview){
      c.save();c.fillStyle='#e5dbc2';c.font='600 13px Condensed';c.textAlign='center';
      const y=state.platforms[0].y+85;c.fillText('TRAINING ONLY — PROBABLY',0,y);
      c.font='500 10px Barlow';c.fillText('Free travel. Landing sold separately.',0,y+17);c.restore();
    }
  }

  signatureArt(effect,state,fraction){
    const c=this.context,f=state.fighters[effect.player],kind=effect.kind,d=f?.facing||1;
    const x=f?.x??effect.x,y=(f?.y??effect.y)-50,r=25+(1-fraction)*115;
    c.save();c.translate(x,y);c.lineWidth=4;c.globalAlpha=.68;
    if(kind==='iona'){
      c.strokeStyle='#f5b393';c.beginPath();c.arc(0,0,r,-2.8,0.8);c.stroke();
      line(c,-d*85,70,d*85,-110,'#f4bd88',5);star(c,d*85,-110,22,'#fbdbc0');
      for(let i=0;i<3;i++)line(c,-d*(40+i*23),40+i*10,-d*(65+i*23),80+i*10,'#f6a568',3);
    }else if(kind==='rook'){
      polygon(c,[[-d*15,-15],[-d*(190+80*(1-fraction)),100],[-d*90,-3],[-d*100,-45]],'#72d9f599');
      polygon(c,[[-d*12,-14],[-d*160,75],[-d*40,0]],'#e9ffff');
      for(let i=0;i<4;i++)line(c,-d*(70+i*37),-20,-d*(50+i*37),30,'#80def4',5);
    }else if(kind==='sera'){
      c.rotate(Math.atan2(f?.aimY || 0, f?.aimX ?? d) - (d < 0 ? Math.PI : 0));
      for(let i=0;i<3;i++){const q=r+i*28;c.strokeStyle=i%2?'#f2ead7':'#a8e5f1';c.beginPath();c.ellipse(d*(60+i*25),0,q*0.3,q*0.7,0,-1.5,1.5);c.stroke();}
      line(c,d*35,0,d*230,0,'#f3f7e7',7);
    }else if(kind==='tavi'){
      c.strokeStyle='#8de9b0';c.setLineDash([8,10]);c.beginPath();c.ellipse(0,30,r,r*0.4,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
      for(let i=0;i<8;i++){const a=i*Math.PI/4+state.tick*.04;c.save();c.translate(Math.cos(a)*r,30+Math.sin(a)*r*.45);c.rotate(a);c.fillStyle='#a5dab3';c.fillRect(-7,-4,14,8);c.restore();}
    }else if(kind==='beam'||kind==='counter'){
      polygon(c,[[-35,-280],[35,-280],[155,80],[-155,80]],'#f6ce6855');
      for(let i=0;i<7;i++){const a=i*Math.PI*2/7;star(c,Math.cos(a)*r,Math.sin(a)*r,r*.16,'#ffe2a0',a);}
    }else if(kind==='pip'){
      for(let j=0;j<2;j++){const q=r+j*15;const pts=Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*q,Math.sin(i*Math.PI/3)*q]);polygon(c,pts,j?'#74dee711':null,'#a1f4f0',3);}
      line(c,0,60,0,-100,'#c2f7f3',3);
    }
    c.restore();
  }

  dramaticPanels(state,dt,w,h){
    const c=this.context;
    if(this.closeup&&this.closeup.life>0&&!this.reduced&&!this.preview){
      this.closeup.life-=dt;const f=state.fighters[this.closeup.player],face=f&&loadImage('assets/'+f.id+'.webp');
      if(face?.ready){
        const pw=Math.min(220,w*.31),ph=Math.min(115,h*.22),x=w-pw-10,y=h*.13;
        c.save();polygon(c,[[x+18,y],[x+pw,y],[x+pw,y+ph],[x,y+ph]],'#f1d9a6','#112735',4);c.clip();
        c.drawImage(face.image,0,face.image.height*.30,face.image.width,face.image.height*.60,x,y,pw,ph);c.restore();
        for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,w/2+Math.cos(a)*w*.38,h/2+Math.sin(a)*h*.38,w/2+Math.cos(a)*w*.7,h/2+Math.sin(a)*h*.7,'#f3e3b488',2);}
      }
    }
    if(this.medalRain>0){
      this.medalRain=Math.max(0,this.medalRain-dt);
      c.save();c.globalAlpha=Math.min(1,this.medalRain*2);
      for(let i=0;i<(this.reduced?6:18);i++){const x=((i*137)%w),y=((1.4-this.medalRain)*210+i*47)%(h+40)-20;star(c,x,y,5+(i%3)*2,'#f3ca6a',i+this.clock);}
      const beam=loadImage('assets/beam.webp');const size=Math.min(80,w*.12);
      if(beam.ready)c.drawImage(beam.image,w-size-18,h-size-20,size,size);
      c.fillStyle='#f3d27b';c.font='600 16px Condensed';c.textAlign='right';c.fillText('RECOVERED. OF COURSE.',w-18,h-size-30);c.restore();
    }
  }

  background(state, w, h) {
    const c = this.context, art = loadImage(ARENA_BACKGROUNDS[state.arena]);
    const key = [state.arena, this.canvas.width, this.canvas.height, art.ready].join('/');
    const margin = 48;
    if (this.backgroundKey !== key) {
      this.backgroundCache = document.createElement('canvas');
      this.backgroundCache.width = Math.round((w + margin * 2) * this.ratio);
      this.backgroundCache.height = Math.round((h + margin * 2) * this.ratio);
      const back = this.backgroundCache.getContext('2d', {alpha:false});
      back.setTransform(this.ratio,0,0,this.ratio,0,0);
      const bw = w + margin * 2, bh = h + margin * 2;
      back.fillStyle = '#345463';back.fillRect(0,0,bw,bh);
      if (art.ready) {
        const scale = Math.max(bw / art.image.width, bh / art.image.height);
        const dw = art.image.width * scale, dh = art.image.height * scale;
        back.drawImage(art.image,(bw-dw)/2,(bh-dh)/2,dw,dh);
      }
      // A uniform cool veil preserves fine architecture and a quiet combat plane.
      back.fillStyle = state.arena === 'studio' ? '#102b3c65' : '#102b3c38';
      back.fillRect(0,0,bw,bh);
      this.backgroundKey = key;
    }
    const px = this.reduced ? 0 : clamp(this.camera.x * .035,-32,32);
    const py = this.reduced ? 0 : clamp(this.camera.y * .025,-28,28);
    c.drawImage(this.backgroundCache,-margin-px,-margin-py,w+margin*2,h+margin*2);
    this.livingBackground(state,w,h);
    if (this.flash > 0) {
      c.fillStyle = `rgba(7,24,36,${Math.min(.26,this.flash)})`;
      c.fillRect(0,0,w,h);
    }
  }

  livingBackground(state,w,h) {
    const c = this.context, t = this.reduced ? 0 : this.clock;
    const px = this.reduced ? 0 : clamp(this.camera.x*.07,-45,45);
    c.save();c.translate(-px,0);
    // Fine suspended dust, restrained enough to keep projectile shapes distinct.
    c.fillStyle = '#d7f0e92b';
    for (let i=0;i<16;i++) {
      const x = (i*137 + t*(3+i%4))%(w+40)-20;
      const y = (i*83 + Math.sin(t*.2+i)*12)%h;
      c.fillRect(x,y,1.5,1.5);
    }
    if (state.arena === 'gravity') {
      c.save();c.translate(w*.5,h*.38);c.rotate(t*.035);
      c.strokeStyle = state.hazard.phase==='warning'?'#ffd58d88':'#a6e1d438';
      c.lineWidth=3;
      c.beginPath();c.ellipse(0,0,w*.25,h*.36,0,0,Math.PI*2);c.stroke();
      for(let i=0;i<16;i++) {
        const a=i*Math.PI/8;
        line(c,Math.cos(a)*w*.24,Math.sin(a)*h*.35,Math.cos(a)*w*.26,Math.sin(a)*h*.38,'#c2f2df66',3);
      }
      c.restore();
    }
    if (state.arena === 'studio') {
      // Distinct audience rows, camera tally and two slowly tracking followspots.
      for(let row=0;row<2;row++) for(let i=0;i<14;i++) {
        const x=w*.12+i*w*.058,y=h*(.70+row*.065)+Math.sin(t*1.7+i)*2;
        c.fillStyle=i%3?'#0d263f88':'#32516b99';
        c.beginPath();c.ellipse(x,y,4,5,0,0,Math.PI*2);c.fill();
        c.fillRect(x-5,y+4,10,10);
      }
      c.globalAlpha=.06;
      for(const side of [-1,1]) {
        const x=w*(side<0?.12:.88),tip=w*.5+Math.sin(t*.22+side)*w*.15;
        polygon(c,[[x,0],[tip-w*.12,h*.8],[tip+w*.12,h*.8]],'#ffe8af');
      }
      c.globalAlpha=1;
    }
    if (state.arena === 'yard' || state.arena === 'deck') {
      const x=((t*10+w*.73)%(w+180))-90,y=h*.18+Math.sin(t*.17)*12;
      c.save();c.translate(x,y);c.scale(.7,.7);
      polygon(c,[[-32,0],[-13,-12],[31,-10],[40,2],[22,12],[-26,12]],'#b4b9b1','#182f42',2);
      c.fillStyle='#10293d';c.fillRect(-8,-7,24,9);
      line(c,-28,8,-41,8,'#8ce8ed',4);c.restore();
    }
    const droneX=w*.2+Math.sin(t*.23)*w*.08,droneY=h*.29+Math.sin(t*.7)*8;
    c.save();c.translate(droneX,droneY);
    c.fillStyle='#8faaa9';c.fillRect(-10,-6,20,12);
    c.strokeStyle='#294557';c.lineWidth=2;c.strokeRect(-10,-6,20,12);
    c.fillStyle=Math.floor(t*2)%2?'#f5a36d':'#a94f42';c.fillRect(-3,-3,6,5);
    line(c,-8,6,-13,13,'#9db4b2',2);line(c,8,6,13,13,'#9db4b2',2);
    c.restore();
    if (state.arena === 'airlock' && state.hazard.phase === 'active') {
      for(let i=0;i<14;i++) {
        const x=((i*83+t*180*state.hazard.direction)%(w+150)+w+150)%(w+150)-75;
        line(c,x,(i*73)%h,x+state.hazard.direction*45,(i*73)%h-5,'#e3d7a444',2);
      }
    }
    c.restore();
  }

  foreground(state,w,h) {
    const c=this.context,shift=this.reduced?0:clamp(this.camera.x*.11,-18,18);
    const accent={deck:'#75dce2',gravity:'#91e6ba',yard:'#ed9a64',studio:'#f2cf7d',airlock:'#e8b65d'}[state.arena];
    // Close structural ribs stay outside the usable fighting area.
    c.save();
    for(const side of [-1,1]) {
      const x=side<0?-9-shift:w+9-shift;
      polygon(c,[[x,0],[x-side*18,0],[x-side*10,h*.30],[x-side*5,h*.75],[x-side*20,h],[x,h]],'#0c2639cc');
      line(c,x-side*14,h*.35,x-side*9,h*.48,accent+'77',2);
    }
    const warning=state.fighters.some(f=>f.controller!=='bot'&&f.alive&&f.respawn<=0&&state.tick-f.edgeWarningTick<90);
    if(warning) {
      c.strokeStyle='#ffd580';c.lineWidth=4;c.setLineDash([18,10]);
      c.globalAlpha=this.reduced?.8:.55+Math.sin(this.clock*8)*.2;
      c.strokeRect(3,3,w-6,h-6);
      c.setLineDash([]);c.globalAlpha=1;
      c.fillStyle='#102b3ee8';c.fillRect(w/2-94,h*.2-16,188,30);
      c.fillStyle='#ffe0a0';c.font='600 18px Condensed';c.textAlign='center';
      c.fillText('BOUNDARY / JUMP TO RECOVER',w/2,h*.2+4);
    }
    c.restore();
  }

  boundaryArt(state) {
    const c=this.context,b=state.bounds;
    c.save();c.lineWidth=3/this.camera.scale;c.setLineDash([14,14]);
    c.strokeStyle='#f4bd6555';
    for(const x of [b.left+100,b.right-100])line(c,x,-700,x,b.bottom-100,'#f4bd6555',3/this.camera.scale);
    line(c,b.left+100,b.bottom-160,b.right-100,b.bottom-160,'#f4bd6555',3/this.camera.scale);
    c.restore();
  }

  arenaDetails(state) {
    const c = this.context;
    c.globalAlpha = 0.23;
    c.strokeStyle = "#aadad7";
    c.lineWidth = 1;
    c.setLineDash([12, 16]);
    c.strokeRect(-730, -390, 1460, 920);
    c.setLineDash([]);
    c.globalAlpha = 1;
    for (const x of [-700, 700]) {
      line(c, x, 270, x, 475, "#101f2c", 10);
      polygon(
        c,
        [
          [x - 48, 455],
          [x + 48, 455],
          [x + 32, 475],
          [x - 32, 475],
        ],
        "#728d8e",
        "#0b2430",
        3,
      );
      c.fillStyle = "#d79850";
      c.fillRect(x - 18, 281, 36, 8);
    }
    c.save();
    c.globalAlpha = 0.35;
    c.fillStyle = "#c2d6c9";
    c.font = "600 16px Condensed,sans-serif";
    c.textAlign = "center";
    const arena = ARENAS.find((a) => a.id === state.arena);
    c.fillText(arena.subtitle + " / RECOVERY SERVICE", 0, 420);
    c.restore();
  }

  platform(p, state) {
    const c = this.context;
    if (!p.active) {
      c.save();
      c.globalAlpha = 0.15;
      c.setLineDash([10, 9]);
      c.strokeStyle = "#ecc07f";
      c.lineWidth = 2;
      c.strokeRect(p.x, p.baseY, p.w, 20);
      c.restore();
      return;
    }
    const warning =
      p.warning && (!this.reduced ? Math.floor(state.tick / 10) % 2 : 1);
    const top = warning ? "#f6b559" : p.kind==='recovery' ? '#c5e1c5' : "#e2ddc7";
    polygon(
      c,
      [
        [p.x, p.y],
        [p.x + p.w, p.y],
        [p.x + p.w + 9, p.y + 13],
        [p.x + p.w - 10, p.y + 35],
        [p.x + 10, p.y + 35],
        [p.x - 9, p.y + 13],
      ],
      "#223d4a",
      "#0b202b",
      4,
    );
    polygon(
      c,
      [
        [p.x, p.y - 4],
        [p.x + p.w, p.y - 4],
        [p.x + p.w + 7, p.y + 8],
        [p.x - 7, p.y + 8],
      ],
      top,
      "#102735",
      2,
    );
    c.fillStyle = "#5c797c";
    c.fillRect(p.x + 8, p.y + 11, p.w - 16, 13);
    c.fillStyle = warning ? "#e75c35" : "#6bd6db";
    c.fillRect(p.x + 20, p.y + 14, Math.max(10, p.w - 40), 3);
    for (let x = p.x + 22; x < p.x + p.w - 10; x += 75) {
      line(c, x, p.y + 24, x + 8, p.y + 33, "#0c2632", 2);
      c.fillStyle = "#b6bda7";
      c.fillRect(x, p.y + 11, 4, 4);
    }
    for (const x of [p.x + 8, p.x + p.w - 35]) {
      polygon(
        c,
        [
          [x, p.y - 3],
          [x + 23, p.y - 3],
          [x + 29, p.y + 7],
          [x + 6, p.y + 7],
        ],
        "#d46b43",
      );
      line(c, x + 9, p.y - 2, x + 17, p.y + 7, "#203844", 3);
    }
    if (p === state.platforms[0]) {
      polygon(c,[[p.x+10,p.y+35],[p.x+p.w-10,p.y+35],[p.x+p.w-42,p.y+76],[p.x+42,p.y+76]],'#162f40','#0b202b',3);
      for(let x=p.x+48;x<p.x+p.w-60;x+=100) {
        line(c,x,p.y+39,x+40,p.y+70,'#466878',5);
        line(c,x+40,p.y+70,x+80,p.y+39,'#466878',5);
      }
      line(c,p.x+45,p.y+77,p.x+p.w-45,p.y+77,'#7bdcdd88',3);
    }
    if (p.kind === 'pad') {
      c.fillStyle=state.hazard.phase==='active'?'#78d0bb':'#c0c9ac';
      for(let x=p.x+14;x<p.x+p.w-14;x+=24)c.fillRect(x,p.y+10,18,9);
    }
    if (p.kind === "drift") {
      const pulse = 3 + Math.sin(state.tick * 0.1) * 2;
      c.fillStyle = "#74dae3";
      c.beginPath();
      c.ellipse(p.x + p.w * 0.25, p.y + 38, 13, pulse, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(p.x + p.w * 0.75, p.y + 38, 13, pulse, 0, 0, Math.PI * 2);
      c.fill();
    }
    if (p.w > 700) {
      c.fillStyle = "#a8baaf";
      c.font = "600 13px Condensed,sans-serif";
      c.textAlign = "center";
      c.fillText(
        state.arena === "studio"
          ? "THE FLOOR IS PART OF THE SHOW"
          : "CAUTION / MARTIAN LEGS",
        p.x + p.w / 2,
        p.y + 27,
      );
    }
  }

  fighter(f, state) {
    const c = this.context;
    if (!f.alive) return;
    if (f.respawn > 0) {
      const t = state.tick / 60;
      const s=this.camera.scale,cam=this.camera;
      const x=clamp(f.x,cam.x-this.width/(2*s)+47/s,cam.x+this.width/(2*s)-47/s);
      const y=clamp(f.y,cam.y-this.height/(2*s)+175/s,cam.y+this.height/(2*s)-30/s);
      this.drone(
        x,
        y - 142 + (this.reduced?0:Math.sin(t * 4) * 3),
        PLAYER_COLORS[f.index],
      );
      c.save();
      c.setLineDash([4, 6]);
      line(c, x, y - 125, x, y - 102, "#a1d3d6", 2);
      c.setLineDash([]);
      const atlas=loadImage('assets/'+f.id+'-atlas.webp');
      if(atlas.ready){c.shadowColor=PLAYER_COLORS[f.index];c.shadowBlur=9;c.drawImage(atlas.image,0,0,256,256,x-57,y-110,114,114);c.shadowBlur=0;}
      c.font='600 12px Condensed';c.textAlign='center';c.strokeStyle='#102735';c.lineWidth=3;c.fillStyle=PLAYER_COLORS[f.index];
      const label='P'+(f.index+1)+' / RECOVERING '+f.respawn.toFixed(1)+'s';c.strokeText(label,x,y+18);c.fillText(label,x,y+18);
      c.restore();
      return;
    }
    const color = PLAYER_COLORS[f.index];
    if (f.ledge) {
      const p=state.platforms.find(p=>p.id===f.ledge.id);
      if(p) {
        const x=f.ledge.side<0?p.x:p.x+p.w;
        line(c,f.x,f.y-58,x,p.y-3,'#c4f2dc',4);
        c.fillStyle='#d6ecda';c.fillRect(x-6,p.y-5,12,8);
        if(f.controller!=='bot') {
          c.font='600 14px Condensed';c.textAlign='center';c.strokeStyle='#102735';c.lineWidth=4;
          const label=f.ledge.side<0?'JUMP / → CLIMB':'JUMP / ← CLIMB';
          c.strokeText(label,f.x,f.y+25);c.fillStyle='#e6f2d9';c.fillText(label,f.x,f.y+25);
        }
      }
    }
    if (f.recoveryTime > 0) {
      c.save();c.globalAlpha=Math.min(.8,f.recoveryTime*2);
      if(f.id==='pip') {
        c.strokeStyle='#a7eee4';c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y-48,44,64,0,0,Math.PI*2);c.stroke();
      } else if(f.id==='iona') {
        line(c,f.x-12,f.y-48,f.x-55,f.y-130,'#f3aa7c',3);
      } else {
        polygon(c,[[f.x-20,f.y-25],[f.x-8,f.y+70],[f.x+8,f.y+5],[f.x+20,f.y-25]],f.id==='beam'?'#f2d18299':'#8be9ef99');
        line(c,f.x,f.y-10,f.x,f.y+45,'#e7ffef',4);
      }
      c.restore();
    }
    if (f.grounded) {
      c.fillStyle = "#061e2f55";
      c.beginPath();
      c.ellipse(f.x, f.y + 2, 31, 6, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = color + "aa";
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(f.x, f.y + 3, 27, 5, 0, 0, Math.PI * 2);
      c.stroke();
    }
    if (f.invulnerable > 0 || f.counter > 0) {
      c.save();
      c.globalAlpha = f.counter > 0 ? 0.4 : 0.2;
      c.strokeStyle = f.counter > 0 ? "#f0c777" : color;
      c.lineWidth = 3;
      c.fillStyle = color + "22";
      c.beginPath();
      c.ellipse(f.x, f.y - 48, 39, 65, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.restore();
    }
    if (f.id === "beam" && f.counter > 0) {
      c.save();
      c.globalAlpha = 0.18;
      polygon(
        c,
        [
          [f.x, f.y - 80],
          [f.x + f.facing * 290, f.y - 165],
          [f.x + f.facing * 290, f.y + 45],
        ],
        "#ffe09a",
      );
      c.globalAlpha = 0.7;
      star(c, f.x + f.facing * 24, f.y - 79, 17, "#f6d478", state.tick * 0.1);
      c.restore();
    }
    if (f.id === "rook" && f.specialDuration > 0) {
      const length = 35 + Math.sin(state.tick * 1.5) * 12;
      polygon(
        c,
        [
          [f.x - f.facing * 14, f.y - 65],
          [f.x - f.facing * length, f.y - 30],
          [f.x - f.facing * 19, f.y - 48],
        ],
        "#6edbe8",
        "#12313e",
        2,
      );
      polygon(
        c,
        [
          [f.x - f.facing * 15, f.y - 62],
          [f.x - f.facing * (length * 0.7), f.y - 35],
          [f.x - f.facing * 18, f.y - 49],
        ],
        "#edffff",
      );
    }
    if (f.grapple) {
      const sway=this.reduced?0:(this.motionStates.get(f.index)?.sway||0)*2;
      c.strokeStyle='#b8eeeb';c.lineWidth=2;c.beginPath();c.moveTo(f.x,f.y-58);c.quadraticCurveTo((f.x+f.grapple.x)/2+sway,(f.y-58+f.grapple.y)/2+14,f.grapple.x,f.grapple.y);c.stroke();
      star(c, f.grapple.x, f.grapple.y, 12, "#dbe4c7");
    }
    if (f.charge > 0) {
      c.save();
      c.globalAlpha = 0.5;
      star(
        c,
        f.x + f.aimX * 40,
        f.y - 53 + f.aimY * 40,
        22 + Math.sin(state.tick * 0.8) * 5,
        "#9be0ef",
        state.tick * 0.1,
      );
      c.restore();
    }
    let atlas=loadImage('assets/'+f.id+'-atlas.webp'),frame=0;
    const motion=loadImage('assets/'+f.id+'-motion.webp');
    if(f.action==='shoot')frame=4;
    if(f.action==='hit')frame=5;
    if(f.action==='tumble')frame=6;
    if(!f.grounded)frame=3;
    if(state.phase==='finished'&&state.winner===f.index)frame=7;
    if(motion.ready){
      let mf=-1;
      if(f.action==='run'&&f.grounded){const phase=Math.floor(state.tick/5)%6;mf=[0,-1,1,2,-1,3][phase];if(phase===1)frame=1;if(phase===4)frame=2;}
      if(!f.grounded){mf=f.vy<-200?4:Math.abs(f.vy)<200?5:6;if(Math.abs(f.vy)<100&&Math.floor(state.tick/7)%2){mf=-1;frame=3;}}
      if(f.action==='land')mf=7;
      if(f.action==='hit'){mf=f.actionTime>0.23?-1:8;frame=5;}
      if(f.action==='tumble'){mf=Math.floor(state.tick/10)%2?9:-1;frame=6;}
      if(f.action==='getup')mf=f.actionTime>0.15?10:11;
      if(f.action==='shoot'){mf=-1;frame=4;}
      if((f.signatureTime||0)>0)mf=f.signatureTime>0.45?12:13;
      if(state.phase==='finished'&&state.winner===f.index){const phase=Math.floor(this.clock*1.5)%3;mf=phase===0?14:phase===2?15:-1;frame=7;}
      if(mf>=0){atlas=motion;frame=mf;}
    }
    const bob =
      f.action === "idle" && f.grounded
        ? Math.sin(this.clock * 3.8 + f.index) * 1.2
        : 0;
    c.save();
    c.translate(f.x, f.y + bob);
    c.scale(f.facing || 1, 1);
    const body=this.motionStates.get(f.index),shape=(body?.shape||0)*(this.reduced?.2:1);
    c.scale(1-shape*.65,1+shape);
    if (atlas.ready) {
      if (f.invulnerable > 0 && Math.floor(state.tick / 5) % 2)
        c.globalAlpha = 0.84;
      const sx=(frame%4)*256,sy=Math.floor(frame/4)*256;
      this.spriteShadow(atlas,frame,color,f.controller==='bot'?6:9);
      c.drawImage(atlas.image,sx,sy,256,256,-57,-110,114,114);
      // Small overlapping regions bend after the torso, preserving each drawing.
      const sway=(body?.sway||0)*(this.reduced?.15:1)*f.facing;
      if(Math.abs(sway)>.3&&f.action!=='tumble'){
        if(['iona','rook','sera'].includes(f.id)){
          c.save();c.translate(0,-89);c.rotate(sway*.004);c.drawImage(atlas.image,sx+78,sy+10,100,40,-22,-16,45,18);c.restore();
        }
        if(f.id==='beam'){
          c.save();c.translate(-18,-76);c.rotate(-sway*.008);c.drawImage(atlas.image,sx+40,sy+86,44,111,-21,0,20,50);c.restore();
        }
      }
    } else this.fallbackFighter(f, color);
    c.restore();
    if(f.action==='shoot' && f.id!=='beam' && !(f.signatureTime>0)){
      c.save();c.translate(f.x,f.y-53);c.rotate(Math.atan2(f.aimY,f.aimX));
      c.fillStyle='#e6ddc8';c.fillRect(18,-5,30,10);c.fillStyle='#112735';c.textAlign='center';c.font='600 3px Condensed';
      c.fillText('TRAINING ONLY',33,-1);c.fillText('PROBABLY',33,3);c.restore();
    }
    this.itemRings(f,state);
    if(f.controller!=='bot'&&!f.grounded&&!this.preview) {
      c.save();c.fillStyle='#0b293ddd';c.fillRect(f.x-25,f.y+12,50,12);
      for(let i=0;i<f.maxJumps;i++) {
        c.fillStyle=f.jumps<=i?'#d4eee1':'#547780';c.fillRect(f.x-20+i*10,f.y+16,6,4);
      }
      c.fillStyle=f.recoveryUsed?'#547780':'#f2ca78';c.fillRect(f.x+15,f.y+15,6,6);c.restore();
    }
    if(f.medalMass>0){
      line(c,f.x-10,f.y-78,f.x,f.y-38,"#d75d45",5);line(c,f.x+10,f.y-78,f.x,f.y-38,"#d75d45",5);
      star(c,f.x,f.y-36,15+f.medalMass*8,"#e9bc55",0.15);
    }
    if(f.onCamera && f.id==='beam' && f.damage>0){
      c.fillStyle="#f4d77b";c.font="600 17px Condensed";c.textAlign="center";c.fillText("+ GOOD LIGHTING",f.x,f.y-148);
    }
    if (f.blind > 0) {
      star(c, f.x - 17, f.y - 115, 6, "#e4c36c", state.tick * 0.1);
      star(c, f.x + 17, f.y - 108, 5, "#e4c36c", -state.tick * 0.1);
    }
    c.save();
    c.translate(f.x, f.y - 127);
    polygon(
      c,
      [
        [-10, 0],
        [10, 0],
        [7, 17],
        [0, 22],
        [-7, 17],
      ],
      color,
      "#102735",
      1.5,
    );
    c.fillStyle = "#102735";
    c.textAlign = "center";
    c.font = "600 11px Barlow,sans-serif";
    c.fillText(String(f.index + 1), 0, 12);
    if (!this.preview) {
      c.font = "600 13px Condensed,sans-serif";
      c.textAlign = "center";
      c.strokeStyle = "#102735";
      c.lineWidth = 3;
      c.strokeText(characters[f.id].name.toUpperCase(), 0, -8);
      c.fillStyle = "#f5ead4";
      c.fillText(characters[f.id].name.toUpperCase(), 0, -8);
    }
    c.restore();
  }

  spriteShadow(atlas, frame, color, blur) {
    const key = [atlas.image.src,frame,color,blur].join('/');
    let shadow = this.spriteShadows.get(key);
    if (!shadow) {
      shadow = document.createElement('canvas');
      shadow.width = shadow.height = 154;
      const c = shadow.getContext('2d');
      const sx = frame % 4 * 256, sy = Math.floor(frame / 4) * 256;
      c.shadowColor = color;c.shadowBlur = blur;
      c.drawImage(atlas.image,sx,sy,256,256,20,20,114,114);
      c.shadowBlur = 0;c.globalCompositeOperation = 'destination-out';
      c.drawImage(atlas.image,sx,sy,256,256,20,20,114,114);
      // Keep the soft rim cached and draw the original sharp sprite above it.
      if (this.spriteShadows.size >= 64) this.spriteShadows.delete(this.spriteShadows.keys().next().value);
      this.spriteShadows.set(key,shadow);
    }
    this.context.drawImage(shadow,-77,-130,154,154);
  }

  fallbackFighter(f, color) {
    const c = this.context;
    c.strokeStyle = "#d5ddce";
    c.lineWidth = 5;
    c.lineCap = "round";
    const stride = f.action === "run" ? Math.sin(this.clock * 15) * 16 : 5;
    line(c, -4, -48, -10 - stride, -3, "#102735", 10);
    line(c, 5, -48, 12 + stride, -3, "#102735", 10);
    line(c, -4, -48, -10 - stride, -3, "#bfc8b9", 2);
    line(c, 5, -48, 12 + stride, -3, "#bfc8b9", 2);
    polygon(
      c,
      [
        [-12, -83],
        [11, -83],
        [9, -43],
        [-8, -43],
      ],
      "#1c3541",
      "#ded9c2",
      2,
    );
    line(c, -10, -76, -17, -40, "#ccd8c9", 4);
    line(c, 10, -76, 29, -62, "#ccd8c9", 4);
    c.fillStyle =
      f.id === "sera" ? "#784c39" : f.id === "rook" ? "#ab7854" : "#d9b18a";
    c.beginPath();
    c.ellipse(0, -96, 10, 13, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = color;
    c.fillRect(-5, -77, 9, 4);
  }

  trail(f, state) {
    if (!f.alive || f.respawn > 0) return;
    const speed = Math.hypot(f.vx, f.vy);
    if (speed < 380) return;
    const c = this.context;
    if(!this.reduced&&!this.preview&&speed>560){
      const atlas=loadImage('assets/'+f.id+'-atlas.webp');
      if(atlas.ready){
        c.save();c.globalAlpha=.10;c.translate(f.x-f.vx*.035,f.y-f.vy*.035);c.scale(f.facing||1,1);c.drawImage(atlas.image,768,0,256,256,-57,-110,114,114);c.restore();
      }
    }
    const length = clamp(speed * 0.11, 25, 120);
    const dx = (-f.vx / speed) * length,
      dy = (-f.vy / speed) * length;
    for (let i = 0; i < 4; i++) {
      const ox = (i - 1.5) * 10,
        oy = -40 + (i % 2) * 20;
      line(
        c,
        f.x + ox + dx * 0.25,
        f.y + oy + dy * 0.25,
        f.x + ox + dx,
        f.y + oy + dy,
        PLAYER_COLORS[f.index] + (i % 2 ? "77" : "33"),
        i % 2 ? 2 : 1,
      );
    }
  }

  projectile(p, state) {
    const c = this.context;
    const owner = state.fighters[p.owner];
    const color = owner ? PLAYER_COLORS[owner.index] : "#b1edeb";
    const angle = Math.atan2(p.vy || 0, p.vx || 1);
    c.save();
    c.translate(p.x, p.y);
    c.rotate(angle);
    if (p.kind === "medal") {
      c.rotate(state.tick * 0.15);
      c.fillStyle = "#e4bc59";
      c.strokeStyle = "#624522";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, p.radius || 11, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      star(c, 0, 0, 6, "#ffdc83");
    } else {
      const size = p.radius || 8;
      c.globalAlpha = 0.3;
      polygon(
        c,
        [
          [-size * 5, -size * 0.6],
          [0, -size],
          [size, 0],
          [0, size],
          [-size * 5, size * 0.6],
        ],
        color,
      );
      c.globalAlpha = 1;
      c.fillStyle = color;
      c.strokeStyle = "#0a2633";
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(0, 0, size * 1.6, size, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      line(c, -2, -size * 0.3, size * 0.9, -size * 0.3, "#efffea", 2);
    }
    c.restore();
  }

  item(item, state) {
    const c = this.context,
      x = item.x,
      y = item.y;
    c.save();
    c.translate(x, y - 12);
    c.rotate(Math.sin(state.tick * 0.04 + item.id) * 0.08);
    c.fillStyle = "#f3df9a22";
    c.beginPath();
    c.arc(0, 0, 28, 0, Math.PI * 2);
    c.fill();
    if (item.kind === "biscuit" || item.type === "biscuit") {
      polygon(
        c,
        [
          [-14, -10],
          [13, -12],
          [16, 10],
          [-12, 12],
        ],
        "#d4a260",
        "#513e2c",
        2,
      );
      for (const [dx, dy] of [
        [-5, -4],
        [7, 3],
        [-4, 6],
      ]) {
        c.fillStyle = "#755131";
        c.beginPath();
        c.arc(dx, dy, 2, 0, Math.PI * 2);
        c.fill();
      }
    } else if (item.kind === "medal" || item.type === "medal") {
      c.fillStyle = "#de6350";
      c.fillRect(-5, -22, 10, 16);
      star(c, 0, 0, 16, "#e3bf62");
    } else if (item.kind === "tape" || item.type === "tape") {
      c.fillStyle = "#d4d4b4";
      c.beginPath();
      c.arc(0, 0, 14, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#34525a";
      c.beginPath();
      c.arc(0, 0, 6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#d4d4b4";
      c.fillRect(9, 6, 14, 6);
    } else {
      polygon(
        c,
        [
          [-13, -12],
          [13, -12],
          [13, 12],
          [-13, 12],
        ],
        "#74c5cf",
        "#10313e",
        2,
      );
      c.strokeStyle = "#193d4a";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, 7, -0.8, 3.9);
      c.stroke();
      line(c, 0, -9, 0, 0, "#193d4a", 3);
    }
    c.restore();
  }

  trap(trap, state) {
    const c = this.context;
    const color = PLAYER_COLORS[trap.owner] || "#aad9ba";
    polygon(
      c,
      [
        [trap.x - 21, trap.y],
        [trap.x + 21, trap.y],
        [trap.x + 16, trap.y - 12],
        [trap.x - 16, trap.y - 12],
      ],
      "#c6ceaf",
      "#153443",
      2,
    );
    line(c, trap.x - 9, trap.y - 12, trap.x - 9, trap.y - 22, color, 5);
    line(c, trap.x + 9, trap.y - 12, trap.x + 9, trap.y - 22, color, 5);
    if (Math.floor(state.tick / 20) % 2) {
      c.fillStyle = "#e9c469";
      c.fillRect(trap.x - 3, trap.y - 9, 6, 4);
    }
  }

  drone(x, y, color) {
    const c = this.context;
    c.save();
    c.translate(x, y);
    polygon(
      c,
      [
        [-26, -8],
        [24, -8],
        [34, 3],
        [25, 16],
        [-25, 16],
        [-34, 3],
      ],
      "#dfdecb",
      "#12313c",
      3,
    );
    c.fillStyle = "#143b4c";
    c.fillRect(-13, -3, 26, 9);
    c.fillStyle = color;
    c.fillRect(-5, -1, 10, 4);
    line(c, -20, 17, -29, 31, "#d3cbaa", 4);
    line(c, 20, 17, 29, 31, "#d3cbaa", 4);
    c.fillStyle = "#84d2d9";
    for (const dx of [-22, 22]) {
      c.beginPath();
      c.ellipse(dx, 22, 5, 11, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }

  drawEffects(dt, state) {
    const c = this.context;
    for (const effect of this.effects) {
      effect.life -= dt;
      const fraction = clamp(effect.life / effect.total, 0, 1);
      if (fraction <= 0) continue;
      c.save();
      c.globalAlpha = Math.min(1, fraction * 3);
      if (effect.type === "impact") {
        const radius = (1 - fraction) * 35 + 20;
        star(
          c,
          effect.x,
          effect.y,
          radius,
          effect.power > 500 ? "#f7cf70" : "#c8eeeb",
          effect.angle,
        );
        if (!this.preview) {
          c.translate(effect.x + 12, effect.y - 25 - (1 - fraction) * 40);
          c.rotate(effect.angle);
          c.font = `italic 600 ${30 + (1 - fraction) * 8}px Condensed,sans-serif`;
          c.lineWidth = 5;
          c.strokeStyle = "#102735";
          c.strokeText(effect.word, 0, 0);
          c.fillStyle = "#f4e4b9";
          c.fillText(effect.word, 0, 0);
        }
      }
      if (effect.type === "spark") {
        effect.x += effect.vx * dt;
        effect.y += effect.vy * dt;
        line(
          c,
          effect.x,
          effect.y,
          effect.x - effect.vx * 0.035,
          effect.y - effect.vy * 0.035,
          effect.color,
          2,
        );
      }
      if (effect.type === "ring") {
        c.strokeStyle =
          effect.color || PLAYER_COLORS[effect.player] || "#e6c780";
        c.lineWidth = 3 * fraction;
        c.beginPath();
        c.ellipse(
          effect.x,
          effect.y - 8,
          10 + (1 - fraction) * 70,
          4 + (1 - fraction) * 16,
          0,
          0,
          Math.PI * 2,
        );
        c.stroke();
      }
      if(effect.type==="special")this.signatureArt(effect,state,fraction);
      if (effect.type === "pickup") {
        // Labels have their own pass above the silhouettes.
      }
      if(effect.type==='dust'){
        effect.x+=effect.vx*dt;effect.y+=effect.vy*dt;
        c.globalAlpha=fraction*.23;c.fillStyle='#e8e0c4';c.beginPath();c.ellipse(effect.x,effect.y,7+(1-fraction)*10,3+(1-fraction)*4,0,0,Math.PI*2);c.fill();
      }
      if (effect.type === "recovery") {
        this.drone(
          effect.x,
          effect.y - (1 - fraction) * 100,
          PLAYER_COLORS[effect.player] || "#98cfcf",
        );
        if (!this.preview) {
          c.font = "italic 600 31px Condensed,sans-serif";
          c.textAlign = "center";
          c.fillStyle = "#f5d48b";
          c.fillText("RECOVERY!", effect.x, effect.y - 55);
        }
      }
      if (effect.type === "drone")
        this.drone(
          effect.x,
          effect.y - 170 - (1 - fraction) * 130,
          PLAYER_COLORS[effect.player],
        );
      c.restore();
    }
    this.effects = this.effects.filter((effect) => effect.life > 0);
  }

  impactBorder(w, h) {
    const c = this.context;
    c.save();
    c.strokeStyle = "#e9e6c677";
    c.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const x = (i * 137 + w * 0.1) % w;
      line(c, x, 0, lerp(x, w / 2, 0.14), h * 0.06, "#e9e6c677", (i % 3) + 1);
      line(c, x, h, lerp(x, w / 2, 0.14), h * 0.94, "#e9e6c677", (i % 3) + 1);
    }
    c.restore();
  }

  screenEdgeFighters(state) {
    const c = this.context;
    for (const f of state.fighters) {
      if (!f.alive || f.respawn > 0) continue;
      const x = (f.x - this.camera.x) * this.camera.scale + this.width / 2;
      const y =
        (f.y - 50 - this.camera.y) * this.camera.scale + this.height / 2;
      if (x >= 15 && x <= this.width - 15 && y >= 15 && y <= this.height - 15)
        continue;
      const cx = clamp(x, 18, this.width - 18),
        cy = clamp(y, 18, this.height - 18);
      const a=Math.atan2(y-cy,x-cx),color=PLAYER_COLORS[f.index];
      c.save();c.translate(cx,cy);c.rotate(a);polygon(c,[[13,0],[-7,-9],[-3,0],[-7,9]],color,'#102735',2);c.restore();
      c.fillStyle = "#102735";
      c.font = "600 11px Barlow,sans-serif";
      c.textAlign = "center";
      c.fillStyle=color;c.fillText('P'+(f.index+1),clamp(cx-24*Math.cos(a),18,this.width-18),clamp(cy-24*Math.sin(a),16,this.height-16)+4);
    }
  }

  screenEdgeShots(state){
    if(this.preview)return;
    const player=state.fighters.find(f=>f.controller!=='bot'&&f.alive&&f.respawn<=0)||state.fighters[0];
    if(!player)return;
    const c=this.context,used=[];
    for(const p of state.projectiles){
      if(!this.incoming(p,player))continue;
      const x=(p.x-this.camera.x)*this.camera.scale+this.width/2,y=(p.y-this.camera.y)*this.camera.scale+this.height/2;
      if(x>=12&&x<=this.width-12&&y>=12&&y<=this.height-12)continue;
      const px=clamp(x,24,this.width-24),py=clamp(y,30,this.height-24);
      if(used.some(q=>Math.hypot(px-q.x,py-q.y)<36))continue;
      used.push({x:px,y:py});const a=Math.atan2(p.vy||0,p.vx||0);
      c.save();c.translate(px,py);c.rotate(a);polygon(c,[[-12,-8],[0,0],[-12,8],[9,0]],'#fff1c6','#e96949',3);c.restore();
      c.fillStyle='#fff1c6';c.strokeStyle='#102735';c.lineWidth=3;c.textAlign='center';c.font='600 10px Condensed';
      c.strokeText('INCOMING',clamp(px,32,this.width-32),py+22);c.fillText('INCOMING',clamp(px,32,this.width-32),py+22);
    }
  }

  pickupLabels(state){
    const c=this.context;
    for(const e of this.effects.filter(e=>e.type==='pickup')){
      const f=state.fighters[e.player],x=f?.x??e.x,y=(f?.y??e.y)-153-(1-e.life/e.total)*15;
      c.save();c.globalAlpha=Math.min(1,e.life*4);c.textAlign='center';c.font='600 15px Condensed';
      const text=e.word,w=c.measureText(text).width+30;
      c.fillStyle='#102735ee';c.fillRect(x-w/2,y-16,w,24);c.strokeStyle='#efce79';c.lineWidth=1;c.strokeRect(x-w/2,y-16,w,24);
      if(e.kind){c.save();c.translate(x-w/2+12,y-4);c.scale(.36,.36);this.item({kind:e.kind,x:0,y:12,id:0},state);c.restore();}
      c.fillStyle='#f8e3a8';c.fillText(text,x+(e.kind?7:0),y+1);c.restore();
    }
  }

  itemRings(f,state){
    const active=(f.itemEffects||[]).map(e=>({...e,remaining:Math.min(e.remaining,e.kind==='medal'?f.invulnerable:e.kind==='tape'?f.slow:state.gravityBoost)})).filter(e=>e.remaining>0);
    if(!active.length)return;
    const c=this.context;
    active.slice(0,3).forEach((e,i)=>{
      const x=f.x+31+i*16,y=f.y-106,r=7;
      c.fillStyle='#102735';c.beginPath();c.arc(x,y,r+2,0,Math.PI*2);c.fill();
      c.strokeStyle=e.kind==='tape'?'#e3dec4':e.kind==='gravity'?'#8ae0ed':'#efc969';c.lineWidth=2;
      c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(e.remaining/e.duration,0,1));c.stroke();
      c.fillStyle='#f3e9ce';c.font='600 7px Condensed';c.textAlign='center';c.fillText(e.kind==='medal'?'M':e.kind==='tape'?'T':'G',x,y+2.5);
    });
  }
}
