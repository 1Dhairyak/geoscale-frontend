import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]   = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-geo-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#4fffb0 0,#4fffb0 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#4fffb0 0,#4fffb0 1px,transparent 1px,transparent 40px)' }} />

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-geo-accent tracking-widest">GEOSCALE</h1>
          <p className="text-geo-dim text-sm mt-1 font-mono">create your account</p>
        </div>

        <div className="card">
          <h2 className="text-geo-text font-semibold text-lg mb-5">Register</h2>

          {error && (
            <div className="mb-4 text-sm text-geo-red bg-geo-red/10 border border-geo-red/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-geo-dim text-xs font-mono mb-1.5 block">USERNAME</label>
              <input name="username" value={form.username} onChange={handle}
                className="input" placeholder="your_username" required autoFocus />
            </div>
            <div>
              <label className="text-geo-dim text-xs font-mono mb-1.5 block">EMAIL</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-geo-dim text-xs font-mono mb-1.5 block">PASSWORD</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                className="input" placeholder="••••••••" required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-geo-dim text-sm mt-5">
            Already registered?{' '}
            <Link to="/login" className="text-geo-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
