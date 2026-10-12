/* Measured sprite rectangles; one anatomical scale across standing and crouching poses. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PetraMotion=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const frames=[
    {sx:0,sy:0,w:418,h:465,footX:209,footY:451,bodyHeight:431},
    {sx:418,sy:0,w:398,h:465,footX:236,footY:452,bodyHeight:431},
    {sx:816,sy:0,w:438,h:465,footX:253,footY:452,bodyHeight:431},
    {sx:0,sy:465,w:418,h:323,footX:209,footY:323,bodyHeight:431},
    {sx:418,sy:465,w:418,h:323,footX:227,footY:322,bodyHeight:431},
    {sx:836,sy:465,w:418,h:323,footX:244,footY:323,bodyHeight:431},
    {sx:0,sy:788,w:418,h:466,footX:209,footY:440,bodyHeight:431},
    {sx:418,sy:788,w:418,h:466,footX:217,footY:435,bodyHeight:431},
    {sx:836,sy:788,w:418,h:466,footX:221,footY:437,bodyHeight:431}
  ];
  const clamp=v=>Math.max(0,Math.min(1,v));
  function frame(who,track,stage){
    const pose=index=>({index,sheet:'base',offset:0,lean:0});
    if(who.phase==='recovery'&&who.pose==='guard')return {index:0,sheet:'base',offset:0,lean:0};
    if(who.pose==='defeat')return pose(8);
    if(who.pose==='hurt')return pose(7);
    const long=who.attackType==='long';
    if(who.phase==='telegraph')return pose(long?1:5);
    if(who.phase==='punch')return pose(long?2:(stage===4?4:3));
    if(who.phase==='recovery')return pose(6);
    return pose(0);
  }
  function reachOffset(who,distance){
    if(who.pose==='defeat'||who.attackType!=='long')return 0;
    const travel=Math.max(0,distance-165),t=who.elapsed;
    if(who.phase==='punch')return -travel*(t<.05?clamp(t/.05):1-clamp((t-.05)/.13)*.35);
    if(who.phase==='recovery')return -travel*.65*(1-clamp(t/.55));
    return 0;
  }
  return {frames,frame,reachOffset};
});
