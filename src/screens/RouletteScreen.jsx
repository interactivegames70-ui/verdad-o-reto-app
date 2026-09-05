import { useRef, useState } from 'react'
import { useGame } from '../state/gameContext'
import Confetti from '../components/Confetti'
import { playTick, playLand } from '../lib/sound'
import { vibrate } from '../lib/haptics'

const ROW_HEIGHT = 64
const VISIBLE_ROWS = 5
const LAPS = 22 // cuántas vueltas completas de todos los jugadores hace el carrete antes de frenar

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

      <div
        className="roulette-reel-wrap"
        style={{
          position: 'relative',
          width: 'min(320px, 88vw)',
          height: ROW_HEIGHT * VISIBLE_ROWS,
          overflow: 'hidden',
          borderRadius: 24,
          background: 'var(--surface-card)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* franja central fija, como puntero: aquí siempre se lee el resultado */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: halfVisible * ROW_HEIGHT,
            left: 0,
            right: 0,
            height: ROW_HEIGHT,
            background: 'rgba(255,45,120,0.12)',
            borderTop: '2px solid var(--accent-pink)',
            borderBottom: '2px solid var(--accent-pink)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* difuminado de los bordes superior/inferior, para que el carrete "aparezca" y "desaparezca" */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: 'linear-gradient(var(--surface-card), transparent 24%, transparent 76%, var(--surface-card))',
          }}
        />

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
            const blurAmount = spinning && !isCenter ? Math.min(distance * 0.7, 4) : 0
            return (
              <div
                key={i}
                style={{
                  height: ROW_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'Baloo 2, sans-serif',
                  fontWeight: isCenter ? 800 : 600,
                  fontSize: isCenter ? 26 : 19,
                  color: isCenter ? 'var(--accent-pink)' : 'rgba(255,255,255,0.45)',
                  filter: blurAmount ? `blur(${blurAmount}px)` : 'none',
                  transform: isCenter ? 'scale(1)' : 'scale(0.94)',
                  transition: 'color 0.25s, filter 0.25s',
                }}
              >
                {isCenter && <span aria-hidden="true">→</span>}
                <span>{name}</span>
              </div>
            )
          })}
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={spin} disabled={spinning}>
        {spinning ? 'Girando…' : 'Girar la ruleta'}
      </button>
    </div>
  )
}
