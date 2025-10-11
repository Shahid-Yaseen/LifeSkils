import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "student" | "admin";
  overallProgress?: number;
  totalStudyTime?: number;
  currentStreak?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionType?: string;
  subscriptionStatus?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  firstName: string;
  username: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; user: User | null }>({
    isAuthenticated: false,
    user: null
  });

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      // Try to get current user
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAuthState({ isAuthenticated: true, user: userData });
      } else if (response.status === 401) {
        // Try to refresh token
        await refreshTokens();
      } else {
        // Invalid tokens, clear them
        clearTokens();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Get user data with new token
        const userResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      clearTokens();
    }
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setAuthState({ isAuthenticated: false, user: null });
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      // Set user and ensure state update
      setUser(data.user);
      setAuthState({ isAuthenticated: true, user: data.user });

      // Clear any cached data
      queryClient.clear();
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", registerData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      // Set user and ensure state update
      setUser(data.user);
      setAuthState({ isAuthenticated: true, user: data.user });

      // Clear any cached data
      queryClient.clear();
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        await apiRequest("POST", "/api/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      queryClient.clear();
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setAuthState({ isAuthenticated: true, user: updatedUser });
  };

  const value: AuthContextType = {
    user: authState.user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: authState.isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Axios interceptor setup for automatic token handling
export const setupAuthInterceptors = () => {
  // Request interceptor to add auth token
  const requestInterceptor = (config: any) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  // Response interceptor to handle token refresh
  const responseInterceptor = async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return fetch(originalRequest);
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  };

  return { requestInterceptor, responseInterceptor };
};