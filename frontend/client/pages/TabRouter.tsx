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
import Computing from "./tabs/Computing";
import Analytics from "./tabs/Analytics";
import GrafanaMonitoring from "./tabs/GrafanaMonitoring";
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
                Security Platform
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

          {/* Zero-Day Alert System - Bottom Right of Header */}
          <div className="absolute bottom-4 right-4 z-10">
            <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-xl border border-red-500/30 rounded-lg p-3 shadow-lg">
              <div className="relative">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="text-red-500"
                  fill="currentColor"
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
                <div className="absolute inset-0 animate-ping">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="text-red-500/50"
                    fill="currentColor"
                  >
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                </div>
              </div>
              <div className="text-red-400 font-mono text-sm">
                <span className="font-bold">0-DAY ALERT</span>
                <div className="text-xs text-red-400/70">(COMING SOON)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tron-like Separator */}
        <div className="relative mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-60"></div>
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent blur-sm opacity-80"></div>
          <div className="absolute inset-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent blur-md"></div>
          {/* Animated scanning effect */}
          <div className="absolute inset-0 h-px overflow-hidden">
            <div className="absolute top-0 w-20 h-px bg-gradient-to-r from-transparent via-white to-transparent animate-cyber-scan opacity-70"></div>
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
            <Overview
              onNavigateToProfile={() => setActiveTab("profile")}
              onNavigateToTab={setActiveTab}
            />
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

          <TabsContent value="computing">
            <Computing />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="grafana">
            <GrafanaMonitoring />
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
