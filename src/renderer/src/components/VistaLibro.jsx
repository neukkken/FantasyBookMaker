import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'
import Icono from './Icono'

function resaltarTexto(html, nombres) {
  if (!html || !nombres.length) return html
  const ordenados = [...nombres].sort((a, b) => b.length - a.length)
  let res = html
  for (const nombre of ordenados) {
    const esc = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    res = res.replace(new RegExp(`\\b(${esc})\\b`, 'gi'), '<span class="codice-entidad-libro">$1</span>')
  }
  return res
}

function dividirEnPaginas(html, maxChars) {
  if (!html) return ['']
  const parrafos = html.match(/<p[\s>][\s\S]*?<\/p>/g)
  if (!parrafos) return [html]
  const paginas = []
  let buf = ''
  for (const p of parrafos) {
    if (buf.length + p.length > maxChars && buf.length > 0) {
      paginas.push(buf)
      buf = p
    } else {
      buf += p
    }
  }
  if (buf) paginas.push(buf)
  return paginas
}

function Pagina({ contenido, titulo, numPagina, totalPaginas, className = '', entidadNombres = [], tamanioFuente = 11 }) {
  return (
    <div className={`relative bg-[#f5eed6] overflow-hidden w-full h-full ${className}`}>
      <div className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: `radial-gradient(ellipse at 20% 50%, #8a7337 0%, transparent 70%)`,
             pointerEvents: 'none'
           }} />

      <div className="absolute inset-3 border border-[#8a7337]/10 rounded-sm pointer-events-none" />

      <div className="relative h-full flex flex-col px-6 py-5 overflow-hidden">
        <div className="text-center mb-4 shrink-0">
          <span className="text-xs font-mono text-[#8a7337]/40">— {numPagina} —</span>
        </div>

        {titulo && (
          <h1 className="font-titulo italic font-bold text-[#990000] text-center mb-4 pb-3
                         border-b border-[#8a7337]/25 shrink-0"
              style={{ fontSize: Math.round(tamanioFuente * 18 / 11) }}>
            {titulo}
          </h1>
        )}

        <div
          className="flex-1 font-lectura text-[#2a2018] leading-[1.8] space-y-2 [overflow-wrap:break_word]"
          style={{ fontSize: tamanioFuente }}
          dangerouslySetInnerHTML={{ __html: entidadNombres.length ? resaltarTexto(contenido, entidadNombres) : contenido }}
          data-page-content
        />

        {totalPaginas > 0 && (
          <div className="mt-4 pt-2 border-t border-[#8a7337]/15 text-center shrink-0">
            <span className="text-[8px] font-mono text-[#8a7337]/30">
              {numPagina} de {totalPaginas}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VistaLibro() {
  const { indexProyecto, ETIQUETAS, ICONOS, CATEGORIAS, rutaProyecto } = useCodice()
  const [capitulos, setCapitulos] = useState([])
  const [paginaActual, setPaginaActual] = useState(0)
  const [contenidos, setContenidos] = useState({})
  const [tooltip, setTooltip] = useState(null)
  const [infoPanel, setInfoPanel] = useState(null)
  const [modoSimple, setModoSimple] = useState(() => {
    try { return localStorage.getItem('fb-modo-simple') === 'true' } catch { return false }
  })
  const [pantallaCompleta, setPantallaCompleta] = useState(() => {
    try { return localStorage.getItem('fb-pantalla-completa') === 'true' } catch { return false }
  })
  const [paginaInput, setPaginaInput] = useState('')
  const [tamanioFuente, setTamanioFuente] = useState(() => {
    try { return parseInt(localStorage.getItem('fb-font-size'), 10) || 11 } catch { return 11 }
  })
  const libroRef = useRef(null)

  const paso = modoSimple ? 1 : 2
  const maxChars = Math.round(1200 * 11 / tamanioFuente)

  useEffect(() => {
    try { localStorage.setItem('fb-font-size', String(tamanioFuente)) } catch { /* ignore */ }
  }, [tamanioFuente])
  useEffect(() => {
    try { localStorage.setItem('fb-modo-simple', String(modoSimple)) } catch { /* ignore */ }
  }, [modoSimple])
  useEffect(() => {
    try { localStorage.setItem('fb-pantalla-completa', String(pantallaCompleta)) } catch { /* ignore */ }
  }, [pantallaCompleta])

  const entidadesPlanas = useMemo(() => {
    const mapa = {}
    for (const cat of CATEGORIAS) {
      for (const el of indexProyecto[cat] || []) {
        const nombre = el.metadatos?.nombre
        if (nombre) mapa[nombre.toLowerCase()] = { ...el, categoria: cat }
      }
    }
    return mapa
  }, [CATEGORIAS, indexProyecto])
  const paginasVirtuales = useMemo(() => {
    const paginas = []
    for (let i = 0; i < capitulos.length; i++) {
      const trozos = dividirEnPaginas(contenidos[i] || '', maxChars)
      for (let p = 0; p < trozos.length; p++) {
        paginas.push({
          capituloIdx: i,
          paginaEnCapitulo: p,
          contenido: trozos[p],
          titulo: p === 0 ? (capitulos[i]?.metadatos?.titulo || '') : ''
        })
      }
    }
    return paginas
  }, [capitulos, contenidos, maxChars])

  const primerasPaginas = useMemo(() => {
    const mapa = {}
    for (let i = 0; i < paginasVirtuales.length; i++) {
      const ci = paginasVirtuales[i].capituloIdx
      if (mapa[ci] === undefined) mapa[ci] = i
    }
    return mapa
  }, [paginasVirtuales])

  useEffect(() => {
    if (paginasVirtuales.length > 0) {
      setPaginaActual(prev => Math.min(prev, paginasVirtuales.length - 1))
    }
  }, [paginasVirtuales.length])

  // Refs para teclado (evita recrear el listener)
  const paginaActualRef = useRef(paginaActual)
  paginaActualRef.current = paginaActual
  const totalRef = useRef(paginasVirtuales.length)
  totalRef.current = paginasVirtuales.length
  const pasoRef = useRef(paso)
  pasoRef.current = paso

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const idx = paginaActualRef.current - pasoRef.current
        if (idx >= 0) setPaginaActual(idx)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const idx = paginaActualRef.current + pasoRef.current
        if (idx < totalRef.current) setPaginaActual(idx)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const refrescar = useCallback(async () => {
    const resultado = await window.api.manuscrito.listarCapitulos(rutaProyecto)
    setCapitulos(resultado)
  }, [rutaProyecto])

  useEffect(() => {
    refrescar()
    const onFocus = () => refrescar()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refrescar])
  useEffect(() => {
    const handler = () => setTooltip(null)
    document.addEventListener('scroll', handler, true)
    return () => document.removeEventListener('scroll', handler, true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    const target = e.target
    if (!target || !target.closest('[data-page-content]')) { setTooltip(null); return }
    const range = document.caretRangeFromPoint(e.clientX, e.clientY)
    if (!range) { setTooltip(null); return }
    const texto = range.startContainer.textContent || ''
    const offset = range.startOffset
    const palabras = texto.slice(0, offset).split(/\s+/)
    const palabraActual = palabras[palabras.length - 1]?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/, '')
    if (!palabraActual || palabraActual.length < 3) { setTooltip(null); return }
    const encontrada = entidadesPlanas[palabraActual.toLowerCase()]
    if (!encontrada) { setTooltip(null); return }
    setTooltip({
      x: e.clientX + 12,
      y: e.clientY - 10,
      entidad: encontrada
    })
  }, [entidadesPlanas])

  const handleClickReferencia = useCallback((e) => {
    const span = e.target.closest('.codice-entidad-libro')
    if (!span) { setInfoPanel(null); return }
    const nombre = span.textContent.trim()
    const encontrada = entidadesPlanas[nombre.toLowerCase()]
    if (!encontrada) return
    setInfoPanel({ x: e.clientX + 12, y: e.clientY - 10, entidad: encontrada })
    setTooltip(null)
  }, [entidadesPlanas])

  useEffect(() => {
    const handler = () => setInfoPanel(null)
    document.addEventListener('scroll', handler, true)
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('.codice-entidad-libro')) setInfoPanel(null)
    }, true)
    return () => document.removeEventListener('scroll', handler, true)
  }, [])

  // Cargar contenido de las páginas visibles
  useEffect(() => {
    if (paginasVirtuales.length === 0) return
    const indices = [paginaActual, paginaActual + 1]
      .filter((i) => i >= 0 && i < paginasVirtuales.length)
      .map((i) => paginasVirtuales[i].capituloIdx)
    const unicos = [...new Set(indices)]
    unicos.forEach(async (i) => {
      if (!contenidos[i]) {
        const completo = await window.api.manuscrito.leerCapitulo(rutaProyecto, capitulos[i].ruta)
        setContenidos((prev) => ({ ...prev, [i]: completo.contenido || '' }))
      }
    })
  }, [paginasVirtuales, paginaActual, capitulos, contenidos, rutaProyecto])
  const irA = (idx) => {
    const max = paginasVirtuales.length - 1
    if (idx < 0 || idx > max) return
    setPaginaActual(idx)
    setPaginaInput('')
  }

  const irACapitulo = (capituloIdx) => {
    const vpIdx = primerasPaginas[capituloIdx]
    if (vpIdx !== undefined) irA(vpIdx)
  }

  const capituloActual = paginasVirtuales[paginaActual]?.capituloIdx ?? -1

  const tienePaginaIzq = paginasVirtuales.length > 0
  const tienePaginaDer = !modoSimple && paginaActual + 1 < paginasVirtuales.length

  const handleIrAPagina = (e) => {
    if (e.key !== 'Enter') return
    const num = parseInt(paginaInput, 10)
    if (num >= 1 && num <= paginasVirtuales.length) {
      irA(num - 1)
    }
  }

  return (
    <VentanaFlotante titulo="LIBRO" sinScroll={true}>
      <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ background: '#1a1612' }}>
        {capitulos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gothic-parchment/30 italic font-lectura">
              Escribe capítulos en el Manuscrito para verlos aquí...
            </p>
          </div>
        ) : (
          <>
            {/* Estilos de animación */}
            <style>{`
              .page-sombra-izq {
                box-shadow: inset 8px 0 20px -8px rgba(0,0,0,0.15),
                            inset -2px 0 10px -4px rgba(0,0,0,0.05);
              }
              .page-sombra-der {
                box-shadow: inset -8px 0 20px -8px rgba(0,0,0,0.15),
                            inset 2px 0 10px -4px rgba(0,0,0,0.05);
              }
              .codice-entidad-libro {
                border-bottom: 1px dashed rgba(138,115,55,0.4);
                cursor: help;
              }
            `}</style>

            {/* El libro abierto */}
            <div className="flex-1 flex items-center justify-center px-6 py-4 overflow-hidden" ref={libroRef}>
              <div className="relative"
                   style={pantallaCompleta
                     ? { width: '95vw', height: '90vh' }
                     : { width: modoSimple ? '460px' : '900px', maxWidth: modoSimple ? '46vw' : '90vw', height: '580px', maxHeight: '75vh' }}>
                {/* Portada / lomo exterior */}
                <div className="absolute -inset-x-3 -inset-y-2 rounded-sm bg-gradient-to-b from-[#3a2010] via-[#2a1808] to-[#1a0e04]
                                shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(138,115,55,0.2)]">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gothic-gold/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gothic-gold/40 to-transparent" />
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-gothic-gold/30 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-gothic-gold/30 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-gothic-gold/30 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-gothic-gold/30 rounded-br" />
                </div>

                {/* Cuerpo del libro abierto */}
                <div className="relative h-full flex rounded-sm overflow-hidden shadow-2xl"
                     onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}
                     onClick={handleClickReferencia}>
                  {/* Página izquierda */}
                  <div className={`relative page-sombra-izq z-10 ${modoSimple ? 'w-full' : 'flex-1'}`}
                       style={{ height: '100%' }}>
                    {tienePaginaIzq ? (
                      <Pagina
                        contenido={paginasVirtuales[paginaActual]?.contenido || ''}
                        titulo={paginasVirtuales[paginaActual]?.titulo}
                        numPagina={paginaActual + 1}
                        totalPaginas={paginasVirtuales.length}
                        entidadNombres={Object.keys(entidadesPlanas)}
                        tamanioFuente={tamanioFuente}
                      />
                    ) : (
                      <div className="h-full bg-[#f5eed6] flex items-center justify-center">
                        <p className="text-xs font-titulo italic text-[#8a7337]/30">Portada</p>
                      </div>
                    )}
                  </div>

                  {/* Lomo central (solo en modo doble) */}
                  {!modoSimple && (
                    <div className="relative z-20" style={{ width: '18px', minWidth: '18px' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2a1808] via-[#4a3020] to-[#2a1808]">
                        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-gothic-gold/30" />
                        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-gothic-gold/30" />
                        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-gothic-gold/30" />
                        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-gothic-gold/30" />
                        <div className="absolute top-[75%] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-gothic-gold/30" />
                      </div>
                      <div className="absolute inset-y-0 -left-0.5 w-2 bg-gradient-to-r from-black/20 to-transparent" />
                      <div className="absolute inset-y-0 -right-0.5 w-2 bg-gradient-to-l from-black/20 to-transparent" />
                    </div>
                  )}

                  {/* Página derecha (solo en modo doble) */}
                  {!modoSimple && (
                    <div className="relative page-sombra-der z-10 flex-1"
                         style={{ height: '100%' }}>
                      {tienePaginaDer ? (
                        <Pagina
                          contenido={paginasVirtuales[paginaActual + 1]?.contenido || ''}
                          titulo={paginasVirtuales[paginaActual + 1]?.titulo}
                          numPagina={paginaActual + 2}
                          totalPaginas={paginasVirtuales.length}
                          entidadNombres={Object.keys(entidadesPlanas)}
                          tamanioFuente={tamanioFuente}
                        />
                      ) : (
                        <div className="h-full bg-[#f5eed6] flex items-center justify-center">
                          <p className="text-xs font-titulo italic text-[#8a7337]/30">Contraportada</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cinta marcador colgando */}
                <div className="absolute -bottom-4 right-12 w-6 h-6">
                  <div className="w-[3px] h-6 bg-gradient-to-b from-[#990000] to-[#660000] mx-auto rounded-b"
                       style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                </div>
              </div>
            </div>

            {/* Tooltip del Códice */}
            {tooltip && (() => {
              const e = tooltip.entidad
              const desc = (e.contenido || '').replace(/<[^>]+>/g, '').trim().slice(0, 300)
              const stats = Object.entries(e.metadatos || {}).filter(
                ([k, v]) => !['id', 'nombre', 'descripcion'].includes(k) && !Array.isArray(v) && typeof v !== 'object'
              ).slice(0, 8)
              return (
                <div className="fixed z-50 pointer-events-none"
                     style={{ left: tooltip.x, top: tooltip.y }}>
                  <div className="bg-[#1f1f23] border border-gothic-gold/40 rounded-sm shadow-gothic-lg
                                  px-3.5 py-3 max-w-[300px]"
                       style={{ backdropFilter: 'blur(8px)' }}>
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

            {/* Panel de información al clickear referencia */}
            {infoPanel && (() => {
              const e = infoPanel.entidad
              const desc = (e.contenido || '').replace(/<[^>]+>/g, '').trim().slice(0, 300)
              const stats = Object.entries(e.metadatos || {}).filter(
                ([k, v]) => !['id', 'nombre', 'descripcion'].includes(k) && !Array.isArray(v) && typeof v !== 'object'
              ).slice(0, 8)
              return (
                <div className="fixed z-50"
                     style={{ left: infoPanel.x, top: infoPanel.y }}>
                  <div className="bg-[#1f1f23] border border-gothic-gold/50 rounded-sm shadow-gothic-lg
                                  px-3.5 py-3 max-w-[300px]"
                       style={{ backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm"><Icono tipo={ICONOS[e.categoria]} /></span>
                        <span className="text-sm font-bold font-titulo text-gothic-gold-light">
                          {e.metadatos?.nombre || e.archivo}
                        </span>
                      </div>
                      <button onClick={() => setInfoPanel(null)}
                        className="text-gothic-parchment/40 hover:text-gothic-parchment text-xs leading-none">
                        <Icono tipo="x" size={14} />
                      </button>
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

            {/* Navegación */}
            <div className="flex flex-col gap-1 px-4 py-2 border-t border-gothic-gold/15 bg-gothic-bg/80 shrink-0">
              {/* Fila 1: navegación */}
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => irA(0)}
                        disabled={paginaActual === 0}
                        className="px-2 py-1 rounded-sm text-xs uppercase tracking-wider font-serif
                                   border border-gothic-gold/30 text-gothic-gold/60
                                   hover:bg-gothic-gold/10 disabled:opacity-30 disabled:cursor-not-allowed">⏮</button>
                <button onClick={() => irA(paginaActual - paso)}
                        disabled={paginaActual < paso}
                        className="px-3 py-1 rounded-sm text-xs uppercase tracking-wider font-serif
                                   border border-gothic-gold/30 text-gothic-gold-light
                                   hover:bg-gothic-gold/10 disabled:opacity-30 disabled:cursor-not-allowed">
                  ← Anterior
                </button>

                {/* Selector de capítulo */}
                <select
                  value={capituloActual}
                  onChange={(e) => irACapitulo(parseInt(e.target.value, 10))}
                  className="bg-gothic-bg border border-gothic-gold/30 text-gothic-gold-light text-xs
                             rounded-sm px-2 py-1 font-serif cursor-pointer hover:bg-gothic-gold/10
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {capitulos.map((c, i) => (
                    <option key={i} value={i}>
                      {c.metadatos?.titulo || `Capítulo ${i + 1}`}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 px-3">
                  <span className="text-xs font-mono text-gothic-gold/50">
                    {paginaActual + 1}{!modoSimple && ` – ${Math.min(paginaActual + 2, paginasVirtuales.length)}`}
                  </span>
                  <span className="text-[8px] text-gothic-gold/30">de</span>
                  <span className="text-xs font-mono text-gothic-gold/50">{paginasVirtuales.length}</span>
                </div>

                {/* Ir a página */}
                <input
                  type="number"
                  min={1}
                  max={paginasVirtuales.length}
                  value={paginaInput}
                  onChange={(e) => setPaginaInput(e.target.value)}
                  onKeyDown={handleIrAPagina}
                  placeholder="Ir a"
                  disabled={paginaActual >= paginasVirtuales.length - paso}
                  className="w-14 bg-gothic-bg border border-gothic-gold/30 text-gothic-gold-light text-xs
                             rounded-sm px-2 py-1 font-mono placeholder:text-gothic-gold/30
                             disabled:opacity-30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button onClick={() => irA(paginaActual + paso)}
                        disabled={paginaActual >= paginasVirtuales.length - paso }
                        className="px-3 py-1 rounded-sm text-xs uppercase tracking-wider font-serif
                                   border border-gothic-gold/30 text-gothic-gold-light
                                   hover:bg-gothic-gold/10 disabled:opacity-30 disabled:cursor-not-allowed">
                  Siguiente →
                </button>
                <button onClick={() => {
                  const ultimo = paginasVirtuales.length - 1
                  irA(modoSimple ? ultimo : (ultimo % 2 === 0 ? ultimo : ultimo - 1))
                }}
                        disabled={paginaActual >= paginasVirtuales.length - paso }
                        className="px-2 py-1 rounded-sm text-xs uppercase tracking-wider font-serif
                                   border border-gothic-gold/30 text-gothic-gold/60
                                   hover:bg-gothic-gold/10 disabled:opacity-30 disabled:cursor-not-allowed">⏭</button>
              </div>

              {/* Fila 2: herramientas */}
              <div className="flex items-center justify-center gap-3">
                {/* Tamaño de letra */}
                <div className="flex items-center gap-1">
                  <button onClick={() => setTamanioFuente(s => Math.max(8, s - 1))}
                          className="px-1.5 py-0.5 rounded-sm text-xs border border-gothic-gold/30
                                     text-gothic-gold/60 hover:bg-gothic-gold/10 leading-none"
                          title="Reducir letra">Aa−</button>
                  <span className="text-[10px] font-mono text-gothic-gold/50 w-6 text-center">{tamanioFuente}px</span>
                  <button onClick={() => setTamanioFuente(s => Math.min(20, s + 1))}
                          className="px-1.5 py-0.5 rounded-sm text-xs border border-gothic-gold/30
                                     text-gothic-gold/60 hover:bg-gothic-gold/10 leading-none"
                          title="Aumentar letra">Aa+</button>
                </div>

                <span className="text-gothic-gold/20">|</span>

                {/* Modo simple / doble página */}
                <button onClick={() => setModoSimple(s => !s)}
                        className={`px-2 py-0.5 rounded-sm text-xs border leading-none
                                    ${modoSimple
                                      ? 'border-gothic-gold/60 text-gothic-gold-light bg-gothic-gold/10'
                                      : 'border-gothic-gold/30 text-gothic-gold/60 hover:bg-gothic-gold/10'}`}
                        title="Alternar una/dos páginas">
                  ◐ {modoSimple ? '1 pág' : '2 pág'}
                </button>

                {/* Pantalla completa */}
                <button onClick={() => setPantallaCompleta(s => !s)}
                        className={`px-2 py-0.5 rounded-sm text-xs border leading-none
                                    ${pantallaCompleta
                                      ? 'border-gothic-gold/60 text-gothic-gold-light bg-gothic-gold/10'
                                      : 'border-gothic-gold/30 text-gothic-gold/60 hover:bg-gothic-gold/10'}`}
                        title="Pantalla completa">
                  ⛶ {pantallaCompleta ? 'Normal' : 'Completa'}
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="h-0.5 bg-gothic-bg shrink-0">
              <div className="h-full bg-gradient-to-r from-gothic-gold/40 to-gothic-gold-light transition-all duration-500"
                   style={{ width: `${((paginaActual + 1) / Math.max(paginasVirtuales.length, 1)) * 100}%` }} />
            </div>
          </>
        )}
      </div>
    </VentanaFlotante>
  )
}
