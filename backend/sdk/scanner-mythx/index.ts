// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { ScannerMythxApi, createScannerMythxApi } from './api';
export { ScannerMythxEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, ScannerMythxApi } from './api';
import { ScannerMythxEndpoints } from './endpoints';

export interface ScannerMythxSDK {
  api: ScannerMythxApi;
  endpoints: ScannerMythxEndpoints;
}

export const createScannerMythxSDK = (config?: ApiConfig): ScannerMythxSDK => {
  const api = new ScannerMythxApi(config);
  const endpoints = new ScannerMythxEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};