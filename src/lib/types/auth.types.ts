/**
 * @fileoverview Authentication Types
 * @description Type definitions for authentication system
 */

export interface User {
  id: string;
  email: string;
  name: string;
  wallet: string;
  country: string;
  role: 'BUYER' | 'SELLER';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  wallet: string;
  signature: string;
  message: string; // The fullMessage that was signed by Petra
  nonce: string;
  timestamp: number;
  publicKey: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  country: string;
  wallet: string;
  signature: string;
  message: string; // The fullMessage that was signed by Petra
  nonce: string;
  role: 'BUYER' | 'SELLER';
  timestamp: number;
  publicKey: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  };
}

export interface RefreshResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserResponse {
  success: boolean;
  data?: User;
}

export interface UpdateUserRequest {
  name?: string;
  country?: string;
}
