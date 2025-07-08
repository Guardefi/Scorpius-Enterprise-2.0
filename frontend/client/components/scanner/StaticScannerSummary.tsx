import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Shield,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Activity,
  Eye,
  Zap,
} from "lucide-react";
import { chartColors, chartColorArray } from "@/lib/chart-utils";

interface VulnerabilityData {
  name: string;
  value: number;
  color: string;
}

interface VulnerableFunction {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  contract: string;
  line: number;
  description: string;
  scanType: "Slither" | "Mythril" | "AI-Enhanced";
}

interface ScanSummary {
  lastScanTime: string;
  totalContracts: number;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  isScanning: boolean;
  watchedContracts: string[];
}

export function StaticScannerSummary() {
  const [summary, setSummary] = useState<ScanSummary>({
    lastScanTime: new Date().toLocaleString(),
    totalContracts: 12,
    totalVulnerabilities: 47,
    criticalCount: 3,
    highCount: 8,
    mediumCount: 21,
    lowCount: 15,
    isScanning: false,
    watchedContracts: [
      "0x1234...5678",
      "0xabcd...ef01",
      "0x9876...5432",
      "0xfedc...ba98",
      "0x1111...2222",
    ],
  });

  const [topVulnerableFunctions] = useState<VulnerableFunction[]>([
    {
      id: "vuln_1",
      name: "transfer()",
      severity: "Critical",
      contract: "0x1234...5678",
      line: 142,
      description: "Reentrancy vulnerability in token transfer",
      scanType: "Slither",
    },
    {
      id: "vuln_2",
      name: "withdrawFunds()",
      severity: "Critical",
      contract: "0xabcd...ef01",
      line: 89,
      description: "Missing access control on withdrawal function",
      scanType: "Mythril",
    },
    {
      id: "vuln_3",
      name: "updatePrice()",
      severity: "High",
      contract: "0x9876...5432",
      line: 203,
      description: "Integer overflow in price calculation",
      scanType: "AI-Enhanced",
    },
    {
      id: "vuln_4",
      name: "mintTokens()",
      severity: "High",
      contract: "0xfedc...ba98",
      line: 67,
      description: "Unchecked external call return value",
      scanType: "Slither",
    },
    {
      id: "vuln_5",
      name: "authorize()",
      severity: "Medium",
      contract: "0x1111...2222",
      line: 156,
      description: "Weak randomness in authorization logic",
      scanType: "Mythril",
    },
  ]);

  const vulnerabilityData: VulnerabilityData[] = [
    { name: "Critical", value: summary.criticalCount, color: "#ef4444" },
    { name: "High", value: summary.highCount, color: "#f97316" },
    { name: "Medium", value: summary.mediumCount, color: "#eab308" },
    { name: "Low", value: summary.lowCount, color: "#3b82f6" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "High":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "Low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const getScanTypeColor = (scanType: string) => {
    switch (scanType) {
      case "Slither":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "Mythril":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      case "AI-Enhanced":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const handleRescan = async () => {
    setSummary((prev) => ({ ...prev, isScanning: true }));

    // Simulate scanning process
    setTimeout(() => {
      setSummary((prev) => ({
        ...prev,
        isScanning: false,
        lastScanTime: new Date().toLocaleString(),
        // Simulate slight changes in vulnerability counts
        criticalCount: prev.criticalCount + Math.floor(Math.random() * 3) - 1,
        highCount: prev.highCount + Math.floor(Math.random() * 5) - 2,
        mediumCount: prev.mediumCount + Math.floor(Math.random() * 7) - 3,
        lowCount: prev.lowCount + Math.floor(Math.random() * 4) - 2,
      }));
    }, 3000);
  };

  const handleJumpToBytecode = (functionData: VulnerableFunction) => {
    // Simulate navigation to Bytecode Lab
    console.log(
      `Jumping to Bytecode Lab for ${functionData.name} in ${functionData.contract} at line ${functionData.line}`,
    );
    // In a real app, this would navigate to the bytecode analysis view
  };

  const getSecurityHealthColor = () => {
    const totalVulns =
      summary.criticalCount +
      summary.highCount +
      summary.mediumCount +
      summary.lowCount;
    if (summary.criticalCount > 0) return "text-red-400";
    if (summary.highCount > 3) return "text-orange-400";
    if (totalVulns > 20) return "text-yellow-400";
    return "text-green-400";
  };

  const getSecurityHealthStatus = () => {
    if (summary.criticalCount > 0) return "CRITICAL";
    if (summary.highCount > 3) return "HIGH RISK";
    if (summary.mediumCount > 10) return "MEDIUM RISK";
    return "HEALTHY";
  };

  return (
    <Card className="cyber-card-enhanced group">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 cyber-glow">
          <Shield className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
          STATIC SCANNER SUMMARY
        </CardTitle>
        <CardDescription>
          Vulnerability barometer for your watched contracts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Health Status */}
        <div className="flex items-center justify-between p-4 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${summary.criticalCount > 0 ? "bg-red-400 animate-pulse" : summary.highCount > 3 ? "bg-orange-400" : "bg-green-400"}`}
            />
            <div>
              <div className="text-sm font-medium text-cyber-cyan">
                Security Health
              </div>
              <div
                className={`text-lg font-bold font-mono ${getSecurityHealthColor()}`}
              >
                {getSecurityHealthStatus()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-cyber-cyan/60">Last Scan</div>
            <div className="text-sm font-mono text-cyber-cyan/80">
              {summary.lastScanTime}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vulnerability Donut Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-cyber-cyan">
                Severity Distribution
              </h4>
              <Badge variant="outline" className="text-xs">
                {summary.totalVulnerabilities} Total
              </Badge>
            </div>

            <div className="relative">
              <ChartContainer
                config={{
                  vulnerabilities: {
                    label: "Vulnerabilities",
                  },
                }}
                className="h-48"
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={vulnerabilityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {vulnerabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-black/95 border border-cyber-cyan/30 rounded-lg p-3 backdrop-blur-sm">
                              <div className="text-cyber-cyan font-medium">
                                {data.name}
                              </div>
                              <div className="text-white font-mono">
                                {data.value} vulnerabilities
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyber-cyan font-mono">
                    {summary.totalVulnerabilities}
                  </div>
                  <div className="text-xs text-cyber-cyan/60">VULNS</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {vulnerabilityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-cyber-cyan/80">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vulnerable Functions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-cyber-cyan">
                Top Vulnerable Functions
              </h4>
              <Badge variant="outline" className="text-xs">
                {summary.watchedContracts.length} Contracts
              </Badge>
            </div>

            <ScrollArea className="h-48">
              <div className="space-y-2">
                {topVulnerableFunctions.map((func, index) => (
                  <div
                    key={func.id}
                    className="group p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg hover:bg-cyber-cyan/10 transition-all duration-300 cursor-pointer"
                    onClick={() => handleJumpToBytecode(func)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-cyber-cyan truncate">
                            {func.name}
                          </span>
                          <Badge
                            className={`text-xs ${getSeverityColor(func.severity)}`}
                          >
                            {func.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-cyber-cyan/60 mb-1">
                          {func.contract} • Line {func.line}
                        </div>
                        <div className="text-xs text-cyber-cyan/80 mb-2">
                          {func.description}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`text-xs ${getScanTypeColor(func.scanType)}`}
                          >
                            {func.scanType}
                          </Badge>
                          <ExternalLink className="w-3 h-3 text-cyber-cyan/60 group-hover:text-cyber-cyan transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Watched Contracts Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-cyber-cyan">
            Watched Contracts
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {summary.watchedContracts.map((contract, index) => (
              <div
                key={contract}
                className="flex items-center gap-2 p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded text-xs hover:bg-cyber-cyan/10 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3 text-cyber-cyan/60" />
                <span className="font-mono text-cyber-cyan/80 truncate">
                  {contract}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Re-scan Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleRescan}
            disabled={summary.isScanning}
            className="btn-primary font-mono uppercase tracking-wide px-6"
            size="sm"
          >
            {summary.isScanning ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Re-scan All
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
