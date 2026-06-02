import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

let SQL = null

async function initSQL() {
  if (!SQL) SQL = await initSqlJs()
  return SQL
}

const dbs = new Map()

async function getDb(rutaProyecto) {
  if (dbs.has(rutaProyecto)) return dbs.get(rutaProyecto)

  const SQL = await initSQL()
  const dbPath = join(rutaProyecto, 'fantasybook.db')

  let db
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    mkdirSync(rutaProyecto, { recursive: true })
    db = new SQL.Database()
  }

  db.run('PRAGMA foreign_keys = ON')
  inicializarTablas(db)
  dbs.set(rutaProyecto, { db, dbPath })
  return { db, dbPath }
}

function guardarDb(rutaProyecto) {
  const entry = dbs.get(rutaProyecto)
  if (!entry) return
  const data = entry.db.export()
  const buffer = Buffer.from(data)
  writeFileSync(entry.dbPath, buffer)
}

function cerrarDb(rutaProyecto) {
  if (dbs.has(rutaProyecto)) {
    guardarDb(rutaProyecto)
    dbs.get(rutaProyecto).db.close()
    dbs.delete(rutaProyecto)
  }
}

function inicializarTablas(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS entidades (
      id TEXT PRIMARY KEY,
      categoria TEXT NOT NULL,
      nombre TEXT NOT NULL,
      metadatos TEXT NOT NULL DEFAULT '{}',
      contenido TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS capitulos (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      orden INTEGER NOT NULL DEFAULT 0,
      contenido TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS esquemas (
      categoria TEXT NOT NULL,
      campo TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'string',
      ref_categoria TEXT,
      etiqueta TEXT,
      defecto TEXT,
      orden INTEGER DEFAULT 0,
      PRIMARY KEY (categoria, campo)
    );

    CREATE TABLE IF NOT EXISTS metas (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categorias (
      nombre TEXT PRIMARY KEY,
      etiqueta TEXT NOT NULL,
      icono TEXT NOT NULL DEFAULT 'circle',
      orden INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_entidades_categoria ON entidades(categoria);
    CREATE INDEX IF NOT EXISTS idx_capitulos_orden ON capitulos(orden);
  `)
}

export { getDb, guardarDb, cerrarDb }
