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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeftRight,
  DollarSign,
  Clock,
  CheckCircle,
  Globe,
  Send,
  History,
} from "lucide-react";

interface BridgeTransfer {
  id: string;
  fromChain: string;
  toChain: string;
  asset: string;
  amount: string;
  status: "pending" | "completed" | "failed";
  timestamp: string;
  estimatedTime: string;
}

export default function Bridge() {
  const [bridgeTransfers, setBridgeTransfers] = useState<BridgeTransfer[]>([]);
  const [bridgeForm, setBridgeForm] = useState({
    fromChain: "ethereum",
    toChain: "polygon",
    asset: "ETH",
    amount: "",
  });

  return (
    <div className="space-y-8">
      {/* Cross-Chain Analytics Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <ArrowLeftRight className="w-8 h-8 text-purple-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-purple-400 font-mono mb-1">
              {bridgeTransfers.length}
            </div>
            <div className="text-xs text-purple-400/70 uppercase tracking-wide">
              Total Transfers
            </div>
            <div className="text-xs text-green-400 mt-1">
              +{Math.floor(Math.random() * 3 + 1)} today
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-green-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              $
              {(
                bridgeTransfers.length * 1247.5 +
                Math.random() * 10000
              ).toLocaleString()}
            </div>
            <div className="text-xs text-green-400/70 uppercase tracking-wide">
              Volume (24h)
            </div>
            <div className="text-xs text-green-400 mt-1">
              +15.7% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-blue-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {Math.floor(Math.random() * 5 + 2)}m
            </div>
            <div className="text-xs text-blue-400/70 uppercase tracking-wide">
              Avg Transfer Time
            </div>
            <div className="text-xs text-blue-400 mt-1">Across all chains</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-cyan-400 animate-cyber-pulse" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-1">
              {bridgeTransfers.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
              Successful
            </div>
            <div className="text-xs text-cyan-400 mt-1">99.8% success rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Multi-Chain Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-glow">
            <Globe className="w-5 h-5 text-cyber-cyan animate-cyber-pulse" />
            MULTI-CHAIN NETWORK STATUS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "Ethereum",
                symbol: "ETH",
                color: "blue",
                health: 98,
                fees: "$12.45",
              },
              {
                name: "Polygon",
                symbol: "MATIC",
                color: "purple",
                health: 99,
                fees: "$0.03",
              },
              {
                name: "Arbitrum",
                symbol: "ARB",
                color: "orange",
                health: 97,
                fees: "$0.82",
              },
              {
                name: "Optimism",
                symbol: "OP",
                color: "red",
                health: 96,
                fees: "$0.45",
              },
              {
                name: "BSC",
                symbol: "BNB",
                color: "yellow",
                health: 94,
                fees: "$0.15",
              },
              {
                name: "Avalanche",
                symbol: "AVAX",
                color: "pink",
                health: 95,
                fees: "$0.21",
              },
            ].map((chain) => (
              <div
                key={chain.name}
                className="p-4 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${chain.color}-400 animate-cyber-pulse`}
                    />
                    <span className="font-medium text-cyber-cyan">
                      {chain.name}
                    </span>
                  </div>
                  <span className="text-xs text-cyber-cyan/60">
                    {chain.symbol}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyber-cyan/70">Health</span>
                    <span className="text-green-400 font-mono">
                      {chain.health}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cyber-cyan/70">Tx Fee</span>
                    <span className="text-yellow-400 font-mono">
                      {chain.fees}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Transfer */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <ArrowLeftRight className="w-5 h-5 text-purple-400 group-hover:animate-cyber-pulse" />
              CROSS-CHAIN BRIDGE
            </CardTitle>
            <CardDescription>
              Transfer assets between different blockchains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Chain</label>
                <Select
                  value={bridgeForm.fromChain}
                  onValueChange={(value) =>
                    setBridgeForm((prev) => ({
                      ...prev,
                      fromChain: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Chain</label>
                <Select
                  value={bridgeForm.toChain}
                  onValueChange={(value) =>
                    setBridgeForm((prev) => ({ ...prev, toChain: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset</label>
              <Select
                value={bridgeForm.asset}
                onValueChange={(value) =>
                  setBridgeForm((prev) => ({ ...prev, asset: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="WBTC">WBTC</SelectItem>
                  <SelectItem value="DAI">DAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="0.0"
                value={bridgeForm.amount}
                onChange={(e) =>
                  setBridgeForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />
            </div>
            <Button
              onClick={() => {
                if (
                  bridgeForm.amount &&
                  bridgeForm.fromChain !== bridgeForm.toChain
                ) {
                  const transfer: BridgeTransfer = {
                    id: `bridge_${Date.now()}`,
                    ...bridgeForm,
                    status: "pending",
                    timestamp: new Date().toLocaleString(),
                    estimatedTime: "5-10 minutes",
                  };
                  setBridgeTransfers((prev) => [transfer, ...prev]);
                  setBridgeForm((prev) => ({ ...prev, amount: "" }));
                }
              }}
              disabled={
                !bridgeForm.amount ||
                bridgeForm.fromChain === bridgeForm.toChain
              }
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Initiate Transfer
            </Button>
          </CardContent>
        </Card>

        {/* Transfer History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transfer History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {bridgeTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {transfer.fromChain}
                        </span>
                        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {transfer.toChain}
                        </span>
                      </div>
                      <Badge
                        variant={
                          transfer.status === "completed"
                            ? "default"
                            : transfer.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Asset:</span>
                        <div className="font-medium">{transfer.asset}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">{transfer.amount}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transfer.timestamp} • Est. {transfer.estimatedTime}
                    </div>
                  </div>
                ))}
                {bridgeTransfers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No transfers yet. Start your first cross-chain transfer
                    above.
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
