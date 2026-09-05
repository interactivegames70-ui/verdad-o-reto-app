import { useState } from 'react'
import { useGame } from '../state/gameContext'
import { LEVELS } from '../data/content'

export default function CustomContentScreen() {
  const { state, dispatch } = useGame()
  const [cardType, setCardType] = useState('truth')
  const [level, setLevel] = useState(1)
  const [text, setText] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(30)

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    dispatch({ type: 'ADD_CUSTOM_CARD', cardType, level, text, timerSeconds })
    setText('')
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={() => dispatch({ type: 'BACK_TO_PLAYERS' })}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Contenido propio</p>
        <h2 className="title" style={{ fontSize: 24 }}>
          Agregá tus preguntas y retos
        </h2>
        <p className="subtitle" style={{ marginTop: 6 }}>
          Se van a mezclar con las del banco solo en esta partida.
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="option-grid">
          <button
            type="button"
            className={`option-card ${cardType === 'truth' ? 'selected' : ''}`}
            onClick={() => setCardType('truth')}
          >
            <span className="icon">🗣️</span>
            <span className="label">Verdad</span>
          </button>
          <button
            type="button"
            className={`option-card ${cardType === 'dare' ? 'selected' : ''}`}
            onClick={() => setCardType('dare')}
          >
            <span className="icon">🔥</span>
            <span className="label">Reto</span>
          </button>
        </div>

        <div>
          <p className="subtitle" style={{ marginBottom: 8 }}>
            Nivel de intensidad
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevel(lvl.id)}
                className="btn"
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  fontSize: 14,
                  background: level === lvl.id ? 'var(--accent-pink)' : 'rgba(255,255,255,0.06)',
                  color: level === lvl.id ? '#fff' : 'var(--text-muted)',
                }}
              >
                {lvl.id}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={cardType === 'truth' ? 'Escribí la pregunta…' : 'Escribí el reto…'}
          rows={3}
          maxLength={220}
          style={{
            width: '100%',
            background: 'var(--surface-card)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: '14px 16px',
            color: 'var(--text-primary)',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            resize: 'vertical',
          }}
        />

        {cardType === 'dare' && (
          <div>
            <p className="subtitle" style={{ marginBottom: 8 }}>
              Tiempo para cumplirlo: {timerSeconds}s
            </p>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={timerSeconds}
              onChange={(e) => setTimerSeconds(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-yellow btn-block" disabled={!text.trim()}>
          Agregar a la partida
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
        {state.customCards.length === 0 && (
          <p className="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>
            Todavía no agregaste contenido propio.
          </p>
        )}
        {state.customCards.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
          >
            <span style={{ fontSize: 13.5 }}>
              <strong>{c.type === 'truth' ? 'Verdad' : 'Reto'} · N{c.level}</strong>
              <br />
              {c.text}
            </span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_CUSTOM_CARD', id: c.id })}
              aria-label="Quitar"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, padding: 12, minWidth: 44, minHeight: 44, flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary btn-block" onClick={() => dispatch({ type: 'BACK_TO_PLAYERS' })}>
        Listo
      </button>
    </div>
  )
}
