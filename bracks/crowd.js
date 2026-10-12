/* Background performance: source-space cut-outs, softly joined to the room.
 * The seated figures keep their hips anchored; no new artwork or story content.
 */
window.PumpRoomCrowd = (() => {
  const seats = [
    [302,161,99,109,.2], [410,162,112,116,1.7], [548,176,76,103,3.1],
    [627,153,94,119,4.5], [1269,131,99,128,2.3], [1355,87,94,154,.9],
    [1440,88,84,144,3.7], [1530,109,103,114,5.2],
    [273,322,109,133,2.9], [1146,368,95,126,1.2],
    [1310,389,105,125,4.1], [1400,348,97,148,5.9], [1550,328,96,145,.6]
  ];
  function create(room) {
    const figures=seats.map(([x,y,w,h,phase],index)=>{
      const tile=document.createElement('canvas');tile.width=w;tile.height=h;
      const c=tile.getContext('2d');c.drawImage(room,x,y,w,h,0,0,w,h);
      c.globalCompositeOperation='destination-in';
      const horizontal=c.createLinearGradient(0,0,w,0);
      horizontal.addColorStop(0,'transparent');horizontal.addColorStop(.16,'#000');horizontal.addColorStop(.84,'#000');horizontal.addColorStop(1,'transparent');
      c.fillStyle=horizontal;c.fillRect(0,0,w,h);
      const vertical=c.createLinearGradient(0,0,0,h);
      vertical.addColorStop(0,'transparent');vertical.addColorStop(.16,'#000');vertical.addColorStop(.78,'#000');vertical.addColorStop(1,'transparent');
      c.fillStyle=vertical;c.fillRect(0,0,w,h);
      return {tile,x,y,w,h,phase,index};
    });
    let reactionAt=-100,reactionStrength=0;
    return {
      react(time,strength=1){reactionAt=time;reactionStrength=strength;},
      reset(){reactionAt=-100;reactionStrength=0;},
      draw(c,time,enabled,quiet=false){
        if(!enabled)return;
        for(const f of figures){
          // Different rhythms and delayed reactions avoid a synchronised crowd.
          const age=time-reactionAt-.06*(f.index%5);
          const pulse=age>0&&age<1.2?Math.sin(Math.PI*age/1.2)**2*reactionStrength:0;
          const amount=quiet?.6:1;
          const sway=Math.sin(time*(.65+f.index%3*.13)+f.phase)*.013*amount;
          const nod=Math.sin(time*1.13+f.phase*2)*.8*amount;
          c.save();c.translate(f.x+f.w*.5,f.y+f.h*.88);
          c.rotate(sway+(f.index%2?1:-1)*pulse*.027);
          c.translate(Math.sin(time*.42+f.phase)*.65,-nod-pulse*(f.index%3+1)*1.5);
          c.drawImage(f.tile,-f.w*.5,-f.h*.88);c.restore();
        }
      }
    };
  }
  return {create};
})();
