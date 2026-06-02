import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  listarProyectos: () =>
    ipcRenderer.invoke('listar-proyectos'),
  crearProyecto: (nombre: string) =>
    ipcRenderer.invoke('crear-proyecto', nombre),
  eliminarProyecto: (ruta: string) =>
    ipcRenderer.invoke('eliminar-proyecto', ruta),
  inicializarProyecto: (ruta: string) =>
    ipcRenderer.invoke('inicializar-proyecto', ruta),
  pedirIndex: (ruta: string) =>
    ipcRenderer.invoke('pedir-index', ruta),
  leerArchivo: (rutaProyecto: string, rutaArchivo: string) =>
    ipcRenderer.invoke('leer-archivo', rutaProyecto, rutaArchivo),
  pedirRelaciones: () =>
    ipcRenderer.invoke('pedir-relaciones'),
  obtenerEsquema: (rutaProyecto: string) =>
    ipcRenderer.invoke('obtener-esquema', rutaProyecto),
  guardarEsquemaCategoria: (rutaProyecto: string, categoria: string, campos: object[]) =>
    ipcRenderer.invoke('guardar-esquema-categoria', rutaProyecto, categoria, campos),
  db: {
    create: (rutaProyecto: string, categoria: string, datos: object) =>
      ipcRenderer.invoke('db:create', rutaProyecto, categoria, datos),
    update: (rutaProyecto: string, rutaId: string, metadatos: object, contenido: string) =>
      ipcRenderer.invoke('db:update', rutaProyecto, rutaId, metadatos, contenido),
    delete: (rutaProyecto: string, rutaId: string) =>
      ipcRenderer.invoke('db:delete', rutaProyecto, rutaId)
  },
  manuscrito: {
    listarCapitulos: (rutaProyecto: string) =>
      ipcRenderer.invoke('listar-capitulos', rutaProyecto),
    crearCapitulo: (rutaProyecto: string, titulo: string) =>
      ipcRenderer.invoke('crear-capitulo', rutaProyecto, titulo),
    leerCapitulo: (rutaProyecto: string, rutaId: string) =>
      ipcRenderer.invoke('leer-capitulo', rutaProyecto, rutaId),
    guardarCapitulo: (rutaProyecto: string, rutaId: string, contenido: string, metadatos: object) =>
      ipcRenderer.invoke('guardar-capitulo', rutaProyecto, rutaId, contenido, metadatos),
    eliminarCapitulo: (rutaProyecto: string, rutaId: string) =>
      ipcRenderer.invoke('eliminar-capitulo', rutaProyecto, rutaId)
  },
  metas: {
    obtener: (rutaProyecto: string, clave: string) =>
      ipcRenderer.invoke('obtener-meta', rutaProyecto, clave),
    establecer: (rutaProyecto: string, clave: string, valor: string) =>
      ipcRenderer.invoke('establecer-meta', rutaProyecto, clave, valor)
  },
  categorias: {
    listar: (rutaProyecto: string) =>
      ipcRenderer.invoke('listar-categorias', rutaProyecto),
    crear: (rutaProyecto: string, nombre: string, etiqueta: string, icono: string) =>
      ipcRenderer.invoke('crear-categoria', rutaProyecto, nombre, etiqueta, icono),
    eliminar: (rutaProyecto: string, nombre: string) =>
      ipcRenderer.invoke('eliminar-categoria', rutaProyecto, nombre)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as any).electron = electronAPI
  ;(window as any).api = api
}
