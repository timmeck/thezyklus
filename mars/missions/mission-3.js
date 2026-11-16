import {balance,initBalance,initPattern,pattern,clamp} from '../sim.js';
import {art,draw} from './scene-3.js';
export const mission={
 art,
 moments:{1:{image:'assets/b3/p24a.webp',title:'Still up.',number:'30',text:'His feet. His thirty seconds. No borrowed time.',preQuote:'count',quote:'stand',next:'Stay with the crew →'}},
 id:3,title:'Again.',badge:'Thirty belongs to you',subtitle:'FEET. THEN THE REST.',
 stages:[
  {title:'01 / Follow the stronger beat',text:'The core follows transmitted vibration, not people. Watch each academy phrase. Echo left for the low contact and right for the high one, only in the marked response windows. Nine phrases, then the Heavy Room.',image:'assets/b3/p10a.webp',kind:'pattern'},
  {title:'02 / Thirty belongs to Bram',text:'Keep Bram centred for thirty real seconds at 1.00 g. Hands free, catch line slack. No brake lever yet. Shaking is allowed. A fall restarts only the stand.',image:'assets/b3/p24a.webp',kind:'balance',duration:30},
  {title:'03 / The independent brake',text:'The stand is finished. Now the separate emergency: hold hydraulic pressure in the green band for thirty seconds. Left eases, right adds pressure. No sudden stop. This time never counts as free standing.',image:'assets/b3/p30a.webp',kind:'brake',duration:30},
  {title:'04 / Stopped. Pins next.',text:'The cabin is stationary. Hold right to engage the parking pins. Only then release Iona’s boot. Seven people. All here. The receiver stays unkeyed.',image:'assets/b3/p29a.webp',kind:'pins',duration:5}
 ],
 create(stage=0){const s={stage,falls:0,feedback:''};this.setup(s);return s;},
 setup(s){s.personLabel='BRAM';const p=this.stages[s.stage];if(p.kind==='balance')initBalance(s,30);else if(p.kind==='pattern')initPattern(s,[[0,1],[1,0],[0,0,1]],3);else Object.assign(s,{kind:p.kind,elapsed:0,duration:p.duration,value:.5,danger:0,target:.55});},
 update(s,dt,input,assist){
  if(s.kind==='balance')return balance(s,dt,input.axis,assist);
  if(s.kind==='pattern')return pattern(s,dt,input,assist);
  if(s.kind==='pins'){
   if(input.axis>.2||assist)s.elapsed+=dt;else s.elapsed=Math.max(0,s.elapsed-dt*.1);
   s.value=s.elapsed/s.duration;return s.elapsed>=s.duration?'complete':undefined;
  }
  s.target=.55+Math.sin(s.elapsed*.58)*.09;
  s.value=clamp(s.value+(input.axis*.3-.026+(assist?(s.target-s.value)*1.8:0))*dt,0,1);
  if(Math.abs(s.value-s.target)<(assist?.24:.13)){s.elapsed+=dt;s.danger=Math.max(0,s.danger-dt);}
  else s.danger+=dt;
  if(s.danger>2){s.falls++;s.elapsed=0;s.danger=0;s.value=.5;return 'retry';}
  return s.elapsed>=30?'complete':undefined;
 },
 joke(s){return s.kind==='balance'?'Again. The floor is getting excellent practice.':'A little less spectacular. A little more green.';},
 labels(s){return s.kind==='pattern'?['LOW / LEFT','HIGH / RIGHT']:s.kind==='balance'?['LEAN LEFT','LEAN RIGHT']:s.kind==='pins'?['WAIT','ENGAGE PINS']:['EASE BRAKE','ADD PRESSURE'];},
 status(s){return s.kind==='pins'?'Rotation zero. Hold right to engage the parking pins.':s.kind==='brake'?`${Math.floor(s.elapsed)} of 30 seconds · Independent hydraulics / keep the pointer in green`:null;},
 success:'Thirty. No borrowed seconds. Seven people home.',endImage:'assets/b3/p25a.webp',
 draw
};
