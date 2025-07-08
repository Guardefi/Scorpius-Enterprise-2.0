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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
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
  Network,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  ExternalLink,
  Zap,
  Shield,
  History,
  Activity,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

interface BridgeTransfer {
  id: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  bridgeProtocol: string;
  txHash: string;
  timestamp: Date;
  status: "pending" | "completed" | "failed" | "suspicious";
  isSuspicious: boolean;
  suspiciousReasons?: string[];
  gasUsed: number;
  bridgeFee: string;
}

interface ChainFlow {
  chain: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  transactions: number;
  avgAmount: number;
  color: string;
}

interface WatchedAddress {
  id: string;
  address: string;
  name: string;
  chains: string[];
  alertThreshold: number; // in ETH
  isActive: boolean;
}

export function CrossChainBridgeMonitor() {
  const [bridgeTransfers, setBridgeTransfers] = useState<BridgeTransfer[]>([
    {
      id: "bridge_001",
      fromChain: "Ethereum",
      toChain: "Arbitrum",
      fromAddress: "0x1234567890123456789012345678901234567890",
      toAddress: "0x9876543210987654321098765432109876543210",
      amount: "125.5",
      token: "ETH",
      bridgeProtocol: "Arbitrum Bridge",
      txHash: "0xabcd...ef01",
      timestamp: new Date(Date.now() - 120000),
      status: "completed",
      isSuspicious: true,
      suspiciousReasons: ["Large amount (>50 ETH)", "Unusual timing"],
      gasUsed: 180000,
      bridgeFee: "0.025",
    },
    {
      id: "bridge_002",
      fromChain: "Polygon",
      toChain: "Ethereum",
      fromAddress: "0x5555666677778888999900001111222233334444",
      toAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      amount: "15.3",
      token: "USDC",
      bridgeProtocol: "Polygon PoS Bridge",
      txHash: "0x1234...5678",
      timestamp: new Date(Date.now() - 300000),
      status: "pending",
      isSuspicious: false,
      gasUsed: 95000,
      bridgeFee: "0.012",
    },
    {
      id: "bridge_003",
      fromChain: "Base",
      toChain: "Ethereum",
      fromAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      toAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
      amount: "75.8",
      token: "ETH",
      bridgeProtocol: "Base Bridge",
      txHash: "0x9999...aaaa",
      timestamp: new Date(Date.now() - 600000),
      status: "completed",
      isSuspicious: true,
      suspiciousReasons: ["Large amount (>50 ETH)", "New address"],
      gasUsed: 210000,
      bridgeFee: "0.035",
    },
  ]);

  const [chainFlows, setChainFlows] = useState<ChainFlow[]>([
    {
      chain: "Ethereum",
      inflow: 245.7,
      outflow: 180.3,
      netFlow: 65.4,
      transactions: 45,
      avgAmount: 12.3,
      color: "#627EEA",
    },
    {
      chain: "Arbitrum",
      inflow: 180.3,
      outflow: 95.2,
      netFlow: 85.1,
      transactions: 28,
      avgAmount: 18.7,
      color: "#2D374B",
    },
    {
      chain: "Polygon",
      inflow: 95.2,
      outflow: 150.8,
      netFlow: -55.6,
      transactions: 67,
      avgAmount: 3.2,
      color: "#8247E5",
    },
    {
      chain: "Base",
      inflow: 120.5,
      outflow: 89.3,
      netFlow: 31.2,
      transactions: 22,
      avgAmount: 8.9,
      color: "#0052FF",
    },
    {
      chain: "Optimism",
      inflow: 67.8,
      outflow: 78.4,
      netFlow: -10.6,
      transactions: 19,
      avgAmount: 7.2,
      color: "#FF0420",
    },
  ]);

  const [watchedAddresses, setWatchedAddresses] = useState<WatchedAddress[]>([
    {
      id: "addr_001",
      address: "0x1234567890123456789012345678901234567890",
      name: "Whale Wallet #1",
      chains: ["Ethereum", "Arbitrum", "Polygon"],
      alertThreshold: 50,
      isActive: true,
    },
    {
      id: "addr_002",
      address: "0x9876543210987654321098765432109876543210",
      name: "Suspicious Address",
      chains: ["Ethereum", "Base"],
      alertThreshold: 25,
      isActive: true,
    },
  ]);

  const [newWatchAddress, setNewWatchAddress] = useState({
    address: "",
    name: "",
    chains: [] as string[],
    alertThreshold: 50,
  });

  const [suspiciousAlerts, setSuspiciousAlerts] = useState<BridgeTransfer[]>(
    [],
  );

  // Real-time simulation of bridge transfers
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const chains = ["Ethereum", "Arbitrum", "Polygon", "Base", "Optimism"];
        const tokens = ["ETH", "USDC", "DAI", "WBTC"];
        const bridges = [
          "Arbitrum Bridge",
          "Polygon PoS Bridge",
          "Base Bridge",
          "Optimism Bridge",
          "Multichain",
          "Hop Protocol",
        ];

        const fromChain = chains[Math.floor(Math.random() * chains.length)];
        let toChain = chains[Math.floor(Math.random() * chains.length)];
        while (toChain === fromChain) {
          toChain = chains[Math.floor(Math.random() * chains.length)];
        }

        const amount = (Math.random() * 100 + 1).toFixed(2);
        const isSuspicious = parseFloat(amount) > 50 || Math.random() > 0.85;

        const newTransfer: BridgeTransfer = {
          id: `bridge_${Date.now()}`,
          fromChain,
          toChain,
          fromAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          toAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          amount,
          token: tokens[Math.floor(Math.random() * tokens.length)],
          bridgeProtocol: bridges[Math.floor(Math.random() * bridges.length)],
          txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          timestamp: new Date(),
          status: Math.random() > 0.8 ? "pending" : "completed",
          isSuspicious,
          suspiciousReasons: isSuspicious
            ? [
                ...(parseFloat(amount) > 50 ? ["Large amount (>50 ETH)"] : []),
                ...(Math.random() > 0.7 ? ["Unusual timing"] : []),
                ...(Math.random() > 0.8 ? ["New address"] : []),
                ...(Math.random() > 0.9 ? ["Multiple rapid transfers"] : []),
              ]
            : undefined,
          gasUsed: Math.floor(Math.random() * 200000) + 50000,
          bridgeFee: (Math.random() * 0.05 + 0.005).toFixed(4),
        };

        setBridgeTransfers((prev) => [newTransfer, ...prev.slice(0, 49)]);

        // Add to suspicious alerts if needed
        if (isSuspicious) {
          setSuspiciousAlerts((prev) => [newTransfer, ...prev.slice(0, 9)]);
        }

        // Update chain flows
        setChainFlows((prev) =>
          prev.map((flow) => {
            if (flow.chain === fromChain) {
              return {
                ...flow,
                outflow: flow.outflow + parseFloat(amount),
                netFlow: flow.inflow - (flow.outflow + parseFloat(amount)),
                transactions: flow.transactions + 1,
              };
            } else if (flow.chain === toChain) {
              return {
                ...flow,
                inflow: flow.inflow + parseFloat(amount),
                netFlow: flow.inflow + parseFloat(amount) - flow.outflow,
                transactions: flow.transactions + 1,
              };
            }
            return flow;
          }),
        );
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "suspicious":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const openTimeMachine = (transfer: BridgeTransfer) => {
    // Navigate to Time Machine tab with the specific transaction
    window.location.hash = "#time-machine";
    console.log(`Opening Time Machine for bridge transfer: ${transfer.txHash}`);
  };

  const addWatchedAddress = () => {
    if (!newWatchAddress.address || !newWatchAddress.name) return;

    const newAddress: WatchedAddress = {
      id: `addr_${Date.now()}`,
      address: newWatchAddress.address,
      name: newWatchAddress.name,
      chains: newWatchAddress.chains,
      alertThreshold: newWatchAddress.alertThreshold,
      isActive: true,
    };

    setWatchedAddresses((prev) => [...prev, newAddress]);
    setNewWatchAddress({
      address: "",
      name: "",
      chains: [],
      alertThreshold: 50,
    });
  };

  return (
    <Card className="cyber-card-enhanced group">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 cyber-glow">
          <Network className="w-5 h-5 text-purple-400 group-hover:animate-cyber-pulse" />
          CROSS-CHAIN BRIDGE MONITOR
        </CardTitle>
        <CardDescription>
          Real-time tracking of funds moving through major bridges with
          suspicious activity detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* TVL Flow Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-cyber-cyan flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              TVL Flow by Chain (24h)
            </h4>
            <div className="h-64 border border-cyber-cyan/20 rounded-lg bg-black/50">
              <ChartContainer
                config={{
                  inflow: {
                    label: "Inflow",
                    color: "#00ff00",
                  },
                  outflow: {
                    label: "Outflow",
                    color: "#ff6b6b",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer>
                  <BarChart data={chainFlows}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="chain"
                      stroke="rgba(0,255,255,0.7)"
                      fontSize={10}
                    />
                    <YAxis stroke="rgba(0,255,255,0.7)" fontSize={10} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-black/95 border border-cyber-cyan/30 rounded-lg p-3">
                              <div className="text-cyber-cyan font-medium">
                                {label}
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="text-green-400">
                                  Inflow: {data.inflow.toFixed(1)} ETH
                                </div>
                                <div className="text-red-400">
                                  Outflow: {data.outflow.toFixed(1)} ETH
                                </div>
                                <div className="text-cyan-400">
                                  Net: {data.netFlow.toFixed(1)} ETH
                                </div>
                                <div className="text-white">
                                  Transactions: {data.transactions}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="inflow"
                      fill="#00ff00"
                      fillOpacity={0.6}
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="outflow"
                      fill="#ff6b6b"
                      fillOpacity={0.6}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Chain Flow Summary */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-cyber-cyan flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Chain Flow Summary
            </h4>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {chainFlows.map((flow) => (
                  <div
                    key={flow.chain}
                    className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: flow.color }}
                        />
                        <span className="font-medium text-cyber-cyan text-sm">
                          {flow.chain}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {flow.netFlow > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span
                          className={`text-sm font-mono ${
                            flow.netFlow > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {flow.netFlow > 0 ? "+" : ""}
                          {flow.netFlow.toFixed(1)} ETH
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-cyber-cyan/60">In</div>
                        <div className="text-green-400 font-mono">
                          {flow.inflow.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-cyber-cyan/60">Out</div>
                        <div className="text-red-400 font-mono">
                          {flow.outflow.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-cyber-cyan/60">TXs</div>
                        <div className="text-cyber-cyan font-mono">
                          {flow.transactions}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Suspicious Activity Alerts */}
        {suspiciousAlerts.length > 0 && (
          <Alert className="border-orange-500/30 bg-orange-500/10">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-400">
              <div className="flex items-center justify-between">
                <span>
                  {suspiciousAlerts.length} suspicious bridge transfers detected
                  in the last hour
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  View All
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Add Watched Address */}
        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg space-y-4">
          <h4 className="text-sm font-medium text-purple-400">
            Add Address to Watch
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="0x... or ENS name"
              value={newWatchAddress.address}
              onChange={(e) =>
                setNewWatchAddress((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className="bg-black/70 border-purple-500/30 text-white font-mono focus:border-purple-500 focus:ring-purple-500/20"
            />
            <Input
              placeholder="Display name"
              value={newWatchAddress.name}
              onChange={(e) =>
                setNewWatchAddress((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="bg-black/70 border-purple-500/30 text-white focus:border-purple-500 focus:ring-purple-500/20"
            />
            <div className="space-y-2">
              <label className="text-xs text-purple-400">Alert Threshold</label>
              <Input
                type="number"
                placeholder="50"
                value={newWatchAddress.alertThreshold}
                onChange={(e) =>
                  setNewWatchAddress((prev) => ({
                    ...prev,
                    alertThreshold: parseFloat(e.target.value) || 50,
                  }))
                }
                className="bg-black/70 border-purple-500/30 text-white focus:border-purple-500 focus:ring-purple-500/20"
              />
              <div className="text-xs text-purple-400/60">ETH threshold</div>
            </div>
            <Button
              onClick={addWatchedAddress}
              disabled={!newWatchAddress.address || !newWatchAddress.name}
              className="btn-primary bg-purple-500 hover:bg-purple-600 font-mono"
            >
              <Shield className="w-4 h-4 mr-2" />
              Add Watch
            </Button>
          </div>
        </div>

        {/* Recent Bridge Transfers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-cyber-cyan flex items-center gap-2">
              <Network className="w-4 h-4" />
              Recent Bridge Transfers
            </h4>
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-400 border-green-500/40"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
              LIVE
            </Badge>
          </div>

          <ScrollArea className="h-80">
            <div className="space-y-3">
              {bridgeTransfers.slice(0, 20).map((transfer) => (
                <div
                  key={transfer.id}
                  className={`p-4 bg-cyber-cyan/5 border rounded-lg hover:bg-cyber-cyan/10 transition-all duration-300 cursor-pointer ${
                    transfer.isSuspicious
                      ? "border-orange-500/40 bg-orange-500/5"
                      : "border-cyber-cyan/20"
                  }`}
                  onClick={() => openTimeMachine(transfer)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(transfer.status)}>
                          {transfer.status.toUpperCase()}
                        </Badge>
                        {transfer.isSuspicious && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            SUSPICIOUS
                          </Badge>
                        )}
                        <span className="text-xs text-cyber-cyan/60">
                          {format(transfer.timestamp, "HH:mm:ss")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-cyber-cyan">
                          {transfer.fromChain}
                        </span>
                        <span className="text-cyber-cyan/60">→</span>
                        <span className="text-cyber-cyan">
                          {transfer.toChain}
                        </span>
                        <span className="text-purple-400 font-mono">
                          {transfer.amount} {transfer.token}
                        </span>
                      </div>

                      <div className="text-xs text-cyber-cyan/60 space-y-1">
                        <div>
                          Protocol: {transfer.bridgeProtocol} • Fee:{" "}
                          {transfer.bridgeFee} ETH
                        </div>
                        <div className="font-mono">{transfer.txHash}</div>
                        {transfer.suspiciousReasons && (
                          <div className="text-orange-400">
                            Suspicious: {transfer.suspiciousReasons.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {transfer.isSuspicious && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 h-8 w-8 p-0"
                          title="Suspicious Activity"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-8 w-8 p-0"
                        title="Open in Time Machine"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTimeMachine(transfer);
                        }}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 h-8 w-8 p-0"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {bridgeTransfers.length === 0 && (
                <div className="text-center py-8 text-cyber-cyan/60">
                  No bridge transfers detected yet. Monitor is active and
                  waiting for activity.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Watched Addresses */}
        {watchedAddresses.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Watched Addresses ({watchedAddresses.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {watchedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-400 text-sm">
                      {addr.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs text-purple-400 border-purple-400/40"
                    >
                      ≥{addr.alertThreshold} ETH
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-purple-400/60">Address</div>
                    <div className="font-mono text-purple-400 truncate">
                      {addr.address}
                    </div>
                    <div className="text-purple-400/60">Chains</div>
                    <div className="flex gap-1 flex-wrap">
                      {addr.chains.map((chain) => (
                        <Badge
                          key={chain}
                          variant="outline"
                          className="text-xs text-purple-400/80 border-purple-400/30"
                        >
                          {chain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
