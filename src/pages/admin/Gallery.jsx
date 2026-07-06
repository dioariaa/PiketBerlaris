import { useState } from 'react'
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
    <Layout variant="admin">
      <div className="bg-[#3E2723] px-4 pt-6 pb-5 rounded-b-3xl mb-4">
        <h1 className="text-[18px] font-bold text-white mb-3">📷 Gallery Foto</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="w-full h-11 px-3 rounded-xl bg-white text-[13px] font-medium text-[#333333] outline-none"
        />
        <p className="text-[12px] text-[#D7CCC8] mt-2">{formatFullDateID(parseDate(date))}</p>
      </div>

      <div className="px-4 pb-4">
        {loading && <p className="text-center text-[#999999] text-sm py-8">Memuat foto...</p>}

        {!loading && photos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E8E8E8]">
            <p className="text-3xl mb-2">🖼️</p>
            <p className="text-[14px] text-[#666666]">Belum ada foto untuk tanggal ini</p>
          </div>
        )}

        {photos.length > 0 && (
          <div className="space-y-4">
            {['before', 'after'].map((type) => {
              const typed = photos.filter((p) => p.type === type)
              return (
                <div key={type} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
                  <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#3E2723] mb-3">
                    {type}
                    <span className="text-[11px] font-medium text-[#999999] ml-2 normal-case">
                      {typed.length} foto
                    </span>
                  </h2>
                  {typed.length === 0 ? (
                    <p className="text-[12px] text-[#CCCCCC]">–</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {typed.map((p) => {
                        const url = publicPhotoUrl(p.storage_path)
                        return (
                          <div key={p.id} className="relative aspect-square">
                            <img
                              src={url}
                              alt={type}
                              className="w-full h-full object-cover rounded-lg"
                              onClick={() => setViewUrl(url)}
                            />
                            <button
                              onClick={() => handleDelete(p)}
                              aria-label="Hapus foto"
                              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#E74C3C] text-white text-[11px] font-bold flex items-center justify-center shadow"
                            >
                              ✕
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
