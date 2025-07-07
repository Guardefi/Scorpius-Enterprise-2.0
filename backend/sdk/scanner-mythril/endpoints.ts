import { z } from 'zod';
import { ScannerMythrilApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class ScannerMythrilEndpoints {
  constructor(private api: ScannerMythrilApi) {}

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
   * Analyze smart contract with Mythril
   * POST /scan/mythril
   */
  async postScanMythril(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/scan/mythril`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get Mythril scan results
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
   * Get supported vulnerability patterns
   * GET /scan/patterns
   */
  async getScanPatterns(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/scan/patterns`,
    });
    
    return response;
  }
}