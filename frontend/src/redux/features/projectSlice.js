import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ✅ Создание проекта (employer)
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, thunkAPI) => {
    try {
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(error.message || 'Ошибка при создании проекта');
      }

      return await response.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ✅ Получение проектов работодателя
export const getEmployerProjects = createAsyncThunk(
  'projects/getEmployerProjects',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('http://localhost:3000/api/projects/my-projects', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(error.message || 'Ошибка при загрузке проектов');
      }

      return await response.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ✅ Получение открытых проектов для фрилансеров
export const getOpenProjects = createAsyncThunk(
  'projects/getOpenProjects',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('http://localhost:3000/api/projects', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Ошибка при получении проектов');
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ✅ Отправка отклика фрилансером
export const sendProposal = createAsyncThunk(
  'projects/sendProposal',
  async ({ projectId, coverLetter, price }, thunkAPI) => {
    try {
      const res = await fetch('http://localhost:3000/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId, coverLetter, price }),
      });
      if (!res.ok) throw new Error('Ошибка при отправке отклика');
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 📤 Создание проекта
      .addCase(createProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // 📥 Проекты работодателя
      .addCase(getEmployerProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getEmployerProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getEmployerProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // 📥 Открытые проекты для фрилансеров
      .addCase(getOpenProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getOpenProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getOpenProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default projectSlice.reducer;
