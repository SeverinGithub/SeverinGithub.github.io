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

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [themeId, setThemeId] = useTheme();
  const [view, setView] = useSt('setup');     // setup | play | summary | history | view
  const [round, setRound] = useSt(null);
  const [viewRound, setViewRound] = useSt(null);
  const [share, setShare] = useSt(null);
  const [history, setHistory] = useSt(() => loadHistory());

  useEf(() => {
    const live = loadLive();
    if (live && live.players) { setRound(live); setView('play'); }
    const splash = document.getElementById('gg-splash');
    if (splash) {
      setTimeout(() => { splash.style.opacity = '0'; }, 600);
      setTimeout(() => { splash.remove(); }, 1100);
    }
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
        <div data-theme={theme.id} style={{ height: '100%', width: '100%' }}>
          {screen}
          {share && <ShareSheet round={share} onClose={() => setShare(null)} />}
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
