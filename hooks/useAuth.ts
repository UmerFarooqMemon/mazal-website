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
  // Read initial state directly from localStorage to avoid flicker
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false); // used only during API calls now
  const [error, setError] = useState<string | null>(null);

  // Background token validation – does not affect initial render
  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/check", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok && res.status === 401) {
          // Token is invalid – clean up
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      })
      .catch(() => {
        // Network error – keep session alive
      });
  }, []); // run only once on mount

  // Keep localStorage in sync with state
  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }, [token]);

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
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
  };
}
