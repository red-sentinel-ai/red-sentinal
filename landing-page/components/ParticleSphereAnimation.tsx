'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// ==========================================================
// The main component that renders the particle system
// ==========================================================
const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null!)
  const [scrollProgress, setScrollProgress] = useState(0)

  const particleCount = 5000
  const sphereRadius = 2.5

  const [planePositions, spherePositions] = useMemo(() => {
    const plane = new Float32Array(particleCount * 3)
    const sphere = new Float32Array(particleCount * 3)

    // --- Create the Wavy Plane Positions ---
    const planeSize = 8
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      plane[i3] = (Math.random() - 0.5) * planeSize // x
      plane[i3 + 1] = (Math.random() - 0.5) * planeSize // y
      plane[i3 + 2] = (Math.sin(plane[i3] * 2) + Math.cos(plane[i3 + 1] * 2)) * 0.3 // z
    }

    // --- Create the Sphere Positions using the Fibonacci Sphere algorithm ---
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i
      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius

      const i3 = i * 3
      sphere[i3] = x * sphereRadius
      sphere[i3 + 1] = y * sphereRadius
      sphere[i3 + 2] = z * sphereRadius
    }

    return [plane, sphere]
  }, [particleCount, sphereRadius])

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentScroll = window.scrollY
      const progress = Math.min(currentScroll / 500, 1.0)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useFrame((state) => {
    const { clock } = state
    const elapsedTime = clock.getElapsedTime()

    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry as THREE.BufferGeometry
      const positions = geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3] = THREE.MathUtils.lerp(
          planePositions[i3],
          spherePositions[i3],
          scrollProgress
        )
        positions[i3 + 1] = THREE.MathUtils.lerp(
          planePositions[i3 + 1],
          spherePositions[i3 + 1],
          scrollProgress
        )
        positions[i3 + 2] = THREE.MathUtils.lerp(
          planePositions[i3 + 2],
          spherePositions[i3 + 2],
          scrollProgress
        )
      }

      geometry.attributes.position.needsUpdate = true

      pointsRef.current.rotation.y = elapsedTime * 0.05
      pointsRef.current.rotation.x = elapsedTime * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* CORRECTED CODE BLOCK */}
        <bufferAttribute
          attach="attributes-position"
          // The 'args' prop passes arguments to the THREE.BufferAttribute constructor
          // new THREE.BufferAttribute(array, itemSize)
          args={[planePositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#FF4500"
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// The main export component remains the same
export const ParticleSphereAnimation = () => {
  return (
    <div style={{ width: '100%', height: '100vh', gridArea: '1 / 1' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: '#0a0a0a' }}
      >
        <ambientLight intensity={0.5} />
        <Particles />
      </Canvas>
    </div>
  )
}
