"use client";
import { useFrame, extend } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

// Layer 1: Outer glowing sphere
function OuterSphere({ scroll }: { scroll: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= 0.002 - scroll * 0.01;
      // Pulse intensity based on scroll
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.4 + scroll * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.2, 64, 64]} />
      <meshStandardMaterial
        color="#00fff7"
        metalness={0.8}
        roughness={0.2}
        emissive="#00fff7"
        emissiveIntensity={0.4}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Layer 2: Inner wireframe with enhanced lines
function InnerWireframe({ scroll }: { scroll: number }) {
  const edgesRef = useRef<THREE.LineSegments>(null!);
  const geometry = new THREE.EdgesGeometry(new THREE.SphereGeometry(2, 64, 64));
  const material = new THREE.LineBasicMaterial({
    color: "#00fff7",
    linewidth: 2,
    toneMapped: false,
  });

  // Animate glow and position
  useFrame((state) => {
    if (edgesRef.current) {
      edgesRef.current.rotation.y += 0.005 + scroll * 0.04;
      edgesRef.current.position.x = Math.sin(scroll * Math.PI * 2) * 0.3;
      edgesRef.current.position.y = Math.cos(scroll * Math.PI * 2) * 0.2;

      // Animate color intensity
      const intensity = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2);
      edgesRef.current.material.color.setHSL(0.5, 1, intensity);
    }
  });

  return (
    <group>
      <lineSegments ref={edgesRef} geometry={geometry} material={material} />
    </group>
  );
}

// Layer 3: Custom shader for glowing edges
const GlowEdgeMaterial = shaderMaterial(
  { uGlow: 1.0, uTime: 0 },
  `
  varying vec3 vNormal;
  uniform float uTime;
  void main() {
    vNormal = normal;
    vec3 pos = position + normal * sin(uTime * 2.0 + position.y * 5.0) * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
  `,
  `
  uniform float uGlow;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(1.0 - dot(normalize(vNormal), vec3(0,0,1)), 2.0);
    vec3 color = mix(vec3(0.0,0.9,1.0), vec3(0.1,1.0,1.0), intensity);
    gl_FragColor = vec4(color * uGlow * intensity, intensity * 0.8);
  }
  `,
);

extend({ GlowEdgeMaterial });

function GlowingEdges({
  scroll,
  mouse,
}: {
  scroll: number;
  mouse: [number, number];
}) {
  const ref = useRef<THREE.Mesh>(null!);

  // Animate glow and displacement
  useFrame((state) => {
    if (ref.current) {
      const material = ref.current.material as any;
      material.uGlow =
        0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 3) + scroll * 0.5;
      material.uTime = state.clock.elapsedTime;

      // Mouse interaction
      const mouseDist = Math.sqrt(mouse[0] * mouse[0] + mouse[1] * mouse[1]);
      material.uGlow += (1.0 - mouseDist) * 0.3;
    }
  });

  return (
    <mesh ref={ref} scale={1.1}>
      <sphereGeometry args={[2, 128, 128]} />
      {/* @ts-ignore */}
      <glowEdgeMaterial transparent />
    </mesh>
  );
}

// Layer 4: Dense internal grid lines
function DenseWireframe({ scroll }: { scroll: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.z = scroll * Math.PI * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Multiple wireframe layers for density */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          wireframe
          color="#00fff7"
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.6, 24, 24]} />
        <meshBasicMaterial
          wireframe
          color="#00d4d4"
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshBasicMaterial
          wireframe
          color="#008b8b"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Main enhanced sphere component
export default function EnhancedSphere({
  scroll,
  mouse,
}: {
  scroll: number;
  mouse: [number, number];
}) {
  return (
    <group>
      {/* Outer glow sphere */}
      <OuterSphere scroll={scroll} />

      {/* Dense internal wireframes */}
      <DenseWireframe scroll={scroll} />

      {/* Crisp edge lines */}
      <InnerWireframe scroll={scroll} />

      {/* Glowing shader edges */}
      <GlowingEdges scroll={scroll} mouse={mouse} />
    </group>
  );
}
