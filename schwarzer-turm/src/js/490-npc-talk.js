/* ---------- people who talk: Odalinde and her stall, a name and a voice for every trader, Eldrik the chronicler beside the tower ---------- */
// typed speech, shared by every talking face
const TYW={txt:'',n:0,at:0};
function npcSay(t){if(!t)return;TYW.txt=t;TYW.n=0;TYW.at=performance.now()}
function twTick(dt){const el=$('npcSay');if(!el)return;if(TYW.n<TYW.txt.length)TYW.n=Math.min(TYW.txt.length,TYW.n+dt*75);const s=TYW.txt.slice(0,Math.floor(TYW.n));if(el.textContent!==s)el.textContent=s}
const sayHTML=(name,port)=>`<div class="npchead"><img class="px" src="${port}" alt=""><div class="npcsay"><b>${name}</b><p id="npcSay">${TYW.txt.slice(0,Math.floor(TYW.n))}</p></div></div>`;
const hashS=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const who=()=>myCls().n;

// pixel portraits, 24×24, built from a few parts
const PORTC={};
function shade(hex,f){const n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f))));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')}
function portrait(s){const key=JSON.stringify(s);if(PORTC[key])return PORTC[key];const c=document.createElement('canvas');c.width=c.height=24;const g=c.getContext('2d'),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  R(0,0,24,24,s.bg||'#140e0a');if(s.glow){const q=g.createRadialGradient(s.glow[0],s.glow[1],0,s.glow[0],s.glow[1],10);q.addColorStop(0,s.glow[2]);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,24,24)}
  if(s.hair&&(s.hs==='long'||s.hs==='braid'))R(5,6,14,13,shade(s.hair,.8));
  R(2,18,20,6,s.coat);R(2,18,20,1,shade(s.coat,1.35));if(s.scarf)R(7,17,10,3,s.scarf);
  R(9,15,6,4,shade(s.skin,.8));R(6,5,12,12,s.skin);R(6,5,12,2,shade(s.skin,1.12));R(5,9,1,4,shade(s.skin,.85));R(18,9,1,4,shade(s.skin,.85));
  R(8,10,2,1,'#140c06');R(14,10,2,1,'#140c06');R(8,9,2,1,shade(s.skin,.75));R(14,9,2,1,shade(s.skin,.75));if(s.eye)R(14,10,1,1,s.eye);
  R(11,11,2,2,shade(s.skin,.86));R(10,14,4,1,shade(s.skin,.62));
  if(s.scar){R(13,7,1,1,'#7a3a2a');R(14,8,1,2,'#7a3a2a');R(15,11,1,2,'#7a3a2a')}if(s.patch){R(13,9,4,3,'#0a0806');R(6,8,12,1,'#0a0806')}
  if(s.beard){R(7,13,10,5,s.beard);R(8,13,8,1,shade(s.beard,1.25));R(10,14,4,1,shade(s.skin,.5));if(s.long)R(8,18,8,4,s.beard)}
  const h=s.hair;if(h&&s.hs!=='bald'){R(6,4,12,3,h);R(5,5,2,5,h);R(17,5,2,5,h);R(7,4,10,1,shade(h,1.3));if(s.hs==='braid'){R(18,10,2,9,h);R(18,12,2,1,shade(h,.7));R(18,15,2,1,shade(h,.7));R(18,19,2,2,s.scarf||'#8a1a1a')}}
  if(s.hat==='hood'){R(4,2,16,4,s.hatC);R(3,5,3,13,s.hatC);R(18,5,3,13,s.hatC);R(5,2,14,1,shade(s.hatC,1.3))}
  else if(s.hat==='wide'){R(2,4,20,2,s.hatC);R(6,0,12,5,s.hatC);R(6,3,12,1,shade(s.hatC,.6));R(2,4,20,1,shade(s.hatC,1.3))}
  else if(s.hat==='cap'){R(5,2,14,4,s.hatC);R(5,2,14,1,shade(s.hatC,1.3));R(15,5,5,1,shade(s.hatC,.7))}
  if(s.crow){R(17,13,6,5,'#0e0c10');R(19,11,4,3,'#0e0c10');R(22,12,2,1,'#3a3430');R(20,12,1,1,'#ffd040');R(16,15,2,3,'#1a1620')}
  if(s.lamp){R(1,14,4,5,'#3a2a14');R(2,15,2,3,'#ffd070')}
  return PORTC[key]=c.toDataURL()}

// Odalinde: smuggler of the hill, ash-white braid, a scar, a red scarf and a crow called Grimbart
const ODA={name:'Odalinde',p:{skin:'#d8ae88',hair:'#e8e2d6',hs:'braid',coat:'#1e2a22',scarf:'#9a1a14',scar:1,eye:'#6ad0a0',crow:1,bg:'#120c0a',glow:[4,6,'rgba(255,180,90,.35)']},
  open:['Na sieh an. Noch am Leben. Das ist gut fürs Geschäft.','Grimbart hat dich schon von Weitem gerochen. Glut und Blut, sagt er.','Komm näher, ich beiße nicht. Grimbart schon, aber selten.','Was brauchst du? Tränke, Stahl, oder ein bisschen Glück?',
    'Du siehst aus, als hättest du heute schon dreimal sterben sollen.','Ich hab Ware, die die Wache nie zu Gesicht bekommen hat. Frag nicht, woher.','Die Brücken knarren heute. Gutes Zeichen. Dann kommen Kunden.','Willkommen an meinem Stand. Das Beste auf dem Hügel, das Einzige auf dem Hügel.',
    'Hast du Morgraths Brüllen gehört letzte Nacht? Ich verkauf ihm keine Tränke. Noch nicht.','Grimbart, sei still. Das ist Kundschaft.'],
  night:['Nachts sind die Preise dieselben, aber die Geschichten besser.','Du kommst im Dunkeln? Mutig. Oder dumm. Beides kauft gut ein.','Halt dich ans Licht meiner Laterne. Draußen hat die Nacht Zähne.'],
  hurt:['Du blutest auf meine Ware. Kauf einen Trank, bevor ich dir die Pfütze berechne.','Setz dich nicht hin, sonst stehst du nicht mehr auf. Hier, Heiltränke.'],
  rich:['Du klimperst ja richtig. Komm, lass uns Freunde werden.','So viel Glut, und so wenig Zeit, sie auszugeben. Ich helfe dir.'],
  first:'Odalinde. Händlerin, Schmugglerin, und das Einzige auf diesem Hügel, das nicht versucht, dich umzubringen. Der Vogel heißt Grimbart. Fass ihn nicht an.',
  buy:['Gute Wahl. Ich hätte es selbst behalten, wenn ich nicht so geschäftstüchtig wäre.','Abgemacht. Grimbart, schreib’s auf.','Damit überlebst du bestimmt zwei Ebenen länger. Mindestens eine.','Das bringt Glück. Hat bei seinem Vorbesitzer nur knapp nicht gereicht.',
    'Glut gegen Ware. So einfach ist die Welt hier oben.','Pass gut darauf auf. Umtausch gibt es nicht, Tote reklamieren selten.','Du hast einen Blick fürs Gute. Oder Glück. Beides kostet gleich.','Noch was? Ich hab heute meinen großzügigen Tag. Fast.'],
  sell:['Hm. Ein bisschen Blut dran. Ich zieh dir das nicht ab.','Den Kram nehm ich dir ab. Irgendwer da draußen braucht immer was.','Für das hier zahlt mir ein Sammler auf den Inseln das Doppelte. Sag ihm nichts.','Wieder was von den Toten? Die tragen erstaunlich gutes Zeug.',
    'In Ordnung. Glut für dich, Staub für mein Regal.','Grimbart mag glänzende Sachen. Das hier glänzt nicht. Trotzdem, gekauft.'],
  poor:['Dafür reicht deine Glut nicht. Geh, töte etwas, komm wieder.','Anschreiben? Hier oben? Bei deiner Lebenserwartung?','Grimbart lacht dich aus. Ich nicht. Ich bin höflich.','Zu wenig Glut. Die Toten im Turm haben genug, frag die.'],
  gamble:['Ein Griff in den Sack. Was drin ist, weiß nur der Turm.','Würfel rollen, Glut brennt. Schau rein.','Glück ist auch nur eine Ware. Meistens.'],
  jackpot:['Bei den Brücken! Das hätte ich dir nie verkauft, wenn ich’s gewusst hätte.','Gib das nicht so schnell her. So was sehe ich alle Jubeljahre.']};

// a name, a face and a temper for every other trader; the same island always gives the same person
const TN1=['Bertrun','Halmar','Ysolde','Gerwin','Mira','Oswin','Tilda','Ansgar','Hedda','Kunrat','Liutgard','Volkmar','Rike','Edelbert','Swanhild','Godeke','Imma','Ortwin','Berthe','Reinold','Adelheid','Lambert','Gisla','Wido','Hiltrud','Jorek','Mechthild','Ruprecht','Fenna','Dietlind','Amalric','Odo','Wendel','Ragna','Notker','Gunda'];
const TN2=['aus Dornfurt','vom Grauen Steg','aus der Nebelsenke','vom Rabenfels','aus Kesselbrunn','Krummfinger','Silberzahn','vom Aschepass','Halbmond','aus Wolfsgrund','Lederhand','vom Kalten Moor','Rußbart','aus Brückwacht','Eisenzunge','vom Hohen Riff'];
const PERS={
  grumpy:{open:['Was willst du? Ich hab nicht ewig Zeit.','Kauf oder geh. Der Wind hier oben ist kalt.','Noch so ein Held. Die letzten drei liegen da drüben.','Hm. Glut dabei? Dann red.'],buy:['Hm. Passt.','Nimm und geh mir aus der Sonne.','Gut. Nächster.','Nicht zerbrechen.'],sell:['Schrott. Aber ich nehm’s.','Gibt nicht viel dafür. Ist halt so.','Na gut. Weg damit.'],poor:['Kein Geld, kein Geschäft.','Und mit was willst du zahlen? Mit Blicken?'],gamble:['Wie du meinst.','Dein Pech, nicht meins.']},
  cheerful:{open:['Ein Kunde! Endlich jemand mit Puls!','Hallo, hallo! Komm her, schau dich um!','Was für ein herrlicher Tag zum Handeln, findest du nicht?','Ich hab gewusst, dass heute jemand Nettes kommt!'],buy:['Wunderbar! Möge es dir gute Dienste leisten!','Oh, das steht dir!','Ein Geschäft, das uns beide reicher macht!','Danke, danke! Komm bald wieder!'],sell:['Oh, ein Schatz! Na ja, fast.','Herrlich, das kann ich gebrauchen!','Ich geb dir einen fairen Preis, versprochen!'],poor:['Ach je, das reicht noch nicht ganz. Nächstes Mal!','Keine Sorge, Glut findet man überall. Meistens in Monstern.'],gamble:['Oh, wie aufregend!','Ich drück dir die Daumen!']},
  nervous:{open:['Oh. Du bist kein Monster. Gut. Sehr gut.','Schnell, bevor die Spinnen zurückkommen.','Ich handle nur kurz, dann pack ich zusammen. Hast du was gehört?','Bitte keine plötzlichen Bewegungen.'],buy:['Ja, ja, nimm. Schnell.','Gute Wahl, glaube ich. Hoffentlich.','Danke. Bleib noch kurz hier, ja?'],sell:['Ist das verflucht? Sag mir, dass das nicht verflucht ist.','Gut, gut. Ich nehm’s. Glaub ich.'],poor:['Das reicht nicht. Tut mir leid. Bitte nicht wütend werden.','Zu wenig. Oh je.'],gamble:['Ich will gar nicht hinsehen.','Hoffentlich beißt es nicht.']},
  sly:{open:['Psst. Für dich hab ich Sonderpreise. Für alle anderen auch.','Ah, ein Kenner. Das seh ich sofort.','Alles hier ist ehrlich erworben. Mehr oder weniger.','Komm, komm. Was das Herz begehrt, und was es nicht wissen sollte.'],buy:['Ein Schnäppchen. Für mich.','Du hast mich ruiniert. Fast.','Erzähl keinem, was du bezahlt hast.'],sell:['Oh, das ist beinahe wertlos. Beinahe.','Ich bin heute großzügig. Merk dir das.'],poor:['Ohne Glut keine Freundschaft, mein Lieber.','Komm wieder, wenn deine Taschen schwerer sind.'],gamble:['Der Sack lügt nie. Ich manchmal.','Viel Glück. Du wirst es brauchen.']},
  pious:{open:['Die Flamme schütze dich, Reisender.','Der Himmel ist zerbrochen, aber nicht die Hoffnung.','Setz dich, wenn du magst. Wir handeln in Frieden.','Ich bete jeden Morgen für die, die in den Turm gehen.'],buy:['Möge es dich beschützen.','Gesegnet sei dein Weg.','Nimm es, und kehre heil zurück.'],sell:['Die Toten brauchen es nicht mehr.','Ich gebe es weiter an jene, die es brauchen.'],poor:['Die Flamme gibt, wenn die Zeit reif ist. Noch ist sie es nicht.','Kehre wieder, wenn du mehr hast.'],gamble:['Das Schicksal entscheidet.','Möge der Turm dir gnädig sein.']}};
const PK=Object.keys(PERS),SKINS=['#e0b48a','#c89a74','#a87452','#8a5a3a','#f0c8a0'],HAIRS=['#2a1a0e','#5a3a1a','#8a5a2a','#c8a060','#d8d0c0','#6a2a14','#3a3a3a'],COATS=['#3a2a4a','#2a3a2a','#4a2a1a','#2a2a3a','#5a4a2a','#3a1a1a','#2a3a4a'],HATS=['none','cap','wide','hood','none'],HSTY=['short','long','bald','braid','short'];
function trName(x,y){const h=hashS(Math.round(x)+','+Math.round(y));return TN1[h%997%TN1.length]+' '+TN2[(h>>>5)%997%TN2.length]}
function trader(o){if(!o||o.type!=='merchant')return null;if(isHomeMerchant(o))return{...ODA,pers:null,home:1};if(o.tr)return o.tr;
  const h=hashS(Math.round(o.x)+','+Math.round(o.y)),r=k=>(h>>>k)%997;const nm=o.ev||o.peddler?o.name:trName(o.x,o.y);
  const p={skin:SKINS[r(1)%5],hair:HAIRS[r(2)%7],hs:HSTY[r(3)%5],coat:COATS[r(4)%7],hat:HATS[r(6)%5],hatC:COATS[r(7)%7],beard:r(8)%3===0?HAIRS[r(2)%7]:null,patch:r(9)%11===0,scar:r(10)%7===0,lamp:1,scarf:r(11)%3===0?'#7a5a1a':null};
  return o.tr={name:nm,p,pers:o.ev?'nervous':PK[r(12)%PK.length]}}
const isHomeMerchant=o=>o.type==='merchant'&&!o.name;
function lineFor(t,k){if(t.home){const ctx=k==='open'?(!P.odaMet?null:P.hp<P.d.life*.35?'hurt':G.night&&Math.random()<.5?'night':P.glut>3000&&Math.random()<.3?'rich':'open'):k;
    if(k==='open'&&!P.odaMet){P.odaMet=1;return ODA.first}return pickNew(ODA[ctx]||ODA.open,'oda'+ctx)}
  const L=PERS[t.pers][k]||PERS[t.pers].open;return pickNew(L,t.name+k)}
// never the same line twice in a row
const LAST={};function pickNew(a,key){if(a.length<2)return a[0];let s;do s=a[Math.floor(Math.random()*a.length)];while(s===LAST[key]);LAST[key]=s;return s}

// the shop panel gets a face and a voice
const _openShopN=openShop;openShop=function(o){const t=trader(o)||{...ODA,home:1};npcSay(lineFor(t,'open'));G.shopT=t;_openShopN(o)};
const _buildShopN=buildShop;buildShop=function(){_buildShopN();const t=G.shopT||{...ODA,home:1},el=$('pShop'),h=el.querySelector('h2'),hint=h&&h.nextElementSibling;
  if(h)h.firstChild.textContent=t.name+' ';if(hint&&hint.classList.contains('hint'))hint.outerHTML=sayHTML(t.home?'Odalinde':t.name,portrait(t.p))};
const shopTalk=k=>{if($('pShop').hidden||!G.shopT)return;if(performance.now()-TYW.at<900&&k!=='poor'&&k!=='gamble')return;npcSay(lineFor(G.shopT,k))};
const _qIncN=qInc;qInc=function(k,n){_qIncN(k,n);if(k==='buy'||k==='sell')shopTalk(k)};
const _logN=log;log=function(m,c){if(m==='Nicht genug Glut.')shopTalk('poor');return _logN(m,c)};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-gamble]');if(!b||!P||P.glut<+b.dataset.cost)return;const n=P.inv.length;setTimeout(()=>{const it=P.inv[P.inv.length-1];if(P.inv.length>n&&it&&it.rar==='unique'&&G.shopT&&G.shopT.home)npcSay(pickNew(ODA.jackpot,'jp'));else shopTalk('gamble')},0)},true);

