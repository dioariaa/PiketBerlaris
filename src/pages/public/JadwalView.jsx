import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <Layout variant="public">
      <div className="bg-[#3E2723] px-4 pt-6 pb-5 rounded-b-3xl mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="w-9 h-9 rounded-lg bg-white/15 text-white flex items-center justify-center"
          >
            ←
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-white">Jadwal Minggu Ini</h1>
            <p className="text-[12px] text-[#D7CCC8]">{formatWeekRange(weekStart)}</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <p className="text-center text-[#999999] text-sm py-8">Memuat jadwal...</p>
        ) : (
          <div className="scroll-x rounded-xl border border-[#E8E8E8] bg-white">
            <table className="border-collapse text-[12px] w-full min-w-[560px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[#F5F5F5] text-left px-3 py-2.5 font-bold text-[#666666] text-[11px] uppercase min-w-[150px] border-b border-[#E8E8E8]">
                    Tugas
                  </th>
                  {DAYS_SHORT.map((d, i) => (
                    <th
                      key={d}
                      className={`px-2 py-2.5 font-bold text-[11px] uppercase border-b border-[#E8E8E8] min-w-[56px] ${
                        i === todayIndex ? 'bg-[#EFEBE9] text-[#3E2723]' : 'bg-[#F5F5F5] text-[#666666]'
                      }`}
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2.5 font-medium text-[#333333]">
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
                      const name = sched ? staffById[sched.staff_id]?.name : null
                      return (
                        <td
                          key={day}
                          className={`px-2 py-2.5 text-center ${
                            day === todayIndex ? 'bg-[#F7F2EE]' : ''
                          } ${name ? 'font-semibold text-[#5D4037]' : 'text-[#CCCCCC]'}`}
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
        <p className="text-[11px] text-[#999999] text-center mt-3 mb-4">
          Geser tabel ke samping untuk lihat semua hari →
        </p>
      </div>
    </Layout>
  )
}
