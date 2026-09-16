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

function MapPickerModal({ startPos, initialEnd, onPick, onCancel, title = 'Ballposition' }) {
  const mapContainer = useRm(null);
  const mapRef = useRm(null);
  const startMarkerRef = useRm(null);
  const endMarkerRef = useRm(null);
  const lineRef = useRm(null);

  // If we don't have a startPos, first tap sets it; second tap sets end.
  const [start, setStart] = useSm(startPos || null);
  const [end, setEnd] = useSm(initialEnd || null);

  const distanceM = (start && end)
    ? haversineM(start.lat, start.lng, end.lat, end.lng)
    : null;

  // Draw / update markers + line whenever start or end changes.
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

    // dashed connecting line
    if (start && end) {
      const path = [[start.lat, start.lng], [end.lat, end.lng]];
      if (lineRef.current) lineRef.current.setLatLngs(path);
      else lineRef.current = L.polyline(path, { color: '#fff', weight: 2, dashArray: '6, 6', opacity: .9 }).addTo(map);
    } else if (lineRef.current) {
      map.removeLayer(lineRef.current); lineRef.current = null;
    }
  }, [start, end]);

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

    map.on('click', (e) => {
      const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
      // Read `start` from closure — captures the value at this render.
      // On first click after mount, if start is null, treat click as "set start".
      // But because closure captures stale state, we always fall through to setEnd.
      // We fix that by using functional updater on end + reading startMarkerRef.
      if (!startMarkerRef.current && !startPos) setStart(pos);
      else setEnd(pos);
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
    onPick({ start, end, distanceM: Math.round(distanceM) });
  };

  const reset = () => { setEnd(null); if (!startPos) setStart(null); };

  const subText = !start
    ? 'Erst Startposition tippen'
    : !end
      ? 'Jetzt Ballposition tippen'
      : `${Math.round(distanceM)} m`;

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
        padding: '14px 18px 30px',
        background: 'linear-gradient(to top, var(--bg) 62%, transparent)',
      }}>
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
