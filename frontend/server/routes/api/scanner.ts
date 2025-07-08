import { RequestHandler } from "express";

interface ScanRequest {
  contractAddress: string;
  scanTypes: string[];
  priority?: "low" | "medium" | "high" | "critical";
}

interface ScanResult {
  id: string;
  contractAddress: string;
  status: "pending" | "running" | "completed" | "failed";
  vulnerabilities: Array<{
    id: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    title: string;
    description: string;
    line?: number;
    recommendation: string;
  }>;
  securityScore: number;
  timestamp: string;
}

// In-memory storage for demo (use database in production)
const scanResults: Map<string, ScanResult> = new Map();
const scanQueue: Array<ScanRequest & { id: string }> = [];

export const startScan: RequestHandler = async (req, res) => {
  try {
    const {
      contractAddress,
      scanTypes,
      priority = "medium",
    }: ScanRequest = req.body;

    if (!contractAddress || !scanTypes || scanTypes.length === 0) {
      return res.status(400).json({
        error: "Contract address and scan types are required",
      });
    }

    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add to queue
    scanQueue.push({
      id: scanId,
      contractAddress,
      scanTypes,
      priority,
    });

    // Create initial scan result
    const scanResult: ScanResult = {
      id: scanId,
      contractAddress,
      status: "pending",
      vulnerabilities: [],
      securityScore: 0,
      timestamp: new Date().toISOString(),
    };

    scanResults.set(scanId, scanResult);

    // Simulate scan processing
    setTimeout(() => processScan(scanId), 1000);

    res.status(201).json({
      scanId,
      status: "pending",
      message: "Scan queued successfully",
    });
  } catch (error) {
    console.error("Error starting scan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getScanStatus: RequestHandler = async (req, res) => {
  try {
    const { scanId } = req.params;

    const scanResult = scanResults.get(scanId);
    if (!scanResult) {
      return res.status(404).json({ error: "Scan not found" });
    }

    res.json(scanResult);
  } catch (error) {
    console.error("Error getting scan status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllScans: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    let results = Array.from(scanResults.values());

    // Filter by status if provided
    if (status) {
      results = results.filter((scan) => scan.status === status);
    }

    // Sort by timestamp (newest first)
    results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      scans: paginatedResults,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
      },
    });
  } catch (error) {
    console.error("Error getting scans:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getScannerStats: RequestHandler = async (req, res) => {
  try {
    const results = Array.from(scanResults.values());
    const completedScans = results.filter(
      (scan) => scan.status === "completed",
    );

    const stats = {
      totalScans: results.length,
      completedScans: completedScans.length,
      pendingScans: results.filter((scan) => scan.status === "pending").length,
      runningScans: results.filter((scan) => scan.status === "running").length,
      failedScans: results.filter((scan) => scan.status === "failed").length,
      queueLength: scanQueue.length,
      averageSecurityScore:
        completedScans.length > 0
          ? completedScans.reduce((sum, scan) => sum + scan.securityScore, 0) /
            completedScans.length
          : 0,
      vulnerabilityBreakdown: {
        critical: completedScans.reduce(
          (sum, scan) =>
            sum +
            scan.vulnerabilities.filter((v) => v.severity === "Critical")
              .length,
          0,
        ),
        high: completedScans.reduce(
          (sum, scan) =>
            sum +
            scan.vulnerabilities.filter((v) => v.severity === "High").length,
          0,
        ),
        medium: completedScans.reduce(
          (sum, scan) =>
            sum +
            scan.vulnerabilities.filter((v) => v.severity === "Medium").length,
          0,
        ),
        low: completedScans.reduce(
          (sum, scan) =>
            sum +
            scan.vulnerabilities.filter((v) => v.severity === "Low").length,
          0,
        ),
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting scanner stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteScan: RequestHandler = async (req, res) => {
  try {
    const { scanId } = req.params;

    if (!scanResults.has(scanId)) {
      return res.status(404).json({ error: "Scan not found" });
    }

    scanResults.delete(scanId);

    res.json({ message: "Scan deleted successfully" });
  } catch (error) {
    console.error("Error deleting scan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Simulate scan processing
async function processScan(scanId: string) {
  const scanResult = scanResults.get(scanId);
  if (!scanResult) return;

  // Update to running
  scanResult.status = "running";
  scanResults.set(scanId, scanResult);

  // Simulate scan time (3-10 seconds)
  const scanTime = Math.random() * 7000 + 3000;

  setTimeout(() => {
    // Generate mock vulnerabilities
    const vulnerabilities = generateMockVulnerabilities();
    const securityScore = Math.max(0, 100 - vulnerabilities.length * 10);

    scanResult.status = Math.random() > 0.1 ? "completed" : "failed";
    scanResult.vulnerabilities = vulnerabilities;
    scanResult.securityScore = securityScore;

    scanResults.set(scanId, scanResult);

    // Remove from queue
    const queueIndex = scanQueue.findIndex((item) => item.id === scanId);
    if (queueIndex > -1) {
      scanQueue.splice(queueIndex, 1);
    }
  }, scanTime);
}

function generateMockVulnerabilities() {
  const vulnerabilityTypes = [
    {
      title: "Reentrancy Vulnerability",
      description: "Potential reentrancy attack vector detected",
      recommendation: "Implement reentrancy guard",
    },
    {
      title: "Integer Overflow",
      description: "Arithmetic operation may overflow",
      recommendation: "Use SafeMath library",
    },
    {
      title: "Unchecked Return Value",
      description: "External call return value not checked",
      recommendation: "Validate return values",
    },
    {
      title: "Access Control Issue",
      description: "Function lacks proper access control",
      recommendation: "Add access modifiers",
    },
  ];

  const vulnerabilities = [];
  const numVulns = Math.floor(Math.random() * 6);

  for (let i = 0; i < numVulns; i++) {
    const type =
      vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];
    const severities = ["Critical", "High", "Medium", "Low"] as const;

    vulnerabilities.push({
      id: `vuln_${i}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: type.title,
      description: type.description,
      line: Math.floor(Math.random() * 200) + 1,
      recommendation: type.recommendation,
    });
  }

  return vulnerabilities;
}
