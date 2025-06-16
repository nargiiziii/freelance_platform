// axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

let isRefreshing = false;

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;
    const isNotRetry = !originalRequest._retry;
    const isNotAuthRoute = !originalRequest.url.includes("/auth/login") &&
                           !originalRequest.url.includes("/auth/register") &&
                           !originalRequest.url.includes("/auth/refresh");

    const requiresAuth = originalRequest.requiresAuth !== false; // по умолчанию true

    if (isUnauthorized && isNotRetry && isNotAuthRoute && requiresAuth) {
      if (isRefreshing) return Promise.reject(error);

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await instance.get("/auth/refresh");
        isRefreshing = false;
        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error("Ошибка при обновлении токена:", refreshError.message);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
