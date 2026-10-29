// Own park illustration for the picture tasks (replaces the worksheet photo).
// What happens here is listed in content scene_facts for the AI check – keep both in sync.
export const parkFacts = [
  'a woman is walking her dog',
  'a man is riding a bike',
  'two children are playing with a ball',
  'a girl is reading a book on a bench',
  'ducks are swimming in the pond',
  'a man is jogging',
  'a family is having a picnic',
  'a boy is flying a kite',
  'an old man is feeding the birds',
]

function Person({ x, y, shirt, hair = '#4a2e1c', skin = '#f2c29b', legs = 'walk', s = 1 }: { x: number; y: number; shirt: string; hair?: string; skin?: string; legs?: 'walk' | 'sit' | 'run'; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {legs === 'walk' && <path d="M-4 18 L-7 34 M4 18 L8 34" stroke="#2d3a5a" strokeWidth="4" strokeLinecap="round" />}
      {legs === 'run' && <path d="M-3 18 L-12 30 M4 18 L12 26 L10 34" stroke="#2d3a5a" strokeWidth="4" strokeLinecap="round" fill="none" />}
      {legs === 'sit' && <path d="M-4 18 L10 18 L10 30 M2 18 L14 20 L14 30" stroke="#2d3a5a" strokeWidth="4" strokeLinecap="round" fill="none" />}
      <rect x="-8" y="-2" width="16" height="22" rx="7" fill={shirt} />
      <circle cx="0" cy="-10" r="8" fill={skin} />
      <path d="M-8 -11 a8 8 0 0 1 16 0 q-8 -4 -16 0z" fill={hair} />
    </g>
  )
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="0" width="10" height="34" rx="3" fill="#7a5233" />
      <circle cx="0" cy="-10" r="24" fill="#3e9a4f" />
      <circle cx="-16" cy="2" r="16" fill="#4caf5c" />
      <circle cx="16" cy="0" r="17" fill="#43a455" />
    </g>
  )
}

export function ParkScene() {
  return (
    <svg viewBox="0 0 480 320" className="park" role="img" aria-label="Park: Leute gehen spazieren, fahren Rad, spielen, lesen, picknicken; Enten im Teich.">
      <rect width="480" height="320" fill="#cfeefd" />
      <circle cx="420" cy="44" r="22" fill="#ffd34d" />
      <path d="M60 50 q14 -16 30 0 q16 -10 26 6 h-56z" fill="#fff" />
      <path d="M260 34 q14 -16 30 0 q16 -10 26 6 h-56z" fill="#fff" />
      <rect y="110" width="480" height="210" fill="#8fd16b" />
      {/* path */}
      <path d="M-10 300 C 120 250, 200 220, 260 180 S 420 130, 490 128 L490 158 C 420 160, 330 190, 280 222 S 130 300, 40 330 Z" fill="#e9d8b4" />
      {/* pond with ducks */}
      <ellipse cx="110" cy="170" rx="80" ry="30" fill="#5bb7e8" />
      <g fill="#fff"><ellipse cx="90" cy="168" rx="9" ry="6" /><circle cx="98" cy="162" r="4.5" /></g>
      <path d="M102 162 l5 1 -5 2z" fill="#f59e0b" />
      <g fill="#fff"><ellipse cx="130" cy="176" rx="9" ry="6" /><circle cx="138" cy="170" r="4.5" /></g>
      <path d="M142 170 l5 1 -5 2z" fill="#f59e0b" />
      <Tree x={40} y={100} s={1.1} />
      <Tree x={250} y={96} />
      <Tree x={455} y={190} s={1.2} />
      {/* kite */}
      <path d="M352 30 l14 18 -14 18 -14 -18z" fill="#e5394d" />
      <path d="M352 66 C 350 100, 340 120, 336 148" stroke="#555" strokeWidth="1.2" fill="none" />
      <Person x={334} y={160} shirt="#2b9bf4" hair="#2a1a10" />
      {/* bench with girl reading */}
      <rect x="170" y="120" width="56" height="6" rx="2" fill="#8a5a36" />
      <rect x="170" y="110" width="56" height="5" rx="2" fill="#8a5a36" />
      <path d="M176 126 v14 M220 126 v14" stroke="#5d3b22" strokeWidth="4" />
      <Person x={194} y={104} shirt="#e86aa6" hair="#d9a441" legs="sit" s={0.9} />
      <rect x="196" y="98" width="12" height="9" fill="#fff" stroke="#355" strokeWidth="1" />
      {/* old man feeding birds */}
      <Person x={300} y={112} shirt="#7b6f63" hair="#ddd" s={0.8} />
      <circle cx="318" cy="134" r="3" fill="#5a4636" /><circle cx="326" cy="138" r="3" fill="#5a4636" /><circle cx="312" cy="140" r="3" fill="#5a4636" />
      {/* picnic */}
      <path d="M380 236 l70 -6 6 30 -72 6z" fill="#ff6b6b" />
      <path d="M394 236 l4 30 M412 234 l4 30 M430 232 l4 30" stroke="#fff" strokeWidth="3" opacity="0.7" />
      <Person x={398} y={222} shirt="#16a36a" legs="sit" s={0.8} />
      <Person x={430} y={218} shirt="#8a5cf6" hair="#1d1d1d" legs="sit" s={0.8} />
      {/* children with ball */}
      <Person x={60} y={236} shirt="#ff7a1a" s={0.75} legs="run" />
      <Person x={140} y={240} shirt="#ffd34d" hair="#7a3b12" s={0.75} legs="run" />
      <circle cx="100" cy="246" r="7" fill="#fff" stroke="#e5394d" strokeWidth="3" />
      {/* cyclist */}
      <g>
        <circle cx="270" cy="216" r="13" fill="none" stroke="#333" strokeWidth="3" />
        <circle cx="306" cy="208" r="13" fill="none" stroke="#333" strokeWidth="3" />
        <path d="M270 216 L286 198 L306 208 M286 198 L282 188" stroke="#e5394d" strokeWidth="3" fill="none" />
        <Person x={284} y={176} shirt="#2b9bf4" legs="sit" s={0.75} />
      </g>
      {/* jogger */}
      <Person x={440} y={130} shirt="#ff7a1a" hair="#111" legs="run" s={0.75} />
      {/* woman walking dog */}
      <Person x={180} y={262} shirt="#c0392b" hair="#3b2416" />
      <path d="M190 270 C 206 276, 214 284, 220 292" stroke="#333" strokeWidth="1.5" fill="none" />
      <g transform="translate(232 296)">
        <ellipse cx="0" cy="0" rx="14" ry="7" fill="#b07a45" />
        <circle cx="-12" cy="-6" r="6" fill="#b07a45" />
        <path d="M-10 6 v8 M10 6 v8 M14 -2 l6 -4" stroke="#b07a45" strokeWidth="3" />
      </g>
    </svg>
  )
}
