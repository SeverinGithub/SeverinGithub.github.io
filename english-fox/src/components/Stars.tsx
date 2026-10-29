export function Stars({ n, size = 18, animate }: { n: number; size?: number; animate?: boolean }) {
  return (
    <span className={`stars ${animate ? 'stars-anim' : ''}`} aria-label={`${n} von 3 Sternen`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className={i < n ? 'star-on' : 'star-off'} style={{ animationDelay: `${i * 0.3}s` }}>
          <path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      ))}
    </span>
  )
}
