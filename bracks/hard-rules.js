/* Optional local difficulty experiment. Canonical attack signals remain unchanged. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HardRules=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const hints={
k01:'Draw his punch. Make him miss, then counter. A second hit costs 36 stamina and brings another punch.',
k02:'Let both punches miss. Only a clean pair opens her guard. Step back in after the second.',
k03:'Guard the long punch. Step back from the short one, then counter. The long punch leaves no opening.',
k04:'Cross the drain to draw him out. Get back behind it and counter. When his health falls below half, his guard closes sooner.',
k05:'Guard the long punch. Let both short punches miss. One mistake closes the whole opening.',
k06:'Read every signal. Guard long punches; evade short ones. One mistake closes the opening. His rhythm changes after your first counter.'
};
function stages(list,duration){return list.map(s=>({...s,...(s.phase==='recovery'?{duration}:{})}));}
function create(M,id,rules,practice=false){
const finish=s=>{if(practice)s.practiceTiming={warning:1.75,recovery:1.5};return s;};
if(id==='k01')return finish(M.create(undefined,{haskLab:true}));
if(!hints[id]||!rules)throw Error('Unknown hard opponent');
const options=JSON.parse(JSON.stringify(rules.options));options.hardLab=id;
let sequence=stages(rules.sequence,id==='k02'?.9:id==='k03'?1:id==='k04'?.85:.85);
if(id==='k03'){options.reading.shortRecovery=1;options.reading.longRecovery=.55;}
if(id==='k05'){options.combination.longSequence=stages(options.combination.longSequence,.85);options.combination.shortSequence=stages(options.combination.shortSequence,.95);}
if(id==='k06'){for(const key of ['A','B','C'])options.technician.sequences[key]=stages(options.technician.sequences[key],.85);options.technician.second=['C','B','C','A','B','A','C'];}
return finish(M.create(sequence,options));
}
return Object.freeze({create,hints:Object.freeze(hints)});
});
