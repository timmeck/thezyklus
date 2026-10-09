// A local activity: alternating strokes, one turn, a persistent personal best.
(()=>{
const host=document.createElement('section');host.id='swim';host.hidden=true;host.tabIndex=-1;host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','raceTitle');
host.innerHTML=`<div class="racehead"><div><small>LEVEL TEN · THE POOL</small><h2 id="raceTitle">A swim with Bela.</h2></div><button id="raceExit">Back to the city ×</button></div><div class="raceboard"><canvas id="raceCanvas" aria-label="Swimming: Lian and Bela over 100 metres"></canvas><div id="raceMessage" role="status"></div><aside id="belaReaction" hidden><img src="bela-rematch.png" alt="Bela folds her arms and looks away."><p>Three wins. Arms folded.<br>Another race, then.</p></aside></div><div class="raceinfo"><span id="raceDistance">100 m · OUT AND BACK</span><strong id="raceTime">00:00.00</strong><span id="raceBest">PERSONAL BEST —</span></div><div class="rhythm"><div class="track"><span class="sweet"></span><i id="needle"></i></div><p id="raceCue">Alternate A and D · Hit the light zone</p></div><div class="racecontrols"><button id="raceLeft">A · Left stroke</button><button id="raceStart">Take your place</button><button id="raceRight">D · Right stroke</button></div><p id="raceHelp">100 metres. One turn. Alternate A and D at a steady pace. At the wall: Space.</p>`;
document.querySelector('main').append(host);
const q=s=>host.querySelector(s),rc=q('#raceCanvas'),c=rc.getContext('2d');
const hall=new Image(),lianSwimmer=new Image(),belaSwimmer=new Image();hall.src='pool-race.png';lianSwimmer.src='lian-swim.png';belaSwimmer.src='bela-swim.png';
let glide=0,lianFacing=1,belaFacing=1,previousFocus=null;
let state='intro',elapsed=0,countdown=3,metres=0,bela=0,speed=0,expected='a',sinceStroke=0,feedback='',feedbackFor=0,turnWait=0,best=null,prev=0,anim=0;
try{best=Number(localStorage.getItem('zyklus-swim-best'))||null}catch{}
const format=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${(s%60).toFixed(2).padStart(5,'0')}`;
function bestText(){q('#raceBest').textContent=best?'PERSONAL BEST '+format(best):'PERSONAL BEST —'}bestText();
function msg(s){q('#raceMessage').textContent=s}function start(){q('#belaReaction').hidden=true;host.focus();state='countdown';countdown=3;metres=0;bela=0;elapsed=0;speed=0;glide=0;lianFacing=1;belaFacing=1;sinceStroke=0;expected='a';turnWait=0;feedbackFor=0;q('#raceStart').textContent='Turn · Space';q('#raceStart').disabled=true;msg('3');q('#raceHelp').textContent='Alternate A and D. Keep it steady. Find the rhythm.'}
function close(){if(host.hidden)return;host.hidden=true;state='intro';cancelAnimationFrame(anim);window.dispatchEvent(new Event('swim-close'));if(previousFocus?.isConnected&&!previousFocus.closest('[hidden],dialog:not([open])'))previousFocus.focus();else canvas.focus()}
window.zyklusSwim={open(){q('#belaReaction').hidden=true;previousFocus=document.activeElement;host.hidden=false;state='intro';msg('100 metres against Bela. A short game adaptation of the swim.');q('#raceStart').textContent='Take your place';q('#raceStart').disabled=false;q('#raceHelp').textContent='Alternate A and D in rhythm. After 50 metres: press Space to turn.';metres=0;bela=0;elapsed=0;glide=0;lianFacing=1;belaFacing=1;prev=performance.now();bestText();cancelAnimationFrame(anim);anim=requestAnimationFrame(frame);q('#raceStart').focus()}};
q('#raceExit').onclick=close;q('#raceStart').onclick=()=>{if(state==='turn')turn();else if(state==='intro'||state==='done')start()};q('#raceLeft').onclick=()=>stroke('a');q('#raceRight').onclick=()=>stroke('d');
function stroke(k){if(state!=='racing')return;if(k!==expected){feedback='Change sides';speed=Math.max(.8,speed-.3);feedbackFor=.55;return}const error=Math.abs(sinceStroke-.65),quality=Math.max(0,1-error/.4);speed=Math.min(4.3,speed+1.05+quality*.8);feedback=quality>.7?'Perfect stroke':quality>.25?'Good stroke':'Keep it steady';feedbackFor=.55;sinceStroke=0;expected=k==='a'?'d':'a';tone(quality>.7?420:260,.07,'sine',.018)}
function turn(){if(state!=='turn')return;host.focus();state='racing';metres=50.01;speed=4.4;sinceStroke=0;feedback=turnWait<.65?'Clean turn!':'Push off!';feedbackFor=1;msg('');q('#raceStart').disabled=true;tone(160,.2)}
document.addEventListener('keydown',e=>{
 if(host.hidden)return;
 const k=e.key.toLowerCase();e.stopImmediatePropagation();
 if(k==='tab'){
  const buttons=[...host.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1),focused=document.activeElement;
  if(!buttons.includes(focused)){e.preventDefault();(e.shiftKey?last:first).focus()}
  else if(e.shiftKey&&focused===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&focused===last){e.preventDefault();first.focus()}
  return;
 }
 if(['a','d',' ','escape','enter'].includes(k))e.preventDefault();
 if(e.repeat)return;
 if(k==='escape'){close();return}
 const focused=document.activeElement;
 if((k==='enter'||k===' ')&&host.contains(focused)&&focused.tagName==='BUTTON'&&!focused.disabled){focused.click();return}
 if(k==='a'||k==='d')stroke(k);
 else if(k===' '){if(state==='turn')turn();else if(state==='intro'||state==='done')start()}
},true);
document.addEventListener('keyup',e=>{if(!host.hidden)e.stopImmediatePropagation()},true);
function finish(){if(state==='done')return;state='done';window.dispatchEvent(new Event('swim-finish'));const won=elapsed<100/2.8,newBest=!best||elapsed<best;if(newBest){best=elapsed;try{localStorage.setItem('zyklus-swim-best',String(best))}catch{}}const result=window.zyklusEggs.recordRace(won);if(won&&result.unlocked){q('#belaReaction').hidden=false;window.dispatchEvent(new Event('bela-rematch'))}bestText();q('#raceStart').disabled=false;q('#raceStart').textContent=won&&result.unlocked?'Rematch':'Swim again';msg(won?'You reach the edge first.':'Bela reaches the edge first.');q('#raceHelp').textContent=`${newBest?'New personal best! ':''}Your time: ${format(elapsed)} · Bela: ${format(100/2.8)}.`;tone(won?660:330,.5)}
function swimmer(actor,px,py,flip,t,near){
 if(!actor.complete||!actor.naturalWidth)return;
 const size=rc.width*(near?.088:.08),cell=actor.width/4,sh=size*actor.height/cell;
 const swimming=(state==='racing'||state==='turn'||state==='done')&&(near?metres:bela)<100,phase=swimming?Math.floor(t*5)%4:0;
 c.save();c.translate(px,py+(swimming?Math.sin(t*7)*.8:0));c.scale(near?lianFacing:belaFacing,1);c.imageSmoothingEnabled=false;
 c.drawImage(actor,phase*cell,0,cell,actor.height,-size/2,-sh*.49,size,sh);
 // A translucent waterline immerses the lower body; small wakes follow the swimmer.
 c.fillStyle='#258ba72b';c.fillRect(-size*.47,2,size*.93,sh*.19);
 for(let j=0;j<7;j++){const a=.35*(1-j/7);c.strokeStyle=`rgba(184,235,239,${a})`;c.lineWidth=1;c.beginPath();const wx=-size*.35-j*size*.07;c.moveTo(wx,3+Math.sin(t*5+j)*2);c.lineTo(wx-size*.065,4+Math.sin(t*5+j)*2);c.stroke()}
 c.restore();
}
function drawHall(w,h,now){
 c.fillStyle='#0d252f';c.fillRect(0,0,w,h);c.imageSmoothingEnabled=false;
 if(hall.complete&&hall.naturalWidth)c.drawImage(hall,0,0,w,h);
 // Moving glints stay in the water rather than repainting its detailed tilework.
 c.save();c.beginPath();c.rect(w*.08,h*.57,w*.84,h*.17);c.clip();
 for(let i=0;i<48;i++){const xx=w*(.08+((i*.037+now*.000012)%.84)),yy=h*(.578+(i%7)*.022);c.fillStyle=`rgba(180,234,238,${.08+.06*Math.sin(now*.002+i)})`;c.fillRect(xx,yy+Math.sin(now*.0015+i)*2,w*.012,1)}c.restore();
 const distToX=m=>w*(.12+(m<=50?m/50:(100-m)/50)*.76);
 const lx=distToX(metres),bx=distToX(bela);
 swimmer(belaSwimmer,bx,h*.575,bela>50,now*.001+1,false);swimmer(lianSwimmer,lx,h*.647,metres>50,now*.001,true);
 for(const [label,xx,yy] of [['BELA',bx,h*.575],['LIAN',lx,h*.647]]){c.font='10px monospace';c.textAlign='center';c.fillStyle='#071820bd';c.fillRect(xx-23,yy-27,46,15);c.fillStyle='#e7debf';c.fillText(label,xx,yy-16)}
}
function frame(now){if(host.hidden)return;const dt=Math.min(.05,(now-prev)/1000);prev=now;if(state==='countdown'){const before=Math.ceil(countdown);countdown-=dt;const n=Math.ceil(countdown);if(n!==before)tone(n>0?330:660,.15);msg(n>0?String(n):'GO!');if(countdown<=0){state='racing';sinceStroke=.65;speed=1;setTimeout(()=>{if(state==='racing')msg('')},550)}}
if(state==='racing'||state==='turn'){elapsed+=dt;bela=Math.min(100,bela+2.8*dt);sinceStroke+=dt;feedbackFor=Math.max(0,feedbackFor-dt);if(state==='racing'){speed=Math.max(.85,speed-dt*1.65);glide+=(speed-glide)*(1-Math.exp(-dt*12));const old=metres;metres+=glide*dt;if(old<50&&metres>=50){metres=50;state='turn';turnWait=0;msg('TURN · SPACE');q('#raceStart').disabled=false}else if(metres>=100){metres=100;finish()}}else turnWait+=dt}
if(state==='done')bela=Math.min(100,bela+2.8*dt);
lianFacing+=((metres>50?-1:1)-lianFacing)*(1-Math.exp(-dt*16));belaFacing+=((bela>50?-1:1)-belaFacing)*(1-Math.exp(-dt*16));
const box=rc.getBoundingClientRect(),w=Math.max(1,Math.round(box.width)),h=Math.max(1,Math.round(box.height));if(rc.width!==w||rc.height!==h){rc.width=w;rc.height=h}drawHall(w,h,now);
q('#raceTime').textContent=format(elapsed);q('#raceDistance').textContent=`${metres.toFixed(0)} / 100 m · ${metres<50?'OUTWARD':'RETURN'}`;q('#needle').style.left=`${Math.min(100,sinceStroke/1.3*100)}%`;q('#raceCue').textContent=state==='turn'?'Push off now · Space':feedbackFor>0?feedback:`Next stroke: ${expected.toUpperCase()} · Hit the light zone`;anim=requestAnimationFrame(frame)}
})();
