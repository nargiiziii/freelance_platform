import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',  // <-- обязательно для правильных относительных путей
  plugins: [react()],
});
