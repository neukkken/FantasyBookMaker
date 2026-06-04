export default function Tooltip({ texto, children }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded-sm
                    text-[10px] font-serif whitespace-nowrap pointer-events-none opacity-0
                    group-hover:opacity-100 transition-opacity duration-200 z-50
                    bg-gothic-surface border border-gothic-gold/40 text-gothic-parchment
                    shadow-gothic-lg">
        {texto}
      </div>
    </div>
  )
}
