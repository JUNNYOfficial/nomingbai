import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Bot, BookOpen, History, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { to: '/', label: '对话', icon: Bot },
    { to: '/browse', label: '常识库', icon: BookOpen },
    { to: '/history', label: '历史记录', icon: History },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-semibold text-lg tracking-tight">
            <Bot className="w-5 h-5" />
            nomingbai
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-xs py-1.5 px-3">
                登录
              </Link>
            )}
          </div>

          <button
            className="sm:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.to)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 font-medium"
                >
                  <User className="w-4 h-4" />
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
