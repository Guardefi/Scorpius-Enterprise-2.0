import { z } from 'zod';
import { WalletGuardServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class WalletGuardServiceEndpoints {
  constructor(private api: WalletGuardServiceApi) {}

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
   * Scan wallet for security threats
   * POST /wallet/guard/scan
   */
  async postWalletGuardScan(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/wallet/guard/scan`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get user by ID
   * GET /user/{userId}
   */
  async getUserById(userId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/user/${encodeURIComponent(userId)}`,
    });
    
    return response;
  }
}