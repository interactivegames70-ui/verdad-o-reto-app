import { useOnlineGame } from '../../state/onlineGameContext'

export default function OnlineHomeScreen({ onExit }) {
  const { setStatus, error, setError } = useOnlineGame()

  return (
    <div className="screen" style={{ justifyContent: 'center', gap: 24 }}>
      <div className="top-bar">
        <button
          className="back-btn"
          onClick={() => {
            setError(null)
            onExit()
          }}
        >
          ‹ Volver
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p className="eyebrow">Partida online</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          Cada quien desde su cel
        </h2>
        <p className="subtitle" style={{ marginTop: 6 }}>Necesitan conexión a internet</p>
      </div>

      {error && (
        <p className="subtitle" style={{ color: 'var(--accent-pink)', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          className="btn btn-primary btn-block"
          onClick={() => {
            setError(null)
            setStatus('create')
          }}
        >
          Crear partida
        </button>
        <button
          className="btn btn-secondary btn-block"
          onClick={() => {
            setError(null)
            setStatus('join')
          }}
        >
          Unirse a partida
        </button>
      </div>
    </div>
  )
}
