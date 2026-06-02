import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { existsSync, readdirSync, mkdirSync, rmSync } from 'fs'
import {
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
  RELACIONES_POR_CATEGORIA
} from './codiceManager'
import {
  listarCapitulos,
  crearCapitulo,
  leerCapitulo,
  guardarCapitulo,
  eliminarCapitulo
} from './manuscritoManager'
import { getDb, guardarDb } from './database'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPCs generales del Códice
  ipcMain.handle('inicializar-proyecto', async (_event, ruta: string) => {
    return await inicializarProyecto(ruta)
  })

  ipcMain.handle('pedir-index', async (_event, ruta: string) => {
    return await cargarIndex(ruta)
  })

  ipcMain.handle('leer-archivo', async (_event, rutaProyecto: string, rutaArchivo: string) => {
    return await leerArchivo(rutaArchivo, rutaProyecto)
  })

  ipcMain.handle('pedir-relaciones', () => {
    return RELACIONES_POR_CATEGORIA()
  })

  // IPCs del editor de esquemas (campos personalizados)
  ipcMain.handle('obtener-esquema', async (_event, rutaProyecto: string) => {
    return await obtenerEsquema(rutaProyecto)
  })

  ipcMain.handle('guardar-esquema-categoria', async (_event, rutaProyecto: string, categoria: string, campos: object[]) => {
    return await guardarEsquemaCategoria(rutaProyecto, categoria, campos)
  })

  // IPCs de gestión de categorías
  ipcMain.handle('listar-categorias', async (_event, rutaProyecto: string) => {
    return await listarCategorias(rutaProyecto)
  })

  ipcMain.handle('crear-categoria', async (_event, rutaProyecto: string, nombre: string, etiqueta: string, icono: string) => {
    return await crearCategoria(rutaProyecto, nombre, etiqueta, icono)
  })

  ipcMain.handle('eliminar-categoria', async (_event, rutaProyecto: string, nombre: string) => {
    return await eliminarCategoria(rutaProyecto, nombre)
  })

  // IPCs del motor de base de datos (CRUD)
  ipcMain.handle('db:create', async (_event, rutaProyecto: string, categoria: string, datos: object) => {
    return await crearRegistro(rutaProyecto, categoria, datos)
  })

  ipcMain.handle('db:update', async (_event, rutaProyecto: string, rutaId: string, metadatos: object, contenido: string) => {
    return await actualizarRegistro(rutaProyecto, rutaId, metadatos, contenido)
  })

  ipcMain.handle('db:delete', async (_event, rutaProyecto: string, rutaId: string) => {
    return await eliminarRegistro(rutaProyecto, rutaId)
  })

  // IPCs del Manuscrito (escritura del libro)
  ipcMain.handle('listar-capitulos', async (_event, rutaProyecto: string) => {
    return await listarCapitulos(rutaProyecto)
  })

  ipcMain.handle('crear-capitulo', async (_event, rutaProyecto: string, titulo: string) => {
    return await crearCapitulo(rutaProyecto, titulo)
  })

  ipcMain.handle('leer-capitulo', async (_event, rutaProyecto: string, rutaId: string) => {
    return await leerCapitulo(rutaProyecto, rutaId)
  })

  ipcMain.handle('guardar-capitulo', async (_event, rutaProyecto: string, rutaId: string, contenido: string, metadatos: object) => {
    return await guardarCapitulo(rutaProyecto, rutaId, contenido, metadatos)
  })

  ipcMain.handle('eliminar-capitulo', async (_event, rutaProyecto: string, rutaId: string) => {
    return await eliminarCapitulo(rutaProyecto, rutaId)
  })

  // IPCs de metas (estadísticas y objetivos de escritura)
  ipcMain.handle('obtener-meta', async (_event, rutaProyecto: string, clave: string) => {
    try {
      const { db } = await getDb(rutaProyecto)
      const r = db.exec(`SELECT valor FROM metas WHERE clave = '${clave.replace(/'/g, "''")}'`)
      const valor = (r[0] && r[0].values[0]) ? r[0].values[0][0] : null
      return valor
    } catch { return null }
  })

  ipcMain.handle('establecer-meta', async (_event, rutaProyecto: string, clave: string, valor: string) => {
    try {
      const { db } = await getDb(rutaProyecto)
      const c = clave.replace(/'/g, "''")
      const v = String(valor).replace(/'/g, "''")
      db.run(`INSERT OR REPLACE INTO metas (clave, valor) VALUES ('${c}', '${v}')`)
      guardarDb(rutaProyecto)
      return { exito: true }
    } catch (err) {
      return { exito: false, error: (err as Error).message }
    }
  })

  // Gestión de proyectos
  function getProyectosDir() {
    return join(app.getPath('documents'), 'FantasyBook')
  }

  ipcMain.handle('listar-proyectos', () => {
    const dir = getProyectosDir()
    if (!existsSync(dir)) return []
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => {
        const ruta = join(dir, d.name)
        const stats = existsSync(join(ruta, 'codice')) ? 'listo' : 'vacio'
        return { nombre: d.name, ruta, stats }
      })
  })

  ipcMain.handle('crear-proyecto', (_event, nombre: string) => {
    const dir = getProyectosDir()
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const rutaProyecto = join(dir, nombre.replace(/[<>:"/\\|?*]/g, '_'))
    if (existsSync(rutaProyecto)) {
      return { exito: false, error: 'Ya existe un proyecto con ese nombre.' }
    }
    mkdirSync(rutaProyecto, { recursive: true })
    inicializarProyecto(rutaProyecto)
    return { exito: true, ruta: rutaProyecto }
  })

  ipcMain.handle('eliminar-proyecto', (_event, ruta: string) => {
    try {
      rmSync(ruta, { recursive: true, force: true })
      return { exito: true }
    } catch (err) {
      return { exito: false, error: (err as Error).message }
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
