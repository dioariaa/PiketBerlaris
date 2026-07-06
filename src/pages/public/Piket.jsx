import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, AlertCircle } from 'lucide-react'
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

  const todayAssignments = useMemo(() => {
    const map = {}
    for (const task of tasks) {
      const sched = scheduleMap[`${task.id}_${dayIndex}`]
      if (sched) map[task.id] = sched.staff_id
    }
    return map
  }, [tasks, scheduleMap, dayIndex])

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

  async function handleToggle(taskId) {
    const staffId = todayAssignments[taskId]
    if (!staffId) return
    await toggleCheck(taskId, staffId)
  }

  return (
    <Layout variant="public" title="Checklist Hari Ini">
      <div className="p-4 lg:p-8">
        {/* Header card */}
        <div
          className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5 mb-6"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[18px] font-bold text-[var(--c-text)] lg:hidden">Checklist Hari Ini</h1>
              <p className="text-[13px] text-[var(--c-text-secondary)] mt-0.5">{formatFullDateID(jakartaNow())}</p>
            </div>
            <Link
              to="/jadwal"
              className="h-9 px-3.5 rounded-[var(--radius)] border border-[var(--c-border)] text-[var(--c-text-secondary)] text-[12px] font-semibold flex items-center gap-1.5 hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] transition-colors cursor-pointer"
            >
              <CalendarDays size={14} strokeWidth={2} />
              Jadwal
            </Link>
          </div>
          <ProgressBar done={doneCount} total={visibleTasks.length} />
        </div>

        {(checksError || photoError) && (
          <div className="mb-4 rounded-[var(--radius)] bg-[var(--c-danger)]/5 border border-[var(--c-danger)]/20 text-[var(--c-danger)] text-[13px] px-4 py-3 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {checksError || photoError}
          </div>
        )}

        {loading && <p className="text-center text-[var(--c-text-muted)] text-sm py-12">Memuat tugas...</p>}

        {!loading && visibleTasks.length === 0 && (
          <div
            className="text-center py-12 bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <CalendarDays size={40} className="mx-auto text-[var(--c-text-muted)] mb-3" strokeWidth={1.5} />
            <p className="text-[14px] font-medium text-[var(--c-text-secondary)]">Belum ada jadwal untuk hari ini.</p>
            <p className="text-[12px] text-[var(--c-text-muted)] mt-1">Hubungi manager untuk atur jadwal.</p>
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

        {/* Photo Before/After */}
        <h2 className="text-[15px] font-bold text-[var(--c-text)] mb-3 mt-6">Foto Before / After</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* SOP Note */}
        <div className="mt-6 mb-4 rounded-[var(--radius)] bg-[var(--c-warning)]/8 border border-[var(--c-warning)]/25 p-4">
          <p className="text-[12px] font-semibold text-[#8D6E00] mb-1.5 flex items-center gap-1.5">
            <AlertCircle size={14} />
            Catatan SOP
          </p>
          <ul className="text-[12px] text-[#7A6200] space-y-1 list-disc pl-4">
            <li>Pastikan toilet kering, bersih dan wangi</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
