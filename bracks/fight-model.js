/* Pure simulation. Seconds, arena units 0..1000. No DOM, clock or randomness.
 * step mutates/returns state. strike/dodge use rising edges; release between uses.
 * Paused calls do nothing. At most 0.1 seconds accepted per call, internally 120 Hz.
 * events contains events from this call only; use for sound/impact, never game logic.
 */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FightModel=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const TICK=1/120, DURATIONS={rest:.9,telegraph:.95,punch:.18,recovery:1.15};
  const HASK=Object.freeze(Object.entries(DURATIONS).map(([phase,duration])=>Object.freeze({phase,duration})));
  function pattern(value=HASK){
    if(!Array.isArray(value)||value.length<4||value.length>16)throw new Error('Invalid attack sequence');
    const result=value.map((v,i)=>{
      if(!v||!Object.hasOwn(DURATIONS,v.phase)||!Number.isFinite(v.duration)||v.duration<.1||v.duration>10)throw new Error('Invalid attack stage');
      if(v.phase==='punch'&&(i===0||value[i-1].phase!=='telegraph'))throw new Error('Every punch needs a warning');
      if(v.phase==='telegraph'&&value[i+1]?.phase!=='punch')throw new Error('Warning must lead to a punch');
      if((v.phase==='rest'&&i!==0)||(v.phase==='recovery'&&i!==value.length-1))throw new Error('Opening only after the full sequence');
      if(v.attackType!==undefined&&!['long','short'].includes(v.attackType))throw new Error('Invalid contact type');
      return Object.freeze({phase:v.phase,duration:v.duration,...(v.attackType?{attackType:v.attackType}:{})});
    });
    if(result[0].phase!=='rest'||result.at(-1).phase!=='recovery')throw new Error('Sequence needs rest and recovery');
    return Object.freeze(result);
  }
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function create(sequence,options){const state={sequence:pattern(sequence),stage:0,phase:'fight',elapsed:0,accumulator:0,previous:{strike:false,dodge:false},pending:{strike:false,dodge:false},
    player:{x:420,hp:100,stamina:100,pose:'idle',action:'idle',actionTime:0,cooldown:0,hitTime:0,hitDone:false,invulnerable:false},
    enemy:{x:580,hp:100,phase:'rest',elapsed:0,hitDone:false,countered:false,hitTime:0,pose:'idle'},
    stats:{strikes:0,counters:0,earlyStrikes:0,missedStrikes:0,blockedStrikes:0,hitsTaken:0,stoodInReach:0,guards:0,dodges:0,evaded:0,missedWindows:0,exhausted:0},events:[]};
    if(options?.pressing){state.pressing={cycle:0,firstGuarded:false};Object.assign(state.stats,{prematureResponses:0,droppedGuard:0,cornered:0});}
    if(options?.reading){
      const r=options.reading;
      if(!Array.isArray(r.attacks)||!r.attacks.length||r.attacks.some(a=>a!=='long'&&a!=='short')||![r.longRecovery,r.shortRecovery].every(v=>Number.isFinite(v)&&v>=.2&&v<=10))throw new Error('Invalid reading pattern');
      state.reading={cycle:0,attacks:Object.freeze([...r.attacks]),longRecovery:r.longRecovery,shortRecovery:r.shortRecovery};
      state.enemy.attackType=r.attacks[0];Object.assign(state.stats,{longRetreats:0,shortGuards:0,missedShortWindows:0});
    }
    if(options?.combination){
      const c=options.combination;
      if(!Array.isArray(c.attacks)||!c.attacks.length||c.attacks.some(a=>a!=='long'&&a!=='short'))throw new Error('Invalid combination pattern');
      state.combination={cycle:0,attacks:Object.freeze([...c.attacks]),longSequence:pattern(c.longSequence),shortSequence:pattern(c.shortSequence)};
      state.enemy.attackType=c.attacks[0];state.sequence=state.combination[state.enemy.attackType+'Sequence'];
      Object.assign(state.stats,{longRetreats:0,shortGuards:0,prematureResponses:0,missedReachWindows:0});
    }
    if(options?.technician){
      const t=options.technician, sequences={};
      for(const key of ['A','B','C'])sequences[key]=pattern(t.sequences[key]);
      if(![t.first,t.second].every(a=>Array.isArray(a)&&a.length&&a.every(k=>sequences[k])))throw new Error('Invalid technician pattern');
      state.technician={round:1,cycle:0,resetDone:false,resetDuration:t.resetDuration,first:Object.freeze([...t.first]),second:Object.freeze([...t.second]),sequences:Object.freeze(sequences)};
      state.enemy.combinationType=t.first[0];state.sequence=sequences[t.first[0]];state.enemy.attackType=state.sequence[1].attackType;
      Object.assign(state.stats,{longRetreats:0,shortGuards:0,prematureResponses:0,mixedLongMisses:0,rhythmChanges:0,missedReachWindows:0});
    }
    if(options?.spacing){
      state.spacing={drain:500,frontFoot:30,baseX:660,lungeX:600,cycle:0,dwell:0,dwellTimes:Object.freeze([.25,.45,.6,.35,.525])};
      state.enemy.x=state.spacing.baseX;
      Object.assign(state.stats,{guardBreaks:0,drainHits:0});
    }
    return state;}
  function emit(s,type){s.events.push({type,time:s.elapsed});}
  function finish(s,phase){s.phase=phase;s.player.invulnerable=false;s.player.pose=phase==='won'?'victory':'defeat';s.enemy.pose=phase==='won'?'defeat':'idle';emit(s,phase);}
  function enemyTransition(s){const e=s.enemy;
    if((s.combination||s.technician)&&e.phase==='recovery'&&!e.countered&&e.x-s.player.x>205)s.stats.missedReachWindows++;
    if(s.technician){const t=s.technician;
      if(e.phase==='recovery'){
        if(!e.countered)s.stats.missedWindows++;
        if(e.hp<=60&&!t.resetDone){t.resetDone=true;t.round=2;t.cycle=0;s.stats.rhythmChanges++;e.phase='reset';e.elapsed=0;e.visualFromX=e.x;e.x=Math.min(910,Math.max(e.x+240,s.player.x+300));t.resetBarrierX=Math.max(s.player.x,e.x-260);emit(s,'rhythm-change');return;}
        t.cycle++;
      }
      if(e.phase==='recovery'||e.phase==='reset'){
        const list=t.round===1?t.first:t.second;e.combinationType=list[t.cycle%list.length];s.sequence=t.sequences[e.combinationType];s.stage=0;
      }else s.stage++;
      e.phase=s.sequence[s.stage].phase;e.elapsed=0;
      if(s.sequence[s.stage].attackType)e.attackType=s.sequence[s.stage].attackType;
      else if(e.phase==='rest')e.attackType=s.sequence[1].attackType;
      if(e.phase==='telegraph')emit(s,'telegraph');
      if(e.phase==='punch'){e.hitDone=false;if(e.attackType==='long'){e.visualFromX=e.x;e.x=s.player.x+160;}emit(s,'enemy-strike');}
      if(e.phase==='recovery')e.countered=false;
      return;
    }
    if(e.phase==='recovery'&&!e.countered)s.stats.missedWindows++;
    if(s.reading&&e.phase==='recovery'&&e.attackType==='short'&&!e.countered)s.stats.missedShortWindows++;
    s.stage=(s.stage+1)%s.sequence.length;e.phase=s.sequence[s.stage].phase;
    if(s.spacing&&s.stage===0){s.spacing.cycle++;s.spacing.dwell=0;e.x=s.spacing.baseX;}
    if(s.spacing&&e.phase==='punch')e.x=s.spacing.lungeX;
    if(s.pressing&&s.stage===0){s.pressing.cycle++;s.pressing.firstGuarded=false;}
    if(s.reading&&s.stage===0){s.reading.cycle++;e.attackType=s.reading.attacks[s.reading.cycle%s.reading.attacks.length];}
    if(s.combination&&s.stage===0){s.combination.cycle++;e.attackType=s.combination.attacks[s.combination.cycle%s.combination.attacks.length];s.sequence=s.combination[e.attackType+'Sequence'];}
    if(e.phase==='telegraph')emit(s,'telegraph');
    if(e.phase==='punch'){e.hitDone=false;emit(s,'enemy-strike');}
    if(e.phase==='recovery')e.countered=false;
    e.elapsed=0;
  }
  function tick(s,input){
    const p=s.player,e=s.enemy,st=s.stats,dt=TICK;
    s.elapsed+=dt;p.cooldown=Math.max(0,p.cooldown-dt);p.hitTime=Math.max(0,p.hitTime-dt);e.hitTime=Math.max(0,e.hitTime-dt);
    if(p.action!=='idle'){p.actionTime+=dt;if(p.actionTime>=(p.action==='strike'?.48:.36)){p.action='idle';p.actionTime=0;}}
    if(s.pending.dodge){s.pending.dodge=false;if(p.action==='idle'&&p.cooldown<=0&&p.stamina>=26){p.stamina-=26;p.action='dodge';p.actionTime=0;p.cooldown=.95;st.dodges++;emit(s,'dodge');}else if(p.stamina<26)st.exhausted++;}
    if(s.pending.strike){s.pending.strike=false;if(p.action==='idle'&&p.stamina>=24){p.stamina-=24;p.action='strike';p.actionTime=0;p.hitDone=false;st.strikes++;if(e.phase==='telegraph')st.earlyStrikes++;if((s.pressing||(s.combination&&e.attackType==='short')||(s.technician&&e.combinationType!=='A'))&&((s.stage===2&&e.hitDone)||s.stage===3||(s.stage===4&&!e.hitDone)))st.prematureResponses++;emit(s,'player-strike');}else if(p.stamina<24)st.exhausted++;}
    const guard=!!input.guard&&p.action==='idle'&&p.stamina>0;
    const dir=(input.right?1:0)-(input.left?1:0);
    if(p.action==='idle')p.x+=dir*(guard?105:230)*dt;
    if(p.action==='dodge')p.x-=285*dt;
    p.x=clamp(p.x,90,s.technician&&e.phase==='reset'?s.technician.resetBarrierX:e.x-100);
    p.invulnerable=p.action==='dodge'&&p.actionTime>=.05&&p.actionTime<.27;
    // Hask approaches only between attacks. His sequence never reads action input.
    if(e.phase==='rest'&&!s.spacing)e.x+=clamp(p.x+(s.pressing&&s.pressing.cycle%2===1?115:160)-e.x,-100*dt,100*dt);
    e.x=clamp(e.x,p.x+100,910);
    e.elapsed+=dt;
    const duration=s.technician&&e.phase==='reset'?s.technician.resetDuration:s.reading&&e.phase==='recovery'?s.reading[e.attackType+'Recovery']:s.sequence[s.stage].duration;
    if(s.spacing&&e.phase==='rest'){
      const z=s.spacing;
      z.dwell=p.x+z.frontFoot>=z.drain?z.dwell+dt:0;
      if(z.dwell+1e-9>=z.dwellTimes[z.cycle%z.dwellTimes.length])enemyTransition(s);
    }else if(e.elapsed+1e-9>=duration)enemyTransition(s);
    const distance=e.x-p.x;
    if(p.action==='strike'&&p.actionTime>=.13&&!p.hitDone){
      p.hitDone=true;
      if(distance>205){st.missedStrikes++;emit(s,'player-miss');}
      else if(e.phase==='recovery'&&!e.countered){e.hp=Math.max(0,e.hp-20);e.countered=true;e.hitTime=.22;st.counters++;emit(s,'counter');}
      else {st.blockedStrikes++;if(s.spacing)p.stamina=Math.max(0,p.stamina-12);emit(s,'enemy-block');}
    }
    if(e.hp<=0){finish(s,'won');return;}
    // Resolve once at contact, not on every animation frame or on later approach.
    if(e.phase==='punch'&&e.elapsed>=.05&&!e.hitDone){
      e.hitDone=true;
      if(s.spacing){
        if(p.x+s.spacing.frontFoot<s.spacing.drain){st.evaded++;emit(s,'enemy-miss');}
        else {p.hp=Math.max(0,p.hp-25);p.hitTime=.3;st.hitsTaken++;st.drainHits++;st.stoodInReach++;
          if(input.guard){p.stamina=Math.max(0,p.stamina-45);st.guardBreaks++;emit(s,'guard-hit');}else emit(s,'player-hit');}
      }
      else if(s.reading||s.combination||s.technician){
        const long=e.attackType==='long',cost=long?24:44;
        if(!long&&(distance>190||p.invulnerable)){st.evaded++;emit(s,'enemy-miss');}
        else if(guard&&p.stamina>=cost){p.stamina-=cost;p.hp=Math.max(0,p.hp-(long?0:18));st.guards++;if(!long)st.shortGuards++;p.hitTime=.18;emit(s,'guard-hit');}
        else {p.hp=Math.max(0,p.hp-25);p.hitTime=.3;st.hitsTaken++;st.stoodInReach++;if(p.stamina<cost)st.exhausted++;if(s.technician&&long){if(e.combinationType==='C')st.mixedLongMisses++;else if(dir<0||p.action==='dodge'||distance>190)st.longRetreats++;}else if(long&&(dir<0||p.action==='dodge'||distance>190))st.longRetreats++;if(!long&&input.guard)st.shortGuards++;emit(s,'player-hit');}
      }
      else if(distance>190||p.invulnerable){st.evaded++;emit(s,'enemy-miss');}
      else if(guard&&p.stamina>=(s.pressing?24:30)){p.stamina-=s.pressing?24:30;p.hp=Math.max(0,p.hp-8);st.guards++;p.hitTime=.18;if(s.pressing&&s.stage===2)s.pressing.firstGuarded=true;emit(s,'guard-hit');}
      else {p.hp=Math.max(0,p.hp-(s.pressing?18:25));p.hitTime=.3;st.hitsTaken++;st.stoodInReach++;if(p.stamina<(s.pressing?24:30))st.exhausted++;if(s.pressing){if(s.stage===4&&s.pressing.firstGuarded&&!guard)st.droppedGuard++;if(p.x<=125)st.cornered++;}emit(s,'player-hit');}
    }
    if(p.hp<=0){finish(s,'lost');return;}
    if(s.elapsed+1e-9>=120){s.elapsed=120;finish(s,'lost');emit(s,'timeout');return;}
    if(guard)p.stamina=Math.max(0,p.stamina-9*dt);
    else if(p.action==='idle')p.stamina=Math.min(100,p.stamina+(distance>195?30:15)*dt);
    p.pose=p.hitTime>0?'hurt':p.action==='strike'?(p.actionTime<.13?'windup':p.actionTime<.25?'punch':'recover'):p.action==='dodge'?'dodge':guard?'guard':dir?'walk':'idle';
    e.pose=e.phase==='reset'?'guard':e.hitTime>0?'hurt':e.phase==='telegraph'?'windup':e.phase==='punch'?'punch':e.phase==='recovery'?'recover':'idle';
  }
  function step(s,dt,input){
    input=input||{};
    if(input.paused||s.phase!=='fight'||!Number.isFinite(dt)||dt<=0)return s;
    s.events=[];
    for(const key of ['strike','dodge']){if(input[key]&&!s.previous[key])s.pending[key]=true;s.previous[key]=!!input[key];}
    s.accumulator+=Math.min(.1,dt);
    while(s.accumulator+1e-10>=TICK&&s.phase==='fight'){s.accumulator-=TICK;tick(s,input);}
    return s;
  }
  // Index maps exactly to the four supplied defeat-feedback lines, no new prose.
  function feedback(s){const st=s.stats;const scores=s.technician?[st.longRetreats,st.prematureResponses,st.mixedLongMisses,st.missedWindows]:s.combination?[st.longRetreats,st.prematureResponses,st.shortGuards,st.missedWindows]:s.spacing?[st.blockedStrikes,st.guardBreaks,st.drainHits-st.guardBreaks,st.missedWindows]:s.reading?[st.longRetreats,st.shortGuards,2*Math.min(st.longRetreats,st.shortGuards),st.missedShortWindows]:s.pressing?[st.prematureResponses,st.droppedGuard,st.missedWindows,st.cornered]:[st.earlyStrikes,st.stoodInReach,st.missedWindows,st.exhausted];if(s.elapsed>=120)scores[s.reading||s.spacing||s.combination||s.technician?3:2]+=1;let best=s.technician?3:s.combination?3:s.spacing?3:s.reading?2:s.pressing?2:1;for(let i=0;i<4;i++)if(scores[i]>scores[best])best=i;return best;}
  // Preserve brief presses between display frames, only until the next simulation tick.
  // One pending intent per action: this is not a combo queue or an automatic retry.
  function press(s,action){if(s.phase==='fight'&&(action==='strike'||action==='dodge'))s.pending[action]=true;}
  function clearPresses(s){s.pending.strike=false;s.pending.dodge=false;}
  function advice(s){const index=feedback(s);if((s.combination||s.technician)&&index===3&&!s.stats.missedReachWindows)return null;return index;}
  return {create,step,feedback,advice,press,clearPresses,pattern,HASK,TICK,DURATIONS};
});
