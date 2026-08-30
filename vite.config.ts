import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

// Cargar variables de entorno locales en el servidor de desarrollo
dotenv.config({ path: '.env.local' });
dotenv.config();

function oracleApiPlugin(): Plugin {
  return {
    name: 'oracle-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/patients')) {
          try {
            const { default: handler } = await server.ssrLoadModule('./api/patients.ts');
            await handler(req, res);
          } catch (e: any) {
            console.error('[Oracle API Dev Server Middleware Error]:', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }
        if (req.url && req.url.startsWith('/api/ping')) {
          try {
            const { default: handler } = await server.ssrLoadModule('./api/ping.ts');
            await handler(req, res);
          } catch (e: any) {
            console.error('[Ping Dev Server Middleware Error]:', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), oracleApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
