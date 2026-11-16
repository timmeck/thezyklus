// Six original arrangements of the crew's return motif. Entirely synthesized.
// 32-beat phrases, functional harmony, bass voice leading and danger stems.
export const SCORES={
 academy:{title:'A Floor Worth Fighting',bpm:98,root:50,mode:[0,2,4,7,9],melody:[0,2,3,2,1,0,4,3,2,1,0,1,2,4,3,1],chords:[0,5,7,0],wave:'triangle'},
 needlewake:{title:'Five Places at the Table',bpm:82,root:48,mode:[0,2,3,7,10],melody:[0,3,4,3,2,1,0,2,3,4,2,3,1,0,2,1],chords:[0,3,5,7],wave:'sine'},
 hangar:{title:'The Silhouette of Confidence',bpm:112,root:53,mode:[0,2,4,7,9],melody:[0,0,2,3,4,3,2,1,0,2,1,3,2,4,3,0],chords:[0,7,5,0],wave:'triangle'},
 clock:{title:'Leave the Silence',bpm:66,root:40,mode:[0,2,5,7,10],melody:[0,2,4,-1,1,3,-1,-1,2,0,3,-1,4,2,-1,-1],chords:[0,5,3,0],wave:'sine'},
 flight:{title:'Everybody Gets Home',bpm:132,root:52,mode:[0,2,3,7,10],melody:[0,2,3,4,3,2,0,1,2,3,4,3,1,2,0,4],chords:[0,5,3,7],wave:'triangle'},
 duel:{title:'Paint Washes Off',bpm:126,root:47,mode:[0,2,4,7,9],melody:[0,2,0,3,2,4,3,1,0,3,2,4,1,2,3,0],chords:[0,5,7,5],wave:'triangle'},
};
const hz=n=>440*Math.pow(2,(n-69)/12);
export function scoreBeat(a,zone,danger){
 const s=SCORES[zone]||SCORES.academy;
 if(a.scoreZone!==zone){a.scoreZone=zone;a.beat=0;a.nextBeat=a.context.currentTime+.025;}
 const interval=60/s.bpm/2;
 if(a.nextBeat<a.context.currentTime-.3)a.nextBeat=a.context.currentTime+.02;
 while(a.nextBeat<a.context.currentTime+.12){
  const n=a.beat++,bar=Math.floor(n/8),chord=s.chords[Math.floor(n/16)%4],delay=Math.max(0,a.nextBeat-a.context.currentTime);
  const degree=s.melody[Math.floor(n/2)%s.melody.length];
  if(n%2===0&&degree>=0)a.tone(hz(s.root+24+s.mode[degree]),interval*2.8,.095,s.wave,delay);
  if(n%4===0){a.tone(hz(s.root-12+chord),interval*3.8,.14,'sine',delay);a.tone(hz(s.root+chord),interval*3.3,.035,'triangle',delay);}
  if(n%8===0){for(const d of [0,7,12])a.tone(hz(s.root+chord+d),interval*7.7,.022,'sine',delay);}
  if(zone!=='clock'&&(n%4===0||danger&&n%4===2))a.drum('kick',delay,.12);
  if(zone!=='clock'&&n%8===4)a.drum('snare',delay,.055);
  if(danger){a.drum('hat',delay,.024);if(n%2===1)a.tone(hz(s.root+12+s.mode[n%5]),interval*.7,.042,'triangle',delay);}
  if(zone==='clock'&&n%16===10)a.tone(hz(64),1.7,.09,'sine',delay);
  a.nextBeat+=interval;
 }
}
