import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../api'
import { useToast } from '../components/Toast'
import { Bot, ArrowRight, AlertCircle, BookOpen } from 'lucide-react'

export default function LoginPage() {
  useEffect(() => { document.title = '登录 — 未言' }, [])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    try {
      const res = await authAPI.login(username.trim(), password)
      login(res.data.token, res.data.username, res.data.role)
      addToast('登录成功', 'success')
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-semibold text-lg tracking-tight">
            <Bot className="w-6 h-6" />
            未言
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            解答生活中的<br />隐性常识
          </h2>
          <p className="text-gray-400 leading-relaxed">
            从时间语义到社交礼仪，从消费陷阱到生活避险，
            未言 帮你理解那些"明明应该知道却没人教"的事情。
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>52 条常识</span>
          </div>
          <div>8 大类别</div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-60 h-60 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">欢迎回来</h1>
            <p className="text-sm text-gray-500">登录以继续与常识 Agent 对话</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
              <input
                ref={usernameRef}
                type="text"
                className="input"
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <input
                type="password"
                className="input"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  登录
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            还没有账号？
            <Link to="/register" className="text-gray-900 font-medium hover:underline ml-1">
              立即注册
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link to="/browse" className="text-sm text-gray-400 hover:text-gray-700 transition-colors inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              不登录，直接浏览常识库
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
