// grinder-advanced-play.jsx — persistent full-screen map view for the
// "Pro Schläge" mode. Shot chain + top-left club panel + bottom actions
// arrive across the redesign steps; the map itself stays mounted the whole
// round so nothing flashes between shots.
const { useRef: useRap, useEffect: useEap, useState: useSap, useMemo: useMap } = React;

const ADV_ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Numbered pin — same visual language as the MapPickerModal markers but
// with a small label inside so the eye can walk the shot chain.
function makeAdvPin(color, label) {
  const html = `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:grid;place-items:center;color:#0A130A;font-weight:900;font-size:12px;font-family:Archivo,system-ui,sans-serif;line-height:1;">${label}</div>`;
  return L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });
}

// Compact scorecard-style shortnames — matches the "9i", "3W", "PW" look
// from the design references. Falls back to the first 2 chars of the name.
function clubShortName(club) {
  if (!club) return '–';
  const c = club.category;
  const n = (club.name || '').trim();
  if (c === 'driver') return 'DR';
  if (c === 'putter') return 'PT';
  const digitMatch = n.match(/(\d+)/);
  const digit = digitMatch ? digitMatch[1] : '';
  if (c === 'wood')   return digit ? `${digit}W` : 'W';
  if (c === 'hybrid') return digit ? `${digit}H` : 'H';
  if (c === 'iron')   return digit ? `${digit}i` : 'i';
  if (c === 'wedge')  return n.replace(/\s+/g, '').slice(0, 3).toUpperCase() || 'WD';
  return n.slice(0, 3).toUpperCase();
}

// ── Top-left overlay: current stroke + club selector ────────
function ShotPanel({ strokeNumber, selectedClub, avgDistanceM, bag, recommendedClubId, onSelectClub }) {
  const [open, setOpen] = useSap(false);
  const cols = bag && bag.length ? Math.ceil(bag.length / 2) : 0;
  return (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 400,
      background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
      color: 'var(--ink)', borderRadius: 16, padding: '10px 12px 12px',
      boxShadow: 'var(--shadow-md)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      fontFamily: 'var(--font)', minWidth: 168, maxWidth: 260,
    }}>
      <div style={{
        fontSize: 11, letterSpacing: '.14em', fontWeight: 800,
        color: 'var(--ink-faint)', textTransform: 'uppercase',
      }}>stroke</div>
      <div className="expanded tnum" style={{
        fontWeight: 900, fontSize: 44, lineHeight: .95, letterSpacing: '-.02em',
        marginTop: 2,
      }}>{strokeNumber}</div>

      <div style={{ height: 1, background: 'var(--line)', margin: '10px -4px 8px' }} />

      <div style={{
        fontSize: 11, letterSpacing: '.14em', fontWeight: 800,
        color: 'var(--ink-faint)', textTransform: 'uppercase',
      }}>club</div>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        marginTop: 4, padding: '4px 4px 4px 8px', borderRadius: 10,
        background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
        border: '1.5px solid var(--primary)', cursor: 'pointer',
        color: 'var(--ink)', fontFamily: 'var(--font)',
        WebkitTapHighlightColor: 'transparent',
      }}>
        <span className="expanded" style={{
          fontWeight: 900, fontSize: 24, letterSpacing: '-.02em', lineHeight: 1,
        }}>{clubShortName(selectedClub)}</span>
        <span style={{ color: 'var(--ink-faint)', fontWeight: 800 }}>/</span>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left', minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: 'var(--ink-faint)', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>AvrDis.</div>
          <div className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>
            {avgDistanceM != null ? `${Math.round(avgDistanceM)} m` : '–'}
          </div>
        </div>
        <Icon name={open ? 'up' : 'down'} size={14} sw={2.4}
          style={{ color: 'var(--ink-soft)', flexShrink: 0 }} />
      </button>

      {open && bag && bag.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--line)', margin: '10px -4px 10px' }} />
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
          }}>
            {bag.map(c => {
              const isSelected = c.id === selectedClub?.id;
              const isRec = c.id === recommendedClubId;
              return (
                <button key={c.id} onClick={() => { onSelectClub(c.id); setOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px',
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  background: isRec ? 'var(--primary)' : (isSelected ? 'color-mix(in srgb, var(--ink) 12%, transparent)' : 'transparent'),
                  color: isRec ? 'var(--on-primary)' : 'var(--ink)',
                  border: (isSelected && !isRec) ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                  fontFamily: 'var(--font)', fontWeight: 900,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  <span className="expanded" style={{ fontSize: 18, letterSpacing: '-.02em', lineHeight: 1 }}>
                    {clubShortName(c)}
                  </span>
                  {isRec && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: '.03em',
                      marginLeft: 'auto', opacity: .9,
                    }}>Recommended</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function AdvancedHoleView({ round, h, setRound, clubs }) {
  const mapContainer = useRap(null);
  const mapRef = useRap(null);
  const shotLayerRef = useRap(null);   // layer group holding all past-shot markers for this hole

  const bag = useMap(() => activeClubs(clubs), [clubs]);
  const shotsHere = useMap(() => shotsFor(round, round.trackedPlayerId, h + 1), [round, h]);

  const [selectedClubId, setSelectedClubId] = useSap(() => bag[0]?.id || null);
  const selectedClub = useMap(
    () => bag.find(c => c.id === selectedClubId) || null,
    [bag, selectedClubId]
  );
  const strokeNumber = shotsHere.length + 1;

  // Bayesian-blended distance for the currently selected club, using this
  // round's own shots plus all persisted history (kept alongside so we don't
  // ignore data from earlier rounds).
  const avgDistanceM = useMap(() => {
    if (!selectedClub) return null;
    const stats = clubStats(selectedClub, [round]);
    return stats.distanceM;
  }, [selectedClub, round]);

  useEap(() => {
    if (!mapContainer.current || !window.L) return;

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
    shotLayerRef.current = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 60);
    setTimeout(() => map.invalidateSize(), 400);

    return () => {
      map.remove();
      mapRef.current = null;
      shotLayerRef.current = null;
    };
  }, []);

  // Redraw the shot chain whenever this hole's shots change (or on hole switch).
  useEap(() => {
    const map = mapRef.current;
    const layer = shotLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (shotsHere.length === 0) return;

    const positions = [];  // for the connecting dashed line

    // Tee marker: first shot's start (green).
    const first = shotsHere[0];
    if (first.start) {
      positions.push([first.start.lat, first.start.lng]);
      L.marker([first.start.lat, first.start.lng], {
        icon: makeAdvPin('#2ECC71', 'T'), interactive: false,
      }).addTo(layer);
    }

    // End marker per shot (yellow accent, numbered).
    shotsHere.forEach((s, i) => {
      if (!s.end) return;
      positions.push([s.end.lat, s.end.lng]);
      L.marker([s.end.lat, s.end.lng], {
        icon: makeAdvPin('#DCEB4E', String(i + 1)), interactive: false,
      }).addTo(layer);
    });

    if (positions.length >= 2) {
      L.polyline(positions, {
        color: '#fff', weight: 2, dashArray: '6, 6', opacity: .9,
      }).addTo(layer);
    }
  }, [shotsHere]);

  // Tap-to-commit: every click on the map records the next shot for this hole
  // using the currently selected club. Start position is chained from the
  // previous shot's end (within the hole or across holes), else GPS, else the
  // map centre as a last resort.
  useEap(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = async (e) => {
      if (!selectedClub) return;
      const endPos = { lat: e.latlng.lat, lng: e.latlng.lng };

      let startPos = null;
      if (shotsHere.length > 0 && shotsHere[shotsHere.length - 1].end) {
        startPos = shotsHere[shotsHere.length - 1].end;
      }
      if (!startPos) {
        // Look back through previous holes for the last known end.
        const all = (round.shots || []).filter(s => s.playerId === round.trackedPlayerId);
        for (let i = all.length - 1; i >= 0; i--) {
          if (all[i].hole < (h + 1) && all[i].end) { startPos = all[i].end; break; }
        }
      }
      if (!startPos) {
        const gps = await getGeoPosOnce();
        if (gps) startPos = gps;
      }
      if (!startPos) {
        const c = map.getCenter();
        startPos = { lat: c.lat, lng: c.lng };
      }

      const distanceM = Math.round(haversineM(startPos.lat, startPos.lng, endPos.lat, endPos.lng));
      const lie = shotsHere.length === 0 ? 'tee' : 'fairway';

      setRound(r => {
        const next = { ...r, shots: (r.shots || []).slice() };
        addShot(next, {
          playerId: r.trackedPlayerId,
          hole: h + 1,
          clubId: selectedClub.id,
          lie, start: startPos, end: endPos, distanceM,
        });
        syncScoreFromShots(next, r.trackedPlayerId, h + 1);
        return next;
      });
    };

    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [selectedClub, shotsHere, h, round.shots, round.trackedPlayerId, setRound]);

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 200 }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, background: '#111' }} />
      <ShotPanel
        strokeNumber={strokeNumber}
        selectedClub={selectedClub}
        avgDistanceM={avgDistanceM}
        bag={bag}
        recommendedClubId={null /* step 6: derive from distance-to-target */}
        onSelectClub={setSelectedClubId}
      />
      {/* Step 4: past-shot markers get drawn on the map instance. */}
      {/* Step 6: bottom actions will replace the plain nav footer. */}
    </div>
  );
}

window.AdvancedHoleView = AdvancedHoleView;
window.clubShortName = clubShortName;
