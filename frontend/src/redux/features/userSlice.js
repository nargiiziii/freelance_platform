import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Асинхронный экшен для получения данных пользователя с сервера по userId
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData", // имя действия
  async (userId, thunkAPI) => {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`);
    if (!response.ok) throw new Error("Ошибка при загрузке данных");
    return await response.json(); // возвращает JSON-ответ
  }
);

export const fetchFreelancerStats = createAsyncThunk(
  "user/fetchFreelancerStats",
  async (userId) => {
    const res = await fetch(
      `http://localhost:3000/api/users/freelancer-stats/${userId}`
    );
    if (!res.ok) throw new Error("Ошибка загрузки статистики");
    return await res.json();
  }
);

const userSlice = createSlice({
  name: "user", // имя слайса
  initialState: {
    data: null, // объект пользователя
    portfolio: [], // массив с работами или проектами пользователя
    status: "idle", // статус запроса (idle, loading, succeeded, failed)
    error: null, // возможная ошибка при загрузке
    stats: null,
  },
  reducers: {
    // Редуктор для установки нового портфолио вручную
    setPortfolio: (state, action) => {
      state.portfolio = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обновление статуса на "loading", когда запрос начат
      .addCase(fetchUserData.pending, (state) => {
        state.status = "loading";
      })
      // Обновление данных и статуса при успешном завершении запроса
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.portfolio = action.payload.portfolio || []; // защита от undefined
      })
      // Обновление статуса и ошибки при провале запроса
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchFreelancerStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setPortfolio } = userSlice.actions;

export default userSlice.reducer;
