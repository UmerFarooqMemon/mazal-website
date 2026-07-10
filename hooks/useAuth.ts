"use client";
import { useState, useEffect, useCallback } from "react";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
  changePassword as changePasswordApi,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "@/services/auth";

interface User {
  id: number;
  name: string;
  login: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // start as loading
  const [error, setError] = useState<string | null>(null);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        // Check if token is still valid
        const response = await fetch("/api/auth/check", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (response.ok) {
          setToken(savedToken);
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              /* ignore */
            }
          }
        } else {
          // Token invalid – clean up
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        // Network error – keep token but mark as unverified?
        // For safety, keep the token but don't show user until verified.
        // Actually, if network fails, keep existing state.
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            /* ignore */
          }
          setToken(savedToken);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }, [token]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginApi(data);
      if (response.data?.access_token) {
        setToken(response.data.access_token);
        if (response.data.user) {
          setUser(response.data.user);
        }
      }
      return response;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerApi(data);
      if (response.data?.access_token) {
        setToken(response.data.access_token);
        if (response.data.user) {
          setUser(response.data.user);
        }
      }
      return response;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        await logoutApi(token);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await forgotPasswordApi(data);
      return response;
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await resetPasswordApi(data);
      return response;
    } catch (err: any) {
      setError(err.message || "Password reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error("Not authenticated");
        const response = await changePasswordApi(data, token);
        return response;
      } catch (err: any) {
        setError(err.message || "Password change failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user, // must have both token and user
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
  };
}
