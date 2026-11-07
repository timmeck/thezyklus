// Fixed-step simulation. No DOM, rendering, audio, storage or platform timing.
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class Flight {
 constructor(level,{width=1200,height=900,assist=false,seed=Date.now()}={}) {
  this.level=level;this.w=width;this.h=height;this.assist=assist;this.rng=seed>>>0||1;this.t=0;this.over=false;this.reason='';this.score=0;this.rescued=0;this.scrap=0;this.combo=1;this.maxCombo=1;this.chainUntil=0;this.hp=assist?5:3;this.maxHp=this.hp;this.invul=0;this.hitstop=0;this.capacity=3;this.reach=90;this.magnet=110;this.upgrades=0;this.grazes=0;this.hits=0;this.events=[];this.particles=[];this.capsules=[];this.rocks=[];this.bullets=[];this.salvos=[];this.scraps=[];this.gates=[];this.nextId=1;this.phase=-1;this.rockClock=2;this.salvoClock=18;this.capsuleClock=5;this.scrapClock=1;this.droneClock=12;this.bankClock=0;
  this.dock={x:width*.5,y:height*.83,r:79};this.ship={x:this.dock.x,y:this.dock.y-35,vx:0,vy:0,angle:-Math.PI/2,r:17};
  
  this.addCapsule(width*.5,height*.57);this.addCapsule(width*.30,height*.34);this.addCapsule(width*.75,height*.39);
  for(let i=0;i<13;i++)this.addScrap(width*(.18+this.rand()*.64),height*(.2+this.rand()*.48));
  for(let i=0;i<4;i++)this.addRock(true);
 }
 rand(){this.rng^=this.rng<<13;this.rng^=this.rng>>>17;this.rng^=this.rng<<5;return(this.rng>>>0)/4294967296;}
 emit(type,props={}){this.events.push({type,t:this.t,...props});}
 drain(){const e=this.events;this.events=[];return e;}
 addCapsule(x,y){this.capsules.push({id:this.nextId++,x:x??this.w*(.12+this.rand()*.76),y:y??this.h*(.18+this.rand()*.45),vx:0,vy:0,r:17,hooked:false,spin:this.rand()*6,hookTime:0});}
 addScrap(x,y){this.scraps.push({x:x??this.w*(.1+this.rand()*.8),y:y??this.h*(.15+this.rand()*.6),r:7,spin:this.rand()*6});}
 addRock(initial=false,drone=false){
  const edge=this.rand()*4|0,speed=(drone?85:40)+this.rand()*60+this.t*.65,a=this.rand()*Math.PI*2;
  let x=edge<2?(edge===0?-55:this.w+55):this.rand()*this.w,y=edge>=2?(edge===2?-55:this.h+55):this.rand()*this.h;
  if(initial){x=this.w*(.1+this.rand()*.8);y=this.h*(.12+this.rand()*.35);}
  const target={x:this.w*.5+(this.rand()-.5)*this.w*.5,y:this.h*.45+(this.rand()-.5)*this.h*.4};const d=Math.max(1,Math.hypot(target.x-x,target.y-y));
  this.rocks.push({id:this.nextId++,x,y,vx:(target.x-x)/d*speed,vy:(target.y-y)/d*speed,r:drone?23:22+this.rand()*16,angle:a,spin:(this.rand()-.5)*1.6,drone,graze:false});
 }
 salvo(){
  const vertical=this.rand()>.5,from=this.rand()>.5,axis=vertical?this.w:this.h;
  let pos=clamp((vertical?this.ship.x:this.ship.y)+(this.rand()-.5)*130,70,axis-70);
  // The recovery berth remains safe, even when a broadside targets the lower field.
  if(!vertical&&Math.abs(pos-this.dock.y)<135)pos=this.h*.38;
  this.salvos.push({vertical,from,pos,warning:1.35,active:0,id:this.nextId++});this.emit('warning',{x:vertical?pos:(from?0:this.w),y:vertical?(from?0:this.h):pos});
 }
 updateGates(){
  this.gates=[];const k=this.level.kind,u=this.t*(this.assist?.68:1);
  
  
  if(k==='orbit'&&this.t>70){const progress=clamp((this.t-70)/5,0,1),gap=this.w*.43;for(let i=0;i<2;i++)this.gates.push({x:this.w*.5+Math.sin(this.t*.25+i)*this.w*.1,y:this.h*(.16+i*.32),gap:gap+this.w*(1-progress),height:28,warn:this.t<74,axis:'x',finale:true});}
 }
 hit(x,y){
  if(this.invul>0||this.over)return;
  this.hp--;this.hits++;this.invul=1.65;this.hitstop=.075;this.combo=1;this.chainUntil=0;
  const s=this.ship,d=Math.max(1,Math.hypot(s.x-x,s.y-y));s.vx+=(s.x-x)/d*150;s.vy+=(s.y-y)/d*150;
  for(const c of this.capsules)if(c.hooked){c.hooked=false;c.hookTime=this.t+1.7;c.vx=(this.rand()-.5)*150;c.vy=(this.rand()-.5)*150;}
  this.emit('hit',{x:s.x,y:s.y,hp:this.hp});if(this.hp<=0)this.finish('recovered');
 }
 finish(reason='complete'){if(this.over)return;this.over=true;this.reason=reason;this.emit('end',{reason});}
 step(dt,input={x:0,y:0}){
  if(this.over)return;
  if(this.hitstop>0){this.hitstop=Math.max(0,this.hitstop-dt);return;}
  this.t+=dt;this.invul=Math.max(0,this.invul-dt);this.bankClock=Math.max(0,this.bankClock-dt);
  const speedFactor=this.assist?.68:1,s=this.ship,load=this.capsules.filter(c=>c.hooked),m=Math.max(1,Math.hypot(input.x,input.y));
  const accel=2100*(1-load.length*.055),drag=5.8,maxSpeed=440-load.length*24;
  const damp=Math.exp(-drag*dt);s.vx=s.vx*damp+input.x/m*accel/drag*(1-damp);s.vy=s.vy*damp+input.y/m*accel/drag*(1-damp);
  const speed=Math.hypot(s.vx,s.vy);if(speed>maxSpeed){s.vx*=maxSpeed/speed;s.vy*=maxSpeed/speed;}
  s.x=clamp(s.x+s.vx*dt,28,this.w-28);s.y=clamp(s.y+s.vy*dt,84,this.h-50);
  if(speed>16){const a=Math.atan2(s.vy,s.vx);s.angle+=Math.atan2(Math.sin(a-s.angle),Math.cos(a-s.angle))*Math.min(1,dt*13);}
  if(this.combo>1&&this.t>this.chainUntil){this.combo=1;this.emit('chain-lost');}
  for(let i=0;i<this.level.phases.length;i++)if(this.t>=this.level.phases[i].at&&i>this.phase){this.phase=i;this.emit('phase',this.level.phases[i]);}
  this.updateGates();
  for(const g of this.gates){if(!g.warn&&Math.abs(s.y-g.y)<s.r+g.height/2&&(s.x<g.x-g.gap/2+s.r||s.x>g.x+g.gap/2-s.r))this.hit(s.x,g.y);}
  // Slower hazards must also arrive less often, so assistance never packs the field.
  this.rockClock-=dt*speedFactor;this.droneClock-=dt*speedFactor;this.salvoClock-=dt*speedFactor;this.capsuleClock-=dt;this.scrapClock-=dt;
  if(this.rockClock<0){this.addRock();this.rockClock=Math.max(.52,2.3-this.t*.019);}
  if(this.droneClock<0){this.addRock(false,true);this.droneClock=Math.max(4,12-this.t*.07);}
  if(this.salvoClock<0){this.salvo();this.salvoClock=Math.max(2.8,7.1-this.t*.045);}
  if(this.capsuleClock<0){if(this.capsules.length<7)this.addCapsule();this.capsuleClock=3.7;}
  if(this.scrapClock<0){if(this.scraps.length<30)for(let i=0;i<3;i++)this.addScrap();this.scrapClock=1.8;}
  for(const r of this.rocks){
   if(r.drone&&this.t>15){const a=Math.atan2(s.y-r.y,s.x-r.x);r.vx+=(Math.cos(a)*60-r.vx)*dt*.3;r.vy+=(Math.sin(a)*60-r.vy)*dt*.3;}
   r.x+=r.vx*dt*speedFactor;r.y+=r.vy*dt*speedFactor;r.angle+=r.spin*dt;
   const d=distance(s,r);if(d<s.r+r.r-6)this.hit(r.x,r.y);else if(d<s.r+r.r+20&&!r.graze&&this.invul<=0&&speed>100){r.graze=true;this.graze(r);}
  }
  this.rocks=this.rocks.filter(r=>r.x>-180&&r.x<this.w+180&&r.y>-180&&r.y<this.h+180);
  for(const v of this.salvos){v.warning-=dt;if(v.warning<=0&&!v.fired){v.fired=true;this.emit('salvo');for(let i=-1;i<=1;i++)this.bullets.push({x:v.vertical?v.pos+i*25:(v.from?-30:this.w+30),y:v.vertical?(v.from?-30:this.h+30):v.pos+i*25,vx:0,vy:0});
    // Set velocity separately to keep the axis explicit.
    for(const b of this.bullets.slice(-3)){b.vx=v.vertical?0:(v.from?1:-1)*510;b.vy=v.vertical?(v.from?1:-1)*510:0;b.r=7;b.graze=false;}
   }}
  this.salvos=this.salvos.filter(v=>v.warning>-.4);
  for(const b of this.bullets){b.x+=b.vx*dt*speedFactor;b.y+=b.vy*dt*speedFactor;const d=distance(s,b);if(d<21)this.hit(b.x,b.y);else if(d<45&&!b.graze&&this.invul<=0&&speed>80){b.graze=true;this.graze(b);}}
  this.bullets=this.bullets.filter(b=>b.x>-80&&b.x<this.w+80&&b.y>-80&&b.y<this.h+80);
  let preceding=s,count=0;
  for(const c of this.capsules){
   if(c.hooked){count++;const d=Math.max(1,distance(c,preceding)),rest=45;const force=(d-rest)*25;c.vx+=(preceding.x-c.x)/d*force*dt;c.vy+=(preceding.y-c.y)/d*force*dt;c.vx*=Math.exp(-5*dt);c.vy*=Math.exp(-5*dt);c.x+=c.vx*dt;c.y+=c.vy*dt;preceding=c;}
   else{c.x=clamp(c.x+c.vx*dt,45,this.w-45);c.y=clamp(c.y+c.vy*dt,110,this.h-130);c.vx*=Math.exp(-2*dt);c.vy*=Math.exp(-2*dt);c.spin+=dt*.3;
    if(distance(c,s)<this.reach&&load.length<this.capacity&&c.hookTime<this.t){c.hooked=true;load.push(c);this.score+=75*this.combo;this.emit('hook',{x:c.x,y:c.y,count:load.length});}}
  }
  const cargo=this.capsules.filter(c=>c.hooked);
  if(distance(s,this.dock)<this.dock.r&&cargo.length&&this.bankClock===0){
   const full=cargo.length>=this.capacity,points=(cargo.length*350+(full?450:0))*this.combo;
   this.rescued+=cargo.length;this.score+=points;this.capsules=this.capsules.filter(c=>!c.hooked);this.combo=Math.min(8,this.combo+1);this.maxCombo=Math.max(this.combo,this.maxCombo);this.chainUntil=this.t+15;this.bankClock=.55;
   this.emit('bank',{x:this.dock.x,y:this.dock.y,count:cargo.length,points,full,combo:this.combo});
  }
  for(const v of this.scraps){const d=distance(s,v);if(d<this.magnet){const pull=(1-d/this.magnet)*700*dt;v.x+=(s.x-v.x)/Math.max(1,d)*pull;v.y+=(s.y-v.y)/Math.max(1,d)*pull;}if(d<24){v.collected=true;this.scrap++;this.score+=20*this.combo;this.emit('scrap',{x:v.x,y:v.y});if(this.scrap%12===0)this.upgrade();}}
  this.scraps=this.scraps.filter(v=>!v.collected);
  
  if(this.t>=this.level.duration)this.finish('complete');
 }
 graze(o){this.grazes++;this.score+=65*this.combo;this.emit('graze',{x:o.x,y:o.y});}
 upgrade(){const i=this.upgrades++%4;let title;if(i===0){this.reach+=30;title='LONGER LINE';}if(i===1){this.capacity=Math.min(5,this.capacity+1);title='EXTRA TOW';}if(i===2){this.hp=Math.min(this.maxHp,this.hp+1);title='HULL PATCH';}if(i===3){this.magnet+=65;title='SCRAP MAGNET';}this.emit('upgrade',{title});}
 snapshot(){return {t:this.t,w:this.w,h:this.h,ship:{...this.ship},dock:{...this.dock},capsules:this.capsules.map(c=>({...c})),rocks:this.rocks.map(r=>({...r})),bullets:this.bullets.map(b=>({...b})),gates:this.gates.map(g=>({...g})),hp:this.hp,score:this.score,rescued:this.rescued,combo:this.combo,scrap:this.scrap,over:this.over,reason:this.reason,cargo:this.capsules.filter(c=>c.hooked).length};}
}
