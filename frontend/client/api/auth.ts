/**
 * Authentication API service for SCORPIUS frontend
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  subscription_tier: string;
  created_at: string;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
  errors?: any[];
}

class AuthAPI {
  private accessToken: string | null = null;

  constructor() {
    // Load access token from localStorage if available
    this.accessToken = localStorage.getItem("access_token");
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
        ...options.headers,
      },
      credentials: "include", // Include cookies for refresh token
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 - attempt token refresh
      if (response.status === 401 && this.accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${this.accessToken}`,
          };
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          this.logout();
          throw new Error("Authentication failed");
        }
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<User> {
    return this.makeRequest<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<AuthTokens> {
    const tokens = await this.makeRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store access token
    this.accessToken = tokens.access_token;
    localStorage.setItem("access_token", tokens.access_token);

    return tokens;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await this.makeRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear tokens regardless of API call success
      this.accessToken = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return false;
      }

      const tokens = await this.makeRequest<AuthTokens>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      // Update stored tokens
      this.accessToken = tokens.access_token;
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest<User>("/auth/me");
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.makeRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.makeRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return this.makeRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const authAPI = new AuthAPI();
