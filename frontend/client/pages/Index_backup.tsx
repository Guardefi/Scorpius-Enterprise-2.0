import { useState, useMemo, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useWebSocket, useServiceWebSocket } from "@/hooks/use-websocket";
import {
  generateTimeSeriesData,
  generateRealTimeDataPoint,
  generateDistributionData,
  chartColors,
  chartColorArray,
  formatChartValue,
  chartTheme,
  chartAnimations,
  generateSampleData,
} from "@/lib/chart-utils";
import {
  Search,
  Server,
  Activity,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Eye,
  Hash,
  DollarSign,
  Globe,
  Database,
  Cpu,
  Settings,
  Calendar as CalendarIcon,
  ArrowLeftRight,
  Target,
  Layers,
  BarChart3,
  Workflow,
  HelpCircle,
  Send,
  History,
  Lock,
  Unlock,
  MousePointer,
  Wifi,
  WifiOff,
  Share,
  User,
  LogOut,
  X,
} from "lucide-react";

interface Vulnerability {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

interface ScanResult {
  contractAddress: string;
  scanId: string;
  status: "scanning" | "completed" | "failed";
  progress: number;
  vulnerabilities: Vulnerability[];
  securityScore: number;
  gasOptimization: number;
  timestamp: string;
  plugins?: string[];
  currentPlugin?: string;
  pluginStage?: string;
}

interface MempoolTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  timestamp: string;
  mevOpportunity?: {
    type: "arbitrage" | "liquidation" | "sandwich";
    profit: string;
  };
  riskLevel: "Low" | "Medium" | "High";
}

interface MEVStrategy {
  id: string;
  name: string;
  type: "arbitrage" | "liquidation" | "sandwich" | "frontrun";
  status: "active" | "paused" | "stopped";
  profitTarget: number;
  gasLimit: number;
  slippage: number;
  totalProfit: number;
  successRate: number;
}

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

interface ForensicsResult {
  address: string;
  riskScore: number;
  flags: string[];
  associations: string[];
  transactionVolume: string;
  firstSeen: string;
  lastActivity: string;
}

interface HistoricalQuery {
  id: string;
  blockNumber: number;
  timestamp: string;
  query: string;
  results: any[];
  status: "loading" | "completed" | "error";
}

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

interface ExploitTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  method: string;
  description: string;
  impact: string;
  terminalInput?: string;
  terminalOutput?: string;
}

interface FamousExploit {
  id: string;
  name: string;
  date: string;
  description: string;
  totalLoss: string;
  exploitType:
    | "reentrancy"
    | "flash_loan"
    | "oracle_manipulation"
    | "governance"
    | "bridge"
    | "other";
  attackerAddress: string;
  targetContract: string;
  transactions: ExploitTransaction[];
  timeline: string[];
  status: "completed" | "replaying" | "paused";
  currentStep: number;
}

interface ReplayState {
  isReplaying: boolean;
  currentExploit: FamousExploit | null;
  replaySpeed: number;
  currentTransaction: number;
}

interface QuantumResult {
  algorithm: string;
  keySize: number;
  estimatedBreakTime: string;
  recommendation: string;
  quantumResistant: boolean;
}

interface SimulationResult {
  id: string;
  type: "transaction" | "arbitrage" | "liquidation";
  success: boolean;
  gasUsed: number;
  profit: string;
  warnings: string[];
}

interface Report {
  id: string;
  title: string;
  type: "security" | "analytics" | "compliance" | "performance";
  status: "generating" | "completed" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  summary: string;
  data: {
    totalScans: number;
    vulnerabilitiesFound: number;
    riskScore: number;
    recommendations: string[];
  };
}

interface ReportGenerationParams {
  title: string;
  type: "security" | "analytics" | "compliance" | "performance";
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  services: string[];
}

interface AnalyticsDashboardData {
  totalUsers: number;
  totalScans: number;
  averageRiskScore: number;
  trendsData: {
    scans: Array<{ date: string; count: number }>;
    vulnerabilities: Array<{ date: string; count: number; severity: string }>;
    performance: Array<{ date: string; responseTime: number }>;
  };
  topVulnerabilities: Array<{ name: string; count: number; severity: string }>;
  serviceUsage: Array<{ service: string; usage: number; uptime: number }>;
}

// Helper function to get plugin-specific scanning stages
const getPluginStage = (plugin: string, stage: number): string => {
  const stages: Record<string, string[]> = {
    slither: [
      "Initializing AST parser",
      "Analyzing contract structure",
      "Detecting reentrancy patterns",
      "Checking access controls",
      "Scanning for integer issues",
      "Validating state variables",
      "Analyzing function calls",
      "Checking gas patterns",
      "Finalizing static analysis",
      "Generating report",
    ],
    mythril: [
      "Loading symbolic execution engine",
      "Building control flow graph",
      "Initializing constraint solver",
      "Analyzing execution paths",
      "Detecting symbolic vulnerabilities",
      "Checking state constraints",
      "Validating transaction flows",
      "Running taint analysis",
      "Consolidating results",
      "Finalizing symbolic analysis",
    ],
    manticore: [
      "Starting dynamic analysis",
      "Setting up execution environment",
      "Generating test inputs",
      "Executing symbolic paths",
      "Monitoring state changes",
      "Detecting runtime vulnerabilities",
      "Analyzing concolic execution",
      "Validating edge cases",
      "Collecting coverage data",
      "Completing dynamic scan",
    ],
  };

  return stages[plugin]?.[stage] || `Processing ${plugin}...`;
};

export default function Index() {
  // WebSocket Connection (graceful fallback when server not available)
  const webSocket = useWebSocket({
    onConnect: () => console.log("🔌 Dashboard connected to WebSocket"),
    onDisconnect: () => console.log("🔌 Dashboard disconnected from WebSocket"),
    onError: () =>
      console.log("🔌 WebSocket server not available - running in demo mode"),
    onMessage: (message) => {
      console.log("📨 Received message:", message);
      handleRealTimeUpdate(message);
    },
  });

  // Real-time data updates handler
  const handleRealTimeUpdate = (message: any) => {
    const { service, type, data } = message;

    switch (service) {
      case "scanner":
        if (type === "scan_progress") {
          setScanChartData((prev) => [
            ...prev.slice(1),
            generateRealTimeDataPoint(prev[prev.length - 1]?.value || 50),
          ]);
        }
        break;
      case "mempool":
        if (type === "transaction_volume") {
          setMempoolChartData((prev) => [
            ...prev.slice(1),
            generateRealTimeDataPoint(prev[prev.length - 1]?.value || 100),
          ]);
        }
        break;
      case "mev-ops":
        if (type === "profit_update") {
          setMevProfitChart((prev) => [
            ...prev.slice(1),
            generateRealTimeDataPoint(prev[prev.length - 1]?.value || 0.5),
          ]);
        }
        break;
      case "reports":
        if (type === "report_progress") {
          setReports((prev) =>
            prev.map((report) =>
              report.id === data.reportId
                ? { ...report, progress: data.progress, status: data.status }
                : report,
            ),
          );
        }
        break;
    }
  };

  // Generate new report
  const generateReport = async () => {
    if (!reportParams.title.trim()) return;

    setIsGeneratingReport(true);
    const reportId = `report_${Date.now()}`;

    const newReport: Report = {
      id: reportId,
      title: reportParams.title,
      type: reportParams.type,
      status: "generating",
      progress: 0,
      createdAt: new Date().toISOString(),
      summary: "Generating comprehensive report...",
      data: {
        totalScans: 0,
        vulnerabilitiesFound: 0,
        riskScore: 0,
        recommendations: [],
      },
    };

    setReports((prev) => [newReport, ...prev]);

    // Simulate report generation progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, progress: i } : report,
        ),
      );
    }

    // Complete the report
    const completedReport: Report = {
      ...newReport,
      status: "completed",
      progress: 100,
      completedAt: new Date().toISOString(),
      summary: `${reportParams.type.charAt(0).toUpperCase() + reportParams.type.slice(1)} analysis completed successfully`,
      data: {
        totalScans: Math.floor(Math.random() * 1000) + 500,
        vulnerabilitiesFound: Math.floor(Math.random() * 50) + 10,
        riskScore: Math.floor(Math.random() * 40) + 40,
        recommendations: [
          "Implement additional access controls",
          "Review smart contract permissions",
          "Enable continuous monitoring",
          "Update security policies",
        ],
      },
    };

    setReports((prev) =>
      prev.map((report) => (report.id === reportId ? completedReport : report)),
    );

    setIsGeneratingReport(false);
    setReportParams((prev) => ({ ...prev, title: "" }));
  };

  // Scanner State
  const [contractAddress, setContractAddress] = useState("");
  const [contractCode, setContractCode] = useState("");
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(["slither"]);
  const [scanChartData, setScanChartData] = useState(
    generateSampleData.lineChart(7),
  );
  const [vulnerabilityDistribution, setVulnerabilityDistribution] = useState(
    generateSampleData.pieChart(["Critical", "High", "Medium", "Low", "Info"]),
  );

  // Mempool Monitor State
  const [mempoolTransactions, setMempoolTransactions] = useState<
    MempoolTransaction[]
  >([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [mevOpportunities, setMevOpportunities] = useState(0);
  const [mempoolChartData, setMempoolChartData] = useState(
    generateSampleData.areaChart(20),
  );
  const [gasChartData, setGasChartData] = useState(
    generateSampleData.lineChart(24),
  );

  // MEV Bot State
  const [mevStrategies, setMevStrategies] = useState<MEVStrategy[]>([]);
  const [newStrategy, setNewStrategy] = useState({
    name: "",
    type: "arbitrage" as const,
    profitTarget: 0.1,
    gasLimit: 300000,
    slippage: 0.5,
  });
  const [mevProfitChart, setMevProfitChart] = useState(
    generateSampleData.areaChart(14),
  );
  const [mevSuccessChart, setMevSuccessChart] = useState(
    generateSampleData.barChart([
      "Arbitrage",
      "Liquidation",
      "Sandwich",
      "Frontrun",
    ]),
  );

  // Bridge State
  const [bridgeTransfers, setBridgeTransfers] = useState<BridgeTransfer[]>([]);
  const [bridgeForm, setBridgeForm] = useState({
    fromChain: "ethereum",
    toChain: "polygon",
    asset: "USDT",
    amount: "",
  });

  // Forensics State
  const [forensicsAddress, setForensicsAddress] = useState("");
  const [forensicsResults, setForensicsResults] = useState<ForensicsResult[]>(
    [],
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Time Machine State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [blockNumber, setBlockNumber] = useState("");
  const [historicalQueries, setHistoricalQueries] = useState<HistoricalQuery[]>(
    [],
  );

  // Famous Exploits Replay State
  const [replayState, setReplayState] = useState<ReplayState>({
    isReplaying: false,
    currentExploit: null,
    replaySpeed: 1,
    currentTransaction: 0,
  });

  // Use ref to track current replay state for async functions
  const replayStateRef = useRef(replayState);
  useEffect(() => {
    replayStateRef.current = replayState;
  }, [replayState]);

  const [famousExploits] = useState<FamousExploit[]>([
    {
      id: "ronin-2022",
      name: "Ronin Network Hack",
      date: "March 23, 2022",
      description:
        "Largest DeFi hack ever. Attacker compromised 5/9 validator keys to drain Ronin bridge of 173,600 ETH and 25.5M USDC.",
      totalLoss: "173,600 ETH + 25.5M USDC (~$625M)",
      exploitType: "bridge",
      attackerAddress: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
      targetContract: "0x1A2a1c938CE3eC39b6D47113c7955bAa9DD454F2",
      transactions: [
        {
          hash: "0xc28fad5e8d5e0ce6a2eaf67b6687be5d58e2727e",
          blockNumber: 14442753,
          timestamp: "2022-03-23 00:31:35",
          from: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
          to: "0x1A2a1c938CE3eC39b6D47113c7955bAa9DD454F2",
          value: "0 ETH",
          gasUsed: "185,000",
          gasPrice: "42 Gwei",
          method: "withdrawETH(173600000000000000000000)",
          description:
            "Massive ETH withdrawal using compromised validator signatures",
          impact: "Drained 173,600 ETH in single transaction",
          terminalInput:
            "$ cast call 0x1A2a --data 0xa21a9508...173600000000000000000000",
          terminalOutput:
            "SUCCESS: 173600000000000000000000 ETH transferred to 0x098B716...",
        },
        {
          hash: "0xed2c72ef1a552ddaec6dd1f5cddf0b59a8f37f82",
          blockNumber: 14442754,
          timestamp: "2022-03-23 00:32:12",
          from: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
          to: "0x1A2a1c938CE3eC39b6D47113c7955bAa9DD454F2",
          value: "0 ETH",
          gasUsed: "165,000",
          gasPrice: "42 Gwei",
          method: "withdrawERC20(USDC, 25500000000000)",
          description: "USDC withdrawal using same compromised keys",
          impact: "Drained 25.5M USDC tokens",
          terminalInput:
            "$ cast call 0x1A2a --data 0xb9e93f53...25500000000000",
          terminalOutput:
            "SUCCESS: 25500000000000 USDC transferred to 0x098B716...",
        },
      ],
      timeline: [
        "00:31:35 - Validator keys compromised via social engineering",
        "00:31:35 - First ETH withdrawal: 173,600 ETH",
        "00:32:12 - USDC withdrawal: 25.5M tokens",
        "00:33:45 - Bridge drained completely",
        "06 days later - Hack discovered by community",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "ftx-2022",
      name: "FTX Exchange Hack",
      date: "November 11, 2022",
      description:
        "Mysterious drainer exploited FTX during bankruptcy proceedings, stealing over $600M across multiple chains.",
      totalLoss: "$600M+ (Multiple tokens)",
      exploitType: "other",
      attackerAddress: "0x59abf3837fa962d6853b4cc0a19513aa031fd32b",
      targetContract: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2",
      transactions: [
        {
          hash: "0x5806db9d8bfb9e9e2b7e7e8a8e8b8c8d8e8f8g8h",
          blockNumber: 15943271,
          timestamp: "2022-11-11 23:17:43",
          from: "0x59abf3837fa962d6853b4cc0a19513aa031fd32b",
          to: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2",
          value: "0 ETH",
          gasUsed: "250,000",
          gasPrice: "15 Gwei",
          method: "transfer(0x59ab..., 228523123456789012345678)",
          description: "Mass token transfer during FTX bankruptcy chaos",
          impact: "Drained FTX hot wallet of multiple tokens",
          terminalInput:
            "$ for token in $(cat tokens.txt); do cast call $token 'transfer(address,uint256)' 0x59ab... $(cast balance $token 0x2faf...); done",
          terminalOutput:
            "Transferred 228523123456789012345678 tokens\nTransferred 156789012345678901234567 tokens\n... (continuing for 200+ tokens)",
        },
      ],
      timeline: [
        "23:17:43 - Unauthorized transactions detected",
        "23:18:15 - Multiple hot wallets drained simultaneously",
        "23:19:02 - Cross-chain bridge exploits initiated",
        "23:25:33 - Over $600M stolen across chains",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "poly-network-2021",
      name: "Poly Network Hack",
      date: "August 10, 2021",
      description:
        "Largest DeFi hack at the time. Attacker exploited cross-chain protocol to steal $610M, later returned most funds.",
      totalLoss: "$610M (Later returned)",
      exploitType: "bridge",
      attackerAddress: "0xC8a65Fadf0e0dDAf421F28FEAb69Bf6E2E589963",
      targetContract: "0x250e76987d838a75310c34bf422ea9f1AC4Cc906",
      transactions: [
        {
          hash: "0xb1f70464bd95b774c6ce60fc706eb5f9e35cb5f06e6",
          blockNumber: 13005600,
          timestamp: "2021-08-10 14:16:32",
          from: "0xC8a65Fadf0e0dDAf421F28FEAb69Bf6E2E589963",
          to: "0x250e76987d838a75310c34bf422ea9f1AC4Cc906",
          value: "0 ETH",
          gasUsed: "300,000",
          gasPrice: "30 Gwei",
          method: "verifyHeaderAndExecuteTx()",
          description:
            "Exploited keeper replacement to forge cross-chain transaction",
          impact: "Forged transaction to steal cross-chain assets",
          terminalInput:
            "$ python3 exploit.py --target 0x250e76 --keeper $(generate_fake_keeper) --payload $(craft_payload)",
          terminalOutput:
            "Keeper replaced successfully\nForged tx hash: 0xb1f70464bd95b774c6ce60fc706eb5f9e35cb5f06e6\nCross-chain unlock triggered: $610M",
        },
      ],
      timeline: [
        "14:16:32 - Keeper replacement exploit initiated",
        "14:17:15 - Cross-chain verification bypassed",
        "14:18:45 - $610M drained across ETH, BSC, Polygon",
        "14:22:30 - White hat message sent by attacker",
        "3 days later - Funds gradually returned",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "wormhole-2022",
      name: "Wormhole Bridge Hack",
      date: "February 2, 2022",
      description:
        "Attacker exploited signature verification flaw to mint 120,000 wETH without backing ETH on Ethereum.",
      totalLoss: "120,000 wETH (~$325M)",
      exploitType: "bridge",
      attackerAddress: "0x629e7Da20197a5429d30da36E77d06CdF796b71A",
      targetContract: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      transactions: [
        {
          hash: "0x3b0bc8b97abfef4cd8b97e0e8b8d8b8a8b8c8d8e",
          blockNumber: 14274103,
          timestamp: "2022-02-02 18:24:19",
          from: "0x629e7Da20197a5429d30da36E77d06CdF796b71A",
          to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
          value: "0 ETH",
          gasUsed: "142,000",
          gasPrice: "60 Gwei",
          method: "completeTransfer(bytes)",
          description: "Exploited outdated guardian set to forge VAA",
          impact: "Minted 120,000 wETH without backing",
          terminalInput:
            "$ node forge_vaa.js --amount 120000 --recipient 0x629e7 --guardian_set old_guardians.json",
          terminalOutput:
            "VAA forged successfully\nGuardian signatures: [VALID] x19\nSubmitting to Wormhole core...\nSUCCESS: 120000000000000000000000 wETH minted",
        },
      ],
      timeline: [
        "18:24:19 - Outdated guardian set signatures forged",
        "18:24:35 - 120,000 wETH minted on Ethereum",
        "18:25:12 - Started converting to ETH via DEXs",
        "18:42:15 - Exploit completed, protocol drained",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "binance-bridge-2022",
      name: "BNB Chain Bridge Hack",
      date: "October 7, 2022",
      description:
        "Attacker exploited BNB Chain bridge using forged IAVL proof to mint 2M BNB tokens.",
      totalLoss: "2M BNB (~$570M)",
      exploitType: "bridge",
      attackerAddress: "0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec",
      targetContract: "0xddd42201e485abd8a7d6b9611a59b53b4b72df88",
      transactions: [
        {
          hash: "0x05356fd06d8304679b2e2b3b3e3b3d3c3a3b3938",
          blockNumber: 21977937,
          timestamp: "2022-10-07 02:26:42",
          from: "0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec",
          to: "0xddd42201e485abd8a7d6b9611a59b53b4b72df88",
          value: "0 BNB",
          gasUsed: "190,000",
          gasPrice: "5 Gwei",
          method: "receivePayload(bytes,bytes)",
          description: "Forged IAVL proof to mint massive BNB amount",
          impact: "Minted 2M BNB tokens illegally",
          terminalInput:
            "$ python3 iavl_forge.py --target 0xddd4220 --amount 2000000000000000000000000 --proof $(generate_proof)",
          terminalOutput:
            "IAVL proof generated\nMerkle root validated: TRUE\nPayload crafted: 2000000000000000000000000 BNB\nTransaction broadcast... SUCCESS",
        },
      ],
      timeline: [
        "02:26:42 - IAVL proof forged for cross-chain mint",
        "02:27:15 - 2M BNB minted on BSC",
        "02:28:33 - Started liquidating via DEXs",
        "02:35:00 - BSC validators halted chain",
        "06:00:00 - Hard fork implemented to freeze funds",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "nomad-2022",
      name: "Nomad Bridge Hack",
      date: "August 1, 2022",
      description:
        "Mass copycat attack where hundreds of users drained Nomad bridge by copying successful withdrawal transactions.",
      totalLoss: "$190M",
      exploitType: "bridge",
      attackerAddress: "0x56d8b635a7c88fd1104a8d7f3f72aee12574bb9e",
      targetContract: "0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3",
      transactions: [
        {
          hash: "0x6363ac03bbdfda96ffde75281ab2e9e4e37dc0ac81d91e8b6e7b8e8b7e6e5e4e3",
          blockNumber: 15259101,
          timestamp: "2022-08-01 21:32:17",
          from: "0x56d8b635a7c88fd1104a8d7f3f72aee12574bb9e",
          to: "0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3",
          value: "0 ETH",
          gasUsed: "150,000",
          gasPrice: "25 Gwei",
          method: "prove(bytes32,bytes32[],uint256)",
          description: "First successful exploit of trusted root",
          impact: "Proved invalid withdrawal, started copycat frenzy",
          terminalInput:
            "$ cast call 0x88A69B 'prove(bytes32,bytes32[],uint256)' 0x00000000000000 [0x12345...] 100000000000000000000",
          terminalOutput:
            "Proof submitted successfully\nTrusted root: 0x00000000000000...\nWithdrawal validated: TRUE\n100 WETH transferred",
        },
      ],
      timeline: [
        "21:32:17 - First exploit transaction proved invalid root",
        "21:33:45 - Second user copied the transaction",
        "21:34:00 - Hundreds of users began copying exploit",
        "22:15:30 - Bridge completely drained by copycats",
        "23:00:00 - Total loss reached $190M",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "dao-hack-2016",
      name: "The DAO Hack",
      date: "June 17, 2016",
      description:
        "Historic reentrancy attack that drained 3.6M ETH from The DAO, leading to Ethereum's controversial hard fork.",
      totalLoss: "3,600,000 ETH (~$50M)",
      exploitType: "reentrancy",
      attackerAddress: "0x969837498944ae1dc0dcac2d0c65634c88729b2d",
      targetContract: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413",
      transactions: [
        {
          hash: "0xaa262afdf199bb32b0df72e48ca9e9d9fa4e61ec7",
          blockNumber: 1718497,
          timestamp: "2016-06-17 13:34:07",
          from: "0x969837498944ae1dc0dcac2d0c65634c88729b2d",
          to: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413",
          value: "0 ETH",
          gasUsed: "2,300,000",
          gasPrice: "20 Gwei",
          method: "splitDAO(uint256,address)",
          description:
            "Initial reentrancy attack vector via recursive splitting",
          impact: "Triggered recursive withdrawal vulnerability",
          terminalInput:
            '$ geth attach ipc:$HOME/.ethereum/geth.ipc --exec \'eth.sendTransaction({from: eth.accounts[0], to: "0xBB9bc244", data: "0x4ee58366000000..." })\'',
          terminalOutput:
            "Transaction submitted: 0xaa262afdf199bb32b0df72e48ca9e9d9fa4e61ec7\nStatus: PENDING\nRecursive call detected...\nSplitDAO executed successfully",
        },
        {
          hash: "0xbb7b131dc60b80d5b93c1ba928a4e423c6c64b4bb4c6",
          blockNumber: 1718500,
          timestamp: "2016-06-17 13:45:23",
          from: "0x969837498944ae1dc0dcac2d0c65634c88729b2d",
          to: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413",
          value: "258,000 ETH",
          gasUsed: "1,950,000",
          gasPrice: "20 Gwei",
          method: "withdrawRewardFor(address)",
          description: "Major ETH withdrawal via reentrancy",
          impact: "Drained 258,000 ETH before balance update",
          terminalInput:
            "$ geth attach ipc:$HOME/.ethereum/geth.ipc --exec 'dao.withdrawRewardFor.sendTransaction(\"0x969837...\", {from: eth.accounts[0], gas: 2000000})'",
          terminalOutput:
            "Reentrancy exploit successful!\nBalance check bypassed\n258000000000000000000000 wei transferred\nDAO balance: 3342000 ETH remaining",
        },
      ],
      timeline: [
        "13:34:07 - First splitDAO call initiates reentrancy",
        "13:45:23 - Major withdrawRewardFor exploit",
        "14:22:47 - Attack pattern continues for hours",
        "16:45:00 - 3.6M ETH drained, community in panic",
        "July 20 - Ethereum hard fork reverses the hack",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "beanstalk-2022",
      name: "Beanstalk Governance Attack",
      date: "April 17, 2022",
      description:
        "Attacker used flash loan to gain governance majority and vote to transfer all protocol funds to themselves.",
      totalLoss: "$182M",
      exploitType: "governance",
      attackerAddress: "0x1c5dcdd006ea78a7e4783f9e6021c32935a10fb4",
      targetContract: "0xc1e088fc1323b20bcbee9bd1b9fc9546db5624c5",
      transactions: [
        {
          hash: "0xcd314668aaa9bbfebaf1a0bd2b6553d01dd58899c",
          blockNumber: 14602790,
          timestamp: "2022-04-17 12:24:10",
          from: "0x1c5dcdd006ea78a7e4783f9e6021c32935a10fb4",
          to: "0xc1e088fc1323b20bcbee9bd1b9fc9546db5624c5",
          value: "0 ETH",
          gasUsed: "2,900,000",
          gasPrice: "35 Gwei",
          method: "emergencyCommit(uint256)",
          description:
            "Used flash loan governance voting to pass malicious proposal",
          impact: "Gained voting majority and drained all protocol funds",
          terminalInput:
            "$ cast send 0xc1e088 'emergencyCommit(uint256)' 18 --private-key $PRIVATE_KEY --gas-limit 3000000",
          terminalOutput:
            "Flash loan initiated: 1,000,000,000 BEAN\nVoting power acquired: 67%\nEmergency proposal 18 passed: TRUE\nFunds transfer authorized\nProtocol drained: $182M",
        },
      ],
      timeline: [
        "12:24:10 - Flash loan initiated for 1B BEAN tokens",
        "12:24:10 - Emergency governance proposal submitted",
        "12:24:10 - Proposal passed with 67% voting power",
        "12:24:10 - All protocol funds transferred to attacker",
        "12:24:25 - Flash loan repaid, attack completed",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "euler-2023",
      name: "Euler Finance Hack",
      date: "March 13, 2023",
      description:
        "Complex multi-step attack exploiting donated collateral mechanism to drain $197M from Euler lending protocol.",
      totalLoss: "$197M",
      exploitType: "flash_loan",
      attackerAddress: "0x5f259d0b76665c337c6104145894f4d1d2758b8c",
      targetContract: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
      transactions: [
        {
          hash: "0xc3e6deef74e68d47f8e51b6fd6f509849ea54e96",
          blockNumber: 16817996,
          timestamp: "2023-03-13 07:56:35",
          from: "0x5f259d0b76665c337c6104145894f4d1d2758b8c",
          to: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
          value: "0 ETH",
          gasUsed: "1,850,000",
          gasPrice: "45 Gwei",
          method: "donateToReserves(uint256,uint256)",
          description:
            "Exploited donated collateral to manipulate borrowing power",
          impact: "Created negative borrow balance via donation exploit",
          terminalInput:
            "$ cast send 0x27182842 'donateToReserves(uint256,uint256)' 200000000000000000000000000 0 --private-key $PRIVATE_KEY",
          terminalOutput:
            "Flash loan: 200M DAI borrowed\nCollateral donated: 200M DAI\nBorrow balance: -200M DAI (negative!)\nLiquidation protection: BYPASSED\nPosition manipulation: SUCCESS",
        },
      ],
      timeline: [
        "07:56:35 - Flash loan 200M DAI from Aave",
        "07:56:35 - Donated 200M DAI to create negative balance",
        "07:56:35 - Exploited liquidation mechanics",
        "07:57:12 - Drained multiple pools: DAI, USDC, WETH",
        "07:58:00 - $197M stolen, flash loan repaid",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "thorchain-2021",
      name: "THORChain Multi-Attack",
      date: "July 15, 2021",
      description:
        "Series of attacks exploiting cross-chain router vulnerabilities to drain $8M from THORChain protocol.",
      totalLoss: "$8M",
      exploitType: "bridge",
      attackerAddress: "0x3455ee9b6b468b2085b1bd83b8ba419e3c3b7a29",
      targetContract: "0xd37bbe5744d730a1d98d8dc97c42f0ca46ad7146",
      transactions: [
        {
          hash: "0xe2d73f8e20ab8aa5ee5a32fb7c6a6e4e8dd924de",
          blockNumber: 12838023,
          timestamp: "2021-07-15 19:32:41",
          from: "0x3455ee9b6b468b2085b1bd83b8ba419e3c3b7a29",
          to: "0xd37bbe5744d730a1d98d8dc97c42f0ca46ad7146",
          value: "0 ETH",
          gasUsed: "280,000",
          gasPrice: "42 Gwei",
          method: "depositWithExpiry(address,address,uint256,string,uint256)",
          description: "Exploited router memo parsing to steal deposited ETH",
          impact: "Diverted ETH deposits to attacker address",
          terminalInput:
            "$ node thorchain_exploit.js --memo 'SWAP:ETH.ETH:0x3455ee...:' --amount 200000000000000000000",
          terminalOutput:
            "Deposit memo crafted: SWAP:ETH.ETH:0x3455ee9b6b468b2085b1bd83b8ba419e3c3b7a29\nRouter parsing exploited\nETH redirected: 200 ETH\nAttack successful: $8M total drained",
        },
      ],
      timeline: [
        "19:32:41 - Router memo parsing exploit discovered",
        "19:33:15 - Multiple deposits redirected to attacker",
        "19:45:30 - Cross-chain vulnerabilities chained together",
        "20:15:00 - $8M total stolen across multiple chains",
        "21:00:00 - Protocol suspended trading",
      ],
      status: "completed",
      currentStep: 0,
    },
  ]);

  // Honeypot Detection State
  const [honeypotResults, setHoneypotResults] = useState<
    HoneypotDetectionResult[]
  >([]);
  const [targetContract, setTargetContract] = useState("");
  const [isAnalyzingHoneypot, setIsAnalyzingHoneypot] = useState(false);
  const [detectionMode, setDetectionMode] = useState<"single" | "similarity">(
    "single",
  );

  // Quantum State
  const [quantumTests, setQuantumTests] = useState<QuantumResult[]>([]);
  const [testKey, setTestKey] = useState("");

  // Simulation State
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [simulationParams, setSimulationParams] = useState({
    type: "transaction" as const,
    gasLimit: 300000,
    value: "1.0",
  });

  // Reports Service State
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportParams, setReportParams] = useState<ReportGenerationParams>({
    title: "",
    type: "security",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    includeCharts: true,
    services: ["scanner", "forensics", "honeypot"],
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboardData>({
    totalUsers: 1247,
    totalScans: 8934,
    averageRiskScore: 67,
    trendsData: {
      scans: generateSampleData.lineChart(30).map((item, index) => ({
        date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        count: Math.floor(item.value * 10),
      })),
      vulnerabilities: generateSampleData.lineChart(30).map((item, index) => ({
        date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        count: Math.floor(item.value / 10),
        severity: ["Critical", "High", "Medium", "Low"][index % 4],
      })),
      performance: generateSampleData.lineChart(30).map((item, index) => ({
        date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        responseTime: Math.floor(item.value * 2 + 100),
      })),
    },
    topVulnerabilities: generateSampleData
      .barChart([
        "Reentrancy",
        "Integer Overflow",
        "Access Control",
        "DoS",
        "Front Running",
      ])
      .map((item) => ({
        name: item.name,
        count: item.value,
        severity: ["Critical", "High", "Medium", "Low", "Info"][
          Math.floor(Math.random() * 5)
        ],
      })),
    serviceUsage: generateSampleData
      .barChart(["Scanner", "Forensics", "MEV Bot", "Bridge", "Honeypot"])
      .map((item) => ({
        service: item.name,
        usage: item.value,
        uptime: 95 + Math.random() * 5,
      })),
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("overview");

  // Simulate real-time mempool updates
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newTx: MempoolTransaction = {
        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: (Math.random() * 10).toFixed(4),
        gasPrice: Math.floor(Math.random() * 100 + 20).toString(),
        gasLimit: Math.floor(Math.random() * 200000 + 21000).toString(),
        timestamp: new Date().toLocaleTimeString(),
        riskLevel: ["Low", "Medium", "High"][
          Math.floor(Math.random() * 3)
        ] as any,
        ...(Math.random() > 0.7 && {
          mevOpportunity: {
            type: ["arbitrage", "liquidation", "sandwich"][
              Math.floor(Math.random() * 3)
            ] as any,
            profit: (Math.random() * 5).toFixed(3),
          },
        }),
      };

      setMempoolTransactions((prev) => [newTx, ...prev.slice(0, 49)]);
      if (newTx.mevOpportunity) {
        setMevOpportunities((prev) => prev + 1);
      }

      // Update mempool charts
      setMempoolChartData((prev) => {
        const lastValue = prev[prev.length - 1]?.value || 100;
        const newPoint = generateRealTimeDataPoint(lastValue, 0.1, 0);
        return [...prev.slice(1), newPoint];
      });

      setGasChartData((prev) => {
        const lastValue = prev[prev.length - 1]?.value || 50;
        const newPoint = generateRealTimeDataPoint(lastValue, 0.15, 0);
        return [...prev.slice(1), newPoint];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Simulate real-time chart updates for other services
  useEffect(() => {
    const interval = setInterval(() => {
      // Update scanner charts
      setScanChartData((prev) => {
        const lastValue = prev[prev.length - 1]?.value || 75;
        const newPoint = generateRealTimeDataPoint(lastValue, 0.1, 0.5);
        return [...prev.slice(1), newPoint];
      });

      // Update MEV charts
      setMevProfitChart((prev) => {
        const lastValue = prev[prev.length - 1]?.value || 2;
        const newPoint = generateRealTimeDataPoint(lastValue, 0.2, 0.1);
        return [...prev.slice(1), newPoint];
      });

      // Send WebSocket message to simulate backend updates (if connected)
      if (webSocket.isConnected) {
        webSocket.sendMessage({
          type: "chart_update",
          service: "dashboard",
          data: {
            timestamp: new Date().toISOString(),
            metrics: {
              scanScore: Math.floor(Math.random() * 100),
              mempoolVolume: Math.floor(Math.random() * 1000),
              mevProfit: (Math.random() * 5).toFixed(3),
            },
          },
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [webSocket.isConnected, webSocket.sendMessage]);

  const startExploitReplay = (exploit: FamousExploit) => {
    console.log("=== STARTING EXPLOIT REPLAY ===", exploit.name);
    console.log("Exploit has", exploit.transactions.length, "transactions");

    // Set initial state
    setReplayState({
      isReplaying: true,
      currentExploit: exploit,
      replaySpeed: 1,
      currentTransaction: 0,
    });

    // Start simple replay
    let currentTx = 0;
    const playNextTransaction = () => {
      console.log(
        `Playing transaction ${currentTx + 1}/${exploit.transactions.length}`,
      );

      setReplayState((prev) => ({
        ...prev,
        currentTransaction: currentTx,
      }));

      currentTx++;

      if (currentTx < exploit.transactions.length) {
        setTimeout(playNextTransaction, 3000); // 3 seconds between transactions
      } else {
        console.log("Replay completed!");
        setReplayState((prev) => ({ ...prev, isReplaying: false }));
      }
    };

    // Start first transaction after 1 second
    setTimeout(playNextTransaction, 1000);
  };

  // Simplified pause/resume functions
  const pauseReplay = () => {
    console.log("Pause clicked");
    setReplayState((prev) => ({ ...prev, isReplaying: false }));
  };

  const resumeReplay = () => {
    console.log("Resume clicked");
    setReplayState((prev) => ({ ...prev, isReplaying: true }));
  };

  const stopReplay = () => {
    setReplayState({
      isReplaying: false,
      currentExploit: null,
      replaySpeed: 1,
      currentTransaction: 0,
    });
  };

  const changeReplaySpeed = (speed: number) => {
    console.log("Speed changed to:", speed);
    setReplayState((prev) => ({ ...prev, replaySpeed: speed }));
  };

  const analyzeForHoneypot = async () => {
    if (!targetContract.trim()) return;

    setIsAnalyzingHoneypot(true);
    const analysisId = `analysis_${Date.now()}`;

    // Create initial analysis result
    const initialResult: HoneypotDetectionResult = {
      id: analysisId,
      contractAddress: targetContract,
      riskScore: 0,
      honeypotType: "unknown",
      detectionMethod:
        detectionMode === "single" ? "pattern_analysis" : "bytecode_similarity",
      similarContracts: [],
      confidence: 0,
      timestamp: new Date().toLocaleString(),
      status: "analyzing",
    };

    setHoneypotResults((prev) => [initialResult, ...prev]);

    // Simulate analysis stages
    const stages = [
      "Fetching contract bytecode",
      "Analyzing transfer functions",
      "Checking for hidden modifiers",
      "Scanning for balance manipulation",
      "Running pattern matching",
      detectionMode === "similarity"
        ? "Comparing with known honeypots"
        : "Evaluating risk patterns",
      "Calculating confidence score",
      "Finalizing analysis",
    ];

    // Simulate progressive analysis
    for (let i = 0; i < stages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const progress = Math.round(((i + 1) / stages.length) * 100);

      setHoneypotResults((prev) =>
        prev.map((result) =>
          result.id === analysisId
            ? { ...result, currentStage: stages[i] }
            : result,
        ),
      );
    }

    // Generate final results
    const riskScore = Math.floor(Math.random() * 100);
    const isHoneypot = riskScore > 70;
    const honeypotTypes = [
      "transfer_honeypot",
      "balance_modifier",
      "hidden_function",
      "gas_limit",
    ] as const;
    const honeypotType = isHoneypot
      ? honeypotTypes[Math.floor(Math.random() * honeypotTypes.length)]
      : "unknown";

    // Generate similar contracts if using similarity detection
    const similarContracts =
      detectionMode === "similarity" && isHoneypot
        ? Array.from(
            { length: Math.floor(Math.random() * 5) + 1 },
            () => `0x${Math.random().toString(16).substr(2, 40)}`,
          )
        : [];

    const finalResult: HoneypotDetectionResult = {
      ...initialResult,
      riskScore,
      honeypotType,
      similarContracts,
      confidence: Math.floor(Math.random() * 30) + 70,
      status: isHoneypot
        ? "honeypot_detected"
        : riskScore > 40
          ? "suspicious"
          : "safe",
      currentStage: undefined,
    };

    setHoneypotResults((prev) =>
      prev.map((result) => (result.id === analysisId ? finalResult : result)),
    );

    setIsAnalyzingHoneypot(false);
    setTargetContract("");
  };

  const startContractScan = async () => {
    if (!contractAddress.trim() || selectedPlugins.length === 0) return;

    setIsScanning(true);
    const scanId = `scan_${Date.now()}`;

    // Simulate scanning progress with selected plugins
    const newScan: ScanResult = {
      contractAddress,
      scanId,
      status: "scanning",
      progress: 0,
      vulnerabilities: [],
      securityScore: 0,
      gasOptimization: 0,
      timestamp: new Date().toLocaleString(),
      plugins: selectedPlugins, // Track which plugins were used
    };

    setScanResults((prev) => [newScan, ...prev]);

    // Simulate progress updates with plugin stages
    const totalPlugins = selectedPlugins.length;
    const progressPerPlugin = 100 / totalPlugins;

    for (
      let pluginIndex = 0;
      pluginIndex < selectedPlugins.length;
      pluginIndex++
    ) {
      const currentPlugin = selectedPlugins[pluginIndex];
      const baseProgress = pluginIndex * progressPerPlugin;

      // Simulate each plugin's scanning stages
      for (let stage = 0; stage <= 10; stage++) {
        const currentProgress = Math.min(
          baseProgress + (stage * progressPerPlugin) / 10,
          100,
        );
        await new Promise((resolve) => setTimeout(resolve, 300));

        setScanResults((prev) =>
          prev.map((scan) =>
            scan.scanId === scanId
              ? {
                  ...scan,
                  progress: Math.round(currentProgress),
                  currentPlugin: currentPlugin,
                  pluginStage:
                    stage === 10
                      ? "completed"
                      : getPluginStage(currentPlugin, stage),
                }
              : scan,
          ),
        );
      }
    }

    // Simulate final results
    const vulnerabilities: Vulnerability[] = [
      {
        id: "V1",
        severity: "High",
        title: "Reentrancy Vulnerability",
        description:
          "External call before state update may allow reentrancy attack",
        line: 45,
        recommendation: "Use checks-effects-interactions pattern",
      },
      {
        id: "V2",
        severity: "Medium",
        title: "Integer Overflow",
        description: "Arithmetic operation may overflow",
        line: 78,
        recommendation: "Use SafeMath library or Solidity 0.8+",
      },
      {
        id: "V3",
        severity: "Low",
        title: "Gas Optimization",
        description: "Loop can be optimized to reduce gas costs",
        line: 123,
        recommendation: "Consider using assembly or alternative approach",
      },
    ];

    const finalResult: ScanResult = {
      contractAddress,
      scanId,
      status: "completed",
      progress: 100,
      vulnerabilities,
      securityScore: 72,
      gasOptimization: 85,
      timestamp: new Date().toLocaleString(),
    };

    setScanResults((prev) =>
      prev.map((scan) => (scan.scanId === scanId ? finalResult : scan)),
    );

    setIsScanning(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-500";
      case "High":
        return "text-orange-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
      case "High":
        return XCircle;
      case "Medium":
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-white font-mono animate-fade-in cyber-grid relative overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-32 h-32 border border-cyber-cyan/10 rounded-full animate-cyber-pulse"></div>
        <div
          className="absolute top-40 right-40 w-24 h-24 border border-cyber-cyan/10 rounded-full animate-cyber-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-32 w-16 h-16 border border-cyber-cyan/10 rounded-full animate-cyber-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-20 h-20 border border-cyber-cyan/10 rounded-full animate-cyber-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Main Content Tabs - moved to wrap header */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-xl"
      >
        {/* Redesigned Header with 3D Logo and Bottom Tabs */}
        <header className="cyber-border-glow cyber-bg sticky top-0 z-50 transition-all duration-300 relative">
          <div className="container mx-auto px-lg">
            {/* Top Section with Profile */}
            <div className="flex justify-end py-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-10 w-10 rounded-full cyber-border hover:cyber-border-glow"
                  >
                    <User className="h-5 w-5 text-cyber-cyan" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 cyber-bg cyber-border mt-2"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-cyber-cyan">
                        Admin User
                      </p>
                      <p className="text-xs leading-none text-cyber-cyan/60">
                        admin@scorpius.security
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-cyber-cyan/20" />
                  <DropdownMenuItem className="text-cyber-cyan hover:bg-cyber-cyan/10 focus:bg-cyber-cyan/10">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-cyber-cyan hover:bg-cyber-cyan/10 focus:bg-cyber-cyan/10">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyber-cyan/20" />
                  <DropdownMenuItem className="text-red-400 hover:bg-red-400/10 focus:bg-red-400/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Main Logo Section */}
            <div className="text-center py-1">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-wide mb-2 relative"
                style={{
                  fontFamily:
                    'Impact, "Arial Black", "Franklin Gothic Bold", "Arial Narrow", sans-serif',
                }}
              >
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] [text-shadow:_0_1px_0_rgba(255,255,255,0.8),_0_2px_0_rgba(200,200,200,0.6),_0_3px_0_rgba(150,150,150,0.4),_0_4px_0_rgba(100,100,100,0.2)] filter brightness-125 contrast-125">
                  SCORPIUS
                </span>
                {/* Metallic 3D Shadow Effect */}
                <span className="absolute inset-0 text-slate-600/60 transform translate-x-1 translate-y-1 -z-10">
                  SCORPIUS
                </span>
                {/* Metallic highlight shine */}
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-t from-transparent via-white/30 to-transparent transform -translate-y-1">
                  SCORPIUS
                </span>
                {/* Additional chrome reflection */}
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-0.5">
                  SCORPIUS
                </span>
              </h1>
              <p className="text-sm text-cyber-cyan/80 font-medium uppercase tracking-[0.3em] animate-fade-in">
                Quantum Security Platform
              </p>
            </div>

            {/* Bottom Tabs Section */}
            <div className="pb-4">
              <TabsList className="flex justify-center items-center gap-2 md:gap-4 lg:gap-6 flex-wrap bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="scanner"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <Shield className="w-4 h-4" />
                  Scanner
                </TabsTrigger>
                <TabsTrigger
                  value="mempool"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <Activity className="w-4 h-4" />
                  Mempool
                </TabsTrigger>
                <TabsTrigger
                  value="mev-ops"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <Zap className="w-4 h-4" />
                  MEV OPS
                </TabsTrigger>
                <TabsTrigger
                  value="bridge"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Bridge
                </TabsTrigger>
                <TabsTrigger
                  value="forensics"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Forensics
                </TabsTrigger>
                <TabsTrigger
                  value="time-machine"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Time Machine
                </TabsTrigger>
                <TabsTrigger
                  value="honeypot"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <Target className="w-4 h-4" />
                  Honeypot
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center gap-2 px-4 py-2 rounded-button transition-all duration-300 hover:bg-cyber-cyan/20 data-[state=active]:bg-cyber-cyan data-[state=active]:text-cyber-black font-medium font-mono uppercase tracking-wide text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-lg py-xl relative z-10">
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl animate-slide-up">
            <Card className="cyber-bg cyber-border-glow text-cyber-white border-0 overflow-hidden relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 to-transparent opacity-50"></div>
              <CardHeader className="pb-sm relative z-10">
                <CardTitle className="text-sm font-medium cyber-glow tracking-widest uppercase">
                  Contracts Scanned
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight cyber-glow-strong font-mono">
                  {scanResults.length}
                </div>
              </CardContent>
            </Card>
            <Card className="cyber-bg cyber-border-glow text-cyber-white border-0 overflow-hidden relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-50"></div>
              <CardHeader className="pb-sm relative z-10">
                <CardTitle className="text-sm font-medium text-red-400 tracking-widest uppercase">
                  Vulnerabilities Found
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-red-400 font-mono">
                  {scanResults.reduce(
                    (acc, scan) => acc + scan.vulnerabilities.length,
                    0,
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="cyber-bg cyber-border-glow text-cyber-white border-0 overflow-hidden relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50"></div>
              <CardHeader className="pb-sm relative z-10">
                <CardTitle className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                  Mempool Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-purple-400 font-mono">
                  {mempoolTransactions.length}
                </div>
              </CardContent>
            </Card>
            <Card className="cyber-bg cyber-border-glow text-cyber-white border-0 overflow-hidden relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-50"></div>
              <CardHeader className="pb-sm relative z-10">
                <CardTitle className="text-sm font-medium text-yellow-400 tracking-widest uppercase">
                  MEV Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-yellow-400 font-mono">
                  {mevOpportunities}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Fortune 500 Overview Dashboard */}
          <TabsContent value="overview" className="space-y-8">
            {/* Real-time System Health Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* System Health Score */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg cyber-glow">
                    <Cpu className="w-5 h-5 text-cyber-cyan animate-cyber-pulse" />
                    SYSTEM HEALTH
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="rgba(0,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="url(#healthGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.94)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient
                          id="healthGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#00ffff" />
                          <stop offset="100%" stopColor="#00cc99" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold cyber-glow-strong">
                        94%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-cyber-cyan/70 uppercase tracking-wide">
                      System Status
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      OPTIMAL
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Metrics Grid */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Active Threats */}
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-400 animate-cyber-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-red-400 font-mono">
                      {scanResults.reduce(
                        (acc, scan) =>
                          acc +
                          scan.vulnerabilities.filter(
                            (v) => v.severity === "Critical",
                          ).length,
                        0,
                      )}
                    </div>
                    <div className="text-xs text-red-400/70 uppercase tracking-wide">
                      Critical Threats
                    </div>
                  </CardContent>
                </Card>

                {/* Transactions Per Second */}
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="w-6 h-6 text-cyan-400 animate-cyber-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-cyan-400 font-mono">
                      {Math.floor(Math.random() * 50 + 150)}
                    </div>
                    <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
                      TXs/Second
                    </div>
                  </CardContent>
                </Card>

                {/* MEV Profit Today */}
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="w-6 h-6 text-green-400 animate-cyber-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-green-400 font-mono">
                      {(
                        mevStrategies.reduce(
                          (acc, s) => acc + s.totalProfit,
                          0,
                        ) * 0.15
                      ).toFixed(2)}
                    </div>
                    <div className="text-xs text-green-400/70 uppercase tracking-wide">
                      ETH Today
                    </div>
                  </CardContent>
                </Card>

                {/* System Uptime */}
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-6 h-6 text-blue-400 animate-cyber-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-blue-400 font-mono">
                      99.97%
                    </div>
                    <div className="text-xs text-blue-400/70 uppercase tracking-wide">
                      Uptime
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Advanced Monitoring Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real-time Threat Intelligence */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Shield className="w-5 h-5 text-cyber-cyan" />
                    THREAT INTELLIGENCE MATRIX
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-400 mb-1">
                        {scanResults.reduce(
                          (acc, scan) =>
                            acc +
                            scan.vulnerabilities.filter(
                              (v) =>
                                v.severity === "Critical" ||
                                v.severity === "High",
                            ).length,
                          0,
                        )}
                      </div>
                      <div className="text-xs text-red-400 uppercase">
                        High Risk
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">
                        {scanResults.reduce(
                          (acc, scan) =>
                            acc +
                            scan.vulnerabilities.filter(
                              (v) => v.severity === "Medium",
                            ).length,
                          0,
                        )}
                      </div>
                      <div className="text-xs text-yellow-400 uppercase">
                        Medium Risk
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {scanResults.reduce(
                          (acc, scan) =>
                            acc +
                            scan.vulnerabilities.filter(
                              (v) =>
                                v.severity === "Low" || v.severity === "Info",
                            ).length,
                          0,
                        )}
                      </div>
                      <div className="text-xs text-green-400 uppercase">
                        Low Risk
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {scanResults.slice(0, 3).map((scan, index) => (
                      <div
                        key={scan.scanId}
                        className="flex items-center justify-between p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full animate-cyber-pulse ${
                              scan.vulnerabilities.some(
                                (v) => v.severity === "Critical",
                              )
                                ? "bg-red-400"
                                : scan.vulnerabilities.some(
                                      (v) => v.severity === "High",
                                    )
                                  ? "bg-yellow-400"
                                  : "bg-green-400"
                            }`}
                          />
                          <div>
                            <div className="text-sm font-medium text-cyber-cyan">
                              Contract {scan.contractAddress.slice(0, 8)}...
                            </div>
                            <div className="text-xs text-cyber-cyan/60">
                              {scan.vulnerabilities.length} vulnerabilities •
                              Score: {scan.securityScore}%
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            scan.vulnerabilities.some(
                              (v) => v.severity === "Critical",
                            )
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {scan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Cpu className="w-5 h-5 text-cyber-cyan" />
                    PERFORMANCE METRICS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* CPU Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-cyber-cyan">CPU Usage</span>
                      <span className="text-sm font-mono text-cyan-400">
                        23%
                      </span>
                    </div>
                    <div className="w-full bg-cyber-cyan/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyber-cyan to-cyan-400 h-2 rounded-full"
                        style={{ width: "23%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-cyber-cyan">Memory</span>
                      <span className="text-sm font-mono text-cyan-400">
                        67%
                      </span>
                    </div>
                    <div className="w-full bg-cyber-cyan/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyber-cyan to-cyan-400 h-2 rounded-full"
                        style={{ width: "67%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Network I/O */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-cyber-cyan">
                        Network I/O
                      </span>
                      <span className="text-sm font-mono text-cyan-400">
                        45%
                      </span>
                    </div>
                    <div className="w-full bg-cyber-cyan/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyber-cyan to-cyan-400 h-2 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>

                  {/* API Response Time */}
                  <div className="pt-2 border-t border-cyber-cyan/20">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-400 font-mono">
                          12ms
                        </div>
                        <div className="text-xs text-green-400/70">
                          Avg Response
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400 font-mono">
                          99.9%
                        </div>
                        <div className="text-xs text-blue-400/70">
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Operations Center */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Activity className="w-5 h-5 text-cyber-cyan animate-cyber-pulse" />
                    LIVE OPERATIONS FEED
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {/* Real-time activity items */}
                      <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-cyber-pulse" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-400">
                            Security Scan Completed
                          </div>
                          <div className="text-xs text-green-400/70">
                            Contract 0x742d...89ab • Score: 94% �� Just now
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 animate-cyber-pulse" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-blue-400">
                            MEV Strategy Executed
                          </div>
                          <div className="text-xs text-blue-400/70">
                            Arbitrage Bot • +0.15 ETH • 2 min ago
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 animate-cyber-pulse" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-yellow-400">
                            High Gas Price Alert
                          </div>
                          <div className="text-xs text-yellow-400/70">
                            Current: 65 gwei • Threshold: 50 gwei • 5 min ago
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 animate-cyber-pulse" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-400">
                            Critical Vulnerability Detected
                          </div>
                          <div className="text-xs text-red-400/70">
                            Reentrancy risk • Contract 0x123a...456b • 12 min
                            ago
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 animate-cyber-pulse" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-purple-400">
                            Cross-Chain Bridge Transfer
                          </div>
                          <div className="text-xs text-purple-400/70">
                            100 USDC • Ethereum → Polygon • 15 min ago
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 animate-cyber-pulse" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-cyan-400">
                            Honeypot Triggered
                          </div>
                          <div className="text-xs text-cyan-400/70">
                            Flash loan attack detected • 0.5 ETH captured • 18
                            min ago
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Executive Network Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Globe className="w-5 h-5 text-cyber-cyan animate-cyber-pulse" />
                    NETWORK INTELLIGENCE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-lg">
                      <div className="text-2xl font-bold text-cyber-cyan mb-1">
                        {mempoolTransactions.length +
                          Math.floor(Math.random() * 50)}
                      </div>
                      <div className="text-xs text-cyber-cyan/70 uppercase">
                        Pending TXs
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {
                          mevStrategies.filter((s) => s.status === "active")
                            .length
                        }
                      </div>
                      <div className="text-xs text-green-400/70 uppercase">
                        Active Bots
                      </div>
                    </div>
                  </div>

                  {/* Network Status Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            ETH
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-cyber-cyan">
                            Ethereum Mainnet
                          </div>
                          <div className="text-xs text-cyber-cyan/60">
                            Block 18,945,123 • 12.3s
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-cyber-pulse" />
                        <span className="text-xs text-green-400">Healthy</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            POL
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-purple-400">
                            Polygon
                          </div>
                          <div className="text-xs text-purple-400/60">
                            Block 51,234,567 • 2.1s
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-cyber-pulse" />
                        <span className="text-xs text-green-400">Healthy</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            ARB
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-orange-400">
                            Arbitrum
                          </div>
                          <div className="text-xs text-orange-400/60">
                            Block 156,789,012 • 0.25s
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-cyber-pulse" />
                        <span className="text-xs text-yellow-400">
                          Congested
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Executive Quick Actions Command Center */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 cyber-glow">
                  <Settings className="w-5 h-5 text-cyber-cyan animate-cyber-pulse" />
                  COMMAND CENTER
                </CardTitle>
                <CardDescription className="text-cyber-cyan/60">
                  Executive-level rapid deployment and monitoring controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 cyber-border hover:cyber-border-glow hover:bg-cyber-cyan/10 transition-all duration-300"
                    onClick={() => setActiveTab("scanner")}
                  >
                    <Shield className="w-8 h-8 text-cyber-cyan" />
                    <span className="text-xs uppercase tracking-wide">
                      Security Scan
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 cyber-border hover:cyber-border-glow hover:bg-cyber-cyan/10 transition-all duration-300"
                    onClick={() => setActiveTab("mev-ops")}
                  >
                    <Zap className="w-8 h-8 text-yellow-400" />
                    <span className="text-xs uppercase tracking-wide">
                      MEV Deploy
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 cyber-border hover:cyber-border-glow hover:bg-cyber-cyan/10 transition-all duration-300"
                    onClick={() => setActiveTab("mempool")}
                  >
                    <Activity className="w-8 h-8 text-purple-400" />
                    <span className="text-xs uppercase tracking-wide">
                      Live Monitor
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 cyber-border hover:cyber-border-glow hover:bg-cyber-cyan/10 transition-all duration-300"
                    onClick={() => setActiveTab("bridge")}
                  >
                    <ArrowLeftRight className="w-8 h-8 text-blue-400" />
                    <span className="text-xs uppercase tracking-wide">
                      Cross Chain
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 cyber-border hover:cyber-border-glow hover:bg-cyber-cyan/10 transition-all duration-300"
                    onClick={() => setActiveTab("forensics")}
                  >
                    <Eye className="w-8 h-8 text-green-400" />
                    <span className="text-xs uppercase tracking-wide">
                      Forensics
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 cyber-border hover:cyber-border-glow hover:bg-cyber-cyan/10 transition-all duration-300"
                    onClick={() => setActiveTab("honeypot")}
                  >
                    <Target className="w-8 h-8 text-red-400" />
                    <span className="text-xs uppercase tracking-wide">
                      Honeypot
                    </span>
                  </Button>
                </div>

                {/* Emergency Controls */}
                <div className="mt-6 pt-6 border-t border-cyber-cyan/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-cyber-cyan uppercase tracking-wide">
                      Emergency Protocols
                    </h3>
                    <Badge
                      variant="destructive"
                      className="animate-cyber-pulse"
                    >
                      STANDBY
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="font-mono"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      STOP ALL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      PAUSE MEV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      LOCKDOWN
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      RESET SYS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <DollarSign className="w-5 h-5 text-green-400 animate-cyber-pulse" />
                    FINANCIAL OVERVIEW
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-xl font-bold text-green-400 font-mono">
                        $
                        {(
                          mevStrategies.reduce(
                            (acc, s) => acc + s.totalProfit,
                            0,
                          ) * 2847.5
                        ).toLocaleString()}
                      </div>
                      <div className="text-xs text-green-400/70 uppercase">
                        Total Value
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-xl font-bold text-blue-400 font-mono">
                        +24.7%
                      </div>
                      <div className="text-xs text-blue-400/70 uppercase">
                        24h Change
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Today's Profit
                      </span>
                      <span className="text-sm font-mono text-green-400">
                        +
                        {(
                          mevStrategies.reduce(
                            (acc, s) => acc + s.totalProfit,
                            0,
                          ) * 0.15
                        ).toFixed(3)}{" "}
                        ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Active Strategies
                      </span>
                      <span className="text-sm font-mono text-cyan-400">
                        {
                          mevStrategies.filter((s) => s.status === "active")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Success Rate
                      </span>
                      <span className="text-sm font-mono text-green-400">
                        {Math.round(
                          mevStrategies.reduce(
                            (acc, s) => acc + s.successRate,
                            0,
                          ) / Math.max(mevStrategies.length, 1),
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Posture */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Shield className="w-5 h-5 text-red-400 animate-cyber-pulse" />
                    SECURITY POSTURE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-xl font-bold text-red-400 font-mono">
                        {scanResults.reduce(
                          (acc, scan) =>
                            acc +
                            scan.vulnerabilities.filter(
                              (v) => v.severity === "Critical",
                            ).length,
                          0,
                        )}
                      </div>
                      <div className="text-xs text-red-400/70 uppercase">
                        Critical
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-xl font-bold text-red-400 font-mono">
                        {
                          honeypotResults.filter(
                            (h) => h.status === "honeypot_detected",
                          ).length
                        }
                      </div>
                      <div className="text-xs text-red-400/70 uppercase">
                        Honeypots
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Contracts Scanned
                      </span>
                      <span className="text-sm font-mono text-cyan-400">
                        {scanResults.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Threats Blocked
                      </span>
                      <span className="text-sm font-mono text-green-400">
                        127
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Security Score
                      </span>
                      <span className="text-sm font-mono text-green-400">
                        94%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operations Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Cpu className="w-5 h-5 text-blue-400 animate-cyber-pulse" />
                    OPERATIONS STATUS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-xl font-bold text-blue-400 font-mono">
                        99.97%
                      </div>
                      <div className="text-xs text-blue-400/70 uppercase">
                        Uptime
                      </div>
                    </div>
                    <div className="text-center p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <div className="text-xl font-bold text-cyan-400 font-mono">
                        12ms
                      </div>
                      <div className="text-xs text-cyan-400/70 uppercase">
                        Response
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Active Services
                      </span>
                      <span className="text-sm font-mono text-green-400">
                        8/8
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        Bridge Transfers
                      </span>
                      <span className="text-sm font-mono text-cyan-400">
                        {bridgeTransfers.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyber-cyan">
                        System Load
                      </span>
                      <span className="text-sm font-mono text-green-400">
                        23%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Contract Scanner Tab */}
          <TabsContent value="scanner" className="space-y-8">
            {/* Real-time Scanner Analytics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-8 h-8 text-cyber-cyan animate-cyber-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-cyber-cyan font-mono mb-1">
                    {scanResults.length}
                  </div>
                  <div className="text-xs text-cyber-cyan/70 uppercase tracking-wide">
                    Total Scans
                  </div>
                  <div className="text-xs text-green-400 mt-1">
                    +{Math.floor(Math.random() * 5 + 1)} today
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-8 h-8 text-red-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-red-400 font-mono mb-1">
                    {scanResults.reduce(
                      (acc, scan) =>
                        acc +
                        scan.vulnerabilities.filter(
                          (v) => v.severity === "Critical",
                        ).length,
                      0,
                    )}
                  </div>
                  <div className="text-xs text-red-400/70 uppercase tracking-wide">
                    Critical Issues
                  </div>
                  <div className="text-xs text-red-400 mt-1">
                    Requires immediate action
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-green-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 font-mono mb-1">
                    {Math.round(
                      scanResults.reduce(
                        (acc, scan) => acc + scan.securityScore,
                        0,
                      ) / Math.max(scanResults.length, 1),
                    )}
                    %
                  </div>
                  <div className="text-xs text-green-400/70 uppercase tracking-wide">
                    Avg Security
                  </div>
                  <div className="text-xs text-green-400 mt-1">
                    Above industry standard
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-8 h-8 text-yellow-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 font-mono mb-1">
                    {Math.round(
                      scanResults.reduce(
                        (acc, scan) => acc + scan.gasOptimization,
                        0,
                      ) / Math.max(scanResults.length, 1),
                    )}
                    %
                  </div>
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
                    Gas Efficiency
                  </div>
                  <div className="text-xs text-yellow-400 mt-1">
                    Optimization potential
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
              {/* Security Score Trend */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                    <BarChart3 className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    SECURITY SCORE TREND
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Security Score",
                        color: chartColors.primary,
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer>
                      <LineChart data={scanChartData}>
                        <CartesianGrid {...chartTheme.grid} />
                        <XAxis
                          dataKey="name"
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <YAxis
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={chartColors.primary}
                          strokeWidth={3}
                          dot={{
                            fill: chartColors.primary,
                            strokeWidth: 2,
                            r: 4,
                          }}
                          {...chartAnimations.entry}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Vulnerability Distribution */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                    <Target className="w-5 h-5 text-red-400 group-hover:animate-cyber-pulse" />
                    VULNERABILITY DISTRIBUTION
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      Critical: {
                        label: "Critical",
                        color: chartColors.destructive,
                      },
                      High: { label: "High", color: chartColors.warning },
                      Medium: { label: "Medium", color: chartColors.orange },
                      Low: { label: "Low", color: chartColors.primary },
                      Info: { label: "Info", color: chartColors.success },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={vulnerabilityDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                          {...chartAnimations.entry}
                        >
                          {vulnerabilityDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                chartColorArray[index % chartColorArray.length]
                              }
                            />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend {...chartTheme.legend} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scanner Input */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Shield className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    SMART CONTRACT SCANNER
                  </CardTitle>
                  <CardDescription>
                    Analyze smart contracts for security vulnerabilities and
                    optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Contract Address
                    </label>
                    <Input
                      placeholder="0x..."
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      disabled={isScanning}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Contract Source Code (Optional)
                    </label>
                    <Textarea
                      placeholder="pragma solidity ^0.8.0;..."
                      value={contractCode}
                      onChange={(e) => setContractCode(e.target.value)}
                      disabled={isScanning}
                      className="h-32"
                    />
                  </div>

                  {/* Scanner Plugin Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-cyber-cyan">
                      Security Analysis Plugins
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {/* Slither Plugin */}
                      <div className="flex items-center space-x-3 p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/10 transition-colors">
                        <input
                          type="checkbox"
                          id="slither"
                          checked={selectedPlugins.includes("slither")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlugins([
                                ...selectedPlugins,
                                "slither",
                              ]);
                            } else {
                              setSelectedPlugins(
                                selectedPlugins.filter((p) => p !== "slither"),
                              );
                            }
                          }}
                          disabled={isScanning}
                          className="h-4 w-4 rounded border-cyber-cyan/30 text-cyber-cyan focus:ring-cyber-cyan/20"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="slither"
                            className="text-sm font-medium text-cyber-cyan cursor-pointer"
                          >
                            Slither
                          </label>
                          <div className="text-xs text-cyber-cyan/60 mt-1">
                            Static analysis for Solidity smart contracts.
                            Detects common vulnerabilities and code quality
                            issues.
                          </div>
                        </div>
                        <div className="text-xs text-cyber-cyan/40 font-mono">
                          STATIC
                        </div>
                      </div>

                      {/* Mythril Plugin */}
                      <div className="flex items-center space-x-3 p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/10 transition-colors">
                        <input
                          type="checkbox"
                          id="mythril"
                          checked={selectedPlugins.includes("mythril")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlugins([
                                ...selectedPlugins,
                                "mythril",
                              ]);
                            } else {
                              setSelectedPlugins(
                                selectedPlugins.filter((p) => p !== "mythril"),
                              );
                            }
                          }}
                          disabled={isScanning}
                          className="h-4 w-4 rounded border-cyber-cyan/30 text-cyber-cyan focus:ring-cyber-cyan/20"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="mythril"
                            className="text-sm font-medium text-cyber-cyan cursor-pointer"
                          >
                            Mythril
                          </label>
                          <div className="text-xs text-cyber-cyan/60 mt-1">
                            Symbolic execution and taint analysis. Deep security
                            analysis for complex vulnerability patterns.
                          </div>
                        </div>
                        <div className="text-xs text-cyber-cyan/40 font-mono">
                          SYMBOLIC
                        </div>
                      </div>

                      {/* Manticore Plugin */}
                      <div className="flex items-center space-x-3 p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5 hover:bg-cyber-cyan/10 transition-colors">
                        <input
                          type="checkbox"
                          id="manticore"
                          checked={selectedPlugins.includes("manticore")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlugins([
                                ...selectedPlugins,
                                "manticore",
                              ]);
                            } else {
                              setSelectedPlugins(
                                selectedPlugins.filter(
                                  (p) => p !== "manticore",
                                ),
                              );
                            }
                          }}
                          disabled={isScanning}
                          className="h-4 w-4 rounded border-cyber-cyan/30 text-cyber-cyan focus:ring-cyber-cyan/20"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="manticore"
                            className="text-sm font-medium text-cyber-cyan cursor-pointer"
                          >
                            Manticore
                          </label>
                          <div className="text-xs text-cyber-cyan/60 mt-1">
                            Dynamic binary analysis with symbolic execution.
                            Advanced concolic testing for edge cases.
                          </div>
                        </div>
                        <div className="text-xs text-cyber-cyan/40 font-mono">
                          DYNAMIC
                        </div>
                      </div>
                    </div>

                    {selectedPlugins.length === 0 && (
                      <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded p-2">
                        ⚠️ Please select at least one analysis plugin to proceed
                      </div>
                    )}

                    {selectedPlugins.length > 0 && (
                      <div className="text-xs text-cyber-cyan/60 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded p-2">
                        <span className="font-mono">
                          {selectedPlugins.length}
                        </span>{" "}
                        plugin{selectedPlugins.length > 1 ? "s" : ""} selected:{" "}
                        {selectedPlugins.join(", ")}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={startContractScan}
                    disabled={
                      !contractAddress.trim() ||
                      isScanning ||
                      selectedPlugins.length === 0
                    }
                    className="w-full"
                  >
                    {isScanning ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Start Security Scan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Scans */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <FileText className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    RECENT SCANS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {scanResults.map((result) => (
                        <div
                          key={result.scanId}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {result.contractAddress.slice(0, 10)}...
                            </code>
                            <Badge
                              variant={
                                result.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {result.status}
                            </Badge>
                          </div>

                          {result.status === "scanning" && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{result.progress}%</span>
                              </div>
                              <Progress value={result.progress} />

                              {result.currentPlugin && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse"></div>
                                    <span className="text-cyber-cyan font-medium uppercase">
                                      {result.currentPlugin}
                                    </span>
                                  </div>
                                  {result.pluginStage && (
                                    <div className="text-xs text-muted-foreground pl-4">
                                      {result.pluginStage}
                                    </div>
                                  )}
                                </div>
                              )}

                              {result.plugins && result.plugins.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {result.plugins.map((plugin) => (
                                    <div
                                      key={plugin}
                                      className={`text-xs px-2 py-1 rounded border ${
                                        result.currentPlugin === plugin
                                          ? "bg-cyber-cyan/20 border-cyber-cyan/40 text-cyber-cyan"
                                          : "bg-muted border-muted-foreground/20 text-muted-foreground"
                                      }`}
                                    >
                                      {plugin}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {result.status === "completed" && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Security Score</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">
                                    {result.securityScore}/100
                                  </span>
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      result.securityScore >= 80
                                        ? "bg-green-500"
                                        : result.securityScore >= 60
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  {result.vulnerabilities.length}{" "}
                                  vulnerabilities
                                </span>
                                <span>{result.timestamp}</span>
                              </div>

                              {result.plugins && result.plugins.length > 0 && (
                                <div className="pt-2">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Analyzed with:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {result.plugins.map((plugin) => (
                                      <div
                                        key={plugin}
                                        className="text-xs px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400"
                                      >
                                        {plugin}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {scanResults.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No scans yet. Start your first security scan above.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Vulnerability Details */}
            {scanResults.some((scan) => scan.vulnerabilities.length > 0) && (
              <Card className="cyber-card-enhanced group">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <AlertTriangle className="w-5 h-5 text-red-400 group-hover:animate-cyber-pulse" />
                    VULNERABILITY DETAILS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scanResults
                      .filter((scan) => scan.vulnerabilities.length > 0)
                      .map((scan) => (
                        <div key={scan.scanId} className="space-y-3">
                          <h4 className="font-medium">
                            Contract:{" "}
                            <code className="text-sm">
                              {scan.contractAddress}
                            </code>
                          </h4>
                          <div className="space-y-2">
                            {scan.vulnerabilities.map((vuln) => {
                              const SeverityIcon = getSeverityIcon(
                                vuln.severity,
                              );
                              return (
                                <Alert key={vuln.id}>
                                  <SeverityIcon
                                    className={`h-4 w-4 ${getSeverityColor(vuln.severity)}`}
                                  />
                                  <AlertDescription>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className={getSeverityColor(
                                            vuln.severity,
                                          )}
                                        >
                                          {vuln.severity}
                                        </Badge>
                                        <span className="font-medium">
                                          {vuln.title}
                                        </span>
                                        {vuln.line && (
                                          <code className="text-xs bg-muted px-1 rounded">
                                            Line {vuln.line}
                                          </code>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {vuln.description}
                                      </p>
                                      <p className="text-sm">
                                        <strong>Recommendation:</strong>{" "}
                                        {vuln.recommendation}
                                      </p>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Enhanced Mempool Intelligence Tab */}
          <TabsContent value="mempool" className="space-y-8">
            {/* Real-time Network Intelligence Header */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-6 h-6 text-cyber-cyan animate-cyber-pulse" />
                  </div>
                  <div className="text-2xl font-bold text-cyber-cyan font-mono mb-1">
                    {mempoolTransactions.length +
                      Math.floor(Math.random() * 50 + 200)}
                  </div>
                  <div className="text-xs text-cyber-cyan/70 uppercase tracking-wide">
                    Pending TXs
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 text-yellow-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400 font-mono mb-1">
                    {Math.floor(Math.random() * 30 + 45)}
                  </div>
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
                    Gas Price (Gwei)
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-green-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-2xl font-bold text-green-400 font-mono mb-1">
                    {
                      mempoolTransactions.filter((tx) => tx.mevOpportunity)
                        .length
                    }
                  </div>
                  <div className="text-xs text-green-400/70 uppercase tracking-wide">
                    MEV Opportunities
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-2xl font-bold text-red-400 font-mono mb-1">
                    {
                      mempoolTransactions.filter(
                        (tx) => tx.riskLevel === "High",
                      ).length
                    }
                  </div>
                  <div className="text-xs text-red-400/70 uppercase tracking-wide">
                    High Risk TXs
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-6 h-6 text-blue-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400 font-mono mb-1">
                    {Math.floor(Math.random() * 5 + 12)}s
                  </div>
                  <div className="text-xs text-blue-400/70 uppercase tracking-wide">
                    Avg Confirm Time
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Network Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
              {/* Transaction Volume */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                    <Activity className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    TRANSACTION VOLUME
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Transaction Count",
                        color: chartColors.primary,
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer>
                      <AreaChart data={mempoolChartData}>
                        <CartesianGrid {...chartTheme.grid} />
                        <XAxis
                          dataKey="name"
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <YAxis
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={chartColors.primary}
                          fill={`${chartColors.primary}40`}
                          strokeWidth={2}
                          {...chartAnimations.entry}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gas Price Trends */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                    <Zap className="w-5 h-5 text-yellow-400 group-hover:animate-cyber-pulse" />
                    GAS PRICE TRENDS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Gas Price (Gwei)",
                        color: chartColors.warning,
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer>
                      <LineChart data={gasChartData}>
                        <CartesianGrid {...chartTheme.grid} />
                        <XAxis
                          dataKey="name"
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <YAxis
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={chartColors.warning}
                          strokeWidth={3}
                          dot={{
                            fill: chartColors.warning,
                            strokeWidth: 2,
                            r: 4,
                          }}
                          {...chartAnimations.entry}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monitor Controls */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Activity className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    MEMPOOL MONITOR
                  </CardTitle>
                  <CardDescription>
                    Real-time monitoring of pending transactions and MEV
                    opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsMonitoring(!isMonitoring)}
                      variant={isMonitoring ? "destructive" : "default"}
                      className="flex-1"
                    >
                      {isMonitoring ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Monitoring
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Monitoring
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMempoolTransactions([]);
                        setMevOpportunities(0);
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Status</span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-green-500" : "bg-gray-500"}`}
                        />
                        <span className="text-sm">
                          {isMonitoring ? "Monitoring" : "Stopped"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Transactions</span>
                      <span className="font-bold">
                        {mempoolTransactions.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">MEV Opportunities</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{mevOpportunities}</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Feed */}
              <Card className="lg:col-span-2 cyber-card-enhanced group">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Hash className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    LIVE TRANSACTION FEED
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hash</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>Value (ETH)</TableHead>
                          <TableHead>Gas Price</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead>MEV</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mempoolTransactions.slice(0, 20).map((tx) => (
                          <TableRow key={tx.hash}>
                            <TableCell>
                              <code className="text-xs">
                                {tx.hash.slice(0, 10)}...
                              </code>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs">
                                {tx.from.slice(0, 10)}...
                              </code>
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                              <span className="text-sm">{tx.value}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {tx.gasPrice} gwei
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  tx.riskLevel === "High"
                                    ? "destructive"
                                    : tx.riskLevel === "Medium"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {tx.riskLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {tx.mevOpportunity ? (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-green-500" />
                                  <span className="text-xs text-green-600">
                                    {tx.mevOpportunity.profit} ETH
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  -
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {mempoolTransactions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        {isMonitoring
                          ? "Waiting for transactions..."
                          : "Start monitoring to see live transactions"}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MEV OPS Tab */}
          <TabsContent value="mev-ops" className="space-y-8">
            {/* MEV OPS Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-cyber-cyan mb-2 font-mono uppercase tracking-wide">
                MEV Operations Center
              </h2>
              <p className="text-cyber-cyan/60 text-sm">
                Full-spectrum MEV warfare: Attack vectors and defensive
                countermeasures in unified command center
              </p>
            </div>

            {/* Sub-tabs for Attack and Defense */}
            <Tabs defaultValue="attack" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-cyber-cyan/30">
                <TabsTrigger
                  value="attack"
                  className="flex items-center gap-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-cyber-cyan/70 hover:text-red-400 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Attack Mode
                </TabsTrigger>
                <TabsTrigger
                  value="defense"
                  className="flex items-center gap-2 data-[state=active]:bg-cyber-cyan/20 data-[state=active]:text-cyber-cyan text-cyber-cyan/70 hover:text-cyber-cyan transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  🛡️ MEVGuardian
                </TabsTrigger>
              </TabsList>

              {/* Attack Mode Tab */}
              <TabsContent value="attack" className="space-y-6 mt-6">
                {/* Trading Performance Dashboard Header */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="w-6 h-6 text-yellow-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-400 font-mono mb-1">
                        {
                          mevStrategies.filter((s) => s.status === "active")
                            .length
                        }
                      </div>
                      <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
                        Active Bots
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="w-6 h-6 text-green-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-green-400 font-mono mb-1">
                        {mevStrategies
                          .reduce((acc, s) => acc + s.totalProfit, 0)
                          .toFixed(2)}
                      </div>
                      <div className="text-xs text-green-400/70 uppercase tracking-wide">
                        Total Profit (ETH)
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="w-6 h-6 text-blue-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-blue-400 font-mono mb-1">
                        {Math.round(
                          mevStrategies.reduce(
                            (acc, s) => acc + s.successRate,
                            0,
                          ) / Math.max(mevStrategies.length, 1),
                        )}
                        %
                      </div>
                      <div className="text-xs text-blue-400/70 uppercase tracking-wide">
                        Success Rate
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-6 h-6 text-cyan-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-cyan-400 font-mono mb-1">
                        +
                        {(
                          mevStrategies.reduce(
                            (acc, s) => acc + s.totalProfit,
                            0,
                          ) * 0.23
                        ).toFixed(3)}
                      </div>
                      <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
                        Today's Profit (ETH)
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="w-6 h-6 text-purple-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-purple-400 font-mono mb-1">
                        {Math.floor(Math.random() * 15 + 45)}
                      </div>
                      <div className="text-xs text-purple-400/70 uppercase tracking-wide">
                        Executions/Hour
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Trading Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
                  {/* Profit Over Time */}
                  <Card className="cyber-card-enhanced group">
                    <CardHeader className="pb-md relative z-10">
                      <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                        <TrendingUp className="w-5 h-5 text-green-400 group-hover:animate-cyber-pulse" />
                        PROFIT OVER TIME
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Profit (ETH)",
                            color: chartColors.success,
                          },
                        }}
                        className="h-64"
                      >
                        <ResponsiveContainer>
                          <AreaChart data={mevProfitChart}>
                            <CartesianGrid {...chartTheme.grid} />
                            <XAxis
                              dataKey="name"
                              axisLine={chartTheme.axis.axisLine}
                              tickLine={chartTheme.axis.tickLine}
                              tick={chartTheme.axis.tick}
                            />
                            <YAxis
                              axisLine={chartTheme.axis.axisLine}
                              tickLine={chartTheme.axis.tickLine}
                              tick={chartTheme.axis.tick}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={chartColors.success}
                              fill={`${chartColors.success}40`}
                              strokeWidth={2}
                              {...chartAnimations.entry}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Strategy Performance */}
                  <Card className="cyber-card-enhanced group">
                    <CardHeader className="pb-md relative z-10">
                      <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                        <BarChart3 className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                        STRATEGY PERFORMANCE
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Success Rate (%)",
                            color: chartColors.primary,
                          },
                        }}
                        className="h-64"
                      >
                        <ResponsiveContainer>
                          <BarChart data={mevSuccessChart}>
                            <CartesianGrid {...chartTheme.grid} />
                            <XAxis
                              dataKey="name"
                              axisLine={chartTheme.axis.axisLine}
                              tickLine={chartTheme.axis.tickLine}
                              tick={chartTheme.axis.tick}
                            />
                            <YAxis
                              axisLine={chartTheme.axis.axisLine}
                              tickLine={chartTheme.axis.tickLine}
                              tick={chartTheme.axis.tick}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                              dataKey="value"
                              fill={chartColors.primary}
                              radius={[4, 4, 0, 0]}
                              {...chartAnimations.entry}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strategy Creation */}
                  <Card className="cyber-card-enhanced group">
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-2 cyber-glow">
                        <Zap className="w-5 h-5 text-yellow-400 group-hover:animate-cyber-pulse" />
                        CREATE MEV STRATEGY
                      </CardTitle>
                      <CardDescription>
                        Configure automated MEV extraction strategies
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Strategy Name
                        </label>
                        <Input
                          placeholder="My Arbitrage Bot"
                          value={newStrategy.name}
                          onChange={(e) =>
                            setNewStrategy((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Strategy Type
                        </label>
                        <Select
                          value={newStrategy.type}
                          onValueChange={(value: any) =>
                            setNewStrategy((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="arbitrage">Arbitrage</SelectItem>
                            <SelectItem value="liquidation">
                              Liquidation
                            </SelectItem>
                            <SelectItem value="sandwich">
                              Sandwich Attack
                            </SelectItem>
                            <SelectItem value="frontrun">
                              Front Running
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Profit Target (ETH)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newStrategy.profitTarget}
                          onChange={(e) =>
                            setNewStrategy((prev) => ({
                              ...prev,
                              profitTarget: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Gas Limit</label>
                        <Slider
                          value={[newStrategy.gasLimit]}
                          onValueChange={(value) =>
                            setNewStrategy((prev) => ({
                              ...prev,
                              gasLimit: value[0],
                            }))
                          }
                          min={100000}
                          max={1000000}
                          step={10000}
                        />
                        <div className="text-xs text-muted-foreground">
                          {newStrategy.gasLimit.toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Max Slippage (%)
                        </label>
                        <Slider
                          value={[newStrategy.slippage]}
                          onValueChange={(value) =>
                            setNewStrategy((prev) => ({
                              ...prev,
                              slippage: value[0],
                            }))
                          }
                          min={0.1}
                          max={5}
                          step={0.1}
                        />
                        <div className="text-xs text-muted-foreground">
                          {newStrategy.slippage}%
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (newStrategy.name) {
                            const strategy: MEVStrategy = {
                              id: `mev_${Date.now()}`,
                              ...newStrategy,
                              status: "active",
                              totalProfit: 0,
                              successRate: 0,
                            };
                            setMevStrategies((prev) => [strategy, ...prev]);
                            setNewStrategy({
                              name: "",
                              type: "arbitrage",
                              profitTarget: 0.1,
                              gasLimit: 300000,
                              slippage: 0.5,
                            });
                          }
                        }}
                        disabled={!newStrategy.name}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Deploy Strategy
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Active Strategies */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Active Strategies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {mevStrategies.map((strategy) => (
                            <div
                              key={strategy.id}
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{strategy.name}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      strategy.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {strategy.status}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setMevStrategies((prev) =>
                                        prev.map((s) =>
                                          s.id === strategy.id
                                            ? {
                                                ...s,
                                                status:
                                                  s.status === "active"
                                                    ? "paused"
                                                    : "active",
                                              }
                                            : s,
                                        ),
                                      );
                                    }}
                                  >
                                    {strategy.status === "active" ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Type:
                                  </span>
                                  <div className="font-medium capitalize">
                                    {strategy.type}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Profit:
                                  </span>
                                  <div className="font-medium">
                                    {strategy.totalProfit.toFixed(3)} ETH
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Target:
                                  </span>
                                  <div className="font-medium">
                                    {strategy.profitTarget} ETH
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Success:
                                  </span>
                                  <div className="font-medium">
                                    {strategy.successRate}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {mevStrategies.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No active strategies. Create your first MEV
                              strategy above.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Defensive Mode Tab - MEVGuardian */}
              <TabsContent value="defense" className="space-y-6 mt-6">
                {/* Guardian Status Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Shield className="w-6 h-6 text-cyber-cyan animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-cyber-cyan font-mono mb-1">
                        ACTIVE
                      </div>
                      <div className="text-xs text-cyber-cyan/70 uppercase tracking-wide">
                        Guardian Status
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="w-6 h-6 text-red-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-red-400 font-mono mb-1">
                        {Math.floor(Math.random() * 50 + 100)}
                      </div>
                      <div className="text-xs text-red-400/70 uppercase tracking-wide">
                        Threats Blocked
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="w-6 h-6 text-green-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-green-400 font-mono mb-1">
                        ${(Math.random() * 50 + 10).toFixed(1)}K
                      </div>
                      <div className="text-xs text-green-400/70 uppercase tracking-wide">
                        Saved Today
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="w-6 h-6 text-yellow-400 animate-cyber-pulse" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-400 font-mono mb-1">
                        {Math.floor(Math.random() * 10 + 95)}%
                      </div>
                      <div className="text-xs text-yellow-400/70 uppercase tracking-wide">
                        Protection Rate
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Guardian Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Threat Radar */}
                  <Card className="cyber-card-enhanced group">
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-2 cyber-glow">
                        <Search className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                        THREAT RADAR
                      </CardTitle>
                      <CardDescription>
                        Real-time MEV attack detection & classification
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80">
                        <div className="space-y-3">
                          {[
                            {
                              type: "Sandwich Attack",
                              risk: 95,
                              target: "0x1234...5678",
                              saved: "$2.1K",
                            },
                            {
                              type: "Flash Loan Exploit",
                              risk: 87,
                              target: "0xabcd...ef01",
                              saved: "$5.7K",
                            },
                            {
                              type: "Oracle Manipulation",
                              risk: 72,
                              target: "0x9876...5432",
                              saved: "$1.3K",
                            },
                            {
                              type: "Liquidation Frontrun",
                              risk: 68,
                              target: "0xdef0...1234",
                              saved: "$890",
                            },
                            {
                              type: "JIT Liquidity Attack",
                              risk: 45,
                              target: "0x5555...6666",
                              saved: "$445",
                            },
                          ].map((threat, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 border border-cyber-cyan/20 rounded-lg bg-cyber-cyan/5"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      threat.risk > 80
                                        ? "bg-red-400"
                                        : threat.risk > 60
                                          ? "bg-yellow-400"
                                          : "bg-green-400"
                                    } animate-pulse`}
                                  ></div>
                                  <span className="text-sm font-medium text-cyber-cyan">
                                    {threat.type}
                                  </span>
                                </div>
                                <div className="text-xs text-cyber-cyan/60 mt-1">
                                  Target: {threat.target} • Risk: {threat.risk}%
                                </div>
                              </div>
                              <div className="text-xs text-green-400 font-mono">
                                {threat.saved} SAVED
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Counter-Measures Control Panel */}
                  <Card className="cyber-card-enhanced group">
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-2 cyber-glow">
                        <Shield className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                        COUNTER-MEASURES
                      </CardTitle>
                      <CardDescription>
                        Active defensive protocols & automated responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          name: "Private Relay Auto-Route",
                          enabled: true,
                          desc: "Redirect high-risk txs through private channels",
                        },
                        {
                          name: "Gas Fuzzer",
                          enabled: true,
                          desc: "Randomize gas to break attacker calculations",
                        },
                        {
                          name: "Counter-Bundle Injection",
                          enabled: false,
                          desc: "Inject grief bundles to neutralize attacks",
                        },
                        {
                          name: "JIT Liquidity Lock",
                          enabled: true,
                          desc: "Temporarily lock LP tokens during volatility",
                        },
                        {
                          name: "Circuit Breaker",
                          enabled: true,
                          desc: "Auto-pause on flash loan or oracle anomalies",
                        },
                      ].map((measure, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border border-cyber-cyan/20 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Switch checked={measure.enabled} />
                              <span className="text-sm font-medium text-cyber-cyan">
                                {measure.name}
                              </span>
                            </div>
                            <div className="text-xs text-cyber-cyan/60 mt-1">
                              {measure.desc}
                            </div>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${measure.enabled ? "bg-green-400" : "bg-gray-600"}`}
                          ></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Policy Engine & Advanced Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Policy Rules */}
                  <Card className="cyber-card-enhanced">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 cyber-glow text-sm">
                        <Settings className="w-4 h-4" />
                        POLICY ENGINE
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs font-mono bg-black/50 p-3 rounded border border-cyber-cyan/20">
                        <div className="text-cyber-cyan">
                          if (usd_value &gt; 10K &amp;&amp; risk &gt; 30):
                        </div>
                        <div className="text-white ml-2">route: flashbots</div>
                        <div className="text-white ml-2">
                          slippage_max: 0.3%
                        </div>
                      </div>
                      <div className="text-xs font-mono bg-black/50 p-3 rounded border border-cyber-cyan/20">
                        <div className="text-cyber-cyan">
                          if (flash_loan &gt; 2x TVL):
                        </div>
                        <div className="text-white ml-2">
                          circuit_break: true
                        </div>
                        <div className="text-white ml-2">alert: pagerduty</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Flash Loan Monitor */}
                  <Card className="cyber-card-enhanced">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 cyber-glow text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        FLASH LOAN MONITOR
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Current Utilization</span>
                          <span className="text-cyber-cyan">23.4%</span>
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-2">
                          <div className="bg-cyber-cyan h-2 rounded-full w-1/4"></div>
                        </div>
                        <div className="text-xs text-cyber-cyan/60">
                          Alert threshold: 80% TVL
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Guardian ROI */}
                  <Card className="cyber-card-enhanced">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 cyber-glow text-sm">
                        <TrendingUp className="w-4 h-4" />
                        GUARDIAN ROI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 font-mono">
                          +{(Math.random() * 50 + 200).toFixed(0)}%
                        </div>
                        <div className="text-xs text-green-400/70">
                          30-day protection value
                        </div>
                        <div className="text-xs text-cyber-cyan/60 mt-1">
                          vs. unprotected portfolio
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Enhanced Cross-Chain Intelligence Tab */}
          <TabsContent value="bridge" className="space-y-8">
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
                  <div className="text-xs text-blue-400 mt-1">
                    Across all chains
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-cyan-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 font-mono mb-1">
                    {
                      bridgeTransfers.filter((t) => t.status === "completed")
                        .length
                    }
                  </div>
                  <div className="text-xs text-cyan-400/70 uppercase tracking-wide">
                    Successful
                  </div>
                  <div className="text-xs text-cyan-400 mt-1">
                    99.8% success rate
                  </div>
                </CardContent>
              </Card>
            </div>

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
                              <span className="text-muted-foreground">
                                Asset:
                              </span>
                              <div className="font-medium">
                                {transfer.asset}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Amount:
                              </span>
                              <div className="font-medium">
                                {transfer.amount}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transfer.timestamp} • Est. {transfer.estimatedTime}
                          </div>
                        </div>
                      ))}
                      {bridgeTransfers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No transfers yet. Start your first cross-chain
                          transfer above.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Forensics Intelligence Tab */}
          <TabsContent value="forensics" className="space-y-8">
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
                          parseFloat(
                            r.transactionVolume.replace(/[^0-9.]/g, ""),
                          ),
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
                    <div className="text-xs text-red-400/70 mt-1">
                      Score: 70-100
                    </div>
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
                    <div className="text-xs text-green-400/70 mt-1">
                      Score: 0-39
                    </div>
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
                            {result.flags.length} flags ���{" "}
                            {result.associations.length} associations
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
                        <div className="text-xs text-cyber-cyan/60">
                          Risk Score
                        </div>
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
                    <label className="text-sm font-medium">
                      Address to Analyze
                    </label>
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
                        <div
                          key={idx}
                          className="border rounded-lg p-3 space-y-3"
                        >
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
          </TabsContent>

          {/* Time Machine Tab */}
          <TabsContent value="time-machine" className="space-y-8">
            {/* Original Time Machine Functionality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Travel Interface */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Clock className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    BLOCKCHAIN TIME MACHINE
                  </CardTitle>
                  <CardDescription>
                    Query historical blockchain state at any point in time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyber-cyan">
                      Select Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-black/70 border-cyber-cyan/30 text-white hover:bg-cyber-cyan/10"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? selectedDate.toDateString()
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyber-cyan">
                      Block Number (Optional)
                    </label>
                    <Input
                      type="number"
                      placeholder="18500000"
                      value={blockNumber}
                      onChange={(e) => setBlockNumber(e.target.value)}
                      className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyber-cyan">
                      Query Type
                    </label>
                    <Select defaultValue="balance">
                      <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balance">Account Balance</SelectItem>
                        <SelectItem value="contract">Contract State</SelectItem>
                        <SelectItem value="transaction">
                          Transaction Data
                        </SelectItem>
                        <SelectItem value="block">Block Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      const query: HistoricalQuery = {
                        id: `query_${Date.now()}`,
                        blockNumber:
                          parseInt(blockNumber) ||
                          Math.floor(Math.random() * 1000000) + 18000000,
                        timestamp:
                          selectedDate?.toLocaleString() ||
                          new Date().toLocaleString(),
                        query: "Account Balance Query",
                        results: [
                          {
                            address: "0x...",
                            balance: "12.456 ETH",
                            tokens: ["USDT: 1000", "USDC: 500"],
                          },
                        ],
                        status: "completed",
                      };
                      setHistoricalQueries((prev) => [query, ...prev]);
                    }}
                    className="w-full btn-primary font-mono uppercase tracking-wide"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Execute Time Query
                  </Button>
                </CardContent>
              </Card>

              {/* Query Results */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <Database className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    HISTORICAL DATA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {historicalQueries.map((query) => (
                        <div
                          key={query.id}
                          className="border border-cyber-cyan/20 rounded-lg p-3 space-y-2 bg-cyber-cyan/5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-cyber-cyan">
                              {query.query}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-cyber-cyan/20 text-cyber-cyan"
                            >
                              Block {query.blockNumber.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="text-xs text-cyber-cyan/60">
                            {query.timestamp}
                          </div>
                          <div className="space-y-1 text-sm">
                            {query.results.map((result, i) => (
                              <div
                                key={i}
                                className="bg-black/30 p-2 rounded border border-cyber-cyan/20"
                              >
                                <div className="font-mono text-xs text-cyber-cyan">
                                  {result.address}
                                </div>
                                <div className="text-white">
                                  {result.balance}
                                </div>
                                {result.tokens && (
                                  <div className="text-xs text-cyber-cyan/60">
                                    {result.tokens.join(", ")}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {historicalQueries.length === 0 && (
                        <div className="text-center py-8 text-cyber-cyan/60">
                          No queries yet. Travel back in time to explore
                          historical blockchain data.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Famous Exploits Section */}
            <div className="border-t border-cyber-cyan/20 pt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-cyber-cyan mb-2 font-mono uppercase tracking-wide">
                  Famous Blockchain Exploits
                </h2>
                <p className="text-cyber-cyan/60 text-sm">
                  Study the most infamous attacks in blockchain history through
                  real-time transaction replay
                </p>
              </div>

              {/* Exploit Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {famousExploits.map((exploit) => (
                  <Card
                    key={exploit.id}
                    className={`cyber-card-enhanced group cursor-pointer transition-all duration-300 ${
                      replayState.currentExploit?.id === exploit.id
                        ? "ring-2 ring-cyber-cyan bg-cyber-cyan/10 scale-105"
                        : "hover:scale-105"
                    } ${
                      replayState.isReplaying &&
                      replayState.currentExploit?.id !== exploit.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => {
                      if (
                        replayState.isReplaying &&
                        replayState.currentExploit?.id !== exploit.id
                      ) {
                        return; // Don't allow clicking other exploits while one is replaying
                      }
                      console.log("Exploit card clicked:", exploit.name);
                      startExploitReplay(exploit);
                    }}
                  >
                    <CardHeader className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`px-2 py-1 rounded text-xs font-mono uppercase ${
                            exploit.exploitType === "reentrancy"
                              ? "bg-red-500/20 text-red-400"
                              : exploit.exploitType === "bridge"
                                ? "bg-purple-500/20 text-purple-400"
                                : exploit.exploitType === "flash_loan"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {exploit.exploitType.replace("_", " ")}
                        </div>
                        <div className="text-xs text-cyber-cyan/60">
                          {exploit.date}
                        </div>
                      </div>
                      <CardTitle className="text-lg text-cyber-cyan group-hover:text-white transition-colors">
                        {exploit.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-cyber-cyan/60">
                        {exploit.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Total Loss:
                          </span>
                          <div className="font-mono text-red-400 font-bold">
                            {exploit.totalLoss}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Transactions:
                          </span>
                          <div className="font-mono text-cyber-cyan">
                            {exploit.transactions.length}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Target:</span>
                        <div className="font-mono text-cyber-cyan/80 text-xs">
                          {exploit.targetContract.slice(0, 20)}...
                        </div>
                      </div>

                      {replayState.currentExploit?.id === exploit.id && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center gap-2 text-xs text-cyber-cyan">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                replayState.isReplaying
                                  ? "bg-cyber-cyan animate-pulse"
                                  : "bg-yellow-500"
                              }`}
                            ></div>
                            <span>
                              {replayState.isReplaying
                                ? "REPLAYING LIVE"
                                : "SELECTED"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Transaction {replayState.currentTransaction + 1} of{" "}
                            {exploit.transactions.length}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-mono">
                            State: isReplaying=
                            {replayState.isReplaying.toString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Replay Control Panel */}
              {replayState.currentExploit && (
                <Card className="cyber-card-enhanced">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-cyber-cyan">
                        <Play className="w-5 h-5" />
                        EXPLOIT REPLAY - {replayState.currentExploit.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => changeReplaySpeed(0.5)}
                          className={
                            replayState.replaySpeed === 0.5
                              ? "bg-cyber-cyan/20"
                              : ""
                          }
                        >
                          0.5x
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => changeReplaySpeed(1)}
                          className={
                            replayState.replaySpeed === 1
                              ? "bg-cyber-cyan/20"
                              : ""
                          }
                        >
                          1x
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => changeReplaySpeed(2)}
                          className={
                            replayState.replaySpeed === 2
                              ? "bg-cyber-cyan/20"
                              : ""
                          }
                        >
                          2x
                        </Button>
                        <Button size="sm" variant="ghost" onClick={stopReplay}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Attack Progress</span>
                        <span className="font-mono">
                          {replayState.currentTransaction}/
                          {replayState.currentExploit.transactions.length}{" "}
                          transactions
                        </span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-cyber-cyan h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(replayState.currentTransaction / replayState.currentExploit.transactions.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-3">
                      {replayState.isReplaying ? (
                        <Button onClick={pauseReplay} className="btn-secondary">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button onClick={resumeReplay} className="btn-primary">
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      <div className="text-sm text-cyber-cyan/60">
                        Speed: {replayState.replaySpeed}x
                      </div>
                    </div>

                    {/* Current Transaction Display */}
                    {replayState.currentExploit.transactions &&
                      replayState.currentTransaction <
                        replayState.currentExploit.transactions.length &&
                      replayState.currentExploit.transactions[
                        replayState.currentTransaction
                      ] && (
                        <div className="space-y-4">
                          {/* Transaction Details */}
                          <div className="border border-cyber-cyan/30 rounded-lg p-4 bg-cyber-cyan/5">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-cyber-cyan">
                                LIVE TRANSACTION
                              </span>
                            </div>
                            {(() => {
                              const tx =
                                replayState.currentExploit.transactions[
                                  replayState.currentTransaction
                                ];
                              return (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Hash:
                                      </span>
                                      <div className="font-mono text-xs text-cyber-cyan">
                                        {tx.hash}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Block:
                                      </span>
                                      <div className="font-mono text-xs">
                                        {tx.blockNumber.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Method:
                                      </span>
                                      <div className="font-mono text-xs text-red-400">
                                        {tx.method}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Value:
                                      </span>
                                      <div className="font-mono text-xs text-green-400">
                                        {tx.value}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground text-sm">
                                      Description:
                                    </span>
                                    <div className="text-sm mt-1">
                                      {tx.description}
                                    </div>
                                  </div>
                                  <div className="border-t border-cyber-cyan/20 pt-2">
                                    <span className="text-muted-foreground text-sm">
                                      Impact:
                                    </span>
                                    <div className="text-sm text-red-400 mt-1">
                                      {tx.impact}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Terminal Simulation */}
                          {(() => {
                            const tx =
                              replayState.currentExploit.transactions[
                                replayState.currentTransaction
                              ];
                            return (
                              tx.terminalInput && (
                                <div className="border border-cyber-cyan/30 rounded-lg bg-black/90 overflow-hidden">
                                  <div className="flex items-center gap-2 px-3 py-2 bg-cyber-cyan/10 border-b border-cyber-cyan/20">
                                    <div className="flex gap-1">
                                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-xs font-mono text-cyber-cyan">
                                      ATTACKER TERMINAL - {tx.timestamp}
                                    </span>
                                  </div>
                                  <div className="p-4 font-mono text-sm space-y-2">
                                    {/* Terminal Input */}
                                    <div className="flex items-start gap-2">
                                      <span className="text-green-400 flex-shrink-0">
                                        attacker@exploit:~$
                                      </span>
                                      <div className="text-white break-all">
                                        {tx.terminalInput}
                                      </div>
                                    </div>

                                    {/* Terminal Output */}
                                    {tx.terminalOutput && (
                                      <div className="text-cyber-cyan/80 whitespace-pre-wrap pl-6 border-l-2 border-cyber-cyan/20">
                                        {tx.terminalOutput}
                                      </div>
                                    )}

                                    {/* Blinking cursor */}
                                    <div className="flex items-center gap-2 mt-3">
                                      <span className="text-green-400">
                                        attacker@exploit:~$
                                      </span>
                                      <div className="w-2 h-4 bg-cyber-cyan animate-pulse"></div>
                                    </div>
                                  </div>
                                </div>
                              )
                            );
                          })()}
                        </div>
                      )}

                    {/* Attack Timeline */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-cyber-cyan">
                        Attack Timeline
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                        {replayState.currentExploit.timeline.map(
                          (event, index) => (
                            <div
                              key={index}
                              className={`text-xs p-2 rounded border-l-2 ${
                                index <= replayState.currentTransaction
                                  ? "border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan"
                                  : "border-gray-600 bg-gray-800/50 text-gray-400"
                              }`}
                            >
                              {event}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Honeypot Detection Tab */}
          <TabsContent value="honeypot" className="space-y-6">
            {/* Detection Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-8 h-8 text-red-400 animate-cyber-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-red-400 font-mono mb-1">
                    {
                      honeypotResults.filter(
                        (r) => r.status === "honeypot_detected",
                      ).length
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
                    Analyze contracts for honeypot patterns and bytecode
                    similarity
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
          </TabsContent>

          {/* Quantum Tab */}
          <TabsContent value="quantum" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quantum Resistance Testing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    Quantum Resistance Test
                  </CardTitle>
                  <CardDescription>
                    Test cryptographic keys against quantum computing threats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Private Key or Address
                    </label>
                    <Textarea
                      placeholder="0x... or private key"
                      value={testKey}
                      onChange={(e) => setTestKey(e.target.value)}
                      className="h-20"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (testKey.trim()) {
                        const result: QuantumResult = {
                          algorithm: "RSA-2048",
                          keySize: 2048,
                          estimatedBreakTime: "~2030 (Quantum Computer)",
                          recommendation:
                            "Migrate to post-quantum cryptography",
                          quantumResistant: false,
                        };
                        setQuantumTests((prev) => [result, ...prev]);
                        setTestKey("");
                      }
                    }}
                    disabled={!testKey.trim()}
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Test Quantum Resistance
                  </Button>
                </CardContent>
              </Card>

              {/* Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Quantum Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {quantumTests.map((result, idx) => (
                        <div
                          key={idx}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {result.algorithm}
                            </span>
                            <div className="flex items-center gap-2">
                              {result.quantumResistant ? (
                                <Lock className="w-4 h-4 text-green-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-red-500" />
                              )}
                              <Badge
                                variant={
                                  result.quantumResistant
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {result.quantumResistant
                                  ? "Resistant"
                                  : "Vulnerable"}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Key Size:
                              </span>
                              <span className="ml-2">
                                {result.keySize} bits
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Break Time:
                              </span>
                              <span className="ml-2">
                                {result.estimatedBreakTime}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Recommendation:
                              </span>
                              <div className="mt-1 p-2 bg-muted rounded text-xs">
                                {result.recommendation}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {quantumTests.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No tests performed yet. Enter a key above to test
                          quantum resistance.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Run Simulation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Transaction Simulation
                  </CardTitle>
                  <CardDescription>
                    Test transactions in a safe environment before execution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Simulation Type
                    </label>
                    <Select
                      value={simulationParams.type}
                      onValueChange={(value: any) =>
                        setSimulationParams((prev) => ({
                          ...prev,
                          type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transaction">
                          Simple Transaction
                        </SelectItem>
                        <SelectItem value="arbitrage">
                          Arbitrage Strategy
                        </SelectItem>
                        <SelectItem value="liquidation">
                          Liquidation Simulation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gas Limit</label>
                    <Input
                      type="number"
                      value={simulationParams.gasLimit}
                      onChange={(e) =>
                        setSimulationParams((prev) => ({
                          ...prev,
                          gasLimit: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value (ETH)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={simulationParams.value}
                      onChange={(e) =>
                        setSimulationParams((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const result: SimulationResult = {
                        id: `sim_${Date.now()}`,
                        type: simulationParams.type,
                        success: Math.random() > 0.3,
                        gasUsed: Math.floor(
                          Math.random() * simulationParams.gasLimit,
                        ),
                        profit: (Math.random() * 2 - 0.5).toFixed(3),
                        warnings:
                          Math.random() > 0.5
                            ? ["High gas usage", "Slippage detected"]
                            : [],
                      };
                      setSimulations((prev) => [result, ...prev]);
                    }}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </Button>
                </CardContent>
              </Card>

              {/* Simulation Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Simulation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {simulations.map((sim) => (
                        <div
                          key={sim.id}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {sim.type}
                            </span>
                            <Badge
                              variant={sim.success ? "default" : "destructive"}
                            >
                              {sim.success ? "Success" : "Failed"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Gas Used:
                              </span>
                              <div className="font-medium">
                                {sim.gasUsed.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Profit:
                              </span>
                              <div
                                className={`font-medium ${parseFloat(sim.profit) >= 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {sim.profit} ETH
                              </div>
                            </div>
                          </div>
                          {sim.warnings.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-yellow-600">
                                Warnings:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sim.warnings.map((warning, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs text-yellow-600"
                                  >
                                    {warning}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {simulations.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No simulations run yet. Configure and run your first
                          simulation above.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
              {/* Service Usage Chart */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                    <BarChart3 className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    SERVICE USAGE ANALYTICS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      usage: {
                        label: "Usage (%)",
                        color: chartColors.primary,
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer>
                      <BarChart data={analyticsData.serviceUsage}>
                        <CartesianGrid {...chartTheme.grid} />
                        <XAxis
                          dataKey="service"
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <YAxis
                          axisLine={chartTheme.axis.axisLine}
                          tickLine={chartTheme.axis.tickLine}
                          tick={chartTheme.axis.tick}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="usage"
                          fill={chartColors.primary}
                          radius={[4, 4, 0, 0]}
                          {...chartAnimations.entry}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Vulnerability Trends */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-sm text-lg font-semibold cyber-glow">
                    <TrendingUp className="w-5 h-5 text-red-400 group-hover:animate-cyber-pulse" />
                    VULNERABILITY TRENDS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      Critical: {
                        label: "Critical",
                        color: chartColors.destructive,
                      },
                      High: { label: "High", color: chartColors.warning },
                      Medium: { label: "Medium", color: chartColors.orange },
                      Low: { label: "Low", color: chartColors.primary },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={analyticsData.topVulnerabilities}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="count"
                          {...chartAnimations.entry}
                        >
                          {analyticsData.topVulnerabilities.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  chartColorArray[
                                    index % chartColorArray.length
                                  ]
                                }
                              />
                            ),
                          )}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend {...chartTheme.legend} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Generation */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <FileText className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    GENERATE NEW REPORT
                  </CardTitle>
                  <CardDescription>
                    Create comprehensive security and analytics reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Title</label>
                    <Input
                      placeholder="Monthly Security Analysis"
                      value={reportParams.title}
                      onChange={(e) =>
                        setReportParams((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      disabled={isGeneratingReport}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select
                      value={reportParams.type}
                      onValueChange={(value: any) =>
                        setReportParams((prev) => ({ ...prev, type: value }))
                      }
                      disabled={isGeneratingReport}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="security">
                          Security Analysis
                        </SelectItem>
                        <SelectItem value="analytics">
                          Analytics Report
                        </SelectItem>
                        <SelectItem value="compliance">
                          Compliance Report
                        </SelectItem>
                        <SelectItem value="performance">
                          Performance Report
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={reportParams.dateRange.start}
                        onChange={(e) =>
                          setReportParams((prev) => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              start: e.target.value,
                            },
                          }))
                        }
                        disabled={isGeneratingReport}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={reportParams.dateRange.end}
                        onChange={(e) =>
                          setReportParams((prev) => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              end: e.target.value,
                            },
                          }))
                        }
                        disabled={isGeneratingReport}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Include Services
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "scanner",
                        "forensics",
                        "honeypot",
                        "mev-bot",
                        "bridge",
                      ].map((service) => (
                        <Button
                          key={service}
                          variant={
                            reportParams.services.includes(service)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setReportParams((prev) => ({
                              ...prev,
                              services: prev.services.includes(service)
                                ? prev.services.filter((s) => s !== service)
                                : [...prev.services, service],
                            }));
                          }}
                          disabled={isGeneratingReport}
                          className="capitalize"
                        >
                          {service.replace("-", " ")}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={reportParams.includeCharts}
                      onCheckedChange={(checked) =>
                        setReportParams((prev) => ({
                          ...prev,
                          includeCharts: checked,
                        }))
                      }
                      disabled={isGeneratingReport}
                    />
                    <label className="text-sm font-medium">
                      Include Charts
                    </label>
                  </div>
                  <Button
                    onClick={generateReport}
                    disabled={!reportParams.title.trim() || isGeneratingReport}
                    className="w-full"
                  >
                    {isGeneratingReport ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Available Reports */}
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <CardTitle className="flex items-center gap-2 cyber-glow">
                    <History className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                    AVAILABLE REPORTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{report.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  report.status === "completed"
                                    ? "default"
                                    : report.status === "failed"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {report.status}
                              </Badge>
                              {report.status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {report.type}
                            </Badge>
                            <span>•</span>
                            <span>
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {report.status === "generating" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{report.progress}%</span>
                              </div>
                              <Progress value={report.progress} />
                            </div>
                          )}

                          {report.status === "completed" && (
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">
                                  Scans:
                                </span>
                                <div className="font-medium">
                                  {report.data.totalScans}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Vulnerabilities:
                                </span>
                                <div className="font-medium">
                                  {report.data.vulnerabilitiesFound}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Risk Score:
                                </span>
                                <div className="font-medium">
                                  {report.data.riskScore}/100
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Recommendations:
                                </span>
                                <div className="font-medium">
                                  {report.data.recommendations.length}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {reports.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No reports generated yet. Create your first report
                          above.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Report Details Modal/Expanded View */}
            {selectedReport && (
              <Card className="cyber-card-enhanced group">
                <CardHeader className="pb-md relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 cyber-glow">
                      <FileText className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
                      {selectedReport.title.toUpperCase()}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Generated on{" "}
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {selectedReport.data.totalScans}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Scans
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-warning">
                        {selectedReport.data.vulnerabilitiesFound}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vulnerabilities
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {selectedReport.data.riskScore}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Risk Score
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-success">
                        {selectedReport.data.recommendations.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Recommendations
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Key Recommendations</h4>
                    <div className="space-y-2">
                      {selectedReport.data.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2 bg-muted/30 rounded"
                        >
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share className="w-4 h-4 mr-2" />
                      Share Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
