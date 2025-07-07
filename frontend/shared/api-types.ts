// Shared API types for frontend and backend integration

// Scanner API Types
export interface ScanRequest {
  contractAddress: string;
  contractCode?: string;
  plugins: string[];
}

export interface ScanResponse {
  scanId: string;
  status: "scanning" | "completed" | "failed";
  progress: number;
  vulnerabilities: Vulnerability[];
  securityScore: number;
  gasOptimization: number;
  timestamp: string;
  plugins: string[];
  currentPlugin?: string;
  pluginStage?: string;
}

export interface Vulnerability {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  title: string;
  description: string;
  line?: number;
  recommendation: string;
  plugin: string;
}

// Honeypot Detection API Types
export interface HoneypotAnalysisRequest {
  contractAddress: string;
  detectionMethod:
    | "pattern_analysis"
    | "bytecode_similarity"
    | "behavioral_analysis";
}

export interface HoneypotAnalysisResponse {
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

// Time Machine API Types
export interface HistoricalQueryRequest {
  blockNumber?: number;
  timestamp?: string;
  queryType: "balance" | "contract" | "transaction" | "block";
  address?: string;
  transactionHash?: string;
}

export interface HistoricalQueryResponse {
  id: string;
  blockNumber: number;
  timestamp: string;
  query: string;
  results: any[];
  status: "completed" | "failed";
}

// Exploit Replay API Types
export interface ExploitReplayRequest {
  exploitId: string;
  speed: number;
}

export interface ExploitReplayResponse {
  exploitId: string;
  currentTransaction: number;
  totalTransactions: number;
  isReplaying: boolean;
  transactionDetails: ExploitTransaction;
}

export interface ExploitTransaction {
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
}

// Forensics API Types
export interface ForensicsAnalysisRequest {
  address: string;
  analysisType: "transaction_flow" | "balance_history" | "contract_interaction";
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface ForensicsAnalysisResponse {
  id: string;
  address: string;
  analysisType: string;
  findings: ForensicsFinding[];
  riskLevel: "low" | "medium" | "high" | "critical";
  timestamp: string;
  status: "analyzing" | "completed" | "failed";
}

export interface ForensicsFinding {
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  evidence: any[];
  recommendation: string;
}

// Mempool API Types
export interface MempoolTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  timestamp: string;
  type: "normal" | "mev" | "suspicious";
}

export interface MempoolAnalysisResponse {
  totalTransactions: number;
  mevOpportunities: number;
  suspiciousTransactions: number;
  averageGasPrice: string;
  transactions: MempoolTransaction[];
}

// Quantum Resistance API Types
export interface QuantumResistanceRequest {
  algorithm: string;
  keySize: number;
}

export interface QuantumResistanceResponse {
  algorithm: string;
  keySize: number;
  estimatedBreakTime: string;
  recommendation: string;
  quantumResistant: boolean;
  timestamp: string;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface ScanProgressEvent extends WebSocketEvent {
  type: "scan_progress";
  data: {
    scanId: string;
    progress: number;
    currentPlugin: string;
    stage: string;
  };
}

export interface HoneypotAnalysisEvent extends WebSocketEvent {
  type: "honeypot_analysis";
  data: {
    analysisId: string;
    stage: string;
    progress: number;
  };
}

export interface MempoolUpdateEvent extends WebSocketEvent {
  type: "mempool_update";
  data: {
    newTransactions: MempoolTransaction[];
    removedTransactions: string[];
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// API Endpoints
export const API_ENDPOINTS = {
  // Scanner endpoints
  SCAN_CONTRACT: "/api/scanner/scan",
  GET_SCAN_RESULTS: "/api/scanner/results",
  GET_SCAN_HISTORY: "/api/scanner/history",

  // Honeypot endpoints
  ANALYZE_HONEYPOT: "/api/honeypot/analyze",
  GET_HONEYPOT_RESULTS: "/api/honeypot/results",

  // Time Machine endpoints
  HISTORICAL_QUERY: "/api/time-machine/query",
  GET_HISTORICAL_DATA: "/api/time-machine/history",

  // Exploit replay endpoints
  GET_EXPLOITS: "/api/exploits/list",
  START_REPLAY: "/api/exploits/replay/start",
  CONTROL_REPLAY: "/api/exploits/replay/control",

  // Forensics endpoints
  ANALYZE_FORENSICS: "/api/forensics/analyze",
  GET_FORENSICS_RESULTS: "/api/forensics/results",

  // Mempool endpoints
  GET_MEMPOOL_DATA: "/api/mempool/current",
  MEMPOOL_ANALYSIS: "/api/mempool/analyze",

  // Quantum endpoints
  QUANTUM_ANALYSIS: "/api/quantum/analyze",

  // WebSocket endpoint
  WEBSOCKET: "/api/ws",
} as const;
