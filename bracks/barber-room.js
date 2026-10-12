/* Subtle independent spectator motion; measured in the 1672 x 941 barber back room. */
window.BarberRoom=(()=>{
  'use strict';
  const spectators=[
    [345,364,55,67,.2],[425,365,54,70,1.2],[532,363,56,71,2.2],
    [614,374,53,70,3.2],[683,362,54,74,4.2],[783,360,57,76,5.2],
    [884,373,54,72,.7],[984,366,54,73,1.7],[1082,379,55,71,2.7],
    [1228,372,53, 70,3.7],[1314,357,65,84,4.7],[1418,356,59,82,5.7],
    [1506,387,65,86,.4],[1590,396, 60,90,1.4],[139,244,62,91,2.4]
  ];
  function create(room){
    const figures=spectators.map(([x,y,w,h,phase],index)=>{
      const tile=document.createElement('canvas');tile.width=w;tile.height=h;
      const c=tile.getContext('2d');c.drawImage(room,x,y,w,h,0,0,w,h);
      c.globalCompositeOperation='destination-in';
      const horizontal=c.createLinearGradient(0,0,w,0);
      for(const [p,col] of [[0,'transparent'],[.24,'#000'],[.76,'#000'],[1,'transparent']])horizontal.addColorStop(p,col);
      c.fillStyle=horizontal;c.fillRect(0,0,w,h);
      const vertical=c.createLinearGradient(0,0,0,h);
      for(const [p,col] of [[0,'transparent'],[.16,'#000'],[.65,'#000'],[1,'transparent']])vertical.addColorStop(p,col);
      c.fillStyle=vertical;c.fillRect(0,0,w,h);
      return {tile,x,y,w,h,phase,index};
    });
    let reactionAt=-100,reactionStrength=0;
    return {
      reset(){reactionAt=-100;reactionStrength=0;},
      react(time,strength=1){reactionAt=time;reactionStrength=Math.max(0,Math.min(1.5,strength));},
      draw(c,time,enabled,quiet=false){
        if(!enabled)return;
        const amount=quiet?.4:1;
        for(const f of figures){
          const age=time-reactionAt-.065*(f.index%6);
          const pulse=age>0&&age<1.3?Math.sin(Math.PI*age/1.3)**2*reactionStrength:0;
          c.save();c.translate(f.x+f.w*.5,f.y+f.h*.88);
          c.rotate(Math.sin(time*(.46+f.index%4*.07)+f.phase)*.003*amount+(f.index%2?1:-1)*pulse*.004*amount);
          c.translate(0,(Math.sin(time*.73+f.phase)*.2-pulse*.45)*amount);
          c.drawImage(f.tile,-f.w*.5,-f.h*.88);c.restore();
        }
      }
    };
  }
  return {create};
})();


