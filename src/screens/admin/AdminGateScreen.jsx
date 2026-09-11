import { useState } from 'react'
import { ADMIN_PANEL_PASSWORD } from '../../config'

export default function AdminGateScreen({ onSuccess, onCancel }) {
  const [password, setPassword] = useState('')
  const [wrong, setWrong] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (password === ADMIN_PANEL_PASSWORD) {
      onSuccess()
    } else {
      setWrong(true)
      setPassword('')
    }
  }

  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
      <span style={{ fontSize: 40 }}>🔒</span>
      <h2 className="title" style={{ fontSize: 22 }}>
        Acceso admin
      </h2>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="password"
          autoFocus
          className="text-input"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setWrong(false)
          }}
          placeholder="Contraseña"
        />
        {wrong && (
          <p className="subtitle" style={{ color: 'var(--accent-pink)' }}>
            Contraseña incorrecta.
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={!password}>
          Entrar
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  )
}
