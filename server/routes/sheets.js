// Enhanced Google Sheets Router with Caching & Connection Pooling
// ปรับปรุงให้รองรับผู้ใช้พร้อมกัน 20-40 คน

import { Router } from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import logger from '../logger.js';
import NodeCache from 'node-cache';

// ===== IN-MEMORY CACHE =====
// TTL: 30 seconds (สำหรับ read operations)
// Check period: every 60 seconds
const cache = new NodeCache({ 
  stdTTL: 30, 
  checkperiod: 60,
  useClones: false // ประหยัด memory
});

// ===== CONNECTION POOL =====
let authClientPool = null;
let lastAuthError = null;
let authInitialized = false;

function initAuthClient() {
  if (authInitialized && authClientPool) {
    return authClientPool;
  }

  try {
    // Priority 1: Service account file
    const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
    if (filePath && fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const creds = JSON.parse(raw);
      
      authClientPool = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      authInitialized = true;
      logger.info('✅ Google Sheets Auth initialized from file');
      return authClientPool;
    }

    // Priority 2: Environment variable (JSON string)
    const jsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_CREDENTIALS_JSON;
    if (jsonEnv) {
      const creds = JSON.parse(jsonEnv);
      
      authClientPool = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      authInitialized = true;
      logger.info('✅ Google Sheets Auth initialized from env');
      return authClientPool;
    }

    throw new Error('No Google service account credentials found');
  } catch (err) {
    lastAuthError = err.message;
    logger.error('❌ Failed to initialize Google Sheets auth:', err);
    throw err;
  }
}

// ===== CACHE KEY GENERATOR =====
function getCacheKey(operation, spreadsheetId, range) {
  return `${operation}:${spreadsheetId}:${range}`;
}

// ===== ROUTER FACTORY =====
export default function sheetsRouterFactory({ configured } = {}) {
  const router = Router();
  const requestQueue = new Map(); // For deduplication

  // ===== MIDDLEWARE: CHECK CONFIGURATION =====
  router.use((req, res, next) => {
    if (!configured) {
      return res.status(503).json({
        ok: false,
        error: 'Google Sheets integration not configured'
      });
    }
    next();
  });

  // ===== POST /read - Read from Google Sheets with caching =====
  router.post('/read', async (req, res) => {
    const { spreadsheetId, range } = req.body;

    // Validation
    if (!spreadsheetId || typeof spreadsheetId !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing or invalid "spreadsheetId"' 
      });
    }
    if (!range || typeof range !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing or invalid "range"' 
      });
    }

    try {
      // Check cache first
      const cacheKey = getCacheKey('read', spreadsheetId, range);
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        logger.info('📦 Cache hit for read', { spreadsheetId, range });
        return res.json({
          ok: true,
          cached: true,
          values: cachedData.values
        });
      }

      // Check if already processing this request (deduplication)
      if (requestQueue.has(cacheKey)) {
        logger.info('⏳ Request already in progress, waiting...', { spreadsheetId, range });
        const existingPromise = requestQueue.get(cacheKey);
        const result = await existingPromise;
        return res.json(result);
      }

      // Create new request
      const requestPromise = (async () => {
        try {
          const auth = initAuthClient();
          const sheets = google.sheets({ version: 'v4', auth });

          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
          });

          const result = {
            ok: true,
            cached: false,
            values: response.data.values || []
          };

          // Store in cache
          cache.set(cacheKey, { values: result.values });
          logger.info('✅ Read successful (cached)', { 
            spreadsheetId, 
            range, 
            rows: result.values.length 
          });

          return result;
        } catch (err) {
          logger.error('❌ Read failed:', { 
            spreadsheetId, 
            range, 
            error: err.message 
          });
          throw err;
        } finally {
          requestQueue.delete(cacheKey);
        }
      })();

      requestQueue.set(cacheKey, requestPromise);
      const result = await requestPromise;
      return res.json(result);

    } catch (err) {
      const status = err.code === 404 ? 404 : 
                     err.code === 403 ? 403 : 500;
      
      return res.status(status).json({
        ok: false,
        error: err.message || 'Failed to read from Google Sheets'
      });
    }
  });

  // ===== POST /append - Write to Google Sheets (no caching) =====
  router.post('/append', async (req, res) => {
    const { spreadsheetId, range, values } = req.body;

    // Validation
    if (!spreadsheetId || typeof spreadsheetId !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing or invalid "spreadsheetId"' 
      });
    }
    if (!range || typeof range !== 'string') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing or invalid "range"' 
      });
    }
    if (!Array.isArray(values)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing or invalid "values" (must be array)' 
      });
    }

    try {
      const auth = initAuthClient();
      const sheets = google.sheets({ version: 'v4', auth });

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values },
      });

      // Invalidate cache for this range
      const cacheKey = getCacheKey('read', spreadsheetId, range);
      cache.del(cacheKey);
      logger.info('🗑️ Cache invalidated after append', { spreadsheetId, range });

      logger.info('✅ Append successful', { 
        spreadsheetId, 
        range, 
        rows: values.length,
        updates: response.data.updates?.updatedRows || 0
      });

      return res.json({
        ok: true,
        updates: response.data.updates
      });

    } catch (err) {
      logger.error('❌ Append failed:', { 
        spreadsheetId, 
        range, 
        error: err.message 
      });

      const status = err.code === 404 ? 404 : 
                     err.code === 403 ? 403 : 500;
      
      return res.status(status).json({
        ok: false,
        error: err.message || 'Failed to append to Google Sheets'
      });
    }
  });

  // ===== GET /cache/stats - Cache statistics =====
  router.get('/cache/stats', (req, res) => {
    const stats = cache.getStats();
    const keys = cache.keys();
    
    res.json({
      ok: true,
      stats: {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        ksize: stats.ksize,
        vsize: stats.vsize,
        activeKeys: keys.length
      },
      keys: keys.slice(0, 10) // Show first 10 keys
    });
  });

  // ===== POST /cache/clear - Clear cache =====
  router.post('/cache/clear', (req, res) => {
    const { pattern } = req.body;
    
    if (pattern) {
      // Clear specific pattern
      const keys = cache.keys();
      const matching = keys.filter(k => k.includes(pattern));
      cache.del(matching);
      
      logger.info(`🗑️ Cleared ${matching.length} cache entries matching "${pattern}"`);
      return res.json({ ok: true, cleared: matching.length, pattern });
    } else {
      // Clear all
      cache.flushAll();
      logger.info('🗑️ Cleared all cache entries');
      return res.json({ ok: true, cleared: 'all' });
    }
  });

  // ===== GET /status - Service status =====
  router.get('/status', (req, res) => {
    res.json({
      ok: true,
      configured,
      authInitialized,
      lastAuthError,
      cache: {
        keys: cache.getStats().keys,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses
      },
      queueSize: requestQueue.size
    });
  });

  return router;
}
