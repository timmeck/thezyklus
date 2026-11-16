// Four separately drawn phases per movement. Original Iona identity is retained.
// Anchor the moving hands to the physical grip, rather than rotating a standing sprite.
export const MOTION_ASSETS=['swing','crawl','climb','ledge'].flatMap(pose=>[0,1,2,3].map(i=>`iona-k1c-${pose}-${i}`));
const motion=new WeakMap();
export function drawExploreMotion(ctx,p,time,images,reduced=false){
 const pose=p.ledge?'ledge':p.action;
 if(!['swing','crawl','climb','ledge'].includes(pose))return false;
 let m=motion.get(p);if(!m||m.pose!==pose){m={pose,start:time};motion.set(p,m)}
 if(pose==='crawl'&&Math.abs(p.vx||0)>18)m.crawlFrame=Math.floor(time*7)%4;
 const phase=reduced?0:pose==='swing'?Math.min(3,Math.max(0,Math.round(((p.vx||0)/430+1)*1.5))):pose==='climb'?Math.min(3,Math.floor((time-m.start)*14)):pose==='ledge'?Math.min(3,Math.floor((time-m.start)*7)):(m.crawlFrame||0);
 const art=images[`iona-k1c-${pose}-${phase}`];if(!art)return false;
 const unit=pose==='crawl'?.34:.325;
 ctx.save();ctx.scale(p.facing||1,1);
 if(pose==='swing'){
  // Sprite hands coincide with the rope endpoint 70 world units above the feet.
  const gripX=[.94,.69,.32,.38][phase]*art.width;
  ctx.drawImage(art,-gripX*unit,-70,art.width*unit,art.height*unit);
 }else if(pose==='crawl')ctx.drawImage(art,-art.width*unit*.48,-art.height*unit,art.width*unit,art.height*unit);
 else if(pose==='ledge'){
  const gripX=art.width*.82;
  ctx.drawImage(art,-gripX*unit+18,-70,art.width*unit,art.height*unit);
 }else{
  // The engine places the feet onto the deck at the start of its .28s climb.
  // The new drawings bridge the physical handhold and the final crouch.
  const lift=[72,52,24,0][phase];
  ctx.drawImage(art,-art.width*unit*.46,-art.height*unit+lift,art.width*unit,art.height*unit);
 }
 ctx.restore();return true;
}
export function drawLandingDust(ctx,p,time,reduced=false){
 if(p.action!=='land'||reduced)return;
 const t=Math.max(0,1-(p.actionTime||0)/.14);
 ctx.save();ctx.globalAlpha=(1-t)*.5;ctx.fillStyle='#b7bdad';
 for(let i=0;i<7;i++){const direction=i%2?1:-1;ctx.beginPath();ctx.ellipse(p.x+direction*(8+i*3+t*34),p.y-3-t*(3+i%3),4+t*9,2+t*2,0,0,Math.PI*2);ctx.fill()}
 ctx.restore();
}
