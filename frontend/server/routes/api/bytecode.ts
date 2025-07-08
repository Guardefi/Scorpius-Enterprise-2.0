import { RequestHandler } from "express";

interface BytecodeAnalysisRequest {
  contractAddress: string;
  blockNumber?: string;
  includeControlFlow?: boolean;
  includeDecompilation?: boolean;
}

interface BytecodeAnalysis {
  id: string;
  contractAddress: string;
  blockNumber: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  functionCount: number;
  complexityScore: number;
  version: string;
  compiler: string;
  optimized: boolean;
  securityFlags: string[];
  decompiledCode?: string;
  controlFlowGraph?: any;
  analysisTime: number;
  timestamp: string;
}

// In-memory storage
const analyses: Map<string, BytecodeAnalysis> = new Map();
const analysisQueue: Array<BytecodeAnalysisRequest & { id: string }> = [];

export const startAnalysis: RequestHandler = async (req, res) => {
  try {
    const {
      contractAddress,
      blockNumber = "latest",
      includeControlFlow = true,
      includeDecompilation = true,
    }: BytecodeAnalysisRequest = req.body;

    if (!contractAddress) {
      return res.status(400).json({
        error: "Contract address is required",
      });
    }

    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add to queue
    analysisQueue.push({
      id: analysisId,
      contractAddress,
      blockNumber,
      includeControlFlow,
      includeDecompilation,
    });

    // Create initial analysis result
    const analysis: BytecodeAnalysis = {
      id: analysisId,
      contractAddress,
      blockNumber,
      status: "pending",
      functionCount: 0,
      complexityScore: 0,
      version: "",
      compiler: "",
      optimized: false,
      securityFlags: [],
      analysisTime: 0,
      timestamp: new Date().toISOString(),
    };

    analyses.set(analysisId, analysis);

    // Start processing
    setTimeout(() => processAnalysis(analysisId), 500);

    res.status(201).json({
      analysisId,
      status: "pending",
      message: "Analysis queued successfully",
    });
  } catch (error) {
    console.error("Error starting analysis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAnalysis: RequestHandler = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = analyses.get(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    console.error("Error getting analysis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllAnalyses: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    let results = Array.from(analyses.values());

    if (status) {
      results = results.filter((analysis) => analysis.status === status);
    }

    results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      analyses: paginatedResults,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
      },
    });
  } catch (error) {
    console.error("Error getting analyses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBytecodeStats: RequestHandler = async (req, res) => {
  try {
    const results = Array.from(analyses.values());

    const stats = {
      totalAnalyses: results.length,
      completedAnalyses: results.filter((a) => a.status === "completed").length,
      pendingAnalyses: results.filter((a) => a.status === "pending").length,
      analyzingAnalyses: results.filter((a) => a.status === "analyzing").length,
      failedAnalyses: results.filter((a) => a.status === "failed").length,
      queueLength: analysisQueue.length,
      averageComplexity:
        results.length > 0
          ? results.reduce((sum, a) => sum + a.complexityScore, 0) /
            results.length
          : 0,
      averageAnalysisTime:
        results.length > 0
          ? results.reduce((sum, a) => sum + a.analysisTime, 0) / results.length
          : 0,
      compilerBreakdown: getCompilerBreakdown(results),
      securityFlagsBreakdown: getSecurityFlagsBreakdown(results),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting bytecode stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getControlFlowGraph: RequestHandler = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = analyses.get(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status !== "completed") {
      return res.status(400).json({ error: "Analysis not completed yet" });
    }

    res.json({
      analysisId,
      contractAddress: analysis.contractAddress,
      controlFlowGraph: analysis.controlFlowGraph || generateControlFlowGraph(),
    });
  } catch (error) {
    console.error("Error getting control flow graph:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDecompiledCode: RequestHandler = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = analyses.get(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status !== "completed") {
      return res.status(400).json({ error: "Analysis not completed yet" });
    }

    res.json({
      analysisId,
      contractAddress: analysis.contractAddress,
      decompiledCode: analysis.decompiledCode || generateDecompiledCode(),
    });
  } catch (error) {
    console.error("Error getting decompiled code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Process analysis simulation
async function processAnalysis(analysisId: string) {
  const analysis = analyses.get(analysisId);
  if (!analysis) return;

  const startTime = Date.now();

  // Update to analyzing
  analysis.status = "analyzing";
  analyses.set(analysisId, analysis);

  // Simulate analysis time (2-8 seconds)
  const analysisTime = Math.random() * 6000 + 2000;

  setTimeout(() => {
    const endTime = Date.now();

    // Generate mock analysis results
    analysis.status = Math.random() > 0.05 ? "completed" : "failed";
    analysis.functionCount = Math.floor(Math.random() * 50) + 10;
    analysis.complexityScore = Math.round(Math.random() * 100) / 10;
    analysis.version = ["0.8.19", "0.8.17", "0.7.6", "0.6.12", "0.5.16"][
      Math.floor(Math.random() * 5)
    ];
    analysis.compiler = Math.random() > 0.8 ? "vyper" : "solc";
    analysis.optimized = Math.random() > 0.3;
    analysis.securityFlags = [
      "reentrancy-guard",
      "safe-math",
      "access-control",
      "overflow-protection",
      "pause-mechanism",
    ].filter(() => Math.random() > 0.4);
    analysis.analysisTime = endTime - startTime;

    if (analysis.status === "completed") {
      analysis.decompiledCode = generateDecompiledCode();
      analysis.controlFlowGraph = generateControlFlowGraph();
    }

    analyses.set(analysisId, analysis);

    // Remove from queue
    const queueIndex = analysisQueue.findIndex(
      (item) => item.id === analysisId,
    );
    if (queueIndex > -1) {
      analysisQueue.splice(queueIndex, 1);
    }
  }, analysisTime);
}

function generateDecompiledCode() {
  return `
// Decompiled with Heimdall (https://heimdall.rs)
// SPDX-License-Identifier: MIT

contract DecompiledContract {
    mapping(address => uint256) public balances;
    address public owner;
    bool private locked;
    
    function transfer(address _to, uint256 _amount) external {
        require(!locked, "Contract is locked");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        locked = true;
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        locked = false;
        
        emit Transfer(msg.sender, _to, _amount);
    }
    
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}`;
}

function generateControlFlowGraph() {
  return {
    nodes: [
      {
        id: "entry",
        type: "entry",
        label: "Contract Entry",
        opcodes: ["JUMPDEST", "PUSH1 0x80", "PUSH1 0x40"],
        riskLevel: "low",
      },
      {
        id: "auth_check",
        type: "conditional",
        label: "Authorization Check",
        opcodes: ["CALLER", "PUSH20", "EQ", "ISZERO"],
        riskLevel: "medium",
      },
      {
        id: "balance_check",
        type: "conditional",
        label: "Balance Validation",
        opcodes: ["SLOAD", "DUP1", "GT", "ISZERO"],
        riskLevel: "high",
      },
      {
        id: "transfer",
        type: "basic",
        label: "Execute Transfer",
        opcodes: ["SSTORE", "CALL", "RETURNDATASIZE"],
        riskLevel: "high",
      },
      {
        id: "exit",
        type: "exit",
        label: "Function Exit",
        opcodes: ["RETURN"],
        riskLevel: "low",
      },
    ],
    edges: [
      { from: "entry", to: "auth_check" },
      { from: "auth_check", to: "balance_check" },
      { from: "balance_check", to: "transfer" },
      { from: "transfer", to: "exit" },
    ],
  };
}

function getCompilerBreakdown(analyses: BytecodeAnalysis[]) {
  const breakdown: Record<string, number> = {};
  analyses.forEach((analysis) => {
    breakdown[analysis.compiler] = (breakdown[analysis.compiler] || 0) + 1;
  });
  return breakdown;
}

function getSecurityFlagsBreakdown(analyses: BytecodeAnalysis[]) {
  const breakdown: Record<string, number> = {};
  analyses.forEach((analysis) => {
    analysis.securityFlags.forEach((flag) => {
      breakdown[flag] = (breakdown[flag] || 0) + 1;
    });
  });
  return breakdown;
}
