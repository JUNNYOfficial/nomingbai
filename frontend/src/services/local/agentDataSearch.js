import { loadAllData } from './dataLoader'

function extractTokens(text) {
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
  const tokens = cleaned.split(/\s+/).filter((t) => t.length >= 2)
  const bigrams = []
  for (const token of tokens) {
    if (/^[\u4e00-\u9fa5]+$/.test(token) && token.length >= 3) {
      for (let i = 0; i <= token.length - 2; i++) {
        bigrams.push(token.slice(i, i + 2))
      }
    }
  }
  return [...new Set([...tokens, ...bigrams])]
}

function scoreKeywords(query, keywords) {
  const q = query.toLowerCase()
  let score = 0
  for (const kw of keywords || []) {
    const kl = kw.toLowerCase()
    if (q.includes(kl)) {
      score += 2
      if (q === kl) score += 1
    }
  }
  return score
}

function scoreTokens(query, text) {
  const qTokens = extractTokens(query)
  const tTokens = extractTokens(text)
  let score = 0
  for (const qt of qTokens) {
    for (const tt of tTokens) {
      if (qt === tt) score += 3
      else if (tt.includes(qt) || qt.includes(tt)) score += 1.5
    }
  }
  return score
}

export async function classifyIntent(query) {
  const data = await loadAllData()
  if (!data.intents.length) return null

  let best = null
  let bestScore = 0

  for (const item of data.intents) {
    let score = 0
    for (const q of item.user_queries || []) score += scoreTokens(query, q)
    score += scoreKeywords(query, item.keywords)
    score += scoreTokens(query, item.intent)
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }

  return best ? { item: best, score: bestScore } : null
}

export async function searchAgentData(agentType, query, limit = 3) {
  const data = await loadAllData()
  let dataset = []
  if (agentType === '职场Agent') dataset = [...data.work, ...data.master]
  else if (agentType === '社交Agent') dataset = [...data.social, ...data.master]
  else if (agentType === '主控Agent') dataset = data.master
  else dataset = [...data.work, ...data.social, ...data.master]

  if (!dataset.length) return []

  const scored = dataset.map((item) => {
    let score = 0
    score += scoreTokens(query, item.intent) * 3
    for (const tag of item.tags || []) score += scoreTokens(query, tag) * 2
    for (const turn of item.conversation || []) score += scoreTokens(query, turn.content) * 0.5
    for (const lesson of item.source_lessons || []) score += scoreTokens(query, lesson) * 0.5
    return { item, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function formatConversationResponse(item) {
  const conversation = item.conversation || []
  if (!conversation.length) return null

  let bestResponse = ''
  for (const turn of conversation) {
    if (turn.role === 'assistant' && turn.content.length > bestResponse.length) {
      bestResponse = turn.content
    }
  }
  if (!bestResponse) return null

  let output = bestResponse
  const meta = []
  if (item.agent_type) meta.push(`📌 ${item.agent_type}`)
  if (item.intent) meta.push(`主题：${item.intent}`)
  if (item.priority) meta.push(`优先级：${item.priority}`)
  if (meta.length) output = meta.join(' | ') + '\n\n' + output

  if (item.source_lessons?.length) {
    output += '\n\n📚 相关课程：' + item.source_lessons.join('、')
  }
  if (item.tags?.length) {
    output += '\n🏷️ ' + item.tags.join('、')
  }
  return output
}
