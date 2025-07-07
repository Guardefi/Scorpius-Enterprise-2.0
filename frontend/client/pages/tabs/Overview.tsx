import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Shield,
  Zap,
  Eye,
  Target,
  Clock,
  Database,
  Cpu,
  HardDrive,
  MemoryStick,
  MonitorSpeaker,
  Brain,
} from "lucide-react";

// Health Monitor Component
function HealthMonitor({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  const getBarColor = (percentage: number) => {
    if (percentage > 80) return "bg-red-400";
    if (percentage > 60) return "bg-yellow-400";
    return "bg-green-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 text-${color}`} />
          <span className="text-sm font-mono text-muted-foreground">
            {label}
          </span>
        </div>
        <span className={`text-sm font-mono font-bold text-${color}`}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-black rounded-full overflow-hidden border border-cyber-cyan/20">
        <div
          className={`h-full transition-all duration-1000 ${getBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Clean Threat Trends Chart
function ThreatTrendsChart() {
  const [threatData, setThreatData] = useState(() => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        threats: Math.floor(Math.random() * 50) + 10,
        blocked: Math.floor(Math.random() * 80) + 20,
        resolved: Math.floor(Math.random() * 30) + 5,
      });
    }
    return data;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setThreatData((prev) => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          threats: Math.floor(Math.random() * 50) + 10,
          blocked: Math.floor(Math.random() * 80) + 20,
          resolved: Math.floor(Math.random() * 30) + 5,
        });
        return newData;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={threatData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff4444" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ffff" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff00" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
          <XAxis
            dataKey="time"
            stroke="rgba(0,255,255,0.7)"
            fontSize={10}
            fontFamily="JetBrains Mono"
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="rgba(0,255,255,0.7)"
            fontSize={12}
            fontFamily="JetBrains Mono"
          />
          <ChartTooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
              border: "1px solid rgba(0,255,255,0.3)",
              borderRadius: "8px",
              color: "#00ffff",
            }}
          />
          <Area
            type="monotone"
            dataKey="threats"
            stroke="#ff4444"
            fillOpacity={1}
            fill="url(#threatsGradient)"
          />
          <Area
            type="monotone"
            dataKey="blocked"
            stroke="#00ffff"
            fillOpacity={1}
            fill="url(#blockedGradient)"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke="#00ff00"
            fillOpacity={1}
            fill="url(#resolvedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Clean Security Metrics Chart
function SecurityMetricsChart() {
  const [securityData, setSecurityData] = useState([
    { name: "Firewall", score: 95, baseline: 90 },
    { name: "Intrusion", score: 87, baseline: 85 },
    { name: "Malware", score: 92, baseline: 88 },
    { name: "Network", score: 89, baseline: 92 },
    { name: "Access", score: 94, baseline: 91 },
    { name: "Data", score: 88, baseline: 86 },
    { name: "Endpoint", score: 76, baseline: 82 },
    { name: "API", score: 98, baseline: 95 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityData((prev) =>
        prev.map((item) => ({
          ...item,
          score: Math.max(
            60,
            Math.min(100, item.score + (Math.random() - 0.5) * 6),
          ),
        })),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={securityData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
          <XAxis
            dataKey="name"
            stroke="rgba(0,255,255,0.7)"
            fontSize={12}
            fontFamily="JetBrains Mono"
          />
          <YAxis
            stroke="rgba(0,255,255,0.7)"
            fontSize={12}
            fontFamily="JetBrains Mono"
          />
          <ChartTooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
              border: "1px solid rgba(0,255,255,0.3)",
              borderRadius: "8px",
              color: "#00ffff",
            }}
          />
          <Bar
            dataKey="score"
            fill="#00ffff"
            fillOpacity={0.6}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="baseline"
            fill="rgba(255,255,255,0.2)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MempoolTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  timestamp: string;
  mevOpportunity?: {
    type: "arbitrage" | "liquidation" | "sandwich";
    profit: string;
  };
  riskLevel: "Low" | "Medium" | "High";
}

export default function Overview() {
  // Health monitor states
  const [cpuUsage, setCpuUsage] = useState(34);
  const [memoryUsage, setMemoryUsage] = useState(67);
  const [storageUsage, setStorageUsage] = useState(45);

  // Performance metrics state
  const [metrics, setMetrics] = useState({
    responseTime: 45,
    throughput: 1247,
    uptime: 99.97,
    errorRate: 0.03,
    activeUsers: 342,
    cacheHitRate: 94.2,
  });

  // Live feed state
  const [liveTransactions, setLiveTransactions] = useState<
    MempoolTransaction[]
  >([]);

  // Update health and metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // Update health metrics
      setCpuUsage((prev) =>
        Math.max(10, Math.min(95, prev + (Math.random() - 0.5) * 8)),
      );
      setMemoryUsage((prev) =>
        Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 5)),
      );
      setStorageUsage((prev) =>
        Math.max(10, Math.min(85, prev + (Math.random() - 0.5) * 2)),
      );

      // Update performance metrics
      setMetrics((prev) => ({
        responseTime: Math.max(
          20,
          Math.min(100, prev.responseTime + (Math.random() - 0.5) * 10),
        ),
        throughput: Math.max(
          800,
          Math.min(
            2000,
            prev.throughput + Math.floor((Math.random() - 0.5) * 100),
          ),
        ),
        uptime: Math.max(
          99,
          Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1),
        ),
        errorRate: Math.max(
          0,
          Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.02),
        ),
        activeUsers: Math.max(
          200,
          Math.min(
            500,
            prev.activeUsers + Math.floor((Math.random() - 0.5) * 20),
          ),
        ),
        cacheHitRate: Math.max(
          85,
          Math.min(99, prev.cacheHitRate + (Math.random() - 0.5) * 2),
        ),
      }));

      // Add new transaction
      if (Math.random() > 0.6) {
        const newTx: MempoolTransaction = {
          hash: `0x${Math.random().toString(16).substr(2, 40)}`,
          from: `0x${Math.random().toString(16).substr(2, 40)}`,
          to: `0x${Math.random().toString(16).substr(2, 40)}`,
          value: (Math.random() * 10).toFixed(4),
          gasPrice: Math.floor(Math.random() * 100 + 20).toString(),
          timestamp: new Date().toLocaleTimeString(),
          riskLevel: ["Low", "Medium", "High"][
            Math.floor(Math.random() * 3)
          ] as any,
          ...(Math.random() > 0.8 && {
            mevOpportunity: {
              type: ["arbitrage", "liquidation", "sandwich"][
                Math.floor(Math.random() * 3)
              ] as any,
              profit: (Math.random() * 5).toFixed(3),
            },
          }),
        };
        setLiveTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Analytics Section - Clean Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Threat Trends Chart */}
        <Card className="cyber-card-enhanced lg:col-span-2">
          <CardHeader>
            <CardTitle className="cyber-glow text-lg">
              THREAT TRENDS ANALYSIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThreatTrendsChart />
          </CardContent>
        </Card>

        {/* Security Metrics Chart */}
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="cyber-glow text-lg">
              SECURITY METRICS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityMetricsChart />
          </CardContent>
        </Card>
      </div>

      {/* Secondary Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Vertical System Health */}
        <Card className="cyber-card-enhanced md:col-span-2">
          <CardHeader>
            <CardTitle className="cyber-glow text-lg">
              SYSTEM HEALTH MONITOR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HealthMonitor
                label="CPU Usage"
                value={cpuUsage}
                icon={Cpu}
                color="blue-400"
              />
              <HealthMonitor
                label="Memory Usage"
                value={memoryUsage}
                icon={MemoryStick}
                color="green-400"
              />
              <HealthMonitor
                label="Storage Usage"
                value={storageUsage}
                icon={HardDrive}
                color="purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tall Performance Metrics */}
        <Card className="cyber-card-enhanced md:col-span-2 h-full">
          <CardHeader>
            <CardTitle className="cyber-glow text-lg">
              PERFORMANCE METRICS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border border-blue-400/30 rounded-lg bg-blue-400/10">
                <div className="text-lg font-bold text-blue-400 font-mono">
                  {metrics.responseTime.toFixed(0)}ms
                </div>
                <div className="text-xs text-blue-400/70">Response Time</div>
              </div>

              <div className="text-center p-3 border border-green-400/30 rounded-lg bg-green-400/10">
                <div className="text-lg font-bold text-green-400 font-mono">
                  {metrics.throughput}
                </div>
                <div className="text-xs text-green-400/70">Requests/min</div>
              </div>

              <div className="text-center p-3 border border-cyan-400/30 rounded-lg bg-cyan-400/10">
                <div className="text-lg font-bold text-cyan-400 font-mono">
                  {metrics.uptime.toFixed(2)}%
                </div>
                <div className="text-xs text-cyan-400/70">Uptime</div>
              </div>

              <div className="text-center p-3 border border-red-400/30 rounded-lg bg-red-400/10">
                <div className="text-lg font-bold text-red-400 font-mono">
                  {metrics.errorRate.toFixed(2)}%
                </div>
                <div className="text-xs text-red-400/70">Error Rate</div>
              </div>

              <div className="text-center p-3 border border-purple-400/30 rounded-lg bg-purple-400/10">
                <div className="text-lg font-bold text-purple-400 font-mono">
                  {metrics.activeUsers}
                </div>
                <div className="text-xs text-purple-400/70">Active Users</div>
              </div>

              <div className="text-center p-3 border border-yellow-400/30 rounded-lg bg-yellow-400/10">
                <div className="text-lg font-bold text-yellow-400 font-mono">
                  {metrics.cacheHitRate.toFixed(1)}%
                </div>
                <div className="text-xs text-yellow-400/70">Cache Hit Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Shield, label: "Security Scan", color: "blue-400" },
          { icon: Zap, label: "MEV Monitor", color: "yellow-400" },
          { icon: Eye, label: "Forensics", color: "green-400" },
          { icon: Clock, label: "Time Machine", color: "purple-400" },
          { icon: Target, label: "Honeypot", color: "red-400" },
          { icon: Brain, label: "AI Analysis", color: "cyan-400" },
        ].map((action, index) => (
          <Card
            key={index}
            className="cyber-card-enhanced hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-4 text-center">
              <action.icon
                className={`w-8 h-8 mx-auto mb-2 text-${action.color} group-hover:animate-cyber-pulse`}
              />
              <h3 className="font-medium text-cyber-cyan text-sm">
                {action.label}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Transaction Feed */}
      <Card className="cyber-card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-glow">
            <MonitorSpeaker className="w-5 h-5 text-green-400 animate-cyber-pulse" />
            LIVE TRANSACTION FEED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {liveTransactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="flex items-center justify-between p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/10 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          tx.riskLevel === "High"
                            ? "bg-red-400 animate-pulse"
                            : tx.riskLevel === "Medium"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                        }`}
                      />
                      <span className="font-mono text-xs text-cyber-cyan truncate">
                        {tx.hash.slice(0, 20)}...
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tx.value} ETH • {tx.gasPrice} Gwei • {tx.timestamp}
                    </div>
                  </div>
                  {tx.mevOpportunity && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/20 text-yellow-400 text-xs"
                    >
                      MEV: {tx.mevOpportunity.profit} ETH
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
