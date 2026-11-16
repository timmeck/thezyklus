import {ROOMS} from './world.js';
import {puzzleCollision,puzzleState,foamSurface,puzzlePlatforms} from './puzzles-k1c.js';
export function liftAt(s){const l=ROOMS[s.room].lift;return l?{...l,y:s.room===10&&!puzzleState(s)?.flags.loaded?560:455+Math.cos((s.roomTime||0)*.7)*105}:null;}
export function roomMechanics(s,input,dt){
 const r=ROOMS[s.room],p=s.player;
 s.openSecrets ||= [];s.defeated ||= [];s.machineState ||= {};
 const t=s.roomTime||0;
 for(const l of puzzlePlatforms(s).filter(l=>l.id.startsWith('moving'))){const old=l.y-(Math.sin(t*.8+l.phase)-Math.sin((t-dt)*.8+l.phase))*48;if(p.grounded&&Math.abs(p.y-old)<8&&p.x>l.x-12&&p.x<l.x+l.w+12)p.y+=l.y-old;}
 if(r.lift){const l=liftAt(s),old=455+Math.cos((t-dt)*.7)*105;if(p.grounded&&Math.abs(p.y-old)<8&&p.x>l.x-12&&p.x<l.x+l.w+12)p.y+=l.y-old;}
 const foamY=foamSurface(s,r);
 if(r.foam&&p.y>foamY-30&&p.x>350&&p.x<850){
  if(p.vy>110)p.vy=110;
  if(p.y>foamY){p.y=foamY;p.vy=0;p.grounded=true;}
  if(input.jumpPressed){p.vy=-660;p.grounded=false;}
 }
 if(r.secret&&s.tether&&!s.openSecrets.includes(r.id)&&input.line&&Math.hypot(p.x-r.secretLatch.x,p.y-r.secretLatch.y)<340){
  s.openSecrets.push(r.id);s.events.push({type:'shortcut',name:'Old service hatch',text:'The old hatch opens. That field note has a route now.'});
 }
 if(r.spark && t%8>4.5&&t%8<6.1 && p.x>610&&p.x<810&&p.y>510)bump(s,-1,'Live cable. Amber first, sparks next. Jump the current.');
 if(r.id===16&&!s.midbossComplete){
  s.midboss ||= {hp:3,pull:0,cooldown:0,phase:'warning'};const b=s.midboss;
  b.cooldown=Math.max(0,b.cooldown-dt);b.phase=b.cooldown>0?'stagger':t%7<2.2?'warning':t%7<3.8?'sweep':'exposed';
  if(input.line&&s.tether&&p.x>390&&p.x<820&&p.y>435&&b.phase==='exposed'){
   b.pull+=dt;p.vx-=180*dt;
   if(b.pull>.7){b.hp--;b.pull=0;b.cooldown=2.5;s.events.push({type:'catch-hit',text:'Catch pulled. The caretaker is off balance.'});
    if(!b.hp){s.midbossComplete=true;s.events.push({type:'midboss',text:'Caretaker safely parked. The service return is open.'});}}
  }else b.pull=Math.max(0,b.pull-dt*2);
  if(b.phase==='sweep'&&p.x>390&&p.x<925&&p.y>535) bump(s,-1,'Brush sweep. Jump, then pull when the amber eye opens.');
 }
 s.roomPulses ||= [];
 for(const pulse of s.roomPulses){pulse.x+=pulse.vx*dt;pulse.y+=pulse.vy*dt;pulse.life-=dt;if(Math.hypot(pulse.x-p.x,pulse.y-(p.y-60))<35){bump(s,p.x<pulse.x?-1:1,'Scanner pulse. Jump after the amber sight line.');pulse.life=0;}}
 s.roomPulses=s.roomPulses.filter(p=>p.life>0);
 if(!r.machine||s.defeated.includes(r.id))return;
 const a=s.machineState[r.id] ||= {stun:0,hits:0,pull:0};a.stun=Math.max(0,a.stun-dt);
 const m=machineAt(r,t,a);a.x=m.x;a.y=m.y;
 if(r.machine==='drone'&&m.phase==='active'&&a.cycle!==Math.floor(t/6)&&a.stun===0){
  a.cycle=Math.floor(t/6);const dx=p.x-m.x,dy=(p.y-60)-(m.y-35),length=Math.max(1,Math.hypot(dx,dy));
  s.roomPulses.push({x:m.x,y:m.y-35,vx:dx/length*190,vy:dy/length*190,life:4});s.events.push({type:'warning'});
 }
 if(input.line&&s.tether&&Math.hypot(p.x-m.x,p.y-65-(m.y-35))<240){
  a.pull+=dt;if(a.pull>.45){a.hits++;a.stun=4;a.pull=0;s.events.push({type:'disabled',text:'Machine grounded. A clear route for a moment.'});if(a.hits>=2)s.defeated.push(r.id);}
 }else a.pull=0;
 if(a.stun>0)return;
 const dx=Math.abs(p.x-m.x),dy=Math.abs(p.y-55-(m.y-35));
 if(p.vy>80&&Math.abs(p.y-(m.y-65))<27&&dx<62){a.stun=4;a.hits++;p.vy=-390;s.events.push({type:'disabled'});if(a.hits>=2)s.defeated.push(r.id);}
 else if(dx<54&&dy<68&&m.phase==='active')bump(s,p.x<m.x?-1:1,'Amber is a warning. Jump the machine or ground it with LINE.');
}
export function machineAt(r,t,a={}){
 const phase=t%6<2?'patrol':t%6<3.2?'warning':t%6<4.7?'active':'cooldown';
 if(r.machine==='drone')return {x:650+Math.sin(t*.85+r.id)*210,y:350+Math.sin(t*.6)*90,phase};
 if(r.machine==='shutter')return {x:800,y:phase==='active'?600:phase==='warning'?400:240,phase};
 return {x:620+Math.sin(t*.6+r.id)*230,y:600,phase};
}
function bump(s,direction,text){
 const p=s.player;if(p.invincible>0)return;
 s.energy-=s.settings.assist?0:1;p.vx=direction*285;p.vy=-265;p.grounded=false;p.invincible=1.8;s.events.push({type:'bump',text});
}
export function solids(s,input,oldX,oldY){
 const p=s.player,r=ROOMS[s.room],height=input.crouch?47:108;
 const cage=r.secret&&!s.openSecrets?.includes(r.id)?[{x:r.collectibleX-45,y:r.collectibleY-30,w:90,h:110}]:[];
 const a=s.machineState?.[r.id];
 const shutter=r.machine==='shutter'&&!s.defeated?.includes(r.id)&&!(a?.stun>0)&&machineAt(r,s.roomTime||0).phase==='active'?[{x:773,y:0,w:54,h:600}]:[];
 for(const b of [...r.blocks,...cage,...shutter,...puzzleCollision(s)]){
  if(p.x+17<=b.x||p.x-17>=b.x+b.w||p.y<=b.y+1||p.y-height>=b.y+b.h)continue;
  if(oldY-height>=b.y+b.h-4&&p.vy<0){p.y=b.y+b.h+height;p.vy=0;}
  else if(oldY<=b.y+8&&p.vy>=0){p.y=b.y;p.vy=0;p.grounded=true;}
  else {p.x=oldX<b.x+b.w/2?b.x-18:b.x+b.w+18;p.vx=0;}
 }
}

const C={ink:'#091e2b',metal:'#c9c5a9',teal:'#38656c',light:'#9ee0d3',amber:'#efba66'};
function box(c,x,y,w,h,fill,stroke=C.ink){c.fillStyle=fill;c.fillRect(x,y,w,h);c.strokeStyle=stroke;c.lineWidth=3;c.strokeRect(x,y,w,h);}
function caption(c,words,x,y,color=C.light){c.font='500 16px Barlow';c.textAlign='center';c.fillStyle=color;const t=c.getTransform(),left=-t.e/t.a+12,right=(c.canvas.width-t.e)/t.a-12;if(words==='PARKED. WITH DIGNITY.'&&c.measureText(words).width>right-left)words='PARKED · DIGNITY INTACT';const half=c.measureText(words).width/2;x=Math.max(left+half,Math.min(right-half,x));c.fillText(words,x,y);}
export function drawArchitecture(c,r,s,time){
 // The playable volume has solid walls and cut-out openings, with bespoke silhouettes.
 for(const b of r.blocks){
  box(c,b.x,b.y,b.w,b.h,r.zone==='clock'?'#24424b':'#243e4d','#081a27');
  box(c,b.x+5,b.y+7,b.w-10,Math.min(24,b.h-12),'#6b7c78');
  for(let yy=b.y+53;yy<b.y+b.h;yy+=65){c.strokeStyle='#8eaa9d35';c.lineWidth=2;c.strokeRect(b.x+12,yy,b.w-24,37);}
  for(let x=b.x+16;x<b.x+b.w-10;x+=38)box(c,x,b.y+12,7,7,C.metal);
  const art=machineImages[b.h/b.w>1.2?'architecture-weight':'architecture-plinth'];
  if(art&&b.h>80){
   c.save();c.beginPath();c.rect(b.x,b.y,b.w,b.h);c.clip();c.globalAlpha=.94;
   const scale=Math.min(1.0,Math.max(.14,b.w/art.width)),tileW=art.width*scale,tileH=art.height*scale;
   for(let yy=b.y;yy<b.y+b.h;yy+=tileH)for(let xx=b.x;xx<b.x+b.w;xx+=tileW)c.drawImage(art,xx,yy,tileW,tileH);c.restore();
  }
 }
 // Continuous foreground foundation anchors the walkable decks to the ship.
 for(const p of r.platforms.filter(p=>p.y===600)){
  box(c,p.x,625,p.w,220,'#102b39');for(let x=p.x+25;x<p.x+p.w-20;x+=95){box(c,x,650,55,90,'#193e4b','#345561');box(c,x+8,664,38,7,'#4e716f');}
 }
 if(r.spark){const active=(s.roomTime||0)%8>4.5&&(s.roomTime||0)%8<6.1;const warning=(s.roomTime||0)%8>3&&(s.roomTime||0)%8<4.5;box(c,610,583,200,17,'#675f4c');for(let i=0;i<6;i++)box(c,620+i*32,588,15,6,active||warning?C.amber:'#a79c78');if(warning)caption(c,'CABLE CHARGING',710,490,C.amber);if(active){c.strokeStyle=C.amber;c.lineWidth=4;c.beginPath();c.moveTo(610,555);for(let i=0;i<15;i++)c.lineTo(610+i*14,550+Math.sin(time*32+i*5)*35);c.stroke();}}
 if(r.shape==='crawl'){box(c,360,540,12,60,C.amber);}
 if(r.foam){
  const surface=foamSurface(s,r);
  c.fillStyle='#8dd8d077';c.fillRect(350,surface-20,500,620-surface);
  for(let i=0;i<21;i++){c.fillStyle=i%2?'#c0e9d5':'#8acdc5';c.beginPath();c.arc(360+i*24,surface-18+Math.sin(time+i)*4,8+i%5,0,7);c.fill();}
 }
 if(r.wind){for(let i=0;i<8;i++){const x=(i*151+(s.settings.reduced?0:time*110))%1100;c.strokeStyle='#c8e8d055';c.lineWidth=2;c.beginPath();c.moveTo(x,300+(i%3)*80);c.lineTo(x+60,292+(i%3)*80);c.stroke();}}
 if(r.lift){const l=liftAt(s);box(c,l.x+48,200,12,410,'#3b5a61');box(c,l.x,l.y,l.w,24,C.metal);box(c,l.x+5,l.y+24,l.w-10,32,C.teal);caption(c,'SERVICE LIFT',l.x+55,l.y-16);}
 if(r.secret&&!s.notes.includes(r.id)){
  const open=s.openSecrets?.includes(r.id);const a=r.secretLatch;
  box(c,a.x-22,a.y-55,44,50,open?C.teal:'#836e4c');caption(c,open?'HATCH OPEN':'LINE → OLD HATCH',a.x,a.y-72,C.amber);
  if(!open){c.setLineDash([5,7]);c.strokeStyle=C.amber;c.strokeRect(r.collectibleX-36,r.collectibleY-38,72,90);c.setLineDash([]);}
 }
 if(r.machine&&!s.defeated?.includes(r.id))drawMachine(c,r,s,time);
 for(const pulse of s.roomPulses||[]){c.fillStyle='#b2e4d7';c.beginPath();c.arc(pulse.x,pulse.y,9,0,7);c.fill();c.strokeStyle=C.amber;c.lineWidth=2;c.stroke();}
}
function sprite(c,images,name,x,y,w,h){const a=images?.[name];if(!a)return false;c.drawImage(a,x-w/2,y-h,w,h);return true;}
let machineImages={};export function setMachineImages(images){machineImages=images;}
function drawMachine(c,r,s,time){
 const a=s.machineState?.[r.id]||{},m=machineAt(r,s.roomTime||0,a);c.save();c.translate(m.x,m.y);
 if(a.stun>0){c.globalAlpha=.6;caption(c,'GROUNDED',0,-110);}
 if(!sprite(c,machineImages,'machine-'+r.machine,0,0,r.machine==='drone'?140:150,r.machine==='shutter'?205:110)){
  box(c,-58,-74,116,65,C.teal);box(c,-35,-65,70,42,C.metal);box(c,-12,-55,24,20,m.phase==='warning'?C.amber:C.light);
  for(const side of [-1,1]){box(c,side*50-9,-25,18,27,'#66847d');}
 }
 if(m.phase==='warning'){c.strokeStyle=C.amber;c.lineWidth=3;c.setLineDash([6,5]);c.strokeRect(-90,-100,180,100);c.setLineDash([]);caption(c,r.machine==='shutter'?'SHUTTER ↓':'AMBER · MOVE',0,-122,C.amber);}
 if(r.machine==='drone'&&m.phase==='warning'){c.strokeStyle='#e8b66b77';c.lineWidth=2;c.setLineDash([6,7]);c.beginPath();c.moveTo(0,-35);c.lineTo(s.player.x-m.x,s.player.y-60-m.y);c.stroke();c.setLineDash([]);}
 if(r.machine==='shutter'){box(c,-26,-600,52,m.phase==='active'?600:Math.max(0,600-m.y),'#607c78');for(let yy=-m.y+20;yy<0;yy+=55)box(c,-20,yy,40,8,C.amber);}
 c.restore();
}
export function drawCaretaker(c,s,time){
 const b=s.midboss||{hp:3,phase:'warning'},parked=s.midbossComplete,x=790,y=600;
 c.save();c.translate(x,y);if(!sprite(c,machineImages,'machine-caretaker',0,0,310,340)){
  for(const side of [-1,1]){box(c,side*100-22,-170,44,155,'#546f6e');box(c,side*120-40,-35,80,35,C.metal);}
  box(c,-130,-300,260,135,C.teal);box(c,-100,-285,200,80,C.metal);box(c,-30,-230,60,75,b.phase==='exposed'?C.amber:C.ink);
 }
 const eye=b.phase==='exposed'?C.amber:parked?C.light:'#344c54';box(c,-26,-158,52,52,eye);caption(c,parked?'PARKED. WITH DIGNITY.':b.phase==='exposed'?'HOLD LINE · PULL':b.phase==='sweep'?'JUMP THE BRUSH':'AMBER → BRUSH SWEEP',-40,-365,eye);
 for(let i=0;i<3;i++)box(c,-95+i*65,-335,45,8,i<b.hp?C.amber:'#345963');
 if(!parked&&b.phase==='sweep'){box(c,-390,-40,370,32,'#9ed9cc');for(let i=0;i<17;i++)box(c,-380+i*21,-20,9,20,'#608e86');}
 if(b.pull){c.strokeStyle=C.amber;c.lineWidth=5;c.beginPath();c.moveTo(-26,-130);c.lineTo(s.player.x-x,s.player.y-y-65);c.stroke();}
 c.restore();
}
