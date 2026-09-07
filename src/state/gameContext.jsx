import { createContext, useContext, useReducer } from 'react'
import { pickCard } from '../data/content'
import { incrementCardUses } from '../lib/community'

const GameContext = createContext(null)

const DEFAULT_ROUNDS = 3

const initialState = {
  screen: 'home', // home | setup | players | custom | roulette | challenge | results
  group: null, // 'pareja' | 'grupo'
  modality: null, // 'presencial' | 'distancia'
  players: [], // { id, name, score }
  customCards: [], // { id, type: 'truth'|'dare', level, text, timerSeconds }
  totalRounds: 0,
  roundIndex: 0,
  turnQueue: [], // ids pendientes en el ciclo actual, para repartir turnos parejo
  currentPlayerId: null,
  choice: null, // 'truth' | 'dare'
  level: null,
  card: null,
  cardHistory: [],
  statsThisGame: { truths: 0, daresCompleted: 0, daresFailed: 0 },
  communityEnabled: false,
  communityCards: [], // cartas aprobadas de la comunidad, cargadas al activar el toggle
}

function shuffledIds(players) {
  const ids = players.map((p) => p.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids
}

function reducer(state, action) {
  switch (action.type) {
    case 'GO_SETUP':
      return { ...initialState, screen: 'setup' }
    case 'SET_GROUP':
      return { ...state, group: action.group }
    case 'SET_MODALITY':
      return { ...state, modality: action.modality, screen: 'players' }
    case 'ADD_PLAYER': {
      const name = action.name.trim()
      if (!name) return state
      const id = Date.now() + Math.random()
      return { ...state, players: [...state.players, { id, name, score: 0 }] }
    }
    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter((p) => p.id !== action.id) }
    case 'GO_CUSTOM':
      return { ...state, screen: 'custom' }
    case 'BACK_TO_PLAYERS':
      return { ...state, screen: 'players' }
    case 'ADD_CUSTOM_CARD': {
      const text = action.text.trim()
      if (!text) return state
      const card = {
        id: Date.now() + Math.random(),
        type: action.cardType,
        level: action.level,
        text,
        timerSeconds: action.cardType === 'dare' ? action.timerSeconds || 30 : undefined,
      }
      return { ...state, customCards: [...state.customCards, card] }
    }
    case 'REMOVE_CUSTOM_CARD':
      return { ...state, customCards: state.customCards.filter((c) => c.id !== action.id) }
    case 'SET_COMMUNITY_ENABLED':
      return { ...state, communityEnabled: action.enabled, communityCards: action.enabled ? state.communityCards : [] }
    case 'SET_COMMUNITY_CARDS':
      return { ...state, communityCards: action.cards }
    case 'START_GAME':
      return {
        ...state,
        screen: 'roulette',
        totalRounds: state.players.length > 0 ? DEFAULT_ROUNDS : 0,
        roundIndex: 0,
        turnQueue: shuffledIds(state.players),
      }
    case 'SPIN_RESULT': {
      const queue = state.turnQueue.filter((id) => id !== action.playerId)
      return {
        ...state,
        currentPlayerId: action.playerId,
        turnQueue: queue,
        screen: 'challenge',
        choice: null,
        level: null,
        card: null,
      }
    }
    case 'CHOOSE_TYPE':
      return { ...state, choice: action.choice }
    case 'SELECT_LEVEL': {
      const card = pickCard({
        type: state.choice,
        level: action.level,
        modality: state.modality,
        group: state.group,
        history: state.cardHistory,
        customCards: [...state.customCards, ...(state.communityEnabled ? state.communityCards : [])],
      })
      return { ...state, level: action.level, card }
    }
    case 'REDRAW_CARD': {
      const card = pickCard({
        type: state.choice,
        level: state.level,
        modality: state.modality,
        group: state.group,
        history: state.cardHistory,
        customCards: [...state.customCards, ...(state.communityEnabled ? state.communityCards : [])],
      })
      return { ...state, card }
    }
    case 'MARK_RESULT': {
      const players = state.players.map((p) =>
        p.id === state.currentPlayerId && action.fulfilled ? { ...p, score: p.score + 1 } : p
      )
      const cardHistory = state.card ? [...state.cardHistory, state.card.text] : state.cardHistory
      if (state.card?.communityId) incrementCardUses(state.card.communityId) // fire-and-forget
      const statsThisGame = { ...state.statsThisGame }
      if (state.choice === 'truth') statsThisGame.truths += 1
      else if (state.choice === 'dare') {
        if (action.fulfilled) statsThisGame.daresCompleted += 1
        else statsThisGame.daresFailed += 1
      }
      // Una ronda termina cuando ya respondieron todos (la cola de esta ronda queda vacía).
      const roundComplete = state.turnQueue.length === 0
      const nextRoundIndex = roundComplete ? state.roundIndex + 1 : state.roundIndex
      const done = roundComplete && nextRoundIndex >= state.totalRounds
      const nextTurnQueue = roundComplete && !done ? shuffledIds(players) : state.turnQueue
      return {
        ...state,
        players,
        cardHistory,
        roundIndex: nextRoundIndex,
        turnQueue: nextTurnQueue,
        screen: done ? 'results' : 'roulette',
        statsThisGame,
      }
    }
    case 'PLAY_AGAIN':
      return {
        ...initialState,
        screen: 'setup',
      }
    case 'GO_HOME':
      return { ...initialState }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider')
  return ctx
}
