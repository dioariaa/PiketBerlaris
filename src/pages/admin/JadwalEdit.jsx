import { useMemo, useState } from 'react'
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

  const staffById = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s])), [staff])
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
        ? '✅ Jadwal berhasil diduplikasi dari minggu lalu.'
        : '⚠️ Tidak ada jadwal di minggu lalu untuk diduplikasi.'
    )
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <Layout variant="admin">
      <div className="bg-[#3E2723] px-4 pt-6 pb-5 rounded-b-3xl mb-4">
        <h1 className="text-[18px] font-bold text-white mb-3">🗓️ Edit Jadwal</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            aria-label="Minggu lalu"
            className="w-11 h-11 rounded-xl bg-white/15 text-white font-bold shrink-0"
          >
            ‹
          </button>
          <div className="flex-1 h-11 rounded-xl bg-white/10 flex flex-col items-center justify-center">
            <span className="text-[13px] font-bold text-white leading-tight">
              {formatWeekRange(weekStart)}
            </span>
            {weekStart === currentWeekStart && (
              <span className="text-[10px] text-[#D7CCC8] leading-tight">Minggu ini</span>
            )}
          </div>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            aria-label="Minggu depan"
            className="w-11 h-11 rounded-xl bg-white/15 text-white font-bold shrink-0"
          >
            ›
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <button
            onClick={handleDuplicate}
            disabled={saving}
            className="h-10 px-3.5 rounded-xl bg-[#5D4037] text-white text-[12px] font-semibold active:bg-[#3E2723] disabled:opacity-60"
          >
            📋 Duplikasi dari Minggu Lalu
          </button>
          <span className="text-[11px] text-[#999999]">{saving ? 'Menyimpan...' : 'Tersimpan otomatis'}</span>
        </div>

        {message && (
          <div className="mb-3 rounded-lg bg-[#F7F2EE] border border-[#D7CCC8] text-[#3E2723] text-[12px] px-3 py-2 fade-in">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px] px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-[#999999] text-sm py-8">Memuat jadwal...</p>
        ) : (
          <div className="scroll-x rounded-xl border border-[#E8E8E8] bg-white">
            <table className="border-collapse text-[12px] min-w-[760px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[#F5F5F5] text-left px-3 py-2.5 font-bold text-[#666666] text-[11px] uppercase min-w-[150px] border-b border-[#E8E8E8]">
                    Tugas
                  </th>
                  {DAYS_SHORT.map((d) => (
                    <th
                      key={d}
                      className="px-1.5 py-2.5 bg-[#F5F5F5] font-bold text-[11px] uppercase text-[#666666] border-b border-[#E8E8E8] min-w-[84px]"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-[#333333]">
                      <span className="flex items-center gap-1.5">
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
                            className={`w-full h-9 rounded-lg border text-[11px] font-medium px-1 outline-none ${
                              sched
                                ? 'bg-[#F7F2EE] border-[#D7CCC8] text-[#3E2723]'
                                : 'bg-white border-[#E8E8E8] text-[#999999]'
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
        <p className="text-[11px] text-[#999999] text-center mt-3">
          Geser tabel ke samping untuk lihat semua hari →
        </p>
      </div>
    </Layout>
  )
}
