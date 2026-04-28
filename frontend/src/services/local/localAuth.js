const STORAGE_KEY = 'nomingbai_local_users'
const CURRENT_USER_KEY = 'nomingbai_user'
const TOKEN_KEY = 'nomingbai_token'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export async function registerUser(username, password) {
  const users = getUsers()
  if (users.some((u) => u.username === username)) {
    throw new Error('用户名已存在')
  }
  // Simple hash: not secure but works for demo
  const passwordHash = btoa(password + '_salt')
  const user = {
    id: Date.now(),
    username,
    password_hash: passwordHash,
    role: 'user',
    created_at: new Date().toISOString()
  }
  users.push(user)
  saveUsers(users)
  return { username, role: 'user' }
}

export async function authenticateUser(username, password) {
  const users = getUsers()
  const user = users.find((u) => u.username === username)
  if (!user) throw new Error('用户名或密码错误')
  const hash = btoa(password + '_salt')
  if (user.password_hash !== hash) throw new Error('用户名或密码错误')
  return { id: user.id, username: user.username, role: user.role || 'user' }
}

export async function getUserById(id) {
  const users = getUsers()
  return users.find((u) => u.id === id) || null
}

export async function listUsers(page = 1, limit = 20) {
  const users = getUsers()
  const start = (page - 1) * limit
  const items = users.slice(start, start + limit).map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role || 'user',
    created_at: u.created_at
  }))
  return { users: items, total: users.length }
}

export async function deleteUser(id) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('用户不存在')
  users.splice(idx, 1)
  saveUsers(users)
  return true
}

export async function updateUserRole(id, role) {
  if (!['user', 'admin'].includes(role)) throw new Error('无效的角色')
  const users = getUsers()
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('用户不存在')
  user.role = role
  saveUsers(users)
  return true
}

export function getLocalToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setLocalAuth(token, userData) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData))
}

export function clearLocalAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}
