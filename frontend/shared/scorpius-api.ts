/**
 * Comprehensive Scorpius API Integration
 * Complete frontend-backend integration for all services
 */

import { API_ENDPOINTS } from './api-types';

// ============================================================================
// CORE API CLIENT
// ============================================================================

export class ScorpiusAPI {
  private baseUrl: string;
  private token: string | null = null;
  private wsConnection: WebSocket | null = null;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      this.setAuthToken(response.access_token);
    }
    
    return response;
  }

  async register(userData: { email: string; password: string; name: string }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const response = await this.request('/api/auth/logout', { method: 'POST' });
    this.token = null;
    return response;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // ============================================================================
  // SCANNER SERVICE - Complete Integration
  // ============================================================================

  async scanContract(contractData: {
    address?: string;
    bytecode?: string;
    source_code?: string;
    engines?: string[];
  }) {
    return this.request('/api/scanner/scan', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async getScanResult(scanId: string) {
    return this.request(`/api/scanner/scan/${scanId}`);
  }

  async listScans(filters?: { status?: string; date_from?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/scanner/scans?${params}`);
  }

  async batchScan(contracts: Array<{ address: string; name?: string }>) {
    return this.request('/api/scanner/batch', {
      method: 'POST',
      body: JSON.stringify({ contracts }),
    });
  }

  async getVulnerabilities(filters?: { severity?: string; type?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/scanner/vulnerabilities?${params}`);
  }

  async listScanEngines() {
    return this.request('/api/scanner/engines');
  }

  async configureScanEngine(engine: string, config: any) {
    return this.request(`/api/scanner/engines/${engine}/configure`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // ============================================================================
  // REPORTING SERVICE - Complete Integration
  // ============================================================================

  async generateReport(reportData: {
    template_id?: string;
    format: string;
    data: any;
  }) {
    return this.request('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getReport(reportId: string) {
    return this.request(`/api/reports/${reportId}`);
  }

  async listReports(filters?: { format?: string; date_from?: string; date_to?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/reports?${params}`);
  }

  async exportReport(reportId: string) {
    return this.request(`/api/reports/export/${reportId}`);
  }

  async createReportTemplate(template: {
    name: string;
    description: string;
    format: string;
    fields: string[];
  }) {
    return this.request('/api/reports/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async listReportTemplates() {
    return this.request('/api/reports/templates');
  }

  async getReportTemplate(templateId: string) {
    return this.request(`/api/reports/templates/${templateId}`);
  }

  async updateReportTemplate(templateId: string, template: any) {
    return this.request(`/api/reports/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteReportTemplate(templateId: string) {
    return this.request(`/api/reports/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  async generatePdfReport(data: any) {
    return this.request('/api/reports/formats/pdf', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateExcelReport(data: any) {
    return this.request('/api/reports/formats/excel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCsvReport(data: any) {
    return this.request('/api/reports/formats/csv', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scheduleReport(schedule: {
    template_id: string;
    cron_expression: string;
    recipients: string[];
  }) {
    return this.request('/api/reports/schedule', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  async listScheduledReports() {
    return this.request('/api/reports/scheduled');
  }

  async cancelScheduledReport(scheduleId: string) {
    return this.request(`/api/reports/scheduled/${scheduleId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // QUANTUM SERVICE - Complete Integration
  // ============================================================================

  async quantumAnalyze(data: { algorithm: string; parameters: any }) {
    return this.request('/api/quantum/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getQuantumAnalysis(analysisId: string) {
    return this.request(`/api/quantum/analysis/${analysisId}`);
  }

  async quantumSimulate(simulation: { type: string; parameters: any }) {
    return this.request('/api/quantum/simulate', {
      method: 'POST',
      body: JSON.stringify(simulation),
    });
  }

  async getQuantumMetrics() {
    return this.request('/api/quantum/metrics');
  }

  async testQuantumResistance(cryptoData: { algorithm: string; key: string }) {
    return this.request('/api/quantum/resistance/test', {
      method: 'POST',
      body: JSON.stringify(cryptoData),
    });
  }

  async listQuantumAlgorithms() {
    return this.request('/api/quantum/algorithms');
  }

  // ============================================================================
  // AI FORENSICS SERVICE - Complete Integration
  // ============================================================================

  async analyzeForensics(data: { transaction_hash?: string; address?: string; data: any }) {
    return this.request('/api/forensics/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvestigation(caseId: string) {
    return this.request(`/api/forensics/investigation/${caseId}`);
  }

  async predictAttack(data: { patterns: any[]; context: any }) {
    return this.request('/api/forensics/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createForensicsCase(caseData: {
    title: string;
    description: string;
    status: string;
  }) {
    return this.request('/api/forensics/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async listForensicsCases(filters?: { status?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/forensics/cases?${params}`);
  }

  async addEvidence(evidence: {
    case_id: string;
    type: string;
    data: any;
  }) {
    return this.request('/api/forensics/evidence', {
      method: 'POST',
      body: JSON.stringify(evidence),
    });
  }

  async getAttackPatterns() {
    return this.request('/api/forensics/patterns');
  }

  async trainForensicsModel(trainingData: { dataset: any; parameters: any }) {
    return this.request('/api/forensics/ml/train', {
      method: 'POST',
      body: JSON.stringify(trainingData),
    });
  }

  async listForensicsModels() {
    return this.request('/api/forensics/ml/models');
  }

  // ============================================================================
  // MEV PROTECTION & BOT - Complete Integration
  // ============================================================================

  async protectTransaction(txData: { transaction: any; protection_level: string }) {
    return this.request('/api/mev/protect', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
  }

  async getMevProtectionStatus(txHash: string) {
    return this.request(`/api/mev/status/${txHash}`);
  }

  async getMevStrategies() {
    return this.request('/api/mev/strategies');
  }

  async analyzeMevRisk(data: { transaction: any; context: any }) {
    return this.request('/api/mev/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMevStrategy(strategy: { name: string; type: string; parameters: any }) {
    return this.request('/api/mevbot/strategy', {
      method: 'POST',
      body: JSON.stringify(strategy),
    });
  }

  async getMevOpportunities(filters?: { min_profit?: number; max_risk?: number }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/mevbot/opportunities?${params}`);
  }

  async executeMevStrategy(execution: { strategy_id: string; parameters: any }) {
    return this.request('/api/mevbot/execute', {
      method: 'POST',
      body: JSON.stringify(execution),
    });
  }

  async getMevPerformance(timeframe?: string) {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request(`/api/mevbot/performance${params}`);
  }

  async backtestMevStrategy(backtest: { strategy: any; historical_data: any }) {
    return this.request('/api/mevbot/backtest', {
      method: 'POST',
      body: JSON.stringify(backtest),
    });
  }

  // ============================================================================
  // WALLET GUARD - Complete Integration
  // ============================================================================

  async analyzeWallet(address: string) {
    return this.request('/api/wallet/analyze', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  async getWalletRisk(address: string) {
    return this.request(`/api/wallet/risk/${address}`);
  }

  async monitorWallet(data: { address: string; alerts: string[] }) {
    return this.request('/api/wallet/monitor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWalletAlerts(filters?: { severity?: string; status?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/wallet/alerts?${params}`);
  }

  async addToWhitelist(address: string, reason?: string) {
    return this.request('/api/wallet/whitelist', {
      method: 'POST',
      body: JSON.stringify({ address, reason }),
    });
  }

  async getWhitelist() {
    return this.request('/api/wallet/whitelist');
  }

  async addToBlacklist(address: string, reason: string) {
    return this.request('/api/wallet/blacklist', {
      method: 'POST',
      body: JSON.stringify({ address, reason }),
    });
  }

  async getWalletTransactions(address: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/api/wallet/transactions/${address}${params}`);
  }

  // ============================================================================
  // HONEYPOT SERVICE - Complete Integration
  // ============================================================================

  async checkHoneypot(contractData: { address: string; method?: string }) {
    return this.request('/api/honeypot/check', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async getHoneypotReport(contractAddress: string) {
    return this.request(`/api/honeypot/report/${contractAddress}`);
  }

  async getHoneypotStats() {
    return this.request('/api/honeypot/statistics');
  }

  async deployHoneypot(config: { type: string; parameters: any }) {
    return this.request('/api/honeypot/deploy', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async listDeployedHoneypots() {
    return this.request('/api/honeypot/deployed');
  }

  async createHoneypotPattern(pattern: { name: string; signature: string; description: string }) {
    return this.request('/api/honeypot/patterns', {
      method: 'POST',
      body: JSON.stringify(pattern),
    });
  }

  async getHoneypotPatterns() {
    return this.request('/api/honeypot/patterns');
  }

  // ============================================================================
  // MEMPOOL SERVICE - Complete Integration
  // ============================================================================

  async getMempoolTransactions(filters?: { type?: string; limit?: number }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/mempool/transactions?${params}`);
  }

  async monitorMempool(config: { filters: any; alerts: string[] }) {
    return this.request('/api/mempool/monitor', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getMempoolAnalysis() {
    return this.request('/api/mempool/analysis');
  }

  async getMempoolStream() {
    return this.request('/api/mempool/stream');
  }

  async createMempoolFilter(filter: { name: string; conditions: any }) {
    return this.request('/api/mempool/filters', {
      method: 'POST',
      body: JSON.stringify(filter),
    });
  }

  async listMempoolFilters() {
    return this.request('/api/mempool/filters');
  }

  async getGasTracker() {
    return this.request('/api/mempool/gas/tracker');
  }

  async getPendingTransaction(txHash: string) {
    return this.request(`/api/mempool/pending/${txHash}`);
  }

  // ============================================================================
  // BYTECODE SERVICE - Complete Integration
  // ============================================================================

  async analyzeBytecode(data: { bytecode: string; address?: string }) {
    return this.request('/api/bytecode/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async decompileBytecode(contractAddress: string) {
    return this.request(`/api/bytecode/decompile/${contractAddress}`);
  }

  async compareBytecode(data: { bytecode1: string; bytecode2: string }) {
    return this.request('/api/bytecode/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disassembleBytecode(data: { bytecode: string }) {
    return this.request('/api/bytecode/disassemble', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeOpcodes(data: { opcodes: string[] }) {
    return this.request('/api/bytecode/opcodes/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBytecodePatterns() {
    return this.request('/api/bytecode/patterns');
  }

  async checkBytecodeSimilarity(data: { bytecode: string; threshold?: number }) {
    return this.request('/api/bytecode/similarity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // SIMULATION SERVICE - Complete Integration
  // ============================================================================

  async runSimulation(simulation: { type: string; parameters: any; environment?: string }) {
    return this.request('/api/simulation/run', {
      method: 'POST',
      body: JSON.stringify(simulation),
    });
  }

  async getSimulationResult(simulationId: string) {
    return this.request(`/api/simulation/result/${simulationId}`);
  }

  async createFork(forkData: { network: string; block_number?: number }) {
    return this.request('/api/simulation/fork', {
      method: 'POST',
      body: JSON.stringify(forkData),
    });
  }

  async getSimulationScenarios() {
    return this.request('/api/simulation/scenarios');
  }

  async createSimulationScenario(scenario: { name: string; description: string; steps: any[] }) {
    return this.request('/api/simulation/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
  }

  async runBatchSimulation(simulations: any[]) {
    return this.request('/api/simulation/batch', {
      method: 'POST',
      body: JSON.stringify({ simulations }),
    });
  }

  async listSimulationEnvironments() {
    return this.request('/api/simulation/environments');
  }

  async runStressTest(config: { target: string; duration: number; concurrent_users: number }) {
    return this.request('/api/simulation/stress-test', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // ============================================================================
  // TIME MACHINE SERVICE - Complete Integration
  // ============================================================================

  async createSnapshot(data: { block_number?: number; description?: string }) {
    return this.request('/api/timemachine/snapshot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHistoricalState(blockNumber: number) {
    return this.request(`/api/timemachine/state/${blockNumber}`);
  }

  async replayTransaction(data: { tx_hash: string; block_number?: number }) {
    return this.request('/api/timemachine/replay', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listSnapshots() {
    return this.request('/api/timemachine/snapshots');
  }

  async compareStates(data: { block1: number; block2: number; address?: string }) {
    return this.request('/api/timemachine/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAddressTimeline(address: string) {
    return this.request(`/api/timemachine/timeline/${address}`);
  }

  async restoreState(data: { snapshot_id: string; target_block?: number }) {
    return this.request('/api/timemachine/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // EXPLOIT TESTING SERVICE - Complete Integration
  // ============================================================================

  async testExploit(data: { target: string; exploit_type: string; parameters: any }) {
    return this.request('/api/exploit/test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExploitVectors() {
    return this.request('/api/exploit/vectors');
  }

  async simulateExploit(data: { vector_id: string; target: string; parameters: any }) {
    return this.request('/api/exploit/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createExploitVector(vector: { name: string; description: string; payload: any }) {
    return this.request('/api/exploit/vectors', {
      method: 'POST',
      body: JSON.stringify(vector),
    });
  }

  async getExploitPayloads() {
    return this.request('/api/exploit/payloads');
  }

  async runFuzzingTest(config: { target: string; duration: number; patterns: string[] }) {
    return this.request('/api/exploit/fuzzing', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getExploitTestResults(testId: string) {
    return this.request(`/api/exploit/results/${testId}`);
  }

  // ============================================================================
  // BRIDGE SERVICE - Complete Integration
  // ============================================================================

  async bridgeTransfer(data: { from_chain: string; to_chain: string; token: string; amount: string }) {
    return this.request('/api/bridge/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBridgeStatus(transferId: string) {
    return this.request(`/api/bridge/status/${transferId}`);
  }

  async getBridgeRoutes() {
    return this.request('/api/bridge/routes');
  }

  async getBridgeFees() {
    return this.request('/api/bridge/fees');
  }

  async validateBridgeTransfer(data: { from_chain: string; to_chain: string; amount: string }) {
    return this.request('/api/bridge/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBridgeHistory(address: string) {
    return this.request(`/api/bridge/history/${address}`);
  }

  async getSupportedTokens() {
    return this.request('/api/bridge/supported-tokens');
  }

  // ============================================================================
  // QUANTUM CRYPTO SERVICE - Complete Integration
  // ============================================================================

  async quantumEncrypt(data: { plaintext: string; algorithm: string; key?: string }) {
    return this.request('/api/quantumcrypto/encrypt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async quantumDecrypt(data: { ciphertext: string; algorithm: string; key: string }) {
    return this.request('/api/quantumcrypto/decrypt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateQuantumKey(data: { algorithm: string; key_size?: number }) {
    return this.request('/api/quantumcrypto/keygen', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async quantumSign(data: { message: string; private_key: string; algorithm: string }) {
    return this.request('/api/quantumcrypto/sign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async quantumVerify(data: { message: string; signature: string; public_key: string; algorithm: string }) {
    return this.request('/api/quantumcrypto/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listQuantumCryptoAlgorithms() {
    return this.request('/api/quantumcrypto/algorithms');
  }

  async quantumKeyExchange(data: { algorithm: string; public_key: string }) {
    return this.request('/api/quantumcrypto/key-exchange', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // SETTINGS SERVICE - Complete Integration
  // ============================================================================

  async getUserSettings(userId: string) {
    return this.request(`/api/settings/user/${userId}`);
  }

  async updateUserSettings(userId: string, settings: any) {
    return this.request(`/api/settings/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getGlobalSettings() {
    return this.request('/api/settings/global');
  }

  async updateGlobalSettings(settings: any) {
    return this.request('/api/settings/global', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getThemes() {
    return this.request('/api/settings/themes');
  }

  async backupSettings(userId: string) {
    return this.request('/api/settings/backup', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async restoreSettings(backupData: any) {
    return this.request('/api/settings/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  }

  // ============================================================================
  // DASHBOARD SERVICE - Complete Integration
  // ============================================================================

  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }

  async getDashboardActivity(timeframe?: string) {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request(`/api/dashboard/activity${params}`);
  }

  async getDashboardAnalytics() {
    return this.request('/api/dashboard/analytics');
  }

  async createDashboardWidget(widget: { type: string; config: any; position: any }) {
    return this.request('/api/dashboard/widgets', {
      method: 'POST',
      body: JSON.stringify(widget),
    });
  }

  async getDashboardWidgets() {
    return this.request('/api/dashboard/widgets');
  }

  async updateDashboardWidget(widgetId: string, updates: any) {
    return this.request(`/api/dashboard/widgets/${widgetId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDashboardWidget(widgetId: string) {
    return this.request(`/api/dashboard/widgets/${widgetId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // MONITORING SERVICE - Complete Integration
  // ============================================================================

  async getMonitoringMetrics(service?: string) {
    const params = service ? `?service=${service}` : '';
    return this.request(`/api/monitoring/metrics${params}`);
  }

  async createMonitoringAlert(alert: { name: string; condition: string; actions: any[] }) {
    return this.request('/api/monitoring/alert', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  async getMonitoringLogs(filters?: { level?: string; service?: string; limit?: number }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/monitoring/logs?${params}`);
  }

  async listMonitoringAlerts() {
    return this.request('/api/monitoring/alerts');
  }

  async updateMonitoringAlert(alertId: string, updates: any) {
    return this.request(`/api/monitoring/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMonitoringAlert(alertId: string) {
    return this.request(`/api/monitoring/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  async getSystemHealth() {
    return this.request('/api/monitoring/health');
  }

  // ============================================================================
  // INTEGRATION HUB - Complete Integration
  // ============================================================================

  async getConnectors() {
    return this.request('/api/integration/connectors');
  }

  async connectIntegration(data: { connector_id: string; config: any }) {
    return this.request('/api/integration/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIntegrationStatus(integrationId: string) {
    return this.request(`/api/integration/status/${integrationId}`);
  }

  async createWebhook(webhook: { url: string; events: string[]; secret?: string }) {
    return this.request('/api/integration/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  }

  async listWebhooks() {
    return this.request('/api/integration/webhooks');
  }

  async createApiKey(keyData: { name: string; permissions: string[]; expires_at?: string }) {
    return this.request('/api/integration/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData),
    });
  }

  async listApiKeys() {
    return this.request('/api/integration/api-keys');
  }

  async revokeApiKey(keyId: string) {
    return this.request(`/api/integration/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // WEBSOCKET CONNECTION
  // ============================================================================

  connectWebSocket(onMessage?: (event: MessageEvent) => void) {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('WebSocket connected');
    };

    this.wsConnection.onmessage = (event) => {
      if (onMessage) {
        onMessage(event);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return this.wsConnection;
  }

  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  sendWebSocketMessage(message: any) {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    }
  }
}

// Export singleton instance
export const scorpiusAPI = new ScorpiusAPI();
export default scorpiusAPI;