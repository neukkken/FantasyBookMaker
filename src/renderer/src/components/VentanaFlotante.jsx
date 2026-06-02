export default function VentanaFlotante({
  titulo,
  onClose,
  children,
  className = '',
  sinScroll = false
}) {
  return (
    <div className={`panel-gotico font-serif flex flex-col min-h-0 ${className}`}>
      <div className="titlebar-gotico cursor-default">
        <span className="text-xs tracking-[0.2em] text-gothic-gold-light font-serif">
          {titulo}
        </span>
        {onClose && (
          <button onClick={onClose} className="btn-cerrar">
            ✕
          </button>
        )}
      </div>
      <div className={`flex-1 min-h-0 ${sinScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>{children}</div>
    </div>
  )
}
