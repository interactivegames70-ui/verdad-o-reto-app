import { useEffect, useState } from 'react'
import {
  fetchPublicProfile,
  fetchPublicCardsFor,
  fetchFollowCounts,
  isFollowing,
  followUser,
  unfollowUser,
} from '../../lib/social'

const TYPE_LABEL = { truth: 'Verdad', dare: 'Reto' }

export default function PublicProfileScreen({ userId, currentUserId, onBack, onRequireSignIn }) {
  const [profile, setProfile] = useState(null)
  const [cards, setCards] = useState([])
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const [followBusy, setFollowBusy] = useState(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setLoadError(true)
      setDebugInfo('No se recibió un id de usuario para abrir el perfil.')
      return
    }
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    Promise.all([
      fetchPublicProfile(userId),
      fetchPublicCardsFor(userId),
      fetchFollowCounts(userId),
      currentUserId ? isFollowing(currentUserId, userId) : Promise.resolve(false),
    ])
      .then(([{ data: p, error: profileError }, { data: c }, followCounts, isFollow]) => {
        if (cancelled) return
        if (profileError || !p) {
          console.error('No se pudo cargar el perfil público', { userId, profileError })
          setDebugInfo(profileError?.message || `No existe un perfil con id ${userId}`)
          setLoadError(true)
          return
        }
        setProfile(p)
        setCards(c ?? [])
        setCounts(followCounts ?? { followers: 0, following: 0 })
        setFollowing(!!isFollow)
      })
      .catch((err) => {
        console.error('Error cargando perfil público', err)
        if (!cancelled) {
          setDebugInfo(err?.message || String(err))
          setLoadError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId, currentUserId])

  async function handleToggleFollow() {
    if (!currentUserId) {
      onRequireSignIn?.()
      return
    }
    if (followBusy) return
    setFollowBusy(true)
    if (following) {
      const { error } = await unfollowUser(currentUserId, userId)
      if (!error) {
        setFollowing(false)
        setCounts((c) => ({ ...c, followers: Math.max(0, c.followers - 1) }))
      }
    } else {
      const { error } = await followUser(currentUserId, userId)
      if (!error) {
        setFollowing(true)
        setCounts((c) => ({ ...c, followers: c.followers + 1 }))
      }
    }
    setFollowBusy(false)
  }

  if (loading) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className="subtitle">Cargando perfil…</p>
      </div>
    )
  }

  if (loadError || !profile) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <p className="subtitle" style={{ textAlign: 'center' }}>
          No pudimos cargar este perfil. Puede que ya no exista o que falle la conexión.
        </p>
        {debugInfo && (
          <p className="subtitle" style={{ textAlign: 'center', fontSize: 11, opacity: 0.6 }}>
            {debugInfo}
          </p>
        )}
        <button className="btn btn-secondary" onClick={onBack}>
          ‹ Volver
        </button>
      </div>
    )
  }

  const likesReceived = cards.reduce((sum, c) => sum + (c.likes_count || 0), 0)
  const truthsUploaded = cards.filter((c) => c.type === 'truth').length
  const daresUploaded = cards.filter((c) => c.type === 'dare').length

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>
          ‹ Volver
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: profile.avatar_color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto',
            border: '3px solid rgba(255,255,255,0.2)',
          }}
        >
          {profile.avatar_emoji}
        </div>
        <h2 className="title" style={{ fontSize: 22, marginTop: 10 }}>
          {profile.username}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 6 }}>
          <span className="subtitle">
            <strong style={{ color: 'var(--text-primary)' }}>{counts.followers}</strong> seguidores
          </span>
          <span className="subtitle">
            <strong style={{ color: 'var(--text-primary)' }}>{counts.following}</strong> siguiendo
          </span>
        </div>
      </div>

      {userId !== currentUserId && (
        <button
          className={following ? 'btn btn-secondary btn-block' : 'btn btn-primary btn-block'}
          disabled={followBusy}
          onClick={handleToggleFollow}
        >
          {following ? 'Dejar de seguir' : 'Seguir'}
        </button>
      )}

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>
          Contribuciones a la comunidad{cards.length > 0 ? ` (${cards.length})` : ''}
        </p>
        {cards.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div className="card" style={{ flex: 1, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>❤️ {likesReceived}</div>
              <div className="subtitle" style={{ fontSize: 11 }}>Likes recibidos</div>
            </div>
            <div className="card" style={{ flex: 1, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>🗣️ {truthsUploaded}</div>
              <div className="subtitle" style={{ fontSize: 11 }}>Preguntas subidas</div>
            </div>
            <div className="card" style={{ flex: 1, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>🔥 {daresUploaded}</div>
              <div className="subtitle" style={{ fontSize: 11 }}>Retos subidos</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cards.length === 0 && (
            <p className="subtitle" style={{ textAlign: 'center' }}>Todavía no subió nada a la comunidad.</p>
          )}
          {cards.map((c) => (
            <div key={c.id} className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13.5 }}>
                <strong>{TYPE_LABEL[c.type]} · N{c.level}</strong>
                <br />
                {c.text}
              </span>
              <span className="subtitle" style={{ fontSize: 12, textAlign: 'right' }}>
                ❤️ {c.likes_count} · usada {c.uses_count} veces
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
