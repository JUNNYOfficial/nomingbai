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
      localStorage.removeItem('nomingbai_token')
      localStorage.removeItem('nomingbai_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  register: (username, password) => api.post('/auth/register', { username, password }),
  login: (username, password) => api.post('/auth/login', { username, password }),
}

export const agentAPI = {
  invoke: (prompt) => api.post('/agent/invoke', { prompt }),
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
