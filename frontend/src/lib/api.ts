import axios from "axios";
import * as mockData from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("skillsync_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("skillsync_token");
      // Optional: redirect to login if we have access to router outside React
      window.location.href = "/login";
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Mock wrapper helper
const withMock = async <T>(apiCall: Promise<{ data: T }>, mockFallback: T): Promise<T> => {
  try {
    const response = await apiCall;
    return response.data;
  } catch (error) {
    console.warn("Using mock data due to API failure:", error);
    return mockFallback;
  }
};

// API Services
export const appApi = {
  getHealth: () => withMock(api.get("/health"), mockData.mockHealth),
  getDependencies: () => withMock(api.get("/health/dependencies"), mockData.mockDependencies),
};

export default api;