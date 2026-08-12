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

export interface ProfileDocument {
  id?: number | string;
  type?: string;
  label?: string;
  name?: string;
  url?: string;
  created_at?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string | null;
  phone?: string | null;
  current_password?: string;
  remove_image?: 1;
  image?: File;
}

export interface ProfileResponse {
  status: boolean;
  message?: string;
  data?: {
    user?: AuthUser;
    documents?: ProfileDocument[];
  };
}

export interface UpdateProfileResponse extends ProfileResponse {}

export interface AuthUser {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  login?: string;
  role?: string;
  image_url?: string | null;
  email_verified_at?: string | null;
  emirates_id?: string | null;
  emirates_id_verified?: boolean;
  kyc_verified?: boolean;
  kyc_verified_at?: string | null;
  kyc_profile_type?: "uae_resident" | "international" | null;
  kyc_status?: string | null;
  kyc_status_label?: string | null;
  kyc_rejection_reason?: string | null;
  identity_verified?: boolean;
  is_active?: boolean;
}

export interface AuthResponse {
  status: boolean;
  message?: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    is_new_user?: boolean;
    user?: AuthUser;
  };
}

export interface GoogleLoginRequest {
  id_token: string;
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

// Google login via ID token (Google Identity Services → Mazal JWT)
export async function loginWithGoogle(
  data: GoogleLoginRequest,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/v1/auth/google", {
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

// Get Profile (Requires token)
export async function getProfile(
  token: string,
  locale?: string,
): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/v1/profile", {
    method: "GET",
    token,
    locale,
  });
}

function buildProfileFormData(data: UpdateProfileRequest): FormData {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.email !== undefined) formData.append("email", data.email ?? "");
  if (data.phone !== undefined) formData.append("phone", data.phone ?? "");
  if (data.current_password) {
    formData.append("current_password", data.current_password);
  }
  if (data.image) formData.append("image", data.image);
  if (data.remove_image === 1) formData.append("remove_image", "1");
  return formData;
}

// Update Profile (Requires token)
export async function updateProfile(
  data: UpdateProfileRequest,
  token: string,
  locale?: string,
): Promise<UpdateProfileResponse> {
  const usesMultipart = Boolean(data.image) || data.remove_image === 1;

  if (usesMultipart) {
    return apiRequest<UpdateProfileResponse>("/v1/profile", {
      method: "POST",
      body: buildProfileFormData(data),
      token,
      locale,
    });
  }

  const payload: Record<string, string | null> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.current_password) payload.current_password = data.current_password;

  return apiRequest<UpdateProfileResponse>("/v1/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
    locale,
  });
}
