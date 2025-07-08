import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StorageManager } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LiveCounter } from "@/components/ui/live-counter";
import { PageLayout } from "@/components/PageLayout";
import {
  FileText,
  Download,
  Settings,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Share2,
  Lock,
  Shield,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileCode,
  File,
  Globe,
  Database,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Signature,
  Droplets,
  GitCompare,
  Package,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronRight,
  Star,
  Award,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "security" | "compliance" | "audit" | "executive";
  formats: string[];
  theme: string;
  lastUsed?: Date;
  popularity: number;
}

interface GeneratedReport {
  id: string;
  title: string;
  scanId: string;
  format: string;
  theme: string;
  status: "generating" | "completed" | "failed" | "signed";
  createdAt: Date;
  size: string;
  downloadCount: number;
  signedBy?: string;
  watermarked: boolean;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

interface ScanResult {
  id: string;
  contractName: string;
  address: string;
  scanDate: Date;
  status: "completed" | "pending" | "failed";
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  riskScore: number;
}

export default function Reports() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedScan, setSelectedScan] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedTheme, setSelectedTheme] = useState("dark_pro");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Report templates from API
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: "security_audit",
      name: "Security Audit Report",
      description: "Comprehensive security analysis with vulnerability details",
      type: "security",
      formats: ["pdf", "html", "json", "sarif"],
      theme: "dark_pro",
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
      popularity: 95,
    },
    {
      id: "compliance_report",
      name: "Compliance Assessment",
      description: "Regulatory compliance evaluation and recommendations",
      type: "compliance",
      formats: ["pdf", "html", "csv"],
      theme: "light_corporate",
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      popularity: 78,
    },
    {
      id: "executive_summary",
      name: "Executive Summary",
      description: "High-level overview for management and stakeholders",
      type: "executive",
      formats: ["pdf", "html"],
      theme: "corporate_blue",
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      popularity: 84,
    },
    {
      id: "technical_deep_dive",
      name: "Technical Deep Dive",
      description: "Detailed technical analysis for development teams",
      type: "audit",
      formats: ["pdf", "html", "markdown", "json"],
      theme: "dark_pro",
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 12),
      popularity: 91,
    },
  ]);

  const [scanResults, setScanResults] = useState<ScanResult[]>([
    {
      id: "SCAN_2024_001",
      contractName: "UniswapV3Pool",
      address: "0x742d35Cc6431C8BF3240C39B6969E3C77e1345eF",
      scanDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "completed",
      findings: { critical: 2, high: 5, medium: 12, low: 8, total: 27 },
      riskScore: 8.5,
    },
    {
      id: "SCAN_2024_002",
      contractName: "AaveV3Pool",
      address: "0x9F8b2C4D5E6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C",
      scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: "completed",
      findings: { critical: 0, high: 3, medium: 8, low: 15, total: 26 },
      riskScore: 6.2,
    },
    {
      id: "SCAN_2024_003",
      contractName: "CompoundProtocol",
      address: "0x7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F",
      scanDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: "completed",
      findings: { critical: 1, high: 4, medium: 10, low: 12, total: 27 },
      riskScore: 7.3,
    },
  ]);

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: "RPT_001",
      title: "UniswapV3Pool Security Audit",
      scanId: "SCAN_2024_001",
      format: "pdf",
      theme: "dark_pro",
      status: "signed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      size: "2.4 MB",
      downloadCount: 12,
      signedBy: "security@scorpius.dev",
      watermarked: true,
      findings: { critical: 2, high: 5, medium: 12, low: 8, total: 27 },
    },
    {
      id: "RPT_002",
      title: "AaveV3Pool Compliance Report",
      scanId: "SCAN_2024_002",
      format: "html",
      theme: "light_corporate",
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      size: "1.8 MB",
      downloadCount: 8,
      watermarked: false,
      findings: { critical: 0, high: 3, medium: 8, low: 15, total: 26 },
    },
    {
      id: "RPT_003",
      title: "CompoundProtocol Executive Summary",
      scanId: "SCAN_2024_003",
      format: "pdf",
      theme: "corporate_blue",
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      size: "912 KB",
      downloadCount: 15,
      watermarked: true,
      findings: { critical: 1, high: 4, medium: 10, low: 12, total: 27 },
    },
  ]);

  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    reportsToday: 0,
    avgGenerationTime: 0,
    popularFormat: "PDF",
    popularTheme: "Dark Pro",
    totalDownloads: 0,
  });

  const themes = [
    {
      id: "dark_pro",
      name: "Dark Pro",
      description: "Professional dark theme",
    },
    {
      id: "light_corporate",
      name: "Light Corporate",
      description: "Clean corporate styling",
    },
    {
      id: "corporate_blue",
      name: "Corporate Blue",
      description: "Professional blue theme",
    },
    {
      id: "security_red",
      name: "Security Red",
      description: "High-contrast security theme",
    },
  ];

  const formats = [
    {
      id: "pdf",
      name: "PDF",
      description: "Professional reports with digital signatures",
      icon: FileText,
      features: ["Digital Signatures", "Watermarks", "Print Optimized"],
    },
    {
      id: "html",
      name: "HTML",
      description: "Interactive web-based reports",
      icon: Globe,
      features: ["Interactive Charts", "Search & Filter", "Responsive"],
    },
    {
      id: "json",
      name: "JSON",
      description: "Machine-readable structured data",
      icon: FileCode,
      features: ["API Integration", "Structured Data", "Programmatic Access"],
    },
    {
      id: "csv",
      name: "CSV",
      description: "Spreadsheet-compatible data export",
      icon: Database,
      features: ["Spreadsheet Ready", "Data Analysis", "Bulk Processing"],
    },
    {
      id: "sarif",
      name: "SARIF",
      description: "Industry-standard security format",
      icon: Shield,
      features: ["GitHub Integration", "Tool Compatibility", "Standardized"],
    },
    {
      id: "markdown",
      name: "Markdown",
      description: "Documentation-friendly format",
      icon: File,
      features: ["Version Control", "Documentation", "Developer Friendly"],
    },
  ];

  // Load data and initialize
  useEffect(() => {
    const loadData = async () => {
      // Load report statistics from storage
      const localReportStats = StorageManager.getReportStats();
      setReportStats({
        totalReports: localReportStats.totalReports,
        reportsToday: localReportStats.reportsToday,
        avgGenerationTime: localReportStats.averageGenerationTime,
        popularFormat: "PDF",
        popularTheme: "Dark Pro",
        totalDownloads: localReportStats.totalDownloads,
      });
    };

    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generateReport = useCallback(async () => {
    if (!selectedScan) {
      toast.error("Please select a scan to generate a report");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate report generation with realistic progress
      const progressSteps = [
        { progress: 10, message: "Initializing report generation..." },
        { progress: 25, message: "Loading scan data..." },
        { progress: 40, message: "Analyzing vulnerabilities..." },
        { progress: 60, message: "Generating charts and visualizations..." },
        { progress: 80, message: "Applying theme and formatting..." },
        { progress: 95, message: "Adding signatures and watermarks..." },
        { progress: 100, message: "Report generation complete!" },
      ];

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setGenerationProgress(step.progress);

        if (step.progress === 100) {
          // Calculate generation time
          const generationTime = Math.random() * 30 + 15; // 15-45 seconds

          // Persist report generation in storage
          StorageManager.incrementReportGeneration(generationTime);

          // Add new report to the list
          const selectedScanData = scanResults.find(
            (s) => s.id === selectedScan,
          );
          const newReport: GeneratedReport = {
            id: `RPT_${Date.now()}`,
            title: `${selectedScanData?.contractName} Security Report`,
            scanId: selectedScan,
            format: selectedFormat,
            theme: selectedTheme,
            status: includeSignature ? "signed" : "completed",
            createdAt: new Date(),
            size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
            downloadCount: 0,
            watermarked: includeWatermark,
            signedBy: includeSignature ? "security@scorpius.dev" : undefined,
            findings: selectedScanData?.findings || {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
              total: 0,
            },
          };

          setGeneratedReports((prev) => [newReport, ...prev]);

          // Update stats
          const updatedStats = StorageManager.getReportStats();
          setReportStats((prev) => ({
            ...prev,
            totalReports: updatedStats.totalReports,
            reportsToday: updatedStats.reportsToday,
            avgGenerationTime: updatedStats.averageGenerationTime,
          }));

          toast.success("Report generated successfully!");
        }
      }
    } catch (error) {
      toast.error("Failed to generate report");
      console.error("Report generation error:", error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  }, [
    selectedScan,
    selectedFormat,
    selectedTheme,
    includeSignature,
    includeWatermark,
    scanResults,
  ]);

  const downloadReport = (reportId: string) => {
    // Simulate download
    StorageManager.incrementReportDownload();

    // Update local state
    setGeneratedReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, downloadCount: report.downloadCount + 1 }
          : report,
      ),
    );

    const updatedStats = StorageManager.getReportStats();
    setReportStats((prev) => ({
      ...prev,
      totalDownloads: updatedStats.totalDownloads,
    }));

    toast.success("Report downloaded successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "signed":
        return "text-blue-600";
      case "generating":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "signed":
        return <Signature className="h-4 w-4" />;
      case "generating":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-blue-600";
    return "text-green-600";
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return `${Math.floor(diffMs / (1000 * 60))}m ago`;
  };

  return (
    <PageLayout>
      {/* Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {[
          {
            label: "Total Reports",
            value: reportStats.totalReports,
            icon: FileText,
            color: "text-blue-600",
          },
          {
            label: "Reports Today",
            value: reportStats.reportsToday,
            icon: Calendar,
            color: "text-green-600",
          },
          {
            label: "Avg Gen Time",
            value: reportStats.avgGenerationTime,
            icon: Clock,
            color: "text-yellow-600",
            suffix: "s",
          },
          {
            label: "Popular Format",
            value: reportStats.popularFormat,
            icon: Star,
            color: "text-purple-600",
            isText: true,
          },
          {
            label: "Popular Theme",
            value: reportStats.popularTheme,
            icon: Award,
            color: "text-indigo-600",
            isText: true,
          },
          {
            label: "Total Downloads",
            value: reportStats.totalDownloads,
            icon: Download,
            color: "text-cyan-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="cyber-card-enhanced group p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 ${stat.color}`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className={`text-2xl font-bold ${stat.color}`}
              >
                {stat.isText ? (
                  stat.value
                ) : (
                  <LiveCounter
                    value={Number(stat.value)}
                    suffix={stat.suffix}
                    decimals={0}
                    duration={2000}
                  />
                )}
              </motion.div>
              <div className="text-xs text-cyber-cyan/60 font-medium">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tron Separator */}
      <div className="cyber-divider"></div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-cyber-cyan/10 border border-cyber-cyan/20">
          <TabsTrigger
            value="generate"
            className="data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black"
          >
            Generate Reports
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black"
          >
            Report History
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Generate Reports Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <Card className="lg:col-span-2 cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 cyber-glow">
                  <Settings className="h-5 w-5" />
                  <span>Report Configuration</span>
                </CardTitle>
                <CardDescription className="text-cyber-cyan/60">
                  Configure your security audit report settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scan Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-cyber-cyan">
                    Select Scan
                  </Label>
                  <div className="grid gap-3">
                    {scanResults.map((scan) => (
                      <motion.div
                        key={scan.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedScan(scan.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedScan === scan.id
                            ? "border-cyber-cyan bg-cyber-cyan/10"
                            : "border-cyber-cyan/30 hover:bg-cyber-cyan/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-cyber-cyan">
                              {scan.contractName}
                            </h4>
                            <p className="text-xs text-cyber-cyan/60 font-mono">
                              {scan.address}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-bold ${getRiskColor(scan.riskScore)}`}
                            >
                              Risk: {scan.riskScore}/10
                            </div>
                            <div className="text-xs text-cyber-cyan/60">
                              {formatTime(scan.scanDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-red-400">
                            Critical: {scan.findings.critical}
                          </span>
                          <span className="text-yellow-400">
                            High: {scan.findings.high}
                          </span>
                          <span className="text-blue-400">
                            Medium: {scan.findings.medium}
                          </span>
                          <span className="text-green-400">
                            Low: {scan.findings.low}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Format Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-cyber-cyan">
                    Output Format
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {formats.map((format) => (
                      <motion.div
                        key={format.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedFormat === format.id
                            ? "border-cyber-cyan bg-cyber-cyan/10"
                            : "border-cyber-cyan/30 hover:bg-cyber-cyan/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <format.icon className="h-5 w-5 text-cyber-cyan" />
                          <div>
                            <h4 className="font-semibold text-cyber-cyan">
                              {format.name}
                            </h4>
                            <p className="text-xs text-cyber-cyan/60">
                              {format.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {format.features.map((feature) => (
                            <Badge
                              key={feature}
                              variant="outline"
                              className="text-xs border-cyber-cyan/30 text-cyber-cyan/80"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-cyber-cyan">
                    Theme
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((theme) => (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedTheme === theme.id
                            ? "border-cyber-cyan bg-cyber-cyan/10"
                            : "border-cyber-cyan/30 hover:bg-cyber-cyan/5"
                        }`}
                      >
                        <h4 className="font-semibold text-cyber-cyan">
                          {theme.name}
                        </h4>
                        <p className="text-xs text-cyber-cyan/60">
                          {theme.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Enterprise Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-cyber-cyan">
                    Enterprise Features
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Signature className="h-4 w-4 text-blue-400" />
                        <Label
                          htmlFor="signature"
                          className="text-sm text-cyber-cyan/80"
                        >
                          Digital Signature
                        </Label>
                      </div>
                      <Switch
                        id="signature"
                        checked={includeSignature}
                        onCheckedChange={setIncludeSignature}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-purple-400" />
                        <Label
                          htmlFor="watermark"
                          className="text-sm text-cyber-cyan/80"
                        >
                          Watermark
                        </Label>
                      </div>
                      <Switch
                        id="watermark"
                        checked={includeWatermark}
                        onCheckedChange={setIncludeWatermark}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generation Panel */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 cyber-glow">
                  <Zap className="h-5 w-5" />
                  <span>Generate Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isGenerating ? (
                  <>
                    <div className="space-y-3">
                      <div className="text-sm text-cyber-cyan">
                        <strong>Selected Configuration:</strong>
                      </div>
                      <div className="space-y-2 text-xs text-cyber-cyan/80">
                        <div>
                          Scan:{" "}
                          {scanResults.find((s) => s.id === selectedScan)
                            ?.contractName || "None selected"}
                        </div>
                        <div>Format: {selectedFormat.toUpperCase()}</div>
                        <div>
                          Theme:{" "}
                          {themes.find((t) => t.id === selectedTheme)?.name}
                        </div>
                        <div>
                          Signature: {includeSignature ? "Enabled" : "Disabled"}
                        </div>
                        <div>
                          Watermark: {includeWatermark ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={generateReport}
                      disabled={!selectedScan}
                      className="w-full btn-primary font-mono uppercase tracking-wide"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-cyber-cyan">
                      Generating Report...
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                    <div className="text-xs text-cyber-cyan/60">
                      {Math.round(generationProgress)}% complete
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2 pt-4 border-t border-cyber-cyan/20">
                  <div className="text-sm font-medium text-cyber-cyan">
                    Quick Actions
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full btn-secondary"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Generate Audit Bundle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full btn-secondary"
                    >
                      <GitCompare className="h-4 w-4 mr-2" />
                      Create Diff Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="cyber-card-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 cyber-glow">
                    <Clock className="h-5 w-5" />
                    <span>Report History</span>
                  </CardTitle>
                  <CardDescription className="text-cyber-cyan/60">
                    Manage and download previously generated reports
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="btn-secondary">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="btn-secondary">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="p-4 border border-cyber-cyan/30 rounded-lg hover:bg-cyber-cyan/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded ${getStatusColor(report.status)}`}
                        >
                          {getStatusIcon(report.status)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-cyber-cyan">
                            {report.title}
                          </h4>
                          <p className="text-sm text-cyber-cyan/60">
                            {report.format.toUpperCase()} • {report.theme} •{" "}
                            {report.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.watermarked && (
                          <Badge
                            variant="outline"
                            className="text-xs border-cyber-cyan/30 text-cyber-cyan/80"
                          >
                            <Droplets className="h-3 w-3 mr-1" />
                            Watermarked
                          </Badge>
                        )}
                        {report.signedBy && (
                          <Badge
                            variant="outline"
                            className="text-xs border-cyber-cyan/30 text-cyber-cyan/80"
                          >
                            <Signature className="h-3 w-3 mr-1" />
                            Signed
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-secondary"
                          onClick={() => downloadReport(report.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-cyber-cyan/60">
                      <div className="flex items-center space-x-4">
                        <span>Generated: {formatTime(report.createdAt)}</span>
                        <span>Downloads: {report.downloadCount}</span>
                        {report.signedBy && (
                          <span>Signed by: {report.signedBy}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-red-400">
                          Critical: {report.findings.critical}
                        </span>
                        <span className="text-yellow-400">
                          High: {report.findings.high}
                        </span>
                        <span className="text-blue-400">
                          Medium: {report.findings.medium}
                        </span>
                        <span className="text-green-400">
                          Low: {report.findings.low}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="cyber-card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 cyber-glow">
                <Briefcase className="h-5 w-5" />
                <span>Report Templates</span>
              </CardTitle>
              <CardDescription className="text-cyber-cyan/60">
                Professional templates for different types of reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="p-6 border border-cyber-cyan/30 rounded-xl bg-gradient-to-br from-cyber-cyan/5 to-cyber-cyan/10 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-cyber-cyan">
                          {template.name}
                        </h3>
                        <p className="text-sm text-cyber-cyan/60">
                          {template.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="capitalize border-cyber-cyan/30 text-cyber-cyan/80"
                      >
                        {template.type}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyber-cyan/80">Popularity</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={template.popularity}
                            className="w-16 h-2"
                          />
                          <span className="text-xs text-cyber-cyan/60">
                            {template.popularity}%
                          </span>
                        </div>
                      </div>

                      {template.lastUsed && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-cyber-cyan/80">Last Used</span>
                          <span className="text-cyber-cyan/60">
                            {formatTime(template.lastUsed)}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {template.formats.map((format) => (
                          <Badge
                            key={format}
                            variant="outline"
                            className="text-xs border-cyber-cyan/30 text-cyber-cyan/80"
                          >
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        className="w-full btn-secondary"
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Generation Trends */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 cyber-glow">
                  <TrendingUp className="h-5 w-5" />
                  <span>Generation Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-cyber-cyan/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-cyber-cyan/20">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-cyber-cyan mb-4" />
                    <p className="text-sm text-cyber-cyan/60">
                      Report Generation Chart
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <div className="font-bold text-cyber-cyan">
                          <LiveCounter
                            value={347}
                            decimals={0}
                            duration={2000}
                          />
                        </div>
                        <div className="text-cyber-cyan/60">Total Reports</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-400">
                          <LiveCounter
                            value={23}
                            decimals={0}
                            duration={2000}
                          />
                        </div>
                        <div className="text-cyber-cyan/60">Today</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Format Distribution */}
            <Card className="cyber-card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 cyber-glow">
                  <PieChart className="h-5 w-5" />
                  <span>Format Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-cyber-cyan/20">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto text-green-400 mb-4" />
                    <p className="text-sm text-cyber-cyan/60">
                      Format Usage Chart
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                      <div>
                        <div className="font-bold text-blue-400">45%</div>
                        <div className="text-cyber-cyan/60">PDF</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-400">28%</div>
                        <div className="text-cyber-cyan/60">HTML</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-400">27%</div>
                        <div className="text-cyber-cyan/60">Other</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="cyber-card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 cyber-glow">
                <Activity className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    <LiveCounter
                      value={45}
                      suffix="s"
                      decimals={0}
                      duration={2000}
                    />
                  </div>
                  <div className="text-sm text-cyber-cyan/60">
                    Avg Generation Time
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    <LiveCounter
                      value={99.2}
                      suffix="%"
                      decimals={1}
                      duration={2000}
                    />
                  </div>
                  <div className="text-sm text-cyber-cyan/60">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    <LiveCounter value={2847} decimals={0} duration={2000} />
                  </div>
                  <div className="text-sm text-cyber-cyan/60">
                    Total Downloads
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    <LiveCounter
                      value={1.2}
                      suffix="MB"
                      decimals={1}
                      duration={2000}
                    />
                  </div>
                  <div className="text-sm text-cyber-cyan/60">
                    Avg Report Size
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
