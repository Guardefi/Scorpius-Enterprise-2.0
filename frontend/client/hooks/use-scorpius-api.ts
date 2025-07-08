/**
 * React hooks for Scorpius API integration
 * Provides easy-to-use hooks for all backend services
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { scorpiusAPI } from '../../shared/scorpius-api';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await scorpiusAPI.login(email, password);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await scorpiusAPI.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const register = useCallback(async (userData: { email: string; password: string; name: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await scorpiusAPI.register(userData);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await scorpiusAPI.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // User not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, error, login, logout, register };
}

// ============================================================================
// SCANNER HOOKS
// ============================================================================

export function useScanner() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scanContract = useCallback(async (contractData: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scorpiusAPI.scanContract(contractData);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getScanResult = useCallback(async (scanId: string) => {
    try {
      const result = await scorpiusAPI.getScanResult(scanId);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const listScans = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      const results = await scorpiusAPI.listScans(filters);
      setScans(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const batchScan = useCallback(async (contracts: any[]) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.batchScan(contracts);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scans,
    loading,
    error,
    scanContract,
    getScanResult,
    listScans,
    batchScan
  };
}

// ============================================================================
// REPORTING HOOKS
// ============================================================================

export function useReporting() {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = useCallback(async (reportData: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scorpiusAPI.generateReport(reportData);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listReports = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      const results = await scorpiusAPI.listReports(filters);
      setReports(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listReportTemplates = useCallback(async () => {
    try {
      const results = await scorpiusAPI.listReportTemplates();
      setTemplates(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createReportTemplate = useCallback(async (template: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.createReportTemplate(template);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePdfReport = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.generatePdfReport(data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateExcelReport = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.generateExcelReport(data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReport = useCallback(async (schedule: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.scheduleReport(schedule);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    templates,
    loading,
    error,
    generateReport,
    listReports,
    listReportTemplates,
    createReportTemplate,
    generatePdfReport,
    generateExcelReport,
    scheduleReport
  };
}

// ============================================================================
// QUANTUM HOOKS
// ============================================================================

export function useQuantum() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const quantumAnalyze = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scorpiusAPI.quantumAnalyze(data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testQuantumResistance = useCallback(async (cryptoData: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.testQuantumResistance(cryptoData);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listQuantumAlgorithms = useCallback(async () => {
    try {
      const result = await scorpiusAPI.listQuantumAlgorithms();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    analyses,
    loading,
    error,
    quantumAnalyze,
    testQuantumResistance,
    listQuantumAlgorithms
  };
}

// ============================================================================
// FORENSICS HOOKS
// ============================================================================

export function useForensics() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeForensics = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scorpiusAPI.analyzeForensics(data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createForensicsCase = useCallback(async (caseData: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.createForensicsCase(caseData);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listForensicsCases = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      const results = await scorpiusAPI.listForensicsCases(filters);
      setCases(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const predictAttack = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.predictAttack(data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cases,
    loading,
    error,
    analyzeForensics,
    createForensicsCase,
    listForensicsCases,
    predictAttack
  };
}

// ============================================================================
// MEV HOOKS
// ============================================================================

export function useMEV() {
  const [strategies, setStrategies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const protectTransaction = useCallback(async (txData: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scorpiusAPI.protectTransaction(txData);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMevStrategy = useCallback(async (strategy: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.createMevStrategy(strategy);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMevOpportunities = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      const results = await scorpiusAPI.getMevOpportunities(filters);
      setOpportunities(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeMevStrategy = useCallback(async (execution: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.executeMevStrategy(execution);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMevPerformance = useCallback(async (timeframe?: string) => {
    try {
      const result = await scorpiusAPI.getMevPerformance(timeframe);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    strategies,
    opportunities,
    loading,
    error,
    protectTransaction,
    createMevStrategy,
    getMevOpportunities,
    executeMevStrategy,
    getMevPerformance
  };
}

// ============================================================================
// WALLET GUARD HOOKS
// ============================================================================

export function useWalletGuard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeWallet = useCallback(async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scorpiusAPI.analyzeWallet(address);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWalletRisk = useCallback(async (address: string) => {
    try {
      const result = await scorpiusAPI.getWalletRisk(address);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const monitorWallet = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.monitorWallet(data);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWalletAlerts = useCallback(async (filters?: any) => {
    try {
      const results = await scorpiusAPI.getWalletAlerts(filters);
      setAlerts(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    alerts,
    loading,
    error,
    analyzeWallet,
    getWalletRisk,
    monitorWallet,
    getWalletAlerts
  };
}

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.getDashboardStats();
      setStats(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboardWidgets = useCallback(async () => {
    try {
      const results = await scorpiusAPI.getDashboardWidgets();
      setWidgets(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createDashboardWidget = useCallback(async (widget: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.createDashboardWidget(widget);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    widgets,
    loading,
    error,
    getDashboardStats,
    getDashboardWidgets,
    createDashboardWidget
  };
}

// ============================================================================
// WEBSOCKET HOOK
// ============================================================================

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((onMessage?: (event: MessageEvent) => void) => {
    const ws = scorpiusAPI.connectWebSocket((event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      if (onMessage) {
        onMessage(event);
      }
    });

    if (ws) {
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
    }

    return ws;
  }, []);

  const disconnect = useCallback(() => {
    scorpiusAPI.disconnectWebSocket();
    setConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    scorpiusAPI.sendWebSocketMessage(message);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    messages,
    connect,
    disconnect,
    sendMessage
  };
}

// ============================================================================
// MONITORING HOOKS
// ============================================================================

export function useMonitoring() {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMonitoringMetrics = useCallback(async (service?: string) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.getMonitoringMetrics(service);
      setMetrics(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemHealth = useCallback(async () => {
    try {
      const result = await scorpiusAPI.getSystemHealth();
      setHealth(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createMonitoringAlert = useCallback(async (alert: any) => {
    try {
      setLoading(true);
      const result = await scorpiusAPI.createMonitoringAlert(alert);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    metrics,
    alerts,
    health,
    loading,
    error,
    getMonitoringMetrics,
    getSystemHealth,
    createMonitoringAlert
  };
}

// Export all hooks
export {
  useAuth,
  useScanner,
  useReporting,
  useQuantum,
  useForensics,
  useMEV,
  useWalletGuard,
  useDashboard,
  useWebSocket,
  useMonitoring
};