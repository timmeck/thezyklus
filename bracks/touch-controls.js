(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FightTouch=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create(){return {id:null,x:0,y:0,time:0,dx:0,dy:0};}
  function begin(s,id,x,y,time){if(s.id!==null)return false;Object.assign(s,{id,x,y,time,dx:0,dy:0});return true;}
  function move(s,id,x,y){if(s.id!==id)return 0;s.dx=x-s.x;s.dy=y-s.y;return Math.abs(s.dx)>12&&Math.abs(s.dx)>Math.abs(s.dy)?Math.sign(s.dx):0;}
  function end(s,id,x,y,time,cancel=false){
    if(s.id!==id)return null;
    move(s,id,x,y);const dt=time-s.time;
    const dodge=!cancel&&dt>0&&dt<=220&&s.dx<=-42&&Math.abs(s.dy)<Math.abs(s.dx)*.6&&-s.dx/dt>=.3;
    s.id=null;return dodge;
  }
  return {create,begin,move,end};
});
