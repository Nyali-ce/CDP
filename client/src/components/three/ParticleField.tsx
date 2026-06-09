import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const count = 600;
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const velocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.01;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);

  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3] + Math.sin(t.current * 0.3 + i * 0.1) * 0.002;
      pos[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(t.current * 0.2 + i * 0.07) * 0.002;
      // Wrap around
      if (pos[i * 3] > 10) pos[i * 3] = -10;
      if (pos[i * 3] < -10) pos[i * 3] = 10;
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
      if (pos[i * 3 + 1] < -10) pos[i * 3 + 1] = 10;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.z += delta * 0.03;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#a855f7"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

export function ParticleField() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Particles />
        <fog attach="fog" args={['#0a0a0f', 8, 20]} />
      </Canvas>
    </div>
  );
}
