export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function balance(s,dt,axis,assist){
  s.elapsed+=dt;
  const breeze=Math.sin(s.elapsed*1.33+.4)*.24+Math.sin(s.elapsed*2.71)*.13;
  s.velocity+=(breeze+s.angle*.28+axis*1.22-s.velocity*1.9-(assist?s.angle*2.5:0))*dt;
  s.angle+=s.velocity*dt;
  s.value=s.angle;
  if(Math.abs(s.angle)>.72){s.falls++;s.angle=0;s.velocity=0;s.elapsed=0;return 'retry';}
  if(s.elapsed>=s.duration)return 'complete';
}
export function initBalance(s,duration){Object.assign(s,{kind:'balance',duration,elapsed:0,angle:.025,velocity:0,value:0});}
export function initPattern(s,patterns,cycles=1){Object.assign(s,{kind:'pattern',elapsed:0,patterns,cycle:0,cycles,hits:0,answered:[],duration:patterns.length*cycles*8});}
// Each cycle: a visible demonstration, a gap, then a separate response window.
export function pattern(s,dt,input,assist){
  s.elapsed+=dt;
  const length=8, index=Math.min(s.patterns.length-1,Math.floor(s.cycle/s.cycles));
  const p=s.patterns[index];s.pattern=p;s.beat=s.elapsed%length;s.patternIndex=index;
  const pressed=input.leftTap?0:input.rightTap?1:null;
  const targetTimes=p.map((_,i)=>4.4+i*.72);
  if(pressed!==null){
    const pos=s.answered.length,t=targetTimes[pos];
    if(t!==undefined&&Math.abs(s.beat-t)<(assist?.62:.38)&&pressed===p[pos]){s.answered.push(pressed);s.hits++;s.feedback='Contact confirmed';}
    else{s.feedback='Leave the silence. Try the same phrase again.';s.elapsed=Math.floor(s.elapsed/length)*length;s.answered=[];s.falls++;return 'retry';}
  }
  if(s.beat>7.6){
    if(s.answered.length===p.length){s.cycle++;s.answered=[];s.elapsed=s.cycle*length;if(s.cycle>=s.patterns.length*s.cycles)return 'complete';return 'checkpoint';}
    s.elapsed=s.cycle*length;s.answered=[];s.feedback='Listen once. Answer in the marked windows.';s.falls++;return 'retry';
  }
}
