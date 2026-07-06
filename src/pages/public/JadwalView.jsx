import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '../../components/Layout'
import { AREA_COLORS } from '../../components/AreaGroup'
import { useStaff } from '../../hooks/useStaff'
import { useTasks } from '../../hooks/useTasks'
import { useSchedule } from '../../hooks/useSchedule'
import { DAYS_SHORT, getWeekStart, getDayIndex, formatWeekRange } from '../../utils/dates'

export default function JadwalView() {
  const navigate = useNavigate()
  const weekStart = getWeekStart()
  const todayIndex = getDayIndex()

  const { staff } = useStaff()
  const { tasks, loading: tasksLoading } = useTasks()
  const { scheduleMap, loading: scheduleLoading } = useSchedule(weekStart)

  const staffById = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s])), [staff])
  const loading = tasksLoading || scheduleLoading

  return (
    <Layout variant="public" title="Jadwal Minggu Ini">
      <div className="p-4 lg:p-8">
        <div
          className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5 mb-6"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Kembali"
              className="w-9 h-9 rounded-[var(--radius)] border border-[var(--c-border)] text-[var(--c-text-secondary)] flex items-center justify-center hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-[18px] font-bold text-[var(--c-text)] lg:hidden">Jadwal Minggu Ini</h1>
              <p className="text-[13px] text-[var(--c-text-secondary)]">{formatWeekRange(weekStart)}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-[var(--c-text-muted)] text-sm py-12">Memuat jadwal...</p>
        ) : (
          <div
            className="scroll-x rounded-[var(--radius)] border border-[var(--c-border)] bg-[var(--c-surface)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <table className="border-collapse text-[12px] w-full min-w-[560px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[var(--c-bg)] text-left px-4 py-3 font-semibold text-[var(--c-text-secondary)] text-[11px] uppercase tracking-wider min-w-[150px] border-b border-[var(--c-border)]">
                    Tugas
                  </th>
                  {DAYS_SHORT.map((d, i) => (
                    <th
                      key={d}
                      className={`px-2 py-3 font-semibold text-[11px] uppercase tracking-wider border-b border-[var(--c-border)] min-w-[56px] ${
                        i === todayIndex ? 'bg-[var(--c-primary)]/8 text-[var(--c-primary)]' : 'bg-[var(--c-bg)] text-[var(--c-text-secondary)]'
                      }`}
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-[var(--c-border-light)] last:border-0">
                    <td className="sticky left-0 z-10 bg-[var(--c-surface)] px-4 py-3 font-medium text-[var(--c-text)]">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: AREA_COLORS[task.area] }}
                        />
                        <span className="leading-tight">{task.name}</span>
                      </span>
                    </td>
                    {DAYS_SHORT.map((_, day) => {
                      const sched = scheduleMap[`${task.id}_${day}`]
                      const name = sched ? staffById[sched.staff_id]?.name : null
                      return (
                        <td
                          key={day}
                          className={`px-2 py-3 text-center ${
                            day === todayIndex ? 'bg-[var(--c-primary)]/5' : ''
                          } ${name ? 'font-semibold text-[var(--c-primary)]' : 'text-[var(--c-text-muted)]'}`}
                        >
                          {name ?? '–'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-[var(--c-text-muted)] text-center mt-3 mb-4">
          Geser tabel ke samping untuk lihat semua hari
        </p>
      </div>
    </Layout>
  )
}
