import { useState, useEffect, useCallback } from 'react'

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

  const login = useCallback((token, username) => {
    const userData = { username }
    localStorage.setItem('nomingbai_token', token)
    localStorage.setItem('nomingbai_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('nomingbai_token')
    localStorage.removeItem('nomingbai_user')
    setUser(null)
  }, [])

  return { user, loading, isLoggedIn: !!user, login, logout }
}
