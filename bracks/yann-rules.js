/* Approved K03 signals: heel back = long, shoulder down = short.
 * Fixed mixed order; player inputs never select an attack or alter its timing. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.YannRules=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  return Object.freeze({id:'k03',speedGoal:30,options:Object.freeze({reading:Object.freeze({
    attacks:Object.freeze(['long','short','short','long','short','long']),longRecovery:.55,shortRecovery:1.2
  })}),sequence:Object.freeze([
    {phase:'rest',duration:.8},{phase:'telegraph',duration:1},{phase:'punch',duration:.18},{phase:'recovery',duration:1.2}
  ].map(Object.freeze))});
});
