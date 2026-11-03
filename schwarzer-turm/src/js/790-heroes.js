/* ---------- heroes: every hero keeps a save of their own, written by itself · a new hero never replaces an old one ---------- */
// storage: an index of heroes, one key per hero, and which hero plays now. The old single save and the ten slots become heroes once.
const HKEY=SAVEKEY+'-heroes',HCUR=SAVEKEY+'-cur',hKey=id=>SAVEKEY+'-h-'+id;
function hAll(){try{return JSON.parse(localStorage.getItem(HKEY)||'[]')}catch(e){return[]}}
function hPut(a){try{localStorage.setItem(HKEY,JSON.stringify(a));return true}catch(e){return false}}
function hCur(){try{return localStorage.getItem(HCUR)||null}catch(e){return null}}
function hSetCur(id){try{id?localStorage.setItem(HCUR,id):localStorage.removeItem(HCUR)}catch(e){}}
const hNewId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
// what the list shows about a hero, read from the save itself
function hInfoOf(d){return{cls:d.p.cls,lvl:d.p.lvl,pl:d.p.pl||0,fl:d.g.maxFloor||0}}
function hDesc(h){const c=CLS[h.cls]||{n:'Held'},t=new Date(h.t||0);
  return`${c.n} · Stufe ${h.lvl||1}${h.pl?' · Paragon '+h.pl:''} · tiefste Ebene ${h.fl||0}${h.t?` · ${t.toLocaleDateString('de-DE')} ${t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:''}`}
const hName=h=>h&&h.n?h.n:h?(CLS[h.cls]||{n:'Held'}).n:'';
(function hMigrate(){try{if(localStorage.getItem(HKEY)!=null)return;const a=[],seen=new Set();let cur=null;
  const take=(s,n,t)=>{if(!s||seen.has(s))return null;let d;try{d=JSON.parse(s)}catch(e){return null}if(!d||!d.p)return null;seen.add(s);const id=hNewId()+a.length;
    localStorage.setItem(hKey(id),s);a.push(Object.assign({id,n:n||'',t:t||Date.now()},hInfoOf(d)));return id};
  cur=take(localStorage.getItem(SAVEKEY),'',Date.now());
  let slots=[];try{slots=JSON.parse(localStorage.getItem(SAVEKEY+'-slots')||'[]')}catch(e){}
  for(const s of slots)if(s&&s.d){const id=take(s.d,s.n,s.t);if(id&&!cur)cur=id}
  a.sort((x,y)=>(y.t||0)-(x.t||0));if(!hPut(a))return;hSetCur(cur||(a[0]&&a[0].id));
  // everything now lives in the heroes; the old places are cleared to make room
  localStorage.removeItem(SAVEKEY);localStorage.removeItem(SAVEKEY+'-slots')}catch(e){}})();
// saving and loading always mean the hero who plays now
let HWARN=0;
save=function(){const d=saveData();if(!d)return false;let id=hCur();const a=hAll();let h=id&&a.find(x=>x.id===id);
  if(!h){id=hNewId();h={id,n:''};a.unshift(h);hSetCur(id)}
  try{localStorage.setItem(hKey(id),JSON.stringify(d))}catch(e){if(!HWARN){HWARN=1;log('Speichern fehlgeschlagen: der Browser-Speicher ist voll. Lösche einen alten Helden (Esc · Helden).','#ff5a4a')}return false}
  Object.assign(h,hInfoOf(d),{t:Date.now()});hPut(a);return true};
loadData=function(){const id=hCur();if(!id)return null;try{const s=localStorage.getItem(hKey(id));return s?JSON.parse(s):null}catch(e){return null}};
// a new hero gets a place of their own before the first step
const _startNewH=startNew;startNew=function(c){const a=hAll(),id=hNewId();a.unshift({id,n:'',cls:c,lvl:1,fl:0,t:Date.now()});hPut(a);hSetCur(id);HWARN=0;return _startNewH(c)};
contInfo=function(){const id=hCur(),h=hAll().find(x=>x.id===id),ok=!!(h&&loadData());$('btnCont').hidden=!ok;if(ok)$('contInfo').textContent=`${hName(h)} · ${hDesc(h)}`;
  const n=hAll().length;for(const b of document.querySelectorAll('#tmenu [data-m="heroes"]'))b.hidden=!n};
const HV={arm:null,armT:0};
function hArm(k){if(HV.arm===k&&performance.now()<HV.armT){HV.arm=null;return true}HV.arm=k;HV.armT=performance.now()+4000;return false}
function hHTML(msg){const a=hAll().sort((x,y)=>(y.t||0)-(x.t||0)),cur=hCur(),ingame=G.state==='paused'&&!!P,arm=k=>HV.arm===k&&performance.now()<HV.armT;
  return`<h2>Helden</h2><p class="hint" style="text-align:center;margin:0 0 6px">Jeder Held hat seinen eigenen Spielstand und speichert sich selbst, auch mit seinem Standort. Tippe auf den Namen, um ihn zu ändern.</p>
  <div class="svlist">${a.length?a.map((h,i)=>{const on=h.id===cur;return`<div class="svrow${on?' cur':''}"><b class="svno">${on?'●':i+1}</b><div class="svmid"><input class="svname" data-hn="${h.id}" maxlength="24" placeholder="${(CLS[h.cls]||{n:'Held'}).n}" value="${(h.n||'').replace(/"/g,'&quot;')}"><small>${on?(ingame?'spielt gerade · ':'zuletzt gespielt · '):''}${hDesc(h)}</small></div>
    <div class="svbtn">${on&&ingame?'':`<button data-hv="play" data-id="${h.id}">${on?'Fortsetzen':'Spielen'}</button>`}${on&&ingame?'':`<button data-hv="del" data-id="${h.id}" class="svdel ${arm('d'+h.id)?'arm':''}" title="Held löschen">${arm('d'+h.id)?'Wirklich löschen?':'✕'}</button>`}</div></div>`}).join(''):'<p class="hint" style="text-align:center">Noch kein Held.</p>'}</div>
  <div class="msg" role="status">${msg||''}</div><button class="mbtn" data-hv="new">Neuer Held</button><button class="mbtn" data-m="back">Zurück</button>`}
function hShow(msg){const b=$('mbox'),sc=b.scrollTop;b.innerHTML=hHTML(msg);b.scrollTop=sc;
  for(const el of b.querySelectorAll('.svname')){el.addEventListener('keydown',e=>{if(e.key==='Escape')return;e.stopPropagation();if(e.key==='Enter')el.blur()});
    el.addEventListener('change',()=>{const a=hAll(),h=a.find(x=>x.id===el.dataset.hn);if(h){h.n=el.value.trim().slice(0,24);hPut(a);contInfo()}})}}
const _showMenuH=showMenu;showMenu=function(v,msg=''){if(v!=='heroes')return _showMenuH(v,msg);menuView='heroes';$('menu').hidden=false;HV.arm=null;hShow(msg)};
$('menu').addEventListener('click',e=>{if(e.target.closest('[data-m="heroes"]'))return showMenu('heroes');const t=e.target.closest('[data-hv]');if(!t)return;const k=t.dataset.hv,id=t.dataset.id,a=hAll(),h=a.find(x=>x.id===id);
  if(k==='new'){if(G.state==='paused'&&P){save();toTitle()}askNew();return}
  if(k==='play'){if(!h)return;if(G.state==='paused'&&P){
      // switching while playing: this hero is saved first, then the page starts the other one
      save();try{if(mpOn&&mpOn())mpStop(true)}catch(er){}hSetCur(id);try{sessionStorage.setItem('st-hplay',id)}catch(er){}G.state='title';location.reload();return}
    hSetCur(id);closeMenu();contInfo();$('btnCont').click();return}
  if(k==='del'){if(!h)return;if(!hArm('d'+id))return hShow(`${hName(h)} wird mit allem gelöscht. Zum Bestätigen noch einmal tippen.`);
    try{localStorage.removeItem(hKey(id))}catch(er){}const b=a.filter(x=>x.id!==id);hPut(b);if(hCur()===id)hSetCur(b.sort((x,y)=>(y.t||0)-(x.t||0))[0]?.id||null);contInfo();sfx('boom');hShow(`${hName(h)} ist gelöscht.`)}});
// the pause menu and the title both lead to the heroes; the pause menu says whom it saved
const _showMenuH2=showMenu;showMenu=function(v,msg=''){if(v==='pause'&&msg==='Gespeichert.'){const h=hAll().find(x=>x.id===hCur());if(h)msg=`Gespeichert · ${hName(h)}`}
  _showMenuH2(v,msg);if(v!=='pause')return;const r=$('mbox').querySelector('[data-m="save"]');if(r)r.insertAdjacentHTML('afterend','<button class="mbtn" data-m="heroes">Helden</button>')};
$('tmenu').querySelector('#btnNew').insertAdjacentHTML('afterend','<button class="mbtn" data-m="heroes">Helden</button>');contInfo();
// a hero chosen in the pause menu goes straight into play after the reload
(()=>{let n=null;try{n=sessionStorage.getItem('st-hplay');sessionStorage.removeItem('st-hplay')}catch(e){}if(!n)return;
  setTimeout(()=>{if(G.state==='title'&&!$('btnCont').hidden){$('btnCont').click();const h=hAll().find(x=>x.id===n);setTimeout(()=>log(`${hName(h)} ist zurück.`,'#ffd88a'),50)}},400)})();
