/* ---------- the alchemist's flasks: thrown in an arc, they burst at the mark or on the first foe in the way ---------- */
const alD=m=>pDmg(m)*(1+((P&&P.d&&P.d.potPow)||0)/200);
const FLC={fire:['#fff0b0','#ff8a2a','#8a2a08'],frost:['#ffffff','#9ad0ff','#2a5a8a'],poison:['#eaffc0','#8ae050','#2a5a10'],heal:['#fff8c0','#f0d050','#8a6a10']};
function alLob(tx,ty,el,o){const d=Math.max(1.2,Math.min(9,hyp(tx-P.x,ty-P.y))),a=Math.atan2(ty-P.y,tx-P.x),sp=11,t=d/sp;
  G.proj.push(Object.assign({x:P.x+Math.cos(a)*.4,y:P.y+Math.sin(a)*.4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,owner:'p',kind:'flask',fl:el,fc:FLC[el],r:.22,life:t,life0:t,aoe:1.6,boomE:el==='frost'?'frost':el==='poison'?'poison':'fire',col:EL[el]?EL[el].col:'#ffd070'},o));sfx('swing')}
const alGlass=(x,y,c)=>{for(let k=0;k<12;k++){const a=rnd(0,6.28);fxp({k:'shard',x,y,z:.4,vx:Math.cos(a)*rnd(2,5),vy:Math.sin(a)*rnd(2,5),vz:rnd(1,3),life:.45,col:pick(['#e8f4f0','#bcd8d0',c[1]]),s:rnd(1,2),rot:a,g:1})}};
const _castExtK=castExt;castExt=function(id,l,ang,tx,ty){
  if(id==='a_fire'){alLob(tx,ty,'fire',{dmg:alD(1.1+l*.12),onBoom:p=>{alGlass(p.x,p.y,p.fc);G.zones.push({k:'burn',x:p.x,y:p.y,r:1.8,t:0,dur:3,tick:.5,acc:0,dmg:p.dmg*.12});decal('scorch',p.x,p.y,1.1,20)}});return}
  if(id==='a_frost'){alLob(tx,ty,'frost',{dmg:alD(.3),aoe:1,onBoom:p=>{alGlass(p.x,p.y,p.fc);mRing('frost',p.x,p.y,alD(.9+l*.1),l,true)}});return}
  if(id==='a_plague'){alLob(tx,ty,'poison',{dmg:alD(.4),aoe:1.2,onBoom:p=>{alGlass(p.x,p.y,p.fc);mStorm('poison',p.x,p.y,alD(1.6+l*.16),false)}});return}
  if(id==='a_heal'){const amt=P.d.life*(12+l*1.5)/100*(1+P.d.potPow/200);G.aheal=(G.aheal||[]).concat({x:P.x,y:P.y,t:0,dur:4,rate:amt/4});P.poisonT=0;
    shock(P.x,P.y,2.6,'255,230,140',.6,4);flash(P.x,P.y,1,60,'255,230,140',.3);sample('potion',.7)||sfx('cast');ftext(P.x,P.y-.6,'Heilnebel','#ffe08a',true);
    if(typeof mpOn==='function'&&mpOn())try{mpSend({t:'aheal',x:P.x,y:P.y,f:G.floor,a:amt})}catch(e){}return}
  if(id==='a_oil'){P.oilT=15+l;P.oilB=30+l*4;flash(P.x,P.y,1,50,'255,220,150',.35);for(const k of ELK)shock(P.x,P.y,1.6+ELK.indexOf(k)*.5,EL[k].rgb,.5,3);ftext(P.x,P.y-.6,'Alchemistenöl','#ffd8a0',true);sfx('cast');return}
  return _castExtK(id,l,ang,tx,ty)};
// oiled arrows: each one dipped in the next element
const _pArrowK=pArrow;pArrow=function(ang,dmg,o={}){if(P&&P.oilT>0){const el=ELK[(G.oilI=((G.oilI||0)+1)%4)],b=(P.oilB||30)/100;
    o=Object.assign({col:EL[el].col,oil:el,onHit:(e,p)=>{eHit(el,e,p.dmg*b);if(el==='light'&&!e.dead)jumpOn(el,e,p.dmg*b*.6,1,new Set([e]))}},o)}return _pArrowK(ang,dmg,o)};
const _drawProjK=drawProj;drawProj=function(p){
  if(p.kind==='arrow'&&p.oil){const[sx,sy]=iso(p.x,p.y),[dx,dy]=scrDir(Math.atan2(p.vy,p.vx)),E=EL[p.oil];ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${E.rgb},.55)`;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sx-dx*8,sy-16-dy*8);ctx.lineTo(sx+dx*6,sy-16+dy*6);ctx.stroke();ctx.restore();return _drawProjK(p)}
  if(p.kind!=='flask')return _drawProjK(p);const[sx,sy]=iso(p.x,p.y),q=p.life0?clamp(1-p.life/p.life0,0,1):.5,z=Math.sin(q*Math.PI)*26+12,c=p.fc||FLC.fire;
  ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(sx,sy,3.2,1.5,0,0,7);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(sx,sy-z);const gl=ctx.createRadialGradient(0,0,0,0,0,9);gl.addColorStop(0,c[1]+'66');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();
  ctx.rotate(G.t*13);blob(0,1,3.2,3.2,['#2a3a38','#6a8a84','#bcd8d0','#f0fff8']);blob(0,1.8,2.5,2,[c[2],c[2],c[1],c[0]]);poly([[-1.1,-1.8],[1.1,-1.8],[1,-4.6],[-1,-4.6]],['#2a3a38','#6a8a84','#bcd8d0','#f0fff8']);blob(0,-5,1.2,.9,['#3a1a08','#6a3a14','#9a6a34','#c8985a']);
  ctx.fillStyle='#ffffff';ctx.fillRect(-1.8,-.4,.9,.9);ctx.restore()};
// the flasks that reach their mark burst there; the healing mist does its work; the oil wears off
const _updateK=update;update=function(dt){if(P&&G.map&&G.state==='play'){
    for(const p of G.proj)if(p.kind==='flask'&&p.owner==='p'&&p.life-dt<=0&&p.life>0){p.life=0;explode(p)}
    if(P.oilT>0)P.oilT-=dt;
    if(G.aheal&&G.aheal.length){for(const h of G.aheal){h.t+=dt;if(hyp(P.x-h.x,P.y-h.y)<2.6&&!P.dead)P.hp=Math.min(P.d.life,P.hp+h.rate*dt);
        if(Math.random()<dt*28){const a=rnd(0,6.28),r=rnd(0,2.4);fxp({k:'mote',x:h.x+Math.cos(a)*r,y:h.y+Math.sin(a)*r,z:.1,vx:0,vy:0,vz:rnd(.6,1.4),life:rnd(.6,1),col:pick(['#fff4c0','#f0d860','#c8f0a0']),s:rnd(1,2),g:-.2})}}
      G.aheal=G.aheal.filter(h=>h.t<h.dur)}}
  return _updateK(dt)};
if(typeof mpRecv==='function'){const _mpRecvK=mpRecv;mpRecv=function(d,c){if(d&&d.t==='aheal'){if(P&&!P.dead&&G.floor===d.f&&hyp(P.x-d.x,P.y-d.y)<3)G.aheal=(G.aheal||[]).concat({x:d.x,y:d.y,t:0,dur:4,rate:d.a/4});return}return _mpRecvK(d,c)}}

