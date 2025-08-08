import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './dist/routes.js';
import { serveStatic } from './dist/vite-prod.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expressApp = express();

// Register API routes (WebSockets not supported on CF)
await registerRoutes(expressApp);

// Serve static files from the built public directory
serveStatic(expressApp);

export const app = onRequest({
  memory: '1GiB',
  timeoutSeconds: 60
}, expressApp);
