import{n as e,r as t}from"./rolldown-runtime-CNOWq4Kh.js";import{n,t as r}from"./pixi-DWGmO4iW.js";import{C as i,S as a,b as o,x as s}from"./pixi-BW511S8E.js";import{a as c,o as l}from"./pixi-BQzmZckT.js";import{B as u,z as d}from"./pixi-BJJOeoSZ.js";import{A as f,C as p,G as m,J as h,K as g,Q as _,Z as v,_t as ee,ft as y,gt as b,j as te,pt as ne,q as re,vt as ie,w as ae,yt as oe}from"./pixi-CTi3qx_a.js";import{N as se,P as ce,_ as le,g as ue,v as de,y as fe}from"./pixi-ed0nSAvr.js";import{_ as pe,n as me,t as he,v as ge}from"./pixi-DZI0JHt9.js";import{_ as _e,v as ve}from"./pixi-_ZUa6G67.js";import{i as ye,n as be,r as xe,t as Se}from"./pixi-uPBGjyZU.js";import{P as Ce}from"./pixi-B4Fg3xDo.js";import{t as we}from"./pixi-CHA_oBUs.js";import{l as x,u as S}from"./pixi-COEZjR7b.js";import{c as Te,l as C,s as Ee,u as w}from"./pixi-q-S6nZ4y.js";import{n as De,t as Oe}from"./pixi-Ip91Bc_9.js";import{n as ke,t as Ae}from"./pixi-ByRGQvHc.js";var T,E,D,O;function k(){return(k=e((()=>{T=(e=>(e.Application=`application`,e.WebGLPipes=`webgl-pipes`,e.WebGLPipesAdaptor=`webgl-pipes-adaptor`,e.WebGLSystem=`webgl-system`,e.WebGLLoader=`webgl-loader`,e.WebGPUPipes=`webgpu-pipes`,e.WebGPUPipesAdaptor=`webgpu-pipes-adaptor`,e.WebGPUSystem=`webgpu-system`,e.WebGPULoader=`webgpu-loader`,e.CanvasSystem=`canvas-system`,e.CanvasPipesAdaptor=`canvas-pipes-adaptor`,e.CanvasPipes=`canvas-pipes`,e.CanvasLoader=`canvas-loader`,e.Asset=`asset`,e.LoadParser=`load-parser`,e.ResolveParser=`resolve-parser`,e.CacheParser=`cache-parser`,e.DetectionParser=`detection-parser`,e.MaskEffect=`mask-effect`,e.BlendMode=`blend-mode`,e.TextureSource=`texture-source`,e.TextureUploaderWebGL=`texture-uploader-webgl`,e.TextureUploaderWebGPU=`texture-uploader-webgpu`,e.Environment=`environment`,e.ShapeBuilder=`shape-builder`,e.Batcher=`batcher`,e))(T||{}),E=e=>{if(typeof e==`function`||typeof e==`object`&&e.extension){if(!e.extension)throw Error(`Extension class must have an extension object`);e={...typeof e.extension==`object`?e.extension:{type:e.extension},ref:e}}if(typeof e==`object`)e={...e};else throw Error(`Invalid extension type`);return typeof e.type==`string`&&(e.type=[e.type]),e},D=(e,t)=>E(e).priority??t,O={_addHandlers:{},_removeHandlers:{},_queue:{},remove(...e){return e.map(E).forEach(e=>{e.type.forEach(t=>this._removeHandlers[t]?.(e))}),this},add(...e){return e.map(E).forEach(e=>{e.type.forEach(t=>{let n=this._addHandlers,r=this._queue;n[t]?n[t]?.(e):(r[t]=r[t]||[],r[t]?.push(e))})}),this},handle(e,t,n){let r=this._addHandlers,i=this._removeHandlers;if(r[e]||i[e])throw Error(`Extension type ${e} already has a handler`);r[e]=t,i[e]=n;let a=this._queue;return a[e]&&(a[e]?.forEach(e=>t(e)),delete a[e]),this},handleByMap(e,t){return this.handle(e,e=>{e.name&&(t[e.name]=e.ref)},e=>{e.name&&delete t[e.name]})},handleByNamedList(e,t,n=-1){return this.handle(e,e=>{t.findIndex(t=>t.name===e.name)>=0||(t.push({name:e.name,value:e.ref}),t.sort((e,t)=>D(t.value,n)-D(e.value,n)))},e=>{let n=t.findIndex(t=>t.name===e.name);n!==-1&&t.splice(n,1)})},handleByList(e,t,n=-1){return this.handle(e,e=>{t.includes(e.ref)||(t.push(e.ref),t.sort((e,t)=>D(t,n)-D(e,n)))},e=>{let n=t.indexOf(e.ref);n!==-1&&t.splice(n,1)})},mixin(e,...t){for(let n of t)Object.defineProperties(e.prototype,Object.getOwnPropertyDescriptors(n))}}})))()}var je;function Me(){return(Me=e((()=>{k(),n(),je={extension:{type:T.Environment,name:`browser`,priority:-1},test:()=>!0,load:async()=>{await r(()=>Promise.resolve().then(()=>(Ot(),Dt)),void 0,import.meta.url)}}})))()}var Ne;function Pe(){return(Pe=e((()=>{k(),n(),Ne={extension:{type:T.Environment,name:`webworker`,priority:0},test:()=>typeof self<`u`&&self.WorkerGlobalScope!==void 0,load:async()=>{await r(()=>Promise.resolve().then(()=>(At(),kt)),void 0,import.meta.url)}}})))()}var Fe;function Ie(){return(Ie=e((()=>{Fe=class{constructor(){this.pipe=`filter`,this.priority=1}destroy(){for(let e=0;e<this.filters.length;e++)this.filters[e].destroy();this.filters=null,this.filterArea=null}}})))()}var Le;function Re(){return(Re=e((()=>{Le={createCanvas:(e,t)=>{let n=document.createElement(`canvas`);return n.width=e,n.height=t,n},createImage:()=>new Image,getCanvasRenderingContext2D:()=>CanvasRenderingContext2D,getWebGLRenderingContext:()=>WebGLRenderingContext,getNavigator:()=>navigator,getBaseUrl:()=>document.baseURI??window.location.href,getFontFaceSet:()=>document.fonts,fetch:(e,t)=>fetch(e,t),parseXML:e=>new DOMParser().parseFromString(e,`text/xml`)}})))()}var A,ze;function Be(){return(Be=e((()=>{Re(),A=Le,ze={get(){return A},set(e){A=e}}})))()}var j;function M(){return(M=e((()=>{i(),j=class e{constructor(t){this.bubbles=!0,this.cancelBubble=!0,this.cancelable=!1,this.composed=!1,this.defaultPrevented=!1,this.eventPhase=e.prototype.NONE,this.propagationStopped=!1,this.propagationImmediatelyStopped=!1,this.layer=new a,this.page=new a,this.NONE=0,this.CAPTURING_PHASE=1,this.AT_TARGET=2,this.BUBBLING_PHASE=3,this.manager=t}get layerX(){return this.layer.x}get layerY(){return this.layer.y}get pageX(){return this.page.x}get pageY(){return this.page.y}get data(){return this}composedPath(){return this.manager&&(!this.path||this.path[this.path.length-1]!==this.target)&&(this.path=this.target?this.manager.propagationPath(this.target):[]),this.path}initEvent(e,t,n){throw Error(`initEvent() is a legacy DOM API. It is not implemented in the Federated Events API.`)}initUIEvent(e,t,n,r,i){throw Error(`initUIEvent() is a legacy DOM API. It is not implemented in the Federated Events API.`)}preventDefault(){this.nativeEvent instanceof Event&&this.nativeEvent.cancelable&&this.nativeEvent.preventDefault(),this.defaultPrevented=!0}stopImmediatePropagation(){this.propagationImmediatelyStopped=!0}stopPropagation(){this.propagationStopped=!0}}})))()}var N,P;function F(){return(F=e((()=>{S(),w(),h(),g(),N=class e extends re{constructor(t){t={...e.defaultOptions,...t},super(t),this.enabled=!0,this._state=m.for2d(),this.blendMode=t.blendMode,this.padding=t.padding,this.antialias=typeof t.antialias==`boolean`?t.antialias?`on`:`off`:t.antialias,this.resolution=t.resolution,this.blendRequired=t.blendRequired,this.clipToViewport=t.clipToViewport,this.addResource(`uTexture`,0,1),t.blendRequired&&this.addResource(`uBackTexture`,0,3)}apply(e,t,n,r){e.applyFilter(this,t,n,r)}get blendMode(){return this._state.blendMode}set blendMode(e){this._state.blendMode=e}static from(t){let{gpu:n,gl:r,...i}=t,a,o;return n&&(a=C.from(n)),r&&(o=x.from(r)),new e({gpuProgram:a,glProgram:o,...i})}},N.defaultOptions={blendMode:`normal`,resolution:1,padding:0,antialias:`off`,blendRequired:!1,clipToViewport:!0},P=N})))()}async function Ve(e){if(!e)for(let e=0;e<I.length;e++){let t=I[e];if(t.value.test()){await t.value.load();return}}}var I;function He(){return(He=e((()=>{k(),I=[],O.handleByNamedList(T.Environment,I)})))()}var Ue,L;function R(){return(R=e((()=>{ye(),be(),Ue=class{constructor(){this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}init(e){this.removeTickerListener(),this.events=e,this.interactionFrequency=10,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}get pauseUpdate(){return this._pauseUpdate}set pauseUpdate(e){this._pauseUpdate=e}addTickerListener(){!this._tickerAdded&&this.domElement&&(Se.system.add(this._tickerUpdate,this,xe.INTERACTION),this._tickerAdded=!0)}removeTickerListener(){this._tickerAdded&&=(Se.system.remove(this._tickerUpdate,this),!1)}pointerMoved(){this._didMove=!0}_update(){if(!this.domElement||this._pauseUpdate)return;if(this._didMove){this._didMove=!1;return}let e=this.events._rootPointerEvent;this.events.supportsTouchEvents&&e.pointerType===`touch`||globalThis.document.dispatchEvent(this.events.supportsPointerEvents?new PointerEvent(`pointermove`,{clientX:e.clientX,clientY:e.clientY,pointerType:e.pointerType,pointerId:e.pointerId}):new MouseEvent(`mousemove`,{clientX:e.clientX,clientY:e.clientY}))}_tickerUpdate(e){this._deltaTime+=e.deltaTime,this._deltaTime<this.interactionFrequency||(this._deltaTime=0,this._update())}destroy(){this.removeTickerListener(),this.events=null,this.domElement=null,this._deltaTime=0,this._didMove=!1,this._tickerAdded=!1,this._pauseUpdate=!0}},L=new Ue})))()}var z;function B(){return(B=e((()=>{i(),M(),z=class extends j{constructor(){super(...arguments),this.client=new a,this.movement=new a,this.offset=new a,this.global=new a,this.screen=new a}get clientX(){return this.client.x}get clientY(){return this.client.y}get x(){return this.clientX}get y(){return this.clientY}get movementX(){return this.movement.x}get movementY(){return this.movement.y}get offsetX(){return this.offset.x}get offsetY(){return this.offset.y}get globalX(){return this.global.x}get globalY(){return this.global.y}get screenX(){return this.screen.x}get screenY(){return this.screen.y}getLocalPosition(e,t,n){return e.worldTransform.applyInverse(n||this.global,t)}getModifierState(e){return`getModifierState`in this.nativeEvent&&this.nativeEvent.getModifierState(e)}initMouseEvent(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m){throw Error(`Method not implemented.`)}}})))()}var V;function H(){return(H=e((()=>{B(),V=class extends z{constructor(){super(...arguments),this.width=0,this.height=0,this.isPrimary=!1,this.persistentDeviceId=0}getCoalescedEvents(){return this.type===`pointermove`||this.type===`mousemove`||this.type===`touchmove`?[this]:[]}getPredictedEvents(){throw Error(`getPredictedEvents is not supported!`)}}})))()}var U;function W(){return(W=e((()=>{B(),U=class extends z{constructor(){super(...arguments),this.DOM_DELTA_PIXEL=0,this.DOM_DELTA_LINE=1,this.DOM_DELTA_PAGE=2}},U.DOM_DELTA_PIXEL=0,U.DOM_DELTA_LINE=1,U.DOM_DELTA_PAGE=2})))()}var We,Ge,G,Ke;function qe(){return(qe=e((()=>{l(),i(),d(),R(),B(),H(),W(),We=2048,Ge=new a,G=new a,Ke=class{constructor(e){this.dispatch=new c,this.moveOnAll=!1,this.enableGlobalMoveEvents=!0,this.mappingState={trackingData:{}},this.eventPool=new Map,this._allInteractiveElements=[],this._hitElements=[],this._isPointerMoveEvent=!1,this.rootTarget=e,this.hitPruneFn=this.hitPruneFn.bind(this),this.hitTestFn=this.hitTestFn.bind(this),this.mapPointerDown=this.mapPointerDown.bind(this),this.mapPointerMove=this.mapPointerMove.bind(this),this.mapPointerOut=this.mapPointerOut.bind(this),this.mapPointerOver=this.mapPointerOver.bind(this),this.mapPointerUp=this.mapPointerUp.bind(this),this.mapPointerUpOutside=this.mapPointerUpOutside.bind(this),this.mapWheel=this.mapWheel.bind(this),this.mapContextMenu=this.mapContextMenu.bind(this),this.mappingTable={},this.addEventMapping(`pointerdown`,this.mapPointerDown),this.addEventMapping(`pointermove`,this.mapPointerMove),this.addEventMapping(`pointerout`,this.mapPointerOut),this.addEventMapping(`pointerleave`,this.mapPointerOut),this.addEventMapping(`pointerover`,this.mapPointerOver),this.addEventMapping(`pointerup`,this.mapPointerUp),this.addEventMapping(`pointerupoutside`,this.mapPointerUpOutside),this.addEventMapping(`wheel`,this.mapWheel),this.addEventMapping(`contextmenu`,this.mapContextMenu)}addEventMapping(e,t){this.mappingTable[e]||(this.mappingTable[e]=[]),this.mappingTable[e].push({fn:t,priority:0}),this.mappingTable[e].sort((e,t)=>e.priority-t.priority)}dispatchEvent(e,t){e.propagationStopped=!1,e.propagationImmediatelyStopped=!1,this.propagate(e,t),this.dispatch.emit(t||e.type,e)}mapEvent(e){if(!this.rootTarget)return;let t=this.mappingTable[e.type];if(t)for(let n=0,r=t.length;n<r;n++)t[n].fn(e);else u(`[EventBoundary]: Event mapping not defined for ${e.type}`)}hitTest(e,t){L.pauseUpdate=!0;let n=this._isPointerMoveEvent&&this.enableGlobalMoveEvents?`hitTestMoveRecursive`:`hitTestRecursive`,r=this[n](this.rootTarget,this.rootTarget.eventMode,Ge.set(e,t),this.hitTestFn,this.hitPruneFn);return r&&r[0]}propagate(e,t){if(!e.target)return;let n=e.composedPath();e.eventPhase=e.CAPTURING_PHASE;for(let r=0,i=n.length-1;r<i;r++)if(e.currentTarget=n[r],this.notifyTarget(e,t),e.propagationStopped||e.propagationImmediatelyStopped)return;if(e.eventPhase=e.AT_TARGET,e.currentTarget=e.target,this.notifyTarget(e,t),!(e.propagationStopped||e.propagationImmediatelyStopped)){e.eventPhase=e.BUBBLING_PHASE;for(let r=n.length-2;r>=0;r--)if(e.currentTarget=n[r],this.notifyTarget(e,t),e.propagationStopped||e.propagationImmediatelyStopped)return}}all(e,t,n=this._allInteractiveElements){if(n.length===0)return;e.eventPhase=e.BUBBLING_PHASE;let r=Array.isArray(t)?t:[t];for(let t=n.length-1;t>=0;t--)r.forEach(r=>{e.currentTarget=n[t],this.notifyTarget(e,r)})}propagationPath(e){let t=[e];for(let n=0;n<We&&e!==this.rootTarget&&e.parent;n++){if(!e.parent)throw Error(`Cannot find propagation path to disconnected target`);t.push(e.parent),e=e.parent}return t.reverse(),t}hitTestMoveRecursive(e,t,n,r,i,a=!1){let o=!1;if(this._interactivePrune(e))return null;if((e.eventMode===`dynamic`||t===`dynamic`)&&(L.pauseUpdate=!1),e.interactiveChildren&&e.children){let s=e.children;for(let c=s.length-1;c>=0;c--){let l=s[c],u=this.hitTestMoveRecursive(l,this._isInteractive(t)?t:l.eventMode,n,r,i,a||i(e,n));if(u){if(u.length>0&&!u[u.length-1].parent)continue;let t=e.isInteractive();(u.length>0||t)&&(t&&this._allInteractiveElements.push(e),u.push(e)),this._hitElements.length===0&&(this._hitElements=u),o=!0}}}let s=this._isInteractive(t),c=e.isInteractive();return c&&c&&this._allInteractiveElements.push(e),a||this._hitElements.length>0?null:o?this._hitElements:s&&!i(e,n)&&r(e,n)?c?[e]:[]:null}hitTestRecursive(e,t,n,r,i){if(this._interactivePrune(e)||i(e,n))return null;if((e.eventMode===`dynamic`||t===`dynamic`)&&(L.pauseUpdate=!1),e.interactiveChildren&&e.children){let a=e.children,o=n;for(let n=a.length-1;n>=0;n--){let s=a[n],c=this.hitTestRecursive(s,this._isInteractive(t)?t:s.eventMode,o,r,i);if(c){if(c.length>0&&!c[c.length-1].parent)continue;let t=e.isInteractive();return(c.length>0||t)&&c.push(e),c}}}let a=this._isInteractive(t),o=e.isInteractive();return a&&r(e,n)?o?[e]:[]:null}_isInteractive(e){return e===`static`||e===`dynamic`}_interactivePrune(e){return!e||!e.visible||!e.renderable||!e.measurable||e.eventMode===`none`||e.eventMode===`passive`&&!e.interactiveChildren}hitPruneFn(e,t){if(e.hitArea&&(e.worldTransform.applyInverse(t,G),!e.hitArea.contains(G.x,G.y)))return!0;if(e.effects&&e.effects.length)for(let n=0;n<e.effects.length;n++){let r=e.effects[n];if(r.containsPoint&&!r.containsPoint(t,this.hitTestFn))return!0}return!1}hitTestFn(e,t){return e.hitArea?!0:e?.containsPoint?(e.worldTransform.applyInverse(t,G),e.containsPoint(G)):!1}notifyTarget(e,t){if(!e.currentTarget.isInteractive())return;t??=e.type;let n=`on${t}`;e.currentTarget[n]?.(e);let r=e.eventPhase===e.CAPTURING_PHASE||e.eventPhase===e.AT_TARGET?`${t}capture`:t;this._notifyListeners(e,r),e.eventPhase===e.AT_TARGET&&this._notifyListeners(e,t)}mapPointerDown(e){if(!(e instanceof V)){u(`EventBoundary cannot map a non-pointer event as a pointer event`);return}let t=this.createPointerEvent(e);if(this.dispatchEvent(t,`pointerdown`),t.pointerType===`touch`)this.dispatchEvent(t,`touchstart`);else if(t.pointerType===`mouse`||t.pointerType===`pen`){let e=t.button===2;this.dispatchEvent(t,e?`rightdown`:`mousedown`)}let n=this.trackingData(e.pointerId);n.pressTargetsByButton[e.button]=t.composedPath(),this.freeEvent(t)}mapPointerMove(e){if(!(e instanceof V)){u(`EventBoundary cannot map a non-pointer event as a pointer event`);return}this._allInteractiveElements.length=0,this._hitElements.length=0,this._isPointerMoveEvent=!0;let t=this.createPointerEvent(e);this._isPointerMoveEvent=!1;let n=t.pointerType===`mouse`||t.pointerType===`pen`,r=this.trackingData(e.pointerId),i=this.findMountedTarget(r.overTargets);if(r.overTargets?.length>0&&i!==t.target){let r=e.type===`mousemove`?`mouseout`:`pointerout`,a=this.createPointerEvent(e,r,i);if(this.dispatchEvent(a,`pointerout`),n&&this.dispatchEvent(a,`mouseout`),!t.composedPath().includes(i)){let r=this.createPointerEvent(e,`pointerleave`,i);for(r.eventPhase=r.AT_TARGET;r.target&&!t.composedPath().includes(r.target);)r.currentTarget=r.target,this.notifyTarget(r),n&&this.notifyTarget(r,`mouseleave`),r.target=r.target.parent;this.freeEvent(r)}this.freeEvent(a)}if(i!==t.target){let r=e.type===`mousemove`?`mouseover`:`pointerover`,a=this.clonePointerEvent(t,r);this.dispatchEvent(a,`pointerover`),n&&this.dispatchEvent(a,`mouseover`);let o=i?.parent;for(;o&&o!==this.rootTarget.parent&&o!==t.target;)o=o.parent;if(!o||o===this.rootTarget.parent){let e=this.clonePointerEvent(t,`pointerenter`);for(e.eventPhase=e.AT_TARGET;e.target&&e.target!==i&&e.target!==this.rootTarget.parent;)e.currentTarget=e.target,this.notifyTarget(e),n&&this.notifyTarget(e,`mouseenter`),e.target=e.target.parent;this.freeEvent(e)}this.freeEvent(a)}let a=[],o=this.enableGlobalMoveEvents??!0;this.moveOnAll?a.push(`pointermove`):this.dispatchEvent(t,`pointermove`),o&&a.push(`globalpointermove`),t.pointerType===`touch`&&(this.moveOnAll?a.splice(1,0,`touchmove`):this.dispatchEvent(t,`touchmove`),o&&a.push(`globaltouchmove`)),n&&(this.moveOnAll?a.splice(1,0,`mousemove`):this.dispatchEvent(t,`mousemove`),o&&a.push(`globalmousemove`),this.cursor=t.target?.cursor),a.length>0&&this.all(t,a),this._allInteractiveElements.length=0,this._hitElements.length=0,r.overTargets=t.composedPath(),this.freeEvent(t)}mapPointerOver(e){if(!(e instanceof V)){u(`EventBoundary cannot map a non-pointer event as a pointer event`);return}let t=this.trackingData(e.pointerId),n=this.createPointerEvent(e),r=n.pointerType===`mouse`||n.pointerType===`pen`;this.dispatchEvent(n,`pointerover`),r&&this.dispatchEvent(n,`mouseover`),n.pointerType===`mouse`&&(this.cursor=n.target?.cursor);let i=this.clonePointerEvent(n,`pointerenter`);for(i.eventPhase=i.AT_TARGET;i.target&&i.target!==this.rootTarget.parent;)i.currentTarget=i.target,this.notifyTarget(i),r&&this.notifyTarget(i,`mouseenter`),i.target=i.target.parent;t.overTargets=n.composedPath(),this.freeEvent(n),this.freeEvent(i)}mapPointerOut(e){if(!(e instanceof V)){u(`EventBoundary cannot map a non-pointer event as a pointer event`);return}let t=this.trackingData(e.pointerId);if(t.overTargets){let n=e.pointerType===`mouse`||e.pointerType===`pen`,r=this.findMountedTarget(t.overTargets),i=this.createPointerEvent(e,`pointerout`,r);this.dispatchEvent(i),n&&this.dispatchEvent(i,`mouseout`);let a=this.createPointerEvent(e,`pointerleave`,r);for(a.eventPhase=a.AT_TARGET;a.target&&a.target!==this.rootTarget.parent;)a.currentTarget=a.target,this.notifyTarget(a),n&&this.notifyTarget(a,`mouseleave`),a.target=a.target.parent;t.overTargets=null,this.freeEvent(i),this.freeEvent(a)}this.cursor=null}mapPointerUp(e){if(!(e instanceof V)){u(`EventBoundary cannot map a non-pointer event as a pointer event`);return}let t=performance.now(),n=this.createPointerEvent(e);if(this.dispatchEvent(n,`pointerup`),n.pointerType===`touch`)this.dispatchEvent(n,`touchend`);else if(n.pointerType===`mouse`||n.pointerType===`pen`){let e=n.button===2;this.dispatchEvent(n,e?`rightup`:`mouseup`)}let r=this.trackingData(e.pointerId),i=this.findMountedTarget(r.pressTargetsByButton[e.button]),a=i;if(i&&!n.composedPath().includes(i)){let t=i;for(;t&&!n.composedPath().includes(t);){if(n.currentTarget=t,this.notifyTarget(n,`pointerupoutside`),n.pointerType===`touch`)this.notifyTarget(n,`touchendoutside`);else if(n.pointerType===`mouse`||n.pointerType===`pen`){let e=n.button===2;this.notifyTarget(n,e?`rightupoutside`:`mouseupoutside`)}t=t.parent}delete r.pressTargetsByButton[e.button],a=t}if(a){let i=this.clonePointerEvent(n,`click`);i.target=a,i.path=null,r.clicksByButton[e.button]||(r.clicksByButton[e.button]={clickCount:0,target:i.target,timeStamp:t});let o=r.clicksByButton[e.button];if(o.target===i.target&&t-o.timeStamp<200?++o.clickCount:o.clickCount=1,o.target=i.target,o.timeStamp=t,i.detail=o.clickCount,i.pointerType===`mouse`){let e=i.button===2;this.dispatchEvent(i,e?`rightclick`:`click`)}else i.pointerType===`touch`&&this.dispatchEvent(i,`tap`);this.dispatchEvent(i,`pointertap`),this.freeEvent(i)}this.freeEvent(n)}mapPointerUpOutside(e){if(!(e instanceof V)){u(`EventBoundary cannot map a non-pointer event as a pointer event`);return}let t=this.trackingData(e.pointerId),n=this.findMountedTarget(t.pressTargetsByButton[e.button]),r=this.createPointerEvent(e);if(n){let i=n;for(;i;)r.currentTarget=i,this.notifyTarget(r,`pointerupoutside`),r.pointerType===`touch`?this.notifyTarget(r,`touchendoutside`):(r.pointerType===`mouse`||r.pointerType===`pen`)&&this.notifyTarget(r,r.button===2?`rightupoutside`:`mouseupoutside`),i=i.parent;delete t.pressTargetsByButton[e.button]}this.freeEvent(r)}mapWheel(e){if(!(e instanceof U)){u(`EventBoundary cannot map a non-wheel event as a wheel event`);return}let t=this.createWheelEvent(e);this.dispatchEvent(t),this.freeEvent(t)}mapContextMenu(e){if(!(e instanceof V)){u(`EventBoundary cannot map a non-pointer event as a pointer event`);return}let t=this.createPointerEvent(e);this.dispatchEvent(t,`contextmenu`),this.freeEvent(t)}findMountedTarget(e){if(!e)return null;let t=e[0];for(let n=1;n<e.length&&e[n].parent===t;n++)t=e[n];return t}createPointerEvent(e,t,n){let r=this.allocateEvent(V);return this.copyPointerData(e,r),this.copyMouseData(e,r),this.copyData(e,r),r.nativeEvent=e.nativeEvent,r.originalEvent=e,r.target=n??this.hitTest(r.global.x,r.global.y)??this._hitElements[0],typeof t==`string`&&(r.type=t),r}createWheelEvent(e){let t=this.allocateEvent(U);return this.copyWheelData(e,t),this.copyMouseData(e,t),this.copyData(e,t),t.nativeEvent=e.nativeEvent,t.originalEvent=e,t.target=this.hitTest(t.global.x,t.global.y),t}clonePointerEvent(e,t){let n=this.allocateEvent(V);return n.nativeEvent=e.nativeEvent,n.originalEvent=e.originalEvent,this.copyPointerData(e,n),this.copyMouseData(e,n),this.copyData(e,n),n.target=e.target,n.path=e.composedPath().slice(),n.type=t??n.type,n}copyWheelData(e,t){t.deltaMode=e.deltaMode,t.deltaX=e.deltaX,t.deltaY=e.deltaY,t.deltaZ=e.deltaZ}copyPointerData(e,t){e instanceof V&&t instanceof V&&(t.pointerId=e.pointerId,t.width=e.width,t.height=e.height,t.isPrimary=e.isPrimary,t.pointerType=e.pointerType,t.pressure=e.pressure,t.tangentialPressure=e.tangentialPressure,t.tiltX=e.tiltX,t.tiltY=e.tiltY,t.twist=e.twist,t.persistentDeviceId=e.persistentDeviceId)}copyMouseData(e,t){e instanceof z&&t instanceof z&&(t.altKey=e.altKey,t.button=e.button,t.buttons=e.buttons,t.client.copyFrom(e.client),t.ctrlKey=e.ctrlKey,t.metaKey=e.metaKey,t.movement.copyFrom(e.movement),t.screen.copyFrom(e.screen),t.shiftKey=e.shiftKey,t.global.copyFrom(e.global))}copyData(e,t){t.isTrusted=e.isTrusted,t.srcElement=e.srcElement,t.timeStamp=performance.now(),t.type=e.type,t.detail=e.detail,t.view=e.view,t.which=e.which,t.layer.copyFrom(e.layer),t.page.copyFrom(e.page)}trackingData(e){return this.mappingState.trackingData[e]||(this.mappingState.trackingData[e]={pressTargetsByButton:{},clicksByButton:{},overTarget:null}),this.mappingState.trackingData[e]}allocateEvent(e){this.eventPool.has(e)||this.eventPool.set(e,[]);let t=this.eventPool.get(e).pop()||new e(this);return t.eventPhase=t.NONE,t.currentTarget=null,t.defaultPrevented=!1,t.path=null,t.target=null,t}freeEvent(e){if(e.manager!==this)throw Error(`It is illegal to free an event not managed by this EventBoundary!`);let t=e.constructor;this.eventPool.has(t)||this.eventPool.set(t,[]),this.eventPool.get(t).push(e)}_notifyListeners(e,t){let n=e.currentTarget._events[t];if(n){if(`fn`in n)n.once&&e.currentTarget.removeListener(t,n.fn,void 0,!0),n.fn.call(n.context,e);else for(let r=0,i=n.length;r<i&&!e.propagationImmediatelyStopped;r++)n[r].once&&e.currentTarget.removeListener(t,n[r].fn,void 0,!0),n[r].fn.call(n[r].context,e)}}}})))()}var Je,Ye,K,q;function J(){return(J=e((()=>{k(),qe(),R(),H(),W(),Je=1,Ye={touchstart:`pointerdown`,touchend:`pointerup`,touchendoutside:`pointerupoutside`,touchmove:`pointermove`,touchcancel:`pointercancel`},K=class e{constructor(t){this.supportsTouchEvents=`ontouchstart`in globalThis,this.supportsPointerEvents=!!globalThis.PointerEvent,this.domElement=null,this.resolution=1,this.renderer=t,this.rootBoundary=new Ke(null),L.init(this),this.autoPreventDefault=!0,this._eventsAdded=!1,this._rootPointerEvent=new V(null),this._rootWheelEvent=new U(null),this._rootContextMenuEvent=new V(null),this.cursorStyles={default:`inherit`,pointer:`pointer`},this.features=new Proxy({...e.defaultEventFeatures},{set:(e,t,n)=>(t===`globalMove`&&(this.rootBoundary.enableGlobalMoveEvents=n),e[t]=n,!0)}),this._onPointerDown=this._onPointerDown.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._onPointerUp=this._onPointerUp.bind(this),this._onPointerOverOut=this._onPointerOverOut.bind(this),this._onContextMenu=this._onContextMenu.bind(this),this.onWheel=this.onWheel.bind(this)}static get defaultEventMode(){return this._defaultEventMode}init(t){let{canvas:n,resolution:r}=this.renderer;this.setTargetElement(n),this.resolution=r,e._defaultEventMode=t.eventMode??`passive`,Object.assign(this.features,t.eventFeatures??{}),this.rootBoundary.enableGlobalMoveEvents=this.features.globalMove}resolutionChange(e){this.resolution=e}destroy(){L.destroy(),this.setTargetElement(null),this.renderer=null,this._currentCursor=null}setCursor(e){e||=`default`;let t=!0;if(globalThis.OffscreenCanvas&&this.domElement instanceof OffscreenCanvas&&(t=!1),this._currentCursor===e)return;this._currentCursor=e;let n=this.cursorStyles[e];if(n)switch(typeof n){case`string`:t&&(this.domElement.style.cursor=n);break;case`function`:n(e);break;case`object`:t&&Object.assign(this.domElement.style,n)}else t&&typeof e==`string`&&!Object.prototype.hasOwnProperty.call(this.cursorStyles,e)&&(this.domElement.style.cursor=e)}get pointer(){return this._rootPointerEvent}_onPointerDown(e){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let t=this._normalizeToPointerData(e);this.autoPreventDefault&&t[0].isNormalized&&(e.cancelable||!(`cancelable`in e))&&e.preventDefault();for(let e=0,n=t.length;e<n;e++){let n=t[e],r=this._bootstrapEvent(this._rootPointerEvent,n);this.rootBoundary.mapEvent(r)}this.setCursor(this.rootBoundary.cursor)}_onPointerMove(e){if(!this.features.move)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,L.pointerMoved();let t=this._normalizeToPointerData(e);for(let e=0,n=t.length;e<n;e++){let n=this._bootstrapEvent(this._rootPointerEvent,t[e]);this.rootBoundary.mapEvent(n)}this.setCursor(this.rootBoundary.cursor)}_onPointerUp(e){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let t=e.target;e.composedPath&&e.composedPath().length>0&&(t=e.composedPath()[0]);let n=t===this.domElement?``:`outside`,r=this._normalizeToPointerData(e);for(let e=0,t=r.length;e<t;e++){let t=this._bootstrapEvent(this._rootPointerEvent,r[e]);t.type+=n,this.rootBoundary.mapEvent(t)}this.setCursor(this.rootBoundary.cursor)}_onPointerOverOut(e){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let t=this._normalizeToPointerData(e);for(let e=0,n=t.length;e<n;e++){let n=this._bootstrapEvent(this._rootPointerEvent,t[e]);this.rootBoundary.mapEvent(n)}this.setCursor(this.rootBoundary.cursor)}_onContextMenu(e){if(!this.features.click)return;this.rootBoundary.rootTarget=this.renderer.lastObjectRendered;let t=this._normalizeToPointerData(e);for(let e=0,n=t.length;e<n;e++){let n=this._bootstrapEvent(this._rootContextMenuEvent,t[e]);this.rootBoundary.mapEvent(n)}this.setCursor(this.rootBoundary.cursor)}onWheel(e){if(!this.features.wheel)return;let t=this.normalizeWheelEvent(e);this.rootBoundary.rootTarget=this.renderer.lastObjectRendered,this.rootBoundary.mapEvent(t)}setTargetElement(e){this._removeEvents(),this.domElement=e,L.domElement=e,this._addEvents()}_addEvents(){if(this._eventsAdded||!this.domElement)return;L.addTickerListener();let e=this.domElement.style;e&&(globalThis.navigator.msPointerEnabled?(e.msContentZooming=`none`,e.msTouchAction=`none`):this.supportsPointerEvents&&(e.touchAction=`none`)),this.supportsPointerEvents?(globalThis.document.addEventListener(`pointermove`,this._onPointerMove,!0),this.domElement.addEventListener(`pointerdown`,this._onPointerDown,!0),this.domElement.addEventListener(`pointerleave`,this._onPointerOverOut,!0),this.domElement.addEventListener(`pointerover`,this._onPointerOverOut,!0),globalThis.addEventListener(`pointerup`,this._onPointerUp,!0)):(globalThis.document.addEventListener(`mousemove`,this._onPointerMove,!0),this.domElement.addEventListener(`mousedown`,this._onPointerDown,!0),this.domElement.addEventListener(`mouseout`,this._onPointerOverOut,!0),this.domElement.addEventListener(`mouseover`,this._onPointerOverOut,!0),globalThis.addEventListener(`mouseup`,this._onPointerUp,!0),this.supportsTouchEvents&&(this.domElement.addEventListener(`touchstart`,this._onPointerDown,!0),this.domElement.addEventListener(`touchend`,this._onPointerUp,!0),this.domElement.addEventListener(`touchmove`,this._onPointerMove,!0))),this.domElement.addEventListener(`wheel`,this.onWheel,{passive:!0,capture:!0}),this.domElement.addEventListener(`contextmenu`,this._onContextMenu,!0),this._eventsAdded=!0}_removeEvents(){if(!this._eventsAdded||!this.domElement)return;L.removeTickerListener();let e=this.domElement.style;e&&(globalThis.navigator.msPointerEnabled?(e.msContentZooming=``,e.msTouchAction=``):this.supportsPointerEvents&&(e.touchAction=``)),this.supportsPointerEvents?(globalThis.document.removeEventListener(`pointermove`,this._onPointerMove,!0),this.domElement.removeEventListener(`pointerdown`,this._onPointerDown,!0),this.domElement.removeEventListener(`pointerleave`,this._onPointerOverOut,!0),this.domElement.removeEventListener(`pointerover`,this._onPointerOverOut,!0),globalThis.removeEventListener(`pointerup`,this._onPointerUp,!0)):(globalThis.document.removeEventListener(`mousemove`,this._onPointerMove,!0),this.domElement.removeEventListener(`mousedown`,this._onPointerDown,!0),this.domElement.removeEventListener(`mouseout`,this._onPointerOverOut,!0),this.domElement.removeEventListener(`mouseover`,this._onPointerOverOut,!0),globalThis.removeEventListener(`mouseup`,this._onPointerUp,!0),this.supportsTouchEvents&&(this.domElement.removeEventListener(`touchstart`,this._onPointerDown,!0),this.domElement.removeEventListener(`touchend`,this._onPointerUp,!0),this.domElement.removeEventListener(`touchmove`,this._onPointerMove,!0))),this.domElement.removeEventListener(`wheel`,this.onWheel,!0),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu,!0),this.domElement=null,this._eventsAdded=!1}mapPositionToPoint(e,t,n){let r=this.domElement.isConnected?this.domElement.getBoundingClientRect():{x:0,y:0,width:this.domElement.width,height:this.domElement.height,left:0,top:0},i=1/this.resolution;e.x=(t-r.left)*(this.domElement.width/r.width)*i,e.y=(n-r.top)*(this.domElement.height/r.height)*i}_normalizeToPointerData(e){let t=[];if(this.supportsTouchEvents&&e instanceof TouchEvent)for(let n=0,r=e.changedTouches.length;n<r;n++){let r=e.changedTouches[n];r.button===void 0&&(r.button=0),r.buttons===void 0&&(r.buttons=1),r.isPrimary===void 0&&(r.isPrimary=e.touches.length===1&&e.type===`touchstart`),r.width===void 0&&(r.width=r.radiusX||1),r.height===void 0&&(r.height=r.radiusY||1),r.tiltX===void 0&&(r.tiltX=0),r.tiltY===void 0&&(r.tiltY=0),r.pointerType===void 0&&(r.pointerType=`touch`),r.pointerId===void 0&&(r.pointerId=r.identifier||0),r.pressure===void 0&&(r.pressure=r.force||.5),r.twist===void 0&&(r.twist=0),r.tangentialPressure===void 0&&(r.tangentialPressure=0),r.layerX===void 0&&(r.layerX=r.offsetX=r.clientX),r.layerY===void 0&&(r.layerY=r.offsetY=r.clientY),r.isNormalized=!0,r.type=e.type,r.altKey??=e.altKey,r.ctrlKey??=e.ctrlKey,r.metaKey??=e.metaKey,r.shiftKey??=e.shiftKey,t.push(r)}else if(!globalThis.MouseEvent||e instanceof MouseEvent&&(!this.supportsPointerEvents||!(e instanceof globalThis.PointerEvent))){let n=e;n.isPrimary===void 0&&(n.isPrimary=!0),n.width===void 0&&(n.width=1),n.height===void 0&&(n.height=1),n.tiltX===void 0&&(n.tiltX=0),n.tiltY===void 0&&(n.tiltY=0),n.pointerType===void 0&&(n.pointerType=`mouse`),n.pointerId===void 0&&(n.pointerId=Je),n.pressure===void 0&&(n.pressure=.5),n.twist===void 0&&(n.twist=0),n.tangentialPressure===void 0&&(n.tangentialPressure=0),n.isNormalized=!0,t.push(n)}else t.push(e);return t}normalizeWheelEvent(e){let t=this._rootWheelEvent;return this._transferMouseData(t,e),t.deltaX=e.deltaX,t.deltaY=e.deltaY,t.deltaZ=e.deltaZ,t.deltaMode=e.deltaMode,this.mapPositionToPoint(t.screen,e.clientX,e.clientY),t.global.copyFrom(t.screen),t.offset.copyFrom(t.screen),t.nativeEvent=e,t.type=e.type,t}_bootstrapEvent(e,t){return e.originalEvent=null,e.nativeEvent=t,e.pointerId=t.pointerId,e.width=t.width,e.height=t.height,e.isPrimary=t.isPrimary,e.pointerType=t.pointerType,e.pressure=t.pressure,e.tangentialPressure=t.tangentialPressure,e.tiltX=t.tiltX,e.tiltY=t.tiltY,e.twist=t.twist,this._transferMouseData(e,t),this.mapPositionToPoint(e.screen,t.clientX,t.clientY),e.global.copyFrom(e.screen),e.offset.copyFrom(e.screen),e.isTrusted=t.isTrusted,e.type===`pointerleave`&&(e.type=`pointerout`),e.type.startsWith(`mouse`)&&(e.type=e.type.replace(`mouse`,`pointer`)),e.type.startsWith(`touch`)&&(e.type=Ye[e.type]||e.type),e}_transferMouseData(e,t){e.isTrusted=t.isTrusted,e.srcElement=t.srcElement,e.timeStamp=performance.now(),e.type=t.type,e.altKey=t.altKey,e.button=t.button,e.buttons=t.buttons,e.client.x=t.clientX,e.client.y=t.clientY,e.ctrlKey=t.ctrlKey,e.metaKey=t.metaKey,e.movement.x=t.movementX,e.movement.y=t.movementY,e.page.x=t.pageX,e.page.y=t.pageY,e.relatedTarget=null,e.shiftKey=t.shiftKey}},K.extension={name:`events`,type:[T.WebGLSystem,T.CanvasSystem,T.WebGPUSystem],priority:-1},K.defaultEventFeatures={move:!0,globalMove:!0,click:!0,wheel:!0},q=K})))()}var Xe;function Ze(){return(Ze=e((()=>{J(),M(),Xe={onclick:null,oncontextmenu:null,onmousedown:null,onmouseenter:null,onmouseleave:null,onmousemove:null,onglobalmousemove:null,onmouseout:null,onmouseover:null,onmouseup:null,onmouseupoutside:null,onpointercancel:null,onpointerdown:null,onpointerenter:null,onpointerleave:null,onpointermove:null,onglobalpointermove:null,onpointerout:null,onpointerover:null,onpointertap:null,onpointerup:null,onpointerupoutside:null,onrightclick:null,onrightdown:null,onrightup:null,onrightupoutside:null,ontap:null,ontouchcancel:null,ontouchend:null,ontouchendoutside:null,ontouchmove:null,onglobaltouchmove:null,ontouchstart:null,onwheel:null,get interactive(){return this.eventMode===`dynamic`||this.eventMode===`static`},set interactive(e){this.eventMode=e?`static`:`passive`},_internalEventMode:void 0,get eventMode(){return this._internalEventMode??q.defaultEventMode},set eventMode(e){this._internalEventMode=e},isInteractive(){return this.eventMode===`static`||this.eventMode===`dynamic`},interactiveChildren:!0,hitArea:null,addEventListener(e,t,n){let r=typeof n==`boolean`&&n||typeof n==`object`&&n.capture,i=typeof n==`object`?n.signal:void 0,a=typeof n==`object`&&n.once===!0,o=typeof t==`function`?void 0:t;e=r?`${e}capture`:e;let s=typeof t==`function`?t:t.handleEvent,c=this;i&&i.addEventListener(`abort`,()=>{c.off(e,s,o)}),a?c.once(e,s,o):c.on(e,s,o)},removeEventListener(e,t,n){let r=typeof n==`boolean`&&n||typeof n==`object`&&n.capture,i=typeof t==`function`?void 0:t;e=r?`${e}capture`:e,t=typeof t==`function`?t:t.handleEvent,this.off(e,t,i)},dispatchEvent(e){if(!(e instanceof j))throw Error(`Container cannot propagate events outside of the Federated Events API`);return e.defaultPrevented=!1,e.path=null,e.target=this,e.manager.dispatchEvent(e),!e.defaultPrevented}}})))()}function Qe(e){return typeof e.getCanvasFilterString==`function`}var $e,Y;function et(){return(et=e((()=>{k(),ke(),ae(),ce(),le(),ve(),$e=class{constructor(){this.skip=!1,this.useClip=!1,this.filters=null,this.container=null,this.bounds=new se,this.cssFilterString=``}},Y=class{constructor(e){this._filterStack=[],this._filterStackIndex=0,this._savedStates=[],this._alphaMultiplier=1,this._warnedFilterTypes=new Set,this.renderer=e}push(e){let t=this._pushFilterFrame(),n=e.filterEffect.filters;if(t.skip=!1,t.useClip=!1,t.filters=n,t.container=e.container,t.cssFilterString=``,n.every(e=>!e.enabled)){t.skip=!0;return}let r=[];for(let e of n){if(!e.enabled)continue;if(!Qe(e)){this._warnUnsupportedFilter(e);continue}let t=e.getCanvasFilterString();t===null?this._warnUnsupportedFilter(e):t&&r.push(t)}if(r.length===0){t.skip=!0;return}t.cssFilterString=r.join(` `),this._calculateFilterArea(e,t.bounds),t.useClip=!!e.filterEffect.filterArea;let i=this.renderer.canvasContext.activeContext,a=i.filter||`none`;if(this._savedStates.push({filter:a,alphaMultiplier:this._alphaMultiplier}),t.useClip&&Number.isFinite(t.bounds.width)&&Number.isFinite(t.bounds.height)&&t.bounds.width>0&&t.bounds.height>0){let e=this.renderer.canvasContext.activeResolution||1;i.save(),i.setTransform(1,0,0,1,0,0),i.beginPath(),i.rect(t.bounds.x*e,t.bounds.y*e,t.bounds.width*e,t.bounds.height*e),i.clip()}else t.useClip=!1;t.cssFilterString&&(i.filter=a===`none`?t.cssFilterString:`${a} ${t.cssFilterString}`)}pop(){let e=this._popFilterFrame();if(e.skip)return;let t=this._savedStates.pop();if(!t)return;let n=this.renderer.canvasContext.activeContext;e.useClip?n.restore():n.filter=t.filter,this._alphaMultiplier=t.alphaMultiplier}generateFilteredTexture({texture:e,filters:t}){if(!t?.length||t.every(e=>!e.enabled))return e;let n=[];for(let e of t){if(!e.enabled)continue;if(!Qe(e)){this._warnUnsupportedFilter(e);continue}let t=e.getCanvasFilterString();t===null?this._warnUnsupportedFilter(e):t&&n.push(t)}if(n.length===0)return e;let r=Ae.getCanvasSource(e);if(!r)return e;let i=e.frame,a=e.source._resolution??e.source.resolution??1,o=i.width,s=i.height,{canvas:c,context:l}=p.getOptimalCanvasAndContext(o,s,a);l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,c.width,c.height),n.length&&(l.filter=n.join(` `));let u=i.x*a,d=i.y*a,f=o*a,m=s*a;return l.drawImage(r,u,d,f,m,0,0,f,m),l.filter=`none`,l.globalAlpha=1,_e(c,o,s,a)}_calculateFilterArea(e,t){if(e.renderables?ue(e.renderables,t):e.filterEffect.filterArea?(t.clear(),t.addRect(e.filterEffect.filterArea),t.applyMatrix(e.container.worldTransform)):e.container.getFastGlobalBounds(!0,t),e.container){let n=(e.container.renderGroup||e.container.parentRenderGroup)?.cacheToLocalTransform;n&&t.applyMatrix(n)}}_warnUnsupportedFilter(e){let t=e?.constructor?.name||`Filter`;this._warnedFilterTypes.has(t)||(this._warnedFilterTypes.add(t),console.warn(`CanvasRenderer: filter "${t}" is not supported in Canvas2D and will be skipped.`))}get alphaMultiplier(){return this._alphaMultiplier}_pushFilterFrame(){let e=this._filterStack[this._filterStackIndex];return e||=this._filterStack[this._filterStackIndex]=new $e,this._filterStackIndex++,e}_popFilterFrame(){return this._filterStackIndex<=0?this._filterStack[0]:(this._filterStackIndex--,this._filterStack[this._filterStackIndex])}destroy(){this._filterStack=null,this._savedStates=null,this._warnedFilterTypes=null,this._alphaMultiplier=1}},Y.extension={type:[T.CanvasSystem],name:`filter`}})))()}var X;function Z(){return(Z=e((()=>{X=`in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`})))()}var tt;function nt(){return(nt=e((()=>{tt=`
in vec2 vTextureCoord;
in vec4 vColor;

out vec4 finalColor;

uniform float uColorMatrix[20];
uniform float uAlpha;

uniform sampler2D uTexture;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    vec4 color = texture(uTexture, vTextureCoord);
    float randomValue = rand(gl_FragCoord.xy * 0.2);
    float diff = (randomValue - 0.5) *  0.5;

    if (uAlpha == 0.0) {
        finalColor = color;
        return;
    }

    if (color.a > 0.0) {
        color.rgb /= color.a;
    }

    vec4 result;

    result.r = (uColorMatrix[0] * color.r);
        result.r += (uColorMatrix[1] * color.g);
        result.r += (uColorMatrix[2] * color.b);
        result.r += (uColorMatrix[3] * color.a);
        result.r += uColorMatrix[4];

    result.g = (uColorMatrix[5] * color.r);
        result.g += (uColorMatrix[6] * color.g);
        result.g += (uColorMatrix[7] * color.b);
        result.g += (uColorMatrix[8] * color.a);
        result.g += uColorMatrix[9];

    result.b = (uColorMatrix[10] * color.r);
       result.b += (uColorMatrix[11] * color.g);
       result.b += (uColorMatrix[12] * color.b);
       result.b += (uColorMatrix[13] * color.a);
       result.b += uColorMatrix[14];

    result.a = (uColorMatrix[15] * color.r);
       result.a += (uColorMatrix[16] * color.g);
       result.a += (uColorMatrix[17] * color.b);
       result.a += (uColorMatrix[18] * color.a);
       result.a += uColorMatrix[19];

    vec3 rgb = mix(color.rgb, result.rgb, uAlpha);

    // Premultiply alpha again.
    rgb *= result.a;

    finalColor = vec4(rgb, result.a);
}
`})))()}var Q;function rt(){return(rt=e((()=>{Q=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct ColorMatrixUniforms {
  uColorMatrix:array<vec4<f32>, 5>,
  uAlpha:f32,
};


@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;
@group(1) @binding(0) var<uniform> colorMatrixUniforms : ColorMatrixUniforms;


struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
  };
  
fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
  );
}


@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {


  var c = textureSample(uTexture, uSampler, uv);
  
  if (colorMatrixUniforms.uAlpha == 0.0) {
    return c;
  }

 
    // Un-premultiply alpha before applying the color matrix. See issue #3539.
    if (c.a > 0.0) {
      c.r /= c.a;
      c.g /= c.a;
      c.b /= c.a;
    }

    var cm = colorMatrixUniforms.uColorMatrix;


    var result = vec4<f32>(0.);

    result.r = (cm[0][0] * c.r);
    result.r += (cm[0][1] * c.g);
    result.r += (cm[0][2] * c.b);
    result.r += (cm[0][3] * c.a);
    result.r += cm[1][0];

    result.g = (cm[1][1] * c.r);
    result.g += (cm[1][2] * c.g);
    result.g += (cm[1][3] * c.b);
    result.g += (cm[2][0] * c.a);
    result.g += cm[2][1];

    result.b = (cm[2][2] * c.r);
    result.b += (cm[2][3] * c.g);
    result.b += (cm[3][0] * c.b);
    result.b += (cm[3][1] * c.a);
    result.b += cm[3][2];

    result.a = (cm[3][3] * c.r);
    result.a += (cm[4][0] * c.g);
    result.a += (cm[4][1] * c.b);
    result.a += (cm[4][2] * c.a);
    result.a += cm[4][3];

    var rgb = mix(c.rgb, result.rgb, colorMatrixUniforms.uAlpha);

    rgb.r *= result.a;
    rgb.g *= result.a;
    rgb.b *= result.a;

    return vec4(rgb, result.a);
}`})))()}var it;function at(){return(at=e((()=>{ge(),S(),w(),_(),F(),Z(),nt(),rt(),it=class extends P{constructor(e={}){let t=new v({uColorMatrix:{value:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],type:`f32`,size:20},uAlpha:{value:1,type:`f32`}}),n=C.from({vertex:{source:Q,entryPoint:`mainVertex`},fragment:{source:Q,entryPoint:`mainFragment`}}),r=x.from({vertex:X,fragment:tt,name:`color-matrix-filter`});super({...e,gpuProgram:n,glProgram:r,resources:{colorMatrixUniforms:t}}),this.alpha=1}_loadMatrix(e,t=!1){if(t){let t=[...e];this._multiply(t,this.matrix,e),this.resources.colorMatrixUniforms.uniforms.uColorMatrix=t}else this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e;this.resources.colorMatrixUniforms.update()}_multiply(e,t,n){return e[0]=t[0]*n[0]+t[1]*n[5]+t[2]*n[10]+t[3]*n[15],e[1]=t[0]*n[1]+t[1]*n[6]+t[2]*n[11]+t[3]*n[16],e[2]=t[0]*n[2]+t[1]*n[7]+t[2]*n[12]+t[3]*n[17],e[3]=t[0]*n[3]+t[1]*n[8]+t[2]*n[13]+t[3]*n[18],e[4]=t[0]*n[4]+t[1]*n[9]+t[2]*n[14]+t[3]*n[19]+t[4],e[5]=t[5]*n[0]+t[6]*n[5]+t[7]*n[10]+t[8]*n[15],e[6]=t[5]*n[1]+t[6]*n[6]+t[7]*n[11]+t[8]*n[16],e[7]=t[5]*n[2]+t[6]*n[7]+t[7]*n[12]+t[8]*n[17],e[8]=t[5]*n[3]+t[6]*n[8]+t[7]*n[13]+t[8]*n[18],e[9]=t[5]*n[4]+t[6]*n[9]+t[7]*n[14]+t[8]*n[19]+t[9],e[10]=t[10]*n[0]+t[11]*n[5]+t[12]*n[10]+t[13]*n[15],e[11]=t[10]*n[1]+t[11]*n[6]+t[12]*n[11]+t[13]*n[16],e[12]=t[10]*n[2]+t[11]*n[7]+t[12]*n[12]+t[13]*n[17],e[13]=t[10]*n[3]+t[11]*n[8]+t[12]*n[13]+t[13]*n[18],e[14]=t[10]*n[4]+t[11]*n[9]+t[12]*n[14]+t[13]*n[19]+t[14],e[15]=t[15]*n[0]+t[16]*n[5]+t[17]*n[10]+t[18]*n[15],e[16]=t[15]*n[1]+t[16]*n[6]+t[17]*n[11]+t[18]*n[16],e[17]=t[15]*n[2]+t[16]*n[7]+t[17]*n[12]+t[18]*n[17],e[18]=t[15]*n[3]+t[16]*n[8]+t[17]*n[13]+t[18]*n[18],e[19]=t[15]*n[4]+t[16]*n[9]+t[17]*n[14]+t[18]*n[19]+t[19],e}brightness(e,t){let n=[e,0,0,0,0,0,e,0,0,0,0,0,e,0,0,0,0,0,1,0];this._loadMatrix(n,t)}tint(e,t){let[n,r,i]=pe.shared.setValue(e).toArray(),a=[n,0,0,0,0,0,r,0,0,0,0,0,i,0,0,0,0,0,1,0];this._loadMatrix(a,t)}greyscale(e,t){let n=[e,e,e,0,0,e,e,e,0,0,e,e,e,0,0,0,0,0,1,0];this._loadMatrix(n,t)}grayscale(e,t){this.greyscale(e,t)}blackAndWhite(e){this._loadMatrix([.3,.6,.1,0,0,.3,.6,.1,0,0,.3,.6,.1,0,0,0,0,0,1,0],e)}hue(e,t){e=(e||0)/180*Math.PI;let n=Math.cos(e),r=Math.sin(e),i=Math.sqrt,a=1/3,o=i(a),s=[n+(1-n)*a,a*(1-n)-o*r,a*(1-n)+o*r,0,0,a*(1-n)+o*r,n+a*(1-n),a*(1-n)-o*r,0,0,a*(1-n)-o*r,a*(1-n)+o*r,n+a*(1-n),0,0,0,0,0,1,0];this._loadMatrix(s,t)}contrast(e,t){let n=(e||0)+1,r=-.5*(n-1),i=[n,0,0,0,r,0,n,0,0,r,0,0,n,0,r,0,0,0,1,0];this._loadMatrix(i,t)}saturate(e=0,t){let n=e*2/3+1,r=(n-1)*-.5,i=[n,r,r,0,0,r,n,r,0,0,r,r,n,0,0,0,0,0,1,0];this._loadMatrix(i,t)}desaturate(){this.saturate(-1)}negative(e){this._loadMatrix([-1,0,0,1,0,0,-1,0,1,0,0,0,-1,1,0,0,0,0,1,0],e)}sepia(e){this._loadMatrix([.393,.7689999,.18899999,0,0,.349,.6859999,.16799999,0,0,.272,.5339999,.13099999,0,0,0,0,0,1,0],e)}technicolor(e){this._loadMatrix([1.9125277891456083,-.8545344976951645,-.09155508482755585,0,.046249425232852304,-.3087833385928097,1.7658908555458428,-.10601743074722245,0,-.2758903984886823,-.231103377548616,-.7501899197440212,1.847597816108189,0,.12137623870388682,0,0,0,1,0],e)}polaroid(e){this._loadMatrix([1.438,-.062,-.062,0,0,-.122,1.378,-.122,0,0,-.016,-.016,1.483,0,0,0,0,0,1,0],e)}toBGR(e){this._loadMatrix([0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0],e)}kodachrome(e){this._loadMatrix([1.1285582396593525,-.3967382283601348,-.03992559172921793,0,.24991995145868634,-.16404339962244616,1.0835251566291304,-.05498805115633132,0,.09698983488904393,-.16786010706155763,-.5603416277695248,1.6014850761964943,0,.13972481597886063,0,0,0,1,0],e)}browni(e){this._loadMatrix([.5997023498159715,.34553243048391263,-.2708298674538042,0,.1860075629647401,-.037703249837783157,.8609577587992641,.15059552388459913,0,-.14497417640467167,.24113635128153335,-.07441037908422492,.44972182064877153,0,-.029655197167024642,0,0,0,1,0],e)}vintage(e){this._loadMatrix([.6279345635605994,.3202183420819367,-.03965408211312453,0,.037848179746251466,.02578397704808868,.6441188644374771,.03259127616149294,0,.029265996770472907,.0466055556782719,-.0851232987247891,.5241648018700465,0,.020232119953863904,0,0,0,1,0],e)}colorTone(e,t,n,r,i){e||=.2,t||=.15,n||=16770432,r||=3375104;let a=pe.shared,[o,s,c]=a.setValue(n).toArray(),[l,u,d]=a.setValue(r).toArray(),f=[.3,.59,.11,0,0,o,s,c,e,0,l,u,d,t,0,o-l,s-u,c-d,0,0];this._loadMatrix(f,i)}night(e,t){e||=.1;let n=[e*-2,-e,0,0,0,-e,0,e,0,0,0,e,e*2,0,0,0,0,0,1,0];this._loadMatrix(n,t)}predator(e,t){let n=[11.224130630493164*e,-4.794486999511719*e,-2.8746118545532227*e,0*e,.40342438220977783*e,-3.6330697536468506*e,9.193157196044922*e,-2.951810836791992*e,0*e,-1.316135048866272*e,-3.2184197902679443*e,-4.2375030517578125*e,7.476448059082031*e,0*e,.8044459223747253*e,0,0,0,1,0];this._loadMatrix(n,t)}lsd(e){this._loadMatrix([2,-.4,.5,0,0,-.5,2,-.4,0,0,-.4,-.5,3,0,0,0,0,0,1,0],e)}reset(){this._loadMatrix([1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],!1)}get matrix(){return this.resources.colorMatrixUniforms.uniforms.uColorMatrix}set matrix(e){this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e}get alpha(){return this.resources.colorMatrixUniforms.uniforms.uAlpha}set alpha(e){this.resources.colorMatrixUniforms.uniforms.uAlpha=e}}})))()}var ot;function st(){return(st=e((()=>{ot=`in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
void main() {
    finalColor = texture(uTexture, vTextureCoord);
}
`})))()}var ct;function lt(){return(lt=e((()=>{ct=`struct GlobalFilterUniforms {
  uInputSize: vec4<f32>,
  uInputPixel: vec4<f32>,
  uInputClamp: vec4<f32>,
  uOutputFrame: vec4<f32>,
  uGlobalFrame: vec4<f32>,
  uOutputTexture: vec4<f32>,
};

@group(0) @binding(0) var <uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

struct VSOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>
};

fn filterVertexPosition(aPosition: vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord(aPosition: vec2<f32>) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition: vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {
    return textureSample(uTexture, uSampler, uv);
}
`})))()}var ut;function dt(){return(dt=e((()=>{S(),w(),F(),Z(),st(),lt(),ut=class extends P{constructor(){let e=C.from({vertex:{source:ct,entryPoint:`mainVertex`},fragment:{source:ct,entryPoint:`mainFragment`},name:`passthrough-filter`}),t=x.from({vertex:X,fragment:ot,name:`passthrough-filter`});super({gpuProgram:e,glProgram:t})}}})))()}var ft;function pt(){return(pt=e((()=>{k(),ft=class{constructor(e){this._renderer=e}push(e,t,n){this._renderer.renderPipes.batch.break(n),n.add({renderPipeId:`filter`,canBundle:!1,action:`pushFilter`,container:t,filterEffect:e})}pop(e,t,n){this._renderer.renderPipes.batch.break(n),n.add({renderPipeId:`filter`,action:`popFilter`,canBundle:!1})}execute(e){e.action===`pushFilter`?this._renderer.filter.push(e):e.action===`popFilter`&&this._renderer.filter.pop()}destroy(){this._renderer=null}},ft.extension={type:[T.WebGLPipes,T.WebGPUPipes,T.CanvasPipes],name:`filter`}})))()}var mt,ht,gt;function _t(){return(_t=e((()=>{k(),dt(),s(),Te(),te(),_(),ee(),ne(),De(),ce(),le(),d(),mt=new f({attributes:{aPosition:{buffer:new Float32Array([0,0,1,0,1,1,0,1]),format:`float32x2`,stride:8,offset:0}},indexBuffer:new Uint32Array([0,1,2,0,2,3])}),ht=class{constructor(){this.skip=!1,this.inputTexture=null,this.backTexture=null,this.filters=null,this.bounds=new se,this.container=null,this.blendRequired=!1,this.outputRenderSurface=null,this.firstEnabledIndex=-1,this.lastEnabledIndex=-1}},gt=class{constructor(e){this._filterStackIndex=0,this._filterStack=[],this._filterGlobalUniforms=new v({uInputSize:{value:new Float32Array(4),type:`vec4<f32>`},uInputPixel:{value:new Float32Array(4),type:`vec4<f32>`},uInputClamp:{value:new Float32Array(4),type:`vec4<f32>`},uOutputFrame:{value:new Float32Array(4),type:`vec4<f32>`},uGlobalFrame:{value:new Float32Array(4),type:`vec4<f32>`},uOutputTexture:{value:new Float32Array(4),type:`vec4<f32>`}}),this._globalFilterBindGroup=new Ee({}),this.renderer=e}get activeBackTexture(){return this._activeFilterData?.backTexture}push(e){let t=this.renderer,n=e.filterEffect.filters,r=this._pushFilterData();r.skip=!1,r.filters=n,r.container=e.container,r.outputRenderSurface=t.renderTarget.renderSurface;let i=t.renderTarget.renderTarget.colorTexture.source,a=i.resolution,o=i.antialias;if(n.every(e=>!e.enabled)){r.skip=!0;return}let s=r.bounds;if(this._calculateFilterArea(e,s),this._calculateFilterBounds(r,t.renderTarget.rootViewPort,o,a,1),r.skip)return;let c=this._getPreviousFilterData();this._setupFilterTextures(r,s,t,c)}generateFilteredTexture({texture:e,filters:t}){if(t.every(e=>!e.enabled))return e;let n=this._pushFilterData();this._activeFilterData=n,n.skip=!1,n.filters=t;let r=e.source,i=r.resolution,a=r.antialias,o=n.bounds;if(o.clear(),o.addRect(e.frame),this._calculateFilterBounds(n,o.rectangle,a,i,0),n.skip)return this._popFilterData(),e;n.outputRenderSurface=y.getOptimalTexture({width:o.width,height:o.height,resolution:n.resolution,antialias:n.antialias}),n.backTexture=b.EMPTY,n.inputTexture=e,this.renderer.renderTarget.finishRenderPass(),this._applyFiltersToTexture(n,!0);let s=n.outputRenderSurface;return s.source.alphaMode=`premultiplied-alpha`,this._popFilterData(),s}pop(){let e=this.renderer,t=this._popFilterData();t.skip||(e.globalUniforms.pop(),e.renderTarget.finishRenderPass(),this._activeFilterData=t,this._applyFiltersToTexture(t,!1),t.blendRequired&&y.returnTexture(t.backTexture),y.returnTexture(t.inputTexture))}getBackTexture(e,t,n){let r=e.colorTexture.source._resolution,i=y.getOptimalTexture({width:t.width,height:t.height,resolution:r}),a=t.minX,o=t.minY;n&&(a-=n.minX,o-=n.minY),a=Math.floor(a*r),o=Math.floor(o*r);let s=Math.ceil(t.width*r),c=Math.ceil(t.height*r);return this.renderer.renderTarget.copyToTexture(e,i,{x:a,y:o},{width:s,height:c},{x:0,y:0}),i}applyFilter(e,t,n,r){let i=this.renderer,a=this._activeFilterData,o=a.outputRenderSurface===n,s=this._findClosestFilterData(),c=s?s.inputTexture.source._resolution:i.renderTarget.rootRenderTarget.colorTexture.source._resolution,l=0,u=0;o&&s&&(l=s.bounds.minX,u=s.bounds.minY),this._updateFilterUniforms(t,n,a,l,u,c,o,r);let d=e.enabled?e:this._getPassthroughFilter();this._setupBindGroupsAndRender(d,t,i)}calculateSpriteMatrix(e,t){let n=this._activeFilterData,r=e.set(n.inputTexture._source.width,0,0,n.inputTexture._source.height,n.bounds.minX,n.bounds.minY),i=t.worldTransform.copyTo(o.shared),a=t.renderGroup||t.parentRenderGroup;return a&&a.cacheToLocalTransform&&i.prepend(a.cacheToLocalTransform),i.invert(),r.prepend(i),r.scale(1/t.texture.orig.width,1/t.texture.orig.height),r.translate(t.anchor.x,t.anchor.y),r}destroy(){this._passthroughFilter?.destroy(!0),this._passthroughFilter=null}_getPassthroughFilter(){return this._passthroughFilter??=new ut,this._passthroughFilter}_setupBindGroupsAndRender(e,t,n){if(n.renderPipes.uniformBatch){let e=n.renderPipes.uniformBatch.getUboResource(this._filterGlobalUniforms);this._globalFilterBindGroup.setResource(e,0)}else this._globalFilterBindGroup.setResource(this._filterGlobalUniforms,0);this._globalFilterBindGroup.setResource(t.source,1),this._globalFilterBindGroup.setResource(t.source.style,2),e.groups[0]=this._globalFilterBindGroup,n.encoder.draw({geometry:mt,shader:e,state:e._state,topology:`triangle-list`}),n.type===Oe.WEBGL&&n.renderTarget.finishRenderPass()}_setupFilterTextures(e,t,n,r){if(e.backTexture=b.EMPTY,e.inputTexture=y.getOptimalTexture({width:t.width,height:t.height,resolution:e.resolution,antialias:e.antialias}),e.blendRequired){n.renderTarget.finishRenderPass();let i=n.renderTarget.getRenderTarget(e.outputRenderSurface);e.backTexture=this.getBackTexture(i,t,r?.bounds)}n.renderTarget.bind({target:e.inputTexture,clear:!0}),n.globalUniforms.push({offset:t})}_updateFilterUniforms(e,t,n,r,i,a,o,s){let c=this._filterGlobalUniforms.uniforms,l=c.uOutputFrame,u=c.uInputSize,d=c.uInputPixel,f=c.uInputClamp,p=c.uGlobalFrame,m=c.uOutputTexture;o?(l[0]=n.bounds.minX-r,l[1]=n.bounds.minY-i):(l[0]=0,l[1]=0),l[2]=e.frame.width,l[3]=e.frame.height,u[0]=e.source.width,u[1]=e.source.height,u[2]=1/u[0],u[3]=1/u[1],d[0]=e.source.pixelWidth,d[1]=e.source.pixelHeight,d[2]=1/d[0],d[3]=1/d[1],f[0]=.5*d[2],f[1]=.5*d[3],f[2]=e.frame.width*u[2]-.5*d[2],f[3]=e.frame.height*u[3]-.5*d[3];let h=this.renderer.renderTarget.rootRenderTarget.colorTexture;p[0]=r*a,p[1]=i*a,p[2]=h.source.width*a,p[3]=h.source.height*a,t instanceof b&&(t.source.resource=null);let g=this.renderer.renderTarget.getRenderTarget(t);this.renderer.renderTarget.bind({target:t,clear:!!s}),t instanceof b?(m[0]=t.frame.width,m[1]=t.frame.height):(m[0]=g.width,m[1]=g.height),m[2]=g.isRoot?-1:1,this._filterGlobalUniforms.update()}_findClosestFilterData(){for(let e=this._filterStackIndex-1;e>=0;e--){let t=this._filterStack[e];if(!t.skip)return t}return null}_calculateFilterArea(e,t){if(e.renderables?ue(e.renderables,t):e.filterEffect.filterArea?(t.clear(),t.addRect(e.filterEffect.filterArea),t.applyMatrix(e.container.worldTransform)):e.container.getFastGlobalBounds(!0,t),e.container){let n=(e.container.renderGroup||e.container.parentRenderGroup).cacheToLocalTransform;n&&t.applyMatrix(n)}}_applyFiltersToTexture(e,t){let n=e.inputTexture,r=e.bounds,i=e.filters,a=e.firstEnabledIndex,o=e.lastEnabledIndex;if(this._globalFilterBindGroup.setResource(n.source.style,2),this._globalFilterBindGroup.setResource(e.backTexture.source,3),a===o)i[a].apply(this,n,e.outputRenderSurface,t);else{let n=e.inputTexture,s=y.getOptimalTexture({width:r.width,height:r.height,resolution:n.source._resolution}),c=s;for(let e=a;e<o;e++){let t=i[e];if(!t.enabled)continue;t.apply(this,n,c,!0);let r=n;n=c,c=r}i[o].apply(this,n,e.outputRenderSurface,t),y.returnTexture(s)}}_calculateFilterBounds(e,t,n,r,i){let a=this.renderer,o=e.bounds,s=e.filters,c=1/0,l=0,d=!0,f=!1,p=!1,m=!0,h=-1,g=-1;for(let e=0;e<s.length;e++){let t=s[e];if(t.enabled){if(h===-1&&(h=e),g=e,c=Math.min(c,t.resolution===`inherit`?r:t.resolution),l+=t.padding,t.antialias===`off`?d=!1:t.antialias===`inherit`&&(d&&=n),t.clipToViewport||(m=!1),!(t.compatibleRenderers&a.type)){p=!1;break}if(t.blendRequired&&!(a.backBuffer?.useBackBuffer??!0)){u("Blend filter requires backBuffer on WebGL renderer to be enabled. Set `useBackBuffer: true` in the renderer options."),p=!1;break}p=!0,f||=t.blendRequired}}p?(m&&o.fitBounds(0,t.width/r,0,t.height/r),o.scale(c).ceil().scale(1/c).pad((l|0)*i),o.isPositive?(e.antialias=d,e.resolution=c,e.blendRequired=f,e.firstEnabledIndex=h,e.lastEnabledIndex=g):e.skip=!0):e.skip=!0}_popFilterData(){return this._filterStackIndex--,this._filterStack[this._filterStackIndex]}_getPreviousFilterData(){for(let e=this._filterStackIndex-2;e>=0;e--){let t=this._filterStack[e];if(!t.skip)return t}return null}_pushFilterData(){let e=this._filterStack[this._filterStackIndex];return e||=this._filterStack[this._filterStackIndex]=new ht,this._filterStackIndex++,e}},gt.extension={type:[T.WebGLSystem,T.WebGPUSystem],name:`filter`}})))()}var vt;function yt(){return(yt=e((()=>{vt=`in vec2 vMaskCoord;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

uniform float uAlpha;
uniform vec4 uMaskClamp;
uniform float uInverse;
uniform float uChannel;

out vec4 finalColor;

void main(void)
{
    float clip = step(3.5,
        step(uMaskClamp.x, vMaskCoord.x) +
        step(uMaskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, uMaskClamp.z) +
        step(vMaskCoord.y, uMaskClamp.w));

    // TODO look into why this is needed
    float npmAlpha = uAlpha;
    vec4 original = texture(uTexture, vTextureCoord);
    vec4 masky = texture(uMaskTexture, vMaskCoord);

    float a;
    if (uChannel == 1.0) {
        a = masky.a * npmAlpha * clip;
    } else {
        float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);
        a = alphaMul * masky.r * npmAlpha * clip;
    }

    if (uInverse == 1.0) {
        a = 1.0 - a;
    }

    finalColor = original * a;
}
`})))()}var bt;function xt(){return(xt=e((()=>{bt=`in vec2 aPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform mat3 uFilterMatrix;

vec4 filterVertexPosition(  vec2 aPosition )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
       
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(  vec2 aPosition )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( vec2 aPosition )
{
    return  ( uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}   

void main(void)
{
    gl_Position = filterVertexPosition(aPosition);
    vTextureCoord = filterTextureCoord(aPosition);
    vMaskCoord = getFilterCoord(aPosition);
}
`})))()}var St;function Ct(){return(Ct=e((()=>{St=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct MaskUniforms {
  uFilterMatrix:mat3x3<f32>,
  uMaskClamp:vec4<f32>,
  uAlpha:f32,
  uInverse:f32,
  uChannel:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : MaskUniforms;
@group(1) @binding(1) var uMaskTexture: texture_2d<f32>;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var maskClamp = filterUniforms.uMaskClamp;
    var uAlpha = filterUniforms.uAlpha;

    var clip = step(3.5,
      step(maskClamp.x, filterUv.x) +
      step(maskClamp.y, filterUv.y) +
      step(filterUv.x, maskClamp.z) +
      step(filterUv.y, maskClamp.w));

    var mask = textureSample(uMaskTexture, uSampler, filterUv);
    var source = textureSample(uTexture, uSampler, uv);

    var a: f32;
    if (filterUniforms.uChannel == 1.0) {
        a = mask.a * uAlpha * clip;
    } else {
        var alphaMul = 1.0 - uAlpha * (1.0 - mask.a);
        a = alphaMul * mask.r * uAlpha * clip;
    }

    if (filterUniforms.uInverse == 1.0) {
        a = 1.0 - a;
    }

    return source * a;
}
`})))()}var wt;function Tt(){return(Tt=e((()=>{s(),S(),w(),_(),ee(),oe(),d(),F(),yt(),xt(),Ct(),wt=class extends P{constructor(e){let{sprite:t,...n}=e,r=new ie(t.texture),i=new v({uFilterMatrix:{value:new o,type:`mat3x3<f32>`},uMaskClamp:{value:r.uClampFrame,type:`vec4<f32>`},uAlpha:{value:1,type:`f32`},uInverse:{value:+!!e.inverse,type:`f32`},uChannel:{value:+(e.channel===`alpha`),type:`f32`}}),a=C.from({vertex:{source:St,entryPoint:`mainVertex`},fragment:{source:St,entryPoint:`mainFragment`}}),s=x.from({vertex:bt,fragment:vt,name:`mask-filter`});super({...n,gpuProgram:a,glProgram:s,clipToViewport:!1,resources:{filterUniforms:i,uMaskTexture:t.texture.source}}),this.sprite=t,this._textureMatrix=r}setSprite(e){this.sprite=e;let t=this._getSafeTexture();this._textureMatrix.texture=t,this.resources.uMaskTexture=t.source}set inverse(e){this.resources.filterUniforms.uniforms.uInverse=+!!e}get inverse(){return this.resources.filterUniforms.uniforms.uInverse===1}set channel(e){this.resources.filterUniforms.uniforms.uChannel=+(e===`alpha`)}get channel(){return this.resources.filterUniforms.uniforms.uChannel===1?`alpha`:`red`}apply(e,t,n,r){let i=this._getSafeTexture();this._textureMatrix.texture=i,e.calculateSpriteMatrix(this.resources.filterUniforms.uniforms.uFilterMatrix,this.sprite).prepend(this._textureMatrix.mapCoord),this.resources.uMaskTexture=i.source,e.applyFilter(this,t,n,r)}_getSafeTexture(){let e=this.sprite.texture;return e.destroyed||!e.source||e.source.destroyed?(u(`[MaskFilter] The mask texture was destroyed while the mask is still in use. Remove the mask before destroying its texture.`),b.EMPTY):e}destroy(e=!1){this._textureMatrix.destroy(),super.destroy(e)}}})))()}function Et(){return(Et=e((()=>{k(),fe(),J(),Ze(),O.add(q),O.mixin(de,Xe)})))()}function $(){return($=e((()=>{k(),et(),pt(),_t(),O.add(gt,Y),O.add(ft)})))()}var Dt=t({});function Ot(){return(Ot=e((()=>{me(),he(),Et(),we(),Ce(),$()})))()}var kt=t({});function At(){return(At=e((()=>{we(),Ce(),$()})))()}export{T as _,He as a,M as c,Fe as d,Ie as f,Me as g,je as h,at as i,ze as l,Ne as m,Tt as n,Ve as o,Pe as p,it as r,j as s,wt as t,Be as u,O as v,k as y};