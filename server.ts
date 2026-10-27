import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
// import path from 'path';
// import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_DEMANDS, INITIAL_CANDIDATES, INITIAL_AUDIT_LOGS, INITIAL_OFFICE_EXPENSES, INITIAL_WHATSAPP_MESSAGES } from './src/mock/initialData.js';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
// const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dffems_agency';
// const DATABASE_URL = process.env.DATABASE_URL ;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from .env');
}
app.use(express.json({ limit: '25mb' }));

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database(), current_user, NOW() AS server_time'
    );

    res.json({
      status: 'healthy',
      server: 'Express',
      database: 'connected',
      postgres: result.rows[0],
    });
  } catch (error) {
    console.error('Health check failed:', error);

    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
    });
  }
});

// In-memory buffer fallback when local PostgreSQL service is starting or paused
let memoryStore = {
  demands: [...INITIAL_DEMANDS],
  candidates: [...INITIAL_CANDIDATES],
  auditLogs: [...INITIAL_AUDIT_LOGS],
  expenses: [...INITIAL_OFFICE_EXPENSES],
  whatsappMessages: [...INITIAL_WHATSAPP_MESSAGES],
};

// PostgreSQL Connection Pool
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 3000,
});

let isPostgresConnected = false;
let postgresInfo = {
  version: '',
  database: '',
  tables: [] as string[],
  lastChecked: new Date().toISOString(),
  error: null as string | null,
};

async function checkPostgresConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT version(), current_database()');
      const tableRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      isPostgresConnected = true;
      postgresInfo = {
        version: res.rows[0]?.version || 'PostgreSQL',
        database: res.rows[0]?.current_database || 'dffems_agency',
        tables: tableRes.rows.map((r: any) => r.table_name),
        lastChecked: new Date().toISOString(),
        error: null,
      };
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    isPostgresConnected = false;
    postgresInfo = {
      version: '',
      database: '',
      tables: [],
      lastChecked: new Date().toISOString(),
      error: err.message,
    };
    return false;
  }
}

// Initial health probe
checkPostgresConnection().then((connected) => {
  if (connected) {
    console.log(`[PostgreSQL] Connected successfully to local database "${postgresInfo.database}".`);
  } else {
    console.log(`[PostgreSQL] Local PostgreSQL not detected on ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}. Serving via in-memory local buffer with zero downtime.`);
  }
});

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------
app.use('/api', (req, res, next) => {
  console.log(`[EXPRESS API] ${req.method} ${req.originalUrl}`);
  next();
});

// Database Status & Diagnostics
app.get('/api/db/status', async (req, res) => {
  const connected = await checkPostgresConnection();
  res.json({
    connected,
    mode: connected ? 'native_postgres' : 'memory_fallback',
    connectionUrl: DATABASE_URL.replace(/:[^:@]+@/, ':****@'),
    info: postgresInfo,
    recordsCount: {
      demands: memoryStore.demands.length,
      candidates: memoryStore.candidates.length,
      auditLogs: memoryStore.auditLogs.length,
      expenses: memoryStore.expenses.length,
      whatsappMessages: memoryStore.whatsappMessages.length,
    }
  });
});

// Initialize Schema
app.post('/api/db/init', async (req, res) => {
  try {
    const schemaPath = path.resolve(__dirname, 'database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ error: 'database/schema.sql not found' });
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const client = await pool.connect();
    try {
      await client.query(schemaSql);
      await checkPostgresConnection();
      res.json({ success: true, message: 'Database schema executed successfully on local PostgreSQL!', tables: postgresInfo.tables });
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demands
app.get('/api/demands', async (req, res) => {
  if (isPostgresConnected && postgresInfo.tables.includes('company_demands')) {
    try {
      const result = await pool.query('SELECT * FROM company_demands ORDER BY created_at DESC');
      return res.json(result.rows);
    } catch (e) {
      console.error('Error querying demands from postgres:', e);
    }
  }
  res.json(memoryStore.demands);
});

app.post('/api/demands', async (req, res) => {
  const demand = req.body;
  memoryStore.demands.unshift(demand);
  if (isPostgresConnected && postgresInfo.tables.includes('company_demands')) {
    try {
      await pool.query(
        `INSERT INTO company_demands (id, company_name, country, country_flag, lot_number, title, category, quota_requested, quota_approved, salary, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
        [demand.id, demand.companyName, demand.country, demand.countryFlag || '🌐', demand.lotNumber, demand.title, demand.category, demand.quotaRequested, demand.quotaApproved || 0, demand.salary || 0, demand.currency || 'AED', demand.status || 'pre_permission_pending']
      );
    } catch (e) {
      console.error('Error inserting demand to postgres:', e);
    }
  }
  res.status(201).json(demand);
});

// Candidates
app.get('/api/candidates', async (req, res) => {
  if (isPostgresConnected && postgresInfo.tables.includes('candidates')) {
    try {
      const result = await pool.query('SELECT * FROM candidates ORDER BY created_at DESC');
      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (e) {
      console.error('Error querying candidates from postgres:', e);
    }
  }
  res.json(memoryStore.candidates);
});

app.post('/api/candidates', async (req, res) => {
  const candidate = req.body;
  const existingIdx = memoryStore.candidates.findIndex(c => c.id === candidate.id);
  if (existingIdx >= 0) {
    memoryStore.candidates[existingIdx] = candidate;
  } else {
    memoryStore.candidates.unshift(candidate);
  }
  res.status(201).json(candidate);
});

app.put('/api/candidates/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const idx = memoryStore.candidates.findIndex(c => c.id === id);
  if (idx >= 0) {
    memoryStore.candidates[idx] = { ...memoryStore.candidates[idx], ...updates };
    return res.json(memoryStore.candidates[idx]);
  }
  res.status(404).json({ error: 'Candidate not found' });
});

// Expenses
app.get('/api/expenses', (req, res) => {
  res.json(memoryStore.expenses);
});

app.post('/api/expenses', (req, res) => {
  const expense = req.body;
  memoryStore.expenses.unshift(expense);
  res.status(201).json(expense);
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(memoryStore.auditLogs);
});

app.post('/api/audit-logs', (req, res) => {
  const log = req.body;
  memoryStore.auditLogs.unshift(log);
  res.status(201).json(log);
});

// WhatsApp Messages
app.get('/api/whatsapp-messages', (req, res) => {
  res.json(memoryStore.whatsappMessages);
});

app.post('/api/whatsapp-messages', (req, res) => {
  const msg = req.body;
  memoryStore.whatsappMessages.unshift(msg);
  res.status(201).json(msg);
});

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl,
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_req, file, cb) => {
    if (
      ['image/jpeg', 'image/png', 'image/webp']
        .includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WEBP are allowed'));
    }
  },
});

app.post(
  '/api/candidates/:id/documents',
  requireAuthenticatedStaff,
  upload.fields([
    { name: 'passport', maxCount: 1 },
    { name: 'portrait', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const candidateId = req.params.id;

      // Never trust an arbitrary path supplied by the client.
      if (!/^CAND-[A-Za-z0-9-]+$/.test(candidateId)) {
        return res.status(400).json({
          error: 'Invalid candidate ID',
        });
      }

      // Verify this candidate exists and the staff member
      // has permission to manage its documents.
      const candidate = await pool.query(
        'SELECT id FROM candidates WHERE id = $1',
        [candidateId]
      );

      if (!candidate.rowCount) {
        return res.status(404).json({
          error: 'Candidate not found',
        });
      }

      const files = req.files as Record<string, Express.Multer.File[]>;
      const passport = files?.passport?.[0];
      const portrait = files?.portrait?.[0];

      if (!passport || !portrait) {
        return res.status(400).json({
          error: 'Passport and portrait are required',
        });
      }

      // Decode and verify actual image content with an
      // image-processing library before persisting.
      // Do not rely on MIME type alone.

      const dir = path.join(
        process.cwd(),
        'storage',
        'candidates',
        candidateId
      );

      await fs.mkdir(dir, { recursive: true });

      const passportName = `passport-${crypto.randomUUID()}`;
      const portraitName = `profile-${crypto.randomUUID()}`;

      // Image extension should be determined from
      // verified content rather than client filename.
      // This example assumes validated JPEG buffers.
      const passportPath = path.join(dir, `${passportName}.jpg`);
      const portraitPath = path.join(dir, `${portraitName}.jpg`);

      await fs.writeFile(passportPath, passport.buffer, { flag: 'wx' });
      await fs.writeFile(portraitPath, portrait.buffer, { flag: 'wx' });

      return res.status(201).json({
        message: 'Candidate documents saved',
        passportStored: true,
        portraitStored: true,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Unable to save documents',
      });
    }
  }
);

// ----------------------------------------------------------------------------
// VITE INTEGRATION / STATIC SERVING
// ----------------------------------------------------------------------------
// async function startServer() {
//   if (process.env.NODE_ENV !== 'production') {
//     const vite = await createViteServer({
//       server: {
//         middlewareMode: true,
//         hmr: process.env.DISABLE_HMR !== 'true',
//         watch: process.env.DISABLE_HMR === 'true' ? null : {},
//       },
//       appType: 'spa',
//     });
//     console.log('[EXPRESS] API routes registered; mounting Vite');
//     app.use(vite.middlewares);
//   } else {
//     app.use(express.static(path.resolve(__dirname, 'dist')));
//     app.get('*', (req, res) => {
//       res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
//     });
//   }

//   app.listen(PORT, '0.0.0.0', () => {
//     console.log(`DFFEMS Web Server running at http://localhost:${PORT}`);
//   });
// }
// startServer();
async function startServer() {
  const connected = await checkPostgresConnection();

  if (connected) {
    console.log(
      `[PostgreSQL] Connected to "${postgresInfo.database}".`
    );
    // console.log('[PostgreSQL] Tables:', postgresInfo.tables);
  } else {
    console.error(
      '[PostgreSQL] Connection failed:',
      postgresInfo.error
    );
    process.exit(1);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));

    app.get('/{*path}', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `DFFEMS Web Server running at http://localhost:${PORT}`
    );
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});


