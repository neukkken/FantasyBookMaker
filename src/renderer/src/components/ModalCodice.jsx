import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import { useCodice } from '../context/CodiceContext'
import CampoEditable from './CampoEditable'
import CampoRef from './CampoRef'
import Icono from './Icono'

export default function ModalCodice({ elementoSeleccionado, onClose, relacionesConfig }) {
  const { rutaProyecto, contenidoEditor, setContenidoEditor, guardarElemento, refrescarIndex, ICONOS, ETIQUETAS, esquema } = useCodice()
  const [metadatosLocales, setMetadatosLocales] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (elementoSeleccionado) {
      setMetadatosLocales({ ...elementoSeleccionado.metadatos })
      setContenidoEditor(elementoSeleccionado.contenido || '')
    }
  }, [elementoSeleccionado?.ruta])

  const catActual = elementoSeleccionado?.categoria
  const esquemaCategoria = esquema?.[catActual] || {}

  // Construir campos relacionales desde el esquema (ref/array), no desde relacionesConfig
  const camposRelacionales = {}
  for (const [k, info] of Object.entries(esquemaCategoria)) {
    if (info.tipo === 'ref' || info.tipo === 'array') {
      camposRelacionales[k] = { tipo: info.tipo, categoria: info.ref_categoria, etiqueta: info.etiqueta }
    }
  }

  const camposDelEsquema = Object.entries(esquemaCategoria)
  const camposRef = camposDelEsquema.filter(([k]) => k in camposRelacionales)
  const metadatosSimples = camposDelEsquema.filter(
    ([k]) => !['id', 'nombre'].includes(k) && !(k in camposRelacionales)
  )

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Escribe la descripción aquí...' }), TextStyle, Color, Image],
    content: contenidoEditor || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== contenidoEditor) setContenidoEditor(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none px-4 py-3 font-serif text-gothic-parchment leading-relaxed min-h-[150px] text-sm'
      }
    }
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== contenidoEditor) {
      editor.commands.setContent(contenidoEditor || '')
    }
  }, [elementoSeleccionado?.ruta])

  const actualizarMetadata = (clave, valor) => {
    setMetadatosLocales((prev) => ({ ...prev, [clave]: valor }))
  }

  const handleGuardar = useCallback(async () => {
    if (!elementoSeleccionado || !metadatosLocales) return
    setGuardando(true)
    await guardarElemento(elementoSeleccionado.ruta, metadatosLocales, contenidoEditor || '')
    if (rutaProyecto) await refrescarIndex(rutaProyecto)
    setGuardando(false)
    onClose(true)
  }, [elementoSeleccionado, metadatosLocales, contenidoEditor, guardarElemento, rutaProyecto, refrescarIndex, onClose])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose(false)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleGuardar() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleGuardar, onClose])

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

  if (!elementoSeleccionado || !metadatosLocales) return null

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(false) }}>
      <div className="bg-gothic-surface border border-gothic-gold/40 rounded-sm shadow-gothic-lg w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gothic-gold/20 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icono tipo={ICONOS[catActual || '']} size={18} />
            <input type="text" value={metadatosLocales.nombre || ''}
              onChange={(e) => actualizarMetadata('nombre', e.target.value)}
              className="text-sm font-bold font-serif bg-transparent border-none outline-none text-gothic-gold-light flex-1 min-w-0 px-1 py-0.5 rounded-sm focus:bg-gothic-bg/50"
              placeholder="Sin nombre" />
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <span className="text-[9px] text-gothic-gold/40 font-mono">{ETIQUETAS[catActual || ''] || ''}</span>
            <button onClick={handleGuardar} disabled={guardando}
              className="px-3 py-1 rounded-sm text-xs tracking-wider uppercase font-serif border border-gothic-gold/40 text-gothic-gold-light bg-gothic-gold/10 hover:bg-gothic-gold/20 disabled:opacity-40 transition-all">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => onClose(false)}
              className="px-2 py-1 rounded-sm text-xs text-gothic-parchment/40 hover:text-gothic-parchment hover:bg-gothic-gold/5 transition-all font-serif">
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-gothic-gold/15 bg-gothic-bg/50 shrink-0">
          <button onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-2 py-0.5 rounded-sm text-xs font-bold transition-colors ${editor?.isActive('bold') ? 'bg-gothic-gold/20 text-gothic-gold-light' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}>B</button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-2 py-0.5 rounded-sm text-xs italic transition-colors ${editor?.isActive('italic') ? 'bg-gothic-gold/20 text-gothic-gold-light' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}><em>I</em></button>
          <span className="w-px h-3.5 bg-gothic-gold/20 mx-1" />
          <button onClick={() => editor?.chain().focus().setColor('#c9a84c').run()}
            className={`px-2 py-0.5 rounded-sm text-xs transition-colors ${editor?.isActive('textStyle', { color: '#c9a84c' }) ? 'bg-gothic-gold/20' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
            style={{ color: '#c9a84c' }} title="Dorado"><strong>A</strong></button>
          <button onClick={() => editor?.chain().focus().setColor('#cc0000').run()}
            className={`px-2 py-0.5 rounded-sm text-xs transition-colors ${editor?.isActive('textStyle', { color: '#cc0000' }) ? 'bg-gothic-gold/20' : 'text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5'}`}
            style={{ color: '#cc0000' }} title="Rojo"><strong>A</strong></button>
          <button onClick={() => editor?.chain().focus().unsetColor().run()}
            className="px-2 py-0.5 rounded-sm text-xs text-gothic-parchment/40 hover:text-gothic-parchment hover:bg-gothic-gold/5 transition-colors">✕</button>
          <span className="w-px h-3.5 bg-gothic-gold/20 mx-1" />
          <button onClick={insertarImagen}
            className="px-2 py-0.5 rounded-sm text-xs text-gothic-parchment/60 hover:text-gothic-parchment hover:bg-gothic-gold/5 transition-colors"
            title="Insertar imagen">🖼️</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Campos relacionales */}
          {camposRef.length > 0 && (
            <div className="px-4 py-3 border-b border-gothic-gold/15">
              <h3 className="text-[9px] tracking-[0.15em] uppercase text-gothic-gold/40 font-serif mb-2">Relaciones</h3>
              <div className="divide-y divide-gothic-gold/10 border border-gothic-gold/15 rounded-sm bg-gothic-bg/30">
                {camposRef.map(([k, info]) => (
                  <CampoRef key={k} etiqueta={camposRelacionales[k]?.etiqueta || k.replace(/_/g, ' ')}
                    valor={metadatosLocales?.[k] ?? info.defecto} config={camposRelacionales[k]}
                    onChange={(nuevo) => actualizarMetadata(k, nuevo)} />
                ))}
              </div>
            </div>
          )}

          {/* Campos editables */}
          {metadatosSimples.length > 0 && (
            <div className="px-4 py-3 border-b border-gothic-gold/15">
              <h3 className="text-[9px] tracking-[0.15em] uppercase text-gothic-gold/40 font-serif mb-2">Atributos</h3>
              <div className="divide-y divide-gothic-gold/10 border border-gothic-gold/15 rounded-sm bg-gothic-bg/30">
                {metadatosSimples.map(([clave, info]) => (
                  <CampoEditable key={clave} etiqueta={info.etiqueta || clave.replace(/_/g, ' ')}
                    valor={metadatosLocales?.[clave] ?? info.defecto}
                    onChange={(nuevo) => actualizarMetadata(clave, nuevo)} />
                ))}
              </div>
            </div>
          )}

          {/* Editor descripcion */}
          <div className="px-4 py-3">
            <h3 className="text-[9px] tracking-[0.15em] uppercase text-gothic-gold/40 font-serif mb-2">Descripción</h3>
            <div className="border border-gothic-gold/15 rounded-sm bg-gothic-bg/30">
              <style>{`
                .tiptap { min-height: 120px; }
                .tiptap p { margin-bottom: 0.6rem; line-height: 1.7; font-size: 0.8125rem; color: #e6dfc8; }
                .tiptap p.is-editor-empty:first-child::before { color: #5a4a2e; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
                .tiptap em { color: #b8a87a; }
                .tiptap strong { color: #f0e8d8; }
              `}</style>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
