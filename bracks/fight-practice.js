(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FightPractice=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create(model,rules,enabled){
    if(!enabled)return model.create(rules?.sequence,rules?.options);
    const sequence=(rules?.sequence||model.HASK).map(stage=>({...stage,duration:stage.duration*(stage.phase==='telegraph'?1.75:stage.phase==='recovery'?1.5:1)}));
    const options={...rules?.options};
    if(options.reading)options.reading={...options.reading,longRecovery:options.reading.longRecovery*1.5,shortRecovery:options.reading.shortRecovery*1.5};
    if(options.combination){const stretch=stages=>stages.map(stage=>({...stage,duration:stage.duration*(stage.phase==='telegraph'?1.75:stage.phase==='recovery'?1.5:1)}));options.combination={...options.combination,longSequence:stretch(options.combination.longSequence),shortSequence:stretch(options.combination.shortSequence)};}
    if(options.technician){const stretch=stages=>stages.map(stage=>({...stage,duration:stage.duration*(stage.phase==='telegraph'?1.75:stage.phase==='recovery'?1.5:1)}));options.technician={...options.technician,sequences:Object.fromEntries(Object.entries(options.technician.sequences).map(([key,stages])=>[key,stretch(stages)]))};}
    return model.create(sequence,options);
  }
  return {create};
});
