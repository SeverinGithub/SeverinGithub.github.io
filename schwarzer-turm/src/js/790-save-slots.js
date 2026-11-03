/* ---------- save slots: ten named places to keep a game, reached from the pause menu and the title ---------- */
const SVKEY=SAVEKEY+'-slots',SVN=10;
function svAll(){try{const a=JSON.parse(localStorage.getItem(SVKEY)||'[]');return Array.from({length:SVN},(_,i)=>a[i]||null)}catch(e){return Array(SVN).fill(null)}}
function svPut(a){try{localStorage.setItem(SVKEY,JSON.stringify(a));return true}catch(e){return false}}
const SV={arm:null,armT:0,msg:''};
function svInfo(s){if(!s||!s.d)return'leer';let d;try{d=JSON.parse(s.d)}catch(e){return'beschädigt'}const c=CLS[d.p.cls]||CLS.wanderer,t=new Date(s.t||0);
  return`${c.n} · Stufe ${d.p.lvl}${d.p.pl?' · Paragon '+d.p.pl:''} · Ebene ${d.g.maxFloor||0} · ${t.toLocaleDateString('de-DE')} ${t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`}
function svHTML(){const a=svAll(),ingame=G.state==='paused'&&!!P,arm=(i,k)=>SV.arm===k+i&&performance.now()<SV.armT;
  return`<h2>Spielstände</h2><p class="hint" style="text-align:center;margin:0 0 6px">${ingame?'Speichere dein Spiel auf einem von zehn Plätzen oder lade einen anderen.':'Lade einen gespeicherten Spielstand.'} Tippe auf den Namen, um ihn zu ändern.</p>
  <div class="svlist">${a.map((s,i)=>`<div class="svrow${s&&s.d?'':' empty'}"><b class="svno">${i+1}</b><div class="svmid"><input class="svname" data-svn="${i}" maxlength="24" placeholder="Platz ${i+1}" value="${s&&s.n?s.n.replace(/"/g,'&quot;'):''}"><small>${svInfo(s)}</small></div>
    <div class="svbtn">${ingame?`<button data-sv="save" data-i="${i}" class="${arm(i,'s')?'arm':''}">${arm(i,'s')?'Überschreiben?':'Speichern'}</button>`:''}${s&&s.d?`<button data-sv="load" data-i="${i}" class="${arm(i,'l')?'arm':''}">${arm(i,'l')?'Wirklich laden?':'Laden'}</button><button data-sv="del" data-i="${i}" class="svdel ${arm(i,'d')?'arm':''}" title="Löschen">${arm(i,'d')?'Löschen?':'✕'}</button>`:''}</div></div>`).join('')}</div>
  <div class="msg" role="status">${SV.msg}</div><button class="mbtn" data-m="back">Zurück</button>`}
function svShow(msg){SV.msg=msg||'';const b=$('mbox'),sc=b.scrollTop;b.innerHTML=svHTML();b.scrollTop=sc;
  for(const el of b.querySelectorAll('.svname')){el.addEventListener('keydown',e=>{if(e.key==='Escape')return;e.stopPropagation();if(e.key==='Enter')el.blur()});
    el.addEventListener('change',()=>{const a=svAll(),i=+el.dataset.svn;a[i]=Object.assign({},a[i]||{},{n:el.value.trim().slice(0,24)});svPut(a)})}}
const _showMenuSv=showMenu;showMenu=function(v,msg=''){if(v!=='saves')return _showMenuSv(v,msg);menuView='saves';$('menu').hidden=false;SV.arm=null;svShow(msg)};
// a second tap confirms anything that overwrites, loads or deletes
function svArm(k){if(SV.arm===k&&performance.now()<SV.armT){SV.arm=null;return true}SV.arm=k;SV.armT=performance.now()+4000;return false}
$('menu').addEventListener('click',e=>{if(e.target.closest('[data-m="saves"]'))return showMenu('saves');const t=e.target.closest('[data-sv]');if(!t)return;const i=+t.dataset.i,a=svAll(),s=a[i],k=t.dataset.sv;
  if(k==='save'){if(s&&s.d&&!svArm('s'+i))return svShow();save();const d=localStorage.getItem(SAVEKEY);if(!d)return svShow('Speichern fehlgeschlagen.');
    const nm=$('mbox').querySelector(`[data-svn="${i}"]`).value.trim().slice(0,24);a[i]={n:nm||(s&&s.n)||'',t:Date.now(),d};if(!svPut(a))return svShow('Kein Platz mehr im Browser-Speicher. Lösche einen anderen Spielstand.');sfx('gold');svShow('Gespeichert auf Platz '+(i+1)+(a[i].n?' · '+a[i].n:'')+'.')}
  else if(k==='load'){if(!s||!s.d)return;if(!svArm('l'+i))return svShow(G.state==='paused'?'Nicht gespeicherter Fortschritt geht verloren.':'');
    try{if(G.state==='paused'&&mpOn&&mpOn())mpStop(true)}catch(er){}localStorage.setItem(SAVEKEY,s.d);try{sessionStorage.setItem('st-svload',String(i+1))}catch(er){}G.state='title';location.reload()}
  else if(k==='del'){if(!s||!s.d)return;if(!svArm('d'+i))return svShow();a[i]={n:s.n||''};a[i].n='';svPut(a);svShow('Platz '+(i+1)+' ist wieder frei.')}});
// the pause menu and the title both get the way in
const _showMenuSv2=showMenu;showMenu=function(v,msg=''){_showMenuSv2(v,msg);if(v!=='pause')return;const r=$('mbox').querySelector('[data-m="save"]');if(r)r.insertAdjacentHTML('afterend','<button class="mbtn" data-m="saves">Spielstände</button>')};
$('tmenu').querySelector('#btnNew').insertAdjacentHTML('afterend','<button class="mbtn" data-m="saves">Spielstände</button>');
// a slot that was just loaded goes straight into play
(()=>{let n=null;try{n=sessionStorage.getItem('st-svload');sessionStorage.removeItem('st-svload')}catch(e){}if(!n)return;
  setTimeout(()=>{if(G.state==='title'&&!$('btnCont').hidden){$('btnCont').click();setTimeout(()=>log('Spielstand '+n+' geladen.','#ffd88a'),50)}},400)})();
