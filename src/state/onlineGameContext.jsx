import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getClientId } from '../lib/clientId'
import { pickCard } from '../data/content'

const OnlineGameContext = createContext(null)

const DEFAULT_ROUNDS = 3

const emptyGameState = {
  screen: 'roulette', // roulette | challenge | results
  totalRounds: DEFAULT_ROUNDS,
  roundIndex: 0,
  turnQueue: [],
  currentPlayerId: null,
  choice: null,
  level: null,
  card: null,
  fulfilled: null,
  cardHistory: [],
}

function shuffledIds(ids) {
  const arr = [...ids]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function makeRoomCode() {
  // sin caracteres ambiguos (0/O, 1/I) para que sea fácil de dictar/tipear
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function OnlineGameProvider({ children }) {
  const clientId = getClientId()
  const [status, setStatus] = useState('idle') // idle | home | lobby | playing | error
  const [error, setError] = useState(null)
  const [room, setRoom] = useState(null) // fila de la tabla rooms
  const [players, setPlayers] = useState([]) // filas de room_players
  const channelRef = useRef(null)

  const isHost = !!room && room.host_client_id === clientId
  const gameState = room?.state ?? emptyGameState
  const me = players.find((p) => p.client_id === clientId) ?? null
  const isMyTurn = !!room && gameState.currentPlayerId === clientId

  const subscribeToRoom = useCallback((roomId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setError('El anfitrión cerró la partida.')
          setStatus('home')
          setRoom(null)
          return
        }
        setRoom(payload.new)
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => {
          refreshPlayers(roomId)
        }
      )
      .subscribe()
    channelRef.current = channel
  }, [])

  async function refreshPlayers(roomId) {
    const { data } = await supabase.from('room_players').select('*').eq('room_id', roomId).order('joined_at')
    if (data) setPlayers(data)
  }

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  async function createRoom({ hostName, group }) {
    setError(null)
    let code = makeRoomCode()
    let insertedRoom = null
    for (let attempt = 0; attempt < 5 && !insertedRoom; attempt++) {
      const { data, error: insertError } = await supabase
        .from('rooms')
        .insert({ code, host_client_id: clientId, group_mode: group, status: 'lobby', state: emptyGameState })
        .select()
        .single()
      if (!insertError) {
        insertedRoom = data
      } else if (insertError.code === '23505') {
        code = makeRoomCode() // colisión de código, reintenta
      } else {
        setError('No se pudo crear la sala. Intentá de nuevo.')
        setStatus('error')
        return
      }
    }
    if (!insertedRoom) {
      setError('No se pudo generar un código de sala único. Intentá de nuevo.')
      setStatus('error')
      return
    }
    const { data: playerRow, error: playerError } = await supabase
      .from('room_players')
      .insert({ room_id: insertedRoom.id, client_id: clientId, name: hostName.trim(), is_host: true })
      .select()
      .single()
    if (playerError) {
      setError('No se pudo unir al anfitrión a la sala.')
      setStatus('error')
      return
    }
    setRoom(insertedRoom)
    setPlayers([playerRow])
    subscribeToRoom(insertedRoom.id)
    setStatus('lobby')
  }

  async function joinRoom({ code, name }) {
    setError(null)
    const normalized = code.trim().toUpperCase()
    const { data: foundRoom, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', normalized)
      .maybeSingle()
    if (findError || !foundRoom) {
      setError('No encontramos ninguna sala con ese código.')
      return
    }
    if (foundRoom.status === 'finished') {
      setError('Esa partida ya terminó.')
      return
    }
    // reconexión: si este dispositivo ya estaba en la sala, no crea un jugador duplicado
    const { data: existing } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', foundRoom.id)
      .eq('client_id', clientId)
      .maybeSingle()

    if (!existing) {
      const { error: insertError } = await supabase
        .from('room_players')
        .insert({ room_id: foundRoom.id, client_id: clientId, name: name.trim() })
      if (insertError) {
        setError('No se pudo unir a la sala. Intentá de nuevo.')
        return
      }
    }

    await refreshPlayers(foundRoom.id)
    setRoom(foundRoom)
    subscribeToRoom(foundRoom.id)
    setStatus(foundRoom.status === 'lobby' ? 'lobby' : 'playing')
  }

  async function leaveRoom() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    if (room && me) {
      if (isHost) {
        await supabase.from('rooms').delete().eq('id', room.id)
      } else {
        await supabase.from('room_players').delete().eq('id', me.id)
      }
    }
    setRoom(null)
    setPlayers([])
    setStatus('home')
  }

  async function updateState(patch) {
    if (!room) return
    const nextState = { ...gameState, ...patch }
    await supabase.from('rooms').update({ state: nextState }).eq('id', room.id)
  }

  // --- Acciones del host: controla el flujo general de la partida ---
  async function startGame() {
    if (!isHost || !room) return
    const ids = players.map((p) => p.client_id)
    await supabase
      .from('rooms')
      .update({
        status: 'playing',
        state: {
          ...emptyGameState,
          totalRounds: ids.length > 0 ? DEFAULT_ROUNDS : 0,
          turnQueue: shuffledIds(ids),
        },
      })
      .eq('id', room.id)
    setStatus('playing')
  }

  async function spinResult(playerId) {
    if (!isHost) return
    const queue = gameState.turnQueue.filter((id) => id !== playerId)
    await updateState({
      currentPlayerId: playerId,
      turnQueue: queue,
      screen: 'challenge',
      choice: null,
      level: null,
      card: null,
      fulfilled: null,
    })
  }

  // --- Acciones de quien tiene el turno: elige personalmente verdad/reto, nivel y si lo cumplió ---
  async function chooseType(choice) {
    if (!isMyTurn) return
    await updateState({ choice })
  }

  async function selectLevel(level) {
    if (!isMyTurn) return
    const card = pickCard({
      type: gameState.choice,
      level,
      modality: 'distancia',
      group: room.group_mode,
      history: gameState.cardHistory,
      customCards: [],
    })
    await updateState({ level, card })
  }

  async function redrawCard() {
    if (!isMyTurn || !gameState.level) return
    const card = pickCard({
      type: gameState.choice,
      level: gameState.level,
      modality: 'distancia',
      group: room.group_mode,
      history: gameState.cardHistory,
      customCards: [],
    })
    await updateState({ card })
  }

  async function setFulfilled(fulfilled) {
    if (!isMyTurn) return
    await updateState({ fulfilled })
  }

  // --- Acción del host: aplica el puntaje del turno actual y avanza ---
  async function nextTurn() {
    if (!isHost || !room) return
    if (gameState.fulfilled) {
      const current = players.find((p) => p.client_id === gameState.currentPlayerId)
      if (current) {
        await supabase.from('room_players').update({ score: current.score + 1 }).eq('id', current.id)
      }
    }
    const cardHistory = gameState.card ? [...gameState.cardHistory, gameState.card.text] : gameState.cardHistory
    // Una ronda termina cuando ya respondieron todos (la cola de esta ronda queda vacía).
    const roundComplete = gameState.turnQueue.length === 0
    const nextRoundIndex = roundComplete ? gameState.roundIndex + 1 : gameState.roundIndex
    const done = roundComplete && nextRoundIndex >= gameState.totalRounds
    const nextTurnQueue = roundComplete && !done ? shuffledIds(players.map((p) => p.client_id)) : gameState.turnQueue
    await updateState({
      cardHistory,
      roundIndex: nextRoundIndex,
      turnQueue: nextTurnQueue,
      screen: done ? 'results' : 'roulette',
      currentPlayerId: null,
      choice: null,
      level: null,
      card: null,
      fulfilled: null,
    })
    if (done) await supabase.from('rooms').update({ status: 'finished' }).eq('id', room.id)
  }

  async function playAgain() {
    if (!isHost || !room) return
    await supabase.from('room_players').update({ score: 0 }).eq('room_id', room.id).neq('score', 0)
    await startGame()
  }

  const value = {
    clientId,
    status,
    setStatus,
    error,
    setError,
    room,
    players,
    isHost,
    me,
    isMyTurn,
    gameState,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    spinResult,
    chooseType,
    selectLevel,
    redrawCard,
    setFulfilled,
    nextTurn,
    playAgain,
  }

  return <OnlineGameContext.Provider value={value}>{children}</OnlineGameContext.Provider>
}

export function useOnlineGame() {
  const ctx = useContext(OnlineGameContext)
  if (!ctx) throw new Error('useOnlineGame debe usarse dentro de OnlineGameProvider')
  return ctx
}
