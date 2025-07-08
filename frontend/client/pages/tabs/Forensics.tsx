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
import {
  Eye,
  AlertTriangle,
  Share,
  DollarSign,
  Target,
  Search,
  FileText,
  RotateCcw,
} from "lucide-react";

interface ForensicsResult {
  address: string;
  riskScore: number;
  flags: string[];
  associations: string[];
  transactionVolume: string;
  firstSeen: string;
  lastActivity: string;
}

export default function Forensics() {
  const [forensicsResults, setForensicsResults] = useState<ForensicsResult[]>([
    {
      address: "0x742d35Cc6676C5D5d8a8e7Da2c13b71B04e19e5A",
      riskScore: 85,
      flags: ["High Transaction Volume", "Multiple Exchange Interactions"],
      associations: ["Exchange Wallet", "DeFi Protocol"],
      transactionVolume: "1,247.32 ETH",
      firstSeen: "2022-01-15",
      lastActivity: "2024-01-10",
    },
    {
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      riskScore: 35,
      flags: ["Privacy Coin Usage"],
      associations: ["Known MEV Bot"],
      transactionVolume: "523.45 ETH",
      firstSeen: "2023-03-22",
      lastActivity: "2024-01-08",
    },
  ]);
  const [forensicsAddress, setForensicsAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="space-y-8">
      {/* Forensics Intelligence Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-8 h-8 text-green-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {forensicsResults.length}
            </div>
            <div className="text-xs text-green-400/70 uppercase tracking-wide">
              Addresses Analyzed
            </div>
            <div className="text-xs text-green-400 mt-1">
              +{Math.floor(Math.random() * 3 + 1)} today
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono mb-1">
              {forensicsResults.filter((r) => r.riskScore > 70).length}
            </div>
            <div className="text-xs text-red-400/70 uppercase tracking-wide">
              High Risk Detected
            </div>
            <div className="text-xs text-red-400 mt-1">
              Requires investigation
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Share className="w-8 h-8 text-purple-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-purple-400 font-mono mb-1">
              {forensicsResults.reduce(
                (acc, r) => acc + r.associations.length,
                0,
              )}
            </div>
            <div className="text-xs text-purple-400/70 uppercase tracking-wide">
              Linked Addresses
            </div>
            <div className="text-xs text-purple-400 mt-1">
              Network connections
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-cyan-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-1">
              $
              {forensicsResults
                .reduce(
                  (acc, r) =>
                    acc +
                    parseFloat(r.transactionVolume.replace(/[^0-9.]/g, "")),
                  0,
                )
                .toLocaleString()}
            </div>
            <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
              Total Volume Traced
            </div>
            <div className="text-xs text-cyan-400 mt-1">
              Across all investigations
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Risk Assessment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-glow">
            <Target className="w-5 h-5 text-cyber-cyan animate-cyber-pulse" />
            RISK ASSESSMENT MATRIX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-4xl font-bold text-red-400 mb-2">
                {forensicsResults.filter((r) => r.riskScore >= 70).length}
              </div>
              <div className="text-sm text-red-400 uppercase tracking-wide">
                High Risk
              </div>
              <div className="text-xs text-red-400/70 mt-1">Score: 70-100</div>
            </div>
            <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {
                  forensicsResults.filter(
                    (r) => r.riskScore >= 40 && r.riskScore < 70,
                  ).length
                }
              </div>
              <div className="text-sm text-yellow-400 uppercase tracking-wide">
                Medium Risk
              </div>
              <div className="text-xs text-yellow-400/70 mt-1">
                Score: 40-69
              </div>
            </div>
            <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {forensicsResults.filter((r) => r.riskScore < 40).length}
              </div>
              <div className="text-sm text-green-400 uppercase tracking-wide">
                Low Risk
              </div>
              <div className="text-xs text-green-400/70 mt-1">Score: 0-39</div>
            </div>
          </div>

          {/* Recent Investigations */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-cyber-cyan uppercase tracking-wide mb-4">
              Recent Investigations
            </h3>
            {forensicsResults.slice(0, 4).map((result, index) => (
              <div
                key={result.address}
                className="flex items-center justify-between p-4 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-4 h-4 rounded-full animate-cyber-pulse ${
                      result.riskScore >= 70
                        ? "bg-red-400"
                        : result.riskScore >= 40
                          ? "bg-yellow-400"
                          : "bg-green-400"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-cyber-cyan">
                      {result.address.slice(0, 8)}...
                      {result.address.slice(-6)}
                    </div>
                    <div className="text-xs text-cyber-cyan/60">
                      {result.flags.length} flags • {result.associations.length}{" "}
                      associations
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold">
                    <span
                      className={
                        result.riskScore >= 70
                          ? "text-red-400"
                          : result.riskScore >= 40
                            ? "text-yellow-400"
                            : "text-green-400"
                      }
                    >
                      {result.riskScore}
                    </span>
                  </div>
                  <div className="text-xs text-cyber-cyan/60">Risk Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Address Forensics
            </CardTitle>
            <CardDescription>
              Analyze blockchain addresses for suspicious activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Address to Analyze</label>
              <Input
                placeholder="0x..."
                value={forensicsAddress}
                onChange={(e) => setForensicsAddress(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <Button
              onClick={async () => {
                if (!forensicsAddress.trim()) return;
                setIsAnalyzing(true);

                // Simulate analysis
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const result: ForensicsResult = {
                  address: forensicsAddress,
                  riskScore: Math.floor(Math.random() * 100),
                  flags: [
                    "High Transaction Volume",
                    "Multiple Exchange Interactions",
                    "Privacy Coin Usage",
                  ],
                  associations: [
                    "Exchange Wallet",
                    "DeFi Protocol",
                    "Known MEV Bot",
                  ],
                  transactionVolume: `${(Math.random() * 1000).toFixed(2)} ETH`,
                  firstSeen: "2022-01-15",
                  lastActivity: "2024-01-10",
                };

                setForensicsResults((prev) => [result, ...prev]);
                setIsAnalyzing(false);
                setForensicsAddress("");
              }}
              disabled={!forensicsAddress.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Address
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {forensicsResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {result.address.slice(0, 10)}...
                      </code>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Risk Score:</span>
                        <Badge
                          variant={
                            result.riskScore > 70
                              ? "destructive"
                              : result.riskScore > 40
                                ? "secondary"
                                : "default"
                          }
                        >
                          {result.riskScore}/100
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Red Flags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.flags.map((flag, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Associations:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.associations.map((assoc, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {assoc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Volume: {result.transactionVolume}</div>
                        <div>First: {result.firstSeen}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {forensicsResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No analyses yet. Enter an address above to start
                    investigating.
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
