import { useCallback, useEffect, useState } from 'react'
import { supabase, PHOTO_BUCKET } from '../lib/supabase'
import { compressImage } from '../utils/imageCompress'

export function publicPhotoUrl(storagePath) {
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath).data.publicUrl
}

// Foto untuk satu tanggal; staffId opsional (null = semua staff).
export function usePhotos(photoDate, staffId = null) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('photos')
      .select('*')
      .eq('photo_date', photoDate)
      .order('uploaded_at')
    if (staffId) query = query.eq('staff_id', staffId)
    const { data, error } = await query
    if (error) setError(error.message)
    else { setPhotos(data ?? []); setError(null) }
    setLoading(false)
  }, [photoDate, staffId])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  // Upload satu file: compress -> storage -> insert row.
  // Foto adalah pool per tanggal (tanpa staff, karena public page tidak ada login).
  const uploadPhoto = useCallback(async (file, type) => {
    setUploading(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      const path = `${photoDate}/${type}_${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })
      if (upErr) throw upErr
      const { data, error: insErr } = await supabase
        .from('photos')
        .insert({ staff_id: null, photo_date: photoDate, type, storage_path: path })
        .select()
        .single()
      if (insErr) throw insErr
      setPhotos((prev) => [...prev, data])
      return true
    } catch (e) {
      setError(e.message ?? 'Upload gagal')
      return false
    } finally {
      setUploading(false)
    }
  }, [photoDate])

  const deletePhoto = useCallback(async (photo) => {
    const { error: delErr } = await supabase.from('photos').delete().eq('id', photo.id)
    if (delErr) { setError(delErr.message); return false }
    await supabase.storage.from(PHOTO_BUCKET).remove([photo.storage_path])
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    return true
  }, [])

  return { photos, loading, uploading, error, uploadPhoto, deletePhoto, refetch: fetchPhotos }
}
