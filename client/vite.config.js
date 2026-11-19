import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // host: true lets phones on the same Wi-Fi open the dev site via the laptop's address
  server: { port: 5173, host: true, proxy: { '/api': 'http://localhost:5000' } },
  preview: { port: 4173, host: true, proxy: { '/api': 'http://localhost:5000' } }
  
});
