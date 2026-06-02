import { useState, useMemo } from 'react'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'
import Icono from './Icono'
import ModalCodice from './ModalCodice'

function EventoCard({ evento, onClick }) {
  const desc = (evento.contenido || '').replace(/<[^>]+>/g, '').trim().slice(0, 120)
  const fecha = evento.metadatos?.fecha || '—'

  return (
    <div className="group relative pl-8 pb-6">
      {/* Conector vertical */}
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-gothic-gold/15" />
      {/* Punto conector */}
      <div className="absolute left-1 top-2 w-3.5 h-3.5 rounded-full border-2 border-gothic-gold/60 bg-gothic-bg flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-gothic-gold/80" />
      </div>

      {/* Fecha */}
      <div className="text-[10px] font-mono text-gothic-gold/50 mb-0.5">{fecha}</div>

      {/* Card */}
      <button onClick={() => onClick(evento)}
        className="w-full text-left px-3.5 py-2.5 rounded-sm border border-gothic-gold/10 bg-gothic-surface/40
                   hover:bg-gothic-gold/5 hover:border-gothic-gold/25 transition-all duration-150">
        <div className="flex items-center gap-2 mb-1">
          <Icono tipo="historia" size={16} />
          <span className="text-sm font-serif text-gothic-parchment/80 group-hover:text-gothic-gold-light transition-colors">
            {evento.metadatos?.nombre || evento.archivo}
          </span>
        </div>
        {desc && (
          <p className="text-[11px] text-gothic-parchment/40 font-serif leading-relaxed truncate">
            {desc}{desc.length >= 120 ? '...' : ''}
          </p>
        )}
      </button>
    </div>
  )
}

export default function PanelTimeline() {
  const { indexProyecto, seleccionarElemento, CATEGORIAS, ETIQUETAS, ICONOS, relacionesConfig } = useCodice()
  const [erasExpandidas, setErasExpandidas] = useState({})
  const [modalElemento, setModalElemento] = useState(null)
  const [modalKey, setModalKey] = useState(0)

  const eventos = indexProyecto?.historia || []

  const agrupado = useMemo(() => {
    const grupos = {}
    for (const ev of eventos) {
      const era = ev.metadatos?.era || 'Sin era'
      if (!grupos[era]) grupos[era] = []
      grupos[era].push(ev)
    }
    for (const era of Object.keys(grupos)) {
      grupos[era].sort((a, b) => {
        const fa = a.metadatos?.fecha || ''
        const fb = b.metadatos?.fecha || ''
        return fa.localeCompare(fb, undefined, { numeric: true })
      })
    }
    const entradas = Object.entries(grupos)
    const ordenEras = { 'Sin era': Infinity }
    entradas.sort((a, b) => (ordenEras[a[0]] ?? 0) - (ordenEras[b[0]] ?? 0))
    return entradas
  }, [eventos])

  const handleAbrirModal = async (el) => {
    await seleccionarElemento(el)
    setModalElemento(el)
    setModalKey((k) => k + 1)
  }

  const totalEventos = eventos.length

  return (
    <VentanaFlotante titulo="LÍNEA DE TIEMPO">
      <div className="h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-2 border-b border-gothic-gold/15 shrink-0">
          <p className="text-[10px] text-gothic-gold/40 font-serif tracking-wider">
            {totalEventos > 0
              ? `${totalEventos} evento${totalEventos !== 1 ? 's' : ''} históricos en ${agrupado.length} era${agrupado.length !== 1 ? 's' : ''}`
              : 'Aún no hay eventos históricos. Créalos en el Códice.'}
          </p>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {totalEventos === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gothic-parchment/30 italic font-lectura">
                Crea entradas en la categoría <strong className="text-gothic-gold/60">Historia</strong> del Códice para ver la línea de tiempo.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {agrupado.map(([era, evs]) => {
                const expandida = erasExpandidas[era] !== false
                return (
                  <div key={era} className="mb-6 last:mb-0">
                    {/* Era header */}
                    <button onClick={() => setErasExpandidas(p => ({ ...p, [era]: !expandida }))}
                      className="flex items-center gap-2 mb-3 text-xs tracking-[0.15em] uppercase font-serif
                                 text-gothic-gold/80 hover:text-gothic-gold-light transition-colors">
                      <span className={`transform transition-transform ${expandida ? 'rotate-90' : ''}`}>▸</span>
                      {era}
                      <span className="text-gothic-gold/30 text-[10px] font-normal normal-case">({evs.length})</span>
                    </button>

                    {expandida && (
                      <div className="ml-2">
                        {evs.map((ev) => (
                          <EventoCard key={ev.ruta} evento={ev} onClick={handleAbrirModal} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalElemento && (
        <ModalCodice key={modalKey} elementoSeleccionado={modalElemento}
          relacionesConfig={relacionesConfig}
          onClose={() => setModalElemento(null)} />
      )}
    </VentanaFlotante>
  )
}
