// Импортируем библиотеку axios для отправки HTTP-запросов
import axios from "axios";

// Создаём экземпляр axios с базовым URL и включённой передачей cookie (например, httpOnly куки)
const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Флаг, который отслеживает, выполняется ли в данный момент обновление токена
let isRefreshing = false;

// Добавляем перехватчик ответов, чтобы обработать ошибки, такие как 401 (Unauthorized)
instance.interceptors.response.use(
  // Если ответ успешный — просто возвращаем его
  (response) => response,

  // Если произошла ошибка — выполняем логику ниже
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, что ошибка — это 401 Unauthorized
    const isUnauthorized = error.response?.status === 401;

    // Проверяем, что это первый повтор запроса (иначе предотвращаем зацикливание)
    const isNotRetry = !originalRequest._retry;

    // Исключаем маршруты аутентификации из логики обновления токена
    const isNotAuthRoute = !originalRequest.url.includes("/auth/login") &&
                           !originalRequest.url.includes("/auth/register") &&
                           !originalRequest.url.includes("/auth/refresh");

    // Проверяем, требует ли маршрут авторизации (по умолчанию true)
    const requiresAuth = originalRequest.requiresAuth !== false;

    // Если запрос не авторизован, не был повторён, не касается auth и требует авторизации
    if (isUnauthorized && isNotRetry && isNotAuthRoute && requiresAuth) {
      // Если обновление уже происходит — возвращаем ошибку
      if (isRefreshing) return Promise.reject(error);

      // Помечаем запрос как повторяемый, чтобы не зациклить
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Пытаемся обновить токен
        await instance.get("/auth/refresh");

        // Убираем флаг и повторяем оригинальный запрос
        isRefreshing = false;
        return instance(originalRequest);
      } catch (refreshError) {
        // Если обновление не удалось — выводим ошибку и передаём дальше
        isRefreshing = false;
        console.error("Ошибка при обновлении токена:", refreshError.message);
        return Promise.reject(refreshError);
      }
    }

    // Возвращаем ошибку, если не сработали условия выше
    return Promise.reject(error);
  }
);

// Экспортируем настроенный экземпляр axios для использования в приложении
export default instance;
