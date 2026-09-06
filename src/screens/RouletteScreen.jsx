import { useLayoutEffect, useRef, useState } from 'react'
import { useGame } from '../state/gameContext'
import Confetti from '../components/Confetti'
import { playTick, playLand } from '../lib/sound'
import { vibrate } from '../lib/haptics'

const VISIBLE_ROWS = 5 // cuántas filas "caben" a la vez; el alto de cada una se calcula solo
const IDLE_LOOPS = 8 // vueltas de relleno para que se vea lleno incluso antes de girar
const SPIN_LOOPS = 14 // vueltas adicionales que se agregan cada vez que se gira
const SPIN_MS = 3900 // duración del giro

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildLoops(names, loops) {
  const out = []
  for (let i = 0; i < loops; i++) out.push(...shuffle(names))
  return out
}

// translateY necesario para que la fila `index` quede centrada verticalmente
// dentro de un contenedor de alto `containerHeight`, dado el alto de fila `rowH`.
function centeredOffset(index, containerHeight, rowH) {
  return containerHeight / 2 - (index * rowH + rowH / 2)
}

// Desaceleración marcada, como una ruleta física frenando (fuerte al inicio, suave al final).
function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5)
}

export default function RouletteScreen() {
  const { state, dispatch } = useGame()
  const players = state.players
  const names = players.map((p) => p.name)

  const viewportRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState(0)
  const rowHeight = containerHeight > 0 ? containerHeight / VISIBLE_ROWS : 80

  const [spinning, setSpinning] = useState(false)
  const [justLanded, setJustLanded] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const [reel, setReel] = useState(() => buildLoops(names, IDLE_LOOPS))
  const chosenRef = useRef(null)
  const centerIndexRef = useRef(Math.floor(reel.length / 2))
  const spinningRef = useRef(false)
  const rafRef = useRef(null)

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => {
      const h = el.clientHeight
      const rh = h / VISIBLE_ROWS
      setContainerHeight(h)
      if (!spinningRef.current) {
        setTranslateY(centeredOffset(centerIndexRef.current, h, rh))
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  function spin() {
    if (spinning || players.length === 0 || containerHeight === 0) return
    setSpinning(true)
    spinningRef.current = true
    setJustLanded(false)

    // el ganador sale de la cola de turnos pendientes, no de todos los jugadores,
    // así se garantiza que todos jueguen antes de que alguien repita
    const pool = state.turnQueue.length > 0 ? state.turnQueue : players.map((p) => p.id)
    const winnerId = pool[Math.floor(Math.random() * pool.length)]
    const winner = players.find((p) => p.id === winnerId)
    chosenRef.current = winner.id

    // Seguimos agregando filas DESPUÉS de las que ya se ven en pantalla, así el
    // carrete nunca "salta": continúa girando desde donde está hasta frenar en el ganador.
    // Agregamos también relleno DESPUÉS del ganador, para que al frenar no quede vacío debajo.
    const oldLen = reel.length
    const extension = buildLoops(names, SPIN_LOOPS)
    extension.push(winner.name)
    const trailingFiller = buildLoops(names, IDLE_LOOPS)
    const newReel = [...reel, ...extension, ...trailingFiller]
    const newCenterIndex = oldLen + extension.length - 1
    centerIndexRef.current = newCenterIndex
    setReel(newReel)

    // Animamos con requestAnimationFrame en vez de una transición CSS: así el
    // movimiento se ve garantizado en cualquier navegador, sin depender de que
    // el navegador detecte el cambio de estilo a tiempo.
    const startY = translateY
    const endY = centeredOffset(newCenterIndex, containerHeight, rowHeight)
    const startTime = performance.now()

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const tick = (now) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / SPIN_MS, 1)
      const eased = easeOutQuint(t)
      setTranslateY(startY + (endY - startY) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        spinningRef.current = false
        setSpinning(false)
        setJustLanded(true)
        playLand()
        vibrate([30, 40, 30])
        setTimeout(() => {
          dispatch({ type: 'SPIN_RESULT', playerId: chosenRef.current })
        }, 550)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    // tics que simulan la desaceleración de la ruleta física
    let delay = 40
    let elapsed = 0
    const scheduleTick = () => {
      if (elapsed >= SPIN_MS - 100) return
      setTimeout(() => {
        playTick()
        elapsed += delay
        delay = Math.min(delay * 1.15, 220)
        scheduleTick()
      }, delay)
    }
    scheduleTick()
  }

  // Solo renderizamos las filas realmente visibles (más un margen), aunque el
  // carrete completo tenga miles de nombres acumulados tras varios giros.
  const centerFloat = rowHeight > 0 ? (containerHeight / 2 - rowHeight / 2 - translateY) / rowHeight : 0
  const buffer = Math.ceil(VISIBLE_ROWS / 2) + 3
  const startIndex = Math.max(0, Math.floor(centerFloat - buffer))
  const endIndex = Math.min(reel.length - 1, Math.ceil(centerFloat + buffer))
  const visibleSlice = reel.slice(startIndex, endIndex + 1)
  const spacerHeight = startIndex * rowHeight

  return (
    <div className="screen" style={{ padding: '20px 0 28px', gap: 12 }}>
      <div style={{ textAlign: 'center' }}>
        <span className="progress-pill">
          Turno {state.turnIndex + 1} de {state.totalTurns}
        </span>
      </div>

      {justLanded && <Confetti count={50} />}

      <div
        ref={viewportRef}
        className="reel-viewport"
        style={{
          height: 'clamp(320px, 58vh, 620px)',
          width: '100%',
          maskImage: 'linear-gradient(transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(transparent, black 12%, black 88%, transparent)',
        }}
      >
        <div className="reel-tilt">
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${translateY}px)`,
            }}
          >
            <div style={{ height: spacerHeight }} />
            {visibleSlice.map((name, offsetInSlice) => {
              const i = startIndex + offsetInSlice
              const isCenter = i === centerIndexRef.current
              const showAsCenter = isCenter && !spinning
              const rawDistance = Math.abs(i - centerFloat)
              const distance = Math.min(rawDistance, 6)
              const blurAmount = spinning ? Math.min(distance * 0.3, 1.8) : 0
              const opacity = showAsCenter ? 1 : Math.max(0.55, 0.8 - distance * 0.04)
              const rotation = Math.max(-45, Math.min(45, (i - centerFloat) * 2.5))
              // El tamaño crece solo muy cerca del centro (como al pasar frente a la flecha);
              // el resto de los nombres se ven parejos, como en la referencia.
              const growT = Math.max(0, 1 - Math.min(distance, 2) / 2)
              const baseSize = rowHeight * 0.78
              const peakSize = rowHeight * 1.05
              const fontSize = showAsCenter ? rowHeight * 1.05 : baseSize + (peakSize - baseSize) * growT

              return (
                <div key={i} className="reel-row" style={{ height: rowHeight }}>
                  <span
                    className={showAsCenter && justLanded ? 'reel-winner-landed reel-row-text' : 'reel-row-text'}
                    style={{
                      fontFamily: 'Baloo 2, sans-serif',
                      fontWeight: showAsCenter ? 800 : 700,
                      fontSize,
                      color: showAsCenter ? '#ffffff' : `rgba(255,255,255,${opacity})`,
                      textShadow: showAsCenter ? '0 0 24px rgba(255,45,120,0.75), 0 0 3px rgba(0,0,0,0.4)' : 'none',
                      filter: blurAmount ? `blur(${blurAmount}px)` : 'none',
                      transform: `translateY(-50%) rotate(${rotation}deg)`,
                    }}
                  >
                    {name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '4%',
            transform: 'translateY(-50%)',
            fontSize: rowHeight * 0.55,
            color: '#ffffff',
            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          →
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={spin} disabled={spinning || containerHeight === 0}>
        {spinning ? 'Girando…' : 'Girar la ruleta'}
      </button>
    </div>
  )
}
