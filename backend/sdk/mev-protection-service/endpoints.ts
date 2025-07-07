import { z } from 'zod';
import { MevProtectionServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class MevProtectionServiceEndpoints {
  constructor(private api: MevProtectionServiceApi) {}

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
   * Analyze transaction for MEV risks
   * POST /protection/analyze
   */
  async postProtectionAnalyze(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/protection/analyze`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Apply MEV protection to transaction
   * POST /protection/shield
   */
  async postProtectionShield(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/protection/shield`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get available protection strategies
   * GET /protection/strategies
   */
  async getProtectionStrategies(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/protection/strategies`,
    });
    
    return response;
  }
}