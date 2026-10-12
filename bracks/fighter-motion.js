/* Presentation only. Contact frames follow the simulation's actual strike times. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FighterMotion=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clamp=v=>Math.max(0,Math.min(1,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
  function create(x){return {x,travel:0,moving:false,settle:0};}
  function advance(track,x,dt,enemy=false){
    const dx=x-track.x;track.x=x;
    track.moving=Math.abs(dx)>.01;
    if(track.moving){track.travel+=dx*(enemy?-1:1);track.settle=.09;}
    else track.settle=Math.max(0,track.settle-dt);
  }
  function frame(who,track,enemy=false){
    const base=index=>({sheet:'base',index,lean:0,offset:0});
    const extra=index=>({sheet:'motion',index,lean:0,offset:0});
    if(who.pose==='defeat')return base(5);
    if(who.pose==='victory')return base(0);
    if(who.pose==='hurt'){
      const p=clamp(who.hitTime/(enemy?.22:.3));
      return {...base(4),offset:(enemy?1:-1)*Math.sin(Math.PI*p)*5};
    }
    if(enemy){
      if(who.phase==='telegraph')return {...base(who.elapsed<.065?0:1),lean:-.018*ease(who.elapsed/.22)};
      if(who.phase==='punch')return who.elapsed<.045?extra(4):who.elapsed<.135?base(2):extra(4);
      if(who.phase==='recovery')return base(3);
    }else{
      if(who.action==='strike'){
        const t=who.actionTime;
        return t<.035?base(0):t<.09?base(1):t<.13?extra(4):t<.235?base(2):t<.32?extra(4):t<.41?base(3):base(0);
      }
      if(who.action==='dodge'){
        const t=who.actionTime;
        return t<.055?extra(3):t<.285?extra(5):extra(1);
      }
    }
    if(track.moving||track.settle>0){
      // Distance, not elapsed time: feet stop when movement stops, reverse on retreat.
      const phase=((track.travel/100)%1+1)%1;
      return extra(Math.floor(phase*4));
    }
    return base(0);
  }
  function stance(time,who,enemy=false){
    if(['hurt','defeat','victory'].includes(who.pose))return {sway:0,dip:0};
    const ready=enemy?who.phase==='rest':who.action==='idle';
    if(!ready)return {sway:0,dip:0};
    // A lighter, quicker Erek and a slower, heavier Hask. Feet stay anchored.
    const phase=time*(enemy?4.4:5.8)+(enemy?1.7:0);
    return {sway:Math.sin(phase*.5)*(enemy?2.6:3.4),dip:(1-Math.cos(phase))*(enemy?1.3:1.8)};
  }
  return {create,advance,frame,stance};
});
