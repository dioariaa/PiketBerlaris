import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-5">
      <div className="w-full max-w-[380px] bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-[18px] font-bold text-[#3E2723]">Admin Berlaris Piket</h1>
          <p className="text-[12px] text-[#999999] mt-1">Login untuk kelola jadwal &amp; rekap</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full h-12 px-3.5 rounded-xl border border-[#E8E8E8] text-[14px] outline-none focus:border-[#795548]"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full h-12 px-3.5 rounded-xl border border-[#E8E8E8] text-[14px] outline-none focus:border-[#795548]"
          />
          {error && <p className="text-[12px] text-[#E74C3C] font-medium">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-xl bg-[#3E2723] text-white text-[14px] font-bold active:bg-[#5D4037] disabled:opacity-60"
          >
            {busy ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
