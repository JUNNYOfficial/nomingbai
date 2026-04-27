import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const textVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const textFragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec3 uShadowColor;
uniform float uShadowOpacity;
uniform float uTextureScale;
varying vec2 vUv;

void main() {
  vec2 pixel = vec2(vUv.x, 1.0 - vUv.y) * uResolution;

  vec2 center = uResolution * 0.5;
  vec2 centeredPixel = pixel - center;
  vec2 rotatedPixel = vec2(
    centeredPixel.x - centeredPixel.y * 0.3,
    centeredPixel.y + centeredPixel.x * 0.3
  );
  vec2 projected = rotatedPixel / uTextureScale + center;

  vec2 shadowUv = vec2(projected.x, uResolution.y - projected.y) / uResolution;

  vec4 baseColor = texture2D(uTexture, vUv);
  vec4 shadow = texture2D(uTexture, shadowUv);
  vec4 shadowColor = vec4(uShadowColor, shadow.a * uShadowOpacity);

  gl_FragColor = baseColor + shadowColor * (1.0 - baseColor.a);
}
`

interface TextPlaneProps {
  texture: THREE.Texture
  width: number
  height: number
  index: number
  scrollProgress: number
}

function TextPlane({ texture, width, height, index, scrollProgress }: TextPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uResolution: { value: new THREE.Vector2(width * 2, height * 2) },
    uShadowColor: { value: new THREE.Vector3(0.02, 0.16, 0.28) },
    uShadowOpacity: { value: 0.6 },
    uTextureScale: { value: 1.0 },
  }), [texture, width, height])

  useFrame(() => {
    if (meshRef.current) {
      const direction = index % 2 === 0 ? 1 : -1
      const offset = (scrollProgress * 8 + index * 0.3) * direction
      meshRef.current.position.x = offset * 1.5 - index * 0.5
      meshRef.current.position.y = Math.sin(scrollProgress * Math.PI * 2 + index) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={[index * 3 - 3, 0, 0]}>
      <planeGeometry args={[width * 0.003, height * 0.003]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={textVertexShader}
        fragmentShader={textFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

interface FloatingTextProps {
  scrollProgress: number
}

export default function FloatingText({ scrollProgress }: FloatingTextProps) {
  const [textures, setTextures] = useState<THREE.Texture[]>([])
  const texts = ['学习', '认知', '跨越', '重构', '常识', '定律', '穿透']

  useEffect(() => {
    const loadTextures = async () => {
      const canvasElements = texts.map((text) => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 128
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, 512, 128)
        ctx.fillStyle = '#008080'
        ctx.font = 'bold 80px "JetBrains Mono", monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, 256, 64)
        return canvas
      })

      const texs = canvasElements.map((canvas) => {
        const tex = new THREE.CanvasTexture(canvas)
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        return tex
      })

      setTextures(texs)
    }

    loadTextures()
  }, [])

  if (textures.length === 0) return null

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: '100vh',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 100, position: [0, 0, 5], near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
      >
        {textures.map((tex, i) => (
          <TextPlane
            key={i}
            texture={tex}
            width={512}
            height={128}
            index={i}
            scrollProgress={scrollProgress}
          />
        ))}
      </Canvas>
    </div>
  )
}
