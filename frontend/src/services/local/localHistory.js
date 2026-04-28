const HISTORY_KEY = 'nomingbai_local_history'

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 500)))
}

export async function saveAgentLog(username, prompt, response) {
  const items = getHistory()
  items.unshift({
    id: Date.now(),
    username,
    prompt,
    response,
    created_at: new Date().toISOString()
  })
  saveHistory(items)
}

export async function getHistoryList(username, page = 1, limit = 20) {
  const items = getHistory().filter((i) => i.username === username)
  const total = items.length
  const start = (page - 1) * limit
  return {
    data: items.slice(start, start + limit),
    total,
    page,
    limit
  }
}
