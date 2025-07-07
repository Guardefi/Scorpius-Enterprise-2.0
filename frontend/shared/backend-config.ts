/**
 * Backend Configuration for Python Integration
 * Supports multiple backend modes: Express (dev), Python (production), Mock (testing)
 */

export type BackendMode = "express" | "python" | "mock";

export interface BackendConfig {
  mode: BackendMode;
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  healthCheck: string;
}

export interface PythonBackendConfig extends BackendConfig {
  mode: "python";
  authToken?: string;
  apiVersion: string;
  enableCompression: boolean;
  maxPayloadSize: number;
}

export interface ExpressBackendConfig extends BackendConfig {
  mode: "express";
}

export interface MockBackendConfig extends BackendConfig {
  mode: "mock";
  mockDelay: number;
  enableRandomErrors: boolean;
}

// Environment detection
export function detectEnvironment(): BackendMode {
  // Check if we're in Electron
  if (typeof window !== "undefined" && (window as any).electronAPI) {
    return "python"; // Electron uses Python backend
  }

  // Check environment variables
  if (typeof process !== "undefined") {
    const mode =
      process.env.VITE_BACKEND_MODE || process.env.REACT_APP_BACKEND_MODE;
    if (mode === "python" || mode === "express" || mode === "mock") {
      return mode as BackendMode;
    }
  }

  // Default based on NODE_ENV
  return typeof process !== "undefined" &&
    process.env.NODE_ENV === "development"
    ? "express"
    : "python";
}

// Backend configurations
export const BACKEND_CONFIGS: Record<BackendMode, BackendConfig> = {
  express: {
    mode: "express",
    baseUrl:
      typeof process !== "undefined" && process.env.NODE_ENV === "development"
        ? "http://localhost:8080"
        : "",
    wsUrl:
      typeof process !== "undefined" && process.env.NODE_ENV === "development"
        ? "ws://localhost:8080"
        : `wss://${typeof window !== "undefined" ? window.location.host : "localhost"}`,
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    healthCheck: "/api/ping",
  },

  python: {
    mode: "python",
    baseUrl:
      (typeof process !== "undefined" &&
        (process.env.VITE_PYTHON_API_URL ||
          process.env.REACT_APP_PYTHON_API_URL)) ||
      "http://localhost:8000",
    wsUrl:
      (typeof process !== "undefined" &&
        (process.env.VITE_PYTHON_WS_URL ||
          process.env.REACT_APP_PYTHON_WS_URL)) ||
      "ws://localhost:8000",
    timeout: 30000, // Python backend may be slower
    retryAttempts: 5,
    retryDelay: 2000,
    healthCheck: "/health",
    apiVersion: "v1",
    enableCompression: true,
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    authToken:
      typeof process !== "undefined" &&
      (process.env.VITE_PYTHON_API_TOKEN ||
        process.env.REACT_APP_PYTHON_API_TOKEN),
  } as PythonBackendConfig,

  mock: {
    mode: "mock",
    baseUrl: "",
    wsUrl: "",
    timeout: 5000,
    retryAttempts: 1,
    retryDelay: 100,
    healthCheck: "/api/mock-health",
    mockDelay: 500,
    enableRandomErrors: false,
  } as MockBackendConfig,
};

// Get current backend configuration
export function getBackendConfig(): BackendConfig {
  const mode = detectEnvironment();
  return BACKEND_CONFIGS[mode];
}

// Backend-specific API endpoint mappings
export const PYTHON_API_ENDPOINTS = {
  // Health and status
  HEALTH: "/api/health",
  STATUS: "/api/status",

  // Scanner endpoints
  SCAN_CONTRACT: "/api/v1/scanner/scan",
  GET_SCAN_RESULTS: "/api/v1/scanner/results",
  GET_SCAN_HISTORY: "/api/v1/scanner/history",
  CANCEL_SCAN: "/api/v1/scanner/cancel",

  // Honeypot endpoints
  ANALYZE_HONEYPOT: "/api/v1/honeypot/analyze",
  GET_HONEYPOT_RESULTS: "/api/v1/honeypot/results",
  GET_HONEYPOT_ANALYSIS: "/api/v1/honeypot/analysis",

  // Time Machine endpoints
  HISTORICAL_QUERY: "/api/v1/time-machine/query",
  GET_HISTORICAL_DATA: "/api/v1/time-machine/history",

  // Exploit replay endpoints
  GET_EXPLOITS: "/api/v1/exploits/list",
  START_REPLAY: "/api/v1/exploits/replay/start",
  CONTROL_REPLAY: "/api/v1/exploits/replay/control",
  GET_REPLAY_STATUS: "/api/v1/exploits/replay/status",

  // Forensics endpoints
  ANALYZE_FORENSICS: "/api/v1/forensics/analyze",
  GET_FORENSICS_RESULTS: "/api/v1/forensics/results",

  // Mempool endpoints
  GET_MEMPOOL_DATA: "/api/v1/mempool/current",
  MEMPOOL_ANALYSIS: "/api/v1/mempool/analyze",
  SUBSCRIBE_MEMPOOL: "/api/v1/mempool/subscribe",

  // Quantum endpoints
  QUANTUM_ANALYSIS: "/api/v1/quantum/analyze",

  // Bridge endpoints (MEV)
  BRIDGE_ANALYSIS: "/api/v1/bridge/analyze",
  BRIDGE_OPPORTUNITIES: "/api/v1/bridge/opportunities",

  // MEV Operations endpoints
  MEV_OPPORTUNITIES: "/api/v1/mev/opportunities",
  MEV_ANALYSIS: "/api/v1/mev/analyze",
  MEV_STRATEGIES: "/api/v1/mev/strategies",

  // WebSocket endpoints
  WEBSOCKET: "/api/v1/ws",
  WEBSOCKET_AUTH: "/api/v1/ws/auth",
} as const;

// Express fallback endpoints (current system)
export const EXPRESS_API_ENDPOINTS = {
  // Health and status
  PING: "/api/ping",

  // Scanner endpoints
  SCAN_CONTRACT: "/api/scanner/scan",
  GET_SCAN_RESULTS: "/api/scanner/results",
  GET_SCAN_HISTORY: "/api/scanner/history",

  // Honeypot endpoints
  ANALYZE_HONEYPOT: "/api/honeypot/analyze",
  GET_HONEYPOT_RESULTS: "/api/honeypot/results",

  // WebSocket
  WEBSOCKET: "/api/ws",
} as const;

// Get API endpoints based on backend mode
export function getApiEndpoints() {
  const config = getBackendConfig();

  switch (config.mode) {
    case "python":
      return PYTHON_API_ENDPOINTS;
    case "express":
      return EXPRESS_API_ENDPOINTS;
    case "mock":
      return PYTHON_API_ENDPOINTS; // Use Python endpoints for mock
    default:
      return EXPRESS_API_ENDPOINTS;
  }
}

// WebSocket configuration for Python backend
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  headers?: Record<string, string>;
  heartbeatInterval?: number;
  messageQueue?: boolean;
  autoReconnect?: boolean;
}

export function getWebSocketConfig(): WebSocketConfig {
  const config = getBackendConfig();

  const wsConfig: WebSocketConfig = {
    url: `${config.wsUrl}${getApiEndpoints().WEBSOCKET}`,
    heartbeatInterval: 30000,
    messageQueue: true,
    autoReconnect: true,
  };

  // Add authentication for Python backend
  if (config.mode === "python") {
    const pythonConfig = config as PythonBackendConfig;
    if (pythonConfig.authToken) {
      wsConfig.headers = {
        Authorization: `Bearer ${pythonConfig.authToken}`,
      };
    }
  }

  return wsConfig;
}

// Request interceptor for Python backend
export function createRequestInterceptor(config: BackendConfig) {
  return (url: string, options: RequestInit = {}): RequestInit => {
    const headers = new Headers(options.headers);

    // Add common headers
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    // Python-specific headers
    if (config.mode === "python") {
      const pythonConfig = config as PythonBackendConfig;

      if (pythonConfig.authToken) {
        headers.set("Authorization", `Bearer ${pythonConfig.authToken}`);
      }

      if (pythonConfig.enableCompression) {
        headers.set("Accept-Encoding", "gzip, deflate");
      }

      headers.set("X-API-Version", pythonConfig.apiVersion);
    }

    return {
      ...options,
      headers,
      signal: options.signal || AbortSignal.timeout(config.timeout),
    };
  };
}

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  const config = getBackendConfig();
  const interceptor = createRequestInterceptor(config);

  try {
    const requestOptions = interceptor(config.healthCheck, { method: "GET" });
    const response = await fetch(
      `${config.baseUrl}${config.healthCheck}`,
      requestOptions,
    );
    return response.ok;
  } catch (error) {
    console.warn(`Backend health check failed for ${config.mode}:`, error);
    return false;
  }
}
