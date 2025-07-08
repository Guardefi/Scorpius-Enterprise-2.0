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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  GitCompare,
  ExternalLink,
  Search,
  Activity,
  Zap,
  Eye,
  ChevronRight,
  Binary,
  Network,
  RefreshCw,
} from "lucide-react";

interface BytecodeAnalysis {
  address: string;
  functionCount: number;
  complexityScore: number;
  version: string;
  compiler: string;
  optimized: boolean;
  securityFlags: string[];
}

interface ControlFlowNode {
  id: string;
  type: "entry" | "basic" | "conditional" | "loop" | "exit";
  label: string;
  opcodes: string[];
  connections: string[];
  riskLevel?: "low" | "medium" | "high";
}

export function BytecodeLab() {
  const [searchAddress, setSearchAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [activeView, setActiveView] = useState<"code" | "graph">("code");

  const [currentAnalysis, setCurrentAnalysis] = useState<BytecodeAnalysis>({
    address: "0x1234567890123456789012345678901234567890",
    functionCount: 47,
    complexityScore: 8.7,
    version: "0.8.19",
    compiler: "solc",
    optimized: true,
    securityFlags: ["reentrancy-guard", "safe-math", "access-control"],
  });

  const [decompiledCode] = useState(`
// Decompiled with Heimdall (https://heimdall.rs)
// SPDX-License-Identifier: MIT

contract DecompiledContract {
    
    mapping(address => uint256) public balances;
    address public owner;
    bool private locked;
    
    // Function: transfer(address,uint256)
    function transfer(address _to, uint256 _amount) external {
        require(!locked, "Contract is locked");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        locked = true;
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        locked = false;
        
        emit Transfer(msg.sender, _to, _amount);
    }
    
    // Function: withdraw()
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(balances[msg.sender] > 0, "No balance to withdraw");
        
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    // Function: updateBalance(address,uint256)
    function updateBalance(address _user, uint256 _newBalance) external {
        require(msg.sender == owner, "Access denied");
        balances[_user] = _newBalance;
    }
}
  `);

  const [controlFlowNodes] = useState<ControlFlowNode[]>([
    {
      id: "entry",
      type: "entry",
      label: "Contract Entry",
      opcodes: ["JUMPDEST", "PUSH1 0x80", "PUSH1 0x40"],
      connections: ["auth_check"],
    },
    {
      id: "auth_check",
      type: "conditional",
      label: "Authorization Check",
      opcodes: ["CALLER", "PUSH20", "EQ", "ISZERO"],
      connections: ["authorized", "unauthorized"],
      riskLevel: "medium",
    },
    {
      id: "authorized",
      type: "basic",
      label: "Authorized Path",
      opcodes: ["PUSH1 0x01", "SSTORE"],
      connections: ["balance_check"],
    },
    {
      id: "unauthorized",
      type: "basic",
      label: "Unauthorized Path",
      opcodes: ["PUSH1 0x00", "PUSH1 0x00", "REVERT"],
      connections: [],
      riskLevel: "low",
    },
    {
      id: "balance_check",
      type: "conditional",
      label: "Balance Validation",
      opcodes: ["SLOAD", "DUP1", "GT", "ISZERO"],
      connections: ["sufficient", "insufficient"],
      riskLevel: "high",
    },
    {
      id: "sufficient",
      type: "basic",
      label: "Execute Transfer",
      opcodes: ["SSTORE", "CALL", "RETURNDATASIZE"],
      connections: ["exit"],
      riskLevel: "high",
    },
    {
      id: "insufficient",
      type: "basic",
      label: "Insufficient Funds",
      opcodes: ["PUSH1 0x00", "REVERT"],
      connections: [],
    },
    {
      id: "exit",
      type: "exit",
      label: "Function Exit",
      opcodes: ["RETURN"],
      connections: [],
    },
  ]);

  const analyzeContract = async () => {
    if (!searchAddress.trim()) return;

    setIsAnalyzing(true);

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCurrentAnalysis({
      address: searchAddress,
      functionCount: Math.floor(Math.random() * 50) + 10,
      complexityScore: Math.round(Math.random() * 10 * 10) / 10,
      version: ["0.8.19", "0.8.17", "0.7.6", "0.6.12"][
        Math.floor(Math.random() * 4)
      ],
      compiler: ["solc", "vyper"][Math.floor(Math.random() * 2)],
      optimized: Math.random() > 0.3,
      securityFlags: [
        "reentrancy-guard",
        "safe-math",
        "access-control",
        "overflow-protection",
        "pause-mechanism",
      ].filter(() => Math.random() > 0.4),
    });

    setIsAnalyzing(false);
  };

  const getNodeColor = (node: ControlFlowNode) => {
    switch (node.type) {
      case "entry":
        return "bg-green-500/20 border-green-500/40 text-green-400";
      case "exit":
        return "bg-blue-500/20 border-blue-500/40 text-blue-400";
      case "conditional":
        return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400";
      case "loop":
        return "bg-purple-500/20 border-purple-500/40 text-purple-400";
      default:
        return node.riskLevel === "high"
          ? "bg-red-500/20 border-red-500/40 text-red-400"
          : node.riskLevel === "medium"
            ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
            : "bg-cyber-cyan/20 border-cyber-cyan/40 text-cyber-cyan";
    }
  };

  const openFullBytecodelab = () => {
    // Navigate to honeypot tab with Bytecode Lab focus
    window.location.hash = "#honeypot";
    console.log("Opening full Bytecode Lab in Honeypot tab");
  };

  return (
    <Card className="cyber-card-enhanced group">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 cyber-glow">
          <Code2 className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
          BYTECODE LAB QUICK-PEEK
        </CardTitle>
        <CardDescription>
          Embedded mini-IDE with decompiled code & control-flow analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="Enter contract address (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                disabled={isAnalyzing}
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
              />
              <Button
                onClick={analyzeContract}
                disabled={isAnalyzing || !searchAddress.trim()}
                size="sm"
                className="btn-secondary font-mono px-4"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={showDiff}
                onCheckedChange={setShowDiff}
                disabled={isAnalyzing}
              />
              <span className="text-sm text-cyber-cyan/80">
                Diff vs Previous
              </span>
            </div>

            <Button
              onClick={openFullBytecodelab}
              size="sm"
              variant="outline"
              className="border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 font-mono"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Full Lab
            </Button>
          </div>
        </div>

        {/* Contract Info Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
            <div className="text-xs text-cyber-cyan/60">Functions</div>
            <div className="text-lg font-bold text-cyber-cyan font-mono">
              {currentAnalysis.functionCount}
            </div>
          </div>

          <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
            <div className="text-xs text-cyber-cyan/60">Complexity</div>
            <div className="text-lg font-bold text-cyber-cyan font-mono">
              {currentAnalysis.complexityScore}/10
            </div>
          </div>

          <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
            <div className="text-xs text-cyber-cyan/60">Version</div>
            <div className="text-lg font-bold text-cyber-cyan font-mono">
              {currentAnalysis.version}
            </div>
          </div>

          <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
            <div className="text-xs text-cyber-cyan/60">Optimized</div>
            <div className="text-lg font-bold text-cyber-cyan font-mono">
              {currentAnalysis.optimized ? "YES" : "NO"}
            </div>
          </div>
        </div>

        {/* Security Flags */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-cyber-cyan">
            Security Features
          </div>
          <div className="flex flex-wrap gap-2">
            {currentAnalysis.securityFlags.map((flag) => (
              <Badge
                key={flag}
                className="bg-green-500/20 text-green-400 border-green-500/40 text-xs"
              >
                {flag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mini IDE Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList className="grid w-full grid-cols-2 bg-black/50">
            <TabsTrigger
              value="code"
              className="font-mono text-xs data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan"
            >
              <Code2 className="w-4 h-4 mr-1" />
              Decompiled Code
            </TabsTrigger>
            <TabsTrigger
              value="graph"
              className="font-mono text-xs data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan"
            >
              <Network className="w-4 h-4 mr-1" />
              Control Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4">
            <div className="relative">
              <ScrollArea className="h-64 border border-cyber-cyan/20 rounded-lg bg-black/80">
                <pre className="p-4 text-xs font-mono text-cyber-cyan/90 whitespace-pre-wrap">
                  {showDiff ? (
                    <div className="space-y-1">
                      <div className="text-green-400">
                        + // Security improvement: Added reentrancy guard
                      </div>
                      <div className="text-green-400">
                        + require(!locked, "Contract is locked");
                      </div>
                      <div className="text-green-400">+ locked = true;</div>
                      <div className="text-red-400">
                        - // Previous version had no protection
                      </div>
                      <div className="text-cyber-cyan/90">
                        {decompiledCode.slice(200, 800)}
                      </div>
                      <div className="text-green-400">+ locked = false;</div>
                    </div>
                  ) : (
                    decompiledCode
                  )}
                </pre>
              </ScrollArea>

              {showDiff && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs">
                    <GitCompare className="w-3 h-3 mr-1" />
                    Diff Mode
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="graph" className="space-y-4">
            <div className="h-64 border border-cyber-cyan/20 rounded-lg bg-black/80 p-4 overflow-auto">
              <div className="space-y-3 relative">
                {/* Graph Thumbnail - Simplified Control Flow */}
                <div className="text-xs text-cyber-cyan/60 mb-4">
                  Control Flow Graph (Simplified View)
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {controlFlowNodes.slice(0, 6).map((node, index) => (
                    <div key={node.id} className="relative">
                      <div
                        className={`p-3 rounded-lg border text-center cursor-pointer hover:scale-105 transition-all duration-300 ${getNodeColor(node)}`}
                      >
                        <div className="text-xs font-mono font-bold mb-1">
                          {node.label}
                        </div>
                        <div className="text-xs opacity-80">
                          {node.opcodes.slice(0, 2).join(", ")}
                          {node.opcodes.length > 2 && "..."}
                        </div>
                        {node.riskLevel && (
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor:
                                  node.riskLevel === "high"
                                    ? "#ef4444"
                                    : node.riskLevel === "medium"
                                      ? "#f97316"
                                      : "#22c55e",
                              }}
                            >
                              {node.riskLevel}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Connection Lines */}
                      {node.connections.length > 0 && index < 5 && (
                        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
                          <ChevronRight className="w-4 h-4 text-cyber-cyan/40" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <Button
                    onClick={openFullBytecodelab}
                    size="sm"
                    variant="outline"
                    className="border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 font-mono text-xs"
                  >
                    <Binary className="w-3 h-3 mr-1" />
                    View Full Graph in Bytecode Lab
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-cyber-cyan/20">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Live Analysis
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              {currentAnalysis.address.slice(0, 10)}...
            </Badge>
          </div>

          <Button
            onClick={openFullBytecodelab}
            size="sm"
            className="btn-primary font-mono uppercase tracking-wide px-4"
          >
            <Zap className="w-3 h-3 mr-1" />
            Deep Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
