// grinder-ui.jsx — shared UI primitives + icon set
const { useState, useRef, useEffect } = React;

// ── Icons (stroke, currentColor) ─────────────────────────────
function Icon({ name, size = 22, sw = 2, style }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    flag:    <><path d="M5 21V3" {...p}/><path d="M5 4h12l-2.5 3.5L17 11H5" {...p}/></>,
    plus:    <><path d="M12 5v14M5 12h14" {...p}/></>,
    minus:   <><path d="M5 12h14" {...p}/></>,
    left:    <><path d="M15 5l-7 7 7 7" {...p}/></>,
    right:   <><path d="M9 5l7 7-7 7" {...p}/></>,
    x:       <><path d="M6 6l12 12M18 6L6 18" {...p}/></>,
    check:   <><path d="M4 12l5 5L20 6" {...p}/></>,
    share:   <><path d="M12 16V4m0 0L8 8m4-4l4 4" {...p}/><path d="M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" {...p}/></>,
    trophy:  <><path d="M7 4h10v4a5 5 0 01-10 0V4z" {...p}/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M9 18h6M10 14v4M14 14v4" {...p}/></>,
    clock:   <><circle cx="12" cy="12" r="8" {...p}/><path d="M12 8v4l3 2" {...p}/></>,
    user:    <><circle cx="12" cy="8" r="4" {...p}/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" {...p}/></>,
    grid:    <><rect x="4" y="4" width="7" height="7" rx="1.5" {...p}/><rect x="13" y="4" width="7" height="7" rx="1.5" {...p}/><rect x="4" y="13" width="7" height="7" rx="1.5" {...p}/><rect x="13" y="13" width="7" height="7" rx="1.5" {...p}/></>,
    list:    <><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" {...p}/></>,
    cards:   <><rect x="3" y="6" width="14" height="14" rx="2" {...p}/><path d="M7 6V4a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2" {...p}/></>,
    settings:<><circle cx="12" cy="12" r="3" {...p}/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...p}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

// ── Button ───────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', size = 'md', icon, disabled, style }) {
  const sizes = {
    sm: { padding: '9px 14px', fontSize: 14, radius: 12 },
    md: { padding: '14px 18px', fontSize: 16, radius: 16 },
    lg: { padding: '18px 22px', fontSize: 18, radius: 18 },
  }[size];
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    border: 'none', cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font)', fontWeight: 700, letterSpacing: '.01em',
    padding: sizes.padding, fontSize: sizes.fontSize, borderRadius: sizes.radius,
    transition: 'transform .12s var(--ease), background .15s, opacity .15s',
    opacity: disabled ? .4 : 1, WebkitTapHighlightColor: 'transparent',
    width: '100%',
  };
  const variants = {
    primary: { background: 'var(--primary)', color: 'var(--on-primary)', boxShadow: 'var(--shadow-sm)' },
    accent:  { background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: 'var(--shadow-sm)' },
    ghost:   { background: 'var(--surface-2)', color: 'var(--ink)' },
    outline: { background: 'transparent', color: 'var(--ink)', boxShadow: 'inset 0 0 0 1.5px var(--line-strong)' },
    quiet:   { background: 'transparent', color: 'var(--ink-soft)' },
  }[variant];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onPointerDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(.97)'; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      style={{ ...base, ...variants, ...style }}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 18} />}
      {children}
    </button>
  );
}

// ── Segmented control ────────────────────────────────────────
function Seg({ options, value, onChange, style }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 4, background: 'var(--surface-2)', borderRadius: 16, padding: 4, ...style,
    }}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const label = typeof o === 'object' ? o.label : o;
        const active = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            border: 'none', cursor: 'pointer', borderRadius: 12, padding: '11px 6px',
            fontFamily: 'var(--font)', fontWeight: 700, fontSize: 15,
            background: active ? 'var(--surface)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-soft)',
            boxShadow: active ? 'var(--shadow-sm)' : 'none',
            transition: 'all .18s var(--ease)', WebkitTapHighlightColor: 'transparent',
          }}>{label}</button>
        );
      })}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────
function Card({ children, style, pad = 18 }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--r-lg)',
      padding: pad, boxShadow: 'var(--shadow-sm)', ...style,
    }}>{children}</div>
  );
}

// ── Big stepper — the core score input (big tap targets) ─────
function BigStepper({ value, onChange, min = 1, max = 15, accent, big = true }) {
  const tone = accent || 'var(--primary)';
  const btn = (dir, ic) => (
    <button
      onClick={() => onChange(Math.max(min, Math.min(max, (value ?? 0) + dir)))}
      onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(.9)'; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      style={{
        width: big ? 60 : 46, height: big ? 60 : 46, flexShrink: 0,
        borderRadius: '50%', border: '1.5px solid var(--line-strong)',
        background: 'var(--surface-2)', color: 'var(--ink)',
        display: 'grid', placeItems: 'center', cursor: 'pointer',
        transition: 'transform .1s var(--ease)', WebkitTapHighlightColor: 'transparent',
      }}>
      <Icon name={ic} size={big ? 26 : 20} sw={2.6} />
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: big ? 14 : 10 }}>
      {btn(-1, 'minus')}
      <div className="tnum expanded" style={{
        minWidth: big ? 64 : 44, textAlign: 'center',
        fontWeight: 800, fontSize: big ? 52 : 30, lineHeight: 1,
        color: value == null ? 'var(--ink-faint)' : tone,
      }}>{value == null ? '–' : value}</div>
      {btn(1, 'plus')}
    </div>
  );
}

// ── Score pill (under/par/over) ──────────────────────────────
function ScorePill({ strokes, par, style }) {
  const tone = scoreTone(strokes, par);
  if (tone === 'none') return null;
  const map = {
    under: { bg: 'color-mix(in srgb, var(--under) 16%, transparent)', fg: 'var(--under)' },
    par:   { bg: 'var(--surface-2)', fg: 'var(--ink-soft)' },
    over:  { bg: 'color-mix(in srgb, var(--over) 15%, transparent)', fg: 'var(--over)' },
  }[tone];
  return (
    <span style={{
      fontSize: 12.5, fontWeight: 800, letterSpacing: '.02em',
      padding: '4px 9px', borderRadius: 8, background: map.bg, color: map.fg,
      whiteSpace: 'nowrap', ...style,
    }}>{scoreName(strokes, par)}</span>
  );
}

// ── Section label ────────────────────────────────────────────
function Label({ children, style }) {
  return (
    <div style={{
      fontSize: 12.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
      color: 'var(--ink-faint)', ...style,
    }}>{children}</div>
  );
}

// avatar with initials
function Avatar({ name, i = 0, size = 34 }) {
  const palette = ['var(--primary)', 'var(--over)', '#3E7CB1', '#9B6FB0', '#C99A2E', '#3FA796', '#D26A8A', '#5E8C4B'];
  const c = palette[i % palette.length];
  const init = (name || '?').trim().slice(0, 1).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `color-mix(in srgb, ${c} 20%, transparent)`, color: c,
      display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size * .42,
    }}>{init}</div>
  );
}

Object.assign(window, { Icon, Btn, Seg, Card, BigStepper, ScorePill, Label, Avatar });
