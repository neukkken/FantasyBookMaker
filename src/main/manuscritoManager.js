import { randomUUID } from 'crypto'
import { getDb, guardarDb } from './database'

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

async function listarCapitulos(rutaRaiz) {
  const { db } = await getDb(rutaRaiz)
  return todasFilas(db, 'SELECT id, titulo, orden, contenido FROM capitulos ORDER BY orden').map(r => ({
    archivo: `${String(r[2]).padStart(2, '0')}_${r[0]}.md`,
    ruta: r[0],
    metadatos: { titulo: r[1], orden: r[2] },
    contenido: r[3]
  }))
}

async function crearCapitulo(rutaRaiz, titulo) {
  try {
    if (!titulo || !String(titulo).trim()) {
      return { exito: false, error: 'El título del capítulo es obligatorio.' }
    }
    const { db } = await getDb(rutaRaiz)
    const maxRow = primeraFila(db, 'SELECT COALESCE(MAX(orden), 0) FROM capitulos')
    const orden = (maxRow ? maxRow[0] : 0) + 1
    const id = randomUUID()
    db.run(`INSERT INTO capitulos (id, titulo, orden, contenido) VALUES (${escapar(id)}, ${escapar(titulo)}, ${orden}, '')`)
    guardarDb(rutaRaiz)
    return {
      exito: true,
      datos: {
        archivo: `${String(orden).padStart(2, '0')}_${id}.md`,
        ruta: id,
        metadatos: { titulo, orden },
        contenido: ''
      }
    }
  } catch (err) {
    return { exito: false, error: `Error al crear capítulo: ${err.message}` }
  }
}

async function leerCapitulo(rutaRaiz, rutaId) {
  const { db } = await getDb(rutaRaiz)
  const row = primeraFila(db, `SELECT id, titulo, orden, contenido FROM capitulos WHERE id = ${escapar(rutaId)}`)
  if (!row) return null
  return {
    archivo: `${String(row[2]).padStart(2, '0')}_${row[0]}.md`,
    ruta: row[0],
    metadatos: { titulo: row[1], orden: row[2] },
    contenido: row[3]
  }
}

async function guardarCapitulo(rutaRaiz, rutaId, contenidoHtml, metadatos) {
  try {
    const { db } = await getDb(rutaRaiz)
    const row = primeraFila(db, `SELECT id FROM capitulos WHERE id = ${escapar(rutaId)}`)
    if (!row) return { exito: false, error: 'El capítulo no existe.' }
    const titulo = metadatos?.titulo || ''
    const orden = metadatos?.orden || 0
    db.run(`UPDATE capitulos SET titulo = ${escapar(titulo)}, orden = ${orden}, contenido = ${escapar(contenidoHtml || '')}, updated_at = datetime('now') WHERE id = ${escapar(rutaId)}`)
    guardarDb(rutaRaiz)
    return { exito: true }
  } catch (err) {
    return { exito: false, error: `Error al guardar capítulo: ${err.message}` }
  }
}

async function eliminarCapitulo(rutaRaiz, rutaId) {
  try {
    const { db } = await getDb(rutaRaiz)
    db.run(`DELETE FROM capitulos WHERE id = ${escapar(rutaId)}`)
    guardarDb(rutaRaiz)
    return { exito: true }
  } catch (err) {
    return { exito: false, error: `Error al eliminar capítulo: ${err.message}` }
  }
}

export { listarCapitulos, crearCapitulo, leerCapitulo, guardarCapitulo, eliminarCapitulo }
