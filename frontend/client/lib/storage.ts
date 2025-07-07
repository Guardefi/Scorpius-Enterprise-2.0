/**
 * Storage Manager for persisting application data
 * Handles localStorage operations with proper error handling
 */

export interface ScanData {
  id: string;
  contractAddress: string;
  timestamp: string;
  findings: number;
  riskScore: number;
}

export interface SystemStats {
  totalScans: number;
  totalVulnerabilities: number;
  lastScanDate: string | null;
  scanHistory: ScanData[];
}

export interface ReportStats {
  totalReports: number;
  reportsToday: number;
  totalDownloads: number;
  averageGenerationTime: number;
  lastReportDate: string | null;
}

export class StorageManager {
  private static readonly STORAGE_KEYS = {
    SCAN_COUNT: "scorpius_scan_count",
    SYSTEM_STATS: "scorpius_system_stats",
    USER_PREFERENCES: "scorpius_user_preferences",
    SIMULATION_HISTORY: "scorpius_simulation_history",
    REPORT_STATS: "scorpius_report_stats",
  };

  /**
   * Get system statistics
   */
  static getSystemStats(): SystemStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SYSTEM_STATS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load system stats:", error);
    }

    // Return default stats
    return {
      totalScans: 0,
      totalVulnerabilities: 0,
      lastScanDate: null,
      scanHistory: [],
    };
  }

  /**
   * Update system statistics
   */
  static setSystemStats(stats: SystemStats): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.SYSTEM_STATS,
        JSON.stringify(stats),
      );
    } catch (error) {
      console.error("Failed to save system stats:", error);
    }
  }

  /**
   * Increment scan count and update stats
   */
  static incrementScanCount(scanData: ScanData): void {
    const stats = this.getSystemStats();

    stats.totalScans += 1;
    stats.totalVulnerabilities += scanData.findings;
    stats.lastScanDate = scanData.timestamp;
    stats.scanHistory.unshift(scanData);

    // Keep only last 50 scans
    if (stats.scanHistory.length > 50) {
      stats.scanHistory = stats.scanHistory.slice(0, 50);
    }

    this.setSystemStats(stats);
  }

  /**
   * Get scan count
   */
  static getScanCount(): number {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SCAN_COUNT);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.warn("Failed to load scan count:", error);
      return 0;
    }
  }

  /**
   * Set scan count
   */
  static setScanCount(count: number): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SCAN_COUNT, count.toString());
    } catch (error) {
      console.error("Failed to save scan count:", error);
    }
  }

  /**
   * Get user preferences
   */
  static getUserPreferences(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn("Failed to load user preferences:", error);
      return {};
    }
  }

  /**
   * Set user preferences
   */
  static setUserPreferences(preferences: Record<string, any>): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences),
      );
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  }

  /**
   * Get simulation history
   */
  static getSimulationHistory(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SIMULATION_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load simulation history:", error);
      return [];
    }
  }

  /**
   * Set simulation history
   */
  static setSimulationHistory(history: any[]): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.SIMULATION_HISTORY,
        JSON.stringify(history),
      );
    } catch (error) {
      console.error("Failed to save simulation history:", error);
    }
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    try {
      Object.values(this.STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }

  /**
   * Get report statistics
   */
  static getReportStats(): ReportStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.REPORT_STATS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load report stats:", error);
    }

    // Return default stats
    return {
      totalReports: 0,
      reportsToday: 0,
      totalDownloads: 0,
      averageGenerationTime: 0,
      lastReportDate: null,
    };
  }

  /**
   * Set report statistics
   */
  static setReportStats(stats: ReportStats): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.REPORT_STATS,
        JSON.stringify(stats),
      );
    } catch (error) {
      console.error("Failed to save report stats:", error);
    }
  }

  /**
   * Increment report generation count and update stats
   */
  static incrementReportGeneration(generationTime: number): void {
    const stats = this.getReportStats();
    const now = new Date();
    const today = now.toDateString();

    stats.totalReports += 1;

    // Check if this is the first report today
    if (
      !stats.lastReportDate ||
      new Date(stats.lastReportDate).toDateString() !== today
    ) {
      stats.reportsToday = 1;
    } else {
      stats.reportsToday += 1;
    }

    // Update average generation time
    if (stats.totalReports === 1) {
      stats.averageGenerationTime = generationTime;
    } else {
      stats.averageGenerationTime =
        (stats.averageGenerationTime * (stats.totalReports - 1) +
          generationTime) /
        stats.totalReports;
    }

    stats.lastReportDate = now.toISOString();

    this.setReportStats(stats);
  }

  /**
   * Increment report download count
   */
  static incrementReportDownload(): void {
    const stats = this.getReportStats();
    stats.totalDownloads += 1;
    this.setReportStats(stats);
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      Object.values(this.STORAGE_KEYS).forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length;
        }
      });

      // Estimate available space (5MB is typical localStorage limit)
      const estimated = 5 * 1024 * 1024; // 5MB in bytes
      const available = Math.max(0, estimated - used);

      return { used, available };
    } catch (error) {
      console.warn("Failed to get storage info:", error);
      return { used: 0, available: 0 };
    }
  }
}
