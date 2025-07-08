/**
 * Dashboard-specific API integration
 * Connects all dashboard widgets to backend services
 */

import { scorpiusAPI } from './scorpius-api';

export class DashboardAPI {
  // ============================================================================
  // CORE DASHBOARD ENDPOINTS
  // ============================================================================

  // Static Scanner Summary
  async getStaticScanSummary(address: string) {
    return scorpiusAPI.request(`/api/v1/static-scan?address=${address}`);
  }

  // Bytecode Lab Quick-Peek
  async getBytecodeLabPeek(address: string) {
    return scorpiusAPI.request(`/api/v1/bytecode-lab/${address}`);
  }

  // Simulation Engine Dashboard
  async getSimulations(status?: string) {
    const params = status ? `?status=${status}` : '';
    return scorpiusAPI.request(`/api/v1/simulations${params}`);
  }

  async createSimulation(data: { txHash: string; blockNumber: number; scriptName: string }) {
    return scorpiusAPI.request('/api/v1/simulations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cross-Chain Bridge Monitor
  async getBridgeMonitor(address: string) {
    return scorpiusAPI.request(`/api/v1/bridge-monitor?address=${address}`);
  }

  // Exploit Rehearsal Kit Launcher
  async launchExploitRehearsal(data: { targetAddress: string; scriptName: string; capitalEth: number }) {
    return scorpiusAPI.request('/api/v1/exploit-rehearsal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Time Machine Cards
  async getTimeMachineCards(limit: number = 10) {
    return scorpiusAPI.request(`/api/v1/time-machine/cards?limit=${limit}`);
  }

  // ============================================================================
  // NOTIFICATION ENDPOINTS
  // ============================================================================

  // Telegram Notifications
  async sendTelegramNotification(chatId: string, message: string) {
    return scorpiusAPI.request('/api/v1/notifications/telegram', {
      method: 'POST',
      body: JSON.stringify({ chatId, message }),
    });
  }

  // Slack Notifications
  async sendSlackNotification(channel: string, text: string) {
    return scorpiusAPI.request('/api/v1/notifications/slack', {
      method: 'POST',
      body: JSON.stringify({ channel, text }),
    });
  }

  // ============================================================================
  // INFRASTRUCTURE / UTILITY ENDPOINTS
  // ============================================================================

  // Computing Page
  async getComputingStatus() {
    return scorpiusAPI.request('/api/v1/computing/status');
  }

  async getComputingJobs() {
    return scorpiusAPI.request('/api/v1/computing/jobs');
  }

  // Analytics Page
  async getAnalyticsOverview() {
    return scorpiusAPI.request('/api/v1/analytics/overview');
  }

  async getAnalyticsDetail(metric: string, from: string, to: string) {
    return scorpiusAPI.request(`/api/v1/analytics/detail?metric=${metric}&from=${from}&to=${to}`);
  }

  // Grafana Dashboard Page
  async getGrafanaDashboard(name: string) {
    return scorpiusAPI.request(`/api/v1/grafana/dashboard?name=${name}`);
  }

  // ============================================================================
  // QUANTUM PAGE ENDPOINTS
  // ============================================================================

  // Key Inventory
  async getQuantumKeys() {
    return scorpiusAPI.request('/api/v1/quantum/keys');
  }

  // Key Detail
  async getQuantumKey(keyId: string) {
    return scorpiusAPI.request(`/api/v1/quantum/keys/${keyId}`);
  }

  // Re-Test Key
  async retestQuantumKey(keyId: string) {
    return scorpiusAPI.request(`/api/v1/quantum/keys/${keyId}/retest`, {
      method: 'POST',
    });
  }

  // Migration Tasks List
  async getQuantumMigrationTasks() {
    return scorpiusAPI.request('/api/v1/quantum/migration/tasks');
  }

  // Create Migration Task
  async createQuantumMigrationTask(task: any) {
    return scorpiusAPI.request('/api/v1/quantum/migration/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  // Generate PQC Key
  async generatePQCKey(spec: any) {
    return scorpiusAPI.request('/api/v1/quantum/keys/generate', {
      method: 'POST',
      body: JSON.stringify(spec),
    });
  }

  // Threat Forecast
  async getQuantumThreatForecast() {
    return scorpiusAPI.request('/api/v1/quantum/forecast');
  }

  // Vendor Feed
  async getQuantumVendorFeed() {
    return scorpiusAPI.request('/api/v1/quantum/vendor-feed');
  }

  // TLS Cert Scanner
  async scanTLSCerts(domain: string) {
    return scorpiusAPI.request(`/api/v1/quantum/certs?domain=${domain}`);
  }

  // Mempool Heatmap Data
  async getQuantumHeatmapData() {
    return scorpiusAPI.request('/api/v1/quantum/heatmap');
  }

  // Alerts List
  async getQuantumAlerts() {
    return scorpiusAPI.request('/api/v1/quantum/alerts');
  }

  // Create Alert
  async createQuantumAlert(config: any) {
    return scorpiusAPI.request('/api/v1/quantum/alerts', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Export Compliance Report
  async exportQuantumComplianceReport(format: 'pdf' | 'csv' = 'pdf') {
    return scorpiusAPI.request(`/api/v1/quantum/compliance-report?format=${format}`);
  }

  // ============================================================================
  // HONEYPOT PAGE ENDPOINTS
  // ============================================================================

  // Honeypot Summary
  async getHoneypotSummary(address: string) {
    return scorpiusAPI.request(`/api/v1/honeypot/summary?address=${address}`);
  }

  // Multi-Method Detection
  async detectHoneypot(address: string, methods: string[]) {
    return scorpiusAPI.request('/api/v1/honeypot/detect', {
      method: 'POST',
      body: JSON.stringify({ address, methods }),
    });
  }

  // Simulation Log
  async getHoneypotSimulations(address: string) {
    return scorpiusAPI.request(`/api/v1/honeypot/simulations?address=${address}`);
  }

  // Liquidity Snapshot
  async getHoneypotLiquiditySnapshot(address: string) {
    return scorpiusAPI.request(`/api/v1/honeypot/liquidity-snapshot?address=${address}`);
  }

  // Bytecode Diff
  async getHoneypotBytecodeDiff(address: string) {
    return scorpiusAPI.request(`/api/v1/honeypot/bytecode-diff?address=${address}`);
  }

  // Community Reputation
  async getHoneypotReputation(address: string) {
    return scorpiusAPI.request(`/api/v1/honeypot/reputation?address=${address}`);
  }

  // Watchlist
  async getHoneypotWatchlist() {
    return scorpiusAPI.request('/api/v1/honeypot/watchlist');
  }

  async addToHoneypotWatchlist(address: string) {
    return scorpiusAPI.request('/api/v1/honeypot/watchlist', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  async removeFromHoneypotWatchlist(address: string) {
    return scorpiusAPI.request(`/api/v1/honeypot/watchlist/${address}`, {
      method: 'DELETE',
    });
  }

  // Export Results
  async exportHoneypotResults(address: string, format: 'json' | 'csv' = 'json') {
    return scorpiusAPI.request(`/api/v1/honeypot/export?address=${address}&format=${format}`);
  }
}

// Export singleton instance
export const dashboardAPI = new DashboardAPI();
export default dashboardAPI;