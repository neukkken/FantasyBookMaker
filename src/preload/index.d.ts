import { ElectronAPI } from '@electron-toolkit/preload'

interface ElementoCodice {
  archivo: string
  ruta: string
  metadatos: Record<string, unknown>
  contenido: string
}

interface FantasyBookAPI {
  listarProyectos: () => Promise<{ nombre: string; ruta: string; stats: string }[]>
  crearProyecto: (nombre: string) => Promise<{ exito: boolean; ruta?: string; error?: string }>
  eliminarProyecto: (ruta: string) => Promise<{ exito: boolean; error?: string }>
  inicializarProyecto: (ruta: string) => Promise<{ exito: boolean; categorias: string[] }>
  pedirIndex: (ruta: string) => Promise<Record<string, ElementoCodice[]>>
  leerArchivo: (rutaProyecto: string, rutaArchivo: string) => Promise<ElementoCodice>
  pedirRelaciones: () => Promise<Record<string, unknown>>
  obtenerEsquema: (rutaProyecto: string) => Promise<Record<string, Record<string, { tipo: string; ref_categoria: string | null; etiqueta: string; defecto: unknown }>>>
  guardarEsquemaCategoria: (rutaProyecto: string, categoria: string, campos: object[]) => Promise<{ exito: boolean; error?: string }>
  db: {
    create: (rutaProyecto: string, categoria: string, datos: object) => Promise<{ exito: boolean; datos?: ElementoCodice; error?: string }>
    update: (rutaProyecto: string, rutaId: string, metadatos: object, contenido: string) => Promise<{ exito: boolean; error?: string }>
    delete: (rutaProyecto: string, rutaId: string) => Promise<{ exito: boolean; error?: string }>
  }
  manuscrito: {
    listarCapitulos: (rutaProyecto: string) => Promise<ElementoCodice[]>
    crearCapitulo: (rutaProyecto: string, titulo: string) => Promise<{ exito: boolean; datos?: ElementoCodice; error?: string }>
    leerCapitulo: (rutaProyecto: string, rutaId: string) => Promise<ElementoCodice>
    guardarCapitulo: (rutaProyecto: string, rutaId: string, contenido: string, metadatos: object) => Promise<{ exito: boolean; error?: string }>,
    eliminarCapitulo: (rutaProyecto: string, rutaId: string) => Promise<{ exito: boolean; error?: string }>
  }
  metas: {
    obtener: (rutaProyecto: string, clave: string) => Promise<string | null>
    establecer: (rutaProyecto: string, clave: string, valor: string) => Promise<{ exito: boolean; error?: string }>
  }
  categorias: {
    listar: (rutaProyecto: string) => Promise<{ nombre: string; etiqueta: string; icono: string; orden: number }[]>
    crear: (rutaProyecto: string, nombre: string, etiqueta: string, icono: string) => Promise<{ exito: boolean; datos?: { nombre: string; etiqueta: string; icono: string; orden: number }; error?: string }>
    eliminar: (rutaProyecto: string, nombre: string) => Promise<{ exito: boolean; eliminadas?: number; error?: string }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: FantasyBookAPI
  }
}
