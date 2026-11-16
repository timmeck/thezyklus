// Story-only presentation adapter. The nine public Arena modules stay byte-identical.
// CPU traces showed major GC and repeated layout queries. The Saga uses alpha=1
// (no render interpolation), so cloning the entire match each simulation tick was
// unused work. Preserve capture's original method for interpolated callers.
export function installDuelPresentation(renderer){
 const resize=renderer.resize.bind(renderer);
 let dirty=true;
 renderer.resize=function(){if(!dirty)return;dirty=false;this.ratioCap=1;resize();const top=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top'))||0;this.safeTop=top+(this.width<this.height?160:116);};
 const mark=()=>{dirty=true;renderer.resize();};
 renderer.resizeObserver.disconnect();renderer.resizeObserver=new ResizeObserver(mark);renderer.resizeObserver.observe(renderer.canvas);
 window.addEventListener('orientationchange',mark);window.addEventListener('resize',mark);
 const capture=renderer.capture.bind(renderer);
 renderer.capture=function(state){
  // The Saga deliberately renders the current fixed step, alpha=1. The
  // renderer returns the current state directly when no previous frame exists.
  this.previousFrame=null;
 };
 renderer.captureInterpolated=capture;
 installLetteringCache(renderer);
 renderer.sagaAdapter='fixed-step-no-clone / resize-on-change / cached-lettering / portrait-1x';
 mark();
}

function installLetteringCache(renderer){
 const c=renderer.context;if(!c.getTransform)return; // Native Canvas2D fallback.
 const cache=new Map(),measure=new Map();
 const nativeMeasure=c.measureText.bind(c);
 c.measureText=function(text){const key=this.font+'|'+text;let m=measure.get(key);if(!m){m=nativeMeasure(text);if(measure.size>256)measure.delete(measure.keys().next().value);measure.set(key,m)}return m;};
 for(const method of ['fillText','strokeText']){
  const original=c[method].bind(c);
  c[method]=function(text,x,y,maxWidth){
   if(maxWidth!==undefined||!['alphabetic','top','middle','bottom','ideographic'].includes(this.textBaseline))return original(text,x,y,maxWidth);
   const colour=method==='fillText'?this.fillStyle:this.strokeStyle;
   if(typeof colour!=='string')return original(text,x,y,maxWidth);
   const key=[method,text,this.font,colour,this.lineWidth,this.lineJoin].join('|');
   let entry=cache.get(key);
   if(!entry){
    const size=Number(this.font.match(/[\d.]+px/)?.[0].replace('px',''))||16,pad=Math.ceil(this.lineWidth+4),width=Math.ceil(this.measureText(text).width),height=Math.ceil(size*1.7);
    const canvas=document.createElement('canvas');canvas.width=(width+pad*2)*2;canvas.height=(height+pad*2)*2;
    const cc=canvas.getContext('2d');cc.scale(2,2);cc.font=this.font;cc.fillStyle=this.fillStyle;cc.strokeStyle=this.strokeStyle;cc.lineWidth=this.lineWidth;cc.lineJoin=this.lineJoin;cc.textBaseline='alphabetic';cc[method](text,pad,pad+size*1.15);
    entry={canvas,width,height,pad,size};if(cache.size>=192)cache.delete(cache.keys().next().value);cache.set(key,entry);
   }
   let left=x-entry.pad;if(this.textAlign==='center')left-=entry.width/2;else if(this.textAlign==='right'||this.textAlign==='end')left-=entry.width;
   let top=y-entry.pad-entry.size*1.15;if(this.textBaseline==='top')top=y-entry.pad;else if(this.textBaseline==='middle')top=y-entry.height/2-entry.pad;else if(this.textBaseline==='bottom')top=y-entry.height-entry.pad;
   // Captions which touch the close camera edge retain every word. Decorative
   // deck slogans are omitted in this story arena; the HUD names the exercise.
   if(/TRAINING ONLY|Free travel\.|RECOVERY SERVICE|VICTORY WINDOW|RECOVERED\. OF COURSE\.|^RECOVERY!$|^JUMP\s*\/.*CLIMB/.test(String(text)))return;
   const t=this.getTransform();if(Math.abs(t.b)<.001&&Math.abs(t.c)<.001&&t.a>0){const min=(6-t.e)/t.a,max=(renderer.canvas.width-6-t.e)/t.a;left=Math.max(min,Math.min(max-(entry.width+entry.pad*2),left));}
   this.drawImage(entry.canvas,left,top,entry.canvas.width/2,entry.canvas.height/2);
  };
 }
 renderer.sagaLettering={cache,measure};
}
