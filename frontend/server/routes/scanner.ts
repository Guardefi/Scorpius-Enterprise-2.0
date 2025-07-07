import { RequestHandler } from "express";
import {
  ScanRequest,
  ScanResponse,
  ApiResponse,
  Vulnerability,
} from "@shared/api-types";

// In-memory storage for demo (use proper database in production)
const scanResults = new Map<string, ScanResponse>();
const scanHistory: ScanResponse[] = [];

export const startContractScan: RequestHandler = async (req, res) => {
  try {
    const scanRequest: ScanRequest = req.body;
    const { contractAddress, contractCode, plugins } = scanRequest;

    if (!contractAddress || !plugins || plugins.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Contract address and plugins are required",
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create initial scan result
    const initialScan: ScanResponse = {
      scanId,
      status: "scanning",
      progress: 0,
      vulnerabilities: [],
      securityScore: 0,
      gasOptimization: 0,
      timestamp: new Date().toISOString(),
      plugins,
      currentPlugin: plugins[0],
      pluginStage: "Initializing analysis",
    };

    scanResults.set(scanId, initialScan);

    // Start async scan process
    startScanningProcess(scanId, scanRequest);

    res.json({
      success: true,
      data: initialScan,
      timestamp: new Date().toISOString(),
    } as ApiResponse<ScanResponse>);
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
};

async function startScanningProcess(
  scanId: string,
  request: ScanRequest,
): Promise<void> {
  const scan = scanResults.get(scanId);
  if (!scan) return;

  const { plugins } = request;
  const totalPlugins = plugins.length;
  const progressPerPlugin = 100 / totalPlugins;

  for (let pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
    const currentPlugin = plugins[pluginIndex];
    const baseProgress = pluginIndex * progressPerPlugin;

    // Plugin-specific stages
    const stages = getPluginStages(currentPlugin);

    for (let stage = 0; stage < stages.length; stage++) {
      const currentProgress = Math.min(
        baseProgress + (stage * progressPerPlugin) / stages.length,
        100,
      );

      // Update scan progress
      const updatedScan: ScanResponse = {
        ...scan,
        progress: Math.round(currentProgress),
        currentPlugin,
        pluginStage: stages[stage],
      };

      scanResults.set(scanId, updatedScan);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // Generate final results
  const vulnerabilities: Vulnerability[] = generateMockVulnerabilities(plugins);
  const securityScore = Math.max(0, 100 - vulnerabilities.length * 15);

  const finalScan: ScanResponse = {
    ...scan,
    status: "completed",
    progress: 100,
    vulnerabilities,
    securityScore,
    gasOptimization: Math.floor(Math.random() * 30) + 5,
    currentPlugin: undefined,
    pluginStage: undefined,
  };

  scanResults.set(scanId, finalScan);
  scanHistory.unshift(finalScan);

  // Keep only last 50 scans in history
  if (scanHistory.length > 50) {
    scanHistory.splice(50);
  }
}

function getPluginStages(plugin: string): string[] {
  const stages: Record<string, string[]> = {
    slither: [
      "Initializing AST parser",
      "Analyzing contract structure",
      "Detecting reentrancy patterns",
      "Checking access controls",
      "Scanning for integer issues",
      "Validating state variables",
      "Analyzing function calls",
      "Checking gas patterns",
      "Finalizing static analysis",
      "Generating report",
    ],
    mythril: [
      "Loading symbolic execution engine",
      "Building control flow graph",
      "Initializing constraint solver",
      "Analyzing execution paths",
      "Detecting symbolic vulnerabilities",
      "Checking state constraints",
      "Validating transaction flows",
      "Running taint analysis",
      "Consolidating results",
      "Finalizing symbolic analysis",
    ],
    manticore: [
      "Starting dynamic analysis",
      "Setting up execution environment",
      "Generating test inputs",
      "Executing symbolic paths",
      "Monitoring state changes",
      "Detecting runtime vulnerabilities",
      "Analyzing concolic execution",
      "Validating edge cases",
      "Collecting coverage data",
      "Completing dynamic scan",
    ],
  };

  return stages[plugin] || [`Processing ${plugin}...`];
}

function generateMockVulnerabilities(plugins: string[]): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const numVulns = Math.floor(Math.random() * 5);

  const mockVulns = [
    {
      severity: "High" as const,
      title: "Reentrancy Vulnerability",
      description:
        "External call before state update may allow reentrancy attack",
      line: 45,
      recommendation: "Use checks-effects-interactions pattern",
    },
    {
      severity: "Medium" as const,
      title: "Integer Overflow",
      description: "Arithmetic operation may overflow",
      line: 78,
      recommendation: "Use SafeMath library or Solidity 0.8+",
    },
    {
      severity: "Low" as const,
      title: "Gas Optimization",
      description: "Loop can be optimized to reduce gas costs",
      line: 123,
      recommendation: "Consider using assembly or alternative approach",
    },
    {
      severity: "Critical" as const,
      title: "Unrestricted Delegate Call",
      description: "Delegate call to user-controlled address",
      line: 234,
      recommendation: "Restrict delegate call targets",
    },
  ];

  for (let i = 0; i < numVulns; i++) {
    const vuln = mockVulns[i % mockVulns.length];
    vulnerabilities.push({
      id: `V${i + 1}`,
      ...vuln,
      plugin: plugins[i % plugins.length],
    });
  }

  return vulnerabilities;
}

export const getScanResults: RequestHandler = async (req, res) => {
  try {
    const { scanId } = req.params;
    const scan = scanResults.get(scanId);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: {
          code: "SCAN_NOT_FOUND",
          message: "Scan not found",
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: scan,
      timestamp: new Date().toISOString(),
    } as ApiResponse<ScanResponse>);
  } catch (error) {
    console.error("Get scan results error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
};

export const getScanHistory: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      data: scanHistory,
      timestamp: new Date().toISOString(),
    } as ApiResponse<ScanResponse[]>);
  } catch (error) {
    console.error("Get scan history error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
};
