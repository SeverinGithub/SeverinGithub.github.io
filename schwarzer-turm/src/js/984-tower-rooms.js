/* ---------- tower rooms: a lever vault, a trial chamber, a blood altar, a prisoner · powder kegs and chandeliers that hit everyone · pressure plates · cracked floors · a lift back to the bonfire ---------- */
// what the hero has done in the tower stays with the save: solved rooms, unlocked lifts, emptied crypts, seen sights, raised bridges
const twS=()=>G.tw||(G.tw={done:{},lift:{},crypt:{},seen:{},br:{}});
const _saveDataT=saveData;saveData=function(){const d=_saveDataT();if(d)d.g.tw=G.tw||null;return d};
const _applyDataT=applyData;applyData=function(d){G.tw=null;return _applyDataT(d)};
const _startNewT=startNew;startNew=function(c){G.tw=null;return _startNewT(c)};
const GEMS=[{n:'das Blut',c:'#e0302a',l:'255,60,40'},{n:'der Himmel',c:'#3a8aff',l:'80,140,255'},{n:'das Gift',c:'#5ae040',l:'110,230,80'},{n:'das Gold',c:'#ffc830',l:'255,200,60'}];
const TWK=['schatz','pruefung','altar','gefangener'];
const _genDungeonT=genDungeon;genDungeon=function(f){const m=_genDungeonT(f);if(typeof f!=='number'||m.isRift)return m;const R0=R;R=mulberry(G.seed*3301+f*6007);try{twDress(m,f)}finally{R=R0}return m};
function twAt(m,cx,cy,rad,away=1.6){for(let r=0;r<6;r+=.5)for(let a=0;a<6.28;a+=.6){const x=Math.floor(cx+Math.cos(a)*r)+.5,y=Math.floor(cy+Math.sin(a)*r)+.5;if(ftClear(m,x,y,rad)&&!m.objs.some(o=>hyp(o.x-x,o.y-y)<away))return[x,y]}return null}
function twDress(m,f){const rooms=m.rooms.filter(r=>r!==m.startRoom&&r!==m.endRoom&&!(m.well&&m.well.room===r)).sort(()=>R()-.5),L=(x,y,col,r=130)=>m.props.push({k:'twL',x,y,col,r,ph:rnd(0,6)});
  // one special room on every floor from the second
  if(f>=2&&rooms.length){const r=rooms.shift(),k=TWK[(f+rint(0,3))%4],S=m.sroom={k,id:f+':'+k,cx:r.cx+.5,cy:r.cy+.5,rad:Math.max(4,Math.min(r.w,r.h)/2-1.2)},done=!!twS().done[S.id];
    const c=twAt(m,S.cx,S.cy,1.2,2.5)||[S.cx,S.cy];S.cx=c[0];S.cy=c[1];
    if(k==='schatz'){const gs=[0,1,2,3].sort(()=>R()-.5).slice(0,3);S.order=gs.slice().sort(()=>R()-.5);S.step=0;S.solved=done;m.objs.push({type:'twvault',x:S.cx,y:S.cy,open:done,locked:!done});L(S.cx,S.cy,'255,200,90');
      gs.forEach((g,k)=>{const a=k/3*6.283+R(),p=twAt(m,S.cx+Math.cos(a)*3,S.cy+Math.sin(a)*3,.8,1.6);if(p)m.objs.push({type:'twlever',x:p[0],y:p[1],gem:g,on:done})});
      const q=twAt(m,S.cx+2,S.cy-1.5,.8,1.4);if(q)m.objs.push({type:'twplaque',x:q[0],y:q[1]})}
    if(k==='pruefung'){m.objs.push({type:'twtrial',x:S.cx,y:S.cy});S.done=done;L(S.cx,S.cy,'255,70,50',150)}
    if(k==='altar'){m.objs.push({type:'twaltar',x:S.cx,y:S.cy,used:done});L(S.cx,S.cy,'255,40,30',150);for(let k=0;k<6;k++){const a=k/6*6.283;m.props.push({k:'dccand',x:S.cx+Math.cos(a)*1.6,y:S.cy+Math.sin(a)*1.6,v:0,ph:rnd(0,6)})}
      for(let k=0;k<5;k++)m.deco.push({k:'blood',x:S.cx+rnd(-1.4,1.4),y:S.cy+rnd(-1.4,1.4),v:rint(0,3)})}
    if(k==='gefangener'){m.objs.push({type:'twcage',x:S.cx,y:S.cy,open:done,name:pick(['Alrik','Wendela','Hagen','Ysra','Tankred','Mirla','Odo','Brunhild'])});L(S.cx,S.cy,'255,170,80',110)}}
  // powder kegs and chandeliers: they hurt whoever stands near, foes too
  m.hz=[];for(const r of m.rooms){if(r===m.startRoom||(m.boss&&r===m.endRoom))continue;
    if(R()<.4)for(let k=rint(1,3);k--;){const p=ftSpot(m,r,.6,1.8);if(p&&!m.hz.some(h=>hyp(h.x-p[0],h.y-p[1])<1.2))m.hz.push({k:'barrel',x:p[0],y:p[1]})}
    if(r.w>=14&&r.h>=14&&R()<.35){const p=twAt(m,r.cx+.5+rnd(-2,2),r.cy+.5+rnd(-2,2),1,2);if(p&&(!m.well||hyp(p[0]-m.well.x,p[1]-m.well.y)>m.well.r+2)){const pr={k:'twL',x:p[0],y:p[1],col:'255,190,100',r:210,h:70,ph:rnd(0,6)};m.props.push(pr);m.hz.push({k:'chand',x:p[0],y:p[1],prop:pr})}}}
  // pressure plates: a stone gives under the foot, arrows fly from the wall across the room
  m.plates=[];if(f>=2)for(const r of m.rooms){if(r===m.startRoom||R()>.3)continue;const p=ftSpot(m,r,.6,2.5);if(!p)continue;const ax=R()<.5,d=ax?[1,0]:[0,1];let a=0,b=0;
    while(m.t[Math.floor(p[1]-d[1]*(a+1))*m.w+Math.floor(p[0]-d[0]*(a+1))]===1&&a<12)a++;while(m.t[Math.floor(p[1]+d[1]*(b+1))*m.w+Math.floor(p[0]+d[0]*(b+1))]===1&&b<12)b++;
    if(a+b<5)continue;m.plates.push({x:p[0],y:p[1],sx:p[0]-d[0]*(a+.45),sy:p[1]-d[1]*(a+.45),ang:Math.atan2(d[1],d[0]),len:a+b+.9,cd:0,dn:0})}
  // cracked floors: step on one and you fall to the next floor, hurt but quicker
  m.cracks=[];if(f>=2&&!m.boss)for(const r of rooms.slice(0,rint(1,2))){const p=ftSpot(m,r,1,3);if(p)m.cracks.push({x:p[0],y:p[1],st:0,t:0,seed:rint(0,999)})}
  // a lift beside the stairs: unlock it from below once, then it rides between stairs and bonfire
  if(f>=2&&!m.boss){const st=m.objs.find(o=>o.type==='stairs'),sh=m.objs.find(o=>o.type==='shrine');if(st&&sh){const a=twAt(m,st.x+2.2,st.y-1.2,1,1.8),b=twAt(m,sh.x-2,sh.y+1.6,1,1.8);
    if(a&&b){m.objs.push({type:'twlift',x:a[0],y:a[1],low:true},{type:'twlift',x:b[0],y:b[1],low:false});L(a[0],a[1],'255,190,110',100);L(b[0],b[1],'255,190,110',100)}}}}
const _populateT=populate;populate=function(m){_populateT(m);if(m.kind!=='dungeon'||!m.hz)return;for(const h of m.hz)if(!h.gone)m.enemies.push(twObjE(h));if(m.sroom){const S=m.sroom;S.on=false;S.wave=0}};
function twObjE(h){const e=makeEnemy('golem',h.x,h.y,'normal');Object.assign(e,{wall:true,obj:h.k,hz:h,name:h.k==='barrel'?'Pulverfass':'Kronleuchter',sub:h.k==='barrel'?'explodiert bei jedem Treffer':'hängt an einer morschen Kette',hp:1,max:1,dmg:[0,0],spd:0,xp:0,aff:[],r:h.k==='barrel'?.42:.55,cd:1e9,scale:1,role:null,elem:null,face:0,fuse:null,dmgTaken:1});return e}
// a keg or a chandelier takes no damage: any blow lights the fuse or snaps the chain
const _hitEnemyT=hitEnemy;hitEnemy=function(e,dmg,o={}){if(e&&e.obj){twTrig(e,o.chain);return 0}if(P&&P.blessT>0&&!o.ally&&!o.dot)dmg*=1.3;return _hitEnemyT(e,dmg,o)};
const _killEnemyT=killEnemy;killEnemy=function(e,a){if(e&&e.obj){if(!e.dead)twBlast(e);return}return _killEnemyT(e,a)};
function twTrig(e,chain){if(e.dead||e.fuse!=null)return;e.flash=.15;e.fuse=e.obj==='barrel'?(chain?.2:.1):.45;if(e.obj==='chand'){sample('hit',.4,{rate:.5});sparks(e.x,e.y,2.4,-1.57,8,['#ffe0a0','#c8a050'],3)}}
function twBlast(e){const m=G.map;e.dead=true;e.dieT=99;e.hz.gone=true;const dm=trapDmg();
  if(e.obj==='barrel'){boom(e.x,e.y,1.6,'fire');G.shake=Math.max(G.shake||0,10);sfx('boom');addLight(e.x,e.y,280,1,.6);for(let k=0;k<14;k++)fxp({k:'bone',x:e.x,y:e.y,z:.4,vx:rnd(-4,4),vy:rnd(-4,4),vz:rnd(2,5),life:rnd(.6,1.2),col:pick(['#5a3a1c','#3a2610','#7a5228']),s:rnd(2,4),g:8,rot:0,vr:rnd(-9,9)});
    for(const f of m.enemies){if(f.dead||f===e)continue;const d=hyp(f.x-e.x,f.y-e.y);if(d>2.5+f.r*.5)continue;if(f.obj){if(f.obj==='barrel')twTrig(f,true);continue}if(f.wall)continue;hitEnemy(f,dm*4,{ally:true,col:'#ffb070'});const a=Math.atan2(f.y-e.y,f.x-e.x);f.kvx=(f.kvx||0)+Math.cos(a)*5;f.kvy=(f.kvy||0)+Math.sin(a)*5}
    if(!P.dead&&hyp(P.x-e.x,P.y-e.y)<2.5)hurtPlayer(dm*1.4,'fire',null)}
  else{if(e.hz.prop)e.hz.prop.off=true;G.shake=Math.max(G.shake||0,8);syn('thud');sample('chest',.5,{rate:.5});smoke(e.x,e.y,12,'rgba(110,100,86,',7,.7);sparks(e.x,e.y,.3,0,24,['#ffe0a0','#ffb050','#c8a050'],6,3.2);m.deco.push({k:'rubble',x:e.x,y:e.y,v:0});
    for(const f of m.enemies){if(f.dead||f.wall||hyp(f.x-e.x,f.y-e.y)>1.8+f.r*.5)continue;hitEnemy(f,dm*3.5,{ally:true,col:'#ffe0a0'});f.stun=Math.max(f.stun||0,1.2)}
    if(!P.dead&&hyp(P.x-e.x,P.y-e.y)<1.8)hurtPlayer(dm*1.2,null,null)}}
function drawTwObj(e){const[sx,sy]=iso(e.x,e.y);if(sx<-60||sx>W+60||sy<-200||sy>H+40)return;const t=G.t,fl=e.flash>0;
  if(e.obj==='barrel'){shadow(sx,sy,.3);const x=Math.round(sx)+(e.fuse!=null?rnd(-1,1):0),y=Math.round(sy);ctx.fillStyle=fl?'#fff0d0':'#5a3a1c';ctx.fillRect(x-8,y-20,16,19);ctx.fillStyle='#7a5228';ctx.fillRect(x-6,y-20,4,19);
    ctx.fillStyle='#2a2622';for(const yy of[-18,-11,-4])ctx.fillRect(x-8,y+yy,16,2);ctx.fillStyle='#3a2410';ctx.beginPath();ctx.ellipse(x,y-20,8,3,0,0,7);ctx.fill();ctx.fillStyle='#b02a1a';ctx.fillRect(x-2,y-15,4,7);ctx.fillStyle='#e8d8b0';ctx.fillRect(x-1,y-14,2,2);
    ctx.strokeStyle='#8a7a5a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+2,y-21);ctx.quadraticCurveTo(x+6,y-27,x+4,y-30);ctx.stroke();if(e.fuse!=null){flame(x+4,y-30,3,t*5);if(Math.random()<.6)sparks(e.x,e.y,1.1,-1.57,1,['#fff0a0','#ffb050'],2)}
    if(hyp(e.x-P.x,e.y-P.y)<3.2)label(sx,sy-36,'Pulverfass','#ff9a5a');return}
  // a chandelier hangs high above the floor; when its chain snaps it drops
  const z=e.fuse!=null?Math.max(0,e.fuse/.45)**2*86:86+Math.sin(t*.9+e.x)*1.5,cy=sy-z,sw=Math.sin(t*.7+e.y)*1.5;ctx.fillStyle=`rgba(0,0,0,${.2+.3*(1-z/90)})`;ctx.beginPath();ctx.ellipse(sx,sy,22,10,0,0,7);ctx.fill();
  if(e.fuse!=null){ctx.strokeStyle=`rgba(255,80,50,${.4+Math.sin(t*30)*.3})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx,sy,1.8*45,1.8*22.6,0,0,7);ctx.stroke()}
  else{ctx.strokeStyle='#2a2620';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(sx,cy-190);ctx.lineTo(sx+sw,cy-14);ctx.stroke()}
  ctx.save();ctx.translate(sx+sw,cy);ctx.strokeStyle=fl?'#fff':'#5a4a2a';ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(0,0,27,9,0,0,7);ctx.stroke();ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,4,13,4.5,0,0,7);ctx.stroke();ctx.fillStyle='#5a4a2a';ctx.fillRect(-2,-16,4,22);ctx.strokeStyle='#3a3020';ctx.lineWidth=1;for(let k=0;k<4;k++){const a=k/4*6.283+.4;ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(Math.cos(a)*27,Math.sin(a)*9);ctx.stroke()}
  for(let k=0;k<8;k++){const a=k/8*6.283+.3,x=Math.cos(a)*27,y=Math.sin(a)*9;ctx.fillStyle='#e8e0c8';ctx.fillRect(x-1.4,y-8,2.8,8);if(!(e.fuse!=null&&k%2))flame(x,y-6,2.2,k+e.x)}ctx.restore();
  if(hyp(e.x-P.x,e.y-P.y)<3.5&&e.fuse==null)label(sx,cy-24,'Kronleuchter · schieß ihn herunter','#e8c878')}
const _drawEnemyT=drawEnemy;drawEnemy=function(e){if(e.obj)return e.dead?null:drawTwObj(e);return _drawEnemyT(e)};
const _propLightT=propLight;propLight=function(p){if(p.k==='twL')return p.off?null:{r:p.r||130,a:.7,col:p.col,f:3,h:p.h||20};return _propLightT(p)};
const _drawPropT=drawProp;drawProp=function(p){if(p.k==='twL')return;return _drawPropT(p)};

// the special rooms' objects
const _interactT=interact;interact=function(o){const f=o&&TWI[o.type];if(f)return f(o);return _interactT(o)};
function twLoot(o,n,ml){for(let k=0;k<n;k++)dropItem(makeItem(ml,{rarity:Math.random()<.55?'rare':'magic',boost:.4}),o.x,o.y);if(Math.random()<.3)dropItem(makeItem(ml,{rarity:'unique'}),o.x,o.y);
  if(Math.random()<.5)dropItem(makePotion('life',G.floor>0?G.floor:4),o.x,o.y);const gl=Math.round(30*G.mlvl);P.glut+=gl;ftext(o.x,o.y-.4,'+'+gl+' Glut','#ff9a3a');sample('chest',.8)||sfx('boom');burst(o.x,o.y,'#ffd88a',22,2.5,.6)}
const TWI={
  twvault(o){if(o.open)return;if(o.locked){log('Das Schloss rührt sich nicht. Die Hebel im Raum öffnen es.','#c8b898');sample('hit',.3,{rate:.6});return}o.open=true;twLoot(o,3,mlNow()+2);banner('SCHATZKAMMER','Der Lohn für den klugen Kopf','',2400)},
  twplaque(){const S=G.map.sroom;if(!S||!S.order)return;const txt='„Erst '+S.order.map(g=>GEMS[g].n).join(', dann ').replace(/, dann ([^,]*)$/,', zuletzt $1')+'.“';banner('DIE INSCHRIFT',txt,'',4200);log('Inschrift: '+txt,'#e8d8b0')},
  twlever(o){const m=G.map,S=m.sroom;if(!S||S.solved||o.on)return;o.on=true;o.t=G.t;sample('chest',.45,{rate:1.7})||sfx('pick');
    if(o.gem===S.order[S.step]){S.step++;sparks(o.x,o.y,.8,-1.57,8,[GEMS[o.gem].c,'#ffffff'],3);if(S.step>=S.order.length){S.solved=true;twS().done[S.id]=1;for(const v of m.objs)if(v.type==='twvault')v.locked=false;banner('DAS SCHLOSS SPRINGT AUF','Die Schatzkammer ist offen','',2400);sfx('lvl');save()}}
    else{S.step=0;setTimeout(()=>{for(const l of m.objs)if(l.type==='twlever')l.on=false},450);hurtPlayer(trapDmg()*1.3,null,null);for(let k=0;k<8;k++){const a=rnd(0,6.28);fxp({k:'spark',x:P.x+Math.cos(a)*3,y:P.y+Math.sin(a)*3,z:1,vx:-Math.cos(a)*12,vy:-Math.sin(a)*12,vz:0,life:.25,col:'#d8d0bc',s:2,g:0})}
      log('Falsche Reihenfolge! Pfeile schnellen aus den Wänden, die Hebel springen zurück.','#ff7a5a')}},
  twtrial(o){const S=G.map.sroom;if(!S||S.done||S.on)return;S.on=true;S.wave=0;S.next=0;S.pack=[];banner('DIE PRÜFUNG','Drei Wellen. Kein Weg hinaus, bis alle fallen.','boss',2600);sample('portal',.6,{rate:.6});G.shake=6;shock(S.cx,S.cy,S.rad,'255,70,50',.9,5)},
  twaltar(o){if(o.used){log('Der Altar ist satt.','#c8b898');return}if(!o.arm||G.t>o.arm){o.arm=G.t+5;log('Der Altar verlangt Blut: ein Drittel deines Lebens für mehr Kraft. Berühre ihn noch einmal, um zu opfern.','#ff7a6a');return}
    o.used=true;const S=G.map.sroom;if(S)twS().done[S.id]=1;const c=P.d.life/3;P.hp=Math.max(1,P.hp-c);P.blessT=120;ftext(P.x,P.y,'-'+Math.round(c),'#ff4a3a',true);burst(o.x,o.y,'#c81a10',30,3,.8);flash(o.x,o.y,1,80,'255,40,20',.4);sfx('cast');G.shake=5;
    banner('BLUTOPFER','+30 % Schaden für zwei Minuten','boss',2600);save()},
  twcage(o){if(o.open)return;o.open=true;o.ft=G.t;const S=G.map.sroom;if(S)twS().done[S.id]=1;sample('chest',.6,{rate:.8})||sfx('pick');
    log(`${o.name}: „${pick(['Endlich! Ich kenne diese Ebene wie meine Zelle – hier, meine Karte.','Ich dachte, hier kommt keiner mehr. Nimm, was ich mir gemerkt habe.','Die Wächter haben mich vergessen. Ich vergesse dich nicht – hier, die Wege dieser Ebene.'])}“`,'#e8d8b0');
    const m=G.map;for(let k=0;k<m.t.length;k++)if(m.t[k])m.explored[k]=1;dropItem(makePotion('life',G.floor),o.x,o.y);const gl=Math.round(15*G.mlvl);P.glut+=gl;ftext(o.x,o.y-.4,'+'+gl+' Glut','#ff9a3a');banner('BEFREIT',o.name+' zeigt dir die ganze Ebene','',2600);save()},
  twlift(o){const f=G.floor,L=twS().lift,to=G.map.objs.find(x=>x.type==='twlift'&&x!==o);if(!to)return;
    if(o.low){if(!L[f]){L[f]=1;log('Du löst den Riegel. Der Aufzug fährt jetzt zwischen Treppe und Leuchtfeuer.','#ffd88a');save()}}
    else if(!L[f]){log('Der Aufzug ist von unten verriegelt.','#c8b898');sample('hit',.3,{rate:.5});return}
    const[x,y]=nearWalk(to.x+.9,to.y+.9);P.x=x;P.y=y;camX=x;camY=y;P.path=[];P.interact=null;G.flowT=0;computeFlow();smoke(x,y,10,'rgba(110,100,86,',6,.6);G.shake=4;sample('portal',.4,{rate:.7})||sfx('pick');log('Der Aufzug rattert durch den Schacht.','#c8b898')},
  twhole(o){twFall()}};
function twFall(){if(typeof G.floor!=='number'||P.dead)return;const c=P.d.life*.15;P.hp=Math.max(1,P.hp-c);const f=G.floor+1;enterFloor(f);ftext(P.x,P.y,'-'+Math.round(c),'#ff7a5a',true);G.shake=9;syn('thud');smoke(P.x,P.y,14,'rgba(110,100,86,',8,.8);log('Du stürzt durch den Boden – eine Ebene tiefer.','#ff9a6a')}
const TWN={twvault:o=>o.open?'Schatztruhe (leer)':o.locked?'Schatztruhe (verschlossen)':'Schatztruhe',twplaque:()=>'Inschrift',twlever:o=>'Hebel',twtrial:()=>G.map.sroom&&G.map.sroom.done?'Prüfstein (bestanden)':'Prüfstein · berühren, um die Prüfung zu beginnen',
  twaltar:o=>o.used?'Blutaltar (satt)':'Blutaltar',twcage:o=>o.open?'Leerer Käfig':'Gefangener · '+o.name,twlift:o=>(o.low?'Aufzug zum Leuchtfeuer':'Aufzug zur Treppe')+(twS().lift[G.floor]?'':o.low?' · Riegel lösen':' (verriegelt)'),twhole:()=>'Loch im Boden · hinabspringen'};
const _drawObjT=drawObj;drawObj=function(o){if(!TWN[o.type])return _drawObjT(o);const[sx,sy]=iso(o.x,o.y);if(sx<-120||sx>W+120||sy<-200||sy>H+80)return;const hov=G.state==='play'&&hoverObj()===o;twDraw(o,sx,sy);if(hov)label(sx,sy-58,TWN[o.type](o),'#ffd88a')};
function twDraw(o,sx,sy){const t=G.t;ctx.save();ctx.translate(Math.round(sx),Math.round(sy));
  if(o.type==='twvault'){shadow(0,0,.5);ctx.fillStyle='#4a2a10';ctx.fillRect(-16,-18,32,18);ctx.fillStyle='#6a3e18';ctx.fillRect(-16,-18,32,3);ctx.fillStyle='#c8a040';for(const x of[-16,-2,13])ctx.fillRect(x,-18,3,18);ctx.fillRect(-16,-10,32,2);
    if(o.open){ctx.fillStyle='#1a0e06';ctx.fillRect(-14,-22,28,5);ctx.fillStyle='#ffd870';ctx.fillRect(-10,-21,20,2)}else{ctx.fillStyle='#5a3214';ctx.beginPath();ctx.moveTo(-16,-18);ctx.quadraticCurveTo(0,-30,16,-18);ctx.fill();ctx.fillStyle='#c8a040';ctx.fillRect(-2,-27,4,9);
      ctx.fillStyle=o.locked?'#2a2622':'#ffe080';ctx.fillRect(-3,-15,6,6);if(!o.locked){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-14,0,0,-14,30);g.addColorStop(0,`rgba(255,210,100,${.35+Math.sin(t*3)*.12})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-30,-44,60,60)}}}
  else if(o.type==='twlever'){const G0=GEMS[o.gem];ctx.fillStyle='#2a2620';ctx.fillRect(-7,-6,14,6);ctx.fillStyle='#4a453c';ctx.fillRect(-7,-7,14,2);const a=o.on?.8:-.8;ctx.strokeStyle='#5a544a';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(Math.sin(a)*14,-6-Math.cos(a)*14);ctx.stroke();
    ctx.fillStyle=G0.c;ctx.beginPath();ctx.arc(Math.sin(a)*14,-6-Math.cos(a)*14,3.6,0,7);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${G0.l},${.25+Math.sin(t*2+o.gem)*.1})`;ctx.beginPath();ctx.arc(Math.sin(a)*14,-6-Math.cos(a)*14,8,0,7);ctx.fill()}
  else if(o.type==='twplaque'){shadow(0,0,.3);ctx.fillStyle='#3e3a34';ctx.fillRect(-9,-22,18,22);ctx.fillStyle='#5a544a';ctx.fillRect(-9,-22,18,2);ctx.fillStyle='#1a1610';for(let k=0;k<4;k++)ctx.fillRect(-6,-17+k*4,12-(k%2)*3,1.2);
    const S=G.map.sroom;if(S&&S.order)S.order.forEach((g,k)=>{ctx.fillStyle=GEMS[g].c;ctx.fillRect(-6+k*5,-4,3,2)})}
  else if(o.type==='twtrial'){const S=G.map.sroom,on=S&&S.on,dn=S&&S.done;shadow(0,0,.45);ctx.fillStyle='#1a1418';ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-7,-34);ctx.lineTo(0,-42);ctx.lineTo(7,-34);ctx.lineTo(10,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle=dn?'rgba(255,220,140,.6)':`rgba(255,${on?60:90},40,${.5+Math.sin(t*(on?8:2))*.3})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,-22,5,0,7);ctx.moveTo(0,-32);ctx.lineTo(0,-12);ctx.moveTo(-5,-22);ctx.lineTo(5,-22);ctx.stroke()}
  else if(o.type==='twaltar'){shadow(0,0,.55);ctx.fillStyle='#2a1a1a';ctx.fillRect(-18,-14,36,14);ctx.fillStyle='#4a2a28';ctx.fillRect(-20,-17,40,4);ctx.fillStyle='#6a1a14';ctx.fillRect(-12,-17,24,2);
    if(!o.used){ctx.fillStyle='#8a0a08';ctx.beginPath();ctx.ellipse(0,-17,7,2,0,0,7);ctx.fill();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-20,0,0,-20,26);g.addColorStop(0,`rgba(255,30,20,${.3+Math.sin(t*2.5)*.1})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-26,-46,52,52)}
    ctx.globalCompositeOperation='source-over';ctx.fillStyle='#d8d0bc';ctx.fillRect(-16,-22,6,5);ctx.fillStyle='#1a140c';ctx.fillRect(-15,-21,1.5,1.5);ctx.fillRect(-12.5,-21,1.5,1.5)}
  else if(o.type==='twcage'){shadow(0,0,.45);const op=o.open,ft=op?Math.min(1,(t-(o.ft||0))/2):0;
    if(!op||ft<1){ctx.globalAlpha=1-ft;const y=op?-ft*4:0;ctx.fillStyle='#6a5a48';ctx.fillRect(-4,-14+y,8,10);ctx.fillStyle='#d8b898';ctx.fillRect(-3,-20+y,6,6);ctx.fillStyle='#3a2a1a';ctx.fillRect(-3,-21+y,6,2);ctx.fillStyle='#1a140c';ctx.fillRect(-2,-18+y,1,1);ctx.fillRect(1,-18+y,1,1);
      ctx.fillStyle='#5a4a38';ctx.fillRect(-6,-5+y,12,4);if(!op){const b=Math.sin(t*1.5)>.6;ctx.fillStyle='#d8b898';ctx.fillRect(b?3:4,-12,2,b?-6:2)}ctx.globalAlpha=1}
    ctx.fillStyle='#1e1c1a';ctx.fillRect(-13,-2,26,3);ctx.fillRect(-13,-32,26,3);for(let x=-12;x<=12;x+=4.8){if(op&&x>4)continue;ctx.fillStyle='#34343a';ctx.fillRect(x-1,-30,2,28);ctx.fillStyle='#5a5a64';ctx.fillRect(x-1,-30,.8,28)}
    if(op){ctx.save();ctx.translate(13,-2);ctx.rotate(.9);ctx.fillStyle='#34343a';for(let x=0;x<=8;x+=4.8)ctx.fillRect(x,-28,2,28);ctx.restore()}ctx.strokeStyle='#2a2622';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(0,-60);ctx.stroke()}
  else if(o.type==='twlift'){const on=!!twS().lift[G.floor],q=[[0,-16],[30,-1],[0,14],[-30,-1]];ctx.fillStyle='#000';ctx.beginPath();q.forEach(([x,y],k)=>k?ctx.lineTo(x,y+2):ctx.moveTo(x,y+2));ctx.closePath();ctx.fill();
    ctx.fillStyle='#4a3420';ctx.beginPath();q.forEach(([x,y],k)=>k?ctx.lineTo(x*.82,y*.82):ctx.moveTo(x*.82,y*.82));ctx.closePath();ctx.fill();ctx.strokeStyle='#2a1a0c';ctx.lineWidth=1;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(-20+k*2,-8+k*5);ctx.lineTo(20+k*2,-2+k*5);ctx.stroke()}
    ctx.strokeStyle='#2a2826';ctx.lineWidth=2.4;for(const[x,y]of q){ctx.beginPath();ctx.moveTo(x*.8,y*.8);ctx.lineTo(x*.8,y*.8-62);ctx.stroke()}ctx.beginPath();q.forEach(([x,y],k)=>k?ctx.lineTo(x*.8,y*.8-62):ctx.moveTo(x*.8,y*.8-62));ctx.closePath();ctx.stroke();
    ctx.strokeStyle='#5a544a';ctx.lineWidth=1;const ph=on?(t*20)%6:0;ctx.setLineDash([3,3]);ctx.lineDashOffset=ph;ctx.beginPath();ctx.moveTo(0,-62);ctx.lineTo(0,-180);ctx.stroke();ctx.setLineDash([]);
    if(!on){ctx.fillStyle=o.low?'#c8a040':'#8a2a1a';ctx.fillRect(-4,-32,8,7);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-32,3,Math.PI,0);ctx.stroke()}}
  else if(o.type==='twhole'){}
  ctx.restore()}

// the ground pieces: trial ring, pressure plates, cracks and holes
const _drawDecalsT=drawDecals;drawDecals=function(){_drawDecalsT();const m=G.map;if(!m||m.kind!=='dungeon')return;const t=G.t,S=m.sroom;
  if(S&&S.k==='pruefung'&&!S.done){const[sx,sy]=iso(S.cx,S.cy),a=S.on?.6+Math.sin(t*6)*.25:.18;ctx.strokeStyle=`rgba(255,70,50,${a})`;ctx.lineWidth=S.on?3:1.5;ctx.setLineDash(S.on?[]:[8,8]);ctx.beginPath();ctx.ellipse(sx,sy,S.rad*45.25,S.rad*22.6,0,0,7);ctx.stroke();ctx.setLineDash([]);
    if(S.on)for(let k=0;k<16;k++){const q=k/16*6.283+t*.3,[x,y]=iso(S.cx+Math.cos(q)*S.rad,S.cy+Math.sin(q)*S.rad);ctx.fillStyle=`rgba(255,120,80,${.5+Math.sin(t*5+k)*.3})`;ctx.fillRect(x-1.5,y-6,3,6)}}
  for(const p of m.plates||[]){const[sx,sy]=iso(p.x,p.y);if(sx<-30||sx>W+30||sy<-30||sy>H+30)continue;const d=p.dn>0?2:0;ctx.fillStyle='#2a2620';ctx.beginPath();ctx.moveTo(sx,sy-10);ctx.lineTo(sx+20,sy);ctx.lineTo(sx,sy+10);ctx.lineTo(sx-20,sy);ctx.closePath();ctx.fill();
    ctx.fillStyle=d?'#3e3a34':'#5a564c';ctx.beginPath();ctx.moveTo(sx,sy-8+d);ctx.lineTo(sx+16,sy+d);ctx.lineTo(sx,sy+8+d);ctx.lineTo(sx-16,sy+d);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(sx-1,sy-2+d,2,4)}
  for(const c of m.cracks||[]){const[sx,sy]=iso(c.x,c.y);if(sx<-50||sx>W+50||sy<-40||sy>H+40)continue;const Rr=mulberry(c.seed),sh=c.st===1?rnd(-1.2,1.2):0;
    if(c.st===2){ctx.fillStyle='#000';ctx.beginPath();for(let k=0;k<12;k++){const a=k/12*6.283,r=.8+Rr()*.35;ctx.lineTo(sx+Math.cos(a)*32*r,sy+Math.sin(a)*16*r)}ctx.closePath();ctx.fill();ctx.strokeStyle='#3a342c';ctx.lineWidth=2;ctx.stroke();continue}
    ctx.strokeStyle='#0a0806';ctx.lineWidth=1.6;const n=c.st===1?9:6,grow=c.st===1?1+c.t:1;for(let k=0;k<n;k++){const a=Rr()*6.28;let x=sx+sh,y=sy;ctx.beginPath();ctx.moveTo(x,y);for(let s=0;s<3;s++){x+=Math.cos(a+(Rr()-.5))*9*grow;y+=Math.sin(a+(Rr()-.5))*4.5*grow;ctx.lineTo(x,y)}ctx.stroke()}
    ctx.fillStyle='rgba(30,26,20,.5)';ctx.beginPath();ctx.ellipse(sx+sh,sy,10,5,0,0,7);ctx.fill()}};

// ticking: the trial's waves, plates, cracks, the altar's blessing
const _updTrapsT=updTraps;updTraps=function(dt){_updTrapsT(dt);if(!P)return;if(P.blessT>0){P.blessT-=dt;if(Math.random()<dt*6)fxp({k:'mote',x:P.x+rnd(-.4,.4),y:P.y+rnd(-.4,.4),z:rnd(.2,1.4),vx:0,vy:0,vz:.6,life:.8,col:pick(['#ff4a3a','#c81a10']),s:1.4,g:-.3});if(P.blessT<=0)log('Der Segen des Blutes verblasst.','#c8b898')}
  const m=G.map;if(!m||m.kind!=='dungeon'||G.state!=='play')return;const S=m.sroom;
  for(const e of m.enemies)if(e.obj&&!e.dead&&e.fuse!=null){e.fuse-=dt;if(e.fuse<=0)twBlast(e)}
  if(S&&S.on){if(P.dead){S.on=false;S.wave=0;m.enemies=m.enemies.filter(e=>!e.trial);}else{const d=hyp(P.x-S.cx,P.y-S.cy);if(d>S.rad-.3){const k=(S.rad-.3)/d;P.x=S.cx+(P.x-S.cx)*k;P.y=S.cy+(P.y-S.cy)*k;P.path=[]}
    if(!S.pack.some(e=>!e.dead)){S.next-=dt;if(S.next<=0){if(S.wave>=3){S.on=false;S.done=true;twS().done[S.id]=1;const[x,y]=nearWalk(S.cx+1,S.cy+1);const v={type:'twvault',x,y,open:false,locked:false};m.objs.push(v);gainXp(P.lvl*40);banner('PRÜFUNG BESTANDEN','Eine Truhe erscheint','',2600);sfx('lvl');save()}else twWave(m,S)}}}}
  for(const p of m.plates||[]){if(Math.abs(p.x-P.x)>14||Math.abs(p.y-P.y)>14)continue;p.cd-=dt;p.dn=Math.max(0,p.dn-dt);const on=(!P.dead&&hyp(P.x-p.x,P.y-p.y)<.45)||m.enemies.some(e=>!e.dead&&!e.wall&&hyp(e.x-p.x,e.y-p.y)<.4);if(on)p.dn=.4;
    if(on&&p.cd<=0){p.cd=2.6;sample('hit',.35,{rate:2})||sfx('pick');const tl={shape:'line',x:p.sx,y:p.sy,ang:p.ang,len:p.len,w:.7,t:0,dur:.4,dmg:trapDmg()*1.3,owner:null};
      tl.onDone=()=>{trapHitFoes(tl);for(let k=0;k<3;k++)fxp({k:'spark',x:p.sx,y:p.sy,z:.8+k*.15,vx:Math.cos(p.ang)*22,vy:Math.sin(p.ang)*22,vz:0,life:p.len/22,col:'#d8d0bc',s:2.2,g:0})};G.tele.push(tl)}}
  for(const c of m.cracks||[]){if(Math.abs(c.x-P.x)>10||Math.abs(c.y-P.y)>10)continue;const on=!P.dead&&hyp(P.x-c.x,P.y-c.y)<.75;
    if(c.st===0&&on){c.st=1;c.t=0;sample('thunder',.25,{rate:1.8})||syn('quake');log('Der Boden knackt unter dir!','#ff9a6a')}
    else if(c.st===1){c.t+=dt;G.shake=Math.max(G.shake||0,1.5);if(Math.random()<dt*20)smoke(c.x+rnd(-.4,.4),c.y+rnd(-.4,.4),1,'rgba(110,100,86,',4,.3);
      if(c.t>=.8){c.st=2;const i=Math.floor(c.x),j=Math.floor(c.y);m.t[j*m.w+i]=0;const[x,y]=nearWalk(c.x+.9,c.y+.9);m.objs.push({type:'twhole',x,y});G.flowT=0;computeFlow();if(on)return twFall();log('Der Boden bricht ein. Durch das Loch geht es eine Ebene tiefer.','#c8b898')}}}};
function twWave(m,S){S.wave++;S.next=1.5;const VP=varPool(Math.max(1,G.floor)),mix=[wpick(VP),wpick(VP)],n=3+S.wave*2+Math.min(3,G.floor>>2);S.pack=[];
  for(let k=0;k<n;k++){const a=k/n*6.283+Math.random(),[x,y]=nearWalk(S.cx+Math.cos(a)*(S.rad-1.2),S.cy+Math.sin(a)*(S.rad-1.2));const e=makeEnemy(pick(mix),x,y,S.wave===3&&k===0?'unique':'normal');e.aggro=true;e.trial=1;S.pack.push(e);m.enemies.push(e);
    smoke(x,y,8,'rgba(120,30,20,',6,.8);flash(x,y,.6,30,'255,70,50',.3)}banner('WELLE '+S.wave+' VON 3','','boss',1600);sample('portal',.5,{rate:.8})}
