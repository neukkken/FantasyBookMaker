import { useState, useEffect, useRef } from 'react'
import { useCodice } from '../context/CodiceContext'
import Icono from './Icono'

export default function CampoRef({ etiqueta, valor, config, onChange }) {
  const { entidadPorNombre, indexProyecto, navegarA, ETIQUETAS, ICONOS } = useCodice()
  const [buscando, setBuscando] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const esArray = config?.tipo === 'array'
  const categoriasOrigen = config?.multi_categoria || (config?.categoria ? [config.categoria] : [])

  useEffect(() => { if (buscando && inputRef.current) inputRef.current.focus() }, [buscando])

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
    <div className="px-3 py-1.5 border-t border-gothic-gold/10">
      <span className="text-[10px] tracking-[0.1em] uppercase text-gothic-gold/50 font-serif block mb-1">{etiqueta}</span>
      <div className="flex flex-wrap gap-1">
        {valores.map((v) => (
          <span key={v}
            className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-gothic-gold/10 border border-gothic-gold/30 cursor-pointer hover:bg-gothic-gold/20 transition-colors text-[11px] font-serif"
            onClick={() => irA(v)} title="Ir al elemento">
            <span className="text-gothic-parchment/80">{v}</span>
            <button onClick={(e) => { e.stopPropagation(); quitar(v) }}
              className="text-gothic-parchment/30 hover:text-gothic-blood-light text-[10px] leading-none">✕</button>
          </span>
        ))}
        <button onClick={() => setBuscando(!buscando)}
          className="px-2 py-0.5 rounded-sm border border-dashed border-gothic-gold/30 text-gothic-gold/50 hover:text-gothic-gold-light hover:border-gothic-gold/60 transition-colors text-[11px] font-serif">
          {valores.length === 0 ? 'Seleccionar...' : '+'}
        </button>
      </div>
      {buscando && (
        <div className="mt-1.5 relative">
          <input ref={inputRef} type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setBuscando(false); setQuery('') } }}
            placeholder={`Buscar en ${categoriasOrigen.map((c) => ETIQUETAS[c]).join(', ')}...`}
            className="w-full px-2 py-1 rounded-sm text-[11px] bg-gothic-bg border border-gothic-gold/30 text-gothic-parchment placeholder:text-gothic-gold/30 outline-none focus:border-gothic-gold/70 font-serif" />
          {sugerencias.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-0.5 z-10 bg-gothic-surface border border-gothic-gold/30 rounded-sm max-h-32 overflow-y-auto">
              {sugerencias.map((s) => (
                <button key={s.ruta} onClick={() => agregar(s.nombre)}
                  className="w-full text-left px-2 py-1 text-[11px] font-serif text-gothic-parchment/80 hover:bg-gothic-gold/10 hover:text-gothic-gold-light transition-colors">
                  {s.nombre}
                </button>
              ))}
            </div>
          )}
          {query.trim() && sugerencias.length === 0 && (
            <p className="text-[9px] text-gothic-parchment/30 italic px-1 pt-0.5 font-serif">Sin resultados. Crea el elemento primero en el Códice.</p>
          )}
        </div>
      )}
    </div>
  )
}
