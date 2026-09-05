import { useMemo, useRef, useState } from 'react'
import { useGame } from '../state/gameContext'
import Confetti from '../components/Confetti'
import { playTick, playLand } from '../lib/sound'
import { vibrate } from '../lib/haptics'

const SEGMENT_COLORS = ['#ff2d78', '#331d61', '#ffd23f', '#5a2f9e']

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function segmentPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

export default function RouletteScreen() {
  const { state, dispatch } = useGame()
  const players = state.players
  const n = players.length
  const segAngle = 360 / n
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [justLanded, setJustLanded] = useState(false)
  const chosenRef = useRef(null)

  const segments = useMemo(
    () =>
      players.map((p, i) => ({
        player: p,
        start: i * segAngle,
        end: (i + 1) * segAngle,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      })),
    [players, segAngle]
  )

  function spin() {
    if (spinning) return
    setSpinning(true)
    setJustLanded(false)
    // el ganador sale de la cola de turnos pendientes, no de todos los jugadores,
    // así se garantiza que todos jueguen antes de que alguien repita
    const pool = state.turnQueue.length > 0 ? state.turnQueue : players.map((p) => p.id)
    const winnerId = pool[Math.floor(Math.random() * pool.length)]
    const winnerIndex = players.findIndex((p) => p.id === winnerId)
    chosenRef.current = players[winnerIndex].id
    // el puntero está fijo arriba (0deg); centramos el segmento ganador ahí
    const winnerCenter = winnerIndex * segAngle + segAngle / 2
    const extraSpins = 5 * 360
    const target = extraSpins + (360 - winnerCenter)
    setRotation((prev) => prev - (prev % 360) + target)

    // tics que simulan la desaceleración de la ruleta física
    let delay = 40
    let elapsed = 0
    const scheduleTick = () => {
      if (elapsed >= 3100) return
      setTimeout(() => {
        playTick()
        elapsed += delay
        delay = Math.min(delay * 1.18, 220)
        scheduleTick()
      }, delay)
    }
    scheduleTick()
  }

  function handleTransitionEnd() {
    if (!spinning) return
    setSpinning(false)
    setJustLanded(true)
    playLand()
    vibrate([30, 40, 30])
    setTimeout(() => {
      dispatch({ type: 'SPIN_RESULT', playerId: chosenRef.current })
    }, 550)
  }

  const cx = 150
  const cy = 150
  const r = 145

  return (
    <div className="screen" style={{ alignItems: 'center', textAlign: 'center', justifyContent: 'center', gap: 28 }}>
      <div>
        <span className="progress-pill">
          Turno {state.turnIndex + 1} de {state.totalTurns}
        </span>
      </div>

      <h2 className="title" style={{ fontSize: 24 }}>
        {spinning ? 'Girando…' : '¿A quién le toca?'}
      </h2>

      {justLanded && <Confetti count={50} />}

      <div className="roulette-wrap" style={{ position: 'relative', width: 'min(280px, 78vw)', height: 'min(280px, 78vw)' }}>
        <div className="roulette-glow-ring" aria-hidden="true" />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '20px solid var(--accent-yellow)',
            zIndex: 2,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          }}
        />
        <svg
          viewBox="0 0 300 300"
          width="100%"
          height="100%"
          style={{
            display: 'block',
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3.2s cubic-bezier(0.15, 0.6, 0.15, 1)' : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          <circle cx={cx} cy={cy} r={r} fill="var(--surface-card)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          {segments.map((seg) => {
            const mid = (seg.start + seg.end) / 2
            const labelPos = polarToCartesian(cx, cy, r * 0.62, mid)
            return (
              <g key={seg.player.id}>
                <path d={segmentPath(cx, cy, r, seg.start, seg.end)} fill={seg.color} stroke="var(--bg-void)" strokeWidth="2" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#fff"
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="Baloo 2, sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
                >
                  {seg.player.name.length > 10 ? seg.player.name.slice(0, 9) + '…' : seg.player.name}
                </text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={26} fill="var(--accent-pink)" stroke="var(--bg-void)" strokeWidth="3" />
        </svg>
      </div>

      <button className="btn btn-primary btn-block" onClick={spin} disabled={spinning}>
        {spinning ? 'Girando…' : 'Girar la ruleta'}
      </button>
    </div>
  )
}
