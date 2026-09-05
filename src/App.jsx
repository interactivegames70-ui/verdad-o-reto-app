import { useEffect, useState } from 'react'
import { GameProvider, useGame } from './state/gameContext'
import { AuthProvider, useAuth } from './state/authContext'
import { playClick } from './lib/sound'
import { vibrate } from './lib/haptics'
import BackgroundBlobs from './components/BackgroundBlobs'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import PlayersScreen from './screens/PlayersScreen'
import CustomContentScreen from './screens/CustomContentScreen'
import RouletteScreen from './screens/RouletteScreen'
import ChallengeScreen from './screens/ChallengeScreen'
import ResultsScreen from './screens/ResultsScreen'
import OnlineGameScreen from './screens/OnlineGameScreen'
import SignInScreen from './screens/account/SignInScreen'
import ProfileScreen from './screens/account/ProfileScreen'
import CommunityScreen from './screens/community/CommunityScreen'
import CreateCommunityCardScreen from './screens/community/CreateCommunityCardScreen'
import AdminModerationScreen from './screens/community/AdminModerationScreen'

const SCREENS = {
  home: HomeScreen,
  setup: SetupScreen,
  players: PlayersScreen,
  custom: CustomContentScreen,
  roulette: RouletteScreen,
  challenge: ChallengeScreen,
  results: ResultsScreen,
}

function LocalRouter({ onGoOnline, onGoAccount, onGoCommunity }) {
  const { state } = useGame()
  const Screen = SCREENS[state.screen] ?? HomeScreen
  return <Screen onGoOnline={onGoOnline} onGoAccount={onGoAccount} onGoCommunity={onGoCommunity} />
}

function AccountRouter({ onExit }) {
  const { user, isLoadingSession } = useAuth()
  if (isLoadingSession) return null
  return user ? <ProfileScreen onBack={onExit} /> : <SignInScreen onBack={onExit} />
}

function CommunityRouter({ onExit }) {
  const [view, setView] = useState('browse') // 'browse' | 'create' | 'moderate'
  if (view === 'create') return <CreateCommunityCardScreen onBack={() => setView('browse')} />
  if (view === 'moderate') return <AdminModerationScreen onBack={() => setView('browse')} />
  return <CommunityScreen onBack={onExit} onCreate={() => setView('create')} onModerate={() => setView('moderate')} />
}

// Microinteracción global: cualquier botón de la app da un click sutil + vibración corta.
// Así no hace falta cablear sonido a cada botón individualmente.
function useGlobalTapFeedback() {
  useEffect(() => {
    function handlePointerDown(e) {
      const btn = e.target.closest('button')
      if (!btn || btn.disabled) return
      playClick()
      vibrate(10)
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [])
}

function AppShell() {
  const [mode, setMode] = useState('local') // 'local' | 'online' | 'account' | 'community'
  useGlobalTapFeedback()

  return (
    <>
      <BackgroundBlobs />
      {mode === 'online' && <OnlineGameScreen onExit={() => setMode('local')} />}
      {mode === 'account' && <AccountRouter onExit={() => setMode('local')} />}
      {mode === 'community' && <CommunityRouter onExit={() => setMode('local')} />}
      {mode === 'local' && (
        <LocalRouter
          onGoOnline={() => setMode('online')}
          onGoAccount={() => setMode('account')}
          onGoCommunity={() => setMode('community')}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppShell />
      </GameProvider>
    </AuthProvider>
  )
}
