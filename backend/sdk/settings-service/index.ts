// Re-export everything from the SDK
export * from './api';
export * from './endpoints';

// Convenience export for easy instantiation
export { SettingsServiceApi, createSettingsServiceApi } from './api';
export { SettingsServiceEndpoints } from './endpoints';

// Create a factory function for the complete SDK
import { ApiConfig, SettingsServiceApi } from './api';
import { SettingsServiceEndpoints } from './endpoints';

export interface SettingsServiceSDK {
  api: SettingsServiceApi;
  endpoints: SettingsServiceEndpoints;
}

export const createSettingsServiceSDK = (config?: ApiConfig): SettingsServiceSDK => {
  const api = new SettingsServiceApi(config);
  const endpoints = new SettingsServiceEndpoints(api);
  
  return {
    api,
    endpoints,
  };
};