/* ---------- the dead lands in play: their people, their lord, his horse, and the chronicle that leads you there ---------- */
// id, base, name, hp, dmg, speed, scale, element, projectile, gear
const RGV=[
 ['rg_bauer','skel','Knochenbauer',1.1,1,1,1,null,null,{bone:'pale',hat:'straw',body:'rags',bodyC:'tunic',wep:'pitchfork',reach:1.5}],
 ['rg_sense','skel','Sensenknecht',1.2,1.25,.95,1,null,null,{bone:'bone',hat:'hood',hatC:'ash',body:'rags',bodyC:'ash',wep:'scythe',reach:1.4}],
 ['rg_dresch','skel','Dreschgebein',1.3,1.2,1,1.02,null,null,{bone:'darkbone',hat:'cap',hatC:'tunic',body:'tunic',bodyC:'tunic',wep:'flail'}],
 ['rg_metzger','skel','Metzgergebein',1.5,1.3,.95,1.08,null,null,{bone:'bone',body:'apron',bodyC:'ash',wep:'cleaver'}],
 ['rg_buerger','skel','Schwarzer Bürger',1.3,1.15,1.05,1,null,null,{bone:'black',hat:'cap',hatC:'red',body:'tunic',bodyC:'blue',cape:'robe',wep:'club',eye:'#ff6a3a'}],
 ['rg_bleich','skel','Bleicher Bürger',1.1,1.1,1.15,.98,null,null,{bone:'pale',body:'tunic',bodyC:'red',wep:'dagger',eye:'#8ad0ff'}],
 ['rg_wache','skel','Stadtwache',1.8,1.4,1,1.05,null,null,{bone:'bone',hat:'kettle',hatC:'iron',body:'gambeson',bodyC:'red',wep:'halberd',reach:1.6}],
 ['rg_armbrust','archer','Armbrustwache',1.5,1.6,.9,1.02,null,null,{bone:'bone',hat:'kettle',hatC:'iron',body:'gambeson',bodyC:'blue',wep:'crossbow'}],
 ['rg_jaeger','archer','Knochenjäger',1.3,1.3,1.05,1,null,null,{bone:'darkbone',hat:'hood',hatC:'green',body:'tunic',bodyC:'green',wep:'longbow'}],
 ['rg_ritter','skel','Ritterskelett',2.6,1.6,.95,1.12,null,null,{bone:'bone',hat:'great',hatC:'iron',body:'plate',armor:'iron',bodyC:'red',wep:'sword',shield:'kite',shC:'red'}],
 ['rg_ross','skel','Knochenross',2,1.4,1.75,1.25,null,null,{horse:1,hbone:'pale',eye:'#6ad0ff'}],
 ['rg_reiter','skel','Knochenreiter',3,1.8,1.6,1.3,null,null,{horse:1,rider:1,hbone:'bone',bard:'black',bone:'darkbone',hat:'barbute',hatC:'iron',body:'plate',armor:'iron',bodyC:'red',wep:'lance',reach:1.8}],
 ['rg_riese','skel','Riesenritterskelett',5,2.2,.85,1.85,null,null,{bone:'ash',hat:'great',hatC:'black',body:'plate',armor:'black',bodyC:'black',wep:'great',reach:1.6,eye:'#ff5a2a'}],
 ['rg_koenig','skel','Königlicher Ritter',3.4,2,1,1.2,null,null,{bone:'bone',hat:'crown',hatC:'black',plume:'red',body:'royal',armor:'black',bodyC:'red',cape:'red',wep:'mace',shield:'kite',shC:'royal'}],
 ['rg_armritter','archer','Armbrustritter',2.4,2,.9,1.1,null,null,{bone:'bone',hat:'great',hatC:'iron',body:'plate',armor:'iron',bodyC:'blue',wep:'crossbow'}],
 ['rg_templer','skel','Schwarzer Templer',3.2,2.1,.95,1.15,null,null,{bone:'darkbone',hat:'great',hatC:'black',body:'plate',armor:'black',bodyC:'ash',cape:'black',wep:'hammer'}],
 ['rg_hellebard','skel','Königshellebardier',2.8,1.9,.95,1.12,null,null,{bone:'bone',hat:'barbute',hatC:'gold',body:'royal',armor:'royal',bodyC:'red',wep:'halberd',reach:1.7}],
 ['rg_hexe','cult','Waldhexe',2.2,1.8,1.1,1,'poison','poison',null,{robe:'robeG'}],
 ['rg_knecht','skel','Dornenknecht',2.2,1.7,1.15,1.05,'poison',null,{bone:'char',hat:'hood',hatC:'blood',body:'rags',bodyC:'blood',wep:'sickle'}],
 ['rg_waldjaeger','archer','Waldschütze',2,1.8,1.05,1,'poison','poison',{bone:'darkbone',hat:'hood',hatC:'blood',body:'tunic',bodyC:'black',wep:'longbow'}]];
for(const[id,base,n,hp,dmg,spd,scale,elem,proj,gear,pal]of RGV)VAR[id]={id,base,n,pal:pal||{},hp,dmg,spd,scale,elem,proj,minF:999,w:0,gear};
const _makeEnemyRG=makeEnemy;makeEnemy=function(vid,x,y,rank){const e=_makeEnemyRG(vid,x,y,rank),v=VAR[vid];if(v&&v.gear){e.gear=v.gear;if(v.gear.reach)e.d={...e.d,range:v.gear.reach}}return e};
function makeRgBoss(x,y){const ml=G.mlvl,hs=1+(ml-1)*.32,ds=1+(ml-1)*.2;
  const e={type:'boss',d:{kind:'boss',range:2.6,look:'rgk',moves:['charge','sweep','slam','charge','summon']},look:'rgk',x,y,r:1,rank:'boss',name:'Ser Haldor, der Riesenritter',sub:'Herr des Riesenklosters · Stufe '+ml,
    hp:620*hs*1.7,dmg:[14*ds,23*ds],spd:2.7,cd:1.6,aggro:false,face:Math.PI,anim:0,flash:0,slow:0,xp:480*(1+(ml-1)*.35)*1.6,aff:[],charge:0,scale:2.5,dmgTaken:1,boss:true,wb:'rgk',rgk:1,rgz:'church',bsub:'Herr des Riesenklosters',sumP:['rg_ross','rg_ritter','rg_koenig'],
    gear:{horse:1,rider:1,hbone:'pale',bard:'royal',eye:'#ff3a1a',bone:'black',hat:'crown',hatC:'black',plume:'red',body:'plate',armor:'black',bodyC:'red',cape:'red',wep:'great'}};e.max=e.hp;return e}

// Gram, the bone horse: a mount for a slot that did not exist before
ISZ['Knochenross']=[2,2];
PXS['Knochenross']=[()=>{const m={'.':-1,d:0,m:1,l:2,h:3,k:16,e:18,E:19},rows=['................','....kk..........','...klhk.........','...klhhkk.......','..klhhhhhkk.....','..klhEkhhhhkk...','..kllkkllhhhhk..','..kmlllllllllhk.','...kmmllkkmllhk.','...kdmmk..kmmk..','...kdmk....kk...','..kdmmk.........','..kdmk..........','.kdmmk..........','.kdmk...........','..kk............'];
  return pfill((x,y)=>m[rows[y][x]])},'bone','dark','dark','ember'];
function makeMount(){return{id:UID++,slot:'mount',b:'Knochenross',cls:'mount',rar:'unique',name:'Gram, das Knochenross',ilvl:G.mlvl||60,mods:{},req:{lvl:1,str:0,dex:0},mount:1}}
const ownsMount=()=>P.eq.mount||P.inv.some(i=>i.slot==='mount')||(P.stash||[]).some(i=>i&&i.slot==='mount')||G.hand&&G.hand.slot==='mount';
const riding=()=>!!(P&&P.ride&&P.eq&&P.eq.mount&&!P.dead);
const _itemTipRG=itemTipHTML;itemTipHTML=function(it,c){if(!it||it.slot!=='mount')return _itemTipRG(it,c);
  return`<div><img class="px" src="${pxURL(it.b)}" width="64" height="64" alt=""></div><div class="nm c-unique">${it.name}</div><div class="base">Reittier · aus dem Riesenkloster</div>
  <div class="mod">+100% Lauftempo</div><div class="mod">+40% Verteidigung</div><div class="mod">15% weniger Schaden, das Ross fängt ihn ab</div><div class="mod">60% weniger Giftschaden</div><div class="mod">Kälte verlangsamt dich nicht</div>
  <div class="cmp">„Er hat seinem Herrn bis in den Tod gedient. Jetzt dient er dir.“</div><div class="act">${c==='equipped'?'Im Reittier-Platz · Taste H: auf- und absitzen':'In den Reittier-Platz legen, dann mit H aufsitzen'}</div>`};
const _sellItemRG=sellItem;sellItem=function(it){if(it&&it.slot==='mount'){log('Gram lässt sich nicht verkaufen. Er würde ohnehin zurückkommen.','#a39b88');return}return _sellItemRG(it)};
const _buildInvRG=buildInv;buildInv=function(){if(P.mountSlot&&!EQLAYOUT.some(e=>e[0]==='mount'))EQLAYOUT.push(['mount','Reittier',7,3,2,2]);_buildInvRG();
  if(P.mountSlot){const eq=$('equip');if(eq){const d=document.createElement('div');d.className='ridebar';d.innerHTML=`<button data-ride ${P.eq.mount?'':'disabled'}>${riding()?'Absitzen':'Aufsitzen'} <small>H</small></button>`;eq.after(d)}}};
function toggleRide(){if(!P||P.dead)return;if(!P.eq.mount){log(P.mountSlot?'Kein Reittier im Reittier-Platz.':'Du hast kein Reittier.','#a39b88');return}
  P.ride=!P.ride;if(P.ride){P.rodeOnce=1;const H=G.rgHS||(G.rgHS=rgHS());H.rear=1;H.landed=0;H.tf=scrDir(P.face)[0]>=0?1:-1;rgNeigh()}else rgSnort(.05);recalc();updatePanels();sfx('pick');ftext(P.x,P.y,P.ride?'Aufgesessen':'Abgesessen','#e8dcc0');smoke(P.x,P.y,6,'rgba(200,190,170,',6,.4)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ride]');if(b){toggleRide();e.stopPropagation()}},true);
addEventListener('keydown',e=>{if(e.repeat||G.state!=='play'||!P)return;if(e.key.toLowerCase()==='h')toggleRide()});
const _recalcRG=recalc;recalc=function(){_recalcRG();if(P&&P.ride&&!P.eq.mount)P.ride=false;if(riding()){const d=P.d;d.frw+=100;d.def=Math.round(d.def*1.4+30);d.mounted=1}};
const _hurtRG=hurtPlayer;hurtPlayer=function(dmg,elem,src){if(riding())dmg*=elem==='poison'?.4:.85;return _hurtRG(dmg,elem,src)};
const _drawPlayerRG=drawPlayer;drawPlayer=function(){if(!riding())return _drawPlayerRG();const[sx,sy]=iso(P.x,P.y),[fx]=scrDir(P.face),f=fx>=0?1:-1,H=G.rgHS||(G.rgHS=rgHS());
  // the hooves landing after the rear-up
  if(H.rear>0&&H.rear<.2&&!H.landed){H.landed=1;G.shake=Math.max(G.shake||0,3);smoke(P.x,P.y,10,'rgba(150,138,118,',5,.35);rgClop(.07,.9);setTimeout(()=>rgClop(.06,1.05),70)}
  shadow(sx,sy,.85);ctx.save();ctx.translate(sx,sy);ctx.scale(1.32,1.32);const sd=rgHorse({F:r=>r,f,late:1,step:(i,fo,ne)=>rgHoofFx(P,H,fo,ne,.05)},{hbone:'pale',bard:'royal',rider:1,eye:'#ff7a2a'},P,H,1);ctx.restore();
  // the rider sits the stride: rises and rocks with the saddle, legs still
  const sh=shadow,mv=P.moving;shadow=()=>{};P.moving=false;ctx.save();ctx.translate(sx+sd.x*1.32,sy+sd.y*1.32+23);ctx.rotate(sd.a*.55+(H.v>.3?.06*f*H.v:0));ctx.translate(-sx,-sy);try{_drawPlayerRG()}finally{ctx.restore();shadow=sh;P.moving=mv}
  if(H.late){ctx.save();ctx.translate(sx,sy);ctx.scale(1.32,1.32);H.late();ctx.restore()}};

// the city, the cloister, the forest, the castle: what Eldrik's map leads you through
QACT.push('Akt VI · Die Totenstadt');
const RGQ=[
 {rg:'map',t:'Die Karte des Chronisten',d:'Sprich mit Eldrik am Turm. Er hat in der Chronik etwas gefunden, das weiter reicht als die Aschemutter.'},
 {rg:'zone',z:'city',t:'Die stille Stadt',d:'Folge Eldriks Karte über das Totentor bis zur Stadt am Westrand der Welt.'},
 {rg:'kill',fam:'rg_city',n:60,t:'Bürger aus Knochen',d:'Die ganze Stadt ist auf den Beinen, und keiner von ihnen lebt. Besiege 60 Skelette in der Stadt.'},
 {rg:'zone',z:'clo',t:'Das Riesenkloster',d:'Hinter dem Osttor der Stadt führt der Pilgerweg zum Kloster. Betritt seinen Vorhof.'},
 {rg:'kill',fam:'rg_clo',n:40,t:'Die Ritter des Klosters',d:'Besiege 40 Ritter, Reiter und Rösser im Kloster.'},
 {rg:'boss',t:'Der Riesenritter',d:'Im Bosssaal hinter dem Kirchenschiff wartet Ser Haldor auf seinem Knochenross. Besiege ihn.',boss:1},
 {rg:'ride',t:'Ein Ross aus Knochen',d:'Leg Gram in den neuen Reittier-Platz im Inventar und sitz auf (H).'},
 {rg:'zone',z:'wood',t:'Der dunkelrote Wald',d:'Reite durch das Hintertor des Klosters in den dunkelroten Wald.'},
 {rg:'huts',n:3,t:'Hexenhäuser',d:'Im Wald stehen Hexenhäuser. Finde 3 von ihnen.'},
 {rg:'kill',fam:'rg_wood',n:50,t:'Durch das Dickicht',d:'Kämpf dich durch den Wald: besiege 50 seiner Bewohner.'},
 {rg:'zone',z:'castle',t:'Am Fuß der Riesenburg',d:'Am Ende des Waldes ragt die Riesenburg in den Himmel. Erreiche ihr Tor.'}];
for(const q of RGQ){q.a=5;q.ty=q.rg==='kill'?'kill':'rg';QUESTS.push(q)}
QUESTS.forEach((q,i)=>{q.i=i;q.glut=Math.round(40+i*38);q.tp=i===QUESTS.length-1||QUESTS[i+1].a!==q.a?1:0});
const _qProgRG=qProg;qProg=function(q){if(!q||!q.rg||q.ty==='kill')return _qProgRG(q);const S=P.rgSeen||{};
  if(q.rg==='map')return[P.rgMap?1:0,1];if(q.rg==='zone')return[S[q.z]||(q.z==='clo'&&S.church)?1:0,1];if(q.rg==='boss')return[G.owBoss.rgk?1:0,1];if(q.rg==='ride')return[P.rodeOnce?1:0,1];
  if(q.rg==='huts')return[Object.keys(P.rgHut||{}).length,q.n];return[0,1]};
const _qTargetRG=qTarget;qTarget=function(q){if(!q||!q.rg)return _qTargetRG(q);const m=G.map;if(!m||!m.world)return null;rgInit();const at=(p,qq,l)=>{const[x,y]=rgW(p,qq);return{x:x+.5,y:y+.5,l}};
  if(q.rg==='map'){const c=m.home.objs.find(o=>o.type==='chronist');return c?{x:c.x,y:c.y,l:'Eldrik, der Chronist'}:null}
  const z=G.rgZ;if(!z&&q.rg!=='ride'){const I=islandOf(RG.gcx,RG.gcy);if(hyp(I.x-P.x,I.y-P.y)>40)return{x:I.x,y:I.y,l:'Das Totentor'}}
  if(q.rg==='zone')return q.z==='city'?at(-3,0,'Westtor der stillen Stadt'):q.z==='clo'?at(148,0,'Tor des Riesenklosters'):q.z==='wood'?at(246,0,'Hintertor des Klosters'):at(449,0,'Tor der Riesenburg');
  if(q.rg==='kill')return q.fam==='rg_city'?at(66,0,'Marktplatz der Stadt'):q.fam==='rg_clo'?at(200,0,'Kirchenschiff'):at(330,0,'Tief im Wald');
  if(q.rg==='boss')return G.owBoss.rgk?null:at(228,0,'Bosssaal des Klosters');
  if(q.rg==='huts'){let best=null,bd=1e9;(RG.huts||[]).forEach(([x,y],i)=>{if((P.rgHut||{})[i])return;const d=hyp(x-P.x,y-P.y);if(d<bd){bd=d;best={x,y,l:'Hexenhaus'}}});return best||at(330,0,'Im Wald')}
  return null};
const _killEnemyRG=killEnemy;killEnemy=function(e,a){_killEnemyRG(e,a);if(e.rgz){qInc('k_rg_'+(e.rgz==='church'?'clo':e.rgz==='castle'?'wood':e.rgz))}
  if(e.rgk){G.rgOpenT=0;rgOpenGate();P.mountSlot=1;if(!ownsMount())dropItem(makeMount(),e.x,e.y);
    setTimeout(()=>{banner('EIN NEUER PLATZ IM INVENTAR','Reittier · Leg Gram hinein und sitz mit H auf','boss',4200);log('Das Hintertor des Klosters hebt sich.','#e8c878');sfx('unique')},2600);save()}};
function rgOpenGate(){const m=G.map;if(!m||!m.world)return;rgInit();for(let q=-2;q<=2;q++){const[i,j]=rgW(242,q);m.t[j*m.w+i]=1}}

// Eldrik knows this part of the chronicle too
Object.assign(STORY,{
 'Die Karte des Chronisten':'Da bist du ja. Die Aschemutter ist tot, und ich dachte, die Chronik endet hier. Aber sieh: auf der letzten Seite eine Karte. Eine Stadt am Westrand, ein Kloster, ein Wald, und dahinter etwas, das ich nicht zu zeichnen wage. Hier, nimm sie. Folge dem Pfeil.',
 'Die stille Stadt':'Die Stadt ist nicht verbrannt, nicht zerstört. Alles steht noch, jede Tür, jedes Fenster. Nur die Menschen sind fort. Oder genauer: sie sind noch da, nur ohne Fleisch.',
 'Bürger aus Knochen':'Bauern mit Mistgabeln, Metzger, Wachen, ein paar Ritter dazwischen. Sie arbeiten weiter, als wäre nichts geschehen, bis sie dich sehen. Dann nicht mehr.',
 'Das Riesenkloster':'Hinter dem Osttor liegt das Riesenkloster. Die Mönche haben es für Ritter gebaut, die größer waren als jeder Mensch. Niemand weiß, woher sie kamen.',
 'Die Ritter des Klosters':'Im Kloster gibt es keine Bauern mehr. Nur Rösser, Reiter, Riesen und die königliche Garde. Und sie tragen Waffen, die ich noch nie gesehen habe.',
 'Der Riesenritter':'Ser Haldor. Er war der Letzte, der den Eid geschworen hat. Er sitzt noch immer auf seinem Ross und wartet auf einen König, der nie kommt. Erlöse ihn. Und wenn sein Ross dich danach ansieht: lass es nicht stehen.',
 'Ein Ross aus Knochen':'Gram heißt das Tier, so steht es in der Chronik. Er läuft doppelt so schnell wie du, und Gift macht ihm nichts aus. Leg ihn in den Reittier-Platz und sitz auf.',
 'Der dunkelrote Wald':'Hinter dem Kloster beginnt der Wald, dessen Blätter rot sind wie geronnenes Blut. Selbst am Mittag ist es dort dunkel. Bleib im Sattel.',
 'Hexenhäuser':'Im Wald wohnen Hexen. Sie kochen Dinge, über die ich nicht schreiben will. Finde drei ihrer Häuser, dann weiß ich, wie weit ihr Reich reicht.',
 'Durch das Dickicht':'Spinnen, Ghule, Dornenknechte und Hexen. Der Wald will nicht, dass jemand die Burg erreicht. Zeig ihm, dass er sich irrt.',
 'Am Fuß der Riesenburg':'Die Riesenburg. Ich habe sie nur in Träumen gesehen. Türme über Türmen, eine Kuppel aus grünem Kupfer, und Steine, die in der Luft schweben. Geh hin. Aber ich glaube, das Tor ist noch verschlossen.'});
const _openChronRG=openChron;openChron=function(){const q=curQ();if(q&&q.rg==='map'&&!P.rgMap){P.rgMap=1;log('Du erhältst Eldriks Karte. Der Pfeil zeigt dir den Weg.','#ffd88a');sfx('unique')}_openChronRG()};

// zones, banners, witch huts, the opening gate, and the dark
const RGSUB={city:'Alles steht noch. Niemand lebt.',clo:'Wo die Riesen beteten',church:'Das Kirchenschiff des Riesenklosters',wood:'Selbst am Mittag ist es hier Nacht',castle:'Das Ende der Welt. Und der Anfang von etwas anderem.',gate:'Hier beginnt Eldriks Karte'};
function rgTick(dt){const m=G.map;if(!m||!P)return;if(G.rgOpenT!=null&&G.rgOpenT<1)G.rgOpenT+=dt*.5;if(!m.world){G.rgZ=null;if(ZF!==1){ZF=1;G.rgCk=0;resize()}return}
  rgInit();if(!SPR.prop.rgtree)rgBuildSprites();if(riding()){P.chill=0;if(P.rideTip==null){P.rideTip=1;log('Auf Gram: doppelt so schnell, schwerer zu treffen, Gift wirkt kaum.','#e8dcc0')}}
  // near the castle the camera drifts up so the walls can tower over the player
  {const[p,q]=rgL(P.x,P.y),k=Math.abs(q)<92?clamp((p-414)/26,0,1):0;G.rgCk=(G.rgCk||0)+(k-(G.rgCk||0))*Math.min(1,dt*1.5);if(G.rgCk>.005){const c=G.rgCk*.15*.5,[vx,vy]=rgW(466,-8);camX+=(vx-P.x)*c;camY+=(vy-P.y)*c}
   // and pulls back, so the whole of the burg fits on screen
   const zf=Math.round((1-.42*G.rgCk)*50)/50;if(zf!==ZF){ZF=zf;resize()}}
  G.rgT=(G.rgT||0)-dt;if(G.rgT>0)return;G.rgT=.25;const z=rgZone(P.x,P.y);
  const fnm=z&&RGZN[z]+' · Stufe '+(rgLvl()+({gate:0,city:0,road:1,clo:2,church:3,wood:6,castle:9})[z]);if(z&&$('floorName').textContent!==fnm)$('floorName').textContent=fnm;
  if(z!==G.rgZ){G.rgZ=z;if(z){P.rgSeen=P.rgSeen||{};if(!P.rgSeen[z]){P.rgSeen[z]=1;banner(RGZN[z].toUpperCase(),RGSUB[z]||'','boss',3200);save()}}else{m.ac=null;owTick()}}
  if(z==='wood'&&RG.huts)RG.huts.forEach(([x,y],i)=>{P.rgHut=P.rgHut||{};if(!P.rgHut[i]&&hyp(x-P.x,y-P.y)<6){P.rgHut[i]=1;log('Ein Hexenhaus. Grünes Licht hinter den Fenstern.','#9ae050')}});
  if(G.owBoss.rgk){const[i,j]=rgW(242,0);if(m.t[j*m.w+i]===9)rgOpenGate()}
  if(TOUCH&&P.eq.mount&&!$('tride')){const u=$('tutil');if(u){const b=document.createElement('button');b.className='tb';b.id='tride';b.innerHTML='🐎<small>Ross</small>';b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();toggleRide()},{passive:false});u.appendChild(b)}}}
function rgDark(){return!G.map||!G.map.world?0:G.rgZ==='church'?.9:G.rgZ==='wood'?.62:0}
function darkFill(){const r=rgDark(),n=nightA()*.8;if(r>n)return G.rgZ==='wood'?`rgba(22,2,6,${r})`:`rgba(4,3,2,${r})`;return`rgba(5,8,22,${n.toFixed(3)})`}
const _interactRG=interact;interact=function(o){if(o&&o.type==='rgcgate'){G.openAt={x:P.x,y:P.y};const d=$('dialog');
    d.innerHTML=`<h2>Tor der Riesenburg</h2><p>Das Tor ist höher als der Schwarze Turm. Kein Riegel, kein Schloss, kein Griff. Nur ein Wappen aus Gold, und dahinter ein Herzschlag aus Stein.</p><p class="hint">Es ist verschlossen. Noch.</p><div class="opts"><button data-close>Zurücktreten</button></div>`;d.hidden=false;return}
  if(o&&o.type==='rgsign'){G.openAt={x:P.x,y:P.y};const d=$('dialog');d.innerHTML=`<h2>Ein verwitterter Wegstein</h2><p>„Hinter dieser Brücke liegt die stille Stadt. Wer weitergeht, kehrt nicht als derselbe zurück. Wer gar nicht zurückkehrt, bleibt. Für immer.“</p><p class="hint">Darunter, frisch gekratzt: ein Pfeil nach Westen.</p><div class="opts"><button data-close>Weitergehen</button></div>`;d.hidden=false;return}
  if(o&&o.type==='rghut'){log('Die Tür ist mit Knochen vernagelt.','#a39b88');return}return _interactRG(o)};
const _drawObjRG=drawObj;drawObj=function(o){if(o.type==='rghut'||o.type==='rgcgate')return;if(o.type==='rgsign'){const[sx,sy]=iso(o.x,o.y);if(sx<-60||sx>W+60||sy<-80||sy>H+40)return;shadow(sx,sy,.3);
    ctx.fillStyle='#3a3632';ctx.beginPath();ctx.moveTo(sx-9,sy);ctx.lineTo(sx-8,sy-30);ctx.quadraticCurveTo(sx,sy-38,sx+8,sy-30);ctx.lineTo(sx+9,sy);ctx.closePath();ctx.fill();ctx.fillStyle='#5a544c';ctx.fillRect(sx-8,sy-30,4,30);
    ctx.fillStyle='#1a1614';for(let k=0;k<4;k++)ctx.fillRect(sx-5,sy-26+k*5,10,1.4);ctx.fillStyle='#ff9a3a';ctx.fillRect(sx-4,sy-8,8,1.5);ctx.beginPath();ctx.moveTo(sx-6,sy-7);ctx.lineTo(sx-3,sy-10);ctx.lineTo(sx-3,sy-4);ctx.fill();
    if(G.state==='play'&&hoverObj()===o)label(sx,sy-46,o.name,'#ffd88a');return}return _drawObjRG(o)};
const _saveDataRG=saveData;saveData=function(){const d=_saveDataRG();if(d)for(const k of['rgMap','rgSeen','rgHut','mountSlot','ride','rodeOnce','rideTip'])d.p[k]=P[k];return d};

