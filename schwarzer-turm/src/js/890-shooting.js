/* ---------- shooting: a bow or crossbow looses an arrow where a blade would swing, the wand spits a spark of its element ---------- */
const _resolveSwingK=resolveSwing;resolveSwing=function(){const w=P.eq.weapon;if(!w||!P.d.okS.has(w)||!(isRangedW(w)||isWandW(w)))return _resolveSwingK();const a=P.face;
  if(isWandW(w)){const el=w.elem||'fire',E=EL[el];G.proj.push({x:P.x+Math.cos(a)*.4,y:P.y+Math.sin(a)*.4,vx:Math.cos(a)*14,vy:Math.sin(a)*14,owner:'p',dmg:pDmg(1),kind:E.kind,col:E.col,r:.25,life:.75,
      onHit:e=>{if(e.dead)return;if(el==='frost')e.slow=Math.max(e.slow||0,1.2);if(el==='poison'){e.dotT=3;e.dotD=Math.max(e.dotD||0,pDmg(.1))}}});flash(P.x+Math.cos(a)*.6,P.y+Math.sin(a)*.6,.6,18,E.rgb,.14);return}
  const x=w.cls==='xbow';pArrow(a,pDmg(x?1.15:1),{sp:x?22:17,big:x,pierce:false,life:.7});kick(a+Math.PI,x?2:1)};

