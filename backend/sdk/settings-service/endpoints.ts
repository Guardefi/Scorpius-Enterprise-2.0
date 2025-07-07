import { z } from 'zod';
import { SettingsServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class SettingsServiceEndpoints {
  constructor(private api: SettingsServiceApi) {}

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
   * Get all settings
   * GET /settings
   */
  async getSettings(queryParams?: Record<string, any>): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/settings`,
      params: queryParams,
    });
    
    return response;
  }
  /**
   * Get specific setting
   * GET /settings/{key}
   */
  async getSettingsKey(key: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/settings/${encodeURIComponent(key)}`,
    });
    
    return response;
  }
  /**
   * Update setting
   * PUT /settings/{key}
   */
  async putSettingsKey(key: string, requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'PUT',
      url: `/settings/${encodeURIComponent(key)}`,
      data: requestBody,
    });
    
    return response;
  }
}