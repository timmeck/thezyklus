import {store} from './store.js';
import {clamp} from './sim.js';
import {loadArt} from './manga.js';
const $=s=>document.querySelector(s);
let mission,state,mode='closed',last=0,raf=0,priorFocus=null,content,closeAudio=()=>{},makeQuote=null,sound=false,ac;
const keys=new Set(),touch=new Set();let leftTap=false,rightTap=false,padPrevious=[],retryMessage='',lastStatus='',beepKey='';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let canvas,ctx,dialog,pixelRatio=1;
let modeAge=0,thumbAxis=0,thumbOrigin=null,loading=false,pauseReturn='running',openEpoch=0;
function tone(freq=200,duration=.12){if(!sound)return;try{ac??=new AudioContext();ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.08,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+duration);}catch{}}
function controls(){
 const pads=navigator.getGamepads?.()||[];let padAxis=0;
 for(const pad of pads){if(!pad)continue;padAxis=Math.abs(pad.axes[0]||0)>.18?pad.axes[0]:0;
  if(pad.buttons[14]?.pressed)padAxis=-1;if(pad.buttons[15]?.pressed)padAxis=1;
  const l=!!pad.buttons[0]?.pressed,r=!!pad.buttons[1]?.pressed;
  if(l&&!padPrevious[0])leftTap=true;if(r&&!padPrevious[1])rightTap=true;
  if(pad.buttons[9]?.pressed&&!padPrevious[2])togglePause();
  if(l&&!padPrevious[0]&&mode!=='running'&&mode!=='paused')$('#scene-next')?.click();
  padPrevious=[l,r,!!pad.buttons[9]?.pressed];
 }
 const left=keys.has('ArrowLeft')||keys.has('a')||touch.has('left'),right=keys.has('ArrowRight')||keys.has('d')||touch.has('right');
 return {axis:clamp((right?1:0)-(left?1:0)+padAxis+thumbAxis,-1,1),leftTap,rightTap};
}
function clearInput(){thumbAxis=0;thumbOrigin=null;keys.clear();touch.clear();leftTap=rightTap=false;document.querySelectorAll('.game-control').forEach(b=>b.classList.remove('held'));}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
const paint={
 get ctx(){return ctx;},get w(){return canvas.width/pixelRatio;},get h(){return canvas.height/pixelRatio;},get assist(){return store.data.assist;},get mode(){return mode;},get age(){return modeAge;},reduced,
 roundRect,tone,
 label(t,x,y,size=14,color='#f1eadb',align='left'){ctx.font=`500 ${size}px Barlow, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(t,x,y);}
};
function resize(){if(!canvas)return;const b=canvas.getBoundingClientRect();pixelRatio=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(b.width*pixelRatio);canvas.height=Math.round(b.height*pixelRatio);}
function draw(){if(!mission||!state)return;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);mission.draw(state,paint);}
function progress(){
 const total=mission.stages.length;const p=mode==='result'?1:clamp((state.stage+Math.min(.99,(state.elapsed||0)/(state.duration||1)))/total,0,1);
 $('#mission-progress').value=p;$('#mission-step').textContent=`${String(state.stage+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
 const text=mode==='result'?'Mission complete. Your record is saved on this device.':mission.status?.(state)||(state.kind==='pattern'?`${state.feedback||'Watch first. Answer in the marked windows.'} · Phrase ${state.cycle+1}`:state.kind==='balance'?`${Math.floor(state.elapsed)} of ${state.duration} seconds · ${Math.abs(state.angle)>.45?'Correct towards the centre':'Weight inside the marks'}`:`${Math.floor(state.elapsed)} of ${state.duration} seconds · Keep the white pointer in green`);
 if(text!==lastStatus){$('#game-status').textContent=text;lastStatus=text;}
}
function tick(time){
 if(mode==='closed')return;
 const dt=Math.min(.05,Math.max(0,(time-last)/1000));last=time;
 const input=controls();if(mode!=='paused')modeAge+=dt;
 if(mode==='recovering'&&modeAge>.65){mode='running';modeAge=0;$('#pause-game').disabled=false;}
 if(mode==='falling'&&modeAge>1.05){showScene('retry');}
 if(mode==='celebrating'&&modeAge>1.2){checkpoint();}
 if(['recovering','falling','celebrating'].includes(mode)){draw();}
 if(mode==='running'){
  const result=mission.update(state,dt,input,store.data.assist);
  if(result==='complete'){if(!(mission.id===3&&state.kind==='balance'))tone(660,.2);mode='celebrating';modeAge=0;clearInput();$('#pause-game').disabled=true;}
  else if(result==='retry'){retryMessage=mission.joke(state);mode='falling';modeAge=0;clearInput();$('#pause-game').disabled=true;tone(100,.15);}
  draw();progress();
 }
 leftTap=rightTap=false;raf=requestAnimationFrame(tick);
}
function sceneImage(src,alt){const im=document.createElement('img');im.src=src;im.alt=alt;im.decoding='async';return im;}
function showScene(nextMode='brief'){
 mode=nextMode;clearInput();const overlay=$('#game-overlay');overlay.replaceChildren();overlay.hidden=false;$('#pause-game').disabled=true;
 const panel=document.createElement('div');panel.className='game-scene';overlay.dataset.scene=nextMode;
 const stage=mission.stages[state.stage],done=mode==='result';
 panel.append(sceneImage(done?mission.endImage:mode==='retry'&&mission.failureImage?mission.failureImage:stage.image,done?mission.success:stage.title));
 const body=document.createElement('div');body.className='scene-body';
 const kicker=document.createElement('p');kicker.className='eyebrow';kicker.textContent=done?'MISSION COMPLETE / RECORD SAVED':mode==='retry'?'VICTORY WINDOW / SIMULATOR CAPTION':mission.subtitle;
 const h=document.createElement('h2');h.textContent=done?mission.badge:mode==='retry'?retryMessage:stage.title;
 const p=document.createElement('p');p.textContent=done?mission.success:mode==='retry'?'You are safe in the recovery catch. This section is ready again. Earlier sections stay completed.':stage.text;
 const b=document.createElement('button');b.id='scene-next';b.className='button orange';b.textContent=done?'Back to the academy ↗':mode==='retry'?'Again →':state.stage?'Begin this section →':'Begin training →';
 b.addEventListener('click',()=>done?close():start());body.append(kicker,h,p,b);
 if(done){const exportButton=document.createElement('button');exportButton.className='text-button';exportButton.textContent='Save cadet card ↓';exportButton.addEventListener('click',()=>window.dispatchEvent(new Event('cadet-export')));body.append(exportButton);}
 if(done){const next=content.volumes.find(v=>!v.classified&&v.number===mission.id+1);if(next){const nextButton=document.createElement('button');nextButton.className='button cream next-mission';nextButton.textContent=`Next mission: ${next.mission} →`;nextButton.addEventListener('click',()=>{close();openMission(next.number);});body.append(nextButton);if(content.lateShow&&makeQuote)body.append(makeQuote(content.lateShow.opening[2],false,'PIP / ORIGINAL DUB'));}}
 panel.append(body);overlay.append(panel);if(done||mode==='retry')appendBroadcast(overlay,done);requestAnimationFrame(()=>b.focus());draw();progress();
}
function start(){closeAudio();mode='recovering';modeAge=0;$('#game-overlay').hidden=true;$('#pause-game').disabled=true;$('#pause-game').textContent='Pause';clearInput();last=performance.now();$('#game-canvas').focus();}
function checkpoint(){
 const m=mission.moments?.[state.stage];if(m){showMoment(m);return;}advanceCheckpoint();
}
function advanceCheckpoint(){
 state.stage++;
 if(state.stage>=mission.stages.length){state.stage=mission.stages.length-1;store.update(v=>{if(!v.completed.includes(mission.id))v.completed.push(mission.id);delete v.checkpoints[mission.id];});showScene('result');return;}
 store.update(v=>{v.checkpoints[mission.id]=state.stage;});mission.setup(state);setLabels();showScene();
}
function appendBroadcast(overlay,success){
 const aside=document.createElement('aside');aside.className='beam-live';
 const image=sceneImage('assets/beam.webp','Captain Beam, live from Victory Window');
 const body=document.createElement('div'),banner=document.createElement('p');banner.className='broadcast-banner';banner.textContent='● LIVE / VICTORY WINDOW';
 const cap=document.createElement('p');cap.className='broadcast-caption';cap.textContent=success?'OFFICIAL RESULT / EXTRAORDINARY SUCCESS':'OFFICIAL RESULT / STRATEGIC FLOOR CONTACT';
 body.append(banner,cap);const vol=content.volumes.find(v=>v.number===mission.id);const q=success?vol.game?.beam:content.transmission.official;
 if(q&&makeQuote)body.append(makeQuote(q,true,'BEAM / ORIGINAL DUB'));aside.append(image,body);overlay.append(aside);
 if(sound)aside.querySelector('.quote-play')?.click();
}
function showMoment(m){
 mode='moment';clearInput();$('#pause-game').disabled=true;const overlay=$('#game-overlay');overlay.hidden=false;overlay.dataset.scene='moment';overlay.replaceChildren();
 const panel=document.createElement('div');panel.className='mission-moment';panel.dataset.mission=mission.id;panel.append(sceneImage(m.image,m.text));
 const body=document.createElement('div');body.className='moment-copy';
 const k=document.createElement('p');k.className='eyebrow';k.textContent='THE PART THAT BELONGS TO YOU';
 const number=document.createElement('strong');number.className='moment-number';number.textContent=m.number;
 const title=document.createElement('h2');title.textContent=m.title;const text=document.createElement('p');text.textContent=m.text;
 body.append(k,number,title,text);const quotes=content.volumes.find(v=>v.number===mission.id).game;if(m.preQuote&&quotes?.[m.preQuote]&&makeQuote)body.append(makeQuote(quotes[m.preQuote],false,'“Thirty.” / ORIGINAL DUB'));const q=quotes?.[m.quote];if(q&&makeQuote)body.append(makeQuote(q,true,'ORIGINAL DUB'));
 const b=document.createElement('button');b.id='scene-next';b.className='button orange';b.textContent=m.next;b.addEventListener('click',()=>{closeAudio();advanceCheckpoint();});body.append(b);panel.append(body);overlay.append(panel);
 store.update(v=>{v.checkpoints[mission.id]=state.stage+1;});requestAnimationFrame(()=>b.focus());if(sound)body.querySelector('.quote-play')?.click();
}
function setLabels(){const [left,right]=mission.labels(state);$('#control-left .control-label').textContent=left;$('#control-right .control-label').textContent=right;}
function resume(){mode=pauseReturn;$('#game-overlay').hidden=true;$('#pause-game').textContent='Pause';$('#pause-game').disabled=mode!=='running';clearInput();last=performance.now();canvas.focus();}
function togglePause(){if(['running','recovering','falling','celebrating'].includes(mode)){
 pauseReturn=mode;mode='paused';closeAudio();clearInput();$('#game-overlay').hidden=false;$('#game-overlay').dataset.scene='paused';$('#game-overlay').innerHTML='<div class="pause-panel"><p class="eyebrow">YOUR PLACE IS SAFE</p><h2>Take a breath.</h2><p>The room waits for you.</p><button class="button orange" id="resume-game">Resume training →</button></div>';$('#pause-game').textContent='Resume';$('#pause-game').disabled=false;$('#resume-game').addEventListener('click',resume);$('#resume-game').focus();
 }else if(mode==='paused')resume();}
function close(){openEpoch++;loading=false;closeAudio();cancelAnimationFrame(raf);mode='closed';clearInput();dialog.close();document.body.classList.remove('in-game');priorFocus?.focus();}
export function initGame(data,stopAudio,quoteBuilder){
 content=data;closeAudio=stopAudio;makeQuote=quoteBuilder;dialog=$('#game-dialog');canvas=$('#game-canvas');ctx=canvas.getContext('2d');new ResizeObserver(()=>{resize();draw();}).observe(canvas);
 canvas.addEventListener('pointerdown',e=>{if(mode!=='running')return;e.preventDefault();canvas.setPointerCapture(e.pointerId);thumbOrigin=e.clientX;if(state.kind==='pattern'){if(e.offsetX<canvas.clientWidth/2)leftTap=true;else rightTap=true;}});
 canvas.addEventListener('pointermove',e=>{if(thumbOrigin!==null&&mode==='running'&&state.kind!=='pattern')thumbAxis=clamp((e.clientX-thumbOrigin)/36,-1,1);});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>{thumbOrigin=null;thumbAxis=0;});
 $('#close-game').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();if(['running','recovering','falling','celebrating'].includes(mode))togglePause();else close();});
 $('#pause-game').addEventListener('click',togglePause);
 $('#assist-game').checked=store.data.assist;$('#assist-game').addEventListener('change',e=>{store.update(v=>v.assist=e.target.checked);});
 $('#sound-game').addEventListener('click',()=>{sound=!sound;$('#sound-game').setAttribute('aria-pressed',String(sound));$('#sound-game').textContent=sound?'Sound on':'Sound off';if(sound)tone();});
 for(const side of ['left','right']){const b=$('#control-'+side);b.addEventListener('pointerdown',e=>{if(mode!=='running')return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(side);b.classList.add('held');if(side==='left')leftTap=true;else rightTap=true;});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{touch.delete(side);b.classList.remove('held');});b.addEventListener('click',e=>{if(e.detail===0&&mode==='running'){if(side==='left')leftTap=true;else rightTap=true;}});}
 window.addEventListener('keydown',e=>{if(mode==='closed'||e.target.matches('input'))return;
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(['ArrowLeft','ArrowRight','a','d','p',' '].includes(key))e.preventDefault();
  if(key==='p'&&!e.repeat){togglePause();return;}if(mode!=='running')return;
  if(!keys.has(key)&&!e.repeat){if(key==='ArrowLeft'||key==='a')leftTap=true;if(key==='ArrowRight'||key==='d')rightTap=true;}keys.add(key);
 });
 window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
 window.addEventListener('blur',()=>{clearInput();if(['running','recovering','falling','celebrating'].includes(mode))togglePause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&['running','recovering','falling','celebrating'].includes(mode))togglePause();});
 window.MarsGame={get snapshot(){return mission?{...structuredClone(state),mode,mission:mission.id,assist:store.data.assist}:null;}};
}
export async function openMission(id,restart=false){
 if(loading||mode!=='closed')return;loading=true;
 const vol=content.volumes.find(v=>v.number===id&&!v.classified);if(!vol){loading=false;return;}
 priorFocus=document.activeElement;closeAudio();
 const epoch=++openEpoch;mode='loading';$('#game-title').textContent=vol.mission;dialog.showModal();document.body.classList.add('in-game');$('#pause-game').disabled=true;$('#game-overlay').hidden=false;$('#game-overlay').dataset.scene='loading';$('#game-overlay').innerHTML='<div class="game-loading" role="status"><p class="eyebrow">CADET YEAR / ENTERING THE SCENE</p><h2>Suit up.</h2><div class="loading-rule"></div><p>Preparing the drawn mission.<br>Your place is safe.</p></div>';
 try{const mod=await import(`./missions/mission-${id}.js`);if(epoch!==openEpoch)return;mission=mod.mission;state=mission.create(restart?0:store.data.checkpoints[id]||0);await loadArt([...mission.art,...mission.stages.map(s=>s.image),mission.endImage]);if(epoch!==openEpoch)return;$('#game-title').textContent=mission.title;$('#assist-game').checked=store.data.assist;resize();setLabels();showScene();last=performance.now();raf=requestAnimationFrame(tick);}
 catch(e){if(epoch===openEpoch)close();window.dispatchEvent(new CustomEvent('mars-notice',{detail:'Training could not load. Reconnect once, then try again.'}));console.error(e);}
 finally{loading=false;}
}
