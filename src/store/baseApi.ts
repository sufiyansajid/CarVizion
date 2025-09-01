import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Remove /api as it's included in the routes
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add logging for debugging
api.interceptors.request.use((request) => {
  console.log("Starting Request:", {
    url: request.url,
    method: request.method,
    data: request.data,
  });
  return request;
});

export default api;
