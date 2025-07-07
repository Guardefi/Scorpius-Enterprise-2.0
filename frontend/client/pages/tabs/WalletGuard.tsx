import React, { useState } from "react";
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
} from "lucide-react";
import { useWalletCheck, useWalletRevoke, useWalletHistory } from "@/hooks";
import {
  WalletCheckRequest,
  TokenApproval,
  RevokeRequest,
} from "@/lib/api/types";
import { toast } from "sonner";

interface WalletScannerProps {
  className?: string;
  onScanComplete?: (result: any) => void;
  defaultAddress?: string;
}

export function WalletScanner({
  className,
  onScanComplete,
  defaultAddress,
}: WalletScannerProps) {
  const [address, setAddress] = useState(defaultAddress || "");
  const [scanResult, setScanResult] = useState<any>(null);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const walletCheckMutation = useWalletCheck();
  const walletRevokeMutation = useWalletRevoke();
  const { data: walletHistory } = useWalletHistory(
    isValidAddress ? address : undefined,
  );

  // Validate Ethereum address format
  const validateAddress = (addr: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(addr);
    setIsValidAddress(isValid);
    return isValid;
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    validateAddress(value);
  };

  const handleScan = async () => {
    if (!isValidAddress) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    const request: WalletCheckRequest = {
      address,
      chain_id: 1, // Ethereum mainnet
      include_nfts: false,
    };

    try {
      const result = await walletCheckMutation.mutateAsync(request);
      setScanResult(result);
      onScanComplete?.(result);
      toast.success("Wallet scan completed successfully");
    } catch (error: any) {
      toast.error(`Scan failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleRevoke = async (approval: TokenApproval) => {
    const request: RevokeRequest = {
      address,
      token_contract: approval.contract_address,
      spender: approval.spender,
    };

    try {
      const result = await walletRevokeMutation.mutateAsync(request);
      toast.success(result.message || "Revocation submitted successfully");

      // Refresh scan after revocation
      handleScan();
    } catch (error: any) {
      toast.error(`Revocation failed: ${error.message || "Unknown error"}`);
    }
  };

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

  const truncateAddress = (addr: string, chars = 6) => {
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-cyber-cyan mb-2 font-mono uppercase tracking-wide">
          WALLET GUARD
        </h1>
        <p className="text-cyber-cyan/60 text-sm">
          Advanced wallet security scanner and approval manager
        </p>
      </div>

      {/* Quick Stats */}
      {scanResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Risk Score",
              value: scanResult.risk_score,
              icon: Shield,
              color: getRiskColor(scanResult.risk_level),
              suffix: "/100",
            },
            {
              label: "Total Approvals",
              value: scanResult.total_approvals,
              icon: Eye,
              color: "text-blue-400",
            },
            {
              label: "High Risk",
              value: scanResult.high_risk_approvals,
              icon: AlertTriangle,
              color: "text-red-400",
            },
            {
              label: "Last Scan",
              value: "Recent",
              icon: RefreshCw,
              color: "text-green-400",
              isText: true,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="cyber-card-enhanced p-4 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.isText ? stat.value : `${stat.value}${stat.suffix || ""}`}
              </div>
              <div className="text-xs text-cyber-cyan/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Scan Input */}
      <Card className="cyber-card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cyber-glow">
            <Shield className="h-5 w-5 text-cyber-cyan" />
            Wallet Security Scanner
          </CardTitle>
          <CardDescription className="text-cyber-cyan/60">
            Analyze your wallet for token approvals and security risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-address" className="text-cyber-cyan">
              Wallet Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="wallet-address"
                placeholder="0x..."
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
              {isValidAddress && walletHistory && walletHistory.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  className="btn-secondary"
                >
                  <History className="h-4 w-4" />
                </Button>
              )}
            </div>
            {address && !isValidAddress && (
              <p className="text-sm text-red-400">
                Please enter a valid Ethereum address (0x...)
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
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

      {/* Wallet History */}
      <AnimatePresence>
        {showHistory && walletHistory && walletHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <History className="h-5 w-5 text-cyber-cyan" />
                  Scan History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {walletHistory.map((scan, index) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 border border-cyber-cyan/30 rounded-lg bg-cyber-cyan/5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-cyber-cyan">
                            {formatTime(scan.scan_date)}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs border-cyber-cyan/30 text-cyber-cyan/80"
                          >
                            {scan.total_approvals} approvals
                          </Badge>
                        </div>
                        <div className="text-xs text-cyber-cyan/60">
                          Risk Score: {scan.risk_score} | High Risk:{" "}
                          {scan.high_risk_count}
                        </div>
                      </div>
                      <TrendingUp
                        className={`h-4 w-4 ${
                          scan.risk_score > 60
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
                      Analyzing wallet security...
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

      {/* Scan Results */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Risk Overview */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 cyber-glow">
                    <Shield className="h-5 w-5" />
                    Security Overview
                  </span>
                  <Badge
                    variant={
                      scanResult.risk_level === "low"
                        ? "default"
                        : "destructive"
                    }
                    className={`${getRiskColor(scanResult.risk_level)} border-current`}
                  >
                    {scanResult.risk_level.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-cyber-cyan/5 rounded-lg border border-cyber-cyan/20">
                    <div className="text-2xl font-bold text-cyber-cyan">
                      {scanResult.risk_score}
                    </div>
                    <div className="text-sm text-cyber-cyan/60">Risk Score</div>
                    <Progress
                      value={scanResult.risk_score}
                      className="mt-2 h-2"
                    />
                  </div>
                  <div className="text-center p-4 bg-cyber-cyan/5 rounded-lg border border-cyber-cyan/20">
                    <div className="text-2xl font-bold text-cyber-cyan">
                      {scanResult.total_approvals}
                    </div>
                    <div className="text-sm text-cyber-cyan/60">
                      Total Approvals
                    </div>
                  </div>
                  <div className="text-center p-4 bg-cyber-cyan/5 rounded-lg border border-cyber-cyan/20">
                    <div className="text-2xl font-bold text-red-400">
                      {scanResult.high_risk_approvals}
                    </div>
                    <div className="text-sm text-cyber-cyan/60">High Risk</div>
                  </div>
                </div>

                {/* Recommendations */}
                {scanResult.recommendations &&
                  scanResult.recommendations.length > 0 && (
                    <Alert className="border-cyber-cyan/30 bg-cyber-cyan/5">
                      <Info className="h-4 w-4 text-cyber-cyan" />
                      <AlertDescription className="text-cyber-cyan/80">
                        <strong>Recommendations:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {scanResult.recommendations.map(
                            (rec: string, index: number) => (
                              <li key={index} className="text-sm">
                                {rec}
                              </li>
                            ),
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
              </CardContent>
            </Card>

            {/* Token Approvals Table */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="cyber-glow">Token Approvals</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleScan}
                      disabled={walletCheckMutation.isPending}
                      className="btn-secondary"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-cyber-cyan/30">
                        <TableHead className="text-cyber-cyan">Token</TableHead>
                        <TableHead className="text-cyber-cyan">
                          Spender
                        </TableHead>
                        <TableHead className="text-cyber-cyan">
                          Amount
                        </TableHead>
                        <TableHead className="text-cyber-cyan">Risk</TableHead>
                        <TableHead className="text-cyber-cyan">
                          Value at Risk
                        </TableHead>
                        <TableHead className="text-cyber-cyan">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanResult.approvals.map(
                        (approval: TokenApproval, index: number) => (
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
                                  approval.is_unlimited
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={
                                  approval.is_unlimited
                                    ? "text-red-400 border-red-400"
                                    : "text-cyber-cyan border-cyber-cyan"
                                }
                              >
                                {approval.is_unlimited
                                  ? "Unlimited"
                                  : "Limited"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div
                                className={`flex items-center gap-1 ${getRiskColor(approval.risk_level)}`}
                              >
                                {getRiskIcon(approval.risk_level)}
                                <span className="capitalize text-sm">
                                  {approval.risk_level}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-cyber-cyan/80">
                                {approval.value_at_risk || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevoke(approval)}
                                disabled={walletRevokeMutation.isPending}
                                className="text-red-400 hover:text-red-300 border-red-400/30 hover:bg-red-400/10"
                              >
                                {walletRevokeMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Zap className="h-3 w-3" />
                                )}
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>

                {scanResult.approvals.length === 0 && (
                  <div className="text-center py-8 text-cyber-cyan/60">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No token approvals found for this wallet.</p>
                    <p className="text-sm">This wallet appears to be secure!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WalletGuard() {
  return (
    <div className="space-y-6">
      <WalletScanner />
    </div>
  );
}
