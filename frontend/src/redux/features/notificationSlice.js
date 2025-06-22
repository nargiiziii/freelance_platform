import { createSlice } from "@reduxjs/toolkit";

// Загружаем сохранённые уведомления из localStorage
const savedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: savedNotifications,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload;
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    addNotification: (state, action) => {
      state.list.push(action.payload);
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    removeNotification: (state, action) => {
      state.list = state.list.filter((n) => n.id !== action.payload);
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    clearNotifications: (state) => {
      state.list = [];
      localStorage.removeItem("notifications");
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
