import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) {
      setError('Email atau password salah.')
    } else {
      navigate('/admin', { replace: true })
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--c-bg)] flex items-center justify-center px-5">
      <div
        className="w-full max-w-[400px] bg-[var(--c-surface)] rounded-[var(--radius)] border border-[var(--c-border)] p-8"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--c-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <Coffee size={24} className="text-[var(--c-primary)]" strokeWidth={2} />
          </div>
          <h1 className="text-[20px] font-bold text-[var(--c-text)]">Admin Berlaris Piket</h1>
          <p className="text-[13px] text-[var(--c-text-muted)] mt-1">Login untuk kelola jadwal &amp; rekap</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[var(--c-text-secondary)] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@piket.com"
              autoComplete="email"
              className="w-full h-11 px-3.5 rounded-[var(--radius)] border border-[var(--c-border)] text-[14px] outline-none focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--c-text-secondary)] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              className="w-full h-11 px-3.5 rounded-[var(--radius)] border border-[var(--c-border)] text-[14px] outline-none focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/10 transition-all"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-[12px] text-[var(--c-danger)] font-medium">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-[var(--radius)] bg-[var(--c-primary)] text-white text-[14px] font-semibold hover:bg-[var(--c-secondary)] active:bg-[var(--c-secondary)] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {busy ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
