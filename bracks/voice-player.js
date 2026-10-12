(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FightVoice=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const key=line=>JSON.stringify([line.speaker,line.text]);
  function create(clips,makeAudio,onError=()=>{}){
    let active=null,generation=0;
    function stop(){generation++;if(active){active.pause();active.removeAttribute('src');active.load();active.remove?.();active=null;}}
    function volume(value){const v=Number.isFinite(value)?Math.max(0,Math.min(1,value)):.8;if(active)active.volume=v;return v;}
    function play(line,enabled,level){
      stop();const src=clips[key(line)];if(!src||!enabled)return false;
      const token=generation;active=makeAudio(src);active.preload='none';volume(level);
      const fail=()=>{if(token===generation){stop();onError();}};
      active.onerror=fail;
      try{const started=active.play();if(started&&started.catch)started.catch(fail);}catch{fail();}
      return true;
    }
    return {play,stop,volume,has:line=>!!clips[key(line)]};
  }
  return {create,key};
});
