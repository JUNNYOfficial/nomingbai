/**
 * Load JSON data files from /data/ directory (served as static assets)
 */

let cache = null

const DATA_FILES = [
  'commonsense_database.json',
  'intent_classification_data.json',
  'work_agent_data.json',
  'social_agent_data.json',
  'master_agent_data.json'
]

export async function loadAllData() {
  if (cache) return cache

  // Edge sometimes hangs on parallel fetch; use sequential with timeout
  const results = []
  for (const file of DATA_FILES) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`./data/${file}`, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) {
        results.push({ file, data: [] })
        continue
      }
      const data = await res.json()
      results.push({ file, data: Array.isArray(data) ? data : [] })
    } catch {
      results.push({ file, data: [] })
    }
  }

  cache = {
    commonsense: results.find((r) => r.file === 'commonsense_database.json')?.data || [],
    intents: results.find((r) => r.file === 'intent_classification_data.json')?.data || [],
    work: results.find((r) => r.file === 'work_agent_data.json')?.data || [],
    social: results.find((r) => r.file === 'social_agent_data.json')?.data || [],
    master: results.find((r) => r.file === 'master_agent_data.json')?.data || []
  }

  return cache
}

export function clearCache() {
  cache = null
}
