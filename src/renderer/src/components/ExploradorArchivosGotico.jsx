import { useState, useEffect, useRef } from 'react'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'
import Icono from './Icono'
import ModalCodice from './ModalCodice'

function FormularioCrear({ categoria, onCancelar }) {
  const { crearNuevoElemento, ETIQUETAS, ICONOS } = useCodice()
  const [nombre, setNombre] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (inputRef.current) inputRef.current.focus() }, [])

  const handleCrear = async () => {
    if (!nombre.trim()) return
    await crearNuevoElemento(nombre.trim(), categoria)
    onCancelar()
  }

  return (
    <div className="px-3 py-2 border-t border-gothic-gold/20 bg-gothic-bg/80">
      <input ref={inputRef} type="text" value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCrear(); if (e.key === 'Escape') onCancelar() }}
        placeholder="Nombre..." autoFocus
        className="w-full px-2 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/30 text-gothic-parchment placeholder:text-gothic-gold/30 outline-none focus:border-gothic-gold/70 font-serif mb-1.5" />
      <div className="flex gap-1">
        <button onClick={handleCrear} disabled={!nombre.trim()}
          className="flex-1 py-1 rounded-sm text-xs tracking-wider uppercase border border-gothic-gold/40 text-gothic-gold-light bg-gothic-gold/10 hover:bg-gothic-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-serif">Crear</button>
        <button onClick={onCancelar}
          className="py-1 px-2 rounded-sm text-xs tracking-wider uppercase border border-gothic-blood/40 text-gothic-parchment/50 hover:text-gothic-parchment transition-all font-serif">X</button>
      </div>
    </div>
  )
}

export default function ExploradorArchivosGotico({ noPanel }) {
  const {
    indexProyecto, seleccionarElemento, eliminarElemento, rutaProyecto,
    CATEGORIAS, ETIQUETAS, ICONOS, relacionesConfig
  } = useCodice()

  const [creandoEn, setCreandoEn] = useState(null)
  const [eliminandoRuta, setEliminandoRuta] = useState(null)
  const [modalElemento, setModalElemento] = useState(null)
  const [modalKey, setModalKey] = useState(0)

  const handleAbrirModal = async (el) => {
    await seleccionarElemento(el)
    setModalElemento(el)
    setModalKey((k) => k + 1)
  }

  const handleCerrarModal = (guardado) => {
    setModalElemento(null)
  }

  const contenido = (
    <div className="h-full flex flex-col min-h-0">
      {/** Scroll de categorias */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {CATEGORIAS.map((cat) => {
          const elementos = indexProyecto[cat] || []
          const activo = creandoEn === cat

          return (
            <section key={cat}>
              {/** Header */}
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs tracking-[0.15em] uppercase text-gothic-gold/70 font-serif flex items-center gap-1.5">
                  <Icono tipo={cat} size={16} /> {ETIQUETAS[cat]}
                  <span className="text-gothic-gold/40 text-xs">({elementos.length})</span>
                </h2>
                <button onClick={() => setCreandoEn(activo ? null : cat)}
                  className="w-6 h-6 flex items-center justify-center rounded-sm text-gothic-gold/50 hover:text-gothic-gold-light hover:bg-gothic-gold/10 transition-all text-sm leading-none"
                  title={`Crear en ${ETIQUETAS[cat]}`}>+</button>
              </div>

              {/** Cards */}
              {elementos.length === 0 ? (
                <p className="text-xs text-gothic-parchment/25 italic font-serif text-center py-4">Vacío</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {elementos.map((el) => {
                    const esEliminando = eliminandoRuta === el.ruta
                    if (esEliminando) {
                      return (
                        <div key={el.ruta} className="flex items-center gap-1 px-3 py-2 rounded-sm border border-gothic-blood/40 bg-gothic-blood/5">
                          <span className="text-xs text-gothic-blood font-serif">¿Eliminar?</span>
                          <button onClick={async () => { await eliminarElemento(el.ruta); setEliminandoRuta(null) }}
                            className="px-1.5 py-0.5 rounded-sm text-xs uppercase bg-gothic-blood/20 text-gothic-parchment hover:bg-gothic-blood/40 font-serif">Sí</button>
                          <button onClick={() => setEliminandoRuta(null)}
                            className="px-1.5 py-0.5 rounded-sm text-xs uppercase text-gothic-parchment/50 hover:text-gothic-parchment font-serif">No</button>
                        </div>
                      )
                    }
                    return (
                        <div key={el.ruta} className="group relative w-[220px]">
                        <button onClick={() => handleAbrirModal(el)}
                          className="w-full text-left px-4 py-3 rounded-sm border border-gothic-gold/10 bg-gothic-surface/40 hover:bg-gothic-gold/5 hover:border-gothic-gold/25 transition-all duration-150 h-full">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <Icono tipo={cat} size={18} />
                              <span className="text-sm font-serif text-gothic-parchment/80 group-hover:text-gothic-gold-light truncate">
                                {el.metadatos?.nombre || el.archivo}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-gothic-gold/30 font-serif self-start px-2 py-0.5 rounded-sm bg-gothic-gold/5">
                              {ETIQUETAS[cat]}
                            </span>
                          </div>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEliminandoRuta(el.ruta) }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded-sm text-gothic-parchment/30 hover:text-gothic-blood-light transition-all text-[9px]">
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/** Crear inline */}
              {activo && <FormularioCrear categoria={cat} onCancelar={() => setCreandoEn(null)} />}
            </section>
          )
        })}
      </div>
    </div>
  )

  if (noPanel) {
    return (
      <>
        {contenido}
        {modalElemento && (
          <ModalCodice key={modalKey} elementoSeleccionado={modalElemento}
            relacionesConfig={relacionesConfig}
            onClose={() => setModalElemento(null)} />
        )}
      </>
    )
  }

  return (
    <VentanaFlotante titulo="CÓDICE">
      {contenido}
      {modalElemento && (
        <ModalCodice key={modalKey} elementoSeleccionado={modalElemento}
          relacionesConfig={relacionesConfig}
          onClose={() => setModalElemento(null)} />
      )}
    </VentanaFlotante>
  )
}
