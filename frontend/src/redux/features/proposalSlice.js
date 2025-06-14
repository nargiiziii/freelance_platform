import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 📤 Отправка отклика фрилансером
export const createProposal = createAsyncThunk(
  "proposal/createProposal",
  async ({ projectId, coverLetter, price }, thunkAPI) => {
    try {
      const response = await fetch("http://localhost:3000/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId, coverLetter, price }),
      });

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(error.message || "Ошибка при отправке отклика");
      }

      return await response.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// 🔄 Обновление статуса отклика (employer)
export const updateProposalStatus = createAsyncThunk(
  "proposal/updateStatus",
  async ({ proposalId, status }, thunkAPI) => {
    try {
      const response = await fetch("http://localhost:3000/api/proposals/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ proposalId, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(error.message || "Ошибка обновления статуса");
      }

      return await response.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// 📥 Получение всех откликов по проекту (опционально)
export const fetchProposalsByProject = createAsyncThunk(
  "proposal/fetchByProject",
  async (projectId, thunkAPI) => {
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/proposals`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(error.message || "Ошибка загрузки откликов");
      }

      return await response.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const proposalSlice = createSlice({
  name: "proposal",
  initialState: {
    proposals: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // 🔄 Отправка отклика
      .addCase(createProposal.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.proposals.push(action.payload);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // 🔁 Обновление статуса
      .addCase(updateProposalStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProposalStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.proposals.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
      })
      .addCase(updateProposalStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // 📥 Загрузка откликов
      .addCase(fetchProposalsByProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProposalsByProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.proposals = action.payload;
      })
      .addCase(fetchProposalsByProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default proposalSlice.reducer;
