import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const apiProxyTarget = (env) =>
  env.VITE_APP_API_BASE_URL || env.VITE_BASE44_APP_BASE_URL;

// https://vite.dev/config/
export default defineConfig(({ mode, root = process.cwd() }) => {
  const env = loadEnv(mode ?? 'development', root, '');
  const proxyTarget = apiProxyTarget(env);

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react-vendor';
            if (id.includes('react-router')) return 'router';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('lucide-react')) return 'icons';
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
    server: {
      open: true,
      ...(proxyTarget
        ? {
            proxy: {
              '/api': {
                target: proxyTarget,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
  };
});
