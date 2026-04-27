import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'
import { useToast } from '../components/Toast'
import { Bot, ArrowRight, AlertCircle, BookOpen, Check } from 'lucide-react'

export default function RegisterPage() {
  useEffect(() => { document.title = '注册 — nomingbai' }, [])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef(null)
  const navigate = useNavigate()
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

    if (password.length < 6) {
      setError('密码长度至少为 6 位')
      return
    }

    setLoading(true)
    try {
      await authAPI.register(username.trim(), password)
      addToast('注册成功，请登录', 'success')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    '52 条日常生活常识',
    '智能语义理解',
    '认知陷阱提醒',
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-semibold text-lg tracking-tight">
            <Bot className="w-6 h-6" />
            nomingbai
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            开始探索<br />隐性常识
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            创建一个账号，解锁与常识 Agent 的完整对话体验，
            保存你的提问历史，随时回顾。
          </p>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-gray-500" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          已有 52 条常识覆盖 8 大生活场景
        </div>

        {/* Decorative circles */}
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-60 h-60 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">创建账号</h1>
            <p className="text-sm text-gray-500">注册以开始与常识 Agent 对话</p>
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
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-400 mt-1.5">密码长度需在 6-128 位之间</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  注册中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  注册
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            已有账号？
            <Link to="/login" className="text-gray-900 font-medium hover:underline ml-1">
              直接登录
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
