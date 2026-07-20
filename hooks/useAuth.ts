"use client";
import { useState, useEffect, useCallback } from "react";
import {
  login as loginApi,
  loginWithGoogle as loginWithGoogleApi,
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
  AuthUser,
  AuthResponse,
} from "@/services/auth";

interface User {
  id: number;
  name: string;
  login: string;
  role: string;
  email?: string | null;
  phone?: string | null;
}

function normalizeUser(user: AuthUser): User {
  return {
    id: user.id,
    name: user.name,
    login: user.login || user.email || user.phone || "",
    role: user.role || "user",
    email: user.email ?? null,
    phone: user.phone ?? null,
  };
}

function persistSession(response: AuthResponse) {
  if (!response.data?.access_token) return null;

  localStorage.setItem("access_token", response.data.access_token);

  const normalized = response.data.user
    ? normalizeUser(response.data.user)
    : null;

  if (normalized) {
    localStorage.setItem("user", JSON.stringify(normalized));
  }

  window.dispatchEvent(new Event("auth-changed"));
  return { token: response.data.access_token, user: normalized };
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("access_token");
      console.log(
        "Initial token from localStorage:",
        savedToken ? "exists" : "null",
      );
      return savedToken;
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      console.log(
        "Initial user from localStorage:",
        savedUser ? JSON.parse(savedUser) : "null",
      );
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const newToken = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");
      console.log(
        "Auth changed event - token:",
        newToken ? "exists" : "null",
        "user:",
        savedUser ? "exists" : "null",
      );
      setToken(newToken);
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Background token validation
  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/check", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok && res.status === 401) {
          console.log("Token invalid, clearing...");
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          window.dispatchEvent(new Event("auth-changed"));
        }
      })
      .catch(() => {});
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
      console.log("Token saved to localStorage");
    } else {
      localStorage.removeItem("access_token");
      console.log("Token removed from localStorage");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      console.log("User saved to localStorage:", user.name);
    } else {
      localStorage.removeItem("user");
      console.log("User removed from localStorage");
    }
  }, [user]);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginApi(data);
      const session = persistSession(response);
      if (session) {
        setToken(session.token);
        if (session.user) setUser(session.user);
      }
      return response;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginWithGoogleApi({ id_token: idToken });
      const session = persistSession(response);
      if (session) {
        setToken(session.token);
        if (session.user) setUser(session.user);
      }
      return response;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
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
      const session = persistSession(response);
      if (session) {
        setToken(session.token);
        if (session.user) setUser(session.user);
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
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      if (token) {
        await logoutApi(token);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setIsLoggingOut(false);
      window.dispatchEvent(new Event("auth-changed"));
    }
  }, [token, isLoggingOut]);

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
    isLoggingOut,
    login,
    loginWithGoogle,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
  };
}
