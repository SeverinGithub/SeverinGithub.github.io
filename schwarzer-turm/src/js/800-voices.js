/* ---------- voices: Odalinde, Brannoc, Eldrik and the travelling traders say a line when you step up to them ---------- */
Object.assign(SFXF,{vodal:4,vsmith:4,vquest:5,vtrade:5});
const VO={k:null,src:null,end:0,last:{}};
// the voices have their own volume, apart from the effects
function voG(){if(!VO.bus){VO.bus=AC.createGain();VO.bus.connect(AC.destination)}VO.bus.gain.value=(CFG.voice??90)/100;return VO.bus}
function voice(k){if(!AC||G.muted)return;const L=SBUF[k];if(!L||!L.length)return;
  // the same person does not start over while still speaking; someone else cuts in
  if(VO.src&&AC.currentTime<VO.end){if(VO.k===k)return;try{VO.g.gain.setTargetAtTime(0,AC.currentTime,.05);VO.src.stop(AC.currentTime+.2)}catch(e){}}
  let i=Math.floor(Math.random()*L.length);if(L.length>1&&i===VO.last[k])i=(i+1+Math.floor(Math.random()*(L.length-1)))%L.length;VO.last[k]=i;
  const s=AC.createBufferSource(),g=AC.createGain();s.buffer=L[i];g.gain.value=1;s.connect(g);g.connect(voG());s.start();Object.assign(VO,{k,src:s,g,end:AC.currentTime+L[i].duration});
  // the music steps back while they talk
  const a=mus.a;if(a){fadeAudio(a,musVol()*.35,300);s.onended=()=>{if(VO.src===s&&mus.a===a)fadeAudio(a,musVol(),900)}}}
const voiceOf=o=>!o?null:o.type==='smith'?'vsmith':o.type==='chronist'?'vquest':o.type==='merchant'?(isHomeMerchant(o)?'vodal':'vtrade'):null;
const _interactVo=interact;interact=function(o){const k=voiceOf(o);_interactVo(o);if(k)voice(k)};
