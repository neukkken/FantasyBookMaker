import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'

function EditorVacio() {
 return (
 <VentanaFlotante titulo=" PERGAMINO">
 <div className="flex items-center justify-center h-full">
 <p className="text-sm text-gothic-parchment/30 italic font-serif tracking-wide">
 Selecciona un elemento del Códice para consultarlo o editarlo...
 </p>
 </div>
 </VentanaFlotante>
 )
}

function CampoEditable({ etiqueta, valor, onChange }) {
  const esNumero = typeof valor === 'number'
  const esLargo = typeof valor === 'string' && (valor.length > 50 || ['descripcion', 'efecto', 'ingredientes', 'historia', 'habilidades', 'requisitos'].includes(etiqueta.replace(/ /g, '_').toLowerCase()))
  const [editando, setEditando] = useState(false)
  const [local, setLocal] = useState(String(valor ?? ''))
  const inputRef = useRef(null)

  useEffect(() => {
    setLocal(String(valor ?? ''))
  }, [valor])

  useEffect(() => {
    if (editando && inputRef.current) inputRef.current.focus()
  }, [editando])

  const handleSubmit = () => {
    const nuevo = esNumero ? Number(local) || 0 : local
    onChange(nuevo)
    setEditando(false)
  }

  if (!editando) {
    return (
      <div
        onClick={() => setEditando(true)}
        className="flex items-center justify-between px-3 py-1.5 cursor-pointer
                   hover:bg-gothic-gold/5 rounded-sm transition-colors group"
      >
        <span className="text-xs tracking-[0.1em] uppercase text-gothic-gold/50 font-serif mr-3 shrink-0">
          {etiqueta}
        </span>
        <span className="text-xs text-gothic-parchment/80 font-serif truncate group-hover:text-gothic-gold-light transition-colors text-right max-w-[60%]">
          {String(valor ?? '—')}
        </span>
      </div>
    )
  }

  if (esLargo) {
    return (
      <div className="flex flex-col px-3 py-1.5 rounded-sm bg-gothic-gold/5 gap-1.5">
        <span className="text-[10px] tracking-[0.1em] uppercase text-gothic-gold/50 font-serif">
          {etiqueta}
        </span>
        <textarea
          ref={inputRef}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); if (e.key === 'Escape') { setLocal(String(valor ?? '')); setEditando(false) } }}
          onBlur={handleSubmit}
          rows={3}
          className="w-full px-2 py-1 rounded-sm text-xs bg-gothic-bg
                     border border-gothic-gold/40 text-gothic-parchment outline-none
                     focus:border-gothic-gold/70 font-serif resize-vertical
                     whitespace-pre-wrap overflow-wrap-break-word"
          style={{ minHeight: '60px', maxHeight: '200px' }}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-gothic-gold/5">
      <span className="text-xs tracking-[0.1em] uppercase text-gothic-gold/50 font-serif mr-3 shrink-0">
        {etiqueta}
      </span>
      <div className="flex items-center gap-1 flex-1 max-w-[60%]">
        <input
          ref={inputRef}
          type={esNumero ? 'number' : 'text'}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setLocal(String(valor ?? '')); setEditando(false) } }}
          onBlur={handleSubmit}
          className="flex-1 min-w-0 px-2 py-0.5 rounded-sm text-xs bg-gothic-bg
                     border border-gothic-gold/40 text-gothic-parchment outline-none
                     focus:border-gothic-gold/70 font-serif"
        />
      </div>
    </div>
  )
}

function CampoRef({ etiqueta, valor, config, onChange }) {
  const { entidadPorNombre, indexProyecto, navegarA, ETIQUETAS } = useCodice()
 const [buscando, setBuscando] = useState(false)
 const [query, setQuery] = useState('')
 const inputRef = useRef(null)

 const esArray = config.tipo === 'array'
 const categoriasOrigen = config.multi_categoria || [config.categoria]

 useEffect(() => {
 if (buscando && inputRef.current) inputRef.current.focus()
 }, [buscando])

 const valores = esArray ? (Array.isArray(valor) ? valor : []) : [valor].filter(Boolean)

 const sugerencias = query.trim()
 ? categoriasOrigen.flatMap((cat) =>
 (indexProyecto[cat] || [])
 .filter((e) => {
 const n = e.metadatos?.nombre || ''
 return n.toLowerCase().includes(query.toLowerCase()) && !valores.includes(n)
 })
 .map((e) => ({ nombre: e.metadatos?.nombre || e.archivo, ruta: e.ruta }))
 ).slice(0, 8)
 : []

 const agregar = (nombre) => {
 if (esArray) {
 onChange([...valores, nombre])
 } else {
 onChange(nombre)
 }
 setQuery('')
 setBuscando(false)
 }

 const quitar = (nombre) => {
 if (esArray) {
 onChange(valores.filter((v) => v !== nombre))
 } else {
 onChange('')
 }
 }

 const irA = (nombre) => {
 const entidad = entidadPorNombre(nombre)
 if (entidad) navegarA(entidad.ruta)
 }

 return (
 <div className="px-3 py-2 border-t border-gothic-gold/10">
 <span className="text-xs tracking-[0.1em] uppercase text-gothic-gold/50 font-serif block mb-1.5">
 {etiqueta}
 </span>
 <div className="flex flex-wrap gap-1">
 {valores.map((v) => (
 <span
 key={v}
 className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-sm
 bg-gothic-gold/10 border border-gothic-gold/30 cursor-pointer
 hover:bg-gothic-gold/20 transition-colors text-xs font-serif"
 onClick={() => irA(v)}
 title="Ir al elemento"
 >
 <span className="text-gothic-parchment/80">{v}</span>
 <button
 onClick={(e) => { e.stopPropagation(); quitar(v) }}
 className="text-gothic-parchment/30 hover:text-gothic-blood-light text-xs leading-none"
 >
 ✕
 </button>
 </span>
 ))}
 <button
 onClick={() => setBuscando(!buscando)}
 className="px-2 py-0.5 rounded-sm border border-dashed border-gothic-gold/30
 text-gothic-gold/50 hover:text-gothic-gold-light hover:border-gothic-gold/60
 transition-colors text-xs font-serif"
 >
 +
 </button>
 </div>

 {buscando && (
 <div className="mt-1.5 relative">
 <input
 ref={inputRef}
 type="text"
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 onKeyDown={(e) => { if (e.key === 'Escape') { setBuscando(false); setQuery('') } }}
 placeholder={`Buscar en ${categoriasOrigen.map((c) => ETIQUETAS[c]).join(', ')}...`}
 className="w-full px-2 py-1 rounded-sm text-xs bg-gothic-bg
 border border-gothic-gold/30 text-gothic-parchment
 placeholder:text-gothic-gold/30 outline-none
 focus:border-gothic-gold/70 font-serif"
 />
 {sugerencias.length > 0 && (
 <div className="absolute top-full left-0 right-0 mt-0.5 z-10
 bg-gothic-surface border border-gothic-gold/30 rounded-sm
 max-h-32 overflow-y-auto">
 {sugerencias.map((s) => (
 <button
 key={s.ruta}
 onClick={() => agregar(s.nombre)}
 className="w-full text-left px-2 py-1 text-xs font-serif
 text-gothic-parchment/80 hover:bg-gothic-gold/10
 hover:text-gothic-gold-light transition-colors"
 >
 {s.nombre}
 </button>
 ))}
 </div>
 )}
 {query.trim() && sugerencias.length === 0 && (
 <p className="text-xs text-gothic-parchment/30 italic px-1 pt-0.5 font-serif">
 Sin resultados. Crea el elemento primero en el Códice.
 </p>
 )}
 </div>
 )}
 </div>
 )
}

export default function EditorGotico() {
  const {
  elementoSeleccionado,
  contenidoEditor,
  setContenidoEditor,
  guardarElemento,
  eliminarElemento,
  relacionesConfig
  } = useCodice()
 const [metadatosLocales, setMetadatosLocales] = useState(null)
 const [confirmarEliminar, setConfirmarEliminar] = useState(false)
 const [tituloEditando, setTituloEditando] = useState(false)
 const tituloInputRef = useRef(null)

 useEffect(() => {
 if (elementoSeleccionado) {
 setMetadatosLocales({ ...elementoSeleccionado.metadatos })
 setConfirmarEliminar(false)
 setTituloEditando(false)
 } else {
 setMetadatosLocales(null)
 }
  }, [elementoSeleccionado])

  useEffect(() => {
  if (tituloEditando && tituloInputRef.current) tituloInputRef.current.focus()
  }, [tituloEditando])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Escribe la descripción aquí...' })
    ],
    content: contenidoEditor || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== contenidoEditor) setContenidoEditor(html)
    },
 editorProps: {
 attributes: {
 class:
 'prose prose-invert max-w-none focus:outline-none px-6 py-4 ' +
 'font-serif text-gothic-parchment leading-relaxed ' +
 'min-h-full text-sm'
 }
 }
 })

  useEffect(() => {
    if (!editor || !elementoSeleccionado) return
    if (editor.getHTML() !== contenidoEditor) {
      editor.commands.setContent(contenidoEditor || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, elementoSeleccionado?.ruta, contenidoEditor])

 const debounceRef = useRef(null)

 const guardarCompleto = useCallback(() => {
 if (!elementoSeleccionado || !metadatosLocales) return
 guardarElemento(elementoSeleccionado.ruta, metadatosLocales, contenidoEditor || '')
 }, [elementoSeleccionado, metadatosLocales, contenidoEditor, guardarElemento])

 useEffect(() => {
 if (debounceRef.current) clearTimeout(debounceRef.current)
 debounceRef.current = setTimeout(guardarCompleto, 1500)
 return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
 }, [contenidoEditor, metadatosLocales, guardarCompleto])

 useEffect(() => {
 if (!editor) return
 return () => { if (!editor.isDestroyed) guardarCompleto() }
 }, [editor, guardarCompleto, elementoSeleccionado?.ruta])

 const actualizarMetadata = (clave, valor) => {
 setMetadatosLocales((prev) => ({ ...prev, [clave]: valor }))
 }

 if (!elementoSeleccionado || !metadatosLocales) return <EditorVacio />

 const catActual = relacionesConfig
  ? Object.entries(relacionesConfig).find(([, campos]) =>
 Object.keys(campos).some((k) => k in metadatosLocales)
 )?.[0]
 : null

 const camposRelacionales = catActual ? relacionesConfig[catActual] : {}
 const metadatosSimples = Object.entries(metadatosLocales).filter(
 ([k]) => !['id', 'nombre'].includes(k) && !(k in camposRelacionales)
 )

 const handleEliminar = async () => {
 await eliminarElemento(elementoSeleccionado.ruta)
 }

 return (
 <VentanaFlotante
 titulo={` ${metadatosLocales.nombre || elementoSeleccionado.archivo}`}
 >
 <style>{`
 .tiptap p.is-editor-empty:first-child::before {
 color: #8a7337;
 content: attr(data-placeholder);
 float: left;
 height: 0;
 pointer-events: none;
 }
 .tiptap { min-height: 200px; }
 .tiptap p { margin-bottom: 0.75rem; line-height: 1.8; }
 .tiptap em { color: #b8a87a; }
 .tiptap strong { color: #e6dfc8; }
 `}</style>
 <div
 className="overflow-y-auto"
 style={{ height: 'calc(100vh - 40px)', background: '#16161a' }}
 >
 {/* Encabezado */}
 <div className="px-6 pt-5 pb-4 border-b border-gothic-gold/15 flex items-start justify-between">
 <div className="flex-1 min-w-0">
 {tituloEditando ? (
 <input
 ref={tituloInputRef}
 type="text"
 value={metadatosLocales.nombre || ''}
 onChange={(e) => actualizarMetadata('nombre', e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') setTituloEditando(false)
 if (e.key === 'Escape') {
 setMetadatosLocales((prev) => ({ ...prev, nombre: elementoSeleccionado.metadatos.nombre || '' }))
 setTituloEditando(false)
 }
 }}
 onBlur={() => setTituloEditando(false)}
 className="text-lg font-bold text-gothic-gold-light font-serif tracking-wide w-full
 bg-gothic-bg border border-gothic-gold/40 px-2 py-0.5 rounded-sm
 outline-none focus:border-gothic-gold/70"
 />
 ) : (
 <h1
 onClick={() => setTituloEditando(true)}
 className="text-lg font-bold text-gothic-gold-light font-serif tracking-wide cursor-pointer
 hover:text-gothic-gold/80 transition-colors"
 title="Editar nombre"
 >
 {metadatosLocales.nombre || 'Sin nombre'}
 </h1>
 )}
 {metadatosLocales.id && (
 <span className="text-xs text-gothic-gold/30 font-mono">
 ID: {metadatosLocales.id}
 </span>
 )}
 </div>
 {/* Botón eliminar */}
 {!confirmarEliminar ? (
 <button
 onClick={() => setConfirmarEliminar(true)}
 className="px-2 py-1 rounded-sm text-xs tracking-wider uppercase
 border border-gothic-blood/40 text-gothic-blood
 hover:bg-gothic-blood/10 hover:border-gothic-blood/60
 transition-all duration-150 font-serif shrink-0 ml-4"
 >
 Eliminar
 </button>
 ) : (
 <div className="flex items-center gap-1.5 shrink-0 ml-4">
 <span className="text-xs text-gothic-blood font-serif">¿Seguro?</span>
 <button
 onClick={handleEliminar}
 className="px-2 py-1 rounded-sm text-xs tracking-wider uppercase
 border border-gothic-blood text-gothic-parchment
 bg-gothic-blood/20 hover:bg-gothic-blood/40
 transition-all duration-150 font-serif"
 >
 Sí
 </button>
 <button
 onClick={() => setConfirmarEliminar(false)}
 className="px-2 py-1 rounded-sm text-xs tracking-wider uppercase
 border border-gothic-gold/30 text-gothic-parchment/50
 hover:text-gothic-parchment transition-all duration-150 font-serif"
 >
 No
 </button>
 </div>
 )}
 </div>

 {/* Campos relacionales */}
 {Object.keys(camposRelacionales).length > 0 && (
 <div className="border-b border-gothic-gold/15">
 {Object.entries(camposRelacionales).map(([clave, cfg]) => (
 <CampoRef
 key={clave}
 etiqueta={cfg.etiqueta}
 valor={metadatosLocales[clave]}
 config={cfg}
 onChange={(nuevo) => actualizarMetadata(clave, nuevo)}
 />
 ))}
 </div>
 )}

 {/* Metadatos simples editables */}
 {metadatosSimples.length > 0 && (
 <div className="px-6 py-4 border-b border-gothic-gold/15">
 <h2 className="text-xs tracking-[0.2em] uppercase text-gothic-gold/50 font-serif mb-3
 border-b border-gothic-gold/20 pb-1">
 Atributos
 </h2>
 <div className="divide-y divide-gothic-gold/10 border border-gothic-gold/15 rounded-sm bg-gothic-bg/50">
 {metadatosSimples.map(([clave, valor]) => (
 <CampoEditable
 key={clave}
 etiqueta={clave.replace(/_/g, ' ')}
 valor={valor}
 onChange={(nuevo) => actualizarMetadata(clave, nuevo)}
 />
 ))}
 </div>
 </div>
 )}

 {/* Editor de descripción */}
 <div className="px-6 py-4">
 <h2 className="text-xs tracking-[0.2em] uppercase text-gothic-gold/50 font-serif mb-3
 border-b border-gothic-gold/20 pb-1">
 Leyenda
 </h2>
 <div
 className="border border-gothic-gold/15 rounded-sm bg-gothic-bg/30"
 style={{ minHeight: '200px' }}
 >
 <EditorContent editor={editor} />
 </div>
 </div>
 </div>
 </VentanaFlotante>
 )
}
