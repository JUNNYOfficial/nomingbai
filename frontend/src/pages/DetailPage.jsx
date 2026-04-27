import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { commonsenseAPI } from '../api'
import { ArrowLeft, Tag, AlertTriangle, BookOpen, Link2, Info, Star } from 'lucide-react'
import { SkeletonDetail } from '../components/Skeleton'

export default function DetailPage() {
  useEffect(() => { document.title = '常识详情 — 未言' }, [])
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await commonsenseAPI.getById(id)
        setItem(res.data.data)
      } catch (err) {
        setError(err.response?.data?.error || '加载失败')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) {
    return (
      <div className="page-container max-w-2xl">
        <div className="inline-flex items-center gap-1 text-sm text-gray-300 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回常识库
        </div>
        <SkeletonDetail />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container max-w-2xl">
        <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm text-center">{error}</div>
        <div className="text-center mt-4">
          <Link to="/browse" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">← 返回常识库</Link>
        </div>
      </div>
    )
  }

  if (!item) return null

  const difficultyStars = {
    easy: '⭐',
    medium: '⭐⭐',
    hard: '⭐⭐⭐'
  }

  return (
    <div className="page-container max-w-2xl">
      <Link
        to="/browse"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回常识库
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-medium">
            <BookOpen className="w-3 h-3" />
            {item.category}
          </span>
          {item.difficulty && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" title="难度">
              <Star className="w-3 h-3" />
              {difficultyStars[item.difficulty] || item.difficulty}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{item.question}</h1>

        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
          {item.answer}
        </div>

        {item.trap && (
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 mb-4">
            <div className="flex items-center gap-1.5 text-amber-700 text-sm font-semibold mb-1">
              <AlertTriangle className="w-4 h-4" />
              认知陷阱
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">{item.trap}</p>
          </div>
        )}

        {item.context && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-4">
            <div className="flex items-center gap-1.5 text-blue-700 text-sm font-semibold mb-1">
              <Info className="w-4 h-4" />
              适用场景
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{item.context}</p>
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex items-start gap-2 mb-4">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.related && item.related.length > 0 && (
          <div className="flex items-start gap-2 mb-4">
            <Link2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {item.related.map((rel) => (
                <span
                  key={rel}
                  className="px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs border border-gray-100 dark:border-gray-800"
                >
                  {rel}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.source && (
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            来源：{item.source}
          </p>
        )}
      </div>
    </div>
  )
}
