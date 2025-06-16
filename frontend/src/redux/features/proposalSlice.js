import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 🔁 Отправка отклика
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
        return thunkAPI.rejectWithValue(
          error.message || "Ошибка при отправке отклика"
        );
      }

      return await response.json(); // вернёт один отклик
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// 🔁 Принятие отклика
export const acceptProposal = createAsyncThunk(
  "proposal/acceptProposal",
  async ({ proposalId }, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:3000/api/proposals/accept", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ proposalId }), // теперь правильно
      });

      if (!res.ok) throw new Error("Ошибка при принятии отклика");
      return await res.json(); // вернёт { proposal }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


// 🔁 Получить отклики по projectId
export const fetchProposalsByProject = createAsyncThunk(
  "proposal/fetchByProject",
  async (projectId, thunkAPI) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/proposals/project/${projectId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(
          error.message || "Ошибка загрузки откликов"
        );
      }

      const proposals = await response.json();
      return { projectId, proposals };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// 📦 Slice
const proposalSlice = createSlice({
  name: "proposal",
  initialState: {
    proposalsByProjectId: {}, // 💡 ключ: projectId
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Создание отклика
      .addCase(createProposal.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.status = "succeeded";
        const proposal = action.payload;
        const projectId = proposal.project;
        if (!state.proposalsByProjectId[projectId]) {
          state.proposalsByProjectId[projectId] = [];
        }
        state.proposalsByProjectId[projectId].push(proposal);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ✅ Принятие отклика
      .addCase(acceptProposal.pending, (state) => {
        state.status = "loading";
      })
      .addCase(acceptProposal.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedProposal = action.payload.proposal;
        const projectId = updatedProposal.project;
        const proposals = state.proposalsByProjectId[projectId];
        if (proposals) {
          const index = proposals.findIndex(
            (p) => p._id === updatedProposal._id
          );
          if (index !== -1) {
            proposals[index] = updatedProposal;
          }
        }
      })
      .addCase(acceptProposal.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ✅ Получение откликов по проекту
      .addCase(fetchProposalsByProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProposalsByProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { projectId, proposals } = action.payload;
        state.proposalsByProjectId[projectId] = proposals;
      })
      .addCase(fetchProposalsByProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default proposalSlice.reducer;
