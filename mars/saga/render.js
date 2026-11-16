import {drawArchitecture,setMachineImages,drawCaretaker} from "./encounters.js";
import { ROOMS, ROOM_WIDTH, FLOOR, roomExits } from "./world.js";
import { drawDrawn, preloadDrawn } from "./runtime/drawn.js";
import {drawExploreMotion,drawLandingDust} from './motion-k1c.js';
import {PUZZLES,drawPuzzle,drawPuzzleForeground} from './puzzles-k1c.js';
export const images = {};
export function loadImage(name, path = `assets/${name}.webp`) {
  if (images[name]) return Promise.resolve(images[name]);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      images[name] = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = path;
  });
}
export async function loadZone(zone) {
  const name =
    zone === "clock"
      ? "clock-panorama"
      : zone === "academy"
        ? "academy-panorama"
        : `world-${zone === "hangar" ? "yard" : "deck"}`;
  await Promise.all([loadImage(name),...[1,2,3].map(i=>loadImage(`k1c-${zone}-${i}`)),loadImage(`foreground-k1c-${zone}`)]);
  return name;
}
export async function prepareActors(ids = ["iona"]) {
  await preloadDrawn(ids, { all: true });
  // Decode both body sheets while the scene is still preparing. The first
  // climb then uses the same ready pixels as ordinary idle and running.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.translate(128, 220);
  for (const id of ids) {
    for (const pose of ["idle", "climb"]) {
      drawDrawn(
        context,
        { id, index: 0, grounded: true, facing: 1, action: pose },
        { pose, time: 0, aim: false, reduced: true, key: `prepare-${id}` },
      );
    }
  }
  context.getImageData(0, 0, 256, 256);
}
function rounded(ctx, x, y, w, h, r = 8) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function line(ctx, x, y, a, b, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(a, b);
  ctx.stroke();
}
function text(
  ctx,
  content,
  x,
  y,
  size = 18,
  color = "#f6e8ce",
  align = "left",
) {
  ctx.font = `500 ${size}px Barlow, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  // Clamp world lettering to the current viewport at draw time. Canvas clipping
  // alone cuts off meaningful words when the close camera reaches a room edge.
  const t=ctx.getTransform(),screenW=ctx.canvas.width/Math.max(.01,t.a),half=ctx.measureText(content).width/2;
  const left=-t.e/Math.max(.01,t.a)+10,right=left+screenW-20;
  if(align==='center'&&content.length>4)x=Math.max(left+half,Math.min(right-half,x));
  ctx.fillText(content, x, y);
}
function background(ctx, image, w, h) {
  if (!image) return;
  const scale = Math.max(w / image.width, h / image.height);
  ctx.drawImage(
    image,
    (w - image.width * scale) / 2,
    (h - image.height * scale) / 2,
    image.width * scale,
    image.height * scale,
  );
}
function challengeActorBounds(p,reduced){
  // The swing is hand-anchored: its feet can be to either side and below p.y.
  // Use the drawn destination rectangles, including facing and the outer 1.22,
  // rather than the physics capsule. Other transitions reserve all four phases.
  const pose=p.ledge?'ledge':p.action,rects=[];
  const phases=pose==='swing'?[reduced?0:Math.min(3,Math.max(0,Math.round(((p.vx||0)/430+1)*1.5)))]:[0,1,2,3];
  for(const phase of phases){
    const art=images[`iona-k1c-${pose}-${phase}`];if(!art)continue;
    const unit=pose==='crawl'?.34:.325,width=art.width*unit,height=art.height*unit;
    let left,top;
    if(pose==='swing'){left=-[.94,.69,.32,.38][phase]*width;top=-70;}
    else if(pose==='crawl'){left=-width*.48;top=-height;}
    else if(pose==='ledge'){left=-width*.82+18;top=-70;}
    else if(pose==='climb'){left=-width*.46;top=-height+[72,52,24,0][phase];}
    else continue;
    const a=left*1.22*(p.facing||1),b=(left+width)*1.22*(p.facing||1),offset=p.ledge?70*.22:0;
    rects.push({left:p.x+Math.min(a,b)-8,right:p.x+Math.max(a,b)+8,top:p.y+top*1.22+offset-8,bottom:p.y+(top+height)*1.22+offset+8});
  }
  if(!rects.length)return {left:p.x-110,right:p.x+110,top:p.y-180,bottom:p.y+35};
  return {left:Math.min(...rects.map(a=>a.left)),right:Math.max(...rects.map(a=>a.right)),top:Math.min(...rects.map(a=>a.top)),bottom:Math.max(...rects.map(a=>a.bottom))};
}
export class SagaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.camera = 0;
    this.room = -1;
    this.width = 0;
    this.height = 0;
    this.frames = [];
    this.last = 0;
    this.metrics = {};
  }
  resize() {
    const box = this.canvas.getBoundingClientRect();
    this.width = box.width;
    this.height = box.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.25);
    const w = Math.round(box.width * ratio),
      h = Math.round(box.height * ratio);
    if (w !== this.canvas.width || h !== this.canvas.height) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.ratio = ratio;
  }
  begin() {
    this.resize();
    this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    this.ctx.fillStyle = "#091b27";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  drawExplore(state, time) {
    this.begin();
    const ctx = this.ctx,
      w = this.width,
      h = this.height,
      r = ROOMS[state.room],
      p = state.player;
    const bg =
      r.zone === "clock"
        ? "clock-panorama"
        : r.zone === "academy"
          ? "academy-panorama"
          : `world-${r.zone === "hangar" ? "yard" : "deck"}`;
    const variant=r.id%4;
    background(ctx, images[variant?`k1c-${r.zone}-${variant}`:bg]||images[bg], w, h);
    const shade = ctx.createLinearGradient(0, 0, 0, h);
    shade.addColorStop(0, "#071e3566");
    shade.addColorStop(0.5, "#071e3510");
    shade.addColorStop(1, "#07131be8");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
    const touch = matchMedia("(pointer:coarse)").matches,
      landscape = w > h;
    const inset = touch && landscape ? 125 : 0,
      safeHeight = touch && !landscape ? h - 95 : h;
    const bossView=r.id===16&&!state.midbossComplete&&!landscape&&p.x>430;
    let scale = bossView ? h/(8*110*1.22)*1.03 : safeHeight / (landscape ? 560 : 600);
    const challengeView=[7,35].includes(r.id);
    let challengeFrame=null;
    if(challengeView){
      const anchors=r.anchors||[r.anchor],stage=Math.min(anchors.length-1,state.puzzles?.[r.id]?.stage||0),next=anchors[stage],completed=Boolean(state.puzzles?.[r.id]?.complete);
      const safeTop=Math.max(landscape?78:92,this.noticeBottom||0)+10,safeBottom=touch?(landscape?h-20:h-158):h-30;
      const minScale=h/((landscape?7:8)*110*1.22)*1.03;
      const safeLeft=inset+12,safeRight=w-inset-12,actor=challengeActorBounds(p,state.settings.reduced);
      let minX=completed?actor.left:Math.min(actor.left,next.x-24),maxX=completed?actor.right:Math.max(actor.right,next.x+24);
      let minY=completed?actor.top:Math.min(actor.top,next.y-26,p.rope?.y??Infinity),maxY=actor.bottom;
      const pad=r.platforms.filter(a=>a.x>p.x+80&&a.y>=p.y-120).sort((a,b)=>a.x-b.x)[0];
      if(pad&&(Math.max(maxX,pad.x+pad.w)-minX)*minScale<safeRight-safeLeft&&(Math.max(maxY,pad.y+12)-Math.min(minY,pad.y-12))*minScale<safeBottom-safeTop){maxX=Math.max(maxX,pad.x+pad.w);minY=Math.min(minY,pad.y-12);maxY=Math.max(maxY,pad.y+12);}
      scale=Math.max(minScale,Math.min(scale,(safeBottom-safeTop)/(maxY-minY),(safeRight-safeLeft)/(maxX-minX)));
      challengeFrame={safeTop,safeBottom,safeLeft,safeRight,minX,maxX,minY,maxY,next,pad,actor,completed};
    }
    const visible = (w - inset * 2) / scale;
    let target = Math.max(
      0,
      Math.min(ROOM_WIDTH - visible, bossView ? Math.min((p.x+945)/2-visible/2,p.x-70/scale) : p.x - visible * 0.43),
    );
    if(challengeFrame)target=visible>=ROOM_WIDTH?(ROOM_WIDTH-visible)/2:Math.max(0,Math.min(ROOM_WIDTH-visible,(challengeFrame.minX+challengeFrame.maxX-visible)/2));
    if (this.room !== state.room) {
      this.camera = target;
      this.room = state.room;
    } else this.camera += (target - this.camera) * 0.14;
    if(challengeFrame){
      const f=challengeFrame,lo=f.maxX-(f.safeRight-inset)/scale,hi=f.minX-(f.safeLeft-inset)/scale;
      // A remote next grip can exceed the view at the required figure size.
      // Keep the entire current pose visible first; never average Iona offscreen.
      const bodyLo=f.actor.right-(f.safeRight-inset)/scale,bodyHi=f.actor.left-(f.safeLeft-inset)/scale;
      this.camera=Math.max(lo<=hi?lo:bodyLo,Math.min(lo<=hi?hi:bodyHi,this.camera));
    }
    let viewY=touch&&landscape?(h-106)/scale-p.y+Math.min(0,p.y-440)*.25:h*.68/scale-p.y;
    if(challengeFrame){const f=challengeFrame;viewY=(f.safeTop+(f.safeBottom-f.safeTop-(f.maxY-f.minY)*scale)/2)/scale-f.minY;
      const lo=f.safeTop/scale-f.actor.top,hi=f.safeBottom/scale-f.actor.bottom;
      viewY=Math.max(lo,Math.min(hi,viewY));
    }
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(
      inset / scale - this.camera,
      viewY,
    );
    setMachineImages(images);
    drawArchitecture(ctx,r,state,time);
    if(r.zone==='clock'){
      for(const p of r.platforms.filter(a=>a.y===600)){
        ctx.save();ctx.beginPath();ctx.rect(p.x,625,p.w,260);ctx.clip();
        ctx.fillStyle='#0c2830';ctx.fillRect(p.x,625,p.w,260);
        for(let x=p.x;x<p.x+p.w;x+=240){ctx.fillStyle='#254249';ctx.fillRect(x+10,645,215,210);ctx.fillStyle='#486568';ctx.fillRect(x+28,662,177,160);ctx.fillStyle='#b39357';ctx.fillRect(x+10,638,215,7);ctx.fillStyle='#233940';ctx.fillRect(x+45,684,143,118);ctx.fillStyle='#ddbf76';ctx.fillRect(x+50,680,133,4);ctx.fillStyle='#122f37';ctx.fillRect(x+66,805,109,35);}
        ctx.restore();
      }
    }
    for (const platform of r.platforms) {
      if(platform.y<590&&images['architecture-catwalk']){
        const art=images['architecture-catwalk'];
        const tileH=36,tileW=tileH*art.width/art.height;
        ctx.save();ctx.beginPath();ctx.rect(platform.x-5,platform.y-10,platform.w+10,tileH);ctx.clip();
        for(let x=platform.x-5;x<platform.x+platform.w+5;x+=tileW)ctx.drawImage(art,x,platform.y-10,tileW,tileH);
        ctx.restore();
        ctx.fillStyle=r.zone==='clock'?'#bb9b62':'#d6d1b6';ctx.fillRect(platform.x,platform.y,platform.w,6);
        continue;
      }
      ctx.fillStyle = "#0b1a24";
      rounded(ctx, platform.x - 2, platform.y - 3, platform.w + 4, 26, 5);
      ctx.fill();
      ctx.fillStyle = r.zone === "clock" ? "#a7834b" : "#d8cfb5";
      rounded(ctx, platform.x, platform.y, platform.w, 12, 3);
      ctx.fill();
      ctx.fillStyle = r.zone === "clock" ? "#3b6670" : "#456075";
      ctx.fillRect(platform.x + 5, platform.y + 12, platform.w - 10, 12);
      for (let x = platform.x + 20; x < platform.x + platform.w - 12; x += 55)
        line(ctx, x, platform.y + 17, x + 22, platform.y + 17, "#aab7ad55", 2);
      if (platform.y < 550) {
        line(
          ctx,
          platform.x + 15,
          platform.y + 25,
          platform.x + 50,
          platform.y + 70,
          "#0b1a24",
          8,
        );
        line(
          ctx,
          platform.x + platform.w - 15,
          platform.y + 25,
          platform.x + platform.w - 50,
          platform.y + 70,
          "#0b1a24",
          8,
        );
      }
    }
    if(r.id===16)drawCaretaker(ctx,state,time);
    drawPuzzle(ctx,r,state,time);
    if (r.gap) {
      for (const x of [r.gap[0] - 12, r.gap[0] + r.gap[1] + 12]) {
        ctx.fillStyle = "#eaab5b";
        ctx.fillRect(x, 590, 7, 40);
      }
      if(!touch)text(
        ctx,
        "RECOVERY NET BELOW",
        r.gap[0] + r.gap[1] / 2,
        745,
        16,
        "#86a4b5",
        "center",
      );
    }
    if (state.tether || r.id === 6) {
      for(const {x,y} of r.anchors||[r.anchor]){
      line(ctx, x, y - 30, x, y, "#d1c7a8", 5);
      ctx.fillStyle = "#f5b36e";
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f5c57a55";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 23, 0, Math.PI * 2);
      ctx.stroke();
      }
      if (p.rope) line(ctx, p.x, p.y - 70*1.22, p.rope.x, p.rope.y, "#f4d29a", 4);
    }
    for (const exit of roomExits(r.id, state)) {
      if(images['architecture-arch']){const art=images['architecture-arch'],ah=168,aw=ah*art.width/art.height;ctx.drawImage(art,exit.x-aw/2,432,aw,ah);}
      ctx.fillStyle = exit.locked ? "#4d4337" : "#173e4b";
      rounded(ctx, exit.x - 28, 480, 56, 120, 12);
      ctx.fill();
      line(
        ctx,
        exit.x - 22,
        492,
        exit.x - 22,
        587,
        exit.locked ? "#bb9860" : "#8cd8d0",
        4,
      );
      text(
        ctx,
        exit.shortcut ? "↕" : exit.side === "left" ? "‹" : "›",
        exit.x,
        554,
        37,
        exit.locked ? "#ad9470" : "#caeee0",
        "center",
      );
      if (exit.shortcut)
        text(ctx, exit.label, exit.x, 464, 16, "#c2d8cd", "center");
    }
    if (r.save) {
      ctx.fillStyle = "#3f938f";
      rounded(ctx, 135, 565, 40, 32, 5);
      ctx.fill();
      ctx.fillStyle = "#d2e8cf";
      ctx.fillRect(145, 573, 20, 3);
      text(ctx, "REST", 155, 551, 14, "#adcbc5", "center");
    }
    const challenge = r.puzzle?null:r.challenges[state.tasks?.[r.id] || 0];
    if (challenge) {
      ctx.fillStyle = "#b4d4c6";
      rounded(ctx, challenge.x - 20, challenge.y - 50, 40, 48, 5);
      ctx.fill();
      line(
        ctx,
        challenge.x - 10,
        challenge.y - 35,
        challenge.x + 10,
        challenge.y - 35,
        "#294b56",
        4,
      );
      line(
        ctx,
        challenge.x,
        challenge.y - 75,
        challenge.x,
        challenge.y - 60,
        "#eab778",
        3,
      );
      text(
        ctx,
        challenge.label,
        challenge.x,
        challenge.y - 90,
        16,
        "#f3d7a2",
        "center",
      );
    }
    if (r.id === 3 || state.carryingCrate) {
      const x = state.carryingCrate ? p.x + 22 : state.crate.x,
        y = state.carryingCrate ? p.y - 35 : state.crate.y;
      ctx.fillStyle = "#9a9d85";
      rounded(ctx, x - 22, y - 40, 44, 38, 4);
      ctx.fill();
      line(ctx, x - 14, y - 33, x + 14, y - 12, "#283c43", 4);
    }
    if (
      (r.seal && !state.seals.includes(r.id)) ||
      (r.id === 6 && !state.tether)
    ) {
      const x = r.id === 6 ? 550 : r.sealX,
        y = r.id === 6 ? 595 : r.sealY;
      ctx.fillStyle = "#d9aa61";
      rounded(ctx, x - 30, y - 60, 60, 60, 8);
      ctx.fill();
      line(ctx, x - 20, y - 40, x + 18, y - 40, "#172c35", 3);
      line(ctx, x, y - 50, x, y - 15, "#172c35", 3);
      text(
        ctx,
        r.id === 6 ? "RECOVERY LINE" : "INSPECT",
        x,
        y - 77,
        17,
        "#f6d7a1",
        "center",
      );
    }
    if (r.collectible && !state.notes.includes(r.id)) {
      const y =
        r.collectibleY +
        (state.settings.reduced ? 0 : Math.sin(time * 2.5) * 4);
      ctx.save();
      ctx.translate(r.collectibleX, y);
      ctx.rotate(-0.08);
      ctx.fillStyle = r.secret ? "#f0b571" : "#b6dcd2";
      rounded(ctx, -13, -17, 26, 34, 3);
      ctx.fill();
      line(ctx, -6, -7, 7, -7, "#26414b", 2);
      line(ctx, -6, 0, 5, 0, "#26414b", 2);
      ctx.restore();
    }
    if (r.hazard) {
      const cycle = state.roomTime % 7,
        warning = cycle > 2.5 && cycle < 4,
        active = cycle > 4 && cycle < 5.25;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = warning || active ? "#f4bb67" : "#544b43";
        ctx.fillRect(725 + i * 60, 512, 35, 7);
      }
      if (warning) {
        ctx.fillStyle = "#f0a55c22";
        ctx.fillRect(700, 520, 200, 80);
        text(ctx, "SWEEP INCOMING", 800, 490, 16, "#ffd09a", "center");
      }
      if (active) {
        ctx.fillStyle = "#9ed6d9aa";
        rounded(ctx, 700, 550, 200, 20, 8);
        ctx.fill();
      }
    }
    if (
      r.npc &&
      !(r.npc === "pip" && !state.flightComplete) &&
      r.npc !== "iona"
    ) {
      ctx.save();
      ctx.translate(r.npcX, r.npcY);
      drawDrawn(
        ctx,
        {
          id: r.npc,
          index: 2,
          x: r.npcX,
          y: r.npcY,
          facing: p.x < r.npcX ? -1 : 1,
          grounded: true,
          vx: 0,
          action: "idle",
        },
        {
          time,
          reduced: state.settings.reduced,
          aim: false,
          key: `npc-${r.id}`,
        },
      );
      ctx.restore();
      text(ctx, "···", r.npcX, r.npcY-137, 25, "#d2c4a7", "center");
    }
    if (r.id === 20) {
      if (images["flight-moth-small"])
        ctx.drawImage(images["flight-moth-small"], 755, 410, 230, 150);
      text(ctx, "MOTH / READY TO RECEIVE", 860, 400, 17, "#d6d2bd", "center");
    }
    if ([23, 25, 26, 27].includes(r.id)) {
      ctx.save();ctx.translate((r.contactX||550)-550,(r.contactY||600)-600);
      const active = state.contacts.includes(r.id);
      ctx.fillStyle = active ? "#edc981" : "#46676c";
      rounded(ctx, 515, 495, 70, 100, 4);
      ctx.fill();
      for (let i = 0; i < 3; i++)
        ctx.fillRect(605 + i * 17, 520, 8, i === 2 ? 34 : 15);
      if (r.id === 27) {
        ctx.fillStyle = "#e6bc7955";
        ctx.fillRect(625, 295, 180, 300);
        text(ctx, "THE HELD INTERVAL", 715, 275, 19, "#f1d39c", "center");
      }
      ctx.restore();
    }
    ctx.fillStyle = "#66c9cf28";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 3, 36, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    drawLandingDust(ctx,p,time,state.settings.reduced);
    ctx.save();
    ctx.shadowColor="#9ae0d5";ctx.shadowBlur=state.settings.reduced?0:7;
    ctx.translate(p.x, p.y);
    if(p.ledge)ctx.translate(0,70*.22);
    ctx.scale(1.22,1.22);
    if (!drawExploreMotion(ctx,p,time,images,state.settings.reduced)) {
      const pose = images[`iona-${p.action}`];
      if (pose && ["brace"].includes(p.action)) {
        const unit = 110 / 690;
        const anchors = {
          swing: [143, 93],
          crawl: [70, 310],
          climb: [52, 675],
          brace: [385, 608],
        };
        const [ax, ay] = anchors[p.action];
        ctx.scale(p.facing, 1);
        ctx.drawImage(
          pose,
          -ax * unit,
          -ay * unit - (p.action === "swing" ? 70 : 0),
          pose.width * unit,
          pose.height * unit,
        );
      } else
        {
        if(p.action==='land'&&!state.settings.reduced){const k=Math.max(0,p.actionTime/.14);ctx.scale(1+k*.06,1-k*.1);}
        drawDrawn(
          ctx,
          { ...p, id: "iona", index: 0, jumps: 1 },
          {
            time,
            reduced: state.settings.reduced,
            aim: false,
            platforms: r.platforms,
            key: "player",
          },
        );
        }
    }
    ctx.restore();
    drawPuzzleForeground(ctx,r,state,time);
    let lampSource=null;
    if(r.dark){
      lampSource={x:p.x,y:p.y-80};
      if(r.id===38){const q=state.puzzles?.[38],stations=PUZZLES[38].stations,stand=stations.find(a=>a.kind==='cradle'&&q?.loads?.[a.id]?.includes('lamp'));const loose=stations.find(a=>a.id==='lamp');lampSource=q?.carry==='lamp'?{x:p.x+22,y:p.y-55}:stand?{x:stand.x,y:stand.y-38}:{x:loose.x,y:loose.y-38};}
      const light=ctx.createRadialGradient(lampSource.x,lampSource.y,75,lampSource.x,lampSource.y,330);light.addColorStop(0,'#020c1000');light.addColorStop(.55,'#020c1040');light.addColorStop(1,'#020c10eb');ctx.fillStyle=light;ctx.fillRect(this.camera-600,-1000,2500,2400);
    }
    ctx.restore();
    const foreground=images[`foreground-k1c-${r.zone}`];
    if(foreground){
      const fw=w*1.08,fh=fw*foreground.height/foreground.width;
      const floorScreen=(600+viewY)*scale;
      const x=(w-fw)/2-(state.settings.reduced?0:Math.sin(this.camera/700)*12),y=floorScreen-fh*.92;
      ctx.save();ctx.globalAlpha=.74;
      // Only the outer pipe/cable strips and the bottom railing can enter the
      // foreground. The generated central haze is never composited over play.
      ctx.beginPath();ctx.rect(x,y,fw*.20,fh);ctx.rect(x+fw*.80,y,fw*.20,fh);
      ctx.rect(x,y+fh*.88,fw*.18,fh*.12);ctx.rect(x+fw*.82,y+fh*.88,fw*.18,fh*.12);ctx.clip();
      ctx.drawImage(foreground,x,y,fw,fh);
      ctx.restore();
    }
    const challengeIndicators=[];
    if(challengeFrame){
      const f=challengeFrame;
      for(const goal of [...(!f.completed?[{name:'GRIP',x:f.next.x,y:f.next.y,color:'#ffd89a'}]:[]),...(f.pad?[{name:'PAD',x:f.pad.x+f.pad.w/2,y:f.pad.y,color:'#afe5dd'}]:[])]){
        const gx=inset+(goal.x-this.camera)*scale,gy=(goal.y+viewY)*scale;
        if(gx>=f.safeLeft+10&&gx<=f.safeRight-10&&gy>=f.safeTop+10&&gy<=f.safeBottom-10)continue;
        const x=Math.max(f.safeLeft+31,Math.min(f.safeRight-31,gx)),y=Math.max(f.safeTop+24,Math.min(f.safeBottom-24,gy));
        const angle=Math.atan2(gy-y,gx-x);
        ctx.save();ctx.translate(x,y);ctx.fillStyle='#091e30ee';ctx.strokeStyle=goal.color;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-28,-19,56,38,8);ctx.fill();ctx.stroke();
        ctx.save();ctx.translate(0,-7);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-7,-4);ctx.lineTo(2,-4);ctx.lineTo(2,-8);ctx.lineTo(10,0);ctx.lineTo(2,8);ctx.lineTo(2,4);ctx.lineTo(-7,4);ctx.closePath();ctx.fillStyle=goal.color;ctx.fill();ctx.restore();
        ctx.font='600 11px Barlow, sans-serif';ctx.fillStyle=goal.color;ctx.textAlign='center';ctx.fillText(goal.name,0,14);ctx.restore();
        challengeIndicators.push({name:goal.name,x,y,targetX:gx,targetY:gy});
      }
    }
    this.metrics = {
      camera: this.camera,
      scale,
      actorScale:1.22,
      playerHeight: 110 * 1.22 * scale,
      playerScreenX:inset+(p.x-this.camera)*scale,playerScreenY:(p.y+viewY)*scale,
      nextAnchor:challengeFrame?{x:inset+(challengeFrame.next.x-this.camera)*scale,y:(challengeFrame.next.y+viewY)*scale,id:challengeFrame.next.id}:null,
      playerBounds:challengeFrame?{left:inset+(challengeFrame.actor.left-this.camera)*scale,right:inset+(challengeFrame.actor.right-this.camera)*scale,top:(challengeFrame.actor.top+viewY)*scale,bottom:(challengeFrame.actor.bottom+viewY)*scale}:null,
      challengeSafe:challengeFrame?{left:challengeFrame.safeLeft,right:challengeFrame.safeRight,top:challengeFrame.safeTop,bottom:challengeFrame.safeBottom}:null,challengeIndicators,lampSource,
      room: state.room,
      width: w,
      height: h,
    };
  }
  drawDuel(state,time,settings={}) {
    if(!this.arenaRenderer)return;
    this.arenaRenderer.reduced=settings.reduced;
    this.arenaRenderer.draw(state.match,1/60);
    // Diagnostics should not allocate a stats tree on every displayed frame.
    if(!this.duelMetricTime||time-this.duelMetricTime>.25){const m=this.arenaRenderer.stats();this.metrics={...m,width:this.arenaRenderer.width,height:this.arenaRenderer.height,playerHeight:m.fighters?.find(f=>f.index===0)?.height};this.duelMetricTime=time;}
  }
}
