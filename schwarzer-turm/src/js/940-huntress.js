/* ---------- the huntress: a hooded mantle, a cloth over the mouth, quiet leather · the alchemist: an apron, goggles, a strap of glowing vials ---------- */
const _heroLookK=heroLook;heroLook=function(fl){const r=_heroLookK(fl);if(P&&(P.cls==='jaegerin'||P.cls==='alchemist')){r.R[P.cls==='jaegerin'?'hunt':'alch']=1;r.R.clsHelm=!!(P.eq.helm&&P.d.okS.has(P.eq.helm))}return r};
const darkR=C=>[C[0],C[0],C[1],C[2]];
// a ramp pulled part of the way towards another, so the mantle keeps the armour's colour but always reads as the huntress's dusk-violet
const mixR=(A,B,t)=>A.map((c,i)=>{if(!/^#[0-9a-f]{6}$/i.test(c))return c;const h=k=>parseInt(c.slice(k,k+2),16)*(1-t)+parseInt(B[i].slice(k,k+2),16)*t;return'#'+[1,3,5].map(k=>Math.round(h(k)).toString(16).padStart(2,'0')).join('')});
const _humanoidK=humanoid;humanoid=function(o){const R=o.R;if(!R||!(R.hunt||R.alch)||o.clsDone)return _humanoidK(o);
  const C=R.torso,f=o.f,back=o.back,tw=o.tw||1,mv=o.moving,s=mv?Math.sin(o.ph||0):0,c2=mv?Math.cos((o.ph||0)*2):0,head0=o.head,o2=Object.assign({},o,{clsDone:1}),inner=o.torsoFx;
  if(R.hunt){const K=darkR(mixR(C,['#0e0a16','#221a34','#3a2c52','#5a4878'],.5)),LT=['#120c08','#24180e','#3a2816','#5a4026'];
    o2.torsoFx=(shX,shY,hipX,hipY)=>{if(inner)inner(shX,shY,hipX,hipY,back);
      if(back){// the mantle over the back: from the shoulders to below the belt, its hem cut in points and swinging
        const T=[-8.6,-4,0,4,8.6].map(x=>[shX+x*tw,shY-1]),B=[-9.6,-5,0,5,9.6].map((x,k)=>[hipX+x*tw+s*1.4*(.5+Math.abs(x)/10),hipY+5+(k%2?1.6:0)+(mv?Math.abs(x)/10*c2*.8:0)]);
        for(let k=0;k<4;k++){ctx.fillStyle=K[clamp(2-(k>1?1:0)+(k===0?-1:0),0,3)];ctx.beginPath();ctx.moveTo(...T[k]);ctx.lineTo(...T[k+1]);ctx.lineTo(...B[k+1]);ctx.lineTo(...B[k]);ctx.closePath();ctx.fill()}
        ctx.strokeStyle=K[0];ctx.lineWidth=.6;ctx.globalAlpha=.7;ctx.beginPath();for(const k of[1,3]){ctx.moveTo(T[k][0],T[k][1]+2);ctx.lineTo(B[k][0],B[k][1]-.8)}ctx.stroke();ctx.globalAlpha=1;return}
      // belt, a strap across the chest with three knives in it, the capelet's edges over the shoulders and a clasp
      limb(hipX-6.4*tw,hipY+.4,hipX+6.4*tw,hipY+.4,.9,.9,LT,true);blob(hipX+f*1.6,hipY+.4,1.1,1,RP.iron,true);
      limb(shX-f*5.5*tw,shY+.5,hipX+f*5*tw,hipY-.5,.75,.75,LT,true);
      for(let k=0;k<3;k++){const t=.25+k*.2,x=shX-f*5.5*tw+(hipX+f*5*tw-(shX-f*5.5*tw))*t,y=shY+.5+(hipY-.5-shY-.5)*t;limb(x,y,x-f*.6,y-2.6,.55,.4,RP.iron,true);blob(x-f*.7,y-2.9,.5,.5,RP.iron)}
      for(const sd of[-1,1]){ctx.fillStyle=K[sd===f?2:1];ctx.beginPath();ctx.moveTo(shX+sd*1.6,shY-1.6);ctx.lineTo(shX+sd*9.4*tw,shY);ctx.lineTo(shX+sd*8.6*tw,shY+5.4);ctx.lineTo(shX+sd*6.8*tw,shY+4.2);ctx.lineTo(shX+sd*5.6*tw,shY+6.4);ctx.lineTo(shX+sd*3.2,shY+3);ctx.closePath();ctx.fill()}
      blob(shX+f*.6,shY+.6,1,1,RP.iron,true)};
    o2.armFx=a=>{const dx=a.hx-a.ex,dy=a.hy-a.ey,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;limb(a.hx-ux*3.6,a.hy-uy*3.6,a.hx-ux*.9,a.hy-uy*.9,1.55,1.4,LT,true);ctx.strokeStyle=LT[3];ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(a.hx-ux*2.2-uy*1.3,a.hy-uy*2.2+ux*1.3);ctx.lineTo(a.hx-ux*2.2+uy*1.3,a.hy-uy*2.2-ux*1.3);ctx.stroke()};
    o2.head=(hx,hy)=>{const H=K,peak=-f*1.4;
      if(R.clsHelm){head0(hx,hy);blob(hx,hy+5.2,6.6,2.4,H);return}
      if(back){head0(hx,hy);blob(hx,hy-.6,5.6,6.2,H);poly([[hx-2.6,hy-5],[hx+peak*1.4,hy-8.6],[hx+2.6,hy-5]],[H[1],H[1],H[2],H[2]]);poly([[hx-6.2,hy+5.4],[hx-5,hy+1],[hx+5,hy+1],[hx+6.2,hy+5.4]],H);return}
      blob(hx,hy,5.4,6,[H[0],H[0],H[0],H[1]]);head0(hx,hy);
      // the cloth over mouth and nose, then the hood's shadow down to the eyes
      ctx.fillStyle='#1c1612';ctx.beginPath();ctx.moveTo(hx-4.2,hy+.9);ctx.lineTo(hx+4.2,hy+.9);ctx.lineTo(hx+3.6,hy+3.8);ctx.lineTo(hx+f*.6,hy+4.6);ctx.lineTo(hx-3.6,hy+3.8);ctx.closePath();ctx.fill();
      ctx.fillStyle='#3a302a';ctx.fillRect(hx-4,hy+.9,8,.6);
      ctx.save();ctx.globalAlpha=.5;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(hx+f*.6,hy-2.6,4.2,2.4,0,0,7);ctx.fill();ctx.restore();
      poly([[hx-5.8,hy+5.2],[hx-5.8,hy-2],[hx-3.4,hy-7],[hx+peak,hy-8.4],[hx+3.4,hy-7],[hx+5.8,hy-2],[hx+5.8,hy+5.2],[hx+4.2,hy+5.2],[hx+4.4,hy-1.4],[hx+2.8,hy-4.6],[hx,hy-5.2],[hx-2.8,hy-4.6],[hx-4.4,hy-1.4],[hx-4.2,hy+5.2]],H)}}
  else{const AP=['#4a3a24','#7a6440','#a88c5c','#d0b480'],LT=['#1a0e06','#3a2210','#6a4422','#9a6a3a'],VC=['#ff5a3a','#7ae050','#5ab0ff','#ffc040'],gl=.6+.4*Math.sin(G.t*3);
    o2.torsoFx=(shX,shY,hipX,hipY)=>{if(inner)inner(shX,shY,hipX,hipY,back);
      if(back){// a round flask strapped to the back, green and glowing
        limb(shX-6*tw,shY+1,hipX+5*tw,hipY,.7,.7,LT,true);limb(shX+6*tw,shY+1,hipX-5*tw,hipY,.7,.7,LT,true);
        const bx=shX+f*.8,by=shY+7;blob(bx,by,3.3,3.4,['#1a2422','#4a6460','#9ac0b8','#e0fff8']);blob(bx,by+.9,2.7,2.3,['#1a4a10','#3a8a20','#7ae050','#d0ffb0']);
        poly([[bx-1,by-3],[bx+1,by-3],[bx+.9,by-5.4],[bx-.9,by-5.4]],['#1a2422','#4a6460','#9ac0b8','#e0fff8']);blob(bx,by-5.7,1.1,.8,['#3a1a08','#6a3a14','#9a6a34','#c8985a']);limb(bx-3.4,by,bx+3.4,by,.5,.5,LT,true);
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.16*gl;ctx.fillStyle='#7ae050';ctx.beginPath();ctx.arc(bx,by+.8,4,0,7);ctx.fill();ctx.restore();return}
      // the apron: from the chest to the knees, a strap round the neck, a pocket with a vial in it
      const sw=s*1.2,top=shY+4,bot=hipY+7.5;
      ctx.fillStyle=lgrad(hipX-7,top,hipX+7,top,[AP[0],AP[1],AP[2],AP[1]]);ctx.beginPath();ctx.moveTo(shX-4.4*tw,top);ctx.lineTo(shX+4.4*tw,top);ctx.lineTo(hipX+5.6*tw,hipY);ctx.lineTo(hipX+6.6*tw+sw,bot);ctx.lineTo(hipX-6.6*tw+sw,bot+.6);ctx.lineTo(hipX-5.6*tw,hipY);ctx.closePath();ctx.fill();
      ctx.strokeStyle=AP[0];ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(hipX-6.6*tw+sw,bot+.6);ctx.lineTo(hipX+6.6*tw+sw,bot);ctx.stroke();
      limb(shX-4.2*tw,top,shX-1.6,shY-1.4,.5,.5,LT,true);limb(shX+4.2*tw,top,shX+1.6,shY-1.4,.5,.5,LT,true);limb(hipX-6*tw,hipY+.2,hipX+6*tw,hipY+.2,.6,.6,LT,true);
      const px2=hipX+f*2.4,py2=hipY+3.4;poly([[px2-2.4,py2-1.4],[px2+2.4,py2-1.4],[px2+2.2,py2+2.4],[px2-2.2,py2+2.4]],[AP[0],AP[0],AP[1],AP[1]],true);limb(px2-.6,py2-1.2,px2-.6,py2-3.6,.7,.7,['#2a3a38','#6a8a84','#bcd8d0','#f0fff8']);blob(px2-.6,py2-3.9,.6,.5,LT);
      // the bandolier: shoulder to hip, four vials that glow each in their own colour
      const ax0=shX-f*5.6*tw,ay0=shY+.4,ax1=hipX+f*5.4*tw,ay1=hipY-.8;limb(ax0,ay0,ax1,ay1,.8,.8,LT,true);
      for(let k=0;k<4;k++){const t=.18+k*.2,x=ax0+(ax1-ax0)*t,y=ay0+(ay1-ay0)*t;blob(x,y-.4,1.15,1.6,['#1a2422','#6a8a84','#bcd8d0','#f0fff8']);blob(x,y+.1,.9,1,[VC[k],VC[k],VC[k],'#ffffff']);
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25*gl;ctx.fillStyle=VC[k];ctx.beginPath();ctx.arc(x,y,2.4,0,7);ctx.fill();ctx.restore();blob(x,y-2.1,.55,.45,LT)}};
    o2.armFx=a=>{const dx=a.ex-a.sx,dy=a.ey-a.sy,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;blob(a.ex-ux*.4,a.ey-uy*.4,2.1,1.6,['#8a7a64','#b8a888','#e0d4b8','#f4ecd8']);limb(a.hx-(a.hx-a.ex)*.35,a.hy-(a.hy-a.ey)*.35,a.hx,a.hy,1.6,1.5,LT,true)};
    o2.head=(hx,hy)=>{head0(hx,hy);if(R.clsHelm)return;const BR=['#3a2406','#8a6418','#d0a838','#fff0a0'];
      limb(hx-4.6,hy-2.8,hx+4.6,hy-2.8,.75,.75,LT,true);if(back)return;
      for(const sd of[-1,1]){const gx=hx+sd*1.9+f*.7,gy=hy-3.4;blob(gx,gy,1.75,1.6,BR,true);blob(gx,gy,1.05,.95,['#1a3a40','#2a6a78','#6ac0d0','#d0f8ff']);ctx.fillStyle='#ffffff';ctx.fillRect(gx-.7,gy-.7,.5,.5)}}}
  return _humanoidK(o2)};

