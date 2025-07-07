import { z } from 'zod';
import { AiForensicsServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class AiForensicsServiceEndpoints {
  constructor(private api: AiForensicsServiceApi) {}

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
   * Analyze address for suspicious activity
   * GET /forensics/analyze/address/{address}
   */
  async getForensicsAnalyzeAddressAddress(address: string, queryParams?: Record<string, any>): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/forensics/analyze/address/${encodeURIComponent(address)}`,
      params: queryParams,
    });
    
    return response;
  }
  /**
   * Trace funds flow between addresses
   * POST /forensics/trace
   */
  async postForensicsTrace(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/forensics/trace`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get known suspicious patterns
   * GET /forensics/patterns
   */
  async getForensicsPatterns(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/forensics/patterns`,
    });
    
    return response;
  }
}