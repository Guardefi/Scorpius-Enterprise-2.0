import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Define dramatic keyframes for position, fov, rotation, and X offset for text readability
const KEYFRAMES = [
  { s: 0.0, pos: [0, 0, 25], fov: 25, rot: [0, 0, 0], xOff: 0 }, // Intro - Far back
  { s: 0.1, pos: [0, 2, 12], fov: 40, rot: [-0.1, 0, 0], xOff: 0 }, // ScorpiusCore - Dramatic zoom in
  { s: 0.2, pos: [8, 4, 8], fov: 60, rot: [-0.2, 0.5, 0], xOff: 3 }, // Quantum Detection
  { s: 0.3, pos: [0, 10, 6], fov: 75, rot: [-0.7, 0, 0], xOff: 0 }, // Adaptive Defense
  { s: 0.4, pos: [-8, 4, 8], fov: 60, rot: [-0.2, -0.5, 0], xOff: -3 }, // Enterprise Command
  { s: 0.5, pos: [6, -2, 9], fov: 55, rot: [0.2, 0.3, 0], xOff: 2 }, // Firepower Modules
  { s: 0.6, pos: [-6, 6, 7], fov: 65, rot: [-0.3, -0.4, 0], xOff: -2 }, // Enterprise Arsenal
  { s: 0.7, pos: [0, 0, 11], fov: 45, rot: [0, 0, 0], xOff: 0 }, // Pricing
  { s: 0.8, pos: [4, 8, 5], fov: 70, rot: [-0.5, 0.2, 0], xOff: 3 }, // Social Proof
  { s: 0.9, pos: [0, -3, 13], fov: 35, rot: [0.3, 0, 0], xOff: 0 }, // Final CTA
  { s: 1.0, pos: [0, 0, 25], fov: 25, rot: [0, 0, 0], xOff: 0 }, // Return to far
] as const;

export function useCinematicCamera(scroll: number, ease = 0.1) {
  const { camera, scene } = useThree();
  // Apply a subtle tilt to the entire scene
  scene.rotation.x = -0.05;

  useFrame(() => {
    // Find surrounding keyframes
    const tRaw = scroll * (KEYFRAMES.length - 1);
    const i = Math.floor(tRaw);
    const t = tRaw - i;
    const start = KEYFRAMES[i];
    const end = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];

    // Linear interpolate helper
    const lerp = (a: number, b: number) => a + (b - a) * t;

    // Compute targets with X offset for text readability
    const basePos = [
      lerp(start.pos[0], end.pos[0]),
      lerp(start.pos[1], end.pos[1]),
      lerp(start.pos[2], end.pos[2]),
    ];
    const xOff = lerp(start.xOff, end.xOff);
    const targetPos = new THREE.Vector3(
      basePos[0] + xOff,
      basePos[1],
      basePos[2],
    );

    const targetFov = lerp(start.fov, end.fov);
    const targetRot = new THREE.Euler(
      lerp(start.rot[0], end.rot[0]),
      lerp(start.rot[1], end.rot[1]),
      lerp(start.rot[2], end.rot[2]),
      "XYZ",
    );

    // Smoothly apply
    camera.position.lerp(targetPos, ease);
    camera.fov += (targetFov - camera.fov) * ease;
    camera.rotation.set(
      THREE.MathUtils.lerp(camera.rotation.x, targetRot.x, ease),
      THREE.MathUtils.lerp(camera.rotation.y, targetRot.y, ease),
      THREE.MathUtils.lerp(camera.rotation.z, targetRot.z, ease),
    );
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  });
}
