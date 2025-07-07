// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { MempoolServiceApi, createMempoolServiceApi } from './api';
export { MempoolServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, MempoolServiceApi } from './api';
import { MempoolServiceEndpoints } from './endpoints';

export interface MempoolServiceSDK {
  api: MempoolServiceApi;
  endpoints: MempoolServiceEndpoints;
}

export const createMempoolServiceSDK = (config?: ApiConfig): MempoolServiceSDK => {
  const api = new MempoolServiceApi(config);
  const endpoints = new MempoolServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};