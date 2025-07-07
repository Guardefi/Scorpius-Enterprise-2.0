// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { QuantumServiceApi, createQuantumServiceApi } from './api';
export { QuantumServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, QuantumServiceApi } from './api';
import { QuantumServiceEndpoints } from './endpoints';

export interface QuantumServiceSDK {
  api: QuantumServiceApi;
  endpoints: QuantumServiceEndpoints;
}

export const createQuantumServiceSDK = (config?: ApiConfig): QuantumServiceSDK => {
  const api = new QuantumServiceApi(config);
  const endpoints = new QuantumServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};