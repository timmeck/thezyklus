import {cover,actor,item,shade,tag,bubble,word,speed,gauge,balanceScene,contactOverlay} from '../manga.js';
const base='assets/b3/game/';
export const art=[base+'bram.webp',base+'halberd.webp',base+'dax-seated.webp',base+'iona-boot.webp',base+'bram-brake.webp',base+'corridor.webp',base+'channel.webp',base+'core.webp','assets/b1/game/room.webp','assets/b1/game/rook.webp','assets/b1/game/pip.webp'];
export function draw(s,p){const {ctx:c,w,h}=p,portrait=w<h;if(s.kind==='balance'){
 balanceScene(p,s,{room:'assets/b1/game/room.webp',sheet:base+'bram.webp'},{person:'BRAM',others(){actor(p,base+'halberd.webp',0,1,2,w*.17,h*.85,Math.min(h*.53,w*.66));actor(p,base+'dax-seated.webp',s.elapsed>22?1:0,1,2,w*.85,h*.82,Math.min(h*.43,w*.62));}});
 if(s.elapsed<4)bubble(p,'Feet. Then the rest.',w*(portrait?.2:.28),h*(portrait?.2:.16),w*.51,h*.25,portrait?140:220);
 }else if(s.kind==='pattern'){
 const route=Math.min(2,Math.floor(s.cycle/3));cover(p,route===1?base+'channel.webp':base+'corridor.webp');
 actor(p,'assets/b1/game/rook.webp',1+Math.floor(s.elapsed*2)%2,3,2,w*.2,h*.85,Math.min(h*.67,w*.74),{angle:p.reduced?0:Math.sin(s.elapsed*3)*.016});
 actor(p,base+'bram.webp',0,3,2,w*.77,h*.88,Math.min(h*.71,w*.82));
 const x=w*(.39+.18*Math.min(1,(s.cycle%3+(s.beat||0)/8)/3));actor(p,base+'core.webp',Math.floor(s.elapsed*3)%2,1,2,x,h*.87,Math.min(w*.13,h*.22),{angle:p.reduced?0:Math.sin(s.elapsed*6)*.012});shade(p);contactOverlay(p,s);tag(p,['CANTEEN / THE STRONGER BEAT','SERVICE CHANNEL / LISTEN THROUGH THE FLOOR','PRACTICE RAIL / BRAM’S BOOTS'][route],w*.5,h*.18,{align:'center',size:portrait?9:13});
 if((s.beat||0)<1.8)bubble(p,"It’s found the express queue.",w*.5,h*.27,w*.28,h*.48,230);
 }else{
 cover(p,'assets/b1/game/room.webp');actor(p,'assets/b1/game/rook.webp',2,3,2,w*.17,h*.8,Math.min(h*.57,w*.64));
 actor(p,base+'iona-boot.webp',0,1,1,w*.34,h*.94,Math.min(h*.49,w*.71));
 actor(p,base+'bram-brake.webp',s.value>s.target?1:0,1,2,w*.69,h*.94,Math.min(h*.74,w*.91),{angle:p.reduced?0:Math.sin(s.elapsed*3)*.005});
 shade(p);tag(p,s.kind==='pins'?'ROTATION ZERO / PARKING PINS':'STAND COMPLETE / INDEPENDENT HYDRAULICS',14,28,{size:portrait?9:13});
 tag(p,s.kind==='pins'?'STOPPED':`${Math.max(0,Math.ceil(30-s.elapsed))} s TO REST`,w-14,67,{align:'right',size:portrait?13:20,color:'#f1c97f'});
 gauge(p,s.value,s.kind==='pins'?.5:s.target,s.kind==='pins'?.5:p.assist?.24:.13,s.kind==='pins'?'HOLD → / ENGAGE THE PINS':'GENTLE PRESSURE. NO SUDDEN STOP.');
 if(s.elapsed<5)bubble(p,s.kind==='pins'?'Pins first.':"I’ve got it.",w*.62,h*.2,w*.69,h*.46,210);
 if(s.danger>.4){speed(p,s.elapsed,.14);word(p,'STEADY',w*.38,h*.57,Math.min(46,w*.11),-.08);}
 }}
