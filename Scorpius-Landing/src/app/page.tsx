import dynamic from "next/dynamic";
import ScrollUIOverlay from "@/components/ScrollUIOverlay";
import PricingTiers from "@/components/PricingTiers";
import WarRoomFooter from "@/components/WarRoomFooter";
import CommandNavigation from "@/components/CommandNavigation";

const ScorpiusCore = dynamic(() => import("@/components/ScorpiusCore"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      {/* Command Navigation */}
      <CommandNavigation />

      <main
        className="relative w-screen h-[1000vh] bg-black"
        id="scroll-container"
      >
        {/* Starfield background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black">
            {/* Generate random stars */}
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animation: `twinkle ${2 + Math.random() * 3}s infinite ease-in-out alternate`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="sticky top-0 left-0 w-screen h-screen pointer-events-none z-10">
          <ScorpiusCore />
        </div>
        <ScrollUIOverlay />
      </main>

      {/* Pricing section */}
      <PricingTiers />

      {/* Footer */}
      <WarRoomFooter />
    </>
  );
}
