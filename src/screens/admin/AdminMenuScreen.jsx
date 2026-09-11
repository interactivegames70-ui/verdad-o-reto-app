export default function AdminMenuScreen({ onGoContent, onGoModeration, onExit }) {
  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onExit}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Admin</p>
        <h2 className="title" style={{ fontSize: 24 }}>
          Panel oculto
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary btn-block" onClick={onGoContent}>
          Contenido oficial (agregar/editar/quitar)
        </button>
        <button className="btn btn-secondary btn-block" onClick={onGoModeration}>
          Moderar contenido de la comunidad
        </button>
      </div>
    </div>
  )
}
