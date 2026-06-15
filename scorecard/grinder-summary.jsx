// grinder-summary.jsx — Summary, Share sheet, History
const { useState: useSs } = React;

function standings(round) {
  const rows = round.players.map((p, i) => {
    const t = totals(round.scores[p.id], round.pars);
    return { ...p, i, ...t };
  });
  // rank: stableford → higher better; else strokes → lower better
  rows.sort((a, b) => round.modeStbl ? b.stbl - a.stbl : a.strokes - b.strokes);
  let rank = 0, prev = null;
  rows.forEach((r, idx) => {
    const key = round.modeStbl ? r.stbl : r.strokes;
    if (key !== prev) { rank = idx + 1; prev = key; }
    r.rank = rank;
  });
  return rows;
}

/* ══════════════════════════ SUMMARY ══════════════════════════ */
function SummaryScreen({ round, onShare, onSaveClose, onAgain, readOnly }) {
  const rows = standings(round);
  const win = rows[0];
  const totalPar = round.pars.reduce((a, b) => a + b, 0);

  return (
    <div className="gg-app">
      <TopBar
        left={readOnly ? <RoundIconBtn icon="left" onClick={onSaveClose} /> : <span />}
        title={readOnly ? 'Runde' : 'Geschafft!'}
        sub={round.courseName}
        right={<RoundIconBtn icon="share" onClick={onShare} />}
      />
      <div className="gg-scroll gg-screen" style={{ padding: '0 18px 8px' }}>
        {/* winner hero */}
        <div style={{
          background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--r-xl)',
          padding: '22px 20px', marginBottom: 16, position: 'relative', overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: .14 }}>
            <Icon name="trophy" size={150} sw={1.2} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .85 }}>
              {rows.length > 1 ? 'Sieger' : 'Deine Runde'}
            </div>
            <div className="expanded" style={{ fontWeight: 900, fontSize: 32, lineHeight: 1.05, marginTop: 6 }}>{win.name}</div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              <HeroStat n={win.strokes} l="Schläge" />
              {round.modePar && <HeroStat n={fmtToPar(win.toPar)} l="zum Par" />}
              {round.modeStbl && <HeroStat n={win.stbl} l="Stableford" />}
            </div>
          </div>
        </div>

        {/* leaderboard */}
        {rows.length > 1 && (
          <>
            <Label style={{ marginBottom: 10 }}>Endstand</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {rows.map((r) => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)',
                  borderRadius: 16, padding: '12px 14px', boxShadow: 'var(--shadow-sm)',
                }}>
                  <div className="tnum" style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
                    fontWeight: 900, fontSize: 14,
                    background: r.rank === 1 ? 'var(--accent)' : 'var(--surface-2)',
                    color: r.rank === 1 ? 'var(--accent-ink)' : 'var(--ink-soft)',
                  }}>{r.rank}</div>
                  <Avatar name={r.name} i={r.i} size={32} />
                  <div style={{ flex: 1, fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                  {round.modeStbl
                    ? <div className="tnum" style={{ fontWeight: 900, fontSize: 18 }}>{r.stbl}<span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700 }}> Pkt</span></div>
                    : <div style={{ textAlign: 'right' }}>
                        <span className="tnum" style={{ fontWeight: 900, fontSize: 18 }}>{r.strokes}</span>
                        {round.modePar && <span className="tnum" style={{ fontSize: 13, fontWeight: 800, marginLeft: 6, color: r.toPar > 0 ? 'var(--over)' : 'var(--under)' }}>{fmtToPar(r.toPar)}</span>}
                      </div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* hole strip per player */}
        <Label style={{ marginBottom: 10 }}>Loch für Loch</Label>
        <Card style={{ marginBottom: 8 }} pad={14}>
          {round.players.map((p, i) => (
            <div key={p.id} style={{ marginBottom: i === round.players.length - 1 ? 0 : 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', marginBottom: 6 }}>{p.name}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {round.pars.map((par, hi) => {
                  const s = round.scores[p.id][hi];
                  const tone = scoreTone(s, par);
                  const bg = tone === 'under' ? 'color-mix(in srgb, var(--under) 18%, transparent)'
                    : tone === 'over' ? 'color-mix(in srgb, var(--over) 16%, transparent)' : 'var(--surface-2)';
                  const fg = tone === 'under' ? 'var(--under)' : tone === 'over' ? 'var(--over)' : 'var(--ink-soft)';
                  return (
                    <div key={hi} className="tnum" style={{
                      width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center',
                      fontWeight: 800, fontSize: 14, background: s == null ? 'transparent' : bg,
                      color: s == null ? 'var(--ink-faint)' : fg,
                      boxShadow: s == null ? 'inset 0 0 0 1px var(--line)' : 'none',
                    }}>{s == null ? '·' : s}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* actions */}
      <div style={{ padding: '12px 18px 30px', background: 'linear-gradient(to top, var(--bg) 70%, transparent)' }}>
        {readOnly ? (
          <Btn size="lg" variant="ghost" icon="share" onClick={onShare}>Scorecard teilen</Btn>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn size="lg" variant="ghost" onClick={onAgain} style={{ flex: 1 }}>Verwerfen</Btn>
            <Btn size="lg" onClick={onSaveClose} icon="check" style={{ flex: 1.3 }}>Speichern</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroStat({ n, l }) {
  return (
    <div>
      <div className="expanded tnum" style={{ fontWeight: 900, fontSize: 30, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12, fontWeight: 700, opacity: .85, marginTop: 3 }}>{l}</div>
    </div>
  );
}

/* ══════════════════════════ SHARE SHEET ══════════════════════════ */
function ShareSheet({ round, onClose }) {
  const [copied, setCopied] = useSs(false);
  const rows = standings(round);
  const totalPar = round.pars.reduce((a, b) => a + b, 0);

  const text = (() => {
    let s = `⛳ ${round.courseName} · ${round.holes} Löcher\n`;
    rows.forEach(r => {
      let line = `${rows.length > 1 ? r.rank + '. ' : ''}${r.name}: ${r.strokes} Schläge`;
      if (round.modePar) line += ` (${fmtToPar(r.toPar)})`;
      if (round.modeStbl) line += ` · ${r.stbl} Pkt`;
      s += line + '\n';
    });
    s += '— via Grinder';
    return s;
  })();

  const copy = () => {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(2px)', animation: 'gg-screen-in .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: 'var(--bg)', borderRadius: '28px 28px 0 0',
        padding: '14px 18px 34px', boxShadow: '0 -10px 40px rgba(0,0,0,.3)',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--line-strong)', margin: '0 auto 16px' }} />
        <Label style={{ marginBottom: 10 }}>Scorecard teilen</Label>

        {/* preview card */}
        <div style={{
          background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--r-lg)',
          padding: 18, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="flag" size={18} sw={2.4} />
            <div style={{ fontWeight: 800, fontSize: 15 }}>{round.courseName}</div>
            <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, opacity: .85 }}>{round.holes} Löcher</div>
          </div>
          {rows.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontWeight: 700 }}>
              {rows.length > 1 && <span className="tnum" style={{ width: 16, opacity: .8 }}>{r.rank}</span>}
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
              <span className="tnum" style={{ fontWeight: 900 }}>{round.modeStbl ? r.stbl + ' Pkt' : r.strokes}</span>
              {round.modePar && !round.modeStbl && <span className="tnum" style={{ fontSize: 13, opacity: .85, width: 30, textAlign: 'right' }}>{fmtToPar(r.toPar)}</span>}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Schließen</Btn>
          <Btn variant={copied ? 'accent' : 'primary'} icon={copied ? 'check' : 'share'} onClick={copy} style={{ flex: 1.4 }}>
            {copied ? 'Kopiert!' : 'Text kopieren'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ HISTORY ══════════════════════════ */
function HistoryScreen({ history, onBack, onOpen, onClear }) {
  return (
    <div className="gg-app">
      <TopBar left={<RoundIconBtn icon="left" onClick={onBack} />} title="Verlauf" sub={`${history.length} Runden`}
        right={history.length ? <RoundIconBtn icon="x" tone="var(--over)" onClick={onClear} /> : <span />} />
      <div className="gg-scroll gg-screen" style={{ padding: '0 18px 30px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-faint)' }}>
            <Icon name="clock" size={44} sw={1.6} />
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink-soft)', marginTop: 14 }}>Noch keine Runden</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Gespielte Runden erscheinen hier.</div>
          </div>
        ) : history.map((r) => {
          const rows = standings(r);
          const win = rows[0];
          const tp = r.pars.reduce((a, b) => a + b, 0);
          return (
            <button key={r.id} onClick={() => onOpen(r)} style={{
              display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
              background: 'var(--surface)', border: 'none', borderRadius: 'var(--r-md)', padding: 14,
              boxShadow: 'var(--shadow-sm)', cursor: 'pointer', marginBottom: 8, WebkitTapHighlightColor: 'transparent',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="flag" size={20} sw={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.courseName}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600, marginTop: 1 }}>
                  {r.holes} Löcher · {relTime(r.finishedAt || r.startedAt)} · {rows.length} {rows.length === 1 ? 'Spieler' : 'Spieler'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 700, marginTop: 3 }}>
                  🏆 {win.name} · {r.modeStbl ? win.stbl + ' Pkt' : win.strokes + ' Schläge'}{r.modePar && !r.modeStbl ? ` (${fmtToPar(win.toPar)})` : ''}
                </div>
              </div>
              <Icon name="right" size={18} sw={2.4} style={{ color: 'var(--ink-faint)', flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { SummaryScreen, ShareSheet, HistoryScreen, standings });
