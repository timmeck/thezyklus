/* K04: fixed spatial commitment. Only the visible front foot triggers Lutz.
 * The deterministic dwell cycle is independent of buttons and render frames. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LutzRules=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  return Object.freeze({id:'k04',speedGoal:30,options:Object.freeze({spacing:true}),sequence:Object.freeze([
    {phase:'rest',duration:.25},{phase:'telegraph',duration:.9},{phase:'punch',duration:.18},{phase:'recovery',duration:.9}
  ].map(Object.freeze))});
});
