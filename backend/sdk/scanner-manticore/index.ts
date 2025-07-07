// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { ScannerManticoreApi, createScannerManticoreApi } from './api';
export { ScannerManticoreEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, ScannerManticoreApi } from './api';
import { ScannerManticoreEndpoints } from './endpoints';

export interface ScannerManticoreSDK {
  api: ScannerManticoreApi;
  endpoints: ScannerManticoreEndpoints;
}

export const createScannerManticoreSDK = (config?: ApiConfig): ScannerManticoreSDK => {
  const api = new ScannerManticoreApi(config);
  const endpoints = new ScannerManticoreEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};