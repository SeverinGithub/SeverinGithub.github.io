/* ---------- the narrator: a few lines the first time you reach a place · procedural music layers for bosses, night and rain ---------- */
const TALES={
 start:['Der Hügel','Man sagt, der Turm war schon da, bevor der Himmel zerbrach. Jetzt treiben die Inseln um ihn wie Asche um ein Feuer, und wer Glut sammelt, kann sich hier oben alles kaufen. Fast alles.'],
 f1:['Das Tor','Die Luft unter dem Turm riecht nach kaltem Stein und altem Wachs. Irgendwo tief unten schlägt etwas, langsam wie ein Herz, das sich an seinen Rhythmus nicht mehr erinnert.'],
 f3:['Morgraths Halle','Hier hat der Hügeltyrann seinen Thron aus Knochen gebaut. Er war einmal ein Wächter wie du. Dann hat er zu lange in die Tiefe gehört.'],
 f5:['Die Gewölbe','Die Wände tragen Zeichen, die keiner der Lebenden lesen kann. Die Toten murmeln sie im Schlaf.'],
 f9:['Unter den Wurzeln','So tief reicht kein Licht vom Himmel. Was hier glüht, glüht aus eigenem Hunger.'],
 f15:['Die stille Tiefe','Selbst die Fackeln brennen hier leiser. Jeder Schritt klingt, als würde ihn jemand hinter dir wiederholen.'],
 f25:['Der Grund','Niemand, der so weit gegangen ist, hat davon erzählt. Vielleicht, weil keiner zurückkam. Vielleicht, weil keiner mehr zurück wollte.'],
 i_village:['Brennende Dörfer','Hier lebten Menschen, bevor die Kultisten kamen. Das Feuer brennt noch, als hätte es niemand gewagt, es zu löschen.'],
 i_ruins:['Die Ruinen','Säulen ohne Dach, Treppen ins Nichts. Wer hier gebaut hat, glaubte noch, der Himmel würde halten.'],
 i_grave:['Gräberinsel','Die Steine tragen keine Namen mehr. Nur die Knochen darunter erinnern sich, und sie sind nicht freundlich.'],
 i_forest:['Waldinsel','Bäume, die in den Himmel wachsen, obwohl unter ihnen nichts mehr ist als Wind. In ihrem Schatten weben die Spinnen.'],
 i_camp:['Ein Lager','Ein Feuer, ein paar Zelte, ein Händler mit wachen Augen. Hier oben ist jede Glut ein Versprechen, und jeder Fremde eine Frage.'],
 i_rock:['Felsinsel','Kahl, windig, still. Nur die Steinkolosse scheinen sich hier zu Hause zu fühlen.'],
 i_wild:['Die Wildnis','Gras, das über Abgründe wächst. Hier hat niemand das Sagen, außer dem, der am lautesten zuschlägt.'],
 i_boss:['Ein Revier','Die Luft wird schwer. Hier herrscht einer der Acht, und er hat dich längst bemerkt.'],
 night:['Die erste Nacht','Wenn die Sonne hinter die Inseln fällt, wachen Dinge auf, die das Licht scheuen. Sie sind stärker im Dunkeln. Aber sie tragen auch mehr bei sich.'],
 rift:['Der Riss','Kein Ort, sondern eine Erinnerung des Turms an einen Ort. Die Gesetze hier gelten nur, solange der Riss offen ist.'],
 diff1:['Albtraum','Die Welt ist dieselbe. Aber alles in ihr hat dich wiedererkannt, und es hat sich vorbereitet.'],
 diff2:['Hölle','Der Himmel hat aufgehört, so zu tun, als wäre er auf deiner Seite.'],
 act1:['Akt II · Die Himmelsinseln','Morgrath ist gefallen, und mit ihm das Schweigen der Brücken. Draußen warten Inseln, Dörfer in Flammen und acht Herren, die sich den zerbrochenen Himmel teilen.'],
 act2:['Akt III · Feuer und Nebel','Die Kultisten der Asche haben dich bemerkt. Wo ihr Rauch aufsteigt, wird der Nebel dicht, und im Nebel verlieren selbst Knochen ihre Richtung.'],
 act3:['Akt IV · Die Tiefe','Der Turm ruft lauter. Was unter ihm schläft, war nie ganz tot.'],
 act4:['Akt V · Der schwarze Himmel','Die Aschemutter wartet am Rand der Welt. Sie hat jede Insel geboren, und sie kann jede zurücknehmen.']};
let taleQ=[],taleT=0;
function tale(k){P.tales=P.tales||{};if(P.tales[k]||!TALES[k])return;P.tales[k]=1;taleQ.push(k)}
function taleTick(dt){let el=$('tale');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="tale" hidden><div class="th"></div><div class="tt"></div><div class="tc">Klick zum Schließen</div></div>');el=$('tale');el.addEventListener('click',()=>{taleT=0})}
  if(taleT>0){taleT-=dt;if(taleT<=0){el.classList.remove('show');setTimeout(()=>{if(taleT<=0)el.hidden=true},600)}return}
  if(!taleQ.length||G.state!=='play')return;const k=taleQ.shift(),[h,t]=TALES[k];el.querySelector('.th').textContent=h;el.querySelector('.tt').textContent=t;el.hidden=false;requestAnimationFrame(()=>el.classList.add('show'));taleT=Math.min(14,5+t.length/22)}
function storyTick(dt){if(!P||!G.map)return;G.stT=(G.stT||0)-dt;if(G.stT<=0){G.stT=.5;const m=G.map;
    if(m.world){const cx=Math.floor(P.x/CH),cy=Math.floor(P.y/CH),I=islandOf(cx,cy);if(!I||I.kind==='home')tale('start');else tale('i_'+I.kind);if(G.night)tale('night')}
    else if(G.floor==='rift')tale('rift');else if(typeof G.floor==='number')for(const f of[1,3,5,9,15,25])if(G.floor>=f&&G.floor<f+2)tale('f'+f);
    if(diff()>=1)tale('diff1');if(diff()>=2)tale('diff2');const q=curQ();if(q&&q.a>0)tale('act'+q.a)}
  taleTick(dt)}

// music layers: drums and a drone when a boss is awake, a slow pad at night, rain on the sound bus
const MX={};
function mxInit(){if(!AC||MX.out)return;MX.out=AC.createGain();MX.out.gain.value=0;MX.out.connect(AC.destination);
  MX.pad=AC.createGain();MX.pad.gain.value=0;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;lp.connect(MX.pad);MX.pad.connect(MX.out);
  for(const f of[110,130.8,164.8,220]){const o=AC.createOscillator(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();o.type='triangle';o.frequency.value=f;o.detune.value=rnd(-9,9);g.gain.value=.04;l.frequency.value=rnd(.04,.12);lg.gain.value=.03;l.connect(lg);lg.connect(g.gain);o.connect(g);g.connect(lp);o.start();l.start()}
  MX.rain=AC.createGain();MX.rain.gain.value=0;const nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const ns=AC.createBufferSource();ns.buffer=nb;ns.loop=true;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=900;const lp2=AC.createBiquadFilter();lp2.type='lowpass';lp2.frequency.value=5200;ns.connect(hp);hp.connect(lp2);lp2.connect(MX.rain);MX.rain.connect(SFXG||AC.destination);ns.start();
  MX.boss=AC.createGain();MX.boss.gain.value=0;MX.boss.connect(MX.out);const dl=AC.createBiquadFilter();dl.type='lowpass';dl.frequency.value=240;const dg=AC.createGain();dg.gain.value=.07;dl.connect(dg);dg.connect(MX.boss);
  for(const[f,dt]of[[55,0],[82.4,7],[110,-5]]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=dt;o.connect(dl);o.start()}MX.next=0;MX.beat=0;MX.duck=1}
function drum(t,f0,amp,len=.45){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(36,t+len*.55);g.gain.setValueAtTime(amp,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(MX.boss);o.start(t);o.stop(t+len+.05)}
function updMusicLayers(){if(!AC||!P)return;mxInit();if(!MX.out)return;const now=AC.currentTime,v=G.state==='title'||G.t<(SN3.hold||0)?0:musVol();
  const boss=mus.key!=='boss'&&G.state==='play'&&G.map&&G.map.enemies.some(e=>e.boss&&!e.dead&&e.aggro&&hyp(e.x-P.x,e.y-P.y)<16);
  const night=G.map&&G.map.world?nightA():0,rain=G.map&&G.map.world&&G.wx&&G.wx.k==='rain'?G.wx.i:0;
  MX.out.gain.setTargetAtTime(v,now,.3);MX.boss.gain.setTargetAtTime(boss?1:0,now,boss?.5:2.5);MX.pad.gain.setTargetAtTime(night*(boss?.2:1),now,2);MX.rain.gain.setTargetAtTime(rain*.22,now,1.5);
  if(boss){if(MX.next<now)MX.next=now+.05;while(MX.next<now+.25){const b=MX.beat++%16;drum(MX.next,b%8===0?160:b%4===0?120:95,b%4===0?.55:.22,b%4===0?.6:.3);if(b%8===6)drum(MX.next+.14,130,.2,.25);MX.next+=.4}}else MX.beat=0;
  const duck=(boss?.4:1)*(1-night*.3);if(mus.a&&Math.abs(duck-MX.duck)>.04){MX.duck=duck;fadeAudio(mus.a,musVol()*duck,1200)}}
