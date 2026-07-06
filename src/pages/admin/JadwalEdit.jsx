import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, CheckCircle2, AlertCircle } from 'lucide-react'
import Layout from '../../components/Layout'
import { AREA_COLORS } from '../../components/AreaGroup'
import { useStaff } from '../../hooks/useStaff'
import { useTasks } from '../../hooks/useTasks'
import { useSchedule } from '../../hooks/useSchedule'
import { DAYS_SHORT, getWeekStart, addDays, formatWeekRange, formatDateID } from '../../utils/dates'

export default function JadwalEdit() {
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const currentWeekStart = getWeekStart()

  const { staff } = useStaff()
  const { tasks, loading: tasksLoading } = useTasks()
  const { scheduleMap, loading: schedLoading, error, setCell, duplicateFromWeek } = useSchedule(weekStart)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const loading = tasksLoading || schedLoading

  async function handleCellChange(taskId, day, staffId) {
    setSaving(true)
    await setCell(taskId, day, staffId || null)
    setSaving(false)
  }

  async function handleDuplicate() {
    const prevWeek = addDays(weekStart, -7)
    const ok = window.confirm(
      `Duplikasi jadwal dari minggu ${formatDateID(prevWeek)}? Jadwal minggu ini akan di-overwrite.`
    )
    if (!ok) return
    setSaving(true)
    const success = await duplicateFromWeek(prevWeek)
    setSaving(false)
    setMessage(
      success
        ? { type: 'success', text: 'Jadwal berhasil diduplikasi dari minggu lalu.' }
        : { type: 'warning', text: 'Tidak ada jadwal di minggu lalu untuk diduplikasi.' }
    )
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <Layout variant="admin" title="Edit Jadwal">
      <div className="p-4 lg:p-8">
        {/* Week navigation */}
        <div
          className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5 mb-6"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h1 className="text-[18px] font-bold text-[var(--c-text)] mb-4 lg:hidden">Edit Jadwal</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              aria-label="Minggu lalu"
              className="w-10 h-10 rounded-[var(--radius)] border border-[var(--c-border)] text-[var(--c-text-secondary)] flex items-center justify-center hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1 h-10 rounded-[var(--radius)] bg-[var(--c-bg)] flex flex-col items-center justify-center">
              <span className="text-[13px] font-semibold text-[var(--c-text)] leading-tight">
                {formatWeekRange(weekStart)}
              </span>
              {weekStart === currentWeekStart && (
                <span className="text-[10px] text-[var(--c-text-muted)] leading-tight">Minggu ini</span>
              )}
            </div>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              aria-label="Minggu depan"
              className="w-10 h-10 rounded-[var(--radius)] border border-[var(--c-border)] text-[var(--c-text-secondary)] flex items-center justify-center hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] transition-colors cursor-pointer shrink-0"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-2">
          <button
            onClick={handleDuplicate}
            disabled={saving}
            className="h-10 px-4 rounded-[var(--radius)] bg-[var(--c-primary)] text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-[var(--c-secondary)] active:bg-[var(--c-secondary)] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <Copy size={14} />
            Duplikasi Minggu Lalu
          </button>
          <span className="text-[12px] text-[var(--c-text-muted)]">{saving ? 'Menyimpan...' : 'Tersimpan otomatis'}</span>
        </div>

        {message && (
          <div className={`mb-4 rounded-[var(--radius)] text-[13px] px-4 py-3 flex items-center gap-2 fade-in ${
            message.type === 'success'
              ? 'bg-[var(--c-success)]/10 border border-[var(--c-success)]/20 text-[var(--c-success)]'
              : 'bg-[var(--c-warning)]/10 border border-[var(--c-warning)]/20 text-[#8D6E00]'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-[var(--radius)] bg-[var(--c-danger)]/5 border border-[var(--c-danger)]/20 text-[var(--c-danger)] text-[13px] px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-[var(--c-text-muted)] text-sm py-12">Memuat jadwal...</p>
        ) : (
          <div
            className="scroll-x rounded-[var(--radius)] border border-[var(--c-border)] bg-[var(--c-surface)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <table className="border-collapse text-[12px] min-w-[760px] w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[var(--c-bg)] text-left px-4 py-3 font-semibold text-[var(--c-text-secondary)] text-[11px] uppercase tracking-wider min-w-[150px] border-b border-[var(--c-border)]">
                    Tugas
                  </th>
                  {DAYS_SHORT.map((d) => (
                    <th
                      key={d}
                      className="px-1.5 py-3 bg-[var(--c-bg)] font-semibold text-[11px] uppercase tracking-wider text-[var(--c-text-secondary)] border-b border-[var(--c-border)] min-w-[84px]"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-[var(--c-border-light)] last:border-0">
                    <td className="sticky left-0 z-10 bg-[var(--c-surface)] px-4 py-2.5 font-medium text-[var(--c-text)]">
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
                      return (
                        <td key={day} className="px-1 py-1.5 text-center">
                          <select
                            value={sched?.staff_id ?? ''}
                            onChange={(e) => handleCellChange(task.id, day, e.target.value)}
                            className={`w-full h-9 rounded-lg border text-[11px] font-medium px-1 outline-none cursor-pointer transition-colors ${
                              sched
                                ? 'bg-[var(--c-primary)]/8 border-[var(--c-primary)]/20 text-[var(--c-primary)]'
                                : 'bg-[var(--c-surface)] border-[var(--c-border)] text-[var(--c-text-muted)]'
                            }`}
                          >
                            <option value="">–</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-[var(--c-text-muted)] text-center mt-3">
          Geser tabel ke samping untuk lihat semua hari
        </p>
      </div>
    </Layout>
  )
}
