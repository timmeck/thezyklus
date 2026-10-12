/* Six generated poses with measured opaque foot baselines and a single anatomical scale. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LutzMotion=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const frames=[
    {sx:0,sy:0,w:512,h:512,footX:256,footY:505,bodyHeight:478},
    {sx:512,sy:0,w:512,h:512,footX:256,footY:505,bodyHeight:478},
    {sx:1024,sy:0,w:512,h:512,footX:256,footY:505,bodyHeight:478},
    {sx:0,sy:512,w:512,h:512,footX:256,footY:462,bodyHeight:478},
    {sx:512,sy:512,w:512,h:512,footX:256,footY:464,bodyHeight:478},
    {sx:1024,sy:512,w:512,h:512,footX:256,footY:463,bodyHeight:478}
  ];
  function frame(who){
    const pose=index=>({index,sheet:'base',offset:0,lean:0});
    if(who.phase==='recovery'&&who.pose==='guard')return {index:0,sheet:'base',offset:0,lean:0};
    if(who.pose==='defeat')return pose(5);
    if(who.pose==='hurt')return pose(4);
    if(who.phase==='telegraph')return pose(1);
    if(who.phase==='punch')return pose(2);
    if(who.phase==='recovery')return pose(3);
    return pose(0);
  }
  return {frames,frame};
});
