import { z } from 'zod';
import { ScannerAiOrchestratorApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class ScannerAiOrchestratorEndpoints {
  constructor(private api: ScannerAiOrchestratorApi) {}

  /**
   * Health check endpoint
   * GET /health
   */
  async getHealth(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/health`,
    });
    
    return response;
  }
  /**
   * Orchestrate comprehensive security scan
   * POST /scan/orchestrate
   */
  async postScanOrchestrate(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/scan/orchestrate`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get aggregated scan results
   * GET /scan/results/{scanId}
   */
  async getScanResultsScanId(scanId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/scan/results/${encodeURIComponent(scanId)}`,
    });
    
    return response;
  }
  /**
   * Get available scanners
   * GET /scanners
   */
  async getScanners(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/scanners`,
    });
    
    return response;
  }
}