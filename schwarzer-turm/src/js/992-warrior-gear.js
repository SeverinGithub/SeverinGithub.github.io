/* ---------- the warrior's own kit: from the padded gambeson to the knight's harness · worn like the old mail and plate, but with strength and toughness built in ---------- */
// each piece: [slot, name, level, defence, the old piece it is drawn like] · every base comes again in three better makings
const KRIE=[['helm','Kettenhaube',1,4,'Lederkappe'],['helm','Nasalhelm',6,11,'Eisenhelm'],['helm','Schaller',12,19,'Topfhelm'],['helm','Barbuta',19,28,'Topfhelm'],['helm','Widderhelm',26,37,'Hornhelm'],['helm','Kriegskrone',33,47,'Totenkrone'],
  ['armor','Gambeson',1,10,'Lederwams'],['armor','Ringpanzer',6,25,'Kettenhemd'],['armor','Lamellenpanzer',12,41,'Schuppenpanzer'],['armor','Brigantine',19,58,'Schuppenpanzer'],['armor','Kriegsharnisch',26,80,'Plattenharnisch'],['armor','Ritterharnisch',33,102,'Schwarzer Harnisch'],
  ['gloves','Fausthandschuhe',2,3,'Lederhandschuhe'],['gloves','Schuppenfäuste',10,8,'Kettenhandschuhe'],['gloves','Stahlfäuste',20,14,'Panzerhandschuhe'],['gloves','Kriegsfäuste',30,20,'Klauenhandschuhe'],
  ['boots','Marschstiefel',2,3,'Stiefel'],['boots','Schienenstiefel',10,8,'Kettenstiefel'],['boots','Stahlschuhe',20,14,'Plattenstiefel'],['boots','Kriegsschritt',30,20,'Plattenstiefel'],
  ['belt','Waffengurt',3,3,'Ledergürtel'],['belt','Schwertgurt',13,7,'Ledergürtel'],['belt','Eisengurt',23,12,'Kriegsgürtel'],['belt','Titanengurt',31,17,'Kettengürtel']];
const KRIET=[{p:'Schwarzeisen',l:12,m:1.5,mat:'dark'},{p:'Runenstahl',l:24,m:2.1,mat:'sky'},{p:'Drachenstahl',l:36,m:2.8,mat:'ember'}];
const KRIEM=['iron','steel','bronze','iron','steel','dark'];
// the piece carries its craft built in, more the deeper it was made: strength, life and a hide that takes less
const KRIMP={helm:L=>({str:2+L*.35,life:6+L}),armor:L=>({life:12+L*1.6,dmgred:1+L*.12,edef:15+L*1.5}),gloves:L=>({str:2+L*.3,ias:3+L*.2}),boots:L=>({frw:4+L*.15,life:5+L*.8}),belt:L=>({life:8+L*1.1,str:1+L*.25})};

const _expandItemsKG=expandItems;expandItems=function(){_expandItemsKG();
  KRIE.forEach(([slot,n,lvl,def,look],i)=>{const B={n,slot,lvl,def,str:Math.round(lvl*3.2),dex:0,block:0,cls:slot,shape:look,krie:true};BASE[n]=B;
    const s=PXS[look];PXS[n]=[s[0],KRIEM[i%KRIEM.length],s[2]||'leather',s[3],s[4]];ISZ[n]=ISZ[look];
    for(const T of KRIET){const tn=T.p+'-'+n;BASE[tn]=Object.assign({},B,{n:tn,tier:T.p,lvl:lvl+T.l,def:Math.round(def*T.m),str:Math.round((lvl+T.l)*3.2)});PXS[tn]=[s[0],T.mat,T.mat==='ember'?'gold':PXS[n][2],s[3],s[4]];ISZ[tn]=ISZ[look]}});
  UNIQ.push({n:'Widderstirn',b:'Widderhelm',lvl:28,m:{str:20,life:50,dmgred:5,allsk:1}},{n:'Eiserne Wacht',b:'Kriegsharnisch',lvl:28,m:{life:90,dmgred:10,edef:120,thorns:20}},
    {n:'Fäuste des Schmieds',b:'Stahlfäuste',lvl:22,m:{str:20,ias:15,fire:10}},{n:'Gurt des Bannerträgers',b:'Titanengurt',lvl:33,m:{life:80,str:25,res:15}},
    {n:'Schwur des Ritters',b:'Ritterharnisch',lvl:36,m:{life:130,dmgred:14,res:25,str:25,edef:150}},{n:'Erster Schritt der Legion',b:'Marschstiefel',lvl:4,m:{frw:15,life:20,str:6}});
  Object.assign(PXU,{'Widderstirn':['bronze','gold',0,'topaz'],'Eiserne Wacht':['dark','iron',0,'ruby'],'Schwur des Ritters':['steel','gold',0,'sapphire']})};
const isKrie=it=>{const b=it&&BASE[it.b];return!!(b&&b.krie)};
const _makeItemKG=makeItem;makeItem=function(ilvl,o={}){let it=_makeItemKG(ilvl,o);
  // loot leans towards the hero's own kit, as with the huntress and the alchemist
  if(P&&isKrie(it)&&P.cls!=='krieger'&&!(o&&o.keepCls)&&Math.random()<.55)it=_makeItemKG(ilvl,o);
  const b=it&&BASE[it.b];if(b&&b.krie&&!it.kgi){it.kgi=1;const im=KRIMP[b.slot](b.lvl);for(const k in im)it.mods[k]=(it.mods[k]||0)+Math.round(im[k])}return it};
const _itemTipKG=itemTipHTML;itemTipHTML=function(it,c){let h=_itemTipKG(it,c);if(isKrie(it)&&CLS.krieger){const t=`<div class="base">Ausrüstung: ${CLS.krieger.n}</div>`,i=h.indexOf('<div class="act">');h=i>=0?h.slice(0,i)+t+h.slice(i):h+t}return h};
