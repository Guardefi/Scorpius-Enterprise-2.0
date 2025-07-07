import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import MiniSphere from "../components/dashboard/MiniSphere";
import { ScorpiusDock } from "@/components/ui/scorpius-dock";

// Import tab components
import Overview from "./tabs/Overview";
import Scanner from "./tabs/Scanner";
import Mempool from "./tabs/Mempool";
import MEVOps from "./tabs/MEVOps";
import Bridge from "./tabs/Bridge";
import Forensics from "./tabs/Forensics";
import TimeMachine from "./tabs/TimeMachine";
import Honeypot from "./tabs/Honeypot";
import Quantum from "./tabs/Quantum";
import Simulation from "./tabs/Simulation";
import Reports from "./tabs/Reports";
import WalletGuard from "./tabs/WalletGuard";
import Profile from "./tabs/Profile";

export default function TabRouter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [systemStatus, setSystemStatus] = useState<
    "active" | "warning" | "error"
  >("active");
  const [threatCount, setThreatCount] = useState(1247);

  // Simulate real-time threat counter and system status
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatCount((prev) => prev + Math.floor(Math.random() * 3));
      // Occasionally change system status for demo
      if (Math.random() > 0.95) {
        setSystemStatus((prev) => (prev === "active" ? "warning" : "active"));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header with MiniSphere */}
        <div className="relative mb-8">
          {/* Main Header Content */}
          <div className="text-center">
            <h1
              className="text-6xl font-black tracking-wide mb-4 relative"
              style={{
                fontFamily:
                  'Impact, "Arial Black", "Franklin Gothic Bold", "Arial Narrow", sans-serif',
              }}
            >
              <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] [text-shadow:_0_1px_0_rgba(255,255,255,0.8),_0_2px_0_rgba(200,200,200,0.6),_0_3px_0_rgba(150,150,150,0.4),_0_4px_0_rgba(100,100,100,0.2)] filter brightness-125 contrast-125">
                SCORPIUS
              </span>
              <span className="absolute inset-0 text-slate-600/60 transform translate-x-1 translate-y-1 -z-10">
                SCORPIUS
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-sm text-cyber-cyan/80 font-medium uppercase tracking-[0.3em]">
                Quantum Security Platform
              </p>
            </div>
          </div>

          {/* MiniSphere positioned dead center behind SCORPIUS */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <MiniSphere
              size={240}
              active={systemStatus === "active"}
              className="opacity-30"
            />
          </div>
        </div>

        {/* Main Tabs with Dock Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full pb-24"
        >
          {/* Tab Content */}
          <TabsContent value="overview">
            <Overview />
          </TabsContent>

          <TabsContent value="scanner">
            <Scanner />
          </TabsContent>

          <TabsContent value="mempool">
            <Mempool />
          </TabsContent>

          <TabsContent value="mev-ops">
            <MEVOps />
          </TabsContent>

          <TabsContent value="bridge">
            <Bridge />
          </TabsContent>

          <TabsContent value="forensics">
            <Forensics />
          </TabsContent>

          <TabsContent value="time-machine">
            <TimeMachine />
          </TabsContent>

          <TabsContent value="honeypot">
            <Honeypot />
          </TabsContent>

          <TabsContent value="quantum">
            <Quantum />
          </TabsContent>

          <TabsContent value="simulation">
            <Simulation />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          <TabsContent value="wallet-guard">
            <WalletGuard />
          </TabsContent>

          <TabsContent value="profile">
            <Profile />
          </TabsContent>
        </Tabs>

        {/* SCORPIUS Dock Navigation */}
        <ScorpiusDock activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
