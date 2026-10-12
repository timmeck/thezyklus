(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./fight-records.js'));else root.FightCareer=factory(root.FightRecords);})(typeof globalThis!=='undefined'?globalThis:this,function(R){
  'use strict';
  const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  function fight(value){const v=object(value);return {wins:Number.isInteger(v.wins)?Math.max(0,Math.min(999,v.wins)):0,introSeen:v.introSeen===true,records:R.read(v.records)};}
  function options(value,motion){const v=object(value);return {voice:v.voice!==false,voiceVolume:Number.isFinite(v.voiceVolume)?Math.max(0,Math.min(1,v.voiceVolume)):.8,hint:v.hint!==false,sound:v.sound===true,buttonsOnly:v.buttonsOnly===true,motion:typeof v.motion==='boolean'?v.motion:motion};}
  function read(value,legacy,motion=false){
    const v=object(value),old=object(legacy),valid=v.version===2&&v.fights&&typeof v.fights==='object'&&!Array.isArray(v.fights);
    const result={version:2,completionSeen:valid&&v.completionSeen===true,lastFight:valid&&/^k\d{2}$/.test(v.lastFight)?v.lastFight:'k01',options:options(valid?v.options:old,motion),fights:{}};
    if(valid)for(const [id,data] of Object.entries(v.fights))if(/^k\d{2}$/.test(id))result.fights[id]=fight(data);
    if(!result.fights.k01)result.fights.k01=fight(old);
    return result;
  }
  function progress(career,id){return {...career.options,...fight(career.fights[id])};}
  function update(career,id,value){
    if(!/^k\d{2}$/.test(id))throw new Error('Invalid fight ID');
    const result=read(career,null,career.options.motion);
    result.options=options(value,career.options.motion);result.fights[id]=fight(value);return result;
  }
  function next(career,ids){return ids.find(id=>fight(object(career.fights)[id]).wins===0)||null;}
  function summary(career,ids){
    const rows=ids.map(id=>({id,...fight(object(career.fights)[id])}));
    return {rows,complete:rows.length>0&&rows.every(row=>row.wins>0),clean:rows.filter(row=>row.records.cleanWins>0).length};
  }
  return {read,progress,update,next,summary};
});
