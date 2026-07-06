export const AREA_LABELS = {
  lt1: 'Lantai 1',
  lt2: 'Lantai 2',
  office: 'Office',
  all: 'Semua Area',
}

export const AREA_COLORS = {
  lt1: '#5D4037',
  lt2: '#795548',
  office: '#A1887F',
  all: '#D7CCC8',
}

export const AREA_ORDER = ['lt1', 'lt2', 'office', 'all']

export default function AreaGroup({ area, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: AREA_COLORS[area] }} />
        <h2
          className="text-[11px] font-bold uppercase"
          style={{ color: AREA_COLORS[area] === '#D7CCC8' ? '#A1887F' : AREA_COLORS[area], letterSpacing: '0.5px' }}
        >
          {AREA_LABELS[area]}
        </h2>
      </div>
      {children}
    </div>
  )
}
