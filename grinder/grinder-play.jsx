// grinder-play.jsx — Play screen: hole-by-hole + full scorecard
const { useState: useSp, useEffect: useEp } = React;

function PlayScreen({ round, setRound, onFinish, onExit }) {
  const [view, setView] = useSp('hole'); // 'hole' | 'card'
  const h = round.currentHole;
  const N = round.holes;
  const par = round.pars[h];

  const setHole = (i) => setRound(r => ({ ...r, currentHole: Math.max(0, Math.min(N - 1, i)) }));
  const setScore = (pid, val) => setRound(r => {
    const sc = { ...r.scores, [pid]: r.scores[pid].slice() };
    sc[pid][h] = val;
    return { ...r, scores: sc };
  });
  const setPar = (val) => setRound(r => {
    const pars = r.pars.slice(); pars[h] = val; return { ...r, pars };
  });

  const allScored = round.players.every(p => round.scores[p.id][h] != null);
  const isLast = h === N - 1;

  return (
    <div className="gg-app">
      <TopBar
        left={<RoundIconBtn icon="x" onClick={onExit} />}
        title={round.courseName}
        sub={`${N} Löcher${round.location ? ' · ' + round.location : ''}`}
        right={<RoundIconBtn icon={view === 'hole' ? 'cards' : 'flag'} onClick={() => setView(v => v === 'hole' ? 'card' : 'hole')} />}
      />
      {view === 'hole'
        ? <HoleView round={round} h={h} par={par} setScore={setScore} setPar={setPar} setHole={setHole} />
        : <CardView round={round} onPick={(i) => { setHole(i); setView('hole'); }} />}

      {/* footer */}
      <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(to top, var(--bg) 70%, transparent)' }}>
        {view === 'hole' ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setHole(h - 1)} disabled={h === 0} style={navBtn(h === 0)}>
              <Icon name="left" size={22} sw={2.6} />
            </button>
            {isLast
              ? <Btn size="lg" variant="accent" icon="trophy" onClick={onFinish} style={{ flex: 1 }}>Runde beenden</Btn>
              : <Btn size="lg" onClick={() => setHole(h + 1)} style={{ flex: 1 }}>
                  {allScored ? 'Weiter zu Loch ' + (h + 2) : 'Weiter'}
                  <Icon name="right" size={20} sw={2.6} />
                </Btn>}
          </div>
        ) : (
          <Btn size="lg" variant="accent" icon="trophy" onClick={onFinish}>Runde beenden</Btn>
        )}
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    width: 58, height: 58, flexShrink: 0, borderRadius: 18, border: 'none',
    background: 'var(--surface)', color: disabled ? 'var(--ink-faint)' : 'var(--ink)',
    boxShadow: 'var(--shadow-sm)', cursor: disabled ? 'default' : 'pointer',
    display: 'grid', placeItems: 'center', opacity: disabled ? .5 : 1,
    WebkitTapHighlightColor: 'transparent',
  };
}

/* ─── one hole at a time ─── */
function HoleView({ round, h, par, setScore, setPar, setHole }) {
  const N = round.holes;
  return (
    <div className="gg-scroll" style={{ padding: '0 18px 8px' }}>
      {/* hole header */}
      <div key={h} className="gg-screen" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div>
          <Label>Loch</Label>
          <div className="expanded tnum" style={{ fontWeight: 900, fontSize: 60, lineHeight: .95, letterSpacing: '-.02em' }}>
            {h + 1}<span style={{ color: 'var(--ink-faint)', fontSize: 26, fontWeight: 800 }}>/{N}</span>
          </div>
        </div>
        {/* par stepper */}
        <div style={{ textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}>
          <Label style={{ marginBottom: 6 }}>Par</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setPar(Math.max(3, par - 1))} style={parBtn}><Icon name="minus" size={15} sw={3} /></button>
            <div className="tnum" style={{ width: 24, textAlign: 'center', fontWeight: 800, fontSize: 24 }}>{par}</div>
            <button onClick={() => setPar(Math.min(6, par + 1))} style={parBtn}><Icon name="plus" size={15} sw={3} /></button>
          </div>
        </div>
      </div>

      {/* progress dots */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 18, flexWrap: 'wrap' }}>
        {Array.from({ length: N }).map((_, i) => {
          const done = round.players.some(p => round.scores[p.id][i] != null);
          const cur = i === h;
          return (
            <button key={i} onClick={() => setHole(i)} style={{
              flex: 1, minWidth: 8, height: 6, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
              background: cur ? 'var(--primary)' : done ? 'color-mix(in srgb, var(--primary) 40%, var(--surface-2))' : 'var(--surface-2)',
              transition: 'background .2s',
            }} />
          );
        })}
      </div>

      {/* players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {round.players.map((p, i) => {
          const sc = round.scores[p.id];
          const t = totals(sc, round.pars);
          const cur = sc[h];
          return (
            <div key={p.id} className="gg-pop" style={{
              background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '12px 14px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Avatar name={p.name} i={i} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>
                      Ges. {t.strokes || '–'}
                    </span>
                    {round.modePar && t.played > 0 && (
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: t.toPar > 0 ? 'var(--over)' : 'var(--under)' }}>
                        {fmtToPar(t.toPar)}
                      </span>
                    )}
                    {round.modeStbl && t.played > 0 && (
                      <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>· {t.stbl} Pkt</span>
                    )}
                  </div>
                </div>
                {round.modePar && <ScorePill strokes={cur} par={par} />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <BigStepper value={cur} onChange={(v) => setScore(p.id, v)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const parBtn = {
  width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--line-strong)',
  background: 'var(--surface-2)', color: 'var(--ink)', display: 'grid', placeItems: 'center',
  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
};

/* ─── full scorecard table ─── */
function CardView({ round, onPick }) {
  const cols = round.players;
  const cellW = cols.length <= 2 ? 64 : cols.length <= 4 ? 48 : 40;
  return (
    <div className="gg-scroll gg-screen" style={{ padding: '0 14px 8px' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'stretch', background: 'var(--surface-2)', padding: '10px 12px', gap: 8 }}>
          <div style={{ width: 30, fontWeight: 800, fontSize: 12, color: 'var(--ink-soft)' }}>LOCH</div>
          <div style={{ width: 28, fontWeight: 800, fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center' }}>PAR</div>
          <div style={{ flex: 1, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {cols.map((p, i) => (
              <div key={p.id} style={{ width: cellW, textAlign: 'center' }}>
                <Avatar name={p.name} i={i} size={26} />
              </div>
            ))}
          </div>
        </div>
        {/* rows */}
        {round.pars.map((par, hi) => (
          <button key={hi} onClick={() => onPick(hi)} style={{
            display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left',
            border: 'none', background: hi === round.currentHole ? 'color-mix(in srgb, var(--primary) 8%, var(--surface))' : 'var(--surface)',
            borderTop: '1px solid var(--line)', padding: '11px 12px', gap: 8, cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{ width: 30, fontWeight: 800, fontSize: 15 }}>{hi + 1}</div>
            <div style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)' }}>{par}</div>
            <div style={{ flex: 1, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              {cols.map(p => {
                const s = round.scores[p.id][hi];
                const tone = scoreTone(s, par);
                const tc = tone === 'under' ? 'var(--under)' : tone === 'over' ? 'var(--over)' : 'var(--ink)';
                return (
                  <div key={p.id} className="tnum" style={{
                    width: cellW, textAlign: 'center', fontWeight: 800, fontSize: 17,
                    color: s == null ? 'var(--ink-faint)' : tc,
                  }}>{s == null ? '·' : s}</div>
                );
              })}
            </div>
          </button>
        ))}
        {/* total row */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', padding: '12px', gap: 8, borderTop: '2px solid var(--line-strong)' }}>
          <div style={{ width: 30, fontWeight: 800, fontSize: 13 }}>GES</div>
          <div style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)' }}>
            {round.pars.reduce((a, b) => a + b, 0)}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {cols.map(p => {
              const t = totals(round.scores[p.id], round.pars);
              return (
                <div key={p.id} className="tnum" style={{ width: cellW, textAlign: 'center', fontWeight: 900, fontSize: 17 }}>
                  {t.strokes || '–'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 12 }}>
        Tippe ein Loch, um Schläge zu bearbeiten
      </div>
    </div>
  );
}

window.PlayScreen = PlayScreen;
