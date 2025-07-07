// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { BridgeServiceApi, createBridgeServiceApi } from './api';
export { BridgeServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, BridgeServiceApi } from './api';
import { BridgeServiceEndpoints } from './endpoints';

export interface BridgeServiceSDK {
  api: BridgeServiceApi;
  endpoints: BridgeServiceEndpoints;
}

export const createBridgeServiceSDK = (config?: ApiConfig): BridgeServiceSDK => {
  const api = new BridgeServiceApi(config);
  const endpoints = new BridgeServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};