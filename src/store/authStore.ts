import api from "./baseApi";
import type { LoginFormData, RegisterFormData } from "@/lib/schemas";

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface RegisterRequestData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    // Transform the data to match backend expectations
    const requestData: RegisterRequestData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    };

    const response = await api.post("/api/auth/register", requestData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post("/api/auth/reset-password", { token, newPassword });
    return response.data;
  },
};
