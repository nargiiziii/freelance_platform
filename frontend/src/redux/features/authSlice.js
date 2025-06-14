// ✅ authSlice.js (обновлённый)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axiosInstance';

// 🔐 Логин
export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const res = await axios.post('/auth/login', credentials);
    return res.data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || "Ошибка при входе");
  }
});

// 🔁 Обновление профиля
export const updateUser = createAsyncThunk('auth/updateUser', async ({ userId, userData }, thunkAPI) => {
  try {
    const res = await axios.put(`/users/${userId}`, userData);
    return res.data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || "Ошибка при обновлении");
  }
});

// 🔁 Получение профиля из cookie токена
export const getProfile = createAsyncThunk('auth/getProfile', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/auth/profile');
    return res.data;
  } catch (e) {
    return thunkAPI.rejectWithValue("Не удалось загрузить профиль");
  }
});

// 🧹 Logout
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, thunkAPI) => {
  try {
    await axios.post('/auth/logout');
    return true;
  } catch (e) {
    return thunkAPI.rejectWithValue("Ошибка при выходе");
  }
});

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user._id || user.id,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = normalizeUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload);
      })
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
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
