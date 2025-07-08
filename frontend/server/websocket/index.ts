import WebSocket from "ws";
import { createServer } from "http";
import express from "express";
import { EventEmitter } from "events";

interface WebSocketMessage {
  type: string;
  service: string;
  data: any;
  timestamp: string;
  id?: string;
}

interface ClientConnection {
  ws: WebSocket;
  id: string;
  subscriptions: Set<string>;
  authenticated: boolean;
  userId?: string;
}

class ScorpiusWebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private clients: Map<string, ClientConnection> = new Map();
  private services: Map<string, any> = new Map();

  constructor(server: any) {
    super();
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocketServer();
    this.initializeServices();
  }

  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      const client: ClientConnection = {
        ws,
        id: clientId,
        subscriptions: new Set(),
        authenticated: false,
      };

      this.clients.set(clientId, client);
      console.log(`🔌 Client ${clientId} connected`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: "connection_established",
        service: "system",
        data: { clientId, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      });

      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message) as WebSocketMessage;
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error("Invalid message format:", error);
          this.sendError(clientId, "Invalid message format");
        }
      });

      ws.on("close", () => {
        console.log(`🔌 Client ${clientId} disconnected`);
        this.clients.delete(clientId);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  private initializeServices() {
    // Scanner service
    this.services.set("scanner", {
      generateData: () => ({
        activeScans: Math.floor(Math.random() * 10) + 1,
        completedScans: Math.floor(Math.random() * 100) + 50,
        vulnerabilities: {
          critical: Math.floor(Math.random() * 5),
          high: Math.floor(Math.random() * 15),
          medium: Math.floor(Math.random() * 30),
          low: Math.floor(Math.random() * 20),
        },
        topVulnerableFunctions: this.generateVulnerableFunctions(),
      }),
    });

    // Bytecode Lab service
    this.services.set("bytecode", {
      generateData: () => ({
        analysisQueue: Math.floor(Math.random() * 5),
        activeAnalyses: Math.floor(Math.random() * 3),
        contractsAnalyzed: Math.floor(Math.random() * 50) + 100,
        recentAnalysis: this.generateBytecodeAnalysis(),
      }),
    });

    // Simulation Engine service
    this.services.set("simulation", {
      generateData: () => ({
        queueLength: Math.floor(Math.random() * 8),
        activeRunners: Math.floor(Math.random() * 5),
        averageRunTime: Math.random() * 5 + 2,
        successRate: Math.random() * 20 + 75,
        recentResults: this.generateSimulationResults(),
      }),
    });

    // Event Stream service
    this.services.set("events", {
      generateData: () => ({
        eventsPerHour: Math.floor(Math.random() * 50) + 20,
        criticalEvents: Math.floor(Math.random() * 5),
        watchedContracts: Math.floor(Math.random() * 20) + 10,
        recentEvents: this.generateBlockchainEvents(),
      }),
    });

    // Bridge Monitor service
    this.services.set("bridge", {
      generateData: () => ({
        totalBridgeVolume: Math.random() * 1000 + 500,
        suspiciousTransfers: Math.floor(Math.random() * 3),
        activeBridges: ["Arbitrum", "Polygon", "Base", "Optimism", "Avalanche"],
        recentTransfers: this.generateBridgeTransfers(),
      }),
    });

    // Start real-time data broadcasting
    this.startRealTimeUpdates();
  }

  private generateVulnerableFunctions() {
    const functions = [
      "transfer()",
      "withdraw()",
      "mint()",
      "approve()",
      "transferFrom()",
    ];
    return functions.slice(0, 5).map((name, index) => ({
      id: `func_${index}`,
      name,
      severity: ["Critical", "High", "Medium"][Math.floor(Math.random() * 3)],
      contract: `0x${Math.random().toString(16).substr(2, 8)}...`,
      line: Math.floor(Math.random() * 200) + 1,
      scanType: ["Slither", "Mythril", "AI-Enhanced"][
        Math.floor(Math.random() * 3)
      ],
    }));
  }

  private generateBytecodeAnalysis() {
    return {
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      functionCount: Math.floor(Math.random() * 50) + 10,
      complexityScore: Math.random() * 10,
      securityFlags: ["reentrancy-guard", "safe-math", "access-control"].filter(
        () => Math.random() > 0.5,
      ),
    };
  }

  private generateSimulationResults() {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `sim_${Date.now()}_${i}`,
      type: ["flash-loan", "reentrancy", "oracle-manip"][
        Math.floor(Math.random() * 3)
      ],
      status: ["Pass", "Fail", "Exception"][Math.floor(Math.random() * 3)],
      exploitValue: Math.random() * 100,
      gasUsed: Math.floor(Math.random() * 500000) + 100000,
      completedAt: new Date(),
    }));
  }

  private generateBlockchainEvents() {
    const eventTypes = [
      "OwnershipTransferred",
      "Paused",
      "Transfer",
      "Mint",
      "Burn",
    ];
    return Array.from({ length: 5 }, (_, i) => ({
      id: `evt_${Date.now()}_${i}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      severity: ["critical", "high", "medium", "low"][
        Math.floor(Math.random() * 4)
      ],
      timestamp: new Date(),
      description: "Blockchain event detected",
    }));
  }

  private generateBridgeTransfers() {
    const chains = ["Ethereum", "Arbitrum", "Polygon", "Base", "Optimism"];
    return Array.from({ length: 3 }, (_, i) => ({
      id: `bridge_${Date.now()}_${i}`,
      fromChain: chains[Math.floor(Math.random() * chains.length)],
      toChain: chains[Math.floor(Math.random() * chains.length)],
      amount: (Math.random() * 100).toFixed(2),
      isSuspicious: Math.random() > 0.7,
      timestamp: new Date(),
    }));
  }

  private startRealTimeUpdates() {
    // Update every 3 seconds
    setInterval(() => {
      this.broadcastToSubscribers(
        "scanner",
        this.services.get("scanner").generateData(),
      );
    }, 3000);

    setInterval(() => {
      this.broadcastToSubscribers(
        "bytecode",
        this.services.get("bytecode").generateData(),
      );
    }, 5000);

    setInterval(() => {
      this.broadcastToSubscribers(
        "simulation",
        this.services.get("simulation").generateData(),
      );
    }, 4000);

    setInterval(() => {
      this.broadcastToSubscribers(
        "events",
        this.services.get("events").generateData(),
      );
    }, 2000);

    setInterval(() => {
      this.broadcastToSubscribers(
        "bridge",
        this.services.get("bridge").generateData(),
      );
    }, 6000);
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case "authenticate":
        this.handleAuthentication(clientId, message.data);
        break;
      case "subscribe":
        this.handleSubscription(clientId, message.service);
        break;
      case "unsubscribe":
        this.handleUnsubscription(clientId, message.service);
        break;
      case "heartbeat":
        this.sendToClient(clientId, {
          type: "heartbeat_response",
          service: "system",
          data: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString(),
        });
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private handleAuthentication(clientId: string, authData: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Simple token validation (in production, use proper JWT validation)
    if (authData.token) {
      client.authenticated = true;
      client.userId = authData.userId;

      this.sendToClient(clientId, {
        type: "auth_success",
        service: "auth",
        data: { authenticated: true, userId: authData.userId },
        timestamp: new Date().toISOString(),
      });
    } else {
      this.sendToClient(clientId, {
        type: "auth_error",
        service: "auth",
        data: { error: "Invalid token" },
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleSubscription(clientId: string, service: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.add(service);

    // Send initial data
    const serviceData = this.services.get(service);
    if (serviceData) {
      this.sendToClient(clientId, {
        type: "subscription_confirmed",
        service,
        data: serviceData.generateData(),
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Client ${clientId} subscribed to ${service}`);
  }

  private handleUnsubscription(clientId: string, service: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.delete(service);
    console.log(`Client ${clientId} unsubscribed from ${service}`);
  }

  private sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message to client ${clientId}:`, error);
      this.clients.delete(clientId);
    }
  }

  private broadcastToSubscribers(service: string, data: any) {
    const message: WebSocketMessage = {
      type: "data_update",
      service,
      data,
      timestamp: new Date().toISOString(),
    };

    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(service)) {
        this.sendToClient(clientId, message);
      }
    });
  }

  private sendError(clientId: string, error: string) {
    this.sendToClient(clientId, {
      type: "error",
      service: "system",
      data: { error },
      timestamp: new Date().toISOString(),
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getStats() {
    return {
      connectedClients: this.clients.size,
      totalSubscriptions: Array.from(this.clients.values()).reduce(
        (total, client) => total + client.subscriptions.size,
        0,
      ),
      services: Array.from(this.services.keys()),
    };
  }
}

export { ScorpiusWebSocketServer };
