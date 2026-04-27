import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import HeroSection from '../sections/HeroSection'
import GallerySection from '../sections/GallerySection'
import DissolveSection from '../sections/DissolveSection'
import KnowledgeGrid from '../components/KnowledgeGrid'

export default function Home() {
  const [scrollVelocity, setScrollVelocity] = useState(0)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    lenis.on('scroll', (e: { velocity: number }) => {
      setScrollVelocity(e.velocity)
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Handle anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]')
      if (anchor) {
        e.preventDefault()
        const href = anchor.getAttribute('href')
        if (href) {
          lenis.scrollTo(href)
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      lenis.destroy()
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return (
    <main style={{ position: 'relative' }}>
      <HeroSection />
      <GallerySection scrollVelocity={scrollVelocity} />
      <DissolveSection />
      <KnowledgeGrid />

      {/* Footer */}
      <footer
        style={{
          background: '#f7fff7',
          padding: '80px 5vw 40px',
          borderTop: '1px solid rgba(1, 42, 74, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '3rem',
          }}
        >
          <div>
            <h3
              className="font-heading"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#012a4a',
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              未言
            </h3>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'rgba(1, 42, 74, 0.5)',
                maxWidth: '300px',
                lineHeight: 1.6,
              }}
            >
              汇集隐性常识，穿透复杂表象
            </p>
          </div>

          <div className="flex gap-12 flex-wrap">
            <div>
              <h4
                className="font-mono mb-4"
                style={{
                  fontSize: '0.7rem',
                  color: '#008080',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Navigate
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#gallery"
                    className="text-sm transition-colors duration-300"
                    style={{ color: 'rgba(1, 42, 74, 0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#012a4a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(1, 42, 74, 0.5)')}
                  >
                    探索
                  </a>
                </li>
                <li>
                  <a
                    href="#dissolve"
                    className="text-sm transition-colors duration-300"
                    style={{ color: 'rgba(1, 42, 74, 0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#012a4a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(1, 42, 74, 0.5)')}
                  >
                    理念
                  </a>
                </li>
                <li>
                  <a
                    href="#knowledge-grid"
                    className="text-sm transition-colors duration-300"
                    style={{ color: 'rgba(1, 42, 74, 0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#012a4a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(1, 42, 74, 0.5)')}
                  >
                    索引
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className="font-mono mb-4"
                style={{
                  fontSize: '0.7rem',
                  color: '#008080',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Philosophy
              </h4>
              <p
                className="text-sm"
                style={{
                  color: 'rgba(1, 42, 74, 0.5)',
                  maxWidth: '240px',
                  lineHeight: 1.6,
                }}
              >
                真正重要的知识往往无法被语言直接传达，只能通过实践、观察与领悟获得
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1400px',
            margin: '60px auto 0',
            paddingTop: '24px',
            borderTop: '1px solid rgba(1, 42, 74, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.7rem',
              color: 'rgba(1, 42, 74, 0.35)',
              letterSpacing: '0.05em',
            }}
          >
            &copy; 2025 未言. All tacit knowledge reserved.
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: '0.7rem',
              color: 'rgba(1, 42, 74, 0.35)',
              letterSpacing: '0.05em',
            }}
          >
            Designed with depth
          </span>
        </div>
      </footer>
    </main>
  )
}
