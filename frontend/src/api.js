import axios from 'axios'
import { localAuthAPI, localAgentAPI, localCommonsenseAPI } from './services/local/localApi'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

let useLocal = false

// Detect backend availability on load
async function detectBackend() {
  try {
    const res = await fetch(`${API_BASE}/status`, { method: 'GET', signal: AbortSignal.timeout(3000) })
    useLocal = !res.ok
  } catch {
    useLocal = true
  }
  if (useLocal) {
    console.log('[API] Backend not available, using local mode')
  }
}

detectBackend()

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nomingbai_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.hash.includes('/login')) {
        localStorage.removeItem('nomingbai_token')
        localStorage.removeItem('nomingbai_user')
        const msg = error.response?.data?.error || '登录已过期，请重新登录'
        alert(msg)
        window.location.href = '#/login'
      }
    }
    return Promise.reject(error)
  }
)

// Wrapper that falls back to local API when backend is down
function withFallback(remoteFn, localFn) {
  return async (...args) => {
    if (useLocal) {
      return localFn(...args)
    }
    try {
      return await remoteFn(...args)
    } catch (err) {
      // If network error or 404, switch to local mode and retry
      if (!err.response || err.response.status === 404) {
        useLocal = true
        console.log('[API] Switched to local mode due to error')
        return localFn(...args)
      }
      throw err
    }
  }
}

export default api

export const authAPI = {
  register: (username, password) => withFallback(
    () => api.post('/auth/register', { username, password }),
    () => localAuthAPI.register(username, password)
  ),
  login: (username, password) => withFallback(
    () => api.post('/auth/login', { username, password }),
    () => localAuthAPI.login(username, password)
  ),
  me: () => withFallback(
    () => api.get('/auth/me'),
    () => localAuthAPI.me()
  ),
  changePassword: (currentPassword, newPassword) => withFallback(
    () => api.post('/auth/change-password', { currentPassword, newPassword }),
    () => localAuthAPI.changePassword(currentPassword, newPassword)
  ),
  listUsers: (params) => withFallback(
    () => api.get('/auth/users', { params }),
    () => localAuthAPI.listUsers(params)
  ),
  deleteUser: (id) => withFallback(
    () => api.delete(`/auth/users/${id}`),
    () => localAuthAPI.deleteUser(id)
  ),
  updateUserRole: (id, role) => withFallback(
    () => api.put(`/auth/users/${id}/role`, { role }),
    () => localAuthAPI.updateUserRole(id, role)
  )
}

export const agentAPI = {
  invoke: (prompt) => withFallback(
    () => api.post('/agent/invoke', { prompt }),
    () => localAgentAPI.invoke(prompt)
  ),
  invokeStream: async (prompt) => {
    if (useLocal) {
      return localAgentAPI.invokeStream(prompt)
    }
    try {
      const response = await fetch(`${API_BASE}/agent/invoke-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nomingbai_token') || ''}`
        },
        body: JSON.stringify({ prompt })
      })
      if (!response.ok) throw new Error('Stream failed')
      return response
    } catch {
      useLocal = true
      return localAgentAPI.invokeStream(prompt)
    }
  },
  history: (page = 1, limit = 20) => withFallback(
    () => api.get('/agent/history', { params: { page, limit } }),
    () => localAgentAPI.history(page, limit)
  )
}

export const commonsenseAPI = {
  list: (params) => withFallback(
    () => api.get('/commonsense', { params }),
    () => localCommonsenseAPI.list(params)
  ),
  categories: () => withFallback(
    () => api.get('/commonsense/categories'),
    () => localCommonsenseAPI.categories()
  ),
  getById: (id) => withFallback(
    () => api.get(`/commonsense/${id}`),
    () => localCommonsenseAPI.getById(id)
  ),
  create: (data) => withFallback(
    () => api.post('/commonsense', data),
    () => localCommonsenseAPI.create(data)
  ),
  update: (id, data) => withFallback(
    () => api.put(`/commonsense/${id}`, data),
    () => localCommonsenseAPI.update(id, data)
  ),
  delete: (id) => withFallback(
    () => api.delete(`/commonsense/${id}`),
    () => localCommonsenseAPI.delete(id)
  )
}
