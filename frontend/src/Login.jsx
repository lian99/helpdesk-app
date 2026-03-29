import { useState } from 'react'
import api from './api'

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password, is_admin: false })
        setIsRegister(false)
        setError('Account created! Please login.')
        return
      }

      // Login — FastAPI expects form data not JSON for login
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)

      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('is_admin', res.data.is_admin)
      onLogin(res.data.is_admin)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>
          {isRegister ? 'Create account' : 'Sign in to Helpdesk'}
        </h2>

        {error && (
          <div style={{ background: '#f0fdf4', color: '#166534', padding: 10, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />

        <button className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={handleSubmit}>
          {isRegister ? 'Register' : 'Login'}
        </button>

        <p style={{ marginTop: 16, fontSize: 14, textAlign: 'center' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={{ color: '#4f46e5', cursor: 'pointer' }} onClick={() => { setIsRegister(!isRegister); setError('') }}>
            {isRegister ? 'Sign in' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  )
}