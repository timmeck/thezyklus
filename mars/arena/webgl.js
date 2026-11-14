// Self-hosted immediate 2D geometry, sprites and post-processing on WebGL.
// Canvas is used only for cached lettering and the illustrated backdrop.
const TAU = Math.PI * 2;
const identity = () => [1, 0, 0, 1, 0, 0];
const colors = new Map();

function color(value) {
  if (colors.has(value)) return colors.get(value);
  let result = [1, 1, 1, 1];
  if (typeof value === 'string' && value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length < 5) hex = [...hex].map(x => x + x).join('');
    result = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    result.push(hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1);
  } else if (typeof value === 'string' && value.startsWith('rgb')) {
    result = value.match(/[\d.]+/g).map(Number);
    result = [result[0] / 255, result[1] / 255, result[2] / 255, result[3] ?? 1];
  }
  if (colors.size > 256) colors.clear();
  colors.set(value, result);
  return result;
}

function program(gl, vertex, fragment) {
  function shader(type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
    return item;
  }
  const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
  const item = gl.createProgram();
  gl.attachShader(item, vs);
  gl.attachShader(item, fs);
  gl.linkProgram(item);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(item, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(item));
  return item;
}

// Ear clipping preserves the concave manga impact stars and recovery silhouettes.
function triangulate(points) {
  if(points.length>2 && Math.hypot(points[0][0]-points.at(-1)[0],points[0][1]-points.at(-1)[1])<.001)points=points.slice(0,-1);
  if (points.length < 3) return [];
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const area = points.reduce((sum, p, i) => {
    const next = points[(i + 1) % points.length];
    return sum + p[0] * next[1] - next[0] * p[1];
  }, 0);
  const order = points.map((_, i) => i);
  if (area < 0) order.reverse();
  if(order.every((item,i)=>cross(points[item],points[order[(i+1)%order.length]],points[order[(i+2)%order.length]])>=0)) {
    return order.slice(1,-1).flatMap((item,i)=>[order[0],item,order[i+2]]);
  }
  const triangles = [];
  let budget = points.length * points.length;
  while (order.length > 2 && budget-- > 0) {
    let found = false;
    for (let i = 0; i < order.length; i++) {
      const a = order[(i + order.length - 1) % order.length], b = order[i], c = order[(i + 1) % order.length];
      if (cross(points[a], points[b], points[c]) <= 0.00001) continue;
      const inside = order.some(j => j !== a && j !== b && j !== c &&
        cross(points[a], points[b], points[j]) >= 0 && cross(points[b], points[c], points[j]) >= 0 && cross(points[c], points[a], points[j]) >= 0);
      if (inside) continue;
      triangles.push(a, b, c);
      order.splice(i, 1);
      found = true;
      break;
    }
    if (!found) break;
  }
  return triangles;
}

export class WebGLSurface {
  constructor(canvas) {
    this.canvas = canvas;
    const attributes = {alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power'};
    this.gl = canvas.getContext('webgl2', attributes);
    this.backend = this.gl ? 'webgl2' : 'webgl1';
    this.gl ||= canvas.getContext('webgl', attributes);
    if (!this.gl) throw new Error('WebGL unavailable');
    const gl = this.gl;
    this.lost = false;
    canvas.addEventListener('webglcontextlost', event => {event.preventDefault(); this.lost = true;});
    canvas.addEventListener('webglcontextrestored', () => {this.initialize(); this.lost = false;});
    this.initialize();
  }

  initialize() {
    const gl = this.gl;
    this.spriteProgram = program(gl, `
      attribute vec2 a_position; attribute vec2 a_uv; attribute vec4 a_color;
      uniform vec2 u_size; varying vec2 v_uv; varying vec4 v_color;
      void main(){gl_Position=vec4(a_position/u_size*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);v_uv=a_uv;v_color=a_color;}`, `
      precision mediump float; varying vec2 v_uv; varying vec4 v_color; uniform sampler2D u_texture;
      void main(){vec4 tex=texture2D(u_texture,v_uv);gl_FragColor=vec4(tex.rgb*v_color.rgb,tex.a*v_color.a);}`);
    this.postProgram = program(gl, `
      attribute vec2 a_position; varying vec2 v_uv;
      void main(){v_uv=(a_position+1.)*.5;gl_Position=vec4(a_position,0.,1.);}`, `
      precision mediump float; varying vec2 v_uv; uniform sampler2D u_scene; uniform sampler2D u_bloom;
      uniform vec2 u_texel; uniform vec2 u_direction; uniform float u_pass; uniform float u_strength;
      uniform vec3 u_tint; uniform vec4 u_wave; uniform float u_time; uniform vec2 u_size;
      uniform vec4 u_lights[8]; uniform vec3 u_lightColors[8]; uniform int u_lightCount;
      void main(){
        vec2 uv=v_uv;
        if(u_pass<.5){vec3 rgb=texture2D(u_scene,uv).rgb;float light=max(rgb.r,max(rgb.g,rgb.b));gl_FragColor=vec4(rgb*smoothstep(.68,1.,light),1.);return;}
        if(u_pass<1.5){
          vec2 d=u_direction*u_texel;
          vec3 rgb=texture2D(u_scene,uv).rgb*.227027;
          rgb+=(texture2D(u_scene,uv+d*1.384615).rgb+texture2D(u_scene,uv-d*1.384615).rgb)*.316216;
          rgb+=(texture2D(u_scene,uv+d*3.230769).rgb+texture2D(u_scene,uv-d*3.230769).rgb)*.070270;
          gl_FragColor=vec4(rgb,1.);return;
        }
        if(u_wave.w>.001){
          vec2 delta=(uv-u_wave.xy)*vec2(u_size.x/u_size.y,1.);
          float distance=length(delta);
          float ring=exp(-pow((distance-u_wave.z)*30.,2.));
          uv+=normalize(delta+vec2(.00001))*ring*u_wave.w*.006;
        }
        vec3 rgb=texture2D(u_scene,uv).rgb;
        for(int i=0;i<8;i++){
          if(i>=u_lightCount)break;
          vec2 gap=(uv-u_lights[i].xy)*u_size;
          if(abs(gap.x)<u_lights[i].z&&abs(gap.y)<u_lights[i].z){
            float falloff=max(0.,1.-length(gap)/max(1.,u_lights[i].z));
            rgb+=u_lightColors[i]*falloff*falloff*u_lights[i].w*(.18+rgb*.55);
          }
        }
        if(u_strength>0.)rgb+=texture2D(u_bloom,uv).rgb*u_strength;
        rgb*=u_tint;
        vec2 edge=v_uv*(1.-v_uv);
        rgb*=mix(.86,1.,smoothstep(0.,.15,edge.x+edge.y));
        gl_FragColor=vec4(rgb,1.);
      }`);
    this.spriteLocations = {
      position:gl.getAttribLocation(this.spriteProgram,'a_position'),
      uv:gl.getAttribLocation(this.spriteProgram,'a_uv'),
      color:gl.getAttribLocation(this.spriteProgram,'a_color'),
      size:gl.getUniformLocation(this.spriteProgram,'u_size'),
      texture:gl.getUniformLocation(this.spriteProgram,'u_texture'),
    };
    this.postLocations = Object.fromEntries(['u_scene','u_bloom','u_tint','u_wave','u_size','u_lights[0]','u_lightColors[0]','u_lightCount','u_pass','u_texel','u_direction','u_strength'].map(name=>[name,gl.getUniformLocation(this.postProgram,name)]));
    this.postPosition = gl.getAttribLocation(this.postProgram,'a_position');
    this.buffer = gl.createBuffer();
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    this.vertices = new Float32Array(8 * 24576);
    this.count = 0;
    this.textures = new Map();
    this.textCache = new Map();
    this.white = this.makeTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.white);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
    this.targets = [];
    this.targetWidth = 0;
    this.drawCalls = 0;
    this.frame = 0;
    this.matrix = identity();
    this.stack = [];
    this.globalAlpha = 1;
    this.fillStyle = '#ffffff';
    this.strokeStyle = '#ffffff';
    this.lineWidth = 1;
    this.font = '16px sans-serif';
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';
    this.lineCap = 'butt';
    this.dash = [];
    this.clipBox = null;
  }

  makeTexture() {
    const gl = this.gl, texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  allocateTargets() {
    const gl = this.gl, w = this.canvas.width, h = this.canvas.height;
    if (w === this.targetWidth && h === this.targetHeight) return;
    for (const target of this.targets) {gl.deleteTexture(target.texture); gl.deleteFramebuffer(target.framebuffer);}
    this.targets = [1, .25, .25].map(scale => {
      const width = Math.max(1, Math.round(w * scale)), height = Math.max(1, Math.round(h * scale));
      const texture = this.makeTexture(), framebuffer = gl.createFramebuffer();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete render target');
      return {texture, framebuffer, width, height};
    });
    this.targetWidth = w;
    this.targetHeight = h;
  }

  beginFrame() {
    if (this.lost) return;
    this.allocateTargets();
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets[0].framebuffer);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.SCISSOR_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(.035, .09, .14, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawCalls = 0;
    this.count = 0;
    this.batchTexture = null;
    this.clipBox = null;
    this.stack.length = 0;
    this.matrix = identity();
    this.globalAlpha = 1;
  }

  flush() {
    if (!this.count || this.lost) return;
    const gl = this.gl, p = this.spriteProgram;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices.subarray(0, this.count * 8), gl.DYNAMIC_DRAW);
    for (const [location, size, offset] of [[this.spriteLocations.position,2,0],[this.spriteLocations.uv,2,8],[this.spriteLocations.color,4,16]]) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 32, offset);
    }
    gl.uniform2f(this.spriteLocations.size, this.canvas.width, this.canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.batchTexture || this.white);
    gl.uniform1i(this.spriteLocations.texture, 0);
    if (this.clipBox) {
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(...this.clipBox);
    } else gl.disable(gl.SCISSOR_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, this.count);
    this.drawCalls++;
    this.count = 0;
  }

  vertex(x, y, u, v, tint) {
    if (this.count >= 24570) this.flush();
    const m = this.matrix, i = this.count++ * 8, data = this.vertices;
    data[i] = m[0] * x + m[2] * y + m[4];
    data[i+1] = m[1] * x + m[3] * y + m[5];
    data[i+2] = u;
    data[i+3] = v;
    data[i+4] = tint[0]; data[i+5] = tint[1]; data[i+6] = tint[2]; data[i+7] = tint[3] * this.globalAlpha;
  }

  useTexture(texture) {
    if (this.batchTexture !== texture) {this.flush(); this.batchTexture = texture;}
  }

  texture(source) {
    let entry = this.textures.get(source);
    if (entry) {entry.frame = this.frame; return entry.texture;}
    this.flush();
    const gl = this.gl, texture = this.makeTexture();
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const width=source.naturalWidth||source.width,height=source.naturalHeight||source.height;
    if(source instanceof HTMLImageElement&&(this.backend==='webgl2'||((width&(width-1))===0&&(height&(height-1))===0))){
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    }
    this.textures.set(source, {texture, frame: this.frame});
    // Bounded GPU resources, including superseded backdrop and lettering canvases.
    if (this.textures.size > 192) {
      const oldest = [...this.textures.entries()].sort((a,b) => a[1].frame - b[1].frame)[0];
      gl.deleteTexture(oldest[1].texture);
      this.textures.delete(oldest[0]);
    }
    return texture;
  }

  drawImage(source, ...args) {
    const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
    if (!sw || !sh || this.lost) return;
    let sx = 0, sy = 0, width = sw, height = sh, dx, dy, dw, dh;
    if (args.length === 2) [dx, dy] = args, dw = sw, dh = sh;
    else if (args.length === 4) [dx, dy, dw, dh] = args;
    else [sx, sy, width, height, dx, dy, dw, dh] = args;
    this.useTexture(this.texture(source));
    const points = [[dx,dy,sx/sw,sy/sh],[dx+dw,dy,(sx+width)/sw,sy/sh],[dx+dw,dy+dh,(sx+width)/sw,(sy+height)/sh],[dx,dy+dh,sx/sw,(sy+height)/sh]];
    const tint = [1,1,1,1];
    for (const i of [0,1,2,0,2,3]) this.vertex(...points[i], tint);
  }

  tint(style, x, y) {
    if (typeof style !== 'object') return color(style);
    const [x1,y1,x2,y2] = style.axis, dx = x2-x1, dy = y2-y1;
    const t = Math.max(0, Math.min(1, ((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy || 1)));
    const stops = style.stops;
    let low = stops[0], high = stops[stops.length-1];
    for (let i=1;i<stops.length;i++) if (t <= stops[i][0]) {low=stops[i-1]; high=stops[i]; break;}
    const amount = Math.max(0,Math.min(1,(t-low[0])/(high[0]-low[0] || 1)));
    return low[1].map((v,i) => v+(high[1][i]-v)*amount);
  }

  fillRect(x, y, w, h) {
    this.useTexture(this.white);
    const style=this.fillStyle;
    const rows=typeof style==='object'&&style.axis[0]===style.axis[2]
      ? [y,...style.stops.map(stop=>style.axis[1]+(style.axis[3]-style.axis[1])*stop[0]).filter(row=>row>y&&row<y+h),y+h]
      : [y,y+h];
    for(let i=1;i<rows.length;i++) {
      const top=rows[i-1],bottom=rows[i];
      for(const [px,py] of [[x,top],[x+w,top],[x+w,bottom],[x,top],[x+w,bottom],[x,bottom]])this.vertex(px,py,0,0,this.tint(style,px,py));
    }
  }
  strokeRect(x,y,w,h) {this.beginPath(); this.moveTo(x,y);this.lineTo(x+w,y);this.lineTo(x+w,y+h);this.lineTo(x,y+h);this.closePath();this.stroke();}
  beginPath() {this.paths = []; this.path = null;}
  moveTo(x,y) {this.path = [[x,y]];this.paths.push(this.path);}
  lineTo(x,y) {if (!this.path) this.moveTo(x,y); else this.path.push([x,y]);}
  closePath() {if (this.path?.length) this.path.closed = true;}
  arc(x,y,r,start,end,anticlockwise=false) {this.ellipse(x,y,r,r,0,start,end,anticlockwise);}
  ellipse(x,y,rx,ry,rotation,start,end,anticlockwise=false) {
    let span = end - start;
    if (anticlockwise && span > 0) span -= TAU;
    if (!anticlockwise && span < 0) span += TAU;
    const steps = Math.max(6, Math.min(48, Math.ceil(Math.abs(span) * Math.sqrt(Math.max(rx,ry)) / 2)));
    for (let i=0;i<=steps;i++) {
      const angle=start+span*i/steps, px=Math.cos(angle)*rx, py=Math.sin(angle)*ry;
      this.lineTo(x+px*Math.cos(rotation)-py*Math.sin(rotation),y+px*Math.sin(rotation)+py*Math.cos(rotation));
    }
  }
  quadraticCurveTo(cx,cy,x,y) {
    const from = this.path[this.path.length-1];
    for(let i=1;i<=12;i++){const t=i/12,u=1-t;this.lineTo(u*u*from[0]+2*u*t*cx+t*t*x,u*u*from[1]+2*u*t*cy+t*t*y);}
  }
  fill() {
    this.useTexture(this.white);
    for (const points of this.paths) for(const i of triangulate(points)) {const [x,y]=points[i];this.vertex(x,y,0,0,this.tint(this.fillStyle,x,y));}
  }
  stroke() {
    this.useTexture(this.white);
    for (const points of this.paths) {
      const count=points.length-(points.closed?0:1);
      let dashDistance=0;
      for(let i=0;i<count;i++) {
        const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
        if(length<.001)continue;
        const nx=-dy/length*this.lineWidth/2,ny=dx/length*this.lineWidth/2;
        const dashLength=this.dash.reduce((sum,n)=>sum+n,0);
        const pieces=dashLength?Math.ceil(length/Math.max(1,this.dash[0])):1;
        for(let j=0;j<pieces;j++) {
          const start=j/pieces,end=(j+1)/pieces;
          if(dashLength && (dashDistance+length*start)%dashLength>=this.dash[0])continue;
          const x=a[0]+dx*start,y=a[1]+dy*start,ex=a[0]+dx*end,ey=a[1]+dy*end;
          for(const [px,py] of [[x+nx,y+ny],[x-nx,y-ny],[ex-nx,ey-ny],[x+nx,y+ny],[ex-nx,ey-ny],[ex+nx,ey+ny]])this.vertex(px,py,0,0,this.tint(this.strokeStyle,px,py));
        }
        dashDistance+=length;
      }
    }
  }
  setLineDash(value) {this.dash=value;}
  createLinearGradient(...axis) {return {axis,stops:[],addColorStop(t,value){this.stops.push([t,color(value)]);this.stops.sort((a,b)=>a[0]-b[0]);}};}

  textImage(text, stroke) {
    const key=[text,this.font,stroke?this.strokeStyle:this.fillStyle,stroke?this.lineWidth:0].join('|');
    if(this.textCache.has(key))return this.textCache.get(key);
    const canvas=document.createElement('canvas'), context=canvas.getContext('2d');
    context.font=this.font;
    const size=parseFloat(this.font.match(/([\d.]+)px/)?.[1]||16),padding=Math.ceil(stroke?this.lineWidth+3:3);
    const metrics=context.measureText(text),width=Math.ceil(metrics.width);
    canvas.width=Math.max(1,(width+padding*2)*2);canvas.height=Math.ceil((size*1.6+padding*2)*2);
    context.scale(2,2);context.font=this.font;context.textBaseline='alphabetic';
    context.fillStyle=this.fillStyle;context.strokeStyle=this.strokeStyle;context.lineWidth=this.lineWidth;context.lineJoin='round';
    context[stroke?'strokeText':'fillText'](text,padding,padding+size*1.1);
    const entry={canvas,width,padding,size};
    if(this.textCache.size>=192)this.textCache.delete(this.textCache.keys().next().value);
    this.textCache.set(key,entry);
    return entry;
  }
  text(text,x,y,stroke) {
    const entry=this.textImage(String(text),stroke);
    const offset=this.textAlign==='center'?entry.width/2:this.textAlign==='right'?entry.width:0;
    const baseline=this.textBaseline==='middle'?entry.size*.35:this.textBaseline==='top'?entry.size*1.1:0;
    this.drawImage(entry.canvas,x-offset-entry.padding,y-entry.padding-entry.size*1.1+baseline,entry.canvas.width/2,entry.canvas.height/2);
  }
  fillText(text,x,y) {this.text(text,x,y,false);}
  strokeText(text,x,y) {this.text(text,x,y,true);}
  measureText(text) {return {width:this.textImage(String(text),false).width};}

  setTransform(a,b,c,d,e,f) {this.matrix=[a,b,c,d,e,f];}
  transform(a,b,c,d,e,f) {
    const m=this.matrix;
    this.matrix=[m[0]*a+m[2]*b,m[1]*a+m[3]*b,m[0]*c+m[2]*d,m[1]*c+m[3]*d,m[0]*e+m[2]*f+m[4],m[1]*e+m[3]*f+m[5]];
  }
  translate(x,y) {this.transform(1,0,0,1,x,y);}
  scale(x,y) {this.transform(x,0,0,y,0,0);}
  rotate(angle) {const c=Math.cos(angle),s=Math.sin(angle);this.transform(c,s,-s,c,0,0);}
  save() {
    const state={matrix:[...this.matrix],dash:[...this.dash],clipBox:this.clipBox};
    for(const key of ['globalAlpha','fillStyle','strokeStyle','lineWidth','font','textAlign','textBaseline','lineCap'])state[key]=this[key];
    this.stack.push(state);
  }
  restore() {const state=this.stack.pop();if(state){if(this.clipBox!==state.clipBox)this.flush();Object.assign(this,state);}}
  clip() {
    this.flush();
    const m=this.matrix,points=this.paths.flat().map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);
    const left=Math.max(0,Math.min(...points.map(p=>p[0]))),top=Math.max(0,Math.min(...points.map(p=>p[1])));
    const right=Math.min(this.canvas.width,Math.max(...points.map(p=>p[0]))),bottom=Math.min(this.canvas.height,Math.max(...points.map(p=>p[1])));
    this.clipBox=[Math.floor(left),Math.floor(this.canvas.height-bottom),Math.max(0,Math.ceil(right-left)),Math.max(0,Math.ceil(bottom-top))];
  }

  endFrame({quality='high', reduced=false, tint=[1,1,1], wave=[0,0,0,0], lights=[]}={}) {
    if(this.lost)return;
    this.flush();
    const gl=this.gl,p=this.postProgram,scene=this.targets[0],a=this.targets[1],b=this.targets[2];
    gl.disable(gl.BLEND);gl.disable(gl.SCISSOR_TEST);gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.quadBuffer);
    const location=this.postPosition,u=this.postLocations;gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
    gl.uniform1i(u.u_scene,0);gl.uniform1i(u.u_bloom,1);
    gl.uniform3fv(u.u_tint,tint);
    gl.uniform4fv(u.u_wave,reduced?[0,0,0,0]:wave);
    gl.uniform2f(u.u_size,this.canvas.width,this.canvas.height);
    const positions=new Float32Array(32),lightColors=new Float32Array(24);
    lights.slice(0,8).forEach((light,i)=>{positions.set([light.x,1-light.y,light.radius,light.strength],i*4);lightColors.set(color(light.color).slice(0,3),i*3);});
    gl.uniform4fv(u['u_lights[0]'],positions);
    gl.uniform3fv(u['u_lightColors[0]'],lightColors);
    gl.uniform1i(u.u_lightCount,Math.min(8,lights.length));
    const pass=(source,target,mode,direction=[0,0])=>{
      gl.bindFramebuffer(gl.FRAMEBUFFER,target?.framebuffer||null);gl.viewport(0,0,target?.width||this.canvas.width,target?.height||this.canvas.height);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,source.texture);
      gl.uniform1f(u.u_pass,mode);
      gl.uniform2f(u.u_texel,1/source.width,1/source.height);
      gl.uniform2fv(u.u_direction,direction);
      gl.drawArrays(gl.TRIANGLES,0,6);
    };
    const bloom=quality!=='low';
    // Both samplers remain active in this program across passes. Keep the
    // secondary sampler away from every framebuffer attachment until composite.
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.white);
    if(bloom){pass(scene,a,0);pass(a,b,1,[1,0]);pass(b,a,1,[0,1]);}
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,a.texture);
    gl.uniform1f(u.u_strength,bloom?(reduced?.12:quality==='high'?.24:.14):0);
    pass(scene,null,2);
    this.frame=(this.frame||0)+1;
  }

  beginOverlay() {
    if (this.lost) return;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.SCISSOR_TEST);
    this.count = 0;
    this.batchTexture = null;
    this.clipBox = null;
  }

  finishOverlay() {
    this.flush();
  }

  stats() {return {backend:this.backend,drawCalls:this.drawCalls,textures:this.textures.size,textLabels:this.textCache.size,renderTargets:this.targets.length,lost:this.lost};}

  trim() {
    this.flush();
    for(const [source,entry] of this.textures) {
      if(source instanceof HTMLCanvasElement){this.gl.deleteTexture(entry.texture);this.textures.delete(source);}
    }
    this.textCache.clear();
  }
}

export function createSurface(canvas) {
  try {const surface=new WebGLSurface(canvas);return {context:surface,backend:surface.backend};}
  catch(error) {
    // A failed GL initialization can have claimed the canvas context already.
    if(canvas.getContext('2d',{alpha:false}))return {context:canvas.getContext('2d'),backend:'canvas2d'};
    const replacement=canvas.cloneNode(false);
    canvas.replaceWith(replacement);
    return {context:replacement.getContext('2d',{alpha:false}),backend:'canvas2d',canvas:replacement};
  }
}
