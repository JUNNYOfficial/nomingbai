import WaterSurface from '../components/WaterSurface'

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#012a4a',
      }}
    >
      {/* Water Surface Background */}
      <WaterSurface />

      {/* Navigation */}
      <nav
        className="glass-surface"
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 2rem',
          borderRadius: '100px',
          width: 'calc(100% - 3rem)',
          maxWidth: '1200px',
        }}
      >
        <span
          className="font-heading"
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          未言
        </span>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#gallery"
            className="text-sm transition-colors duration-300"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
          >
            探索
          </a>
          <a
            href="#dissolve"
            className="text-sm transition-colors duration-300"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
          >
            理念
          </a>
          <a
            href="#knowledge-grid"
            className="text-sm transition-colors duration-300"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
          >
            索引
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 5vw',
          pointerEvents: 'none',
        }}
      >
        <div style={{ maxWidth: '800px' }}>
          <h1
            className="font-heading"
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.05em',
              lineHeight: 1.05,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              marginBottom: '1.5rem',
              wordBreak: 'keep-all',
            }}
          >
            Unlock the
            <br />
            Hidden Logic
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.8,
              maxWidth: '520px',
              letterSpacing: '0.02em',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.2)',
            }}
          >
            汇集人类世界中最隐蔽的常识，穿透复杂表象，找到事物的决定性因素
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div
        style={{
          position: 'absolute',
          bottom: '8vh',
          right: '5vw',
          zIndex: 10,
        }}
      >
        <a
          href="/chat"
          className="glass-surface"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2.5rem',
            borderRadius: '100px',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textDecoration: 'none',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 128, 128, 0.4)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(1, 42, 74, 0.35)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          开始探索
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '3vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0.5,
        }}
      >
        <span className="font-mono" style={{ fontSize: '0.7rem', color: '#ffffff', letterSpacing: '0.1em' }}>
          SCROLL
        </span>
        <div
          style={{
            width: '1px',
            height: '30px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
          }}
        />
      </div>
    </section>
  )
}
