import { useState, useRef, useEffect } from 'react'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'

function VistaFicha() {
 const { elementoSeleccionado, limpiarSeleccion } = useCodice()
 const { metadatos, contenido } = elementoSeleccionado
 const reglas = metadatos.reglas || {}

 return (
 <VentanaFlotante
 titulo={` ${metadatos.nombre || 'Ficha'}`}
 onClose={limpiarSeleccion}
 >
 <div className="w-80 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
 <div className="px-5 py-4 space-y-5">
 {/* Encabezado */}
 <div>
 <h2 className="text-base font-serif font-bold text-gothic-gold-light leading-tight tracking-wide">
 {metadatos.nombre || 'Sin nombre'}
 </h2>
 {metadatos.tipo && (
 <span className="etiqueta-tipo mt-2">{metadatos.tipo}</span>
 )}
 </div>

 {/* Reglas — estilo estadísticas RPG */}
 {Object.keys(reglas).length > 0 && (
 <div>
 <h3 className="text-xs tracking-[0.2em] text-gothic-gold/50 uppercase font-serif mb-2
 border-b border-gothic-gold/20 pb-1">
 Estadísticas
 </h3>
 <div className="divide-y divide-gothic-gold/15 border border-gothic-gold/20
 bg-gothic-bg/50 rounded-sm">
 {Object.entries(reglas).map(([clave, valor]) => (
 <div
 key={clave}
 className="flex items-center justify-between px-3 py-2"
 >
 <span className="text-xs text-gothic-parchment/60 capitalize font-serif">
 {clave.replace(/_/g, ' ')}
 </span>
 <span className="text-xs font-mono font-bold text-gothic-gold-light">
 {String(valor)}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Lore */}
 {contenido && (
 <div>
 <h3 className="text-xs tracking-[0.2em] text-gothic-gold/50 uppercase font-serif mb-2
 border-b border-gothic-gold/20 pb-1">
 Leyenda
 </h3>
 <div className="text-xs text-gothic-parchment/70 leading-relaxed whitespace-pre-wrap font-serif italic">
 {contenido}
 </div>
 </div>
 )}

 {/* Volver al índice */}
 <button
 onClick={limpiarSeleccion}
 className="w-full py-2 rounded-sm text-xs tracking-wider
 border border-gothic-gold/30 text-gothic-gold/60
 hover:text-gothic-gold-light hover:border-gothic-gold/50
 hover:bg-gothic-gold/5 transition-all duration-150 font-serif"
 >
 ← Volver al Códice
 </button>
 </div>
 </div>
 </VentanaFlotante>
 )
}

function RegistroForm({ rutaProyecto, onCompletado }) {
 const { crearNuevoElemento } = useCodice()
 const [nombre, setNombre] = useState('')
 const [tipo, setTipo] = useState('items')
 const inputRef = useRef(null)

 useEffect(() => {
 if (inputRef.current) inputRef.current.focus()
 }, [])

 const handleCrear = async () => {
 if (!nombre.trim()) return
 await crearNuevoElemento(nombre.trim(), tipo)
 onCompletado()
 }

 return (
 <div className="px-4 pt-3 pb-4 border-b border-gothic-gold/20" onClick={(e) => e.stopPropagation()}>
 <h3 className="text-xs tracking-[0.2em] text-gothic-gold/60 uppercase font-serif mb-3">
 Nuevo Registro
 </h3>

 <input
 ref={inputRef}
 type="text"
 value={nombre}
 onChange={(e) => setNombre(e.target.value)}
 onKeyDown={(e) => { if (e.key === 'Enter') handleCrear(); if (e.key === 'Escape') onCompletado() }}
 placeholder="Nombre del elemento..."
 className="w-full px-3 py-1.5 rounded-sm text-xs bg-gothic-bg
 border border-gothic-gold/40 text-gothic-parchment
 placeholder:text-gothic-gold/30 outline-none
 focus:border-gothic-gold/70 transition-colors font-serif mb-2"
 />

 <div className="flex gap-2 mb-3">
 <button
 onClick={() => setTipo('items')}
 className={`flex-1 py-1.5 rounded-sm text-xs tracking-wider uppercase font-serif
 border transition-all duration-150
 ${tipo === 'items'
 ? 'border-gothic-gold/60 text-gothic-gold-light bg-gothic-gold/15'
 : 'border-gothic-gold/20 text-gothic-gold/50 hover:border-gothic-gold/40'}`}
 >
 🏹 Ítem
 </button>
 <button
 onClick={() => setTipo('personajes')}
 className={`flex-1 py-1.5 rounded-sm text-xs tracking-wider uppercase font-serif
 border transition-all duration-150
 ${tipo === 'personajes'
 ? 'border-gothic-gold/60 text-gothic-gold-light bg-gothic-gold/15'
 : 'border-gothic-gold/20 text-gothic-gold/50 hover:border-gothic-gold/40'}`}
 >
 Personaje
 </button>
 </div>

 <div className="flex gap-1.5">
 <button
 onClick={handleCrear}
 disabled={!nombre.trim()}
 className="flex-1 py-1.5 rounded-sm text-xs tracking-wider uppercase
 border border-gothic-gold/40 text-gothic-gold-light
 bg-gothic-gold/10 hover:bg-gothic-gold/20
 disabled:opacity-40 disabled:cursor-not-allowed
 transition-all duration-150 font-serif"
 >
 Crear
 </button>
 <button
 onClick={onCompletado}
 className="py-1.5 px-3 rounded-sm text-xs tracking-wider uppercase
 border border-gothic-blood/40 text-gothic-parchment/50
 hover:text-gothic-parchment hover:border-gothic-blood/60
 transition-all duration-150 font-serif"
 >
 Cancelar
 </button>
 </div>
 </div>
 )
}

function VistaIndice() {
 const { indexProyecto, seleccionarElemento, rutaProyecto } = useCodice()
 const { items, personajes } = indexProyecto
 const [registrando, setRegistrando] = useState(false)

 return (
 <VentanaFlotante
 titulo=" CÓDICE"
 >
 <div className="w-80 flex flex-col" style={{ maxHeight: 'calc(100vh - 40px)' }}>
 {registrando && (
 <RegistroForm
 rutaProyecto={rutaProyecto}
 onCompletado={() => setRegistrando(false)}
 />
 )}

 <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
 {/* Ítems — Artefactos y Hechizos */}
 <section>
 <h3 className="text-xs tracking-[0.2em] text-gothic-gold/60 uppercase font-serif mb-3
 flex items-center justify-between
 border-b border-gothic-gold/20 pb-1.5">
 <span>Artefactos</span>
 <span className="text-gothic-gold/40 text-xs">{items.length}</span>
 </h3>
 {items.length === 0 ? (
 <p className="text-xs text-gothic-parchment/40 italic text-center pt-3 font-serif">
 No hay artefactos registrados en el códice
 </p>
 ) : (
 <div className="space-y-1 -mx-1">
 {items.map((item) => (
 <button
 key={item.archivo}
 onClick={() => seleccionarElemento(item)}
 className="item-lista-gotico"
 >
 <span className="block truncate text-xs font-serif">
 {item.metadatos.nombre || item.archivo}
 </span>
 {item.metadatos.tipo && (
 <span className="text-xs text-gothic-gold/40 font-mono tracking-wider">
 {item.metadatos.tipo}
 </span>
 )}
 </button>
 ))}
 </div>
 )}
 </section>

 {/* Personajes — Heroes y Villanos */}
 <section>
 <h3 className="text-xs tracking-[0.2em] text-gothic-gold/60 uppercase font-serif mb-3
 flex items-center justify-between
 border-b border-gothic-gold/20 pb-1.5">
 <span>Personajes</span>
 <span className="text-gothic-gold/40 text-xs">{personajes.length}</span>
 </h3>
 {personajes.length === 0 ? (
 <p className="text-xs text-gothic-parchment/40 italic text-center pt-3 font-serif">
 No hay personajes en el códice
 </p>
 ) : (
 <div className="space-y-1 -mx-1">
 {personajes.map((p) => (
 <button
 key={p.archivo}
 onClick={() => seleccionarElemento(p)}
 className="item-lista-gotico"
 >
 <span className="block truncate text-xs font-serif">
 {p.metadatos.nombre || p.archivo}
 </span>
 </button>
 ))}
 </div>
 )}
 </section>
 </div>

 {/* Registrar en el Códice */}
 <div className="px-4 py-3 border-t border-gothic-gold/20">
 <button
 onClick={() => {
 if (!rutaProyecto) return
 setRegistrando(!registrando)
 }}
 disabled={!rutaProyecto}
 className="w-full py-1.5 rounded-sm text-xs tracking-wider
 text-gothic-gold/60 hover:text-gothic-gold-light
 hover:bg-gothic-gold/5
 disabled:opacity-30 disabled:cursor-not-allowed
 transition-all duration-150 font-serif"
 >
 Registrar en el Códice
 </button>
 </div>
 </div>
 </VentanaFlotante>
 )
}

export default function PanelContextualGotico() {
 const { elementoSeleccionado } = useCodice()

 if (elementoSeleccionado) {
 return <VistaFicha />
 }

 return <VistaIndice />
}
