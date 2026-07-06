import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
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
      className={`rounded-[var(--radius)] border p-4 mb-2 transition-all fade-in ${
        checked
          ? 'bg-[var(--c-success)]/5 border-[var(--c-success)]/20'
          : 'bg-[var(--c-surface)] border-[var(--c-border)]'
      }`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={busy}
          aria-label={checked ? 'Batalkan centang' : 'Centang tugas'}
          className="shrink-0 w-11 h-11 flex items-center justify-center -m-1.5 cursor-pointer"
        >
          <span
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              checked
                ? 'bg-[var(--c-success)] border-[var(--c-success)]'
                : 'bg-[var(--c-surface)] border-[var(--c-border)] hover:border-[var(--c-primary)]'
            }`}
          >
            {checked && <Check size={14} strokeWidth={3} className="text-white" />}
          </span>
        </button>
        <button className="flex-1 text-left min-w-0 cursor-pointer" onClick={() => setExpanded((e) => !e)}>
          <div className="flex items-center gap-2">
            <p className={`text-[14px] font-medium leading-snug flex-1 ${checked ? 'line-through text-[var(--c-text-muted)]' : 'text-[var(--c-text)]'}`}>
              {task.name}
            </p>
            {checked ? (
              <span className="shrink-0 inline-flex items-center h-5 px-2 rounded-full bg-[var(--c-success)]/10 text-[var(--c-success)] text-[10px] font-semibold">
                Selesai
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center h-5 px-2 rounded-full bg-[var(--c-warning)]/10 text-[#B8860B] text-[10px] font-semibold">
                Pending
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 mt-1">
            {showAssignee && assignedStaffName && (
              <span className="text-[12px] font-medium text-[var(--c-secondary)]">{assignedStaffName}</span>
            )}
            {checked && check.checked_at && (
              <span className="text-[11px] text-[var(--c-text-muted)]">{formatTimeID(check.checked_at)} WIB</span>
            )}
            {checked && check.note && !expanded && (
              <span className="text-[11px] text-[var(--c-text-muted)] italic truncate">"{check.note}"</span>
            )}
          </div>
        </button>
        <button onClick={() => setExpanded((e) => !e)} className="shrink-0 w-8 h-8 flex items-center justify-center text-[var(--c-text-muted)] cursor-pointer">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
            className="w-full text-[13px] border border-[var(--c-border)] rounded-[var(--radius)] px-3 py-2.5 outline-none focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/10 bg-[var(--c-surface)] transition-all"
          />
        </div>
      )}
    </div>
  )
}
