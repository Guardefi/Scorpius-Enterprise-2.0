"use client";
import { Zap, Cpu, Shield, Target, Satellite, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

const features = [
  {
    title: "Lightning Fast",
    icon: Zap,
    description:
      "Advanced quantum processors deliver unmatched computational speed for real-time tactical analysis.",
  },
  {
    title: "Neural Core",
    icon: Cpu,
    description:
      "State-of-the-art AI systems process battlefield data with military-grade precision.",
  },
  {
    title: "Fortress Protocol",
    icon: Shield,
    description:
      "Multi-layered security systems protect critical war room operations from all threats.",
  },
  {
    title: "Target Lock",
    icon: Target,
    description:
      "Precision targeting systems ensure accurate deployment of strategic resources.",
  },
  {
    title: "Deep Space Comms",
    icon: Satellite,
    description:
      "Quantum entanglement communications maintain connectivity across vast distances.",
  },
  {
    title: "AI Enhanced",
    icon: Sparkles,
    description:
      "Machine learning algorithms continuously optimize tactical decision-making processes.",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-16 md:py-32 relative bg-gradient-to-b from-war-room-void to-war-room-abyss">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]" />

      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 relative z-10">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold font-command text-cyber-cyan-bright">
            TACTICAL SUPREMACY
          </h2>
          <p className="text-cyber-cyan-base/80 mt-4 text-sm tracking-wide text-balance md:text-base font-terminal">
            Advanced systems engineered for strategic dominance in the digital
            battlefield.
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 divide-x divide-y divide-dashed divide-cyber-cyan-dim/30 border border-dashed border-cyber-cyan-dim/50 sm:grid-cols-2 md:grid-cols-3 bg-war-room-charcoal/20 backdrop-blur-sm"
        >
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              feature={feature}
              className="bg-gradient-to-br from-war-room-charcoal/40 to-war-room-steel/20 border-cyber-cyan-dim/20 hover:border-cyber-cyan-base/40 transition-all duration-300 hover:bg-gradient-to-br hover:from-war-room-charcoal/60 hover:to-war-room-steel/40"
            />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: React.ComponentProps<typeof motion.div>["className"];
  children: React.ReactNode;
};

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
