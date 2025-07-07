"use client";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

// Simplified shader for performance
const MiniSphereMaterial = shaderMaterial(
  { uTime: 0, uPulse: 0 },
  // Vertex shader - simplified morphing
  `
    varying vec3 vNormal;
    varying vec3 vPos;
    uniform float uTime;
    uniform float uPulse;
    
    void main() {
      vNormal = normal;
      vPos = position;
      
      // Simple petal effect
      float theta = atan(normal.y, normal.x);
      float petal = 0.5 + 0.5 * sin(4.0 * theta + uTime * 1.5);
      float displacement = petal * 0.1 * (0.8 + 0.2 * sin(uTime * 2.0));
      
      vec3 newPos = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment shader - simplified glow
  `
    varying vec3 vNormal;
    varying vec3 vPos;
    uniform float uTime;
    uniform float uPulse;
    
    void main() {
      float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0,0,1)), 2.0);
      float glow = 0.7 + 0.3 * sin(uTime * 3.0);
      float energy = fresnel * glow;
      
      vec3 color = mix(vec3(0.0, 0.9, 1.0), vec3(0.3, 0.6, 1.0), fresnel);
      gl_FragColor = vec4(color, energy * 0.8 + 0.2);
    }
  `,
);
extend({ MiniSphereMaterial });

function AnimatedMiniSphere({ active = true }: { active?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireframeRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current || !wireframeRef.current) return;

    const time = state.clock.getElapsedTime();

    // Update shader uniforms
    (meshRef.current.material as any).uTime = time;
    (meshRef.current.material as any).uPulse = active ? 1 : 0;

    // Gentle rotation
    meshRef.current.rotation.y = time * 0.3;
    wireframeRef.current.rotation.y = time * 0.2;

    // Subtle floating animation
    const float = Math.sin(time * 2) * 0.02;
    meshRef.current.position.y = float;
    wireframeRef.current.position.y = float;
  });

  return (
    <>
      {/* Main morphing sphere */}
      <mesh ref={meshRef} scale={0.8}>
        <sphereGeometry args={[1, 32, 32]} />
        {/* @ts-ignore */}
        <miniSphereMaterial transparent />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireframeRef} scale={0.85}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          wireframe
          color="#00fff7"
          transparent
          opacity={0.4}
        />
      </mesh>
    </>
  );
}

interface MiniSphereProps {
  size?: number;
  active?: boolean;
  className?: string;
}

export default function MiniSphere({
  size = 60,
  active = true,
  className = "",
}: MiniSphereProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Optional: Hide on mobile or small screens
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth > 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        dpr={[1, 1.5]} // Limit DPR for performance
        performance={{ min: 0.5 }} // Aggressive performance scaling
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#00fff7" />
        <AnimatedMiniSphere active={active} />
      </Canvas>
    </div>
  );
}
