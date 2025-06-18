import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosInstance";
import { getProfile } from "./authSlice";

export const createEscrow = createAsyncThunk(
  "escrow/create",
  async (data, thunkAPI) => {
    try {
      const res = await axios.post("/escrow", data);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Ошибка при создании escrow"
      );
    }
  }
);

export const releaseFunds = createAsyncThunk(
  "escrow/release",
  async (escrowId, thunkAPI) => {
    try {
      const res = await axios.post(`/escrow/${escrowId}/release`);
      thunkAPI.dispatch(getProfile()); // ⬅️ обновляем профиль
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Ошибка release"
      );
    }
  }
);

export const refundFunds = createAsyncThunk(
  "escrow/refund",
  async (escrowId, thunkAPI) => {
    try {
      const res = await axios.post(`/escrow/${escrowId}/refund`);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Ошибка refund"
      );
    }
  }
);

const escrowSlice = createSlice({
  name: "escrow",
  initialState: { escrowData: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createEscrow.fulfilled, (state, action) => {
        state.escrowData = action.payload;
      })
      .addCase(releaseFunds.fulfilled, (state, action) => {
        state.escrowData = action.payload;
      })
      .addCase(refundFunds.fulfilled, (state, action) => {
        state.escrowData = action.payload;
      });
  },
});

export default escrowSlice.reducer;
