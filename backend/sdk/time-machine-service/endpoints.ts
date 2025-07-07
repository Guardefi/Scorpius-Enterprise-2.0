import { z } from 'zod';
import { TimeMachineServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class TimeMachineServiceEndpoints {
  constructor(private api: TimeMachineServiceApi) {}

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
   * Get historical block data
   * GET /historical/block/{blockNumber}
   */
  async getHistoricalBlockBlockNumber(blockNumber: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/historical/block/${encodeURIComponent(blockNumber)}`,
    });
    
    return response;
  }
  /**
   * Get state at specific block
   * POST /historical/state
   */
  async postHistoricalState(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/historical/state`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get transaction execution trace
   * GET /trace/transaction/{txHash}
   */
  async getTraceTransactionTxHash(txHash: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/trace/transaction/${encodeURIComponent(txHash)}`,
    });
    
    return response;
  }
}