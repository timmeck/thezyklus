/* Cosmetic world-space marks; no changes to combat timing or damage. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FightEffects=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create(){return {marks:[],travel:0,lastX:null,health:[100,100],hold:[0,0]};}
  function guardFeedback(state){
    if(state.spacing)return {text:'Guard broken',damaged:true};
    const clean=(state.reading||state.combination||state.technician)&&state.enemy.attackType==='long';
    return {text:clean?'Guard':'Guard · damage',damaged:!clean};
  }
  function mark(fx,x,y,kind){
    fx.marks.push({x,y,kind,age:0,life:kind==='dust'?.35:.2});
    if(fx.marks.length>32)fx.marks.shift();
  }
  function event(fx,type,state){
    const p=state.player,e=state.enemy;
    if(type==='counter')mark(fx,e.x-36,-190,'hit');
    if(type==='player-hit')mark(fx,p.x+36,-190,'hit');
    if(type==='guard-hit')mark(fx,p.x+48,-200,guardFeedback(state).damaged?'hit':'guard');
    if(type==='enemy-block')mark(fx,e.x-48,-200,'guard');
    if(type==='dodge')mark(fx,p.x+20,0,'dust');
  }
  function advance(fx,dt,state){
    fx.marks=fx.marks.filter(m=>(m.age+=dt)<m.life);
    const x=state.player.x;
    if(fx.lastX!==null&&state.phase==='fight'){
      fx.travel+=Math.abs(x-fx.lastX);
      if(fx.travel>=45){fx.travel%=45;mark(fx,x,0,'dust');}
    }
    fx.lastX=x;
    [state.player.hp,state.enemy.hp].forEach((hp,i)=>{
      if(hp<fx.health[i]&&fx.hold[i]===0)fx.hold[i]=.001;
      if(fx.hold[i]>0){fx.hold[i]+=dt;if(fx.hold[i]>.25)fx.health[i]=Math.max(hp,fx.health[i]-75*dt);if(fx.health[i]<=hp)fx.hold[i]=0;}
    });
  }
  function draw(ctx,fx,camera,width,floor,reduced){
    if(reduced)return;
    ctx.save();
    for(const m of fx.marks){
      const t=m.age/m.life,x=m.x+width/2-camera,y=floor+m.y;
      ctx.globalAlpha=(1-t)*(m.kind==='dust'?.24:.75);
      ctx.fillStyle=m.kind==='dust'?'#b1a181':m.kind==='guard'?'#9aaea3':'#e2c18a';
      for(let i=0;i<5;i++){
        const a=i*2.399,r=(m.kind==='dust'?20:15)*t;
        const px=x+Math.cos(a)*r,py=y+(m.kind==='dust'?-t*12:Math.sin(a)*r);
        const size=m.kind==='dust'?4:3;
        ctx.fillRect(Math.round(px),Math.round(py),size,size);
      }
    }
    ctx.restore();
  }
  return {create,event,advance,draw,guardFeedback};
});
