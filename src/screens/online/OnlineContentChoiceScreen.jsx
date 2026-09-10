import { useOnlineGame } from '../../state/onlineGameContext'

export default function OnlineContentChoiceScreen() {
  const { setStatus, setPendingCommunityMode } = useOnlineGame()

  function choose(communityMode) {
    setPendingCommunityMode(communityMode)
    setStatus('create')
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={() => setStatus('home')}>
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
        <button className="option-card" style={{ textAlign: 'left' }} onClick={() => choose(false)}>
          <span className="icon">🎲</span>
          <span className="label">Preguntas y retos de la aplicación</span>
          <span className="desc">Modo clásico</span>
        </button>
        <button className="option-card" style={{ textAlign: 'left' }} onClick={() => choose(true)}>
          <span className="icon">🌐</span>
          <span className="label">Preguntas y retos creados por otros jugadores</span>
          <span className="desc">Contenido de la comunidad</span>
        </button>
      </div>
    </div>
  )
}
