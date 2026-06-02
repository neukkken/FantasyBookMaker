import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CATEGORIAS_FALLBACK = [
  'personajes', 'lugares', 'magia', 'criaturas',
  'dioses', 'historia', 'objetos', 'facciones',
  'clases', 'razas', 'tipos'
]

const ETIQUETAS_FALLBACK = {
  personajes: 'Personajes', lugares: 'Lugares', magia: 'Magia', criaturas: 'Criaturas',
  dioses: 'Dioses', historia: 'Historia', objetos: 'Objetos', facciones: 'Facciones',
  clases: 'Clases', razas: 'Razas', tipos: 'Tipos'
}

const ICONOS_FALLBACK = {
  personajes: 'personajes', lugares: 'lugares', magia: 'magia', criaturas: 'criaturas',
  dioses: 'dioses', historia: 'historia', objetos: 'objetos', facciones: 'facciones',
  clases: 'clases', razas: 'razas', tipos: 'tipos'
}

const CodiceContext = createContext(null)

export function CodiceProvider({ children }) {
  const [indexProyecto, setIndexProyecto] = useState({})
  const [elementoSeleccionado, setElementoSeleccionado] = useState(null)
  const [rutaProyecto, setRutaProyecto] = useState(null)
  const [contenidoEditor, setContenidoEditor] = useState('')
  const [relacionesConfig, setRelacionesConfig] = useState(null)
  const [esquema, setEsquema] = useState(null)
  const [versionManuscrito, setVersionManuscrito] = useState(0)
  const [ultimoGuardado, setUltimoGuardado] = useState(null)
  const [categorias, setCategorias] = useState(CATEGORIAS_FALLBACK)
  const [etiquetas, setEtiquetas] = useState(ETIQUETAS_FALLBACK)
  const [iconos, setIconos] = useState(ICONOS_FALLBACK)

  useEffect(() => {
    window.api.pedirRelaciones().then(setRelacionesConfig)
  }, [])

  const cargarEsquema = useCallback(async (ruta) => {
    if (!ruta) { setEsquema(null); return }
    const resultado = await window.api.obtenerEsquema(ruta)
    setEsquema(resultado)
  }, [])

  const cargarCategorias = useCallback(async (ruta) => {
    if (!ruta) {
      setCategorias(CATEGORIAS_FALLBACK)
      setEtiquetas(ETIQUETAS_FALLBACK)
      setIconos(ICONOS_FALLBACK)
      return
    }
    const cats = await window.api.categorias.listar(ruta)
    setCategorias(cats.map(c => c.nombre))
    setEtiquetas(Object.fromEntries(cats.map(c => [c.nombre, c.etiqueta])))
    setIconos(Object.fromEntries(cats.map(c => [c.nombre, c.icono])))
  }, [])

  const refrescarIndex = useCallback(async (ruta) => {
    const resultado = await window.api.pedirIndex(ruta)
    setIndexProyecto(resultado)
  }, [])

  const cargarProyecto = useCallback(async (ruta) => {
    await window.api.inicializarProyecto(ruta)
    const resultado = await window.api.pedirIndex(ruta)
    setIndexProyecto(resultado)
    setRutaProyecto(ruta)
    setElementoSeleccionado(null)
    setContenidoEditor('')
    await Promise.all([cargarEsquema(ruta), cargarCategorias(ruta)])
  }, [cargarEsquema, cargarCategorias])

  const seleccionarElemento = useCallback(async (elemento) => {
    try {
      const completo = await window.api.leerArchivo(rutaProyecto, elemento.ruta)
      if (!completo) {
        console.error('[FantasyBook] Elemento no encontrado:', elemento.ruta)
        return
      }
      setElementoSeleccionado(completo)
      setContenidoEditor(completo.contenido)
    } catch (err) {
      console.error('[FantasyBook] Error al seleccionar elemento:', err)
    }
  }, [rutaProyecto])

  const navegarA = useCallback(async (ruta) => {
    try {
      const completo = await window.api.leerArchivo(rutaProyecto, ruta)
      if (!completo) return
      setElementoSeleccionado(completo)
      setContenidoEditor(completo.contenido)
    } catch (err) {
      console.error('[FantasyBook] Error al navegar:', err)
    }
  }, [rutaProyecto])

  const limpiarSeleccion = useCallback(() => {
    setElementoSeleccionado(null)
    setContenidoEditor('')
  }, [])

  const crearNuevoElemento = useCallback(async (nombre, categoria) => {
    if (!rutaProyecto) return null
    const resultado = await window.api.db.create(rutaProyecto, categoria, { nombre })
    if (!resultado.exito) {
      console.error('[FantasyBook] Error al crear:', resultado.error)
      return null
    }
    await refrescarIndex(rutaProyecto)
    return resultado.datos
  }, [rutaProyecto, refrescarIndex])

  const guardarElemento = useCallback(async (ruta, metadatos, contenido) => {
    const resultado = await window.api.db.update(rutaProyecto, ruta, metadatos, contenido)
    if (!resultado.exito) {
      console.error('[FantasyBook] Error al guardar:', resultado.error)
    }
    return resultado
  }, [rutaProyecto])

  const eliminarElemento = useCallback(async (ruta) => {
    if (!ruta) return null
    const resultado = await window.api.db.delete(rutaProyecto, ruta)
    if (!resultado.exito) {
      console.error('[FantasyBook] Error al eliminar:', resultado.error)
      return null
    }
    if (rutaProyecto) await refrescarIndex(rutaProyecto)
    if (elementoSeleccionado?.ruta === ruta) limpiarSeleccion()
    return resultado
  }, [rutaProyecto, elementoSeleccionado?.ruta, refrescarIndex, limpiarSeleccion])

  const notificarGuardado = useCallback(() => {
    setVersionManuscrito((v) => v + 1)
    setUltimoGuardado(Date.now())
  }, [])

  const entidadPorNombre = useCallback((nombre) => {
    if (!nombre || !indexProyecto) return null
    for (const cat of categorias) {
      const encontrado = (indexProyecto[cat] || []).find(
        (e) => e.metadatos?.nombre === nombre
      )
      if (encontrado) return encontrado
    }
    return null
  }, [indexProyecto, categorias])

  return (
    <CodiceContext.Provider
      value={{
        indexProyecto,
        elementoSeleccionado,
        rutaProyecto,
        contenidoEditor,
        setContenidoEditor,
        CATEGORIAS: categorias,
        ETIQUETAS: etiquetas,
        ICONOS: iconos,
        relacionesConfig,
        esquema,
        cargarEsquema,
        cargarCategorias,
        cargarProyecto,
        seleccionarElemento,
        navegarA,
        limpiarSeleccion,
        crearNuevoElemento,
        guardarElemento,
        eliminarElemento,
        notificarGuardado,
        versionManuscrito,
        ultimoGuardado,
        refrescarIndex,
        entidadPorNombre
      }}
    >
      {children}
    </CodiceContext.Provider>
  )
}

export function useCodice() {
  const ctx = useContext(CodiceContext)
  if (!ctx) throw new Error('useCodice debe usarse dentro de un CodiceProvider')
  return ctx
}
