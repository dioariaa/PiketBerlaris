import { useState } from 'react'
import { ImageIcon, X } from 'lucide-react'
import Layout from '../../components/Layout'
import Lightbox from '../../components/Lightbox'
import { usePhotos, publicPhotoUrl } from '../../hooks/usePhotos'
import { todayStr, formatFullDateID, parseDate } from '../../utils/dates'

export default function Gallery() {
  const [date, setDate] = useState(todayStr())
  const [viewUrl, setViewUrl] = useState(null)

  const { photos, loading, deletePhoto } = usePhotos(date)

  async function handleDelete(photo) {
    if (window.confirm('Hapus foto ini?')) await deletePhoto(photo)
  }

  return (
    <Layout variant="admin" title="Gallery Foto">
      <div className="p-4 lg:p-8">
        {/* Date picker */}
        <div
          className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5 mb-6"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[18px] font-bold text-[var(--c-text)] lg:hidden">Gallery Foto</h1>
              <p className="text-[13px] text-[var(--c-text-secondary)] mt-0.5">{formatFullDateID(parseDate(date))}</p>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="h-10 px-3 rounded-[var(--radius)] border border-[var(--c-border)] text-[13px] font-medium text-[var(--c-text)] outline-none focus:border-[var(--c-primary)] cursor-pointer"
            />
          </div>
        </div>

        {loading && <p className="text-center text-[var(--c-text-muted)] text-sm py-12">Memuat foto...</p>}

        {!loading && photos.length === 0 && (
          <div
            className="text-center py-12 bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)]"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <ImageIcon size={40} className="mx-auto text-[var(--c-text-muted)] mb-3" strokeWidth={1.5} />
            <p className="text-[14px] font-medium text-[var(--c-text-secondary)]">Belum ada foto untuk tanggal ini</p>
          </div>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {['before', 'after'].map((type) => {
              const typed = photos.filter((p) => p.type === type)
              return (
                <div
                  key={type}
                  className="bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-5"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--c-text)] mb-3">
                    {type}
                    <span className="text-[11px] font-medium text-[var(--c-text-muted)] ml-2 normal-case">
                      {typed.length} foto
                    </span>
                  </h2>
                  {typed.length === 0 ? (
                    <p className="text-[12px] text-[var(--c-text-muted)]">Belum ada foto</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {typed.map((p) => {
                        const url = publicPhotoUrl(p.storage_path)
                        return (
                          <div key={p.id} className="relative aspect-square group">
                            <img
                              src={url}
                              alt={type}
                              className="w-full h-full object-cover rounded-lg cursor-pointer"
                              onClick={() => setViewUrl(url)}
                            />
                            <button
                              onClick={() => handleDelete(p)}
                              aria-label="Hapus foto"
                              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--c-danger)] text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Lightbox url={viewUrl} onClose={() => setViewUrl(null)} />
    </Layout>
  )
}
