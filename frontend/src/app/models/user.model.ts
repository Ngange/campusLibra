export interface User {
  id?: string;
  _id?: string; // MongoDB id field
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  // role is auto-assigned as 'member' in backend
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
