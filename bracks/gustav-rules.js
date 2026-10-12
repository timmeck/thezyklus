/* K06: deterministic combinations; the second signal, never the player's input, selects the defence. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.GustavRules=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const freeze=stages=>Object.freeze(stages.map(Object.freeze));
  const rest={phase:'rest',duration:.9},recovery={phase:'recovery',duration:1.3};
  const signal=(attackType,duration=1)=>({phase:'telegraph',duration,attackType});
  const punch=attackType=>({phase:'punch',duration:.18,attackType});
  const sequences=Object.freeze({
    A:freeze([rest,signal('long'),punch('long'),recovery]),
    B:freeze([rest,signal('short'),punch('short'),signal('short',.45),punch('short'),recovery]),
    C:freeze([rest,signal('short'),punch('short'),signal('long'),punch('long'),recovery])
  });
  return Object.freeze({id:'k06',speedGoal:34,sequence:sequences.A,options:Object.freeze({technician:Object.freeze({first:Object.freeze(['A','B','A','B']),second:Object.freeze(['C','B','A','C']),sequences,resetDuration:1.4})})});
});
