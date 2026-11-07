import {balance,initBalance,initPattern,pattern} from '../sim.js';
import {art,draw} from './scene-1.js';
export const mission={
 art,
 id:1,title:'Heavy Room',badge:'Upright, eventually',subtitle:'EARTH GRAVITY. MARTIAN LEGS.',
 stages:[
  {title:'01 / Meet the floor',text:'Keep Rook inside the centre marks for 12 seconds. Hold left or right to lean back towards the middle. Small corrections work better than heroic ones.',image:'assets/b1/p02a.webp',kind:'balance',duration:12,quotePanel:'p02a'},
  {title:'02 / Brace. Then reach.',text:'Twenty seconds. The load is rising. Your balance carries through this interval. A padded landing restarts only this exercise.',image:'assets/b1/p04c.webp',kind:'balance',duration:20},
  {title:'03 / The heavy setting',text:'Thirty seconds in the simulator. This is your practice record, not a rewrite of Rook’s twelve-second first attempt in the story.',image:'assets/b1/p02d.webp',kind:'balance',duration:30},
  {title:'04 / The expensive lullaby',text:'Watch the two contacts. Answer LOW with left, then HIGH with right in the glowing windows. Leave the empty interval untouched. Six phrases open the way home.',image:'assets/b1/p34a.webp',kind:'pattern'}
 ],
 create(stage=0){const s={stage,falls:0,feedback:''};this.setup(s);return s;},
 setup(s){s.personLabel='ROOK';const p=this.stages[s.stage];if(p.kind==='balance')initBalance(s,p.duration);else initPattern(s,[[0,1]],6);},
 update(s,dt,input,assist){return s.kind==='balance'?balance(s,dt,input.axis,assist):pattern(s,dt,input,assist);},
 joke(s){return ['A decisive advance towards the floor.','Outstanding commitment to horizontal thinking.','The padded deck accepts your application.'][s.falls%3];},
 labels(s){return s.kind==='pattern'?['LOW','HIGH']:['LEAN LEFT','LEAN RIGHT'];},
 success:'Five voices. Five people. All home.',
 endImage:'assets/b1/p36a.webp',failureImage:'assets/b1/p03d.webp',
 draw
};
