import { z } from 'zod';
import { HoneypotServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class HoneypotServiceEndpoints {
  constructor(private api: HoneypotServiceApi) {}

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
   * Get active honeypots
   * GET /honeypots
   */
  async getHoneypots(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/honeypots`,
    });
    
    return response;
  }
  /**
   * Deploy new honeypot
   * POST /honeypots
   */
  async postHoneypots(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/honeypots`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get honeypot interactions
   * GET /honeypots/{honeypotId}/interactions
   */
  async getHoneypotsHoneypotIdInteractions(honeypotId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/honeypots/${encodeURIComponent(honeypotId)}/interactions`,
    });
    
    return response;
  }
}