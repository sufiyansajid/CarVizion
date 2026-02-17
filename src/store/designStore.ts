import api from "./baseApi";

// Types
export interface Design {
  id: number;
  user_id: number;
  name: string;
  description: string;
  thumbnail_url?: string;
  model_data: Record<string, unknown>; // Note: underscore to match database
  color_data?: Record<string, unknown>;
  parts_data?: Record<string, unknown>;
  activity_log?: Array<{ type: string; message: string; context: string; time: string }>;
  created_at: string; // Auto-managed by database
  updated_at: string; // Auto-managed by database
}

export interface DesignData {
  id?: number;
  name: string;
  description: string;
  thumbnail_url?: string;
  model_data?: Record<string, unknown>; // Use underscore to match database
  color_data?: Record<string, unknown>;
  parts_data?: Record<string, unknown>;
  activity_log?: Array<{ type: string; message: string; context: string; time: string }>;
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

  uploadImageDataUrl: async (
    dataUrl: string
  ): Promise<{ message: string; url: string }> => {
    const response = await api.post("/api/uploads/image", { dataUrl });
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

  getDesignById: async (id: number): Promise<DesignResponse> => {
    const response = await api.get(`/api/designs/${id}`);
    return response.data;
  },

  deleteDesign: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/designs/${id}`);
    return response.data;
  },

  // Optional: Upload thumbnail
  uploadThumbnail: async (
    designId: number,
    thumbnailUrl: string
  ): Promise<{ message: string; thumbnail_url: string }> => {
    const response = await api.patch(`/api/designs/${designId}/thumbnail`, {
      thumbnail_url: thumbnailUrl,
    });
    return response.data;
  },
};
