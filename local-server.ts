import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './api/_backend.js';

const port = Number(process.env.PORT) || 3000;

async function start() {
  const isProduction =
    process.env.NODE_ENV === 'production' || path.extname(process.argv[1] || '') === '.cjs';

  if (isProduction) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_request, response) => {
      response.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DocWise server listening on http://0.0.0.0:${port}`);
  });
}

void start();
