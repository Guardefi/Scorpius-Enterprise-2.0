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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Zap,
  Shield,
  Search,
  Target,
  Activity,
  DollarSign,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Settings,
  CheckCircle,
} from "lucide-react";
import {
  chartColors,
  chartTheme,
  chartAnimations,
  generateSampleData,
  generateTimeSeriesData,
} from "@/lib/chart-utils";

interface MEVStrategy {
  id: string;
  name: string;
  type: "arbitrage" | "liquidation" | "sandwich" | "frontrun";
  status: "active" | "paused" | "stopped";
  profitTarget: number;
  gasLimit: number;
  slippage: number;
  totalProfit: number;
  successRate: number;
}

export default function MEVOps() {
  // MEV Bot State
  const [mevStrategies, setMevStrategies] = useState<MEVStrategy[]>([]);
  const [newStrategy, setNewStrategy] = useState({
    name: "",
    type: "arbitrage" as const,
    profitTarget: 0.1,
    gasLimit: 300000,
    slippage: 1.0,
  });

  // Chart data
  const [mevProfitChart] = useState(generateSampleData.lineChart(12));
  const [mevSuccessChart] = useState(
    generateSampleData.barChart([
      "Arbitrage",
      "Liquidation",
      "Sandwich",
      "Frontrun",
    ]),
  );

  const createStrategy = () => {
    if (!newStrategy.name.trim()) return;

    const strategy: MEVStrategy = {
      id: `strategy_${Date.now()}`,
      ...newStrategy,
      status: "active",
      totalProfit: Math.random() * 10,
      successRate: Math.floor(Math.random() * 40) + 60,
    };

    setMevStrategies((prev) => [strategy, ...prev]);
    setNewStrategy({
      name: "",
      type: "arbitrage",
      profitTarget: 0.1,
      gasLimit: 300000,
      slippage: 1.0,
    });
  };

  const toggleStrategy = (id: string) => {
    setMevStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === id
          ? {
              ...strategy,
              status:
                strategy.status === "active"
                  ? "paused"
                  : strategy.status === "paused"
                    ? "active"
                    : "active",
            }
          : strategy,
      ),
    );
  };

  return (
    <div className="space-y-8">
      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Sub-tabs for Attack and Defense */}
      <Tabs defaultValue="attack" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-cyber-cyan/30">
          <TabsTrigger
            value="attack"
            className="flex items-center gap-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-cyber-cyan/70 hover:text-red-400 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Attack Mode
          </TabsTrigger>
          <TabsTrigger
            value="defense"
            className="flex items-center gap-2 data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan text-cyber-cyan/70 hover:text-cyber-cyan transition-colors"
          >
            <Shield className="w-4 h-4" />
            🛡️ MEVGuardian
          </TabsTrigger>
        </TabsList>

        {/* Attack Mode Tab */}
        <TabsContent value="attack" className="space-y-6 mt-6">
          {/* Trading Performance Dashboard Header */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-yellow-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 font-mono mb-1">
                  {mevStrategies.filter((s) => s.status === "active").length}
                </div>
                <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
                  Active Bots
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-green-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-green-400 font-mono mb-1">
                  {mevStrategies
                    .reduce((acc, s) => acc + s.totalProfit, 0)
                    .toFixed(2)}
                </div>
                <div className="text-xs text-green-400/70 uppercase tracking-wide">
                  Total Profit (ETH)
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-blue-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-blue-400 font-mono mb-1">
                  {Math.round(
                    mevStrategies.reduce((acc, s) => acc + s.successRate, 0) /
                      Math.max(mevStrategies.length, 1),
                  )}
                  %
                </div>
                <div className="text-xs text-blue-400/70 uppercase tracking-wide">
                  Success Rate
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-cyan-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-cyan-400 font-mono mb-1">
                  +
                  {(
                    mevStrategies.reduce((acc, s) => acc + s.totalProfit, 0) *
                    0.23
                  ).toFixed(3)}
                </div>
                <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
                  Today's Profit (ETH)
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-6 h-6 text-purple-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-purple-400 font-mono mb-1">
                  {Math.floor(Math.random() * 15 + 45)}
                </div>
                <div className="text-xs text-purple-400/70 uppercase tracking-wide">
                  Executions/Hour
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Trading Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Over Time */}
            <Card className="cyber-card-enhanced group">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <TrendingUp className="w-5 h-5 text-green-400 group-hover:animate-cyber-pulse" />
                  PROFIT OVER TIME
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Profit (ETH)",
                      color: chartColors.success,
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer>
                    <AreaChart data={mevProfitChart}>
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
                        stroke={chartColors.success}
                        fill={`${chartColors.success}40`}
                        strokeWidth={2}
                        {...chartAnimations.entry}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Strategy Performance */}
            <Card className="cyber-card-enhanced group">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <BarChart3 className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                  STRATEGY PERFORMANCE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Success Rate (%)",
                      color: chartColors.primary,
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer>
                    <BarChart data={mevSuccessChart}>
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
                      <Bar
                        dataKey="value"
                        fill={chartColors.primary}
                        radius={[4, 4, 0, 0]}
                        {...chartAnimations.entry}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Creation */}
            <Card className="cyber-card-enhanced group">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <Zap className="w-5 h-5 text-yellow-400 group-hover:animate-cyber-pulse" />
                  CREATE MEV STRATEGY
                </CardTitle>
                <CardDescription>
                  Configure automated MEV extraction strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Name</label>
                  <Input
                    placeholder="My Arbitrage Bot"
                    value={newStrategy.name}
                    onChange={(e) =>
                      setNewStrategy((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="bg-black/70 border-cyber-cyan/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Type</label>
                  <Select
                    value={newStrategy.type}
                    onValueChange={(value: any) =>
                      setNewStrategy((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arbitrage">Arbitrage</SelectItem>
                      <SelectItem value="liquidation">Liquidation</SelectItem>
                      <SelectItem value="sandwich">Sandwich Attack</SelectItem>
                      <SelectItem value="frontrun">Front Running</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Profit Target (ETH)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newStrategy.profitTarget}
                    onChange={(e) =>
                      setNewStrategy((prev) => ({
                        ...prev,
                        profitTarget: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="bg-black/70 border-cyber-cyan/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gas Limit</label>
                  <Slider
                    value={[newStrategy.gasLimit]}
                    onValueChange={(value) =>
                      setNewStrategy((prev) => ({
                        ...prev,
                        gasLimit: value[0],
                      }))
                    }
                    min={100000}
                    max={1000000}
                    step={10000}
                  />
                  <div className="text-xs text-muted-foreground">
                    {newStrategy.gasLimit.toLocaleString()}
                  </div>
                </div>
                <Button
                  onClick={createStrategy}
                  disabled={!newStrategy.name.trim()}
                  className="w-full btn-primary"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Deploy Strategy
                </Button>
              </CardContent>
            </Card>

            {/* Active Strategies */}
            <Card className="cyber-card-enhanced group">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <Activity className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                  ACTIVE STRATEGIES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {mevStrategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="border border-cyber-cyan/20 rounded-lg p-3 space-y-2 bg-cyber-cyan/5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cyber-cyan">
                            {strategy.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              strategy.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }
                          >
                            {strategy.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <div className="font-mono text-cyber-cyan">
                              {strategy.type}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Profit:
                            </span>
                            <div className="font-mono text-green-400">
                              {strategy.totalProfit.toFixed(3)} ETH
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Success:
                            </span>
                            <div className="font-mono text-blue-400">
                              {strategy.successRate}%
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleStrategy(strategy.id)}
                              className="text-xs"
                            >
                              {strategy.status === "active" ? "Pause" : "Start"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {mevStrategies.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No active strategies. Create your first MEV strategy
                        above.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Defensive Mode Tab - MEVGuardian */}
        <TabsContent value="defense" className="space-y-6 mt-6">
          {/* Guardian Status Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-cyber-cyan animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-cyber-cyan font-mono mb-1">
                  ACTIVE
                </div>
                <div className="text-xs text-cyber-cyan/70 uppercase tracking-wide">
                  Guardian Status
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-red-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-red-400 font-mono mb-1">
                  {Math.floor(Math.random() * 50 + 100)}
                </div>
                <div className="text-xs text-red-400/70 uppercase tracking-wide">
                  Threats Blocked
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-green-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-green-400 font-mono mb-1">
                  ${(Math.random() * 50 + 10).toFixed(1)}K
                </div>
                <div className="text-xs text-green-400/70 uppercase tracking-wide">
                  Saved Today
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-6 h-6 text-yellow-400 animate-cyber-pulse" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 font-mono mb-1">
                  {Math.floor(Math.random() * 10 + 95)}%
                </div>
                <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
                  Protection Rate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Guardian Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Radar */}
            <Card className="cyber-card-enhanced group">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <Search className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                  THREAT RADAR
                </CardTitle>
                <CardDescription>
                  Real-time MEV attack detection & classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {[
                      {
                        type: "Sandwich Attack",
                        risk: 95,
                        target: "0x1234...5678",
                        saved: "$2.1K",
                      },
                      {
                        type: "Flash Loan Exploit",
                        risk: 87,
                        target: "0xabcd...ef01",
                        saved: "$5.7K",
                      },
                      {
                        type: "Oracle Manipulation",
                        risk: 72,
                        target: "0x9876...5432",
                        saved: "$1.3K",
                      },
                      {
                        type: "Liquidation Frontrun",
                        risk: 68,
                        target: "0xdef0...1234",
                        saved: "$890",
                      },
                      {
                        type: "JIT Liquidity Attack",
                        risk: 45,
                        target: "0x5555...6666",
                        saved: "$445",
                      },
                    ].map((threat, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                threat.risk > 80
                                  ? "bg-red-400"
                                  : threat.risk > 60
                                    ? "bg-yellow-400"
                                    : "bg-green-400"
                              } animate-pulse`}
                            ></div>
                            <span className="text-sm font-medium text-cyber-cyan">
                              {threat.type}
                            </span>
                          </div>
                          <div className="text-xs text-cyber-cyan/60 mt-1">
                            Target: {threat.target} • Risk: {threat.risk}%
                          </div>
                        </div>
                        <div className="text-xs text-green-400 font-mono">
                          {threat.saved} SAVED
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Counter-Measures Control Panel */}
            <Card className="cyber-card-enhanced group">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <Shield className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                  COUNTER-MEASURES
                </CardTitle>
                <CardDescription>
                  Active defensive protocols & automated responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "Private Relay Auto-Route",
                    enabled: true,
                    desc: "Redirect high-risk txs through private channels",
                  },
                  {
                    name: "Gas Fuzzer",
                    enabled: true,
                    desc: "Randomize gas to break attacker calculations",
                  },
                  {
                    name: "Counter-Bundle Injection",
                    enabled: false,
                    desc: "Inject grief bundles to neutralize attacks",
                  },
                  {
                    name: "JIT Liquidity Lock",
                    enabled: true,
                    desc: "Temporarily lock LP tokens during volatility",
                  },
                  {
                    name: "Circuit Breaker",
                    enabled: true,
                    desc: "Auto-pause on flash loan or oracle anomalies",
                  },
                ].map((measure, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border border-cyber-cyan/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Switch checked={measure.enabled} />
                        <span className="text-sm font-medium text-cyber-cyan">
                          {measure.name}
                        </span>
                      </div>
                      <div className="text-xs text-cyber-cyan/60 mt-1">
                        {measure.desc}
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${measure.enabled ? "bg-green-400" : "bg-gray-600"}`}
                    ></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Policy Engine & Advanced Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Policy Rules */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 cyber-glow text-sm">
                  <Settings className="w-4 h-4" />
                  POLICY ENGINE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs font-mono bg-black/50 p-3 rounded border border-cyber-cyan/20">
                  <div className="text-cyber-cyan">
                    if (usd_value &gt; 10K &amp;&amp; risk &gt; 30):
                  </div>
                  <div className="text-white ml-2">route: flashbots</div>
                  <div className="text-white ml-2">slippage_max: 0.3%</div>
                </div>
                <div className="text-xs font-mono bg-black/50 p-3 rounded border border-cyber-cyan/20">
                  <div className="text-cyber-cyan">
                    if (flash_loan &gt; 2x TVL):
                  </div>
                  <div className="text-white ml-2">circuit_break: true</div>
                  <div className="text-white ml-2">alert: pagerduty</div>
                </div>
              </CardContent>
            </Card>

            {/* Flash Loan Monitor */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 cyber-glow text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  FLASH LOAN MONITOR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Current Utilization</span>
                    <span className="text-cyber-cyan">23.4%</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-2">
                    <div className="bg-cyber-cyan h-2 rounded-full w-1/4"></div>
                  </div>
                  <div className="text-xs text-cyber-cyan/60">
                    Alert threshold: 80% TVL
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian ROI */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 cyber-glow text-sm">
                  <TrendingUp className="w-4 h-4" />
                  GUARDIAN ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    +{(Math.random() * 50 + 200).toFixed(0)}%
                  </div>
                  <div className="text-xs text-green-400/70">
                    30-day protection value
                  </div>
                  <div className="text-xs text-cyber-cyan/60 mt-1">
                    vs. unprotected portfolio
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
