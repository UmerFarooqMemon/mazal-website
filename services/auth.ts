import { apiRequest } from "./api";

// Types
export interface RegisterRequest {
  name: string;
  login: string; // email or phone
  password: string;
  password_confirmation: string;
}

export interface LoginRequest {
  login: string; // email or phone
  password: string;
}

export interface ForgotPasswordRequest {
  login: string; // email or phone
}

export interface ResetPasswordRequest {
  login: string;
  token: string; // 6-digit code
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  status: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user?: {
      id: number;
      name: string;
      login: string;
      role: string;
    };
  };
}

export interface LogoutResponse {
  status: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  status: boolean;
  data: {
    message: string;
    debug_token?: string; // Only in debug mode
  };
}

// Register (Email or Phone)
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Login (Email or Phone)
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Logout (Requires token)
export async function logout(token: string): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/v1/auth/logout", {
    method: "POST",
    token,
  });
}

// Forgot Password (Send reset code)
export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Reset Password (Use 6-digit code)
export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Change Password (Requires token)
export async function changePassword(
  data: ChangePasswordRequest,
  token: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}
