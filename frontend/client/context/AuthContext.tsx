/**
 * Authentication context for SCORPIUS application
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authAPI, User } from "@/api/auth";
import { globalWebSocketManager } from "@/lib/websocket";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Development bypass - skip authentication in development mode
        if (import.meta.env.DEV || window.location.hostname === "localhost") {
          console.log("🔓 Development mode: Bypassing authentication");
          // Set a mock user for development
          setUser({
            id: 1,
            email: "dev@scorpius.local",
            username: "developer",
            full_name: "Development User",
            is_active: true,
            is_verified: true,
            is_superuser: false,
            subscription_tier: "enterprise",
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          });
          setIsLoading(false);
          return;
        }

        if (authAPI.isAuthenticated()) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);

          // Connect WebSocket with authentication
          globalWebSocketManager.connect(authAPI.getAccessToken() || undefined);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear invalid tokens
        await authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const tokens = await authAPI.login({ email, password });

      // Store refresh token
      localStorage.setItem("refresh_token", tokens.refresh_token);

      // Get user data
      const userData = await authAPI.getCurrentUser();
      setUser(userData);

      // Connect WebSocket
      globalWebSocketManager.connect(tokens.access_token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Get refresh token for logout request
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authAPI.logout();
      }

      // Disconnect WebSocket
      globalWebSocketManager.disconnect();

      // Clear user state
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear state even if API call fails
      setUser(null);
      globalWebSocketManager.disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const newUser = await authAPI.register(userData);

      // Auto-login after registration
      await login(userData.email, userData.password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      await logout();
    }
  };

  // Auto-refresh user data periodically
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(refreshUser, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
