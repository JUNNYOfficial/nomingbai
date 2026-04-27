import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nomingbai_token')
    const userStr = localStorage.getItem('nomingbai_user')
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch {
        localStorage.removeItem('nomingbai_token')
        localStorage.removeItem('nomingbai_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((token, username, role = 'user') => {
    const userData = { username, role }
    localStorage.setItem('nomingbai_token', token)
    localStorage.setItem('nomingbai_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('nomingbai_token')
    localStorage.removeItem('nomingbai_user')
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authAPI.me()
      const updated = { username: res.data.username, role: res.data.role }
      localStorage.setItem('nomingbai_user', JSON.stringify(updated))
      setUser(updated)
      return updated
    } catch {
      return null
    }
  }, [])

  const isAdmin = user?.role === 'admin'

  return { user, loading, isLoggedIn: !!user, isAdmin, login, logout, refreshProfile }
}
