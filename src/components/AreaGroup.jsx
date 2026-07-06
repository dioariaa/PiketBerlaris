export const AREA_LABELS = {
  lt1: 'Lantai 1',
  lt2: 'Lantai 2',
  office: 'Office',
  all: 'Semua Area',
}

export const AREA_COLORS = {
  lt1: '#6F4E37',
  lt2: '#8B5E3C',
  office: '#C89B6D',
  all: '#9CA3AF',
}

export const AREA_ORDER = ['lt1', 'lt2', 'office', 'all']

export default function AreaGroup({ area, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: AREA_COLORS[area] }} />
        <h2
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: AREA_COLORS[area] }}
        >
          {AREA_LABELS[area]}
        </h2>
      </div>
      {children}
    </div>
  )
}
