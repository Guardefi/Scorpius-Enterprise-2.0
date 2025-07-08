/**
 * Dashboard-specific React hooks
 * Provides hooks for all dashboard widgets and components
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../../shared/dashboard-api';

// ============================================================================
// SCANNER DASHBOARD HOOKS
// ============================================================================

export function useStaticScan(address?: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScan = useCallback(async (addr: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getStaticScanSummary(addr);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchScan(address);
    }
  }, [address, fetchScan]);

  return { data, loading, error, refetch: fetchScan };
}

export function useBytecodeLab(address?: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBytecode = useCallback(async (addr: string) => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getBytecodeLabPeek(addr);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchBytecode(address);
    }
  }, [address, fetchBytecode]);

  return { data, loading, error, refetch: fetchBytecode };
}

// ============================================================================
// SIMULATION HOOKS
// ============================================================================

export function useSimulations(status?: string) {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSimulations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getSimulations(status);
      setSimulations(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [status]);

  const createSimulation = useCallback(async (data: any) => {
    try {
      setLoading(true);
      const result = await dashboardAPI.createSimulation(data);
      await fetchSimulations(); // Refresh list
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSimulations]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  return { simulations, loading, error, createSimulation, refetch: fetchSimulations };
}

// ============================================================================
// BRIDGE MONITOR HOOKS
// ============================================================================

export function useBridgeMonitor(address?: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBridgeData = useCallback(async (addr: string) => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getBridgeMonitor(addr);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchBridgeData(address);
    }
  }, [address, fetchBridgeData]);

  return { data, loading, error, refetch: fetchBridgeData };
}

// ============================================================================
// TIME MACHINE HOOKS
// ============================================================================

export function useTimeMachineCards(limit: number = 10) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getTimeMachineCards(limit);
      setCards(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, loading, error, refetch: fetchCards };
}

// ============================================================================
// QUANTUM HOOKS
// ============================================================================

export function useQuantumKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getQuantumKeys();
      setKeys(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const retestKey = useCallback(async (keyId: string) => {
    try {
      setLoading(true);
      const result = await dashboardAPI.retestQuantumKey(keyId);
      await fetchKeys(); // Refresh list
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKeys]);

  const generateKey = useCallback(async (spec: any) => {
    try {
      setLoading(true);
      const result = await dashboardAPI.generatePQCKey(spec);
      await fetchKeys(); // Refresh list
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKeys]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return { keys, loading, error, retestKey, generateKey, refetch: fetchKeys };
}

export function useQuantumThreatForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getQuantumThreatForecast();
      setForecast(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return { forecast, loading, error, refetch: fetchForecast };
}

export function useQuantumHeatmap() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHeatmap = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getQuantumHeatmapData();
      setHeatmapData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  return { heatmapData, loading, error, refetch: fetchHeatmap };
}

// ============================================================================
// HONEYPOT HOOKS
// ============================================================================

export function useHoneypotAnalysis(address?: string) {
  const [summary, setSummary] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeHoneypot = useCallback(async (addr: string, methods: string[] = ['pattern_analysis']) => {
    try {
      setLoading(true);
      setError(null);
      
      const [summaryResult, detectResult, simResult, repResult] = await Promise.all([
        dashboardAPI.getHoneypotSummary(addr),
        dashboardAPI.detectHoneypot(addr, methods),
        dashboardAPI.getHoneypotSimulations(addr),
        dashboardAPI.getHoneypotReputation(addr)
      ]);

      setSummary(summaryResult);
      setSimulations(simResult);
      setReputation(repResult);
      
      return { summary: summaryResult, detection: detectResult, simulations: simResult, reputation: repResult };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      analyzeHoneypot(address);
    }
  }, [address, analyzeHoneypot]);

  return { summary, simulations, reputation, loading, error, analyzeHoneypot };
}

export function useHoneypotWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getHoneypotWatchlist();
      setWatchlist(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWatchlist = useCallback(async (address: string) => {
    try {
      setLoading(true);
      await dashboardAPI.addToHoneypotWatchlist(address);
      await fetchWatchlist(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (address: string) => {
    try {
      setLoading(true);
      await dashboardAPI.removeFromHoneypotWatchlist(address);
      await fetchWatchlist(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWatchlist]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return { watchlist, loading, error, addToWatchlist, removeFromWatchlist, refetch: fetchWatchlist };
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useAnalytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getAnalyticsOverview();
      setOverview(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (metric: string, from: string, to: string) => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getAnalyticsDetail(metric, from, to);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, fetchDetail, refetch: fetchOverview };
}

// ============================================================================
// COMPUTING HOOKS
// ============================================================================

export function useComputing() {
  const [status, setStatus] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getComputingStatus();
      setStatus(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getComputingJobs();
      setJobs(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchJobs();
  }, [fetchStatus, fetchJobs]);

  return { status, jobs, loading, error, refetchStatus: fetchStatus, refetchJobs: fetchJobs };
}

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

export function useNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendTelegram = useCallback(async (chatId: string, message: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.sendTelegramNotification(chatId, message);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendSlack = useCallback(async (channel: string, text: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.sendSlackNotification(channel, text);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, sendTelegram, sendSlack };
}

// Export all hooks
export {
  useStaticScan,
  useBytecodeLab,
  useSimulations,
  useBridgeMonitor,
  useTimeMachineCards,
  useQuantumKeys,
  useQuantumThreatForecast,
  useQuantumHeatmap,
  useHoneypotAnalysis,
  useHoneypotWatchlist,
  useAnalytics,
  useComputing,
  useNotifications
};