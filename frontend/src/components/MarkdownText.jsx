import React from 'react'

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:']

function isSafeUrl(url) {
  try {
    const parsed = new URL(url, 'http://localhost')
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol)
  } catch {
    return false
  }
}

function renderMarkdown(text) {
  let html = escapeHtml(text)

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic: *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links: [text](url) — sanitize href
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, (_match, label, url) => {
    const safeUrl = isSafeUrl(url) ? escapeHtml(url) : '#'
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 hover:text-blue-800">${label}</a>`
  })

  // Auto-link URLs — only http/https
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 hover:text-blue-800">$1</a>')

  // Line breaks
  html = html.replace(/\n/g, '<br/>')

  return html
}

export default function MarkdownText({ text, className = '' }) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
    />
  )
}
