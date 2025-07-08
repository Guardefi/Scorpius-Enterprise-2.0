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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Activity,
  Filter,
  Clock,
  Shield,
  Coins,
  AlertTriangle,
  Eye,
  ExternalLink,
  BarChart3,
  Zap,
  Target,
  Settings,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface BlockchainEvent {
  id: string;
  type:
    | "OwnershipTransferred"
    | "Paused"
    | "Unpaused"
    | "Transfer"
    | "Mint"
    | "Burn"
    | "RoleGranted"
    | "RoleRevoked"
    | "ProposalCreated"
    | "VoteCast"
    | "EmergencyStop";
  contractAddress: string;
  contractName: string;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  from?: string;
  to?: string;
  value?: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  tags: string[];
  gasUsed: number;
  gasPrice: string;
  rawLogData?: any;
}

interface EventFilter {
  eventType: string;
  contractTag: string;
  severity: string;
  timeRange: string;
}

interface EventStats {
  hour: string;
  events: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export function OnChainEventStream() {
  const [events, setEvents] = useState<BlockchainEvent[]>([
    {
      id: "evt_001",
      type: "OwnershipTransferred",
      contractAddress: "0x1234567890123456789012345678901234567890",
      contractName: "USDC Token",
      txHash: "0xabcd...ef01",
      blockNumber: 18450234,
      timestamp: new Date(Date.now() - 120000),
      from: "0x1111...2222",
      to: "0x3333...4444",
      severity: "critical",
      description: "Ownership transferred to new address",
      tags: ["governance", "defi", "stablecoin"],
      gasUsed: 45000,
      gasPrice: "25.5",
      rawLogData: {
        topics: [
          "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
          "0x0000000000000000000000001111111111111111111111111111111111111111",
          "0x0000000000000000000000003333333333333333333333333333333333333333",
        ],
        data: "0x",
      },
    },
    {
      id: "evt_002",
      type: "Burn",
      contractAddress: "0x9876543210987654321098765432109876543210",
      contractName: "DAI Token",
      txHash: "0x1234...5678",
      blockNumber: 18450233,
      timestamp: new Date(Date.now() - 180000),
      from: "0x5555...6666",
      value: "1000000000000000000000000",
      severity: "high",
      description: "Large token burn: 1,000,000 DAI",
      tags: ["defi", "stablecoin", "burn"],
      gasUsed: 67000,
      gasPrice: "22.1",
      rawLogData: {
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x0000000000000000000000005555555555555555555555555555555555555555",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ],
        data: "0x00000000000000000000000000000000000000000000d3c21bcecceda1000000",
      },
    },
    {
      id: "evt_003",
      type: "Paused",
      contractAddress: "0xfedcba0987654321fedcba0987654321fedcba09",
      contractName: "Compound cUSDC",
      txHash: "0x9999...aaaa",
      blockNumber: 18450232,
      timestamp: new Date(Date.now() - 240000),
      from: "0x7777...8888",
      severity: "critical",
      description: "Contract paused by emergency admin",
      tags: ["defi", "lending", "emergency"],
      gasUsed: 34000,
      gasPrice: "28.7",
      rawLogData: {
        topics: [
          "0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258",
        ],
        data: "0x0000000000000000000000007777777777777777777777777777777777777777",
      },
    },
    {
      id: "evt_004",
      type: "Transfer",
      contractAddress: "0x1111222233334444555566667777888899990000",
      contractName: "WETH",
      txHash: "0xbbbb...cccc",
      blockNumber: 18450231,
      timestamp: new Date(Date.now() - 300000),
      from: "0x9999...aaaa",
      to: "0xbbbb...cccc",
      value: "50000000000000000000",
      severity: "medium",
      description: "Large transfer: 50 WETH",
      tags: ["defi", "wrapped-eth"],
      gasUsed: 21000,
      gasPrice: "20.3",
      rawLogData: {
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x0000000000000000000000009999999999999999999999999999999999999999",
          "0x000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        ],
        data: "0x0000000000000000000000000000000000000000000000002b5e3af16b1880000",
      },
    },
  ]);

  const [filteredEvents, setFilteredEvents] =
    useState<BlockchainEvent[]>(events);
  const [selectedEvent, setSelectedEvent] = useState<BlockchainEvent | null>(
    null,
  );
  const [isRawLogOpen, setIsRawLogOpen] = useState(false);

  const [filter, setFilter] = useState<EventFilter>({
    eventType: "all",
    contractTag: "all",
    severity: "all",
    timeRange: "1h",
  });

  const [eventStats, setEventStats] = useState<EventStats[]>([
    { hour: "12:00", events: 34, critical: 2, high: 8, medium: 18, low: 6 },
    { hour: "13:00", events: 28, critical: 1, high: 5, medium: 15, low: 7 },
    { hour: "14:00", events: 45, critical: 3, high: 12, medium: 22, low: 8 },
    { hour: "15:00", events: 52, critical: 4, high: 15, medium: 25, low: 8 },
    { hour: "16:00", events: 38, critical: 2, high: 9, medium: 20, low: 7 },
    { hour: "17:00", events: 41, critical: 3, high: 11, medium: 19, low: 8 },
  ]);

  const [watchedContracts] = useState([
    { address: "0x1234...7890", name: "USDC Token", tag: "stablecoin" },
    { address: "0x9876...3210", name: "DAI Token", tag: "stablecoin" },
    { address: "0xfedc...ba09", name: "Compound cUSDC", tag: "lending" },
    { address: "0x1111...0000", name: "WETH", tag: "wrapped-eth" },
    { address: "0xaaaa...bbbb", name: "Uniswap V3", tag: "dex" },
  ]);

  // Real-time event simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const eventTypes: BlockchainEvent["type"][] = [
          "Transfer",
          "Mint",
          "Burn",
          "Paused",
          "OwnershipTransferred",
          "RoleGranted",
          "ProposalCreated",
        ];

        const severities: BlockchainEvent["severity"][] = [
          "low",
          "medium",
          "high",
          "critical",
        ];

        const newEvent: BlockchainEvent = {
          id: `evt_${Date.now()}`,
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          contractAddress:
            watchedContracts[
              Math.floor(Math.random() * watchedContracts.length)
            ].address,
          contractName:
            watchedContracts[
              Math.floor(Math.random() * watchedContracts.length)
            ].name,
          txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          blockNumber: Math.floor(Math.random() * 1000) + 18450000,
          timestamp: new Date(),
          severity: severities[Math.floor(Math.random() * severities.length)],
          description: "Real-time blockchain event detected",
          tags: ["live", "defi"],
          gasUsed: Math.floor(Math.random() * 100000) + 21000,
          gasPrice: (Math.random() * 50 + 10).toFixed(1),
        };

        setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [watchedContracts]);

  // Apply filters
  useEffect(() => {
    let filtered = events;

    if (filter.eventType !== "all") {
      filtered = filtered.filter((event) => event.type === filter.eventType);
    }

    if (filter.contractTag !== "all") {
      filtered = filtered.filter((event) =>
        event.tags.includes(filter.contractTag),
      );
    }

    if (filter.severity !== "all") {
      filtered = filtered.filter((event) => event.severity === filter.severity);
    }

    if (filter.timeRange !== "all") {
      const now = new Date();
      const timeRanges = {
        "1h": 60 * 60 * 1000,
        "6h": 6 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
      };
      const range = timeRanges[filter.timeRange as keyof typeof timeRanges];
      if (range) {
        filtered = filtered.filter(
          (event) => now.getTime() - event.timestamp.getTime() <= range,
        );
      }
    }

    setFilteredEvents(filtered);
  }, [events, filter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case "OwnershipTransferred":
        return <Shield className="w-4 h-4" />;
      case "Paused":
      case "Unpaused":
        return <AlertTriangle className="w-4 h-4" />;
      case "Mint":
      case "Burn":
        return <Coins className="w-4 h-4" />;
      case "Transfer":
        return <Zap className="w-4 h-4" />;
      case "RoleGranted":
      case "RoleRevoked":
        return <Target className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatValue = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value) / 1e18;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const openRawLogDialog = (event: BlockchainEvent) => {
    setSelectedEvent(event);
    setIsRawLogOpen(true);
  };

  return (
    <Card className="cyber-card-enhanced group">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 cyber-glow">
          <Activity className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
          ON-CHAIN EVENT STREAM
        </CardTitle>
        <CardDescription>
          Live feed of critical blockchain events for early warning detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyber-cyan" />
            <Select
              value={filter.eventType}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, eventType: value }))
              }
            >
              <SelectTrigger className="w-40 bg-black/70 border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:ring-cyber-cyan/20">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent className="bg-black border-cyber-cyan/30">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="OwnershipTransferred">Ownership</SelectItem>
                <SelectItem value="Paused">Pause/Unpause</SelectItem>
                <SelectItem value="Transfer">Transfers</SelectItem>
                <SelectItem value="Mint">Mints</SelectItem>
                <SelectItem value="Burn">Burns</SelectItem>
                <SelectItem value="RoleGranted">Role Changes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={filter.contractTag}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, contractTag: value }))
            }
          >
            <SelectTrigger className="w-40 bg-black/70 border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:ring-cyber-cyan/20">
              <SelectValue placeholder="Contract Tag" />
            </SelectTrigger>
            <SelectContent className="bg-black border-cyber-cyan/30">
              <SelectItem value="all">All Contracts</SelectItem>
              <SelectItem value="defi">DeFi</SelectItem>
              <SelectItem value="stablecoin">Stablecoins</SelectItem>
              <SelectItem value="lending">Lending</SelectItem>
              <SelectItem value="dex">DEX</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.severity}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, severity: value }))
            }
          >
            <SelectTrigger className="w-40 bg-black/70 border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:ring-cyber-cyan/20">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-black border-cyber-cyan/30">
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.timeRange}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, timeRange: value }))
            }
          >
            <SelectTrigger className="w-32 bg-black/70 border-cyber-cyan/30 text-white focus:border-cyber-cyan focus:ring-cyber-cyan/20">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent className="bg-black border-cyber-cyan/30">
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-500/20 text-green-400 border-green-500/40"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
                  LIVE
                </Badge>
                <span className="text-sm text-cyber-cyan/60">
                  {filteredEvents.length} events
                </span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  /* Refresh logic */
                }}
                className="text-cyber-cyan hover:bg-cyber-cyan/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg hover:bg-cyber-cyan/10 transition-all duration-300 group cursor-pointer"
                    onClick={() => openRawLogDialog(event)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div
                          className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}
                        >
                          {getEventIcon(event.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-cyber-cyan">
                            {event.type}
                          </span>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs text-cyber-cyan/60"
                          >
                            Block {event.blockNumber}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-cyber-cyan/80">
                            {event.description}
                          </div>
                          <div className="text-xs text-cyber-cyan/60">
                            <span className="font-mono">
                              {event.contractName}
                            </span>{" "}
                            • <span className="font-mono">{event.txHash}</span>
                          </div>
                          <div className="text-xs text-cyber-cyan/60">
                            {format(event.timestamp, "HH:mm:ss")} •{" "}
                            {event.gasUsed.toLocaleString()} gas •{" "}
                            {event.gasPrice} gwei
                          </div>
                        </div>

                        {event.value && (
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className="text-yellow-400 border-yellow-400/40"
                            >
                              {formatValue(event.value)} tokens
                            </Badge>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-1">
                            {event.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs text-cyber-cyan/60 border-cyber-cyan/30"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <Eye className="w-4 h-4 text-cyber-cyan/60 group-hover:text-cyber-cyan transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-cyber-cyan/60">
                    No events match the current filters.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Events Per Hour Chart */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-cyber-cyan flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Events Per Hour
              </h4>
              <div className="h-48 border border-cyber-cyan/20 rounded-lg bg-black/50">
                <ChartContainer
                  config={{
                    events: {
                      label: "Events",
                      color: "#00ffff",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer>
                    <LineChart data={eventStats}>
                      <XAxis
                        dataKey="hour"
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
                                  {label}:00
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="text-white">
                                    Total: {data.events} events
                                  </div>
                                  <div className="text-red-400">
                                    Critical: {data.critical}
                                  </div>
                                  <div className="text-orange-400">
                                    High: {data.high}
                                  </div>
                                  <div className="text-yellow-400">
                                    Medium: {data.medium}
                                  </div>
                                  <div className="text-blue-400">
                                    Low: {data.low}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="events"
                        stroke="#00ffff"
                        strokeWidth={2}
                        dot={{ fill: "#00ffff", strokeWidth: 0, r: 3 }}
                        activeDot={{
                          r: 5,
                          stroke: "#00ffff",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Watched Contracts */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-cyber-cyan flex items-center gap-2">
                <Target className="w-4 h-4" />
                Watched Contracts
              </h4>
              <div className="space-y-2">
                {watchedContracts.slice(0, 5).map((contract) => (
                  <div
                    key={contract.address}
                    className="flex items-center justify-between p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded text-xs hover:bg-cyber-cyan/10 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-mono text-cyber-cyan/80">
                        {contract.name}
                      </div>
                      <div className="text-cyber-cyan/60">
                        {contract.address}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs text-cyber-cyan/60"
                    >
                      {contract.tag}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Log Data Dialog */}
        <Dialog open={isRawLogOpen} onOpenChange={setIsRawLogOpen}>
          <DialogContent className="max-w-4xl bg-black border-cyber-cyan/30">
            <DialogHeader>
              <DialogTitle className="text-cyber-cyan">
                Raw Log Data
              </DialogTitle>
              <DialogDescription>
                Detailed blockchain event information and raw log data
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-black/50">
                  <TabsTrigger
                    value="details"
                    className="font-mono text-xs data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan"
                  >
                    Event Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="raw"
                    className="font-mono text-xs data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan"
                  >
                    Raw Log Data
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-cyber-cyan">
                        Event Type
                      </label>
                      <div className="p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded font-mono text-sm">
                        {selectedEvent.type}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-cyber-cyan">
                        Severity
                      </label>
                      <Badge
                        className={getSeverityColor(selectedEvent.severity)}
                      >
                        {selectedEvent.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-cyber-cyan">
                        Contract
                      </label>
                      <div className="p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded font-mono text-sm">
                        {selectedEvent.contractName}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-cyber-cyan">
                        Block Number
                      </label>
                      <div className="p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded font-mono text-sm">
                        {selectedEvent.blockNumber}
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-cyber-cyan">
                        Transaction Hash
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded font-mono text-sm flex-1">
                          {selectedEvent.txHash}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="raw" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyber-cyan">
                      Raw Log Topics & Data
                    </label>
                    <pre className="p-4 bg-black/80 border border-cyber-cyan/20 rounded-lg text-xs font-mono text-cyber-cyan/90 overflow-auto max-h-80">
                      {JSON.stringify(selectedEvent.rawLogData, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
