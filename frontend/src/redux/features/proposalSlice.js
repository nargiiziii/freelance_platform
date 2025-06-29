import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEmployerProjects } from "./projectSlice";


// Отправка отклика фрилансера на проект
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

      const proposal = await response.json();

      // ✅ Обнови отклики фрилансера
      thunkAPI.dispatch(getMyProposals());

      return proposal;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


// Принятие отклика работодателем
export const acceptProposal = createAsyncThunk(
  "proposal/acceptProposal",
  async ({ proposalId }, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:3000/api/proposals/accept", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ proposalId }),
      });

      if (!res.ok) {
        const error = await res.json();
        return thunkAPI.rejectWithValue(
          error?.message || "Ошибка при принятии отклика"
        );
      }

      const data = await res.json();

      // ✅ Обнови проекты и отклики
      thunkAPI.dispatch(getEmployerProjects());
      thunkAPI.dispatch(getMyProposals());

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Ошибка подключения к серверу");
    }
  }
);



// Получение всех откликов, связанных с конкретным проектом
export const getProposalsByProject = createAsyncThunk(
  "proposal/fetchByProject",
  async (projectId, thunkAPI) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/proposals/project/${projectId}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(
          error.message || "Ошибка загрузки откликов"
        );
      }

      const proposals = await response.json();
      return proposals;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Отклонение отклика работодателем
export const rejectProposal = createAsyncThunk(
  "proposal/rejectProposal",
  async ({ proposalId }, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:3000/api/proposals/reject", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ proposalId }),
      });

      if (!res.ok) throw new Error("Ошибка при отклонении отклика");
      return await res.json(); // возвращает обновлённый отклик
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Отправка фрилансером выполненной работы (файла)
export const submitWork = createAsyncThunk(
  "proposal/submitWork",
  async ({ projectId, file }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("workFile", file);

      const res = await fetch(
        "http://localhost:3000/api/proposals/submit-work",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Ошибка при отправке работы");

      const result = await res.json();

      // ✅ Обнови отклики и проекты (для обеих ролей)
      thunkAPI.dispatch(getMyProposals());
      thunkAPI.dispatch(getEmployerProjects());

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


// Получение всех откликов текущего пользователя (фрилансера)
export const getMyProposals = createAsyncThunk(
  "proposal/getMyProposals",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:3000/api/proposals/my", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Ошибка при загрузке откликов");
      return await res.json(); // возвращает массив откликов
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Принятие выполненной работы и выплата фрилансеру
export const acceptWorkSubmission = createAsyncThunk(
  "proposal/acceptWorkSubmission",
  async ({ proposalId }, thunkAPI) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/proposals/${proposalId}/accept-work`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        return thunkAPI.rejectWithValue(error.message || "Ошибка при оплате");
      }
      return await res.json(); // возвращает сообщение об успехе
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


const proposalSlice = createSlice({
  name: "proposal",
  initialState: {
    proposalsByProjectId: {}, // отклики, сгруппированные по projectId
    myProposals: [],           // отклики текущего пользователя
    status: "idle",            // статус загрузки
    error: null,               // сообщение об ошибке
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Обработка createProposal
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

      // Обработка acceptProposal
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

      // Обработка getProposalsByProject
      .addCase(getProposalsByProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getProposalsByProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { projectId, proposals } = action.payload;
        state.proposalsByProjectId[projectId] = proposals;
      })
      .addCase(getProposalsByProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Обработка rejectProposal
      .addCase(rejectProposal.fulfilled, (state, action) => {
        const updated = action.payload.proposal;
        const projectId = updated.project;
        const proposals = state.proposalsByProjectId[projectId];
        if (proposals) {
          const index = proposals.findIndex((p) => p._id === updated._id);
          if (index !== -1) proposals[index] = updated;
        }
      })

      // Обработка submitWork
      .addCase(submitWork.fulfilled, (state, action) => {
        const updated = action.payload.proposal;
        const projectId = updated.project._id || updated.project;
        const proposals = state.proposalsByProjectId[projectId];
        if (proposals) {
          const index = proposals.findIndex((p) => p._id === updated._id);
          if (index !== -1) proposals[index] = updated;
        }
      })

      // Обработка getMyProposals
      .addCase(getMyProposals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getMyProposals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myProposals = action.payload;
      })
      .addCase(getMyProposals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Обработка acceptWorkSubmission
      .addCase(acceptWorkSubmission.pending, (state) => {
        state.status = "loading";
      })
      .addCase(acceptWorkSubmission.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(acceptWorkSubmission.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default proposalSlice.reducer;
