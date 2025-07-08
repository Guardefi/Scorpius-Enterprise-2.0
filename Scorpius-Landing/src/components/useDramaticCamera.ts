import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 🔥 Much wider orbit, bigger zoom swings, adds top-down and low-angle passes
const KEYFRAMES = [
  { s: 0.0, pos: [0, 0.8, 10], fov: 45 }, // hero – gentle intro
  { s: 0.18, pos: [5, 1.8, 6], fov: 60 }, // right-orbit close-up
  { s: 0.4, pos: [0, 4.5, 3], fov: 65 }, // top-down "command" view
  { s: 0.6, pos: [-6, 1.0, 5], fov: 58 }, // swing round left
  { s: 0.8, pos: [0, -1.5, 8], fov: 50 }, // low heroic Dutch angle
  { s: 1.0, pos: [0, 0.8, 10], fov: 45 }, // settle back
] as const;

export function useDramaticCamera(scroll: number, ease = 0.12) {
  const { camera } = useThree();

  useFrame(() => {
    // 1. Find two surrounding keyframes
    const kf = KEYFRAMES;
    const seg = scroll * (kf.length - 1);
    const i = Math.floor(seg);
    const t = seg - i;

    const a = kf[i];
    const b = kf[Math.min(i + 1, kf.length - 1)];

    // 2. Interpolate linearly
    const lerp = (p: number, q: number) => p + (q - p) * t;
    const targetPos = new THREE.Vector3(
      lerp(a.pos[0], b.pos[0]),
      lerp(a.pos[1], b.pos[1]),
      lerp(a.pos[2], b.pos[2]),
    );
    const targetFov = lerp(a.fov, b.fov);

    // 3. Apply **eased** smoothing (damping)
    camera.position.lerp(targetPos, ease); // ease = 0.1-0.15 ≈ 2-3 frames lag
    camera.fov += (targetFov - camera.fov) * ease;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  });
}
