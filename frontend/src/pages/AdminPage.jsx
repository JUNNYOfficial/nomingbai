import { useState, useEffect } from 'react'
import { commonsenseAPI } from '../api'
import { useToast } from '../components/Toast'
import {
  Database, Tag, Plus, Trash2, Edit3, Search,
  BookOpen, BarChart3, AlertTriangle, Check, X, ChevronLeft, ChevronRight
} from 'lucide-react'

export default function AdminPage() {
  useEffect(() => { document.title = '管理后台 — 未言' }, [])

  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({ total: 0, byCategory: {} })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 15
  const { addToast } = useToast()

  const fetchData = async (targetPage = page) => {
    setLoading(true)
    try {
      const params = { page: targetPage, limit }
      if (search.trim()) params.q = search.trim()

      const [listRes, catRes] = await Promise.all([
        commonsenseAPI.list(params),
        commonsenseAPI.categories()
      ])
      const data = listRes.data.data || []
      setItems(data)
      setTotal(listRes.data.total || 0)
      setCategories(catRes.data.data || [])

      // Fetch stats separately (all items for category counts)
      const allRes = await commonsenseAPI.list({ page: 1, limit: 1000 })
      const allData = allRes.data.data || []
      const byCategory = {}
      for (const item of allData) {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1
      }
      setStats({ total: allRes.data.total || 0, byCategory })
    } catch (err) {
      addToast(err.response?.data?.error || '加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchData(1)
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    fetchData(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleDelete = async (id) => {
    if (!confirm(`确定要删除 ${id} 吗？`)) return
    try {
      await commonsenseAPI.delete(id)
      addToast('删除成功', 'success')
      fetchData(page)
    } catch (err) {
      addToast(err.response?.data?.error || '删除失败', 'error')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...editingItem,
        tags: typeof editingItem.tags === 'string'
          ? editingItem.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : editingItem.tags || [],
        related: typeof editingItem.related === 'string'
          ? editingItem.related.split(',').map((t) => t.trim()).filter(Boolean)
          : editingItem.related || []
      }
      if (editingItem.id) {
        await commonsenseAPI.update(editingItem.id, payload)
        addToast('更新成功', 'success')
      } else {
        await commonsenseAPI.create(payload)
        addToast('创建成功', 'success')
      }
      setShowForm(false)
      setEditingItem(null)
      fetchData(page)
    } catch (err) {
      addToast(err.response?.data?.error || '保存失败', 'error')
    }
  }

  const startEdit = (item) => {
    setEditingItem({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      related: Array.isArray(item.related) ? item.related.join(', ') : item.related || ''
    })
    setShowForm(true)
  }

  const startCreate = () => {
    setEditingItem({
      id: '',
      category: categories[0] || '',
      question: '',
      answer: '',
      trap: '',
      context: '',
      difficulty: 'medium',
      tags: '',
      related: '',
      source: ''
    })
    setShowForm(true)
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="page-container max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-gray-700" />
        <h1 className="text-xl font-bold text-gray-900">常识库管理</h1>
        <span className="text-sm text-gray-400 ml-auto">共 {stats.total} 条</span>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">总条目</div>
        </div>
        {categories.map((cat) => (
          <div key={cat} className="card p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.byCategory[cat] || 0}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {cat}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
        <button onClick={startCreate} className="btn-primary inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          新增常识
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingItem?.id ? '编辑常识' : '新增常识'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID</label>
                <input className="input" value={editingItem.id} onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <select className="input" value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">问题</label>
                <input className="input" value={editingItem.question} onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">回答</label>
                <textarea className="input min-h-[100px]" value={editingItem.answer} onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">认知陷阱</label>
                <input className="input" value={editingItem.trap} onChange={(e) => setEditingItem({ ...editingItem, trap: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">上下文 / 场景</label>
                <input className="input" value={editingItem.context} onChange={(e) => setEditingItem({ ...editingItem, context: e.target.value })} placeholder="例如：职场、社交、面试..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">难度</label>
                <select className="input" value={editingItem.difficulty} onChange={(e) => setEditingItem({ ...editingItem, difficulty: e.target.value })}>
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">标签</label>
                <input
                  className="input"
                  value={editingItem.tags}
                  onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value })}
                  placeholder="用逗号分隔，例如：职场, 沟通, 礼仪"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">关联条目 ID</label>
                <input
                  className="input"
                  value={editingItem.related}
                  onChange={(e) => setEditingItem({ ...editingItem, related: e.target.value })}
                  placeholder="用逗号分隔，例如：work-01, social-03"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">来源</label>
                <input className="input" value={editingItem.source} onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })} placeholder="例如：观察总结、用户反馈" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">保存</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">分类</th>
                  <th className="px-4 py-3 text-left font-medium">问题</th>
                  <th className="px-4 py-3 text-left font-medium">难度</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{item.question}</td>
                    <td className="px-4 py-3">
                      {item.difficulty === 'easy' ? '⭐' : item.difficulty === 'hard' ? '⭐⭐⭐' : '⭐⭐'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-gray-700 mr-2">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">暂无数据</p>
                <button onClick={startCreate} className="text-sm text-gray-900 hover:underline inline-flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  创建第一条常识
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost text-xs px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-3 h-3" />
                上一页
              </button>
              <span className="text-xs text-gray-500">
                第 {page} / {totalPages} 页 · 共 {total} 条
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-ghost text-xs px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-40"
              >
                下一页
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
