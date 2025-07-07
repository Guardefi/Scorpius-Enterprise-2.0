import { RequestHandler } from "express";
import {
  HoneypotAnalysisRequest,
  HoneypotAnalysisResponse,
  ApiResponse,
} from "@shared/api-types";

// In-memory storage for demo
const honeypotResults = new Map<string, HoneypotAnalysisResponse>();
const honeypotHistory: HoneypotAnalysisResponse[] = [];

export const analyzeHoneypot: RequestHandler = async (req, res) => {
  try {
    const request: HoneypotAnalysisRequest = req.body;
    const { contractAddress, detectionMethod } = request;

    if (!contractAddress || !detectionMethod) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Contract address and detection method are required",
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    const analysisId = `honeypot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create initial analysis result
    const initialAnalysis: HoneypotAnalysisResponse = {
      id: analysisId,
      contractAddress,
      riskScore: 0,
      honeypotType: "unknown",
      detectionMethod,
      similarContracts: [],
      confidence: 0,
      timestamp: new Date().toISOString(),
      status: "analyzing",
      currentStage: "Fetching contract bytecode",
    };

    honeypotResults.set(analysisId, initialAnalysis);

    // Start async analysis process
    startHoneypotAnalysis(analysisId, request);

    res.json({
      success: true,
      data: initialAnalysis,
      timestamp: new Date().toISOString(),
    } as ApiResponse<HoneypotAnalysisResponse>);
  } catch (error) {
    console.error("Honeypot analysis error:", error);
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

async function startHoneypotAnalysis(
  analysisId: string,
  request: HoneypotAnalysisRequest,
): Promise<void> {
  const analysis = honeypotResults.get(analysisId);
  if (!analysis) return;

  const stages = [
    "Fetching contract bytecode",
    "Analyzing transfer functions",
    "Checking for hidden modifiers",
    "Scanning for balance manipulation",
    "Running pattern matching",
    request.detectionMethod === "bytecode_similarity"
      ? "Comparing with known honeypots"
      : "Evaluating risk patterns",
    "Calculating confidence score",
    "Finalizing analysis",
  ];

  // Simulate progressive analysis
  for (let i = 0; i < stages.length; i++) {
    const updatedAnalysis: HoneypotAnalysisResponse = {
      ...analysis,
      currentStage: stages[i],
    };

    honeypotResults.set(analysisId, updatedAnalysis);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Generate final results
  const riskScore = Math.floor(Math.random() * 100);
  const isHoneypot = riskScore > 70;
  const honeypotTypes = [
    "transfer_honeypot",
    "balance_modifier",
    "hidden_function",
    "gas_limit",
  ] as const;
  const honeypotType = isHoneypot
    ? honeypotTypes[Math.floor(Math.random() * honeypotTypes.length)]
    : ("unknown" as const);

  // Generate similar contracts if using similarity detection
  const similarContracts =
    request.detectionMethod === "bytecode_similarity" && isHoneypot
      ? Array.from(
          { length: Math.floor(Math.random() * 5) + 1 },
          () => `0x${Math.random().toString(16).substr(2, 40)}`,
        )
      : [];

  const finalAnalysis: HoneypotAnalysisResponse = {
    ...analysis,
    riskScore,
    honeypotType,
    similarContracts,
    confidence: Math.floor(Math.random() * 30) + 70,
    status: isHoneypot
      ? "honeypot_detected"
      : riskScore > 40
        ? "suspicious"
        : "safe",
    currentStage: undefined,
  };

  honeypotResults.set(analysisId, finalAnalysis);
  honeypotHistory.unshift(finalAnalysis);

  // Keep only last 50 analyses in history
  if (honeypotHistory.length > 50) {
    honeypotHistory.splice(50);
  }
}

export const getHoneypotResults: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      data: honeypotHistory,
      timestamp: new Date().toISOString(),
    } as ApiResponse<HoneypotAnalysisResponse[]>);
  } catch (error) {
    console.error("Get honeypot results error:", error);
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

export const getHoneypotAnalysis: RequestHandler = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = honeypotResults.get(analysisId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ANALYSIS_NOT_FOUND",
          message: "Analysis not found",
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    } as ApiResponse<HoneypotAnalysisResponse>);
  } catch (error) {
    console.error("Get honeypot analysis error:", error);
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
