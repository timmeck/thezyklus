/* Subtle independent spectator motion; measured in the 1672 x 941 bakehouse. */
window.Bakehouse=(()=>{
  'use strict';
  const spectators=[
    [208,314,40,55,.2],[245,332,39,62,1.2],[283,330,40,65,2.2],
    [299,302,41,58,3.2],[337,315,39,54,4.2],[355,331,41,67,5.2],
    [390,310,42,57,.7],[424,321,40,65,1.7],[479,320,42,63,2.7],
    [515,327,39,60,3.7],[541,340,45,67,4.7],[582,334,42,64,5.7],
    [1094,335,40,66,.4],[1126,337,44,65,1.4],[1157,323,39,56,2.4],
    [1194,337,42,66,3.4],[1228,314,41,60,4.4],[1271,318,44,65,5.4],
    [1318,313,41,57,.9],[1329,340,42,66,1.9],[1389,312,42,61,2.9],
    [1424,341,43,61,3.9],[1456,316,44,62,4.9],[1492,314,43,66,5.9],
    [1524,309,42,59,.6],[1535,343,42,61,1.6],[1580,351,44,61,2.6],[1632,329,40,64,3.6]
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

