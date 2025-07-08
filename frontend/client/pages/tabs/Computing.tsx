import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  Server,
  RefreshCw,
  Play,
  Pause,
  Square,
  ArrowUp,
  Settings,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import {
  EnhancedAreaChart,
  EnhancedLineChart,
} from "@/components/ui/enhanced-charts";

const Computing = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clusterMetrics = [
    { label: "Total Nodes", value: "127", change: "+3", period: "today" },
    { label: "Active Jobs", value: "45", change: "+12", period: "running" },
    { label: "CPU Utilization", value: "73%", change: "+5%", period: "avg" },
    { label: "Memory Usage", value: "68%", change: "-2%", period: "avg" },
  ];

  const resourceMetrics = [
    { name: "CPU Utilization", value: 73, target: 80, color: "blue" },
    { name: "Memory Usage", value: 68, target: 85, color: "green" },
    { name: "Network I/O", value: 45, target: 70, color: "purple" },
    { name: "Storage Usage", value: 34, target: 90, color: "amber" },
  ];

  const jobQueue = [
    {
      id: "JOB-001",
      type: "ML Training",
      priority: "high",
      progress: 85,
      eta: "2h 15m",
      resources: "32 cores, 128GB RAM",
    },
    {
      id: "JOB-002",
      type: "Data Processing",
      priority: "medium",
      progress: 45,
      eta: "4h 30m",
      resources: "16 cores, 64GB RAM",
    },
    {
      id: "JOB-003",
      type: "Security Scan",
      priority: "high",
      progress: 12,
      eta: "1h 45m",
      resources: "8 cores, 32GB RAM",
    },
    {
      id: "JOB-004",
      type: "Blockchain Analysis",
      priority: "low",
      progress: 0,
      eta: "6h 20m",
      resources: "24 cores, 96GB RAM",
    },
  ];

  const clusterNodes = [
    {
      id: "node-001",
      status: "active",
      cpu: 85,
      memory: 72,
      jobs: 12,
      rack: 1,
      slot: 1,
    },
    {
      id: "node-002",
      status: "maintenance",
      cpu: 0,
      memory: 0,
      jobs: 0,
      rack: 1,
      slot: 2,
    },
    {
      id: "node-003",
      status: "active",
      cpu: 67,
      memory: 58,
      jobs: 8,
      rack: 1,
      slot: 3,
    },
    {
      id: "node-004",
      status: "active",
      cpu: 91,
      memory: 83,
      jobs: 15,
      rack: 2,
      slot: 1,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
      case "maintenance":
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
      case "error":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <PageLayout variant="computing">
      {/* Cluster Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {clusterMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {metric.period}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Main Computing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Cluster Visualization */}
        <Card className="lg:col-span-2 lg:row-span-2 cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 cyber-glow">
              <Server className="h-5 w-5 text-cyber-cyan" />
              <span>COMPUTING CLUSTER OVERVIEW</span>
            </CardTitle>
            <CardDescription className="text-cyber-cyan/60 font-mono">
              Real-time cluster node monitoring and job distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Cluster Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Rack 1 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-cyber-cyan font-mono text-sm font-semibold">
                      RACK 01
                    </h3>
                    <div className="text-xs text-cyber-cyan/60 font-mono">
                      {clusterNodes.filter((n) => n.rack === 1).length} nodes
                    </div>
                  </div>
                  <div className="space-y-2">
                    {clusterNodes
                      .filter((node) => node.rack === 1)
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`relative p-3 rounded-lg border transition-all duration-300 hover:scale-[1.002] ${
                            node.status === "active"
                              ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                              : node.status === "maintenance"
                                ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
                                : "bg-cyber-cyan/10 border-cyber-cyan/30 hover:border-cyber-cyan/50"
                          }`}
                        >
                          {/* Scanning effect */}
                          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-cyber-scan"></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  node.status === "active"
                                    ? "bg-emerald-500 animate-pulse"
                                    : node.status === "maintenance"
                                      ? "bg-amber-500"
                                      : "bg-cyber-cyan"
                                }`}
                              ></div>
                              <span className="font-mono text-sm text-cyber-cyan">
                                {node.id}
                              </span>
                            </div>
                            <div className="text-xs text-cyber-cyan/60 font-mono">
                              {node.jobs} jobs
                            </div>
                          </div>

                          <div className="mt-2 space-y-1">
                            {/* CPU Usage */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-cyber-cyan/70 font-mono">
                                CPU
                              </span>
                              <span className="text-cyber-cyan font-mono">
                                {node.cpu}%
                              </span>
                            </div>
                            <div className="h-1 bg-black rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${
                                  node.cpu > 80
                                    ? "bg-red-400"
                                    : node.cpu > 60
                                      ? "bg-amber-400"
                                      : "bg-emerald-400"
                                }`}
                                style={{ width: `${node.cpu}%` }}
                              />
                            </div>

                            {/* Memory Usage */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-cyber-cyan/70 font-mono">
                                MEM
                              </span>
                              <span className="text-cyber-cyan font-mono">
                                {node.memory}%
                              </span>
                            </div>
                            <div className="h-1 bg-black rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${
                                  node.memory > 80
                                    ? "bg-red-400"
                                    : node.memory > 60
                                      ? "bg-amber-400"
                                      : "bg-cyber-cyan"
                                }`}
                                style={{ width: `${node.memory}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Rack 2 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-cyber-cyan font-mono text-sm font-semibold">
                      RACK 02
                    </h3>
                    <div className="text-xs text-cyber-cyan/60 font-mono">
                      {clusterNodes.filter((n) => n.rack === 2).length} nodes
                    </div>
                  </div>
                  <div className="space-y-2">
                    {clusterNodes
                      .filter((node) => node.rack === 2)
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`relative p-3 rounded-lg border transition-all duration-300 hover:scale-[1.002] ${
                            node.status === "active"
                              ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                              : node.status === "maintenance"
                                ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
                                : "bg-cyber-cyan/10 border-cyber-cyan/30 hover:border-cyber-cyan/50"
                          }`}
                        >
                          {/* Scanning effect */}
                          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-cyber-scan"></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  node.status === "active"
                                    ? "bg-emerald-500 animate-pulse"
                                    : node.status === "maintenance"
                                      ? "bg-amber-500"
                                      : "bg-cyber-cyan"
                                }`}
                              ></div>
                              <span className="font-mono text-sm text-cyber-cyan">
                                {node.id}
                              </span>
                            </div>
                            <div className="text-xs text-cyber-cyan/60 font-mono">
                              {node.jobs} jobs
                            </div>
                          </div>

                          <div className="mt-2 space-y-1">
                            {/* CPU Usage */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-cyber-cyan/70 font-mono">
                                CPU
                              </span>
                              <span className="text-cyber-cyan font-mono">
                                {node.cpu}%
                              </span>
                            </div>
                            <div className="h-1 bg-black rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${
                                  node.cpu > 80
                                    ? "bg-red-400"
                                    : node.cpu > 60
                                      ? "bg-amber-400"
                                      : "bg-emerald-400"
                                }`}
                                style={{ width: `${node.cpu}%` }}
                              />
                            </div>

                            {/* Memory Usage */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-cyber-cyan/70 font-mono">
                                MEM
                              </span>
                              <span className="text-cyber-cyan font-mono">
                                {node.memory}%
                              </span>
                            </div>
                            <div className="h-1 bg-black rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${
                                  node.memory > 80
                                    ? "bg-red-400"
                                    : node.memory > 60
                                      ? "bg-amber-400"
                                      : "bg-cyber-cyan"
                                }`}
                                style={{ width: `${node.memory}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Cluster Overview Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyber-cyan/20">
                <div className="text-center p-3 border border-emerald-500/30 rounded-lg bg-emerald-500/10">
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {clusterNodes.filter((n) => n.status === "active").length}
                  </div>
                  <div className="text-xs text-emerald-400/70 font-mono">
                    ACTIVE
                  </div>
                </div>
                <div className="text-center p-3 border border-amber-500/30 rounded-lg bg-amber-500/10">
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {
                      clusterNodes.filter((n) => n.status === "maintenance")
                        .length
                    }
                  </div>
                  <div className="text-xs text-amber-400/70 font-mono">
                    MAINTENANCE
                  </div>
                </div>
                <div className="text-center p-3 border border-red-500/30 rounded-lg bg-red-500/10">
                  <div className="text-lg font-bold text-red-400 font-mono">
                    {clusterNodes.filter((n) => n.status === "error").length ||
                      0}
                  </div>
                  <div className="text-xs text-red-400/70 font-mono">ERROR</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MemoryStick className="h-5 w-5" />
              <span>Resource Utilization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resourceMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-muted-foreground">
                    {metric.value}% / {metric.target}%
                  </span>
                </div>
                <Progress value={metric.value} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Target: {metric.target}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Job Queue Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Job Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobQueue.slice(0, 3).map((job) => (
              <div key={job.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{job.type}</div>
                  <Badge variant={getPriorityColor(job.priority) as any}>
                    {job.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {job.id} • ETA: {job.eta}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-1" />
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Pause className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Node Health and Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Node Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Node Health Status</span>
            </CardTitle>
            <CardDescription>
              Individual node performance and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clusterNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
                      <Cpu className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-medium">{node.id}</div>
                      <div className="text-sm text-muted-foreground">
                        Rack {node.rack}, Slot {node.slot}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div>CPU: {node.cpu}%</div>
                      <div className="text-muted-foreground">
                        Memory: {node.memory}%
                      </div>
                    </div>
                    <Badge className={getNodeStatusColor(node.status)}>
                      {node.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Network className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
            <CardDescription>
              Real-time cluster performance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <EnhancedLineChart
                data={[
                  { time: "00:00", cpu: 65, memory: 58, network: 42 },
                  { time: "04:00", cpu: 72, memory: 63, network: 45 },
                  { time: "08:00", cpu: 85, memory: 71, network: 52 },
                  { time: "12:00", cpu: 78, memory: 68, network: 48 },
                  { time: "16:00", cpu: 73, memory: 65, network: 50 },
                  { time: "20:00", cpu: 69, memory: 62, network: 46 },
                  { time: "24:00", cpu: 73, memory: 68, network: 45 },
                ]}
                lines={[
                  { dataKey: "cpu", color: "#00ffff", name: "CPU Usage %" },
                  { dataKey: "memory", color: "#00ff88", name: "Memory %" },
                  { dataKey: "network", color: "#ffaa00", name: "Network I/O" },
                ]}
                showGrid={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Job Management Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Job Management Dashboard</span>
              </CardTitle>
              <CardDescription>
                Complete job queue with priority management
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Queue
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobQueue.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
                    <Activity className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-medium">{job.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.id} • {job.resources}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">ETA: {job.eta}</div>
                    <div className="text-xs text-muted-foreground">
                      Progress: {job.progress}%
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(job.priority) as any}>
                    {job.priority}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Pause className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Square className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Computing;
