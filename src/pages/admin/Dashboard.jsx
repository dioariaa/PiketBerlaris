import { useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import Lightbox from '../../components/Lightbox'
import { AREA_LABELS, AREA_COLORS, AREA_ORDER } from '../../components/AreaGroup'
import { useStaff } from '../../hooks/useStaff'
import { useTasks } from '../../hooks/useTasks'
import { useSchedule } from '../../hooks/useSchedule'
import { useChecks } from '../../hooks/useChecks'
import { usePhotos, publicPhotoUrl } from '../../hooks/usePhotos'
import { useAuth } from '../../hooks/useAuth'
import { todayStr, getWeekStart, getDayIndex, parseDate, formatFullDateID } from '../../utils/dates'

// Donut chart CSS-only pakai conic-gradient
function Donut({ pct }) {
  return (
    <div
      className="w-14 h-14 rounded-full grid place-items-center shrink-0"
      style={{ background: `conic-gradient(#5D4037 ${pct * 3.6}deg, #E8E8E8 0deg)` }}
    >
      <div className="w-10 h-10 rounded-full bg-white grid place-items-center text-[11px] font-bold text-[#3E2723]">
        {pct}%
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { signOut } = useAuth()
  const [date, setDate] = useState(todayStr())
  const selectedDate = parseDate(date)
  const weekStart = getWeekStart(selectedDate)
  const dayIndex = getDayIndex(selectedDate)

  const { staff } = useStaff()
  const { tasks } = useTasks()
  const { scheduleMap, loading: schedLoading } = useSchedule(weekStart)
  const { checkMap } = useChecks(date)
  const { photos } = usePhotos(date)
  const [viewUrl, setViewUrl] = useState(null)

  const staffById = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s])), [staff])

  // Tugas terjadwal pada tanggal terpilih: [{task, staffId}]
  const scheduled = useMemo(
    () =>
      tasks
        .map((task) => {
          const sched = scheduleMap[`${task.id}_${dayIndex}`]
          return sched ? { task, staffId: sched.staff_id } : null
        })
        .filter(Boolean),
    [tasks, scheduleMap, dayIndex]
  )

  const totalTasks = scheduled.length
  const doneTasks = scheduled.filter(({ task }) => checkMap[task.id]).length
  const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const pending = scheduled.filter(({ task }) => !checkMap[task.id])

  const byArea = AREA_ORDER.map((area) => {
    const items = scheduled.filter(({ task }) => task.area === area)
    const done = items.filter(({ task }) => checkMap[task.id]).length
    return { area, total: items.length, done }
  }).filter((a) => a.total > 0)

  const byStaff = staff.map((s) => {
    const assigned = scheduled.filter(({ staffId }) => staffId === s.id)
    const done = assigned.filter(({ task }) => checkMap[task.id]).length
    return {
      staff: s,
      assigned: assigned.length,
      done,
      pct: assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0,
    }
  })

  return (
    <Layout variant="admin">
      <div className="bg-[#3E2723] px-4 pt-6 pb-5 rounded-b-3xl mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[18px] font-bold text-white">📊 Rekap Harian</h1>
          <button
            onClick={signOut}
            className="h-9 px-3 rounded-lg bg-white/15 text-white text-[12px] font-semibold"
          >
            Keluar
          </button>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="w-full h-11 px-3 rounded-xl bg-white text-[14px] font-medium text-[#333333] outline-none"
        />
        <p className="text-[12px] text-[#D7CCC8] mt-2">{formatFullDateID(selectedDate)}</p>
      </div>

      <div className="px-4 space-y-5 pb-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Tugas', value: totalTasks, icon: '🗒️' },
            { label: 'Selesai', value: doneTasks, icon: '✅' },
            { label: 'Completion', value: `${rate}%`, icon: '📈' },
            { label: 'Foto Upload', value: photos.length, icon: '📷' },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
              <p className="text-[11px] font-semibold text-[#999999] uppercase tracking-wide">
                {c.icon} {c.label}
              </p>
              <p className="text-[24px] font-extrabold text-[#3E2723] mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {schedLoading && <p className="text-center text-[#999999] text-sm">Memuat...</p>}

        {!schedLoading && totalTasks === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-[#E8E8E8]">
            <p className="text-[14px] text-[#666666]">Tidak ada jadwal untuk tanggal ini.</p>
          </div>
        )}

        {/* Per area */}
        {byArea.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
            <h2 className="text-[13px] font-bold text-[#333333] mb-3">Progress per Area</h2>
            <div className="space-y-3">
              {byArea.map(({ area, total, done }) => {
                const pct = Math.round((done / total) * 100)
                return (
                  <div key={area}>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span style={{ color: AREA_COLORS[area] === '#D7CCC8' ? '#A1887F' : AREA_COLORS[area] }}>
                        {AREA_LABELS[area]}
                      </span>
                      <span className="text-[#666666]">{done}/{total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F0F0F0] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: AREA_COLORS[area] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Per staff */}
        {totalTasks > 0 && (
          <div>
            <h2 className="text-[13px] font-bold text-[#333333] mb-2 px-1">Progress per Staff</h2>
            <div className="grid grid-cols-2 gap-3">
              {byStaff.map(({ staff: s, assigned, done, pct }) => (
                <div key={s.id} className="bg-white rounded-xl border border-[#E8E8E8] p-3.5 flex items-center gap-3">
                  <Donut pct={pct} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#333333] truncate">{s.name}</p>
                    <p className="text-[11px] text-[#999999]">
                      {done}/{assigned} tugas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Belum selesai */}
        {pending.length > 0 && (
          <div className="bg-white rounded-xl border border-[#FFCCBC] p-4">
            <h2 className="text-[13px] font-bold text-[#E74C3C] mb-2">
              ⚠️ Belum Selesai ({pending.length})
            </h2>
            <div className="space-y-1.5">
              {pending.map(({ task, staffId }) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg bg-[#FFF3E0] px-3 py-2"
                >
                  <span className="text-[12px] font-medium text-[#333333]">{task.name}</span>
                  <span className="text-[11px] font-semibold text-[#E65100] shrink-0 ml-2">
                    {staffById[staffId]?.name ?? '–'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Foto hari itu */}
        <div>
          <h2 className="text-[13px] font-bold text-[#333333] mb-2 px-1">Foto Hari Ini</h2>
          {photos.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-xl border border-[#E8E8E8]">
              <p className="text-[13px] text-[#999999]">Belum ada foto untuk tanggal ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E8E8E8] p-3.5">
              <div className="flex gap-3">
                {['before', 'after'].map((type) => (
                  <div key={type} className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase text-[#999999] mb-1">{type}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {photos
                        .filter((p) => p.type === type)
                        .map((p) => {
                          const url = publicPhotoUrl(p.storage_path)
                          return (
                            <img
                              key={p.id}
                              src={url}
                              alt={type}
                              className="aspect-square w-full object-cover rounded-lg"
                              onClick={() => setViewUrl(url)}
                            />
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Lightbox url={viewUrl} onClose={() => setViewUrl(null)} />
    </Layout>
  )
}
