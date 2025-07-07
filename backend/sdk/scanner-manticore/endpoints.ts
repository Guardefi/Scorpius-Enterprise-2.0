import { z } from 'zod';
import { ScannerManticoreApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class ScannerManticoreEndpoints {
  constructor(private api: ScannerManticoreApi) {}

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
   * Perform symbolic execution analysis
   * POST /scan/symbolic
   */
  async postScanSymbolic(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/scan/symbolic`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get symbolic execution results
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
   * Get execution states from symbolic analysis
   * GET /scan/states/{scanId}
   */
  async getScanStatesScanId(scanId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/scan/states/${encodeURIComponent(scanId)}`,
    });
    
    return response;
  }
}