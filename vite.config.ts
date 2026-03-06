import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const resolveManualChunk = (id: string): string | undefined => {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  // Chunk-Grenzen sind auf docs/performance-budgets.md abgestimmt.
  if (id.includes('/@mui/')) {
    return 'mui-vendor';
  }

  if (id.includes('/react-hook-form/') || id.includes('/zod/')) {
    return 'form-vendor';
  }

  if (id.includes('/react/') || id.includes('/react-dom/')) {
    return 'react-vendor';
  }

  return undefined;
};

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Development-only proxy. Production routing is defined by the deployed reverse proxy/API gateway.
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: resolveManualChunk,
      },
    },
  },
});
