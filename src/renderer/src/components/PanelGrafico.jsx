import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { useCodice } from '../context/CodiceContext'
import VentanaFlotante from './VentanaFlotante'
import Icono from './Icono'
import ModalCodice from './ModalCodice'

const COLORES = {
  personajes: '#c9a84c',
  lugares: '#6a9a9a',
  magia: '#9a6a9a',
  criaturas: '#6a9a6a',
  dioses: '#c9a84c',
  historia: '#9a8a6a',
  objetos: '#c46a6a',
  facciones: '#6a8a9a',
  clases: '#8a6a9a',
  razas: '#6a9a8a',
  tipos: '#8a8a8a'
}

const TAM_NODO = 28

function obtenerRelacionesEntidad(metadatos, categoria, relacionesConfig) {
  const rels = relacionesConfig?.[categoria]
  if (!rels) return []
  const resultado = []
  for (const [campo, config] of Object.entries(rels)) {
    const valor = metadatos?.[campo]
    if (!valor) continue
    const nombres = Array.isArray(valor) ? valor : [valor]
    for (const nombre of nombres) {
      if (typeof nombre === 'string' && nombre.trim()) {
        resultado.push({ nombre: nombre.trim(), tipo: config.tipo, etiqueta: config.etiqueta || campo })
      }
    }
  }
  return resultado
}

export default function PanelGrafico() {
  const { indexProyecto, CATEGORIAS, ETIQUETAS, ICONOS, relacionesConfig, seleccionarElemento, entidadPorNombre } = useCodice()
  const svgRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [dim, setDim] = useState(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(null)
  const [panInicio, setPanInicio] = useState(null)
  const [hoverNodo, setHoverNodo] = useState(null)
  const [modalElemento, setModalElemento] = useState(null)
  const [modalKey, setModalKey] = useState(0)
  const [categoriasActivas, setCategoriasActivas] = useState(() => Object.fromEntries(CATEGORIAS.map(c => [c, true])))
  const simRef = useRef(null)

  const centro = dim ? { x: dim.w / 2, y: dim.h / 2 } : { x: 0, y: 0 }
  const tx = centro.x + pan.x
  const ty = centro.y + pan.y

  const entidadesPlanas = useMemo(() => {
    const mapa = {}
    for (const cat of CATEGORIAS) {
      for (const el of indexProyecto[cat] || []) {
        const nombre = el.metadatos?.nombre
        if (nombre) mapa[nombre.toLowerCase()] = { ...el, categoria: cat }
      }
    }
    return mapa
  }, [indexProyecto])

  useEffect(() => {
    const actualizarDim = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setDim({ w: rect.width, h: rect.height })
        setPan({ x: 0, y: 0 })
        setScale(1)
      }
    }
    actualizarDim()
    const obs = new ResizeObserver(actualizarDim)
    if (svgRef.current) obs.observe(svgRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!dim) return
    const nodosMap = {}
    const edgesList = []
    const nodosList = []

    for (const cat of CATEGORIAS) {
      if (!categoriasActivas[cat]) continue
      for (const el of indexProyecto[cat] || []) {
        const nombre = el.metadatos?.nombre
        if (!nombre) continue
        nodosMap[el.ruta] = { id: el.ruta, label: nombre, categoria: cat, x: 0, y: 0 }
      }
    }

    for (const cat of CATEGORIAS) {
      if (!categoriasActivas[cat]) continue
      for (const el of indexProyecto[cat] || []) {
        const rels = obtenerRelacionesEntidad(el.metadatos, cat, relacionesConfig)
        for (const ref of rels) {
          const target = entidadPorNombre(ref.nombre)
          if (target && nodosMap[target.ruta] && target.ruta !== el.ruta) {
            edgesList.push({ source: el.ruta, target: target.ruta, label: ref.etiqueta })
          }
        }
      }
    }

    for (const n of Object.values(nodosMap)) nodosList.push(n)

    setNodes(nodosList)
    setEdges(edgesList)

    if (nodosList.length > 0) {
      const sim = forceSimulation(nodosList)
        .force('link', forceLink(edgesList).id(d => d.id).distance(120))
        .force('charge', forceManyBody().strength(-300))
        .force('center', forceCenter(0, 0))
        .force('collide', forceCollide(TAM_NODO + 10))
        .on('tick', () => {
          setNodes([...nodosList])
        })
      simRef.current = sim
      return () => { sim.stop(); simRef.current = null }
    }
  }, [indexProyecto, categoriasActivas, dim])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(s => Math.max(0.2, Math.min(5, s * delta)))
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && !e.target.closest('.nodo-grafico')) {
      setPanInicio({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (panInicio) {
      const dx = e.clientX - panInicio.x
      const dy = e.clientY - panInicio.y
      setPan(p => ({ x: p.x + dx, y: p.y + dy }))
      setPanInicio({ x: e.clientX, y: e.clientY })
    }
    if (arrastrando) {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const x = (e.clientX - rect.left - tx) / scale
      const y = (e.clientY - rect.top - ty) / scale
      const idx = nodes.findIndex(n => n.id === arrastrando)
      if (idx !== -1) {
        nodes[idx].fx = x
        nodes[idx].fy = y
        setNodes([...nodes])
        if (simRef.current) simRef.current.alpha(0.3).restart()
      }
    }
  }, [panInicio, arrastrando, nodes, tx, ty, scale])

  const handleMouseUp = useCallback(() => {
    setPanInicio(null)
    if (arrastrando) {
      const idx = nodes.findIndex(n => n.id === arrastrando)
      if (idx !== -1) {
        nodes[idx].fx = null
        nodes[idx].fy = null
        setNodes([...nodes])
      }
      setArrastrando(null)
    }
  }, [arrastrando, nodes])

  const iniciarArrastre = useCallback((e, nodeId) => {
    e.stopPropagation()
    setArrastrando(nodeId)
  }, [])

  const handleClickNodo = useCallback(async (nodeId) => {
    const ent = entidadesPlanas[Object.values(entidadesPlanas).find(e => e.ruta === nodeId)?.metadatos?.nombre?.toLowerCase()]
    if (!ent) return
    await seleccionarElemento(ent)
    setModalElemento(ent)
    setModalKey(k => k + 1)
  }, [entidadesPlanas, seleccionarElemento])

  const alternarCategoria = (cat) => {
    setCategoriasActivas(p => ({ ...p, [cat]: !p[cat] }))
  }

  const todasActivas = Object.values(categoriasActivas).every(Boolean)
  const algunaActiva = Object.values(categoriasActivas).some(Boolean)

  return (
    <VentanaFlotante titulo="GRÁFICO DE RELACIONES" sinScroll={true}>
      <div className="h-full flex flex-col min-h-0">
        {/* Filtros */}
        <div className="px-4 py-2 border-b border-gothic-gold/15 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setCategoriasActivas(Object.fromEntries(CATEGORIAS.map(c => [c, !todasActivas])))}
              className="px-2 py-0.5 rounded-sm text-[9px] tracking-wider uppercase font-serif border border-gothic-gold/20 text-gothic-gold/50 hover:text-gothic-gold-light hover:bg-gothic-gold/5 transition-all">
              {todasActivas ? '✕ Todas' : '✓ Todas'}
            </button>
            {CATEGORIAS.map(cat => (
              <button key={cat} onClick={() => alternarCategoria(cat)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] tracking-wider uppercase font-serif border transition-all"
                style={{
                  borderColor: categoriasActivas[cat] ? `${COLORES[cat]}60` : 'rgba(138,115,55,0.15)',
                  color: categoriasActivas[cat] ? COLORES[cat] : 'rgba(138,115,55,0.35)',
                  background: categoriasActivas[cat] ? `${COLORES[cat]}10` : 'transparent'
                }}>
                <Icono tipo={cat} size={10} />
                {ETIQUETAS[cat]}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-gothic-gold/30 font-mono mt-1.5">
            {nodes.length} nodos · {edges.length} conexiones · Arrastra nodos para reposicionar · Rueda para zoom
          </p>
        </div>

        {/* SVG Graph */}
        <div className="flex-1 overflow-hidden relative" ref={svgRef}>
          {!algunaActiva ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gothic-parchment/30 italic font-lectura">
                Selecciona al menos una categoría para mostrar.
              </p>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gothic-parchment/30 italic font-lectura">
                No hay suficientes entidades con relaciones para mostrar un gráfico.
              </p>
            </div>
          ) : (
            <svg width="100%" height="100%"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: panInicio ? 'grabbing' : 'grab' }}>
              <g transform={`translate(${tx}, ${ty}) scale(${scale})`}>
                {/* Edges */}
                {edges.map((edge, i) => {
                  const source = nodes.find(n => n.id === (typeof edge.source === 'object' ? edge.source.id : edge.source))
                  const target = nodes.find(n => n.id === (typeof edge.target === 'object' ? edge.target.id : edge.target))
                  if (!source || !target) return null
                  const dx = target.x - source.x
                  const dy = target.y - source.y
                  const dist = Math.sqrt(dx * dx + dy * dy) || 1
                  const mx = (source.x + target.x) / 2
                  const my = (source.y + target.y) / 2
                  const nx = -dy / dist * 20
                  const ny = dx / dist * 20
                  const cx = mx + nx
                  const cy = my + ny
                  return (
                    <g key={`edge-${i}`}>
                      <path d={`M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
                        fill="none" stroke="rgba(138,115,55,0.2)" strokeWidth="1" />
                      <text x={cx} y={cy - 6} textAnchor="middle"
                        className="text-[7px] font-mono select-none pointer-events-none"
                        fill="rgba(138,115,55,0.35)">
                        {edge.label}
                      </text>
                    </g>
                  )
                })}

                {/* Nodes */}
                {nodes.map(n => {
                  const color = COLORES[n.categoria] || '#888'
                  const esHover = hoverNodo === n.id
                  return (
                    <g key={n.id} className="nodo-grafico" style={{ cursor: 'pointer' }}
                      transform={`translate(${n.x}, ${n.y})`}
                      onMouseEnter={() => setHoverNodo(n.id)}
                      onMouseLeave={() => setHoverNodo(null)}
                      onMouseDown={(e) => iniciarArrastre(e, n.id)}
                      onClick={() => handleClickNodo(n.id)}>
                      <circle r={esHover ? TAM_NODO + 4 : TAM_NODO}
                        fill={esHover ? `${color}30` : `${color}15`}
                        stroke={esHover ? color : `${color}50`}
                        strokeWidth={esHover ? 2 : 1.5}
                        transition="all 0.15s" />
                      <circle r={TAM_NODO - 8}
                        fill={`${color}40`}
                        stroke="none" />
                      <text textAnchor="middle" dy="0.35em"
                        className="text-[8px] font-serif select-none pointer-events-none"
                        fill={color}>
                        {n.label.charAt(0).toUpperCase()}
                      </text>
                      <text textAnchor="middle" dy={TAM_NODO + 12}
                        className="text-[8px] font-serif select-none pointer-events-none"
                        fill={esHover ? color : 'rgba(230,223,200,0.5)'}
                        style={{ paintOrder: 'stroke', stroke: '#1a1a1e', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        {n.label.length > 15 ? n.label.slice(0, 14) + '…' : n.label}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          )}
        </div>
      </div>

      {modalElemento && (
        <ModalCodice key={modalKey} elementoSeleccionado={modalElemento}
          relacionesConfig={relacionesConfig}
          onClose={() => setModalElemento(null)} />
      )}
    </VentanaFlotante>
  )
}
