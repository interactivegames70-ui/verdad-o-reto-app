import { useGame } from '../state/gameContext'

export default function SetupScreen({ onGoCommunityCreate }) {
  const { state, dispatch } = useGame()

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={() => dispatch({ type: 'GO_CONTENT_CHOICE' })}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Paso 2 de 3</p>
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
            <span className="desc">Todos se encuentran en el mismo lugar</span>
          </button>
          <button
            className={`option-card ${state.modality === 'distancia' ? 'selected' : ''}`}
            disabled={!state.group}
            onClick={() => dispatch({ type: 'SET_MODALITY', modality: 'distancia' })}
          >
            <span className="icon">📱</span>
            <span className="label">A distancia</span>
            <span className="desc">Los jugadores se encuentran en lugares diferentes</span>
          </button>
        </div>
      </div>

      {state.communityMode && (
        <button className="btn btn-secondary btn-block" style={{ fontSize: 14, padding: '12px 16px' }} onClick={onGoCommunityCreate}>
          + Enviar una pregunta o reto
        </button>
      )}
    </div>
  )
}
