import { useAuth } from '../../state/authContext'

export default function SignInScreen({ onBack }) {
  const { signInWithGoogle, signInAsGuest } = useAuth()

  return (
    <div className="screen" style={{ justifyContent: 'center', gap: 24 }}>
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>
          ‹ Volver
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 48 }}>🙋</span>
        <p className="eyebrow" style={{ marginTop: 10 }}>Tu cuenta</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          Guardá tu progreso
        </h2>
        <p className="subtitle" style={{ marginTop: 6 }}>
          Con una cuenta vas a poder personalizar tu avatar y ver tus estadísticas.
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary btn-block" onClick={signInWithGoogle}>
          Continuar con Google
        </button>
        <button className="btn btn-secondary btn-block" onClick={signInAsGuest}>
          Jugar como invitado
        </button>
      </div>

      <p className="subtitle" style={{ textAlign: 'center', fontSize: 12.5 }}>
        Jugar como invitado no requiere datos personales, pero tu progreso queda
        atado a este dispositivo.
      </p>
    </div>
  )
}
