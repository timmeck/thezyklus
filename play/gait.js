/* Articulated walking from the original painted limbs. The supporting foot
   travels backwards relative to the body at the same speed as the world. */
(() => {
 const hip=[270,367];
 function art(ctx,im){if(im.src.includes('toren'))ctx.drawImage(im,543,30,543,660,0,50,543,620);else if(im.src.includes('worker')){ctx.drawImage(im,543,0,543,315,0,35,543,332);ctx.drawImage(im,543,315,543,409,0,367,543,357)}else ctx.drawImage(im,543,0,543,724,0,0,543,724)}
 function piece(ctx,im,polygon,from,to,target,end,fitBone=false){
  const angle=Math.atan2(end[1]-target[1],end[0]-target[0])-Math.atan2(to[1]-from[1],to[0]-from[0]);
  ctx.save();ctx.translate(...target);
  if(fitBone){const sourceAngle=Math.atan2(to[1]-from[1],to[0]-from[0]);ctx.rotate(sourceAngle+angle);ctx.scale(Math.hypot(end[0]-target[0],end[1]-target[1])/Math.hypot(to[0]-from[0],to[1]-from[1]),1);ctx.rotate(-sourceAngle)}else ctx.rotate(angle);
  ctx.translate(-from[0],-from[1]);
  ctx.beginPath();polygon.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();
  art(ctx,im);ctx.restore();
 }
 function knee(h,a,l1,l2){const dx=a[0]-h[0],dy=a[1]-h[1],d=Math.min(l1+l2-.1,Math.hypot(dx,dy)),along=(l1*l1-l2*l2+d*d)/(2*d),bend=Math.sqrt(Math.max(0,l1*l1-along*along)),ux=dx/Math.hypot(dx,dy),uy=dy/Math.hypot(dx,dy);return[h[0]+ux*along+uy*bend,h[1]+uy*along-ux*bend]}
 function terrainAmount(terrain,x){if(!terrain)return 0;const t=Math.min(1,Math.abs(terrain(x+24)-terrain(x-24))/36);return t*t*(3-2*t)}
 function draw(ctx,im,x,y,height,dir,distance,running=0,pose=null,terrain=null,phase=null){
  const scale=height/650,terrainMix=terrainAmount(terrain,x),cycle=(phase??(distance/(380*scale)))%1,bob=Math.cos(cycle*Math.PI*4)*(3+2*running)-2,hipY=-310+32*terrainMix+5*running+bob+(pose===null?0:32*pose),lean=.025+.085*running+Math.sin(cycle*Math.PI*2)*.012;
  ctx.save();ctx.translate(x,y);ctx.scale(dir*scale,scale);
  function leg(phase,far){
   phase%=1;const stance=phase<.5,t=stance?phase*2:(phase-.5)*2;
   const reach=(95-49*terrainMix)*(1+.3*running),fx=pose!==null?(far?-18:18):stance?reach-2*reach*t:-reach+2*reach*(t*t*(3-2*t)),lift=pose!==null||stance?0:Math.sin(t*Math.PI)*(6+12*running);
   const h=[far?-7:7,hipY],a=[fx,-58-lift+(terrain?(terrain(x+fx*scale*dir)-terrain(x))/scale:0)],k=knee(h,a,137,133);
   const sourceHip=far?[252,366]:[289,371],sourceKnee=far?[169,500]:[337,496],sourceAnkle=far?[124,613]:[386,616];
   const thigh=far?[[228,344],[286,360],[205,527],[147,509]]:[[252,350],[310,351],[366,493],[311,520]];
   const shin=far?[[150,481],[204,511],[144,632],[94,614]]:[[311,483],[365,480],[408,620],[355,637]];
   piece(ctx,im,thigh,sourceHip,sourceKnee,h,k,true);piece(ctx,im,shin,sourceKnee,sourceAnkle,k,a,true);
   const foot=far?[[98,596],[149,614],[172,655],[157,677],[93,665],[62,635]]:[[357,604],[407,600],[428,630],[482,638],[490,674],[364,674],[350,643]];
   const sourceToe=far?[160,659]:[449,657],footAngle=pose!==null?0:stance?(t>.72?.308*((t-.72)/.28)**2:0):.308*(1-t*t*(3-2*t))-.2*Math.sin(Math.PI*t)**2;
   const sourceAngle=Math.atan2(sourceToe[1]-sourceAnkle[1],sourceToe[0]-sourceAnkle[0])+(far?-.24:0);
   piece(ctx,im,foot,sourceAnkle,sourceToe,a,[a[0]+Math.cos(sourceAngle+footAngle)*50,a[1]+Math.sin(sourceAngle+footAngle)*50]);
  }
  function upper(){ctx.translate(0,hipY);ctx.rotate(lean);ctx.translate(0,-hipY)}
  function arm(phase,far){
   ctx.save();if(far){ctx.translate(9,0);ctx.filter='brightness(.82)'}
   upper();const shoulder=[-20,hipY-165],swing=pose!==null?-.2+pose*.35:-Math.cos(phase*Math.PI*2)*(.36+.25*running);
  const elbow=[shoulder[0]+Math.sin(swing)*95,shoulder[1]+Math.cos(swing)*95],hand=[elbow[0]+Math.sin(swing+.30+.65*running)*84,elbow[1]+Math.cos(swing+.30+.65*running)*84];
  piece(ctx,im,[[211,177],[259,184],[247,256],[230,310],[193,301],[190,254]],[235,200],[210,295],shoulder,elbow);
  piece(ctx,im,[[193,282],[232,293],[226,375],[216,416],[182,411],[172,388]],[210,295],[195,375],elbow,hand);
   ctx.restore();
  }
  if(!im.src.includes('worker'))arm((cycle+.5)%1,true);
  leg((cycle+.5)%1,true);
  leg(cycle,false);
  // Weight shift and forward lean move the shoulders with the torso.
  ctx.save();upper();ctx.translate(-hip[0],hipY-hip[1]);
  ctx.beginPath();if(im.src.includes('worker'))ctx.rect(140,20,230,350);else {ctx.moveTo(153,35);ctx.lineTo(350,35);ctx.lineTo(333,200);ctx.lineTo(326,340);ctx.lineTo(326,372);ctx.lineTo(277,360);ctx.lineTo(241,342);ctx.lineTo(218,363);ctx.lineTo(218,215);ctx.lineTo(153,205);ctx.closePath()}ctx.clip();art(ctx,im);ctx.restore();
  if(!im.src.includes('worker'))arm(cycle,false);
  ctx.restore();
 }
 window.zyklusGait={draw,terrainAmount};
})();
