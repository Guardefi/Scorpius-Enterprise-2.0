// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { ScannerAiOrchestratorApi, createScannerAiOrchestratorApi } from './api';
export { ScannerAiOrchestratorEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, ScannerAiOrchestratorApi } from './api';
import { ScannerAiOrchestratorEndpoints } from './endpoints';

export interface ScannerAiOrchestratorSDK {
  api: ScannerAiOrchestratorApi;
  endpoints: ScannerAiOrchestratorEndpoints;
}

export const createScannerAiOrchestratorSDK = (config?: ApiConfig): ScannerAiOrchestratorSDK => {
  const api = new ScannerAiOrchestratorApi(config);
  const endpoints = new ScannerAiOrchestratorEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};