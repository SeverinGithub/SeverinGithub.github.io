/* ---------- data ---------- */
const WEAP=[
['Kurzschwert',1,2,6,1.4,0,0,0,'sword'],['Dolch',1,1,5,1.8,0,8,0,'dagger'],['Keule',1,2,7,1.3,10,0,0,'mace'],['Handaxt',2,3,7,1.3,14,0,0,'axe'],['Eichenstab',2,2,7,1.2,0,0,1,'staff'],
['Krummsäbel',4,3,11,1.45,0,22,0,'sword'],['Langschwert',5,4,12,1.25,24,10,0,'sword'],['Speer',6,5,17,1.1,20,22,1,'spear'],['Morgenstern',7,5,15,1.2,32,0,0,'mace'],['Kriegsaxt',8,6,16,1.15,34,0,0,'axe'],
['Zweihänder',10,10,26,.95,48,14,1,'great'],['Runenklinge',14,9,22,1.35,44,38,0,'sword'],['Hellebarde',14,12,32,.95,54,34,1,'spear'],['Schattendolch',15,7,18,1.9,20,58,0,'dagger'],['Kriegshammer',16,14,30,.9,68,0,0,'mace'],
['Aschestab',18,7,19,1.2,0,0,1,'staff'],['Henkersbeil',20,20,46,.8,88,20,1,'great'],['Mondsichel',22,14,32,1.3,58,58,0,'sword'],['Bluthacke',25,20,44,1.1,84,0,0,'axe'],['Drachenzahn',28,22,50,1.2,95,70,0,'sword'],
['Kolossklinge',30,30,70,.82,125,50,1,'great'],['Sternenstab',30,12,30,1.25,0,0,1,'staff'],['Seelenspieß',32,26,62,1.05,90,90,1,'spear'],['Nachtzahn',34,16,38,2,40,110,0,'dagger']];
const ARMS=[
['helm','Lederkappe',1,3,0],['helm','Eisenhelm',6,10,25],['helm','Topfhelm',12,18,45],['helm','Hornhelm',20,28,65],['helm','Totenkrone',30,40,85],
['armor','Lederwams',1,8,0],['armor','Kettenhemd',6,22,30],['armor','Schuppenpanzer',12,38,50],['armor','Plattenharnisch',20,60,80],['armor','Schwarzer Harnisch',30,90,110],
['gloves','Lederhandschuhe',1,2,0],['gloves','Kettenhandschuhe',8,6,30],['gloves','Panzerhandschuhe',18,12,60],['gloves','Klauenhandschuhe',28,18,80],
['boots','Stiefel',1,2,0],['boots','Kettenstiefel',8,6,30],['boots','Plattenstiefel',18,12,60],['boots','Schattentreter',28,18,70],
['belt','Schärpe',1,2,0],['belt','Ledergürtel',8,5,20],['belt','Kriegsgürtel',18,10,50],['belt','Kettengürtel',28,15,70],
['offhand','Rundschild',1,6,12,15],['offhand','Turmschild',10,20,55,25],['offhand','Wappenschild',18,30,72,22],['offhand','Grabsteinschild',28,45,100,28],
['ring','Ring',1,0,0],['amulet','Amulett',1,0,0]];
const BASE={},SH=n=>BASE[n]&&BASE[n].shape||n;
for(const w of WEAP)BASE[w[0]]={n:w[0],slot:'weapon',lvl:w[1],dmg:[w[2],w[3]],speed:w[4],str:w[5],dex:w[6],twoH:!!w[7],cls:w[8]};
for(const a of ARMS)BASE[a[1]]={n:a[1],slot:a[0],lvl:a[2],def:a[3],str:a[4],dex:0,block:a[5]||0,cls:a[0]==='offhand'?'shield':a[0]};
const SLOTCODE={weapon:'W',offhand:'O',helm:'H',armor:'A',gloves:'G',boots:'B',belt:'E',ring:'R',amulet:'M'};
const SLOTW=[['weapon',30],['offhand',7],['helm',10],['armor',10],['gloves',8],['boots',8],['belt',7],['ring',8],['amulet',5]];
const SLOTNAME={weapon:'Waffe',offhand:'Schild',helm:'Helm',armor:'Rüstung',gloves:'Handschuhe',boots:'Stiefel',belt:'Gürtel',ring:'Ring',amulet:'Amulett'};
const AFF=[
{k:'ed',p:1,s:'W',n:['Scharfe','Grausame','Brutale','Mörderische'],r:t=>[15+t*20,30+t*35]},
{k:'fire',p:1,s:'WRMG',n:['Glimmende','Brennende','Lodernde','Höllische'],r:t=>[2+t*4,5+t*9]},
{k:'cold',p:1,s:'WRMG',n:['Kalte','Frostige','Eisige','Gletscherne'],r:t=>[2+t*3,4+t*8]},
{k:'light',p:1,s:'WRMG',n:['Knisternde','Funkende','Donnernde','Sturmgeborene'],r:t=>[1+t*3,6+t*11]},
{k:'edef',p:1,s:'OHAGBE',n:['Feste','Stabile','Gehärtete','Göttliche'],r:t=>[15+t*15,30+t*30]},
{k:'life',p:1,s:'HAOEMR',n:['Rote','Rubinrote','Blutrote','Titanische'],r:t=>[5+t*10,15+t*15]},
{k:'mana',p:1,s:'HAMRW',n:['Blaue','Saphirne','Azurne','Astrale'],r:t=>[5+t*8,12+t*12]},
{k:'mf',p:1,s:'HRMGB',n:['Glückliche','Funkelnde','Gesegnete','Schicksalhafte'],r:t=>[5+t*6,12+t*10]},
{k:'res',p:1,s:'AHOBRME',n:['Beschützte','Geweihte','Bewahrte','Unbeugsame'],r:t=>[4+t*5,10+t*7]},
{k:'spell',p:1,s:'WRMH',n:['Mystische','Arkane','Gelehrte','Ewige'],r:t=>[8+t*10,15+t*15]},
{k:'str',p:0,s:'WOHAGBERM',n:['der Kraft','des Riesen','des Titanen','des Kolosses'],r:t=>[2+t*3,5+t*5]},
{k:'dex',p:0,s:'WOHAGBERM',n:['der Gewandtheit','des Fuchses','des Falken','des Schattens'],r:t=>[2+t*3,5+t*5]},
{k:'vit',p:0,s:'WOHAGBERM',n:['der Ausdauer','des Bären','des Mammuts','des Berges'],r:t=>[2+t*3,5+t*5]},
{k:'ene',p:0,s:'WOHAGBERM',n:['des Geistes','der Zauberei','des Weisen','des Orakels'],r:t=>[2+t*3,5+t*5]},
{k:'ls',p:0,s:'WRG',n:['des Egels','des Blutegels','des Vampirs','des Blutfürsten'],r:t=>[2+t,4+t*2]},
{k:'ias',p:0,s:'WG',n:['der Eile','der Schnelligkeit','des Sturms','des Blitzes'],r:t=>[5+t*5,10+t*8]},
{k:'frw',p:0,s:'B',n:['des Wanderers','des Windes','des Hirsches','des Geparden'],r:t=>[5+t*5,10+t*7]},
{k:'crit',p:0,s:'WGRM',n:['der Präzision','des Jägers','des Henkers','des Todes'],r:t=>[2+t*2,4+t*3]},
{k:'regen',p:0,s:'AHRBEM',n:['der Heilung','der Erneuerung','des Trolls','der Unsterblichkeit'],r:t=>[1+t,3+t*2]},
{k:'allsk',p:0,s:'MWH',minT:2,n:['der Meisterschaft','der Meisterschaft','der Meisterschaft','der Erleuchtung'],r:t=>[1,t>=3?2:1]},
{k:'stam',p:0,s:'ABEH',n:['der Zähigkeit','des Läufers','des Ochsen','des Unermüdlichen'],r:t=>[5+t*5,10+t*8]},
{k:'poison',p:1,s:'WGR',n:['Giftige','Ätzende','Verderbliche','Pestilente'],r:t=>[2+t*4,5+t*10]},
{k:'glutf',p:1,s:'HRMBE',n:['Habgierige','Gierige','Raffende','Unersättliche'],r:t=>[8+t*8,15+t*15]},
{k:'block',p:1,s:'O',n:['Wehrhafte','Abwehrende','Trutzige','Unerschütterliche'],r:t=>[3+t*2,5+t*4]},
{k:'thorns',p:0,s:'AOHE',n:['der Dornen','des Igels','der Stacheln','der Vergeltung'],r:t=>[2+t*4,6+t*10]},
{k:'xp',p:0,s:'HMR',n:['des Lernens','des Schülers','des Meisters','der Weisheit'],r:t=>[3+t*2,6+t*4]},
{k:'mregen',p:0,s:'MRHW',n:['der Sammlung','der Klarheit','der Meditation','der Andacht'],r:t=>[1+t,2+t*2]},
{k:'dmgred',p:0,s:'AHOB',n:['der Härte','des Ambosses','des Felsens','der Festung'],r:t=>[1+t*2,3+t*3]}];
const MODTXT={poison:v=>`+${v} Giftschaden`,glutf:v=>`+${v}% mehr Glut von Gegnern`,block:v=>`+${v}% Blockchance`,thorns:v=>`Angreifer erleiden ${v} Schaden`,xp:v=>`+${v}% Erfahrung`,mregen:v=>`Regeneriert ${v} Mana pro Sekunde`,dmgred:v=>`Erlittener Schaden um ${v} verringert`,ed:v=>`+${v}% erhöhter Schaden`,fire:v=>`+${v} Feuerschaden`,cold:v=>`+${v} Kälteschaden`,light:v=>`+${v} Blitzschaden`,edef:v=>`+${v}% erhöhte Verteidigung`,life:v=>`+${v} Leben`,mana:v=>`+${v} Mana`,mf:v=>`${v}% bessere Chance auf magische Gegenstände`,res:v=>`Alle Widerstände +${v}%`,spell:v=>`+${v}% Zauberschaden`,str:v=>`+${v} Stärke`,dex:v=>`+${v} Geschick`,vit:v=>`+${v} Vitalität`,ene:v=>`+${v} Energie`,ls:v=>`${v}% Lebensraub`,ias:v=>`+${v}% Angriffsgeschwindigkeit`,frw:v=>`+${v}% Laufgeschwindigkeit`,crit:v=>`+${v}% kritische Trefferchance`,regen:v=>`Regeneriert ${v} Leben pro Sekunde`,allsk:v=>`+${v} auf alle Fertigkeiten`,stam:v=>`+${v} Ausdauer`};
const MODORDER=['allsk','ed','spell','ias','crit','fire','cold','light','poison','ls','thorns','block','dmgred','edef','str','dex','vit','ene','life','mana','stam','res','regen','mregen','frw','mf','glutf','xp'];
const UNIQ=[
{n:'Hügelwacht',b:'Kurzschwert',lvl:3,m:{ed:70,str:6,life:15,ls:4}},
{n:'Grünes Blut',b:'Dolch',lvl:4,m:{ed:60,dex:10,ias:20,crit:8}},
{n:'Der Erste Stein',b:'Keule',lvl:5,m:{ed:90,vit:8,cold:6,regen:2}},
{n:'Wächterrund',b:'Rundschild',lvl:4,m:{edef:90,res:15,life:20}},
{n:'Grasläufer',b:'Stiefel',lvl:5,m:{frw:25,dex:8,stam:20,edef:60}},
{n:'Aschenwurzel',b:'Eichenstab',lvl:6,m:{spell:60,ene:15,mana:30,allsk:1}},
{n:'Himmelsriss',b:'Krummsäbel',lvl:7,m:{ed:120,light:12,ias:15,frw:10}},
{n:'Mantel des Hügels',b:'Kettenhemd',lvl:8,m:{edef:100,life:35,regen:3,stam:20}},
{n:'Ring der Blauen Stunde',b:'Ring',lvl:8,m:{mana:40,ene:12,spell:30,mf:20}},
{n:'Turmglocke',b:'Morgenstern',lvl:9,m:{ed:140,str:12,stam:25,res:15}},
{n:'Fäuste des Steinmetzes',b:'Kettenhandschuhe',lvl:10,m:{ias:20,str:10,crit:6,edef:70}},
{n:'Wolkenbrecher',b:'Zweihänder',lvl:12,m:{ed:160,light:20,str:15,crit:10}},
{n:'Krone der Zinnen',b:'Topfhelm',lvl:12,m:{edef:120,vit:15,res:20,mf:25}},
{n:'Blutring',b:'Ring',lvl:14,m:{ls:7,str:10,life:25,crit:5}},
{n:'Auge des Turms',b:'Amulett',lvl:16,m:{allsk:2,res:20,mf:40,life:30}},
{n:'Sturmtreter',b:'Plattenstiefel',lvl:18,m:{frw:30,light:10,res:25,edef:90}},
{n:'Gürtel der Ewigen Wache',b:'Kriegsgürtel',lvl:18,m:{life:50,vit:15,stam:30,edef:80}},
{n:'Stab des Blauen Mittags',b:'Aschestab',lvl:20,m:{spell:110,ene:25,allsk:2,fire:15}},
{n:'Kargsteins Ende',b:'Henkersbeil',lvl:22,m:{ed:220,ls:8,str:20,life:40}},
{n:'Mondsichel des Schweigens',b:'Mondsichel',lvl:24,m:{ed:180,cold:25,dex:20,ias:25}},
{n:'Grabsteinwall',b:'Grabsteinschild',lvl:28,m:{edef:150,res:35,vit:25,life:50}},
{n:'Drachenzahn Vaels',b:'Drachenzahn',lvl:30,m:{ed:240,fire:40,allsk:1,ls:6,crit:12}},
{n:'Totenmaske',b:'Totenkrone',lvl:30,m:{edef:150,allsk:2,life:60,ls:4}},
{n:'Schwarze Haut',b:'Schwarzer Harnisch',lvl:30,m:{edef:180,str:20,vit:20,res:30}},
{n:'Nachtgesang',b:'Nachtzahn',lvl:34,m:{ed:200,dex:30,ias:30,crit:15,cold:20}}];
const RARE1=['Grab','Blut','Schatten','Aschen','Sturm','Knochen','Dorn','Nacht','Eisen','Raben','Wolfs','Seelen','Dämmer','Gram','Himmels','Stein'];
const RARE2={weapon:['biss','klinge','zahn','hieb','schnitt','fang'],offhand:['wall','wehr','schirm'],helm:['krone','haube','stirn'],armor:['mantel','haut','panzer','hülle'],gloves:['griff','faust','klaue'],boots:['schritt','pfad','tritt'],belt:['band','gurt','schnur'],ring:['kreis','auge','spirale'],amulet:['träne','siegel','herz','stern']};
const MON={
skel:{n:'Knochenwicht',hp:24,dmg:[3,6],spd:2.3,r:.3,range:1,wind:.5,cd:1.2,xp:12,kind:'melee'},
ghoul:{n:'Grabschänder',hp:36,dmg:[4,8],spd:2.7,r:.33,range:1,wind:.45,cd:1.1,xp:16,kind:'melee'},
spider:{n:'Höhlenspinne',hp:15,dmg:[2,5],spd:4,r:.28,range:.9,wind:.32,cd:.9,xp:9,kind:'melee'},
archer:{n:'Knochenschütze',hp:18,dmg:[3,6],spd:2.1,r:.3,range:7,wind:.6,cd:1.9,xp:14,kind:'ranged',proj:'arrow'},
cult:{n:'Aschekultist',hp:22,dmg:[5,8],spd:2,r:.3,range:6.5,wind:.8,cd:2.2,xp:18,kind:'ranged',proj:'fire'},
wraith:{n:'Klageseele',hp:28,dmg:[4,7],spd:3,r:.3,range:6,wind:.7,cd:2,xp:20,kind:'ranged',proj:'frost'},
golem:{n:'Steinkoloss',hp:90,dmg:[9,15],spd:1.5,r:.5,range:1.3,wind:.95,cd:2.2,xp:45,kind:'melee',scale:1.5},
scorp:{n:'Sandskorpion',hp:30,dmg:[4,8],spd:2.6,r:.36,range:1.1,wind:.45,cd:1.3,xp:18,kind:'melee'}};
// every monster comes in many breeds: colours, size, strength, element and the depth they first appear
const RMP={pale:['#4a4840','#a8a49a','#e8e4da','#ffffff'],darkbone:['#0e0c0a','#2a2620','#4a443a','#6a6254'],char:['#1a0e08','#3a2214','#6a4028','#a06a40'],ice:['#1a3048','#5a88b0','#a8d0f0','#e8f8ff'],
  gold:['#3a2406','#8a6418','#d0a838','#fff0a0'],greenbone:['#1a2a10','#4a6a2a','#8aa858','#c8e098'],rot:['#1a2008','#4a5a14','#7a8a2a','#b0b860'],blood:['#200404','#5a0c08','#9a2014','#d04a30'],
  ash:['#1a1816','#3a3632','#6a6460','#9a948c'],bog:['#0c140a','#22301a','#3e5230','#5e7848'],red:['#200402','#4a0c06','#7a1a0e','#b03a1e'],venom:['#06140a','#12341a','#2a6a2a','#6ab040'],
  shadow:['#06040c','#14102a','#2a2050','#4e40a0'],ember:['#1e0602','#5a1404','#b03a08','#ff8a2a'],frostb:['#081428','#1a3a6a','#3a6ab0','#9ac4ff'],giant:['#04040a','#0e0e18','#1e1e30','#3c3c58'],
  robeB:['#06102a','#0e2a5a','#1c4a8a','#3a6ab0'],robeG:['#081608','#16341a','#2a5a2a','#4a8a3a'],robeD:['#120208','#2a0612','#4a0e20','#6e1e34'],robeV:['#08040e','#160c26','#2a1848','#4a3478'],
  ghostV:['#140a2a','#4a2a8a','#8a6ad0','#e0d0ff'],ghostE:['#3a1004','#a0400c','#ff9a3a','#ffe0a0'],ghostG:['#0e2a0e','#3a8a3a','#8ae070','#e8ffd0'],
  moss:['#14200a','#2a3a14','#4a6420','#7a9a3a'],iceS:['#1a2a3a','#4a6a8a','#8ab0d0','#d8f0ff'],lava:['#1a0602','#4a1004','#8a2a08','#e0661a'],boneS:['#3e3626','#8a7e62','#c8bc9c','#ece2c8'],
  sand:['#3a2a10','#7a5a2a','#b08a48','#e0c080'],black:['#060608','#141418','#26262c','#44444e'],crystal:['#0e2a4a','#2a6ab0','#7ac8ff','#e0f8ff'],royal:['#1a1004','#4a3008','#8a6418','#d8b048']};
const VARS=[
 ['skel','skel','Knochenwicht',{},1,1,1,1,null,null,1,3],['bleich','skel','Bleichknochen',{bone:'pale'},1.1,1,1.05,1,null,null,1,2],['dunkelgebein','skel','Dunkelgebein',{bone:'darkbone'},1.4,1.25,1,1.05,null,null,3,2],
 ['aschegebein','skel','Aschegebein',{bone:'char'},1.6,1.35,1,1.05,'fire',null,5,2],['frostgebein','skel','Frostgebein',{bone:'ice'},1.7,1.35,.95,1.05,'frost',null,7,2],['grabritter','skel','Grabritter',{bone:'ash',dark:'black'},2.4,1.6,.9,1.18,null,null,9,1.4],['goldgebein','skel','Goldgebein',{bone:'gold'},2.6,1.8,1.05,1.1,null,null,12,1],
 ['archer','archer','Knochenschütze',{},1,1,1,1,null,null,1,2],['dunkelschuetze','archer','Dunkelschütze',{bone:'darkbone'},1.4,1.3,1,1,null,null,3,1.5],['brandschuetze','archer','Brandschütze',{bone:'char'},1.6,1.4,1,1,'fire','fire',5,1.4],
 ['frostschuetze','archer','Frostschütze',{bone:'ice'},1.7,1.4,1,1,'frost','frost',7,1.4],['giftschuetze','archer','Giftschütze',{bone:'greenbone'},1.8,1.5,1,1,'poison','poison',9,1.4],
 ['ghoul','ghoul','Grabschänder',{},1,1,1,1,null,null,2,2],['faeulnisghul','ghoul','Fäulnisghul',{flesh:'rot'},1.4,1.2,.95,1.05,'poison',null,3,2],['blutghul','ghoul','Blutghul',{flesh:'blood'},1.5,1.4,1.3,1,null,null,5,1.6],
 ['bleichghul','ghoul','Bleichghul',{flesh:'ash'},1.9,1.5,1.1,1.08,null,null,7,1.4],['moorghul','ghoul','Moorghul',{flesh:'bog'},2.4,1.7,1,1.15,'poison',null,10,1.2],
 ['spider','spider','Höhlenspinne',{},1,1,1,1,null,null,1,3],['giftspinne','spider','Giftspinne',{dark:'venom'},1.1,1.1,1.05,1,'poison',null,1,3],['blutspinne','spider','Blutspinne',{dark:'red'},1.4,1.3,1.1,1.05,null,null,3,2.5],
 ['schattenspinne','spider','Schattenspinne',{dark:'shadow'},1.5,1.4,1.35,1,null,null,5,2.5],['riesenspinne','spider','Riesenspinne',{dark:'giant'},3.5,1.9,.85,1.7,'poison',null,6,1.4],['aschespinne','spider','Aschespinne',{dark:'ember'},1.8,1.5,1.15,1.05,'fire',null,7,2],
 ['frostspinne','spider','Frostspinne',{dark:'frostb'},1.9,1.5,1.1,1.05,'frost',null,8,2],['brutmutter','spider','Brutmutter',{dark:'giant'},5.5,2.2,.7,2.2,'poison',null,12,.9],
 ['cult','cult','Aschekultist',{},1,1,1,1,'fire','fire',4,2],['frostkultist','cult','Frostkultist',{robe:'robeB'},1.3,1.2,1,1,'frost','frost',5,1.5],['giftkultist','cult','Giftkultist',{robe:'robeG'},1.5,1.3,1,1,'poison','poison',6,1.5],
 ['blutkultist','cult','Blutkultist',{robe:'robeD'},1.9,1.5,1,1.05,'fire','fire',8,1.2],['schattenkultist','cult','Schattenkultist',{robe:'robeV'},2.2,1.6,1.1,1.05,'frost','frost',10,1.2],
 ['wraith','wraith','Klageseele',{},1,1,1,1,'frost','frost',4,2],['schattenseele','wraith','Schattenseele',{ghost:'ghostV'},1.4,1.3,1.25,1,'frost','frost',6,1.5],['glutgeist','wraith','Glutgeist',{ghost:'ghostE'},1.7,1.4,1.1,1,'fire','fire',8,1.4],['giftgeist','wraith','Giftgeist',{ghost:'ghostG'},1.9,1.5,1.1,1,'poison','poison',10,1.3],
 ['golem','golem','Steinkoloss',{},1,1,1,1,null,null,6,1.4],['moorkoloss','golem','Moorkoloss',{stone:'moss'},1.3,1.2,1,1.05,'poison',null,7,1],['eiskoloss','golem','Eiskoloss',{stone:'iceS'},1.6,1.4,.95,1.1,'frost',null,9,1],
 ['lavakoloss','golem','Lavakoloss',{stone:'lava'},1.9,1.6,.95,1.12,'fire',null,12,1],['knochenkoloss','golem','Knochenkoloss',{stone:'boneS'},2.3,1.8,1,1.2,null,null,14,.8],
 ['scorp','scorp','Sandskorpion',{},1,1,1,1,'poison',null,1,2.4],['giftskorpion','scorp','Giftskorpion',{sand:'venom'},1.2,1.15,1.05,1,'poison',null,2,2.4],['hoehlenskorpion','scorp','Höhlenskorpion',{sand:'black'},1.4,1.3,1.1,1.05,'poison',null,3,2.2],
 ['blutskorpion','scorp','Blutskorpion',{sand:'red'},1.6,1.5,1.15,1.05,'poison',null,5,2],['feuerskorpion','scorp','Feuerskorpion',{sand:'ember'},1.8,1.6,1.1,1.08,'fire',null,7,1.8],['kristallskorpion','scorp','Kristallskorpion',{sand:'crystal'},2.1,1.7,1.05,1.1,'frost',null,9,1.6],
 ['schattenskorpion','scorp','Schattenskorpion',{sand:'shadow'},2.4,1.8,1.3,1.1,'poison',null,11,1.4],['kaiserskorpion','scorp','Kaiserskorpion',{sand:'royal'},5,2.3,.8,1.9,'poison',null,11,.8]];
const VAR={};for(const[id,base,n,pal,hp,dmg,spd,scale,elem,proj,minF,w]of VARS)VAR[id]={id,base,n,pal,hp,dmg,spd,scale,elem,proj,minF,w};
function varPool(f){const L=Object.values(VAR).filter(v=>v.minF<=f);return L.map(v=>[v.id,v.w*(f-v.minF<4?1.6:1)])}
const BOSSES=[
{look:'knight',n:'Morgrath, der Hügeltyrann',moves:['slam','sweep','charge']},
{look:'weaver',n:'Die Ascheweberin',moves:['nova','summon','meteor','sweep']},
{look:'warden',n:'Graukeil, Wächter der Tiefe',moves:['slam','charge','meteor','nova','sweep']}];
const ELITE_AFF={schnell:'Schnell',feuer:'Feuerverzaubert',stein:'Steinhaut',stark:'Extra stark',kalt:'Kälteverzaubert'};
const SKILLS=[
{id:'whirl',n:'Wirbelhieb',req:1,cd:.7,key:1,mana:l=>5+l,desc:l=>`Trifft alle Feinde im Umkreis mit ${110+l*15}% Waffenschaden.`},
{id:'fire',n:'Glutkugel',req:1,cd:.35,key:2,mana:l=>4+Math.round(l*.8),desc:l=>`Feuerkugel, explodiert für ${Math.round(spellBase('fire',l))} Feuerschaden.`},
{id:'nova',n:'Frostring',req:3,cd:1.2,key:3,mana:l=>8+l,desc:l=>`Eisring um dich: ${Math.round(spellBase('nova',l))} Kälteschaden, verlangsamt Feinde.`},
{id:'charge',n:'Sturmangriff',req:6,cd:1.5,key:4,mana:l=>6+l,desc:l=>`Stürmt bis zu 6 Schritte vor, ${150+l*20}% Waffenschaden im Aufprall. Unverwundbar beim Sturm.`},
{id:'ward',n:'Knochenwall',req:9,cd:6,key:5,mana:l=>12+l*2,desc:l=>`Schild absorbiert ${Math.round(spellBase('ward',l))} Schaden für 15 Sekunden.`},
{id:'chain',n:'Kettenblitz',req:12,cd:.5,key:6,mana:l=>9+Math.round(l*1.5),desc:l=>`Blitz springt auf ${3+Math.floor(l/3)} Ziele, je ${Math.round(spellBase('chain',l))} Blitzschaden.`}];
const SKBY={};SKILLS.forEach(s=>SKBY[s.id]=s);
