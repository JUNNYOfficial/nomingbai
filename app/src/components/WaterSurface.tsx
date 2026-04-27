import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const surfaceVertexShader = `
varying vec2 vUv;
varying vec3 vEyeVector;

void main() {
  vUv = uv;
  vEyeVector = normalize(position - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const surfaceFragmentShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vEyeVector;

float wave(in vec2 p) {
  return sin(p.x * 10.0) + sin(p.y * 10.0);
}

float wave2(in vec2 p) {
  return sin(p.x * 15.0) + sin(p.y * 15.0);
}

vec3 getNormal(in vec2 p, in float d) {
  vec3 pos = vec3(p.x, p.y, 0.0);
  vec2 w = (pos + vEyeVector * d).xy;
  return normalize(vec3(
    wave(w) - wave(pos.xy),
    wave2(w) - wave2(pos.xy),
    1.0
  ));
}

void main() {
  float scale = 0.5;
  float intensity = 0.5;
  float speed = 0.005;

  vec3 color1 = vec3(0.0, 0.165, 0.29);
  vec3 color2 = vec3(0.0, 0.40, 0.40);
  float opacity = 1.0;

  vec2 uv = vUv * scale;
  float t = time * 0.15 * speed;

  vec3 normal1 = getNormal(uv, t);
  vec3 normal2 = getNormal(uv * 1.5, t * 1.5);
  vec3 finalNormal = normalize(normal1 + normal2);

  float reflectivity = normal1.x * intensity + normal1.y * intensity;
  float diffuse = dot(finalNormal, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5;

  vec3 color = mix(color1, color2, reflectivity);
  color = mix(color, color1, diffuse);

  gl_FragColor = vec4(color, opacity);
}
`

function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    time: { value: 0.0 },
  }), [])

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={surfaceVertexShader}
        fragmentShader={surfaceFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function WaterSurface() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1], near: 0.1, far: 10 }}
        gl={{ antialias: false, alpha: false }}
        dpr={1}
      >
        <WaterPlane />
      </Canvas>
    </div>
  )
}
