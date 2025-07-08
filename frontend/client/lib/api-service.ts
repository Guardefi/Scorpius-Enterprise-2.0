/**
 * Unified API Service
 * Central service that integrates all backend APIs
 */

import { scorpiusAPI } from '../../shared/scorpius-api';
import { dashboardAPI } from '../../shared/dashboard-api';

export class APIService {
  // Core API instance
  public core = scorpiusAPI;
  
  // Dashboard-specific API
  public dashboard = dashboardAPI;

  constructor() {
    // Initialize with environment-specific base URL
    const baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.core = new (scorpiusAPI.constructor as any)(baseUrl);
    this.dashboard = new (dashboardAPI.constructor as any)();
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.core.login(email, password);
    if (response.access_token) {
      localStorage.setItem('scorpius_token', response.access_token);
    }
    return response;
  }

  async logout() {
    const response = await this.core.logout();
    localStorage.removeItem('scorpius_token');
    return response;
  }

  // Initialize authentication from stored token
  initializeAuth() {
    const token = localStorage.getItem('scorpius_token');
    if (token) {
      this.core.setAuthToken(token);
    }
  }

  // Health check for all services
  async healthCheck() {
    try {
      const response = await this.core.request('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Batch operations
  async batchScanContracts(addresses: string[]) {
    const contracts = addresses.map(address => ({ address }));
    return this.core.batchScan(contracts);
  }

  async batchAnalyzeWallets(addresses: string[]) {
    const promises = addresses.map(address => this.core.analyzeWallet(address));
    return Promise.all(promises);
  }

  // Real-time data subscriptions
  subscribeToUpdates(callback: (data: any) => void) {
    return this.core.connectWebSocket((event) => {
      const data = JSON.parse(event.data);
      callback(data);
    });
  }

  // Export functionality
  async exportData(type: string, format: string, filters?: any) {
    switch (type) {
      case 'scan_results':
        return this.core.generateCsvReport({ type: 'scan_results', filters });
      case 'vulnerabilities':
        return this.core.generateExcelReport({ type: 'vulnerabilities', filters });
      case 'forensics':
        return this.core.generatePdfReport({ type: 'forensics', filters });
      default:
        throw new Error(`Unknown export type: ${type}`);
    }
  }

  // Notification helpers
  async sendAlert(type: 'telegram' | 'slack', config: any, message: string) {
    if (type === 'telegram') {
      return this.dashboard.sendTelegramNotification(config.chatId, message);
    } else if (type === 'slack') {
      return this.dashboard.sendSlackNotification(config.channel, message);
    }
    throw new Error(`Unknown notification type: ${type}`);
  }

  // Analytics aggregation
  async getComprehensiveAnalytics(timeframe: string = '24h') {
    const [
      scanStats,
      quantumMetrics,
      bridgeActivity,
      systemHealth
    ] = await Promise.all([
      this.dashboard.getAnalyticsOverview(),
      this.core.getQuantumMetrics(),
      this.dashboard.getBridgeMonitor(''),
      this.dashboard.getComputingStatus()
    ]);

    return {
      scans: scanStats,
      quantum: quantumMetrics,
      bridge: bridgeActivity,
      system: systemHealth,
      timestamp: new Date().toISOString()
    };
  }

  // Search functionality
  async searchContracts(query: string, filters?: any) {
    // This would integrate with a search service
    return this.core.request(`/api/search/contracts?q=${encodeURIComponent(query)}`, {
      method: 'POST',
      body: JSON.stringify(filters || {})
    });
  }

  // Bulk operations
  async bulkOperation(operation: string, targets: string[], options?: any) {
    const batchSize = 10; // Process in batches to avoid overwhelming the backend
    const results = [];

    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);
      const batchPromises = batch.map(target => {
        switch (operation) {
          case 'scan':
            return this.core.scanContract({ address: target, ...options });
          case 'analyze_wallet':
            return this.core.analyzeWallet(target);
          case 'check_honeypot':
            return this.core.checkHoneypot({ address: target });
          default:
            throw new Error(`Unknown bulk operation: ${operation}`);
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  // Configuration management
  async updateConfiguration(service: string, config: any) {
    return this.core.request(`/api/config/${service}`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  async getConfiguration(service: string) {
    return this.core.request(`/api/config/${service}`);
  }

  // Service status monitoring
  async getServiceStatus() {
    return this.core.request('/api/status/services');
  }

  // Data synchronization
  async syncData(services: string[] = []) {
    const syncPromises = services.map(service => 
      this.core.request(`/api/sync/${service}`, { method: 'POST' })
    );
    return Promise.all(syncPromises);
  }

  // Cache management
  async clearCache(type?: string) {
    const endpoint = type ? `/api/cache/clear/${type}` : '/api/cache/clear';
    return this.core.request(endpoint, { method: 'DELETE' });
  }

  // Performance monitoring
  async getPerformanceMetrics() {
    return this.core.request('/api/metrics/performance');
  }

  // Error reporting
  async reportError(error: any, context?: any) {
    return this.core.request('/api/errors/report', {
      method: 'POST',
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    });
  }
}

// Export singleton instance
export const apiService = new APIService();

// Initialize authentication on module load
apiService.initializeAuth();

export default apiService;