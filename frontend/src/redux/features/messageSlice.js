import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosInstance";

// Асинхронный thunk для получения списка всех чатов пользователя
export const fetchChats = createAsyncThunk("messages/fetchChats", async () => {
  const res = await axios.get("/messages/chats");
  return res.data;
});

// Асинхронный thunk для получения сообщений определённого чата по его ID
export const fetchMessages = createAsyncThunk("messages/fetchMessages", async (chatId) => {
  const res = await axios.get(`/messages/chats/${chatId}/messages`);
  return res.data;
});

// Асинхронный thunk для отправки нового сообщения в определённый чат
export const sendMessage = createAsyncThunk("messages/sendMessage", async ({ chatId, content }) => {
  const res = await axios.post(`/messages/chats/${chatId}/send`, { content });
  return res.data;
});

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    chats: [],         // Список всех чатов пользователя
    messages: [],      // Сообщения в выбранном чате
    selectedChat: null // ID выбранного чата
  },
  reducers: {
    // Редюсер для выбора текущего активного чата
    selectChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Когда чаты успешно загружены — обновляем состояние
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      // Когда сообщения успешно загружены — обновляем состояние
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      // Когда сообщение успешно отправлено — добавляем его в список сообщений
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { selectChat } = messageSlice.actions;

export default messageSlice.reducer;
