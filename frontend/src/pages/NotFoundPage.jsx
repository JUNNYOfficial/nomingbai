import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Bot, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  useEffect(() => { document.title = '页面未找到 — 未言' }, [])
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-gray-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-6">这个页面不存在，或者被 Agent 藏起来了。</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          回到首页
        </Link>
      </div>
    </div>
  )
}
