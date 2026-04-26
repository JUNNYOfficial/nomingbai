import { useState, useRef, useEffect } from 'react'
import { agentAPI } from '../api'
import { Send, Lightbulb, User, Bot, AlertTriangle } from 'lucide-react'

const EXAMPLES = [
  '一会儿代表多长时间？',
  '面试应该提前多久到？',
  '马上到是什么意思？',
  '饭局提前多久合适？',
  '改天吃饭是哪天？',
  '奶茶几分糖最不容易踩雷？',
]

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setError('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg, time: new Date() }])
    setLoading(true)

    try {
      const res = await agentAPI.invoke(userMsg)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.output, time: new Date(res.data.createdAt) }
      ])
    } catch (err) {
      const msg = err.response?.data?.error || '调用失败，请稍后重试'
      setError(msg)
      setMessages((prev) => [...prev, { role: 'error', content: msg, time: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const setExample = (text) => {
    setInput(text)
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pr-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">开始对话</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                输入你的问题，nomingbai 会基于常识库为你解答生活中的隐性常识。
              </p>
              <div className="w-full max-w-md">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1 justify-center">
                  <Lightbulb className="w-3 h-3" />
                  试试这些问题
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setExample(ex)}
                      className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {msg.role === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : msg.role === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-gray-400' : 'text-gray-400'}`}>
                  {msg.time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="pt-4 border-t border-gray-200 mt-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="输入你的问题..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary px-4"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-2 text-center">
            nomingbai 的回答基于常识库，仅供参考
          </p>
        </div>
      </div>
    </div>
  )
}
