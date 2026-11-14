import {CHARACTERS} from './engine.js';
const load=url=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=url;});
function wrap(c,text,x,y,width,lineHeight){let line='';for(const word of text.split(' ')){const next=line?line+' '+word:word;if(c.measureText(next).width>width&&line){c.fillText(line,x,y);y+=lineHeight;line=word;}else line=next;}c.fillText(line,x,y);return y+lineHeight;}
export async function certificatePNG(match,{lesson,assessment,service,index,lessons,assist}){
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1100;
 const c=canvas.getContext('2d'),ink='#112735',paper='#f2ebdc',orange='#e85e3c',gold='#c6a35a';
 c.fillStyle=paper;c.fillRect(0,0,1600,1100);
 c.strokeStyle=ink;c.lineWidth=5;c.strokeRect(32,32,1536,1036);
 c.strokeStyle=gold;c.lineWidth=2;c.strokeRect(46,46,1508,1008);
 c.fillStyle=ink;c.fillRect(46,46,1508,110);c.fillStyle=paper;c.font='600 44px Condensed';c.fillText('// MARS',80,116);
 c.font='600 21px Barlow';c.textAlign='right';c.fillText('MARS FLEET ACADEMY / RECOVERY SERVICE',1512,109);c.textAlign='left';
 c.fillStyle=gold;
 for(let x=66;x<1530;x+=31){c.beginPath();c.moveTo(x,176);c.lineTo(x+10,184);c.lineTo(x+20,176);c.stroke();}
 c.fillStyle=orange;c.font='600 24px Barlow';c.fillText('FIELD MANUAL / SECTION '+String(index+1).padStart(2,'0')+' / CLASS OF 2705',86,236);
 c.fillStyle=ink;c.font='600 91px Condensed';c.fillText(assessment.passed?'CERTIFICATE OF':'CERTIFICATE OF',82,337);
 c.font='600 italic 100px Condensed';c.fillStyle=orange;c.fillText(assessment.passed?'EVENTUAL LANDING.':'FURTHER POTENTIAL.',82,434);
 const f=match.fighters[0],char=CHARACTERS.find(ch=>ch.id===f.id);
 c.fillStyle=ink;c.font='600 31px Condensed';c.fillText('AWARDED TO '+char.name.toUpperCase()+' / CADET '+service,86,509);
 c.font='600 50px Condensed';wrap(c,lesson.title.toUpperCase(),86,583,980,52);
 c.font='500 25px Barlow';const end=wrap(c,assessment.comment,86,661,920,35);
 c.font='600 25px Condensed';wrap(c,'RANK / '+assessment.rank.toUpperCase(),86,end+35,950,34);
 c.font='500 19px Barlow';wrap(c,'Training grade '+assessment.grade+' · '+match.stats.hits+' contacts · '+f.stats.recoveries+' exemplary remote retrievals'+(assist?' · Assistance enabled':''),86,end+87,950,28);
 const sprite=await load('assets/'+f.id+'-victory.webp');
 if(sprite){const scale=Math.min(330/sprite.width,530/sprite.height);c.drawImage(sprite,1160+(330-sprite.width*scale)/2,260,scale*sprite.width,scale*sprite.height);}
 c.save();c.translate(1306,865);c.rotate(-0.16);c.strokeStyle=orange;c.lineWidth=7;c.beginPath();c.arc(0,0,119,0,Math.PI*2);c.stroke();c.lineWidth=2;c.beginPath();c.arc(0,0,106,0,Math.PI*2);c.stroke();c.fillStyle=orange;c.textAlign='center';c.font='600 22px Condensed';c.fillText('VICTORY WINDOW',0,-45);c.font='600 42px Condensed';c.fillText(assessment.passed?'APPROVED':'POTENTIAL',0,5);c.font='600 18px Condensed';c.fillText('EVIDENCE EDITED',0,40);c.restore();c.textAlign='left';
 const count=(lessons||[]).filter(l=>l?.passed).length;
 for(let i=0;i<7;i++){c.fillStyle=i<count?orange:'#cecbbd';c.fillRect(86+i*119,905,102,36);c.fillStyle=i<count?paper:ink;c.font='600 20px Condensed';c.fillText(String(i+1).padStart(2,'0')+(i<count?' / PASS':''),96+i*119,930);}
 c.fillStyle=ink;c.font='500 17px Barlow';c.fillText('SERVICE No. MDF-2705-'+service+'-'+String(index+1).padStart(2,'0')+'  /  EXERCISE '+match.seed,86,989);
 c.font='500 14px Barlow';c.fillText('© Tim Mecklenburg · Original MARS game adaptation · AI-assisted artwork and software · Saved locally',86,1021);
 if(lesson.examiner){c.font='500 14px Barlow';c.fillText('EXAMINER / '+lesson.examiner.toUpperCase()+' · '+lesson.examinerSource,86,1047);}
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed')),'image/png'));
}
