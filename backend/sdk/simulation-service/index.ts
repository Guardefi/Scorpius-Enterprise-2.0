// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { SimulationServiceApi, createSimulationServiceApi } from './api';
export { SimulationServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, SimulationServiceApi } from './api';
import { SimulationServiceEndpoints } from './endpoints';

export interface SimulationServiceSDK {
  api: SimulationServiceApi;
  endpoints: SimulationServiceEndpoints;
}

export const createSimulationServiceSDK = (config?: ApiConfig): SimulationServiceSDK => {
  const api = new SimulationServiceApi(config);
  const endpoints = new SimulationServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};