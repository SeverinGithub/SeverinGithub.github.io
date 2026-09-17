// grinder-clubs.jsx — Bag onboarding + edit screen
const { useState: useSCB } = React;

// ── Range-Slider styling (injected once) ─────────────────────
(function injectClubStyles() {
  if (document.getElementById('gg-club-styles')) return;
  const el = document.createElement('style');
  el.id = 'gg-club-styles';
  el.textContent = `
    .gg-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6px;
      background: var(--surface-2); border-radius: 999px; outline: none; margin: 0; }
    .gg-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none;
      width: 26px; height: 26px; border-radius: 50%; background: var(--primary);
      cursor: grab; border: 3px solid var(--surface); box-shadow: var(--shadow-sm); }
    .gg-range::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%;
      background: var(--primary); cursor: grab; border: 3px solid var(--surface);
      box-shadow: var(--shadow-sm); }
    .gg-range:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.06); }
  `;
  document.head.appendChild(el);
})();

// Defaults when the user adds a new club in a category.
const NEW_CLUB_DEFAULTS = {
  driver: { name: 'Driver',      seededDistance: 210, seededDispersion: 'wide'   },
  wood:   { name: 'Fairwayholz', seededDistance: 180, seededDispersion: 'medium' },
  hybrid: { name: 'Hybrid',      seededDistance: 165, seededDispersion: 'medium' },
  iron:   { name: 'Eisen',       seededDistance: 140, seededDispersion: 'medium' },
  wedge:  { name: 'Wedge',       seededDistance:  80, seededDispersion: 'tight'  },
  putter: { name: 'Putter',      seededDistance: null, seededDispersion: null    },
};

// ── One club card ───────────────────────────────────────────
function ClubRow({ club, onUpdate, onRemove, onMove, atTop, atBottom }) {
  const isPutter = club.category === 'putter';
  const arrowStyle = (disabled) => ({
    width: 26, height: 14, border: 'none', borderRadius: 6,
    cursor: disabled ? 'default' : 'pointer',
    background: 'var(--surface-2)', color: 'var(--ink-faint)',
    display: 'grid', placeItems: 'center', flexShrink: 0,
    opacity: disabled ? 0.35 : 1, WebkitTapHighlightColor: 'transparent',
  });
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18, padding: 14,
      boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column',
      gap: isPutter ? 0 : 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          value={club.name}
          onChange={e => onUpdate(club.id, { name: e.target.value })}
          placeholder="Schläger benennen"
          style={{
            flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'var(--font)', fontWeight: 800, fontSize: 16, color: 'var(--ink)',
            padding: 0,
          }}
        />
        {onMove && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            <button onClick={() => onMove('up')} disabled={atTop} aria-label="Nach oben"
              style={arrowStyle(atTop)}>
              <Icon name="up" size={12} sw={2.6} />
            </button>
            <button onClick={() => onMove('down')} disabled={atBottom} aria-label="Nach unten"
              style={arrowStyle(atBottom)}>
              <Icon name="down" size={12} sw={2.6} />
            </button>
          </div>
        )}
        <button onClick={() => onRemove(club.id)} aria-label="Entfernen" style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--surface-2)', color: 'var(--ink-faint)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
        }}><Icon name="x" size={15} sw={2.4} /></button>
      </div>

      {!isPutter && (
        <>
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)',
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8,
            }}>
              <span>Distanz</span>
              <span className="tnum" style={{
                fontSize: 18, fontWeight: 800, color: 'var(--ink)',
                letterSpacing: 0, textTransform: 'none',
              }}>{Math.round(club.seededDistance ?? 100)} m</span>
            </div>
            <input
              type="range" min={30} max={280} step={5}
              value={club.seededDistance ?? 100}
              onChange={e => onUpdate(club.id, { seededDistance: +e.target.value })}
              className="gg-range"
            />
          </div>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)',
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8,
            }}>Streuung</div>
            <Seg
              options={[
                { value: 'tight',  label: 'Eng'    },
                { value: 'medium', label: 'Mittel' },
                { value: 'wide',   label: 'Weit'   },
              ]}
              value={club.seededDispersion || 'medium'}
              onChange={v => onUpdate(club.id, { seededDispersion: v })}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Category section (label + cards + add button) ───────────
function CategorySection({ category, clubs, onUpdate, onRemove, onAdd, onMove }) {
  const singleton = clubs.length <= 1;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10, padding: '0 2px',
      }}>
        <Label>{category.label}</Label>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>
          {clubs.length}
        </div>
      </div>
      {clubs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          {clubs.map((c, i) => (
            <ClubRow key={c.id} club={c}
              onUpdate={onUpdate} onRemove={onRemove}
              onMove={singleton ? null : ((dir) => onMove(c.id, dir))}
              atTop={i === 0}
              atBottom={i === clubs.length - 1}
            />
          ))}
        </div>
      )}
      <button onClick={() => onAdd(category.id)} style={{
        width: '100%', border: '1.5px dashed var(--line-strong)', background: 'transparent',
        color: 'var(--ink-soft)', borderRadius: 14, padding: '11px', cursor: 'pointer',
        fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        WebkitTapHighlightColor: 'transparent',
      }}>
        <Icon name="plus" size={16} sw={2.6} /> {category.label} hinzufügen
      </button>
    </div>
  );
}

// ── Main screen ─────────────────────────────────────────────
function ClubBagScreen({ initialClubs, isOnboarding = false, onDone, onCancel }) {
  const [clubs, setClubs] = useSCB(() =>
    initialClubs && initialClubs.length ? initialClubs.map(c => ({ ...c })) : buildDefaultBag()
  );

  const updateClub = (id, patch) =>
    setClubs(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c));
  const removeClub = (id) =>
    setClubs(cs => cs.filter(c => c.id !== id));
  const addClub = (category) => {
    setClubs(cs => [...cs, {
      id: uid(), category,
      seat: cs.length, createdAt: Date.now(), retiredAt: null,
      ...NEW_CLUB_DEFAULTS[category],
    }]);
  };
  // Swap this club's array position with the previous/next club of the same
  // category. Order-within-category is what the user sees + edits; seats are
  // reassigned from array index on save.
  const moveClub = (id, dir /* 'up' | 'down' */) => {
    setClubs(cs => {
      const idx = cs.findIndex(c => c.id === id);
      if (idx === -1) return cs;
      const cat = cs[idx].category;
      const step = dir === 'up' ? -1 : 1;
      // Find the neighbour of the same category in that direction.
      let neighbourIdx = -1;
      for (let j = idx + step; j >= 0 && j < cs.length; j += step) {
        if (cs[j].category === cat) { neighbourIdx = j; break; }
      }
      if (neighbourIdx === -1) return cs;
      const next = cs.slice();
      [next[idx], next[neighbourIdx]] = [next[neighbourIdx], next[idx]];
      return next;
    });
  };

  const total = clubs.length;
  const finish = () => onDone(clubs.map((c, i) => ({ ...c, seat: i })));

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font)', fontVariantNumeric: 'tabular-nums',
      WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column',
    }}>
      {!isOnboarding && (
        <TopBar
          left={<RoundIconBtn icon="left" onClick={onCancel} />}
          title="Dein Bag"
          sub="Schläger + Distanzen"
        />
      )}

      <div className="gg-screen" style={{
        flex: 1, padding: isOnboarding ? '52px 18px 20px' : '4px 18px 20px',
      }}>
        {isOnboarding && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'var(--primary)', color: 'var(--on-primary)',
                  display: 'grid', placeItems: 'center',
                }}><Icon name="flag" size={20} sw={2.4} /></div>
                <div className="expanded" style={{
                  fontWeight: 900, fontSize: 30, letterSpacing: '-.01em', lineHeight: 1,
                }}>DEIN BAG</div>
              </div>
              <div style={{
                color: 'var(--ink-soft)', fontWeight: 600, fontSize: 14, marginTop: 7,
              }}>Richte einmal ein, dann lernt die App weiter.</div>
            </div>
            <div style={{
              background: 'var(--surface-2)', borderRadius: 18, padding: 14,
              marginBottom: 22, fontSize: 13.5, color: 'var(--ink-soft)',
              fontWeight: 600, lineHeight: 1.45,
            }}>
              Trag ungefähr ein, wie weit du mit jedem Schläger schlägst.
              Wir nutzen diese Werte als Startpunkt und ersetzen sie automatisch,
              sobald du echte Schläge trackst.
            </div>
          </>
        )}

        {CLUB_CATEGORIES.map(cat => {
          const inCat = clubs.filter(c => c.category === cat.id);
          return (
            <CategorySection key={cat.id} category={cat} clubs={inCat}
              onUpdate={updateClub} onRemove={removeClub} onAdd={addClub}
              onMove={moveClub} />
          );
        })}

        <div style={{ height: 100 }} />
      </div>

      <div style={{
        position: 'sticky', bottom: 0, padding: '14px 18px 30px',
        background: 'linear-gradient(to top, var(--bg) 62%, transparent)',
      }}>
        <Btn size="lg" onClick={finish} icon={isOnboarding ? 'flag' : 'check'}
          disabled={total === 0}>
          {isOnboarding ? `Los geht's · ${total} Schläger` : 'Fertig'}
        </Btn>
      </div>
    </div>
  );
}

window.ClubBagScreen = ClubBagScreen;
