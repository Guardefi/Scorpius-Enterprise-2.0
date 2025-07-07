import { useEffect, useRef, useState, useCallback } from "react";
import { getWebSocketConfig, getBackendConfig } from "@shared/backend-config";

export interface WebSocketMessage {
  type: string;
  service: string;
  data: any;
  timestamp: string;
  id?: string;
  event?: string;
}

export interface WebSocketConfig {
  url?: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  messageQueue?: boolean;
  autoReconnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket(config: WebSocketConfig = {}) {
  const backendConfig = getBackendConfig();
  const wsConfig = getWebSocketConfig();

  const {
    url = wsConfig.url,
    protocols = wsConfig.protocols,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = wsConfig.heartbeatInterval || 30000,
    messageQueue: enableMessageQueue = wsConfig.messageQueue || true,
    autoReconnect = wsConfig.autoReconnect !== false,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error" | "authenticating"
  >("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCount = useRef(0);
  const messageQueue = useRef<WebSocketMessage[]>([]);

  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (ws.current && isConnected) {
      try {
        ws.current.send(
          JSON.stringify({
            type: "heartbeat",
            service: "system",
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString(),
          }),
        );
      } catch (error) {
        console.warn("Failed to send heartbeat:", error);
      }
    }
  }, [isConnected]);

  // Start heartbeat interval
  useEffect(() => {
    if (isConnected && heartbeatInterval > 0) {
      heartbeatTimeoutRef.current = setInterval(
        sendHeartbeat,
        heartbeatInterval,
      );
      return () => {
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current);
        }
      };
    }
  }, [isConnected, heartbeatInterval, sendHeartbeat]);

  const connect = useCallback(() => {
    // Skip connection if WebSocket is not supported
    if (typeof WebSocket === "undefined") {
      console.log("🔌 WebSocket not supported in this environment");
      setConnectionStatus("error");
      return;
    }

    // Skip connection for mock backend
    if (backendConfig.mode === "mock") {
      console.log("🔌 WebSocket disabled in mock mode");
      setConnectionStatus("error");
      return;
    }

    try {
      setConnectionStatus("connecting");
      console.log("🔌 Connecting to WebSocket:", url);

      // Create WebSocket with protocols if specified
      ws.current = new WebSocket(url, protocols);

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
          ws.current.close();
          console.log("🔌 WebSocket connection timeout");
        }
      }, 10000);

      ws.current.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("🔌 WebSocket connected to:", url);

        // For Python backend, we might need authentication
        if (backendConfig.mode === "python") {
          setConnectionStatus("authenticating");

          // Send authentication message if token is available
          const pythonConfig = backendConfig as any;
          if (pythonConfig.authToken) {
            const authMessage = {
              type: "authenticate",
              service: "auth",
              data: { token: pythonConfig.authToken },
              timestamp: new Date().toISOString(),
            };
            ws.current?.send(JSON.stringify(authMessage));
          } else {
            // No auth required, go directly to connected
            setIsConnected(true);
            setConnectionStatus("connected");
            reconnectCount.current = 0;
            onConnect?.();
          }
        } else {
          setIsConnected(true);
          setConnectionStatus("connected");
          reconnectCount.current = 0;
          onConnect?.();
        }
      };

      ws.current.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);

        // Clear heartbeat interval
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = null;
        }

        if (event.code === 1000) {
          // Normal closure
          setConnectionStatus("disconnected");
          console.log("🔌 WebSocket disconnected normally");
        } else {
          setConnectionStatus("error");
          console.log(
            "🔌 WebSocket disconnected with code:",
            event.code,
            event.reason,
          );
        }

        onDisconnect?.();

        // Auto-reconnect logic
        if (
          autoReconnect &&
          event.code !== 1000 &&
          reconnectCount.current < reconnectAttempts
        ) {
          reconnectCount.current++;
          console.log(
            `🔄 Attempting to reconnect (${reconnectCount.current}/${reconnectAttempts})...`,
          );
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        } else if (reconnectCount.current >= reconnectAttempts) {
          console.log(
            "🔌 Max reconnection attempts reached. Operating in offline mode.",
          );
          setConnectionStatus("error");
        }
      };

      ws.current.onerror = (error) => {
        clearTimeout(connectionTimeout);
        setConnectionStatus("error");
        console.log("🔌 WebSocket connection failed");
        onError?.(error);
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle authentication response for Python backend
          if (
            message.type === "auth_success" &&
            connectionStatus === "authenticating"
          ) {
            setIsConnected(true);
            setConnectionStatus("connected");
            reconnectCount.current = 0;
            onConnect?.();
            console.log("🔐 WebSocket authenticated successfully");
            return;
          }

          if (message.type === "auth_error") {
            console.error("🔐 WebSocket authentication failed:", message.data);
            ws.current?.close();
            return;
          }

          // Skip heartbeat responses
          if (message.type === "heartbeat_response") {
            return;
          }

          setLastMessage(message);
          setMessageHistory((prev) => [message, ...prev.slice(0, 99)]); // Keep last 100 messages
          onMessage?.(message);
        } catch (error) {
          console.warn("🔌 Failed to parse WebSocket message:", error);
        }
      };
    } catch (error) {
      setConnectionStatus("error");
      console.log(
        "🔌 WebSocket connection failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }, [
    url,
    protocols,
    reconnectAttempts,
    reconnectInterval,
    autoReconnect,
    connectionStatus,
    backendConfig,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
  ]);

  const disconnect = useCallback(() => {
    // Clear all timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, "Manual disconnect");
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("disconnected");
    reconnectCount.current = 0;
  }, []);

  const sendMessage = useCallback(
    (message: Omit<WebSocketMessage, "timestamp">) => {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      if (ws.current && isConnected) {
        try {
          ws.current.send(JSON.stringify(fullMessage));
          return true;
        } catch (error) {
          console.warn("🔌 Failed to send message:", error);

          // Queue message if queueing is enabled
          if (enableMessageQueue) {
            messageQueue.current.push(fullMessage);
          }
          return false;
        }
      } else if (enableMessageQueue) {
        // Queue message for later sending
        messageQueue.current.push(fullMessage);
        console.log("🔌 Message queued (not connected)");
      } else {
        console.warn("🔌 Cannot send message: WebSocket not connected");
      }

      return false;
    },
    [isConnected, enableMessageQueue],
  );

  // Send queued messages when connected
  useEffect(() => {
    if (isConnected && messageQueue.current.length > 0) {
      console.log(`🔌 Sending ${messageQueue.current.length} queued messages`);
      const messages = [...messageQueue.current];
      messageQueue.current = [];

      messages.forEach((message) => {
        if (ws.current) {
          try {
            ws.current.send(JSON.stringify(message));
          } catch (error) {
            console.warn("🔌 Failed to send queued message:", error);
            messageQueue.current.push(message); // Re-queue failed message
          }
        }
      });
    }
  }, [isConnected]);

  const subscribeToService = useCallback(
    (service: string, options?: any) => {
      return sendMessage({
        type: "subscribe",
        service,
        data: { action: "subscribe", ...options },
      });
    },
    [sendMessage],
  );

  const unsubscribeFromService = useCallback(
    (service: string) => {
      return sendMessage({
        type: "unsubscribe",
        service,
        data: { action: "unsubscribe" },
      });
    },
    [sendMessage],
  );

  const clearHistory = useCallback(() => {
    setMessageHistory([]);
    setLastMessage(null);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    messageHistory,
    sendMessage,
    subscribeToService,
    unsubscribeFromService,
    connect,
    disconnect,
    clearHistory,
    backendMode: backendConfig.mode,
    queuedMessages: messageQueue.current.length,
  };
}

// Service-specific hooks
export function useServiceWebSocket(
  service: string,
  config: WebSocketConfig = {},
) {
  const [serviceData, setServiceData] = useState<any>(null);
  const [serviceMessages, setServiceMessages] = useState<WebSocketMessage[]>(
    [],
  );

  const webSocket = useWebSocket({
    ...config,
    onMessage: (message) => {
      if (message.service === service) {
        setServiceData(message.data);
        setServiceMessages((prev) => [message, ...prev.slice(0, 49)]); // Keep last 50 service messages
      }
      config.onMessage?.(message);
    },
  });

  useEffect(() => {
    if (webSocket.isConnected) {
      webSocket.subscribeToService(service);
    }

    return () => {
      if (webSocket.isConnected) {
        webSocket.unsubscribeFromService(service);
      }
    };
  }, [webSocket.isConnected, service, webSocket]);

  return {
    ...webSocket,
    serviceData,
    serviceMessages,
    service,
  };
}

// Hook for multiple services
export function useMultiServiceWebSocket(
  services: string[],
  config: WebSocketConfig = {},
) {
  const [servicesData, setServicesData] = useState<Record<string, any>>({});
  const [allServiceMessages, setAllServiceMessages] = useState<
    WebSocketMessage[]
  >([]);

  const webSocket = useWebSocket({
    ...config,
    onMessage: (message) => {
      if (services.includes(message.service)) {
        setServicesData((prev) => ({
          ...prev,
          [message.service]: message.data,
        }));
        setAllServiceMessages((prev) => [message, ...prev.slice(0, 99)]);
      }
      config.onMessage?.(message);
    },
  });

  useEffect(() => {
    if (webSocket.isConnected) {
      services.forEach((service) => {
        webSocket.subscribeToService(service);
      });
    }

    return () => {
      if (webSocket.isConnected) {
        services.forEach((service) => {
          webSocket.unsubscribeFromService(service);
        });
      }
    };
  }, [webSocket.isConnected, services, webSocket]);

  return {
    ...webSocket,
    servicesData,
    allServiceMessages,
    services,
  };
}
