/* ---------- perf overlay: ?perf in the address (or Shift+F3) shows frame time, logic, drawing and network, measured on the device itself ---------- */
const PERF={on:false,box:null,acc:{},n:0,t0:0,ft:[],net:{i:0,o:0},wrapped:false};
// the parts worth knowing; each is timed by a thin wrapper that only exists once the overlay was switched on
const PERF_FN=['update','render','updHUD','present','drawEnemy','drawObj','drawProp','drawPlayer','drawFxWorld','drawFxGlow','drawWeather','drawDecals','drawLabels','drawMinimap','drawClouds','drawGrass','updEnemy','computeFlow'];
function perfWrap(){if(PERF.wrapped)return;PERF.wrapped=true;
  for(const n of PERF_FN){let f;try{f=eval(n)}catch(_){continue}if(typeof f!=='function')continue;
    const g=function(...a){if(!PERF.on)return f.apply(this,a);const t=performance.now();try{return f.apply(this,a)}finally{PERF.acc[n]=(PERF.acc[n]||0)+performance.now()-t}};
    try{eval(n+'=g')}catch(_){}}
  const _s=mpSend;mpSend=function(o,fast){if(PERF.on)PERF.net.o++;return _s(o,fast)};
  const _r=mpRecv;mpRecv=function(d,c){if(PERF.on)PERF.net.i++;return _r(d,c)}}
function perfToggle(on=!PERF.on){PERF.on=on;if(on){perfWrap();if(!PERF.box){const b=document.createElement('pre');b.id='perfBox';
    Object.assign(b.style,{position:'fixed',left:'6px',top:'6px',zIndex:9999,margin:0,padding:'6px 8px',background:'rgba(0,0,0,.72)',color:'#d8f0c8',font:'11px/1.35 ui-monospace,Menlo,monospace',pointerEvents:'none',whiteSpace:'pre',borderRadius:'4px'});
    document.body.appendChild(b);PERF.box=b}PERF.box.hidden=false;PERF.t0=performance.now();PERF.acc={};PERF.n=0;PERF.ft=[];requestAnimationFrame(perfTick)}
  else if(PERF.box)PERF.box.hidden=true}
let perfLast=0;
function perfTick(now){if(!PERF.on)return;if(perfLast)PERF.ft.push(now-perfLast);perfLast=now;PERF.n++;
  if(now-PERF.t0>=1000){const ft=PERF.ft.slice().sort((a,b)=>a-b),n=PERF.n,avg=ft.reduce((a,b)=>a+b,0)/Math.max(1,ft.length),p95=ft[Math.floor(ft.length*.95)]||0,el=(now-PERF.t0)/1000;
    const ms=k=>((PERF.acc[k]||0)/n).toFixed(2),m=G.map,rows=[
      `FPS ${(n/el).toFixed(0)}  Frame ${avg.toFixed(1)} ms  p95 ${p95.toFixed(1)}  max ${(ft[ft.length-1]||0).toFixed(1)}`,
      `Logik ${ms('update')}  Zeichnen ${ms('render')}  HUD ${ms('updHUD')}  GPU-Upload ${ms('present')}`,
      ...PERF_FN.slice(4).filter(k=>PERF.acc[k]>.05*n).map(k=>`  ${k.padEnd(12)} ${ms(k)}`),
      `Gegner ${m?m.enemies.filter(e=>!e.dead).length:0}  Effekte ${(G.fx||[]).length}  Geschosse ${(G.proj||[]).length}  Objekte ${m&&m.objs?m.objs.length:0}`,
      `Bild ${cv.width}×${cv.height} intern · DPR ${devicePixelRatio} · Zoom ${ZM.toFixed(2)}`+(mpOn()?`  Netz ${(PERF.net.i/el).toFixed(0)}↓ ${(PERF.net.o/el).toFixed(0)}↑/s · ${NET.others.size+1} Spieler`:'')];
    PERF.box.textContent=rows.join('\n');PERF.t0=now;PERF.acc={};PERF.n=0;PERF.ft=[];PERF.net={i:0,o:0}}
  requestAnimationFrame(perfTick)}
addEventListener('keydown',e=>{if(e.key==='F3'&&e.shiftKey){e.preventDefault();perfToggle()}});
if(/[?&]perf\b/.test(location.search))setTimeout(()=>perfToggle(true),0);
