import { COURSE, RANKS, SIGNATURES, COMMS, pictogram } from './academy.js';
const $=s=>document.querySelector(s);
export class FleetScreen{
 constructor(sound,voices){
  this.sound=sound;this.voices=voices;this.dialog=$('#fleet-screen');this.finish=()=>{};
  $('#fleet-skip').addEventListener('click',()=>this.finish());
  this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.finish();});
  this.dialog.addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='Space'){e.preventDefault();this.finish();}});
 }
 get open(){return this.dialog.open;}
 show({lesson=COURSE[0],character=null,after=false}={}){
  this.finish();this.sound.music('broadcast');
  const c=character,signature=c&&SIGNATURES[c.id],n=COURSE.indexOf(lesson);
  $('#fleet-label').textContent=c?'MEET YOUR RECOVERY SERVICE':'YOUR FUTURE / BROADCAST APPROVED';
  $('#fleet-headline').textContent=c?c.name.toUpperCase()+'. '+c.specialName.toUpperCase()+'.':after?'EVERY FALL. A STEP FORWARD.':lesson.headline;
  $('#fleet-copy').textContent=c?signature.pitch:after?'The camera has found your good side. It was facing the floor.':lesson.copy;
  $('#fleet-face').src='assets/'+(c?c.id:'beam')+'-victory.webp';
  $('#fleet-face').alt=c?c.name+' demonstrating a victory pose':'Captain Beam presenting the fleet broadcast';
  $('#fleet-seal').innerHTML=c?signature.seal.replace(' / ','<br><b>')+'</b>':'FLEET<br><b>APPROVED</b><br>BY THE FLEET';
  $('#fleet-section').textContent=c?'PERSONNEL / SIGNATURE MANOEUVRE':lesson.section;
  $('#fleet-pictogram').innerHTML=pictogram(c?'salute':lesson.icon);
  $('#fleet-lesson').textContent=c?c.specialName:lesson.title;
  $('#fleet-rule').textContent=c?signature.passive+' — '+signature.detail:lesson.rule;
  $('#fleet-order').textContent=c?'Press G, the SPECIAL touch button, or B on your controller.':lesson.order;
  $('#fleet-safety').textContent=COMMS.safety[(Math.max(0,n)+(after?1:0))%COMMS.safety.length];
  $('#fleet-poll').textContent=lesson.poll;
  $('#fleet-ticker').textContent=COMMS.tickers[(Math.max(0,n)+(after?1:0))%COMMS.tickers.length]+'    /    '+COMMS.tickers[(Math.max(0,n)+1)%COMMS.tickers.length];
  $('#fleet-serial').textContent=c?'FLEET PERSONNEL / '+c.role:after?'VICTORY WINDOW / AFTER ACTION':'FLEET HANDBOOK / 2705';
  const voice=!c&&this.voices.find(v=>v.id===(after?'finish':'open'));
  let original=$('#fleet-original');
  if(!original){original=document.createElement('p');original.id='fleet-original';original.style.cssText='font-size:10px;margin-top:10px;color:#586963';$('#fleet-count').before(original);}
  original.textContent=voice?voice.text+' — BEAM / '+voice.source:'New game text / no new spoken performance.';
  if(voice)this.sound.say(voice);
  this.dialog.showModal();
  return new Promise(resolve=>{
   const padSkip=()=>Array.from(navigator.getGamepads?.()||[]).some(p=>p?.connected&&(p.buttons?.[0]?.pressed||p.buttons?.[9]?.pressed));
   let left=6,last=performance.now(),skipHeld=padSkip();
   const timer=setInterval(()=>{
    const now=performance.now();
    const skip=padSkip();if(skip&&!skipHeld){this.finish();return;}skipHeld=skip;
    if(!document.hidden&&document.hasFocus())left-=(now-last)/1000;
    last=now;
    $('#fleet-count').textContent='TRANSMISSION '+Math.max(0,Math.ceil(left))+'s / ALWAYS SKIPPABLE';
    $('.fleet-progress i').style.transform='scaleX('+Math.max(0,left/6)+')';
    if(left<=0)this.finish();
   },50);
   this.finish=()=>{clearInterval(timer);this.finish=()=>{};this.dialog.close();this.sound.stopVoice();resolve();};
  });
 }
}
export function renderCourse(record,selected,onSelect){
 const map=$('#course-map');map.replaceChildren();
 COURSE.forEach((lesson,index)=>{
  const passed=Boolean(record.lessons?.[index]?.passed),unlocked=index===0||Boolean(record.lessons?.[index-1]?.passed);
  const button=document.createElement('button');button.className='course-step'+(passed?' done':'');button.type='button';button.disabled=!unlocked;
  button.setAttribute('aria-pressed',String(index===selected));button.setAttribute('aria-label',lesson.title+'. '+(passed?'Passed. Replay available.':unlocked?'Ready to train.':'Complete the previous lesson.'));
  button.innerHTML='<small>'+String(index+1).padStart(2,'0')+' / FIELD MANUAL</small><strong>'+lesson.title+'</strong><span>'+(passed?'GRADE '+record.lessons[index].grade:unlocked?'REPORT FOR TRAINING':'AWAITING PREVIOUS PASS')+'</span>';
  button.removeAttribute('aria-label');button.addEventListener('click',()=>onSelect(index));map.append(button);
 });
 const passed=(record.lessons||[]).filter(l=>l?.passed).length;
 $('#cadet-rank').textContent=RANKS[Math.min(7,passed)].toUpperCase();
 $('#course-count').textContent=String(passed).padStart(2,'0')+' / 07';
 $('#course-note').textContent=passed===7?'GRADUATED / Pip and the golden Victory Lap are unlocked.':'CURRENT DIRECTIVE / '+COURSE[selected].target;
}
