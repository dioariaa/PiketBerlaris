import { useRef, useState } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import { publicPhotoUrl } from '../hooks/usePhotos'
import Lightbox from './Lightbox'

export default function PhotoPanel({ type, photos, uploading, onUpload, onDelete }) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const [viewUrl, setViewUrl] = useState(null)
  const label = type === 'before' ? 'Before' : 'After'

  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      await onUpload(file, type)
    }
    e.target.value = ''
  }

  return (
    <div
      className="flex-1 bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-4 min-w-0"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <h3 className="text-[13px] font-semibold text-[var(--c-text)] mb-3">{label}</h3>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFiles}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
        data-testid={`gallery-input-${type}`}
      />
      <div className="flex gap-2">
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="flex-1 h-[64px] rounded-[var(--radius)] border border-dashed border-[var(--c-border)] bg-[var(--c-bg)] flex flex-col items-center justify-center gap-1 text-[var(--c-text-secondary)] hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] active:bg-[var(--c-primary)]/5 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Camera size={20} strokeWidth={1.75} />
          <span className="text-[11px] font-medium">{uploading ? 'Mengupload...' : 'Kamera'}</span>
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={uploading}
          className="flex-1 h-[64px] rounded-[var(--radius)] border border-dashed border-[var(--c-border)] bg-[var(--c-bg)] flex flex-col items-center justify-center gap-1 text-[var(--c-text-secondary)] hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] active:bg-[var(--c-primary)]/5 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <ImagePlus size={20} strokeWidth={1.75} />
          <span className="text-[11px] font-medium">{uploading ? 'Mengupload...' : 'Galeri'}</span>
        </button>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {photos.map((p) => {
            const url = publicPhotoUrl(p.storage_path)
            return (
              <div key={p.id} className="relative aspect-square group">
                <img
                  src={url}
                  alt={label}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                  onClick={() => setViewUrl(url)}
                />
                {onDelete && (
                  <button
                    onClick={() => onDelete(p)}
                    aria-label="Hapus foto"
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--c-danger)] text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Lightbox url={viewUrl} onClose={() => setViewUrl(null)} />
    </div>
  )
}
