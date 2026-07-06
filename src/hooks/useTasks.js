import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (cancelled) return
      if (error) setError(error.message)
      else setTasks(data ?? [])
      setLoading(false)
    }
    fetchTasks()
    return () => { cancelled = true }
  }, [])

  return { tasks, loading, error }
}
