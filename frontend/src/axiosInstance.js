import axios from "axios";

const instance = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: "https://freelance-platform-oi3p.onrender.com/",
  withCredentials: true,
});

let isRefreshing = false;
let alreadyLoggedOutDueToBlock = false;

instance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // 🚫 Блокировка аккаунта
    if (
      error.response?.status === 403 &&
      !alreadyLoggedOutDueToBlock &&
      !window.location.pathname.includes("/login") // ✅ добавлено: не срабатывать на /login
    ) {
      const message = error.response.data?.message;

      if (
        message === "Ваш аккаунт заблокирован" ||
        message === "Ваш аккаунт заблокирован администратором."
      ) {
        alreadyLoggedOutDueToBlock = true;

        // Очистка токенов и store
        localStorage.clear();

        if (window.store) {
          window.store.dispatch({ type: "auth/logoutUser/fulfilled" });
        }

        // ⛔️ Показываем alert и перенаправляем
        setTimeout(() => {
          alert("Ваш профиль заблокирован администратором");
          window.location.href = "/login";
        }, 0);

        // Прерываем дальнейшие запросы
        return new Promise(() => {});
      }
    }

    // 🔁 Обработка 401
    const isUnauthorized = error.response?.status === 401;
    const isNotRetry = !originalRequest._retry;
    const isNotAuthRoute = !originalRequest.url.includes("/auth/login") &&
                           !originalRequest.url.includes("/auth/register") &&
                           !originalRequest.url.includes("/auth/refresh");
    const requiresAuth = originalRequest.requiresAuth !== false;

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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
