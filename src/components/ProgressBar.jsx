export default function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-[var(--c-text-secondary)]">
          {done}/{total} tugas selesai
        </span>
        <span className="text-[14px] font-bold text-[var(--c-primary)]">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-[var(--c-border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? 'var(--c-success)' : 'var(--c-primary)',
          }}
        />
      </div>
    </div>
  )
}
