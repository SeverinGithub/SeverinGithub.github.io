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

// Cyan crosshair for the ephemeral target (matches MapPickerModal's design
// language so the two views feel like one system).
function makeAdvTargetPin() {
  const html = `<div style="width:26px;height:26px;border-radius:50%;background:rgba(78,201,240,.22);border:3px solid #4EC9F0;box-shadow:0 2px 6px rgba(0,0,0,.4);display:grid;place-items:center;box-sizing:border-box;"><div style="width:6px;height:6px;border-radius:50%;background:#fff;"></div></div>`;
  return L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });
}

// Small hollow ring for a not-yet-committed manual start override.
function makeManualStartPin() {
  const html = `<div style="width:22px;height:22px;border-radius:50%;background:transparent;border:3px dashed #2ECC71;box-shadow:0 2px 6px rgba(0,0,0,.4);box-sizing:border-box;"></div>`;
  return L.divIcon({ html, className: '', iconSize: [22, 22], iconAnchor: [11, 11] });
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
function ShotPanel({ hole, strokeNumber, selectedClub, avgDistanceM, bag, recommendedClubId, onSelectClub }) {
  const [open, setOpen] = useSap(false);
  const cols = bag && bag.length ? Math.ceil(bag.length / 2) : 0;
  const labelStyle = {
    fontSize: 11, letterSpacing: '.14em', fontWeight: 800,
    color: 'var(--ink-faint)', textTransform: 'uppercase',
  };
  const numberStyle = {
    fontWeight: 900, fontSize: 44, lineHeight: .95, letterSpacing: '-.02em',
    marginTop: 2,
  };
  return (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 400,
      background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
      color: 'var(--ink)', borderRadius: 16, padding: '10px 12px 12px',
      boxShadow: 'var(--shadow-md)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      fontFamily: 'var(--font)', minWidth: 168, maxWidth: 260,
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
        <div>
          <div style={labelStyle}>hole</div>
          <div className="expanded tnum" style={numberStyle}>H{hole}</div>
        </div>
        <div style={{
          width: 1, alignSelf: 'stretch', background: 'var(--line)', margin: '2px 0',
        }} />
        <div>
          <div style={labelStyle}>stroke</div>
          <div className="expanded tnum" style={numberStyle}>{strokeNumber}</div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--line)', margin: '10px -4px 8px' }} />

      <div style={labelStyle}>club</div>
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
  const shotLayerRef = useRap(null);       // past-shot chain markers for this hole
  const ephemeralLayerRef = useRap(null);  // target crosshair + aim line + manual-start preview

  const bag = useMap(() => activeClubs(clubs), [clubs]);
  const shotsHere = useMap(() => shotsFor(round, round.trackedPlayerId, h + 1), [round, h]);

  const [selectedClubId, setSelectedClubId] = useSap(() => bag[0]?.id || null);
  const selectedClub = useMap(
    () => bag.find(c => c.id === selectedClubId) || null,
    [bag, selectedClubId]
  );
  const strokeNumber = shotsHere.length + 1;

  // Ephemeral, per-shot planning state — cleared whenever a shot commits.
  const [tapMode, setTapMode] = useSap('commit');   // 'commit' | 'start' | 'target'
  const [target, setTarget] = useSap(null);         // {lat, lng} or null
  const [manualStart, setManualStart] = useSap(null);
  // Implicit tee position for the current hole — GPS at hole-start when no
  // shot has been committed yet. Used to keep a T marker visible and to zoom
  // the map onto the tee on hole-open.
  const [gpsTee, setGpsTee] = useSap(null);

  // Effective tee = the first committed shot's start (if any), else the GPS
  // pin we grabbed on hole-open. Drives both the T marker and initial zoom.
  const effectiveTee = useMap(() => {
    if (shotsHere.length > 0 && shotsHere[0].start) return shotsHere[0].start;
    return gpsTee;
  }, [shotsHere, gpsTee]);

  // Bayesian-blended distance for the currently selected club, using this
  // round's own shots plus all persisted history (kept alongside so we don't
  // ignore data from earlier rounds).
  const avgDistanceM = useMap(() => {
    if (!selectedClub) return null;
    const stats = clubStats(selectedClub, [round]);
    return stats.distanceM;
  }, [selectedClub, round]);

  // The start position the next tap-commit will use — same derivation the
  // click handler uses, exposed as memo so the panel + recommendation can
  // reason about it.
  const derivedNextStart = useMap(() => {
    if (manualStart) return manualStart;
    if (shotsHere.length > 0 && shotsHere[shotsHere.length - 1].end)
      return shotsHere[shotsHere.length - 1].end;
    if (gpsTee) return gpsTee;   // implicit tee from hole-open GPS
    // Look back through previous holes for the last known end.
    const all = (round.shots || []).filter(s => s.playerId === round.trackedPlayerId);
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].hole < (h + 1) && all[i].end) return all[i].end;
    }
    return null;
  }, [manualStart, shotsHere, gpsTee, h, round.shots, round.trackedPlayerId]);

  // Recommendation: closest-avg-distance club to the intended shot distance
  // (start → target). Only shows a highlight when the user has set a target.
  const recommendedClubId = useMap(() => {
    if (!target || !derivedNextStart) return null;
    const dist = haversineM(derivedNextStart.lat, derivedNextStart.lng, target.lat, target.lng);
    let bestId = null, bestDelta = Infinity;
    for (const c of bag) {
      if (c.category === 'putter') continue;
      const s = clubStats(c, [round]);
      if (s.distanceM == null) continue;
      const delta = Math.abs(s.distanceM - dist);
      if (delta < bestDelta) { bestDelta = delta; bestId = c.id; }
    }
    return bestId;
  }, [target, derivedNextStart, bag, round]);

  useEap(() => {
    if (!mapContainer.current || !window.L) return;

    // Priority for initial centre: current hole's tee (from first shot),
    // else the last known ball anywhere in the round, else Germany-wide.
    const firstShotOfHole = shotsHere[0];
    const teeFromShot = firstShotOfHole && firstShotOfHole.start
      ? firstShotOfHole.start : null;
    const lastShotWithEnd = (round.shots || [])
      .slice().reverse().find(s => s && s.end);
    const initialCentre = teeFromShot
      ? [teeFromShot.lat, teeFromShot.lng]
      : (lastShotWithEnd ? [lastShotWithEnd.end.lat, lastShotWithEnd.end.lng] : [51, 10]);
    const initialZoom = teeFromShot ? 19 : (lastShotWithEnd ? 16 : 5);

    const map = L.map(mapContainer.current, {
      center: initialCentre, zoom: initialZoom,
      zoomControl: false, attributionControl: false, maxZoom: 19,
    });
    L.tileLayer(ADV_ESRI_URL, { attribution: 'Tiles © Esri', maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    mapRef.current = map;
    shotLayerRef.current = L.layerGroup().addTo(map);
    ephemeralLayerRef.current = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 60);
    setTimeout(() => map.invalidateSize(), 400);

    return () => {
      map.remove();
      mapRef.current = null;
      shotLayerRef.current = null;
      ephemeralLayerRef.current = null;
    };
  }, []);

  // Ask the browser for a GPS fix when we enter a hole that has no shots yet
  // (mount OR hole switch). This gives us an implicit tee position for the
  // T marker + initial zoom without needing the user to tap first.
  useEap(() => {
    if (shotsHere.length > 0) { setGpsTee(null); return; }
    let cancelled = false;
    (async () => {
      const gps = await getGeoPosOnce();
      if (!cancelled && gps) setGpsTee(gps);
    })();
    return () => { cancelled = true; };
  }, [h, shotsHere.length]);

  // If we didn't know the tee at map-init time and one materialises later
  // (GPS resolves, or the user commits their first shot), fly the map there.
  useEap(() => {
    const map = mapRef.current;
    if (!map || !effectiveTee) return;
    // Only steal focus if the user hasn't clearly panned away — i.e. the map
    // is still at a wide/global zoom level.
    if (map.getZoom() < 15) {
      map.setView([effectiveTee.lat, effectiveTee.lng], 19, { animate: true });
    }
  }, [effectiveTee]);

  // Draw the ephemeral overlay: target crosshair (+ aim line from
  // derivedNextStart to target) and the manual-start override preview.
  useEap(() => {
    const layer = ephemeralLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (target) {
      L.marker([target.lat, target.lng], {
        icon: makeAdvTargetPin(), interactive: false,
      }).addTo(layer);
      if (derivedNextStart) {
        L.polyline(
          [[derivedNextStart.lat, derivedNextStart.lng], [target.lat, target.lng]],
          { color: '#4EC9F0', weight: 1.5, dashArray: '3, 5', opacity: .85 },
        ).addTo(layer);
      }
    }
    if (manualStart) {
      L.marker([manualStart.lat, manualStart.lng], {
        icon: makeManualStartPin(), interactive: false,
      }).addTo(layer);
    }
  }, [target, manualStart, derivedNextStart]);

  // Redraw the tee + shot chain whenever the tee, this hole's shots, or the
  // hole itself change. The T marker persists even before the first shot so
  // the user can see where the current hole starts from.
  useEap(() => {
    const map = mapRef.current;
    const layer = shotLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const positions = [];  // for the connecting dashed line

    // Tee marker (green): always shown when we know the tee.
    if (effectiveTee) {
      positions.push([effectiveTee.lat, effectiveTee.lng]);
      L.marker([effectiveTee.lat, effectiveTee.lng], {
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
  }, [effectiveTee, shotsHere]);

  // Tap-to-commit + mode branching. Depending on tapMode, the next tap sets
  // either the ephemeral target, the ephemeral manual start, or commits a shot.
  // Committing consumes any ephemeral state and hands the tap-mode back to 'commit'.
  useEap(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = async (e) => {
      const pos = { lat: e.latlng.lat, lng: e.latlng.lng };

      if (tapMode === 'target') {
        setTarget(pos);
        setTapMode('commit');
        return;
      }
      if (tapMode === 'start') {
        setManualStart(pos);
        setTapMode('commit');
        return;
      }
      // Commit path.
      if (!selectedClub) return;

      let startPos = derivedNextStart;
      if (!startPos) {
        const gps = await getGeoPosOnce();
        if (gps) startPos = gps;
      }
      if (!startPos) {
        const c = map.getCenter();
        startPos = { lat: c.lat, lng: c.lng };
      }

      const distanceM = Math.round(haversineM(startPos.lat, startPos.lng, pos.lat, pos.lng));
      const lie = shotsHere.length === 0 ? 'tee' : 'fairway';
      const shotLateralOffsetM = target
        ? Math.round(lateralOffsetM(startPos, target, pos))
        : null;

      setRound(r => {
        const next = { ...r, shots: (r.shots || []).slice() };
        addShot(next, {
          playerId: r.trackedPlayerId,
          hole: h + 1,
          clubId: selectedClub.id,
          lie, start: startPos, end: pos, distanceM,
          target: target || null, lateralOffsetM: shotLateralOffsetM,
        });
        syncScoreFromShots(next, r.trackedPlayerId, h + 1);
        return next;
      });
      // Ephemeral state is one-shot: consumed by this commit.
      setTarget(null);
      setManualStart(null);
    };

    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [selectedClub, shotsHere, h, round.shots, round.trackedPlayerId, setRound,
      tapMode, target, derivedNextStart]);

  const undoLast = () => {
    if (shotsHere.length === 0) return;
    const lastId = shotsHere[shotsHere.length - 1].id;
    setRound(r => {
      const next = { ...r, shots: (r.shots || []).slice() };
      removeShot(next, lastId);
      syncScoreFromShots(next, r.trackedPlayerId, h + 1);
      return next;
    });
  };

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 200 }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, background: '#111' }} />
      <ShotPanel
        hole={h + 1}
        strokeNumber={strokeNumber}
        selectedClub={selectedClub}
        avgDistanceM={avgDistanceM}
        bag={bag}
        recommendedClubId={recommendedClubId}
        onSelectClub={setSelectedClubId}
      />
      <AdvancedActionBar
        tapMode={tapMode}
        hasStart={!!manualStart}
        hasTarget={!!target}
        canUndo={shotsHere.length > 0}
        onToggleStart={() => setTapMode(m => m === 'start' ? 'commit' : 'start')}
        onToggleTarget={() => setTapMode(m => m === 'target' ? 'commit' : 'target')}
        onClearStart={() => setManualStart(null)}
        onClearTarget={() => setTarget(null)}
        onUndo={undoLast}
      />
    </div>
  );
}

// ── Bottom action bar: Start ändern / Ziel / Rückgängig ─────
function AdvancedActionBar({
  tapMode, hasStart, hasTarget, canUndo,
  onToggleStart, onToggleTarget, onClearStart, onClearTarget, onUndo,
}) {
  const pill = (opts) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 12px', borderRadius: 12,
    fontFamily: 'var(--font)', fontWeight: 700, fontSize: 13,
    border: 'none', cursor: opts.disabled ? 'default' : 'pointer',
    background: opts.bg, color: opts.color,
    opacity: opts.disabled ? .35 : 1,
    boxShadow: 'var(--shadow-sm)',
    WebkitTapHighlightColor: 'transparent',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      position: 'absolute', bottom: 12, left: 12, right: 12,
      zIndex: 400, display: 'flex', gap: 8, justifyContent: 'center',
      pointerEvents: 'none',   // let map clicks fall through the gaps
    }}>
      <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
        <button onClick={onToggleStart} style={pill({
          bg: tapMode === 'start' ? '#2ECC71' : (hasStart ? 'color-mix(in srgb, #2ECC71 22%, var(--surface))' : 'var(--surface)'),
          color: tapMode === 'start' ? '#04130A' : (hasStart ? '#2ECC71' : 'var(--ink-soft)'),
        })}>
          <Icon name="map-pin" size={14} sw={2.2} />
          {tapMode === 'start' ? 'Tippen…' : (hasStart ? 'Start ok' : 'Start ändern')}
          {hasStart && tapMode !== 'start' && (
            <span onClick={(e) => { e.stopPropagation(); onClearStart(); }} style={{
              marginLeft: 4, width: 18, height: 18, borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              background: 'color-mix(in srgb, #2ECC71 25%, transparent)',
            }}><Icon name="x" size={11} sw={2.4} /></span>
          )}
        </button>

        <button onClick={onToggleTarget} style={pill({
          bg: tapMode === 'target' ? '#4EC9F0' : (hasTarget ? 'color-mix(in srgb, #4EC9F0 22%, var(--surface))' : 'var(--surface)'),
          color: tapMode === 'target' ? '#0A2635' : (hasTarget ? '#4EC9F0' : 'var(--ink-soft)'),
        })}>
          <Icon name="target" size={14} sw={2.2} />
          {tapMode === 'target' ? 'Tippen…' : (hasTarget ? 'Ziel ok' : 'Ziel markieren')}
          {hasTarget && tapMode !== 'target' && (
            <span onClick={(e) => { e.stopPropagation(); onClearTarget(); }} style={{
              marginLeft: 4, width: 18, height: 18, borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              background: 'color-mix(in srgb, #4EC9F0 25%, transparent)',
            }}><Icon name="x" size={11} sw={2.4} /></span>
          )}
        </button>

        <button onClick={canUndo ? onUndo : undefined} disabled={!canUndo} style={pill({
          bg: 'var(--surface)', color: 'var(--ink-soft)', disabled: !canUndo,
        })}>
          <Icon name="left" size={14} sw={2.4} />
          Rückgängig
        </button>
      </div>
    </div>
  );
}

window.AdvancedHoleView = AdvancedHoleView;
window.clubShortName = clubShortName;
