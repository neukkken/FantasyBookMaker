import { useState, useEffect, useRef } from 'react'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'
import Icono from './Icono'

const TIPOS_CAMPO = ['string', 'number', 'ref', 'array']

function CampoVacio() {
  return { campo: '', tipo: 'string', ref_categoria: null, etiqueta: '', defecto: '' }
}

function esquemaAArray(esquema) {
  const resultado = {}
  for (const [cat, campos] of Object.entries(esquema)) {
    resultado[cat] = Object.entries(campos).map(([campo, info]) => ({
      campo,
      tipo: info.tipo,
      ref_categoria: info.ref_categoria || null,
      etiqueta: info.etiqueta || campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      defecto: info.defecto ?? ''
    }))
  }
  return resultado
}

function CategoriaSection({ categoria, campos, etiqueta, onChange, CATEGORIAS, onEliminar }) {
  const [expandido, setExpandido] = useState(campos.length === 0)

  const actualizarCampo = (idx, clave, valor) => {
    const nuevos = [...campos]
    nuevos[idx] = { ...nuevos[idx], [clave]: valor }
    if (clave === 'tipo' && valor !== 'ref' && valor !== 'array') {
      nuevos[idx].ref_categoria = null
    }
    onChange(categoria, nuevos)
  }

  const eliminarCampo = (idx) => {
    onChange(categoria, campos.filter((_, i) => i !== idx))
  }

  const agregarCampo = () => {
    onChange(categoria, [...campos, CampoVacio()])
  }

  return (
    <div className="border border-gothic-gold/20 rounded-sm bg-gothic-bg/40">
      <div className="flex items-center justify-between px-4 py-2.5">
        <button onClick={() => setExpandido(!expandido)}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-serif text-gothic-gold/70 hover:text-gothic-gold-light transition-colors flex-1 text-left">
          <span className={`transform transition-transform ${expandido ? 'rotate-90' : ''}`}>▸</span>
          <Icono tipo={categoria} size={16} />
          {etiqueta}
          <span className="text-gothic-gold/30 text-[10px] font-normal normal-case">({campos.length} campos)</span>
        </button>
        {onEliminar && (
          <button onClick={onEliminar}
            className="text-gothic-parchment/30 hover:text-gothic-blood-light transition-all text-xs shrink-0 ml-2" title="Eliminar categoría">
            ✕
          </button>
        )}
      </div>

      {expandido && (
        <div className="border-t border-gothic-gold/15">
          {campos.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gothic-parchment/30 italic font-serif text-center">
              Sin campos. Añade el primero.
            </p>
          ) : (
            <div className="divide-y divide-gothic-gold/10">
              {campos.map((campo, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-center gap-2">
                  <input type="text" value={campo.campo}
                    onChange={(e) => actualizarCampo(idx, 'campo', e.target.value)}
                    placeholder="nombre_campo"
                    className="w-28 px-1.5 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/20 text-gothic-parchment placeholder:text-gothic-gold/20 outline-none focus:border-gothic-gold/60 font-mono" />
                  <input type="text" value={campo.etiqueta}
                    onChange={(e) => actualizarCampo(idx, 'etiqueta', e.target.value)}
                    placeholder="Etiqueta"
                    className="w-28 px-1.5 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/20 text-gothic-parchment placeholder:text-gothic-gold/20 outline-none focus:border-gothic-gold/60 font-serif" />
                  <select value={campo.tipo}
                    onChange={(e) => actualizarCampo(idx, 'tipo', e.target.value)}
                    className="w-20 px-1.5 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/20 text-gothic-parchment outline-none focus:border-gothic-gold/60 font-serif cursor-pointer">
                    {TIPOS_CAMPO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {(campo.tipo === 'ref' || campo.tipo === 'array') ? (
                    <select value={campo.ref_categoria || ''}
                      onChange={(e) => actualizarCampo(idx, 'ref_categoria', e.target.value || null)}
                      className="w-24 px-1.5 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/20 text-gothic-parchment outline-none focus:border-gothic-gold/60 font-serif cursor-pointer">
                      <option value="">—</option>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <div className="w-24" />
                  )}
                  <input type="text" value={campo.defecto === null || campo.defecto === undefined ? '' : String(campo.defecto)}
                    onChange={(e) => actualizarCampo(idx, 'defecto', campo.tipo === 'number' ? Number(e.target.value) || 0 : e.target.value)}
                    placeholder="Def."
                    className="w-16 px-1.5 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/20 text-gothic-parchment placeholder:text-gothic-gold/20 outline-none focus:border-gothic-gold/60 font-serif text-center" />
                  <button onClick={() => eliminarCampo(idx)}
                    className="w-6 h-6 flex items-center justify-center rounded-sm text-gothic-parchment/30 hover:text-gothic-blood-light hover:bg-gothic-blood/10 transition-all text-xs"
                    title="Eliminar campo">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-2 border-t border-gothic-gold/10">
            <button onClick={agregarCampo}
              className="px-3 py-1 rounded-sm text-xs tracking-wider uppercase font-serif border border-dashed border-gothic-gold/30 text-gothic-gold/50 hover:text-gothic-gold-light hover:border-gothic-gold/60 hover:bg-gothic-gold/5 transition-all">
              + Añadir campo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PantallaEsquemas() {
  const { rutaProyecto, CATEGORIAS, ETIQUETAS, esquema, cargarEsquema, cargarCategorias } = useCodice()
  const [camposPorCategoria, setCamposPorCategoria] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState(null)
  const [creandoCat, setCreandoCat] = useState(false)
  const [nuevaCatNombre, setNuevaCatNombre] = useState('')
  const [nuevaCatEtiqueta, setNuevaCatEtiqueta] = useState('')
  const [eliminandoCat, setEliminandoCat] = useState(null)
  const inputCatRef = useRef(null)

  useEffect(() => {
    if (esquema) {
      setCamposPorCategoria(esquemaAArray(esquema))
    }
  }, [esquema])

  useEffect(() => {
    if (creandoCat && inputCatRef.current) inputCatRef.current.focus()
  }, [creandoCat])

  const handleCambioCategoria = (categoria, nuevosCampos) => {
    setCamposPorCategoria((prev) => ({ ...prev, [categoria]: nuevosCampos }))
  }

  const handleGuardar = async () => {
    if (!rutaProyecto || !camposPorCategoria) return
    setGuardando(true)
    let errores = 0
    for (const [cat, campos] of Object.entries(camposPorCategoria)) {
      const validos = campos.filter(c => c.campo.trim())
      const validar = validos.map(c => ({
        ...c,
        campo: c.campo.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        defecto: c.tipo === 'number' ? Number(c.defecto) || 0 : (c.tipo === 'array' ? [] : String(c.defecto || ''))
      }))
      const result = await window.api.guardarEsquemaCategoria(rutaProyecto, cat, validar)
      if (!result.exito) errores++
    }
    await cargarEsquema(rutaProyecto)
    setGuardando(false)
    setToast(errores === 0 ? { tipo: 'exito', mensaje: 'Esquemas guardados correctamente' } : { tipo: 'error', mensaje: `Error al guardar ${errores} categoría(s)` })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCrearCategoria = async () => {
    if (!nuevaCatNombre.trim() || !rutaProyecto) return
    const result = await window.api.categorias.crear(rutaProyecto, nuevaCatNombre.trim(), nuevaCatEtiqueta.trim() || nuevaCatNombre.trim(), 'circle')
    if (!result.exito) {
      setToast({ tipo: 'error', mensaje: result.error })
      setTimeout(() => setToast(null), 3000)
      return
    }
    setNuevaCatNombre('')
    setNuevaCatEtiqueta('')
    setCreandoCat(false)
    await cargarCategorias(rutaProyecto)
    await cargarEsquema(rutaProyecto)
  }

  const handleEliminarCategoria = async (nombre) => {
    if (!rutaProyecto) return
    const result = await window.api.categorias.eliminar(rutaProyecto, nombre)
    if (!result.exito) {
      setToast({ tipo: 'error', mensaje: result.error })
    } else {
      setToast({ tipo: 'exito', mensaje: `Categoría "${nombre}" eliminada${result.eliminadas > 0 ? ` (${result.eliminadas} entidades borradas)` : ''}` })
    }
    setEliminandoCat(null)
    await cargarCategorias(rutaProyecto)
    await cargarEsquema(rutaProyecto)
    setTimeout(() => setToast(null), 3000)
  }

  if (!camposPorCategoria) {
    return (
      <VentanaFlotante titulo="ESQUEMAS">
        <div className="flex items-center justify-center h-full">
          <p className="text-xs text-gothic-parchment/30 italic font-lectura">Cargando esquemas...</p>
        </div>
      </VentanaFlotante>
    )
  }

  return (
    <VentanaFlotante titulo="ESQUEMAS">
      <div className="h-full flex flex-col min-h-0">
        {/* Barra de acciones */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gothic-gold/15 shrink-0">
          <p className="text-[10px] text-gothic-gold/40 font-serif tracking-wider">
            Personaliza los campos de cada categoría del Códice
          </p>
          <button onClick={handleGuardar} disabled={guardando}
            className="px-4 py-1.5 rounded-sm text-xs tracking-wider uppercase font-serif border border-gothic-gold/40 text-gothic-gold-light bg-gothic-gold/10 hover:bg-gothic-gold/20 disabled:opacity-40 transition-all">
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Lista de categorías */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {CATEGORIAS.map((cat) => {
            const esEliminando = eliminandoCat === cat
            if (esEliminando) {
              return (
                <div key={cat} className="flex items-center gap-2 px-4 py-3 rounded-sm border border-gothic-blood/40 bg-gothic-blood/5">
                  <span className="text-xs text-gothic-blood font-serif">¿Eliminar "{ETIQUETAS[cat]}" y sus entidades?</span>
                  <button onClick={() => handleEliminarCategoria(cat)}
                    className="px-1.5 py-0.5 rounded-sm text-xs uppercase bg-gothic-blood/20 text-gothic-parchment hover:bg-gothic-blood/40 font-serif">Sí</button>
                  <button onClick={() => setEliminandoCat(null)}
                    className="px-1.5 py-0.5 rounded-sm text-xs uppercase text-gothic-parchment/50 hover:text-gothic-parchment font-serif">No</button>
                </div>
              )
            }
            return (
              <CategoriaSection key={cat} categoria={cat}
                campos={camposPorCategoria[cat] || []}
                etiqueta={ETIQUETAS[cat]}
                onChange={handleCambioCategoria}
                CATEGORIAS={CATEGORIAS}
                onEliminar={() => setEliminandoCat(cat)} />
            )
          })}

          {/* Formulario nueva categoría */}
          <div className="border border-dashed border-gothic-gold/20 rounded-sm bg-gothic-bg/20">
            {creandoCat ? (
              <div className="px-4 py-3 space-y-2">
                <input ref={inputCatRef} type="text" value={nuevaCatNombre}
                  onChange={(e) => setNuevaCatNombre(e.target.value)}
                  placeholder="nombre_interno (ej: imperios)"
                  className="w-full px-2 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/30 text-gothic-parchment placeholder:text-gothic-gold/20 outline-none focus:border-gothic-gold/60 font-mono" />
                <input type="text" value={nuevaCatEtiqueta}
                  onChange={(e) => setNuevaCatEtiqueta(e.target.value)}
                  placeholder="Etiqueta visible (ej: Imperios)"
                  className="w-full px-2 py-1 rounded-sm text-xs bg-gothic-surface border border-gothic-gold/30 text-gothic-parchment placeholder:text-gothic-gold/20 outline-none focus:border-gothic-gold/60 font-serif" />
                <div className="flex gap-1">
                  <button onClick={handleCrearCategoria} disabled={!nuevaCatNombre.trim()}
                    className="flex-1 py-1 rounded-sm text-xs tracking-wider uppercase border border-gothic-gold/40 text-gothic-gold-light bg-gothic-gold/10 hover:bg-gothic-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-serif">Crear</button>
                  <button onClick={() => { setCreandoCat(false); setNuevaCatNombre(''); setNuevaCatEtiqueta('') }}
                    className="py-1 px-2 rounded-sm text-xs tracking-wider uppercase border border-gothic-blood/40 text-gothic-parchment/50 hover:text-gothic-parchment transition-all font-serif">X</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCreandoCat(true)}
                className="w-full px-4 py-3 text-xs tracking-wider uppercase font-serif text-gothic-gold/50 hover:text-gothic-gold-light transition-all text-left">
                + Nuevo esquema
              </button>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-4 right-4 z-50 px-4 py-2.5 rounded-sm shadow-gothic-lg text-xs font-serif"
            style={{
              background: toast.tipo === 'error' ? '#2a0a0a' : '#1a2a0a',
              border: toast.tipo === 'error' ? '1px solid rgba(196,16,16,0.5)' : '1px solid rgba(201,168,76,0.4)',
              color: toast.tipo === 'error' ? '#e8c8c8' : '#e6dfc8'
            }}>
            {toast.tipo === 'error' ? '✕ ' : '✓ '}{toast.mensaje}
          </div>
        )}
      </div>
    </VentanaFlotante>
  )
}
