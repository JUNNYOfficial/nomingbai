import { useState, useEffect } from 'react'
import { commonsenseAPI } from '../api'
import { useToast } from '../components/Toast'
import {
  Database, Tag, Plus, Trash2, Edit3, Search,
  BookOpen, BarChart3, AlertTriangle, Check, X
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
  const { addToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [listRes, catRes] = await Promise.all([
        commonsenseAPI.list({ page: 1, limit: 100 }),
        commonsenseAPI.categories()
      ])
      const data = listRes.data.data || []
      setItems(data)
      setCategories(catRes.data.data || [])

      const byCategory = {}
      for (const item of data) {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1
      }
      setStats({ total: data.length, byCategory })
    } catch (err) {
      addToast('加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredItems = search.trim()
    ? items.filter((item) =>
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    : items

  const handleDelete = async (id) => {
    if (!confirm(`确定要删除 ${id} 吗？`)) return
    try {
      await commonsenseAPI.delete(id)
      addToast('删除成功', 'success')
      fetchData()
    } catch (err) {
      addToast('删除失败', 'error')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingItem.id) {
        await commonsenseAPI.update(editingItem.id, editingItem)
        addToast('更新成功', 'success')
      } else {
        await commonsenseAPI.create(editingItem)
        addToast('创建成功', 'success')
      }
      setShowForm(false)
      setEditingItem(null)
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || '保存失败', 'error')
    }
  }

  const startEdit = (item) => {
    setEditingItem({ ...item })
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
      tags: [],
      related: [],
      source: ''
    })
    setShowForm(true)
  }

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
                <label className="block text-sm font-medium mb-1">难度</label>
                <select className="input" value={editingItem.difficulty} onChange={(e) => setEditingItem({ ...editingItem, difficulty: e.target.value })}>
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
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
              {filteredItems.map((item) => (
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
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">暂无数据</div>
          )}
        </div>
      )}
    </div>
  )
}
