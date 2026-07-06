import { useMemo, useState } from 'react'
import { ClipboardList, CheckCircle2, Clock, Camera, AlertTriangle } from 'lucide-react'
import Layout from '../../components/Layout'
import Lightbox from '../../components/Lightbox'
import { AREA_LABELS, AREA_COLORS, AREA_ORDER } from '../../components/AreaGroup'
import { useStaff } from '../../hooks/useStaff'
import { useTasks } from '../../hooks/useTasks'
import { useSchedule } from '../../hooks/useSchedule'
import { useChecks } from '../../hooks/useChecks'
import { usePhotos, publicPhotoUrl } from '../../hooks/usePhotos'
import { todayStr, getWeekStart, getDayIndex, parseDate, formatFullDateID } from '../../utils/dates'

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-4"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: `${color}14` }}
        >
          <Icon size={20} strokeWidth={1.75} style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[var(--c-text-muted)] uppercase tracking-wider">{label}</p>
          <p className="text-[22px] font-bold text-[var(--c-text)] leading-tight">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Donut({ pct }) {
  return (
    <div
      className="w-12 h-12 rounded-full grid place-items-center shrink-0"
      style={{ background: `conic-gradient(var(--c-primary) ${pct * 3.6}deg, var(--c-border) 0deg)` }}
    >
      <div className="w-8 h-8 rounded-full bg-[var(--c-surface)] grid place-items-center text-[10px] font-bold text-[var(--c-text)]">
        {pct}%
      </div>
    </div>
  )
}

export default function Dashboard() {
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
    <Layout variant="admin" title="Rekap Harian">
      <div className="p-4 lg:p-8">
        {/* Date picker */}
        <div
          className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5 mb-6"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[18px] font-bold text-[var(--c-text)] lg:hidden">Rekap Harian</h1>
              <p className="text-[13px] text-[var(--c-text-secondary)] mt-0.5">{formatFullDateID(selectedDate)}</p>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="h-10 px-3 rounded-[var(--radius)] border border-[var(--c-border)] text-[13px] font-medium text-[var(--c-text)] outline-none focus:border-[var(--c-primary)] cursor-pointer"
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KpiCard icon={ClipboardList} label="Total Tugas" value={totalTasks} color="#6F4E37" />
          <KpiCard icon={CheckCircle2} label="Selesai" value={doneTasks} color="#4CAF50" />
          <KpiCard icon={Clock} label="Completion" value={`${rate}%`} color="#F4B400" />
          <KpiCard icon={Camera} label="Foto Upload" value={photos.length} color="#8B5E3C" />
        </div>

        {schedLoading && <p className="text-center text-[var(--c-text-muted)] text-sm py-8">Memuat...</p>}

        {!schedLoading && totalTasks === 0 && (
          <div
            className="text-center py-12 bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-[14px] text-[var(--c-text-secondary)]">Tidak ada jadwal untuk tanggal ini.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Per area */}
          {byArea.length > 0 && (
            <div
              className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <h2 className="text-[14px] font-semibold text-[var(--c-text)] mb-4">Progress per Area</h2>
              <div className="space-y-4">
                {byArea.map(({ area, total, done }) => {
                  const pct = Math.round((done / total) * 100)
                  return (
                    <div key={area}>
                      <div className="flex justify-between text-[12px] font-medium mb-1.5">
                        <span style={{ color: AREA_COLORS[area] }}>
                          {AREA_LABELS[area]}
                        </span>
                        <span className="text-[var(--c-text-secondary)]">{done}/{total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--c-border-light)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
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
            <div
              className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <h2 className="text-[14px] font-semibold text-[var(--c-text)] mb-4">Progress per Staff</h2>
              <div className="grid grid-cols-2 gap-3">
                {byStaff.map(({ staff: s, assigned, done, pct }) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-[10px] bg-[var(--c-bg)]">
                    <Donut pct={pct} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--c-text)] truncate">{s.name}</p>
                      <p className="text-[11px] text-[var(--c-text-muted)]">
                        {done}/{assigned} tugas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending tasks */}
        {pending.length > 0 && (
          <div
            className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-danger)]/20 p-5 mb-6"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <h2 className="text-[14px] font-semibold text-[var(--c-danger)] mb-3 flex items-center gap-2">
              <AlertTriangle size={16} />
              Belum Selesai ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map(({ task, staffId }) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-[10px] bg-[var(--c-danger)]/5 px-4 py-2.5"
                >
                  <span className="text-[13px] font-medium text-[var(--c-text)]">{task.name}</span>
                  <span className="text-[12px] font-semibold text-[var(--c-danger)] shrink-0 ml-2">
                    {staffById[staffId]?.name ?? '–'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        <div
          className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h2 className="text-[14px] font-semibold text-[var(--c-text)] mb-4">Foto Hari Ini</h2>
          {photos.length === 0 ? (
            <div className="text-center py-8">
              <Camera size={32} className="mx-auto text-[var(--c-text-muted)] mb-2" strokeWidth={1.5} />
              <p className="text-[13px] text-[var(--c-text-muted)]">Belum ada foto untuk tanggal ini.</p>
            </div>
          ) : (
            <div className="flex gap-4">
              {['before', 'after'].map((type) => (
                <div key={type} className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--c-text-muted)] mb-2">{type}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photos
                      .filter((p) => p.type === type)
                      .map((p) => {
                        const url = publicPhotoUrl(p.storage_path)
                        return (
                          <img
                            key={p.id}
                            src={url}
                            alt={type}
                            className="aspect-square w-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setViewUrl(url)}
                          />
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Lightbox url={viewUrl} onClose={() => setViewUrl(null)} />
    </Layout>
  )
}
