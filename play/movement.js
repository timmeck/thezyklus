/* Distance drives the gait; frame rate never changes movement speed. */
(() => {
 const approach=(v,target,amount)=>v<target?Math.min(target,v+amount):Math.max(target,v-amount);
 function create(x=400){return{x,v:0,dir:1,distance:0,gaitDistance:0,run:0,crouch:0,roll:0,cooldown:0,rollDir:1}}
 function roll(s){if(s.roll||s.cooldown)return false;s.roll=.62;s.rollDir=s.dir;s.cooldown=.88;return true}
 function step(s,dt,input,duck=false,running=false){
  s.cooldown=Math.max(0,s.cooldown-dt);
  s.run=approach(s.run,running&&!duck&&!s.roll&&input?1:0,dt*5);
  s.crouch=approach(s.crouch,duck?1:0,dt*7);
  if(s.roll>0){s.roll=Math.max(0,s.roll-dt);s.v=s.rollDir*(110+160*Math.sin(Math.PI*(1-s.roll/.62)));if(s.roll===0)s.crouch=1;}
  else{s.v=approach(s.v,input*(duck?55:120+120*s.run),dt*(input?920:1250));if(Math.abs(s.v)>3)s.dir=Math.sign(s.v)}
  const before=s.x;s.x=Math.max(80,Math.min(1620,s.x+s.v*dt));s.distance+=Math.abs(s.x-before);s.gaitDistance+=Math.abs(s.x-before)/(1+.3*s.run);if(s.x===before)s.v=0;
 }
 function stop(s){s.v=0;s.roll=0;s.crouch=0;s.run=0}
 function draw(ctx,im,frame,x,y,h,dir=1){
  if(!im?.naturalWidth)return;
  const actions=im.src.includes('actions'),sw=im.naturalWidth/4,sh=im.naturalHeight/2;
  const feet=actions?[461,461,461,461,330,324,327,331]:im.src.includes('toren')?[438,437,437,438,425,423,424,426]:im.src.includes('worker')?[439,439,439,439,436,436,435,437]:[436,438,439,437,430,430,431,430];
  const tops=im.src.includes('toren')?[19,17,17,18,18,18,16,16]:im.src.includes('worker')?[9,10,8,8,7,6,7,6]:[12,13,15,15,14,14,15,14];
  const anchors=im.src.includes('toren')?[235.5,226.5,209,231.5,241.5,231,215.5,215]:im.src.includes('worker')?[215.5,215.5,221,218,219.5,215.5,218,212]:[232.5,243,235,238,243,236,234,240];
  const scale=actions?h/650:h*.95/(feet[frame]-tops[frame]),anchor=actions?sw/2:anchors[frame];
  const sy=actions?(frame<4?0:500):Math.floor(frame/4)*sh,sourceH=actions?(frame<4?500:im.naturalHeight-500):sh;
  ctx.save();ctx.translate(x,y);ctx.scale(dir,1);ctx.drawImage(im,(frame%4)*sw,sy,sw,sourceH,-anchor*scale,-feet[frame]*scale,sw*scale,sourceH*scale);ctx.restore();
 }
 function idle(ctx,im,x,y,h,dir=1){if(!im?.naturalWidth)return;const scale=h/650,sw=im.naturalWidth/4,toren=im.src.includes('toren'),anchor=toren?282:260,feet=toren?690:674;ctx.save();ctx.translate(x,y);ctx.scale(dir,1);ctx.drawImage(im,0,0,sw,im.naturalHeight,-anchor*scale,-feet*scale,sw*scale,im.naturalHeight*scale);ctx.restore()}
 const api={create,roll,step,stop,draw,idle};if(typeof window!=='undefined')window.zyklusMotion=api;if(typeof module!=='undefined')module.exports=api;
})();
