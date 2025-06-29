// Импорт необходимых функций из Redux Toolkit и axios-инстанса
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosInstance";

// Асинхронный thunk для логина пользователя
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post("/auth/login", credentials);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Ошибка при входе"
      );
    }
  }
);

// Асинхронный thunk для обновления данных пользователя (редактирование профиля)
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ userId, userData }, thunkAPI) => {
    try {
      const res = await axios.put(`/users/${userId}`, userData);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Ошибка при обновлении"
      );
    }
  }
);

// Асинхронный thunk для получения текущего профиля (по токену в cookie)
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/auth/profile", {
        requiresAuth: false, // Не вызывает refresh, если пользователь не авторизован
      });
      return res.data;
    } catch (e) {
      if (e.response?.status === 401) {
        return null; // Если не авторизован, возвращаем null
      }
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Ошибка при получении профиля"
      );
    }
  }
);

// Асинхронный thunk для выхода пользователя (logout)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await axios.post("/auth/logout");
      return true;
    } catch (e) {
      return thunkAPI.rejectWithValue("Ошибка при выходе");
    }
  }
);

// Вспомогательная функция для нормализации объекта пользователя
const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user._id || user.id,
  };
};

// Асинхронный thunk для пополнения баланса пользователя
export const topUpBalance = createAsyncThunk(
  "auth/topUpBalance",
  async (amount, thunkAPI) => {
    try {
      const res = await axios.post("/escrow/topup", { amount }); // 👈 путь изменён
      const state = thunkAPI.getState();

      return {
        ...state.auth.user,
        balance: res.data.newBalance, // 👈 новое поле
      };
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Ошибка при пополнении"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Объект текущего пользователя
    loading: false, // Флаг загрузки для async операций
    error: null, // Сообщение об ошибке
  },
  reducers: {
    // Редьюсер для ручной установки пользователя
    setUser: (state, action) => {
      state.user = normalizeUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка состояний запроса loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Обновление пользователя после успешного изменения профиля
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload);
      })

      // Обработка состояний запроса getProfile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload);
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Очистка пользователя после выхода
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })

      // Обновление баланса после успешного пополнения
      .addCase(topUpBalance.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload);
      });
  },
});

export const { setUser } = authSlice.actions;

export default authSlice.reducer;
