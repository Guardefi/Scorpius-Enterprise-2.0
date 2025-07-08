import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Hash,
  DollarSign,
  Target,
  Globe,
  Droplets,
  Plus,
  X,
  Bell,
  ExternalLink,
} from "lucide-react";
import {
  chartColors,
  chartTheme,
  chartAnimations,
  generateSampleData,
} from "@/lib/chart-utils";
import { CrossChainBridgeMonitor } from "@/components/mempool/CrossChainBridgeMonitor";

interface MempoolTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  timestamp: string;
  chain: string;
  mevOpportunity?: {
    type: "arbitrage" | "liquidation" | "sandwich";
    profit: string;
  };
  riskLevel: "Low" | "Medium" | "High";
}

interface TrackingTarget {
  id: string;
  type: "contract" | "chain" | "liquidity_pool";
  name: string;
  address: string;
  chain?: string;
  isActive: boolean;
  totalTransactions: number;
  lastActivity: string;
}

export default function Mempool() {
  const [mempoolTransactions, setMempoolTransactions] = useState<
    MempoolTransaction[]
  >([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [mevOpportunities, setMevOpportunities] = useState(0);
  const [mempoolChartData] = useState(generateSampleData.lineChart(20));
  const [gasChartData] = useState(generateSampleData.lineChart(20));

  // Tracking state
  const [trackingTargets, setTrackingTargets] = useState<TrackingTarget[]>([]);
  const [newTrackingTarget, setNewTrackingTarget] = useState({
    type: "contract" as "contract" | "chain" | "liquidity_pool",
    name: "",
    address: "",
    chain: "ethereum",
  });

  // Suppress ResizeObserver error (harmless but annoying)
  useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (
        e.message ===
        "ResizeObserver loop completed with undelivered notifications."
      ) {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("error", handleResizeObserverError);
    return () => window.removeEventListener("error", handleResizeObserverError);
  }, []);

  // Add tracking target function
  const addTrackingTarget = () => {
    if (!newTrackingTarget.name.trim() || !newTrackingTarget.address.trim())
      return;

    const target: TrackingTarget = {
      id: `track_${Date.now()}`,
      type: newTrackingTarget.type,
      name: newTrackingTarget.name,
      address: newTrackingTarget.address,
      chain: newTrackingTarget.chain,
      isActive: true,
      totalTransactions: 0,
      lastActivity: "Never",
    };

    setTrackingTargets((prev) => [...prev, target]);
    setNewTrackingTarget({
      type: "contract",
      name: "",
      address: "",
      chain: "ethereum",
    });
  };

  const removeTrackingTarget = (id: string) => {
    setTrackingTargets((prev) => prev.filter((target) => target.id !== id));
  };

  // Simulate mempool transactions
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const chains = ["ethereum", "polygon", "arbitrum", "optimism", "bsc"];
      const selectedChain = chains[Math.floor(Math.random() * chains.length)];

      const newTx: MempoolTransaction = {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: (Math.random() * 10).toFixed(3),
        gasPrice: `${Math.floor(Math.random() * 50 + 20)}`,
        gasLimit: `${Math.floor(Math.random() * 100000 + 21000)}`,
        timestamp: new Date().toLocaleTimeString(),
        chain: selectedChain,
        riskLevel: ["Low", "Medium", "High"][
          Math.floor(Math.random() * 3)
        ] as any,
      };

      // Check if transaction matches any tracking targets
      const matchedTarget = trackingTargets.find((target) => {
        if (target.type === "contract") {
          return (
            target.address.toLowerCase() === newTx.to.toLowerCase() ||
            target.address.toLowerCase() === newTx.from.toLowerCase()
          );
        } else if (target.type === "chain") {
          return target.chain === newTx.chain;
        } else if (target.type === "liquidity_pool") {
          return target.address.toLowerCase() === newTx.to.toLowerCase();
        }
        return false;
      });

      if (matchedTarget) {
        setTrackingTargets((prev) =>
          prev.map((target) =>
            target.id === matchedTarget.id
              ? {
                  ...target,
                  totalTransactions: target.totalTransactions + 1,
                  lastActivity: new Date().toLocaleTimeString(),
                }
              : target,
          ),
        );
      }

      // Add MEV opportunity randomly
      if (Math.random() > 0.7) {
        newTx.mevOpportunity = {
          type: ["arbitrage", "liquidation", "sandwich"][
            Math.floor(Math.random() * 3)
          ] as any,
          profit: (Math.random() * 2).toFixed(3),
        };
        setMevOpportunities((prev) => prev + 1);
      }

      setMempoolTransactions((prev) => [newTx, ...prev.slice(0, 99)]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, trackingTargets]);

  return (
    <div className="space-y-8">
      {/* Tracking Targets Section - Moved to Top */}
      <Card className="cyber-card-enhanced group">
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 cyber-glow">
            <Target className="w-5 h-5 text-purple-400 group-hover:animate-cyber-pulse" />
            TRACKING TARGETS
          </CardTitle>
          <CardDescription>
            Monitor specific contracts, chains, or liquidity pools for
            transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Target Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Type
              </label>
              <Select
                value={newTrackingTarget.type}
                onValueChange={(value: any) =>
                  setNewTrackingTarget((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-black/70 border-cyber-cyan/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Smart Contract</SelectItem>
                  <SelectItem value="chain">Blockchain</SelectItem>
                  <SelectItem value="liquidity_pool">Liquidity Pool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Name
              </label>
              <Input
                placeholder={
                  newTrackingTarget.type === "contract"
                    ? "Contract Name"
                    : newTrackingTarget.type === "chain"
                      ? "Chain Name"
                      : "Pool Name"
                }
                value={newTrackingTarget.name}
                onChange={(e) =>
                  setNewTrackingTarget((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                {newTrackingTarget.type === "chain" ? "Chain" : "Address"}
              </label>
              <Input
                placeholder={
                  newTrackingTarget.type === "chain" ? "ethereum" : "0x..."
                }
                value={
                  newTrackingTarget.type === "chain"
                    ? newTrackingTarget.chain
                    : newTrackingTarget.address
                }
                onChange={(e) =>
                  setNewTrackingTarget((prev) => ({
                    ...prev,
                    [newTrackingTarget.type === "chain" ? "chain" : "address"]:
                      e.target.value,
                  }))
                }
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Action
              </label>
              <Button
                onClick={addTrackingTarget}
                className="w-full btn-primary font-mono"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Target
              </Button>
            </div>
          </div>

          {/* Active Tracking Targets */}
          {trackingTargets.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-cyber-cyan">
                Active Targets ({trackingTargets.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trackingTargets.map((target) => (
                  <div
                    key={target.id}
                    className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-cyber-cyan text-sm">
                          {target.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-500/20 text-purple-400"
                        >
                          {target.type}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrackingTarget(target.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-cyber-cyan/70 text-xs">
                          Address
                        </div>
                        <div className="font-bold text-cyber-cyan font-mono truncate">
                          {target.address || target.chain}
                        </div>
                      </div>
                      <div>
                        <div className="text-cyber-cyan/70 text-xs">
                          Transactions
                        </div>
                        <div className="font-bold text-green-400">
                          {target.totalTransactions}
                        </div>
                      </div>
                      <div>
                        <div className="text-cyber-cyan/70 text-xs">
                          Last Activity
                        </div>
                        <div className="font-bold text-blue-400 text-xs">
                          {target.lastActivity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trackingTargets.length === 0 && (
            <div className="text-center py-8 text-cyber-cyan/60">
              <Target className="w-12 h-12 mx-auto mb-3 text-cyber-cyan/40" />
              <p className="text-sm">
                No tracking targets configured. Add a contract, chain, or
                liquidity pool above to start monitoring.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Real-time Network Intelligence Header */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-cyber-cyan animate-cyber-pulse" />
            </div>
            <div className="text-2xl font-bold text-cyber-cyan font-mono mb-1">
              {mempoolTransactions.length +
                Math.floor(Math.random() * 50 + 200)}
            </div>
            <div className="text-xs text-cyber-cyan/70 uppercase tracking-wide">
              Pending TXs
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-yellow-400 animate-cyber-pulse" />
            </div>
            <div className="text-2xl font-bold text-yellow-400 font-mono mb-1">
              {Math.floor(Math.random() * 30 + 45)}
            </div>
            <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
              Gas Price (Gwei)
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-400 animate-cyber-pulse" />
            </div>
            <div className="text-2xl font-bold text-green-400 font-mono mb-1">
              {mempoolTransactions.filter((tx) => tx.mevOpportunity).length}
            </div>
            <div className="text-xs text-green-400/70 uppercase tracking-wide">
              MEV Opportunities
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-cyber-pulse" />
            </div>
            <div className="text-2xl font-bold text-red-400 font-mono mb-1">
              {
                mempoolTransactions.filter((tx) => tx.riskLevel === "High")
                  .length
              }
            </div>
            <div className="text-xs text-red-400/70 uppercase tracking-wide">
              High Risk TXs
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-blue-400 animate-cyber-pulse" />
            </div>
            <div className="text-2xl font-bold text-blue-400 font-mono mb-1">
              {Math.floor(Math.random() * 5 + 12)}s
            </div>
            <div className="text-xs text-blue-400/70 uppercase tracking-wide">
              Avg Confirm Time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Advanced Network Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Transaction Volume */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold cyber-glow">
              <Activity className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              TRANSACTION VOLUME
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Transaction Count",
                  color: chartColors.primary,
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer>
                <AreaChart data={mempoolChartData}>
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis
                    dataKey="name"
                    axisLine={chartTheme.axis.axisLine}
                    tickLine={chartTheme.axis.tickLine}
                    tick={chartTheme.axis.tick}
                  />
                  <YAxis
                    axisLine={chartTheme.axis.axisLine}
                    tickLine={chartTheme.axis.tickLine}
                    tick={chartTheme.axis.tick}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColors.primary}
                    fill={`${chartColors.primary}40`}
                    strokeWidth={2}
                    {...chartAnimations.entry}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gas Price Trends */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold cyber-glow">
              <Zap className="w-5 h-5 text-yellow-400 group-hover:animate-cyber-pulse" />
              GAS PRICE TRENDS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Gas Price (Gwei)",
                  color: chartColors.warning,
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer>
                <LineChart data={gasChartData}>
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis
                    dataKey="name"
                    axisLine={chartTheme.axis.axisLine}
                    tickLine={chartTheme.axis.tickLine}
                    tick={chartTheme.axis.tick}
                  />
                  <YAxis
                    axisLine={chartTheme.axis.axisLine}
                    tickLine={chartTheme.axis.tickLine}
                    tick={chartTheme.axis.tick}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={chartColors.warning}
                    strokeWidth={3}
                    dot={{
                      fill: chartColors.warning,
                      strokeWidth: 2,
                      r: 4,
                    }}
                    {...chartAnimations.entry}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Alerts System */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Bell className="w-5 h-5 text-red-400 group-hover:animate-cyber-pulse" />
              GLOBAL ALERTS
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                3
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure wallet alerts and monitor high-risk activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Watch Wallet Form */}
            <div className="space-y-3 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="text-sm font-medium text-red-400">
                Watch a Wallet
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="0x... or ENS name"
                  className="bg-black/70 border-red-500/30 text-white font-mono focus:border-red-500 focus:ring-red-500/20"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-400/70">
                    Risk Threshold
                  </span>
                  <span className="text-xs text-red-400">≥ 70%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  defaultValue="70"
                  className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
                />
                <Button className="w-full btn-primary bg-red-500 hover:bg-red-600 text-white font-mono text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Alert
                </Button>
              </div>
            </div>

            {/* Watched Addresses */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-cyber-cyan">
                Watched Addresses (2)
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-mono text-cyber-cyan">
                      0xAbC...123
                    </span>
                    <Badge className="text-xs bg-red-500/20 text-red-400">
                      ≥70%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-cyber-cyan"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-400"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-amber-500/5 border border-amber-500/20 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-mono text-cyber-cyan">
                      alice.eth
                    </span>
                    <Badge className="text-xs bg-amber-500/20 text-amber-400">
                      ≥50%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-cyber-cyan"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-400"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-400">
                Recent Alerts
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-red-400 font-mono">
                      HIGH-RISK TX 0xFf...123
                    </span>
                  </div>
                  <span className="text-red-400/70">3s ago</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-amber-400 font-mono">
                      MED-RISK TX 0xEe...456
                    </span>
                  </div>
                  <span className="text-amber-400/70">12s ago</span>
                </div>
              </div>
            </div>

            {/* Alert Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 btn-secondary font-mono text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Send to Slack
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 btn-secondary font-mono text-xs"
              >
                ✅ Acknowledge All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Feed */}
        <Card className="lg:col-span-2 cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Hash className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              LIVE TRANSACTION FEED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hash</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Value (ETH)</TableHead>
                    <TableHead>Gas Price</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>MEV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mempoolTransactions.slice(0, 20).map((tx) => {
                    // Check if this transaction matches any tracking targets
                    const isTracked = trackingTargets.some((target) => {
                      if (target.type === "contract") {
                        return (
                          target.address.toLowerCase() ===
                            tx.to.toLowerCase() ||
                          target.address.toLowerCase() === tx.from.toLowerCase()
                        );
                      } else if (target.type === "chain") {
                        return target.chain === tx.chain;
                      } else if (target.type === "liquidity_pool") {
                        return (
                          target.address.toLowerCase() === tx.to.toLowerCase()
                        );
                      }
                      return false;
                    });

                    return (
                      <TableRow
                        key={tx.hash}
                        className={
                          isTracked
                            ? "bg-purple-500/10 border border-purple-500/20"
                            : ""
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs">
                              {tx.hash.slice(0, 10)}...
                            </code>
                            {isTracked && (
                              <Target className="w-3 h-3 text-purple-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {tx.chain}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">
                            {tx.from.slice(0, 10)}...
                          </code>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <span className="text-sm">{tx.value}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{tx.gasPrice} gwei</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.riskLevel === "High"
                                ? "destructive"
                                : tx.riskLevel === "Medium"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {tx.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tx.mevOpportunity ? (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600">
                                {tx.mevOpportunity.profit} ETH
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {mempoolTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {isMonitoring
                    ? "Waiting for transactions..."
                    : "Start monitoring to see live transactions"}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Chain Bridge Monitor */}
      <CrossChainBridgeMonitor />
    </div>
  );
}
