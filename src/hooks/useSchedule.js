import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Schedule untuk satu minggu (week_start_date = Senin, format YYYY-MM-DD).
// Return map: `${task_id}_${day_of_week}` -> schedule row.
export function useSchedule(weekStart) {
  const [scheduleMap, setScheduleMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSchedule = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('week_start_date', weekStart)
    if (error) {
      setError(error.message)
    } else {
      const map = {}
      for (const row of data ?? []) {
        map[`${row.task_id}_${row.day_of_week}`] = row
      }
      setScheduleMap(map)
      setError(null)
    }
    setLoading(false)
  }, [weekStart])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  // Set/hapus assignment satu cell. staffId null = kosongkan.
  const setCell = useCallback(async (taskId, dayOfWeek, staffId) => {
    const key = `${taskId}_${dayOfWeek}`
    if (!staffId) {
      const existing = scheduleMap[key]
      if (!existing) return
      const { error } = await supabase.from('schedules').delete().eq('id', existing.id)
      if (error) { setError(error.message); return }
      setScheduleMap((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } else {
      const { data, error } = await supabase
        .from('schedules')
        .upsert(
          { task_id: taskId, day_of_week: dayOfWeek, staff_id: staffId, week_start_date: weekStart },
          { onConflict: 'task_id,day_of_week,week_start_date' }
        )
        .select()
        .single()
      if (error) { setError(error.message); return }
      setScheduleMap((prev) => ({ ...prev, [key]: data }))
    }
  }, [scheduleMap, weekStart])

  // Duplikasi schedule dari minggu lain ke minggu ini (overwrite).
  const duplicateFromWeek = useCallback(async (sourceWeekStart) => {
    const { data: source, error: fetchErr } = await supabase
      .from('schedules')
      .select('task_id, day_of_week, staff_id')
      .eq('week_start_date', sourceWeekStart)
    if (fetchErr) { setError(fetchErr.message); return false }
    if (!source || source.length === 0) return false

    const { error: delErr } = await supabase
      .from('schedules')
      .delete()
      .eq('week_start_date', weekStart)
    if (delErr) { setError(delErr.message); return false }

    const rows = source.map((r) => ({ ...r, week_start_date: weekStart }))
    const { error: insErr } = await supabase.from('schedules').insert(rows)
    if (insErr) { setError(insErr.message); return false }

    await fetchSchedule()
    return true
  }, [weekStart, fetchSchedule])

  return { scheduleMap, loading, error, setCell, duplicateFromWeek, refetch: fetchSchedule }
}
