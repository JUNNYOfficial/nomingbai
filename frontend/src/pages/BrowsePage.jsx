import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { commonsenseAPI } from '../api'
import { Search, BookOpen, Tag, ChevronRight, Layers } from 'lucide-react'

export default function BrowsePage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (activeCategory) params.category = activeCategory
      if (search.trim()) params.q = search.trim()

      const res = await commonsenseAPI.list(params)
      setItems(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error('Failed to load commonsense:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await commonsenseAPI.categories()
      setCategories(res.data.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchItems()
  }, [activeCategory, page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchItems()
  }

  return (
    <div className="page-container max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-gray-700" />
        <h1 className="text-xl font-bold text-gray-900">常识库</h1>
        <span className="text-sm text-gray-400 ml-auto">共 {total} 条</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="搜索常识..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">
          搜索
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setActiveCategory(''); setPage(1) }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeCategory
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-3 h-3" />
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setPage(1) }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Tag className="w-3 h-3" />
            {cat}
          </button>
        ))}
      </div>

      {loading && items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">暂无数据</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/browse/${item.id}`}
            className="card p-4 hover:border-gray-300 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                {item.category}
              </span>
              {item.difficulty && (
                <span className="text-[10px] text-gray-400">
                  {item.difficulty === 'easy' ? '⭐' : item.difficulty === 'hard' ? '⭐⭐⭐' : '⭐⭐'}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
              {item.question}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
              {item.answer}
            </p>
            <div className="flex items-center gap-1 mt-3 text-[11px] text-gray-400 group-hover:text-gray-600 transition-colors">
              查看详情 <ChevronRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {Math.ceil(total / limit) > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            上一页
          </button>
          <span className="text-xs text-gray-500">
            第 {page} 页，共 {Math.ceil(total / limit)} 页
          </span>
          <button
            onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))}
            disabled={page >= Math.ceil(total / limit)}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
