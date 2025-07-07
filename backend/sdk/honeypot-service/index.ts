// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { HoneypotServiceApi, createHoneypotServiceApi } from './api';
export { HoneypotServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, HoneypotServiceApi } from './api';
import { HoneypotServiceEndpoints } from './endpoints';

export interface HoneypotServiceSDK {
  api: HoneypotServiceApi;
  endpoints: HoneypotServiceEndpoints;
}

export const createHoneypotServiceSDK = (config?: ApiConfig): HoneypotServiceSDK => {
  const api = new HoneypotServiceApi(config);
  const endpoints = new HoneypotServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};