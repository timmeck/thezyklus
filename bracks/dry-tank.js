/* Dry tank ambience in the room's 1672 x 941 source space.
 * Feathered head/shoulder samples stay above the concrete rim. The tank,
 * ladder, hands on the rim and ceiling grate remain anchored to the room.
 */
window.DryTank = (() => {
  'use strict';
  const spectators = [
    [229,81,64,91,.3], [307,104,63,89,2.1],
    [375,127,54,91,4.4], [436,151,60,79,1.4],
    [515,161,54,77,3.7], [585,170,59,81,.8],
    [652,181,59,77,5.1], [825,181,56,80,2.8],
    [906,187,57,72,4.9], [1011,171,62,83,1.9],
    [1117,153,65,81,3.2], [1198,133,60,83,.6],
    [1280,111,60,88,4.1], [1404,69,65,96,2.6],
    [1493,75,62,76,5.6], [1558,11,73,91,1.1]
  ];
  function create(room) {
    const figures = spectators.map(([x,y,w,h,phase],index) => {
      const tile = document.createElement('canvas');
      tile.width=w; tile.height=h;
      const c=tile.getContext('2d');
      c.drawImage(room,x,y,w,h,0,0,w,h);
      c.globalCompositeOperation='destination-in';
      const horizontal=c.createLinearGradient(0,0,w,0);
      horizontal.addColorStop(0,'transparent');
      horizontal.addColorStop(.24,'#000');
      horizontal.addColorStop(.76,'#000');
      horizontal.addColorStop(1,'transparent');
      c.fillStyle=horizontal; c.fillRect(0,0,w,h);
      const vertical=c.createLinearGradient(0,0,0,h);
      vertical.addColorStop(0,'transparent');
      vertical.addColorStop(.16,'#000');
      vertical.addColorStop(.65,'#000');
      vertical.addColorStop(1,'transparent');
      c.fillStyle=vertical; c.fillRect(0,0,w,h);
      return {tile,x,y,w,h,phase,index};
    });
    const dust=Array.from({length:22},(_,i)=>({
      phase:(i*37%101)/101,
      across:(i*61%103)/103,
      speed:.019+(i%5)*.002,
      size:i%8===0?1.5:1
    }));
    let reactionAt=-100, reactionStrength=0;
    return {
      react(time,strength=1) {
        reactionAt=time;
        reactionStrength=Math.max(0,Math.min(1.5,strength));
      },
      reset() { reactionAt=-100; reactionStrength=0; },
      draw(c,time,enabled,quiet=false) {
        if(!enabled)return;
        const amount=quiet?.4:1;
        for(const f of figures) {
          const age=time-reactionAt-.065*(f.index%6);
          const pulse=age>0&&age<1.3?Math.sin(Math.PI*age/1.3)**2*reactionStrength:0;
          const sway=Math.sin(time*(.46+f.index%4*.07)+f.phase)*.003*amount;
          const nod=Math.sin(time*.73+f.phase)*.2*amount;
          c.save();
          c.translate(f.x+f.w*.5,f.y+f.h*.88);
          c.rotate(sway+(f.index%2?1:-1)*pulse*.004*amount);
          c.translate(0,nod-pulse*.45*amount);
          c.drawImage(f.tile,-f.w*.5,-f.h*.88);
          c.restore();
        }
        c.save();
        for(const d of dust) {
          const progress=((time*d.speed+d.phase)%1+1)%1;
          const y=76+progress*625;
          // The light widens downwards; particles never leave its central shaft.
          const halfWidth=93+progress*125;
          const x=824+(d.across*2-1)*halfWidth+Math.sin(time*.19+d.phase*6)*4;
          const opacity=Math.sin(progress*Math.PI)*.16*amount;
          c.fillStyle=`rgba(237,211,163,${opacity})`;
          c.fillRect(Math.round(x),Math.round(y),d.size,d.size);
        }
        c.restore();
      }
    };
  }
  return {create};
})();
