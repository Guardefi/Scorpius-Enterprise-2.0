import { z } from 'zod';
import { ApiGatewayApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class ApiGatewayEndpoints {
  constructor(private api: ApiGatewayApi) {}

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
   * List all available services
   * GET /services
   */
  async getServices(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/services`,
    });
    
    return response;
  }
  /**
   * Route request to specific service
   * POST /route/{serviceName}
   */
  async postRouteServiceName(serviceName: string, requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/route/${encodeURIComponent(serviceName)}`,
      data: requestBody,
    });
    
    return response;
  }
}