import { z } from 'zod';
import { SimulationServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class SimulationServiceEndpoints {
  constructor(private api: SimulationServiceApi) {}

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
   * Run transaction simulation
   * POST /simulation/run
   */
  async postSimulationRun(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/simulation/run`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get available simulation environments
   * GET /simulation/environments
   */
  async getSimulationEnvironments(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/simulation/environments`,
    });
    
    return response;
  }
  /**
   * Create blockchain fork for testing
   * POST /simulation/fork
   */
  async postSimulationFork(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/simulation/fork`,
      data: requestBody,
    });
    
    return response;
  }
}