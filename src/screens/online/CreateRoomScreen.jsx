import { useState } from 'react'
import { useOnlineGame } from '../../state/onlineGameContext'

export default function CreateRoomScreen() {
  const { createRoom, setStatus, error } = useOnlineGame()
  const [name, setName] = useState('')
  const [group, setGroup] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    if (!name.trim() || !group || submitting) return
    setSubmitting(true)
    await createRoom({ hostName: name, group })
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
        <p className="eyebrow">Crear partida</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          Vas a ser el anfitrión
        </h2>
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

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>Modo</p>
        <div className="option-grid">
          <button className={`option-card ${group === 'pareja' ? 'selected' : ''}`} onClick={() => setGroup('pareja')}>
            <span className="icon">💑</span>
            <span className="label">Pareja</span>
            <span className="desc">Solo ustedes dos</span>
          </button>
          <button className={`option-card ${group === 'grupo' ? 'selected' : ''}`} onClick={() => setGroup('grupo')}>
            <span className="icon">🎉</span>
            <span className="label">Grupo</span>
            <span className="desc">3 o más jugadores</span>
          </button>
        </div>
      </div>

      {error && (
        <p className="subtitle" style={{ color: 'var(--accent-pink)', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <button className="btn btn-primary btn-block" disabled={!name.trim() || !group || submitting} onClick={handleCreate}>
        {submitting ? 'Creando…' : 'Crear sala'}
      </button>
    </div>
  )
}
