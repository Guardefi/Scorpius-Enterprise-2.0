// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { TimeMachineServiceApi, createTimeMachineServiceApi } from './api';
export { TimeMachineServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, TimeMachineServiceApi } from './api';
import { TimeMachineServiceEndpoints } from './endpoints';

export interface TimeMachineServiceSDK {
  api: TimeMachineServiceApi;
  endpoints: TimeMachineServiceEndpoints;
}

export const createTimeMachineServiceSDK = (config?: ApiConfig): TimeMachineServiceSDK => {
  const api = new TimeMachineServiceApi(config);
  const endpoints = new TimeMachineServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};