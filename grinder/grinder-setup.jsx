// grinder-setup-play.jsx — Setup + Play screens
const { useState: useS, useRef: useR, useEffect: useE } = React;

// shared top bar
function TopBar({ left, title, sub, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 16px 14px', minHeight: 52,
    }}>
      <div style={{ width: 44, display: 'flex', justifyContent: 'flex-start' }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center', lineHeight: 1.1 }}>
        {title && <div style={{ fontWeight: 800, fontSize: 17 }}>{title}</div>}
        {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ width: 44, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

function RoundIconBtn({ icon, onClick, tone }) {
  return (
    <button onClick={onClick} style={{
      width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
      background: 'var(--surface)', color: tone || 'var(--ink)', boxShadow: 'var(--shadow-sm)',
      display: 'grid', placeItems: 'center', WebkitTapHighlightColor: 'transparent',
    }}><Icon name={icon} size={20} /></button>
  );
}

/* ── Haversine distance in km ───────────────────────────── */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ══════════════════════════ SETUP ══════════════════════════ */
function SetupScreen({ onStart, onHistory, hasHistory, maxPlayers = 8 }) {
  const [players, setPlayers] = useS(['Spieler 1']);
  const [courseId, setCourseId] = useS(COURSES[0].id);
  const [custom, setCustom] = useS('');
  const [holes, setHoles] = useS(9);
  const [modePar, setModePar] = useS(true);
  const [modeStbl, setModeStbl] = useS(false);
  const [nearbyCourses, setNearbyCourses] = useS([]);
  const [geoState, setGeoState] = useS('idle'); // idle | loading | done | denied | error

  const isCustom = courseId === 'custom';
  const isNearby = courseId.startsWith('nearby-');
  const staticCourse = COURSES.find(c => c.id === courseId);
  const nearbyCourse = nearbyCourses.find(c => c.id === courseId);
  const course = staticCourse || nearbyCourse;
  const courseName = isCustom ? (custom.trim() || 'Eigener Platz') : (course ? course.name : COURSES[0].name);
  const validNames = players.map(p => p.trim()).filter(Boolean);
  const canStart = validNames.length > 0;

  const setName = (i, v) => setPlayers(p => p.map((x, j) => j === i ? v : x));
  const addPlayer = () => players.length < maxPlayers && setPlayers(p => [...p, `Spieler ${p.length + 1}`]);
  const rmPlayer = (i) => setPlayers(p => p.filter((_, j) => j !== i));

  const findNearby = () => {
    if (!navigator.geolocation) { setGeoState('error'); return; }
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        const q = `[out:json][timeout:15];(way["leisure"="golf_course"](around:30000,${lat},${lon});relation["leisure"="golf_course"](around:30000,${lat},${lon}););out center 20;`;
        try {
          const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST', body: q,
          });
          const data = await res.json();
          const courses = data.elements
            .filter(el => el.center || (el.lat && el.lon))
            .map(el => {
              const clat = el.center ? el.center.lat : el.lat;
              const clon = el.center ? el.center.lon : el.lon;
              const dist = haversine(lat, lon, clat, clon);
              const name = el.tags?.name || el.tags?.['name:de'] || 'Golfplatz';
              return { id: `nearby-${el.id}`, name, location: `${dist.toFixed(1)} km entfernt`, dist, pars: null };
            })
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 3);
          setNearbyCourses(courses);
          setGeoState('done');
          if (courses.length > 0) setCourseId(courses[0].id);
        } catch {
          setGeoState('error');
        }
      },
      (err) => setGeoState(err.code === 1 ? 'denied' : 'error'),
      { timeout: 10000 }
    );
  };

  const start = () => {
    if (!canStart) return;
    const names = players.map(p => p.trim()).filter(Boolean);
    const resolvedCourse = isNearby ? nearbyCourse : (isCustom ? null : course);
    const pars = buildPars(resolvedCourse, holes);
    const pl = names.map(n => ({ id: uid(), name: n }));
    const scores = {};
    pl.forEach(p => { scores[p.id] = Array(holes).fill(null); });
    onStart({
      id: uid(), courseId: isCustom ? null : courseId, courseName,
      location: isCustom ? '' : (course ? course.location : ''),
      holes, pars, modePar, modeStbl, players: pl, scores,
      currentHole: 0, startedAt: Date.now(), status: 'live',
    });
  };

  const allCourses = [...nearbyCourses, ...COURSES];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font)', fontVariantNumeric: 'tabular-nums', WebkitFontSmoothing: 'antialiased' }}>
      <div className="gg-screen" style={{ padding: '52px 18px 20px' }}>

        {/* wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center' }}>
                <Icon name="flag" size={20} sw={2.4} />
              </div>
              <div className="expanded" style={{ fontWeight: 900, fontSize: 30, letterSpacing: '-.01em', lineHeight: 1 }}>GRINDER</div>
            </div>
            <div style={{ color: 'var(--ink-soft)', fontWeight: 600, fontSize: 14, marginTop: 7 }}>Neue Runde aufsetzen</div>
          </div>
          {hasHistory && <RoundIconBtn icon="clock" onClick={onHistory} />}
        </div>

        {/* players */}
        <Label style={{ marginBottom: 10 }}>Wer spielt mit?</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {players.map((name, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)',
              borderRadius: 16, padding: '8px 8px 8px 14px', boxShadow: 'var(--shadow-sm)',
            }}>
              <Avatar name={name} i={i} />
              <input value={name} onChange={e => setName(i, e.target.value)} placeholder={`Spieler ${i + 1}`}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'var(--font)', fontWeight: 700, fontSize: 16, color: 'var(--ink)',
                }} />
              {players.length > 1 && (
                <button onClick={() => rmPlayer(i)} style={{
                  width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'var(--surface-2)', color: 'var(--ink-faint)', display: 'grid', placeItems: 'center',
                }}><Icon name="x" size={16} sw={2.4} /></button>
              )}
            </div>
          ))}
        </div>
        {players.length < maxPlayers && (
          <button onClick={addPlayer} style={{
            width: '100%', border: '1.5px dashed var(--line-strong)', background: 'transparent',
            color: 'var(--ink-soft)', borderRadius: 16, padding: '13px', cursor: 'pointer',
            fontFamily: 'var(--font)', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 26,
            whiteSpace: 'nowrap',
          }}><Icon name="plus" size={18} sw={2.6} /> Spieler hinzufügen</button>
        )}

        {/* course */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Label>Platz</Label>
          <button onClick={findNearby} disabled={geoState === 'loading'} style={{
            display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
            background: 'var(--surface)', borderRadius: 99, padding: '6px 12px 6px 10px',
            color: geoState === 'error' ? 'var(--over)' : 'var(--primary)',
            fontFamily: 'var(--font)', fontWeight: 700, fontSize: 13, boxShadow: 'var(--shadow-sm)',
            WebkitTapHighlightColor: 'transparent', opacity: geoState === 'loading' ? .6 : 1,
          }}>
            <Icon name={geoState === 'loading' ? 'loader' : 'map-pin'} size={15} sw={2.4} />
            {geoState === 'loading' ? 'Suche…' : geoState === 'denied' ? 'Zugriff verweigert' : geoState === 'error' ? 'Fehler' : geoState === 'done' ? 'Aktualisieren' : 'In der Nähe'}
          </button>
        </div>

        {nearbyCourses.length > 0 && (
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '0 4px', marginBottom: 8 }}>
            Nahe bei dir
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: nearbyCourses.length > 0 ? 16 : 26 }}>
          {nearbyCourses.map(c => {
            const active = c.id === courseId;
            return (
              <button key={c.id} onClick={() => setCourseId(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
                background: 'var(--surface)', border: 'none', cursor: 'pointer',
                borderRadius: 16, padding: 14,
                boxShadow: active ? 'inset 0 0 0 2px var(--primary), var(--shadow-sm)' : 'var(--shadow-sm)',
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="map-pin" size={19} sw={2.2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{c.location}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  background: active ? 'var(--primary)' : 'transparent', color: 'var(--on-primary)',
                  boxShadow: active ? 'none' : 'inset 0 0 0 2px var(--line-strong)',
                }}>{active && <Icon name="check" size={14} sw={3} />}</div>
              </button>
            );
          })}
        </div>

        {nearbyCourses.length > 0 && (
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '0 4px', marginBottom: 8 }}>
            Alle Plätze
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
          {COURSES.map(c => {
            const active = c.id === courseId;
            return (
              <button key={c.id} onClick={() => setCourseId(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
                background: 'var(--surface)', border: 'none', cursor: 'pointer',
                borderRadius: 16, padding: 14, boxShadow: active ? 'inset 0 0 0 2px var(--primary), var(--shadow-sm)' : 'var(--shadow-sm)',
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="flag" size={19} sw={2.2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{c.location} · Par {c.pars.reduce((a,b)=>a+b,0)}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  background: active ? 'var(--primary)' : 'transparent', color: 'var(--on-primary)',
                  boxShadow: active ? 'none' : 'inset 0 0 0 2px var(--line-strong)',
                }}>{active && <Icon name="check" size={14} sw={3} />}</div>
              </button>
            );
          })}
          <button onClick={() => setCourseId('custom')} style={{
            display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
            background: 'var(--surface)', border: 'none', cursor: 'pointer',
            borderRadius: 16, padding: isCustom ? '14px 14px 8px' : 14,
            boxShadow: isCustom ? 'inset 0 0 0 2px var(--primary), var(--shadow-sm)' : 'var(--shadow-sm)',
            flexDirection: isCustom ? 'column' : 'row', alignItems: isCustom ? 'stretch' : 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                <Icon name="plus" size={19} sw={2.4} />
              </div>
              <div style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>Eigener Platz</div>
            </div>
            {isCustom && (
              <input autoFocus value={custom} onChange={e => setCustom(e.target.value)} placeholder="Platzname eingeben…"
                onClick={e => e.stopPropagation()}
                style={{
                  marginTop: 10, width: '100%', border: 'none', borderTop: '1px solid var(--line)',
                  background: 'transparent', outline: 'none', padding: '10px 2px 2px',
                  fontFamily: 'var(--font)', fontWeight: 700, fontSize: 15, color: 'var(--ink)',
                }} />
            )}
          </button>
        </div>

        {/* holes */}
        <Label style={{ marginBottom: 10 }}>Wie viele Löcher?</Label>
        <Seg style={{ marginBottom: 26 }}
          options={[{ value: 3, label: '3' }, { value: 6, label: '6' }, { value: 9, label: '9' }, { value: 18, label: '18' }]}
          value={holes} onChange={setHoles} />

        {/* scoring modes */}
        <Label style={{ marginBottom: 10 }}>Zählweise</Label>
        <Card pad={4} style={{ marginBottom: 8 }}>
          <ModeRow label="Schläge zählen" sub="Immer aktiv" locked checked />
          <div style={{ height: 1, background: 'var(--line)', margin: '0 14px' }} />
          <ModeRow label="Par-Vergleich" sub="Zeigt +/– zum Par je Loch" checked={modePar} onToggle={() => setModePar(v => !v)} />
          <div style={{ height: 1, background: 'var(--line)', margin: '0 14px' }} />
          <ModeRow label="Stableford" sub="Punkte statt nur Schläge" checked={modeStbl} onToggle={() => setModeStbl(v => !v)} />
        </Card>
        <div style={{ fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 600, padding: '2px 6px', marginBottom: 100 }}>
          Tipp: Zählweise lässt sich nur vor dem Start wählen.
        </div>
      </div>

      {/* sticky start */}
      <div style={{
        position: 'sticky', bottom: 0, padding: '14px 18px 30px',
        background: 'linear-gradient(to top, var(--bg) 62%, transparent)',
      }}>
        <Btn size="lg" onClick={start} disabled={!canStart} icon="flag" style={{ whiteSpace: 'nowrap' }}>
          Runde starten · {holes} Löcher
        </Btn>
      </div>
    </div>
  );
}

function ModeRow({ label, sub, checked, onToggle, locked }) {
  return (
    <div onClick={locked ? undefined : onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
      cursor: locked ? 'default' : 'pointer', WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15.5, color: locked ? 'var(--ink-soft)' : 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{
        width: 50, height: 30, borderRadius: 99, padding: 3, flexShrink: 0,
        background: checked ? 'var(--primary)' : 'var(--line-strong)',
        opacity: locked ? .55 : 1, transition: 'background .2s var(--ease)',
        display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
      }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'all .2s var(--ease)' }} />
      </div>
    </div>
  );
}

window.SetupScreen = SetupScreen;
window.TopBar = TopBar;
window.RoundIconBtn = RoundIconBtn;
