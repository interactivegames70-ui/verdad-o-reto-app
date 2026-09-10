import { useGame } from '../state/gameContext'

export default function ContentChoiceScreen() {
  const { dispatch } = useGame()

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={() => dispatch({ type: 'GO_HOME' })}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Paso 1 de 3</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          ¿Qué contenido quieren usar?
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          className="option-card"
          style={{ textAlign: 'left' }}
          onClick={() => dispatch({ type: 'GO_SETUP', communityMode: false })}
        >
          <span className="icon">🎲</span>
          <span className="label">Preguntas y retos de la aplicación</span>
          <span className="desc">El banco de contenido de siempre</span>
        </button>
        <button
          className="option-card"
          style={{ textAlign: 'left' }}
          onClick={() => dispatch({ type: 'GO_SETUP', communityMode: true })}
        >
          <span className="icon">🌐</span>
          <span className="label">Preguntas y retos creados por otros jugadores</span>
          <span className="desc">Contenido de la comunidad</span>
        </button>
      </div>
    </div>
  )
}
