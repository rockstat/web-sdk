import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// DEMO_LIB=dev npm run dev — для дев-сборки SDK; по умолчанию прод (dist/lib.js)
const libFile = process.env.DEMO_LIB === 'dev' ? 'lib-dev.js' : 'lib.js';
const libPath = path.resolve(__dirname, '../dist', libFile);

const GIF_1PX = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

// Отдаёт свежесобранный SDK из ../dist и принимает события трекера,
// чтобы их payload было видно в терминале и в DevTools -> Network
const trackerBackend = () => ({
  name: 'tracker-backend',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url.split('?')[0];

      if (url === '/lib.js') {
        if (!fs.existsSync(libPath)) {
          res.statusCode = 404;
          return res.end('// Build the SDK first: npm run build:dev (in repo root)');
        }
        res.setHeader('Content-Type', 'application/javascript');
        return fs.createReadStream(libPath).pipe(res);
      }

      if (url === '/public/rrweb-record.js') {
        const rrwebPath = path.resolve(__dirname, '../dist', 'rrweb-record.js');
        if (!fs.existsSync(rrwebPath)) {
          res.statusCode = 404;
          return res.end('// Build the SDK first: npm run build:dev (in repo root)');
        }
        res.setHeader('Content-Type', 'application/javascript');
        return fs.createReadStream(rrwebPath).pipe(res);
      }

      if (url.startsWith('/band/')) {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          if (body) {
            try {
              const msg = JSON.parse(body);
              // rec_batch несёт десятки KB данных rrweb — в лог только начало
              console.log(`[track] ${msg.name || msg.service || url}`,
                JSON.stringify(msg.data || {}).slice(0, 200));
            } catch (e) {
              console.log('[track] raw', body.slice(0, 200));
            }
          }
          if (url.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
            res.end(GIF_1PX);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.end('{}');
          }
        });
        return;
      }

      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), trackerBackend()],
  server: {
    port: 5173,
  },
});
