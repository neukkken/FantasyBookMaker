import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CodiceProvider, useCodice } from './context/CodiceContext'
import ExploradorArchivosGotico from './components/ExploradorArchivosGotico'
import PanelEscritura from './components/PanelEscritura'
import VistaLibro from './components/VistaLibro'
import PantallaEsquemas from './components/PantallaEsquemas'
import PanelTimeline from './components/PanelTimeline'
import PanelGrafico from './components/PanelGrafico'
import PanelSplit from './components/PanelSplit'
import Icono from './components/Icono'
import LogoFantasyBook from './components/LogoFantasyBook'

function Toast({ mensaje, tipo, onClose }: { mensaje: string; tipo: 'error' | 'exito'; onClose: () => void }): React.ReactElement {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
 return (
 <div className="fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-sm shadow-gothic-lg text-xs font-serif"
 style={{
 background: tipo === 'error' ? '#2a0a0a' : '#1a2a0a',
 border: tipo === 'error' ? '1px solid rgba(196,16,16,0.5)' : '1px solid rgba(201,168,76,0.4)',
 color: tipo === 'error' ? '#e8c8c8' : '#e6dfc8',
 animation: 'slideUp 0.3s ease-out'
 }}>
 {tipo === 'error' ? '✕ ' : '✓ '}{mensaje}
 <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
 </div>
 )
}

function ProyectosScreen({ onCargar, onEliminar }: { onCargar: (ruta: string) => Promise<void>; onEliminar: (ruta: string) => Promise<void> }): React.ReactElement {
 const [proyectos, setProyectos] = useState<{ nombre: string; ruta: string; stats: string }[]>([])
 const [creando, setCreando] = useState(false)
 const [nombre, setNombre] = useState('')
 const [eliminando, setEliminando] = useState<string | null>(null)
 const [toast, setToast] = useState<{ mensaje: string; tipo: 'error' | 'exito' } | null>(null)
 const inputRef = useRef<HTMLInputElement>(null)

  const refrescar = (): void => { window.api.listarProyectos().then(setProyectos) }

 useEffect(() => { refrescar() }, [])

 useEffect(() => {
 if (creando && inputRef.current) inputRef.current.focus()
 }, [creando])

  const handleCrear = async (): Promise<void> => {
 if (!nombre.trim()) return
 const result = await window.api.crearProyecto(nombre.trim())
 if (!result.exito) { setToast({ mensaje: result.error!, tipo: 'error' }); return }
 await onCargar(result.ruta!)
 }

  const handleEliminar = async (ruta: string): Promise<void> => {
 await onEliminar(ruta)
 setEliminando(null)
 refrescar()
 }

 return (
 <div className="flex items-center justify-center h-full">
 <div className="text-center max-w-md w-full px-8">
 <h1 className="text-2xl font-titulo italic font-bold text-gothic-gold-light mb-2">
 FantasyBook
 </h1>
 <p className="text-sm text-gothic-parchment/50 font-lectura mb-8">
 Selecciona o crea un proyecto
 </p>

 {/* Lista de proyectos */}
 <div className="space-y-1.5 mb-6">
 {proyectos.length === 0 && !creando && (
 <p className="text-xs text-gothic-parchment/30 italic font-lectura py-4">
 No hay proyectos aún. Crea uno nuevo.
 </p>
 )}
 {proyectos.map((p) => (
 <div key={p.ruta} className="group relative">
 {eliminando === p.ruta ? (
 <div className="flex items-center gap-2 px-4 py-3 rounded-sm border border-gothic-blood/40 bg-gothic-blood/5">
 <span className="text-xs text-gothic-blood font-serif">¿Eliminar "{p.nombre}"?</span>
 <button onClick={() => handleEliminar(p.ruta)}
 className="px-2 py-1 rounded-sm text-xs uppercase bg-gothic-blood/20 text-gothic-parchment hover:bg-gothic-blood/40 font-serif">Sí</button>
 <button onClick={() => setEliminando(null)}
 className="px-2 py-1 rounded-sm text-xs uppercase text-gothic-parchment/50 hover:text-gothic-parchment font-serif">No</button>
 </div>
 ) : (
 <>
 <button
 onClick={() => onCargar(p.ruta)}
 className="w-full text-left px-4 py-3 rounded-sm border border-gothic-gold/20
 bg-gothic-surface/50 hover:bg-gothic-gold/5 hover:border-gothic-gold/40
 transition-all duration-150 group"
 >
                <span className="block text-sm font-serif text-gothic-parchment/80 group-hover:text-gothic-gold-light flex items-center gap-2">
                  <Icono tipo="folder" size={16} /> {p.nombre}
 </span>
 <span className="text-[10px] font-mono text-gothic-gold/30 truncate block">
 {p.ruta}
 </span>
 </button>
 <button
 onClick={(e) => { e.stopPropagation(); setEliminando(p.ruta) }}
 className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center
 justify-center rounded-sm text-gothic-parchment/30 hover:text-gothic-blood-light
 hover:bg-gothic-gold/5 transition-all text-xs"
 title="Eliminar proyecto"
 >
 ✕
 </button>
 </>
 )}
 </div>
 ))}
 </div>

 {/* Formulario crear proyecto */}
 {creando ? (
 <div className="space-y-2">
 <input
 ref={inputRef}
 type="text"
 value={nombre}
 onChange={(e) => setNombre(e.target.value)}
 onKeyDown={(e) => { if (e.key === 'Enter') handleCrear(); if (e.key === 'Escape') { setCreando(false); setNombre('') } }}
 placeholder="Nombre del proyecto..."
 className="w-full px-3 py-2 rounded-sm text-sm bg-gothic-surface
 border border-gothic-gold/40 text-gothic-parchment
 placeholder:text-gothic-gold/30 outline-none
 focus:border-gothic-gold/70 font-serif"
 />
 <div className="flex gap-2">
 <button
 onClick={handleCrear}
 disabled={!nombre.trim()}
 className="flex-1 py-2 rounded-sm text-xs tracking-wider uppercase font-serif
 border border-gothic-gold/40 text-gothic-gold-light
 bg-gothic-gold/10 hover:bg-gothic-gold/20
 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
 >
 Crear Proyecto
 </button>
 <button
 onClick={() => { setCreando(false); setNombre('') }}
 className="px-3 py-2 rounded-sm text-xs tracking-wider uppercase font-serif
 border border-gothic-blood/40 text-gothic-parchment/50
 hover:text-gothic-parchment transition-all"
 >
 Cancelar
 </button>
 </div>
 </div>
 ) : (
 <button
 onClick={() => setCreando(true)}
 className="w-full py-2.5 rounded-sm text-sm tracking-[0.15em] uppercase font-serif
 border border-gothic-gold/50 text-gothic-gold-light
 bg-gradient-to-r from-gothic-gold/10 via-gothic-gold/15 to-gothic-gold/10
 hover:from-gothic-gold/20 hover:via-gothic-gold/25 hover:to-gothic-gold/20
 hover:border-gothic-gold/70 transition-all duration-200"
 >
 + Nuevo Proyecto
 </button>
 )}
 </div>

 {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
 </div>
 )
}

function BarraNavegacion({ modo, setModo, rutaProyecto, proyectos, onCambiarProyecto, onNuevoProyecto, onCerrarProyecto }: {
 modo: string; setModo: (m: string) => void; rutaProyecto: string; proyectos: { nombre: string; ruta: string; stats: string }[]
 onCambiarProyecto: (ruta: string) => Promise<void>; onNuevoProyecto: () => Promise<void>; onCerrarProyecto: () => void
}): React.ReactElement {
 const [mostrarSelector, setMostrarSelector] = useState(false)
 const nombreActual = proyectos.find((p) => p.ruta === rutaProyecto)?.nombre || 'Sin proyecto'

  return (
  <div className="flex items-center gap-0 px-4 py-0 border-b border-gothic-gold/20 bg-gothic-bg/80 relative"
  style={{ gridColumn: '1 / -1' }}>
  {/* Logo */}
  <div className="flex items-center pr-3 mr-2 border-r border-gothic-gold/15">
    <LogoFantasyBook size={24} />
  </div>
  {/* Selector de proyecto */}
 <div className="relative">
 <button
 onClick={() => setMostrarSelector(!mostrarSelector)}
 className="px-3 py-2 text-xs tracking-wider font-serif text-gothic-gold/70
 hover:text-gothic-gold-light border-r border-gothic-gold/20
 transition-colors"
 >
 {nombreActual}
 </button>
 {mostrarSelector && (
 <div className="absolute top-full left-0 mt-0.5 w-64 bg-gothic-surface border border-gothic-gold/30
 rounded-sm shadow-gothic-lg z-50 py-1 max-h-60 overflow-y-auto">
 {proyectos.map((p) => (
 <button
 key={p.ruta}
 onClick={() => { onCambiarProyecto(p.ruta); setMostrarSelector(false) }}
 className={`w-full text-left px-3 py-2 text-xs font-serif transition-colors
 ${p.ruta === rutaProyecto
 ? 'bg-gothic-gold/10 text-gothic-gold-light'
 : 'text-gothic-parchment/70 hover:bg-gothic-gold/5 hover:text-gothic-parchment'}`}
 >
 {p.nombre}
 </button>
 ))}
 <div className="border-t border-gothic-gold/20 mt-1 pt-1">
 <button
 onClick={() => { setMostrarSelector(false); onNuevoProyecto() }}
 className="w-full text-left px-3 py-2 text-xs font-serif text-gothic-gold/50
 hover:text-gothic-gold-light hover:bg-gothic-gold/5 transition-colors"
 >
 + Nuevo Proyecto
 </button>
 <button
 onClick={() => { setMostrarSelector(false); onCerrarProyecto() }}
 className="w-full text-left px-3 py-2 text-xs font-serif text-gothic-blood/50
 hover:text-gothic-blood-light hover:bg-gothic-blood/5 transition-colors"
 >
 ✕ Cerrar proyecto
 </button>
 </div>
 </div>
 )}
 </div>

 <button
 onClick={() => setModo('codice')}
  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-serif border-b-2 transition-colors
  ${modo === 'codice'
  ? 'border-gothic-gold text-gothic-gold-light'
  : 'border-transparent text-gothic-gold/40 hover:text-gothic-gold/70'}`}
  >
  <Icono tipo="codice" size={16} className="mr-1.5" /> Códice
  </button>
 <button
 onClick={() => setModo('manuscrito')}
  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-serif border-b-2 transition-colors
  ${modo === 'manuscrito'
  ? 'border-gothic-gold text-gothic-gold-light'
  : 'border-transparent text-gothic-gold/40 hover:text-gothic-gold/70'}`}
  >
  <Icono tipo="manuscrito" size={16} className="mr-1.5" /> Manuscrito
  </button>
  <button
  onClick={() => setModo('libro')}
  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-serif border-b-2 transition-colors
  ${modo === 'libro'
  ? 'border-gothic-gold text-gothic-gold-light'
  : 'border-transparent text-gothic-gold/40 hover:text-gothic-gold/70'}`}
  >
  <Icono tipo="libro" size={16} className="mr-1.5" /> Libro
  </button>
  <button
  onClick={() => setModo('esquemas')}
  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-serif border-b-2 transition-colors
  ${modo === 'esquemas'
  ? 'border-gothic-gold text-gothic-gold-light'
  : 'border-transparent text-gothic-gold/40 hover:text-gothic-gold/70'}`}
  >
  <Icono tipo="esquemas" size={16} className="mr-1.5" /> Esquemas
  </button>
  <button
  onClick={() => setModo('linea')}
  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-serif border-b-2 transition-colors
  ${modo === 'linea'
  ? 'border-gothic-gold text-gothic-gold-light'
  : 'border-transparent text-gothic-gold/40 hover:text-gothic-gold/70'}`}
  >
  <Icono tipo="linea" size={16} className="mr-1.5" /> Línea
  </button>
  <button
  onClick={() => setModo('grafico')}
  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-serif border-b-2 transition-colors
  ${modo === 'grafico'
  ? 'border-gothic-gold text-gothic-gold-light'
  : 'border-transparent text-gothic-gold/40 hover:text-gothic-gold/70'}`}
  >
  <Icono tipo="grafico" size={16} className="mr-1.5" /> Grafico
  </button>
  <button
  onClick={() => setModo('split')}
  className={`px-4 py-2 text-xs tracking-[0.2em] uppercase font-serif border-b-2 transition-colors
  ${modo === 'split'
  ? 'border-gothic-gold text-gothic-gold-light'
  : 'border-transparent text-gothic-gold/40 hover:text-gothic-gold/70'}`}
  >
  <Icono tipo="codice" size={16} className="mr-1.5" /> Split
  </button>
 </div>
 )
}

function AppContent(): React.ReactElement {
 const [modo, setModo] = useState('codice')
 const [proyectos, setProyectos] = useState<{ nombre: string; ruta: string; stats: string }[]>([])
 const { rutaProyecto, cargarProyecto } = useCodice()
 const [libroKey, setLibroKey] = useState(0)

  const refrescarProyectos = (): void => {
 window.api.listarProyectos().then(setProyectos)
 }

 useEffect(() => { refrescarProyectos() }, [])

  const handleCargar = async (ruta: string): Promise<void> => {
 setVolverAInicio(0)
 await cargarProyecto(ruta)
 refrescarProyectos()
 setModo('codice')
 }

  const setModoConRefresh = (m: string): void => {
 if (m === 'libro') setLibroKey((k) => k + 1)
 setModo(m)
 }

  const handleNuevo = async (): Promise<void> => {
 const result = await window.api.crearProyecto('Nuevo Proyecto')
 if (!result.exito) return
 await handleCargar(result.ruta!)
 }

 const [volverAInicio, setVolverAInicio] = useState(0)
 const handleCerrarProyecto = useCallback(() => setVolverAInicio((v) => v + 1), [])

 const handleEliminarProyecto = useCallback(async (ruta: string) => {
 await window.api.eliminarProyecto(ruta)
 if (ruta === rutaProyecto) handleCerrarProyecto()
 }, [rutaProyecto, handleCerrarProyecto])

 if (!rutaProyecto || volverAInicio > 0) {
 return (
 <div className="h-screen w-screen fondo-escritorio font-serif overflow-hidden">
 <ProyectosScreen onCargar={handleCargar} onEliminar={handleEliminarProyecto} />
 </div>
 )
 }

  return (
  <div className="h-screen w-screen fondo-escritorio font-serif overflow-hidden grid grid-rows-[auto_1fr]">
  <BarraNavegacion
  modo={modo} setModo={setModoConRefresh}
  rutaProyecto={rutaProyecto} proyectos={proyectos}
  onCambiarProyecto={handleCargar} onNuevoProyecto={handleNuevo}
  onCerrarProyecto={handleCerrarProyecto}
  />

  {modo === 'codice' ? (
  <ExploradorArchivosGotico />
  ) : modo === 'manuscrito' ? (
  <PanelEscritura />
  ) : modo === 'esquemas' ? (
  <PantallaEsquemas />
  ) : modo === 'linea' ? (
  <PanelTimeline />
  ) : modo === 'grafico' ? (
  <PanelGrafico />
  ) : modo === 'split' ? (
  <PanelSplit />
  ) : (
  <VistaLibro key={libroKey} />
  )}
 </div>
 )
}

function App(): React.ReactElement {
 useEffect(() => { document.title = 'FantasyBook' }, [])
  return (
    <CodiceProvider>
      <AppContent />
    </CodiceProvider>
  )
}

export default App
