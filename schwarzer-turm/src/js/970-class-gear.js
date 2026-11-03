/* ---------- the huntress's leathers and the alchemist's kit: their own armour from the first rag to black diamond and dragon scale · and more knives ---------- */
// each piece: [slot, name, level, defence, look] · every base comes again in three better makings, the last one a late-game showpiece
const HUNT=[['helm','Stoffmaske',1,2,'mask'],['helm','Lederkapuze',5,5,'hood'],['helm','Pirschkapuze',11,9,'hood'],['helm','Schattenkapuze',18,14,'hood'],['helm','Rabenkapuze',25,19,'hood'],['helm','Nachtschleier',32,25,'hood'],
  ['armor','Lederweste',1,7,'vest'],['armor','Wildlederwams',6,14,'vest'],['armor','Pirschmantel',12,22,'cloak'],['armor','Schattenmantel',19,32,'cloak'],['armor','Rabenmantel',26,43,'cloak'],['armor','Nachtumhang',33,55,'cloak'],
  ['gloves','Fingerlinge',2,1],['gloves','Messerhandschuhe',10,4],['gloves','Schattengriffe',20,8],['gloves','Krallenhandschuhe',30,12],
  ['boots','Schleichschuhe',2,1],['boots','Wildlederstiefel',10,4],['boots','Schattensohlen',20,8],['boots','Nebelläufer',30,12],
  ['belt','Messergurt',3,1],['belt','Dolchgurt',13,4],['belt','Schattenschärpe',23,8],['belt','Klingengurt',31,11]];
const ALCH=[['helm','Schutzbrille',1,2,'goggle'],['helm','Laborkappe',5,5,'labcap'],['helm','Rauchmaske',11,9,'smoke'],['helm','Schnabelmaske',18,14,'beak'],['helm','Pestmaske',25,19,'plague'],['helm','Alchemistenhaube',32,25,'ahood'],
  ['armor','Lederschürze',1,8,'apron'],['armor','Laborkittel',6,15,'apron'],['armor','Wachsmantel',12,23,'coat'],['armor','Säureschürze',19,33,'apron'],['armor','Pestmantel',26,45,'coat'],['armor','Elixierkutte',33,57,'coat'],
  ['gloves','Säurehandschuhe',2,2],['gloves','Tiegelhandschuhe',10,5],['gloves','Glutgreifer',20,9],['gloves','Elixierhände',30,13],
  ['boots','Holzschuhe',2,2],['boots','Laborstiefel',10,5],['boots','Aschestiefel',20,9],['boots','Quecksilberschritt',30,13],
  ['belt','Phiolengurt',3,1],['belt','Trankgurt',13,4],['belt','Elixiergurt',23,8],['belt','Kolbengürtel',31,11]];
const HUNTT=[{p:'Nachtleder',l:12,m:1.5,mat:'dark'},{p:'Dämmerseiden',l:24,m:2.1,mat:'void'},{p:'Schwarzdiamant',l:36,m:2.8,mat:'diamond'}];
const ALCHT=[{p:'Wachsleder',l:12,m:1.5,mat:'bronze'},{p:'Basiliskenleder',l:24,m:2.1,mat:'venom'},{p:'Drachenschuppen',l:36,m:2.8,mat:'dscale'}];
// black diamond: nearly black, with cold blue-white fire in its edges · dragon hide: dark red scale with a copper sheen
PXM.diamond=['#050409','#121020','#2a2744','#d8e4ff'];PXM.dscale=['#1c0605','#4a120c','#8a2c16','#e2884a'];
// pixel sprites for bag and ground (half rows, mirrored): a hood with a dark face, a cloth mask, a mantle, an apron, goggles, a beaked mask
PXA.hood=['','......mm','....mmll','...mllll','..mllhll','..mlldkk','.mlldkkk','.mlldkkk','.mllddkk','.mmlldDD','mmlllDLL','mlllllll','mlllhlll','dmmmmmmm'];
PXA.cmask=['','','','','','.....mmm','...mmlll','..mllhll','.mlDDDDD','.mlkkDkk','.mlDDDDD','.mllllll','..mlllll','...mmmmm','....dddd'];
PXA.cloak=['','....DDDD','...DLLLL','..mDDDDD','..mllllG','..mlllhk','.mllllhk','.mlllllk','.mllhllk','.mlllllk','mllllllk','mlllhlll','mlllllll','mllhllll','mlmlmlml','d.d.d.d.'];
PXA.vest=['','..mmm...','.mlllm..','.mllllm.','.mlllhlk','.mllllDk','.mllllDL','.mlllllD','.mllhlll','.mlllllD','.DDDDDDD','.mlllllh','.mllllll','..mlllll','..dddddd'];
PXA.apron=['','...DDDD.','...D....','...D....','...mmmmm','...mllll','...mlhll','..mmllll','DDDDDDDD','.mllllll','.mllhlll','mlllllll','mllllgll','mlllllll','mmmmmmmm','dddddddd'];
PXA.coat=['','...DDDDD','..mDLLLD','.mllDDlD','mllllllD','mlmlllhD','mlmllllD','mlmllllG','ml.mlllD','ml.mlllD','dd.mllhD','...mlllG','...mlllD','...mlllD','...mmmmD','...ddddd'];
PXA.goggle=['','','','','','','DDDDDDDD','..mmmm..','.mlGgm..','DmggegmD','.mleemD.','..mmmm..'];
PXA.beak=['','....mmmm','..mmllll','.mllllll','.mlGgmll','.mleemll','.mlllmmm','..mlllmD','...mllDL','....mmDL','.....mDL','......DL','.......D'];
const GSET={};
const GLOOK={};
function gearAdd(list,tiers,tag,mats,gem,dexK){
  list.forEach(([slot,n,lvl,def,look],i)=>{const B={n,slot,lvl,def,str:0,dex:Math.round(lvl*dexK),block:0,cls:slot,[tag]:true};BASE[n]=B;GSET[n]=tag;if(look)GLOOK[n]=look;if(slot==='helm')HELMT[n]=look;
    const spr=slot==='gloves'?()=>pgrid(PXF.glove,false):slot==='boots'?()=>pgrid(PXF.boot,false):slot==='belt'?()=>pgrid(tag==='alch'?PXA.beltp:PXA.belt,true):
      ()=>pgrid(PXA[{mask:'cmask',hood:'hood',goggle:'goggle',labcap:'cap',smoke:'cmask',beak:'beak',plague:'beak',ahood:'hood',vest:'vest',cloak:'cloak',apron:'apron',coat:'coat'}[look]],true);
    const mt=mats[i%mats.length];PXS[n]=[spr,mt,tag==='alch'?'leather':'dark',tag==='alch'?'bronze':'iron',gem];
    ISZ[n]=slot==='armor'?[2,3]:slot==='belt'?[2,1]:[2,2];
    for(const T of tiers){const tn=T.p+'-'+n;BASE[tn]=Object.assign({},B,{n:tn,shape:n,tier:T.p,lvl:lvl+T.l,def:Math.round(def*T.m),dex:Math.round((lvl+T.l)*dexK)});GSET[tn]=tag;
      PXS[tn]=[spr,T.mat,T.mat==='diamond'?'void':T.mat==='dscale'?'bronze':PXS[n][2],PXS[n][3],T.mat==='diamond'?'frost':gem]}})}
// four more knives for the huntress, from a thin stiletto to a poisoned fang
const ALDG=[['Stilett',5,2,8,1.85,0,18],['Kris',9,4,11,1.8,6,28],['Rabenschnabel',20,9,22,1.85,22,70],['Giftzahn',26,12,29,1.9,28,88]];
const _expandItemsCG=expandItems;expandItems=function(){_expandItemsCG();
  gearAdd(HUNT,HUNTT,'hunt',['leather','moss','cloth','stone','dark','void'],'amethyst',1.1);
  gearAdd(ALCH,ALCHT,'alch',['leather','bronze','moss','venom','stone','ember'],'emerald',0);
  const DS={Stilett:[()=>wBlade({tip:10,g:-4,gw:2,grip:-8,hw:1,taper:7}),'steel','iron','leather','sapphire'],Kris:[()=>wBlade({tip:8,g:-4,gw:3,grip:-8,serr:1,taper:4}),'bronze','gold','leather','ruby'],
    Rabenschnabel:[()=>wBlade({tip:8,g:-4,gw:2,grip:-8,curve:-3,taper:5}),'dark','iron','leather','amethyst'],Giftzahn:[()=>wBlade({tip:8,g:-4,gw:2,grip:-8,fuller:1,rune:1,gem:1}),'venom','dark','leather','emerald']};
  for(const w of ALDG){const b={n:w[0],slot:'weapon',lvl:w[1],dmg:[w[2],w[3]],speed:w[4],str:w[5],dex:w[6],twoH:false,cls:'dagger'};BASE[b.n]=b;PXS[b.n]=DS[b.n];ISZ[b.n]=[1,2];
    for(const M of MATS){const n=M.p+'-'+b.n;BASE[n]=Object.assign({},b,{n,shape:b.n,tier:M.p,lvl:b.lvl+M.l,str:Math.round(b.str*(1+M.l/80)),dex:Math.round(b.dex*(1+M.l/80)),dmg:b.dmg.map(v=>Math.max(1,Math.round(v*M.m)))});PXS[n]=[DS[b.n][0],M.mat,DS[b.n][2],DS[b.n][3],DS[b.n][4]]}}
  UNIQ.push(
    {n:'Flüsternde Naht',b:'Lederkapuze',lvl:6,m:{dex:8,crit:5,frw:10}},{n:'Seidengriff',b:'Messerhandschuhe',lvl:12,m:{ias:20,crit:6,dex:10}},
    {n:'Mantel der Ersten Jagd',b:'Pirschmantel',lvl:14,m:{dex:15,ias:10,life:30,res:10}},{n:'Rabenfeder',b:'Rabenkapuze',lvl:27,m:{dex:20,crit:10,allsk:1,mf:20}},
    {n:'Schritte im Nebel',b:'Nebelläufer',lvl:32,m:{frw:30,dex:20,res:20}},{n:'Gurt der Sieben Klingen',b:'Klingengurt',lvl:33,m:{ias:15,crit:8,life:50,str:10}},
    {n:'Schleier der Mondlosen Nacht',b:'Nachtumhang',lvl:36,m:{dex:30,crit:12,frw:20,dmgred:8,life:60}},
    {n:'Stich der Elster',b:'Stilett',lvl:7,m:{ed:80,dex:10,crit:10,ias:10}},{n:'Krähenkris',b:'Kris',lvl:11,m:{ed:110,poison:10,ls:5,dex:12}},
    {n:'Schnabel der Morrigan',b:'Rabenschnabel',lvl:22,m:{ed:170,crit:15,ias:20,cold:12}},{n:'Witwenzahn',b:'Giftzahn',lvl:28,m:{ed:200,poison:30,dex:25,ls:6}},
    {n:'Glasaugen des Lehrlings',b:'Schutzbrille',lvl:3,m:{potPow:15,ene:6,res:8}},{n:'Kittel des Meisters Halvard',b:'Laborkittel',lvl:9,m:{potPow:25,mana:30,res:15,regen:3}},
    {n:'Schnabel des Doktors',b:'Schnabelmaske',lvl:20,m:{potPow:30,poison:15,res:25,life:40}},{n:'Tiegelfaust',b:'Glutgreifer',lvl:22,m:{fire:20,potPow:20,ias:10}},
    {n:'Atem der Seuche',b:'Pestmaske',lvl:28,m:{poison:30,potPow:40,dmgred:6,allsk:1}},{n:'Großer Kessel',b:'Kolbengürtel',lvl:33,m:{potPow:50,flaskH:30,life:60}},
    {n:'Mantel des Steins der Weisen',b:'Elixierkutte',lvl:36,m:{potPow:60,allsk:1,mana:60,res:25,regen:6}});
  Object.assign(PXU,{'Schleier der Mondlosen Nacht':['diamond','void',0,'frost'],'Rabenfeder':['void','dark',0,'amethyst'],'Atem der Seuche':['dscale','bronze',0,'emerald'],
    'Mantel des Steins der Weisen':['gold','dscale',0,'topaz'],'Witwenzahn':['venom','dark',0,'emerald'],'Schnabel der Morrigan':['void','iron',0,'amethyst']})};
// what the brews, flasks and cooldowns on a piece read like
Object.assign(MODTXT,{potPow:v=>`+${v}% stärkere Tränke und Phiolen`,flaskH:v=>`+${v}% Flakon-Heilung`,cdr:v=>`${v}% schnellere Abklingzeiten`,mcost:v=>`${v}% weniger Manakosten`});
MODORDER.push('potPow','flaskH','cdr','mcost');
// the piece carries its craft built in, more the deeper it was made: speed and edge for the huntress, brews and resistance for the alchemist
const HUIMP={helm:L=>({dex:3+L*.5,crit:2+L*.2}),armor:L=>({dex:4+L*.6,life:10+L*1.5,frw:3+L*.15}),gloves:L=>({ias:5+L*.3,crit:1+L*.15}),boots:L=>({frw:6+L*.2,dex:2+L*.3}),belt:L=>({life:8+L,crit:1+L*.12})};
const ALIMP={helm:L=>({potPow:6+L*.6,res:3+L*.4}),armor:L=>({potPow:8+L*.8,res:4+L*.5,life:10+L*1.4}),gloves:L=>({poison:2+L*.4,potPow:4+L*.4}),boots:L=>({frw:5+L*.15,res:2+L*.3}),belt:L=>({flaskH:6+L*.5,mana:8+L})};
const gSetOf=it=>{const b=it&&BASE[it.b];return!b?null:b.hunt?'jaegerin':b.alch?'alchemist':b.mage?'magier':null};
const _makeItemCG=makeItem;makeItem=function(ilvl,o={}){let it=_makeItemCG(ilvl,o);
  // loot leans towards the hero's own kit: a piece made for another class is rolled once more
  const c=gSetOf(it);if(P&&c&&c!==P.cls&&!(o&&o.keepCls)&&Math.random()<.55)it=_makeItemCG(ilvl,o);
  const b=it&&BASE[it.b];if(b&&(b.hunt||b.alch)&&!it.cgi){it.cgi=1;const im=(b.hunt?HUIMP:ALIMP)[b.slot](b.lvl);for(const k in im)it.mods[k]=(it.mods[k]||0)+Math.round(im[k])}return it};
const _itemTipCG=itemTipHTML;itemTipHTML=function(it,c){let h=_itemTipCG(it,c);const k=it&&it.slot!=='weapon'&&gSetOf(it);if(k&&CLS[k]){const t=`<div class="base">Ausrüstung: ${CLS[k].n}</div>`,i=h.indexOf('<div class="act">');h=i>=0?h.slice(0,i)+t+h.slice(i):h+t}return h};

// on the hero: the huntress's hood takes the colour of the hood she wears, a mantle hangs to the knees, black diamond glitters;
// the alchemist's apron takes the colour of the apron, a coat is longer, dragon hide shows its scales
const gTier=it=>it&&BASE[it.b]&&BASE[it.b].tier;
const _heroLookCG=heroLook;heroLook=function(fl){const r=_heroLookCG(fl),R=r.R,g=k=>{const it=P.eq[k];return it&&P.d.okS.has(it)?it:null},hl=g('helm'),ar=g('armor');
  if(R.hunt){if(hl&&GLOOK[SH(hl.b)]==='hood'){R.clsHelm=false;R.hoodR=itemRamps(hl).p}if(ar&&GLOOK[SH(ar.b)]==='cloak')R.cape=1;R.glint=(gTier(hl)==='Schwarzdiamant'?1:0)+(gTier(ar)==='Schwarzdiamant'?2:0)}
  if(R.alch){if(ar&&BASE[SH(ar.b)]&&BASE[SH(ar.b)].alch){R.apR=itemRamps(ar).p;R.coat=GLOOK[SH(ar.b)]==='coat'?1:0}R.scales=gTier(ar)==='Drachenschuppen'?1:0}
  if(fl)R.glint=0;return r};
// small four-pointed sparks that come and go on dark cloth
function gGlint(x0,y0,w,h,n,seed){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<n;k++){const a=Math.sin(seed*13.7+k*91.3)*43758.5,u=a-Math.floor(a),b2=Math.sin(seed*7.1+k*57.9)*24634.6,v=b2-Math.floor(b2);
  const p=Math.sin(G.t*(2.2+u*2)+k*1.7);if(p<.35)continue;const q=(p-.35)/.65,x=x0+u*w,y=y0+v*h,s=.5+q*1.6;ctx.globalAlpha=q*.9;ctx.fillStyle='#d8e4ff';ctx.fillRect(x-s,y-.2,s*2,.4);ctx.fillRect(x-.2,y-s,.4,s*2);
  ctx.globalAlpha=q*.35;ctx.fillStyle='#8aa8ff';ctx.beginPath();ctx.arc(x,y,s*.9,0,7);ctx.fill()}ctx.restore()}
// helms drawn for this kit: masks, goggles and beaks (a huntress's hood is drawn by her mantle; on anyone else it sits on its own)
const _vHelmCG=vHelm;vHelm=function(it,hx,hy,back,f){const t=HELMT[SH(it.b)];if(!['mask','hood','goggle','labcap','smoke','beak','plague','ahood'].includes(t))return _vHelmCG(it,hx,hy,back,f);
  if(HOODOFF&&t==='hood')return;const m=itemRamps(it),sc=gTier(it)==='Drachenschuppen',dia=gTier(it)==='Schwarzdiamant',LT=['#1a0e06','#3a2210','#6a4422','#9a6a3a'];
  const goggles=(gy,glass)=>{limb(hx-4.8,gy,hx+4.8,gy,.75,.75,LT,true);if(back)return;for(const sd of[-1,1]){const gx=hx+sd*1.9+f*.7;blob(gx,gy-.4,1.75,1.6,m.s,true);blob(gx,gy-.4,1.05,.95,glass||['#1a3a40','#2a6a78','#6ac0d0','#d0f8ff']);ctx.fillStyle='#ffffff';ctx.fillRect(gx-.7,gy-1.1,.5,.5)}};
  const hood=(H)=>{const peak=-f*1.4;if(back){blob(hx,hy-.6,5.6,6.2,H);poly([[hx-2.6,hy-5],[hx+peak*1.4,hy-8.6],[hx+2.6,hy-5]],[H[1],H[1],H[2],H[2]]);return}
    poly([[hx-5.8,hy+5.2],[hx-5.8,hy-2],[hx-3.4,hy-7],[hx+peak,hy-8.4],[hx+3.4,hy-7],[hx+5.8,hy-2],[hx+5.8,hy+5.2],[hx+4.2,hy+5.2],[hx+4.4,hy-1.4],[hx+2.8,hy-4.6],[hx,hy-5.2],[hx-2.8,hy-4.6],[hx-4.4,hy-1.4],[hx-4.2,hy+5.2]],H)};
  const scales=(x0,y0,w,h)=>{ctx.fillStyle=m.p[0];ctx.globalAlpha=.7;for(let y=y0;y<y0+h;y+=1.4)for(let x=x0+((y-y0)/1.4%2?.8:0);x<x0+w;x+=1.6){ctx.beginPath();ctx.arc(x,y,.6,0,Math.PI);ctx.fill()}ctx.globalAlpha=1};
  if(t==='mask'){limb(hx-4.4,hy+1.6,hx+4.4,hy+1.6,1.5,1.5,m.p,true);if(!back){limb(hx-4.6,hy-3,hx+4.6,hy-3,.6,.6,m.p,true)}return}
  if(t==='hood'){hood(m.p);if(dia)gGlint(hx-6,hy-8,12,13,4,3);return}
  if(t==='goggle'){goggles(hy-3);return}
  if(t==='labcap'){blob(hx,hy-3.4,5,3,m.p);limb(hx-5,hy-1.8,hx+5,hy-1.8,.8,.8,m.s,true);goggles(hy-4.2);return}
  if(t==='smoke'){if(!back){poly([[hx-4.2,hy+.4],[hx+4.2,hy+.4],[hx+3.4,hy+4.4],[hx-3.4,hy+4.4]],m.p);for(const sd of[-1,1])blob(hx+sd*3.4+f*.6,hy+3.2,1.5,1.7,m.s,true);blob(hx+f*.6,hy+2.6,1,.8,['#111','#222','#444','#666'])}goggles(hy-3);return}
  if(t==='ahood'){hood(m.p);goggles(hy-3,['#2a0c4a','#5a30a0','#a070e0','#f0d8ff']);return}
  // the beaked mask: leather over the whole face, two round glass eyes, a long beak bent down towards where you look · the plague mask wears a hood and a hat
  if(t==='plague'){hood(m.s);}
  if(back){blob(hx,hy-.4,5,5.4,m.p);limb(hx-4.8,hy-2.6,hx+4.8,hy-2.6,.7,.7,LT,true);if(t==='plague'){blob(hx,hy-5.6,8.4,2,m.s);blob(hx,hy-7.2,4.4,2.6,m.s)}return}
  blob(hx+f*.3,hy-.2,4.6,5,m.p);if(sc)scales(hx-3.6,hy-4,7.2,7);
  ctx.save();ctx.translate(hx+f*1.2,hy+.6);poly([[-f*1.4,-1.4],[f*2.2,-1],[f*4.8,.6],[f*7,3.4],[f*7.6,5],[f*5.4,4],[f*2.4,3.2],[-f*1.2,2.6]],m.s);if(sc)scales(f>0?0:-6,-.6,6,3.6);
    ctx.strokeStyle=m.s[0];ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(-f*.6,.8);ctx.quadraticCurveTo(f*3.6,1.2,f*7.3,4.6);ctx.stroke();blob(f*1.6,-.5,.5,.45,m.p,true);ctx.restore();
  for(const sd of[-1,1]){const gx=hx+sd*2+f*.4,gy=hy-1.6;blob(gx,gy,1.7,1.6,['#3a2406','#8a6418','#d0a838','#fff0a0'],true);blob(gx,gy,1.1,1,[m.gem[0],m.gem[0],m.gem[1],m.gem[2]])}
  if(t==='plague'){blob(hx,hy-5.4,9,2.1,m.s);blob(hx,hy-7.4,4.6,2.8,m.s);limb(hx-4.4,hy-6,hx+4.4,hy-6,.6,.6,LT,true)}};
let HOODOFF=0;
