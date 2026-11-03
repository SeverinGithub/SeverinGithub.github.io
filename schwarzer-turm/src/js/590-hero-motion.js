/* ---------- the hero's motion: every skill that lands starts its own body animation, for you and for those watching ---------- */
const _castSkillAn=castSkill;castSkill=function(id,tx,ty){const b=P&&P.cds?P.cds[id]||0:0;_castSkillAn(id,tx,ty);if(P&&P.cds&&(P.cds[id]||0)>b+.01&&ANK[id]){P.anK=id;P.anS=G.t}};
const _mpCastFxAn=mpCastFx;mpCastFx=function(r,d){_mpCastFxAn(r,d);if(ANK[d.sk]){r.anK=d.sk;r.anS=G.t}};
