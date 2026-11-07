import {cover,actor,shade,tag,bubble,word,speed,balanceScene,contactOverlay} from '../manga.js';
const base='assets/b1/game/';
export const art=[base+'room.webp',base+'rook.webp',base+'iona.webp',base+'pip.webp',base+'tavi.webp',base+'tavi-probe.webp','assets/b1/p34a.webp'];
export function draw(s,p){const {w,h}=p;if(s.kind==='balance'){
 balanceScene(p,s,{room:base+'room.webp',sheet:base+'rook.webp'},{person:'ROOK',others(){actor(p,base+'iona.webp',0,1,1,w*.18,h*.82,Math.min(h*.53,w*.73),{angle:p.reduced?0:Math.sin(s.elapsed*2)*.012});actor(p,base+'pip.webp',0,1,1,w*.84,h*.79,Math.min(h*.49,w*.65));}});
 if(s.elapsed<5&&p.mode==='running')bubble(p,'I can feel my ancestors.',w*.77,w<h?h*.32:10,w*.53,h*.3,185);
 else if(s.elapsed>5&&s.elapsed<9&&p.mode==='running')bubble(p,'They want me horizontal.',w*.77,w<h?h*.32:10,w*.53,h*.3,185);
 }else{cover(p,'assets/b1/p34a.webp',.8);const beat=s.beat||0;actor(p,base+(s.answered.length?'tavi-probe.webp':'tavi.webp'),0,1,1,w*.2,h*.68,Math.min(h*.5,w*.6));actor(p,base+'rook.webp',beat>4&&beat<6.6?2:0,3,2,w*.69,h*.88,Math.min(h*.69,w*.83),{angle:Math.sin(s.elapsed)*.015});shade(p);contactOverlay(p,s);if(beat<2)bubble(p,'Two short. One long.',w*.42,h*.15,w*.24,h*.38,215);if(s.answered.length===2&&beat<6.7){speed(p,s.elapsed,.2);word(p,'KLANG',w*.54,h*.5,Math.min(70,w*.15));}}
}
