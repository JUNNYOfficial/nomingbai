import { useRef, useEffect, useState, useCallback } from 'react'

/* ── SVG Noise Ripples ── */
function NoiseBackground() {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (turbulenceRef.current) {
        const currentSeed = parseInt(turbulenceRef.current.getAttribute('seed') || '0')
        turbulenceRef.current.setAttribute('seed', String(currentSeed + 1))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.15,
        zIndex: 0,
        background: '#f7fff7',
        filter: "url('#noise')",
        pointerEvents: 'none',
      }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="noise">
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.01 0.02"
            numOctaves="1"
            result="noise"
            seed="0"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </div>
  )
}

/* ── Kinetic Typography Marquee ── */
const symbols = ['1', '0', '+', '_', '/', '-', '>', '<', '~', '*', '&', '^', '%', '$', '#', '@', '!']

function scrambleText(text: string, progress: number): string {
  return text
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' '
      const threshold = (i / text.length) * 0.8 + 0.1
      if (progress < threshold) {
        return symbols[Math.floor(Math.random() * symbols.length)]
      }
      return char
    })
    .join('')
}

function MarqueeLine({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const [displayTexts, setDisplayTexts] = useState<string[]>([text, text, text, text])
  const frameRef = useRef(0)
  const progressRef = useRef(0)

  useEffect(() => {
    let raf: number

    const animate = () => {
      progressRef.current += 0.015
      if (progressRef.current > 1.2) progressRef.current = 0

      frameRef.current += 1
      if (frameRef.current % 3 === 0) {
        setDisplayTexts((prev) =>
          prev.map(() => scrambleText(text, progressRef.current))
        )
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [text])

  return (
    <div className="marquee">
      <div className={`marquee__inner${reverse ? ' second' : ''}`}>
        {displayTexts.map((t, i) => (
          <span
            key={i}
            className="font-mono whitespace-nowrap px-8"
            style={{
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              fontWeight: 700,
              color: '#012a4a',
              letterSpacing: '-0.02em',
            }}
          >
            {t}&nbsp;&nbsp;&nbsp;
          </span>
        ))}
      </div>
      <div className={`marquee__inner${reverse ? ' second' : ''}`}>
        {displayTexts.map((t, i) => (
          <span
            key={i}
            className="font-mono whitespace-nowrap px-8"
            style={{
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              fontWeight: 700,
              color: '#012a4a',
              letterSpacing: '-0.02em',
            }}
          >
            {t}&nbsp;&nbsp;&nbsp;
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── FAQ Item with scramble hover ── */
interface FAQItemProps {
  question: string
  answer: string
  index: number
}

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [displayText, setDisplayText] = useState(question)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startScramble = useCallback(() => {
    let step = 0
    const totalSteps = 12

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      step++
      const progress = step / totalSteps

      const scrambled = question
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          const charThreshold = (i / question.length) * 0.7 + 0.15
          if (progress < charThreshold) {
            return symbols[Math.floor(Math.random() * symbols.length)]
          }
          return char
        })
        .join('')

      setDisplayText(scrambled)

      if (step >= totalSteps) {
        setDisplayText(question)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 40)
  }, [question])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div
      className="py-6 border-b cursor-pointer"
      style={{ borderColor: 'rgba(1, 42, 74, 0.1)' }}
      onMouseEnter={() => {
        setIsHovered(true)
        startScramble()
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        setDisplayText(question)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="font-mono text-sm mt-1 shrink-0"
          style={{ color: '#008080' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <h3
            className="font-heading text-lg leading-snug"
            style={{
              color: '#012a4a',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {displayText}
          </h3>
          <div
            className="overflow-hidden transition-all duration-500"
            style={{
              maxHeight: isHovered ? '200px' : '0px',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: 'rgba(1, 42, 74, 0.6)' }}
            >
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main KnowledgeGrid ── */
const faqData = [
  {
    question: '为什么面试时"眼神接触"比答案本身更重要？',
    answer: '隐性社交规则中，非语言信号占据了信息传递的 60% 以上。眼神接触传递的自信与真诚，往往比精心准备的回答更能决定结果。',
  },
  {
    question: '代码评审中，资深工程师到底在审查什么？',
    answer: '他们关注的不是你的语法，而是你在面对约束时的决策模式——是否考虑了边界情况、是否留下了技术债务、命名是否传达了真实意图。',
  },
  {
    question: '学术论文的"创新性"究竟如何被定义？',
    answer: '创新不在于你发现了什么全新事物，而在于你是否以新的方式连接了已有的知识节点，填补了逻辑链条中的空白。',
  },
  {
    question: '设计评审中，"高级感"从何而来？',
    answer: '高级感不是装饰的堆砌，而是信息层级的清晰度、负空间的精确控制，以及视觉元素之间比例关系的内在和谐。',
  },
  {
    question: '为什么同样的努力，不同人的产出差异巨大？',
    answer: '关键在于是否掌握了"元技能"——学习如何学习、思考如何思考。这些底层操作系统决定了所有应用层技能的上限。',
  },
  {
    question: '谈判桌上，真正决定胜负的因素是什么？',
    answer: '不是口才或技巧，而是对对方 BATNA（最佳替代方案）的准确判断，以及在信息不对等中建立信任的能力。',
  },
  {
    question: '写作中，如何让读者"感到"而非"知道"？',
    answer: '避免抽象形容词，用具体的感官细节替代。不说"他很紧张"，而说"他的手指在桌沿敲出了第七个节拍"。',
  },
  {
    question: '产品决策中，数据与直觉如何平衡？',
    answer: '数据告诉你发生了什么，直觉告诉你为什么发生。前者用于验证假设，后者用于生成假设——二者缺一不可。',
  },
  {
    question: '音乐创作中，"好听"的底层逻辑是什么？',
    answer: '好听的本质是预期管理——在听众大脑建立模式期待的同时，以微妙的方式打破它，制造认知的愉悦释放。',
  },
  {
    question: '科学研究中，如何识别真正重要的问题？',
    answer: '重要的问题通常具备三个特征：反直觉、跨学科、且解决后会让许多其他问题变得简单或直接消失。',
  },
]

export default function KnowledgeGrid() {
  return (
    <section
      id="knowledge-grid"
      className="relative"
      style={{
        background: '#f7fff7',
        paddingTop: '150px',
        paddingBottom: '200px',
      }}
    >
      <NoiseBackground />

      <div className="relative z-10" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Marquee Header */}
        <div className="mb-20 overflow-hidden">
          <MarqueeLine text="EVERYTHING YOU KNOW IS JUST THE TIP OF THE ICEBERG" />
          <MarqueeLine text="TACIT KNOWLEDGE HIDDEN RULES UNWRITTEN LOGIC" reverse />
        </div>

        {/* Section intro */}
        <div className="mb-16">
          <h2
            className="font-heading mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: '#012a4a',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            常识之外
          </h2>
          <p
            className="text-lg"
            style={{
              color: 'rgba(1, 42, 74, 0.55)',
              maxWidth: '600px',
              lineHeight: 1.7,
            }}
          >
            这些规则从未被写入任何教科书，却决定了你能否在各自的领域中真正脱颖而出
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          <div>
            {faqData.slice(0, 5).map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} index={i} />
            ))}
          </div>
          <div>
            {faqData.slice(5).map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} index={i + 5} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
