import { X } from 'lucide-react'

export default function Lightbox({ url, onClose }) {
  if (!url) return null
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Tutup"
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors"
      >
        <X size={20} strokeWidth={2} />
      </button>
      <img src={url} alt="Foto" className="max-w-full max-h-full rounded-lg object-contain" />
    </div>
  )
}
