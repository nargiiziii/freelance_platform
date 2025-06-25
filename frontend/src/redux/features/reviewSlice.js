import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosInstance";

// Отправка отзыва
export const sendReview = createAsyncThunk(
  "reviews/sendReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/reviews", reviewData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Ошибка при отправке отзыва"
      );
    }
  }
);

// Получение отзывов по пользователю
export const fetchUserReviews = createAsyncThunk(
  "reviews/fetchUserReviews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/reviews/my`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Ошибка при загрузке отзывов"
      );
    }
  }
);

// Получение отзывов ДЛЯ пользователя (по userId)
export const fetchReviewsForUser = createAsyncThunk(
  "reviews/fetchReviewsForUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/reviews/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Ошибка при загрузке отзывов пользователя"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.push(action.payload);
      })
      .addCase(sendReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchReviewsForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reviewSlice.reducer;
