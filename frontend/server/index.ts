import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer as createHttpServer } from "http";
import { handleDemo } from "./routes/demo";
import {
  startContractScan,
  getScanResults,
  getScanHistory,
} from "./routes/scanner";
import {
  analyzeHoneypot,
  getHoneypotResults,
  getHoneypotAnalysis,
} from "./routes/honeypot";

export function createServer() {
  const app = express();
  const server = createHttpServer(app);

  // Middleware
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "development"
          ? ["http://localhost:8080", "http://localhost:3000"]
          : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "Express server running",
      timestamp: new Date().toISOString(),
      mode: "express",
      version: "2.0.0",
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      mode: "express",
    });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // ==================== AUTHENTICATION ROUTES ====================
  // Mock authentication for development
  const mockUsers = new Map();
  const mockTokens = new Map();

  // Helper function to generate mock tokens
  function generateMockToken(userId: string) {
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshToken = `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    mockTokens.set(token, {
      userId,
      type: "access",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    mockTokens.set(refreshToken, {
      userId,
      type: "refresh",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { access_token: token, refresh_token: refreshToken };
  }

  // Register endpoint
  app.post("/api/auth/register", (req, res) => {
    const { email, username, password, full_name } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        detail: "Email, username, and password are required",
      });
    }

    // Check if user already exists
    for (const [id, user] of mockUsers) {
      if (user.email === email || user.username === username) {
        return res.status(400).json({
          detail:
            user.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }
    }

    // Create new user
    const userId = `user_${Date.now()}`;
    const newUser = {
      id: parseInt(userId.split("_")[1]),
      email,
      username,
      full_name: full_name || "",
      is_active: true,
      is_verified: true, // Auto-verify for demo
      is_superuser: false,
      subscription_tier: "free",
      created_at: new Date().toISOString(),
      last_login: null,
    };

    mockUsers.set(userId, { ...newUser, password });

    res.status(201).json(newUser);
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        detail: "Email and password are required",
      });
    }

    // Find user
    let foundUser = null;
    let userId = null;
    for (const [id, user] of mockUsers) {
      if (user.email === email && user.password === password) {
        foundUser = user;
        userId = id;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({
        detail: "Incorrect email or password",
      });
    }

    // Update last login
    foundUser.last_login = new Date().toISOString();

    // Generate tokens
    const tokens = generateMockToken(userId);

    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: "bearer",
    });
  });

  // Get current user endpoint
  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        detail: "Authorization header required",
      });
    }

    const token = authHeader.substring(7);
    const tokenData = mockTokens.get(token);

    if (!tokenData || tokenData.expires < Date.now()) {
      return res.status(401).json({
        detail: "Invalid or expired token",
      });
    }

    const user = mockUsers.get(tokenData.userId);
    if (!user) {
      return res.status(401).json({
        detail: "User not found",
      });
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Refresh token endpoint
  app.post("/api/auth/refresh", (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        detail: "Refresh token required",
      });
    }

    const tokenData = mockTokens.get(refresh_token);

    if (
      !tokenData ||
      tokenData.type !== "refresh" ||
      tokenData.expires < Date.now()
    ) {
      return res.status(401).json({
        detail: "Invalid or expired refresh token",
      });
    }

    // Generate new tokens
    const tokens = generateMockToken(tokenData.userId);

    // Remove old refresh token
    mockTokens.delete(refresh_token);

    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: "bearer",
    });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const { refresh_token } = req.body;

    if (refresh_token) {
      mockTokens.delete(refresh_token);
    }

    res.json({ message: "Successfully logged out" });
  });

  // Other auth endpoints (simplified for demo)
  app.post("/api/auth/verify-email", (req, res) => {
    res.json({ message: "Email verified successfully" });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    res.json({ message: "If the email exists, a reset link has been sent" });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    res.json({ message: "Password reset successfully" });
  });

  // ==================== NEW API ROUTES ====================
  // Import and use the new API routes
  try {
    const apiRoutes = require("./routes/api").default;
    app.use("/api", apiRoutes);
  } catch (error) {
    console.log("API routes not available, using legacy endpoints");
  }

  // ==================== SCANNER ROUTES (Legacy) ====================
  app.post("/api/scanner/scan", startContractScan);
  app.get("/api/scanner/results/:scanId", getScanResults);
  app.get("/api/scanner/history", getScanHistory);

  // ==================== HONEYPOT ROUTES ====================
  app.post("/api/honeypot/analyze", analyzeHoneypot);
  app.get("/api/honeypot/results", getHoneypotResults);
  app.get("/api/honeypot/analysis/:analysisId", getHoneypotAnalysis);

  // ==================== MOCK ENDPOINTS FOR MISSING FEATURES ====================
  // These would be implemented in the Python backend

  // Time Machine endpoints
  app.post("/api/time-machine/query", (req, res) => {
    res.json({
      success: true,
      data: {
        id: `query_${Date.now()}`,
        blockNumber: req.body.blockNumber || 18000000,
        timestamp: new Date().toISOString(),
        query: req.body.queryType || "balance",
        results: [],
        status: "completed",
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/time-machine/history", (req, res) => {
    res.json({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    });
  });

  // Exploit Replay endpoints
  app.get("/api/exploits/list", (req, res) => {
    res.json({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/exploits/replay/start", (req, res) => {
    res.json({
      success: true,
      data: {
        exploitId: req.body.exploitId,
        currentTransaction: 0,
        totalTransactions: 10,
        isReplaying: true,
        transactionDetails: {
          hash: "0x...",
          blockNumber: 18000000,
          timestamp: new Date().toISOString(),
          from: "0x...",
          to: "0x...",
          value: "0",
          gasUsed: "21000",
          gasPrice: "20000000000",
          method: "transfer",
          description: "Mock transaction",
          impact: "Low",
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/exploits/replay/control", (req, res) => {
    res.json({
      success: true,
      data: {
        exploitId: "mock",
        currentTransaction: 0,
        totalTransactions: 10,
        isReplaying: req.body.action === "resume",
        transactionDetails: {
          hash: "0x...",
          blockNumber: 18000000,
          timestamp: new Date().toISOString(),
          from: "0x...",
          to: "0x...",
          value: "0",
          gasUsed: "21000",
          gasPrice: "20000000000",
          method: "transfer",
          description: "Mock transaction",
          impact: "Low",
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Forensics endpoints
  app.post("/api/forensics/analyze", (req, res) => {
    res.json({
      success: true,
      data: {
        id: `forensics_${Date.now()}`,
        address: req.body.address,
        analysisType: req.body.analysisType || "transaction_flow",
        findings: [],
        riskLevel: "low",
        timestamp: new Date().toISOString(),
        status: "completed",
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/forensics/results", (req, res) => {
    res.json({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    });
  });

  // Mempool endpoints
  app.get("/api/mempool/current", (req, res) => {
    res.json({
      success: true,
      data: {
        totalTransactions: 0,
        mevOpportunities: 0,
        suspiciousTransactions: 0,
        averageGasPrice: "20000000000",
        transactions: [],
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/mempool/analyze", (req, res) => {
    res.json({
      success: true,
      data: {
        totalTransactions: 0,
        mevOpportunities: 0,
        suspiciousTransactions: 0,
        averageGasPrice: "20000000000",
        transactions: [],
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Quantum endpoints
  app.post("/api/quantum/analyze", (req, res) => {
    res.json({
      success: true,
      data: {
        algorithm: req.body.algorithm || "RSA",
        keySize: req.body.keySize || 2048,
        estimatedBreakTime: "10+ years",
        recommendation: "Consider post-quantum cryptography",
        quantumResistant: false,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  });

  // ==================== WEBSOCKET SETUP ====================
  const wss = new WebSocketServer({
    server,
    path: "/api/ws",
  });

  const activeConnections = new Set<any>();

  wss.on("connection", (ws, request) => {
    console.log(
      "🔌 New WebSocket connection from:",
      request.socket.remoteAddress,
    );
    activeConnections.add(ws);

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connection_established",
        service: "system",
        data: {
          message: "Connected to Express WebSocket server",
          serverMode: "express",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }),
    );

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(
          "📨 WebSocket message received:",
          message.type,
          message.service,
        );

        // Handle different message types
        switch (message.type) {
          case "heartbeat":
            ws.send(
              JSON.stringify({
                type: "heartbeat_response",
                service: "system",
                data: { timestamp: new Date().toISOString() },
                timestamp: new Date().toISOString(),
              }),
            );
            break;

          case "subscribe":
            // Mock subscription response
            ws.send(
              JSON.stringify({
                type: "subscription_confirmed",
                service: message.service,
                data: {
                  service: message.service,
                  subscribed: true,
                  message: `Subscribed to ${message.service} updates`,
                },
                timestamp: new Date().toISOString(),
              }),
            );
            break;

          case "unsubscribe":
            // Mock unsubscription response
            ws.send(
              JSON.stringify({
                type: "subscription_cancelled",
                service: message.service,
                data: {
                  service: message.service,
                  subscribed: false,
                  message: `Unsubscribed from ${message.service} updates`,
                },
                timestamp: new Date().toISOString(),
              }),
            );
            break;

          default:
            console.log("❓ Unknown WebSocket message type:", message.type);
        }
      } catch (error) {
        console.error("❌ WebSocket message parse error:", error);
      }
    });

    ws.on("close", (code, reason) => {
      console.log("🔌 WebSocket connection closed:", code, reason.toString());
      activeConnections.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
      activeConnections.delete(ws);
    });
  });

  // Broadcast function for sending updates to all connected clients
  function broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    activeConnections.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error("❌ Broadcast error:", error);
          activeConnections.delete(ws);
        }
      }
    });
  }

  // Example: Send periodic updates (for demo purposes)
  setInterval(() => {
    if (activeConnections.size > 0) {
      broadcast({
        type: "system_update",
        service: "system",
        data: {
          timestamp: new Date().toISOString(),
          activeConnections: activeConnections.size,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        timestamp: new Date().toISOString(),
      });
    }
  }, 30000); // Every 30 seconds

  // Store broadcast function on app for use in routes
  (app as any).broadcast = broadcast;

  return server; // Return the HTTP server instead of Express app
}
