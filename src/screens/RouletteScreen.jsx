import { useRef, useState } from 'react'
import { useGame } from '../state/gameContext'
import Confetti from '../components/Confetti'
import { playTick, playLand } from '../lib/sound'
import { vibrate } from '../lib/haptics'

const ROW_HEIGHT = 78
const VISIBLE_ROWS = 7
const LAPS = 20 // cuántas vueltas completas de todos los jugadores hace el carrete antes de frenar
const TILT_DEG = 11 // inclinación de la cascada de nombres (el ganador se endereza)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function RouletteScreen() {
  const { state, dispatch } = useGame()
  const players = state.players
  const halfVisible = Math.floor(VISIBLE_ROWS / 2)

  const [spinning, setSpinning] = useState(false)
  const [justLanded, setJustLanded] = useState(false)
  const [phase, setPhase] = useState('idle') // 'idle' | 'resetting' | 'spinning'
  const [translateY, setTranslateY] = useState(halfVisible * ROW_HEIGHT)
  const [reel, setReel] = useState(players.map((p) => p.name))
  const chosenRef = useRef(null)
  const centerIndexRef = useRef(0)

  function spin() {
    if (spinning || players.length === 0) return
    setSpinning(true)
    setJustLanded(false)

    // el ganador sale de la cola de turnos pendientes, no de todos los jugadores,
    // así se garantiza que todos jueguen antes de que alguien repita
    const pool = state.turnQueue.length > 0 ? state.turnQueue : players.map((p) => p.id)
    const winnerId = pool[Math.floor(Math.random() * pool.length)]
    const winner = players.find((p) => p.id === winnerId)
    chosenRef.current = winner.id

    // Carrete largo: varias vueltas barajadas de todos los jugadores, terminando
    // justo con el ganador en la fila central donde se frena.
    const laps = []
    for (let i = 0; i < LAPS; i++) laps.push(...shuffle(players.map((p) => p.name)))
    laps.push(winner.name)
    const centerIndex = laps.length - 1
    centerIndexRef.current = centerIndex

    setReel(laps)
    // Fase 1: sin transición, volvemos a la posición inicial (fila 0 centrada)
    setPhase('resetting')
    setTranslateY(halfVisible * ROW_HEIGHT)

    // Fase 2 (un par de frames después, para que el navegador sí anime el salto):
    // nos movemos hasta la posición final con transición larga.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('spinning')
        setTranslateY(halfVisible * ROW_HEIGHT - centerIndex * ROW_HEIGHT)
      })
    })

    // tics que simulan la desaceleración de la ruleta física
    let delay = 40
    let elapsed = 0
    const scheduleTick = () => {
      if (elapsed >= 3400) return
      setTimeout(() => {
        playTick()
        elapsed += delay
        delay = Math.min(delay * 1.16, 220)
        scheduleTick()
      }, delay)
    }
    scheduleTick()
  }

  function handleTransitionEnd(e) {
    if (e.propertyName !== 'transform' || phase !== 'spinning') return
    setSpinning(false)
    setPhase('idle')
    setJustLanded(true)
    playLand()
    vibrate([30, 40, 30])
    setTimeout(() => {
      dispatch({ type: 'SPIN_RESULT', playerId: chosenRef.current })
    }, 550)
  }

  return (
    <div className="screen" style={{ alignItems: 'center', textAlign: 'center', justifyContent: 'center', gap: 24 }}>
      <div>
        <span className="progress-pill">
          Turno {state.turnIndex + 1} de {state.totalTurns}
        </span>
      </div>

      <h2 className="title" style={{ fontSize: 24 }}>
        {spinning ? 'Girando…' : '¿A quién le toca?'}
      </h2>

      {justLanded && <Confetti count={50} />}

      <div
        className="reel-viewport"
        style={{
          width: '100%',
          height: ROW_HEIGHT * VISIBLE_ROWS,
          maskImage: 'linear-gradient(transparent, black 18%, black 82%, transparent)',
          WebkitMaskImage: 'linear-gradient(transparent, black 18%, black 82%, transparent)',
        }}
      >
        <div className="reel-tilt">
          <div
            style={{
              transform: `translateY(${translateY}px)`,
              transition: phase === 'spinning' ? 'transform 3.6s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none',
              willChange: 'transform',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {reel.map((name, i) => {
              const isCenter = i === centerIndexRef.current
              const distance = Math.abs(i - centerIndexRef.current)
              const blurAmount = spinning && !isCenter ? Math.min(distance * 0.5, 2.5) : 0
              const opacity = isCenter ? 1 : Math.max(0.28, 0.85 - distance * 0.16)

              return (
                <div
                  key={i}
                  className={isCenter && justLanded ? 'reel-winner-landed' : undefined}
                  style={{
                    height: ROW_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: isCenter ? 800 : 700,
                    fontSize: isCenter ? 44 : 32,
                    color: isCenter ? '#ffffff' : `rgba(255,255,255,${opacity})`,
                    textShadow: isCenter ? '0 0 22px rgba(255,45,120,0.75), 0 0 3px rgba(0,0,0,0.4)' : 'none',
                    filter: blurAmount ? `blur(${blurAmount}px)` : 'none',
                    transform: isCenter ? `rotate(${TILT_DEG}deg)` : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isCenter && (
                    <span aria-hidden="true" style={{ color: 'var(--accent-yellow)' }}>
                      →
                    </span>
                  )}
                  <span>{name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={spin} disabled={spinning}>
        {spinning ? 'Girando…' : 'Girar la ruleta'}
      </button>
    </div>
  )
}
