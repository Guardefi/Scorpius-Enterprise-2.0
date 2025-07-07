import { z } from 'zod';
import { BridgeServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class BridgeServiceEndpoints {
  constructor(private api: BridgeServiceApi) {}

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
   * Get supported chains
   * GET /bridge/chains
   */
  async getBridgeChains(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/bridge/chains`,
    });
    
    return response;
  }
  /**
   * Estimate bridge transfer cost
   * POST /bridge/estimate
   */
  async postBridgeEstimate(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/bridge/estimate`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Execute bridge transfer
   * POST /bridge/transfer
   */
  async postBridgeTransfer(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/bridge/transfer`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get transfer status
   * GET /bridge/status/{transferId}
   */
  async getBridgeStatusTransferId(transferId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/bridge/status/${encodeURIComponent(transferId)}`,
    });
    
    return response;
  }
}