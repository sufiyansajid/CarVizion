import api from "./baseApi";

// Types
export interface Design {
  id: number;
  user_id: number;
  name: string;
  description: string;
  thumbnail_url?: string;
  model_data: any; // Note: underscore to match database
  color_data?: any;
  parts_data?: any;
  created_at: string; // Auto-managed by database
  updated_at: string; // Auto-managed by database
}

export interface DesignData {
  id?: number;
  name: string;
  description: string;
  thumbnail_url?: string;
  model_data?: any; // Use underscore to match database
  color_data?: any;
  parts_data?: any;
  // No date fields - they're auto-managed by database
}

export interface DesignResponse {
  message: string;
  design: Design;
}

export interface DesignsResponse {
  message: string;
  designs: Design[];
}

// designStore.ts - Update API functions
export const designApi = {
  createDesign: async (data: DesignData): Promise<DesignResponse> => {
    const response = await api.post("/api/designs", data);
    return response.data;
  },

  updateDesign: async (
    id: number,
    data: DesignData
  ): Promise<DesignResponse> => {
    const response = await api.put(`/api/designs/${id}`, data);
    return response.data;
  },

  getUserDesigns: async (): Promise<DesignsResponse> => {
    const response = await api.get("/api/designs");
    return response.data;
  },

  deleteDesign: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/designs/${id}`);
    return response.data;
  },

  // Optional: Upload thumbnail
  uploadThumbnail: async (
    designId: number,
    file: File
  ): Promise<{ thumbnail_url: string }> => {
    const formData = new FormData();
    formData.append("thumbnail", file);
    const response = await api.post(
      `/api/designs/${designId}/thumbnail`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
};
