import { useRef, useState } from 'react'
import { publicPhotoUrl } from '../hooks/usePhotos'
import Lightbox from './Lightbox'

export default function PhotoPanel({ type, photos, uploading, onUpload, onDelete }) {
  // Dua input terpisah: dengan capture (buka kamera) dan tanpa capture (pilih dari galeri)
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
    <div className="flex-1 bg-white rounded-xl border border-[#E8E8E8] p-3.5 min-w-0">
      <h3 className="text-[13px] font-bold text-[#333333] mb-2">{label}</h3>
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
          className="flex-1 h-[72px] rounded-lg border-2 border-dashed border-[#D7CCC8] bg-[#F7F2EE] flex flex-col items-center justify-center gap-0.5 text-[#5D4037] active:bg-[#EFEBE9] disabled:opacity-50"
        >
          <span className="text-xl leading-none">📷</span>
          <span className="text-[11px] font-semibold">{uploading ? 'Mengupload...' : 'Kamera'}</span>
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={uploading}
          className="flex-1 h-[72px] rounded-lg border-2 border-dashed border-[#D7CCC8] bg-[#F7F2EE] flex flex-col items-center justify-center gap-0.5 text-[#5D4037] active:bg-[#EFEBE9] disabled:opacity-50"
        >
          <span className="text-xl leading-none">🖼️</span>
          <span className="text-[11px] font-semibold">{uploading ? 'Mengupload...' : 'Galeri'}</span>
        </button>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
          {photos.map((p) => {
            const url = publicPhotoUrl(p.storage_path)
            return (
              <div key={p.id} className="relative aspect-square">
                <img
                  src={url}
                  alt={label}
                  className="w-full h-full object-cover rounded-lg"
                  onClick={() => setViewUrl(url)}
                />
                {onDelete && (
                  <button
                    onClick={() => onDelete(p)}
                    aria-label="Hapus foto"
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#E74C3C] text-white text-[11px] font-bold flex items-center justify-center shadow"
                  >
                    ✕
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
