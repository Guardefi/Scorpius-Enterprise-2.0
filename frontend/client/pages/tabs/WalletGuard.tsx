import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Zap,
  Info,
  ExternalLink,
  RefreshCw,
  History,
  TrendingUp,
  Eye,
  Lock,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Bell,
  Download,
  Copy,
  MessageSquare,
  Mail,
  Send,
  Settings,
  BarChart3,
  PieChart,
  TrendingDown,
  Calendar,
  Clock,
  FileX,
  AlertCircle,
  CheckCircle,
  Gauge,
  Target,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useWalletCheck, useWalletRevoke, useWalletHistory } from "@/hooks";
import {
  WalletCheckRequest,
  TokenApproval,
  RevokeRequest,
  WalletScanHistory,
} from "@/lib/api/types";
import { toast } from "sonner";

// Types for enhanced features
interface ChainOption {
  id: string;
  name: string;
  chainId: number;
  icon: string;
}

interface FilterOptions {
  riskLevel: string[];
  tokenType: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface NotificationSettings {
  slack: boolean;
  telegram: boolean;
  email: boolean;
  slackWebhook?: string;
  telegramBotToken?: string;
  emailAddress?: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  severity: "info" | "warning" | "error";
}

// Chain configurations
const SUPPORTED_CHAINS: ChainOption[] = [
  { id: "ethereum", name: "Ethereum", chainId: 1, icon: "⚡" },
  { id: "bsc", name: "BSC", chainId: 56, icon: "🟡" },
  { id: "arbitrum", name: "Arbitrum", chainId: 42161, icon: "🔷" },
  { id: "polygon", name: "Polygon", chainId: 137, icon: "🟣" },
  { id: "optimism", name: "Optimism", chainId: 10, icon: "🔴" },
];

// Mock data for charts
const mockTimelineData = [
  { date: "2024-01", approvals: 5, risk: 20 },
  { date: "2024-02", approvals: 8, risk: 35 },
  { date: "2024-03", approvals: 12, risk: 45 },
  { date: "2024-04", approvals: 15, risk: 65 },
  { date: "2024-05", approvals: 18, risk: 70 },
  { date: "2024-06", approvals: 22, risk: 85 },
];

const mockRiskDistribution = [
  { name: "Low", value: 45, color: "#10b981" },
  { name: "Medium", value: 30, color: "#f59e0b" },
  { name: "High", value: 20, color: "#ef4444" },
  { name: "Critical", value: 5, color: "#dc2626" },
];

const mockChainUsage = [
  { chain: "Ethereum", percentage: 70, value: 14 },
  { chain: "BSC", percentage: 20, value: 4 },
  { chain: "Arbitrum", percentage: 10, value: 2 },
];

export default function WalletGuard() {
  // State management
  const [address, setAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState<ChainOption>(
    SUPPORTED_CHAINS[0],
  );
  const [scanResult, setScanResult] = useState<any>(null);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    riskLevel: [],
    tokenType: [],
    sortBy: "risk_level",
    sortOrder: "desc",
  });
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedApproval, setSelectedApproval] =
    useState<TokenApproval | null>(null);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      slack: false,
      telegram: false,
      email: false,
    });
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: "Wallet Scanned",
      details: "0x742d...1345eF - 15 approvals found",
      severity: "info",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      action: "Approval Revoked",
      details: "USDC approval to 0xSpam...123 revoked",
      severity: "info",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      action: "High Risk Detected",
      details: "Unlimited approval to suspicious contract",
      severity: "warning",
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hooks
  const walletCheckMutation = useWalletCheck();
  const walletRevokeMutation = useWalletRevoke();
  const { data: walletHistory } = useWalletHistory(
    isValidAddress ? address : undefined,
  );

  // Address validation
  const validateAddress = (addr: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(addr) || addr.endsWith(".eth");
    setIsValidAddress(isValid);
    return isValid;
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    validateAddress(value);
  };

  // Scan wallet
  const handleScan = async () => {
    if (!isValidAddress) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    const request: WalletCheckRequest = {
      address,
      chain_id: selectedChain.chainId,
      include_nfts: false,
    };

    try {
      const result = await walletCheckMutation.mutateAsync(request);
      setScanResult(result);
      setLastChecked(new Date());

      // Add to audit log
      const newLogEntry: AuditLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: "Wallet Scanned",
        details: `${address.slice(0, 6)}...${address.slice(-6)} - ${result.total_approvals} approvals found`,
        severity:
          result.risk_level === "high" || result.risk_level === "critical"
            ? "warning"
            : "info",
      };
      setAuditLog((prev) => [newLogEntry, ...prev]);

      toast.success("Wallet scan completed successfully");
    } catch (error: any) {
      toast.error(`Scan failed: ${error.message || "Unknown error"}`);
    }
  };

  // Revoke approval
  const handleRevoke = async (approval: TokenApproval) => {
    const request: RevokeRequest = {
      address,
      token_contract: approval.contract_address,
      spender: approval.spender,
      chain_id: selectedChain.chainId,
    };

    try {
      const result = await walletRevokeMutation.mutateAsync(request);

      // Add to audit log
      const newLogEntry: AuditLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: "Approval Revoked",
        details: `${approval.token} approval to ${approval.spender.slice(0, 6)}...${approval.spender.slice(-6)} revoked`,
        severity: "info",
      };
      setAuditLog((prev) => [newLogEntry, ...prev]);

      toast.success(result.message || "Revocation submitted successfully");
      handleScan(); // Refresh scan
    } catch (error: any) {
      toast.error(`Revocation failed: ${error.message || "Unknown error"}`);
    }
  };

  // Filter and sort approvals
  const getFilteredApprovals = () => {
    if (!scanResult?.approvals) return [];

    let filtered = [...scanResult.approvals];

    // Apply risk level filter
    if (filterOptions.riskLevel.length > 0) {
      filtered = filtered.filter((approval) =>
        filterOptions.riskLevel.includes(approval.risk_level),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[filterOptions.sortBy as keyof TokenApproval];
      const bVal = b[filterOptions.sortBy as keyof TokenApproval];

      if (filterOptions.sortOrder === "asc") {
        return aVal < bVal ? -1 : 1;
      } else {
        return aVal > bVal ? -1 : 1;
      }
    });

    return filtered;
  };

  const paginatedApprovals = getFilteredApprovals().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(getFilteredApprovals().length / itemsPerPage);

  // Risk score utilities
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return <XCircle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Less than 1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateAddress = (addr: string, chars = 6) => {
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
  };

  // Test notification
  const testNotification = (type: keyof NotificationSettings) => {
    toast.success(
      `${type.charAt(0).toUpperCase() + type.slice(1)} test notification sent!`,
    );
  };

  // Calculate risk breakdown
  const getRiskBreakdown = () => {
    if (!scanResult) return { approvals: 0, drainerSigs: 0, spoofedTokens: 0 };

    const total = scanResult.risk_score;
    return {
      approvals: Math.round(total * 0.45),
      drainerSigs: Math.round(total * 0.3),
      spoofedTokens: Math.round(total * 0.25),
    };
  };

  const riskBreakdown = getRiskBreakdown();

  return (
    <div className="space-y-6">
      {/* Top: Wallet Lookup */}
      <Card className="cyber-card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-glow">
            <Search className="h-5 w-5 text-cyber-cyan" />
            Wallet Lookup
          </CardTitle>
          <CardDescription className="text-cyber-cyan/60">
            Search wallet address with ENS support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main search bar */}
            <div className="lg:col-span-6 space-y-2">
              <Label htmlFor="wallet-address" className="text-cyber-cyan">
                Wallet Address / ENS
              </Label>
              <div className="flex gap-2">
                <Input
                  id="wallet-address"
                  placeholder="0x... or vitalik.eth"
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className={`flex-1 bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 ${
                    address && !isValidAddress ? "border-red-500" : ""
                  }`}
                />
                <Button
                  onClick={handleScan}
                  disabled={!isValidAddress || walletCheckMutation.isPending}
                  className="px-6 btn-primary font-mono uppercase tracking-wide"
                >
                  {walletCheckMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {walletCheckMutation.isPending ? "Scanning..." : "Scan"}
                </Button>
              </div>
              {address && !isValidAddress && (
                <p className="text-sm text-red-400">
                  Please enter a valid address (0x...) or ENS name (.eth)
                </p>
              )}
            </div>

            {/* Chain selection */}
            <div className="lg:col-span-3 space-y-2">
              <Label className="text-cyber-cyan">Chain</Label>
              <Select
                value={selectedChain.id}
                onValueChange={(value) => {
                  const chain = SUPPORTED_CHAINS.find((c) => c.id === value);
                  if (chain) setSelectedChain(chain);
                }}
              >
                <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-cyber-cyan/30">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem
                      key={chain.id}
                      value={chain.id}
                      className="text-cyber-cyan"
                    >
                      <span className="flex items-center gap-2">
                        <span>{chain.icon}</span>
                        {chain.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Last checked and refresh */}
            <div className="lg:col-span-3 space-y-2">
              <Label className="text-cyber-cyan">Last Checked</Label>
              <div className="flex items-center gap-2 p-2 bg-black/50 rounded border border-cyber-cyan/30">
                <Clock className="h-4 w-4 text-cyber-cyan/60" />
                <span className="text-sm text-cyber-cyan/80 font-mono">
                  {lastChecked
                    ? formatTime(lastChecked.toISOString())
                    : "Never"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScan}
                  disabled={!isValidAddress || walletCheckMutation.isPending}
                  className="ml-auto p-1 h-6 w-6 btn-secondary"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleAddressChange(
                  "0x742d35Cc6431C8BF3240C39B6969E3C77e1345eF",
                )
              }
              className="btn-secondary text-xs"
            >
              Demo Wallet 1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddressChange("vitalik.eth")}
              className="btn-secondary text-xs"
            >
              Vitalik.eth
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleAddressChange(
                  "0x9F8b2C4D5E6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C",
                )
              }
              className="btn-secondary text-xs"
            >
              Demo Wallet 2
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bay 1: Wallet Risk Overview */}
      {scanResult && (
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="cyber-glow">📊 Wallet Risk Overview</span>
              <Button
                onClick={handleScan}
                disabled={walletCheckMutation.isPending}
                className="btn-secondary"
                size="sm"
              >
                Re-run Analysis
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Risk Score */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(0,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#00ffff"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${scanResult.risk_score * 2.51} ${251 - scanResult.risk_score * 2.51}`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                      className="animate-cyber-glow"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-3xl font-bold text-cyber-cyan">
                      {scanResult.risk_score}
                    </div>
                    <div className="text-sm text-cyber-cyan/60">/100</div>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold cyber-glow">
                    Overall Risk Score
                  </div>
                  <Badge
                    variant={
                      scanResult.risk_level === "low"
                        ? "default"
                        : "destructive"
                    }
                    className={`${getRiskColor(scanResult.risk_level)} border-current mt-2`}
                  >
                    <span className="flex items-center gap-1">
                      <ChevronDown className="h-3 w-3" />
                      {scanResult.risk_level.toUpperCase()} RISK
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Risk Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold cyber-glow">
                  Risk Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cyber-cyan/80">
                      Approvals ({riskBreakdown.approvals}%)
                    </span>
                    <Progress
                      value={riskBreakdown.approvals}
                      className="w-20 h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cyber-cyan/80">
                      Drainer sigs ({riskBreakdown.drainerSigs}%)
                    </span>
                    <Progress
                      value={riskBreakdown.drainerSigs}
                      className="w-20 h-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cyber-cyan/80">
                      Spoofed tokens ({riskBreakdown.spoofedTokens}%)
                    </span>
                    <Progress
                      value={riskBreakdown.spoofedTokens}
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-cyber-cyan/5 rounded-lg border border-cyber-cyan/20">
                  <div className="text-2xl font-bold text-cyber-cyan">
                    {scanResult.total_approvals}
                  </div>
                  <div className="text-sm text-cyber-cyan/60">
                    Total Approvals
                  </div>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-2xl font-bold text-red-400">
                    {scanResult.high_risk_approvals}
                  </div>
                  <div className="text-sm text-red-400/60">High Risk</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bay 2: Approval Findings Table */}
      {scanResult && (
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="cyber-glow">📜 Approval Findings</CardTitle>

              {/* Filters and Actions */}
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filterOptions.riskLevel.join(",")}
                  onValueChange={(value) => {
                    setFilterOptions((prev) => ({
                      ...prev,
                      riskLevel: value ? value.split(",") : [],
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-40 bg-black/70 border-cyber-cyan/30">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter Risk" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-cyber-cyan/30">
                    <SelectItem value="" className="text-cyber-cyan">
                      All Risks
                    </SelectItem>
                    <SelectItem value="critical" className="text-red-400">
                      Critical Only
                    </SelectItem>
                    <SelectItem value="high" className="text-orange-400">
                      High Only
                    </SelectItem>
                    <SelectItem value="high,critical" className="text-red-400">
                      High + Critical
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = `Token,Spender,Allowance,Risk,Last Used,Value at Risk\n${getFilteredApprovals()
                      .map(
                        (approval) =>
                          `${approval.token},${approval.spender},${approval.is_unlimited ? "Unlimited" : "Limited"},${approval.risk_level},${approval.last_updated},${approval.value_at_risk || "N/A"}`,
                      )
                      .join("\n")}`;
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `wallet-approvals-${address.slice(0, 6)}.csv`;
                    a.click();
                    toast.success("CSV exported successfully");
                  }}
                  className="btn-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyber-cyan/30">
                    <TableHead
                      className="text-cyber-cyan cursor-pointer"
                      onClick={() => {
                        setFilterOptions((prev) => ({
                          ...prev,
                          sortBy: "token",
                          sortOrder:
                            prev.sortBy === "token" && prev.sortOrder === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Token <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-cyber-cyan">
                      Spender Address
                    </TableHead>
                    <TableHead className="text-cyber-cyan">Allowance</TableHead>
                    <TableHead
                      className="text-cyber-cyan cursor-pointer"
                      onClick={() => {
                        setFilterOptions((prev) => ({
                          ...prev,
                          sortBy: "risk_level",
                          sortOrder:
                            prev.sortBy === "risk_level" &&
                            prev.sortOrder === "desc"
                              ? "asc"
                              : "desc",
                        }));
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Risk <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-cyber-cyan">Last Used</TableHead>
                    <TableHead className="text-cyber-cyan">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApprovals.map((approval, index) => (
                    <TableRow
                      key={index}
                      className="border-cyber-cyan/20 hover:bg-cyber-cyan/5"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-cyber-cyan">
                            {approval.token}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <ExternalLink className="h-3 w-3 text-cyber-cyan/60" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">
                                  {approval.contract_address}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm text-cyber-cyan/80">
                          {truncateAddress(approval.spender)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            approval.is_unlimited ? "destructive" : "secondary"
                          }
                          className={
                            approval.is_unlimited
                              ? "text-red-400 border-red-400"
                              : "text-cyber-cyan border-cyber-cyan"
                          }
                        >
                          {approval.is_unlimited ? "∞" : "Limited"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${getRiskColor(approval.risk_level)}`}
                        >
                          {getRiskIcon(approval.risk_level)}
                          <span className="capitalize text-sm">
                            {approval.risk_level === "critical"
                              ? "🔴"
                              : approval.risk_level === "high"
                                ? "🟠"
                                : approval.risk_level === "medium"
                                  ? "🟡"
                                  : "🟢"}{" "}
                            {approval.risk_level}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-cyber-cyan/80">
                          {formatTime(approval.last_updated)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(approval)}
                            disabled={walletRevokeMutation.isPending}
                            className="text-red-400 hover:text-red-300 border-red-400/30 hover:bg-red-400/10"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApproval(approval);
                              setShowDetailPanel(true);
                            }}
                            className="btn-secondary"
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="btn-secondary"
                >
                  Previous
                </Button>
                <span className="text-sm text-cyber-cyan/80">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                >
                  Next
                </Button>
              </div>
            )}

            {getFilteredApprovals().length === 0 && (
              <div className="text-center py-8 text-cyber-cyan/60">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No approvals found matching your filters.</p>
                <p className="text-sm">Try adjusting your filter settings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bay 3: Detail Pane (Slide-in Sheet) */}
      <Sheet open={showDetailPanel} onOpenChange={setShowDetailPanel}>
        <SheetContent className="w-full sm:max-w-xl bg-black border-cyber-cyan/30">
          <SheetHeader>
            <SheetTitle className="cyber-glow">🔍 Approval Details</SheetTitle>
            <SheetDescription className="text-cyber-cyan/60">
              Detailed analysis and revoke transaction generator
            </SheetDescription>
          </SheetHeader>

          {selectedApproval && (
            <div className="space-y-6 mt-6">
              {/* Token Metadata */}
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="text-lg cyber-glow">
                    Token Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-cyber-cyan/60">Symbol</Label>
                      <div className="text-cyber-cyan font-mono">
                        {selectedApproval.token}
                      </div>
                    </div>
                    <div>
                      <Label className="text-cyber-cyan/60">Risk Level</Label>
                      <div
                        className={`flex items-center gap-1 ${getRiskColor(selectedApproval.risk_level)}`}
                      >
                        {getRiskIcon(selectedApproval.risk_level)}
                        {selectedApproval.risk_level.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-cyber-cyan/60">
                      Contract Address
                    </Label>
                    <div className="flex items-center gap-2">
                      <code className="text-cyber-cyan font-mono text-sm bg-black/50 p-1 rounded">
                        {selectedApproval.contract_address}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedApproval.contract_address,
                          );
                          toast.success("Address copied to clipboard");
                        }}
                        className="btn-secondary p-1 h-6 w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval History Chart */}
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="text-lg cyber-glow">
                    Approval History (90 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockTimelineData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(0,255,255,0.1)"
                        />
                        <XAxis dataKey="date" stroke="#00ffff" />
                        <YAxis stroke="#00ffff" />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.9)",
                            border: "1px solid rgba(0,255,255,0.3)",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="approvals"
                          stroke="#00ffff"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Revoke TX */}
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="text-lg cyber-glow">
                    Revoke Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-cyber-cyan/5 rounded-lg border border-cyber-cyan/20">
                    <Label className="text-cyber-cyan/60">Gas Estimate</Label>
                    <div className="text-lg font-mono text-cyber-cyan">
                      ~45,000 gas (~$2.50)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cyber-cyan/60">
                      Raw Transaction Data
                    </Label>
                    <div className="bg-black/50 p-3 rounded border border-cyber-cyan/30 font-mono text-xs text-cyber-cyan/80 max-h-32 overflow-y-auto">
                      {`{
  "to": "${selectedApproval.contract_address}",
  "data": "0xa9059cbb000000000000000000000000${selectedApproval.spender.slice(2)}0000000000000000000000000000000000000000000000000000000000000000",
  "gas": "45000",
  "gasPrice": "20000000000"
}`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRevoke(selectedApproval)}
                      disabled={walletRevokeMutation.isPending}
                      className="btn-primary flex-1"
                    >
                      {walletRevokeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Generate & Send Revoke TX
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const txData = `{"to":"${selectedApproval.contract_address}","data":"0xa9059cbb...","gas":"45000"}`;
                        navigator.clipboard.writeText(txData);
                        toast.success("Raw transaction copied to clipboard");
                      }}
                      className="btn-secondary"
                    >
                      Copy Raw TX
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bay 4: Notifications & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications Settings */}
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="cyber-glow">🔔 Alert Settings</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn-secondary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-cyber-cyan" />
                  <Label>Slack Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationSettings.slack}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        slack: checked,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification("slack")}
                    className="btn-secondary text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-cyber-cyan" />
                  <Label>Telegram Alerts</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationSettings.telegram}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        telegram: checked,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification("telegram")}
                    className="btn-secondary text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyber-cyan" />
                  <Label>Email Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        email: checked,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification("email")}
                    className="btn-secondary text-xs"
                  >
                    Test
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="cyber-glow">Recent Activity</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csvData = auditLog
                    .map(
                      (entry) =>
                        `${entry.timestamp},${entry.action},${entry.details},${entry.severity}`,
                    )
                    .join("\n");
                  const csv = `Timestamp,Action,Details,Severity\n${csvData}`;
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "audit-log.csv";
                  a.click();
                  toast.success("Audit log exported");
                }}
                className="btn-secondary"
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 bg-cyber-cyan/5 rounded-lg border border-cyber-cyan/20"
                >
                  <div className="mt-1">
                    {entry.severity === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    ) : entry.severity === "error" ? (
                      <XCircle className="h-4 w-4 text-red-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cyber-cyan">
                      {entry.action}
                    </div>
                    <div className="text-xs text-cyber-cyan/60 break-words">
                      {entry.details}
                    </div>
                    <div className="text-xs text-cyber-cyan/40 mt-1">
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bay 5: Analytics Snapshot */}
      {scanResult && (
        <Card className="cyber-card-enhanced">
          <CardHeader>
            <CardTitle className="cyber-glow">📈 Analytics Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Approvals Over Time */}
              <div>
                <h3 className="text-lg font-semibold text-cyber-cyan mb-4">
                  Approvals Timeline
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTimelineData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,255,255,0.1)"
                      />
                      <XAxis dataKey="date" stroke="#00ffff" fontSize={10} />
                      <YAxis stroke="#00ffff" fontSize={10} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(0,255,255,0.3)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="approvals"
                        stroke="#00ffff"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-cyber-cyan mb-4">
                  Risk Distribution
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <RechartsPieChart
                        data={mockRiskDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                      >
                        {mockRiskDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(0,255,255,0.3)",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {mockRiskDistribution.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-cyber-cyan/80">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chains in Use */}
              <div>
                <h3 className="text-lg font-semibold text-cyber-cyan mb-4">
                  Chains in Use
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChainUsage}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,255,255,0.1)"
                      />
                      <XAxis dataKey="chain" stroke="#00ffff" fontSize={10} />
                      <YAxis stroke="#00ffff" fontSize={10} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(0,255,255,0.3)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="percentage" fill="#00ffff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 mt-2">
                  {mockChainUsage.map((item) => (
                    <div
                      key={item.chain}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-cyber-cyan/80">{item.chain}</span>
                      <span className="text-cyber-cyan">
                        {item.percentage}% ({item.value} approvals)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {walletCheckMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="cyber-card-enhanced">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyber-cyan" />
                    <span className="text-sm text-cyber-cyan">
                      Analyzing wallet security across {selectedChain.name}...
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-cyber-cyan/20" />
                    <Skeleton className="h-4 w-3/4 bg-cyber-cyan/20" />
                    <Skeleton className="h-4 w-1/2 bg-cyber-cyan/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
