const $=id=>document.getElementById(id);
const cv=$('c'),wc=document.createElement('canvas'),wctx=wc.getContext('2d'),ui=$('ui'),uctx=ui.getContext('2d');let ctx=wctx;
// the world is drawn small into wc, then shown through a palette shader on cv (GPU), upscaled with hard pixels
let GL=null,glTex=null,glLut=null,cv2=null;
function initGL(){try{const gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:false});if(!gl)throw 0;
  const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D img,lut,bay;uniform vec2 sz;varying vec2 v;void main(){vec2 px=floor(v*sz);vec3 c=texture2D(img,v).rgb*255.;float t=(texture2D(bay,(px+.5)/4.).r*255.-7.5)*1.6;c=clamp(c+t,0.,255.);vec3 q=floor(c/8.);gl_FragColor=vec4(texture2D(lut,vec2((q.g*32.+q.b+.5)/1024.,(q.r+.5)/32.)).rgb,1.);}'));
  gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw 0;gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const tex=(unit,w,h,data,fmt)=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,unit===2?gl.REPEAT:gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,unit===2?gl.REPEAT:gl.CLAMP_TO_EDGE);if(data)gl.texImage2D(gl.TEXTURE_2D,0,fmt,w,h,0,fmt,gl.UNSIGNED_BYTE,data);return t};
  const L=new Uint8Array(1024*32*4);for(let i=0;i<32768;i++){const k=LUT[i],r=i>>10,x=i&1023,o=(r*1024+x)*4;L[o]=PALR[k];L[o+1]=PALG[k];L[o+2]=PALB[k];L[o+3]=255}
  glLut=tex(1,1024,32,L,gl.RGBA);tex(2,4,4,new Uint8Array(BAYER.map(v=>Math.round(v/1.6+7.5))),gl.LUMINANCE);glTex=tex(0,1,1,null);
  gl.uniform1i(gl.getUniformLocation(pr,'img'),0);gl.uniform1i(gl.getUniformLocation(pr,'lut'),1);gl.uniform1i(gl.getUniformLocation(pr,'bay'),2);GL={gl,sz:gl.getUniformLocation(pr,'sz'),lose:gl.getExtension('WEBGL_lose_context')};glFallback(false)}
  catch(e){GL=null;cv2=cv.getContext('2d')}}
// if the GPU takes the WebGL context away (tab switch, low memory), show the plain world canvas until it comes back
let GLX=null;
function glFallback(on){if(on){Object.assign(wc.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',imageRendering:'pixelated',display:'block'});if(!wc.parentNode)cv.after(wc)}else if(wc.parentNode)wc.remove()}
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();if(GL)GLX=GL.lose||GLX;GL=null;glFallback(true);setTimeout(()=>{try{GLX&&GLX.restoreContext()}catch(_){}},1000)});
cv.addEventListener('webglcontextrestored',()=>{initGL()});
function present(){if(GL){const gl=GL.gl;gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(GL.sz,cv.width,cv.height);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,glTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,wc);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
  else if(cv2)cv2.drawImage(wc,0,0)}
let W=0,H=0,DPR=1,ZM=1,ZF=1;
const dark=document.createElement('canvas'),dctx=dark.getContext('2d');
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);ZM=Math.max(1.3,Math.min(2.42,innerHeight/430))*ZF;W=innerWidth/ZM;H=innerHeight/ZM;wc.width=cv.width=dark.width=Math.ceil(W);wc.height=cv.height=dark.height=Math.ceil(H);cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';ui.width=Math.round(innerWidth*DPR);ui.height=Math.round(innerHeight*DPR);ui.style.width=innerWidth+'px';ui.style.height=innerHeight+'px';wctx.setTransform(1,0,0,1,0,0)}
addEventListener('resize',resize);resize();


