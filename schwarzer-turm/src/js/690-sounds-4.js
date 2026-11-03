/* ---------- sounds, fourth batch: blade skills ring with the sword recordings · potions drunk louder · spiders, scorpions and bones die aloud · synthesised voices for the rest ---------- */
Object.assign(SFXF,{spiderdie:1,spiderbig:1,scorpdie:1,skeldie:1});
const SN4={blade:0,eq:0,dT:{}};
// every drink, life, mana or antidote, sounds louder
const _sampleD=sample;sample=function(k,vol=.7,o={}){return _sampleD(k,k==='potion'?Math.min(2,vol*2.2):vol,o)};
// synthesis: a pitched voice with an optional wobble, and filtered noise; both fade out on their own
function syO(t,{type='sine',f0,f1=f0,dur,vol,at=.006,del=0,vib=0,vr=6,filt=null,fq=1}){const o=AC.createOscillator(),g=AC.createGain(),T=t+del;o.type=type;
  o.frequency.setValueAtTime(f0,T);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),T+dur);g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(vol,T+at);g.gain.exponentialRampToValueAtTime(.0001,T+dur);
  let n=o;if(filt){const f=AC.createBiquadFilter();f.type=filt[0];f.frequency.value=filt[1];f.Q.value=fq;o.connect(f);n=f}n.connect(g);g.connect(SFXG);
  if(vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=vr;lg.gain.value=vib;l.connect(lg);lg.connect(o.frequency);l.start(T);l.stop(T+dur+.05)}o.start(T);o.stop(T+dur+.05)}
function syN(t,{dur,vol,ft='lowpass',f0,f1=f0,q=1,at=.004,del=0}){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),T=t+del;s.buffer=noiseBuf;s.loop=true;s.playbackRate.value=rnd(.8,1.2);
  f.type=ft;f.Q.value=q;f.frequency.setValueAtTime(f0,T);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),T+dur);g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(vol,T+at);g.gain.exponentialRampToValueAtTime(.0001,T+dur);
  s.connect(f);f.connect(g);g.connect(SFXG);s.start(T,Math.random()*.2);s.stop(T+dur+.05)}
const SYN={
  // hammer blows: a deep body, a dull crack, a rumble under the heavier ones
  thud:t=>{syO(t,{f0:150,f1:38,dur:.5,vol:.55});syO(t,{type:'triangle',f0:75,f1:30,dur:.35,vol:.3});syN(t,{dur:.25,vol:.4,f0:1100,f1:180})},
  quake:t=>{SYN.thud(t);syN(t,{dur:.07,vol:.35,ft:'highpass',f0:2400});syN(t,{dur:1.2,vol:.3,f0:320,f1:90,at:.08,del:.05});syO(t,{f0:55,f1:28,dur:1.1,vol:.35,del:.04})},
  // a thrown weapon, a vault: air rushing past
  whoosh:t=>{syN(t,{dur:.32,vol:.4,ft:'bandpass',f0:380,f1:2600,q:2.2,at:.13})},
  spin:t=>{for(let k=0;k<3;k++)syN(t,{dur:.18,vol:.3,ft:'bandpass',f0:500,f1:2200,q:2.5,at:.07,del:k*.13})},
  // a bow loosed
  twang:t=>{syO(t,{type:'triangle',f0:230,f1:185,dur:.28,vol:.28});syO(t,{f0:460,f1:410,dur:.16,vol:.1});syN(t,{dur:.05,vol:.18,ft:'highpass',f0:3200});SYN.whoosh(t+.02)},
  // a volley: many shafts in the air, then rattling down
  volley:t=>{for(let k=0;k<6;k++)syN(t,{dur:.16,vol:.2,ft:'bandpass',f0:1400,f1:4200,q:3,at:.05,del:k*rnd(.05,.11)});
    for(let k=0;k<10;k++)syN(t,{dur:.035,vol:.22,ft:'highpass',f0:rnd(1800,3600),del:rnd(.55,1.15)})},
  // bone wall: dry clatter over a hollow knock
  bones:t=>{for(let k=0;k<11;k++)syN(t,{dur:.04,vol:.3,ft:'bandpass',f0:rnd(1400,2600),q:9,del:rnd(0,.38)});syO(t,{f0:110,f1:60,dur:.4,vol:.25})},
  // steel on steel: inharmonic partials ringing out
  clang:t=>{for(const[f,v,d]of[[523,.12,.9],[1307,.09,.7],[2093,.07,.5],[2951,.05,.35]])syO(t,{f0:f*rnd(.98,1.02),f1:f*.99,dur:d,vol:v,at:.002});syN(t,{dur:.06,vol:.25,ft:'highpass',f0:3000})},
  // poison: bubbling and a hiss
  bubble:t=>{for(let k=0;k<7;k++){const f=rnd(280,720);syO(t,{f0:f,f1:f*1.9,dur:.07,vol:.14,del:rnd(0,.42)})}syN(t,{dur:.32,vol:.08,ft:'bandpass',f0:1300,q:1.5,at:.05})},
  // a trap snapping open
  snap:t=>{syN(t,{dur:.05,vol:.4,ft:'highpass',f0:2800});syO(t,{type:'square',f0:900,f1:200,dur:.08,vol:.07});syO(t,{f0:1780,f1:1760,dur:.3,vol:.06,del:.01})},
  // equipping: a buckle and a clink
  equip:t=>{syN(t,{dur:.05,vol:.22,ft:'bandpass',f0:900,q:3});syO(t,{f0:1568,f1:1550,dur:.18,vol:.06,del:.05,at:.002});syO(t,{f0:2350,f1:2330,dur:.12,vol:.04,del:.07,at:.002})},
  // deaths
  ghoul:t=>{syO(t,{type:'sawtooth',f0:170,f1:55,dur:.75,vol:.16,vib:28,vr:17,filt:['lowpass',700]});syN(t,{dur:.4,vol:.3,f0:700,f1:150,del:.08})},
  cult:t=>{syO(t,{type:'sawtooth',f0:230,f1:85,dur:.85,vol:.16,vib:9,vr:6,filt:['bandpass',850],fq:3});syN(t,{dur:.25,vol:.12,ft:'bandpass',f0:1500,f1:600,q:2})},
  wraith:t=>{syO(t,{f0:950,f1:280,dur:1.3,vol:.14,vib:32,vr:7,at:.08});syO(t,{f0:1420,f1:430,dur:1.1,vol:.07,vib:40,vr:5.5,at:.1});syN(t,{dur:1,vol:.06,ft:'highpass',f0:2200,f1:900,at:.1})},
  golem:t=>{for(let k=0;k<9;k++)syN(t,{dur:rnd(.1,.2),vol:.3,f0:rnd(400,1000),f1:150,del:rnd(0,.8)});syO(t,{f0:62,f1:28,dur:.9,vol:.45})},
  dragon:t=>{syO(t,{type:'sawtooth',f0:120,f1:48,dur:1.5,vol:.22,vib:14,vr:9,filt:['lowpass',750],at:.05});syN(t,{dur:1.3,vol:.22,ft:'bandpass',f0:700,f1:250,q:1.2,at:.05});syO(t,{f0:60,f1:30,dur:1.4,vol:.3})}};
function syn(k,del=0){if(!AC||G.muted||!SYN[k])return;try{SYN[k](AC.currentTime+del)}catch(e){}}
// sword blows in a row, each from the sword recordings at its own pitch
function blades(n,gap=110,vol=.5){for(let k=0;k<n;k++)setTimeout(()=>{if(G.state==='play')sample('sword',vol,{rate:rnd(.88,1.14)})},k*gap)}
const SKSND={whirl:()=>blades(4,95),venom:()=>{blades(1);syn('bubble',.08)},leap:()=>blades(2,260),charge:()=>syn('whoosh'),
  d_flurry:()=>blades(1),d_dash:()=>{syn('whoosh');blades(2,130)},d_cross:()=>blades(1,0,.4),d_fan:()=>blades(3,70),d_dance:()=>blades(3,190,.45),d_exec:()=>blades(3,150,.55),
  g_cleave:()=>blades(1,0,.35),g_lunge:()=>{syn('whoosh');blades(1)},g_spin:()=>{syn('spin');blades(1)},g_judg:()=>{blades(2,240);syn('quake',.35)},g_parry:()=>{blades(1);syn('clang',.05)},
  h_smash:()=>syn('thud',.08),h_titan:()=>syn('quake',.12),h_leap:()=>{syn('whoosh');syn('quake',.45)},h_throw:()=>syn('spin'),h_quake:()=>syn('thud'),h_storm:()=>syn('thud',.05),
  sp_throw:()=>syn('whoosh'),sp_vault:()=>syn('whoosh'),sp_wall:()=>syn('clang'),sp_rain:()=>syn('volley'),sp_sweep:()=>syn('spin'),
  pierce:()=>syn('twang'),rain:()=>syn('volley'),ward:()=>syn('bones'),trap:()=>syn('snap')};
// blade and weapon skills lose the spell chime; their own sound plays once the skill has really fired
const _castSkillS4=castSkill;castSkill=function(id,tx,ty){const b=P&&P.cds?P.cds[id]||0:0;SN4.blade=SKSND[id]?1:0;try{_castSkillS4(id,tx,ty)}finally{SN4.blade=0}
  if(SKSND[id]&&P&&P.cds&&(P.cds[id]||0)>b+.01)SKSND[id]()};
const _sfxS4=sfx;sfx=function(type){if(type==='cast'&&SN4.blade)return;if(type==='pick'&&SN4.eq){syn('equip');return}return _sfxS4(type)};
const _equipS4=equip;equip=function(it){SN4.eq=1;try{return _equipS4(it)}finally{SN4.eq=0}};
// every kind of foe dies with its own voice; many at once are thinned out so a sweep does not roar
function deathSnd(e){if(!e||e.dummy||e.boss)return;const ty=e.type,big=ty==='spider'&&(e.elem==='poison'||e.scale>=1.5||e.rank==='champ'||e.rank==='unique');
  const k=ty==='spider'?(big?'spiderbig':'spiderdie'):ty==='scorp'?'scorpdie':ty==='skel'||ty==='archer'?'skeldie':SYN[ty]?ty:null;if(!k)return;
  if(G.t-(SN4.dT[k]||-9)<.12)return;SN4.dT[k]=G.t;const v=e.rank==='normal'||!e.rank?.55:.7,r=rnd(.92,1.08)*(e.scale>1.4?.88:1);
  if(SFXF[k])sample(k,v,{rate:r,cut:k==='skeldie'?0:2.4});else syn(k)}
const _killEnemyS4=killEnemy;killEnemy=function(e,a){const was=e&&!e.dead;_killEnemyS4(e,a);if(was&&e.dead)deathSnd(e)};

