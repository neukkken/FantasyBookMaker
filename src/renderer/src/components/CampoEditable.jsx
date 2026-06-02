import { useState, useEffect, useRef } from 'react'
import { useCodice } from '../context/CodiceContext'
import Icono from './Icono'

export default function CampoEditable({ etiqueta, valor, onChange, esNumero: esNumeroProp }) {
  const { ICONOS, ETIQUETAS } = useCodice()
  const esNumero = esNumeroProp || typeof valor === 'number'
  const esLargo = typeof valor === 'string' && (valor.length > 50 ||
    ['descripcion', 'efecto', 'ingredientes', 'historia', 'habilidades', 'requisitos', 'lore'].includes(etiqueta.replace(/ /g, '_').toLowerCase()))
  const esRef = typeof valor === 'string' && ['lugar_origen', 'raza', 'clase', 'faccion', 'deidad', 'historia', 'escuela', 'creador', 'dominador', 'gobernante'].includes(etiqueta.replace(/ /g, '_').toLowerCase())
  const [editando, setEditando] = useState(false)
  const [local, setLocal] = useState(String(valor ?? ''))
  const inputRef = useRef(null)

  useEffect(() => { setLocal(String(valor ?? '')) }, [valor])
  useEffect(() => { if (editando && inputRef.current) inputRef.current.focus() }, [editando])

  const handleSubmit = () => {
    const nuevo = esNumero ? Number(local) || 0 : local
    onChange(nuevo)
    setEditando(false)
  }

  if (!editando) {
    return (
      <div onClick={() => setEditando(true)}
        className="group flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-gothic-gold/5 rounded-sm transition-colors">
        <span className="text-[10px] tracking-[0.1em] uppercase text-gothic-gold/50 font-serif mr-3 shrink-0">{etiqueta}</span>
        <span className="text-xs text-gothic-parchment/80 font-serif truncate group-hover:text-gothic-gold-light transition-colors text-right max-w-[60%]">
          {String(valor ?? '—')}
        </span>
      </div>
    )
  }

  if (esLargo) {
    return (
      <div className="flex flex-col px-3 py-1.5 rounded-sm bg-gothic-gold/5 gap-1.5">
        <span className="text-[10px] tracking-[0.1em] uppercase text-gothic-gold/50 font-serif">{etiqueta}</span>
        <textarea ref={inputRef} value={local} onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); if (e.key === 'Escape') { setLocal(String(valor ?? '')); setEditando(false) } }}
          onBlur={handleSubmit} rows={3}
          className="w-full px-2 py-1 rounded-sm text-xs bg-gothic-bg border border-gothic-gold/40 text-gothic-parchment outline-none focus:border-gothic-gold/70 font-serif resize-vertical"
          style={{ minHeight: '60px', maxHeight: '200px' }} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-gothic-gold/5">
      <span className="text-[10px] tracking-[0.1em] uppercase text-gothic-gold/50 font-serif mr-3 shrink-0">{etiqueta}</span>
      <div className="flex items-center gap-1 flex-1 max-w-[60%]">
        <input ref={inputRef} type={esNumero ? 'number' : 'text'} value={local}
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setLocal(String(valor ?? '')); setEditando(false) } }}
          onBlur={handleSubmit}
          className="flex-1 min-w-0 px-2 py-0.5 rounded-sm text-xs bg-gothic-bg border border-gothic-gold/40 text-gothic-parchment outline-none focus:border-gothic-gold/70 font-serif" />
      </div>
    </div>
  )
}
