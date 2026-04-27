import { useRef, useEffect, useState } from 'react'
import WarpedMediaSpace from '../components/WarpedMediaSpace'
import FloatingText from '../components/FloatingText'

interface GallerySectionProps {
  scrollVelocity: number
}

export default function GallerySection({ scrollVelocity }: GallerySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionHeight = sectionRef.current.offsetHeight

      const progress = Math.max(0, Math.min(1, (-rect.top + windowHeight * 0.5) / (sectionHeight + windowHeight * 0.5)))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id="gallery"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: '#012a4a',
        minHeight: '500vh',
      }}
    >
      {/* Section label */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '4rem',
            left: '5vw',
            zIndex: 10,
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              color: '#008080',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Tacit Knowledge Gallery
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '4rem',
            left: '5vw',
            right: '5vw',
            zIndex: 10,
          }}
        >
          <h2
            className="font-heading"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              maxWidth: '600px',
              wordBreak: 'keep-all',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            时空褶皱
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: '480px',
              marginTop: '1rem',
              lineHeight: 1.7,
            }}
          >
            每一张图像背后都隐藏着一套从未被言说的操作系统——那些支配结果的底层规则
          </p>
        </div>
      </div>

      {/* Warped Media Space */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 2,
        }}
      >
        <WarpedMediaSpace velocity={scrollVelocity} />
      </div>

      {/* Floating Text */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 3,
          marginTop: '-100vh',
        }}
      >
        <FloatingText scrollProgress={scrollProgress} />
      </div>
    </section>
  )
}
