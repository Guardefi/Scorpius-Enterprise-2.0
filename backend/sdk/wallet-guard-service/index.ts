// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { WalletGuardServiceApi, createWalletGuardServiceApi } from './api';
export { WalletGuardServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, WalletGuardServiceApi } from './api';
import { WalletGuardServiceEndpoints } from './endpoints';

export interface WalletGuardServiceSDK {
  api: WalletGuardServiceApi;
  endpoints: WalletGuardServiceEndpoints;
}

export const createWalletGuardServiceSDK = (config?: ApiConfig): WalletGuardServiceSDK => {
  const api = new WalletGuardServiceApi(config);
  const endpoints = new WalletGuardServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};