import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class HoneypotServiceApi {
  private readonly client: AxiosInstance;

  constructor(config: ApiConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || 'http://localhost:8013',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const createHoneypotServiceApi = (config?: ApiConfig) => {
  return new HoneypotServiceApi(config);
};