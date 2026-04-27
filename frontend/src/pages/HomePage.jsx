import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowRight, Sparkles, BookOpen, Clock, Shield } from 'lucide-react'
import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => { document.title = '未言 — 解答生活中的隐性常识' }, [])
  const { isLoggedIn } = useAuth()

  return (
    <div className="page-container">
      <div className="text-center py-16 sm:py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          基于常识库的智能 Agent
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
          解答生活中的隐性常识
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
          未言是一个专注于日常生活常识的 AI Agent。<br className="hidden sm:block" />
          从时间语义到社交礼仪，帮你理解那些"明明应该知道却没人教"的事情。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isLoggedIn ? (
            <Link to="/chat" className="btn-primary text-base px-6 py-3">
              开始对话
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary text-base px-6 py-3">
                登录 / 注册
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link to="/browse" className="btn-secondary text-base px-6 py-3">
                先逛逛常识库
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="card text-center">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">丰富的常识库</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">覆盖时间、空间、社交、消费等 8 大类日常生活常识</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">智能语义理解</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">精准识别模糊时间词、社交潜台词等隐性语义</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">认知陷阱提醒</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">每条常识附带认知陷阱解析，帮你避免常见误区</p>
        </div>
      </div>
    </div>
  )
}
