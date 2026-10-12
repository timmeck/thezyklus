/* Walkable approach only: no combat simulation or narrative side effects. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CareerRoom=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const times={k01:'',k02:'',k03:'Two months after the press cellar.',k04:'Five weeks after the dry tank.',k05:'Four weeks after the old cold store.',k06:'Three weeks after the bakehouse.'};
  function create(id,won=false){return {id,x:200,velocity:0,won,entering:false};}
  function ready(room){return !room.won&&room.x>=380;}
  function enter(room){if(!ready(room))return false;room.entering=true;return true;}
  function step(room,dt,input){
    dt=Math.max(0,Math.min(.05,dt));
    const direction=room.entering?1:Number(!!input.right)-Number(!!input.left);
    const target=direction*180,change=1100*dt;
    room.velocity+=Math.max(-change,Math.min(change,target-room.velocity));
    room.x=Math.max(200,Math.min(420,room.x+room.velocity*dt));
    if(room.x===200&&room.velocity<0||room.x===420&&room.velocity>0)room.velocity=0;
    return room.entering&&room.x===420;
  }
  return {create,ready,enter,step,times};
});
