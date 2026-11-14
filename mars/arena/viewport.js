/* Presentation preferences are separate from the public career save. */
const $ = s => document.querySelector(s);
const KEY = 'mars-arena-controls-v1';
export class ArenaViewport {
  constructor({onResize, onRotate, onMethod, onReduced}) {
    this.callbacks = {onResize, onRotate, onMethod, onReduced};
    this.preferences = {size:'standard', left:false, vibration:true, homeTipSeen:false};
    try {
      const old = JSON.parse(localStorage.getItem(KEY));
      if (['compact','standard','large'].includes(old?.size)) this.preferences.size=old.size;
      for(const key of ['left','vibration','homeTipSeen']) if(typeof old?.[key]==='boolean')this.preferences[key]=old[key];
    } catch {}
    this.ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    this.iphone = /iPhone|iPod/.test(navigator.userAgent);
    this.canVibrate = !this.ios && /Android/i.test(navigator.userAgent) && typeof navigator.vibrate==='function';
    this.standalone = () => matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone===true;
    this.method = matchMedia('(any-pointer: coarse)').matches || navigator.maxTouchPoints>0 ? 'touch':'keyboard';
    this.apply();
    $('#control-size').value=this.preferences.size;
    $('#left-handed').checked=this.preferences.left;
    $('#vibration').checked=this.preferences.vibration;
    $('#vibration-setting').hidden=!this.canVibrate;
    $('#home-tip-open').hidden=!this.ios||this.standalone();
    $('#control-size').addEventListener('change',()=>{this.preferences.size=$('#control-size').value;this.apply();this.save();this.schedule();});
    $('#left-handed').addEventListener('change',()=>{this.preferences.left=$('#left-handed').checked;this.apply();this.save();});
    $('#vibration').addEventListener('change',()=>{this.preferences.vibration=$('#vibration').checked;this.save();});
    $('#effects-setting').addEventListener('change',()=>onReduced($('#effects-setting').checked));
    $('#home-tip-open').addEventListener('click',()=>this.showHomeTip(true));
    $('#dismiss-home-tip').addEventListener('click',()=>{$('#home-screen-tip').hidden=true;this.preferences.homeTipSeen=true;this.save();});
    window.addEventListener('resize',()=>this.schedule());
    window.visualViewport?.addEventListener('resize',()=>this.schedule());
    window.visualViewport?.addEventListener('scroll',()=>this.schedule());
    window.addEventListener('orientationchange',()=>{this.schedule();setTimeout(()=>this.schedule(),200);});
    document.addEventListener('fullscreenchange',()=>this.schedule());
    $('#game').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')this.setMethod('touch');},{capture:true});
    $('#game').addEventListener('contextmenu',e=>e.preventDefault());
    $('#game').addEventListener('dragstart',e=>e.preventDefault());
    // This is scoped to the play surface. Text dialogs retain normal scrolling/selection.
    $('#game').addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
    window.addEventListener('beforeinstallprompt',e=>{
      e.preventDefault();this.installPrompt=e;$('#install-app').hidden=false;
    });
    $('#install-app').addEventListener('click',async()=>{
      if(!this.installPrompt)return;
      const prompt=this.installPrompt;this.installPrompt=null;
      $('#install-app').hidden=true;await prompt.prompt();await prompt.userChoice;
    });
    window.addEventListener('appinstalled',()=>{this.installPrompt=null;$('#install-app').hidden=true;$('#home-screen-tip').hidden=true;});
    this.update();
  }
  save(){try{localStorage.setItem(KEY,JSON.stringify(this.preferences));}catch{}}
  apply(){
    document.documentElement.dataset.controlSize=this.preferences.size;
    document.documentElement.dataset.leftHanded=String(this.preferences.left);
    document.documentElement.dataset.input=this.method;
  }
  setMethod(method){if(this.method===method)return;this.method=method;this.apply();this.callbacks.onMethod(method);this.schedule();}
  pulse(ms=12){if(this.canVibrate&&this.preferences.vibration&&this.method==='touch')try{navigator.vibrate(ms);}catch{}}
  schedule(){if(this.pending)return;this.pending=requestAnimationFrame(()=>{this.pending=0;this.update();});}
  update(){
    const v=window.visualViewport,w=v?.width||innerWidth,h=v?.height||innerHeight;
    const landscape=w>h;
    if(this.landscape!==undefined&&this.landscape!==landscape)this.callbacks.onRotate();
    this.landscape=landscape;
    const style=document.documentElement.style;
    style.setProperty('--app-width',`${w}px`);style.setProperty('--app-height',`${h}px`);
    style.setProperty('--app-x',`${v?.offsetLeft||0}px`);style.setProperty('--app-y',`${v?.offsetTop||0}px`);
    this.callbacks.onResize({width:w,height:h,landscape});
  }
  showHomeTip(force=false){
    if(!this.ios||this.standalone()||(!force&&this.preferences.homeTipSeen))return;
    const tip=$('#home-screen-tip');
    const host=$('dialog[open]')||document.body;
    host.append(tip);
    tip.hidden=false;this.preferences.homeTipSeen=true;this.save();
  }
  async fullscreen(){
    if(document.fullscreenElement){await document.exitFullscreen();return;}
    if(this.iphone||!$('#game').requestFullscreen){this.showHomeTip(true);return;}
    await $('#game').requestFullscreen({navigationUI:'hide'});
    // Lock to the current orientation when supported; both layouts remain playable.
    try{await screen.orientation?.lock?.(this.landscape?'landscape':'portrait');}catch{}
  }
}
