// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { ApiGatewayApi, createApiGatewayApi } from './api';
export { ApiGatewayEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, ApiGatewayApi } from './api';
import { ApiGatewayEndpoints } from './endpoints';

export interface ApiGatewaySDK {
  api: ApiGatewayApi;
  endpoints: ApiGatewayEndpoints;
}

export const createApiGatewaySDK = (config?: ApiConfig): ApiGatewaySDK => {
  const api = new ApiGatewayApi(config);
  const endpoints = new ApiGatewayEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};