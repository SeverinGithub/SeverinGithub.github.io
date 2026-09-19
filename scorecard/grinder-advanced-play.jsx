// grinder-advanced-play.jsx — persistent full-screen map view for the
// "Pro Schläge" mode. Shot chain + top-left club panel + bottom actions
// arrive in the following steps; for now this is just the map skeleton
// that replaces HoleView while in Advanced mode.
const { useRef: useRap, useEffect: useEap, useState: useSap } = React;

const ADV_ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function AdvancedHoleView({ round, h, setRound, clubs }) {
  const mapContainer = useRap(null);
  const mapRef = useRap(null);

  useEap(() => {
    if (!mapContainer.current || !window.L) return;

    // Try to find a sensible initial centre from the round's own shot history
    // (last known ball position), else fall back to a wide Germany view.
    const lastShotWithEnd = (round.shots || [])
      .slice().reverse().find(s => s && s.end);
    const initialCentre = lastShotWithEnd
      ? [lastShotWithEnd.end.lat, lastShotWithEnd.end.lng]
      : [51, 10];
    const initialZoom = lastShotWithEnd ? 16 : 5;

    const map = L.map(mapContainer.current, {
      center: initialCentre, zoom: initialZoom,
      zoomControl: false, attributionControl: false, maxZoom: 19,
    });
    L.tileLayer(ADV_ESRI_URL, { attribution: 'Tiles © Esri', maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    mapRef.current = map;
    // Container starts flex-sized; nudge Leaflet to (re)measure.
    setTimeout(() => map.invalidateSize(), 60);
    setTimeout(() => map.invalidateSize(), 400);

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 200 }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, background: '#111' }} />
      {/* Step 3: top-left panel (stroke + club selector) will overlay here. */}
      {/* Step 4: past-shot markers get drawn on the map instance. */}
      {/* Step 6: bottom actions will replace the plain nav footer. */}
    </div>
  );
}

window.AdvancedHoleView = AdvancedHoleView;
