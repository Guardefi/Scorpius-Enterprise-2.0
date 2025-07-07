// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { MevBotServiceApi, createMevBotServiceApi } from './api';
export { MevBotServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, MevBotServiceApi } from './api';
import { MevBotServiceEndpoints } from './endpoints';

export interface MevBotServiceSDK {
  api: MevBotServiceApi;
  endpoints: MevBotServiceEndpoints;
}

export const createMevBotServiceSDK = (config?: ApiConfig): MevBotServiceSDK => {
  const api = new MevBotServiceApi(config);
  const endpoints = new MevBotServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};