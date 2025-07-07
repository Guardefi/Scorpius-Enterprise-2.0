/**
 * WebSocket manager for real-time data updates in SCORPIUS
 */
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface ThreatData {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  type: string;
  description: string;
  location: string;
  timestamp: number;
}

export interface SecurityScanResult {
  id: string;
  tool: "slither" | "manticore" | "mythril";
  status: "running" | "completed" | "failed";
  progress: number;
  results?: any;
  errors?: string[];
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeScans: number;
  threatsDetected: number;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected = false;

  constructor(private url: string) {}

  connect(token?: string): void {
    try {
      const wsUrl = token ? `${this.url}?token=${token}` : this.url;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit("connection", { status: "connected" });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnected = false;
        this.emit("connection", { status: "disconnected" });
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.handleReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const { type, payload } = message;
    this.emit(type, payload);
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(
          `Reconnecting WebSocket (attempt ${this.reconnectAttempts})`,
        );
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  private emit(eventType: string, data: any): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  send(type: string, payload: any): void {
    if (this.ws && this.isConnected) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, message not sent:", {
        type,
        payload,
      });
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// WebSocket hooks for React components
import { useEffect, useState, useCallback } from "react";

export function useWebSocket(url: string, token?: string) {
  const [wsManager] = useState(() => new WebSocketManager(url));
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    wsManager.subscribe("connection", (data) => {
      setIsConnected(data.status === "connected");
    });

    wsManager.connect(token);

    return () => {
      wsManager.disconnect();
    };
  }, [wsManager, token]);

  const subscribe = useCallback(
    (eventType: string, callback: (data: any) => void) => {
      return wsManager.subscribe(eventType, callback);
    },
    [wsManager],
  );

  const send = useCallback(
    (type: string, payload: any) => {
      wsManager.send(type, payload);
    },
    [wsManager],
  );

  return { subscribe, send, isConnected, wsManager };
}

export function useRealTimeData<T>(
  eventType: string,
  initialData: T,
  wsManager?: WebSocketManager,
): [T, (data: T) => void] {
  const [data, setData] = useState<T>(initialData);

  useEffect(() => {
    if (!wsManager) return;

    const unsubscribe = wsManager.subscribe(eventType, (newData: T) => {
      setData(newData);
    });

    return unsubscribe;
  }, [eventType, wsManager]);

  return [data, setData];
}

// Create singleton WebSocket manager
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
export const globalWebSocketManager = new WebSocketManager(WS_URL);
