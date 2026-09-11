import { useState } from 'react'
import { useAuth, AVATAR_EMOJIS, AVATAR_COLORS } from '../../state/authContext'

export default function ProfileScreen({ onBack }) {
  const { profile, loadingProfile, updateProfile, signOut } = useAuth()
  const [name, setName] = useState(profile?.username ?? '')
  const [emoji, setEmoji] = useState(profile?.avatar_emoji ?? AVATAR_EMOJIS[0])
  const [color, setColor] = useState(profile?.avatar_color ?? AVATAR_COLORS[0])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (loadingProfile || !profile) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className="subtitle">Cargando tu perfil…</p>
      </div>
    )
  }

  const dirty = name.trim() !== profile.username || emoji !== profile.avatar_emoji || color !== profile.avatar_color

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    await updateProfile({ username: name.trim(), avatar_emoji: emoji, avatar_color: color })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const stats = [
    { label: 'Partidas jugadas', value: profile.games_played },
    { label: 'Verdades respondidas', value: profile.truths_answered },
    { label: 'Retos cumplidos', value: profile.dares_completed },
    { label: 'Retos no cumplidos', value: profile.dares_failed },
    { label: 'Puntos acumulados', value: profile.points_total },
  ]

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
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto',
            border: '3px solid rgba(255,255,255,0.2)',
          }}
        >
          {emoji}
        </div>
        {profile.is_anonymous && (
          <p className="subtitle" style={{ marginTop: 10, fontSize: 12.5 }}>
            Estás jugando como invitado. Tu progreso queda atado a este dispositivo.
          </p>
        )}
      </div>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>Nombre de usuario</p>
        <input className="text-input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>Avatar</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {AVATAR_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                fontSize: 22,
                background: e === emoji ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
                border: e === emoji ? '2px solid var(--accent-pink)' : '1.5px solid rgba(255,255,255,0.1)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: c,
                border: c === color ? '3px solid #fff' : '1.5px solid rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-block" disabled={!dirty || !name.trim() || saving} onClick={handleSave}>
        {saving ? 'Guardando…' : saved ? '¡Guardado! ✓' : 'Guardar cambios'}
      </button>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>Estadísticas</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="card"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span className="label" style={{ fontSize: 14 }}>{s.label}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-secondary btn-block" onClick={signOut}>
        Cerrar sesión
      </button>
    </div>
  )
}
