import { loadAllData } from './dataLoader'

const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也',
  '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那',
  '什么', '怎么', '吗', '呢', '吧', '啊', '哦', '嗯', '与', '及', '等', '或', '但是',
  '然而', '因为', '所以', '如果', '虽然', '比如', '例如', '一下', '多少', '多久', '多长',
  '多大', '几', '问', '问题', '回答', '解答', '告诉', '知道', '了解', '关于', '有关',
  '一些', '哪', '哪些', '谁', '为什么', '可以', '需要', '应该', '能', '会', '让',
  '把', '被', '对', '将', '还', '而', '且', '又', '并', '但', '只', '最', '更', '太',
  '非常', '已经', '正在', '曾经', '过', '得', '地', '着', '给', '向', '从',
  '比', '跟', '同', '为', '以', '于', '即', '便', '即使', '尽管', '无论', '不管'
])

function extractTokens(text) {
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
  const tokens = cleaned.split(/\s+/).filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
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

export async function searchCommonsense(query, limit = 5) {
  const data = await loadAllData()
  const items = data.commonsense
  if (!items.length) return []

  const scored = items.map((item) => {
    let score = 0
    score += scoreTokens(query, item.question) * 4
    score += scoreTokens(query, item.answer) * 2
    score += scoreTokens(query, item.category) * 3
    score += scoreKeywords(query, item.tags) * 2
    if (item.context) score += scoreTokens(query, item.context)
    return { item, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export async function getRandomCommonsense(limit = 1) {
  const data = await loadAllData()
  const items = data.commonsense
  if (!items.length) return []
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

export async function getCategories() {
  const data = await loadAllData()
  return [...new Set(data.commonsense.map((i) => i.category))].filter(Boolean)
}

export async function getCommonsenseList({ category, page = 1, limit = 20 } = {}) {
  const data = await loadAllData()
  let items = data.commonsense
  if (category) items = items.filter((i) => i.category === category)
  const start = (page - 1) * limit
  return items.slice(start, start + limit)
}

export async function countCommonsense(category) {
  const data = await loadAllData()
  if (category) return data.commonsense.filter((i) => i.category === category).length
  return data.commonsense.length
}

export async function getCommonsenseById(id) {
  const data = await loadAllData()
  return data.commonsense.find((i) => i.id === id) || null
}
