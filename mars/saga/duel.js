import {createMatch,stepMatch,botInput,CALM_PACE} from './runtime/engine.js';
// The public engine is byte-identical. Only this match's story rules are new.
export function createDuel(settings={},compact=false){
 const match=createMatch({characters:['iona','rook'],controllers:['human','bot'],arena:'yard',rule:'stocks',stocks:2,duration:360,assist:settings.assist,difficulty:settings.assist?0:1,compact,seed:15112705});
 const factor=compact?.63:1;
 match.platforms=[['story-deck',-510,270,1020,'fixed'],['left',-440,80,235,'drift'],['right',205,80,235,'drift'],['story-bridge',-110,-80,220,'fixed'],['catch-port',-650,410,160,'recovery'],['catch-starboard',490,410,160,'recovery']].map(([id,x,y,w,kind])=>({id,x:x*factor,y,w:w*factor,h:22,kind,active:true,warning:false,baseX:x*factor,baseY:y,previousX:x*factor,previousY:y}));
 match.nextItem=12;match.fighters.forEach((f,i)=>{f.x=(i?150:-150)*factor;f.y=270;f.platformId='story-deck';});
 return {version:2,match,calm:settings.calm,paceRemainder:0,time:0,done:false,failed:false,specialWarning:0,specialCooldown:12,rookMove:'',events:[]};
}
export function stepDuel(s,input={},dt=1/60){
 if(s.done||s.failed)return;s.events=[];s.pendingJump ||= input.jumpPressed;s.pendingSpecial ||= input.line;
 s.paceRemainder+=s.calm?CALM_PACE:1;if(s.paceRemainder<1)return;s.paceRemainder--;s.time+=dt;
 const m=s.match,own=m.fighters[0],rival=m.fighters[1];
 const ai=botInput(m,1);s.specialCooldown-=dt;
 if(s.specialCooldown<1.6&&s.specialCooldown>0){s.rookMove='MAJESTIC EMERGENCY EXIT / JET RETURN';s.specialWarning=s.specialCooldown;ai.shoot=false;ai.move=Math.abs(rival.x)<70?0:-Math.sign(rival.x);}
 else s.rookMove='';
 if(s.specialCooldown<=0){ai.special=true;ai.shoot=true;ai.aimX=Math.sign(own.x-rival.x);ai.aimY=-.5;s.specialCooldown=14;s.events.push({type:'special'});}
 if(m.assist&&m.tick%150>90)ai.shoot=false;
 stepMatch(m,[{move:input.x||0,jump:Boolean(s.pendingJump),shoot:Boolean(input.shoot||input.action||input.actionPressed),special:Boolean(s.pendingSpecial),aimX:input.aimX||0,aimY:input.aimY||0},ai],dt);
 s.pendingJump=false;s.pendingSpecial=false;s.events.push(...m.events);
 s.done=m.phase==='finished'&&m.winner===0;s.failed=m.phase==='finished'&&m.winner!==0;
}
