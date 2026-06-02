import { randomUUID } from 'crypto'
import { getDb, guardarDb } from './database'

const CATEGORIAS = [
  'personajes', 'lugares', 'magia', 'criaturas',
  'dioses', 'historia', 'objetos', 'facciones',
  'clases', 'razas', 'tipos'
]

const ICONOS = Object.fromEntries(CATEGORIAS.map(c => [c, c]))

const _PLANTILLAS = {
  personajes: { raza: '', clase: '', nivel: 1, fuerza: 10, destreza: 10, intelecto: 10, carisma: 10, lugar_origen: '', faccion: '', habilidades: '', rango_real: '', rango_publico: '', sirvientes: [] },
  lugares: { lugar_origen: '' },
  magia: { nivel: 1, coste: '', efecto: '', rango_requerido: '', desgaste_biologico: '', lugar_origen: '' },
  criaturas: { habitat: '', habilidades: '', tipo_pacto: '', pacto_pago: '', dominador: '', lugar_origen: '' },
  dioses: { dominio: '', simbolo: '', lugar_origen: '' },
  historia: { era: '', fecha: '', lugar_origen: '' },
  objetos: { material: '', poder: 0, lugar_origen: '' },
  facciones: { ideologia: '', lugar_origen: '' },
  clases: { descripcion: '', lugar_origen: '' },
  razas: { habilidades: '', descripcion: '', lugar_origen: '' },
  tipos: { descripcion: '' }
}

const _RELACIONES = {
  personajes: {
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar de origen' },
    raza: { tipo: 'ref', categoria: 'razas', etiqueta: 'Raza' },
    clase: { tipo: 'ref', categoria: 'clases', etiqueta: 'Clase' },
    faccion: { tipo: 'ref', categoria: 'facciones', etiqueta: 'Facción' },
    objetos: { tipo: 'array', categoria: 'objetos', etiqueta: 'Pertenencias' },
    hechizos: { tipo: 'array', categoria: 'magia', etiqueta: 'Hechizos' },
    aliados: { tipo: 'array', categoria: 'personajes', etiqueta: 'Aliados' },
    deidad: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Deidad' },
    historia: { tipo: 'ref', categoria: 'historia', etiqueta: 'Evento clave' },
    sirvientes: { tipo: 'array', categoria: 'criaturas', etiqueta: 'Sirvientes' }
  },
  lugares: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    peligrosidad: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Peligrosidad' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Región/Continente' },
    gobernante: { tipo: 'ref', categoria: 'personajes', etiqueta: 'Gobernante' },
    habitantes: { tipo: 'array', categoria: 'personajes', etiqueta: 'Habitantes' },
    criaturas: { tipo: 'array', categoria: 'criaturas', etiqueta: 'Criaturas' },
    facciones: { tipo: 'array', categoria: 'facciones', etiqueta: 'Facciones' },
    historia: { tipo: 'array', categoria: 'historia', etiqueta: 'Eventos' },
    dioses: { tipo: 'array', categoria: 'dioses', etiqueta: 'Deidades' },
    magia_ambiental: { tipo: 'ref', categoria: 'magia', etiqueta: 'Magia ambiental' }
  },
  magia: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    escuela: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Escuela' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar de origen' },
    dioses: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Deidad' },
    usado_por: { tipo: 'array', categoria: 'personajes', etiqueta: 'Usuarios' },
    criaturas: { tipo: 'array', categoria: 'criaturas', etiqueta: 'Criaturas asociadas' },
    objetos: { tipo: 'array', categoria: 'objetos', etiqueta: 'Objetos vinculados' },
    historia: { tipo: 'ref', categoria: 'historia', etiqueta: 'Descubrimiento' }
  },
  criaturas: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    peligrosidad: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Peligrosidad' },
    rareza: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Rareza' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar de origen' },
    habitat: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Hábitat' },
    creador: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Creador' },
    debilidades: { tipo: 'array', categoria: 'magia', etiqueta: 'Debilidades' },
    domesticado_por: { tipo: 'ref', categoria: 'facciones', etiqueta: 'Domesticado por' },
    montura_de: { tipo: 'array', categoria: 'personajes', etiqueta: 'Montura de' },
    origen: { tipo: 'ref', categoria: 'historia', etiqueta: 'Origen' },
    drop: { tipo: 'array', categoria: 'objetos', etiqueta: 'Despojos' },
    dominador: { tipo: 'ref', categoria: 'personajes', etiqueta: 'Dominador' }
  },
  dioses: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    alineamiento: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Alineamiento' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar de origen' },
    seguidores: { tipo: 'array', categoria: 'personajes', etiqueta: 'Seguidores' },
    lugares_sagrados: { tipo: 'array', categoria: 'lugares', etiqueta: 'Templos' },
    criaturas: { tipo: 'array', categoria: 'criaturas', etiqueta: 'Criaturas' },
    dominio_magico: { tipo: 'ref', categoria: 'magia', etiqueta: 'Dominio mágico' },
    artefactos: { tipo: 'array', categoria: 'objetos', etiqueta: 'Reliquias' },
    orden_religiosa: { tipo: 'ref', categoria: 'facciones', etiqueta: 'Orden' },
    mitologia: { tipo: 'array', categoria: 'historia', etiqueta: 'Mitos' }
  },
  historia: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar' },
    protagonistas: { tipo: 'array', categoria: 'personajes', etiqueta: 'Protagonistas' },
    lugares: { tipo: 'array', categoria: 'lugares', etiqueta: 'Lugares' },
    facciones: { tipo: 'array', categoria: 'facciones', etiqueta: 'Facciones' },
    objetos: { tipo: 'array', categoria: 'objetos', etiqueta: 'Artefactos' },
    magia_involucrada: { tipo: 'array', categoria: 'magia', etiqueta: 'Magia' },
    criaturas: { tipo: 'array', categoria: 'criaturas', etiqueta: 'Criaturas' },
    intervencion_divina: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Intervención divina' }
  },
  objetos: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    rareza: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Rareza' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar de origen' },
    portador: { tipo: 'ref', categoria: 'personajes', etiqueta: 'Portador' },
    forjado_con: { tipo: 'ref', categoria: 'magia', etiqueta: 'Magia' },
    historia: { tipo: 'ref', categoria: 'historia', etiqueta: 'Historia' },
    material_de: { tipo: 'ref', categoria: 'criaturas', etiqueta: 'Material de' },
    propiedad_de: { tipo: 'ref', categoria: 'facciones', etiqueta: 'Propiedad de' },
    bendecido_por: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Bendecido por' }
  },
  facciones: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Sede/Territorio' },
    lider: { tipo: 'ref', categoria: 'personajes', etiqueta: 'Líder' },
    miembros: { tipo: 'array', categoria: 'personajes', etiqueta: 'Miembros' },
    clases_requeridas: { tipo: 'array', categoria: 'clases', etiqueta: 'Clases requeridas' },
    territorios: { tipo: 'array', categoria: 'lugares', etiqueta: 'Territorios' },
    aliados: { tipo: 'array', categoria: 'facciones', etiqueta: 'Aliados' },
    enemigos: { tipo: 'array', categoria: 'facciones', etiqueta: 'Enemigos' },
    tesoros: { tipo: 'array', categoria: 'objetos', etiqueta: 'Tesoros' },
    magias: { tipo: 'array', categoria: 'magia', etiqueta: 'Artes' },
    emblema_animal: { tipo: 'ref', categoria: 'criaturas', etiqueta: 'Emblema' },
    deidad_patrona: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Deidad patrona' },
    historia: { tipo: 'ref', categoria: 'historia', etiqueta: 'Fundación' }
  },
  clases: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar de origen' },
    entrenadores: { tipo: 'array', categoria: 'personajes', etiqueta: 'Maestros' },
    escuelas: { tipo: 'array', categoria: 'lugares', etiqueta: 'Escuelas' },
    ordenes: { tipo: 'array', categoria: 'facciones', etiqueta: 'Órdenes' },
    hechizos: { tipo: 'array', categoria: 'magia', etiqueta: 'Habilidades' },
    equipamiento: { tipo: 'array', categoria: 'objetos', etiqueta: 'Equipo' },
    deidad: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Deidad patrona' },
    historia: { tipo: 'ref', categoria: 'historia', etiqueta: 'Origen' }
  },
  razas: {
    tipo: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Tipo' },
    hostilidad: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Hostilidad' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Lugar de origen' },
    origenes: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Origen' },
    personajes_ilustres: { tipo: 'array', categoria: 'personajes', etiqueta: 'Personajes ilustres' },
    deidad_creadora: { tipo: 'ref', categoria: 'dioses', etiqueta: 'Deidad creadora' },
    habilidades_raciales: { tipo: 'array', categoria: 'magia', etiqueta: 'Habilidades raciales' },
    historia: { tipo: 'ref', categoria: 'historia', etiqueta: 'Historia' },
    facciones_comunes: { tipo: 'array', categoria: 'facciones', etiqueta: 'Facciones comunes' }
  },
  tipos: {
    descripcion: { tipo: 'ref', categoria: 'tipos', etiqueta: 'Subtipo' },
    lugar_origen: { tipo: 'ref', categoria: 'lugares', etiqueta: 'Origen' }
  }
}

function escapar(val) {
  if (val === null || val === undefined) return "''"
  return `'${String(val).replace(/'/g, "''")}'`
}

function primeraFila(db, sql) {
  const r = db.exec(sql)
  return (r[0] && r[0].values.length) ? r[0].values[0] : null
}

function todasFilas(db, sql) {
  const r = db.exec(sql)
  return r[0] ? r[0].values : []
}

function _parsearDefecto(valor, tipo) {
  if (tipo === 'number') return Number(valor)
  if (tipo === 'array') {
    try { return JSON.parse(valor) } catch { return [] }
  }
  return valor || ''
}

function _esquemaDbAObjeto(db) {
  const rows = todasFilas(db, 'SELECT categoria, campo, tipo, ref_categoria, etiqueta, defecto, orden FROM esquemas ORDER BY categoria, orden')
  const esquema = {}
  for (const r of rows) {
    const [categoria, campo, tipo, ref_categoria, etiqueta, defecto] = r
    if (!esquema[categoria]) esquema[categoria] = {}
    esquema[categoria][campo] = {
      tipo,
      ref_categoria,
      etiqueta: etiqueta || campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      defecto: _parsearDefecto(defecto, tipo)
    }
  }
  return esquema
}

function _generarEsquemaSeed() {
  const esquema = {}
  for (const cat of CATEGORIAS) {
    const campos = {}
    const plantilla = _PLANTILLAS[cat] || {}
    const relaciones = _RELACIONES[cat] || {}
    const vistos = new Set()
    for (const [campo, def] of Object.entries(relaciones)) {
      vistos.add(campo)
      campos[campo] = {
        tipo: def.tipo,
        ref_categoria: def.categoria,
        etiqueta: def.etiqueta,
        defecto: campo in plantilla ? plantilla[campo] : (def.tipo === 'array' ? [] : '')
      }
    }
    for (const [campo, valor] of Object.entries(plantilla)) {
      if (vistos.has(campo)) continue
      campos[campo] = {
        tipo: Array.isArray(valor) ? 'array' : typeof valor,
        ref_categoria: null,
        etiqueta: campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        defecto: valor
      }
    }
    esquema[cat] = campos
  }
  return esquema
}

function _inicializarEsquema(db) {
  const existing = db.exec('SELECT COUNT(*) FROM esquemas')
  if (existing[0] && existing[0].values[0][0] > 0) return
  const seed = _generarEsquemaSeed()
  for (const [cat, campos] of Object.entries(seed)) {
    let orden = 0
    for (const [campo, info] of Object.entries(campos)) {
      const defectoStr = Array.isArray(info.defecto) ? JSON.stringify(info.defecto) : String(info.defecto ?? '')
      db.run('INSERT INTO esquemas (categoria, campo, tipo, ref_categoria, etiqueta, defecto, orden) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cat, campo, info.tipo, info.ref_categoria, info.etiqueta, defectoStr, orden])
      orden++
    }
  }
}

const _ICONOS_POR_DEFECTO = {
  personajes: 'personajes', lugares: 'lugares', magia: 'magia', criaturas: 'criaturas',
  dioses: 'dioses', historia: 'historia', objetos: 'objetos', facciones: 'facciones',
  clases: 'clases', razas: 'razas', tipos: 'tipos'
}

const _ETIQUETAS_POR_DEFECTO = {
  personajes: 'Personajes', lugares: 'Lugares', magia: 'Magia', criaturas: 'Criaturas',
  dioses: 'Dioses', historia: 'Historia', objetos: 'Objetos', facciones: 'Facciones',
  clases: 'Clases', razas: 'Razas', tipos: 'Tipos'
}

function _inicializarCategorias(db) {
  const existing = db.exec('SELECT COUNT(*) FROM categorias')
  if (existing[0] && existing[0].values[0][0] > 0) return
  for (let i = 0; i < CATEGORIAS.length; i++) {
    const cat = CATEGORIAS[i]
    db.run('INSERT INTO categorias (nombre, etiqueta, icono, orden) VALUES (?, ?, ?, ?)',
      [cat, _ETIQUETAS_POR_DEFECTO[cat] || cat, _ICONOS_POR_DEFECTO[cat] || 'circle', i])
  }
}

async function listarCategorias(rutaRaiz) {
  const { db } = await getDb(rutaRaiz)
  const rows = todasFilas(db, 'SELECT nombre, etiqueta, icono, orden FROM categorias ORDER BY orden')
  return rows.map(r => ({ nombre: r[0], etiqueta: r[1], icono: r[2], orden: r[3] }))
}

async function crearCategoria(rutaRaiz, nombre, etiqueta, icono) {
  try {
    const n = nombre.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    if (!n) return { exito: false, error: 'El nombre debe contener al menos un carácter válido.' }
    const { db } = await getDb(rutaRaiz)
    const existing = db.exec(`SELECT COUNT(*) FROM categorias WHERE nombre = '${n.replace(/'/g, "''")}'`)
    if (existing[0] && existing[0].values[0][0] > 0) {
      return { exito: false, error: 'Ya existe una categoría con ese nombre.' }
    }
    const maxOrd = db.exec('SELECT MAX(orden) FROM categorias')
    const orden = (maxOrd[0] && maxOrd[0].values[0][0] != null) ? maxOrd[0].values[0][0] + 1 : CATEGORIAS.length
    const icon = icono || 'circle'
    db.run('INSERT INTO categorias (nombre, etiqueta, icono, orden) VALUES (?, ?, ?, ?)',
      [n, etiqueta || n, icon, orden])
    guardarDb(rutaRaiz)
    return { exito: true, datos: { nombre: n, etiqueta: etiqueta || n, icono: icon, orden } }
  } catch (err) {
    return { exito: false, error: `Error al crear categoría: ${err.message}` }
  }
}

async function eliminarCategoria(rutaRaiz, nombre) {
  try {
    const { db } = await getDb(rutaRaiz)
    const count = db.exec(`SELECT COUNT(*) FROM entidades WHERE categoria = '${nombre.replace(/'/g, "''")}'`)
    const total = (count[0] && count[0].values[0][0]) || 0
    if (total > 0) {
      db.run(`DELETE FROM entidades WHERE categoria = '${nombre.replace(/'/g, "''")}'`)
    }
    db.run(`DELETE FROM esquemas WHERE categoria = '${nombre.replace(/'/g, "''")}'`)
    db.run(`DELETE FROM categorias WHERE nombre = '${nombre.replace(/'/g, "''")}'`)
    guardarDb(rutaRaiz)
    return { exito: true, eliminadas: total }
  } catch (err) {
    return { exito: false, error: `Error al eliminar categoría: ${err.message}` }
  }
}

function sanitizarMetadatos(metadatos, esquemaCategoria) {
  if (!esquemaCategoria) return metadatos
  const keysPermitidas = new Set([...Object.keys(esquemaCategoria), 'id', 'nombre'])
  const resultado = {}
  for (const [k, v] of Object.entries(metadatos || {})) {
    if (keysPermitidas.has(k)) resultado[k] = v
  }
  return resultado
}

function filaAEntidad(r, esquemaCat) {
  return {
    archivo: r[0] + '.md',
    ruta: r[0],
    metadatos: sanitizarMetadatos(JSON.parse(r[2] || '{}'), esquemaCat),
    contenido: r[3],
    categoria: r[4] || ''
  }
}

async function inicializarProyecto(rutaRaiz) {
  const { db } = await getDb(rutaRaiz)
  _inicializarCategorias(db)
  _inicializarEsquema(db)
  guardarDb(rutaRaiz)
  return { exito: true, categorias: CATEGORIAS }
}

async function cargarIndex(rutaRaiz) {
  const { db } = await getDb(rutaRaiz)
  const esquema = _esquemaDbAObjeto(db)
  const cats = todasFilas(db, 'SELECT nombre FROM categorias ORDER BY orden').map(r => r[0])
  const index = {}
  for (const cat of cats) {
    const esquemaCat = esquema[cat] || {}
    index[cat] = todasFilas(db, `SELECT id, nombre, metadatos, contenido, '${cat}' FROM entidades WHERE categoria = ${escapar(cat)} ORDER BY nombre`).map(r => filaAEntidad(r, esquemaCat))
  }
  index._categorias = cats
  index._iconos = Object.fromEntries(cats.map(c => [c, c]))
  return index
}

async function leerArchivo(rutaId, rutaRaiz) {
  const { db } = await getDb(rutaRaiz)
  const row = primeraFila(db, `SELECT id, nombre, metadatos, contenido, categoria FROM entidades WHERE id = ${escapar(rutaId)}`)
  if (!row) return null
  const esquemaCompleto = _esquemaDbAObjeto(db)
  const esquemaCat = esquemaCompleto[row[4]] || {}
  return filaAEntidad(row, esquemaCat)
}

async function crearRegistro(rutaRaiz, categoria, datosIniciales) {
  try {
    if (!datosIniciales || !datosIniciales.nombre || !String(datosIniciales.nombre).trim()) {
      return { exito: false, error: 'El nombre del registro es obligatorio.' }
    }
    const { db } = await getDb(rutaRaiz)
    const cats = db.exec(`SELECT COUNT(*) FROM categorias WHERE nombre = '${categoria.replace(/'/g, "''")}'`)
    if (!cats[0] || cats[0].values[0][0] === 0) {
      return { exito: false, error: `Categoría inválida: "${categoria}".` }
    }
    const esquemaCompleto = _esquemaDbAObjeto(db)
    const esquemaCat = esquemaCompleto[categoria] || {}
    const defectos = {}
    for (const [campo, info] of Object.entries(esquemaCat)) {
      defectos[campo] = info.defecto
    }
    const id = randomUUID()
    const metadatos = { id, ...defectos, ...datosIniciales }
    db.run(`INSERT INTO entidades (id, categoria, nombre, metadatos, contenido) VALUES (${escapar(id)}, ${escapar(categoria)}, ${escapar(datosIniciales.nombre)}, ${escapar(JSON.stringify(metadatos))}, '')`)
    guardarDb(rutaRaiz)
    return { exito: true, datos: { archivo: id + '.md', ruta: id, metadatos, contenido: '', categoria } }
  } catch (err) {
    return { exito: false, error: `Error al crear: ${err.message}` }
  }
}

async function actualizarRegistro(rutaRaiz, rutaId, nuevosMetadatos, nuevoContenido) {
  try {
    const { db } = await getDb(rutaRaiz)
    const row = primeraFila(db, `SELECT metadatos FROM entidades WHERE id = ${escapar(rutaId)}`)
    if (!row) return { exito: false, error: 'El registro no existe.' }
    const metadatosActuales = JSON.parse(row[0])
    const metadatosFinal = { ...metadatosActuales, ...nuevosMetadatos }
    const contenidoFinal = nuevoContenido !== undefined ? nuevoContenido : ''
    db.run(`UPDATE entidades SET metadatos = ${escapar(JSON.stringify(metadatosFinal))}, contenido = ${escapar(contenidoFinal || '')}, updated_at = datetime('now') WHERE id = ${escapar(rutaId)}`)
    guardarDb(rutaRaiz)
    return { exito: true, datos: { ruta: rutaId, metadatos: metadatosFinal, contenido: contenidoFinal } }
  } catch (err) {
    return { exito: false, error: `Error al actualizar: ${err.message}` }
  }
}

async function eliminarRegistro(rutaRaiz, rutaId) {
  try {
    const { db } = await getDb(rutaRaiz)
    db.run(`DELETE FROM entidades WHERE id = ${escapar(rutaId)}`)
    guardarDb(rutaRaiz)
    return { exito: true }
  } catch (err) {
    return { exito: false, error: `Error al eliminar: ${err.message}` }
  }
}

async function obtenerEsquema(rutaRaiz) {
  const { db } = await getDb(rutaRaiz)
  return _esquemaDbAObjeto(db)
}

async function guardarEsquemaCategoria(rutaRaiz, categoria, campos) {
  try {
    const { db } = await getDb(rutaRaiz)
    const cats = db.exec(`SELECT COUNT(*) FROM categorias WHERE nombre = '${categoria.replace(/'/g, "''")}'`)
    if (!cats[0] || cats[0].values[0][0] === 0) {
      return { exito: false, error: `Categoría inválida: "${categoria}".` }
    }
    db.run(`DELETE FROM esquemas WHERE categoria = ${escapar(categoria)}`)
    const stmt = db.prepare('INSERT INTO esquemas (categoria, campo, tipo, ref_categoria, etiqueta, defecto, orden) VALUES (?, ?, ?, ?, ?, ?, ?)')
    for (let i = 0; i < campos.length; i++) {
      const c = campos[i]
      const defectoStr = Array.isArray(c.defecto) ? JSON.stringify(c.defecto) : String(c.defecto ?? '')
      stmt.bind([categoria, c.campo, c.tipo, c.ref_categoria || null, c.etiqueta, defectoStr, i])
      stmt.step()
      stmt.reset()
    }
    guardarDb(rutaRaiz)
    return { exito: true }
  } catch (err) {
    return { exito: false, error: `Error al guardar esquema: ${err.message}` }
  }
}

function RELACIONES_POR_CATEGORIA() {
  const rels = {}
  for (const cat of CATEGORIAS) {
    const relaciones = _RELACIONES[cat] || {}
    if (Object.keys(relaciones).length > 0) rels[cat] = relaciones
  }
  return rels
}

export {
  inicializarProyecto,
  cargarIndex,
  leerArchivo,
  crearRegistro,
  actualizarRegistro,
  eliminarRegistro,
  obtenerEsquema,
  guardarEsquemaCategoria,
  listarCategorias,
  crearCategoria,
  eliminarCategoria,
  CATEGORIAS,
  ICONOS,
  RELACIONES_POR_CATEGORIA
}
