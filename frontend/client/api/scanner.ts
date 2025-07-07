/**
 * Scanner API service for SCORPIUS frontend
 */
import { authAPI } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ScanRequest {
  contractAddress: string;
  contractCode?: string;
  plugins: string[];
}

export interface Vulnerability {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

export interface ScanResponse {
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

class ScannerAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = authAPI.getAccessToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && {
          Authorization: `Bearer ${accessToken}`,
        }),
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      console.error("Scanner API request failed:", error);
      throw error;
    }
  }

  async startScan(scanRequest: ScanRequest): Promise<ScanResponse> {
    return this.makeRequest<ScanResponse>("/api/scanner/scan", {
      method: "POST",
      body: JSON.stringify(scanRequest),
    });
  }

  async getScanResults(scanId: string): Promise<ScanResponse> {
    return this.makeRequest<ScanResponse>(`/api/scanner/results/${scanId}`);
  }

  async getScanHistory(): Promise<ScanResponse[]> {
    return this.makeRequest<ScanResponse[]>("/api/scanner/history");
  }
}

export const scannerAPI = new ScannerAPI();
