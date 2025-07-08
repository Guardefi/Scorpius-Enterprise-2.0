# SCORPIUS Security Platform - Frontend Integration Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication Integration](#authentication-integration)
3. [Real-time Features](#real-time-features)
4. [Security Scanner Integration](#security-scanner-integration)
5. [Honeypot Detection Integration](#honeypot-detection-integration)
6. [MEV Operations Integration](#mev-operations-integration)
7. [Wallet Guard Integration](#wallet-guard-integration)
8. [Time Machine Integration](#time-machine-integration)
9. [Analytics & Dashboards](#analytics--dashboards)
10. [WebSocket Integration](#websocket-integration)
11. [Plugin System Integration](#plugin-system-integration)
12. [Error Handling](#error-handling)
13. [Performance Optimization](#performance-optimization)

---

## Quick Start

### Installation

```bash
# Install the SCORPIUS SDK
npm install @scorpius/sdk

# Or use yarn
yarn add @scorpius/sdk

# Or use CDN for browser
<script src="https://cdn.scorpius.dev/sdk/js/2.1.0/scorpius-sdk.min.js"></script>
```

### Basic Setup

```typescript
import { ScorpiusClient } from "@scorpius/sdk";

// Initialize the client
const scorpius = new ScorpiusClient({
  baseUrl: "https://api.scorpius.dev",
  apiKey: process.env.SCORPIUS_API_KEY, // For server-side
  websocketUrl: "wss://api.scorpius.dev/ws",
  environment: "production", // 'development', 'staging', 'production'
  version: "v1",
  timeout: 30000,
  retries: 3,
});

// For client-side authentication (JWT)
const scorpius = new ScorpiusClient({
  baseUrl: "https://api.scorpius.dev",
  token: localStorage.getItem("scorpius_token"),
  refreshToken: localStorage.getItem("scorpius_refresh_token"),
  onTokenRefresh: (newToken, newRefreshToken) => {
    localStorage.setItem("scorpius_token", newToken);
    localStorage.setItem("scorpius_refresh_token", newRefreshToken);
  },
});
```

---

## Authentication Integration

### Login Flow

```typescript
// Email/Password Login
async function loginWithCredentials(email: string, password: string) {
  try {
    const response = await scorpius.auth.login({
      method: "credentials",
      email,
      password,
    });

    // Store tokens
    localStorage.setItem("scorpius_token", response.accessToken);
    localStorage.setItem("scorpius_refresh_token", response.refreshToken);

    // Redirect to dashboard
    window.location.href = "/dashboard";

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

// Wallet Connection Login
async function loginWithWallet(
  walletProvider: "metamask" | "walletconnect" | "coinbase",
) {
  try {
    // Connect to wallet first
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];

    // Request signature for authentication
    const message = await scorpius.auth.getSignatureMessage(address);
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });

    const response = await scorpius.auth.login({
      method: "wallet",
      walletAddress: address,
      signature,
      provider: walletProvider,
    });

    localStorage.setItem("scorpius_token", response.accessToken);
    localStorage.setItem("scorpius_refresh_token", response.refreshToken);

    return response;
  } catch (error) {
    console.error("Wallet login failed:", error);
    throw error;
  }
}

// 2FA Verification
async function verify2FA(token: string, method: "totp" | "sms" | "email") {
  try {
    const response = await scorpius.auth.verify2FA({
      token,
      method,
    });

    // Update stored tokens with 2FA verified tokens
    localStorage.setItem("scorpius_token", response.accessToken);

    return response;
  } catch (error) {
    console.error("2FA verification failed:", error);
    throw error;
  }
}

// Logout
async function logout() {
  try {
    const refreshToken = localStorage.getItem("scorpius_refresh_token");
    await scorpius.auth.logout({ refreshToken });

    // Clear local storage
    localStorage.removeItem("scorpius_token");
    localStorage.removeItem("scorpius_refresh_token");

    // Redirect to login
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error);
    // Clear tokens anyway
    localStorage.clear();
  }
}
```

### Auto-Login & Token Refresh

```typescript
// Auto-refresh token when needed
scorpius.auth.onTokenExpired(() => {
  const refreshToken = localStorage.getItem("scorpius_refresh_token");
  return scorpius.auth.refreshToken(refreshToken);
});

// Check authentication status on app load
async function initializeAuth() {
  const token = localStorage.getItem("scorpius_token");
  if (!token) {
    return false; // Not authenticated
  }

  try {
    // Verify token is still valid
    const profile = await scorpius.user.getProfile();
    return !!profile;
  } catch (error) {
    // Token invalid, try refresh
    try {
      const refreshToken = localStorage.getItem("scorpius_refresh_token");
      await scorpius.auth.refreshToken(refreshToken);
      return true;
    } catch (refreshError) {
      // Refresh failed, user needs to login again
      localStorage.clear();
      return false;
    }
  }
}
```

---

## Real-time Features

### Auto-Scan Configuration

```typescript
// Configure auto-scanning for contracts
async function setupAutoScan(
  contracts: Array<{
    address: string;
    chain: string;
    interval: number; // seconds
  }>,
) {
  try {
    const response = await scorpius.monitoring.configureAutoScan({
      targets: contracts.map((contract) => ({
        type: "contract",
        address: contract.address,
        interval: contract.interval,
        triggers: ["code-change", "high-volume", "price-impact"],
      })),
      globalSettings: {
        enabled: true,
        maxConcurrent: 10,
        priorityQueue: true,
      },
    });

    return response;
  } catch (error) {
    console.error("Auto-scan setup failed:", error);
    throw error;
  }
}

// Get auto-scan status
async function getAutoScanStatus() {
  try {
    const status = await scorpius.monitoring.getAutoScanStatus();
    return {
      enabled: status.enabled,
      activeScans: status.activeScans,
      queueLength: status.queueLength,
      lastScan: new Date(status.lastScan),
      totalScans: status.totalScans,
    };
  } catch (error) {
    console.error("Failed to get auto-scan status:", error);
    return null;
  }
}
```

### Real-time Monitoring Dashboard

```typescript
// Real-time system metrics component
function RealTimeMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Subscribe to real-time metrics
    const unsubscribe = scorpius.monitoring.subscribeToMetrics({
      onData: (newMetrics) => {
        setMetrics(newMetrics);
        setConnectionStatus('connected');
      },
      onError: (error) => {
        console.error('Metrics subscription error:', error);
        setConnectionStatus('error');
      },
      onDisconnect: () => {
        setConnectionStatus('disconnected');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="metrics-dashboard">
      <div className="connection-status">
        Status: {connectionStatus}
      </div>
      {metrics && (
        <div className="metrics-grid">
          <MetricCard
            title="Threats Detected"
            value={metrics.threatsDetected}
            trend={metrics.threatsTrend}
          />
          <MetricCard
            title="Contracts Scanned"
            value={metrics.contractsScanned}
            trend={metrics.scanTrend}
          />
          <MetricCard
            title="Active Connections"
            value={metrics.activeConnections}
          />
          <MetricCard
            title="Response Time"
            value={`${metrics.responseTime}ms`}
            status={metrics.responseTime > 1000 ? 'warning' : 'good'}
          />
        </div>
      )}
    </div>
  );
}
```

---

## Security Scanner Integration

### Comprehensive Vulnerability Scanning

```typescript
// Start a comprehensive security scan
async function startSecurityScan(config: {
  target: {
    type: "contract" | "bytecode" | "source";
    address?: string;
    bytecode?: string;
    source?: string;
    chain: string;
  };
  engines: Array<"slither" | "mythril" | "manticore" | "securify" | "oyente">;
  depth: "quick" | "standard" | "deep";
}) {
  try {
    const analysis = await scorpius.scanner.analyze({
      target: config.target,
      analysis: {
        engines: config.engines,
        depth: config.depth,
        timeout: config.depth === "deep" ? 600 : 300,
        customRules: ["reentrancy", "overflow", "access-control"],
      },
    });

    return analysis;
  } catch (error) {
    console.error("Scan failed:", error);
    throw error;
  }
}

// Monitor scan progress
function useScanProgress(analysisId: string) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("pending");
  const [results, setResults] = useState(null);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await scorpius.scanner.getResults(analysisId);
        setProgress(result.progress);
        setStatus(result.status);

        if (result.status === "completed") {
          setResults(result);
          clearInterval(pollInterval);
        } else if (result.status === "failed") {
          clearInterval(pollInterval);
          throw new Error("Scan failed");
        }
      } catch (error) {
        console.error("Failed to fetch scan progress:", error);
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [analysisId]);

  return { progress, status, results };
}

// Plugin-specific scanning
async function runSlitherAnalysis(
  source: string,
  options?: {
    detectors?: string[];
    exclude?: string[];
    severity?: Array<"high" | "medium" | "low">;
  },
) {
  try {
    const result = await scorpius.scanner.slither({
      source,
      detectors: options?.detectors || ["reentrancy", "uninitialized-state"],
      exclude: options?.exclude || ["naming-convention"],
      severity: options?.severity || ["high", "medium"],
    });

    return result;
  } catch (error) {
    console.error("Slither analysis failed:", error);
    throw error;
  }
}

async function runMythrilAnalysis(
  bytecode: string,
  options?: {
    address?: string;
    maxDepth?: number;
    timeout?: number;
  },
) {
  try {
    const result = await scorpius.scanner.mythril({
      bytecode,
      address: options?.address,
      maxDepth: options?.maxDepth || 22,
      executionTimeout: options?.timeout || 600,
      modules: ["integer", "exceptions", "ether_thief"],
    });

    return result;
  } catch (error) {
    console.error("Mythril analysis failed:", error);
    throw error;
  }
}

async function runManticoreAnalysis(
  source: string,
  options?: {
    constraints?: string[];
    strategy?: "dfs" | "bfs" | "random";
    maxStates?: number;
  },
) {
  try {
    const result = await scorpius.scanner.manticore({
      source,
      constraints: options?.constraints,
      explorationStrategy: options?.strategy || "dfs",
      maxStates: options?.maxStates || 100,
    });

    return result;
  } catch (error) {
    console.error("Manticore analysis failed:", error);
    throw error;
  }
}
```

### Scan Results Visualization

```typescript
// Vulnerability results component
function VulnerabilityResults({ analysisId }: { analysisId: string }) {
  const { results, loading, error } = useScanResults(analysisId);

  if (loading) return <ScanProgress analysisId={analysisId} />;
  if (error) return <ErrorDisplay error={error} />;
  if (!results) return null;

  return (
    <div className="vulnerability-results">
      <ScanSummary
        vulnerabilities={results.vulnerabilities}
        metrics={results.metrics}
        executionTime={results.executionTime}
      />

      <div className="vulnerabilities-list">
        {results.vulnerabilities.map((vuln, index) => (
          <VulnerabilityCard
            key={index}
            vulnerability={vuln}
            onViewDetails={() => openVulnerabilityDetails(vuln)}
          />
        ))}
      </div>

      <RecommendationsPanel
        recommendations={results.recommendations}
      />
    </div>
  );
}

// Real-time scan progress
function ScanProgress({ analysisId }: { analysisId: string }) {
  const { progress, status, currentStage } = useScanProgress(analysisId);

  return (
    <div className="scan-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-info">
        <span className="progress-percentage">{progress}%</span>
        <span className="progress-status">{status}</span>
      </div>
      {currentStage && (
        <div className="current-stage">
          Current: {currentStage}
        </div>
      )}
    </div>
  );
}
```

---

## Honeypot Detection Integration

### Multi-Method Honeypot Analysis

```typescript
// Comprehensive honeypot analysis
async function analyzeHoneypot(config: {
  contractAddress: string;
  chain: string;
  methods: {
    static: boolean;
    bytecode: boolean;
    dynamic: boolean;
    ml: boolean;
    liquidity: boolean;
  };
  simulationParams?: {
    testAmount: string;
    slippageTolerance: number;
    gasLimit: number;
  };
}) {
  try {
    const analysis = await scorpius.honeypot.analyze({
      contractAddress: config.contractAddress,
      chain: config.chain,
      methods: config.methods,
      simulationParams: config.simulationParams || {
        testAmount: "0.1",
        slippageTolerance: 3,
        gasLimit: 500000,
      },
    });

    return analysis;
  } catch (error) {
    console.error("Honeypot analysis failed:", error);
    throw error;
  }
}

// Real-time honeypot analysis hook
function useHoneypotAnalysis(analysisId: string) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const data = await scorpius.honeypot.getResults(analysisId);
        setResults(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }

    fetchResults();

    // Poll for updates if analysis is still running
    const interval = setInterval(fetchResults, 3000);
    return () => clearInterval(interval);
  }, [analysisId]);

  return { results, loading, error };
}

// Simulation replay
async function replayHoneypotSimulation(
  analysisId: string,
  stepIndex: number,
  customParams?: {
    amount?: string;
    gasPrice?: string;
  },
) {
  try {
    const replay = await scorpius.honeypot.replaySimulation({
      analysisId,
      stepIndex,
      customParams,
    });

    return replay;
  } catch (error) {
    console.error("Simulation replay failed:", error);
    throw error;
  }
}
```

### Honeypot Watchlist Management

```typescript
// Add contract to watchlist
async function addToHoneypotWatchlist(config: {
  address: string;
  chain: string;
  alertThreshold: number;
  scanInterval: number;
  alerts: {
    email: boolean;
    telegram: boolean;
    webhook?: string;
  };
}) {
  try {
    const watchlistItem = await scorpius.honeypot.addToWatchlist(config);
    return watchlistItem;
  } catch (error) {
    console.error('Failed to add to watchlist:', error);
    throw error;
  }
}

// Get user's honeypot watchlist
async function getHoneypotWatchlist(options?: {
  page?: number;
  limit?: number;
  sortBy?: 'lastChecked' | 'honeypotScore' | 'addedAt';
  filter?: 'all' | 'active' | 'warning' | 'inactive';
}) {
  try {
    const watchlist = await scorpius.honeypot.getWatchlist({
      page: options?.page || 1,
      limit: options?.limit || 20,
      sortBy: options?.sortBy || 'lastChecked',
      filter: options?.filter || 'all'
    });

    return watchlist;
  } catch (error) {
    console.error('Failed to get watchlist:', error);
    throw error;
  }
}

// Watchlist component
function HoneypotWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const data = await getHoneypotWatchlist();
        setWatchlist(data.items);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load watchlist:', error);
        setLoading(false);
      }
    }

    loadWatchlist();
  }, []);

  return (
    <div className="honeypot-watchlist">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="watchlist-items">
          {watchlist.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              onUpdate={loadWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## MEV Operations Integration

### MEV Strategy Management

```typescript
// Create new MEV strategy
async function createMEVStrategy(config: {
  name: string;
  type: "arbitrage" | "liquidation" | "sandwich" | "frontrun";
  parameters: {
    targetPools: string[];
    minProfitThreshold: number;
    maxGasPrice: number;
    slippageTolerance: number;
  };
}) {
  try {
    const strategy = await scorpius.mev.createStrategy({
      name: config.name,
      type: config.type,
      parameters: config.parameters,
    });

    return strategy;
  } catch (error) {
    console.error("Failed to create MEV strategy:", error);
    throw error;
  }
}

// Get MEV opportunities
function useMEVOpportunities(filters?: {
  type?: Array<"arbitrage" | "liquidation">;
  minProfit?: number;
  priority?: Array<"high" | "medium">;
}) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time opportunities
    const unsubscribe = scorpius.mev.subscribeToOpportunities({
      filters: filters || {},
      realtime: true,
      onData: (newOpportunities) => {
        setOpportunities(newOpportunities);
        setLoading(false);
      },
      onError: (error) => {
        console.error("MEV opportunities subscription error:", error);
        setLoading(false);
      },
    });

    return unsubscribe;
  }, [filters]);

  return { opportunities, loading };
}

// Execute MEV opportunity
async function executeMEVOpportunity(
  opportunityId: string,
  config: {
    strategyId: string;
    maxGas: number;
    slippageOverride?: number;
    dryRun?: boolean;
  },
) {
  try {
    const execution = await scorpius.mev.executeOpportunity(
      opportunityId,
      config,
    );
    return execution;
  } catch (error) {
    console.error("MEV execution failed:", error);
    throw error;
  }
}
```

### MEV Dashboard Component

```typescript
function MEVDashboard() {
  const { opportunities } = useMEVOpportunities({
    type: ['arbitrage', 'liquidation'],
    minProfit: 0.01,
    priority: ['high', 'medium']
  });

  const [strategies, setStrategies] = useState([]);
  const [activeExecutions, setActiveExecutions] = useState([]);

  useEffect(() => {
    // Load MEV strategies
    async function loadStrategies() {
      const strategiesData = await scorpius.mev.getStrategies();
      setStrategies(strategiesData);
    }

    loadStrategies();
  }, []);

  return (
    <div className="mev-dashboard">
      <div className="dashboard-header">
        <h2>MEV Operations Center</h2>
        <MEVMetrics />
      </div>

      <div className="dashboard-content">
        <div className="opportunities-panel">
          <h3>Live Opportunities</h3>
          <OpportunitiesList
            opportunities={opportunities}
            onExecute={executeMEVOpportunity}
          />
        </div>

        <div className="strategies-panel">
          <h3>Active Strategies</h3>
          <StrategiesList
            strategies={strategies}
            onUpdate={setStrategies}
          />
        </div>

        <div className="executions-panel">
          <h3>Recent Executions</h3>
          <ExecutionsList executions={activeExecutions} />
        </div>
      </div>
    </div>
  );
}
```

---

## Wallet Guard Integration

### Wallet Risk Analysis

```typescript
// Analyze wallet security
async function analyzeWallet(config: {
  address: string;
  ens?: string;
  chain: string;
  depth: "standard" | "deep";
  includeHistory: boolean;
}) {
  try {
    const analysis = await scorpius.wallet.analyze(config);
    return analysis;
  } catch (error) {
    console.error("Wallet analysis failed:", error);
    throw error;
  }
}

// Get wallet risk profile
function useWalletRiskProfile(address: string, chain: string = "ethereum") {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await scorpius.wallet.getRiskProfile(address, { chain });
        setProfile(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }

    if (address) {
      loadProfile();
    }
  }, [address, chain]);

  return { profile, loading, error };
}

// Token approvals management
async function getTokenApprovals(address: string, chain: string = "ethereum") {
  try {
    const approvals = await scorpius.wallet.getApprovals(address, { chain });
    return approvals;
  } catch (error) {
    console.error("Failed to get token approvals:", error);
    throw error;
  }
}

async function revokeTokenApproval(config: {
  walletAddress: string;
  tokenAddress: string;
  spenderAddress: string;
  signature: string;
}) {
  try {
    const result = await scorpius.wallet.revokeApproval(config);
    return result;
  } catch (error) {
    console.error("Failed to revoke approval:", error);
    throw error;
  }
}
```

### Wallet Security Dashboard

```typescript
function WalletSecurityDashboard({ walletAddress }: { walletAddress: string }) {
  const { profile, loading: profileLoading } = useWalletRiskProfile(walletAddress);
  const [approvals, setApprovals] = useState([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);

  useEffect(() => {
    async function loadApprovals() {
      try {
        const approvalsData = await getTokenApprovals(walletAddress);
        setApprovals(approvalsData.approvals);
        setApprovalsLoading(false);
      } catch (error) {
        console.error('Failed to load approvals:', error);
        setApprovalsLoading(false);
      }
    }

    if (walletAddress) {
      loadApprovals();
    }
  }, [walletAddress]);

  if (profileLoading || approvalsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="wallet-security-dashboard">
      <WalletRiskOverview profile={profile} />

      <div className="security-sections">
        <TokenApprovalsSection
          approvals={approvals}
          onRevoke={(approval) => revokeTokenApproval(approval)}
        />

        <TransactionHistorySection
          walletAddress={walletAddress}
          interactions={profile?.interactions}
        />

        <SecurityRecommendations
          riskLevel={profile?.riskLevel}
          flags={profile?.flags}
        />
      </div>
    </div>
  );
}
```

---

## Time Machine Integration

### Historical Analysis

```typescript
// Query historical blockchain state
async function queryHistoricalState(config: {
  blockNumber?: number;
  timestamp?: string;
  queries: Array<{
    type: "balance" | "storage" | "code";
    address: string;
    token?: string;
    slot?: string;
  }>;
}) {
  try {
    const results = await scorpius.timeMachine.query(config);
    return results;
  } catch (error) {
    console.error("Historical query failed:", error);
    throw error;
  }
}

// Get historical exploits database
async function getHistoricalExploits(filters?: {
  category?: "flash-loan" | "reentrancy" | "oracle" | "bridge";
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: "date" | "impact" | "complexity";
}) {
  try {
    const exploits = await scorpius.timeMachine.getExploits(filters);
    return exploits;
  } catch (error) {
    console.error("Failed to get historical exploits:", error);
    throw error;
  }
}

// Replay historical exploit
async function replayExploit(
  exploitId: string,
  config?: {
    forkBlock?: number;
    customParams?: Record<string, any>;
  },
) {
  try {
    const replay = await scorpius.timeMachine.replayExploit(exploitId, config);
    return replay;
  } catch (error) {
    console.error("Exploit replay failed:", error);
    throw error;
  }
}
```

### Time Machine Dashboard

```typescript
function TimeMachineDashboard() {
  const [selectedExploit, setSelectedExploit] = useState(null);
  const [replayProgress, setReplayProgress] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);

  const { exploits, loading } = useHistoricalExploits({
    category: 'flash-loan',
    sortBy: 'impact'
  });

  const handleReplayExploit = async (exploit) => {
    try {
      setReplayProgress({ status: 'starting', progress: 0 });

      const replay = await replayExploit(exploit.id, {
        forkBlock: exploit.blockNumber,
        customParams: {
          flashLoanAmount: '30000000',
          targetPool: exploit.targetAddress
        }
      });

      setReplayProgress({ status: 'completed', progress: 100, results: replay });
    } catch (error) {
      setReplayProgress({ status: 'failed', error: error.message });
    }
  };

  return (
    <div className="time-machine-dashboard">
      <div className="dashboard-header">
        <h2>Blockchain Time Machine</h2>
        <HistoricalQueryBuilder
          onQuery={setHistoricalData}
        />
      </div>

      <div className="dashboard-content">
        <ExploitsTimeline
          exploits={exploits}
          onSelect={setSelectedExploit}
          loading={loading}
        />

        {selectedExploit && (
          <ExploitDetails
            exploit={selectedExploit}
            onReplay={handleReplayExploit}
            replayProgress={replayProgress}
          />
        )}

        <HistoricalDataViewer data={historicalData} />
      </div>
    </div>
  );
}
```

---

## Analytics & Dashboards

### Real-time Analytics

```typescript
// Get dashboard analytics
async function getDashboardAnalytics(
  timeRange: "1h" | "24h" | "7d" | "30d" = "24h",
) {
  try {
    const analytics = await scorpius.analytics.getDashboard({ timeRange });
    return {
      metrics: analytics.metrics,
      charts: analytics.charts,
      alerts: analytics.alerts,
    };
  } catch (error) {
    console.error("Failed to get dashboard analytics:", error);
    throw error;
  }
}

// Custom analytics query
async function runCustomAnalytics(query: {
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  aggregation: "sum" | "avg" | "max" | "min";
  visualization: "line" | "bar" | "pie" | "heatmap";
}) {
  try {
    const results = await scorpius.analytics.customQuery({
      query,
      visualization: query.visualization,
    });

    return results;
  } catch (error) {
    console.error("Custom analytics query failed:", error);
    throw error;
  }
}

// Generate comprehensive report
async function generateSecurityReport(config: {
  type: "security" | "compliance" | "performance";
  timeRange: string;
  format: "pdf" | "csv" | "json";
  includeCharts: boolean;
  customSections?: string[];
}) {
  try {
    const report = await scorpius.analytics.generateReport(config);
    return report;
  } catch (error) {
    console.error("Report generation failed:", error);
    throw error;
  }
}
```

### Interactive Charts & Graphs

```typescript
// Real-time chart component
function RealTimeChart({
  chartType,
  timeRange = '24h',
  refreshInterval = 30000
}: {
  chartType: 'threat-trends' | 'vulnerability-severity' | 'mev-profits' | 'scan-volume';
  timeRange?: string;
  refreshInterval?: number;
}) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChartData() {
      try {
        const data = await scorpius.analytics.getChart(chartType, {
          timeRange,
          granularity: 'hour'
        });
        setChartData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load chart data:', error);
        setLoading(false);
      }
    }

    loadChartData();

    // Set up refresh interval
    const interval = setInterval(loadChartData, refreshInterval);
    return () => clearInterval(interval);
  }, [chartType, timeRange, refreshInterval]);

  return (
    <div className="chart-container">
      {loading ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00ffff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// Advanced analytics dashboard
function AdvancedAnalyticsDashboard() {
  const [selectedMetrics, setSelectedMetrics] = useState([
    'threats_detected',
    'vulnerabilities_found',
    'mev_profits'
  ]);

  const [customQuery, setCustomQuery] = useState({
    metrics: selectedMetrics,
    dimensions: ['time', 'severity'],
    filters: {},
    aggregation: 'sum',
    visualization: 'line'
  });

  return (
    <div className="advanced-analytics">
      <div className="analytics-controls">
        <MetricsSelector
          selected={selectedMetrics}
          onChange={setSelectedMetrics}
        />

        <QueryBuilder
          query={customQuery}
          onChange={setCustomQuery}
        />
      </div>

      <div className="analytics-visualization">
        <CustomChart query={customQuery} />
      </div>

      <div className="analytics-insights">
        <InsightsPanel metrics={selectedMetrics} />
      </div>
    </div>
  );
}
```

---

## WebSocket Integration

### Real-time Event Streaming

```typescript
// WebSocket connection management
class ScorpiusWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscriptions = new Map();

  connect(url: string, token: string) {
    this.ws = new WebSocket(`${url}?token=${token}`);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;

      // Resubscribe to all active subscriptions
      this.subscriptions.forEach((callback, channel) => {
        this.subscribe(channel, callback);
      });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callback = this.subscriptions.get(data.channel);
      if (callback) {
        callback(data.payload);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  subscribe(channel: string, callback: (data: any) => void) {
    this.subscriptions.set(channel, callback);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "subscribe",
          channel,
        }),
      );
    }
  }

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "unsubscribe",
          channel,
        }),
      );
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;

      setTimeout(() => {
        this.connect(this.ws?.url || "", ""); // Would need to store token
      }, delay);
    }
  }

  disconnect() {
    this.ws?.close();
    this.subscriptions.clear();
  }
}

// Real-time threat monitoring
function useRealTimeThreats() {
  const [threats, setThreats] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new ScorpiusWebSocket();

    ws.connect(
      "wss://api.scorpius.dev/ws",
      localStorage.getItem("scorpius_token"),
    );

    ws.subscribe("threats", (threat) => {
      setThreats((prev) => [threat, ...prev.slice(0, 99)]); // Keep last 100
    });

    ws.subscribe("connection", (status) => {
      setConnected(status.connected);
    });

    return () => ws.disconnect();
  }, []);

  return { threats, connected };
}

// Real-time mempool monitoring
function useMempoolMonitoring(filters: {
  chains: string[];
  minValue?: string;
  types?: string[];
  addresses?: string[];
}) {
  const [transactions, setTransactions] = useState([]);
  const [mevOpportunities, setMevOpportunities] = useState([]);

  useEffect(() => {
    const ws = new ScorpiusWebSocket();

    ws.connect(
      "wss://api.scorpius.dev/ws/mempool",
      localStorage.getItem("scorpius_token"),
    );

    // Send filter configuration
    ws.subscribe("mempool", (data) => {
      if (data.type === "transaction") {
        setTransactions((prev) => [data.payload, ...prev.slice(0, 49)]);
      } else if (data.type === "mev_opportunity") {
        setMevOpportunities((prev) => [data.payload, ...prev.slice(0, 19)]);
      }
    });

    // Configure filters
    ws.send(
      JSON.stringify({
        action: "configure",
        filters,
      }),
    );

    return () => ws.disconnect();
  }, [filters]);

  return { transactions, mevOpportunities };
}
```

---

## Plugin System Integration

### Plugin Management

```typescript
// Get available plugins
async function getAvailablePlugins() {
  try {
    const plugins = await scorpius.plugins.list();
    return plugins.plugins;
  } catch (error) {
    console.error("Failed to get plugins:", error);
    throw error;
  }
}

// Install plugin
async function installPlugin(pluginId: string, version: string = "latest") {
  try {
    const installation = await scorpius.plugins.install(pluginId, { version });
    return installation;
  } catch (error) {
    console.error("Plugin installation failed:", error);
    throw error;
  }
}

// Configure plugin
async function configurePlugin(pluginId: string, config: Record<string, any>) {
  try {
    const result = await scorpius.plugins.configure(pluginId, {
      settings: config,
    });
    return result;
  } catch (error) {
    console.error("Plugin configuration failed:", error);
    throw error;
  }
}

// Upload custom plugin
async function uploadCustomPlugin(pluginData: {
  name: string;
  description: string;
  file: File;
  metadata: Record<string, any>;
}) {
  try {
    const formData = new FormData();
    formData.append("name", pluginData.name);
    formData.append("description", pluginData.description);
    formData.append("file", pluginData.file);
    formData.append("metadata", JSON.stringify(pluginData.metadata));

    const result = await scorpius.plugins.uploadCustom(formData);
    return result;
  } catch (error) {
    console.error("Custom plugin upload failed:", error);
    throw error;
  }
}
```

### Plugin Dashboard

```typescript
function PluginDashboard() {
  const [plugins, setPlugins] = useState([]);
  const [installedPlugins, setInstalledPlugins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlugins() {
      try {
        const [available, installed] = await Promise.all([
          getAvailablePlugins(),
          scorpius.plugins.getInstalled()
        ]);

        setPlugins(available);
        setInstalledPlugins(installed);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load plugins:', error);
        setLoading(false);
      }
    }

    loadPlugins();
  }, []);

  return (
    <div className="plugin-dashboard">
      <div className="dashboard-header">
        <h2>Plugin Management</h2>
        <PluginUploadButton onUpload={uploadCustomPlugin} />
      </div>

      <div className="plugin-sections">
        <InstalledPluginsSection
          plugins={installedPlugins}
          onConfigure={configurePlugin}
          onUninstall={(id) => scorpius.plugins.uninstall(id)}
        />

        <AvailablePluginsSection
          plugins={plugins}
          installedIds={installedPlugins.map(p => p.id)}
          onInstall={installPlugin}
        />
      </div>
    </div>
  );
}
```

---

## Error Handling

### Comprehensive Error Management

```typescript
// Error types
interface ScorpiusError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

// Error handler hook
function useErrorHandler() {
  const [errors, setErrors] = useState<ScorpiusError[]>([]);

  const handleError = useCallback((error: ScorpiusError) => {
    setErrors(prev => [error, ...prev.slice(0, 9)]); // Keep last 10 errors

    // Log to external service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      console.error('SCORPIUS Error:', error);
    }

    // Show user notification for critical errors
    if (error.code.startsWith('CRITICAL_')) {
      toast.error(`Critical Error: ${error.message}`);
    }
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return { errors, handleError, clearError, clearAllErrors };
}

// Global error boundary
class ScorpiusErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SCORPIUS Error Boundary:', error, errorInfo);

    // Report to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { errorBoundary: errorInfo }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Retry mechanism for failed requests
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## Performance Optimization

### Caching & Optimization

```typescript
// Response caching
const cache = new Map();

async function cachedRequest<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300000 // 5 minutes
): Promise<T> {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fn();
  cache.set(key, { data, timestamp: Date.now() });

  return data;
}

// Debounced search
function useDebouncedSearch(searchFn: (query: string) => Promise<any>, delay: number = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFn, delay]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return { query, setQuery, results, loading };
}

// Virtual scrolling for large datasets
function VirtualizedList({
  items,
  itemHeight,
  containerHeight,
  renderItem
}: {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      className="virtual-list-container"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lazy loading for images and components
function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          const img = imgRef.current;
          img.src = src;
          img.onload = () => setLoaded(true);
          img.onerror = () => setError(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={`lazy-image ${className || ''}`}>
      <img
        ref={imgRef}
        alt={alt}
        className={loaded ? 'loaded' : 'loading'}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      />
      {error && <div className="image-error">Failed to load image</div>}
    </div>
  );
}
```

This comprehensive frontend integration guide provides everything needed to build a production-ready application with the SCORPIUS Security Platform, including real-time features, comprehensive error handling, and performance optimizations.
