import { useEffect, useState } from 'react'
import { useGame } from '../state/gameContext'
import { LEVELS } from '../data/content'
import { playReveal, playCountdownTick, playBuzzer, playSuccess, playFail } from '../lib/sound'
import { vibrate } from '../lib/haptics'

export default function ChallengeScreen() {
  const { state, dispatch } = useGame()
  const player = state.players.find((p) => p.id === state.currentPlayerId)
  const [timeLeft, setTimeLeft] = useState(null)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    setTimeLeft(null)
    setTimerRunning(false)
    if (state.card) {
      playReveal()
      vibrate(15)
    }
  }, [state.card])

  useEffect(() => {
    if (!timerRunning || timeLeft === null) return
    if (timeLeft <= 0) {
      setTimerRunning(false)
      playBuzzer()
      vibrate([100, 50, 100])
      return
    }
    const urgent = timeLeft <= 5
    playCountdownTick(urgent)
    if (urgent) vibrate(15)
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timerRunning, timeLeft])

  if (!player) return null

  return (
    <div className="screen">
      <div className="top-bar">
        <span className="progress-pill">
          Turno {state.turnIndex + 1} de {state.totalTurns}
        </span>
        <span className="progress-pill">
          {player.name} · {player.score} pts
        </span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p className="eyebrow">Le toca a</p>
        <h2 className="title" style={{ fontSize: 30 }}>
          {player.name}
        </h2>
      </div>

      {!state.choice && (
        <div className="option-grid" style={{ marginTop: 8 }}>
          <button className="option-card" onClick={() => dispatch({ type: 'CHOOSE_TYPE', choice: 'truth' })}>
            <span className="icon">🗣️</span>
            <span className="label">Verdad</span>
            <span className="desc">Responde sin filtro</span>
          </button>
          <button className="option-card" onClick={() => dispatch({ type: 'CHOOSE_TYPE', choice: 'dare' })}>
            <span className="icon">🔥</span>
            <span className="label">Reto</span>
            <span className="desc">Anímate a cumplirlo</span>
          </button>
        </div>
      )}

      {state.choice && !state.card && (
        <div>
          <p className="subtitle" style={{ marginBottom: 10, textAlign: 'center' }}>
            Elegí el nivel de intensidad
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                className="option-card"
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => dispatch({ type: 'SELECT_LEVEL', level: lvl.id })}
              >
                <span style={{ flex: 1 }}>
                  <span className="label">
                    {lvl.id}. {lvl.name}
                  </span>
                  <br />
                  <span className="desc">{lvl.tagline}</span>
                  <span className="intensity-bar" aria-hidden="true">
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className={n <= lvl.id ? 'filled' : ''} />
                    ))}
                  </span>
                </span>
                <span aria-hidden="true" style={{ fontSize: 18, marginLeft: 10 }}>
                  {'🌶️'.repeat(lvl.id)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {state.card && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div
            key={state.card.text}
            className="card card-reveal"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, minHeight: 180 }}
          >
            <span className="eyebrow">{state.choice === 'truth' ? 'Verdad' : 'Reto'} · Nivel {state.level}</span>
            <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.4 }}>{state.card.text}</p>
          </div>

          {state.choice === 'dare' && state.card.timerSeconds && (
            <div className="card" style={{ textAlign: 'center' }}>
              <p
                className={timerRunning && timeLeft !== null && timeLeft <= 5 ? 'timer-urgent' : ''}
                style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}
              >
                {timeLeft === null ? state.card.timerSeconds : timeLeft}s
              </p>
              {!timerRunning && (timeLeft === null || timeLeft > 0) && (
                <button
                  className="btn btn-yellow"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setTimeLeft(state.card.timerSeconds)
                    setTimerRunning(true)
                  }}
                >
                  Iniciar tiempo
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => dispatch({ type: 'REDRAW_CARD' })}>
              Cambiar carta
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                playFail()
                vibrate(80)
                dispatch({ type: 'MARK_RESULT', fulfilled: false })
              }}
            >
              No lo cumplió
            </button>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                playSuccess()
                vibrate([20, 30, 20, 30, 60])
                dispatch({ type: 'MARK_RESULT', fulfilled: true })
              }}
            >
              ¡Lo cumplió! +1
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
