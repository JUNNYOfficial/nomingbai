import { useState, useEffect } from 'react'
import { agentAPI } from '../api'
import { History, ChevronLeft, ChevronRight, MessageSquare, Clock, Copy, Check } from 'lucide-react'
import { useToast } from '../components/Toast'

export default function HistoryPage() {
  useEffect(() => { document.title = '历史记录 — nomingbai' }, [])
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const { addToast } = useToast()

  const totalPages = Math.ceil(total / limit)

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await agentAPI.history(page, limit)
      setLogs(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.error || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page])

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-gray-700" />
        <h1 className="text-xl font-bold text-gray-900">对话历史</h1>
        <span className="text-sm text-gray-400 ml-auto">共 {total} 条</span>
      </div>

      {loading && logs.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded flex-shrink-0" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
                <div className="h-3 w-4/6 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm text-center">{error}</div>
      )}

      {!loading && logs.length === 0 && !error && (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">暂无对话记录</p>
          <p className="text-gray-400 text-xs mt-1">开始与 Agent 对话后，记录会出现在这里</p>
        </div>
      )}

      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="card p-4 hover:border-gray-300 transition-colors group">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{log.prompt}</p>
              <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(log.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {log.response}
            </p>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(log.response)
                  setCopiedId(log.id)
                  setTimeout(() => setCopiedId(null), 2000)
                  addToast('回答已复制到剪贴板', 'success')
                } catch {
                  addToast('复制失败，请手动复制', 'error')
                }
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            >
              {copiedId === log.id ? (
                <>
                  <Check className="w-3 h-3" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  复制回答
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
