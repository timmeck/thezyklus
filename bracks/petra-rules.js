/* K05: fixed stance sequence. Long = guard; low double = retreat, wait, counter. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PetraRules=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const freeze=stages=>Object.freeze(stages.map(Object.freeze));
  const longSequence=freeze([{phase:'rest',duration:.9},{phase:'telegraph',duration:1},{phase:'punch',duration:.18},{phase:'recovery',duration:1.1}]);
  const shortSequence=freeze([{phase:'rest',duration:.9},{phase:'telegraph',duration:1},{phase:'punch',duration:.18},{phase:'telegraph',duration:.45},{phase:'punch',duration:.18},{phase:'recovery',duration:1.3}]);
  return Object.freeze({id:'k05',speedGoal:30,sequence:longSequence,options:Object.freeze({combination:Object.freeze({attacks:Object.freeze(['long','short','short','long','short','long']),longSequence,shortSequence})})});
});
