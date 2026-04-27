import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

const SHORTCUTS = [
  { key: '/', desc: '聚焦搜索框（常识库页面）' },
  { key: 'Ctrl + L', desc: '清空当前对话' },
  { key: 'Esc', desc: '退出搜索框聚焦' },
  { key: '?', desc: '显示/隐藏快捷键帮助' },
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault()
          setOpen((o) => !o)
        }
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-sm p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            键盘快捷键
          </h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-4 text-center">按 ? 或 Esc 关闭</p>
      </div>
    </div>
  )
}
