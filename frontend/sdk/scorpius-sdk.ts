/**
 * SCORPIUS Security Platform SDK
 * Programmatic access to all security tools and features
 */

interface ScorpiusConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
}

interface ScanOptions {
  contractAddress: string;
  scanTypes: string[];
  priority?: "low" | "medium" | "high" | "critical";
  waitForCompletion?: boolean;
}

interface AnalysisOptions {
  contractAddress: string;
  blockNumber?: string;
  includeControlFlow?: boolean;
  includeDecompilation?: boolean;
  waitForCompletion?: boolean;
}

interface SimulationOptions {
  contractAddress: string;
  exploitType: string[];
  blockNumber?: string;
  txHash?: string;
  parameters?: Record<string, any>;
  priority?: "low" | "medium" | "high" | "critical";
  waitForCompletion?: boolean;
}

export class ScorpiusSDK {
  private config: ScorpiusConfig;
  private ws: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: ScorpiusConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    };
  }

  // Authentication
  async authenticate(apiKey: string): Promise<boolean> {
    try {
      const response = await this.makeRequest("/auth/validate", {
        method: "POST",
        body: { apiKey },
      });
      this.config.apiKey = apiKey;
      return response.valid;
    } catch (error) {
      console.error("Authentication failed:", error);
      return false;
    }
  }

  // Scanner API
  async startScan(options: ScanOptions) {
    try {
      const response = await this.makeRequest("/api/scanner/scan", {
        method: "POST",
        body: options,
      });

      if (options.waitForCompletion) {
        return await this.waitForScanCompletion(response.scanId);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to start scan: ${error}`);
    }
  }

  async getScanStatus(scanId: string) {
    return this.makeRequest(`/api/scanner/scan/${scanId}`);
  }

  async getAllScans(page = 1, limit = 10, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    return this.makeRequest(`/api/scanner/scans?${params}`);
  }

  async getScannerStats() {
    return this.makeRequest("/api/scanner/stats");
  }

  async deleteScan(scanId: string) {
    return this.makeRequest(`/api/scanner/scan/${scanId}`, {
      method: "DELETE",
    });
  }

  // Bytecode Lab API
  async startBytecodeAnalysis(options: AnalysisOptions) {
    try {
      const response = await this.makeRequest("/api/bytecode/analyze", {
        method: "POST",
        body: options,
      });

      if (options.waitForCompletion) {
        return await this.waitForAnalysisCompletion(response.analysisId);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to start analysis: ${error}`);
    }
  }

  async getAnalysis(analysisId: string) {
    return this.makeRequest(`/api/bytecode/analysis/${analysisId}`);
  }

  async getControlFlowGraph(analysisId: string) {
    return this.makeRequest(
      `/api/bytecode/analysis/${analysisId}/control-flow`,
    );
  }

  async getDecompiledCode(analysisId: string) {
    return this.makeRequest(`/api/bytecode/analysis/${analysisId}/decompiled`);
  }

  async getBytecodeStats() {
    return this.makeRequest("/api/bytecode/stats");
  }

  // Simulation Engine API
  async queueSimulation(options: SimulationOptions) {
    try {
      const response = await this.makeRequest("/api/simulation/queue", {
        method: "POST",
        body: options,
      });

      if (options.waitForCompletion) {
        return await this.waitForSimulationCompletion(response.simulationId);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to queue simulation: ${error}`);
    }
  }

  async getSimulation(simulationId: string) {
    return this.makeRequest(`/api/simulation/${simulationId}`);
  }

  async getSimulationStats() {
    return this.makeRequest("/api/simulation-stats");
  }

  async pauseSimulation(simulationId: string) {
    return this.makeRequest(`/api/simulation/${simulationId}/pause`, {
      method: "POST",
    });
  }

  async cancelSimulation(simulationId: string) {
    return this.makeRequest(`/api/simulation/${simulationId}/cancel`, {
      method: "POST",
    });
  }

  async getQueueStatus() {
    return this.makeRequest("/api/simulation-queue");
  }

  // Bridge Monitor API
  async getBridgeTransfers(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.makeRequest(`/api/bridge/transfers?${params}`);
  }

  async getBridgeStats() {
    return this.makeRequest("/api/bridge/stats");
  }

  // Real-time Event Streaming
  async connectEventStream() {
    if (typeof EventSource === "undefined") {
      throw new Error("EventSource not supported in this environment");
    }

    const eventSource = new EventSource(
      `${this.config.baseUrl}/api/events/stream`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit("event", data);
      } catch (error) {
        console.error("Failed to parse event data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      this.emit("error", error);
    };

    return eventSource;
  }

  // WebSocket Connection
  async connectWebSocket() {
    try {
      const wsUrl = this.config.baseUrl.replace(/^http/, "ws") + "/ws";
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.emit("connected");

        // Authenticate if API key is available
        if (this.config.apiKey) {
          this.ws!.send(
            JSON.stringify({
              type: "authenticate",
              service: "auth",
              data: { token: this.config.apiKey },
              timestamp: new Date().toISOString(),
            }),
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit("message", message);
          this.emit(message.type, message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.emit("disconnected");
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };

      return this.ws;
    } catch (error) {
      throw new Error(`Failed to connect WebSocket: ${error}`);
    }
  }

  // Subscribe to real-time data
  subscribeToService(service: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    this.ws.send(
      JSON.stringify({
        type: "subscribe",
        service,
        data: { action: "subscribe" },
        timestamp: new Date().toISOString(),
      }),
    );
  }

  // Utility Methods
  async waitForScanCompletion(scanId: string, timeout = 300000): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const scan = await this.getScanStatus(scanId);
      if (scan.status === "completed" || scan.status === "failed") {
        return scan;
      }
      await this.sleep(2000);
    }
    throw new Error("Scan timeout");
  }

  async waitForAnalysisCompletion(
    analysisId: string,
    timeout = 300000,
  ): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const analysis = await this.getAnalysis(analysisId);
      if (analysis.status === "completed" || analysis.status === "failed") {
        return analysis;
      }
      await this.sleep(2000);
    }
    throw new Error("Analysis timeout");
  }

  async waitForSimulationCompletion(
    simulationId: string,
    timeout = 600000,
  ): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const simulation = await this.getSimulation(simulationId);
      if (simulation.status === "completed" || simulation.status === "failed") {
        return simulation;
      }
      await this.sleep(3000);
    }
    throw new Error("Simulation timeout");
  }

  // Event Management
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }

  // HTTP Request Helper
  private async makeRequest(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    } = {},
  ) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const { method = "GET", body, headers = {} } = options;

    const requestHeaders = {
      "Content-Type": "application/json",
      ...(this.config.apiKey && {
        Authorization: `Bearer ${this.config.apiKey}`,
      }),
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
    };

    let lastError: Error;

    for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout,
        );

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retryAttempts! - 1) {
          await this.sleep(1000 * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cleanup
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventListeners.clear();
  }
}

// Export convenience functions
export const createScorpiusClient = (config: ScorpiusConfig) =>
  new ScorpiusSDK(config);

// Example usage exports
export const examples = {
  async basicScan() {
    const client = new ScorpiusSDK({
      baseUrl: "http://localhost:3000",
      apiKey: "your-api-key",
    });

    // Start a security scan
    const scan = await client.startScan({
      contractAddress: "0x1234567890123456789012345678901234567890",
      scanTypes: ["slither", "mythril"],
      priority: "high",
      waitForCompletion: true,
    });

    console.log("Scan completed:", scan);
    return scan;
  },

  async realtimeMonitoring() {
    const client = new ScorpiusSDK({
      baseUrl: "http://localhost:3000",
      apiKey: "your-api-key",
    });

    // Connect to real-time updates
    await client.connectWebSocket();

    // Subscribe to scanner updates
    client.subscribeToService("scanner");
    client.subscribeToService("bridge");

    // Listen for events
    client.on("data_update", (message) => {
      console.log("Real-time update:", message);
    });

    // Connect to event stream
    const eventSource = await client.connectEventStream();
    client.on("event", (event) => {
      console.log("Blockchain event:", event);
    });
  },
};
