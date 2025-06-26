import axios from "axios";

if (!process.env.REACT_APP_API_URL) {
  console.warn("Warning: REACT_APP_API_URL is not set. API requests may fail.");
}

// baseURL should be like http://localhost:5000 (no /api at the end)
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Automatically attach token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
