import { searchCommonsense, getRandomCommonsense } from './commonsenseSearch'
import { classifyIntent, searchAgentData, formatConversationResponse } from './agentDataSearch'

function difficultyToStars(difficulty) {
  const map = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' }
  return map[difficulty] || difficulty
}

export async function generateResponse(prompt) {
  const scoredResults = await searchCommonsense(prompt, 5)
  const topCommonsenseScore = scoredResults.length > 0 ? scoredResults[0].score : 0

  const intentResult = await classifyIntent(prompt)
  let agentResults = []
  let agentType = null

  if (intentResult && intentResult.score >= 3) {
    agentType = intentResult.item.agent_type
    agentResults = await searchAgentData(agentType, prompt, 3)
  }

  if (agentResults.length === 0) {
    agentResults = await searchAgentData(null, prompt, 3)
  }

  const topAgentScore = agentResults.length > 0 ? agentResults[0].score : 0

  const useAgentData = topAgentScore >= 6 && topAgentScore > topCommonsenseScore * 2
  const useCommonsenseHigh = topCommonsenseScore >= 12 && !useAgentData
  const useCommonsenseMedium = topCommonsenseScore >= 5 && !useAgentData && topAgentScore < 6

  if (useAgentData) {
    const primary = agentResults[0].item
    const formatted = formatConversationResponse(primary)
    if (formatted) {
      let output = formatted
      if (agentResults.length >= 2 && agentResults[1].score >= 4) {
        const secondary = agentResults[1].item
        const secFormatted = formatConversationResponse(secondary)
        if (secFormatted) {
          output += `\n\n📌 你可能还想了解：${secondary.intent}\n${secFormatted.split('\n\n').slice(1).join('\n\n').substring(0, 200)}...`
        }
      }
      if (topCommonsenseScore >= 5) {
        const cs = scoredResults[0].item
        output += `\n\n📖 相关常识：${cs.question}\n${cs.answer}`
      }
      return output
    }
  }

  if (useCommonsenseHigh) {
    const primary = scoredResults[0].item
    let output = `${primary.answer}`
    if (scoredResults.length >= 2 && scoredResults[1].score >= 8) {
      const secondary = scoredResults[1].item
      output += `\n\n📌 你可能还想了解：${secondary.question}\n${secondary.answer}`
    }
    output += `\n\n⚠️ 认知陷阱：${primary.trap}`
    output += `\n📊 难度：${difficultyToStars(primary.difficulty)}`
    if (primary.related && primary.related.length > 0) {
      output += `\n🔗 关联条目：${primary.related.join(', ')}`
    }
    return output
  }

  if (useCommonsenseMedium) {
    const primary = scoredResults[0].item
    let output = `${primary.answer}`
    if (scoredResults.length >= 2 && scoredResults[1].score >= 8) {
      const secondary = scoredResults[1].item
      output += `\n\n📌 你可能还想了解：${secondary.question}\n${secondary.answer}`
    }
    output += `\n\n⚠️ 认知陷阱：${primary.trap}`
    output += `\n📊 难度：${difficultyToStars(primary.difficulty)}`
    if (primary.related && primary.related.length > 0) {
      output += `\n🔗 关联条目：${primary.related.join(', ')}`
    }
    return output
  }

  if (topCommonsenseScore >= 5) {
    const primary = scoredResults[0].item
    let output = `根据你的问题，我找到了相关内容：\n\n${primary.question}\n\n${primary.answer}`
    if (scoredResults.length >= 2) {
      const others = scoredResults.slice(1, 3)
      output += '\n\n💡 相关常识：'
      for (const r of others) {
        output += `\n  · ${r.item.question}`
      }
    }
    return output
  }

  if (topAgentScore >= 3) {
    const primary = agentResults[0].item
    const formatted = formatConversationResponse(primary)
    if (formatted) return formatted
  }

  const randomData = await getRandomCommonsense(1)
  if (randomData.length > 0) {
    const item = randomData[0]
    return `我没有找到与你问题直接相关的常识，但这里有一条你可能感兴趣的「${item.category}」常识：\n\n${item.question}\n\n${item.answer}\n\n如果你想问的是其他内容，可以尝试用更具体的关键词描述，比如「${item.tags.slice(0, 3).join('、')}」等。`
  }

  return `Agent 正在学习中，暂时无法回答「${prompt}」。请尝试换种方式提问，或联系管理员补充相关常识数据。`
}

export async function invokeAgent(username, prompt) {
  const output = await generateResponse(prompt)
  return {
    user: username,
    prompt,
    output,
    createdAt: new Date().toISOString()
  }
}

export async function* streamResponse(prompt) {
  const fullText = await generateResponse(prompt)
  const chunkSize = 4
  const delayMs = 12

  for (let i = 0; i < fullText.length; i += chunkSize) {
    const chunk = fullText.slice(i, i + chunkSize)
    yield { chunk }
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  yield { done: true, createdAt: new Date().toISOString() }
}
