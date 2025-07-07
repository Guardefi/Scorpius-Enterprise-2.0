// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { ReportingServiceApi, createReportingServiceApi } from './api';
export { ReportingServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, ReportingServiceApi } from './api';
import { ReportingServiceEndpoints } from './endpoints';

export interface ReportingServiceSDK {
  api: ReportingServiceApi;
  endpoints: ReportingServiceEndpoints;
}

export const createReportingServiceSDK = (config?: ApiConfig): ReportingServiceSDK => {
  const api = new ReportingServiceApi(config);
  const endpoints = new ReportingServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};