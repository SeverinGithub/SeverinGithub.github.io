/* ---------- whose weapon is whose: anyone may carry anything, but a stranger's weapon fights at half strength and brings no skills ---------- */
const isRangedW=w=>!!w&&(w.cls==='bow'||w.cls==='xbow'),isWandW=w=>!!w&&SH(w.b)==='Holzzauberstab';
const CLSW={krieger:w=>['sword','axe','mace','great','spear'].includes(w.cls)&&!isDualB(w.b),jaegerin:w=>w.cls==='dagger'||isDualB(w.b),
  magier:w=>w.cls==='staff',alchemist:w=>isRangedW(w)||isWandW(w)};
const wOK=(w,c=P&&P.cls)=>!w||w.slot!=='weapon'||!CLSW[c]||CLSW[c](w);
const wFor=w=>Object.keys(CLSW).filter(c=>CLSW[c](w)).map(c=>CLS[c].n).join(' · ');
const _wSetKeyK=wSetKey;wSetKey=function(){const k=_wSetKeyK();return k&&P&&P.cls==='krieger'&&k!=='dual'?k:null};
const _recalcK=recalc;recalc=function(){_recalcK();if(!P||!P.d)return;const d=P.d,w=P.eq.weapon,on=w&&d.okS&&d.okS.has(w);
  d.offW=on&&!wOK(w)?1:0;if(d.offW){d.dmin*=.5;d.dmax*=.5;d.ele*=.5}
  if(on){if(w.cls==='bow')d.reach=7.5;else if(w.cls==='xbow')d.reach=7;else if(isWandW(w))d.reach=6}
  const B=CBON[P.cls];if(B)B(d);if(P.hp>d.life)P.hp=d.life;if(P.mp>d.mana)P.mp=d.mana};
const _itemTipK=itemTipHTML;itemTipHTML=function(it,c){let h=_itemTipK(it,c);if(it&&it.slot==='weapon'&&P&&CLS[P.cls]){const ok=wOK(it),t=ok?`<div class="base">Waffe für: ${wFor(it)}</div>`:`<div class="req bad">Nicht für ${CLS[P.cls].n}: halber Schaden, keine Waffenfertigkeiten · Waffe für: ${wFor(it)}</div>`;
    const i=h.indexOf('<div class="act">');h=i>=0?h.slice(0,i)+t+h.slice(i):h+t}return h};
// loot leans towards the hero's own weapons: a stranger's weapon is rolled once more
const _makeItemK=makeItem;makeItem=function(l,o){const it=_makeItemK(l,o);if(P&&it&&it.slot==='weapon'&&!wOK(it)&&!(o&&o.keepCls)&&Math.random()<.55)return _makeItemK(l,o);return it};

