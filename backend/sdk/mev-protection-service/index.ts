// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { MevProtectionServiceApi, createMevProtectionServiceApi } from './api';
export { MevProtectionServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, MevProtectionServiceApi } from './api';
import { MevProtectionServiceEndpoints } from './endpoints';

export interface MevProtectionServiceSDK {
  api: MevProtectionServiceApi;
  endpoints: MevProtectionServiceEndpoints;
}

export const createMevProtectionServiceSDK = (config?: ApiConfig): MevProtectionServiceSDK => {
  const api = new MevProtectionServiceApi(config);
  const endpoints = new MevProtectionServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};