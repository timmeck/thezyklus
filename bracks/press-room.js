/* Press cellar ambience in the source image's 1672 x 941 coordinate space.
 * These narrow, feathered upper-body samples leave feet, pillars and the
 * ceiling edges in place. One opaque-centred lamp tile covers the static lamp.
 */
window.PressRoom = (() => {
  'use strict';
  const spectators = [
    [34,276,68,117,.3], [137,289, 70,147,2.1],
    [217,298,59,148,4.4], [265,307,51,135,1.4],
    [375,308, 60,146,3.7], [447,330,66,135,.8],
    [513,318,75,131,5.1], [607,308,78,144,2.8],
    [693,302, 60,144,4.9], [785,311,75,144,1.9],
    [882,329,69,121,3.2], [996,314, 60,119,.6],
    [1081,343,67,106,4.1], [1190,323,65,136,2.6],
    [1310,306,49,143,5.6], [1354,325,59,137,1.1],
    [1440,298,60,143,3.9], [1514,293,70,151,5.9]
  ];


  function create(room) {
    const lamp=document.createElement('canvas');lamp.width=168;lamp.height=172;
    const lampContext=lamp.getContext('2d');lampContext.drawImage(room,750,0,168,172,0,0,168,172);
    lampContext.globalCompositeOperation='destination-in';
    const lampEdge=lampContext.createRadialGradient(84,83,66,84,83,99);
    lampEdge.addColorStop(0,'#000');lampEdge.addColorStop(1,'transparent');
    lampContext.fillStyle=lampEdge;lampContext.fillRect(0,0,168,172);
    const figures=spectators.map(([x,y,w,h,phase],index)=>{
      const tile=document.createElement('canvas');tile.width=w;tile.height=h;
      const c=tile.getContext('2d');c.drawImage(room,x,y,w,h,0,0,w,h);
      c.globalCompositeOperation='destination-in';
      const horizontal=c.createLinearGradient(0,0,w,0);
      horizontal.addColorStop(0,'transparent');horizontal.addColorStop(.22,'#000');
      horizontal.addColorStop(.78,'#000');horizontal.addColorStop(1,'transparent');
      c.fillStyle=horizontal;c.fillRect(0,0,w,h);
      const vertical=c.createLinearGradient(0,0,0,h);
      vertical.addColorStop(0,'transparent');vertical.addColorStop(.12,'#000');
      vertical.addColorStop(.7,'#000');vertical.addColorStop(1,'transparent');
      c.fillStyle=vertical;c.fillRect(0,0,w,h);
      return {tile,x,y,w,h,phase,index};
    });
    // Fixed offsets, not fresh randomness: pauses and reduced motion remain stable.
    const dust=Array.from({length:32},(_,i)=>({
      x:155+(i*137%1355),y:99+(i*43%111),delay:(i*17%63)/100,
      speed:48+(i*23%59),drift:(i%2?1:-1)*(7+i%11),size:i%5===0?2:1
    }));
    let reactionAt=-100,reactionStrength=0;
    return {
      react(time,strength=1){reactionAt=time;reactionStrength=Math.max(0,Math.min(1.5,strength));},
      reset(){reactionAt=-100;reactionStrength=0;},
      draw(c,time,enabled,quiet=false){
        if(!enabled)return;
        const amount=quiet?.45:1;
        const beat=((time%4)+4)%4;
        const swing=Math.sin(beat*Math.PI/2)*Math.exp(-beat*.6);
        // The opaque centre includes the old silhouette throughout the tiny arc.
        c.save();c.translate(833,9);c.rotate(swing*.025*amount);
        c.drawImage(lamp,-83,-9);c.restore();
        for(const f of figures){
          const age=time-reactionAt-.07*(f.index%6);
          const pulse=age>0&&age<1.25?Math.sin(Math.PI*age/1.25)**2*reactionStrength*amount:0;
          const sway=Math.sin(time*(.52+f.index%4*.09)+f.phase)*.0038*amount;
          c.save();c.translate(f.x+f.w*.5,f.y+f.h*.89);
          c.rotate(sway+(f.index%2?1:-1)*pulse*.006);
          c.translate(0,Math.sin(time*.92+f.phase)*.25*amount-pulse*.55);
          c.drawImage(f.tile,-f.w*.5,-f.h*.89);c.restore();
        }
        // Warm spill follows the small pendulum arc without darkening fight cues.
        c.save();
        const glow=c.createRadialGradient(832,143,10,832+swing*30*amount,345,340);
        glow.addColorStop(0,'rgba(255,185,92,0.018)');
        glow.addColorStop(.65,'rgba(244,171,79,0.009)');glow.addColorStop(1,'transparent');
        c.fillStyle=glow;c.fillRect(400,135,870,610);
        for(const d of dust){
          const age=beat-d.delay;
          if(age<0||age>2.8)continue;
          const fade=Math.sin(Math.min(1,age/.22)*Math.PI/2)*Math.max(0,1-age/2.8);
          c.fillStyle=`rgba(198,169,128,${fade*.22*amount})`;
          const x=d.x+Math.sin(age*1.1+d.delay)*d.drift;
          const y=d.y+age*d.speed;
          c.fillRect(Math.round(x),Math.round(y),d.size,d.size);
        }
        c.restore();
      }
    };
  }
  return {create};
})();
