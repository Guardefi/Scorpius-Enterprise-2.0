// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { IntegrationHubApi, createIntegrationHubApi } from './api';
export { IntegrationHubEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, IntegrationHubApi } from './api';
import { IntegrationHubEndpoints } from './endpoints';

export interface IntegrationHubSDK {
  api: IntegrationHubApi;
  endpoints: IntegrationHubEndpoints;
}

export const createIntegrationHubSDK = (config?: ApiConfig): IntegrationHubSDK => {
  const api = new IntegrationHubApi(config);
  const endpoints = new IntegrationHubEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};