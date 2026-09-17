// grinder-map.jsx — Leaflet + ESRI Imagery picker for shot end position
const { useRef: useRm, useEffect: useEm, useState: useSm } = React;

// ESRI World Imagery — free satellite tiles, no API key.
const ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_ATTR = 'Tiles © Esri';

function makePin(color) {
  // Uses inline SVG so it inherits our design language, not Leaflet defaults.
  const html = `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`;
  return L.divIcon({ html, className: '', iconSize: [22, 22], iconAnchor: [11, 11] });
}

// Target = intended aim. Ring with center dot, visually distinct from the
// solid start/end pins so the eye can immediately tell "aim vs. ball".
function makeTargetPin() {
  const html = `<div style="width:26px;height:26px;border-radius:50%;background:rgba(78,201,240,.22);border:3px solid #4EC9F0;box-shadow:0 2px 6px rgba(0,0,0,.4);display:grid;place-items:center;box-sizing:border-box;"><div style="width:6px;height:6px;border-radius:50%;background:#fff;"></div></div>`;
  return L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });
}

function MapPickerModal({ startPos, initialEnd, initialTarget, onPick, onCancel, title = 'Ballposition' }) {
  const mapContainer = useRm(null);
  const mapRef = useRm(null);
  const startMarkerRef = useRm(null);
  const endMarkerRef = useRm(null);
  const targetMarkerRef = useRm(null);
  const shotLineRef = useRm(null);   // solid: start → end
  const aimLineRef = useRm(null);    // dashed cyan: start → target

  // If we don't have a startPos, first tap sets it; second tap sets end.
  const [start, setStart] = useSm(startPos || null);
  const [end, setEnd] = useSm(initialEnd || null);
  const [target, setTarget] = useSm(initialTarget || null);
  // Which position the next map-tap sets. Default 'end'; each toggle enables
  // its mode for one tap, then auto-reverts. The ref mirrors state so the
  // map's click closure (defined once) always sees the current value.
  const [tapMode, setTapMode] = useSm('end');  // 'end' | 'target' | 'start'
  const tapModeRef = useRm('end');
  useEm(() => { tapModeRef.current = tapMode; }, [tapMode]);
  // Golf-course nearby search via Overpass — reuses the pattern from Setup.
  const [courseSearch, setCourseSearch] = useSm({ status: 'idle', results: [] });
  const [courseSheetOpen, setCourseSheetOpen] = useSm(false);

  const distanceM = (start && end)
    ? haversineM(start.lat, start.lng, end.lat, end.lng)
    : null;
  const lateralM = (start && target && end)
    ? lateralOffsetM(start, target, end)
    : null;

  // Draw / update markers + lines whenever positions change.
  useEm(() => {
    const map = mapRef.current;
    if (!map) return;

    // start marker (green)
    if (start) {
      const ll = [start.lat, start.lng];
      if (startMarkerRef.current) startMarkerRef.current.setLatLng(ll);
      else startMarkerRef.current = L.marker(ll, { icon: makePin('#2ECC71'), interactive: false }).addTo(map);
    } else if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current); startMarkerRef.current = null;
    }

    // end marker (accent)
    if (end) {
      const ll = [end.lat, end.lng];
      if (endMarkerRef.current) endMarkerRef.current.setLatLng(ll);
      else endMarkerRef.current = L.marker(ll, { icon: makePin('#DCEB4E'), interactive: false }).addTo(map);
    } else if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current); endMarkerRef.current = null;
    }

    // target marker (cyan crosshair)
    if (target) {
      const ll = [target.lat, target.lng];
      if (targetMarkerRef.current) targetMarkerRef.current.setLatLng(ll);
      else targetMarkerRef.current = L.marker(ll, { icon: makeTargetPin(), interactive: false }).addTo(map);
    } else if (targetMarkerRef.current) {
      map.removeLayer(targetMarkerRef.current); targetMarkerRef.current = null;
    }

    // solid line start → end (actual shot)
    if (start && end) {
      const path = [[start.lat, start.lng], [end.lat, end.lng]];
      if (shotLineRef.current) shotLineRef.current.setLatLngs(path);
      else shotLineRef.current = L.polyline(path, { color: '#fff', weight: 2, dashArray: '6, 6', opacity: .9 }).addTo(map);
    } else if (shotLineRef.current) {
      map.removeLayer(shotLineRef.current); shotLineRef.current = null;
    }

    // dashed cyan line start → target (intended aim)
    if (start && target) {
      const path = [[start.lat, start.lng], [target.lat, target.lng]];
      if (aimLineRef.current) aimLineRef.current.setLatLngs(path);
      else aimLineRef.current = L.polyline(path, { color: '#4EC9F0', weight: 1.5, dashArray: '3, 5', opacity: .85 }).addTo(map);
    } else if (aimLineRef.current) {
      map.removeLayer(aimLineRef.current); aimLineRef.current = null;
    }
  }, [start, end, target]);

  // Initialize the map once.
  useEm(() => {
    if (!mapContainer.current || !window.L) return;

    const center = startPos ? [startPos.lat, startPos.lng]
                            : (initialEnd ? [initialEnd.lat, initialEnd.lng] : [51, 10]);
    const zoom = (startPos || initialEnd) ? 18 : 5;

    const map = L.map(mapContainer.current, {
      center, zoom, zoomControl: false, attributionControl: false, maxZoom: 19,
    });
    L.tileLayer(ESRI_URL, { attribution: ESRI_ATTR, maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    // Latest tap mode lives in a ref so the click closure sees fresh values.
    tapModeRef.current = 'end';
    map.on('click', (e) => {
      const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
      // Precedence: if there's no start yet, first tap sets it.
      if (!startMarkerRef.current && !startPos) { setStart(pos); return; }
      const mode = tapModeRef.current;
      if (mode === 'start') {
        setStart(pos);
      } else if (mode === 'target') {
        setTarget(pos);
      } else {
        setEnd(pos);
      }
      if (mode !== 'end') {
        tapModeRef.current = 'end';   // auto-revert after one tap
        setTapMode('end');
      }
    });

    mapRef.current = map;
    // Container may be zero-sized at mount inside a flex column; nudge Leaflet.
    setTimeout(() => map.invalidateSize(), 60);
    setTimeout(() => map.invalidateSize(), 400);

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const canConfirm = !!(start && end);
  const confirm = () => {
    if (!canConfirm) return;
    onPick({
      start, end, target,
      distanceM: Math.round(distanceM),
      lateralOffsetM: lateralM != null ? Math.round(lateralM) : null,
    });
  };

  const reset = () => { setEnd(null); if (!startPos) setStart(null); };
  const toggleTargetMode = () => setTapMode(m => m === 'target' ? 'end' : 'target');
  const toggleStartMode = () => setTapMode(m => m === 'start' ? 'end' : 'start');
  const clearTarget = () => { setTarget(null); setTapMode('end'); };

  // Overpass API query for golf courses within 30 km of the map centre.
  // Same pattern as SetupScreen's findNearby(), just anchored to what the
  // user is currently looking at, not their device GPS.
  const searchNearbyCourses = async () => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    setCourseSearch({ status: 'loading', results: [] });
    setCourseSheetOpen(true);
    try {
      const q = `[out:json][timeout:15];(way["leisure"="golf_course"](around:30000,${c.lat},${c.lng});relation["leisure"="golf_course"](around:30000,${c.lat},${c.lng}););out center 20;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
      const data = await res.json();
      const results = (data.elements || [])
        .filter(el => el.center || (el.lat && el.lon))
        .map(el => {
          const clat = el.center ? el.center.lat : el.lat;
          const clon = el.center ? el.center.lon : el.lon;
          const distM = haversineM(c.lat, c.lng, clat, clon);
          const name = el.tags?.name || el.tags?.['name:de'] || 'Golfplatz';
          return { id: el.id, name, lat: clat, lng: clon, distM };
        })
        .sort((a, b) => a.distM - b.distM)
        .slice(0, 10);
      setCourseSearch({ status: 'done', results });
    } catch (e) {
      setCourseSearch({ status: 'error', results: [] });
    }
  };

  const flyToCourse = (course) => {
    mapRef.current?.flyTo([course.lat, course.lng], 16, { duration: 0.8 });
    setCourseSheetOpen(false);
  };

  const subText = !start
    ? 'Erst Startposition tippen'
    : tapMode === 'start'
      ? 'Neue Startposition tippen'
      : tapMode === 'target'
        ? 'Zielposition tippen'
        : !end
          ? 'Ballposition tippen'
          : `${Math.round(distanceM)} m`;

  // Human-readable lateral offset — signed → "12 m rechts" / "8 m links".
  const lateralLabel = lateralM != null
    ? `${Math.abs(Math.round(lateralM))} m ${lateralM >= 0 ? 'rechts' : 'links'}`
    : null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      animation: 'gg-screen-in .22s var(--ease)',
    }}>
      <TopBar
        left={<RoundIconBtn icon="x" onClick={onCancel} />}
        title={title}
        sub={subText}
        right={end ? <RoundIconBtn icon="minus" onClick={reset} /> : null}
      />
      {/* Map + floating course-search overlay */}
      <div style={{
        flex: 1, position: 'relative', minHeight: 200,
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      }}>
        <div ref={mapContainer} style={{
          position: 'absolute', inset: 0, background: '#111',
        }} />
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          zIndex: 400,
        }}>
          <button onClick={searchNearbyCourses}
            disabled={courseSearch.status === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, border: 'none',
              cursor: courseSearch.status === 'loading' ? 'default' : 'pointer',
              padding: '8px 14px', borderRadius: 999,
              fontFamily: 'var(--font)', fontWeight: 700, fontSize: 13,
              background: 'var(--surface)', color: 'var(--ink)',
              boxShadow: 'var(--shadow-md)',
              opacity: courseSearch.status === 'loading' ? .7 : 1,
              WebkitTapHighlightColor: 'transparent', whiteSpace: 'nowrap',
            }}>
            <Icon name={courseSearch.status === 'loading' ? 'loader' : 'flag'}
              size={14} sw={2.4}
              style={{ color: 'var(--primary)' }} />
            {courseSearch.status === 'loading' ? 'Suche…' : 'Golfplätze in der Nähe'}
          </button>
        </div>
      </div>
      <div style={{
        padding: '10px 18px 30px',
        background: 'linear-gradient(to top, var(--bg) 62%, transparent)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Toolbar: Start / Target toggles + optional offset display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {start && (
            <button onClick={toggleStartMode} style={{
              display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
              padding: '9px 12px', borderRadius: 12, fontFamily: 'var(--font)',
              fontWeight: 700, fontSize: 13,
              background: tapMode === 'start' ? '#2ECC71' : 'var(--surface-2)',
              color: tapMode === 'start' ? '#04130A' : 'var(--ink-soft)',
              WebkitTapHighlightColor: 'transparent',
            }}>
              <Icon name="map-pin" size={14} sw={2.2} />
              {tapMode === 'start' ? 'Tippen…' : 'Start ändern'}
            </button>
          )}
          <button onClick={toggleTargetMode} style={{
            display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
            padding: '9px 12px', borderRadius: 12, fontFamily: 'var(--font)',
            fontWeight: 700, fontSize: 13,
            background: tapMode === 'target' ? '#4EC9F0' : (target ? 'rgba(78,201,240,.18)' : 'var(--surface-2)'),
            color: tapMode === 'target' ? '#0A2635' : (target ? '#4EC9F0' : 'var(--ink-soft)'),
            WebkitTapHighlightColor: 'transparent',
          }}>
            <Icon name="target" size={14} sw={2.2} />
            {tapMode === 'target' ? 'Tippen…' : (target ? 'Ziel gesetzt' : 'Ziel markieren')}
          </button>
          {target && tapMode !== 'target' && (
            <button onClick={clearTarget} aria-label="Ziel löschen" style={{
              width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'var(--surface-2)', color: 'var(--ink-faint)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}><Icon name="x" size={13} sw={2.4} /></button>
          )}
          {lateralLabel && (
            <div style={{
              marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: '#4EC9F0',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon name="target" size={13} sw={2.2} />
              {lateralLabel}
            </div>
          )}
        </div>
        <Btn size="lg" icon="check" onClick={confirm} disabled={!canConfirm}>
          {canConfirm ? `Bestätigen · ${Math.round(distanceM)} m` : 'Position wählen'}
        </Btn>
      </div>

      {/* Bottom sheet with nearby-course results */}
      {courseSheetOpen && (
        <div onClick={() => setCourseSheetOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end',
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
            <Label style={{ marginBottom: 12 }}>Golfplätze in der Nähe</Label>
            <div style={{ flex: 1, overflowY: 'auto', margin: '0 -18px', padding: '0 18px' }}>
              {courseSearch.status === 'loading' && (
                <div style={{ padding: 28, textAlign: 'center', color: 'var(--ink-faint)', fontWeight: 700, fontSize: 14 }}>
                  Suche läuft…
                </div>
              )}
              {courseSearch.status === 'error' && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--over)', fontWeight: 700, fontSize: 14 }}>
                  Fehler beim Suchen — versuch's nochmal
                </div>
              )}
              {courseSearch.status === 'done' && courseSearch.results.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-faint)', fontWeight: 700, fontSize: 14, lineHeight: 1.45 }}>
                  Keine Golfplätze in 30 km gefunden — pann die Karte in Richtung deines Platzes und versuch's nochmal.
                </div>
              )}
              {courseSearch.status === 'done' && courseSearch.results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {courseSearch.results.map(course => (
                    <button key={course.id} onClick={() => flyToCourse(course)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      textAlign: 'left', border: 'none', cursor: 'pointer',
                      background: 'var(--surface)', borderRadius: 14, padding: '10px 12px',
                      boxShadow: 'var(--shadow-sm)',
                      WebkitTapHighlightColor: 'transparent',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        background: 'var(--surface-2)', color: 'var(--primary)',
                        display: 'grid', placeItems: 'center',
                      }}><Icon name="flag" size={16} sw={2.2} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {course.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginTop: 2 }}>
                          {(course.distM / 1000).toFixed(1)} km vom Karten-Zentrum
                        </div>
                      </div>
                      <Icon name="right" size={14} sw={2.4} style={{ color: 'var(--ink-faint)' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ask the browser once for a GPS fix; resolves null on any failure/denial.
function getGeoPosOnce(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: timeoutMs, enableHighAccuracy: true }
    );
  });
}

Object.assign(window, { MapPickerModal, getGeoPosOnce });
