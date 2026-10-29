// Rufus: teenage fox in hoodie, cap and sneakers. Original drawing, one SVG with moods.
export type Mood = 'neutral' | 'motivated' | 'think' | 'read' | 'happy' | 'celebrate' | 'sad' | 'sleep'

export function Mascot({ mood = 'neutral', size = 120, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const eyesClosed = mood === 'sleep' || mood === 'happy' || mood === 'celebrate'
  const armsUp = mood === 'celebrate' || mood === 'motivated'
  return (
    <svg className={`mascot mascot-${mood} ${className}`} width={size} height={size * 1.15} viewBox="0 0 120 138" role="img" aria-label="Fuchs-Maskottchen">
      {/* tail */}
      <path d="M86 108 C 112 104, 118 78, 106 64 C 104 82, 96 94, 82 98 Z" fill="#ff7a1a" />
      <path d="M106 64 C 112 72, 112 80, 108 86 C 104 80, 103 72, 106 64 Z" fill="#fff" />
      {/* legs + sneakers */}
      <rect x="44" y="108" width="11" height="18" rx="4" fill="#2d3a5a" />
      <rect x="65" y="108" width="11" height="18" rx="4" fill="#2d3a5a" />
      <path d="M38 126 h20 a4 4 0 0 1 4 4 v2 h-26 v-2 a4 4 0 0 1 2 -4z" fill="#fff" stroke="#222" strokeWidth="1.5" />
      <path d="M62 126 h20 a4 4 0 0 1 4 4 v2 h-26 v-2 a4 4 0 0 1 2 -4z" fill="#fff" stroke="#222" strokeWidth="1.5" />
      <path d="M40 129 h18 M64 129 h18" stroke="#e5394d" strokeWidth="2" />
      {/* hoodie */}
      <path d="M34 78 C 34 66, 86 66, 86 78 L 90 112 H 30 Z" fill="#2b9bf4" />
      <path d="M50 70 L60 84 L70 70" fill="none" stroke="#1a6fb5" strokeWidth="3" />
      <rect x="47" y="94" width="26" height="10" rx="4" fill="#1f86da" />
      <text x="60" y="91" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" fontFamily="sans-serif">GT</text>
      {/* arms */}
      {armsUp ? (
        <>
          <path d="M36 80 L20 56" stroke="#2b9bf4" strokeWidth="11" strokeLinecap="round" />
          <path d="M84 80 L100 56" stroke="#2b9bf4" strokeWidth="11" strokeLinecap="round" />
          <circle cx="19" cy="52" r="6" fill="#ff7a1a" /><circle cx="101" cy="52" r="6" fill="#ff7a1a" />
        </>
      ) : (
        <>
          <path d="M36 80 L28 104" stroke="#2b9bf4" strokeWidth="11" strokeLinecap="round" />
          <path d="M84 80 L92 104" stroke="#2b9bf4" strokeWidth="11" strokeLinecap="round" />
          <circle cx="27" cy="107" r="6" fill="#ff7a1a" /><circle cx="93" cy="107" r="6" fill="#ff7a1a" />
        </>
      )}
      {/* head */}
      <path d="M30 22 L42 44 L28 46 Z" fill="#ff7a1a" />
      <path d="M90 22 L78 44 L92 46 Z" fill="#ff7a1a" />
      <path d="M33 29 L40 42 L32 43 Z" fill="#3a2010" />
      <path d="M87 29 L80 42 L88 43 Z" fill="#3a2010" />
      <path d="M26 50 C 26 32, 94 32, 94 50 C 94 64, 78 74, 60 74 C 42 74, 26 64, 26 50 Z" fill="#ff7a1a" />
      <path d="M36 56 C 44 62, 52 60, 60 70 C 68 60, 76 62, 84 56 C 82 68, 72 74, 60 74 C 48 74, 38 68, 36 56 Z" fill="#fff" />
      {/* cap (backwards) */}
      <path d="M34 36 C 36 22, 84 22, 86 36 Z" fill="#e5394d" />
      <path d="M74 30 C 86 26, 98 30, 100 36 C 92 34, 84 34, 80 36 Z" fill="#c22d3f" />
      {/* eyes */}
      {eyesClosed ? (
        <g stroke="#1b1b1b" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d={mood === 'sleep' ? 'M42 50 h9 M69 50 h9' : 'M42 52 q4.5 -6 9 0 M69 52 q4.5 -6 9 0'} />
        </g>
      ) : (
        <g>
          <ellipse cx="47" cy="50" rx="5" ry={mood === 'sad' ? 5 : 6} fill="#1b1b1b" />
          <ellipse cx="73" cy="50" rx="5" ry={mood === 'sad' ? 5 : 6} fill="#1b1b1b" />
          <circle cx="48.5" cy="48" r="1.8" fill="#fff" /><circle cx="74.5" cy="48" r="1.8" fill="#fff" />
          {mood === 'think' && <path d="M40 40 l12 2 M68 42 l12 -3" stroke="#3a2010" strokeWidth="2.5" strokeLinecap="round" />}
          {mood === 'sad' && <path d="M40 43 l11 -3 M69 40 l11 3" stroke="#3a2010" strokeWidth="2.5" strokeLinecap="round" />}
        </g>
      )}
      {/* nose + mouth */}
      <ellipse cx="60" cy="60" rx="4.5" ry="3.2" fill="#1b1b1b" />
      {mood === 'sad' ? (
        <path d="M53 68 q7 -5 14 0" stroke="#1b1b1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === 'sleep' ? (
        <ellipse cx="60" cy="67" rx="3" ry="2" fill="#1b1b1b" />
      ) : (
        <path d={mood === 'happy' || mood === 'celebrate' ? 'M51 64 q9 10 18 0 z' : 'M52 65 q8 6 16 -1'} stroke="#1b1b1b" strokeWidth="2.5" fill={mood === 'happy' || mood === 'celebrate' ? '#8b1d2c' : 'none'} strokeLinecap="round" />
      )}
      {/* props */}
      {mood === 'read' && (
        <g>
          <circle cx="96" cy="88" r="12" fill="#cfeefd" fillOpacity="0.6" stroke="#333" strokeWidth="4" />
          <path d="M88 97 L80 108" stroke="#333" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {mood === 'think' && <text x="96" y="22" fontSize="22" fontWeight="800" fill="#2b9bf4" fontFamily="sans-serif">?</text>}
      {mood === 'sleep' && <text x="92" y="24" fontSize="16" fontWeight="800" fill="#8a5cf6" fontFamily="sans-serif">z z</text>}
      {mood === 'celebrate' && (
        <g fontSize="14" fill="#ffd34d">
          <text x="4" y="30">★</text><text x="104" y="22">★</text><text x="12" y="10">✦</text>
        </g>
      )}
    </svg>
  )
}
