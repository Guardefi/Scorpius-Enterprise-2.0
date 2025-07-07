import { z } from 'zod';
import { MevBotServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class MevBotServiceEndpoints {
  constructor(private api: MevBotServiceApi) {}

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
   * Get available MEV opportunities
   * GET /mev/opportunities
   */
  async getMevOpportunities(queryParams?: Record<string, any>): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/mev/opportunities`,
      params: queryParams,
    });
    
    return response;
  }
  /**
   * Execute MEV opportunity
   * POST /mev/execute
   */
  async postMevExecute(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/mev/execute`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get active MEV strategies
   * GET /mev/strategies
   */
  async getMevStrategies(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/mev/strategies`,
    });
    
    return response;
  }
}