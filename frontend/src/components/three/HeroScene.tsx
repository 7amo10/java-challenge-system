"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingShape({
  position,
  geometry,
  color,
  speed,
  distort,
}: {
  position: [number, number, number];
  geometry: "octahedron" | "torus" | "icosahedron" | "torusKnot" | "dodecahedron";
  color: string;
  speed: number;
  distort: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
    mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
  });

  const geometryNode = useMemo(() => {
    switch (geometry) {
      case "octahedron": return <octahedronGeometry args={[1, 0]} />;
      case "torus": return <torusGeometry args={[0.8, 0.3, 16, 32]} />;
      case "icosahedron": return <icosahedronGeometry args={[1, 0]} />;
      case "torusKnot": return <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />;
    }
  }, [geometry]);

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={mesh} position={position} scale={0.6}>
        {geometryNode}
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.15}
          wireframe
          distort={distort}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function GridPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[40, 40, 40, 40]} />
      <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.04} />
    </mesh>
  );
}

function ParticleField() {
  const count = 120;
  const points = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#7c3aed" size={0.03} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function GlowOrb({ position, color }: { position: [number, number, number]; color: string }) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <MeshWobbleMaterial color={color} transparent opacity={0.1} factor={0.4} speed={2} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />

        <FloatingShape position={[-4, 1.5, -2]} geometry="octahedron" color="#7c3aed" speed={1.2} distort={0.3} />
        <FloatingShape position={[4.5, -1, -3]} geometry="torus" color="#a855f7" speed={0.8} distort={0.2} />
        <FloatingShape position={[-2, -2, -1]} geometry="icosahedron" color="#f59e0b" speed={1.0} distort={0.4} />
        <FloatingShape position={[3, 2, -4]} geometry="torusKnot" color="#7c3aed" speed={0.6} distort={0.2} />
        <FloatingShape position={[0, -1.5, -5]} geometry="dodecahedron" color="#a855f7" speed={0.9} distort={0.3} />

        <GlowOrb position={[-5, 0, -3]} color="#7c3aed" />
        <GlowOrb position={[5, 2, -4]} color="#f59e0b" />

        <ParticleField />
        <GridPlane />
      </Canvas>
    </div>
  );
}
