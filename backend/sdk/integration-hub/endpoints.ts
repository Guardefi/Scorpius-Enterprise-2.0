import { z } from 'zod';
import { IntegrationHubApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class IntegrationHubEndpoints {
  constructor(private api: IntegrationHubApi) {}

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
   * Get available integrations
   * GET /integrations
   */
  async getIntegrations(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/integrations`,
    });
    
    return response;
  }
  /**
   * Get active workflows
   * GET /workflows
   */
  async getWorkflows(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/workflows`,
    });
    
    return response;
  }
  /**
   * Create new workflow
   * POST /workflows
   */
  async postWorkflows(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/workflows`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Execute workflow
   * POST /workflows/{workflowId}/execute
   */
  async postWorkflowsWorkflowIdExecute(workflowId: string, requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/workflows/${encodeURIComponent(workflowId)}/execute`,
      data: requestBody,
    });
    
    return response;
  }
}