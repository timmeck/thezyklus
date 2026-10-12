(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./career-save.js'));else root.FightBackup=factory(root.FightCareer);})(typeof globalThis!=='undefined'?globalThis:this,function(C){
 'use strict';
 const ids=['k01','k02','k03','k04','k05','k06'],plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
 function parse(text){
  if(typeof text!=='string'||text.length>50000)throw Error('Invalid backup');
  const b=JSON.parse(text),s=b?.career;
  if(b?.format!=='bracks-backup'||b.version!==1||!plain(s)||s.version!==2||!plain(s.fights)||!plain(s.options)||!ids.includes(s.lastFight))throw Error('Invalid backup');
  if(!Object.keys(s.fights).length||Object.keys(s.fights).some(id=>!ids.includes(id)))throw Error('Invalid fights');
  for(const f of Object.values(s.fights)){
   if(!plain(f)||!Number.isInteger(f.wins)||f.wins<0||f.wins>999||typeof f.introSeen!=='boolean'||!plain(f.records))throw Error('Invalid record');
   const r=f.records;
   if(r.version!==1||!Number.isInteger(r.cleanWins)||r.cleanWins<0||r.cleanWins>f.wins||!(r.bestTime===null||Number.isFinite(r.bestTime)&&r.bestTime>0&&r.bestTime<120))throw Error('Invalid record');
  }
  for(const key of ['voice','hint','sound','buttonsOnly','motion'])if(typeof s.options[key]!=='boolean')throw Error('Invalid settings');
  if(!Number.isFinite(s.options.voiceVolume)||s.options.voiceVolume<0||s.options.voiceVolume>1||typeof s.completionSeen!=='boolean')throw Error('Invalid settings');
  return C.read(s);
 }
 function encode(career){return JSON.stringify({format:'bracks-backup',version:1,career:C.read(career)},null,2);}
 function merge(current,incoming){
  const result=C.read(incoming),old=C.read(current);
  for(const id of ids){const a=C.progress(old,id),b=C.progress(result,id);result.fights[id]={wins:Math.max(a.wins,b.wins),introSeen:a.introSeen||b.introSeen,records:{version:1,cleanWins:Math.max(a.records.cleanWins,b.records.cleanWins),bestTime:[a.records.bestTime,b.records.bestTime].filter(x=>x!==null).reduce((v,x)=>v===null?x:Math.min(v,x),null)}};}
  result.completionSeen=old.completionSeen||result.completionSeen;return result;
 }
 return {parse,encode,merge};
});
