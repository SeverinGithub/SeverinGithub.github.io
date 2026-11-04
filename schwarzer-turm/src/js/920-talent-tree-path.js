/* ---------- the talent path: every class climbs its own tree upwards, four tiers and two keystones · higher tiers cost more points ---------- */
// One trunk winds up from the class root; on both sides short twigs reach out to the class's two themes and end in a notable.
// Once per tier a fork carries the wanderer's gifts (bag rows, flasks, stacks). A milestone closes every tier: take it to climb on.
const TRING=['Grundlagen','Fortgeschritten','Meisterschaft','Legende'],TCOST=[1,2,3,4],TKEYC=5,TMUL=[1,1.8,2.6,3.4];
const TB8=[
 {id:'kr',n:'Krieger',col:'#d0583a',cls:'krieger',C:[{ed:4},{str:4},{ias:2}],
  A:{n:'Schlächter',m:[{ed:5},{crit:1}],x:{ls:1},names:['Fleischhauer','Schlachtruf','Klingenrausch','Knochenbrecher','Blutbad','Schlächtermeister','Henkerstreich','Endloses Gemetzel']},
  B:{n:'Sturmbrecher',m:[{ias:3},{str:4}],x:{stam:15},names:['Sturmlauf','Ansturm','Eiserne Faust','Donnerschritt','Unaufhaltsam','Brecher der Mauern','Kriegsherr','Titanenschritt']},
  M:[['Erste Narben',{life:20,ed:8}],['Veteran',{life:35,ed:12,str:8}],['Kriegsmeister',{ed:18,ias:8,life:50}],['Legende des Schlachtfelds',{ed:25,str:15,lifeP:8}]],
  K:[['Berserker',{ed:45,ias:15,tdef:-35}],['Unbeugsam',{lifeP:25,dmgred:8,ias:-10}]]},
 {id:'bp',n:'Blutpfad',col:'#b0303e',C:[{ls:1},{lok:2},{regen:1}],
  A:{n:'Aderlass',m:[{ls:1},{ed:4}],x:{lok:4},names:['Erster Biss','Blutdurst','Rote Ernte','Aderlass','Vampirhunger','Blutrausch','Lebensdieb','Ewiger Hunger']},
  B:{n:'Lebenskraft',m:[{regen:1},{lifeP:1}],x:{life:15},names:['Zähes Blut','Heilendes Fleisch','Starkes Herz','Lebensquell','Unverwüstlich','Zweites Herz','Phönixblut','Ewiges Leben']},
  M:[['Blutzoll',{ls:2,lok:6}],['Blutsbande',{lifeP:6,regen:3,ls:2}],['Blutfürst',{ls:3,lok:12,lifeP:8}],['Herr des Blutes',{ls:4,lifeP:12,regen:6}]],
  K:[['Blutopfer',{ls:6,lok:25,lifeP:-15}],['Unsterblicher Wille',{lifeP:30,regen:10,ls:-3}]]},
 {id:'ja',n:'Jägerin',col:'#7ab04a',cls:'jaegerin',C:[{dex:4},{crit:1},{ias:2}],
  A:{n:'Klingentanz',m:[{ias:3},{dex:4}],x:{frw:3},names:['Flinke Hand','Wirbelschritt','Doppelschnitt','Schattenfuß','Tanz der Klingen','Messerwind','Tausend Schnitte','Klingensturm']},
  B:{n:'Meuchlerin',m:[{crit:1},{poison:3}],x:{ls:1},names:['Scharfes Auge','Giftzahn','Kehlschnitt','Lautloser Tod','Nachtmahr','Witwenkuss','Todesstoß','Herz der Nacht']},
  M:[['Lehrling der Schatten',{dex:10,crit:3}],['Klingenschwester',{ias:8,dex:12,frw:5}],['Schattenmeisterin',{crit:6,ias:10,dex:15}],['Königin der Nacht',{crit:10,dex:25,frw:10}]],
  K:[['Assassine',{crit:18,ed:20,lifeP:-15}],['Phantom',{frw:25,ias:20,tdef:-30}]]},
 {id:'wa',n:'Wanderer',col:'#e3c04b',C:[{frw:2},{glutf:4},{xp:2}],
  A:{n:'Schatzsucher',m:[{mf:5},{glutf:4}],x:{sellB:5},names:['Glückspilz','Goldnase','Tiefe Säcke','Schatzsucher','Fortunas Liebling','Drachenhort','Königsbeute','Glückskind']},
  B:{n:'Reisender',m:[{frw:2},{stam:8}],x:{xp:3},names:['Leichter Schritt','Packesel','Langer Atem','Wegkundig','Weltenbummler','Sternenkarte','Windläufer','Pfadfinder']},
  M:[['Erste Reise',{invRows:1,frw:4}],['Feilscher',{shopDisc:10,sellB:15,mf:10}],['Tiefe Taschen',{invRows:1,mf:15}],['Weltenwanderer',{invRows:1,xp:12,frw:10}]],
  K:[['Glücksritter',{mf:60,glutf:40,lifeP:-10}],['Ewiger Reisender',{frw:25,stam:60,xp:15,ed:-10}]]},
 {id:'al',n:'Alchemist',col:'#e8903a',cls:'alchemist',C:[{potPow:5},{regen:1},{poison:3}],
  A:{n:'Phiolenwerfer',m:[{potPow:5},{poison:3}],x:{cdr:2},names:['Glasbläser','Säurespritzer','Brandmischung','Frostkolben','Seuchenhauch','Kesselmeister','Große Mischung','Feuer im Glas']},
  B:{n:'Trankkunde',m:[{flaskH:4},{regen:1}],x:{mregen:1},names:['Kräuterkunde','Heiltrank','Zweiter Schluck','Elixierkenner','Lebenswasser','Allheilmittel','Ewiger Trank','Stein der Weisen']},
  M:[['Lehrling des Kessels',{potPow:10,potStack:2}],['Trankgürtel',{flask:1,flaskH:10}],['Meister der Elixiere',{potPow:25,potStack:2,regen:3}],['Großmeister der Mixturen',{flask:1,potPow:30,res:10}]],
  K:[['Glasbrecher',{potPow:60,cdr:10,lifeP:-15}],['Unsterbliche Mixtur',{flaskH:50,regen:8,potPow:-20}]]},
 {id:'el',n:'Elemente',col:'#3ac0c8',C:[{fire:3},{cold:3},{light:3}],
  A:{n:'Glut und Blitz',m:[{fire:3},{light:3}],x:{spell:3},names:['Funke','Glutatem','Blitzschlag','Flammenzunge','Gewitterherz','Höllenfeuer','Donnergott','Sonnenkern']},
  B:{n:'Frost und Gift',m:[{cold:3},{poison:3}],x:{res:3},names:['Raureif','Giftranke','Eiszapfen','Sumpfatem','Gletscherherz','Pestwind','Ewiges Eis','Seuchenkönig']},
  M:[['Elementarschüler',{res:8,fire:5,cold:5,light:5}],['Sturmbinder',{light:12,res:10}],['Herz der Elemente',{fire:12,cold:12,res:12}],['Elementarfürst',{fire:15,cold:15,light:15,poison:15,res:15}]],
  K:[['Elementarbrand',{fire:40,cold:40,light:40,poison:40,ed:-20}],['Elementarhaut',{res:35,life:60,spell:-15}]]},
 {id:'ma',n:'Magier',col:'#5a8ae8',cls:'magier',C:[{spell:5},{ene:4},{mana:8}],
  A:{n:'Zerstörer',m:[{spell:6},{crit:1}],x:{cdr:2},names:['Funkenflug','Glutherz','Feuersturm','Aschenregen','Weltenbrand','Sternenfall','Zorn der Sonne','Letzter Funke']},
  B:{n:'Arkanist',m:[{mregen:1},{mcost:2}],x:{manaP:3},names:['Klarer Geist','Manaquell','Runenleser','Tiefer Brunnen','Arkane Flut','Gedankenschnelle','Ewiger Quell','Allwissen']},
  M:[['Funkenträger',{spell:10,mana:20}],['Runenkundiger',{spell:15,mregen:3,cdr:4}],['Erzmagier',{spell:20,manaP:10,mcost:5}],['Herr der Asche',{spell:30,cdr:8,ene:15}]],
  K:[['Glaskanone',{spell:60,lifeP:-20}],['Ewige Quelle',{manaP:40,mregen:10,mcost:15,spell:-15}]]},
 {id:'wc',n:'Wächter',col:'#b8b0a0',C:[{vit:4},{life:10},{tdef:6}],
  A:{n:'Bollwerk',m:[{tdef:6},{block:1}],x:{dmgred:1},names:['Schildwall','Eichenhaut','Bollwerk','Steinwacht','Torhüter','Festungsgeist','Mauer aus Eisen','Ewige Wacht']},
  B:{n:'Eisenhaut',m:[{res:3},{life:8}],x:{thorns:6},names:['Dornenpanzer','Feuerfest','Sturmfest','Zähe Natur','Unberührbar','Dornenkrone','Elementarschild','Schwur des Wächters']},
  M:[['Wachposten',{life:30,tdef:15}],['Schildbruder',{res:8,block:4,life:40}],['Bastion',{dmgred:4,lifeP:8,tdef:25}],['Unerschütterlich',{dmgred:8,lifeP:15,res:10}]],
  K:[['Lebende Festung',{dmgred:12,lifeP:25,frw:-15,ias:-8}],['Dornenherz',{thorns:120,res:15,ed:-15}]]}];
// each class: its own branch above, and one of the four general branches for the small steps of its gift fork
const TCLS={krieger:'kr',jaegerin:'ja',alchemist:'al',magier:'ma'},TGEN={krieger:'wc',jaegerin:'wa',alchemist:'bp',magier:'el'};
const TUTIL=[['Tiefe Taschen',{invRows:1,glutf:10}],['Trankgürtel',{flask:1,flaskH:10}],['Trankstapel',{potStack:2,shopDisc:10}],['Weltentasche',{invRows:1,mf:20}]];
// geometry: y grows downwards, so the tree climbs into negative y; five trunk steps per tier, the sixth is its milestone
const TG={D:90,steps:5,tier:6},tY=(t,s)=>-(t*TG.tier+s+1)*TG.D,tX=(t,s)=>Math.round(Math.sin((t*TG.tier+s)*.9)*28),tTop=()=>tY(3,TG.steps)-170;
const tScale=(m,f)=>{const o={};for(const k in m){const v=m[k]*f;o[k]=v<0?Math.round(v):Math.max(1,Math.round(v))}return o},tMerge=(...ms)=>{const o={};for(const m of ms)for(const k in m)o[k]=(o[k]||0)+m[k];return o};
(function(){for(const k in TREE)delete TREE[k];TEDGE.length=0;
  const add=(id,x,y,o)=>TREE[id]=Object.assign({id,x,y,adj:[]},o),link=(a,b)=>{TREE[a].adj.push(b);TREE[b].adj.push(a);TEDGE.push([a,b,TREE[a].cls])};
  for(const cls in TCLS){const b=TB8.find(x=>x.id===TCLS[cls]),g=TB8.find(x=>x.id===TGEN[cls]),sk=CLS[cls]?CLS[cls].skills:[],base={cls,col:b.col};
    // the root is where the class starts, free of charge
    add(b.id+'s0',0,0,{...base,k:'root',n:b.n,m:tScale(b.C[0],2),c:0,t:-1});let gate=b.id+'s0';
    for(let t=0;t<4;t++){const f=TMUL[t],c=TCOST[t],tid=x=>b.id+'t'+t+x;let prev=gate;
      for(let s=0;s<TG.steps;s++){const id=tid('c'+s),x0=tX(t,s),y0=tY(t,s);add(id,x0,y0,{...base,k:'small',m:tScale(b.C[(s+t)%3],f),c,t});link(prev,id);prev=id;
        if(s!==1&&s!==3)continue;const hi=s===3?1:0;
        for(const side of[-1,1]){const T=side<0?b.A:b.B,sd=side<0?'L':'R',tc={...base,col:side<0?'#d8a860':'#7fa8d8'};let p=id;
          // a twig: two small steps outwards and a notable at its end, the upper one stronger
          for(let j=0;j<3;j++){const tw=tid(sd+hi+'n'+j),x=x0+side*(95+j*85),y=y0-20-j*32;
            if(j<2)add(tw,x,y,{...tc,k:'small',m:tScale(T.m[j],f),c,t,th:T.n});
            else add(tw,x,y,{...base,k:'not',n:T.names[t*2+hi],th:T.n,m:tScale(hi?tMerge(...T.m,...T.m,T.x):tMerge(...T.m),f*(hi?2.6:2.2)),c,t});
            link(p,tw);p=tw}
          if(hi&&side===(t%2?1:-1)){const j1=TREE[tid(sd+'1n1')],u0=tid('u0'),u1=tid('u1');
            add(u0,j1.x+side*25,j1.y-80,{...base,col:'#e3c04b',k:'small',m:tScale(g.C[t%3],f),c,t,th:g.n});
            add(u1,j1.x+side*50,j1.y-160,{...base,col:'#e3c04b',k:'not',n:TUTIL[t][0],th:g.n,m:{...TUTIL[t][1]},c,t});link(j1.id,u0);link(u0,u1)}}}
      const mi=b.id+'M'+t,m=Object.assign({},b.M[t][1]);if(sk[t])m['sk_'+sk[t]]=1;
      add(mi,0,tY(t,TG.steps),{...base,k:'mile',n:b.M[t][0],ring:t,m,c,t});link(prev,mi);gate=mi}
    b.K.forEach(([n,m0],ki)=>{const m=Object.assign({},m0);if(sk[4+ki])m['sk_'+sk[4+ki]]=1;const id=b.id+'K'+ki;
      add(id,(ki?1:-1)*150,tTop(),{...base,k:'key',n,m,c:TKEYC,t:4});link(gate,id)})}})();
const tMiles=()=>(P.tree||[]).filter(id=>TREE[id]&&TREE[id].k==='mile').length;
