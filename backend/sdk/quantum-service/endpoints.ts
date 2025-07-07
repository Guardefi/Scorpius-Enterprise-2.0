import { z } from 'zod';
import { QuantumServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class QuantumServiceEndpoints {
  constructor(private api: QuantumServiceApi) {}

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
   * Generate quantum-resistant key pairs
   * POST /quantum/generate-keys
   */
  async postQuantumGenerateKeys(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/quantum/generate-keys`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Quantum-safe encryption
   * POST /quantum/encrypt
   */
  async postQuantumEncrypt(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/quantum/encrypt`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Quantum-safe decryption
   * POST /quantum/decrypt
   */
  async postQuantumDecrypt(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/quantum/decrypt`,
      data: requestBody,
    });
    
    return response;
  }
}