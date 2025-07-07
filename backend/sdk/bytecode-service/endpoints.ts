import { z } from 'zod';
import { BytecodeServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class BytecodeServiceEndpoints {
  constructor(private api: BytecodeServiceApi) {}

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
   * Analyze smart contract bytecode
   * POST /bytecode/analyze
   */
  async postBytecodeAnalyze(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/bytecode/analyze`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Decompile bytecode to readable format
   * POST /bytecode/decompile
   */
  async postBytecodeDecompile(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/bytecode/decompile`,
      data: requestBody,
    });
    
    return response;
  }
}