import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchStaff() {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (cancelled) return
      if (error) setError(error.message)
      else setStaff(data ?? [])
      setLoading(false)
    }
    fetchStaff()
    return () => { cancelled = true }
  }, [])

  return { staff, loading, error }
}
