import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import TaskCard from '../../components/TaskCard'
import PhotoPanel from '../../components/PhotoPanel'
import ProgressBar from '../../components/ProgressBar'
import AreaGroup, { AREA_ORDER } from '../../components/AreaGroup'
import { useStaff } from '../../hooks/useStaff'
import { useTasks } from '../../hooks/useTasks'
import { useSchedule } from '../../hooks/useSchedule'
import { useChecks } from '../../hooks/useChecks'
import { usePhotos } from '../../hooks/usePhotos'
import { jakartaNow, todayStr, getWeekStart, getDayIndex, formatFullDateID } from '../../utils/dates'

export default function Piket() {
  const today = todayStr()
  const weekStart = getWeekStart()
  const dayIndex = getDayIndex()

  const { staff, loading: staffLoading } = useStaff()
  const { tasks, loading: tasksLoading } = useTasks()
  const { scheduleMap, loading: scheduleLoading } = useSchedule(weekStart)
  const { checkMap, toggleCheck, updateNote, error: checksError } = useChecks(today)
  const { photos, uploading, error: photoError, uploadPhoto, deletePhoto } = usePhotos(today)

  const staffById = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s])), [staff])

  // Assignment hari ini: task_id -> staff_id (dari schedule)
  const todayAssignments = useMemo(() => {
    const map = {}
    for (const task of tasks) {
      const sched = scheduleMap[`${task.id}_${dayIndex}`]
      if (sched) map[task.id] = sched.staff_id
    }
    return map
  }, [tasks, scheduleMap, dayIndex])

  // Tampilkan semua tugas yang di-assign hari ini (tanpa filter per staff)
  const visibleTasks = tasks.filter((t) => todayAssignments[t.id])
  const doneCount = visibleTasks.filter((t) => checkMap[t.id]).length

  const tasksByArea = useMemo(() => {
    const groups = {}
    for (const t of visibleTasks) {
      ;(groups[t.area] ??= []).push(t)
    }
    return groups
  }, [visibleTasks])

  const loading = staffLoading || tasksLoading || scheduleLoading

  // Centang atas nama staff yang di-assign di schedule
  async function handleToggle(taskId) {
    const staffId = todayAssignments[taskId]
    if (!staffId) return
    await toggleCheck(taskId, staffId)
  }

  return (
    <Layout variant="public">
      {/* Header */}
      <div className="bg-[#3E2723] px-4 pt-6 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[18px] font-bold text-white">☕ Berlaris Piket</h1>
            <p className="text-[12px] text-[#D7CCC8]">{formatFullDateID(jakartaNow())}</p>
          </div>
          <Link
            to="/jadwal"
            className="h-9 px-3 rounded-lg bg-white/15 text-white text-[12px] font-semibold flex items-center"
          >
            Jadwal Minggu Ini
          </Link>
        </div>
        <ProgressBar done={doneCount} total={visibleTasks.length} />
      </div>

      <div className="px-4 pt-4">
        {(checksError || photoError) && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px] px-3 py-2">
            {checksError || photoError}
          </div>
        )}

        <h2 className="text-[15px] font-bold text-[#333333] mb-3">Checklist Hari Ini</h2>

        {loading && <p className="text-center text-[#999999] text-sm py-8">Memuat tugas...</p>}

        {!loading && visibleTasks.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-[#E8E8E8]">
            <p className="text-3xl mb-2">🗓️</p>
            <p className="text-[14px] text-[#666666]">Belum ada jadwal untuk hari ini.</p>
            <p className="text-[12px] text-[#999999] mt-1">Hubungi manager untuk atur jadwal.</p>
          </div>
        )}

        {AREA_ORDER.map((area) =>
          tasksByArea[area]?.length ? (
            <AreaGroup key={area} area={area}>
              {tasksByArea[area].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  check={checkMap[task.id]}
                  assignedStaffName={staffById[todayAssignments[task.id]]?.name}
                  showAssignee
                  onToggle={handleToggle}
                  onSaveNote={updateNote}
                />
              ))}
            </AreaGroup>
          ) : null
        )}

        {/* Foto Before/After — pool per tanggal, stacked */}
        <h2 className="text-[15px] font-bold text-[#333333] mb-3 mt-6">Foto Before / After</h2>
        <div className="flex flex-col gap-3">
          <PhotoPanel
            type="before"
            photos={photos.filter((p) => p.type === 'before')}
            uploading={uploading}
            onUpload={uploadPhoto}
            onDelete={deletePhoto}
          />
          <PhotoPanel
            type="after"
            photos={photos.filter((p) => p.type === 'after')}
            uploading={uploading}
            onUpload={uploadPhoto}
            onDelete={deletePhoto}
          />
        </div>

        {/* Catatan SOP */}
        <div className="mt-5 mb-4 rounded-xl bg-[#FFF8E1] border border-[#FFE082] p-4">
          <p className="text-[12px] font-bold text-[#8D6E00] mb-1.5">📌 Catatan SOP</p>
          <ul className="text-[12px] text-[#7A6200] space-y-1 list-disc pl-4">
            <li>Pastikan toilet kering, bersih dan wangi</li>
            <li>Kirim foto before &amp; after ke grup service</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
