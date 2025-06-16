import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axiosInstance";

export const fetchChats = createAsyncThunk("messages/fetchChats", async () => {
  const res = await axios.get("/messages/chats");
  return res.data;
});

export const fetchMessages = createAsyncThunk("messages/fetchMessages", async (chatId) => {
  const res = await axios.get(`/messages/chats/${chatId}/messages`);
  return res.data;
});

export const sendMessage = createAsyncThunk("messages/sendMessage", async ({ chatId, content }) => {
  const res = await axios.post(`/messages/chats/${chatId}/send`, { content });
  return res.data;
});

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    chats: [],
    messages: [],
    selectedChat: null,
  },
  reducers: {
    selectChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { selectChat } = messageSlice.actions;
export default messageSlice.reducer;
