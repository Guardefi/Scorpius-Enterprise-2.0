// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { BytecodeServiceApi, createBytecodeServiceApi } from './api';
export { BytecodeServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, BytecodeServiceApi } from './api';
import { BytecodeServiceEndpoints } from './endpoints';

export interface BytecodeServiceSDK {
  api: BytecodeServiceApi;
  endpoints: BytecodeServiceEndpoints;
}

export const createBytecodeServiceSDK = (config?: ApiConfig): BytecodeServiceSDK => {
  const api = new BytecodeServiceApi(config);
  const endpoints = new BytecodeServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};