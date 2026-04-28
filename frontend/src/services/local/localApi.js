/**
 * Local API adapter — simulates axios responses using browser-only logic.
 * Used when no backend server is available (e.g. GitHub Pages deployment).
 */

import { invokeAgent, streamResponse } from './localAgent'
import {
  registerUser, authenticateUser, getUserById,
  listUsers, deleteUser, updateUserRole
} from './localAuth'
import { saveAgentLog, getHistoryList } from './localHistory'
import {
  searchCommonsense, getCategories, getCommonsenseList,
  countCommonsense, getCommonsenseById
} from './commonsenseSearch'

// Helper to simulate axios response shape
function ok(data) {
  return Promise.resolve({ data, status: 200, statusText: 'OK' })
}

function created(data) {
  return Promise.resolve({ data, status: 201, statusText: 'Created' })
}

function err(message, status = 400) {
  const error = new Error(message)
  error.response = { data: { error: message }, status }
  return Promise.reject(error)
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('nomingbai_user') || 'null')
  } catch {
    return null
  }
}

export const localAuthAPI = {
  register: async (username, password) => {
    try {
      const result = await registerUser(username, password)
      return created({ message: '注册成功' })
    } catch (e) {
      return err(e.message, 400)
    }
  },

  login: async (username, password) => {
    try {
      const user = await authenticateUser(username, password)
      const token = 'local_' + btoa(user.username + ':' + Date.now())
      localStorage.setItem('nomingbai_token', token)
      localStorage.setItem('nomingbai_user', JSON.stringify({ username: user.username, role: user.role }))
      return ok({ token, username: user.username, role: user.role })
    } catch (e) {
      return err(e.message, 401)
    }
  },

  me: async () => {
    const user = getCurrentUser()
    if (!user) return err('未登录', 401)
    return ok({ id: 1, username: user.username, role: user.role || 'user', created_at: new Date().toISOString() })
  },

  changePassword: async (currentPassword, newPassword) => {
    return err('本地模式不支持修改密码', 400)
  },

  listUsers: async (params = {}) => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') return err('Forbidden: admin access required', 403)
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20))
    const result = await listUsers(page, limit)
    return ok({ data: result.users, total: result.total, page, limit })
  },

  deleteUser: async (id) => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') return err('Forbidden: admin access required', 403)
    try {
      await deleteUser(Number(id))
      return ok({ message: '用户已删除' })
    } catch (e) {
      return err(e.message, 404)
    }
  },

  updateUserRole: async (id, role) => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') return err('Forbidden: admin access required', 403)
    try {
      await updateUserRole(Number(id), role)
      return ok({ message: '角色已更新' })
    } catch (e) {
      return err(e.message, 400)
    }
  }
}

export const localAgentAPI = {
  invoke: async (prompt) => {
    const user = getCurrentUser()
    const username = user?.username || 'guest'
    const res = await invokeAgent(username, prompt)
    await saveAgentLog(username, prompt, res.output)
    return ok(res)
  },

  invokeStream: async (prompt) => {
    // Local stream: return a Response-like object with a readable body
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const gen = streamResponse(prompt)
        for await (const event of gen) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
        controller.close()
      }
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' }
    })
  },

  history: async (page = 1, limit = 20) => {
    const user = getCurrentUser()
    if (!user) return err('未登录', 401)
    const result = await getHistoryList(user.username, page, limit)
    return ok(result)
  }
}

export const localCommonsenseAPI = {
  list: async (params = {}) => {
    const { category, page = 1, limit = 20, q } = params
    if (q) {
      const results = await searchCommonsense(q, Number(limit) || 10)
      return ok({ data: results.map((r) => r.item), query: q, total: results.length })
    }
    const list = await getCommonsenseList({ category, page: Number(page), limit: Number(limit) })
    const total = await countCommonsense(category)
    return ok({ data: list, total, page: Number(page), limit: Number(limit), category: category || null })
  },

  categories: async () => {
    const cats = await getCategories()
    return ok({ data: cats })
  },

  getById: async (id) => {
    const item = await getCommonsenseById(id)
    if (!item) return err('常识条目不存在', 404)
    return ok({ data: item })
  },

  create: async (data) => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') return err('Forbidden: admin access required', 403)
    return err('本地模式暂不支持创建常识', 400)
  },

  update: async (id, data) => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') return err('Forbidden: admin access required', 403)
    return err('本地模式暂不支持更新常识', 400)
  },

  delete: async (id) => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') return err('Forbidden: admin access required', 403)
    return err('本地模式暂不支持删除常识', 400)
  }
}
