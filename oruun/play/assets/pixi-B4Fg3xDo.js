import{n as e}from"./rolldown-runtime-CNOWq4Kh.js";import{_ as t,v as n,y as r}from"./pixi-DtVzdqGb.js";import{b as i,v as a,x as o,y as s}from"./pixi-BW511S8E.js";import{B as c,G as l,K as u,L as d,Q as f,R as p,Z as m,h,m as g,z as _}from"./pixi-BJJOeoSZ.js";import{A as v,B as y,F as b,G as x,I as S,J as C,K as w,L as ee,M as T,N as te,P as E,_t as ne,at as re,bt as ie,ct as ae,dt as oe,gt as D,j as se,lt as ce,ot as le,q as ue,st as de,ut as O,xt as k}from"./pixi-CTi3qx_a.js";import{D as fe,T as pe,w as me}from"./pixi-ed0nSAvr.js";import{d as he,f as A,g as j,h as M,m as N,p as P}from"./pixi-DSe2oF71.js";import{a as F,d as ge,f as _e,l as ve,o as ye,u as be}from"./pixi-COEZjR7b.js";import{c as xe,l as Se,s as Ce,u as we}from"./pixi-q-S6nZ4y.js";import{n as Te,t as I}from"./pixi-ByRGQvHc.js";function Ee(){return(Ee=e((()=>{r(),j(),N(),A(),k(),oe(),ce(),de(),re(),n.add(M,P,he,le,ae,O,ie)})))()}function De(e,t,n){let r=2166136261;for(let n=0;n<t;n++)r^=e[n].uid,r=Math.imul(r,16777619),r>>>=0;return ke[r]||Oe(e,t,r,n)}function Oe(e,t,n,r){let i={},a=0;for(let n=0;n<r;n++){let r=n<t?e[n]:D.EMPTY.source;i[a++]=r.source,i[a++]=r.style}let o=new Ce(i);return ke[n]=o,o}var ke;function Ae(){return(Ae=e((()=>{xe(),ne(),ke={}})))()}function je(e){let t=``;for(let n=0;n<e;++n)n>0&&(t+=`
else `),n<e-1&&(t+=`if(test == ${n}.0){}`);return t}function Me(e,t){if(e===0)throw Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let n=t.createShader(t.FRAGMENT_SHADER);try{for(;;){let r=Ne.replace(/%forloop%/gi,je(e));if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))e=e/2|0;else break}}finally{t.deleteShader(n)}return e}var Ne;function L(){return(L=e((()=>{Ne=`precision mediump float;
void main(void){
float test = 0.1;
%forloop%
gl_FragColor = vec4(0.0);
}`})))()}function Pe(){if(R)return R;let e=ge();return R=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),R=Me(R,e),e.getExtension(`WEBGL_lose_context`)?.loseContext(),R}var R;function Fe(){return(Fe=e((()=>{_e(),L(),R=null})))()}var Ie;function Le(){return(Le=e((()=>{Ie=class{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let e=0;e<this.count;e++){let t=this.textures[e];this.textures[e]=null,this.ids[t.uid]=null}this.count=0}}})))()}function Re(){return B>0?z[--B]:new Be}function ze(e){e.elements=null,z[B++]=e}var Be,z,B,V,H,Ve;function He(){return(He=e((()=>{m(),h(),u(),p(),ee(),Fe(),Le(),Be=class{constructor(){this.renderPipeId=`batch`,this.action=`startBatch`,this.start=0,this.size=0,this.textures=new Ie,this.blendMode=`normal`,this.topology=`triangle-strip`,this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}},z=[],B=0,d.register({clear:()=>{if(z.length>0)for(let e of z)e&&e.destroy();z.length=0,B=0}}),V=0,H=class e{constructor(t){this.uid=f(`batcher`),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],t={...e.defaultOptions,...t},t.maxTextures||(l(`v8.8.0`,`maxTextures is a required option for Batcher now, please pass it in the options`),t.maxTextures=Pe());let{maxTextures:n,attributesInitialSize:r,indicesInitialSize:i}=t;this.attributeBuffer=new g(r*4),this.indexBuffer=new Uint16Array(i),this.maxTextures=n}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let e=0;e<this.batchIndex;e++)ze(this.batches[e]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(e){this._elements[this.elementSize++]=e,e._indexStart=this.indexSize,e._attributeStart=this.attributeSize,e._batcher=this,this.indexSize+=e.indexSize,this.attributeSize+=e.attributeSize*this.vertexSize}checkAndUpdateTexture(e,t){let n=e._batch.textures.ids[t._source.uid];return!n&&n!==0?!1:(e._textureId=n,e.texture=t,!0)}updateElement(e){this.dirty=!0;let t=this.attributeBuffer;e.packAsQuad?this.packQuadAttributes(e,t.float32View,t.uint32View,e._attributeStart,e._textureId):this.packAttributes(e,t.float32View,t.uint32View,e._attributeStart,e._textureId)}break(e){let t=this._elements;if(!t[this.elementStart])return;let n=Re(),r=n.textures;r.clear();let i=t[this.elementStart],a=S(i.blendMode,i.texture._source),o=i.topology;this.attributeSize*4>this.attributeBuffer.size&&this._resizeAttributeBuffer(this.attributeSize*4),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);let s=this.attributeBuffer.float32View,c=this.attributeBuffer.uint32View,l=this.indexBuffer,u=this._batchIndexSize,d=this._batchIndexStart,f=`startBatch`,p=[],m=this.maxTextures;for(let i=this.elementStart;i<this.elementSize;++i){let h=t[i];t[i]=null;let g=h.texture._source,_=S(h.blendMode,g),v=a!==_||o!==h.topology;g._batchTick===V&&!v?(h._textureId=g._textureBindLocation,u+=h.indexSize,h.packAsQuad?(this.packQuadAttributes(h,s,c,h._attributeStart,h._textureId),this.packQuadIndex(l,h._indexStart,h._attributeStart/this.vertexSize)):(this.packAttributes(h,s,c,h._attributeStart,h._textureId),this.packIndex(h,l,h._indexStart,h._attributeStart/this.vertexSize)),h._batch=n,p.push(h)):(g._batchTick=V,(r.count>=m||v)&&(this._finishBatch(n,d,u-d,r,a,o,e,f,p),f=`renderBatch`,d=u,a=_,o=h.topology,n=Re(),r=n.textures,r.clear(),p=[],++V),h._textureId=g._textureBindLocation=r.count,r.ids[g.uid]=r.count,r.textures[r.count++]=g,h._batch=n,p.push(h),u+=h.indexSize,h.packAsQuad?(this.packQuadAttributes(h,s,c,h._attributeStart,h._textureId),this.packQuadIndex(l,h._indexStart,h._attributeStart/this.vertexSize)):(this.packAttributes(h,s,c,h._attributeStart,h._textureId),this.packIndex(h,l,h._indexStart,h._attributeStart/this.vertexSize)))}r.count>0&&(this._finishBatch(n,d,u-d,r,a,o,e,f,p),d=u,++V),this.elementStart=this.elementSize,this._batchIndexStart=d,this._batchIndexSize=u}_finishBatch(e,t,n,r,i,a,o,s,c){e.gpuBindGroup=null,e.bindGroup=null,e.action=s,e.batcher=this,e.textures=r,e.blendMode=i,e.topology=a,e.start=t,e.size=n,e.elements=c,++V,this.batches[this.batchIndex++]=e,o.add(e)}finish(e){this.break(e)}ensureAttributeBuffer(e){e*4<=this.attributeBuffer.size||this._resizeAttributeBuffer(e*4)}ensureIndexBuffer(e){e<=this.indexBuffer.length||this._resizeIndexBuffer(e)}_resizeAttributeBuffer(e){let t=Math.max(e,this.attributeBuffer.size*2),n=new g(t);y(this.attributeBuffer.rawBinaryData,n.rawBinaryData),this.attributeBuffer=n}_resizeIndexBuffer(e){let t=this.indexBuffer,n=Math.max(e,t.length*1.5);n+=n%2;let r=n>65535?new Uint32Array(n):new Uint16Array(n);if(r.BYTES_PER_ELEMENT!==t.BYTES_PER_ELEMENT)for(let e=0;e<t.length;e++)r[e]=t[e];else y(t.buffer,r.buffer);this.indexBuffer=r}packQuadIndex(e,t,n){e[t]=n+0,e[t+1]=n+1,e[t+2]=n+2,e[t+3]=n+0,e[t+4]=n+2,e[t+5]=n+3}packIndex(e,t,n,r){let i=e.indices,a=e.indexSize,o=e.indexOffset,s=e.attributeOffset;for(let e=0;e<a;e++)t[n++]=r+i[e+o]-s}destroy(e={}){if(this.batches!==null){for(let e=0;e<this.batchIndex;e++)ze(this.batches[e]);this.batches=null,this.geometry.destroy(!0),this.geometry=null,e.shader&&(this.shader?.destroy(),this.shader=null);for(let e=0;e<this._elements.length;e++)this._elements[e]&&(this._elements[e]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}},H.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6},Ve=H})))()}var Ue,We,Ge;function Ke(){return(Ke=e((()=>{te(),b(),se(),Ue=new Float32Array(1),We=new Uint32Array(1),Ge=class extends v{constructor(){let e=new T({data:Ue,label:`attribute-batch-buffer`,usage:E.VERTEX|E.COPY_DST,shrinkToFit:!1}),t=new T({data:We,label:`index-batch-buffer`,usage:E.INDEX|E.COPY_DST,shrinkToFit:!1});super({attributes:{aPosition:{buffer:e,format:`float32x2`,stride:24,offset:0},aUV:{buffer:e,format:`float32x2`,stride:24,offset:8},aColor:{buffer:e,format:`unorm8x4`,stride:24,offset:16},aTextureIdAndRound:{buffer:e,format:`uint16x2`,stride:24,offset:20}},indexBuffer:t})}}})))()}function qe(e,t,n){if(e)for(let r in e){let i=t[r.toLocaleLowerCase()];if(i){let t=e[r];r===`header`&&(t=t.replace(/@in\s+[^;]+;\s*/g,``).replace(/@out\s+[^;]+;\s*/g,``)),n&&i.push(`//----${n}----//`),i.push(t)}else c(`${r} placement hook does not exist in shader`)}}function Je(){return(Je=e((()=>{_()})))()}function Ye(e){let t={};return(e.match(Xe)?.map(e=>e.replace(/[{()}]/g,``))??[]).forEach(e=>{t[e]=[]}),t}var Xe;function Ze(){return(Ze=e((()=>{Xe=/\{\{(.*?)\}\}/g})))()}function Qe(e,t){let n,r=/@in\s+([^;]+);/g;for(;(n=r.exec(e))!==null;)t.push(n[1])}function $e(e,t,n=!1){let r=[];Qe(t,r),e.forEach(e=>{e.header&&Qe(e.header,r)});let i=r;n&&i.sort();let a=i.map((e,t)=>`       @location(${t}) ${e},`).join(`
`),o=t.replace(/@in\s+[^;]+;\s*/g,``);return o=o.replace(`{{in}}`,`
${a}
`),o}function et(e,t){let n,r=/@out\s+([^;]+);/g;for(;(n=r.exec(e))!==null;)t.push(n[1])}function tt(e){let t=/\b(\w+)\s*:/g.exec(e);return t?t[1]:``}function nt(e){return e.replace(/@.*?\s+/g,``)}function rt(e,t){let n=[];et(t,n),e.forEach(e=>{e.header&&et(e.header,n)});let r=0,i=n.sort().map(e=>e.indexOf(`builtin`)>-1?e:`@location(${r++}) ${e}`).join(`,
`),a=n.sort().map(e=>`       var ${nt(e)};`).join(`
`),o=`return VSOutput(
            ${n.sort().map(e=>` ${tt(e)}`).join(`,
`)});`,s=t.replace(/@out\s+[^;]+;\s*/g,``);return s=s.replace(`{{struct}}`,`
${i}
`),s=s.replace(`{{start}}`,`
${a}
`),s=s.replace(`{{return}}`,`
${o}
`),s}function it(e,t){let n=e;for(let e in t){let r=t[e];n=r.join(`
`).length?n.replace(`{{${e}}}`,`//-----${e} START-----//
${r.join(`
`)}
//----${e} FINISH----//`):n.replace(`{{${e}}}`,``)}return n}function at({template:e,bits:t}){let n=ct(e,t);if(U[n])return U[n];let{vertex:r,fragment:i}=st(e,t);return U[n]=lt(r,i,t),U[n]}function ot({template:e,bits:t}){let n=ct(e,t);return U[n]||(U[n]=lt(e.vertex,e.fragment,t)),U[n]}function st(e,t){let n=t.map(e=>e.vertex).filter(e=>!!e),r=t.map(e=>e.fragment).filter(e=>!!e),i=$e(n,e.vertex,!0);i=rt(n,i);let a=$e(r,e.fragment,!0);return{vertex:i,fragment:a}}function ct(e,t){return t.map(e=>(W.has(e)||W.set(e,ut++),W.get(e))).sort((e,t)=>e-t).join(`-`)+e.vertex+e.fragment}function lt(e,t,n){let r=Ye(e),i=Ye(t);return n.forEach(e=>{qe(e.vertex,r,e.name),qe(e.fragment,i,e.name)}),{vertex:it(e,r),fragment:it(t,i)}}var U,W,ut;function dt(){return(dt=e((()=>{Je(),Ze(),U=Object.create(null),W=new Map,ut=0})))()}var ft,pt,mt,ht;function gt(){return(gt=e((()=>{ft=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,pt=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`,mt=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,ht=`

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`})))()}var _t,vt;function yt(){return(yt=e((()=>{_t={name:`global-uniforms-bit`,vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},vt={name:`global-uniforms-bit`,vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}}})))()}function bt({bits:e,name:t}){let n=at({template:{fragment:pt,vertex:ft},bits:[_t,...e]});return Se.from({name:t,vertex:{source:n.vertex,entryPoint:`main`},fragment:{source:n.fragment,entryPoint:`main`}})}function xt({bits:e,name:t}){return new ve({name:t,...ot({template:{vertex:mt,fragment:ht},bits:[vt,...e]})})}function St(){return(St=e((()=>{be(),we(),dt(),gt(),yt()})))()}var G,Ct;function wt(){return(wt=e((()=>{G={name:`color-bit`,vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},Ct={name:`color-bit`,vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}}})))()}function Tt(e){let t=[];if(e===1)t.push(`@group(1) @binding(0) var textureSource1: texture_2d<f32>;`),t.push(`@group(1) @binding(1) var textureSampler1: sampler;`);else{let n=0;for(let r=0;r<e;r++)t.push(`@group(1) @binding(${n++}) var textureSource${r+1}: texture_2d<f32>;`),t.push(`@group(1) @binding(${n++}) var textureSampler${r+1}: sampler;`)}return t.join(`
`)}function Et(e){let t=[];if(e===1)t.push(`outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);`);else{t.push(`switch vTextureId {`);for(let n=0;n<e;n++)n===e-1?t.push(`  default:{`):t.push(`  case ${n}:{`),t.push(`      outColor = textureSampleGrad(textureSource${n+1}, textureSampler${n+1}, vUV, uvDx, uvDy);`),t.push(`      break;}`);t.push(`}`)}return t.join(`
`)}function Dt(e){return K[e]||(K[e]={name:`texture-batch-bit`,vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${Tt(e)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${Et(e)}
            `}}),K[e]}function Ot(e){let t=[];for(let n=0;n<e;n++)n>0&&t.push(`else`),n<e-1&&t.push(`if(vTextureId < ${n}.5)`),t.push(`{`),t.push(`	outColor = texture(uTextures[${n}], vUV);`),t.push(`}`);return t.join(`
`)}function kt(e){return q[e]||(q[e]={name:`texture-batch-bit`,vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${e}];

            `,main:`

                ${Ot(e)}
            `}}),q[e]}var K,q;function At(){return(At=e((()=>{K={},q={}})))()}var jt,Mt;function Nt(){return(Nt=e((()=>{jt={name:`round-pixels-bit`,vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},Mt={name:`round-pixels-bit`,vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}}})))()}var Pt;function Ft(){return(Ft=e((()=>{St(),wt(),At(),Nt(),ye(),C(),Pt=class extends ue{constructor(e){let t=xt({name:`batch`,bits:[Ct,kt(e),Mt]}),n=bt({name:`batch`,bits:[G,Dt(e),jt]});super({glProgram:t,gpuProgram:n,resources:{batchSamplers:F(e)}}),this.maxTextures=e}}})))()}var J,It,Y;function Lt(){return(Lt=e((()=>{r(),He(),Ke(),Ft(),J=null,It=class e extends Ve{constructor(t){super(t),this.geometry=new Ge,this.name=e.extension.name,this.vertexSize=6,J??=new Pt(t.maxTextures),this.shader=J}packAttributes(e,t,n,r,i){let a=i<<16|e.roundPixels&65535,o=e.transform,s=o.a,c=o.b,l=o.c,u=o.d,d=o.tx,f=o.ty,{positions:p,uvs:m}=e,h=e.color,g=e.attributeOffset,_=g+e.attributeSize;for(let e=g;e<_;e++){let i=e*2,o=p[i],g=p[i+1];t[r++]=s*o+l*g+d,t[r++]=u*g+c*o+f,t[r++]=m[i],t[r++]=m[i+1],n[r++]=h,n[r++]=a}}packQuadAttributes(e,t,n,r,i){let a=e.texture,o=e.transform,s=o.a,c=o.b,l=o.c,u=o.d,d=o.tx,f=o.ty,p=e.bounds,m=p.maxX,h=p.minX,g=p.maxY,_=p.minY,v=a.uvs,y=e.color,b=i<<16|e.roundPixels&65535;t[r+0]=s*h+l*_+d,t[r+1]=u*_+c*h+f,t[r+2]=v.x0,t[r+3]=v.y0,n[r+4]=y,n[r+5]=b,t[r+6]=s*m+l*_+d,t[r+7]=u*_+c*m+f,t[r+8]=v.x1,t[r+9]=v.y1,n[r+10]=y,n[r+11]=b,t[r+12]=s*m+l*g+d,t[r+13]=u*g+c*m+f,t[r+14]=v.x2,t[r+15]=v.y2,n[r+16]=y,n[r+17]=b,t[r+18]=s*h+l*g+d,t[r+19]=u*g+c*h+f,t[r+20]=v.x3,t[r+21]=v.y3,n[r+22]=y,n[r+23]=b}_updateMaxTextures(e){this.shader.maxTextures!==e&&(J=new Pt(e),this.shader=J)}destroy(){this.shader=null,super.destroy()}},It.extension={type:[t.Batcher],name:`default`},Y=It})))()}var X,Rt,zt;function Bt(){return(Bt=e((()=>{X={name:`local-uniform-bit`,vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},Rt={...X,vertex:{...X.vertex,header:X.vertex.header.replace(`group(1)`,`group(2)`)}},zt={name:`local-uniform-bit`,vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}}})))()}var Z,Vt;function Ht(){return(Ht=e((()=>{r(),s(),o(),pe(),Te(),Z=class e{static _getPatternRepeat(e,t){let n=e&&e!==`clamp-to-edge`,r=t&&t!==`clamp-to-edge`;return n&&r?`repeat`:n?`repeat-x`:r?`repeat-y`:`no-repeat`}start(e,t,n){}execute(t,n){let r=n.elements;if(!r||!r.length)return;let i=t.renderer,o=i.canvasContext,s=o.activeContext;for(let t=0;t<r.length;t++){let c=r[t];if(!c.packAsQuad)continue;let l=c,u=l.texture,d=u?I.getCanvasSource(u):null;if(!d)continue;let f=u.source.style,p=o.smoothProperty,m=f.scaleMode!==`nearest`;s[p]!==m&&(s[p]=m),o.setBlendMode(n.blendMode);let h=i.globalUniforms.globalUniformData?.worldColor??4294967295,g=l.color,_=(h>>>24&255)/255,v=(g>>>24&255)/255,y=i.filter?.alphaMultiplier??1,b=_*v*y;if(b<=0)continue;s.globalAlpha=b;let x=h&16777215,S=g&16777215,C=me(fe(S,x)),w=u.frame,ee=f.addressModeU??f.addressMode,T=f.addressModeV??f.addressMode,te=e._getPatternRepeat(ee,T),E=u.source._resolution??u.source.resolution??1,ne=l.renderable?.renderGroup?.isCachedAsTexture,re=w.x*E,ie=w.y*E,ae=w.width*E,oe=w.height*E,D=l.bounds,se=i.renderTarget.renderTarget.isRoot,ce=D.minX,le=D.minY,ue=D.maxX-D.minX,de=D.maxY-D.minY,O=u.rotate,k=u.uvs,pe=Math.min(k.x0,k.x1,k.x2,k.x3,k.y0,k.y1,k.y2,k.y3),he=Math.max(k.x0,k.x1,k.x2,k.x3,k.y0,k.y1,k.y2,k.y3),A=te!==`no-repeat`&&(pe<0||he>1),j=O&&(!!A||C===16777215&&!O);j?(e._tempPatternMatrix.copyFrom(l.transform),a.matrixAppendRotationInv(e._tempPatternMatrix,O,ce,le,ue,de),o.setContextTransform(e._tempPatternMatrix,l.roundPixels===1,void 0,ne&&se)):o.setContextTransform(l.transform,l.roundPixels===1,void 0,ne&&se);let M=ue,N=de,P=j?0:ce,F=j?0:le;if(!j&&l.roundPixels===1&&(P|=0,F|=0),A){let t=d,n=C!==16777215&&!O,r=w.width<=u.source.width&&w.height<=u.source.height;n&&r&&(t=I.getTintedCanvas({texture:u},C));let i=s.createPattern(t,te);if(!i)continue;let a=M,o=N;if(a===0||o===0)continue;let c=1/a,l=1/o,f=(k.x1-k.x0)*c,p=(k.y1-k.y0)*c,m=(k.x3-k.x0)*l,h=(k.y3-k.y0)*l,g=k.x0-f*P-m*F,_=k.y0-p*P-h*F,v=u.source.pixelWidth,y=u.source.pixelHeight;e._tempPatternMatrix.set(f*v,p*y,m*v,h*y,g*v,_*y),I.applyPatternTransform(i,e._tempPatternMatrix),s.fillStyle=i,s.fillRect(P,F,M,N)}else{let e=C!==16777215||O?I.getTintedCanvas({texture:u},C):d,t=e!==d;s.drawImage(e,t?0:re,t?0:ie,t?e.width:ae,t?e.height:oe,P,F,M,N)}}}},Z._tempPatternMatrix=new i,Z.extension={type:[t.CanvasPipesAdaptor],name:`batch`},Vt=Z})))()}var Ut;function Wt(){return(Wt=e((()=>{r(),w(),Ut=class{constructor(){this._tempState=x.for2d(),this._didUploadHash={}}init(e){e.renderer.runners.contextChange.add(this)}contextChange(){this._didUploadHash={}}start(e,t,n){let r=e.renderer,i=this._didUploadHash[n.uid];r.shader.bind(n,i),i||(this._didUploadHash[n.uid]=!0),r.shader.updateUniformGroup(r.globalUniforms.uniformGroup),r.geometry.bind(t,n.glProgram)}execute(e,t){let n=e.renderer;this._tempState.blendMode=t.blendMode,n.state.set(this._tempState);let r=t.textures.textures;for(let e=0;e<t.textures.count;e++)n.texture.bind(r[e],e);n.texture.unbindIntegerTextures(t.textures.count),n.geometry.draw(t.topology,t.size,t.start)}},Ut.extension={type:[t.WebGLPipesAdaptor],name:`batch`}})))()}var Q,Gt;function Kt(){return(Kt=e((()=>{r(),w(),Ae(),Q=x.for2d(),Gt=class{start(e,t,n){let r=e.renderer,i=r.encoder,a=n.gpuProgram;this._shader=n,this._geometry=t,i.setGeometry(t,a),Q.blendMode=`normal`,r.pipeline.getPipeline(t,a,Q,void 0,n._overrides);let o=r.globalUniforms.bindGroup;i.resetBindGroup(1),i.setBindGroup(0,o,a)}execute(e,t){let n=this._shader.gpuProgram,r=e.renderer,i=r.encoder;if(!t.bindGroup){let e=t.textures;t.bindGroup=De(e.textures,e.count,r.limits.maxBatchableTextures)}Q.blendMode=t.blendMode;let a=r.bindGroup.getBindGroup(t.bindGroup,n,1),o=r.pipeline.getPipeline(this._geometry,n,Q,t.topology,this._shader._overrides);t.bindGroup._touch(r.gc.now),i.setPipeline(o),i.renderPassEncoder.setBindGroup(1,a),i.renderPassEncoder.drawIndexed(t.size,1,t.start)}},Gt.extension={type:[t.WebGPUPipesAdaptor],name:`batch`}})))()}var $,qt;function Jt(){return(Jt=e((()=>{r(),w(),Lt(),$=class e{constructor(e,t){this.state=x.for2d(),this._batchersByInstructionSet=Object.create(null),this._activeBatches=Object.create(null),this.renderer=e,this._adaptor=t,this._adaptor.init?.(this)}static getBatcher(e,t){return new this._availableBatchers[e]({maxTextures:t})}buildStart(e){let t=this._batchersByInstructionSet[e.uid];t||(t=this._batchersByInstructionSet[e.uid]=Object.create(null),t.default||(t.default=new Y({maxTextures:this.renderer.limits.maxBatchableTextures}))),this._activeBatches=t,this._activeBatch=this._activeBatches.default;for(let e in this._activeBatches)this._activeBatches[e].begin()}addToBatch(t,n){if(this._activeBatch.name!==t.batcherName){this._activeBatch.break(n);let r=this._activeBatches[t.batcherName];r||(r=this._activeBatches[t.batcherName]=e.getBatcher(t.batcherName,this.renderer.limits.maxBatchableTextures),r.begin()),this._activeBatch=r}this._activeBatch.add(t)}break(e){this._activeBatch.break(e)}buildEnd(e){this._activeBatch.break(e);let t=this._activeBatches;for(let e in t){let n=t[e],r=n.geometry;r.indexBuffer.setDataWithSize(n.indexBuffer,n.indexSize,!0),r.buffers[0].setDataWithSize(n.attributeBuffer.float32View,n.attributeSize,!1)}}upload(e){let t=this._batchersByInstructionSet[e.uid];for(let e in t){let n=t[e],r=n.geometry;n.dirty&&(n.dirty=!1,r.buffers[0].update(n.attributeSize*4))}}execute(e){if(e.action===`startBatch`){let t=e.batcher,n=t.geometry,r=t.shader;this._adaptor.start(this,n,r)}this._adaptor.execute(this,e)}destroyInstructionSet(e){let t=this._batchersByInstructionSet[e.uid];if(t){for(let e in t)t[e].destroy();delete this._batchersByInstructionSet[e.uid],this._activeBatches===t&&(this._activeBatches=Object.create(null),this._activeBatch=null)}}destroy(){this.state=null,this.renderer=null,this._adaptor=null;for(let e in this._activeBatches)this._activeBatches[e].destroy();this._activeBatches=null}},$.extension={type:[t.WebGLPipes,t.WebGPUPipes,t.CanvasPipes],name:`batch`},$._availableBatchers=Object.create(null),qt=$,n.handleByMap(t.Batcher,qt._availableBatchers),n.add(Y)})))()}var Yt,Xt;function Zt(){return(Zt=e((()=>{Yt={name:`texture-bit`,vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;


        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},Xt={name:`texture-bit`,vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}}})))()}export{Me as A,At as C,xt as D,wt as E,De as M,Ae as N,bt as O,Ee as P,kt as S,Ct as T,Lt as _,Jt as a,Mt as b,Ut as c,Ht as d,Bt as f,Y as g,Rt as h,qt as i,L as j,St as k,Wt as l,zt as m,Yt as n,Gt as o,X as p,Xt as r,Kt as s,Zt as t,Vt as u,Nt as v,G as w,Dt as x,jt as y};