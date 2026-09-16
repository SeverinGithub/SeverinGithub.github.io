// grinder-shots.jsx — Shot list + club picker for advanced tracking
const { useState: useSs2 } = React;

// ── Bottom-sheet club picker ────────────────────────────────
function ClubPickerSheet({ clubs, currentClubId, onPick, onClose }) {
  const groups = CLUB_CATEGORIES
    .map(cat => ({ cat, list: (clubs || []).filter(c => c.category === cat.id && !c.retiredAt) }))
    .filter(g => g.list.length > 0);

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(2px)',
      animation: 'gg-screen-in .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxHeight: '78%', background: 'var(--bg)',
        borderRadius: '28px 28px 0 0', padding: '14px 18px 24px',
        boxShadow: '0 -10px 40px rgba(0,0,0,.3)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          width: 40, height: 5, borderRadius: 99, background: 'var(--line-strong)',
          margin: '0 auto 14px', flexShrink: 0,
        }} />
        <Label style={{ marginBottom: 12 }}>Schläger wählen</Label>
        <div style={{ flex: 1, overflowY: 'auto', margin: '0 -18px', padding: '0 18px' }}>
          {groups.map(({ cat, list }) => (
            <div key={cat.id} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)',
                letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6, padding: '0 4px',
              }}>{cat.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {list.map(c => {
                  const active = c.id === currentClubId;
                  return (
                    <button key={c.id} onClick={() => onPick(c.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      textAlign: 'left', border: 'none', cursor: 'pointer',
                      background: 'var(--surface)', borderRadius: 14, padding: '10px 12px',
                      boxShadow: active ? 'inset 0 0 0 2px var(--primary), var(--shadow-sm)' : 'var(--shadow-sm)',
                      WebkitTapHighlightColor: 'transparent',
                    }}>
                      <div style={{ flex: 1, fontWeight: 800, fontSize: 15 }}>{c.name}</div>
                      {c.seededDistance != null && (
                        <div className="tnum" style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink-soft)' }}>
                          {Math.round(c.seededDistance)} m
                        </div>
                      )}
                      {active && <Icon name="check" size={16} sw={2.6} style={{ color: 'var(--primary)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--ink-faint)', fontWeight: 600 }}>
              Keine Schläger im Bag. Legs erst über das Bag-Icon an.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── One shot row ────────────────────────────────────────────
function ShotRow({ index, shot, club, onUpdate, onRemove, onPickClub }) {
  const isPutter = club && club.category === 'putter';
  return (
    <div style={{
      background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Row 1: shot number + club chip + remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="tnum" style={{
          width: 22, fontWeight: 800, fontSize: 13,
          color: 'var(--ink-faint)', flexShrink: 0,
        }}>{index + 1}.</div>
        <button onClick={onPickClub} style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: 'none', cursor: 'pointer',
          borderRadius: 10, padding: '7px 11px', color: 'var(--ink)',
          fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14,
          textAlign: 'left', boxShadow: 'var(--shadow-sm)',
          WebkitTapHighlightColor: 'transparent',
        }}>
          <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {club ? club.name : 'Schläger wählen…'}
          </div>
          <Icon name="right" size={14} sw={2.4} style={{ color: 'var(--ink-faint)' }} />
        </button>
        <button onClick={onRemove} aria-label="Schlag entfernen" style={{
          width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--surface)', color: 'var(--ink-faint)', flexShrink: 0,
          display: 'grid', placeItems: 'center', WebkitTapHighlightColor: 'transparent',
        }}><Icon name="x" size={14} sw={2.4} /></button>
      </div>

      {/* Row 2: distance — hidden for putter (typing exact putt distances is friction) */}
      {!isPutter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 30 }}>
          <input
            type="range" min={5} max={300} step={5}
            value={shot.distanceM ?? (club?.seededDistance ?? 100)}
            onChange={e => onUpdate({ distanceM: +e.target.value })}
            className="gg-range" style={{ flex: 1 }}
          />
          <div className="tnum" style={{
            minWidth: 48, textAlign: 'right', fontWeight: 800, fontSize: 14,
          }}>{Math.round(shot.distanceM ?? (club?.seededDistance ?? 100))} m</div>
        </div>
      )}
    </div>
  );
}

// ── Shot list for one player-hole ───────────────────────────
function ShotList({ round, playerId, hole /* 1..N */, clubs, onChange }) {
  const [pickerFor, setPickerFor] = useSs2(null);  // shot.id when open
  const shots = shotsFor(round, playerId, hole);
  const activeBag = activeClubs(clubs);
  const lastUsedClubId = shots.length > 0 ? shots[shots.length - 1].clubId : (activeBag[0]?.id ?? null);

  const mutate = (fn) => {
    const next = { ...round, shots: (round.shots || []).slice() };
    fn(next);
    syncScoreFromShots(next, playerId, hole);
    onChange(next);
  };

  const addNewShot = () => mutate(next => {
    // Default distance = last shot's distance, else the seeded distance of the club.
    const club = findClub(activeBag, lastUsedClubId);
    const defaultDistance = club && typeof club.seededDistance === 'number' ? club.seededDistance : 100;
    addShot(next, {
      playerId, hole,
      clubId: lastUsedClubId,
      distanceM: defaultDistance,
      lie: shots.length === 0 ? 'tee' : 'fairway',
    });
  });

  const updateOne = (shotId, patch) => mutate(next => updateShot(next, shotId, patch));
  const removeOne = (shotId) => mutate(next => removeShot(next, shotId));
  const pickClub = (clubId) => {
    if (pickerFor) updateOne(pickerFor, { clubId });
    setPickerFor(null);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {shots.map((s, i) => (
          <ShotRow key={s.id} index={i} shot={s}
            club={findClub(activeBag, s.clubId)}
            onUpdate={(patch) => updateOne(s.id, patch)}
            onRemove={() => removeOne(s.id)}
            onPickClub={() => setPickerFor(s.id)}
          />
        ))}
        <button onClick={addNewShot} style={{
          width: '100%', border: '1.5px dashed var(--line-strong)', background: 'transparent',
          color: 'var(--ink-soft)', borderRadius: 12, padding: '10px', cursor: 'pointer',
          fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          WebkitTapHighlightColor: 'transparent',
        }}>
          <Icon name="plus" size={16} sw={2.6} /> Schlag hinzufügen
        </button>
      </div>

      {pickerFor && (
        <ClubPickerSheet
          clubs={activeBag}
          currentClubId={shots.find(s => s.id === pickerFor)?.clubId}
          onPick={pickClub}
          onClose={() => setPickerFor(null)}
        />
      )}
    </>
  );
}

Object.assign(window, { ShotList, ClubPickerSheet, ShotRow });
