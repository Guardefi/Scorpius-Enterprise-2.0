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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  Target,
  Upload,
  Activity,
  Database,
  Settings,
  Zap,
} from "lucide-react";
import {
  chartColors,
  chartColorArray,
  chartTheme,
  chartAnimations,
  generateSampleData,
} from "@/lib/chart-utils";
import { StaticScannerSummary } from "@/components/scanner/StaticScannerSummary";

interface Vulnerability {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

interface ScanResult {
  contractAddress: string;
  scanId: string;
  status: "scanning" | "completed" | "failed";
  progress: number;
  vulnerabilities: Vulnerability[];
  securityScore: number;
  gasOptimization: number;
  timestamp: string;
  plugins?: string[];
  currentPlugin?: string;
  pluginStage?: string;
}

export default function Scanner() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([
    "mythril",
    "slither",
    "oyente",
    "securify",
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Chart data
  const [vulnerabilityChart] = useState(
    generateSampleData.pieChart(["Critical", "High", "Medium", "Low", "Info"]),
  );
  const [securityScoreChart] = useState(
    generateSampleData.barChart([
      "Contract 1",
      "Contract 2",
      "Contract 3",
      "Contract 4",
      "Contract 5",
      "Contract 6",
      "Contract 7",
      "Contract 8",
      "Contract 9",
      "Contract 10",
    ]),
  );

  const availablePlugins = [
    {
      id: "mythril",
      name: "Mythril",
      description: "Symbolic execution analysis",
    },
    {
      id: "slither",
      name: "Slither",
      description: "Static analysis framework",
    },
    { id: "oyente", name: "Oyente", description: "Formal verification" },
    {
      id: "securify",
      name: "Securify",
      description: "Security pattern analysis",
    },
    {
      id: "manticore",
      name: "Manticore",
      description: "Dynamic symbolic execution",
    },
    { id: "echidna", name: "Echidna", description: "Property-based fuzzing" },
  ];

  const startScan = async () => {
    if (!contractAddress.trim() && !sourceCode.trim()) return;

    const newScan: ScanResult = {
      contractAddress: contractAddress || "Source Code Analysis",
      scanId: `scan_${Date.now()}`,
      status: "scanning",
      progress: 0,
      vulnerabilities: [],
      securityScore: 0,
      gasOptimization: 0,
      timestamp: new Date().toLocaleString(),
      plugins: selectedPlugins,
      currentPlugin: selectedPlugins[0],
      pluginStage: "Initializing...",
    };

    setScanResults((prev) => [newScan, ...prev]);
    setIsScanning(true);

    // Simulate scan progress
    const simulateScan = async () => {
      const totalSteps = selectedPlugins.length * 10;
      let currentStep = 0;

      for (const plugin of selectedPlugins) {
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          currentStep++;

          setScanResults((prev) =>
            prev.map((scan) =>
              scan.scanId === newScan.scanId
                ? {
                    ...scan,
                    progress: (currentStep / totalSteps) * 100,
                    currentPlugin: plugin,
                    pluginStage:
                      i < 3
                        ? "Analyzing..."
                        : i < 7
                          ? "Detecting..."
                          : "Finalizing...",
                  }
                : scan,
            ),
          );
        }
      }

      // Generate random vulnerabilities
      const vulnerabilities: Vulnerability[] = [];
      const severities: Vulnerability["severity"][] = [
        "Critical",
        "High",
        "Medium",
        "Low",
        "Info",
      ];

      for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
        vulnerabilities.push({
          id: `vuln_${i}`,
          severity: severities[Math.floor(Math.random() * severities.length)],
          title: [
            "Reentrancy Vulnerability",
            "Integer Overflow",
            "Unchecked Return Value",
            "Access Control Issue",
            "Gas Limit DoS",
            "Front Running",
            "Timestamp Dependence",
            "Uninitialized Storage",
          ][Math.floor(Math.random() * 8)],
          description:
            "Potential security vulnerability detected in smart contract code.",
          line: Math.floor(Math.random() * 200) + 1,
          recommendation: "Review and fix the identified security issue.",
        });
      }

      const securityScore = Math.max(0, 100 - vulnerabilities.length * 10);
      const gasOptimization = Math.floor(Math.random() * 30) + 70;

      setScanResults((prev) =>
        prev.map((scan) =>
          scan.scanId === newScan.scanId
            ? {
                ...scan,
                status: "completed",
                progress: 100,
                vulnerabilities,
                securityScore,
                gasOptimization,
                currentPlugin: undefined,
                pluginStage: "Completed",
              }
            : scan,
        ),
      );

      setIsScanning(false);
    };

    simulateScan();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "High":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Info":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      const validExtensions = [".sol", ".vy", ".py", ".rs", ".js", ".ts"];
      const extension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));
      return validExtensions.includes(extension);
    });

    if (validFiles.length !== files.length) {
      alert(
        "Some files were skipped. Only .sol, .vy, .py, .rs, .js, .ts files are supported.",
      );
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Auto-populate source code from the first uploaded file
    if (validFiles.length > 0 && !sourceCode) {
      const firstFile = validFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSourceCode(e.target.result as string);
        }
      };
      reader.readAsText(firstFile);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Scanner Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-blue-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {scanResults.filter((r) => r.status === "completed").length}
            </div>
            <div className="text-xs text-blue-400/70 uppercase tracking-wide">
              Completed Scans
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono mb-1">
              {scanResults
                .filter((r) => r.status === "completed")
                .reduce(
                  (acc, scan) =>
                    acc +
                    scan.vulnerabilities.filter(
                      (v) => v.severity === "Critical",
                    ).length,
                  0,
                )}
            </div>
            <div className="text-xs text-red-400/70 uppercase tracking-wide">
              Critical Issues
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-green-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {scanResults.filter((r) => r.status === "completed").length > 0
                ? Math.round(
                    scanResults
                      .filter((r) => r.status === "completed")
                      .reduce((acc, scan) => acc + scan.securityScore, 0) /
                      scanResults.filter((r) => r.status === "completed")
                        .length,
                  )
                : 0}
            </div>
            <div className="text-xs text-green-400/70 uppercase tracking-wide">
              Avg Security Score
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-8 h-8 text-cyan-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-1">
              {scanResults.filter((r) => r.status === "scanning").length}
            </div>
            <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
              Active Scans
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Static Scanner Summary Widget */}
      <StaticScannerSummary />

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Interface */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Search className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              SMART CONTRACT SCANNER
            </CardTitle>
            <CardDescription>
              Comprehensive security analysis using multiple detection engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Contract Address
              </label>
              <Input
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                disabled={isScanning}
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
              />
            </div>

            <div className="text-center text-cyber-cyan/60 text-sm">OR</div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Source Code
              </label>
              <Textarea
                placeholder="pragma solidity ^0.8.0;..."
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                disabled={isScanning}
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 min-h-32"
              />
            </div>

            <div className="text-center text-cyber-cyan/60 text-sm">OR</div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Upload Contract Files
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".sol,.vy,.py,.rs,.js,.ts"
                  onChange={handleFileUpload}
                  disabled={isScanning}
                  className="hidden"
                  id="contract-files"
                />
                <label
                  htmlFor="contract-files"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                    isScanning
                      ? "border-cyber-cyan/20 bg-black/20 cursor-not-allowed"
                      : "border-cyber-cyan/30 hover:border-cyber-cyan/50 bg-black/30 hover:bg-cyber-cyan/5"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-cyber-cyan/60" />
                    <p className="mb-2 text-sm text-cyber-cyan/80 font-mono">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-cyber-cyan/60 font-mono">
                      .sol, .vy, .py, .rs, .js, .ts files
                    </p>
                  </div>
                </label>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-cyber-cyan/80 font-mono">
                    {uploadedFiles.length} file(s) uploaded:
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded text-xs"
                      >
                        <span className="text-cyber-cyan/80 font-mono truncate">
                          {file.name} ({(file.size / 1024).toFixed(1)}KB)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isScanning}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-cyber-cyan">
                Analysis Plugins
              </label>
              <div className="grid grid-cols-1 gap-3">
                {availablePlugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="flex items-center space-x-3 p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/10 transition-colors"
                  >
                    <Switch
                      checked={selectedPlugins.includes(plugin.id)}
                      onCheckedChange={(checked) =>
                        setSelectedPlugins((prev) =>
                          checked
                            ? [...prev, plugin.id]
                            : prev.filter((p) => p !== plugin.id),
                        )
                      }
                      disabled={isScanning}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-cyber-cyan">
                        {plugin.name}
                      </div>
                      <div className="text-xs text-cyber-cyan/60">
                        {plugin.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={startScan}
              disabled={
                isScanning ||
                (!contractAddress.trim() && !sourceCode.trim()) ||
                selectedPlugins.length === 0
              }
              className="w-full btn-primary font-mono uppercase tracking-wide"
            >
              {isScanning ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Security Scan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Real-time Scan Results */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Activity className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              SCAN RESULTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {scanResults.map((result) => (
                  <div
                    key={result.scanId}
                    className="border border-cyber-cyan/20 rounded-lg p-4 space-y-3 bg-cyber-cyan/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-cyber-cyan">
                        {result.contractAddress.slice(0, 30)}
                        {result.contractAddress.length > 30 ? "..." : ""}
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          result.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : result.status === "scanning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }
                      >
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-cyber-cyan/60">
                      {result.timestamp}
                    </div>

                    {result.status === "scanning" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{Math.round(result.progress)}%</span>
                        </div>
                        <Progress value={result.progress} />
                        {result.currentPlugin && (
                          <div className="text-xs text-cyber-cyan/60">
                            {result.currentPlugin}: {result.pluginStage}
                          </div>
                        )}
                      </div>
                    )}

                    {result.status === "completed" && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Security Score:
                          </span>
                          <div
                            className={`font-mono ${
                              result.securityScore >= 80
                                ? "text-green-400"
                                : result.securityScore >= 60
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {result.securityScore}/100
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Vulnerabilities:
                          </span>
                          <div className="font-mono text-red-400">
                            {result.vulnerabilities.length}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.status === "completed" &&
                      result.vulnerabilities.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-cyber-cyan">
                            Top Issues:
                          </div>
                          {result.vulnerabilities.slice(0, 3).map((vuln) => (
                            <div
                              key={vuln.id}
                              className="text-xs p-2 rounded border-l-2 border-red-400 bg-red-400/10"
                            >
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={`text-xs ${getSeverityColor(vuln.severity)}`}
                                >
                                  {vuln.severity}
                                </Badge>
                                <span className="text-cyber-cyan">
                                  {vuln.title}
                                </span>
                              </div>
                              {vuln.line && (
                                <div className="text-cyber-cyan/60 mt-1">
                                  Line {vuln.line}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
                {scanResults.length === 0 && (
                  <div className="text-center py-8 text-cyber-cyan/60">
                    No scans yet. Enter a contract address or source code above
                    to start scanning.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Distribution */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Database className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              VULNERABILITY DISTRIBUTION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Count",
                  color: chartColors.destructive,
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={vulnerabilityChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    {...chartAnimations.entry}
                  >
                    {vulnerabilityChart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColorArray[index % chartColorArray.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Security Score Trends */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Target className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              SECURITY SCORE TRENDS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Security Score",
                  color: chartColors.success,
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer>
                <BarChart data={securityScoreChart}>
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
                    fill={chartColors.success}
                    radius={[4, 4, 0, 0]}
                    {...chartAnimations.entry}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
