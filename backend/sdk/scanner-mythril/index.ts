// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { ScannerMythrilApi, createScannerMythrilApi } from './api';
export { ScannerMythrilEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, ScannerMythrilApi } from './api';
import { ScannerMythrilEndpoints } from './endpoints';

export interface ScannerMythrilSDK {
  api: ScannerMythrilApi;
  endpoints: ScannerMythrilEndpoints;
}

export const createScannerMythrilSDK = (config?: ApiConfig): ScannerMythrilSDK => {
  const api = new ScannerMythrilApi(config);
  const endpoints = new ScannerMythrilEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};