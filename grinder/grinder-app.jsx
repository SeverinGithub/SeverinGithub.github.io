// grinder-app.jsx — top-level app: routing, theme store, mounting
const { useState: useSt, useEffect: useEf } = React;

const THEMES = [
  { id: 'fairway',  name: 'Fairway',  dark: false },
  { id: 'midnight', name: 'Midnight', dark: true },
  { id: 'links',    name: 'Links',    dark: true },
];

// shared theme store across both React roots (phone + variant bar)
const themeStore = (() => {
  let value = 'links';
  try { value = localStorage.getItem('gg_theme') || 'links'; } catch (e) {}
  const subs = new Set();
  return {
    get: () => value,
    set: (v) => { value = v; try { localStorage.setItem('gg_theme', v); } catch (e) {} subs.forEach(f => f(v)); },
    sub: (f) => { subs.add(f); return () => subs.delete(f); },
  };
})();
function useTheme() {
  const [v, setV] = useSt(themeStore.get());
  useEf(() => themeStore.sub(setV), []);
  return [v, themeStore.set];
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "maxPlayers": 8
}/*EDITMODE-END*/;

function SplashScreen({ onDone }) {
  const [fading, setFading] = useSt(false);
  useEf(() => {
    const t1 = setTimeout(() => setFading(true), 1400);
    const t2 = setTimeout(() => onDone(), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 999,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 20,
      opacity: fading ? 0 : 1,
      transition: 'opacity .45s cubic-bezier(.22,1,.36,1)',
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect width="72" height="72" rx="18" fill="var(--primary)" opacity=".12" />
        <line x1="33" y1="16" x2="33" y2="58" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M33 17 L54 26 L33 35Z" fill="var(--primary)"/>
        <ellipse cx="33" cy="58" rx="9" ry="3.5" fill="var(--ink-faint)" opacity=".5"/>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font)', fontWeight: 900, fontSize: 34,
          fontStretch: '125%', letterSpacing: '-.02em', color: 'var(--ink)',
        }}>Grinder</div>
        <div style={{
          fontFamily: 'var(--font)', fontWeight: 600, fontSize: 12,
          color: 'var(--ink-soft)', marginTop: 5,
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>Golf Scorecard</div>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [themeId, setThemeId] = useTheme();
  const [showSplash, setShowSplash] = useSt(true);
  const [view, setView] = useSt('setup');     // setup | play | summary | history | view
  const [round, setRound] = useSt(null);
  const [viewRound, setViewRound] = useSt(null);
  const [share, setShare] = useSt(null);
  const [history, setHistory] = useSt(() => loadHistory());

  useEf(() => {
    const live = loadLive();
    if (live && live.players) { setRound(live); setView('play'); }
  }, []);

  const updateRound = (updater) => setRound(prev => {
    const next = typeof updater === 'function' ? updater(prev) : updater;
    saveLive(next); return next;
  });

  const theme = THEMES.find(x => x.id === themeId) || THEMES[0];

  const start = (r) => { saveLive(r); setRound(r); setView('play'); };
  const exitPlay = () => { if (confirm('Runde verwerfen?')) { saveLive(null); setRound(null); setView('setup'); } };
  const finish = () => setView('summary');
  const saveClose = () => {
    const done = { ...round, status: 'done', finishedAt: Date.now() };
    pushHistory(done); setHistory(loadHistory());
    saveLive(null); setRound(null); setView('setup');
  };
  const discard = () => { saveLive(null); setRound(null); setView('setup'); };
  const openHistory = () => setView('history');
  const openRound = (r) => { setViewRound(r); setView('view'); };
  const clearHistory = () => { if (confirm('Verlauf löschen?')) { saveHistory([]); setHistory([]); } };

  let screen;
  if (view === 'play' && round)
    screen = <PlayScreen round={round} setRound={updateRound} onFinish={finish} onExit={exitPlay} />;
  else if (view === 'summary' && round)
    screen = <SummaryScreen round={round} onShare={() => setShare(round)} onSaveClose={saveClose} onAgain={discard} />;
  else if (view === 'history')
    screen = <HistoryScreen history={history} onBack={() => setView('setup')} onOpen={openRound} onClear={clearHistory} />;
  else if (view === 'view' && viewRound)
    screen = <SummaryScreen round={viewRound} readOnly onShare={() => setShare(viewRound)} onSaveClose={() => setView('history')} />;
  else
    screen = <SetupScreen onStart={start} onHistory={openHistory} hasHistory={history.length > 0} maxPlayers={t.maxPlayers} />;

  return (
    <>
      <IOSDevice dark={theme.dark}>
        <div data-theme={theme.id} style={{ height: '100%', width: '100%', position: 'relative' }}>
          {screen}
          {share && <ShareSheet round={share} onClose={() => setShare(null)} />}
          {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        </div>
      </IOSDevice>

      <TweaksPanel>
        <TweakSection label="Variante" />
        <TweakRadio label="Theme" value={themeId}
          options={THEMES.map(x => ({ value: x.id, label: x.name }))}
          onChange={setThemeId} />
        <TweakSection label="Spiel" />
        <TweakSlider label="Max. Spieler" value={t.maxPlayers} min={2} max={8}
          onChange={(v) => setTweak('maxPlayers', v)} />
      </TweaksPanel>
    </>
  );
}

function VariantBar() {
  const [themeId, setThemeId] = useTheme();
  return (
    <>
      <span className="vlabel">Variante</span>
      {THEMES.map(x => (
        <button key={x.id} className={x.id === themeId ? 'on' : ''} onClick={() => setThemeId(x.id)}>{x.name}</button>
      ))}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
ReactDOM.createRoot(document.getElementById('variant-bar')).render(<VariantBar />);

// responsive scaling of the phone
function fit() {
  const scaler = document.getElementById('phone-scaler');
  const stage = document.getElementById('stage');
  if (!scaler || !stage) return;
  const pad = 24;
  const s = Math.min(1, (stage.clientHeight - pad) / 874, (stage.clientWidth - pad) / 402);
  scaler.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit);
setTimeout(fit, 60); setTimeout(fit, 400);
