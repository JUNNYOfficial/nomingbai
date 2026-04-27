import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../api'
import { useToast } from '../components/Toast'
import { User, Shield, Calendar, KeyRound, Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
  useEffect(() => { document.title = '个人资料 — 未言' }, [])

  const { user, refreshProfile } = useAuth()
  const { addToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const updated = await refreshProfile()
        if (mounted) setProfile(updated)
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [refreshProfile])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      addToast('请填写完整密码信息', 'error')
      return
    }
    if (newPassword.length < 6) {
      addToast('新密码长度至少为 6 位', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      addToast('两次输入的新密码不一致', 'error')
      return
    }
    setChanging(true)
    try {
      await authAPI.changePassword(currentPassword, newPassword)
      addToast('密码修改成功', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      addToast(err.response?.data?.error || '密码修改失败', 'error')
    } finally {
      setChanging(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container max-w-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 dark:bg-gray-900 rounded w-1/3" />
          <div className="h-32 bg-gray-100 dark:bg-gray-900 rounded" />
          <div className="h-48 bg-gray-100 dark:bg-gray-900 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        个人资料
      </h1>

      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">基本信息</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400 w-16">用户名</span>
            <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{profile?.username || user?.username}</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400 w-16">角色</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              profile?.role === 'admin'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300'
            }`}>
              {profile?.role === 'admin' ? '管理员' : '普通用户'}
            </span>
          </div>
          {profile?.created_at && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-16">注册时间</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(profile.created_at).toLocaleString('zh-CN')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          修改密码
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              className="input w-full pr-10"
              placeholder="当前密码"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              className="input w-full pr-10"
              placeholder="新密码（至少 6 位）"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNew((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            type="password"
            className="input w-full"
            placeholder="确认新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={changing}
            className="btn-primary w-full text-sm"
          >
            {changing ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  )
}
