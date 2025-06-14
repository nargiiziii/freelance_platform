import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Асинхронный запрос на получение данных пользователя
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (userId, thunkAPI) => {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`);
    if (!response.ok) throw new Error('Ошибка при загрузке данных');
    return await response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    portfolio: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setPortfolio: (state, action) => {
      state.portfolio = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.portfolio = action.payload.portfolio || [];
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setPortfolio } = userSlice.actions;
export default userSlice.reducer;
