import { useGame } from '../state/gameContext'

export default function SetupScreen() {
  const { state, dispatch } = useGame()

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={() => dispatch({ type: 'GO_HOME' })}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Paso 1 de 2</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          ¿Cómo van a jugar?
        </h2>
      </div>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>Modo</p>
        <div className="option-grid">
          <button
            className={`option-card ${state.group === 'pareja' ? 'selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_GROUP', group: 'pareja' })}
          >
            <span className="icon">💑</span>
            <span className="label">Pareja</span>
            <span className="desc">Solo ustedes dos</span>
          </button>
          <button
            className={`option-card ${state.group === 'grupo' ? 'selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_GROUP', group: 'grupo' })}
          >
            <span className="icon">🎉</span>
            <span className="label">Grupo</span>
            <span className="desc">3 o más jugadores</span>
          </button>
        </div>
      </div>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>
          Modalidad {!state.group && <span style={{ color: 'var(--accent-yellow)' }}>· elegí el modo primero ↑</span>}
        </p>
        <div className="option-grid">
          <button
            className={`option-card ${state.modality === 'presencial' ? 'selected' : ''}`}
            disabled={!state.group}
            onClick={() => dispatch({ type: 'SET_MODALITY', modality: 'presencial' })}
          >
            <span className="icon">🏠</span>
            <span className="label">Presencial</span>
            <span className="desc">Mismo dispositivo, en persona</span>
          </button>
          <button
            className={`option-card ${state.modality === 'distancia' ? 'selected' : ''}`}
            disabled={!state.group}
            onClick={() => dispatch({ type: 'SET_MODALITY', modality: 'distancia' })}
          >
            <span className="icon">📱</span>
            <span className="label">A distancia</span>
            <span className="desc">Cada quien con su cel</span>
          </button>
        </div>
      </div>
    </div>
  )
}
