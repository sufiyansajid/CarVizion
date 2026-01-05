/**
 * User-related TypeScript interfaces for the CarVizion application
 */

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  membership: 'Free' | 'Premium' | 'Pro';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  user: User;
  designCount?: number;
  storageUsed?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
