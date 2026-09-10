import { useEffect } from 'react'
import { OnlineGameProvider, useOnlineGame } from '../state/onlineGameContext'
import OnlineHomeScreen from './online/OnlineHomeScreen'
import OnlineContentChoiceScreen from './online/OnlineContentChoiceScreen'
import CreateRoomScreen from './online/CreateRoomScreen'
import JoinRoomScreen from './online/JoinRoomScreen'
import LobbyScreen from './online/LobbyScreen'
import OnlineCustomContentScreen from './online/OnlineCustomContentScreen'
import OnlineRouletteScreen from './online/OnlineRouletteScreen'
import OnlineChallengeScreen from './online/OnlineChallengeScreen'
import OnlineResultsScreen from './online/OnlineResultsScreen'

function OnlineRouter({ onExit }) {
  const { status, room, gameState } = useOnlineGame()

  if (status === 'home' || status === 'error') return <OnlineHomeScreen onExit={onExit} />
  if (status === 'content-choice') return <OnlineContentChoiceScreen />
  if (status === 'create') return <CreateRoomScreen />
  if (status === 'join') return <JoinRoomScreen />
  if (status === 'lobby') return <LobbyScreen />
  if (status === 'custom') return <OnlineCustomContentScreen />

  if (status === 'playing' && room) {
    if (gameState.screen === 'challenge') return <OnlineChallengeScreen />
    if (gameState.screen === 'results') return <OnlineResultsScreen />
    return <OnlineRouletteScreen />
  }

  return <OnlineHomeScreen onExit={onExit} />
}

export default function OnlineGameScreen({ onExit }) {
  return (
    <OnlineGameProvider>
      <InitialStatus />
      <OnlineRouter onExit={onExit} />
    </OnlineGameProvider>
  )
}

// Arranca el modo online en 'home' apenas se monta el provider.
function InitialStatus() {
  const { status, setStatus } = useOnlineGame()
  useEffect(() => {
    if (status === 'idle') setStatus('home')
  }, [status, setStatus])
  return null
}
