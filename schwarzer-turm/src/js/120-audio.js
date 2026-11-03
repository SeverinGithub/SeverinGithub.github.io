/* ---------- audio ---------- */
let AC=null,noiseBuf=null;
// recorded sounds: sfx/<name><n>.mp3, decoded once; a random variant with a slight pitch change each time
const SFXF={sword:7,fire:4,chest:3,potion:2,skel:2,zombie:1,portal:1,step:1,heart:1},SBUF={};
async function loadSfx(){for(const k in SFXF){SBUF[k]=[];for(let n=1;n<=SFXF[k];n++){try{const r=await fetch(`sfx/${k}${n}.mp3`);if(!r.ok)continue;SBUF[k].push(await AC.decodeAudioData(await r.arrayBuffer()))}catch(e){}}}}
function sample(k,vol=.7,o={}){if(!AC||G.muted)return null;const L=SBUF[k];if(!L||!L.length)return null;const t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain();
  s.buffer=pick(L);s.playbackRate.value=o.rate??rnd(.93,1.07);s.loop=!!o.loop;g.gain.value=vol;
  try{s.connect(g);g.connect(sfxOut());s.start(t);
    if(o.cut){g.gain.setValueAtTime(vol,t+Math.max(0,o.cut-.35));g.gain.linearRampToValueAtTime(0,t+o.cut);s.stop(t+o.cut+.05)}}catch(e){return null}return{s,g}}
function stopLoop(h,ms=250){if(!h)return null;try{const t=AC.currentTime;h.g.gain.setTargetAtTime(0,t,ms/3000);h.s.stop(t+ms/1000)}catch(e){}return null}
// monsters growl when they notice you, never more than one voice at a time
function voice(e,ch=1){if(Math.random()>ch||G.t<(G.voiceT||0))return;const l=e.look||e.type;let h=null;
  if(l==='skel'||l==='archer')h=sample('skel',.5,{rate:rnd(.85,1.1)*(e.scale>1.1?.85:1)});else if(l==='ghoul')h=sample('zombie',.45,{cut:2.2,rate:rnd(.9,1.1)});
  if(h)G.voiceT=G.t+.6}
// settings live in their own key so a new game keeps them
const CFGKEY='schwarzer-turm-cfg',CFG=Object.assign({music:70,sfx:80,voice:90,shake:true,hitstop:true,numbers:true},(()=>{try{return JSON.parse(localStorage.getItem(CFGKEY))||{}}catch(e){return{}}})());
function saveCfg(){try{localStorage.setItem(CFGKEY,JSON.stringify(CFG))}catch(e){}}
let SFXG=null,SFXV=1;
// sounds of another player run through a quieter door, the farther away they stand
function sfxOut(){if(SFXV>=1)return SFXG;const d=AC.createGain();d.gain.value=SFXV;d.connect(SFXG);return d}
const musVol=()=>G.muted?0:CFG.music/100*.65;
function applyCfg(){if(SFXG)SFXG.gain.value=CFG.sfx/100;if(typeof VO!=='undefined'&&VO.bus)VO.bus.gain.value=(CFG.voice??90)/100;if(mus.a){clearInterval(mus.a._f);mus.a.volume=musVol()}}
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();SFXG=AC.createGain();SFXG.gain.value=CFG.sfx/100;SFXG.connect(AC.destination);noiseBuf=AC.createBuffer(1,AC.sampleRate*.3,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){AC=null}if(AC)loadSfx()}
function sfx(type){if(!AC||G.muted)return;const t=AC.currentTime,g=AC.createGain();g.connect(sfxOut());
  const tone=(f1,f2,dur,wave='square',vol=.06)=>{const o=AC.createOscillator();o.type=wave;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);o.start(t);o.stop(t+dur)};
  const noise=(dur,vol=.08,freq=1200)=>{const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;s.connect(f);f.connect(g);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.start(t);s.stop(t+dur)};
  ({hit:()=>noise(.12,.12,900),swing:()=>noise(.09,.05,2600),hurt:()=>tone(180,60,.25,'sawtooth',.07),cast:()=>tone(300,900,.18,'triangle',.06),boom:()=>noise(.35,.16,500),
    pick:()=>tone(700,1100,.08,'square',.04),gold:()=>tone(1200,1500,.06,'triangle',.04),lvl:()=>tone(400,1200,.5,'triangle',.08),roll:()=>noise(.18,.05,700),
    unique:()=>tone(500,1600,.6,'sine',.08),zap:()=>noise(.15,.08,4000),draw:()=>noise(.22,.03,450),twang:()=>tone(240,110,.17,'triangle',.09),bolt:()=>tone(150,60,.13,'square',.06),death:()=>tone(200,40,1.2,'sawtooth',.08)})[type]?.()}

