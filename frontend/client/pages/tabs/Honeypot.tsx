import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Target,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  BookmarkPlus,
  Play,
  Clock,
  Activity,
  Code,
  Brain,
  Beaker,
  Microscope,
  Crosshair,
  Repeat,
  Bell,
  Settings,
  FileText,
  Share2,
  RotateCcw,
  Shield,
  TrendingUp,
  Hash,
  ExternalLink,
  GitBranch,
  Layers,
  Monitor,
  Eye,
} from "lucide-react";

import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Progress as RechartsProgress,
} from "recharts";
import { toast } from "sonner";
import { MOCK_DATA, MOCK_HONEYPOT_ANALYSES } from "@/lib/mock-data";

const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum", icon: "⚡" },
  { id: 56, name: "BSC", icon: "🟡" },
  { id: 137, name: "Polygon", icon: "🟣" },
  { id: 42161, name: "Arbitrum", icon: "🔷" },
];

interface WatchlistItem {
  address: string;
  chain: string;
  addedAt: string;
  lastChecked: string;
  status: "active" | "inactive" | "warning";
  honeypotScore: number;
}

interface ReputationSignal {
  source: string;
  status: "verified" | "warning" | "danger" | "unknown";
  message: string;
  link?: string;
}

interface SimulationStep {
  step: number;
  type: "approval" | "buy" | "sell" | "internal";
  description: string;
  hash?: string;
  gasUsed?: number;
  success: boolean;
  value?: string;
  revertReason?: string;
  internalCalls?: Array<{
    function: string;
    to: string;
    value: string;
    success: boolean;
  }>;
}

interface LiquiditySnapshot {
  reserves: {
    token: string;
    eth: string;
  };
  price: string;
  priceImpact: Array<{
    amount: string;
    expectedOutput: string;
    actualOutput: string;
    slippage: number;
  }>;
  slippageTrap: boolean;
  lastUpdated: string;
}

export default function Honeypot() {
  // Initialize with sample data for immediate demo
  const [contractAddress, setContractAddress] = useState(
    MOCK_DATA.addresses.HONEYPOT_1,
  );
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("static");
  // Start with sample analysis result for demo
  const [analysisResult, setAnalysisResult] = useState<any>(
    MOCK_HONEYPOT_ANALYSES[0],
  );

  // Enhanced state management with sample data
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    {
      address: MOCK_DATA.addresses.HONEYPOT_2,
      chain: "Ethereum",
      addedAt: "2024-01-14T10:30:00Z",
      lastChecked: "2024-01-15T14:45:00Z",
      status: "warning",
      honeypotScore: 87,
    },
    {
      address: MOCK_DATA.addresses.HONEYPOT_3,
      chain: "BSC",
      addedAt: "2024-01-13T15:20:00Z",
      lastChecked: "2024-01-15T14:40:00Z",
      status: "active",
      honeypotScore: 23,
    },
  ]);
  const [reputationSignals, setReputationSignals] = useState<
    ReputationSignal[]
  >([
    {
      source: "RugDoc",
      status: "danger",
      message: "High Risk - Confirmed Honeypot Pattern",
      link: "https://rugdoc.io/project/example",
    },
    {
      source: "Etherscan",
      status: "warning",
      message: "Contract not verified",
      link: `https://etherscan.io/address/${MOCK_DATA.addresses.HONEYPOT_1}`,
    },
    {
      source: "DeBank",
      status: "danger",
      message: "Flagged as suspicious contract",
      link: "https://debank.com/security/example",
    },
  ]);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([
    {
      step: 1,
      type: "approval",
      description: "Token approval granted to DEX router",
      hash: MOCK_DATA.txHashes[0],
      gasUsed: 46000,
      success: true,
      value: "0.1 ETH",
    },
    {
      step: 2,
      type: "buy",
      description: "Purchase tokens from liquidity pool",
      hash: MOCK_DATA.txHashes[1],
      gasUsed: 125000,
      success: true,
      value: "0.1 ETH",
    },
    {
      step: 3,
      type: "sell",
      description: "Attempt to sell 50% of tokens",
      hash: MOCK_DATA.txHashes[2],
      gasUsed: 45000,
      success: false,
      value: "500 tokens",
      revertReason: "Transfer amount exceeds balance",
      internalCalls: [
        {
          function: "transfer",
          to: MOCK_DATA.addresses.UNISWAP_V2_ROUTER.slice(0, 10) + "...",
          value: "500",
          success: false,
        },
      ],
    },
  ]);
  const [liquiditySnapshot, setLiquiditySnapshot] =
    useState<LiquiditySnapshot | null>({
      reserves: {
        token: "500,000",
        eth: "2.4",
      },
      price: "0.0000048 ETH",
      priceImpact: [
        {
          amount: "0.1 ETH",
          expectedOutput: "20,833",
          actualOutput: "20,833",
          slippage: 0.0,
        },
        {
          amount: "1.0 ETH",
          expectedOutput: "208,333",
          actualOutput: "104,166",
          slippage: 50.0,
        },
        {
          amount: "10.0 ETH",
          expectedOutput: "2,083,333",
          actualOutput: "625,000",
          slippage: 70.0,
        },
      ],
      slippageTrap: true,
      lastUpdated: new Date().toISOString(),
    });
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [scanInterval, setScanInterval] = useState([5]); // minutes
  const [alertSettings, setAlertSettings] = useState({
    telegram: false,
    email: false,
    browser: true,
    scoreThreshold: 70,
  });
  const [currentAnalysisStage, setCurrentAnalysisStage] = useState<string>("");

  const runAnalysis = async () => {
    if (!contractAddress.trim()) {
      toast.error("Please enter a contract address");
      return;
    }

    setIsAnalyzing(true);
    setCurrentAnalysisStage("Initializing...");
    toast.success("Starting comprehensive honeypot analysis...");

    const analysisStages = [
      "Initializing analysis environment",
      "Fetching contract bytecode",
      "Running static pattern analysis",
      "Performing bytecode similarity matching",
      "Setting up simulation environment",
      "Executing token approval test",
      "Simulating buy transaction",
      "Simulating sell transaction",
      "Analyzing internal calls",
      "Running ML classification",
      "Testing liquidity pools",
      "Gathering reputation signals",
      "Finalizing results",
    ];

    // Simulate multi-stage analysis
    for (let i = 0; i < analysisStages.length; i++) {
      setCurrentAnalysisStage(analysisStages[i]);
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300),
      );
    }

    // Use realistic mock data - randomly select between high-risk and low-risk profiles
    const mockAnalyses = MOCK_HONEYPOT_ANALYSES;
    const selectedAnalysis =
      Math.random() > 0.3 ? mockAnalyses[0] : mockAnalyses[1]; // 70% chance of high-risk

    // Update with current contract address and timestamp
    const mockResult = {
      ...selectedAnalysis,
      contractAddress: contractAddress,
      lastAnalyzed: new Date().toISOString(),
      analysisTime: 2.1 + Math.random() * 2, // Random analysis time 2-4 seconds
    };

    // Generate realistic simulation steps based on analysis result
    const newSimulationSteps: SimulationStep[] =
      mockResult.methods.dynamic.transactions.map((tx: any) => ({
        step: tx.step,
        type: tx.type as "approval" | "buy" | "sell" | "internal",
        description: tx.description,
        hash: tx.hash,
        gasUsed: tx.gasUsed,
        success: tx.success,
        value: tx.value,
        revertReason: tx.revertReason,
        internalCalls:
          tx.type === "sell" && !tx.success
            ? [
                {
                  function: "transfer",
                  to:
                    MOCK_DATA.addresses.UNISWAP_V2_ROUTER.slice(0, 10) + "...",
                  value: tx.value,
                  success: false,
                },
                {
                  function: "_beforeTokenTransfer",
                  to: MOCK_DATA.addresses.HONEYPOT_1.slice(0, 10) + "...",
                  value: tx.value,
                  success: false,
                },
              ]
            : undefined,
      }));

    // Generate realistic liquidity snapshot
    const pools = mockResult.methods.liquidity.pools;
    const newLiquiditySnapshot: LiquiditySnapshot = {
      reserves: pools[0].reserves,
      price: "0.0000105 ETH",
      priceImpact: [
        {
          amount: "0.1 ETH",
          expectedOutput: "9,523",
          actualOutput: mockResult.honeypotScore > 70 ? "9,523" : "9,523",
          slippage: mockResult.honeypotScore > 70 ? 0.0 : 0.0,
        },
        {
          amount: "1.0 ETH",
          expectedOutput: "90,909",
          actualOutput: mockResult.honeypotScore > 70 ? "45,454" : "85,714",
          slippage: mockResult.honeypotScore > 70 ? 50.0 : 5.7,
        },
        {
          amount: "10.0 ETH",
          expectedOutput: "666,666",
          actualOutput: mockResult.honeypotScore > 70 ? "200,000" : "476,190",
          slippage: mockResult.honeypotScore > 70 ? 70.0 : 28.6,
        },
      ],
      slippageTrap: mockResult.methods.liquidity.slippageTraps,
      lastUpdated: new Date().toISOString(),
    };

    // Generate realistic reputation signals based on risk level
    const newReputationSignals: ReputationSignal[] =
      mockResult.honeypotScore > 70
        ? [
            {
              source: "RugDoc",
              status: "danger",
              message: "High Risk - Confirmed Honeypot Pattern",
              link: "https://rugdoc.io/project/example",
            },
            {
              source: "Etherscan",
              status: "warning",
              message: "Contract not verified",
              link: `https://etherscan.io/address/${contractAddress}`,
            },
            {
              source: "DeBank",
              status: "danger",
              message: "Flagged as suspicious contract",
              link: "https://debank.com/security/example",
            },
            {
              source: "Community Reports",
              status: "danger",
              message: "12 user reports of failed sell transactions",
            },
            {
              source: "DeFiSafety",
              status: "danger",
              message: "Contract blacklisted for honeypot behavior",
            },
          ]
        : [
            {
              source: "RugDoc",
              status: "verified",
              message: "No significant risks detected",
              link: "https://rugdoc.io/project/example",
            },
            {
              source: "Etherscan",
              status: "verified",
              message: "Contract verified and audited",
              link: `https://etherscan.io/address/${contractAddress}`,
            },
            {
              source: "CertiK",
              status: "verified",
              message: "Security audit completed - No major issues",
              link: "https://certik.com/projects/example",
            },
            {
              source: "Community Reports",
              status: "verified",
              message: "Active trading with no reported issues",
            },
          ];

    setAnalysisResult(mockResult);
    setSimulationSteps(newSimulationSteps);
    setLiquiditySnapshot(newLiquiditySnapshot);
    setReputationSignals(newReputationSignals);
    setIsAnalyzing(false);
    setCurrentAnalysisStage("");
    toast.success("Comprehensive analysis completed!");
  };

  // Utility functions
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      case "safe":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-blue-500";
    return "text-green-500";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "destructive";
    if (score >= 60) return "secondary";
    return "default";
  };

  const getRiskIcon = (score: number) => {
    if (score >= 80) return "🛑";
    if (score >= 60) return "⚠️";
    if (score >= 40) return "🟡";
    return "🟢";
  };

  // Watchlist management
  const addToWatchlist = () => {
    if (!contractAddress.trim() || !analysisResult) return;

    const newItem: WatchlistItem = {
      address: contractAddress,
      chain: selectedChain.name,
      addedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      status: analysisResult.honeypotScore >= 70 ? "warning" : "active",
      honeypotScore: analysisResult.honeypotScore,
    };

    setWatchlist((prev) => [newItem, ...prev.slice(0, 4)]); // Keep only 5 items
    toast.success("Added to watchlist");
  };

  const exportResults = () => {
    if (!analysisResult) return;

    const exportData = {
      address: contractAddress,
      chain: selectedChain.name,
      timestamp: new Date().toISOString(),
      analysis: analysisResult,
      reputation: reputationSignals,
      simulation: simulationSteps,
      liquidity: liquiditySnapshot,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `honeypot-analysis-${contractAddress.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported successfully");
  };

  const replaySimulation = (stepIndex: number) => {
    const step = simulationSteps[stepIndex];
    toast.info(`Replaying ${step.type} step: ${step.description}`);
    // In a real implementation, this would replay the transaction
  };

  // Auto-scan effect
  useEffect(() => {
    if (!autoScanEnabled || !contractAddress.trim()) return;

    const interval = setInterval(
      () => {
        toast.info("Auto-rescanning contract...");
        runAnalysis();
      },
      scanInterval[0] * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [autoScanEnabled, scanInterval, contractAddress]);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="cyber-card-enhanced">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <Label className="text-cyber-cyan">Contract Address</Label>
              <Input
                placeholder="0x... or contract.eth"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                disabled={isAnalyzing}
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
              />
            </div>

            <div className="lg:col-span-2">
              <Label className="text-cyber-cyan">Chain</Label>
              <Select
                value={selectedChain.id.toString()}
                onValueChange={(value) => {
                  const chain = SUPPORTED_CHAINS.find(
                    (c) => c.id.toString() === value,
                  );
                  if (chain) setSelectedChain(chain);
                }}
              >
                <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-cyber-cyan/30">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem
                      key={chain.id}
                      value={chain.id.toString()}
                      className="text-cyber-cyan"
                    >
                      <span className="flex items-center gap-2">
                        <span>{chain.icon}</span>
                        {chain.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-cyber-cyan">Auto-Scan</Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  checked={autoScanEnabled}
                  onCheckedChange={setAutoScanEnabled}
                  disabled={isAnalyzing}
                />
                <span className="text-xs text-cyber-cyan/60">
                  {scanInterval[0]}m
                </span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-cyber-cyan">&nbsp;</Label>
              <Button
                onClick={runAnalysis}
                disabled={!contractAddress.trim() || isAnalyzing}
                className="w-full btn-primary"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>

          {/* Advanced Settings Row */}
          <div className="mt-4 pt-4 border-t border-cyber-cyan/20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-cyber-cyan text-xs">
                  Scan Interval (min)
                </Label>
                <Slider
                  value={scanInterval}
                  onValueChange={setScanInterval}
                  max={60}
                  min={1}
                  step={1}
                  className="mt-1"
                  disabled={isAnalyzing}
                />
              </div>
              <div>
                <Label className="text-cyber-cyan text-xs">
                  Alert Threshold
                </Label>
                <Slider
                  value={[alertSettings.scoreThreshold]}
                  onValueChange={([value]) =>
                    setAlertSettings((prev) => ({
                      ...prev,
                      scoreThreshold: value,
                    }))
                  }
                  max={100}
                  min={1}
                  step={5}
                  className="mt-1"
                  disabled={isAnalyzing}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm" className="cyber-border">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button variant="outline" size="sm" className="cyber-border">
                  <FileText className="h-4 w-4 mr-2" />
                  API Docs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="cyber-card-enhanced">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyber-cyan" />
              </div>
              <div className="text-cyber-cyan">
                {currentAnalysisStage ||
                  "Running comprehensive honeypot analysis..."}
              </div>
              <div className="text-sm text-cyber-cyan/60">
                This may take a few seconds
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Enhanced Quick Summary Card */}
          <Card className="cyber-card-enhanced border-2 border-cyber-cyan/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <Badge variant="outline" className="cyber-border text-xs">
                {getRiskIcon(analysisResult.honeypotScore)}{" "}
                {analysisResult.riskLevel.toUpperCase()}
              </Badge>
            </div>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="relative mb-3 mx-auto w-20 h-20">
                    <svg className="w-20 h-20" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="rgba(0,255,255,0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={
                          analysisResult.honeypotScore >= 70
                            ? "#ef4444"
                            : "#10b981"
                        }
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${analysisResult.honeypotScore * 2.51} ${251 - analysisResult.honeypotScore * 2.51}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                        className="animate-cyber-pulse"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div
                        className={`text-xl font-bold ${getScoreColor(analysisResult.honeypotScore)}`}
                      >
                        {analysisResult.honeypotScore}
                      </div>
                      <div className="text-xs text-cyber-cyan/60">/100</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold cyber-glow">
                      🛑 Honeypot Score
                    </div>
                    <Badge
                      variant={getScoreBadgeVariant(
                        analysisResult.honeypotScore,
                      )}
                    >
                      {analysisResult.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <Crosshair className="h-6 w-6 text-red-400 mx-auto" />
                  </div>
                  <div className="text-xs font-semibold text-cyber-cyan">
                    🔍 Primary Trigger
                  </div>
                  <div className="text-xs text-red-400 font-mono leading-tight">
                    {analysisResult.primaryTrigger}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <Clock className="h-6 w-6 text-green-400 mx-auto" />
                  </div>
                  <div className="text-xs font-semibold text-cyber-cyan">
                    ⏱️ Analysis Time
                  </div>
                  <div className="text-xs text-green-400 font-mono">
                    {analysisResult.analysisTime}s
                  </div>
                  <div className="text-xs text-cyber-cyan/60">
                    {new Date(analysisResult.lastAnalyzed).toLocaleTimeString()}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="p-3 bg-cyber-cyan/10 rounded-lg border border-cyber-cyan/30">
                    <Activity className="h-6 w-6 text-cyber-cyan mx-auto" />
                  </div>
                  <div className="text-xs font-semibold text-cyber-cyan">
                    📊 Detection Methods
                  </div>
                  <div className="flex justify-center gap-1 mt-1">
                    {[
                      {
                        label: "S",
                        score: analysisResult.methods.static.score,
                      },
                      {
                        label: "B",
                        score: analysisResult.methods.bytecode.score,
                      },
                      {
                        label: "D",
                        score: analysisResult.methods.dynamic.score,
                      },
                      { label: "M", score: analysisResult.methods.ml.score },
                      {
                        label: "L",
                        score: analysisResult.methods.liquidity.score,
                      },
                    ].map((method, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                          method.score >= 70
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                        title={`${method.label}: ${method.score}/100`}
                      >
                        {method.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <Shield className="h-6 w-6 text-purple-400 mx-auto" />
                  </div>
                  <div className="text-xs font-semibold text-cyber-cyan">
                    🏷️ Reputation
                  </div>
                  <div className="space-y-1">
                    {reputationSignals.slice(0, 2).map((signal, i) => (
                      <div
                        key={i}
                        className={`text-xs ${
                          signal.status === "danger"
                            ? "text-red-400"
                            : signal.status === "warning"
                              ? "text-yellow-400"
                              : "text-green-400"
                        }`}
                      >
                        {signal.source}:{" "}
                        {signal.status === "danger"
                          ? "🚫"
                          : signal.status === "warning"
                            ? "⚠️"
                            : "✅"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Detection Method Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 bg-black/50 border border-cyber-cyan/30 h-12">
              <TabsTrigger
                value="static"
                className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan flex-col gap-1 h-full"
              >
                <Microscope className="h-4 w-4" />
                <span className="text-xs">Static Pattern</span>
                <Badge variant="outline" className="text-xs px-1">
                  {analysisResult.methods.static.score}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="bytecode"
                className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan flex-col gap-1 h-full"
              >
                <Code className="h-4 w-4" />
                <span className="text-xs">Bytecode Similarity</span>
                <Badge variant="outline" className="text-xs px-1">
                  {analysisResult.methods.bytecode.score}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="dynamic"
                className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan flex-col gap-1 h-full"
              >
                <Play className="h-4 w-4" />
                <span className="text-xs">Dynamic Simulation</span>
                <Badge variant="outline" className="text-xs px-1">
                  {analysisResult.methods.dynamic.score}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="ml"
                className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan flex-col gap-1 h-full"
              >
                <Brain className="h-4 w-4" />
                <span className="text-xs">ML Classifier</span>
                <Badge variant="outline" className="text-xs px-1">
                  {analysisResult.methods.ml.score}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="liquidity"
                className="data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan flex-col gap-1 h-full"
              >
                <Beaker className="h-4 w-4" />
                <span className="text-xs">Liquidity Sandpit</span>
                <Badge variant="outline" className="text-xs px-1">
                  {analysisResult.methods.liquidity.score}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Static Analysis Tab */}
            <TabsContent value="static" className="space-y-4">
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow flex items-center gap-2">
                    <Microscope className="h-5 w-5" />
                    Static Pattern Analysis
                  </CardTitle>
                  <CardDescription>
                    Contract source code pattern detection • Score:{" "}
                    <span
                      className={`font-bold ${getScoreColor(analysisResult.methods.static.score)}`}
                    >
                      {analysisResult.methods.static.score}/100
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.methods.static.patterns.map(
                      (pattern: any, i: number) => (
                        <div
                          key={i}
                          className={`border rounded-lg p-4 ${pattern.found ? "border-red-500/30 bg-red-500/5" : "border-green-500/30 bg-green-500/5"}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-cyber-cyan">
                                {pattern.name}
                              </span>
                              {pattern.found ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  pattern.severity === "critical"
                                    ? "destructive"
                                    : pattern.severity === "high"
                                      ? "destructive"
                                      : pattern.severity === "medium"
                                        ? "secondary"
                                        : "default"
                                }
                              >
                                {pattern.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-cyber-cyan/80 mb-2">
                            {pattern.description}
                          </div>
                          {pattern.bytecodeLocation && (
                            <div className="flex items-center gap-2 text-xs">
                              <Layers className="h-3 w-3 text-cyber-cyan/60" />
                              <span className="text-cyber-cyan/60">
                                Location:
                              </span>
                              <code className="bg-black/50 px-2 py-1 rounded text-cyber-cyan font-mono">
                                {pattern.bytecodeLocation}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Code
                              </Button>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Pattern Summary Chart */}
                  <div className="mt-6 pt-4 border-t border-cyber-cyan/20">
                    <div className="text-sm text-cyber-cyan mb-3">
                      Pattern Detection Summary
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-red-500/10 rounded p-3 border border-red-500/30">
                        <div className="text-lg font-bold text-red-400">
                          {
                            analysisResult.methods.static.patterns.filter(
                              (p: any) => p.found && p.severity === "critical",
                            ).length
                          }
                        </div>
                        <div className="text-xs text-red-400/60">
                          Critical Issues
                        </div>
                      </div>
                      <div className="bg-yellow-500/10 rounded p-3 border border-yellow-500/30">
                        <div className="text-lg font-bold text-yellow-400">
                          {
                            analysisResult.methods.static.patterns.filter(
                              (p: any) => p.found && p.severity === "medium",
                            ).length
                          }
                        </div>
                        <div className="text-xs text-yellow-400/60">
                          Medium Issues
                        </div>
                      </div>
                      <div className="bg-green-500/10 rounded p-3 border border-green-500/30">
                        <div className="text-lg font-bold text-green-400">
                          {
                            analysisResult.methods.static.patterns.filter(
                              (p: any) => !p.found,
                            ).length
                          }
                        </div>
                        <div className="text-xs text-green-400/60">
                          Passed Checks
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs would be implemented similarly... */}
            <TabsContent value="bytecode" className="space-y-4">
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Bytecode Analysis
                  </CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="dynamic" className="space-y-4">
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Dynamic Simulation
                  </CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="ml" className="space-y-4">
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    ML Classification
                  </CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="liquidity" className="space-y-4">
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Liquidity Analysis
                  </CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Enhanced Action Buttons & Watchlist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Buttons */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="cyber-glow text-lg">
                  Actions & Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={addToWatchlist} className="btn-secondary">
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </Button>
                  <Button onClick={exportResults} className="btn-primary">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button variant="outline" className="cyber-border">
                    <Bell className="h-4 w-4 mr-2" />
                    Setup Alerts
                  </Button>
                  <Button variant="outline" className="cyber-border">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Report
                  </Button>
                </div>

                {/* API Integration */}
                <div className="mt-4 pt-4 border-t border-cyber-cyan/20">
                  <div className="text-sm text-cyber-cyan mb-2">
                    API Integration
                  </div>
                  <div className="bg-black/50 rounded p-3 font-mono text-xs">
                    <div className="text-green-400 mb-1">
                      // Honeypot Detection API
                    </div>
                    <div className="text-cyber-cyan space-y-1">
                      <div>curl -X POST /api/honeypot-detect \</div>
                      <div className="ml-4">
                        -H "Content-Type: application/json" \
                      </div>
                      <div className="ml-4">
                        -d {`'{"address": "${contractAddress}"}'`}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="mt-2 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    View Full API Docs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Watchlist */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="cyber-glow text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Watchlist & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {watchlist.length > 0 ? (
                  <div className="space-y-2">
                    {watchlist.map((item, i) => (
                      <div
                        key={i}
                        className="border border-cyber-cyan/30 rounded p-3 bg-cyber-cyan/5"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-xs text-cyber-cyan font-mono">
                            {item.address.slice(0, 12)}...
                          </code>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                item.status === "warning"
                                  ? "destructive"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {item.honeypotScore}
                            </Badge>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.status === "warning"
                                  ? "bg-red-500"
                                  : item.status === "active"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                              }`}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-cyber-cyan/60">
                          {item.chain} • Added{" "}
                          {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-cyber-cyan/60">
                          Last checked:{" "}
                          {new Date(item.lastChecked).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-cyber-cyan/60">
                    <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No contracts in watchlist</div>
                    <div className="text-xs">
                      Add contracts to monitor them automatically
                    </div>
                  </div>
                )}

                {/* Alert Settings */}
                <div className="mt-4 pt-4 border-t border-cyber-cyan/20">
                  <div className="text-sm text-cyber-cyan mb-3">
                    Alert Settings
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cyber-cyan/80">
                        Browser Notifications
                      </span>
                      <Switch
                        checked={alertSettings.browser}
                        onCheckedChange={(checked) =>
                          setAlertSettings((prev) => ({
                            ...prev,
                            browser: checked,
                          }))
                        }
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cyber-cyan/80">
                        Email Alerts
                      </span>
                      <Switch
                        checked={alertSettings.email}
                        onCheckedChange={(checked) =>
                          setAlertSettings((prev) => ({
                            ...prev,
                            email: checked,
                          }))
                        }
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cyber-cyan/80">
                        Telegram Bot
                      </span>
                      <Switch
                        checked={alertSettings.telegram}
                        onCheckedChange={(checked) =>
                          setAlertSettings((prev) => ({
                            ...prev,
                            telegram: checked,
                          }))
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
