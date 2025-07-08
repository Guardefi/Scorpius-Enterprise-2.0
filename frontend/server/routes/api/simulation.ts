import { RequestHandler } from "express";

interface SimulationRequest {
  contractAddress: string;
  exploitType: string[];
  blockNumber?: string;
  txHash?: string;
  parameters?: Record<string, any>;
  priority?: "low" | "medium" | "high" | "critical";
}

interface SimulationResult {
  id: string;
  contractAddress: string;
  exploitType: string[];
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  result?: {
    success: boolean;
    exploitValue: number;
    gasUsed: number;
    transactions: Array<{
      type: string;
      hash: string;
      success: boolean;
      value: string;
      gasUsed: number;
    }>;
    timeline: Array<{
      step: string;
      description: string;
      timestamp: Date;
      status: "success" | "warning" | "error";
    }>;
    mitigation: string[];
    riskScore: number;
  };
  executionTime: number;
  timestamp: string;
  priority: string;
}

// In-memory storage
const simulations: Map<string, SimulationResult> = new Map();
const simulationQueue: Array<SimulationRequest & { id: string }> = [];

export const queueSimulation: RequestHandler = async (req, res) => {
  try {
    const {
      contractAddress,
      exploitType,
      blockNumber = "latest",
      txHash,
      parameters = {},
      priority = "medium",
    }: SimulationRequest = req.body;

    if (!contractAddress || !exploitType || exploitType.length === 0) {
      return res.status(400).json({
        error: "Contract address and exploit type are required",
      });
    }

    const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add to queue
    simulationQueue.push({
      id: simulationId,
      contractAddress,
      exploitType,
      blockNumber,
      txHash,
      parameters,
      priority,
    });

    // Create initial simulation result
    const simulation: SimulationResult = {
      id: simulationId,
      contractAddress,
      exploitType,
      status: "queued",
      progress: 0,
      executionTime: 0,
      timestamp: new Date().toISOString(),
      priority,
    };

    simulations.set(simulationId, simulation);

    // Start processing based on priority
    const delay = getPriorityDelay(priority);
    setTimeout(() => processSimulation(simulationId), delay);

    res.status(201).json({
      simulationId,
      status: "queued",
      queuePosition: simulationQueue.length,
      estimatedStartTime: new Date(Date.now() + delay).toISOString(),
      message: "Simulation queued successfully",
    });
  } catch (error) {
    console.error("Error queuing simulation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSimulation: RequestHandler = async (req, res) => {
  try {
    const { simulationId } = req.params;

    const simulation = simulations.get(simulationId);
    if (!simulation) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    res.json(simulation);
  } catch (error) {
    console.error("Error getting simulation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllSimulations: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const exploitType = req.query.exploitType as string;

    let results = Array.from(simulations.values());

    if (status) {
      results = results.filter((sim) => sim.status === status);
    }

    if (exploitType) {
      results = results.filter((sim) => sim.exploitType.includes(exploitType));
    }

    results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      simulations: paginatedResults,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
      },
    });
  } catch (error) {
    console.error("Error getting simulations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSimulationStats: RequestHandler = async (req, res) => {
  try {
    const results = Array.from(simulations.values());
    const completedSims = results.filter((sim) => sim.status === "completed");

    const stats = {
      totalSimulations: results.length,
      queueLength: simulationQueue.length,
      activeRunners: results.filter((sim) => sim.status === "running").length,
      completedSimulations: completedSims.length,
      failedSimulations: results.filter((sim) => sim.status === "failed")
        .length,
      averageRunTime:
        completedSims.length > 0
          ? completedSims.reduce((sum, sim) => sum + sim.executionTime, 0) /
            completedSims.length
          : 0,
      successRate:
        completedSims.length > 0
          ? (completedSims.filter((sim) => sim.result?.success).length /
              completedSims.length) *
            100
          : 0,
      exploitTypeBreakdown: getExploitTypeBreakdown(results),
      priorityBreakdown: getPriorityBreakdown(results),
      totalGasUsed: completedSims.reduce(
        (sum, sim) => sum + (sim.result?.gasUsed || 0),
        0,
      ),
      totalExploitValue: completedSims.reduce(
        (sum, sim) => sum + (sim.result?.exploitValue || 0),
        0,
      ),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting simulation stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const pauseSimulation: RequestHandler = async (req, res) => {
  try {
    const { simulationId } = req.params;

    const simulation = simulations.get(simulationId);
    if (!simulation) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    if (simulation.status !== "running") {
      return res.status(400).json({
        error: "Can only pause running simulations",
      });
    }

    // Pause simulation (in real implementation, signal to pause)
    simulation.status = "queued"; // Paused simulations go back to queue
    simulations.set(simulationId, simulation);

    res.json({
      message: "Simulation paused successfully",
      status: "queued",
    });
  } catch (error) {
    console.error("Error pausing simulation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelSimulation: RequestHandler = async (req, res) => {
  try {
    const { simulationId } = req.params;

    const simulation = simulations.get(simulationId);
    if (!simulation) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    if (simulation.status === "completed") {
      return res.status(400).json({
        error: "Cannot cancel completed simulations",
      });
    }

    // Remove from queue and mark as failed
    const queueIndex = simulationQueue.findIndex(
      (item) => item.id === simulationId,
    );
    if (queueIndex > -1) {
      simulationQueue.splice(queueIndex, 1);
    }

    simulation.status = "failed";
    simulations.set(simulationId, simulation);

    res.json({
      message: "Simulation cancelled successfully",
      status: "failed",
    });
  } catch (error) {
    console.error("Error cancelling simulation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getQueueStatus: RequestHandler = async (req, res) => {
  try {
    const queuedSims = simulationQueue.map((sim, index) => ({
      id: sim.id,
      contractAddress: sim.contractAddress,
      exploitType: sim.exploitType,
      priority: sim.priority,
      queuePosition: index + 1,
      estimatedStartTime: new Date(
        Date.now() + (index + 1) * getPriorityDelay(sim.priority),
      ).toISOString(),
    }));

    res.json({
      queueLength: simulationQueue.length,
      queue: queuedSims,
      activeRunners: Array.from(simulations.values()).filter(
        (sim) => sim.status === "running",
      ).length,
    });
  } catch (error) {
    console.error("Error getting queue status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Process simulation
async function processSimulation(simulationId: string) {
  const simulation = simulations.get(simulationId);
  if (!simulation) return;

  const startTime = Date.now();

  // Update to running
  simulation.status = "running";
  simulation.progress = 10;
  simulations.set(simulationId, simulation);

  // Simulate steps with progress updates
  const steps = [
    "Initializing fork environment",
    "Deploying attack contracts",
    "Executing exploit scenario",
    "Analyzing results",
    "Generating report",
  ];

  for (let i = 0; i < steps.length; i++) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    simulation.progress = 20 + (i + 1) * 16; // 20% to 100%
    simulations.set(simulationId, simulation);
  }

  const endTime = Date.now();
  simulation.executionTime = endTime - startTime;

  // Generate results
  const success = Math.random() > 0.3;
  simulation.status = Math.random() > 0.05 ? "completed" : "failed";

  if (simulation.status === "completed") {
    simulation.result = {
      success,
      exploitValue: success ? Math.random() * 100000 : 0,
      gasUsed: Math.floor(Math.random() * 500000) + 100000,
      transactions: generateMockTransactions(success),
      timeline: generateMockTimeline(),
      mitigation: generateMockMitigation(),
      riskScore: success
        ? Math.floor(Math.random() * 40) + 60
        : Math.floor(Math.random() * 30) + 10,
    };
  }

  simulation.progress = 100;
  simulations.set(simulationId, simulation);

  // Remove from queue
  const queueIndex = simulationQueue.findIndex(
    (item) => item.id === simulationId,
  );
  if (queueIndex > -1) {
    simulationQueue.splice(queueIndex, 1);
  }
}

function getPriorityDelay(priority: string): number {
  switch (priority) {
    case "critical":
      return 100;
    case "high":
      return 500;
    case "medium":
      return 1000;
    case "low":
      return 2000;
    default:
      return 1000;
  }
}

function generateMockTransactions(success: boolean) {
  return [
    {
      type: "setup",
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      success: true,
      value: "0",
      gasUsed: 50000,
    },
    {
      type: "exploit",
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      success,
      value: success ? (Math.random() * 10).toFixed(4) : "0",
      gasUsed: Math.floor(Math.random() * 300000) + 100000,
    },
  ];
}

function generateMockTimeline() {
  return [
    {
      step: "Environment Setup",
      description: "Forked mainnet and deployed attack contracts",
      timestamp: new Date(Date.now() - 5000),
      status: "success" as const,
    },
    {
      step: "Exploit Execution",
      description: "Executed attack scenario",
      timestamp: new Date(Date.now() - 2000),
      status: Math.random() > 0.3 ? ("success" as const) : ("warning" as const),
    },
    {
      step: "Result Analysis",
      description: "Analyzed attack effectiveness",
      timestamp: new Date(),
      status: "success" as const,
    },
  ];
}

function generateMockMitigation() {
  return [
    "Implement reentrancy guards",
    "Use SafeMath for arithmetic operations",
    "Add proper access controls",
    "Validate external data sources",
    "Implement circuit breakers",
  ].slice(0, Math.floor(Math.random() * 3) + 2);
}

function getExploitTypeBreakdown(simulations: SimulationResult[]) {
  const breakdown: Record<string, number> = {};
  simulations.forEach((sim) => {
    sim.exploitType.forEach((type) => {
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
  });
  return breakdown;
}

function getPriorityBreakdown(simulations: SimulationResult[]) {
  const breakdown: Record<string, number> = {};
  simulations.forEach((sim) => {
    breakdown[sim.priority] = (breakdown[sim.priority] || 0) + 1;
  });
  return breakdown;
}
