import { Router } from "express";
import {
  startScan,
  getScanStatus,
  getAllScans,
  getScannerStats,
  deleteScan,
} from "./scanner";
import {
  startAnalysis,
  getAnalysis,
  getAllAnalyses,
  getBytecodeStats,
  getControlFlowGraph,
  getDecompiledCode,
} from "./bytecode";
import {
  queueSimulation,
  getSimulation,
  getAllSimulations,
  getSimulationStats,
  pauseSimulation,
  cancelSimulation,
  getQueueStatus,
} from "./simulation";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      scanner: "operational",
      bytecode: "operational",
      simulation: "operational",
      websocket: "operational",
    },
  });
});

// Scanner API endpoints
router.post("/scanner/scan", startScan);
router.get("/scanner/scan/:scanId", getScanStatus);
router.get("/scanner/scans", getAllScans);
router.get("/scanner/stats", getScannerStats);
router.delete("/scanner/scan/:scanId", deleteScan);

// Bytecode Lab API endpoints
router.post("/bytecode/analyze", startAnalysis);
router.get("/bytecode/analysis/:analysisId", getAnalysis);
router.get("/bytecode/analyses", getAllAnalyses);
router.get("/bytecode/stats", getBytecodeStats);
router.get("/bytecode/analysis/:analysisId/control-flow", getControlFlowGraph);
router.get("/bytecode/analysis/:analysisId/decompiled", getDecompiledCode);

// Simulation Engine API endpoints
router.post("/simulation/queue", queueSimulation);
router.get("/simulation/:simulationId", getSimulation);
router.get("/simulation", getAllSimulations);
router.get("/simulation-stats", getSimulationStats);
router.post("/simulation/:simulationId/pause", pauseSimulation);
router.post("/simulation/:simulationId/cancel", cancelSimulation);
router.get("/simulation-queue", getQueueStatus);

// Event Stream API endpoints
router.get("/events/stream", (req, res) => {
  // Set up Server-Sent Events for real-time event streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  });

  // Send initial connection event
  res.write(
    `data: ${JSON.stringify({ type: "connected", timestamp: new Date() })}\n\n`,
  );

  // Send periodic events
  const eventInterval = setInterval(() => {
    const event = {
      type: "blockchain_event",
      data: {
        id: `evt_${Date.now()}`,
        eventType: [
          "OwnershipTransferred",
          "Paused",
          "Transfer",
          "Mint",
          "Burn",
        ][Math.floor(Math.random() * 5)],
        contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        severity: ["critical", "high", "medium", "low"][
          Math.floor(Math.random() * 4)
        ],
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }, 3000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(eventInterval);
  });
});

// Bridge Monitor API endpoints
router.get("/bridge/transfers", (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Generate mock bridge transfers
  const transfers = Array.from({ length: limit }, (_, i) => ({
    id: `bridge_${Date.now()}_${i}`,
    fromChain: ["Ethereum", "Arbitrum", "Polygon", "Base"][
      Math.floor(Math.random() * 4)
    ],
    toChain: ["Ethereum", "Arbitrum", "Polygon", "Base"][
      Math.floor(Math.random() * 4)
    ],
    amount: (Math.random() * 100).toFixed(2),
    token: ["ETH", "USDC", "DAI"][Math.floor(Math.random() * 3)],
    isSuspicious: Math.random() > 0.8,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  }));

  res.json({
    transfers,
    pagination: { page, limit, total: 1000, totalPages: 100 },
  });
});

router.get("/bridge/stats", (req, res) => {
  res.json({
    totalVolume: Math.random() * 1000 + 500,
    suspiciousTransfers: Math.floor(Math.random() * 5),
    activeBridges: 5,
    chainFlows: [
      {
        chain: "Ethereum",
        inflow: Math.random() * 200 + 100,
        outflow: Math.random() * 200 + 100,
        netFlow: Math.random() * 100 - 50,
      },
      {
        chain: "Arbitrum",
        inflow: Math.random() * 150 + 50,
        outflow: Math.random() * 150 + 50,
        netFlow: Math.random() * 80 - 40,
      },
    ],
  });
});

// Generic error handler
router.use((error: any, req: any, res: any, next: any) => {
  console.error("API Error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

export default router;
