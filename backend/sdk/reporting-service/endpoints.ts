import { z } from 'zod';
import { ReportingServiceApi } from './api';

// Basic schemas (extend these based on your OpenAPI spec)
export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
});

// Type exports
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Endpoint functions
export class ReportingServiceEndpoints {
  constructor(private api: ReportingServiceApi) {}

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
   * Get available reports
   * GET /reports
   */
  async getReports(queryParams?: Record<string, any>): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/reports`,
      params: queryParams,
    });
    
    return response;
  }
  /**
   * Generate new report
   * POST /reports/generate
   */
  async postReportsGenerate(requestBody: any): Promise<any> {
    const response = await this.api.request<any>({
      method: 'POST',
      url: `/reports/generate`,
      data: requestBody,
    });
    
    return response;
  }
  /**
   * Get specific report
   * GET /reports/{reportId}
   */
  async getReportsReportId(reportId: string): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/reports/${encodeURIComponent(reportId)}`,
    });
    
    return response;
  }
  /**
   * Get dashboard analytics data
   * GET /analytics/dashboard
   */
  async getAnalyticsDashboard(): Promise<any> {
    const response = await this.api.request<any>({
      method: 'GET',
      url: `/analytics/dashboard`,
    });
    
    return response;
  }
}