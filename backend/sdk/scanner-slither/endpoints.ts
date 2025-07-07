import { z } from 'zod';
import { ScannerSlitherApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class ScannerSlitherEndpoints {
  constructor(private api: ScannerSlitherApi) {}

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
   * Analyze Solidity code with Slither
   * POST /scan/slither
   */
  async postScanSlither(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/scan/slither`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get Slither scan results
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
   * Get available Slither detectors
   * GET /scan/detectors
   */
  async getScanDetectors(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/scan/detectors`,
    });
    
    return response;
  }
  /**
   * Get available Slither printers
   * GET /scan/printers
   */
  async getScanPrinters(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/scan/printers`,
    });
    
    return response;
  }
}