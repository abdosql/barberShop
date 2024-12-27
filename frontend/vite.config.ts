import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Add Fast Refresh
      fastRefresh: true
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Enable HMR
    hmr: {
      overlay: true,
      clientPort: 5173,
      host: 'localhost'
    },
    // Watch for file changes more aggressively
    watch: {
      usePolling: true,
      interval: 100, // Poll every 100ms
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  }
});
