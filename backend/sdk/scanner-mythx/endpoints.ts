import { z } from 'zod';
import { ScannerMythxApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class ScannerMythxEndpoints {
  constructor(private api: ScannerMythxApi) {}

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
   * Submit analysis to MythX platform
   * POST /mythx/analyze
   */
  async postMythxAnalyze(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/mythx/analyze`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get MythX analysis results
   * GET /mythx/results/{analysisId}
   */
  async getMythxResultsAnalysisId(analysisId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/mythx/results/${encodeURIComponent(analysisId)}`,
    });
    
    return response;
  }
  /**
   * Get analysis status
   * GET /mythx/status/{analysisId}
   */
  async getMythxStatusAnalysisId(analysisId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/mythx/status/${encodeURIComponent(analysisId)}`,
    });
    
    return response;
  }
  /**
   * Get MythX API quota information
   * GET /mythx/quota
   */
  async getMythxQuota(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/mythx/quota`,
    });
    
    return response;
  }
}