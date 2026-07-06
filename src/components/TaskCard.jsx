import { useState } from 'react'
import { formatTimeID } from '../utils/dates'

export default function TaskCard({ task, check, assignedStaffName, showAssignee, onToggle, onSaveNote }) {
  const [expanded, setExpanded] = useState(false)
  const [noteDraft, setNoteDraft] = useState(check?.note ?? '')
  const [busy, setBusy] = useState(false)
  const checked = !!check

  async function handleToggle() {
    if (busy) return
    setBusy(true)
    await onToggle(task.id)
    setBusy(false)
  }

  return (
    <div
      className={`rounded-xl border p-3.5 mb-2 transition-colors fade-in ${
        checked ? 'bg-[#F7F2EE] border-[#D7CCC8]' : 'bg-white border-[#E8E8E8]'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={busy}
          aria-label={checked ? 'Batalkan centang' : 'Centang tugas'}
          className="shrink-0 w-11 h-11 flex items-center justify-center -m-1.5"
        >
          <span
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
              checked ? 'bg-[#5D4037] border-[#5D4037]' : 'bg-white border-[#CCCCCC]'
            }`}
          >
            {checked && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </button>
        <button className="flex-1 text-left min-w-0" onClick={() => setExpanded((e) => !e)}>
          <p className={`text-[14px] font-medium leading-snug ${checked ? 'line-through text-[#666666]' : 'text-[#333333]'}`}>
            {task.name}
          </p>
          <div className="flex flex-wrap gap-x-2 mt-0.5">
            {showAssignee && assignedStaffName && (
              <span className="text-[11px] font-semibold text-[#795548]">{assignedStaffName}</span>
            )}
            {checked && check.checked_at && (
              <span className="text-[11px] text-[#999999]">✓ {formatTimeID(check.checked_at)} WIB</span>
            )}
            {checked && check.note && !expanded && (
              <span className="text-[11px] text-[#999999] italic truncate">"{check.note}"</span>
            )}
          </div>
        </button>
      </div>

      {expanded && checked && (
        <div className="mt-3 pl-9 fade-in">
          <input
            type="text"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={() => noteDraft !== (check?.note ?? '') && onSaveNote(task.id, noteDraft)}
            placeholder="Tambah catatan (opsional)..."
            className="w-full text-[13px] border border-[#E8E8E8] rounded-lg px-3 py-2 outline-none focus:border-[#795548] bg-white"
          />
        </div>
      )}
    </div>
  )
}
