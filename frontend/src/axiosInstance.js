// src/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // ✅ обязательно, чтобы cookie автоматически передавались
});

// ❌ Удаляем interceptor с токеном из localStorage — он больше не нужен

export default instance;
