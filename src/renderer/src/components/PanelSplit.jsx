import VentanaFlotante from './VentanaFlotante'
import ExploradorArchivosGotico from './ExploradorArchivosGotico'
import PanelEscritura from './PanelEscritura'

export default function PanelSplit() {
  return (
    <VentanaFlotante titulo="SPLIT" sinScroll={true}>
      <div className="flex h-full min-h-0">
        <div className="w-1/2 min-w-0 border-r border-gothic-gold/15 overflow-hidden">
          <ExploradorArchivosGotico noPanel={true} />
        </div>
        <div className="w-1/2 min-w-0 overflow-hidden">
          <PanelEscritura noPanel={true} />
        </div>
      </div>
    </VentanaFlotante>
  )
}
