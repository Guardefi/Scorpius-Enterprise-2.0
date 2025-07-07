import { z } from 'zod';
import { MempoolServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class MempoolServiceEndpoints {
  constructor(private api: MempoolServiceApi) {}

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
   * Get pending transactions from mempool
   * GET /mempool/transactions
   */
  async getMempoolTransactions(queryParams?: Record<string, any>): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/mempool/transactions`,
      params: queryParams,
    });
    
    return response;
  }
  /**
   * Start monitoring specific addresses or contracts
   * POST /mempool/monitor
   */
  async postMempoolMonitor(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/mempool/monitor`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Analyze specific transaction
   * GET /mempool/analyze/{txHash}
   */
  async getMempoolAnalyzeTxHash(txHash: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/mempool/analyze/${encodeURIComponent(txHash)}`,
    });
    
    return response;
  }
}