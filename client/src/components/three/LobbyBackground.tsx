import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Player } from '@cdp/shared';

interface FloatingShape {
  id: string;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  rotSpeed: [number, number, number];
  floatOffset: number;
  floatSpeed: number;
  scale: number;
  shape: 'ico' | 'torus' | 'box' | 'oct';
}

function Shape({ shape, color, position, rotation, rotSpeed, floatOffset, floatSpeed, scale }: FloatingShape & { id: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta;
    if (!meshRef.current) return;
    meshRef.current.rotation.x += rotSpeed[0] * delta;
    meshRef.current.rotation.y += rotSpeed[1] * delta;
    meshRef.current.rotation.z += rotSpeed[2] * delta;
    meshRef.current.position.y = position[1] + Math.sin(t.current * floatSpeed + floatOffset) * 0.4;
  });

  const geo = useMemo(() => {
    switch (shape) {
      case 'ico': return <icosahedronGeometry args={[1, 0]} />;
      case 'torus': return <torusGeometry args={[0.7, 0.25, 8, 12]} />;
      case 'box': return <boxGeometry args={[1.2, 1.2, 1.2]} />;
      case 'oct': return <octahedronGeometry args={[1, 0]} />;
    }
  }, [shape]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {geo}
      <meshStandardMaterial
        color={color}
        wireframe={false}
        transparent
        opacity={0.75}
        roughness={0.3}
        metalness={0.6}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function Scene({ players }: { players: Player[] }) {
  const shapes = useMemo<FloatingShape[]>(() => {
    const shapeTypes: FloatingShape['shape'][] = ['ico', 'torus', 'box', 'oct'];
    return players.map((p, i) => ({
      id: p.id,
      color: p.color,
      position: [
        Math.cos((i / Math.max(players.length, 1)) * Math.PI * 2) * 5,
        (Math.random() - 0.5) * 3,
        -2 - Math.random() * 4,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      rotSpeed: [
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.3,
      ],
      floatOffset: i * 1.2,
      floatSpeed: 0.4 + Math.random() * 0.4,
      scale: 0.5 + Math.random() * 0.5,
      shape: shapeTypes[i % shapeTypes.length],
    }));
  }, [players]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#a855f7" />
      <pointLight position={[-5, -5, 3]} intensity={1} color="#06b6d4" />
      {shapes.map((s) => (
        <Shape key={s.id} {...s} />
      ))}
    </>
  );
}

export function LobbyBackground({ players }: { players: Player[] }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 55 }}>
        <fog attach="fog" args={['#0a0a0f', 10, 20]} />
        <Scene players={players} />
      </Canvas>
    </div>
  );
}
