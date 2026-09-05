import { useState } from 'react'
import { useAuth } from '../../state/authContext'
import { LEVELS } from '../../data/content'
import { submitCard } from '../../lib/community'
import SignInScreen from '../account/SignInScreen'

export default function CreateCommunityCardScreen({ onBack }) {
  const { user } = useAuth()
  const [type, setType] = useState('truth')
  const [level, setLevel] = useState(1)
  const [text, setText] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  if (!user) return <SignInScreen onBack={onBack} />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    const { error } = await submitCard({
      authorId: user.id,
      type,
      level,
      groupMode: 'ambas',
      modality: 'ambas',
      text: text.trim(),
      timerSeconds,
    })
    setSubmitting(false)
    if (!error) {
      setSent(true)
      setText('')
    }
  }

  if (sent) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
        <span style={{ fontSize: 44 }}>📨</span>
        <h2 className="title" style={{ fontSize: 24 }}>¡Enviada!</h2>
        <p className="subtitle">
          Tu carta va a pasar por revisión antes de aparecer para el resto de la comunidad.
        </p>
        <button className="btn btn-primary btn-block" onClick={() => setSent(false)}>
          Enviar otra
        </button>
        <button className="btn btn-secondary btn-block" onClick={onBack}>
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Contenido de la comunidad</p>
        <h2 className="title" style={{ fontSize: 24 }}>
          Compartí una pregunta o reto
        </h2>
        <p className="subtitle" style={{ marginTop: 6 }}>
          Se revisa antes de publicarse para el resto de los jugadores.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="option-grid">
          <button type="button" className={`option-card ${type === 'truth' ? 'selected' : ''}`} onClick={() => setType('truth')}>
            <span className="icon">🗣️</span>
            <span className="label">Verdad</span>
          </button>
          <button type="button" className={`option-card ${type === 'dare' ? 'selected' : ''}`} onClick={() => setType('dare')}>
            <span className="icon">🔥</span>
            <span className="label">Reto</span>
          </button>
        </div>

        <div>
          <p className="subtitle" style={{ marginBottom: 8 }}>Nivel de intensidad</p>
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
          className="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={type === 'truth' ? 'Escribí la pregunta…' : 'Escribí el reto…'}
          rows={3}
          maxLength={220}
          style={{ resize: 'vertical' }}
        />

        {type === 'dare' && (
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

        <button type="submit" className="btn btn-yellow btn-block" disabled={!text.trim() || submitting}>
          {submitting ? 'Enviando…' : 'Enviar a revisión'}
        </button>
      </form>
    </div>
  )
}
