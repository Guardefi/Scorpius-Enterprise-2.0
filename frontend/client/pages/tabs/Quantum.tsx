import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Lock,
  Unlock,
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
  Calendar,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Bell,
  Download,
  Copy,
  Settings,
  BarChart3,
  PieChart,
  TrendingDown,
  Clock,
  FileX,
  AlertCircle,
  CheckCircle,
  Gauge,
  Target,
  Key,
  FileText,
  Globe,
  MapPin,
  Cpu,
  Atom,
  Radar,
  Database,
  Server,
  Cloud,
  Workflow,
  Activity,
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
  Area,
  AreaChart,
} from "recharts";
import { toast } from "sonner";

// Types
interface CryptoKey {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  createdDate: string;
  lastTested: string;
  status: "vulnerable" | "marginal" | "quantum-safe";
  breakTime: string;
  usage: string;
  location: string;
}

interface MigrationTask {
  id: string;
  title: string;
  fromAlgorithm: string;
  toAlgorithm: string;
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
}

interface ThreatForecast {
  level: "low" | "medium" | "high" | "critical";
  percentage: number;
  timeframe: string;
  factors: string[];
}

interface Certificate {
  id: string;
  domain: string;
  algorithm: string;
  keySize: number;
  expiryDate: string;
  quantumBreakEstimate: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  issuer: string;
}

interface RiskAlert {
  id: string;
  type: "key-risk" | "cert-expiry" | "threat-level";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Mock data
const mockKeys: CryptoKey[] = [
  {
    id: "1",
    name: "API Signing Key",
    algorithm: "ECDSA-256",
    keySize: 256,
    createdDate: "2022-03-15",
    lastTested: "2024-01-15",
    status: "vulnerable",
    breakTime: "~2030",
    usage: "API Authentication",
    location: "AWS KMS",
  },
  {
    id: "2",
    name: "SSL Certificate Key",
    algorithm: "RSA-2048",
    keySize: 2048,
    createdDate: "2021-06-20",
    lastTested: "2024-01-10",
    status: "marginal",
    breakTime: "~2035",
    usage: "TLS Termination",
    location: "Local HSM",
  },
  {
    id: "3",
    name: "Backup Encryption",
    algorithm: "Kyber-1024",
    keySize: 1024,
    createdDate: "2023-11-01",
    lastTested: "2024-01-14",
    status: "quantum-safe",
    breakTime: ">100 years",
    usage: "Data Encryption",
    location: "Azure Key Vault",
  },
  {
    id: "4",
    name: "Database Encryption",
    algorithm: "Dilithium-3",
    keySize: 1952,
    createdDate: "2023-12-05",
    lastTested: "2024-01-12",
    status: "quantum-safe",
    breakTime: ">100 years",
    usage: "Database TDE",
    location: "Local HSM",
  },
  {
    id: "5",
    name: "Legacy Email Key",
    algorithm: "RSA-1024",
    keySize: 1024,
    createdDate: "2018-01-10",
    lastTested: "2024-01-08",
    status: "vulnerable",
    breakTime: "~2025",
    usage: "Email Signing",
    location: "Local File",
  },
];

const mockMigrationTasks: MigrationTask[] = [
  {
    id: "1",
    title: "Migrate API Keys to Kyber",
    fromAlgorithm: "ECDSA-256",
    toAlgorithm: "Kyber-1024",
    deadline: "2024-06-30",
    status: "in-progress",
    priority: "high",
  },
  {
    id: "2",
    title: "Replace RSA SSL Certificates",
    fromAlgorithm: "RSA-2048",
    toAlgorithm: "Dilithium-3",
    deadline: "2024-12-31",
    status: "pending",
    priority: "medium",
  },
  {
    id: "3",
    title: "Legacy Email Key Upgrade",
    fromAlgorithm: "RSA-1024",
    toAlgorithm: "Kyber-512",
    deadline: "2024-03-31",
    status: "pending",
    priority: "critical",
  },
];

const mockCertificates: Certificate[] = [
  {
    id: "1",
    domain: "api.company.com",
    algorithm: "ECDSA-256",
    keySize: 256,
    expiryDate: "2025-03-15",
    quantumBreakEstimate: "~2030",
    riskLevel: "high",
    issuer: "Let's Encrypt",
  },
  {
    id: "2",
    domain: "www.company.com",
    algorithm: "RSA-2048",
    keySize: 2048,
    expiryDate: "2024-08-20",
    quantumBreakEstimate: "~2035",
    riskLevel: "medium",
    issuer: "DigiCert",
  },
  {
    id: "3",
    domain: "secure.company.com",
    algorithm: "Kyber-1024",
    keySize: 1024,
    expiryDate: "2026-12-01",
    quantumBreakEstimate: ">100 years",
    riskLevel: "low",
    issuer: "Internal CA",
  },
];

const mockNewsItems = [
  {
    id: "1",
    title: "IBM Unveils 1,121-Qubit Quantum Processor",
    date: "2024-01-15",
    severity: "high",
    description:
      "IBM's latest quantum processor brings us closer to practical quantum advantage in cryptography.",
  },
  {
    id: "2",
    title: "Google Claims Quantum Supremacy Milestone",
    date: "2024-01-10",
    severity: "medium",
    description:
      "Google's quantum computer performs specific calculations exponentially faster than classical computers.",
  },
  {
    id: "3",
    title: "NIST Finalizes Post-Quantum Cryptography Standards",
    date: "2024-01-05",
    severity: "low",
    description:
      "NIST publishes final standards for quantum-resistant cryptographic algorithms.",
  },
];

const testingVelocityData = [
  { week: "W1", tests: 5 },
  { week: "W2", tests: 8 },
  { week: "W3", tests: 12 },
  { week: "W4", tests: 15 },
  { week: "W5", tests: 18 },
  { week: "W6", tests: 22 },
];

const threatLevelData = [
  { month: "Jan", threat: 35 },
  { month: "Feb", threat: 42 },
  { month: "Mar", threat: 48 },
  { month: "Apr", threat: 55 },
  { month: "May", threat: 62 },
  { month: "Jun", threat: 68 },
];

export default function Quantum() {
  // State management
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [threatForecast, setThreatForecast] = useState<ThreatForecast>({
    level: "medium",
    percentage: 65,
    timeframe: "next 12 months",
    factors: [
      "IBM 1,121-qubit processor",
      "Google quantum supremacy claims",
      "Increasing qubit stability",
    ],
  });
  const [showKeyGenerator, setShowKeyGenerator] = useState(false);
  const [newKeyAlgorithm, setNewKeyAlgorithm] = useState("");
  const [domainToScan, setDomainToScan] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<RiskAlert[]>([
    {
      id: "1",
      type: "key-risk",
      severity: "high",
      message: "3 ECDSA keys vulnerable to quantum attacks by 2030",
      timestamp: new Date().toISOString(),
      resolved: false,
    },
    {
      id: "2",
      type: "cert-expiry",
      severity: "medium",
      message: "SSL certificate for www.company.com expires in 6 months",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
  ]);

  // Calculations
  const keyStats = {
    vulnerable: mockKeys.filter((k) => k.status === "vulnerable").length,
    marginal: mockKeys.filter((k) => k.status === "marginal").length,
    quantumSafe: mockKeys.filter((k) => k.status === "quantum-safe").length,
  };

  const certsExpiringSoon = mockCertificates.filter((cert) => {
    const expiry = new Date(cert.expiryDate);
    const threeYearsFromNow = new Date();
    threeYearsFromNow.setFullYear(threeYearsFromNow.getFullYear() + 3);
    return (
      expiry < threeYearsFromNow &&
      (cert.algorithm.includes("RSA") || cert.algorithm.includes("ECDSA"))
    );
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vulnerable":
        return "text-red-500";
      case "marginal":
        return "text-yellow-500";
      case "quantum-safe":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-orange-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleTestKey = (keyId: string) => {
    toast.success(`Testing quantum resistance for key ${keyId}...`);
    setTimeout(() => {
      toast.success("Quantum resistance test completed");
    }, 2000);
  };

  const handleGenerateKey = () => {
    if (!newKeyAlgorithm) {
      toast.error("Please select an algorithm");
      return;
    }
    toast.success(`Generated new ${newKeyAlgorithm} key successfully`);
    setShowKeyGenerator(false);
    setNewKeyAlgorithm("");
  };

  const handleDomainScan = async () => {
    if (!domainToScan) {
      toast.error("Please enter a domain name");
      return;
    }

    setIsScanning(true);
    toast.success(`Scanning certificates for ${domainToScan}...`);

    setTimeout(() => {
      setIsScanning(false);
      toast.success("Certificate scan completed");
    }, 3000);
  };

  const exportReport = () => {
    const report = {
      summary: {
        totalKeys: mockKeys.length,
        vulnerableKeys: keyStats.vulnerable,
        marginalKeys: keyStats.marginal,
        quantumSafeKeys: keyStats.quantumSafe,
        threatLevel: threatForecast.level,
        certsExpiringSoon,
      },
      keys: mockKeys,
      certificates: mockCertificates,
      migrationTasks: mockMigrationTasks,
      alerts: alerts.filter((a) => !a.resolved),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quantum-risk-assessment-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Quantum risk report exported");
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Bar */}
      <Card className="cyber-card-enhanced">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div
                  className={`text-2xl font-bold ${getThreatColor(threatForecast.level)}`}
                >
                  🟠 {threatForecast.level.toUpperCase()} RISK
                </div>
              </div>
              <div className="text-sm text-cyber-cyan/60">Overall Posture</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {keyStats.vulnerable}
              </div>
              <div className="text-sm text-cyber-cyan/60">Keys at Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {certsExpiringSoon}
              </div>
              <div className="text-sm text-cyber-cyan/60">
                Certs Expiring Soon
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {keyStats.quantumSafe}
              </div>
              <div className="text-sm text-cyber-cyan/60">
                Quantum-Safe Keys
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getThreatColor(threatForecast.level)}`}
              >
                {threatForecast.level.toUpperCase()}
              </div>
              <div className="text-sm text-cyber-cyan/60">Threat Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Key Inventory & Health */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() =>
            setSelectedFeature(selectedFeature === "keys" ? null : "keys")
          }
        >
          <Card className="cyber-card-enhanced hover:bg-cyber-cyan/5 transition-all duration-300 group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyber-cyan/10 rounded-lg border border-cyber-cyan/30">
                  <Key className="h-8 w-8 text-cyber-cyan group-hover:animate-cyber-pulse" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-cyber-cyan/60 transition-transform ${selectedFeature === "keys" ? "rotate-180" : ""}`}
                />
              </div>
              <h3 className="text-lg font-semibold cyber-glow mb-2">
                Key Inventory & Health
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">🔴 Vulnerable</span>
                  <span className="font-mono text-red-400">
                    {keyStats.vulnerable}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-400">🟡 Marginal</span>
                  <span className="font-mono text-yellow-400">
                    {keyStats.marginal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">🟢 Safe</span>
                  <span className="font-mono text-green-400">
                    {keyStats.quantumSafe}
                  </span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(keyStats.vulnerable / mockKeys.length) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${(keyStats.marginal / mockKeys.length) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(keyStats.quantumSafe / mockKeys.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs text-cyber-cyan/60">
                  Total Keys: {mockKeys.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Migration Planner */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() =>
            setSelectedFeature(
              selectedFeature === "migration" ? null : "migration",
            )
          }
        >
          <Card className="cyber-card-enhanced hover:bg-cyber-cyan/5 transition-all duration-300 group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <Calendar className="h-8 w-8 text-purple-400 group-hover:animate-cyber-pulse" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-cyber-cyan/60 transition-transform ${selectedFeature === "migration" ? "rotate-180" : ""}`}
                />
              </div>
              <h3 className="text-lg font-semibold cyber-glow mb-2">
                Migration Planner
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyber-cyan/80">📅 Pending</span>
                  <span className="font-mono text-orange-400">
                    {
                      mockMigrationTasks.filter((t) => t.status === "pending")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyber-cyan/80">⚡ In Progress</span>
                  <span className="font-mono text-yellow-400">
                    {
                      mockMigrationTasks.filter(
                        (t) => t.status === "in-progress",
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyber-cyan/80">✅ Complete</span>
                  <span className="font-mono text-green-400">
                    {
                      mockMigrationTasks.filter((t) => t.status === "completed")
                        .length
                    }
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-cyber-cyan"
                    style={{
                      width: `${(mockMigrationTasks.filter((t) => t.status === "completed").length / mockMigrationTasks.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-cyber-cyan/60">
                  {Math.round(
                    (mockMigrationTasks.filter((t) => t.status === "completed")
                      .length /
                      mockMigrationTasks.length) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1">
                {mockMigrationTasks.map((task, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${
                      task.status === "completed"
                        ? "bg-green-500"
                        : task.status === "in-progress"
                          ? "bg-yellow-500"
                          : "bg-red-500/50"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Threat Forecast */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() =>
            setSelectedFeature(selectedFeature === "threat" ? null : "threat")
          }
        >
          <Card className="cyber-card-enhanced hover:bg-cyber-cyan/5 transition-all duration-300 group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <Radar className="h-8 w-8 text-red-400 group-hover:animate-cyber-pulse" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-cyber-cyan/60 transition-transform ${selectedFeature === "threat" ? "rotate-180" : ""}`}
                />
              </div>
              <h3 className="text-lg font-semibold cyber-glow mb-2">
                Threat Forecast
              </h3>
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <svg className="w-20 h-20" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="rgba(239, 68, 68, 0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="#ef4444"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${threatForecast.percentage * 2.2} ${220 - threatForecast.percentage * 2.2}`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                      className="animate-cyber-pulse"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-bold text-red-400">
                      {threatForecast.percentage}%
                    </span>
                    <span className="text-xs text-red-400/60">RISK</span>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <div
                  className={`text-sm font-semibold ${getThreatColor(threatForecast.level)}`}
                >
                  {threatForecast.level.toUpperCase()} THREAT
                </div>
                <div className="text-xs text-cyber-cyan/60">
                  {threatForecast.timeframe}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < 3 ? "bg-red-500" : "bg-red-500/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. Certificate Scanner */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() =>
            setSelectedFeature(
              selectedFeature === "certificates" ? null : "certificates",
            )
          }
        >
          <Card className="cyber-card-enhanced hover:bg-cyber-cyan/5 transition-all duration-300 group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Globe className="h-8 w-8 text-blue-400 group-hover:animate-cyber-pulse" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-cyber-cyan/60 transition-transform ${selectedFeature === "certificates" ? "rotate-180" : ""}`}
                />
              </div>
              <h3 className="text-lg font-semibold cyber-glow mb-2">
                Certificate Scanner
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyber-cyan/80">🔍 Total Certs</span>
                  <span className="font-mono text-cyber-cyan">
                    {mockCertificates.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">⚠️ High Risk</span>
                  <span className="font-mono text-red-400">
                    {
                      mockCertificates.filter((c) => c.riskLevel === "high")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-400">📅 Expiring</span>
                  <span className="font-mono text-orange-400">
                    {certsExpiringSoon}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1">
                {mockCertificates.slice(0, 3).map((cert, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${
                      cert.riskLevel === "high"
                        ? "bg-red-500"
                        : cert.riskLevel === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-center">
                <div className="text-xs text-cyber-cyan/60 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Live monitoring active
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. Risk Heatmap */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() =>
            setSelectedFeature(selectedFeature === "heatmap" ? null : "heatmap")
          }
        >
          <Card className="cyber-card-enhanced hover:bg-cyber-cyan/5 transition-all duration-300 group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <MapPin className="h-8 w-8 text-green-400 group-hover:animate-cyber-pulse" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-cyber-cyan/60 transition-transform ${selectedFeature === "heatmap" ? "rotate-180" : ""}`}
                />
              </div>
              <h3 className="text-lg font-semibold cyber-glow mb-2">
                Risk Heatmap
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">🔴 ECDSA</span>
                  <span className="font-mono text-red-400">75%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-400">🟡 Schnorr</span>
                  <span className="font-mono text-yellow-400">20%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">🟢 PQC</span>
                  <span className="font-mono text-green-400">5%</span>
                </div>
              </div>
              <div className="mt-4 h-8 bg-black/50 rounded-lg overflow-hidden flex items-center">
                <div className="h-full grid grid-cols-8 gap-0.5 p-1 w-full">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full rounded-sm transition-all duration-200 ${
                        i < 6
                          ? "bg-red-500 group-hover:bg-red-400"
                          : i < 7
                            ? "bg-yellow-500 group-hover:bg-yellow-400"
                            : "bg-green-500 group-hover:bg-green-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs text-cyber-cyan/60">
                  Geographic distribution mapping
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 6. Alerting & Playbooks */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() =>
            setSelectedFeature(selectedFeature === "alerts" ? null : "alerts")
          }
        >
          <Card className="cyber-card-enhanced hover:bg-cyber-cyan/5 transition-all duration-300 group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <Bell className="h-8 w-8 text-yellow-400 group-hover:animate-cyber-pulse" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-cyber-cyan/60 transition-transform ${selectedFeature === "alerts" ? "rotate-180" : ""}`}
                />
              </div>
              <h3 className="text-lg font-semibold cyber-glow mb-2">
                Alerts & Playbooks
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">🚨 Active</span>
                  <span className="font-mono text-red-400">
                    {alerts.filter((a) => !a.resolved).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyber-cyan/80">🤖 Playbooks</span>
                  <span className="font-mono text-green-400">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyber-cyan/80">📋 Actions</span>
                  <span className="font-mono text-cyber-cyan">12</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {alerts.slice(0, 4).map((alert, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                      alert.severity === "high"
                        ? "bg-red-500/20 border-red-500 group-hover:bg-red-500/40"
                        : "bg-yellow-500/20 border-yellow-500 group-hover:bg-yellow-500/40"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs text-cyber-cyan/60">
                  Automated response enabled
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            {selectedFeature === "keys" && (
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Key Inventory Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-cyber-cyan/30">
                          <TableHead className="text-cyber-cyan">
                            Name
                          </TableHead>
                          <TableHead className="text-cyber-cyan">
                            Algorithm
                          </TableHead>
                          <TableHead className="text-cyber-cyan">
                            Status
                          </TableHead>
                          <TableHead className="text-cyber-cyan">
                            Break Time
                          </TableHead>
                          <TableHead className="text-cyber-cyan">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockKeys.map((key) => (
                          <TableRow
                            key={key.id}
                            className="border-cyber-cyan/20 hover:bg-cyber-cyan/5"
                          >
                            <TableCell className="font-medium text-cyber-cyan">
                              {key.name}
                            </TableCell>
                            <TableCell className="font-mono text-cyber-cyan/80">
                              {key.algorithm}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusColor(key.status)} border-current`}
                              >
                                {key.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-cyber-cyan/80">
                              {key.breakTime}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestKey(key.id)}
                                className="btn-secondary"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Re-test
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedFeature === "migration" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="cyber-card-enhanced">
                  <CardHeader>
                    <CardTitle className="cyber-glow">
                      Migration Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockMigrationTasks.map((task) => (
                        <div
                          key={task.id}
                          className="border border-cyber-cyan/30 rounded-lg p-4 bg-cyber-cyan/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-cyber-cyan">
                              {task.title}
                            </span>
                            <Badge
                              variant={
                                task.priority === "critical"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {task.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-cyber-cyan/80 mb-2">
                            {task.fromAlgorithm} → {task.toAlgorithm}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-cyber-cyan/60">
                              Due: {formatDate(task.deadline)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {task.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-card-enhanced">
                  <CardHeader>
                    <CardTitle className="cyber-glow">
                      PQC Key Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-cyber-cyan">Algorithm</Label>
                      <Select
                        value={newKeyAlgorithm}
                        onValueChange={setNewKeyAlgorithm}
                      >
                        <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white">
                          <SelectValue placeholder="Select PQC algorithm" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-cyber-cyan/30">
                          <SelectItem
                            value="kyber-512"
                            className="text-cyber-cyan"
                          >
                            Kyber-512
                          </SelectItem>
                          <SelectItem
                            value="kyber-768"
                            className="text-cyber-cyan"
                          >
                            Kyber-768
                          </SelectItem>
                          <SelectItem
                            value="kyber-1024"
                            className="text-cyber-cyan"
                          >
                            Kyber-1024
                          </SelectItem>
                          <SelectItem
                            value="dilithium-2"
                            className="text-cyber-cyan"
                          >
                            Dilithium-2
                          </SelectItem>
                          <SelectItem
                            value="dilithium-3"
                            className="text-cyber-cyan"
                          >
                            Dilithium-3
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleGenerateKey}
                      disabled={!newKeyAlgorithm}
                      className="w-full btn-primary"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate New PQC Key
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 btn-secondary"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download PEM
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 btn-secondary"
                      >
                        <Cloud className="h-3 w-3 mr-1" />
                        Push to KMS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedFeature === "threat" && (
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Quantum Threat Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-cyber-cyan mb-4">
                        Threat Timeline
                      </h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={threatLevelData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(0,255,255,0.1)"
                            />
                            <XAxis dataKey="month" stroke="#00ffff" />
                            <YAxis stroke="#00ffff" />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.9)",
                                border: "1px solid rgba(0,255,255,0.3)",
                                borderRadius: "8px",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="threat"
                              stroke="#ef4444"
                              fill="rgba(239, 68, 68, 0.2)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cyber-cyan mb-4">
                        Recent News
                      </h4>
                      <div className="space-y-3">
                        {mockNewsItems.map((item) => (
                          <div
                            key={item.id}
                            className="border border-cyber-cyan/30 rounded-lg p-3 bg-cyber-cyan/5"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-medium text-cyber-cyan">
                                {item.title}
                              </span>
                              <Badge
                                variant={
                                  item.severity === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {item.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-cyber-cyan/60 mb-1">
                              {formatDate(item.date)}
                            </div>
                            <div className="text-xs text-cyber-cyan/80">
                              {item.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedFeature === "certificates" && (
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Certificate Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="example.com"
                      value={domainToScan}
                      onChange={(e) => setDomainToScan(e.target.value)}
                      className="bg-black/70 border-cyber-cyan/30 text-white font-mono"
                    />
                    <Button
                      onClick={handleDomainScan}
                      disabled={!domainToScan || isScanning}
                      className="btn-primary"
                    >
                      {isScanning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Scan
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-cyber-cyan/30">
                          <TableHead className="text-cyber-cyan">
                            Domain
                          </TableHead>
                          <TableHead className="text-cyber-cyan">
                            Algorithm
                          </TableHead>
                          <TableHead className="text-cyber-cyan">
                            Expiry
                          </TableHead>
                          <TableHead className="text-cyber-cyan">
                            Risk
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockCertificates.map((cert) => (
                          <TableRow
                            key={cert.id}
                            className="border-cyber-cyan/20 hover:bg-cyber-cyan/5"
                          >
                            <TableCell className="font-medium text-cyber-cyan">
                              {cert.domain}
                            </TableCell>
                            <TableCell className="font-mono text-cyber-cyan/80">
                              {cert.algorithm}
                            </TableCell>
                            <TableCell className="text-cyber-cyan/80">
                              {formatDate(cert.expiryDate)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  cert.riskLevel === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {cert.riskLevel.toUpperCase()}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedFeature === "heatmap" && (
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Quantum Risk Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-cyber-cyan mb-4">
                        Algorithm Distribution
                      </h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <RechartsPieChart
                              data={[
                                { name: "ECDSA", value: 75, color: "#ef4444" },
                                {
                                  name: "Schnorr",
                                  value: 20,
                                  color: "#f59e0b",
                                },
                                { name: "PQC", value: 5, color: "#10b981" },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                            >
                              {[
                                { name: "ECDSA", value: 75, color: "#ef4444" },
                                {
                                  name: "Schnorr",
                                  value: 20,
                                  color: "#f59e0b",
                                },
                                { name: "PQC", value: 5, color: "#10b981" },
                              ].map((entry, index) => (
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
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cyber-cyan mb-4">
                        Geographic Distribution
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded border border-red-500/20">
                          <span className="text-red-400">🔴 North America</span>
                          <span className="font-mono text-red-400">
                            85% ECDSA
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                          <span className="text-yellow-400">🟡 Europe</span>
                          <span className="font-mono text-yellow-400">
                            70% ECDSA
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded border border-green-500/20">
                          <span className="text-green-400">
                            🟢 Asia-Pacific
                          </span>
                          <span className="font-mono text-green-400">
                            45% ECDSA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedFeature === "alerts" && (
              <Card className="cyber-card-enhanced">
                <CardHeader>
                  <CardTitle className="cyber-glow">
                    Alerts & Automated Playbooks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-cyber-cyan mb-4">
                        Active Alerts
                      </h4>
                      <div className="space-y-3">
                        {alerts
                          .filter((a) => !a.resolved)
                          .map((alert) => (
                            <div
                              key={alert.id}
                              className="border border-cyber-cyan/30 rounded-lg p-3 bg-cyber-cyan/5"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-sm font-medium text-cyber-cyan">
                                  {alert.message}
                                </span>
                                <Badge
                                  variant={
                                    alert.severity === "high"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {alert.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="text-xs text-cyber-cyan/60">
                                {formatDate(alert.timestamp)} •{" "}
                                {alert.type.replace("-", " ").toUpperCase()}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-cyber-cyan mb-4">
                        Automated Playbooks
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-cyber-cyan/30 rounded-lg p-3 bg-cyber-cyan/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-cyber-cyan">
                              High-Risk Key Response
                            </span>
                            <Switch defaultChecked />
                          </div>
                          <div className="text-xs text-cyber-cyan/80">
                            Auto-generate PQC key → Rotate in KMS → Send alert
                          </div>
                        </div>
                        <div className="border border-cyber-cyan/30 rounded-lg p-3 bg-cyber-cyan/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-cyber-cyan">
                              Certificate Expiry Alert
                            </span>
                            <Switch defaultChecked />
                          </div>
                          <div className="text-xs text-cyber-cyan/80">
                            Generate PQC cert → Update DNS → Notify team
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Button */}
      <div className="flex justify-center">
        <Button onClick={exportReport} className="btn-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Quantum Risk Assessment
        </Button>
      </div>
    </div>
  );
}
