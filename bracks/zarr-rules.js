/* Approved K02 double beat. No random feints or input-dependent attack timing. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ZarrRules=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  return Object.freeze({id:'k02',speedGoal:25,options:Object.freeze({pressing:true}),sequence:Object.freeze([
    {phase:'rest',duration:.8},{phase:'telegraph',duration:.75},{phase:'punch',duration:.18},
    {phase:'telegraph',duration:.32},{phase:'punch',duration:.18},{phase:'recovery',duration:1.1}
  ].map(Object.freeze))});
});
