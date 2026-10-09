(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let roomAudio=null,belaReactUntil=0;addEventListener('bela-rematch',()=>belaReactUntil=-1);addEventListener('swim-close',()=>{if(belaReactUntil===-1)belaReactUntil=performance.now()+8000});
 function sprite(ctx,im,cell,total,x,y,h,flip=1,baseline=.92){if(!im?.naturalWidth)return;const sw=im.naturalWidth/total,w=h*sw/im.naturalHeight;ctx.save();ctx.translate(x,y);ctx.scale(flip,1);ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(0,0,w*.19,2,0,0,Math.PI*2);ctx.fill();ctx.drawImage(im,sw*cell,0,sw,im.naturalHeight,-w/2,-h*baseline,w,h);ctx.restore()}
 function person(ctx,images,idx,name,px,py,h,state){const people=[['belaWorld',311,64,433,1409],['malinWorld',267,47,507,1457],['ravnWorld',268,52,517,1446]],[key,sx,sy,sw,sh]=people[idx],im=images[key];if(im?.naturalWidth){const w=h*sw/sh;ctx.save();ctx.translate(px,py);ctx.scale(state.x<px?1:-1,1);ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(0,0,w*.3,1.6,0,0,Math.PI*2);ctx.fill();ctx.drawImage(im,sx,sy,sw,sh,-w/2,-h,w,h);ctx.restore()}if(Math.abs(state.x-px)<155){ctx.font='10px Consolas,monospace';ctx.textAlign='center';const tw=ctx.measureText(name).width;ctx.fillStyle='#09141bd9';ctx.fillRect(px-tw/2-9,py-h-14,tw+18,18);ctx.fillStyle='#d8c39a';ctx.fillText(name,px,py-h-1)}}
 function draw(ctx,images,state){const {scene,time,progress}=state;
  if(scene==='main'){
   if(!progress.door)person(ctx,images,1,'Malin',290,535,105,state);
   if(performance.now()<belaReactUntil&&images.belaReaction?.naturalWidth){const im=images.belaReaction,h=106,w=h*im.naturalWidth/im.naturalHeight,away=belaReactUntil-performance.now()>5500;ctx.save();ctx.translate(1450,514);ctx.scale((state.x<1450?1:-1)*(away?-1:1),1);ctx.drawImage(im,-w/2,-h*.96,w,h);ctx.restore()}else person(ctx,images,0,'Bela',1450,514,96,state);
  }
  if(scene==='university')person(ctx,images,2,'Ravn',925,543,136,state);
  if(scene==='sarnRoom'&&!progress.interrogation)person(ctx,images,1,'Malin',440,548,129,state);
  if(scene==='levelNine'){
   const phase=time%28,travelTime=phase<12?phase:phase<14?12:phase<26?phase-2:24;const angle=reduced?0:(Math.floor(time/28)*24+travelTime)*Math.PI/12,px=535-165*Math.cos(angle),dir=Math.sin(angle)>=0?1:-1,distance=Math.floor(angle/Math.PI)*330+(Math.floor(angle/Math.PI)%2?165*(1+Math.cos(angle)):165*(1-Math.cos(angle)));
   if(reduced)window.zyklusMotion.draw(ctx,images.workerWalk,2,px,554,124,dir);else window.zyklusGait.draw(ctx,images.worker,px,554,124,dir,distance);
   if(images.cargo?.naturalWidth){const cx=1190+(reduced?0:Math.sin(time*.18)*28);ctx.drawImage(images.cargo,cx,503,99,66)}
  }
  if(scene==='delivery'||scene==='levelNine'){
   const lights=scene==='delivery'?[510,1120]:[480,985,1300];
   for(const lx of lights){ctx.fillStyle=`rgba(182,215,199,${.07+(reduced?0:.025*Math.sin(time*1.8+lx))})`;ctx.fillRect(lx,304,42,3)}
  }
 }
 function setup(ac){const out=ac.createGain();out.gain.value=0;out.connect(ac.destination);const noise=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),d=noise.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){last=(last+Math.random()*.04-.02)/1.02;d[i]=last*4}const source=ac.createBufferSource();source.buffer=noise;source.loop=true;const filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=200;source.connect(filter).connect(out);source.start();const hum=ac.createOscillator(),hg=ac.createGain();hum.frequency.value=55;hg.gain.value=.07;hum.connect(hg).connect(out);hum.start();return{ac,out,filter,hum,next:0,lastProfile:''}}
 function audio(ac,enabled,state){if(!ac)return;if(!roomAudio)roomAudio=setup(ac);const r=roomAudio,now=ac.currentTime,quiet=!enabled||document.hidden||!state.active;const profile=state.scene==='levelNine'?[540,.12,73]:state.scene==='delivery'?[320,.09,62]:state.scene==='main'&&state.x>985?[1050,.075,48]:state.scene==='university'?[170,.045,55]:[110,.025,48];const signature=[quiet,state.paused,...profile].join(':');if(signature!==r.lastProfile){r.lastProfile=signature;r.out.gain.setTargetAtTime(quiet?0:profile[1]*(state.paused?.3:1),now,.35);r.filter.frequency.setTargetAtTime(profile[0],now,.5);r.hum.frequency.setTargetAtTime(profile[2],now,.5);}
  if(!quiet&&!state.paused&&now>r.next){r.next=now+5+Math.random()*7;if(state.scene==='levelNine'||state.scene==='delivery'){const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(470+Math.random()*180,now);o.frequency.exponentialRampToValueAtTime(160,now+.17);g.gain.setValueAtTime(.009,now);g.gain.exponentialRampToValueAtTime(.0001,now+.45);o.connect(g).connect(r.out);o.start();o.stop(now+.5)}}
 }
 window.zyklusLife={draw,audio};
})();