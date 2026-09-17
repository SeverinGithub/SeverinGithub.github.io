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
  // Which position the next map-tap sets. Default 'end'; the target toggle
  // switches to 'target' for one tap, then auto-reverts. The ref mirrors the
  // state so the map's click closure always sees the current value.
  const [tapMode, setTapMode] = useSm('end');  // 'end' | 'target'
  const tapModeRef = useRm('end');
  useEm(() => { tapModeRef.current = tapMode; }, [tapMode]);

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
      if (tapModeRef.current === 'target') {
        setTarget(pos);
        tapModeRef.current = 'end';   // auto-revert after one tap
        setTapMode('end');
      } else {
        setEnd(pos);
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
  const clearTarget = () => { setTarget(null); setTapMode('end'); };

  const subText = !start
    ? 'Erst Startposition tippen'
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
      <div ref={mapContainer} style={{
        flex: 1, background: '#111', minHeight: 200,
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      }} />
      <div style={{
        padding: '10px 18px 30px',
        background: 'linear-gradient(to top, var(--bg) 62%, transparent)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Target toolbar: toggle + offset display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTargetMode} style={{
            display: 'flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer',
            padding: '9px 14px', borderRadius: 12, fontFamily: 'var(--font)',
            fontWeight: 700, fontSize: 13.5,
            background: tapMode === 'target' ? '#4EC9F0' : (target ? 'rgba(78,201,240,.18)' : 'var(--surface-2)'),
            color: tapMode === 'target' ? '#0A2635' : (target ? '#4EC9F0' : 'var(--ink-soft)'),
            WebkitTapHighlightColor: 'transparent',
          }}>
            <Icon name="target" size={15} sw={2.2} />
            {tapMode === 'target' ? 'Karte tippen…' : (target ? 'Ziel gesetzt' : 'Ziel markieren')}
          </button>
          {target && tapMode !== 'target' && (
            <button onClick={clearTarget} aria-label="Ziel löschen" style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'var(--surface-2)', color: 'var(--ink-faint)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}><Icon name="x" size={14} sw={2.4} /></button>
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
