// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { QuantumCryptoServiceApi, createQuantumCryptoServiceApi } from './api';
export { QuantumCryptoServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, QuantumCryptoServiceApi } from './api';
import { QuantumCryptoServiceEndpoints } from './endpoints';

export interface QuantumCryptoServiceSDK {
  api: QuantumCryptoServiceApi;
  endpoints: QuantumCryptoServiceEndpoints;
}

export const createQuantumCryptoServiceSDK = (config?: ApiConfig): QuantumCryptoServiceSDK => {
  const api = new QuantumCryptoServiceApi(config);
  const endpoints = new QuantumCryptoServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};