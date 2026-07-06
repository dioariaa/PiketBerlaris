import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Checks untuk satu tanggal (YYYY-MM-DD).
// Return map: task_id -> check row.
export function useChecks(checkDate) {
  const [checkMap, setCheckMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchChecks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('checks')
      .select('*')
      .eq('check_date', checkDate)
    if (error) {
      setError(error.message)
    } else {
      const map = {}
      for (const row of data ?? []) map[row.task_id] = row
      setCheckMap(map)
      setError(null)
    }
    setLoading(false)
  }, [checkDate])

  useEffect(() => { fetchChecks() }, [fetchChecks])

  // Toggle centang. Return true jika sukses.
  const toggleCheck = useCallback(async (taskId, staffId) => {
    const existing = checkMap[taskId]
    if (existing) {
      const { error } = await supabase.from('checks').delete().eq('id', existing.id)
      if (error) { setError(error.message); return false }
      setCheckMap((prev) => {
        const next = { ...prev }
        delete next[taskId]
        return next
      })
    } else {
      const { data, error } = await supabase
        .from('checks')
        .insert({
          task_id: taskId,
          staff_id: staffId,
          check_date: checkDate,
          checked_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) { setError(error.message); return false }
      setCheckMap((prev) => ({ ...prev, [taskId]: data }))
    }
    return true
  }, [checkMap, checkDate])

  // Update catatan pada check yang sudah ada.
  const updateNote = useCallback(async (taskId, note) => {
    const existing = checkMap[taskId]
    if (!existing) return
    const { data, error } = await supabase
      .from('checks')
      .update({ note })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) { setError(error.message); return }
    setCheckMap((prev) => ({ ...prev, [taskId]: data }))
  }, [checkMap])

  return { checkMap, loading, error, toggleCheck, updateNote, refetch: fetchChecks }
}
