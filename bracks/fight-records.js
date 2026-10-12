(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FightRecords=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function read(value){const v=value&&typeof value==='object'?value:{};return {version:1,bestTime:Number.isFinite(v.bestTime)&&v.bestTime>0&&v.bestTime<120?v.bestTime:null,cleanWins:Number.isInteger(v.cleanWins)&&v.cleanWins>=0?Math.min(v.cleanWins,999):0};}
  function record(value,state){
    const result=read(value);
    if(state.phase!=='won'||!Number.isFinite(state.elapsed)||state.elapsed<=0||state.elapsed>=120)return result;
    result.bestTime=result.bestTime===null?state.elapsed:Math.min(result.bestTime,state.elapsed);
    if(state.player.hp===100)result.cleanWins=Math.min(999,result.cleanWins+1);
    return result;
  }
  return {read,record};
});
