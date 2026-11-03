expandItems();buildPalette();buildUI();initGL();buildSprites();buildEnvSprites();buildGrain();
// title backdrop: the hill, idle
titleBackdrop();
window.claude?.hot?.snapshot?.(()=>saveData());
let last=performance.now();
// keep positions and camera finite: one bad number used to leave the screen black
function sane(){if(!P)return;if(isFinite(P.x)&&isFinite(P.y)){P.okX=P.x;P.okY=P.y}else if(P.okX!=null){P.x=P.okX;P.y=P.okY;P.path=[];P.dash=null}
  if(!isFinite(camX)||!isFinite(camY)){camX=P.x;camY=P.y}if(!isFinite(G.kx)||!isFinite(G.ky)){G.kx=G.ky=0}if(!isFinite(G.shake))G.shake=0;if(!isFinite(G.hitstop)||G.hitstop>1)G.hitstop=0;
  if(G.map)for(const e of G.map.enemies)if(!isFinite(e.x)||!isFinite(e.y)){e.dead=true;e.dieT=99}}
let loopErr=0;
function frame(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=Math.max(last,now);
  try{sane();
    if(G.state==='play'){let ud=dt;if(G.hitstop>0){G.hitstop-=dt;ud=dt*.06}update(ud);render();updHUD()}
    else if(G.state==='paused'||OVL.has(G.state)){render();updHUD()}
    else{G.t+=dt;camX+=Math.sin(G.t*.1)*.004;render()}loopErr=0}
  catch(err){console.error(err);ctx=wctx;try{wctx.restore()}catch(_){}if(++loopErr===30)log('Grafikfehler abgefangen. Mit R lädt das Spiel die Grafik neu.','#ff9a3a')}
  requestAnimationFrame(frame)}
// R or the pause menu: rebuild the graphics pipeline without losing anything
function reloadRes(){sane();G.kx=G.ky=0;G.shake=0;G.hitstop=0;if(P){camX=P.x;camY=P.y}ctx=wctx;
  try{if(!GL){if(GLX)GLX.restoreContext();else initGL()}else if(GL.gl.isContextLost()&&GL.lose)GL.lose.restoreContext();else initGL()}catch(e){console.error(e)}
  resize();hudLast={};if(G.state!=='title'){buildBelt();updatePanels()}G.fx=G.fx.slice(-200);log('Grafik und Ressourcen neu geladen.','#a39b88')}
requestAnimationFrame(frame);
