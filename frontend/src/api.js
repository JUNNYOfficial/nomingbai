import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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
      // Avoid redirect loop if already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('nomingbai_token')
        localStorage.removeItem('nomingbai_user')
        // Show a brief message before redirect
        const msg = error.response?.data?.error || '登录已过期，请重新登录'
        alert(msg)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  register: (username, password) => api.post('/auth/register', { username, password }),
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
}

export const agentAPI = {
  invoke: (prompt) => api.post('/agent/invoke', { prompt }),
  invokeStream: (prompt) => {
    return fetch('/api/agent/invoke-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('nomingbai_token') || ''}`
      },
      body: JSON.stringify({ prompt })
    })
  },
  history: (page = 1, limit = 20) => api.get('/agent/history', { params: { page, limit } }),
}

export const commonsenseAPI = {
  list: (params) => api.get('/commonsense', { params }),
  categories: () => api.get('/commonsense/categories'),
  getById: (id) => api.get(`/commonsense/${id}`),
  create: (data) => api.post('/commonsense', data),
  update: (id, data) => api.put(`/commonsense/${id}`, data),
  delete: (id) => api.delete(`/commonsense/${id}`),
}
