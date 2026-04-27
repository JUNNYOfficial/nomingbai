import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'

const mediaVertexShader = `
uniform float time;
uniform vec2 uMouse;
varying vec2 vUv;
varying vec2 vMouse;
varying vec3 vNormal;
varying float displacement;

void main() {
  vNormal = normal;
  vUv = uv;

  vec2 worldMouse = (modelMatrix * vec4(uMouse, 0.0, 1.0)).xy;
  vec2 vertexWorld = (modelMatrix * vec4(position, 1.0)).xy;
  vMouse = worldMouse - vertexWorld;

  displacement = 0.3 * (1.0 - smoothstep(0.0, 0.6, length(uMouse - uv)));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const mediaFragmentShader = `
uniform sampler2D uTexture;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float time;
uniform float uHoverState;
uniform float uVelocity;
varying vec2 vUv;
varying vec2 vMouse;
varying vec3 vNormal;
varying float displacement;

#define PI 3.14159265359
#define TAU 6.28318530718
#define RIPPLE_SPEED 2.0
#define RIPPLE_DENSITY 4.0
#define BEND 0.15

void main() {
  vec2 newUv = vUv;

  vec2 mouseDistance = uMouse - vUv;
  float len = length(mouseDistance);

  float influence = smoothstep(0.5, 0.0, len);

  vec2 mouseDir = normalize(uMouse - 0.5);
  vec2 gravity = -mouseDir * influence * 0.3 * (1.0 + uHoverState);

  float phase = time * RIPPLE_SPEED + length(vMouse) * RIPPLE_DENSITY;
  float wave = sin(phase * TAU) * 0.5 + 0.5;
  newUv += wave * 0.15;

  float angle = atan(mouseDistance.y, mouseDistance.x);
  float radial = cos(angle * 3.0 + time) * influence * BEND;
  newUv += vec2(cos(angle), sin(angle)) * radial;

  newUv.y += sin(newUv.x * 8.0 + time) * 0.03 * uVelocity;

  vec4 color = texture2D(uTexture, newUv);

  float highlight = smoothstep(0.4, 0.6, sin(vUv.x * 20.0 + time) * cos(vUv.y * 20.0 + time) * 0.5 + 0.5);
  color.rgb += highlight * influence * 0.15;

  color.r += displacement * 0.4 * (sin(uVelocity * 0.5) * 0.5);
  color.gb -= displacement * 0.4 * (cos(uVelocity * 0.5) * 0.5);

  color.rgb += (influence * 0.2) * (1.0 - uHoverState);

  gl_FragColor = vec4(color.rgb, uOpacity);
}
`

interface MediaPlaneProps {
  texture: THREE.Texture
  position: [number, number, number]
  scale: [number, number, number]
  velocity: number
  mouseWorld: THREE.Vector2
  hoverState: number
}

function MediaPlane({ texture, position, scale, velocity, mouseWorld, hoverState }: MediaPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uOpacity: { value: 1.0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    time: { value: 0.0 },
    uHoverState: { value: 0.0 },
    uVelocity: { value: 0.0 },
  }), [texture])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(mouseWorld.x + 0.5, mouseWorld.y + 0.5),
        0.08
      )
      materialRef.current.uniforms.uVelocity.value += (velocity - materialRef.current.uniforms.uVelocity.value) * 0.1
      materialRef.current.uniforms.uHoverState.value += (hoverState - materialRef.current.uniforms.uHoverState.value) * 0.05
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={mediaVertexShader}
        fragmentShader={mediaFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

interface SceneContentProps {
  images: { src: string; position: [number, number, number]; scale: [number, number, number] }[]
  velocity: number
  mouseWorld: THREE.Vector2
  hoverState: number
}

function SceneContent({ images, velocity, mouseWorld, hoverState }: SceneContentProps) {
  const [textures, setTextures] = useState<THREE.Texture[]>([])
  const { viewport } = useThree()

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const loaded: THREE.Texture[] = []
    let count = 0

    images.forEach((img, i) => {
      loader.load(img.src, (tex) => {
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        loaded[i] = tex
        count++
        if (count === images.length) {
          setTextures([...loaded])
        }
      })
    })
  }, [images])

  if (textures.length < images.length) return null

  return (
    <>
      {images.map((img, i) => (
        <MediaPlane
          key={i}
          texture={textures[i]}
          position={[
            img.position[0] * viewport.width,
            img.position[1] * viewport.height,
            img.position[2]
          ]}
          scale={[
            img.scale[0] * viewport.width * 0.3,
            img.scale[1] * viewport.height * 0.4,
            1
          ]}
          velocity={velocity}
          mouseWorld={mouseWorld}
          hoverState={hoverState}
        />
      ))}
    </>
  )
}

interface WarpedMediaSpaceProps {
  velocity: number
}

export default function WarpedMediaSpace({ velocity }: WarpedMediaSpaceProps) {
  const mouseWorldRef = useRef(new THREE.Vector2(0, 0))
  const hoverStateRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const images = useMemo(() => [
    { src: '/images/fluid-art.jpg', position: [-0.6, 0.3, 0] as [number, number, number], scale: [1.2, 0.9, 1] as [number, number, number] },
    { src: '/images/tools-macro.jpg', position: [0.5, -0.2, 0] as [number, number, number], scale: [0.8, 1.1, 1] as [number, number, number] },
    { src: '/images/architecture.jpg', position: [-0.3, -0.5, 0] as [number, number, number], scale: [1.0, 0.7, 1] as [number, number, number] },
    { src: '/images/studio.jpg', position: [0.4, 0.4, 0] as [number, number, number], scale: [0.7, 1.0, 1] as [number, number, number] },
  ], [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      mouseWorldRef.current.set(x, y)
      hoverStateRef.current = 1.0
    }

    const handleMouseLeave = () => {
      hoverStateRef.current = 0
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1,
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 100, position: [0, 0, 5], near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
        <SceneContent
          images={images}
          velocity={velocity}
          mouseWorld={mouseWorldRef.current}
          hoverState={hoverStateRef.current}
        />
      </Canvas>
    </div>
  )
}
