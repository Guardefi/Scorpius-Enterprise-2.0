import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { WalletGuardServiceApi, createWalletGuardServiceSDK } from './index';
import type { 
  HealthResponse, 
  WalletGuardScanRequest, 
  WalletGuardScanResponse, 
  UserResponse 
} from './endpoints';

describe('WalletGuardServiceEndpoints', () => {
  let sdk: ReturnType<typeof createWalletGuardServiceSDK>;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    sdk = createWalletGuardServiceSDK({
      baseURL: 'http://localhost:8080',
    });
    mockAxios = new MockAdapter(sdk.api.getClient());
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('getHealth', () => {
    it('should return health status successfully', async () => {
      const mockResponse: HealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockAxios.onGet('/health').reply(200, mockResponse);

      const result = await sdk.endpoints.getHealth();

      expect(result).toEqual(mockResponse);
      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe('/health');
    });

    it('should handle API errors', async () => {
      mockAxios.onGet('/health').reply(500, { error: 'Internal Server Error' });

      await expect(sdk.endpoints.getHealth()).rejects.toThrow('API Error: 500');
    });
  });

  describe('postWalletGuardScan', () => {
    it('should scan wallet successfully with valid request', async () => {
      const mockRequest: WalletGuardScanRequest = {
        walletAddress: '0x742d35Cc6543C00532C2e6B33433b0e5A9b913bE',
        scanType: 'basic',
      };

      const mockResponse: WalletGuardScanResponse = {
        scanId: 'scan-123',
        walletAddress: '0x742d35Cc6543C00532C2e6B33433b0e5A9b913bE',
        riskScore: 25,
        threats: [
          {
            type: 'suspicious_transaction',
            severity: 'medium',
            description: 'Detected suspicious transaction pattern',
          },
        ],
      };

      mockAxios.onPost('/wallet/guard/scan').reply(200, mockResponse);

      const result = await sdk.endpoints.postWalletGuardScan(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe('/wallet/guard/scan');
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(mockRequest);
    });

    it('should validate request body with zod schema', async () => {
      const invalidRequest = {
        walletAddress: '0x742d35Cc6543C00532C2e6B33433b0e5A9b913bE',
        scanType: 'invalid' as any, // Invalid scan type
      };

      await expect(sdk.endpoints.postWalletGuardScan(invalidRequest)).rejects.toThrow();
    });

    it('should use default scanType when not provided', async () => {
      const mockRequest: Partial<WalletGuardScanRequest> = {
        walletAddress: '0x742d35Cc6543C00532C2e6B33433b0e5A9b913bE',
      };

      const mockResponse: WalletGuardScanResponse = {
        scanId: 'scan-123',
        walletAddress: '0x742d35Cc6543C00532C2e6B33433b0e5A9b913bE',
        riskScore: 0,
        threats: [],
      };

      mockAxios.onPost('/wallet/guard/scan').reply(200, mockResponse);

      const result = await sdk.endpoints.postWalletGuardScan(mockRequest as WalletGuardScanRequest);

      expect(result).toEqual(mockResponse);
      const sentData = JSON.parse(mockAxios.history.post[0].data);
      expect(sentData.scanType).toBe('basic'); // Default value
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      const userId = 'user-123';
      const mockResponse: UserResponse = {
        id: userId,
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      mockAxios.onGet(`/user/${userId}`).reply(200, mockResponse);

      const result = await sdk.endpoints.getUserById(userId);

      expect(result).toEqual(mockResponse);
      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`/user/${userId}`);
    });

    it('should handle special characters in userId', async () => {
      const userId = 'user@domain.com';
      const encodedUserId = encodeURIComponent(userId);
      const mockResponse: UserResponse = {
        id: userId,
        email: 'user@domain.com',
        name: 'Jane Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      mockAxios.onGet(`/user/${encodedUserId}`).reply(200, mockResponse);

      const result = await sdk.endpoints.getUserById(userId);

      expect(result).toEqual(mockResponse);
      expect(mockAxios.history.get[0].url).toBe(`/user/${encodedUserId}`);
    });

    it('should handle 404 not found', async () => {
      const userId = 'nonexistent';
      mockAxios.onGet(`/user/${userId}`).reply(404, { error: 'User not found' });

      await expect(sdk.endpoints.getUserById(userId)).rejects.toThrow('API Error: 404');
    });
  });
});
