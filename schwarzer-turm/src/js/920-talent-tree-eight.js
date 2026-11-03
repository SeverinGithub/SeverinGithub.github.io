/* ---------- the great talent tree: eight branches, four rings each, a milestone at every gate · four for the classes, four for every hero ---------- */
// A branch: a core path (centre lane) between two themes (A on the left lanes, B on the right). Small nodes repeat their theme, a notable sits on
// each theme twice per ring, and a milestone closes every ring: you must take it to walk on. The last milestone opens two keystones.
const TRING=['Grundlagen','Fortgeschritten','Meisterschaft','Legende'],TMUL=[1,1.4,1.8,2.3];
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
// geometry: lanes fan out with the radius so the outer rings breathe; every ring is nine steps, then its gate
const TG={R0:340,D:60,RING:660,lanes:5,steps:9,W:r=>30+r*.09},tRing=t=>TG.R0+t*TG.RING;
const tScale=(m,f)=>{const o={};for(const k in m){const v=m[k]*f;o[k]=v<0?Math.round(v):Math.max(1,Math.round(v))}return o},tMerge=(...ms)=>{const o={};for(const m of ms)for(const k in m)o[k]=(o[k]||0)+m[k];return o};
(function(){TB.length=0;for(const b of TB8)TB.push(b);for(const k in TREE)delete TREE[k];TEDGE.length=0;
  const add=(id,x,y,o)=>TREE[id]=Object.assign({id,x,y,adj:[]},o),link=(a,b)=>{TREE[a].adj.push(b);TREE[b].adj.push(a);TEDGE.push([a,b])};
  add('o',0,0,{k:'origin',n:'Ursprung',m:{},b:-1});
  const N=TB.length,at=(bi,r,lat)=>{const th=-Math.PI/2+bi*2*Math.PI/N,ax=Math.cos(th),ay=Math.sin(th);return[ax*r-ay*lat,ay*r+ax*lat]};
  const lid=(b,t,l,s)=>b.id+'t'+t+'l'+l+'s'+s;
  TB.forEach((b,bi)=>{const sk=b.cls&&CLS[b.cls]?CLS[b.cls].skills:[];
    // the root: the class starts here for free; the others are one step from the centre
    add(b.id+'s0',...at(bi,TG.R0-110,0),{k:'root',b:bi,n:b.n,m:tScale(b.C[0],2)});link('o',b.id+'s0');let gate=b.id+'s0';
    for(let t=0;t<4;t++){const R=tRing(t),f=TMUL[t];
      for(let l=0;l<TG.lanes;l++)for(let s=0;s<TG.steps;s++){const r=R+s*TG.D,id=lid(b,t,l,s),th=l<2?b.A:l>2?b.B:null,pool=th?th.m:b.C;
        // notables: theme A on lanes 0/1, theme B on lanes 4/3, the second one further out and stronger
        const nb=(l===0&&s===3)||(l===4&&s===3)?1:(l===1&&s===7)||(l===3&&s===7)?2:0;
        if(nb){const T=l<2?b.A:b.B,k=t*2+nb-1;add(id,...at(bi,r,(l-2)*TG.W(r)),{k:'not',b:bi,n:T.names[k],th:T.n,m:tScale(nb===1?tMerge(...T.m):tMerge(...T.m,...T.m,T.x),f*(nb===1?2.2:2.6))})}
        else add(id,...at(bi,r,(l-2)*TG.W(r)),{k:'small',b:bi,m:tScale(pool[(s+l)%pool.length],f)});
        if(s===0)link(gate,id);else link(lid(b,t,l,s-1),id);
        if(l>0&&(s+l)%3===1)link(lid(b,t,l-1,s),id)}
      const mi=b.id+'M'+t,mm=b.M[t][1],m=Object.assign({},mm);if(sk[t])m['sk_'+sk[t]]=1;
      add(mi,...at(bi,R+TG.steps*TG.D+20,0),{k:'mile',b:bi,n:b.M[t][0],ring:t,m});for(let l=0;l<TG.lanes;l++)link(lid(b,t,l,TG.steps-1),mi);gate=mi}
    b.K.forEach(([n,m0],ki)=>{const m=Object.assign({},m0);if(sk[4+ki])m['sk_'+sk[4+ki]]=1;const r=tRing(3)+TG.steps*TG.D+190,id=b.id+'K'+ki;add(id,...at(bi,r,(ki?1:-1)*TG.W(r)*1.3),{k:'key',b:bi,n,m});link(gate,id)})});
  // bridges: halfway through every ring the outer lane of one branch reaches across to the next
  TB.forEach((b,bi)=>{const c=TB[(bi+1)%N];for(let t=0;t<4;t++){const A=TREE[lid(b,t,4,4)],C=TREE[lid(c,t,0,4)],f=TMUL[t];let pr=A.id;
    for(let j=1;j<=2;j++){const id='br'+bi+'t'+t+'n'+j,q=j/3;add(id,A.x+(C.x-A.x)*q,A.y+(C.y-A.y)*q,{k:'small',b:-1,m:tScale(j===1?b.C[0]:c.C[0],f*1.5)});link(pr,id);pr=id}link(pr,C.id)}})})();
const tMiles=()=>(P.tree||[]).filter(id=>TREE[id]&&TREE[id].k==='mile').length;
