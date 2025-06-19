import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Асинхронный thunk для создания нового проекта
// Используется работодателем для публикации проекта
export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, thunkAPI) => {
    try {
      const response = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...projectData, status: "open" }),
      });

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(
          error.message || "Ошибка при создании проекта"
        );
      }

      return await response.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Асинхронный thunk для получения всех проектов текущего работодателя
export const getEmployerProjects = createAsyncThunk(
  "projects/getEmployerProjects",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/projects/my-projects",
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        return thunkAPI.rejectWithValue(
          error.message || "Ошибка при загрузке проектов"
        );
      }

      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Асинхронный thunk для получения открытых проектов для фрилансеров (с фильтрацией по категории)
export const getOpenProjects = createAsyncThunk(
  "projects/getOpenProjects",
  async (category = "", thunkAPI) => {
    try {
      const url = category
        ? `http://localhost:3000/api/projects?category=${encodeURIComponent(
            category
          )}`
        : "http://localhost:3000/api/projects";

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Ошибка при получении проектов");

      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Асинхронный thunk для отправки выполненной работы фрилансером
export const submitWork = createAsyncThunk(
  "projects/submitWork",
  async ({ projectId, submittedFileUrl }, thunkAPI) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/projects/${projectId}/submit-work`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ submittedFileUrl }),
        }
      );
      if (!res.ok) throw new Error("Ошибка при отправке работы");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Асинхронный thunk для завершения проекта работодателем
export const completeProject = createAsyncThunk(
  "projects/completeProject",
  async (projectId, thunkAPI) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/projects/${projectId}/complete`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Ошибка при завершении проекта");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Асинхронный thunk для получения всех проектов текущего фрилансера
export const getFreelancerProjects = createAsyncThunk(
  "projects/getFreelancerProjects",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/projects/freelancer-projects",
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Ошибка загрузки проектов фрилансера");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    employerProjects: [],      // проекты текущего работодателя
    freelancerProjects: [],    // проекты текущего фрилансера
    openProjects: [],          // все открытые проекты
    status: {
      employer: "idle",        // статус загрузки проектов работодателя
      freelancer: "idle",      // статус загрузки проектов фрилансера
      open: "idle",            // статус загрузки открытых проектов
    },
    error: null,               // сообщение об ошибке, если есть
  },

  reducers: {}, 

  extraReducers: (builder) => {
    builder
      // Обработка createProject
      .addCase(createProject.pending, (state) => {
        state.status.employer = "loading";
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.status.employer = "succeeded";
        state.employerProjects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.status.employer = "failed";
        state.error = action.payload;
      })

      // Обработка getEmployerProjects
      .addCase(getEmployerProjects.pending, (state) => {
        state.status.employer = "loading";
      })
      .addCase(getEmployerProjects.fulfilled, (state, action) => {
        state.status.employer = "succeeded";
        state.employerProjects = action.payload;
      })
      .addCase(getEmployerProjects.rejected, (state, action) => {
        state.status.employer = "failed";
        state.error = action.payload;
      })

      // Обработка getOpenProjects
      .addCase(getOpenProjects.pending, (state) => {
        state.status.open = "loading";
      })
      .addCase(getOpenProjects.fulfilled, (state, action) => {
        state.status.open = "succeeded";
        state.openProjects = action.payload;
      })
      .addCase(getOpenProjects.rejected, (state, action) => {
        state.status.open = "failed";
        state.error = action.payload;
      })

      // Обработка submitWork (фрилансер отправляет выполненную работу)
      .addCase(submitWork.fulfilled, (state, action) => {
        const project = action.payload.project;
        const index = state.freelancerProjects.findIndex(
          (p) => p._id === project._id
        );
        if (index !== -1) state.freelancerProjects[index] = project;
      })

      // Обработка completeProject (работодатель завершает проект)
      .addCase(completeProject.fulfilled, (state, action) => {
        const project = action.payload.project;
        const index = state.employerProjects.findIndex(
          (p) => p._id === project._id
        );
        if (index !== -1) state.employerProjects[index] = project;
      })

      // Обработка getFreelancerProjects
      .addCase(getFreelancerProjects.pending, (state) => {
        state.status.freelancer = "loading";
      })
      .addCase(getFreelancerProjects.fulfilled, (state, action) => {
        state.status.freelancer = "succeeded";
        state.freelancerProjects = action.payload;
      })
      .addCase(getFreelancerProjects.rejected, (state, action) => {
        state.status.freelancer = "failed";
        state.error = action.payload;
      });
  },
});

export default projectSlice.reducer;
