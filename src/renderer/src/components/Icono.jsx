import {
  Users, CastleTurret, MagicWand, Bug, Cross,
  Scroll, Sword, Flag, GraduationCap, GitFork,
  Book, PenNib, BookOpen, Folder, Plus, X,
  CaretDown, Link, MagnifyingGlass, Hammer, Trash,
  FloppyDisk, Article, Circle, Gear, ClockCounterClockwise,
  ShareNetwork
} from '@phosphor-icons/react'

const MAPEO = {
  personajes: Users,
  lugares: CastleTurret,
  magia: MagicWand,
  criaturas: Bug,
  dioses: Cross,
  historia: Scroll,
  objetos: Sword,
  facciones: Flag,
  clases: GraduationCap,
  razas: GitFork,
  tipos: Circle,
  codice: Book,
  manuscrito: PenNib,
  libro: BookOpen,
  esquemas: Gear,
  linea: ClockCounterClockwise,
  grafico: ShareNetwork,
  folder: Folder,
  plus: Plus,
  x: X,
  chevron: CaretDown,
  link: Link,
  buscar: MagnifyingGlass,
  hammer: Hammer,
  trash: Trash,
  guardar: FloppyDisk,
  articulo: Article
}

export default function Icono({ tipo, size = 14, className = '' }) {
  const Icon = MAPEO[tipo] || MAPEO.circle
  return Icon ? (
    <span className="inline-flex items-center justify-center leading-none" style={{ width: size, height: size }}>
      <Icon size={size} className={className} weight="bold" />
    </span>
  ) : null
}
