import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const dissolveVertexShader = `
varying vec2 v_uv;
void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const dissolveFragmentShader = `
uniform sampler2D u_texture;
uniform vec2 u_elementSize;
uniform float u_dissolve;
uniform float u_time;
uniform float u_seed;
varying vec2 v_uv;

#define E 0.0001
#define PIXELS_PER_BLOCK 4.0

vec4 hash43(vec3 p) {
  vec4 p4 = fract(vec4(p.xyzx) * vec4(.1031, .1030, .0973, .1099));
  p4 += dot(p4, p4.wzxy + 33.33);
  return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

vec4 gridify(vec2 uv, vec2 dimensions) {
  vec2 pixelId = floor(uv * dimensions);
  vec2 id = floor(pixelId / PIXELS_PER_BLOCK);
  vec2 position = uv * dimensions / PIXELS_PER_BLOCK - id;
  return vec4(id, position);
}

void main() {
  vec4 pixel = gridify(v_uv, u_elementSize);

  vec4 color = texture2D(u_texture, v_uv);

  vec4 random = hash43(vec3(pixel.xy, u_seed));

  float remaining = (random.x - u_dissolve) / E;
  remaining = clamp(remaining, 0.0, 1.0);

  vec2 finalUv = (pixel.xy + 0.5) * PIXELS_PER_BLOCK / u_elementSize;
  color = texture2D(u_texture, finalUv);

  color.a = remaining;

  gl_FragColor = color;
}
`

interface DissolvePlaneProps {
  texture: THREE.Texture
  dissolve: number
  width: number
  height: number
}

function DissolvePlane({ texture, dissolve, width, height }: DissolvePlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    u_texture: { value: texture },
    u_elementSize: { value: new THREE.Vector2(width, height) },
    u_dissolve: { value: 0.0 },
    u_time: { value: 0.0 },
    u_seed: { value: 42.0 },
  }), [texture, width, height])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_dissolve.value += (dissolve - materialRef.current.uniforms.u_dissolve.value) * 0.05
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh scale={[width / 100, height / 100, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={dissolveVertexShader}
        fragmentShader={dissolveFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

interface PixelDissolveProps {
  dissolveProgress: number
}

export default function PixelDissolve({ dissolveProgress }: PixelDissolveProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = '/images/hero-portrait.jpg'
    img.onload = () => {
      if (imgRef.current) {
        imgRef.current.src = img.src
      }

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const tex = new THREE.CanvasTexture(canvas)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      setTexture(tex)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        aspectRatio: '3/4',
      }}
    >
      <img
        ref={imgRef}
        src="/images/hero-portrait.jpg"
        alt="Portrait"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: texture ? 0 : 1,
          transition: 'opacity 0.3s',
        }}
      />
      {texture && (
        <Canvas
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          orthographic
          camera={{ zoom: 100, position: [0, 0, 5], near: 0.1, far: 100 }}
          gl={{ antialias: false, alpha: true }}
          dpr={Math.min(window.devicePixelRatio, 2)}
        >
          <DissolvePlane
            texture={texture}
            dissolve={dissolveProgress}
            width={600}
            height={800}
          />
        </Canvas>
      )}
    </div>
  )
}
