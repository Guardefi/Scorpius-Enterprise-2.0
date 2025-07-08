import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Play,
  Pause,
  Clock,
  FileText,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Settings,
  Terminal,
  TrendingUp,
  Database,
  Timer,
  BarChart3,
} from "lucide-react";

interface QueuedSimulation {
  id: string;
  type:
    | "flash-loan"
    | "oracle-manip"
    | "reentrancy"
    | "governance"
    | "bridge"
    | "custom";
  contractAddress: string;
  blockNumber: string;
  txHash?: string;
  scriptName: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "queued" | "running" | "completed" | "failed" | "paused";
  estimatedTime: number;
  progress: number;
  queuePosition: number;
  submittedAt: Date;
}

interface SimulationStats {
  totalRuns: number;
  averageRunTime: number;
  successRate: number;
  queueLength: number;
  activeRunners: number;
  totalGasUsed: string;
}

interface ExploitScript {
  id: string;
  name: string;
  description: string;
  type:
    | "flash-loan"
    | "oracle-manip"
    | "reentrancy"
    | "governance"
    | "bridge"
    | "custom";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  author: string;
  parameters: string[];
}

export function SimulationEngineDashboard() {
  const [stats, setStats] = useState<SimulationStats>({
    totalRuns: 247,
    averageRunTime: 3.7,
    successRate: 78.2,
    queueLength: 8,
    activeRunners: 3,
    totalGasUsed: "156.7M",
  });

  const [queue, setQueue] = useState<QueuedSimulation[]>([
    {
      id: "sim_001",
      type: "flash-loan",
      contractAddress: "0x1234567890123456789012345678901234567890",
      blockNumber: "18450123",
      txHash: "0xabcd...ef01",
      scriptName: "FlashLoan_AAVE_Exploit.js",
      priority: "high",
      status: "running",
      estimatedTime: 420,
      progress: 67,
      queuePosition: 0,
      submittedAt: new Date(Date.now() - 300000),
    },
    {
      id: "sim_002",
      type: "oracle-manip",
      contractAddress: "0x9876543210987654321098765432109876543210",
      blockNumber: "18450089",
      scriptName: "Oracle_Price_Manipulation.py",
      priority: "critical",
      status: "queued",
      estimatedTime: 680,
      progress: 0,
      queuePosition: 1,
      submittedAt: new Date(Date.now() - 120000),
    },
    {
      id: "sim_003",
      type: "reentrancy",
      contractAddress: "0xfedcba0987654321fedcba0987654321fedcba09",
      blockNumber: "18450234",
      scriptName: "Classic_Reentrancy_Attack.sol",
      priority: "medium",
      status: "queued",
      estimatedTime: 180,
      progress: 0,
      queuePosition: 2,
      submittedAt: new Date(Date.now() - 60000),
    },
  ]);

  const [latestResults, setLatestResults] = useState([
    {
      id: "res_001",
      type: "flash-loan",
      contract: "0x1234...7890",
      status: "Pass",
      exploitValue: 2.47,
      gasUsed: "890,432",
      completedAt: new Date(Date.now() - 300000),
      logFile: "flashloan_001_detailed.log",
    },
    {
      id: "res_002",
      type: "governance",
      contract: "0x9876...3210",
      status: "Fail",
      exploitValue: 0,
      gasUsed: "234,567",
      completedAt: new Date(Date.now() - 600000),
      logFile: "governance_002_detailed.log",
      error: "Insufficient governance tokens",
    },
    {
      id: "res_003",
      type: "oracle-manip",
      contract: "0xabcd...ef01",
      status: "Exception",
      exploitValue: 0,
      gasUsed: "156,789",
      completedAt: new Date(Date.now() - 900000),
      logFile: "oracle_003_detailed.log",
      error: "Oracle price feed timeout",
    },
  ]);

  const [exploitScripts] = useState<ExploitScript[]>([
    {
      id: "flash_aave",
      name: "AAVE Flash Loan Exploit",
      description:
        "Exploits flash loan functionality to manipulate DeFi protocols",
      type: "flash-loan",
      difficulty: "intermediate",
      author: "SecurityTeam",
      parameters: ["loanAmount", "targetContract", "manipulationPath"],
    },
    {
      id: "oracle_chainlink",
      name: "Chainlink Oracle Manipulation",
      description:
        "Attempts to manipulate Chainlink price feeds through large trades",
      type: "oracle-manip",
      difficulty: "expert",
      author: "ResearchTeam",
      parameters: ["priceDeviation", "liquidityThreshold", "timeWindow"],
    },
    {
      id: "reentrancy_classic",
      name: "Classic Reentrancy Attack",
      description: "Traditional reentrancy attack against vulnerable contracts",
      type: "reentrancy",
      difficulty: "beginner",
      author: "EducationTeam",
      parameters: ["entryFunction", "recursionDepth", "drainAmount"],
    },
    {
      id: "governance_flash",
      name: "Flash Loan Governance Attack",
      description: "Uses flash loans to gain temporary governance control",
      type: "governance",
      difficulty: "advanced",
      author: "SecurityTeam",
      parameters: ["tokenAmount", "proposalType", "executionDelay"],
    },
  ]);

  const [newSimulation, setNewSimulation] = useState({
    contractAddress: "",
    blockNumber: "latest",
    txHash: "",
    selectedScript: "",
    priority: "medium" as const,
    customParameters: "",
  });

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Update running simulations progress
      setQueue((prevQueue) =>
        prevQueue.map((sim) => {
          if (sim.status === "running") {
            const newProgress = Math.min(100, sim.progress + Math.random() * 5);
            if (newProgress >= 100) {
              // Simulation completed
              const newResult = {
                id: `res_${Date.now()}`,
                type: sim.type,
                contract: sim.contractAddress.slice(0, 10),
                status:
                  Math.random() > 0.3
                    ? "Pass"
                    : Math.random() > 0.5
                      ? "Fail"
                      : "Exception",
                exploitValue: Math.random() * 5,
                gasUsed: `${Math.floor(Math.random() * 900000 + 100000).toLocaleString()}`,
                completedAt: new Date(),
                logFile: `${sim.scriptName.replace(/\.[^/.]+$/, "")}_${Date.now()}.log`,
              };

              setLatestResults((prev) => [newResult, ...prev.slice(0, 4)]);

              return {
                ...sim,
                status: "completed" as const,
                progress: 100,
              };
            }
            return { ...sim, progress: newProgress };
          }
          return sim;
        }),
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        averageRunTime: prev.averageRunTime + (Math.random() - 0.5) * 0.1,
        queueLength: Math.max(
          0,
          prev.queueLength + Math.floor(Math.random() * 3) - 1,
        ),
        activeRunners: Math.max(
          0,
          Math.min(5, prev.activeRunners + Math.floor(Math.random() * 3) - 1),
        ),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const launchSimulation = () => {
    if (!newSimulation.contractAddress || !newSimulation.selectedScript) {
      return;
    }

    const script = exploitScripts.find(
      (s) => s.id === newSimulation.selectedScript,
    );
    if (!script) return;

    const simulation: QueuedSimulation = {
      id: `sim_${Date.now()}`,
      type: script.type,
      contractAddress: newSimulation.contractAddress,
      blockNumber: newSimulation.blockNumber,
      txHash: newSimulation.txHash || undefined,
      scriptName: script.name,
      priority: newSimulation.priority,
      status: "queued",
      estimatedTime: Math.floor(Math.random() * 600) + 120,
      progress: 0,
      queuePosition: queue.length,
      submittedAt: new Date(),
    };

    setQueue((prev) => [...prev, simulation]);
    setNewSimulation({
      contractAddress: "",
      blockNumber: "latest",
      txHash: "",
      selectedScript: "",
      priority: "medium",
      customParameters: "",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pass":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "Fail":
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "Exception":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case "queued":
        return <Clock className="w-4 h-4 text-cyber-cyan/60" />;
      case "paused":
        return <Pause className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pass":
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "Fail":
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "Exception":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "running":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "queued":
        return "bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const viewLog = (logFile: string) => {
    console.log(`Opening log file: ${logFile}`);
    // In a real implementation, this would open the log viewer
  };

  return (
    <div className="space-y-6">
      {/* Engine Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="text-center cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400 font-mono">
              {stats.totalRuns}
            </div>
            <div className="text-xs text-green-400/70 uppercase tracking-wide">
              Total Runs
            </div>
          </CardContent>
        </Card>

        <Card className="text-center cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Timer className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400 font-mono">
              {stats.averageRunTime.toFixed(1)}m
            </div>
            <div className="text-xs text-blue-400/70 uppercase tracking-wide">
              Avg Runtime
            </div>
          </CardContent>
        </Card>

        <Card className="text-center cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">
              {stats.successRate.toFixed(1)}%
            </div>
            <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
              Success Rate
            </div>
          </CardContent>
        </Card>

        <Card className="text-center cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {stats.queueLength}
            </div>
            <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
              Queue Length
            </div>
          </CardContent>
        </Card>

        <Card className="text-center cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400 font-mono">
              {stats.activeRunners}
            </div>
            <div className="text-xs text-purple-400/70 uppercase tracking-wide">
              Active Runners
            </div>
          </CardContent>
        </Card>

        <Card className="text-center cyber-card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Database className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400 font-mono">
              {stats.totalGasUsed}
            </div>
            <div className="text-xs text-orange-400/70 uppercase tracking-wide">
              Total Gas
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Launch Simulation Form */}
        <Card className="cyber-card-enhanced lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Play className="w-5 h-5 text-cyber-cyan" />
              LAUNCH SIMULATION
            </CardTitle>
            <CardDescription>
              Configure and queue a new fork simulation with exploit scripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-black/50">
                <TabsTrigger
                  value="basic"
                  className="font-mono text-xs data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan"
                >
                  Basic Setup
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="font-mono text-xs data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan"
                >
                  Advanced Config
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-cyber-cyan">Target Contract</Label>
                    <Input
                      placeholder="0x..."
                      value={newSimulation.contractAddress}
                      onChange={(e) =>
                        setNewSimulation((prev) => ({
                          ...prev,
                          contractAddress: e.target.value,
                        }))
                      }
                      className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cyber-cyan">Block Number</Label>
                    <Input
                      placeholder="latest"
                      value={newSimulation.blockNumber}
                      onChange={(e) =>
                        setNewSimulation((prev) => ({
                          ...prev,
                          blockNumber: e.target.value,
                        }))
                      }
                      className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cyber-cyan">Exploit Script</Label>
                    <Select
                      value={newSimulation.selectedScript}
                      onValueChange={(value) =>
                        setNewSimulation((prev) => ({
                          ...prev,
                          selectedScript: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:ring-cyber-cyan/20">
                        <SelectValue placeholder="Select exploit script" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-cyber-cyan/30">
                        {exploitScripts.map((script) => (
                          <SelectItem key={script.id} value={script.id}>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getPriorityColor(script.difficulty)}
                              >
                                {script.difficulty}
                              </Badge>
                              <span>{script.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cyber-cyan">Priority</Label>
                    <Select
                      value={newSimulation.priority}
                      onValueChange={(value: any) =>
                        setNewSimulation((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:ring-cyber-cyan/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-cyber-cyan/30">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-cyber-cyan">
                    Transaction Hash (Optional)
                  </Label>
                  <Input
                    placeholder="0x... (for replay analysis)"
                    value={newSimulation.txHash}
                    onChange={(e) =>
                      setNewSimulation((prev) => ({
                        ...prev,
                        txHash: e.target.value,
                      }))
                    }
                    className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-cyber-cyan">Custom Parameters</Label>
                  <Textarea
                    placeholder="JSON parameters for custom exploit configuration..."
                    value={newSimulation.customParameters}
                    onChange={(e) =>
                      setNewSimulation((prev) => ({
                        ...prev,
                        customParameters: e.target.value,
                      }))
                    }
                    className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 min-h-20"
                  />
                </div>

                {newSimulation.selectedScript && (
                  <div className="space-y-2">
                    <Label className="text-cyber-cyan">Script Parameters</Label>
                    <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
                      {exploitScripts
                        .find((s) => s.id === newSimulation.selectedScript)
                        ?.parameters.map((param) => (
                          <div
                            key={param}
                            className="text-sm text-cyber-cyan/80"
                          >
                            • {param}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4">
              <Button
                onClick={launchSimulation}
                disabled={
                  !newSimulation.contractAddress ||
                  !newSimulation.selectedScript
                }
                className="btn-primary font-mono uppercase tracking-wide"
              >
                <Zap className="w-4 h-4 mr-2" />
                Queue Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Latest Results */}
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Activity className="w-5 h-5 text-cyber-cyan" />
              LATEST RESULTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {latestResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewLog(result.logFile)}
                        className="text-cyber-cyan hover:bg-cyber-cyan/10 p-1 h-6"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Log
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-cyber-cyan">
                        {result.type.charAt(0).toUpperCase() +
                          result.type.slice(1)}
                      </div>
                      <div className="text-xs text-cyber-cyan/60 font-mono">
                        {result.contract}
                      </div>
                      <div className="text-xs text-cyber-cyan/60">
                        {result.completedAt.toLocaleTimeString()}
                      </div>
                    </div>

                    {result.status === "Pass" && (
                      <div className="flex justify-between text-xs">
                        <span className="text-green-400">
                          ${result.exploitValue.toFixed(2)}K exploited
                        </span>
                        <span className="text-cyber-cyan/60">
                          {result.gasUsed} gas
                        </span>
                      </div>
                    )}

                    {result.error && (
                      <div className="text-xs text-red-400 p-2 bg-red-500/10 rounded border border-red-500/20">
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Queue */}
      <Card className="cyber-card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-glow">
            <Terminal className="w-5 h-5 text-cyber-cyan" />
            SIMULATION QUEUE
          </CardTitle>
          <CardDescription>
            Real-time status of queued and running fork simulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queue.map((sim) => (
              <div
                key={sim.id}
                className="p-4 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(sim.priority)}>
                        {sim.priority.toUpperCase()}
                      </Badge>
                      <div className="text-sm font-medium text-cyber-cyan">
                        {sim.scriptName}
                      </div>
                      {getStatusIcon(sim.status)}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-cyber-cyan/60 font-mono">
                        Contract: {sim.contractAddress.slice(0, 20)}...
                      </div>
                      <div className="text-xs text-cyber-cyan/60">
                        Block: {sim.blockNumber} • Est. Time:{" "}
                        {Math.floor(sim.estimatedTime / 60)}m{" "}
                        {sim.estimatedTime % 60}s
                      </div>
                      <div className="text-xs text-cyber-cyan/60">
                        Submitted: {sim.submittedAt.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {sim.status === "queued" && (
                      <div className="text-sm font-mono text-yellow-400">
                        Position #{sim.queuePosition + 1}
                      </div>
                    )}
                    {sim.status === "running" && (
                      <div className="text-sm font-mono text-blue-400">
                        Running...
                      </div>
                    )}
                  </div>
                </div>

                {sim.status === "running" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-cyber-cyan/60">Progress</span>
                      <span className="text-cyber-cyan">
                        {Math.round(sim.progress)}%
                      </span>
                    </div>
                    <Progress value={sim.progress} className="h-2" />
                  </div>
                )}

                {sim.txHash && (
                  <div className="text-xs text-cyber-cyan/60">
                    <span className="text-cyber-cyan/80">Replaying TX:</span>{" "}
                    {sim.txHash.slice(0, 20)}...
                  </div>
                )}
              </div>
            ))}

            {queue.length === 0 && (
              <div className="text-center py-8 text-cyber-cyan/60">
                No simulations in queue. Launch a new simulation above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
