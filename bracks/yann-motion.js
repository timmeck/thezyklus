/* Signal identity follows the selected attack, not the player's response. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.YannMotion=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const frames=[{"sx":0,"sy":0,"w":512,"h":512,"footX":256,"footY":506,"bodyHeight":480},{"sx":512,"sy":0,"w":480,"h":512,"footX":256,"footY":507,"bodyHeight":480},{"sx":992,"sy":0,"w":544,"h":512,"footX":288,"footY":506,"bodyHeight":480},{"sx":0,"sy":512,"w":512,"h":512,"footX":256,"footY":464,"bodyHeight":480},{"sx":512,"sy":512,"w":512,"h":512,"footX":256,"footY":466,"bodyHeight":480},{"sx":1024,"sy":512,"w":512,"h":512,"footX":256,"footY":476,"bodyHeight":480}],motionFrames=[{"sx":0,"sy":0,"w":512,"h":512,"footX":256,"footY":498,"bodyHeight":480},{"sx":512,"sy":0,"w":512,"h":512,"footX":256,"footY":495,"bodyHeight":480},{"sx":1024,"sy":0,"w":512,"h":512,"footX":256,"footY":497,"bodyHeight":480},{"sx":0,"sy":512,"w":512,"h":512,"footX":256,"footY":481,"bodyHeight":480},{"sx":512,"sy":512,"w":512,"h":512,"footX":256,"footY":484,"bodyHeight":480},{"sx":1024,"sy":512,"w":512,"h":512,"footX":256,"footY":484,"bodyHeight":480}];
  const clamp=v=>Math.max(0,Math.min(1,v));
  function frame(who,track){
    const pose=(index,sheet='base',offset=0,lean=0)=>({index,sheet,offset,lean});
    if(who.pose==='defeat')return pose(5);
    if(who.pose==='hurt')return pose(0,'base',Math.sin(Math.PI*clamp(who.hitTime/.22))*5,.035);
    const long=who.attackType==='long';
    if(who.phase==='telegraph')return pose(long?1:3);
    if(who.phase==='punch')return pose(long?2:4);
    if(who.phase==='recovery')return pose(long?4:5,'motion');
    if(track.moving||track.settle>0)return pose(Math.floor(((track.travel/115%1+1)%1)*4),'motion');
    return pose(0);
  }
  function reachOffset(who,distance){
    if(who.pose==='defeat'||who.attackType!=='long')return 0;
    const travel=Math.max(0,distance-165),t=who.elapsed;
    // A long forward step reaches contact at 50 ms; anatomy never stretches.
    if(who.phase==='punch')return -travel*(t<.05?clamp(t/.05):1-clamp((t-.05)/.13)*.35);
    if(who.phase==='recovery')return -travel*.65*(1-clamp(t/.55));
    return 0;
  }
  return {frames,motionFrames,frame,reachOffset};
});
