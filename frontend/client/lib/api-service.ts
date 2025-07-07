import {
  ApiResponse,
  ScanRequest,
  ScanResponse,
  HoneypotAnalysisRequest,
  HoneypotAnalysisResponse,
  HistoricalQueryRequest,
  HistoricalQueryResponse,
  ForensicsAnalysisRequest,
  ForensicsAnalysisResponse,
  QuantumResistanceRequest,
  QuantumResistanceResponse,
  MempoolAnalysisResponse,
  ExploitReplayRequest,
  ExploitReplayResponse,
} from "@shared/api-types";
import {
  getBackendConfig,
  getApiEndpoints,
  createRequestInterceptor,
  checkBackendHealth,
  type BackendConfig,
  type BackendMode,
} from "@shared/backend-config";

/**
 * Enhanced API Service with Python Backend Integration
 * Supports multiple backend modes: Express, Python, Mock
 */
class ApiService {
  private config: BackendConfig;
  private endpoints: ReturnType<typeof getApiEndpoints>;
  private requestInterceptor: ReturnType<typeof createRequestInterceptor>;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isHealthy = false;

  constructor() {
    this.config = getBackendConfig();
    this.endpoints = getApiEndpoints();
    this.requestInterceptor = createRequestInterceptor(this.config);

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Health monitoring for backend connectivity
   */
  private startHealthMonitoring() {
    // Initial health check
    this.checkHealth();

    // Periodic health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth();
    }, 30000);
  }

  private async checkHealth() {
    try {
      this.isHealthy = await checkBackendHealth();

      // Emit health status event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api-health-change", {
            detail: {
              healthy: this.isHealthy,
              mode: this.config.mode,
              timestamp: new Date().toISOString(),
            },
          }),
        );
      }
    } catch (error) {
      this.isHealthy = false;
      console.warn("Health check failed:", error);
    }
  }

  /**
   * Get current backend information
   */
  getBackendInfo() {
    return {
      mode: this.config.mode,
      baseUrl: this.config.baseUrl,
      healthy: this.isHealthy,
      config: this.config,
    };
  }

  /**
   * Generic request method with retry logic and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    // For mock mode, return mock data
    if (this.config.mode === "mock") {
      return this.mockRequest<T>(endpoint, options);
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const requestOptions = this.requestInterceptor(endpoint, options);

        const response = await fetch(url, requestOptions);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message ||
              `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        // Update health status on successful request
        if (!this.isHealthy) {
          this.isHealthy = true;
          this.checkHealth();
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `API request failed (attempt ${attempt + 1}/${this.config.retryAttempts + 1}):`,
          error,
        );

        // Don't retry on certain errors
        if (error instanceof TypeError && error.message.includes("fetch")) {
          break; // Network error, don't retry
        }

        // Wait before retry
        if (attempt < this.config.retryAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay),
          );
        }
      }
    }

    // All retries failed
    this.isHealthy = false;
    throw lastError || new Error("All retry attempts failed");
  }

  /**
   * Mock request handler for testing
   */
  private async mockRequest<T>(
    endpoint: string,
    options: RequestInit,
  ): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 200),
    );

    // Simulate random errors (if enabled)
    if (
      this.config.mode === "mock" &&
      (this.config as any).enableRandomErrors &&
      Math.random() < 0.1
    ) {
      throw new Error("Mock network error");
    }

    // Return mock success response
    return {
      success: true,
      data: {} as T, // Mock implementations would provide real mock data
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== SCANNER API ====================

  async scanContract(request: ScanRequest): Promise<ApiResponse<ScanResponse>> {
    return this.request<ScanResponse>(this.endpoints.SCAN_CONTRACT, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getScanResults(scanId: string): Promise<ApiResponse<ScanResponse>> {
    return this.request<ScanResponse>(
      `${this.endpoints.GET_SCAN_RESULTS}/${scanId}`,
    );
  }

  async getScanHistory(): Promise<ApiResponse<ScanResponse[]>> {
    return this.request<ScanResponse[]>(this.endpoints.GET_SCAN_HISTORY);
  }

  async cancelScan(scanId: string): Promise<ApiResponse<void>> {
    // Only available in Python backend
    if (this.config.mode === "python") {
      return this.request<void>(
        `${(this.endpoints as any).CANCEL_SCAN}/${scanId}`,
        {
          method: "POST",
        },
      );
    }
    throw new Error("Cancel scan not supported in current backend mode");
  }

  // ==================== HONEYPOT API ====================

  async analyzeHoneypot(
    request: HoneypotAnalysisRequest,
  ): Promise<ApiResponse<HoneypotAnalysisResponse>> {
    return this.request<HoneypotAnalysisResponse>(
      this.endpoints.ANALYZE_HONEYPOT,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async getHoneypotResults(): Promise<ApiResponse<HoneypotAnalysisResponse[]>> {
    return this.request<HoneypotAnalysisResponse[]>(
      this.endpoints.GET_HONEYPOT_RESULTS,
    );
  }

  async getHoneypotAnalysis(
    analysisId: string,
  ): Promise<ApiResponse<HoneypotAnalysisResponse>> {
    // Only available in Python backend
    if (this.config.mode === "python") {
      return this.request<HoneypotAnalysisResponse>(
        `${(this.endpoints as any).GET_HONEYPOT_ANALYSIS}/${analysisId}`,
      );
    }

    // Fallback for Express backend
    const results = await this.getHoneypotResults();
    const analysis = results.data?.find((a) => a.id === analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    return {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== TIME MACHINE API ====================

  async executeHistoricalQuery(
    request: HistoricalQueryRequest,
  ): Promise<ApiResponse<HistoricalQueryResponse>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).HISTORICAL_QUERY
        : "/api/time-machine/query"; // Express fallback

    return this.request<HistoricalQueryResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getHistoricalData(): Promise<ApiResponse<HistoricalQueryResponse[]>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).GET_HISTORICAL_DATA
        : "/api/time-machine/history"; // Express fallback

    return this.request<HistoricalQueryResponse[]>(endpoint);
  }

  // ==================== EXPLOIT REPLAY API ====================

  async getExploits(): Promise<ApiResponse<any[]>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).GET_EXPLOITS
        : "/api/exploits/list"; // Express fallback

    return this.request<any[]>(endpoint);
  }

  async startExploitReplay(
    request: ExploitReplayRequest,
  ): Promise<ApiResponse<ExploitReplayResponse>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).START_REPLAY
        : "/api/exploits/replay/start"; // Express fallback

    return this.request<ExploitReplayResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async controlExploitReplay(
    action: string,
    data?: any,
  ): Promise<ApiResponse<ExploitReplayResponse>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).CONTROL_REPLAY
        : "/api/exploits/replay/control"; // Express fallback

    return this.request<ExploitReplayResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify({ action, data }),
    });
  }

  // ==================== FORENSICS API ====================

  async analyzeForensics(
    request: ForensicsAnalysisRequest,
  ): Promise<ApiResponse<ForensicsAnalysisResponse>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).ANALYZE_FORENSICS
        : "/api/forensics/analyze"; // Express fallback

    return this.request<ForensicsAnalysisResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getForensicsResults(): Promise<
    ApiResponse<ForensicsAnalysisResponse[]>
  > {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).GET_FORENSICS_RESULTS
        : "/api/forensics/results"; // Express fallback

    return this.request<ForensicsAnalysisResponse[]>(endpoint);
  }

  // ==================== MEMPOOL API ====================

  async getMempoolData(): Promise<ApiResponse<MempoolAnalysisResponse>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).GET_MEMPOOL_DATA
        : "/api/mempool/current"; // Express fallback

    return this.request<MempoolAnalysisResponse>(endpoint);
  }

  async analyzeMempoolTransactions(): Promise<
    ApiResponse<MempoolAnalysisResponse>
  > {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).MEMPOOL_ANALYSIS
        : "/api/mempool/analyze"; // Express fallback

    return this.request<MempoolAnalysisResponse>(endpoint, {
      method: "POST",
    });
  }

  // ==================== QUANTUM API ====================

  async analyzeQuantumResistance(
    request: QuantumResistanceRequest,
  ): Promise<ApiResponse<QuantumResistanceResponse>> {
    const endpoint =
      this.config.mode === "python"
        ? (this.endpoints as any).QUANTUM_ANALYSIS
        : "/api/quantum/analyze"; // Express fallback

    return this.request<QuantumResistanceResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ==================== MEV & BRIDGE APIs ====================
  // These are only available in Python backend

  async analyzeBridge(request: any): Promise<ApiResponse<any>> {
    if (this.config.mode !== "python") {
      throw new Error("Bridge analysis only available in Python backend");
    }

    return this.request<any>((this.endpoints as any).BRIDGE_ANALYSIS, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getBridgeOpportunities(): Promise<ApiResponse<any[]>> {
    if (this.config.mode !== "python") {
      throw new Error("Bridge opportunities only available in Python backend");
    }

    return this.request<any[]>((this.endpoints as any).BRIDGE_OPPORTUNITIES);
  }

  async getMEVOpportunities(): Promise<ApiResponse<any[]>> {
    if (this.config.mode !== "python") {
      throw new Error("MEV opportunities only available in Python backend");
    }

    return this.request<any[]>((this.endpoints as any).MEV_OPPORTUNITIES);
  }

  async analyzeMEV(request: any): Promise<ApiResponse<any>> {
    if (this.config.mode !== "python") {
      throw new Error("MEV analysis only available in Python backend");
    }

    return this.request<any>((this.endpoints as any).MEV_ANALYSIS, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ==================== WEBSOCKET ====================

  createWebSocketConnection(): WebSocket {
    const wsUrl = `${this.config.wsUrl}${this.endpoints.WEBSOCKET}`;
    return new WebSocket(wsUrl);
  }

  // ==================== CLEANUP ====================

  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types and utilities
export type { BackendMode };
export { getBackendConfig, checkBackendHealth };
