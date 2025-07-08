import {
  Search,
  Server,
  Activity,
  Shield,
  Zap,
  Clock,
  FileText,
  Eye,
  ArrowLeftRight,
  Target,
  Cpu,
  Lock,
  User,
  Home,
  BarChart3,
  Monitor,
} from "lucide-react";

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

interface ScorpiusDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const dockData = [
  // Main Overview
  {
    title: "Main",
    icon: <Home className="h-full w-full text-cyber-cyan" />,
    value: "overview",
  },

  // 1. Monitoring
  {
    title: "Scanner",
    icon: <Search className="h-full w-full text-cyber-cyan" />,
    value: "scanner",
  },
  {
    title: "Mempool",
    icon: <Activity className="h-full w-full text-cyber-cyan" />,
    value: "mempool",
  },
  {
    title: "Quantum",
    icon: <Lock className="h-full w-full text-cyber-cyan" />,
    value: "quantum",
  },
  {
    title: "Honeypot",
    icon: <Target className="h-full w-full text-cyber-cyan" />,
    value: "honeypot",
  },

  // 2. Retrospective / Analysis
  {
    title: "Time Machine",
    icon: <Clock className="h-full w-full text-cyber-cyan" />,
    value: "time-machine",
  },
  {
    title: "Forensics",
    icon: <Eye className="h-full w-full text-cyber-cyan" />,
    value: "forensics",
  },

  // 3. Operations
  {
    title: "MEV OPS",
    icon: <Zap className="h-full w-full text-cyber-cyan" />,
    value: "mev-ops",
  },
  {
    title: "Bridge",
    icon: <ArrowLeftRight className="h-full w-full text-cyber-cyan" />,
    value: "bridge",
  },
  {
    title: "Simulate",
    icon: <Cpu className="h-full w-full text-cyber-cyan" />,
    value: "simulation",
  },
  {
    title: "Computing",
    icon: <Server className="h-full w-full text-cyber-cyan" />,
    value: "computing",
  },

  // 4. Insights & Reporting
  {
    title: "Analytics",
    icon: <BarChart3 className="h-full w-full text-cyber-cyan" />,
    value: "analytics",
  },
  {
    title: "Grafana",
    icon: <Monitor className="h-full w-full text-cyber-cyan" />,
    value: "grafana",
  },
  {
    title: "Reports",
    icon: <FileText className="h-full w-full text-cyber-cyan" />,
    value: "reports",
  },

  // 5. Security
  {
    title: "Wallet Guard",
    icon: <Shield className="h-full w-full text-cyber-cyan" />,
    value: "wallet-guard",
  },

  // 6. Admin
  {
    title: "System",
    icon: <User className="h-full w-full text-cyber-cyan" />,
    value: "profile",
  },
];

export function ScorpiusDock({ activeTab, onTabChange }: ScorpiusDockProps) {
  return (
    <div className="fixed bottom-4 left-1/2 max-w-full -translate-x-1/2 z-50">
      <Dock
        className="items-end pb-3 bg-black/80 backdrop-blur-xl border border-cyber-cyan/30"
        magnification={70}
        distance={120}
        panelHeight={56}
      >
        {dockData.map((item) => (
          <div
            key={item.value}
            onClick={() => onTabChange(item.value)}
            className="cursor-pointer"
          >
            <DockItem
              className={`aspect-square rounded-xl transition-all duration-300 ${
                activeTab === item.value
                  ? "bg-cyber-cyan/20 border-2 border-cyber-cyan shadow-lg shadow-cyber-cyan/50"
                  : "bg-black/60 border border-cyber-cyan/30 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/50"
              }`}
            >
              <DockLabel className="bg-black/90 border-cyber-cyan/50 text-cyber-cyan font-mono text-xs">
                {item.title}
              </DockLabel>
              <DockIcon
                className={
                  activeTab === item.value ? "animate-cyber-pulse" : ""
                }
              >
                {item.icon}
              </DockIcon>
            </DockItem>
          </div>
        ))}
      </Dock>
    </div>
  );
}
