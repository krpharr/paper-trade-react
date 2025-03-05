import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';  // Explicitly import path

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8020, // Change Vite dev server port to 8000
    host: true, // Allows access from outside the VM if needed
  },
});

