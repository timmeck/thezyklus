import { DRAWN_DATA } from './drawn-data.js';
import { SHOT_DATA } from './shot-data.js';
import { AIR_AIM_DATA } from './air-aim-data.js';
import { AIM_RECTS, AIM_ART } from './aim-data.js';

export const DRAWN_HEIGHT = 110;
export const DRAWN_POSES = Object.freeze(['idle', 'run', 'jump', 'doublejump', 'fall', 'land', 'ledge', 'climb', 'hit', 'tumble', 'getup', 'special', 'victory', 'defeat']);
const textures = new Map();
const drawingStates = new WeakMap();
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const durations = {jump:.48, doublejump:.4, land:.16, climb:.2, hit:.2, tumble:.52, getup:.16, special:.7};
const aimPoses = new Set(['idle','run','jump','doublejump','fall','land']);
const fallbackFrames = {idle:0,jump:2,doublejump:3,fall:3,land:3,ledge:2,climb:2,hit:5,tumble:6,getup:5,special:4,victory:7,defeat:5};
const personalities = {
  iona:{tempo:1.08,breath:1.1}, rook:{tempo:1.15,breath:1.3},
  sera:{tempo:.88,breath:.35}, tavi:{tempo:.96,breath:.7},
  beam:{tempo:.98,breath:.85}, pip:{tempo:1.04,breath:1.05},
};

function textureFor(url, priority = 'auto') {
  let entry = textures.get(url);
  if (entry?.retryAt && Date.now() >= entry.retryAt) {
    textures.delete(url);
    entry = null;
  }
  if (entry) {
    if (priority === 'high') entry.image.fetchPriority = priority;
    return entry;
  }
  entry = {image:new Image(),ready:false};
  entry.image.fetchPriority = priority;
  entry.promise = new Promise(resolve => {
    entry.image.onload = () => {entry.ready = true; resolve(true);};
    entry.image.onerror = () => {
      entry.retryAt = Date.now() + 5000;
      resolve(false);
    };
  });
  entry.image.src = url;
  textures.set(url, entry);
  return entry;
}

export function preloadFighterCore(ids = Object.keys(DRAWN_DATA)) {
  const characters = ids.filter(id => DRAWN_DATA[id]);
  const urls = [
    ...characters.map(id => `assets/${id}-atlas.webp`),
    ...characters.flatMap(id => [`assets/${id}-aim.webp`,...(SHOT_DATA[id]?.atlases || [])]),
  ];
  return Promise.all(urls.map(url => textureFor(url,'high').promise));
}

export function preloadDrawn(ids = Object.keys(DRAWN_DATA), {priority='auto', all=false} = {}) {
  const characters = ids.filter(id => DRAWN_DATA[id]);
  return preloadFighterCore(characters).then(async core => {
    const frames = characters.flatMap(id => {
      const urls = all ? DRAWN_DATA[id].atlases : DRAWN_DATA[id].atlases.slice(0, 1);
      return [...urls,...(AIR_AIM_DATA[id]?.atlases || [])]
        .map(url => textureFor(url,priority).promise);
    });
    return [...core,...await Promise.all(frames)];
  });
}

export function drawnReady(id) {
  return Boolean(DRAWN_DATA[id]) && [...DRAWN_DATA[id].atlases,...(SHOT_DATA[id]?.atlases || []),...(AIR_AIM_DATA[id]?.atlases || []),`assets/${id}-aim.webp`].every(url => textures.get(url)?.ready);
}

export function cacheDrawn() {
  // Requests started under the outgoing worker must enter the new worker's cache.
  return Promise.allSettled([...textures.keys()].map(url => fetch(url,{cache:'reload'})));
}

export function resetDrawn(context, key) {
  if (key === undefined) drawingStates.delete(context);
  else drawingStates.get(context)?.delete(key);
}

export function selectedPose(fighter, forced) {
  if (DRAWN_POSES.includes(forced)) return forced;
  if (fighter.ledge) return 'ledge';
  if (fighter.action === 'hit') return 'hit';
  if (['tumble','getup','land','victory','defeat'].includes(fighter.action)) return fighter.action;
  if (fighter.ledgeCooldown > .15 && fighter.grounded && fighter.action !== 'shoot') return 'climb';
  if (fighter.signatureTime > 0 || fighter.charge > 0 || fighter.specialDuration > 0) return 'special';
  if (!fighter.grounded) return fighter.vy > 130 ? 'fall' : fighter.jumps > 1 ? 'doublejump' : 'jump';
  return fighter.action === 'run' || Math.abs(fighter.vx || 0) > 35 ? 'run' : 'idle';
}

function aiming(fighter, pose, options) {
  if (!fighter.grounded && !options.firing && fighter.action !== 'shoot') return false;
  return options.aim !== false && (aimPoses.has(pose) || pose === 'special' && options.firing) &&
    Boolean(options.firing || fighter.action === 'shoot' || fighter.input?.shoot || fighter.input?.aimX || fighter.input?.aimY);
}

function rectangleBounds(left, top, width, height, angle, offset) {
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  const points = [[left,top],[left+width,top],[left+width,top+height],[left,top+height]].map(([x,y]) =>
    ({x:offset.x + cosine * x - sine * y,y:offset.y + sine * x + cosine * y}));
  return {left:Math.min(...points.map(point=>point.x)),right:Math.max(...points.map(point=>point.x)),
    top:Math.min(...points.map(point=>point.y)),bottom:Math.max(...points.map(point=>point.y))};
}

function unionBounds(...boxes) {
  return {left:Math.min(...boxes.map(box=>box.left)),right:Math.max(...boxes.map(box=>box.right)),
    top:Math.min(...boxes.map(box=>box.top)),bottom:Math.max(...boxes.map(box=>box.bottom))};
}

function airBounds(sample, target, stretch = 1) {
  const [x,y,width,height] = sample.bounds, scale = sample.scale * stretch;
  return rectangleBounds((x-sample.sourceMuzzle[0])*scale,(y-sample.sourceMuzzle[1])*scale,
    width*scale,height*scale,target.aimAngle-sample.sourceAngle,target.muzzle);
}

function airFits(fighter, bounds, options) {
  if (Number.isFinite(options.airRoom) && bounds.bottom + 3 > options.airRoom) return false;
  const facing = fighter.facing < 0 ? -1 : 1;
  const left = fighter.x + Math.min(bounds.left*facing,bounds.right*facing);
  const right = fighter.x + Math.max(bounds.left*facing,bounds.right*facing);
  return !options.platforms?.some(platform => platform.active && platform.x < right && platform.x + platform.w > left &&
    platform.y >= fighter.y - 2 && platform.y < fighter.y + bounds.bottom + 3);
}

export function sampleAirAim(fighter, options = {}) {
  const data = AIR_AIM_DATA[fighter.id];
  if (!data) return null;
  const facing = fighter.facing < 0 ? -1 : 1;
  const aimX = (fighter.aimX ?? facing) * facing, aimY = fighter.aimY || 0;
  const aimAngle = Math.atan2(aimY,aimX);
  const delta = angle => Math.atan2(Math.sin(aimAngle - angle),Math.cos(aimAngle - angle));
  let index = 0;
  for (let candidate = 1; candidate < data.frames.length; candidate++) {
    if (Math.abs(delta(data.frames[candidate].angleRadians)) < Math.abs(delta(data.frames[index].angleRadians))) index = candidate;
  }
  const entry = data.frames[index], scale = DRAWN_HEIGHT / data.standingHeight;
  const rotation = delta(entry.angleRadians);
  const muzzle = {x:aimX * 29,y:-53 + aimY * 29};
  const sample = {id:fighter.id,pose:selectedPose(fighter,options.pose),variant:'air-aim',index,frame:entry.rect,bounds:entry.bounds,
    texture:data.atlases[entry.atlas],scale,sourceMuzzle:entry.muzzle,sourceAngle:entry.angleRadians,aimAngle,rotation,muzzle,
    nextFrame:entry.rect,blend:0};
  const worldBounds = airBounds(sample,sample);
  return {...sample,worldBounds,renderHeight:worldBounds.bottom-worldBounds.top};
}

export function sampleDrawn(fighter, elapsed = 0, options = {}) {
  const id = DRAWN_DATA[fighter.id] ? fighter.id : 'iona';
  const pose = selectedPose(fighter, options.pose);
  const aimed = aiming(fighter,pose,options) && SHOT_DATA[id];
  if (aimed && !fighter.grounded && AIR_AIM_DATA[id]) {
    const air = sampleAirAim(fighter,options);
    if (airFits(fighter,air.worldBounds,options)) return air;
  }
  const variant = aimed ? 'aim' : 'body';
  const data = variant === 'aim' ? SHOT_DATA[id] : DRAWN_DATA[id];
  const aimPose = fighter.grounded && pose === 'run' ? 'run' : 'idle';
  const state = data.states[variant === 'aim' ? aimPose : pose];
  const personality = personalities[id];
  const duration = variant === 'aim' ? null : durations[pose];
  const phase = options.reduced ? 0 : duration
    ? clamp(elapsed / duration, 0, .999999) * state.frames.length
    : elapsed * (state.fps || 8) * personality.tempo;
  const index = state.loop === false ? Math.min(state.frames.length - 1,Math.floor(phase)) : Math.floor(phase) % state.frames.length;
  const frame = state.frames[index];
  const bounds = state.bounds?.[index] || [0,0,frame[2],data.standingHeight];
  const shoulder = state.shoulders?.[index];
  const nextIndex = state.loop === false ? Math.min(index+1,state.frames.length-1) : (index+1)%state.frames.length;
  return {id,pose,variant,index,frame,bounds,texture:data.atlases[state.atlas],scale:DRAWN_HEIGHT / data.standingHeight,
    shoulder:shoulder ? {x:(shoulder[0] - frame[4]) * DRAWN_HEIGHT / data.standingHeight,y:(shoulder[1] - frame[5]) * DRAWN_HEIGHT / data.standingHeight} : undefined,
    nextFrame:state.frames[nextIndex],nextBounds:state.bounds?.[nextIndex],
    blend:options.reduced || state.loop === false && index === state.frames.length - 1 ? 0 : clamp((phase % 1 - .65) / .35,0,1)};
}

// Only the aiming arm is articulated. Its grip follows the drawing of the tool,
// whose muzzle is registered to the engine's unchanged 29-unit shot origin.
export function sampleAim(fighter, {shoulder={x:5.7,y:-81}} = {}) {
  const facing = fighter.facing < 0 ? -1 : 1;
  const aimX = (fighter.aimX ?? facing) * facing, aimY = fighter.aimY || 0;
  const angle = Math.atan2(aimY,aimX);
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  const muzzle = {x:aimX * 29,y:-53 + aimY * 29};
  const art = AIM_ART[fighter.id] || AIM_ART.iona;
  const rect = (AIM_RECTS[fighter.id] || AIM_RECTS.iona)[3];
  const toolWidth = art.toolWidth, toolHeight = toolWidth * rect[3] / rect[2];
  const attachment = art.wrist;
  const localGrip = {x:(attachment[0] - art.muzzle[0]) * toolWidth,y:(attachment[1] - art.muzzle[1]) * toolHeight};
  const grip = {x:muzzle.x + cosine * localGrip.x - sine * localGrip.y,
    y:muzzle.y + sine * localGrip.x + cosine * localGrip.y};
  const dx = grip.x - shoulder.x, dy = grip.y - shoulder.y;
  const distance = Math.hypot(dx,dy);
  const reach = Math.max(1,(distance + .25) / 48);
  const lengthDifference = Math.min(2 * reach,distance * .9);
  const upperLength = (48 * reach - lengthDifference) / 2;
  const lowerLength = (48 * reach + lengthDifference) / 2;
  const elbowAngle = -Math.acos(clamp((distance * distance - upperLength * upperLength - lowerLength * lowerLength) /
    (2 * upperLength * lowerLength),-1,1));
  const upperAngle = Math.atan2(-dx,dy) - Math.atan2(lowerLength * Math.sin(elbowAngle),upperLength + lowerLength * Math.cos(elbowAngle));
  const elbow = {x:shoulder.x - Math.sin(upperAngle) * upperLength,y:shoulder.y + Math.cos(upperAngle) * upperLength};
  return {angle,facing,shoulder,grip,elbow,upperAngle,lowerAngle:upperAngle + elbowAngle,upperLength,lowerLength,reach,art,toolWidth,toolHeight,
    muzzle};
}

function drawAim(context, fighter, aim, layer) {
  const texture = textureFor(`assets/${fighter.id}-aim.webp`);
  if (!texture.ready) return;
  const rects = AIM_RECTS[fighter.id];
  const limb = (rect, point, angle, width, height) => {
    context.save();
    context.translate(point.x,point.y);
    context.rotate(angle);
    context.drawImage(texture.image,...rect,-width / 2,-1,width,height + 2);
    context.restore();
  };
  if (layer === 'upper') {
    limb(rects[0],aim.shoulder,aim.upperAngle,7.5,aim.upperLength);
    return;
  }
  limb(rects[1],aim.elbow,aim.lowerAngle,5.5,aim.lowerLength);
  context.save();
  context.translate(aim.muzzle.x,aim.muzzle.y);
  context.rotate(aim.angle);
  context.drawImage(texture.image,...rects[3],-aim.toolWidth * aim.art.muzzle[0],-aim.toolHeight * aim.art.muzzle[1],aim.toolWidth,aim.toolHeight);
  context.restore();
}

function paintFrame(context, image, frame, scale) {
  const [x,y,width,height,anchorX,anchorY] = frame;
  context.drawImage(image,x,y,width,height,-anchorX * scale,-anchorY * scale,width * scale,height * scale);
}

function paintBlend(context, from, to, amount) {
  // Keep overlapping ink opaque throughout the brief dissolve.
  context.save();
  context.globalAlpha *= Math.min(1,(1 - amount) * 2);
  paintFrame(context,from.image,from.frame,from.scale);
  context.restore();
  context.save();
  context.globalAlpha *= Math.min(1,amount * 2);
  paintFrame(context,to.image,to.frame,to.scale);
  context.restore();
}

function paintAirFrame(context, image, sample, target, stretch) {
  const rotation = target.aimAngle - sample.sourceAngle;
  context.save();
  context.translate(target.muzzle.x,target.muzzle.y);
  context.rotate(rotation);
  context.scale(stretch,stretch);
  const [x,y,width,height] = sample.frame;
  context.drawImage(image,x,y,width,height,-sample.sourceMuzzle[0] * sample.scale,-sample.sourceMuzzle[1] * sample.scale,width * sample.scale,height * sample.scale);
  context.restore();
}

function frameBounds(sample, scaleX, scaleY, offset) {
  const [x,y,width,height] = sample.bounds, frame = sample.frame;
  const left = (x-frame[4])*sample.scale*scaleX;
  const top = (y-frame[5])*sample.scale*scaleY+offset;
  return {left,top,right:left+width*sample.scale*scaleX,bottom:top+height*sample.scale*scaleY};
}

function aimBounds(arm) {
  return unionBounds(
    rectangleBounds(-3.75,-1,7.5,arm.upperLength+2,arm.upperAngle,arm.shoulder),
    rectangleBounds(-2.75,-1,5.5,arm.lowerLength+2,arm.lowerAngle,arm.elbow),
    rectangleBounds(-arm.toolWidth*arm.art.muzzle[0],-arm.toolHeight*arm.art.muzzle[1],arm.toolWidth,arm.toolHeight,arm.angle,arm.muzzle),
  );
}

export function drawnPoseBounds(id, pose) {
  const data = DRAWN_DATA[id] || DRAWN_DATA.iona;
  const state = data.states[pose] || data.states.idle;
  const scale = DRAWN_HEIGHT / data.standingHeight;
  return unionBounds(...state.frames.map((frame,index) =>
    frameBounds({frame,bounds:state.bounds[index],scale},1,1,0)));
}

export function drawDrawn(context, fighter, options = {}) {
  const time = options.time || 0, pose = selectedPose(fighter, options.pose);
  let states = drawingStates.get(context);
  if (!states) {states = new Map(); drawingStates.set(context,states);}
  const key = options.key ?? `${fighter.index || 0}-${fighter.id}`;
  let motion = states.get(key);
  if (!motion || time < motion.time) motion = {pose,variant:null,start:time,time};
  if (motion.pose !== pose) motion.start = time;
  let sample = sampleDrawn(fighter,time - motion.start,{...options,pose});
  let variant = sample.variant;
  let texture = options.load === false ? textures.get(sample.texture) : textureFor(sample.texture);
  let armTexture = variant === 'aim' && (options.load === false ? textures.get(`assets/${fighter.id}-aim.webp`) : textureFor(`assets/${fighter.id}-aim.webp`));
  if (variant === 'air-aim' && !texture?.ready) {
    const upright = sampleDrawn({...fighter,grounded:true},time-motion.start,{...options,pose:'idle',firing:true});
    const uprightTexture = options.load === false ? textures.get(upright.texture) : textureFor(upright.texture);
    const targetArm = options.load === false ? textures.get(`assets/${fighter.id}-aim.webp`) : textureFor(`assets/${fighter.id}-aim.webp`);
    if (uprightTexture?.ready && targetArm?.ready) {
      sample = upright;
      variant = 'aim';
      texture = uprightTexture;
      armTexture = targetArm;
    }
  }
  if (motion.pose !== pose || motion.variant !== variant) {
    // The engine moves from the handhold onto the deck in one tick. Reusing the
    // old image at that new foot position would leave a second grip in the air.
    const handholdChange = pose === 'ledge' || motion.pose === 'ledge' && pose === 'climb';
    motion.from = motion.variant === variant && !handholdChange ? motion.sample : null;
    if (motion.pose !== pose) motion.start = time;
    motion.pose = pose;
    motion.variant = variant;
    motion.airFrom = null;
  }
  if (variant === 'air-aim' && motion.sample?.variant === variant && motion.sample.index !== sample.index) {
    motion.airFrom = motion.sample;
    motion.airBlendStart = time;
  }
  const ready = texture?.ready && (variant !== 'aim' || armTexture?.ready);
  const fallback = options.load === false ? textures.get(`assets/${fighter.id}-atlas.webp`) : textureFor(`assets/${fighter.id}-atlas.webp`);
  if (!ready && !fallback?.ready) return false;
  let facing = fighter.facing < 0 ? -1 : 1;
  if (pose === 'ledge' && fighter.ledge) facing = -fighter.ledge.side;
  if (pose === 'climb') {
    const platform = options.platforms?.find(platform => platform.id === fighter.platformId);
    if (platform) facing = fighter.x < platform.x + platform.w / 2 ? 1 : -1;
  }
  context.save();
  context.scale(facing,1);
  const breath = options.reduced || pose === 'ledge' ? 0 : Math.sin(time * 2.5) * personalities[sample.id].breath;
  let shape = options.shape || 0;
  if (variant === 'aim') shape = Math.min(shape,0);
  if (pose === 'ledge') shape = 0;
  const airScale = 1 + shape * .25;
  const bodyX = (1 - breath * .0015) * (1 - shape * .65);
  const bodyY = (1 + breath * .002) * (1 + shape);
  const bodyOffset = pose === 'idle' ? -breath * .2 : 0;
  const shoulder = sample.shoulder || {x:5.7,y:-81};
  const arm = variant === 'aim' && ready ? sampleAim(fighter,{shoulder:{x:shoulder.x * bodyX,y:shoulder.y * bodyY + bodyOffset}}) : null;
  let renderBounds;
  if (arm) drawAim(context,fighter,arm,'upper');
  context.save();
  if (variant === 'air-aim' && ready) {
    renderBounds = airBounds(sample,sample,airScale);
    const transition = options.reduced ? 1 : clamp((time - motion.airBlendStart) / .045,0,1);
    let previousTexture = motion.airFrom && textures.get(motion.airFrom.texture);
    let blendedBounds;
    if (previousTexture?.ready) {
      const angle = sample.aimAngle-motion.airFrom.sourceAngle;
      const turn = Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)));
      blendedBounds = unionBounds(renderBounds,airBounds(motion.airFrom,sample,airScale));
      if (turn>Math.PI/8 || !airFits(fighter,blendedBounds,options)) {
        motion.airFrom = null;
        previousTexture = null;
      }
    }
    if (previousTexture?.ready && transition < 1) {
      renderBounds = blendedBounds;
      context.save();context.globalAlpha *= Math.min(1,(1 - transition) * 2);
      paintAirFrame(context,previousTexture.image,motion.airFrom,sample,airScale);
      context.restore();
      context.save();context.globalAlpha *= Math.min(1,transition * 2);
      paintAirFrame(context,texture.image,sample,sample,airScale);
      context.restore();
    } else {
      paintAirFrame(context,texture.image,sample,sample,airScale);
      motion.airFrom = null;
    }
  } else {
    context.translate(0,bodyOffset);
    context.scale(bodyX,bodyY);
    if (ready) {
      renderBounds = frameBounds(sample,bodyX,bodyY,bodyOffset);
      const oldTexture = motion.from && textures.get(motion.from.texture);
      const transition = options.reduced ? 1 : clamp((time - motion.start) / .07,0,1);
      if (oldTexture?.ready && transition < 1) {
        renderBounds = unionBounds(renderBounds,frameBounds(motion.from,bodyX,bodyY,bodyOffset));
        paintBlend(context,{image:oldTexture.image,frame:motion.from.frame,scale:motion.from.scale},
          {image:texture.image,frame:sample.frame,scale:sample.scale},transition);
      } else {
        if (sample.blend > 0 && (sample.variant === 'aim' || !durations[pose])) {
          renderBounds = unionBounds(renderBounds,frameBounds({...sample,frame:sample.nextFrame,bounds:sample.nextBounds || sample.bounds},bodyX,bodyY,bodyOffset));
          paintBlend(context,{image:texture.image,frame:sample.frame,scale:sample.scale},
            {image:texture.image,frame:sample.nextFrame,scale:sample.scale},sample.blend);
        } else paintFrame(context,texture.image,sample.frame,sample.scale);
      }
    } else {
      renderBounds = {left:-64*bodyX,right:64*bodyX,top:-123.5*bodyY+bodyOffset,bottom:4.5*bodyY+bodyOffset};
      let index = fallbackFrames[pose] || 0;
      if (pose === 'run') index = 1 + Math.floor((time - motion.start) * 12) % 2;
      if (fighter.action === 'shoot') index = 4;
      context.drawImage(fallback.image,index % 4 * 256,Math.floor(index / 4) * 256,256,256,-64,-123.5,128,128);
    }
  }
  context.restore();
  if (arm) {
    drawAim(context,fighter,arm,'front');
    renderBounds = unionBounds(renderBounds,aimBounds(arm));
  }
  context.restore();
  motion.time = time;
  motion.sample = sample;
  states.set(key,motion);
  return {...sample,facing,source:ready ? 'drawn' : 'fallback',armReach:arm?.reach,renderBounds,
    renderHeight:renderBounds.bottom-renderBounds.top};
}
