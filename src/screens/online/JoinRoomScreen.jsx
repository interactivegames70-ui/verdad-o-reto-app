import { useState } from 'react'
import { useOnlineGame } from '../../state/onlineGameContext'

export default function JoinRoomScreen() {
  const { joinRoom, setStatus, error } = useOnlineGame()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleJoin() {
    if (!name.trim() || !code.trim() || submitting) return
    setSubmitting(true)
    await joinRoom({ code, name })
    setSubmitting(false)
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={() => setStatus('home')}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Unirse a partida</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          Ingresá el código de la sala
        </h2>
      </div>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>Código de sala</p>
        <input
          className="text-input"
          value={code}
          maxLength={5}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="EJ: 7K2QP"
          style={{ textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', fontWeight: 700 }}
        />
      </div>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>Tu nombre</p>
        <input
          className="text-input"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Cómo te decimos?"
        />
      </div>

      {error && (
        <p className="subtitle" style={{ color: 'var(--accent-pink)', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <button className="btn btn-primary btn-block" disabled={!name.trim() || !code.trim() || submitting} onClick={handleJoin}>
        {submitting ? 'Uniéndote…' : 'Unirme'}
      </button>
    </div>
  )
}
