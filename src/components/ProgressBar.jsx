export default function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-semibold text-white/90">
          {done}/{total} tugas selesai
        </span>
        <span className="text-[12px] font-bold text-white">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/25 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#D7CCC8] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
