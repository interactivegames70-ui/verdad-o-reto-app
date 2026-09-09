import { useState } from 'react'
import { useOnlineGame } from '../../state/onlineGameContext'

export default function LobbyScreen() {
  const { room, players, isHost, gameState, startGame, leaveRoom, toggleCommunity, setStatus } = useOnlineGame()
  const [loadingCommunity, setLoadingCommunity] = useState(false)

  async function handleToggleCommunity() {
    setLoadingCommunity(true)
    await toggleCommunity()
    setLoadingCommunity(false)
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={leaveRoom}>
          ‹ Salir
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p className="eyebrow">Código de la sala</p>
        <h2 className="title" style={{ fontSize: 40, letterSpacing: '0.1em' }}>
          {room.code}
        </h2>
        <p className="subtitle" style={{ marginTop: 6 }}>Compartí este código para que se unan</p>
      </div>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>
          Jugadores ({players.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <span className="label">{p.name}</span>
              {p.is_host && <span className="progress-pill">Anfitrión</span>}
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <button
          className="btn btn-secondary btn-block"
          style={{ fontSize: 14, padding: '12px 16px' }}
          onClick={() => setStatus('custom')}
        >
          + Agregar preguntas y retos propios{gameState.customCards.length > 0 ? ` (${gameState.customCards.length})` : ''}
        </button>
      )}

      {isHost && (
        <button
          className="btn btn-secondary btn-block"
          style={{ fontSize: 14, padding: '12px 16px' }}
          onClick={handleToggleCommunity}
          disabled={loadingCommunity}
        >
          {loadingCommunity
            ? 'Cargando contenido de la comunidad…'
            : gameState.communityEnabled
              ? `✓ Contenido de la comunidad activado (${gameState.communityCards.length})`
              : 'Sumar contenido de la comunidad'}
        </button>
      )}

      {isHost ? (
        <button className="btn btn-primary btn-block" disabled={players.length < 2} onClick={startGame}>
          {players.length < 2 ? 'Esperando más jugadores…' : 'Iniciar partida'}
        </button>
      ) : (
        <p className="subtitle" style={{ textAlign: 'center' }}>
          Esperando a que el anfitrión inicie la partida…
        </p>
      )}
    </div>
  )
}
