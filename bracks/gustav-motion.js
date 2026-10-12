/* Opaque foot baselines measured from the generated sheet; fixed anatomical scale. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.GustavMotion=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const frames=[
    {sx:0,sy:0,w:418,h:434,footX:213,footY:431,bodyHeight:415},
    {sx:418,sy:0,w:398,h:434,footX:231,footY:432,bodyHeight:415},
    {sx:816,sy:0,w:438,h:434,footX:245,footY:432,bodyHeight:415},
    {sx:0,sy:434,w:418,h:421,footX:211,footY:414,bodyHeight:415},
    {sx:418,sy:434,w:418,h:421,footX:220,footY:414,bodyHeight:415},
    {sx:836,sy:434,w:418,h:421,footX:226,footY:414,bodyHeight:415},
    {sx:0,sy:855,w:418,h:399,footX:214,footY:384,bodyHeight:415},
    {sx:418,sy:855,w:418,h:399,footX:225,footY:382,bodyHeight:415},
    {sx:836,sy:855,w:418,h:399,footX:215,footY:382,bodyHeight:415}
  ];
  function frame(who,track,stage){
    const pose=index=>({index,sheet:'base',offset:0,lean:0});
    if(who.phase==='recovery'&&who.pose==='guard')return {index:0,sheet:'base',offset:0,lean:0};
    if(who.pose==='defeat')return pose(8);
    if(who.phase==='reset')return pose(7);
    if(who.pose==='hurt')return {...pose(6),lean:.035};
    if(who.phase==='telegraph')return pose(who.attackType==='long'?1:3);
    if(who.phase==='punch')return pose(who.attackType==='long'?2:(stage===4?5:4));
    if(who.phase==='recovery')return pose(6);
    return pose(0);
  }
  function reachOffset(who){
    const duration=who.phase==='reset'?.25:who.phase==='punch'&&who.attackType==='long'?.05:0;
    if(!duration||!Number.isFinite(who.visualFromX))return 0;
    const t=Math.max(0,Math.min(1,who.elapsed/duration)),ease=t*t*(3-2*t);
    return (who.visualFromX-who.x)*(1-ease);
  }
  return {frames,frame,reachOffset};
});
