// Enhanced Server Configuration for 20-40 Concurrent Users
// ปรับปรุงระบบให้รองรับผู้ใช้พร้อมกัน 20-40 คน

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cluster from 'cluster';
import os from 'os';

import sheetsRouterFactory from './routes/sheets-enhanced.js';
import logger from './logger.js';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ENABLE_CLUSTER = process.env.ENABLE_CLUSTER === 'true';
const NUM_WORKERS = Number(process.env.NUM_WORKERS || os.cpus().length);

// CORS allowlist
const ALLOW_ORIGINS = (process.env.ALLOW_ORIGINS || 'http://127.0.0.1,http://localhost')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const oUrl = new URL(origin);
      const allowed = ALLOW_ORIGINS.some(allowStr => {
        try {
          const aUrl = new URL(allowStr);
          return aUrl.protocol === oUrl.protocol && aUrl.host === oUrl.host;
        } catch {
          return allowStr === origin;
        }
      });
      return allowed ? callback(null, true) : callback(new Error('CORS not allowed'));
    } catch {
      return callback(new Error('CORS parse error'));
    }
  },
  credentials: false
};

// ===== CLUSTERING FOR SCALABILITY =====
if (ENABLE_CLUSTER && cluster.isPrimary) {
  logger.info(`🚀 Master process ${process.pid} starting with ${NUM_WORKERS} workers`);
  
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`💀 Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    cluster.fork();
  });

  // Exit gracefully on SIGTERM/SIGINT
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Gracefully shutting down workers...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
  });

} else {
  // Worker process (or single mode)
  startServer();
}

function startServer() {
  // Security & basics
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'script-src': ["'self'", 'https://cdn.tailwindcss.com'],
      'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'frame-ancestors': ["'self'"],
    },
    reportOnly: true
  }));

  app.set('x-powered-by', false);
  app.disable('x-powered-by');
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '200kb' }));
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

  // ===== ENHANCED RATE LIMITING =====
  // Global rate limit: ปรับให้รองรับ 40 users พร้อมกัน
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200, // เพิ่มจาก 60 -> 200 requests per minute
    message: { ok: false, error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip health check from rate limiting
    skip: (req) => req.path === '/api/health'
  });

  // Per-IP rate limit: ป้องกัน abuse จาก single IP
  const perIpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30, // 30 requests per minute per IP
    message: { ok: false, error: 'Too many requests from this IP' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Sheets API specific rate limit: เข้มงวดกว่าเพราะมี quota จำกัด
  const sheetsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60, // 60 requests per minute for sheets operations
    message: { ok: false, error: 'Sheets API rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(globalLimiter);
  app.use('/api', perIpLimiter);

  // ===== REQUEST TIMEOUT =====
  app.use((req, res, next) => {
    // Set timeout for requests (30 seconds)
    req.setTimeout(30000, () => {
      logger.warn('Request timeout', { url: req.originalUrl, ip: req.ip });
      res.status(408).json({ ok: false, error: 'Request timeout' });
    });
    next();
  });

  // ===== HEALTH ENDPOINT =====
  app.get('/api/health', (req, res) => {
    const started = Date.now();
    let sheetsConfigured = false;
    try { sheetsConfigured = isSheetsConfigured(); } catch(_) {}
    const hasToken = Boolean(process.env.API_TOKEN && process.env.API_TOKEN !== 'REPLACE_WITH_SECURE_RANDOM');
    
    res.json({
      ok: true,
      service: 'pd2-sheets-proxy',
      time: new Date().toISOString(),
      version: '1.0.0',
      cluster: ENABLE_CLUSTER ? { worker: cluster.worker?.id, pid: process.pid } : { mode: 'single' },
      configured: { sheets: sheetsConfigured, authToken: hasToken },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      perf: { ms: Date.now() - started }
    });
  });

  // ===== AUTH HELPER =====
  function requireBearer(req, res, next) {
    const token = process.env.API_TOKEN;
    if (!token) return res.status(503).json({ ok: false, error: 'Proxy not fully configured (API_TOKEN missing)' });
    const auth = req.headers.authorization || '';
    const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (given && given === token) return next();
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  // ===== SHEETS CONFIGURATION =====
  function isSheetsConfigured() {
    try {
      const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
      if (filePath && fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const json = JSON.parse(raw);
          if (json && json.client_email && json.private_key) return true;
        } catch (_) { }
      }
      const jsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_CREDENTIALS_JSON;
      if (jsonEnv) {
        try {
          const j = JSON.parse(jsonEnv);
          if (j && j.client_email && j.private_key) return true;
        } catch (_) { }
      }
      return false;
    } catch (_) { return false; }
  }

  const sheetsRouter = sheetsRouterFactory({
    configured: isSheetsConfigured(),
  });

  // ===== ROUTES =====
  app.use('/api/sheets', 
    (req, res, next) => {
      logger.info(`Sheets API call: ${req.method} ${req.originalUrl}`, { 
        ip: req.ip, 
        worker: cluster.worker?.id,
        bodySize: JSON.stringify(req.body).length 
      });
      next();
    }, 
    sheetsLimiter,
    requireBearer, 
    sheetsRouter
  );

  // ===== 404 FALLBACK =====
  app.use((req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, { ip: req.ip });
    res.status(404).json({ ok: false, error: 'Not Found' });
  });

  // ===== ERROR HANDLER =====
  app.use((err, req, res, next) => {
    const status = Number.isInteger(err.status) ? err.status : 500;
    const logMeta = { status, url: req.originalUrl, ip: req.ip, worker: cluster.worker?.id };
    
    if (status >= 500) {
      logger.error(`ServerError: ${err.message}`, { 
        ...logMeta, 
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack 
      });
    } else {
      logger.warn(`ClientError: ${err.message}`, logMeta);
    }
    
    const safeMessage = status >= 500 ? 'Internal server error' : (err.publicMessage || err.message || 'Request error');
    res.status(status).json({ ok: false, error: safeMessage });
  });

  // ===== START SERVER =====
  const server = app.listen(PORT, () => {
    const workerInfo = cluster.worker ? ` (worker ${cluster.worker.id})` : '';
    logger.info(`✅ [pd2-sheets-proxy${workerInfo}] listening on http://127.0.0.1:${PORT}`);
    console.log(`[pd2-sheets-proxy${workerInfo}] listening on http://127.0.0.1:${PORT}`);
  });

  // ===== GRACEFUL SHUTDOWN =====
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  // ===== UNCAUGHT EXCEPTIONS =====
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}
