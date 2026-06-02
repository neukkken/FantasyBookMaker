import { useCodice } from '../context/CodiceContext'

const capitulosMock = [
 { archivo: '01_inicio.md', metadatos: { titulo: 'El despertar' } },
 { archivo: '02_la_carta.md', metadatos: { titulo: 'La carta sellada' } },
 { archivo: '03_bosque.md', metadatos: { titulo: 'El bosque susurrante' } }
]

export default function ExploradorArchivos() {
 const {
 indexProyecto,
 capituloActivo,
 setCapituloActivo,
 cargarIndex,
 rutaProyecto
 } = useCodice()

 const handleCargarProyecto = () => {
 const demoRuta =
 'C:\\Users\\USUARIO\\Documents\\workstation\\FantasyBook\\demo-libro'
 console.log('[FantasyBook] Abriendo proyecto:', demoRuta)
 cargarIndex(demoRuta)
 setCapituloActivo(null)
 }

 return (
 <aside className="w-64 h-screen bg-surface border-r border-surface-border flex flex-col shrink-0">
 {/* Header */}
 <div className="px-5 pt-6 pb-4 border-b border-surface-border">
 <h1 className="text-sm font-bold tracking-[0.15em] text-accent-purple">
 FANTASYBOOK
 </h1>
 </div>

 {/* Cargar Proyecto */}
 <div className="px-4 py-3">
 <button
 onClick={handleCargarProyecto}
 className="w-full py-2 rounded text-xs font-semibold tracking-wider uppercase
 bg-accent-purple/10 text-accent-purple border border-accent-purple/20
 hover:bg-accent-purple/20 hover:border-accent-purple/40
 transition-all duration-150"
 >
 Cargar Proyecto
 </button>
 </div>

 {/* Manuscrito */}
 <div className="flex-1 flex flex-col min-h-0">
 <div className="px-5 py-2 text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
 Manuscrito
 {indexProyecto.items.length > 0 && (
 <span className="ml-2 text-neutral-600">({capitulosMock.length})</span>
 )}
 </div>

 <nav className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
 {indexProyecto.items.length === 0 ? (
 <p className="px-3 py-6 text-xs text-neutral-600 text-center">
 {rutaProyecto
 ? 'No hay capítulos en el manuscrito'
 : 'Carga un proyecto para empezar'}
 </p>
 ) : (
 <ul className="space-y-0.5">
 {capitulosMock.map((cap) => {
 const activo = capituloActivo?.archivo === cap.archivo
 return (
 <li key={cap.archivo}>
 <button
 onClick={() => setCapituloActivo(cap)}
 className={`w-full text-left px-3 py-2 rounded text-xs transition-all duration-100 ${
 activo
 ? 'bg-accent-purple/15 text-accent-purple border-l-2 border-accent-purple'
 : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 border-l-2 border-transparent'
 }`}
 >
 <span className="block truncate">
 {cap.metadatos.titulo || cap.archivo}
 </span>
 </button>
 </li>
 )
 })}
 </ul>
 )}
 </nav>
 </div>

 {/* Añadir Capítulo */}
 <div className="px-4 py-3 border-t border-surface-border">
 <button
 onClick={() => console.log('[FantasyBook] Nuevo capítulo...')}
 className="w-full py-1.5 rounded text-xs text-neutral-500
 hover:text-neutral-300 hover:bg-surface-lighter
 transition-all duration-150"
 >
 ＋ Añadir Capítulo
 </button>
 </div>
 </aside>
 )
}
