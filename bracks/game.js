/* Local first-fight presentation. Story is imported verbatim from story.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), M = FightModel;
  const fights={
    k01:{name:'Hask',story:FightStory,room:'The pump room',picture:'roomHask',heat:44,title:'Nothing that shows on Monday.',sub:'Two days’ rations. One chalk circle.',reward:'Four',goal:20,description:'Erek faces Hask in the pump room. Watch his right shoulder.'},
    k02:{name:'Zarr',story:FightStoryK02,rules:ZarrRules,room:'The press cellar',picture:'roomZarr',heat:36,title:'She never hits once.',sub:'Three days’ rations. Always two.',reward:'Six',goal:25,description:'Erek faces Zarr in the press cellar. Both fists announce two punches. Wait until she shakes her hands out.'},
    k03:{name:'Yann',story:FightStoryK03,rules:YannRules,room:'The dry tank',picture:'roomYann',heat:33,title:'Watch which.',sub:'Four days’ rations. Two different signals.',reward:'Eight',goal:30,description:'Erek faces Yann in the dry tank. Heel back: guard the long straight. Shoulder down: step away from the short hook, then counter.'}
  };
  fights.k04={name:'Lutz',story:FightStoryK04,rules:LutzRules,room:'The old cold store',picture:'roomLutz',heat:39,title:'Never once had a mark on Monday.',sub:'Five days’ rations.',reward:'Ten',goal:30,description:'Erek faces Lutz in the old cold store. Cross the drain, then step back when his arms come apart. Counter while he bends over the drain.'};
  fights.k05={name:'Petra',story:FightStoryK05,rules:PetraRules,room:'The bakehouse',picture:'roomPetra',heat:43,title:'Stands one way for each.',sub:'Six days’ rations.',reward:'Twelve',goal:30,description:'Erek faces Petra in the bakehouse. Tall and side-on: guard. Low and wide: step back and wait for both punches.'};
  fights.k06={name:'Gustav',story:FightStoryK06,rules:GustavRules,room:"Behind the barber's",picture:'roomGustav',heat:42,title:'Twenty years in here.',sub:'Seven days’ rations.',reward:'Fourteen',goal:34,description:"Erek faces Gustav behind the barber's. Arm out: guard. Feet together: step back. After every short punch, look again."};
  let S=FightStory,fightId='k01',practice=false,room=null,completionDue=false,pendingRoom=null;
  const isLutz=()=>fightId==='k04',isPetra=()=>fightId==='k05',isGustav=()=>fightId==='k06';
  const current=()=>fights[fightId],isZarr=()=>fightId==='k02',isYann=()=>fightId==='k03';
  const newState=()=>HardRules.create(M,fightId,current().rules,practice);
  const canvas = $('arena'), ctx = canvas.getContext('2d');
  const input = {}, keys = new Set(), pointers = new Map(); let touchState=FightTouch.create(), swipeTimer=null;
  const keyMap = {KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyJ:'strike',KeyK:'guard',KeyL:'dodge'};
  const saveKey='zyklus-bracks-career-v2',legacyKey='zyklus-bracks-k01-v1';
  const readSave=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
  let career=FightCareer.read(readSave(saveKey),readSave(legacyKey),matchMedia('(prefers-reduced-motion: reduce)').matches);
  let progress=FightCareer.progress(career,fightId);
  const save=()=>{career=FightCareer.update(career,fightId,progress);try{localStorage.setItem(saveKey,JSON.stringify(career));$('save-status').textContent='Saved on this device. Optional challenges.';}catch{$('save-status').textContent='Saving is unavailable. Progress lasts until you close or reload this page.';}};
  let state = M.create(), screen='loading', paused=false, sequence=[], lineIndex=0, afterScene=null;
  let stamp=0, clock=0, count=0, impact=0, captionTime=0, resultDelay=0, audio=null, camera=500, crowd=null;
  let actorMotion = {erek:FighterMotion.create(420),hask:FighterMotion.create(580)};
  let effects=FightEffects.create();
  const voice=FightVoice.create(FightVoiceClips,src=>{const clip=new Audio(src);clip.id='voice-audio';clip.hidden=true;document.body.append(clip);return clip;},()=>{$('voice-status').textContent='Audio unavailable. Subtitles remain available.';});
  const pictures = {}, frames = {}, buttons=[...document.querySelectorAll('[data-action]')];
  function clearInput(){M.clearPresses(state);clearTimeout(swipeTimer);touchState.id=null;$("move-pad").style.setProperty("--thumb","0px");keys.clear();pointers.clear();for(const k in input)input[k]=false;buttons.forEach(b=>b.classList.remove('held'));}
  function syncInput(){for(const action of ['left','right','strike','guard','dodge']){const down=[...keys].some(k=>keyMap[k]===action)||[...pointers.values()].includes(action);if(down&&!input[action]&&screen==='fight'&&!paused)M.press(state,action);input[action]=down;}buttons.forEach(b=>b.classList.toggle('held',!!input[b.dataset.action]));}
  function sound(freq,duration,volume=.025,noise=false){
    if(!progress.sound)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume();
      const gain=audio.createGain();gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);gain.connect(audio.destination);
      if(isYann()&&noise){const echo=audio.createDelay(.5),fade=audio.createGain();echo.delayTime.value=.17;fade.gain.value=.28;gain.connect(echo);echo.connect(fade);fade.connect(audio.destination);}
      if(noise){const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate), data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);const source=audio.createBufferSource();source.buffer=buffer;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=freq;source.connect(filter);filter.connect(gain);source.start();}
      else{const source=audio.createOscillator();source.type='sine';source.frequency.setValueAtTime(freq,audio.currentTime);source.frequency.exponentialRampToValueAtTime(freq*.55,audio.currentTime+duration);source.connect(gain);source.start();source.stop(audio.currentTime+duration);}
    }catch{}
  }
  function only(...ids){const browse=ids.includes('title-card')||ids.includes('result');$('fight-menu').hidden=!browse;$('progress-menu').hidden=!browse;$('settings-menu').hidden=ids.includes('hud')||ids.includes('room-controls');document.body.classList.toggle('in-story',ids.includes('story'));if(!browse){$('fight-menu').open=false;$('progress-menu').open=false;$('settings-menu').open=false;}if(!ids.includes('story'))voice.stop();for(const id of ['time-card','career-summary','title-card','story','fight-bottom','result','hud','countdown','combat-caption','room-controls','records','fight-select','practice-entry','career-entry'])$(id).hidden=(id==='records'||id==='fight-select'||id==='practice-entry'||id==='career-entry')?!ids.some(x=>x==='title-card'||x==='result'):!ids.includes(id);document.body.classList.toggle('in-fight',ids.includes('hud'));document.body.classList.toggle('in-room',ids.includes('room-controls'));document.body.classList.toggle('reduce-room-motion',progress.motion);document.body.classList.toggle('in-transition',ids.includes('time-card'));document.body.classList.toggle('in-summary',ids.includes('career-summary'));resize();window.scrollTo(0,0);}
  function scene(lines,after,label){$('arena').setAttribute('aria-label',current().description);clearInput();screen='story';sequence=lines;lineIndex=0;afterScene=after;only('story');$('scene-label').textContent=label;$('pause').disabled=true;renderLine();$('next').focus({preventScroll:true});}
  function renderLine(){const l=sequence[lineIndex];$('voice-controls').hidden=!voice.has(l);$('voice-status').textContent='';voice.play(l,progress.voice,progress.voiceVolume);$('speaker').textContent=l.speaker;$('line').textContent=l.text;$('line').classList.toggle('narrator',l.speaker==='Narrator');$('line-count').textContent=`${lineIndex+1} / ${sequence.length}`;$('next').firstChild.textContent=lineIndex===sequence.length-1&&(afterScene===startFight||afterScene===beginIntroFight)?'Ready ':'Continue ';}
  $('next').onclick=()=>{voice.stop();if(++lineIndex<sequence.length)renderLine();else afterScene();};
  function beginIntroFight(){progress.introSeen=true;save();startFight();}
  function intro(){state=newState();effects=FightEffects.create();actorMotion={erek:FighterMotion.create(420),hask:FighterMotion.create(580)};scene(S.intro,beginIntroFight,current().room.toUpperCase());}
  function startFight(){$('room-label').firstChild.textContent=practice?'PRACTICE ':'LEVEL TWO ';state=newState();effects=FightEffects.create();actorMotion={erek:FighterMotion.create(420),hask:FighterMotion.create(580)};crowd?.reset();screen='countdown';clearInput();paused=false;count=3;resultDelay=0;impact=0;only('hud','fight-bottom','countdown');$('countdown').textContent='3';$('pause').disabled=false;updateHud();updateHint();$('pause').focus({preventScroll:true});}
  function finished(){crowd?.react(clock,1.5);screen='ending';clearInput();resultDelay=.9;$('pause').disabled=true;only('hud');if(state.phase==='won'&&!practice){const wasComplete=FightCareer.summary(career,Object.keys(fights)).complete;progress.wins=Math.min(999,progress.wins+1);progress.records=FightRecords.record(progress.records,state);renderRecords();save();completionDue=!wasComplete&&FightCareer.summary(career,Object.keys(fights)).complete&&!career.completionSeen;}sound(state.phase==='won'?220:80,.45);}
  function result(){if(completionDue){completionDue=false;showSummary();return;}screen='result';only('result');$('result-note').textContent=state.phase==='won'?`${current().reward} days’ rations. ${state.stats.counters} counters. ${state.stats.hitsTaken} ${state.stats.hitsTaken===1?'hit':'hits'} taken.`:(isLutz()||isPetra()||isGustav())&&state.elapsed>=120?'2:00 · '+S.training:(M.advice(state)===null?S.training:S.feedback[M.advice(state)]);
    const ids=Object.keys(fights),next=ids[ids.indexOf(fightId)+1];
    $('next-fight').hidden=practice||state.phase!=='won'||!next;
    $('normal-fight').hidden=!practice;$('replay').hidden=practice;$('practice-entry').hidden=practice;$('again').firstChild.textContent=practice?'Practise again ':'Again ';
    $('room-back').hidden=practice;
    if(practice)$('result-note').textContent=`Practice finished · ${state.stats.counters} counters · No records changed. ${state.phase==='won'?'':state.elapsed>=120?S.training:(M.advice(state)===null?S.training:S.feedback[M.advice(state)])}`;
    if(next){$('next-fight').textContent='Next fight: '+fights[next].name+' →';$('next-fight').onclick=()=>{enterRoom(next);};}
    $('result-note').textContent+=' '+HardRules.hints[fightId];$('again').focus({preventScroll:true});}
  function renderRecords(){
    const r=progress.records;
    const next=FightCareer.next(FightCareer.update(career,fightId,progress),Object.keys(fights));
    $('career-continue').hidden=!next;$('career-results').hidden=!!next;
    $('career-continue').textContent=next?'Continue · '+fights[next].name+' →':'Continue';
    $('career-help').textContent=next?'Your first fight still to win. Previous wins count.':'All six fights won. Choose any fight to play again.';
    for(const button of document.querySelectorAll('[data-fight]')){
      const id=button.dataset.fight,done=(id===fightId?progress:FightCareer.progress(career,id)).wins>0;
      button.textContent=`${Number(id.slice(1))} · ${fights[id].name}${done?' ✓':''}`;
      button.classList.toggle('fight-won',done);
      button.setAttribute('aria-label',`${fights[id].name}${done?' — won':' — not yet won'}`);
    }
    const won=Object.keys(fights).filter(id=>(id===fightId?progress:FightCareer.progress(career,id)).wins>0).length;
    $('demo-progress').textContent=`Fights won · ${won} / ${Object.keys(fights).length}`;
    $('record-summary').textContent=`Wins: ${progress.wins} · Best time: ${r.bestTime===null?'—':r.bestTime.toFixed(2)+' s'}`;
    for(const [id,label,done] of [['goal-clean','Win without taking damage',r.cleanWins>0],['goal-time',`Win in under ${current().goal} seconds`,r.bestTime!==null&&r.bestTime<current().goal],['goal-wins','Win five fights',progress.wins>=5]]){
      $(id).textContent=(done?'✓ ':'○ ')+label;$(id).classList.toggle('complete',done);$(id).setAttribute('aria-label',label+(done?' — completed':' — not completed'));
    }
  }
  function rematch(){state=newState();effects=FightEffects.create();actorMotion={erek:FighterMotion.create(420),hask:FighterMotion.create(580)};crowd?.reset();impact=0;captionTime=0;scene(S.rematch,startFight,'AGAIN');}
  function leavePractice(){practice=false;$('room-label').firstChild.textContent='LEVEL TWO ';}
  const normalIntro=()=>{leavePractice();intro();},normalRematch=()=>{leavePractice();rematch();};
  $('career-continue').onclick=()=>{
    const next=FightCareer.next(FightCareer.update(career,fightId,progress),Object.keys(fights));
    if(next)enterRoom(next);
  };
  $('enter').onclick=normalIntro;$('return-fight').onclick=normalRematch;$('again').onclick=()=>practice?startFight():rematch();$('replay').onclick=normalIntro;
  $('practise').onclick=()=>{practice=true;startFight();};$('normal-fight').onclick=()=>progress.introSeen?normalRematch():normalIntro();
  function openRoom(id,won=false){
    if(!ensureFight(id,()=>openRoom(id,won)))return;
    selectFight(id);room=CareerRoom.create(id,won);state.player.x=room.x;
    if(won){state.enemy.pose='defeat';state.enemy.phase='defeat';}
    actorMotion.erek=FighterMotion.create(room.x);screen='room';clearInput();
    $('room-time').textContent=CareerRoom.times[id]||current().room;
    $('room-enter').hidden=won;$('room-next').hidden=!won;
    $('room-next').textContent='Continue';$('pause').disabled=false;
    only('room-controls');updateRoom();$('room-exit').focus({preventScroll:true});
  }
  function enterRoom(id,won=false,transition=true){
    if(!ensureFight(id,()=>enterRoom(id,won,transition)))return;
    if(!transition||won){openRoom(id,won);return;}
    selectFight(id);pendingRoom=id;screen='transition';clearInput();
    $('time-number').textContent='THE BACK ROOMS · '+id.slice(1);
    $('time-heading').textContent=CareerRoom.times[id]||current().room;
    $('time-room').textContent=CareerRoom.times[id]?current().room:'';
    only('time-card');$('time-continue').focus({preventScroll:true});
  }
  $('time-continue').onclick=()=>{if(screen!=='transition'||!pendingRoom)return;const id=pendingRoom;pendingRoom=null;openRoom(id);};
  $('time-back').onclick=returnToSelection;
  function showSummary(){
    save();const report=FightCareer.summary(career,Object.keys(fights));if(!report.complete)return;
    clearInput();room=null;screen='summary';$('pause').disabled=true;
    $('summary-totals').textContent=`Fights won · ${report.rows.length} / ${report.rows.length} · Without taking damage · ${report.clean} / ${report.rows.length}`;
    $('summary-rows').replaceChildren();
    for(const row of report.rows){const item=document.createElement('div');item.className='summary-row';const name=document.createElement('strong');name.textContent=fights[row.id].name;const stats=document.createElement('span');stats.textContent=`Wins: ${row.wins} · Best time: ${row.records.bestTime===null?'—':row.records.bestTime.toFixed(2)+' s'}`;item.append(name,stats);$('summary-rows').append(item);}
    career.completionSeen=true;save();only('career-summary');$('summary-back').focus({preventScroll:true});
  }
  $('career-results').onclick=showSummary;$('summary-back').onclick=returnToSelection;
  function updateRoom(){
    $('room-enter').disabled=!CareerRoom.ready(room)||room.entering;
    $('arena').setAttribute('aria-label',current().room+'. '+(room.won?'Choose Continue or explore.':CareerRoom.ready(room)?'E · Step in':'Move right to step in.') );
  }
  function stepIn(){if(!room||screen!=='room'||paused)return;if(CareerRoom.enter(room)){clearInput();updateRoom();}}
  $('room-visit').onclick=()=>enterRoom(fightId,false,false);
  $('room-enter').onclick=stepIn;
  $('room-exit').onclick=returnToSelection;
  $('room-back').onclick=()=>enterRoom(fightId,state.phase==='won',false);
  $('room-next').onclick=()=>{const next=FightCareer.next(FightCareer.update(career,fightId,progress),Object.keys(fights));if(next)enterRoom(next);else showSummary();};
  function returnToSelection(){if(screen==='loading')return;completionDue=false;pendingRoom=null;room=null;practice=false;$('room-label').firstChild.textContent='LEVEL TWO ';clearInput();if($('pause-dialog').open)$('pause-dialog').close();paused=false;state=newState();effects=FightEffects.create();actorMotion={erek:FighterMotion.create(420),hask:FighterMotion.create(580)};screen='title';renderRecords();only('title-card');$('return-fight').hidden=!progress.introSeen;$('pause').disabled=true;$('enter').focus({preventScroll:true});}
  document.querySelector('.brand').onclick=event=>{event.preventDefault();returnToSelection();};
  $('choose-fight').onclick=()=>{returnToSelection();document.querySelector(`[data-fight="${fightId}"]`).focus({preventScroll:true});};
  function selectFight(id){
    if(!fights[id])return;if(!ensureFight(id,()=>selectFight(id)))return;completionDue=false;room=null;practice=false;
    clearInput();save();fightId=id;S=current().story;progress=FightCareer.progress(career,fightId);career.lastFight=id;save();
    state=newState();effects=FightEffects.create();actorMotion={erek:FighterMotion.create(420),hask:FighterMotion.create(580)};
    pictures.room=pictures[current().picture];
    crowd=(isGustav()?BarberRoom:isPetra()?Bakehouse:isLutz()?ColdStore:isYann()?DryTank:isZarr()?PressRoom:PumpRoomCrowd).create(pictures.room);clock=0;impact=0;captionTime=0;paused=false;screen='title';
    document.title='BRACKS · The Games — '+current().room;
    document.querySelector('.game').setAttribute('aria-label',current().room+' fight');
    $('room-label').innerHTML=`LEVEL TWO <span>2422 / ${current().heat} °C</span>`;
    $('title-eyebrow').textContent='THE BACK ROOMS · '+id.slice(1);
    $('title-heading').textContent=current().title;
    $('title-sub').textContent=current().sub;
    $('enter').textContent=isGustav()?"Go behind the barber's →":'Enter '+current().room.toLowerCase()+' →';
    $('selected-fight').textContent=current().name;$('fight-menu').open=false;$('enemy-name').textContent=current().name;$('records-heading').textContent=current().name+' · Personal best';
    $('enemy-health').setAttribute('aria-label',current().name+' condition');
    $('arena').setAttribute('aria-label',current().description);
    $('arena-name').textContent=current().room.toUpperCase();$('location').textContent=S.location;
    $('local-note').textContent='The fights from BRACKS Manga · ZYKLUS';
    document.querySelectorAll('[data-fight]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fight===id)));
    $('return-fight').hidden=!progress.introSeen;$('pause').disabled=true;
    renderRecords();only('title-card');updateHint();
  }
  for(const b of document.querySelectorAll('[data-fight]'))b.onclick=()=>selectFight(b.dataset.fight);
  function updateHint(){$('training').textContent=(practice?'Practice · ':'')+(progress.hint?HardRules.hints[fightId]:'A / D · move     J · hit     K · guard     L · step away');$('hint-toggle').textContent=progress.hint?'Hide hint':'Show hint';$('hint-toggle').setAttribute('aria-pressed',String(progress.hint));}
  $('hint-toggle').onclick=()=>{progress.hint=!progress.hint;save();updateHint();};
  $('voice-enabled').checked=progress.voice;$('voice-volume').value=progress.voiceVolume;
  $('voice-enabled').onchange=()=>{progress.voice=$('voice-enabled').checked;save();if(screen==='story')voice.play(sequence[lineIndex],progress.voice,progress.voiceVolume);else voice.stop();};
  $('voice-volume').oninput=()=>{progress.voiceVolume=voice.volume(Number($('voice-volume').value));save();};
  $('voice-replay').onclick=()=>{if(screen!=='story')return;progress.voice=true;$('voice-enabled').checked=true;$('voice-status').textContent='';save();voice.play(sequence[lineIndex],true,progress.voiceVolume);};
  $('sound').checked=progress.sound;$('motion').checked=progress.motion;
  $('sound').onchange=()=>{progress.sound=$('sound').checked;save();sound(130,.12);};
  $('motion').onchange=()=>{progress.motion=$('motion').checked;save();};
  function pause(){if(paused||!['fight','countdown','room'].includes(screen))return;paused=true;clearInput();$('pause-dialog').showModal();$('resume').focus();}
  function resume(){if(!paused)return;if($('pause-dialog').open)$('pause-dialog').close();clearInput();if(screen==='room'){paused=false;stamp=performance.now();$('pause').focus();return;}screen='countdown';count=3;$('countdown').textContent='3';$('countdown').hidden=false;paused=false;stamp=performance.now();$('pause').focus({preventScroll:true});}
  $('backup-open').onclick=()=>{if(!['title','result'].includes(screen))return;clearInput();$('backup-text').value=FightBackup.encode(FightCareer.update(career,fightId,progress));$('backup-status').textContent='';$('backup-dialog').showModal();};
  $('backup-close').onclick=()=>$('backup-dialog').close();
  $('backup-download').onclick=()=>{const text=FightBackup.encode(FightCareer.update(career,fightId,progress));$('backup-text').value=text;const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='bracks-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('backup-status').textContent='Backup prepared. You can also copy the text.';};
  $('backup-restore').onclick=()=>{
    let restored;try{restored=FightBackup.merge(FightCareer.update(career,fightId,progress),FightBackup.parse($('backup-text').value));}catch{$('backup-status').textContent='This backup is not valid. Your progress has not changed.';return;}
    try{localStorage.setItem(saveKey,JSON.stringify(restored));}catch{$('backup-status').textContent='Saving is unavailable. Your progress has not changed. Keep your backup and try again.';return;}
    career=restored;progress=FightCareer.progress(career,fightId);$('voice-enabled').checked=progress.voice;$('voice-volume').value=progress.voiceVolume;$('sound').checked=progress.sound;$('motion').checked=progress.motion;$('buttons-only').checked=progress.buttonsOnly;document.body.classList.toggle('buttons-only',progress.buttonsOnly);selectFight(career.lastFight);$('backup-status').textContent='Backup restored. Your better records have been kept.';
  };
  $('pause').onclick=pause;$('resume').onclick=resume;
  $('restart').onclick=()=>{const wasRoom=screen==='room',won=room?.won;resume();if(wasRoom){enterRoom(fightId,won,false);return;}if(practice)startFight();else rematch();};
  $('pause-dialog').addEventListener('cancel',event=>{event.preventDefault();resume();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){voice.stop();pause();}});
  window.addEventListener('blur',()=>{voice.stop();clearInput();pause();});
  window.addEventListener('keydown',event=>{
    if($('backup-dialog').open)return;
    if(event.code==='Escape'){event.preventDefault();if(paused)resume();else pause();return;}
    if(screen==='room'&&!paused&&(event.code==='KeyE'||event.code==='Enter'&&!event.target.matches('button'))&&!event.repeat&&!event.target.matches('input')){event.preventDefault();stepIn();return;}
    if(!keyMap[event.code]||!['fight','room'].includes(screen)||paused||event.target.matches('input'))return;
    event.preventDefault();keys.add(event.code);syncInput();
  });
  window.addEventListener('keyup',event=>{if(keyMap[event.code]){keys.delete(event.code);syncInput();}});
  for(const button of buttons){
    button.addEventListener('pointerdown',event=>{if(!['fight','room'].includes(screen)||paused||event.button!==0)return;event.preventDefault();button.setPointerCapture(event.pointerId);pointers.set(event.pointerId,button.dataset.action);syncInput();});
    const release=event=>{pointers.delete(event.pointerId);syncInput();};
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
    button.addEventListener('click',event=>{if(event.detail!==0||!['fight','room'].includes(screen)||paused)return;const id=Symbol('accessible');pointers.set(id,button.dataset.action);syncInput();setTimeout(()=>{pointers.delete(id);syncInput();},160);});
  }
  const pad=$('move-pad');
  pad.addEventListener('pointerdown',event=>{
    if(screen!=='fight'||paused||event.button!==0)return;
    if(!FightTouch.begin(touchState,event.pointerId,event.clientX,event.clientY,event.timeStamp))return;
    event.preventDefault();pad.setPointerCapture(event.pointerId);
  });
  pad.addEventListener('pointermove',event=>{
    if(touchState.id!==event.pointerId)return;
    event.preventDefault();const dir=FightTouch.move(touchState,event.pointerId,event.clientX,event.clientY);
    pointers.set('move-pad',dir<0?'left':dir>0?'right':'');
    pad.style.setProperty('--thumb',Math.max(-32,Math.min(32,touchState.dx))+'px');syncInput();
  });
  function releasePad(event){
    const dodge=FightTouch.end(touchState,event.pointerId,event.clientX,event.clientY,event.timeStamp,event.type!=='pointerup');
    if(dodge===null)return;
    pointers.delete('move-pad');pad.style.setProperty('--thumb','0px');
    if(dodge&&screen==='fight'&&!paused){
      pointers.set('swipe-dodge','dodge');clearTimeout(swipeTimer);
      swipeTimer=setTimeout(()=>{pointers.delete('swipe-dodge');syncInput();},80);
    }
    syncInput();
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,releasePad);
  $('buttons-only').checked=progress.buttonsOnly;
  document.body.classList.toggle('buttons-only',progress.buttonsOnly);
  $('buttons-only').onchange=()=>{clearInput();progress.buttonsOnly=$('buttons-only').checked;document.body.classList.toggle('buttons-only',progress.buttonsOnly);save();};
  let inputWidth=innerWidth;window.addEventListener('resize',()=>{clearInput();const orientationChanged=Math.abs(innerWidth-inputWidth)>80;inputWidth=innerWidth;if(orientationChanged)pause();});

  function updateHardHud(){
    const e=state.enemy,l=state.haskLab;
    if(l){$('enemy-state').textContent=e.phase==='rest'?'Step closer. Make him commit.':e.phase==='telegraph'?(l.reprisal?'He answers. Get out.':'Shoulder back. Step away.'):e.phase==='recovery'?(l.cleanOpening?(l.recoveryHits?(l.reprisal?'Step back. Recover stamina.':'Second hit? He will answer.'):'An opening. Counter now.'):'No opening. Make him miss.'):'Get clear.';return;}
    if(state.hardLab&&e.phase==='recovery')$('enemy-state').textContent=e.countered?'Step back. Recover stamina.':fightId==='k03'&&e.attackType==='long'?'Wait for the short punch.':state.hardLab.clean?'Opening. Counter now.':'No opening. Defend the whole attack.';
  }
  function updateHud(){const p=state.player,e=state.enemy;$("player-health").style.setProperty("--trail",(progress.motion?p.hp:effects.health[0])+"%");$("enemy-health").style.setProperty("--trail",(progress.motion?e.hp:effects.health[1])+"%");$('player-health').value=p.hp;$('enemy-health').value=e.hp;$('stamina').value=p.stamina;$('player-value').textContent=Math.ceil(p.hp);$('enemy-value').textContent=Math.ceil(e.hp);const left=Math.ceil(120-state.elapsed);$('timer').textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;$('enemy-state').textContent=isGustav()?(e.phase==='reset'?'When he steps back behind his arms, wait.':e.phase==='recovery'?'When he looks down at his feet, hit him.':e.phase==='telegraph'||e.phase==='punch'?(e.attackType==='long'?'Arm out and still: the long one. Guard it.':'Feet together, elbows in: a short one. Step back.'):'After every short one, look again.'):isPetra()?(e.phase==='recovery'?'When her hands go to her back, hit her.':e.phase==='telegraph'||e.phase==='punch'?(e.attackType==='long'?'Tall and side-on: one long one. Guard it.':'Low and wide: two short ones. Step back and let both go.'):'Watch her stance.'):isLutz()?(e.phase==='telegraph'?'His arms come apart.':e.phase==='recovery'?'While he bends over the drain, hit him.':e.phase==='punch'?'Get back behind the drain.':'Step over the drain.'):isYann()?(e.phase==='telegraph'?(e.attackType==='long'?'His heel goes back.':'His shoulder drops.'):e.phase==='recovery'?(e.attackType==='long'?'His arm comes back.':'He comes up slowly.'):'Watch his heel and shoulder.'):isZarr()?(e.phase==='recovery'?'She shakes her hands out.':state.stage>=3&&state.stage<=4?'There is a second.':e.phase==='telegraph'?'Both fists come up.':'Watch both hands.'):e.phase==='telegraph'?'His shoulder goes back.':e.phase==='recovery'?'His arm hangs.':e.phase==='punch'?'':'Watch his shoulder.';updateHardHud();}
  function eventEffects(){for(const event of state.events){FightEffects.event(effects,event.type,state);
    if(event.type==='counter'){crowd?.react(clock,1);impact=.16;captionTime=.65;$('combat-caption').textContent='Counter';sound(100,.14,.045,true);}
    if(event.type==='player-hit'||event.type==='guard-hit'){const block=event.type==='guard-hit'?FightEffects.guardFeedback(state):null,damaged=!block||block.damaged;crowd?.react(clock,damaged?.7:.3);impact=damaged?.12:.045;captionTime=block?.text==='Guard broken'?.8:.6;$('combat-caption').textContent=block?block.text:'Hit';sound(damaged?70:190,damaged?.16:.08,damaged?.035:.02,true);}
    if(event.type==='enemy-miss'){sound(350,.1,.015,true);}
    if(event.type==='player-miss'){captionTime=.5;$('combat-caption').textContent='Out of reach';}
    if(event.type==='enemy-block'){captionTime=.5;$('combat-caption').textContent='Wait for the opening';sound(190,.08,.02,true);}
  }}
  // Measured source anchors (assets/sprite-metrics.json). No pixel readback, so
  // the standalone file also works without a server or cross-origin permissions.
  function measureSheet(image,isEnemy){const feet=isEnemy?[501,500,501,983,983,983]:[510,510,512,992,988,991];return feet.map((foot,i)=>({sx:i%3*512,sy:i<3?0:520,w:512,h:i<3?512:480,footX:256,footY:foot-(i<3?0:520),bodyHeight:480}));}
  function motionSheet(isEnemy){
    // New drawings use one fixed anatomical scale per actor, including the dodge.
    const feet=isEnemy?[500,498,500,473,475,473]:[506,506,508,484,485,485];
    return feet.map((foot,i)=>({sx:i%3*512,sy:i<3?0:512,w:512,h:512,footX:256,footY:foot,bodyHeight:480}));
  }
  function drawFighter(which,who,isEnemy){
    const shown=isEnemy&&state.phase==='lost'?{...who,phase:'rest',pose:'idle'}:who;
    const gustav=isEnemy&&isGustav(),petra=isEnemy&&isPetra(),lutz=isEnemy&&isLutz(),zarr=isEnemy&&isZarr(),yann=isEnemy&&isYann();
    const pose=gustav?GustavMotion.frame(shown,actorMotion[which],state.stage):petra?PetraMotion.frame(shown,actorMotion[which],state.stage):lutz?LutzMotion.frame(shown,actorMotion[which]):yann?YannMotion.frame(shown,actorMotion[which]):zarr?ZarrMotion.frame(shown,actorMotion[which],state.stage):FighterMotion.frame(shown,actorMotion[which],isEnemy);
    const actor=gustav?'gustav':petra?'petra':lutz?'lutz':yann?'yann':zarr?'zarr':which,set=pose.sheet==='motion'?actor+'Motion':actor;
    // Reserve actual screen pixels for the HUD, scaling both actors equally.
    // Crouching/striking never changes this anatomical scale.
    const fit=Math.min(1,Math.max(.25,(canvas.height*.84-100*canvas.width/canvas.clientWidth)/310));
    const image=pictures[set],f=frames[set][pose.index],size=(gustav?265:petra?245:lutz?265:yann?300:zarr?245:isEnemy?267:265)*fit/f.bodyHeight;
    const lunge=lutz&&who.phase==='punch'?60*(1-Math.min(1,who.elapsed/.05)):lutz&&state.spacing.cycle>0&&who.phase==='rest'?-60*(1-Math.min(1,who.elapsed/.25)):0;
    const floor=canvas.height*.84,x=who.x+canvas.width/2-camera+(gustav?GustavMotion.reachOffset(shown,who.x-state.player.x):petra?PetraMotion.reachOffset(shown,who.x-state.player.x):yann?YannMotion.reachOffset(shown,who.x-state.player.x):lunge);
    ctx.save();ctx.globalAlpha=.32;ctx.fillStyle='#090d08';ctx.beginPath();ctx.ellipse(x,floor+2,45,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(x+(!isEnemy&&isLutz()?30-144*size:0)+(progress.motion?0:pose.offset),floor);
    if(!progress.motion)ctx.rotate(pose.lean);
    ctx.imageSmoothingEnabled=false;
    const stance=progress.motion?{sway:0,dip:0}:FighterMotion.stance(zarr?clock*1.15:yann?clock*.82:clock,shown,isEnemy);
    if(stance.sway||stance.dip){
      // Continuous displacement from planted boots to shoulders; no whole-body bounce.
      // Adjacent strips share endpoints, keeping the silhouette joined without seams.
      const shift=y=>Math.max(0,Math.min(1,(f.footY-y)/280));
      for(let row=0;row<f.h;row+=4){
        const height=Math.min(4,f.h-row),a=shift(row),b=shift(row+height);
        const y=(row-f.footY)*size+stance.dip*a;
        const end=(row+height-f.footY)*size+stance.dip*b;
        ctx.drawImage(image,f.sx,f.sy+row,f.w,height,-f.footX*size+stance.sway*a,y,f.w*size,end-y+.25);
      }
    }else if(zarr&&pose.sheet==='base'&&pose.index===4&&!progress.motion){
      // The low forearms release after the second contact; head and boots stay still.
      for(let row=0;row<f.h;row+=4){
        const height=Math.min(4,f.h-row),shake=Math.sin(clock*27)*Math.exp(-(((row-260)/65)**2))*2.2;
        ctx.drawImage(image,f.sx,f.sy+row,f.w,height,-f.footX*size+shake,(row-f.footY)*size,f.w*size,height*size+.25);
      }
    }else ctx.drawImage(image,f.sx,f.sy,f.w,f.h,-f.footX*size,-f.footY*size,f.w*size,f.h*size);
    ctx.restore();
  }
  function draw(){const w=canvas.width,h=canvas.height;camera=Math.max(w/2,Math.min(1000-w/2,screen==='room'?state.player.x:(state.player.x+state.enemy.x)/2));ctx.clearRect(0,0,w,h);if(!pictures.room)return;ctx.save();if(impact>0&&!progress.motion&&!paused)ctx.translate(Math.sin(clock*120)*impact*20,0);const bg=pictures.room,scale=Math.max(w/bg.width,h/bg.height);ctx.drawImage(bg,(w-bg.width*scale)/2-(camera-500)*.35,(h-bg.height*scale)/2,bg.width*scale,bg.height*scale);
    if(crowd){ctx.save();ctx.translate((w-bg.width*scale)/2-(camera-500)*.35,(h-bg.height*scale)/2);ctx.scale(scale,scale);crowd.draw(ctx,clock,!progress.motion,screen==='story'||screen==='room');ctx.restore();}
    if(isLutz())drawDrain(w,h);
    if(screen==='room'&&!room.won){ctx.save();ctx.strokeStyle=CareerRoom.ready(room)?'#ead59b':'#b9bd9a';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.ellipse(420+w/2-camera,h*.84+3,36,8,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
    if(frames.erek){drawFighter('erek',state.player,false);if(!(screen==='room'&&room.won&&Number(fightId.slice(1))>=3))drawFighter('hask',state.enemy,true);FightEffects.draw(ctx,effects,camera,w,h*.84,progress.motion);}
    ctx.restore();
  }
  function drawDrain(w,h){
    const x=500+w/2-camera,top=h*.65,bottom=h;
    ctx.save();ctx.fillStyle='#171f20';ctx.beginPath();ctx.moveTo(x-7,top);ctx.lineTo(x+7,top);ctx.lineTo(x+17,bottom);ctx.lineTo(x-17,bottom);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#c2c8bc';ctx.lineWidth=2;ctx.stroke();
    for(let y=top+3;y<bottom;y+=7){const width=7+10*(y-top)/(bottom-top);ctx.strokeStyle='#87958e';ctx.beginPath();ctx.moveTo(x-width,y);ctx.lineTo(x+width,y);ctx.stroke();}ctx.restore();
  }
  function loop(time){const dt=Math.min(.05,Math.max(0,(time-stamp)/1000||0));stamp=time;if(!paused){const previousClock=clock;clock+=dt;if(isZarr()&&Math.floor(previousClock/4)<Math.floor(clock/4))sound(55,.65,.055,true);impact=Math.max(0,impact-dt);captionTime=Math.max(0,captionTime-dt);
    if(screen==='countdown'){const before=Math.ceil(count);count-=dt;const n=Math.ceil(count);$('countdown').textContent=n>0?String(n):'';if(before!==n)sound(200,.09);if(count<=0){screen='fight';$('countdown').hidden=true;clearInput();}}
    else if(screen==='room'){const arrived=CareerRoom.step(room,dt,input);state.player.x=room.x;updateRoom();if(arrived){room=null;progress.introSeen?normalRematch():normalIntro();}}
    else if(screen==='fight'){M.step(state,dt,input);eventEffects();updateHud();$('combat-caption').hidden=captionTime<=0;if(state.phase!=='fight')finished();}
    else if(screen==='ending'){resultDelay-=dt;if(resultDelay<=0)(practice?result():(isLutz()||isPetra()||isGustav())&&state.elapsed>=120?result():scene(state.phase==='won'?S.victory:S.defeat,result,state.phase==='won'?current().reward.toUpperCase()+' DAYS':'THE CONCRETE'));}
    FightEffects.advance(effects,dt,state);FighterMotion.advance(actorMotion.erek,state.player.x,dt);FighterMotion.advance(actorMotion.hask,state.enemy.x,dt,true);
  }draw();requestAnimationFrame(loop);}
  function resize(){if(screen==='summary')return;const narrow=innerWidth<=650||(innerWidth<=1000&&innerHeight<=520),rect=canvas.parentElement.getBoundingClientRect();canvas.width=narrow?660:1000;canvas.height=Math.round(canvas.width*rect.height/rect.width);draw();}window.addEventListener('resize',resize);
  function image(path){return FightAssets.loadImage(path);}
  const assetPaths={roomHask:'assets/pump-room-v1.webp',erek:'assets/erek-fight-sheet-v1.webp',hask:'assets/hask-fight-sheet-v1.webp',erekMotion:'assets/erek-motion-v1.webp',haskMotion:'assets/hask-motion-v1.webp',roomZarr:'assets/press-cellar-v1.webp',zarr:'assets/zarr-fight-sheet-v1.webp',zarrMotion:'assets/zarr-motion-v1.webp',roomYann:'assets/dry-tank-v1.webp',yann:'assets/yann-fight-sheet-v1.webp',yannMotion:'assets/yann-motion-v1.webp',roomLutz:'assets/cold-store-v1.webp',lutz:'assets/lutz-fight-sheet-v1.webp',roomPetra:'assets/bakehouse-v1.webp',petra:'assets/petra-fight-sheet-v1.webp',roomGustav:'assets/barber-backroom-v1.webp',gustav:'assets/gustav-fight-sheet-v1.webp'};
  const fightAssets={k01:['roomHask','hask','haskMotion'],k02:['roomZarr','zarr','zarrMotion'],k03:['roomYann','yann','yannMotion'],k04:['roomLutz','lutz'],k05:['roomPetra','petra'],k06:['roomGustav','gustav']};
  const imageCache=FightAssets.create(image);let assetGeneration=0;
  function ensureFight(id,resume){
    const names=['erek','erekMotion',...fightAssets[id]];
    if(names.every(name=>pictures[name]))return true;
    const ticket=++assetGeneration;screen='loading';voice.stop();clearInput();pictures.room=null;only();$('pause').disabled=true;
    $('loading-message').textContent='Loading artwork…';$('loading-retry').hidden=true;$('loading-retry').onclick=null;$('loading').hidden=false;
    imageCache.group(names.map(name=>assetPaths[name])).then(images=>{
      names.forEach((name,i)=>{pictures[name]=images[i]});
      frames.erek ||= measureSheet(pictures.erek,false);frames.erekMotion ||= motionSheet(false);
      if(pictures.hask){frames.hask ||= measureSheet(pictures.hask,true);frames.haskMotion ||= motionSheet(true);}
      if(ticket!==assetGeneration)return;
      $('loading').hidden=true;resume();resize();
    }).catch(()=>{if(ticket!==assetGeneration)return;$('loading-message').textContent='The artwork could not load. Check your connection and try again.';const retry=$('loading-retry');retry.hidden=false;retry.onclick=()=>{if(ensureFight(id,resume)){ $('loading').hidden=true;resume();resize(); }};retry.focus({preventScroll:true});});
    return false;
  }
  frames.gustav=GustavMotion.frames;frames.petra=PetraMotion.frames;frames.lutz=LutzMotion.frames;frames.zarr=ZarrMotion.frames;frames.zarrMotion=ZarrMotion.motionFrames;frames.yann=YannMotion.frames;frames.yannMotion=YannMotion.motionFrames;
  selectFight(fights[career.lastFight]?career.lastFight:'k01');resize();requestAnimationFrame(loop);
})();
