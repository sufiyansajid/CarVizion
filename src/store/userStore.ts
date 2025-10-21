import api from "./baseApi";

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  message: string;
  user: User;
}

export interface AvatarResponse {
  message: string;
  user: User;
  avatarUrl: string;
}

// API Functions
export const userApi = {
  getProfile: async (): Promise<UserResponse> => {
    const response = await api.get("/api/users/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserResponse> => {
    const response = await api.put("/api/users/profile", data);
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordData
  ): Promise<{ message: string }> => {
    const response = await api.put("/api/users/change-password", data);
    return response.data;
  },

  updateAvatar: async (formData: FormData): Promise<AvatarResponse> => {
    const response = await api.post("/api/users/avatar", formData);
    return response.data;
  },

  deleteAvatar: async (): Promise<{ message: string }> => {
    const response = await api.delete("/api/users/avatar");
    return response.data;
  },
};
