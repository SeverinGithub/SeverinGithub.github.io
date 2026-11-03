/* ---------- quest chronicle: one long timeline, always exactly one quest active ---------- */
const QACT=['Akt I · Der Hügel','Akt II · Die Himmelsinseln','Akt III · Feuer und Nebel','Akt IV · Die Tiefe','Akt V · Der schwarze Himmel'];
const FAMN={skel:'Skelette',archer:'Knochenschützen',ghoul:'Ghule',spider:'Spinnen',cult:'Kultisten',wraith:'Klageseelen',golem:'Kolosse',scorp:'Skorpione'};
const FAMK={skel:['ruins','grave','village'],archer:['ruins','grave'],ghoul:['grave','forest'],spider:['forest'],scorp:['forest'],cult:['grave','village'],wraith:['ruins','grave'],golem:['ruins']};
const KINDN={village:'brennendes Dorf',ruins:'Ruinen',grave:'Gräberinsel',camp:'Lager',forest:'Waldinsel',wild:'wilde Insel',rock:'Felsinsel',boss:'Bossinsel'};
const QK=(a,fam,n,t,d)=>({a,ty:'kill',fam,n,t,d}),QF=(a,f,t,d)=>({a,ty:'floor',f,t,d}),QD=(a,f,t,d)=>({a,ty:'dboss',f,t,d,boss:1}),QW=(a,wb,t,d)=>({a,ty:'wboss',wb,t,d,boss:1}),
  QV=(a,kind,n,t,d)=>({a,ty:'visit',kind,n,t,d}),QX=(a,n,t,d)=>({a,ty:'explore',n,t,d}),QL=(a,n,t,d)=>({a,ty:'fires',n,t,d}),QC=(a,ty,n,t,d)=>({a,ty,n,t,d});
const QUESTS=[
 QK(0,null,5,'Erstes Blut','Besiege 5 Gegner. Im Turm und auf den Inseln hinter den Brücken findest du genug davon.'),
 QF(0,1,'Der Turm ruft','Betritt den Schwarzen Turm durch das Tor auf dem Hügel.'),
 QK(0,'skel',10,'Knochenbrecher','Besiege 10 Skelette.'),
 QF(0,2,'Tiefer hinab','Erreiche Ebene 2 des Schwarzen Turms.'),
 QC(0,'buy',1,'Handel mit Odalinde','Kauf dir etwas bei einem Händler. Odalinde wartet neben dem Turm.'),
 QC(0,'chest',2,'Truhenjäger','Öffne 2 Truhen.'),
 QD(0,3,'Der Hügeltyrann','Steig hinab bis Ebene 3 und besiege Morgrath, den Hügeltyrann.'),
 QX(1,3,'Über die Brücken','Verlass den Hügel und erkunde 3 Himmelsinseln.'),
 QV(1,'village',1,'Brennende Dörfer','Finde ein brennendes Dorf auf den Inseln.'),
 QL(1,1,'Ein Feuer im Dunkeln','Entzünde ein Leuchtfeuer auf den Himmelsinseln. Lager haben immer eins.'),
 QK(1,'spider',15,'Spinnenplage','Besiege 15 Spinnen. Sie hausen in den Wäldern.'),
 QC(1,'buy',3,'Wanderhändler','Kauf 3 Dinge bei Händlern. In den Lagern ziehen Händler umher.'),
 QC(1,'socket',1,'Gemeißelte Worte','Setze eine Rune in einen Gegenstand mit Sockel. Runen fallen von Gegnern, Odalinde schlägt Sockel und verkauft Runenbeutel.'),
 QC(1,'talent',3,'Erste Talente','Lerne 3 Knoten im Talentbaum (P).'),
 QW(1,0,'Rußklaue','Rußklaue plündert die Dörfer nahe dem Hügel. Finde sein Revier und besiege ihn.'),
 QV(1,'grave',1,'Die Gräberinseln','Betritt eine Gräberinsel.'),
 QK(1,'ghoul',15,'Ghulfeuer','Besiege 15 Ghule.'),
 QV(1,'ruins',2,'Ruinen der Alten','Erkunde 2 Ruineninseln.'),
 QD(1,6,'Die Ascheweberin','Besiege die Ascheweberin auf Ebene 6.'),
 QX(2,12,'Kartograph','Erkunde 12 Himmelsinseln. Deine Karte (M) zeigt, was du schon gesehen hast.'),
 QL(2,4,'Feuerkette','Entzünde 4 Leuchtfeuer, damit du schnell reisen kannst.'),
 QW(2,1,'Die Nebelweberin','Im Nebel weit draußen spinnt die Nebelweberin ihre Fäden. Besiege sie.'),
 QK(2,'archer',20,'Pfeilregen','Besiege 20 Knochenschützen.'),
 QC(2,'runeword',1,'Das erste Wort','Schmiede ein Runenwort: die richtigen Runen in der richtigen Reihenfolge in einem gewöhnlichen Gegenstand. Die Rezepte stehen in der Sammlung (J).'),
 QF(2,8,'Die Mitte des Turms','Erreiche Ebene 8.'),
 QC(2,'lvl',15,'Erfahren','Erreiche Stufe 15.'),
 QK(2,'scorp',20,'Sandstacheln','Besiege 20 Skorpione.'),
 QW(2,2,'Moosfaust','Der Grabwächter Moosfaust duldet niemanden auf seiner Insel. Besiege ihn.'),
 QD(2,9,'Graukeil','Besiege Graukeil, den Wächter der Tiefe, auf Ebene 9.'),
 QC(3,'chest',15,'Schatzsucher','Öffne 15 Truhen.'),
 QX(3,25,'Weit gereist','Erkunde 25 Himmelsinseln.'),
 QC(3,'sell',10,'Trödler','Verkaufe 10 Gegenstände.'),
 QK(3,'cult',25,'Ende des Kults','Besiege 25 Kultisten.'),
 QW(3,3,'Kaltherz','An der Frostfurt wartet Kaltherz. Besiege ihn.'),
 QD(3,12,'Morgraths Rückkehr','Morgrath ist zurück, stärker als zuvor. Besiege ihn auf Ebene 12.'),
 QC(3,'unique',3,'Legenden','Finde 3 einzigartige Gegenstände.'),
 QC(3,'talent',15,'Meister der Talente','Lerne 15 Knoten im Talentbaum.'),
 QW(3,4,'Die Brutkönigin','Die Brutkönigin brütet weit draußen neue Spinnen aus. Besiege sie.'),
 QK(4,'wraith',30,'Seelenruhe','Besiege 30 Klageseelen.'),
 QL(4,8,'Leuchtfeuer der Welt','Entzünde 8 Leuchtfeuer.'),
 QD(4,15,'Die zweite Weberin','Besiege die Ascheweberin auf Ebene 15.'),
 QW(4,5,'Glutkoloss Vharn','Vharn glüht am Rand der Welt. Besiege den Glutkoloss.'),
 QK(4,'golem',25,'Steinbrecher','Besiege 25 Kolosse.'),
 QC(4,'lvl',30,'Held der Inseln','Erreiche Stufe 30.'),
 QD(4,18,'Graukeil erwacht','Besiege Graukeil auf Ebene 18.'),
 QW(4,6,'Der Schattenkönig','Der Schattenkönig herrscht über die fernen Inseln. Besiege ihn.'),
 QX(4,60,'Die ganze Welt','Erkunde 60 Himmelsinseln.'),
 QF(4,21,'Ebene 21','Steig bis Ebene 21 hinab.'),
 QC(4,'arena',10,'Der Wächter der Statue','Seit du Ebene 20 erreicht hast, ist die Statue in der Arena wach. Schlag sie und besiege 10 Gegner, die sie herbeiruft.'),
 QW(4,7,'Aschemutter, die Letzte','Am äußersten Rand wartet die Aschemutter, Ursprung aller Asche. Beende es.')];
QUESTS.forEach((q,i)=>{q.i=i;q.glut=Math.round(40+i*38);q.tp=i===QUESTS.length-1||QUESTS[i+1].a!==q.a?1:0});
const qCnt=k=>(P.qc&&P.qc[k])||0;
function qInc(k,n=1){P.qc=P.qc||{};P.qc[k]=(P.qc[k]||0)+n}
const qKey=q=>q.ty==='kill'?(q.fam?'k_'+q.fam:'kill'):['buy','sell','chest','arena'].includes(q.ty)?q.ty:null;
const seenKind=k=>{let n=0;for(const c of G.owSeen){const[a,b]=c.split(',').map(Number),I=islandOf(a,b);if(I&&(!k||I.kind===k)&&I.kind!=='home')n++}return n};
function qProg(q){const base=qKey(q)?qCnt(qKey(q))-(P.qb||0):0;
  switch(q.ty){case'kill':case'buy':case'sell':case'chest':case'arena':return[base,q.n];case'floor':return[Math.min(G.maxFloor,q.f),q.f];case'dboss':return[G.bossDead[q.f]?1:0,1];
    case'wboss':return[G.owBoss[WB[q.wb].id]?1:0,1];case'visit':return[seenKind(q.kind),q.n];case'explore':return[seenKind(null),q.n];case'fires':return[Object.keys(G.owFires).length,q.n];
    case'lvl':return[P.lvl,q.n];
    // runes already set and words already forged count too, so nothing done before the quest is lost
    case'socket':return[Math.max(qCnt('socket'),[...Object.values(P.eq),...P.inv,...(P.stash||[])].reduce((a,it)=>a+(it&&it.runes?it.runes.length:0),0)),q.n];
    case'runeword':return[Math.max(qCnt('runeword'),Object.keys(P.found||{}).filter(k=>k.startsWith('rw:')).length),q.n];case'talent':return[(P.tree||[]).length,q.n];case'unique':return[UNIQ.filter(u=>(P.found||{})['u:'+u.n]).length,q.n]}return[0,1]}
const curQ=()=>QUESTS[P.qi||0];
function qStart(){const q=curQ();P.qb=q&&qKey(q)?qCnt(qKey(q)):0;G.qtc=null}
function nearIsland(test,skipSeen){const m=G.map,cx=Math.floor(P.x/CH),cy=Math.floor(P.y/CH);let best=null,bd=1e9;
  for(let r=0;r<=14;r++){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const I=islandOf(cx+dx,cy+dy);if(!I||!test(I)||(skipSeen&&G.owSeen.has(I.cx+','+I.cy)))continue;const d=hyp(I.x-P.x,I.y-P.y);if(d<bd){bd=d;best=I}}if(best&&r>=2)break}return best}
// where the current quest wants you to go, as a point on the island world
function qTarget(q){const m=G.map;if(!q||!m||!m.world)return null;const cx=Math.floor(P.x/CH),cy=Math.floor(P.y/CH),ck=(P.qi||0)+':'+cx+','+cy;if(G.qtc&&G.qtc.k===ck)return G.qtc.t;let t=null;
  const isl=(I,l)=>I?{x:I.x,y:I.y,l}:null,door=m.home.objs.find(o=>o.type==='door');
  if(q.ty==='floor'||q.ty==='dboss')t={x:door.x,y:door.y,l:'Tor des Schwarzen Turms'};
  else if(q.ty==='wboss'){const b=WB[q.wb];if(!G.owBoss[b.id])t={...wbPos(b),l:'Revier von '+b.short.replace(/^(der|dem) /,'')}}
  else if(q.ty==='visit')t=isl(nearIsland(I=>I.kind===q.kind,true)||nearIsland(I=>I.kind===q.kind),KINDN[q.kind]);
  else if(q.ty==='explore')t=isl(nearIsland(I=>I.kind!=='home',true),'unerkundete Insel');
  else if(q.ty==='fires')t=isl(nearIsland(I=>I.kind==='camp'&&!G.owFires[I.cx+','+I.cy]),'Lager mit Leuchtfeuer');
  else if(q.ty==='buy'){const od=m.home.objs.find(o=>o.type==='merchant'),I=nearIsland(I=>I.kind==='camp');t=I&&hyp(I.x-P.x,I.y-P.y)<hyp(od.x-P.x,od.y-P.y)?isl(I,'Lager mit Händler'):{x:od.x,y:od.y,l:'Odalinde'}}
  else if(q.ty==='chest')t=isl(nearIsland(I=>I.kind==='village'||I.kind==='rock'),'Dorf mit Truhen');
  else if(q.ty==='arena'){const c=m.home.objs.find(o=>o.type==='colossus');t={x:c.x,y:c.y,l:'Statue in der Arena'}}
  else if(q.ty==='kill'&&q.fam)t=isl(nearIsland(I=>FAMK[q.fam].includes(I.kind)),KINDN[nearIsland(I=>FAMK[q.fam].includes(I.kind))?.kind]||'Insel');
  G.qtc={k:ck,t};return t}
function qDone(q){P.glut+=q.glut;const x=Math.round(xpNext(P.lvl)*.12);gainXp(x);if(q.tp){P.tbonus=(P.tbonus||0)+1}
  banner('QUEST ERFÜLLT',q.t,'boss',2600);sfx('lvl');log(`Quest erfüllt: ${q.t} · +${q.glut} Glut · +${x} Erfahrung${q.tp?' · +1 Talentpunkt':''}`,'#e8c878');
  P.qi=(P.qi||0)+1;qStart();const n=curQ();if(n){log('Neue Quest: '+n.t,'#ffd88a');if(n.a!==q.a)setTimeout(()=>banner(QACT[n.a].toUpperCase(),n.t,'boss',3000),2700)}save()}
let qHtml='';
function questTick(dt){if(!P)return;G.qT=(G.qT||0)-dt;if(G.qT>0)return;G.qT=.3;const q=curQ();
  if(q){const[c,n]=qProg(q);if(c>=n){qDone(q);G.qT=2.8}}
  const q2=curQ();let h='';if(!q2)h='<div class="qtt">◆ Die Chronik ist vollendet</div>';
  else{const q=q2,[c,n]=qProg(q),t=qTarget(q);G.qtgt=t;h=`<div class="qtt">◆ ${q.t}${n>1?` <span>${Math.min(c,n)} / ${n}</span>`:''}</div>`;
    if(t){const dx=t.x-P.x,dy=t.y-P.y,d=Math.round(hyp(dx,dy)),ang=Math.atan2((dx+dy)/2,dx-dy);h+=d<6?`<div class="qtd">◎ ${t.l} · hier</div>`:`<div class="qtd"><span class="qarr" style="transform:rotate(${ang.toFixed(2)}rad)">➤</span> ${t.l} · ${d} Schritte</div>`}
    else if(!G.map.world&&(q.ty==='floor'||q.ty==='dboss'))h+=`<div class="qtd">${G.floor<q.f?'Steig weiter hinab · Ebene '+G.floor+' von '+q.f:G.floor===q.f?'Der Hüter wartet auf dieser Ebene':'Der Hüter haust auf Ebene '+q.f}</div>`;
    else if(!G.map.world&&q.ty==='wboss')h+='<div class="qtd">Kehre über ein Leuchtfeuer zu den Himmelsinseln zurück</div>'}
  if(h!==qHtml){qHtml=h;$('qtrack').innerHTML=h}}
const OVL=new Set(['tree','map','quests']);
function ovClose(){for(const id of['pTree','pMap','pQuest'])$(id).hidden=true;hideTip();if(OVL.has(G.state)){G.state='play';buildBelt()}}
function toggleQuests(){if(G.state==='quests'){ovClose();return}ovClose();closeAll();G.state='quests';G.stepS=stopLoop(G.stepS);$('pQuest').hidden=false;buildQuests();const c=$('pQuest').querySelector('.qn.cur');if(c)c.scrollIntoView({block:'center'})}
function buildQuests(){const cur=P.qi||0;let h='',act=-1;
  QUESTS.forEach((q,i)=>{if(q.a!==act){act=q.a;h+=`<div class="qact"><span>${QACT[act]}</span></div>`}
    const st=i<cur?'done':i===cur?'cur':'fut';let body=`<div class="qt">${q.boss?'☠ ':''}${q.t}</div><div class="qd">${q.d}</div>`;
    if(st==='cur'){const[c,n]=qProg(q),t=qTarget(q);body+=`<div class="qbar"><i style="width:${Math.min(100,c/n*100)}%"></i><b>${Math.min(c,n)} / ${n}</b></div>`+(t?`<div class="qgo">Ziel: ${t.l} · ${Math.round(hyp(t.x-P.x,t.y-P.y))} Schritte · auf der Karte (M) markiert</div>`:'')}
    body+=`<div class="qr">${st==='done'?'Erfüllt · ':'Belohnung: '}${q.glut} Glut${q.tp?' · +1 Talentpunkt':''}</div>`;
    h+=`<div class="qn ${st}${q.boss?' boss':''} ${i%2?'r':'l'}"><div class="qdot">${st==='done'?'✓':st==='cur'?'◆':i+1}</div><div class="qcard">${body}</div></div>`});
  if(cur>=QUESTS.length)h+='<div class="qact"><span>Die Chronik ist vollendet. Der Turm aber reicht tiefer.</span></div>';
  $('pQuest').innerHTML=`<div class="thead"><h2>Chronik</h2><span class="tpts"><b>${Math.min(cur,QUESTS.length)}</b> von ${QUESTS.length} Quests erfüllt</span><span class="thint">Immer eine Quest ist aktiv. Oben links siehst du, wohin es geht.</span><button data-ovclose>Schließen (L)</button></div><div class="qscroll"><div class="qline">${h}</div></div>`}

