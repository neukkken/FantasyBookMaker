import { useCodice } from '../context/CodiceContext'

export default function PanelContextual() {
 const { indexProyecto, elementoSeleccionado, seleccionarElemento, limpiarSeleccion } =
 useCodice()

 /* ── Vista Ficha ── */
 if (elementoSeleccionado) {
 const { metadatos, contenido } = elementoSeleccionado
 const reglas = metadatos.reglas || {}

 return (
 <aside className="w-80 h-screen bg-surface border-l border-surface-border flex flex-col shrink-0">
 {/* Header con volver */}
 <div className="px-5 pt-5 pb-3 border-b border-surface-border">
 <button
 onClick={limpiarSeleccion}
 className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
 >
 <span className="text-xs">←</span> Volver al Índice
 </button>
 </div>

 {/* Contenido scrolleable */}
 <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
 {/* Nombre */}
 <div>
 <h2 className="text-base font-bold text-neutral-100 leading-tight">
 {metadatos.nombre || 'Sin nombre'}
 </h2>
 {metadatos.tipo && (
 <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-accent-purple/15 text-accent-purple border border-accent-purple/20">
 {metadatos.tipo}
 </span>
 )}
 </div>

 {/* Reglas */}
 {Object.keys(reglas).length > 0 && (
 <div>
 <h3 className="text-xs font-semibold tracking-[0.15em] text-neutral-500 uppercase mb-2">
 Reglas
 </h3>
 <div className="bg-surface-lighter rounded border border-surface-border divide-y divide-surface-border">
 {Object.entries(reglas).map(([clave, valor]) => (
 <div
 key={clave}
 className="flex items-center justify-between px-3 py-2"
 >
 <span className="text-xs text-neutral-400 capitalize">
 {clave.replace(/_/g, ' ')}
 </span>
 <span className="text-xs font-mono font-semibold text-accent-green">
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
 <h3 className="text-xs font-semibold tracking-[0.15em] text-neutral-500 uppercase mb-2">
 Lore
 </h3>
 <div className="text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap">
 {contenido}
 </div>
 </div>
 )}
 </div>
 </aside>
 )
 }

 /* ── Vista Índice ── */
 const { items, personajes } = indexProyecto

 return (
 <aside className="w-80 h-screen bg-surface border-l border-surface-border flex flex-col shrink-0">
 <div className="px-5 pt-5 pb-3 border-b border-surface-border">
 <h2 className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
 Códice
 </h2>
 </div>

 <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 scrollbar-thin">
 {/* Ítems */}
 <section>
 <h3 className="px-3 text-xs font-semibold tracking-[0.15em] text-neutral-500 uppercase flex items-center justify-between">
 <span> Ítems</span>
 <span className="text-neutral-600">{items.length}</span>
 </h3>
 {items.length === 0 ? (
 <p className="px-3 pt-4 text-xs text-neutral-600">
 No hay ítems registrados
 </p>
 ) : (
 <ul className="mt-2 space-y-0.5">
 {items.map((item) => (
 <li key={item.archivo}>
 <button
 onClick={() => seleccionarElemento(item)}
 className="w-full text-left px-3 py-2 rounded text-xs text-neutral-400
 hover:text-neutral-200 hover:bg-neutral-800/40
 transition-all duration-100"
 >
 <span className="block truncate">
 {item.metadatos.nombre || item.archivo}
 </span>
 {item.metadatos.tipo && (
 <span className="text-xs text-neutral-600">
 {item.metadatos.tipo}
 </span>
 )}
 </button>
 </li>
 ))}
 </ul>
 )}
 </section>

 {/* Personajes */}
 <section>
 <h3 className="px-3 text-xs font-semibold tracking-[0.15em] text-neutral-500 uppercase flex items-center justify-between">
 <span> Personajes</span>
 <span className="text-neutral-600">{personajes.length}</span>
 </h3>
 {personajes.length === 0 ? (
 <p className="px-3 pt-4 text-xs text-neutral-600">
 No hay personajes registrados
 </p>
 ) : (
 <ul className="mt-2 space-y-0.5">
 {personajes.map((p) => (
 <li key={p.archivo}>
 <button
 onClick={() => seleccionarElemento(p)}
 className="w-full text-left px-3 py-2 rounded text-xs text-neutral-400
 hover:text-neutral-200 hover:bg-neutral-800/40
 transition-all duration-100"
 >
 <span className="block truncate">
 {p.metadatos.nombre || p.archivo}
 </span>
 </button>
 </li>
 ))}
 </ul>
 )}
 </section>
 </div>
 </aside>
 )
}
