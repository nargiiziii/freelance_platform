import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// vite.config.js
export default defineConfig({
  base: './', // или '/название-папки/' если деплоишь не в корень
  plugins: [react()],
});


