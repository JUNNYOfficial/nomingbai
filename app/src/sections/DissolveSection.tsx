import { useRef, useEffect, useState } from 'react'
import PixelDissolve from '../components/PixelDissolve'

export default function DissolveSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [dissolveProgress, setDissolveProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionHeight = sectionRef.current.offsetHeight

      // Calculate progress: 0 when section enters viewport, 1 when it leaves
      const progress = Math.max(0, Math.min(1, (-rect.top + windowHeight * 0.3) / (sectionHeight - windowHeight * 0.5)))
      setDissolveProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate background transition from deep blue to pure white
  const bgProgress = Math.min(1, dissolveProgress * 1.5)
  const r = Math.round(1 + (247 - 1) * bgProgress)
  const g = Math.round(42 + (255 - 42) * bgProgress)
  const b = Math.round(74 + (247 - 74) * bgProgress)
  const bgColor = `rgb(${r}, ${g}, ${b})`

  return (
    <section
      id="dissolve"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: bgColor,
        minHeight: '250vh',
        transition: 'background 0.1s linear',
      }}
    >
      {/* Sticky container for the dissolve image */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div className="w-full max-w-2xl">
          {/* Section header */}
          <div className="text-center mb-12">
            <span
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                color: dissolveProgress > 0.3 ? '#008080' : 'rgba(0, 128, 128, 0.7)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'color 0.5s',
              }}
            >
              The Dissolution of Tacit
            </span>
            <h2
              className="font-heading mt-4"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 700,
                color: dissolveProgress > 0.3 ? '#012a4a' : '#ffffff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                wordBreak: 'keep-all',
                transition: 'color 0.5s',
              }}
            >
              隐性逻辑的消解
            </h2>
            <p
              className="mt-4 mx-auto"
              style={{
                fontSize: '1rem',
                color: dissolveProgress > 0.3 ? 'rgba(1, 42, 74, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                maxWidth: '480px',
                lineHeight: 1.7,
                transition: 'color 0.5s',
              }}
            >
              当知识从模糊变得清晰，那些曾经的"说不清道不明"终将化为可传授的智慧
            </p>
          </div>

          {/* Pixel Dissolve Image */}
          <PixelDissolve dissolveProgress={dissolveProgress} />
        </div>
      </div>

      {/* Scroll spacer */}
      <div style={{ height: '150vh' }} />
    </section>
  )
}
