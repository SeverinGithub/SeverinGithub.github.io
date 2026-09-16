// grinder-inventory.jsx — read-only bag inventory + per-club detail
const { useMemo: useMi } = React;

// Every shot with a distance for one club, tagged with round context.
// live and history rounds are treated the same shape.
function allShotsFor(clubId, rounds) {
  const out = [];
  for (const r of rounds || []) {
    if (!r || !r.shots) continue;
    const roundTs = r.finishedAt || r.startedAt || null;
    for (const s of r.shots) {
      if (s.clubId === clubId && typeof s.distanceM === 'number' && s.distanceM > 0) {
        out.push({
          ...s,
          roundId: r.id,
          roundName: r.courseName,
          roundTs,
          when: s.ts || roundTs || 0,
        });
      }
    }
  }
  out.sort((a, b) => a.when - b.when);
  return out;
}

// ── Simple inline SVG line chart ────────────────────────────
// No dependencies, monochrome, dashed reference line for seed value.
function ClubDistanceChart({ shots, seededDistance, height = 180 }) {
  if (!shots || shots.length === 0) {
    return (
      <div style={{
        height, background: 'var(--surface-2)', borderRadius: 14,
        display: 'grid', placeItems: 'center',
        color: 'var(--ink-faint)', fontWeight: 700, fontSize: 13.5,
      }}>Noch keine Daten</div>
    );
  }
  const w = 340;
  const pad = { top: 14, right: 12, bottom: 18, left: 34 };
  const graphH = height - pad.top - pad.bottom;
  const graphW = w - pad.left - pad.right;
  const distances = shots.map(s => s.distanceM);
  const withSeed = seededDistance != null ? [...distances, seededDistance] : distances;
  const dMin = Math.max(0, Math.min(...withSeed) - 15);
  const dMax = Math.max(...withSeed) + 15;
  const times = shots.map(s => s.when);
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const tRange = Math.max(tMax - tMin, 1);

  const x = (t) => pad.left + (shots.length === 1 ? graphW / 2 : ((t - tMin) / tRange) * graphW);
  const y = (d) => pad.top + (1 - (d - dMin) / (dMax - dMin || 1)) * graphH;

  const points = shots.map(s => ({ cx: x(s.when), cy: y(s.distanceM), d: s.distanceM }));
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{ display: 'block' }} aria-hidden="true">
      {/* seed reference line */}
      {seededDistance != null && (
        <>
          <line x1={pad.left} y1={y(seededDistance)} x2={w - pad.right} y2={y(seededDistance)}
            stroke="var(--ink-faint)" strokeDasharray="4,4" strokeWidth="1" opacity=".6" />
          <text x={w - pad.right} y={y(seededDistance) - 4} fontSize="9" fontWeight="700"
            fill="var(--ink-faint)" textAnchor="end">Seed {Math.round(seededDistance)}m</text>
        </>
      )}
      {/* trend line */}
      {points.length > 1 && (
        <path d={path} stroke="var(--primary)" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="var(--primary)"
          stroke="var(--surface)" strokeWidth="1.5" />
      ))}
      {/* axis labels */}
      <text x={4} y={pad.top + 4} fontSize="9.5" fontWeight="700" fill="var(--ink-faint)">
        {Math.round(dMax)}m
      </text>
      <text x={4} y={height - pad.bottom + 4} fontSize="9.5" fontWeight="700" fill="var(--ink-faint)">
        {Math.round(dMin)}m
      </text>
    </svg>
  );
}

// ── Inventory screen (bag as data, read-only) ────────────────
function ClubInventoryScreen({ clubs, allRounds, onBack, onEdit, onOpenClub }) {
  const clubsWithStats = useMi(() =>
    activeClubs(clubs).map(c => ({ club: c, stats: clubStats(c, allRounds) })),
    [clubs, allRounds]);

  const grouped = CLUB_CATEGORIES.map(cat => ({
    cat,
    entries: clubsWithStats.filter(e => e.club.category === cat.id),
  })).filter(g => g.entries.length > 0);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font)', fontVariantNumeric: 'tabular-nums',
      display: 'flex', flexDirection: 'column',
    }}>
      <TopBar
        left={<RoundIconBtn icon="left" onClick={onBack} />}
        title="Dein Bag"
        sub={`${activeClubs(clubs).length} Schläger`}
        right={<RoundIconBtn icon="settings" onClick={onEdit} />}
      />

      <div className="gg-screen" style={{ flex: 1, padding: '4px 18px 30px' }}>
        {grouped.map(({ cat, entries }) => (
          <div key={cat.id} style={{ marginBottom: 22 }}>
            <Label style={{ marginBottom: 10, padding: '0 2px' }}>{cat.label}</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map(({ club, stats }) => (
                <ClubInventoryRow key={club.id} club={club} stats={stats} onClick={() => onOpenClub(club.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClubInventoryRow({ club, stats, onClick }) {
  const hasData = stats.sampleN > 0;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      textAlign: 'left', border: 'none', cursor: 'pointer',
      background: 'var(--surface)', borderRadius: 18, padding: '13px 14px',
      boxShadow: 'var(--shadow-sm)', WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {club.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          {hasData ? (
            <>
              <span>{stats.sampleN} {stats.sampleN === 1 ? 'Schlag' : 'Schläge'}</span>
              <ConfidenceBar value={stats.confidence} />
            </>
          ) : (
            <span>Nur Startschätzung</span>
          )}
        </div>
      </div>
      {stats.distanceM != null && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="tnum" style={{ fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
            {Math.round(stats.distanceM)}
            <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, marginLeft: 2 }}>m</span>
          </div>
        </div>
      )}
      <Icon name="right" size={16} sw={2.4} style={{ color: 'var(--ink-faint)', flexShrink: 0 }} />
    </button>
  );
}

function ConfidenceBar({ value }) {
  // 0..1 → 0..100% filled bar
  const pct = Math.min(1, Math.max(0, value || 0));
  return (
    <div style={{
      width: 42, height: 5, borderRadius: 99, background: 'var(--surface-2)',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        width: `${Math.round(pct * 100)}%`, height: '100%',
        background: 'var(--primary)', transition: 'width .2s var(--ease)',
      }} />
    </div>
  );
}

// ── Detail screen for one club ───────────────────────────────
function ClubDetailScreen({ club, allRounds, onBack }) {
  const clubShots = useMi(() => allShotsFor(club.id, allRounds), [club, allRounds]);
  const stats = useMi(() => clubStats(club, allRounds), [club, allRounds]);
  const catLabel = CLUB_CATEGORIES.find(c => c.id === club.category)?.label || '';
  const isPutter = club.category === 'putter';

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font)', fontVariantNumeric: 'tabular-nums',
      display: 'flex', flexDirection: 'column',
    }}>
      <TopBar
        left={<RoundIconBtn icon="left" onClick={onBack} />}
        title={club.name}
        sub={catLabel}
      />

      <div className="gg-screen" style={{ flex: 1, padding: '4px 18px 30px' }}>
        {/* Big stat card */}
        {!isPutter && (
          <Card style={{ marginBottom: 18, textAlign: 'center' }}>
            <Label style={{ marginBottom: 8 }}>Ø-Distanz</Label>
            <div className="expanded tnum" style={{
              fontWeight: 900, fontSize: 64, lineHeight: 1, letterSpacing: '-.02em',
              color: stats.distanceM != null ? 'var(--ink)' : 'var(--ink-faint)',
            }}>
              {stats.distanceM != null ? Math.round(stats.distanceM) : '–'}
              <span style={{ fontSize: 24, color: 'var(--ink-faint)', fontWeight: 700, marginLeft: 4 }}>m</span>
            </div>
            <div style={{
              fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600, marginTop: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {stats.sampleN > 0 ? (
                <>
                  <span>{stats.sampleN} Schläge</span>
                  <span style={{ color: 'var(--ink-faint)' }}>·</span>
                  <span>Konfidenz {Math.round(stats.confidence * 100)}%</span>
                </>
              ) : (
                <span>Nur Startschätzung — spiel ein paar Runden</span>
              )}
            </div>
          </Card>
        )}

        {/* Distance-over-time chart */}
        {!isPutter && (
          <>
            <Label style={{ marginBottom: 10 }}>Distanz über Zeit</Label>
            <Card pad={14} style={{ marginBottom: 22 }}>
              <ClubDistanceChart shots={clubShots} seededDistance={club.seededDistance} />
            </Card>
          </>
        )}

        {/* Recent shots table */}
        <Label style={{ marginBottom: 10 }}>Schläge im Verlauf</Label>
        <Card pad={0} style={{ marginBottom: 18, overflow: 'hidden' }}>
          {clubShots.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-faint)', fontWeight: 700, fontSize: 14 }}>
              Noch keine getrackten Schläge
            </div>
          ) : (
            [...clubShots].reverse().slice(0, 30).map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', padding: '11px 14px', gap: 12,
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{s.roundName || 'Runde'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 2 }}>
                    Loch {s.hole} · {s.when ? relTime(s.when) : 'live'}
                    {s.end && <> · <Icon name="map-pin" size={10} sw={2.4} style={{ verticalAlign: '-1px' }} /></>}
                  </div>
                </div>
                {!isPutter && (
                  <div className="tnum" style={{ fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                    {Math.round(s.distanceM)}
                    <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, marginLeft: 2 }}>m</span>
                  </div>
                )}
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { ClubInventoryScreen, ClubDetailScreen, ClubDistanceChart, allShotsFor });
