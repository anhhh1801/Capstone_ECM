import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Centralized instance for the whole app
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Root of your backend
  timeout: 10000,
});

// Attach token automatically to all requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
