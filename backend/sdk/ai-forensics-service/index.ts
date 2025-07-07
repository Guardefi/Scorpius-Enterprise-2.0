// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { AiForensicsServiceApi, createAiForensicsServiceApi } from './api';
export { AiForensicsServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, AiForensicsServiceApi } from './api';
import { AiForensicsServiceEndpoints } from './endpoints';

export interface AiForensicsServiceSDK {
  api: AiForensicsServiceApi;
  endpoints: AiForensicsServiceEndpoints;
}

export const createAiForensicsServiceSDK = (config?: ApiConfig): AiForensicsServiceSDK => {
  const api = new AiForensicsServiceApi(config);
  const endpoints = new AiForensicsServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};