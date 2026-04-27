import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MarkdownText from '../MarkdownText'

describe('MarkdownText', () => {
  it('renders plain text', () => {
    const { container } = render(<MarkdownText text="hello world" />)
    expect(container.innerHTML).toContain('hello world')
  })

  it('renders bold text', () => {
    const { container } = render(<MarkdownText text="**bold**" />)
    expect(container.querySelector('strong')).toHaveTextContent('bold')
  })

  it('renders links', () => {
    const { container } = render(<MarkdownText text="[link](https://example.com)" />)
    const a = container.querySelector('a')
    expect(a).toHaveAttribute('href', 'https://example.com')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('sanitizes javascript: URLs', () => {
    const { container } = render(<MarkdownText text="[bad](javascript:alert(1))" />)
    const a = container.querySelector('a')
    expect(a).toHaveAttribute('href', '#')
  })

  it('escapes HTML tags', () => {
    const { container } = render(<MarkdownText text="<script>alert(1)</script>" />)
    expect(container.innerHTML).not.toContain('<script>')
    expect(container.innerHTML).toContain('&lt;script&gt;')
  })
})
