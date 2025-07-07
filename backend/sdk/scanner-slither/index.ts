// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { ScannerSlitherApi, createScannerSlitherApi } from './api';
export { ScannerSlitherEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, ScannerSlitherApi } from './api';
import { ScannerSlitherEndpoints } from './endpoints';

export interface ScannerSlitherSDK {
  api: ScannerSlitherApi;
  endpoints: ScannerSlitherEndpoints;
}

export const createScannerSlitherSDK = (config?: ApiConfig): ScannerSlitherSDK => {
  const api = new ScannerSlitherApi(config);
  const endpoints = new ScannerSlitherEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};