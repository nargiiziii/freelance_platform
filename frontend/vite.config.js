import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // <-- это оставляем
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // <-- добавь это!
    port: 5173         // <-- можно указать явно, если хочешь
  }
});
