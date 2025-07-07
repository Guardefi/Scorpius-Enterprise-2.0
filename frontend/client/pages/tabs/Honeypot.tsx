import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, Search, CheckCircle, Activity, RotateCcw } from "lucide-react";

interface HoneypotDetectionResult {
  id: string;
  contractAddress: string;
  riskScore: number;
  honeypotType:
    | "transfer_honeypot"
    | "balance_modifier"
    | "hidden_function"
    | "gas_limit"
    | "unknown";
  detectionMethod:
    | "pattern_analysis"
    | "bytecode_similarity"
    | "behavioral_analysis";
  similarContracts: string[];
  confidence: number;
  timestamp: string;
  status: "analyzing" | "honeypot_detected" | "safe" | "suspicious";
  currentStage?: string;
}

export default function Honeypot() {
  const [honeypotResults, setHoneypotResults] = useState<
    HoneypotDetectionResult[]
  >([
    {
      id: "1",
      contractAddress: "0x742d35Cc6676C5D5d8a8e7Da2c13b71B04e19e5A",
      riskScore: 85,
      honeypotType: "transfer_honeypot",
      detectionMethod: "pattern_analysis",
      similarContracts: ["0x123...", "0x456..."],
      confidence: 92,
      timestamp: new Date().toLocaleString(),
      status: "honeypot_detected",
    },
    {
      id: "2",
      contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      riskScore: 15,
      honeypotType: "unknown",
      detectionMethod: "bytecode_similarity",
      similarContracts: [],
      confidence: 95,
      timestamp: new Date().toLocaleString(),
      status: "safe",
    },
  ]);
  const [targetContract, setTargetContract] = useState("");
  const [isAnalyzingHoneypot, setIsAnalyzingHoneypot] = useState(false);
  const [detectionMode, setDetectionMode] = useState<"single" | "similarity">(
    "single",
  );

  const analyzeForHoneypot = async () => {
    if (!targetContract.trim()) return;

    setIsAnalyzingHoneypot(true);
    const resultId = `honeypot_${Date.now()}`;

    const analyzeResult: HoneypotDetectionResult = {
      id: resultId,
      contractAddress: targetContract,
      riskScore: 0,
      honeypotType: "unknown",
      detectionMethod:
        detectionMode === "single" ? "pattern_analysis" : "bytecode_similarity",
      similarContracts: [],
      confidence: 0,
      timestamp: new Date().toLocaleString(),
      status: "analyzing",
      currentStage: "Initializing analysis...",
    };

    setHoneypotResults((prev) => [analyzeResult, ...prev]);

    // Simulate analysis stages
    const stages = [
      "Loading contract bytecode",
      "Analyzing function signatures",
      "Checking for suspicious patterns",
      "Comparing with known honeypots",
      "Calculating risk score",
      "Finalizing analysis",
    ];

    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setHoneypotResults((prev) =>
        prev.map((result) =>
          result.id === resultId ? { ...result, currentStage: stage } : result,
        ),
      );
    }

    // Generate final result
    const riskScore = Math.floor(Math.random() * 100);
    const finalResult: HoneypotDetectionResult = {
      ...analyzeResult,
      riskScore,
      honeypotType:
        riskScore > 70
          ? ["transfer_honeypot", "balance_modifier", "hidden_function"][
              Math.floor(Math.random() * 3)
            ]
          : "unknown",
      similarContracts:
        riskScore > 70 ? [`0x${Math.random().toString(16).substr(2, 40)}`] : [],
      confidence: Math.floor(Math.random() * 20) + 80,
      status:
        riskScore > 70
          ? "honeypot_detected"
          : riskScore > 40
            ? "suspicious"
            : "safe",
      currentStage: undefined,
    };

    setHoneypotResults((prev) =>
      prev.map((result) => (result.id === resultId ? finalResult : result)),
    );

    setIsAnalyzingHoneypot(false);
    setTargetContract("");
  };

  return (
    <div className="space-y-6">
      {/* Detection Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-red-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono mb-1">
              {
                honeypotResults.filter((r) => r.status === "honeypot_detected")
                  .length
              }
            </div>
            <div className="text-xs text-red-400/70 uppercase tracking-wide">
              Honeypots Detected
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Search className="w-8 h-8 text-cyber-cyan animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-cyber-cyan font-mono mb-1">
              {honeypotResults.length}
            </div>
            <div className="text-xs text-cyber-cyan/70 uppercase tracking-wide">
              Total Analyzed
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {honeypotResults.filter((r) => r.status === "safe").length}
            </div>
            <div className="text-xs text-green-400/70 uppercase tracking-wide">
              Safe Contracts
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Honeypot Detection */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Target className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              HONEYPOT DETECTOR
            </CardTitle>
            <CardDescription>
              Analyze contracts for honeypot patterns and bytecode similarity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Contract Address
              </label>
              <Input
                placeholder="0x..."
                value={targetContract}
                onChange={(e) => setTargetContract(e.target.value)}
                disabled={isAnalyzingHoneypot}
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-cyber-cyan">
                Detection Method
              </label>
              <div className="grid grid-cols-1 gap-3">
                {/* Pattern Analysis */}
                <div className="flex items-center space-x-3 p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/10 transition-colors">
                  <input
                    type="radio"
                    id="pattern"
                    name="detectionMode"
                    checked={detectionMode === "single"}
                    onChange={() => setDetectionMode("single")}
                    disabled={isAnalyzingHoneypot}
                    className="h-4 w-4 border-cyber-cyan/30 text-cyber-cyan focus:ring-cyber-cyan/20"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="pattern"
                      className="text-sm font-medium text-cyber-cyan cursor-pointer"
                    >
                      Pattern Analysis
                    </label>
                    <div className="text-xs text-cyber-cyan/60 mt-1">
                      Analyze contract for common honeypot patterns and
                      suspicious functions
                    </div>
                  </div>
                  <div className="text-xs text-cyber-cyan/40 font-mono">
                    PATTERN
                  </div>
                </div>

                {/* Bytecode Similarity */}
                <div className="flex items-center space-x-3 p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/10 transition-colors">
                  <input
                    type="radio"
                    id="similarity"
                    name="detectionMode"
                    checked={detectionMode === "similarity"}
                    onChange={() => setDetectionMode("similarity")}
                    disabled={isAnalyzingHoneypot}
                    className="h-4 w-4 border-cyber-cyan/30 text-cyber-cyan focus:ring-cyber-cyan/20"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="similarity"
                      className="text-sm font-medium text-cyber-cyan cursor-pointer"
                    >
                      Bytecode Similarity Engine
                    </label>
                    <div className="text-xs text-cyber-cyan/60 mt-1">
                      Compare bytecode against known honeypot database for
                      similarity matches
                    </div>
                  </div>
                  <div className="text-xs text-cyber-cyan/40 font-mono">
                    SIMILARITY
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={analyzeForHoneypot}
              disabled={!targetContract.trim() || isAnalyzingHoneypot}
              className="w-full btn-primary font-mono uppercase tracking-wide"
            >
              {isAnalyzingHoneypot ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Contract
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Detection Results */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Activity className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              DETECTION RESULTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {honeypotResults.map((result) => (
                  <div
                    key={result.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {result.contractAddress.slice(0, 10)}...
                      </code>
                      <Badge
                        variant={
                          result.status === "honeypot_detected"
                            ? "destructive"
                            : result.status === "safe"
                              ? "default"
                              : result.status === "suspicious"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {result.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {result.status === "analyzing" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Analyzing...</span>
                          <span className="text-cyber-cyan">
                            {result.detectionMethod === "pattern_analysis"
                              ? "PATTERN"
                              : "SIMILARITY"}
                          </span>
                        </div>
                        {result.currentStage && (
                          <div className="text-xs text-cyber-cyan/60 flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                            {result.currentStage}
                          </div>
                        )}
                      </div>
                    )}

                    {result.status !== "analyzing" && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Risk Score</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono">
                              {result.riskScore}/100
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                result.riskScore >= 70
                                  ? "bg-red-500"
                                  : result.riskScore >= 40
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            />
                          </div>
                        </div>

                        {result.honeypotType !== "unknown" && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Type:{" "}
                            </span>
                            <span className="text-red-400 capitalize">
                              {result.honeypotType.replace("_", " ")}
                            </span>
                          </div>
                        )}

                        <div className="text-xs">
                          <span className="text-muted-foreground">
                            Confidence:{" "}
                          </span>
                          <span className="font-mono">
                            {result.confidence}%
                          </span>
                        </div>

                        {result.similarContracts.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Similar contracts:{" "}
                            </span>
                            <span className="font-mono text-red-400">
                              {result.similarContracts.length}
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {result.timestamp}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {honeypotResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No contracts analyzed yet. Start your first honeypot
                    detection above.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
