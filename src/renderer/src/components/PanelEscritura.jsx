import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'
import Icono from './Icono'

const NOMBRES_PLUGIN_KEY = new PluginKey('codice-nombres')
let _entidadesPlanasGlobal = {}

function crearPluginCodice() {
  return new Plugin({
    key: NOMBRES_PLUGIN_KEY,
    state: {
      init() { return DecorationSet.empty },
      apply(tr) {
        const nombres = Object.keys(_entidadesPlanasGlobal)
        if (!nombres.length || !tr.doc) return DecorationSet.empty
        const decorations = []
        tr.doc.descendants((node, pos) => {
          if (!node.isText) return
          const texto = node.text || ''
          for (const nombre of nombres) {
            const idx = texto.toLowerCase().indexOf(nombre)
            if (idx === -1) continue
            const from = pos + idx
            const to = from + nombre.length
            decorations.push(
              Decoration.inline(from, to, {
                class: 'codice-entidad',
                style: 'border-bottom: 1px dashed rgba(138,115,55,0.35); cursor: help;'
              })
            )
          }
        })
        return DecorationSet.create(tr.doc, decorations)
      }
    },
    props: {
      decorations(state) {
        return this.getState(state)
      }
    }
  })
}

const ExtensionCodiceNombres = Extension.create({
  name: 'codiceNombres',
  addProseMirrorPlugins() {
    return [crearPluginCodice()]
  }
})

// Extensión para navegación por teclado en el buscador de referencias
let _busquedaRef = { abierto: false, indice: 0, resultados: [], onEnter: null }

const ExtensionNavBusqueda = Extension.create({
  name: 'navBusqueda',
  addKeyboardShortcuts() {
    return {
      ArrowDown: () => {
        if (!_busquedaRef.abierto) return false
        _busquedaRef.indice = Math.min(_busquedaRef.indice + 1, _busquedaRef.resultados.length - 1)
        return true
      },
      ArrowUp: () => {
        if (!_busquedaRef.abierto) return false
        _busquedaRef.indice = Math.max(_busquedaRef.indice - 1, 0)
        return true
      },
      Enter: () => {
        if (!_busquedaRef.abierto) return false
        const ent = _busquedaRef.resultados[_busquedaRef.indice]
        if (ent && _busquedaRef.onEnter) _busquedaRef.onEnter(ent)
        return true
      }
    }
  }
})

function ListaCapitulos({
  capitulos,
  capituloActivo,
  onSeleccionar,
  onCrear,
  onEliminar
}) {
  const [creando, setCreando] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [eliminandoRuta, setEliminandoRuta] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (creando && inputRef.current) inputRef.current.focus()
  }, [creando])

  const handleCrear = async () => {
    if (!titulo.trim()) return
    await onCrear(titulo.trim())
    setTitulo('')
    setCreando(false)
  }

  const handleEliminar = async (ruta) => {
    await onEliminar(ruta)
    setEliminandoRuta(null)
  }

  return (
    <div className="w-64 flex flex-col border-r border-gothic-gold/20 shrink-0" style={{ height: '100%' }}>
      <div className="px-4 py-3 border-b border-gothic-gold/20">
        <h2 className="text-xs tracking-[0.2em] uppercase text-gothic-gold/60 font-serif">
          Capítulos
          <span className="ml-2 text-gothic-gold/40 text-xs">({capitulos.length})</span>
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {capitulos.length === 0 ? (
          <p className="text-xs text-gothic-parchment/30 italic text-center pt-6 font-serif">
            Aún no hay capítulos
          </p>
        ) : (
          capitulos.map((cap) => {
            const activo = capituloActivo?.ruta === cap.ruta
            const esEliminando = eliminandoRuta === cap.ruta

            if (esEliminando) {
              return (
                <div key={cap.ruta} className="flex items-center gap-1 px-3 py-2">
                  <span className="text-xs text-gothic-blood font-serif">¿Eliminar?</span>
                  <button
                    onClick={() => handleEliminar(cap.ruta)}
                    className="px-1.5 py-0.5 rounded-sm text-xs uppercase
                               bg-gothic-blood/20 text-gothic-parchment
                               hover:bg-gothic-blood/40 font-serif"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setEliminandoRuta(null)}
                    className="px-1.5 py-0.5 rounded-sm text-xs uppercase
                               text-gothic-parchment/50 hover:text-gothic-parchment font-serif"
                  >
                    No
                  </button>
                </div>
              )
            }

            return (
              <div key={cap.ruta} className="group flex items-center">
                <button
                  onClick={() => onSeleccionar(cap)}
                  className={
                    (activo
                      ? 'item-lista-gotico-activo'
                      : 'item-lista-gotico') +
                    ' !py-2 !pl-3 !pr-1 text-left flex-1 min-w-0'
                  }
                >
                  <span className="block text-xs font-serif truncate text-gothic-parchment/80">
                    {cap.metadatos?.titulo || cap.archivo}
                  </span>
                  <span className="text-[8px] text-gothic-gold/30 font-mono">
                    {cap.archivo}
                  </span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setEliminandoRuta(cap.ruta) }}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center
                             justify-center rounded-sm text-gothic-parchment/30
                             hover:text-gothic-blood-light hover:bg-gothic-gold/5
                             transition-all duration-150 text-xs mr-1 shrink-0"
                  title="Eliminar capítulo"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </nav>

      <div className="px-3 py-3 border-t border-gothic-gold/20">
        {creando ? (
          <div className="space-y-1.5">
            <input
              ref={inputRef}
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCrear(); if (e.key === 'Escape') { setCreando(false); setTitulo('') } }}
              placeholder="Título del capítulo..."
              className="w-full px-2 py-1 rounded-sm text-xs bg-gothic-bg
                         border border-gothic-gold/40 text-gothic-parchment
                         placeholder:text-gothic-gold/30 outline-none
                         focus:border-gothic-gold/70 font-serif"
            />
            <div className="flex gap-1">
              <button
                onClick={handleCrear}
                disabled={!titulo.trim()}
                className="flex-1 py-1 rounded-sm text-xs tracking-wider uppercase
                           border border-gothic-gold/40 text-gothic-gold-light
                           bg-gothic-gold/10 hover:bg-gothic-gold/20
                           disabled:opacity-40 disabled:cursor-not-allowed font-serif"
              >
                Crear
              </button>
              <button
                onClick={() => { setCreando(false); setTitulo('') }}
                className="py-1 px-2 rounded-sm text-xs tracking-wider uppercase
                           border border-gothic-blood/40 text-gothic-parchment/50
                           hover:text-gothic-parchment font-serif"
              >
                X
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreando(true)}
            className="w-full py-1.5 rounded-sm text-xs tracking-wider
                       text-gothic-gold/60 hover:text-gothic-gold-light
                       hover:bg-gothic-gold/5 transition-all font-serif"
          >
            + Nuevo Capítulo
          </button>
        )}
      </div>
    </div>
  )
}

function EditorVacio() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#16161a' }}>
      <p className="text-sm text-gothic-parchment/30 italic font-serif tracking-wide">
        Selecciona o crea un capítulo para empezar a escribir
      </p>
    </div>
  )
}

export default function PanelEscritura({ noPanel }) {
  const {
    rutaProyecto: rutaProyecto,
    indexProyecto, ETIQUETAS, ICONOS, CATEGORIAS,
    notificarGuardado, ultimoGuardado
  } = useCodice()

  const [capitulos, setCapitulos] = useState([])
  const [capituloActivo, setCapituloActivo] = useState(null)
  const [contenidoEditor, setContenidoEditor] = useState('')
  const [tituloLocal, setTituloLocal] = useState('')
  const [tituloEditando, setTituloEditando] = useState(false)
  const [contenidoAlGuardar, setContenidoAlGuardar] = useState('')
  const [infoPanel, setInfoPanel] = useState(null)
  const [mostrarBuscador, setMostrarBuscador] = useState(false)
  const [posArroba, setPosArroba] = useState(null)
  const [busquedaTexto, setBusquedaTexto] = useState('')
  const [indiceSel, setIndiceSel] = useState(0)
  const [palabrasHoy, setPalabrasHoy] = useState(0)
  const [metaDiaria, setMetaDiaria] = useState(0)
  const [editandoMeta, setEditandoMeta] = useState(false)
  const tituloInputRef = useRef(null)
  const editorContainerRef = useRef(null)
  const busquedaRef = useRef(null)
  const inputBusquedaRef = useRef(null)
  const mostrarBuscadorRef = useRef(false)

  useEffect(() => {
    mostrarBuscadorRef.current = mostrarBuscador
  }, [mostrarBuscador])

  function contarPalabras(html) {
    const texto = (html || '').replace(/<[^>]+>/g, '')
    const palabras = texto.trim().split(/\s+/).filter(Boolean)
    return palabras.length
  }

  function contarCaracteres(html) {
    return (html || '').replace(/<[^>]+>/g, '').length
  }

  useEffect(() => {
    if (!rutaProyecto) return
    window.api.metas.obtener(rutaProyecto, 'meta_diaria').then(v => setMetaDiaria(parseInt(v) || 0))
    const cargarPalabrasHoy = async () => {
      const hoy = new Date().toISOString().split('T')[0]
      const fecha = await window.api.metas.obtener(rutaProyecto, 'fecha_activa')
      if (fecha !== hoy) {
        await window.api.metas.establecer(rutaProyecto, 'fecha_activa', hoy)
        await window.api.metas.establecer(rutaProyecto, 'palabras_hoy', '0')
        setPalabrasHoy(0)
      } else {
        const p = await window.api.metas.obtener(rutaProyecto, 'palabras_hoy')
        setPalabrasHoy(parseInt(p) || 0)
      }
    }
    cargarPalabrasHoy()
  }, [rutaProyecto])

  const entidadesPlanas = useMemo(() => {
    const mapa = {}
    for (const cat of CATEGORIAS) {
      for (const el of indexProyecto[cat] || []) {
        const nombre = el.metadatos?.nombre
        if (nombre) mapa[nombre.toLowerCase()] = { ...el, categoria: cat }
      }
    }
    _entidadesPlanasGlobal = mapa
    return mapa
  }, [CATEGORIAS, indexProyecto])
  const resultadosFiltrados = useMemo(() => {
    return Object.values(entidadesPlanas).filter(e => {
      if (!busquedaTexto) return true
      return (e.metadatos?.nombre || e.archivo).toLowerCase().includes(busquedaTexto.toLowerCase())
    }).slice(0, 20)
  }, [entidadesPlanas, busquedaTexto])

  useEffect(() => {
    setIndiceSel(0)
  }, [busquedaTexto])

  // Sincronizar ref global con el estado del buscador
  useEffect(() => {
    _busquedaRef.abierto = mostrarBuscador
    _busquedaRef.indice = indiceSel
    _busquedaRef.resultados = resultadosFiltrados
    _busquedaRef.onEnter = mostrarBuscador ? (ent) => {
      insertarReferencia(ent)
      setMostrarBuscador(false)
      setBusquedaTexto('')
    } : null
  }, [mostrarBuscador, indiceSel, resultadosFiltrados, insertarReferencia])
  useEffect(() => {
    if (mostrarBuscador && inputBusquedaRef.current) {
      inputBusquedaRef.current.focus()
    }
  }, [mostrarBuscador])

  useEffect(() => {
    const handler = (ev) => {
      if (ev.key === 'Escape' && mostrarBuscador) {
        setMostrarBuscador(false); setBusquedaTexto(''); setPosArroba(null)
      }
    }
    const clickHandler = (ev) => {
      if (busquedaRef.current && !busquedaRef.current.contains(ev.target) &&
          !ev.target.closest('.codice-entidad')) {
        setMostrarBuscador(false); setBusquedaTexto(''); setPosArroba(null)
      }
    }
    document.addEventListener('keydown', handler)
    document.addEventListener('mousedown', clickHandler)
    return () => { document.removeEventListener('keydown', handler); document.removeEventListener('mousedown', clickHandler) }
  }, [mostrarBuscador])

  const refrescarCapitulos = useCallback(async () => {
    try {
      const r = await window.api.manuscrito.listarCapitulos(rutaProyecto)
      setCapitulos(r || [])
    } catch { setCapitulos([]) }
  }, [rutaProyecto])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refrescarCapitulos() }, [refrescarCapitulos])

  const handleSeleccionarCapitulo = useCallback(async (cap) => {
    try {
      const completo = await window.api.manuscrito.leerCapitulo(rutaProyecto, cap.ruta)
      setCapituloActivo(completo)
      setContenidoEditor(completo.contenido)
      setContenidoAlGuardar(completo.contenido)
      setTituloLocal(completo.metadatos.titulo || '')
      setTituloEditando(false)
    } catch { /* ignore */ }
  }, [rutaProyecto])

  const handleCrearCapitulo = useCallback(async (titulo) => {
    try {
      const r = await window.api.manuscrito.crearCapitulo(rutaProyecto, titulo)
      if (r.exito) await refrescarCapitulos()
    } catch { /* ignore */ }
  }, [rutaProyecto, refrescarCapitulos])

  const handleEliminarCapitulo = useCallback(async (ruta) => {
    try {
      await window.api.manuscrito.eliminarCapitulo(rutaProyecto, ruta)
      if (capituloActivo?.ruta === ruta) {
        setCapituloActivo(null)
        setContenidoEditor('')
      }
      await refrescarCapitulos()
    } catch { /* ignore */ }
  }, [rutaProyecto, capituloActivo, refrescarCapitulos])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Escribe tu historia...' }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image,
      ExtensionCodiceNombres,
      ExtensionNavBusqueda
    ],
    content: contenidoEditor || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      if (html !== contenidoEditor) setContenidoEditor(html)
      if (!mostrarBuscadorRef.current) {
        const { from } = ed.state.selection
        const textoHastaCursor = ed.state.doc.textBetween(Math.max(0, from - 30), from)
        const match = textoHastaCursor.match(/@(\w*)$/)
        if (match) {
          setPosArroba(from - match[0].length)
          setBusquedaTexto(match[1] || '')
          setMostrarBuscador(true)
        }
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none ' +
          'font-serif text-gothic-parchment leading-relaxed text-base ' +
          'min-h-full'
      }
    }
  })

  useEffect(() => {
    if (!editor || !capituloActivo) return
    if (editor.getHTML() !== contenidoEditor) {
      editor.commands.setContent(contenidoEditor || '')
    }
  }, [capituloActivo, editor, contenidoEditor])
  const insertarReferencia = useCallback((ent) => {
    const nombre = ent.metadatos?.nombre || ent.archivo
    if (posArroba !== null && editor) {
      const { from } = editor.state.selection
      editor.chain().focus().deleteRange({ from: posArroba, to: from }).insertContent(nombre).run()
    } else {
      editor?.chain().focus().insertContent(nombre).run()
    }
    setMostrarBuscador(false)
    setBusquedaTexto('')
    setPosArroba(null)
  }, [posArroba, editor])

  const guardar = useCallback(async () => {
    if (!capituloActivo) return
    try {
      await window.api.manuscrito.guardarCapitulo(
        rutaProyecto, capituloActivo.ruta, contenidoEditor,
        { titulo: tituloLocal, orden: capituloActivo.metadatos.orden }
      )
      setCapituloActivo((prev) => prev ? {
        ...prev, metadatos: { ...prev.metadatos, titulo: tituloLocal }
      } : prev)
      const palabrasAntes = contarPalabras(contenidoAlGuardar)
      const palabrasAhora = contarPalabras(contenidoEditor)
      const delta = Math.max(0, palabrasAhora - palabrasAntes)
      if (delta > 0) {
        const nuevaCuenta = palabrasHoy + delta
        await window.api.metas.establecer(rutaProyecto, 'palabras_hoy', String(nuevaCuenta))
        setPalabrasHoy(nuevaCuenta)
      }
      setContenidoAlGuardar(contenidoEditor)
      notificarGuardado()
      await refrescarCapitulos()
    } catch { /* ignore */ }
  }, [rutaProyecto, capituloActivo, contenidoEditor, tituloLocal, contenidoAlGuardar, palabrasHoy, refrescarCapitulos, notificarGuardado])

  const insertarImagen = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [editor])

  const sinGuardar = contenidoAlGuardar !== contenidoEditor
  const segs = ultimoGuardado ? Math.floor((Date.now() - ultimoGuardado) / 1000) : null

  useEffect(() => {
    const interval = setInterval(() => {}, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {}, [ultimoGuardado])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        guardar()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [guardar])

  const handleClickReferencia = useCallback((e) => {
    const span = e.target.closest('.codice-entidad')
    if (!span) { setInfoPanel(null); return }
    const nombre = span.textContent.trim()
    const encontrada = entidadesPlanas[nombre.toLowerCase()]
    if (!encontrada) return
    setInfoPanel({ x: e.clientX + 12, y: e.clientY - 10, entidad: encontrada })
  }, [entidadesPlanas])

  const contenidoPanel = (
    <div className="flex" style={{ height: noPanel ? '100%' : 'calc(100vh - 86px)' }}>
      <ListaCapitulos
        capitulos={capitulos}
        capituloActivo={capituloActivo}
        onSeleccionar={handleSeleccionarCapitulo}
        onCrear={handleCrearCapitulo}
        onEliminar={handleEliminarCapitulo}
      />

      <div className="flex-1 flex flex-col" style={{ background: '#16161a' }}>
        {!capituloActivo ? (
          <EditorVacio />
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gothic-gold/15 bg-gothic-bg/50">
              {tituloEditando ? (
                <input
                  ref={tituloInputRef}
                  type="text"
                  value={tituloLocal}
                  onChange={(e) => setTituloLocal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setTituloEditando(false)
                    if (e.key === 'Escape') {
                      setTituloLocal(capituloActivo.metadatos.titulo || '')
                      setTituloEditando(false)
                    }
                  }}
                  onBlur={() => setTituloEditando(false)}
                  className="text-sm font-bold font-serif tracking-wide text-gothic-gold-light
                             bg-gothic-bg border border-gothic-gold/40 px-2 py-0.5 rounded-sm
                             outline-none focus:border-gothic-gold/70 min-w-[200px]"
                />
              ) : (
                <h1
                  onClick={() => setTituloEditando(true)}
                  className="text-sm font-bold font-serif tracking-wide text-gothic-gold-light
                             cursor-pointer hover:text-gothic-gold/80 transition-colors px-1"
                  title="Editar título"
                >
                  {tituloLocal || capituloActivo.archivo}
                </h1>
              )}
              <div className="flex items-center gap-2">
                <div className="relative" ref={busquedaRef}>
                  <button
                    onClick={() => setMostrarBuscador(!mostrarBuscador)}
                    className="px-2 py-1 rounded-sm text-xs tracking-wider uppercase font-serif
                               border border-gothic-gold/30 text-gothic-gold/60
                               hover:bg-gothic-gold/10 hover:border-gothic-gold/50 transition-all"
                    title="Insertar referencia del Códice"
                  >
                    <Icono tipo="link" size={14} />
                  </button>
                  {mostrarBuscador && (
                    <div className="absolute top-full right-0 mt-1 w-72 bg-gothic-surface border border-gothic-gold/30
                                    rounded-sm shadow-gothic-lg z-50 buscador-ref">
                      <div className="p-2 border-b border-gothic-gold/15">
                        <input
                          ref={inputBusquedaRef}
                          type="text"
                          value={busquedaTexto}
                          onChange={(e) => setBusquedaTexto(e.target.value)}
                          placeholder="Buscar referencia..."
                          className="w-full px-2 py-1.5 rounded-sm text-xs bg-gothic-bg border border-gothic-gold/30
                                     text-gothic-parchment placeholder:text-gothic-gold/30 outline-none
                                     focus:border-gothic-gold/70 font-serif"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {resultadosFiltrados.length === 0 ? (
                          <p className="px-3 py-3 text-xs text-gothic-parchment/30 italic text-center font-serif">
                            Sin resultados
                          </p>
                        ) : (
                          resultadosFiltrados.map((ent, idx) => (
                            <button
                              key={ent.ruta}
                              onClick={() => {
                                insertarReferencia(ent)
                                setMostrarBuscador(false)
                                setBusquedaTexto('')
                              }}
                              onMouseEnter={() => setIndiceSel(idx)}
                              className={`w-full text-left px-3 py-2 rounded-sm text-xs font-serif transition-colors flex items-center gap-2
                                         ${idx === indiceSel
                                           ? 'bg-gothic-gold/15 text-gothic-gold-light'
                                           : 'text-gothic-parchment/80 hover:bg-gothic-gold/5'}`}
                            >
                              <Icono tipo={ICONOS[ent.categoria]} size={16} />
                              <span className="flex-1 truncate">{ent.metadatos?.nombre || ent.archivo}</span>
                              <span className="text-[9px] uppercase tracking-wider text-gothic-gold/40">{ETIQUETAS[ent.categoria]}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-mono transition-colors ${sinGuardar ? 'text-gothic-blood/70' : 'text-gothic-gold/40'}`}>
                  {sinGuardar ? '✕ Sin guardar' : ultimoGuardado ? (segs < 60 ? `✓ Guardado hace ${segs}s` : `✓ Guardado hace ${Math.floor(segs / 60)}m`) : ''}
                </span>
              </div>
            </div>

            {/* Toolbar de formato */}
            <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-gothic-gold/15 bg-gothic-bg/80">
              <button onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded-sm text-xs font-bold transition-colors ${editor?.isActive('bold') ? 'bg-gothic-gold/20 text-gothic-gold-light' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
                title="Negrita (Ctrl+B)">B</button>
              <button onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 rounded-sm text-xs italic transition-colors ${editor?.isActive('italic') ? 'bg-gothic-gold/20 text-gothic-gold-light' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
                title="Cursiva (Ctrl+I)"><em>I</em></button>
              <span className="w-px h-4 bg-gothic-gold/20 mx-1" />
              <button onClick={() => editor?.chain().focus().toggleHighlight().run()}
                className={`px-2 py-1 rounded-sm text-xs transition-colors ${editor?.isActive('highlight') ? 'bg-gothic-gold/20 text-gothic-gold-light' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
                title="Resaltar">🖍️</button>
              <span className="w-px h-4 bg-gothic-gold/20 mx-1" />
              <button onClick={() => editor?.chain().focus().setColor('#c9a84c').run()}
                className={`px-2 py-1 rounded-sm text-xs transition-colors ${editor?.isActive('textStyle', { color: '#c9a84c' }) ? 'bg-gothic-gold/20' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
                style={{ color: '#c9a84c' }}
                title="Texto dorado"><strong>A</strong></button>
              <button onClick={() => editor?.chain().focus().setColor('#cc0000').run()}
                className={`px-2 py-1 rounded-sm text-xs transition-colors ${editor?.isActive('textStyle', { color: '#cc0000' }) ? 'bg-gothic-gold/20' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
                style={{ color: '#cc0000' }}
                title="Texto rojo"><strong>A</strong></button>
              <button onClick={() => editor?.chain().focus().setColor('#4fc3f7').run()}
                className={`px-2 py-1 rounded-sm text-xs transition-colors ${editor?.isActive('textStyle', { color: '#4fc3f7' }) ? 'bg-gothic-gold/20' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
                style={{ color: '#4fc3f7' }}
                title="Texto azul"><strong>A</strong></button>
              <button onClick={() => editor?.chain().focus().unsetColor().run()}
                className="px-2 py-1 rounded-sm text-xs text-gothic-parchment/40 hover:text-gothic-parchment hover:bg-gothic-gold/5 transition-colors"
                title="Quitar color">✕</button>
              <span className="w-px h-4 bg-gothic-gold/20 mx-1" />
              <button onClick={insertarImagen}
                className="px-2 py-1 rounded-sm text-xs text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5 transition-colors"
                title="Insertar imagen">🖼️</button>
            </div>

            <style>{`
              .tiptap p.is-editor-empty:first-child::before {
                color: #8a7337;
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
              }
              .tiptap {
                min-height: calc(100vh - 170px);
                padding: 2rem 3rem;
                max-width: 800px;
                margin: 0 auto;
              }
              .tiptap p {
                margin-bottom: 1rem;
                line-height: 1.85;
                font-size: 1.25rem;
                color: #f0e8d8;
                font-weight: 600;
              }
              .tiptap h1 {
                color: #990000;
                font-size: 1.75rem;
                font-weight: 700;
                font-family: Georgia, serif;
                margin-bottom: 1.25rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(138, 115, 55, 0.3);
              }
              .tiptap h2 {
                color: #c9a84c;
                font-size: 1.35rem;
                font-weight: 600;
                font-family: Georgia, serif;
                margin-bottom: 0.75rem;
              }
              .tiptap em { color: #b8a87a; }
              .tiptap strong { color: #e6dfc8; }
              .tiptap blockquote {
                border-left: 3px solid #8a7337;
                padding-left: 1rem;
                margin-left: 0;
                color: #c4b998;
                font-style: italic;
              }
              .codice-entidad {
                border-bottom: 1px dashed rgba(138,115,55,0.35);
                cursor: pointer;
              }
              .buscador-ref-resultado {
                cursor: pointer;
              }
              .buscador-ref-resultado:hover {
                background: rgba(138,115,55,0.15);
              }
              .buscador-ref-resultado.seleccionado {
                background: rgba(138,115,55,0.2);
              }
            `}</style>
            <div className="flex-1 overflow-y-auto relative" ref={editorContainerRef}
                 onClick={handleClickReferencia}>
              <EditorContent editor={editor} />

              {/* Panel de información al clickear referencia */}
              {infoPanel && (() => {
                const e = infoPanel.entidad
                const desc = (e.contenido || '').replace(/[#*[\]]/g, '').trim().slice(0, 300)
                const stats = Object.entries(e.metadatos || {}).filter(
                  ([k, v]) => !['id', 'nombre', 'descripcion'].includes(k) && !Array.isArray(v) && typeof v !== 'object'
                ).slice(0, 8)
                return (
                  <div className="fixed z-50"
                       style={{ left: infoPanel.x, top: infoPanel.y }}>
                    <div className="bg-[#1f1f23] border border-gothic-gold/40 rounded-sm shadow-gothic-lg
                                    px-3.5 py-3 max-w-[300px]" style={{ backdropFilter: 'blur(8px)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm"><Icono tipo={ICONOS[e.categoria]} /></span>
                        <span className="text-sm font-bold font-titulo text-gothic-gold-light">
                          {e.metadatos?.nombre || e.archivo}
                        </span>
                      </div>
                      <div className="text-[9px] text-gothic-gold/50 uppercase tracking-wider mb-2 font-serif">
                        {ETIQUETAS[e.categoria]}
                      </div>
                      {desc && (
                        <p className="text-[11px] text-gothic-parchment/80 leading-relaxed mb-2 font-lectura">
                          {desc}{desc.length >= 300 ? '...' : ''}
                        </p>
                      )}
                      {stats.length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-2 border-t border-gothic-gold/15">
                          {stats.map(([k, v]) => (
                            <span key={k} className="text-[10px] font-mono text-gothic-gold-light/60">
                              {k.replace(/_/g, ' ')}: <span className="text-gothic-gold-light/90">{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Footer: contador de palabras y meta diaria */}
            <div className="shrink-0 border-t border-gothic-gold/15 px-4 py-1.5 flex items-center justify-between bg-gothic-bg/80">
              <span className="text-[10px] text-gothic-gold/50 font-mono">
                {contarPalabras(contenidoEditor).toLocaleString()} palabras · {contarCaracteres(contenidoEditor).toLocaleString()} caracteres
                {contarPalabras(contenidoEditor) > 0 && (
                  <span className="ml-2 text-gothic-gold/30">
                    · ~{Math.max(1, Math.round(contarPalabras(contenidoEditor) / 200))} min de lectura
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {editandoMeta ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gothic-gold/40 font-serif">Meta:</span>
                    <input type="number" min="0" step="100" value={metaDiaria || ''}
                      onChange={(e) => setMetaDiaria(parseInt(e.target.value) || 0)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt(e.target.value) || 0
                          await window.api.metas.establecer(rutaProyecto, 'meta_diaria', String(val))
                          setMetaDiaria(val)
                          setEditandoMeta(false)
                        }
                        if (e.key === 'Escape') { setEditandoMeta(false) }
                      }}
                      onBlur={() => setEditandoMeta(false)}
                      autoFocus
                      className="w-16 px-1 py-0.5 rounded-sm text-[10px] bg-gothic-surface border border-gothic-gold/30 text-gothic-parchment outline-none focus:border-gothic-gold/60 font-mono text-center"
                    />
                  </div>
                ) : metaDiaria > 0 ? (
                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setEditandoMeta(true)} title="Editar meta">
                    <div className="w-24 h-1.5 rounded-full bg-gothic-gold/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (palabrasHoy / metaDiaria) * 100)}%`,
                          background: palabrasHoy >= metaDiaria
                            ? 'linear-gradient(90deg, #c9a84c, #e8d48b)'
                            : 'linear-gradient(90deg, #8a7337, #c9a84c)'
                        }} />
                    </div>
                    <span className="text-[10px] font-mono text-gothic-gold/60 hover:text-gothic-gold-light transition-colors">
                      {palabrasHoy.toLocaleString()}/{metaDiaria.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <button onClick={() => setEditandoMeta(true)}
                    className="text-[10px] text-gothic-gold/40 hover:text-gothic-gold/70 font-serif transition-colors">
                    + Meta diaria
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  if (noPanel) return contenidoPanel

  return (
    <VentanaFlotante titulo="MANUSCRITO">
      {contenidoPanel}
    </VentanaFlotante>
  )
}
