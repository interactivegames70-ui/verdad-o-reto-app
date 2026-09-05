const COLORS = ['#ff2d78', '#ffd23f', '#7b3fe4', '#f5efff']

export default function Confetti({ count = 40 }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = Math.random() * 100
    const delay = Math.random() * 0.4
    const duration = 1.6 + Math.random() * 1.2
    const size = 6 + Math.random() * 6
    const color = COLORS[i % COLORS.length]
    const fall = 420 + Math.random() * 220
    const spin = 360 + Math.random() * 540
    return { id: i, left, delay, duration, size, color, fall, spin }
  })

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--fall-distance': `${p.fall}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  )
}
