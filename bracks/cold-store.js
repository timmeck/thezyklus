/* Small feathered head/shoulder motions, measured in the 1672 x 941 source room.
 * Twelve spectators; shelving, hands and the standing mediator remain anchored. */
window.ColdStore=(()=>{
  'use strict';
  const spectators=[
    [394,170,70,91,.3],[528,173,69,87,2.1],[642,179,71,88,4.4],
    [1155,176,69,88,1.4],[1374,191,72,88,3.7],[1500,184,74,90,.8],
    [421,331,72,85,5.1],[790,330,69,91,2.8],[933,336,72,91,4.9],
    [1119,333,70,87,1.9],[1348,330,73,91,3.2],[1492,329,76,93,.6]
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
