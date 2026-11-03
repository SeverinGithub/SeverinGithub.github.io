/* ---------- the title: the tower stands to the right, the hero of the last save before it, embers drift up out of the dusk ---------- */
// on a narrow screen the tower stands in the middle above the menu
function titleCam(){if(G.state!=='title')return;const n=innerWidth<=760||innerHeight>innerWidth&&innerWidth<=1100,sw=Math.sin((G.t||0)*.12)*.5;camX=(n?20.6:15.9)+sw;camY=(n?20.6:20.3)-sw}
// the camera would drift to the hero; on the title it holds the view and only sways a little
const _renderT=render;render=function(){titleCam();_renderT()};
const _titleBackdropT=titleBackdrop;titleBackdrop=function(){_titleBackdropT();const d=loadData();if(d&&d.p&&CLS[d.p.cls])P.cls=d.p.cls;
  P.x=23.2;P.y=26.8;P.face=Math.atan2(24-P.y,24-P.x);titleCam()};
addEventListener('resize',titleCam);
(function titleEmbers(){const c=$('tEmb'),g=c.getContext('2d'),E=[],still=matchMedia('(prefers-reduced-motion: reduce)').matches;let lt=0;
  const spawn=(w,h,any)=>({x:Math.random()*w,y:any?Math.random()*h:h+10,v:18+Math.random()*42,f:.6+Math.random()*1.4,p:Math.random()*6.28,s:8+Math.random()*22,r:.6+Math.random()*1.6,l:0,L:5+Math.random()*7});
  const step=t=>{requestAnimationFrame(step);if($('title').hidden||still)return;const dt=Math.min(.05,lt?(t-lt)/1000:0);lt=t;
    const w=c.clientWidth,h=c.clientHeight;if(c.width!==w||c.height!==h){c.width=w;c.height=h}g.clearRect(0,0,w,h);
    while(E.length<Math.min(110,w/12))E.push(spawn(w,h,true));g.globalCompositeOperation='lighter';
    for(let i=0;i<E.length;i++){const e=E[i];e.l+=dt;e.y-=e.v*dt;e.x+=Math.sin(t/1000*e.f+e.p)*e.s*dt;if(e.y<-10||e.l>e.L){E[i]=spawn(w,h,false);continue}
      // the embers burn brighter towards the tower and fade as they rise
      const a=Math.min(1,e.l*1.5)*Math.max(0,1-e.l/e.L)*(.45+.55*(e.x/w))*(.7+.3*Math.sin(t/120*e.f+e.p)),R=e.r*3.4,gr=g.createRadialGradient(e.x,e.y,0,e.x,e.y,R);
      gr.addColorStop(0,`rgba(255,226,170,${a})`);gr.addColorStop(.35,`rgba(255,140,50,${a*.55})`);gr.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=gr;g.fillRect(e.x-R,e.y-R,R*2,R*2)}
    g.globalCompositeOperation='source-over'};
  requestAnimationFrame(step)})();
