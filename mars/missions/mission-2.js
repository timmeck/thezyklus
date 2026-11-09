import {clamp} from '../sim.js';
import {art,draw} from './scene-2.js';
export const mission={
 art,
 moments:{2:{image:'assets/b2/p30a.webp',title:'Everybody.',number:'14 / 14',text:'Twelve children. Two adults. All here.',quote:'rescue',next:'Take Sera’s hand →'}},
 id:2,title:'Hold the Gate',badge:'Still here',subtitle:'THE CATCH, NOT THE WEIGHT OF THE GATE.',
 stages:[
  {title:'01 / The retaining catch',text:'Keep the red-striped bar in the green pressure band. Left eases pressure; right adds it. The gate’s own supports carry the load. You are keeping its catch engaged.',image:'assets/b2/p20a.webp',duration:32,kind:'pressure'},
  {title:'02 / Rolling. Slowly.',text:'Rook is towing the pod. Tavi has the handwheel, Crell the secondary catch, Sera your back. The children stop tapping. Watch the band; it stays visible with sound off.',image:'assets/b2/p26a.webp',duration:34,kind:'pressure'},
  {title:'03 / The last glove',text:'One more length of pod. The safe band moves as the load settles. Follow it with small adjustments. A slip returns to this checkpoint; nobody is lost.',image:'assets/b2/p23a.webp',duration:34,kind:'pressure'},
  {title:'04 / Leave the bar',text:'All fourteen passengers are clear. The bent bar stays in the catch. Hold the right control to take Sera’s offered hand and move into the safe berth.',image:'assets/b2/p30a.webp',duration:8,kind:'exit'}
 ],
 create(stage=0){const s={stage,falls:0,feedback:''};this.setup(s);return s;},
 setup(s){Object.assign(s,{kind:this.stages[s.stage].kind,elapsed:0,value:this.stages[s.stage].kind==='exit'?0:.5,target:.5,danger:0,duration:this.stages[s.stage].duration});},
 update(s,dt,input,assist){
  const old=s.elapsed;s.elapsed+=dt;
  if(s.kind==='exit'){
   if(input.axis>.25||assist)s.value=clamp(s.value+dt/8,0,1);else s.value=clamp(s.value-dt*.02,0,1);
   return s.value>=1?'complete':undefined;
  }
  s.target=.5+Math.sin(s.elapsed*.49+s.stage)*.16+Math.sin(s.elapsed*1.12)*.05;
  s.value=clamp(s.value+(input.axis*.32-.035+Math.sin(s.elapsed*2.3)*.025+(assist?(s.target-s.value)*1.8:0))*dt,.02,.98);
  const width=assist?.24:.14;
  if(Math.abs(s.value-s.target)>width)s.danger+=dt;else s.danger=Math.max(0,s.danger-dt*2);
  if(s.danger>2){s.falls++;s.elapsed=0;s.value=.5;s.danger=0;return 'retry';}
  if(s.elapsed>=s.duration)return 'complete';
 },
 joke(s){return ['A vigorous demonstration of why there are two catches.','The promotional version will call that a rehearsal.','Sera has your back. Try that section again.'][s.falls%3];},
 labels(s){return s.kind==='exit'?['STAY BRACED','TAKE HER HAND']:['EASE','ADD PRESSURE'];},
 status(s){return s.kind==='exit'?'All fourteen passengers are clear. Hold right to take Sera’s hand.':`${Math.floor(s.elapsed)} of ${s.duration} seconds · Follow the green pressure band`;},
 success:'Twelve children. Two adults. All here.',endImage:'assets/b2/p34d.webp',failureImage:'assets/b2/p06a.webp',
 draw
};
