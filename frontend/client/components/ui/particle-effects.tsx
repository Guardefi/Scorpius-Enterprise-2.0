import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ParticleFieldProps {
  particleCount?: number;
  colors?: string[];
  className?: string;
}

export const ParticleField = ({
  particleCount = 50,
  colors = ["#00ffff", "#00ff88", "#88ff00"],
  className,
}: ParticleFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: any[] = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Initialize particles
    const initParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.8 + 0.2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.restore();

        // Connect nearby particles
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 80) * 0.2;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [particleCount, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
    />
  );
};

interface FloatingOrbsProps {
  orbCount?: number;
  className?: string;
}

export const FloatingOrbs = ({
  orbCount = 5,
  className,
}: FloatingOrbsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const orbs: any[] = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Initialize orbs
    const initOrbs = () => {
      for (let i = 0; i < orbCount; i++) {
        orbs.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 30 + 20,
          hue: Math.random() * 60 + 180, // Blue to cyan range
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.pulse += 0.02;

        // Bounce off edges
        if (orb.x < orb.size || orb.x > canvas.width - orb.size) {
          orb.vx *= -1;
        }
        if (orb.y < orb.size || orb.y > canvas.height - orb.size) {
          orb.vy *= -1;
        }

        // Keep orbs in bounds
        orb.x = Math.max(orb.size, Math.min(canvas.width - orb.size, orb.x));
        orb.y = Math.max(orb.size, Math.min(canvas.height - orb.size, orb.y));

        // Draw orb with pulsing glow
        const pulseSize = orb.size + Math.sin(orb.pulse) * 5;
        const alpha = 0.3 + Math.sin(orb.pulse) * 0.2;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Create radial gradient
        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          pulseSize,
        );
        gradient.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${orb.hue}, 100%, 50%, 0.4)`);
        gradient.addColorStop(1, `hsla(${orb.hue}, 100%, 30%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    initOrbs();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [orbCount]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
    />
  );
};
