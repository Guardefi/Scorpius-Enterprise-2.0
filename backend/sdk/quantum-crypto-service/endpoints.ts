import { z } from 'zod';
import { QuantumCryptoServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class QuantumCryptoServiceEndpoints {
  constructor(private api: QuantumCryptoServiceApi) {}

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
   * Generate quantum-resistant key pair
   * POST /quantum/keys/generate
   */
  async postQuantumKeysGenerate(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/quantum/keys/generate`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Encrypt data with quantum-resistant algorithm
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
   * Decrypt quantum-encrypted data
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
  /**
   * Get supported quantum algorithms
   * GET /quantum/algorithms
   */
  async getQuantumAlgorithms(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/quantum/algorithms`,
    });
    
    return response;
  }
}