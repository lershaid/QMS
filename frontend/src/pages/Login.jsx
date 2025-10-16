import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      })

      const { user, accessToken } = response.data.data
      login(user, accessToken)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>QMS Platform</h1>
          <p>Compliance Operating System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@company.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="login-footer">
            <p>Demo credentials:</p>
            <p><strong>Email:</strong> admin@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
