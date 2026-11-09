import {cover,actor,item,image,shade,tag,bubble,word,speed,gauge} from '../manga.js';
const base='assets/b2/game/';
export const art=[base+'dock.webp',base+'pod.webp',base+'pip-sera.webp',base+'crell.webp',base+'rook-winch.webp','assets/b1/game/tavi.webp'];
export function draw(s,p){const {ctx:c,w,h}=p,portrait=w<h,progress=Math.min(1,(s.stage+Math.min(1,s.elapsed/s.duration))/3),danger=s.danger>.4;
 cover(p,base+'dock.webp',1,portrait?.2:.5);
 // The cabin travels west on the lane. Adults remain in the safe recessed mechanism bay.
 const px=w*(.87-progress*1.23),pw=w*(portrait?.91:.52),py=h*.48;
 c.strokeStyle='#aec2ce';c.lineWidth=2;c.beginPath();c.moveTo(0,py+h*.05);c.lineTo(px-pw*.5,py+h*.05);c.stroke();item(p,base+'pod.webp',px,py,pw,p.reduced?0:Math.sin(s.elapsed*3)*.002);
 actor(p,'assets/b1/game/tavi.webp',0,1,1,w*.12,h*.66,Math.min(h*.44,w*.61),{angle:p.reduced?0:Math.sin(s.elapsed*3)*.012});
 actor(p,base+'crell.webp',Math.floor(s.elapsed/8)%2,1,2,w*(portrait?.2:.38),h*.7,Math.min(h*.43,w*.57));
 const ht=Math.min(h*.9,w*1.6),exit=s.kind==='exit',pose=exit?2:Math.abs(s.value-s.target)>.055?1:0;
 // The lever, socket, sill, tether and Sera's supporting hand are drawn as one
 // connected assembly; changing pose cannot detach a grip from its hardware.
 actor(p,base+'pip-sera.webp',pose,3,1,w*(portrait?.46:.24),h*.96,ht);
 if(s.stage>=1){const im=image(base+'rook-winch.webp'),iw=Math.min(portrait?w*.29:150,w*.2+45),ih=Math.min(portrait?h*.19:h*.46,145),ix=w-iw-12,iy=portrait?h*.55:h*.37;c.save();c.fillStyle='#071b28';c.fillRect(ix-3,iy-3,iw+6,ih+24);const rr=Math.min(iw/im.width,ih/im.height);c.drawImage(im,ix+(iw-im.width*rr)/2,iy+(ih-im.height*rr)/2,im.width*rr,im.height*rr);c.strokeStyle='#e4cc95';c.lineWidth=1.5;c.strokeRect(ix-3,iy-3,iw+6,ih+24);p.label('ROOK / REEL CONTROL',ix+iw/2,iy+ih+14,Math.max(8,Math.min(10,w*.023)),'#f0d7a1','center');c.restore();}
 shade(p);tag(p,exit?'WEST BERTH / EVERYONE CLEAR':'GATE A / KEEP THE CATCH ENGAGED',14,27,{size:portrait?10:13});if(!portrait||s.elapsed>=5)tag(p,exit?'14 / 14':'12 CHILDREN + 2 ADULTS',w-14,65,{align:'right',color:'#f3cb81',size:portrait?11:15});
 if(!exit)gauge(p,s.value,s.target,p.assist?.24:.14,danger?(s.value>s.target?'← EASE PRESSURE':'ADD PRESSURE →'):'THE MACHINE CARRIES THE GATE.');else gauge(p,s.value,.5,.5,'HOLD → / TAKE SERA’S HAND');
 if(s.elapsed<5){if(s.stage===1)tag(p,'CHILDREN / “WE’RE NOT TAPPING.”',w*.5,portrait?65:65,{align:'center',size:portrait?10:12});else{const pip=s.stage===0; bubble(p,exit?'All here.':pip?"Okay. Shaking’s allowed.":'Keep holding. That’s enough.',w*(portrait?(pip?.29:.74):.5),portrait?h*.07:10,w*(portrait?(pip?.36:.62):.23),h*.26,portrait?175:220);}}
 if(danger){speed(p,s.elapsed,.23);word(p,'KRRRK',w*.72,h*.7,Math.min(53,w*.12),-.1);}
 if(s.stage===0){const b=s.elapsed%6,taps=[.35,.8,1.5],i=taps.findIndex(t=>b>=t&&b<t+.18);if(i>=0){word(p,i===2?'TAAAP':'TAP',Math.min(w*.83,px),h*.32,Math.min(39,w*.09),-.05);const k=Math.floor(s.elapsed/6)+'-'+i;if(s.lastTap!==k){s.lastTap=k;p.tone(180,.07);}}}
}
