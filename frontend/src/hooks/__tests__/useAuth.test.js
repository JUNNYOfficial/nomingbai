import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns not logged in by default', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('login stores user and token', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.login('fake-token', 'testuser', 'admin')
    })
    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.user).toEqual({ username: 'testuser', role: 'admin' })
    expect(result.current.isAdmin).toBe(true)
    expect(localStorage.getItem('nomingbai_token')).toBe('fake-token')
  })

  it('logout clears state', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.login('fake-token', 'testuser')
    })
    act(() => {
      result.current.logout()
    })
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('nomingbai_token')).toBeNull()
  })
})
