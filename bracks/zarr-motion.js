/* Zarr's drawings follow the two separate contacts, never Hask's recovery pose. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ZarrMotion=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const frames=[502,502,502,472,483,478].map((footY,i)=>({sx:i%3*512,sy:i<3?0:i===4?504:512,w:512,h:i===1?504:i===4?520:512,footX:256,footY,bodyHeight:480}));
  const motionFrames=[502,499,502,481,487,489].map((footY,i)=>({sx:i%3*512,sy:i<3?0:512,w:512,h:512,footX:256,footY,bodyHeight:480}));
  function frame(who,track,stage){
    const pose=(index,sheet='base',offset=0,lean=0)=>({index,sheet,offset,lean});
    if(who.phase==='recovery'&&who.pose==='guard')return {index:0,sheet:'base',offset:0,lean:0};
    if(who.pose==='defeat')return pose(5);
    if(who.pose==='hurt')return pose(5,'motion',Math.sin(Math.PI*Math.min(1,who.hitTime/.22))*5);
    if(who.phase==='punch')return pose(stage===2?2:3,'base',-Math.sin(Math.PI*Math.min(1,who.elapsed/.18))*3);
    if(who.phase==='telegraph')return pose(1);
    if(who.phase==='recovery')return pose(4);
    if(track.moving||track.settle>0)return pose(Math.floor(((track.travel/100%1+1)%1)*4),'motion');
    return pose(0);
  }
  return {frames,motionFrames,frame};
});
