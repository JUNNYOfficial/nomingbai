import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../api'
import { Bot, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 位')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await authAPI.register(username.trim(), password)
        setMode('login')
        setError('')
        setLoading(false)
        return
      }

      const res = await authAPI.login(username.trim(), password)
      login(res.data.token, res.data.username)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.error || '操作失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 text-white mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">nomingbai</h1>
          <p className="text-sm text-gray-500 mt-1">登录以开始与常识 Agent 对话</p>
        </div>

        <div className="card">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 pb-3 text-sm font-medium text-center transition-colors ${
                mode === 'login'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => { setMode('login'); setError('') }}
            >
              登录
            </button>
            <button
              className={`flex-1 pb-3 text-sm font-medium text-center transition-colors ${
                mode === 'register'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => { setMode('register'); setError('') }}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                className="input"
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                className="input"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              {mode === 'register' && (
                <p className="text-xs text-gray-400 mt-1">密码长度需在 6-128 位之间</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? '登录中...' : '注册中...'}
                </span>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              还没有账号？
              <button
                onClick={() => setMode('register')}
                className="text-gray-900 hover:underline ml-1"
              >
                立即注册
              </button>
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/browse" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            不登录，直接浏览常识库 →
          </Link>
        </div>
      </div>
    </div>
  )
}
