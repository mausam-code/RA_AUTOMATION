#!/usr/bin/env node
/**
 * Direct PostgreSQL Database Initializer (No Docker Required)
 * Connects directly to locally installed PostgreSQL service on your PC,
 * creates the database if missing, executes schema.sql, and seeds data.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_URL = 'postgresql://postgres:postgres@localhost:5432/dffems_agency';
const targetUrl = process.env.DATABASE_URL || DEFAULT_URL;

console.log('================================================================');
console.log('  DFFEMS POSTGRESQL INITIALIZER (LOCAL DEVELOPMENT PC - NO DOCKER)');
console.log('================================================================');
console.log(`Connecting to: ${targetUrl.replace(/:[^:@]+@/, ':****@')}`);

async function initialize() {
  const urlObj = new URL(targetUrl);
  const targetDbName = urlObj.pathname.replace(/^\//, '') || 'dffems_agency';

  // Step 1: Connect to the default 'postgres' database to ensure target DB exists
  const rootUrl = new URL(targetUrl);
  rootUrl.pathname = '/postgres';

  const rootClient = new pg.Client({ connectionString: rootUrl.toString() });

  try {
    await rootClient.connect();
    console.log('Connected to local PostgreSQL server successfully.');

    const checkDb = await rootClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDbName]
    );

    if (checkDb.rowCount === 0) {
      console.log(`Creating database "${targetDbName}"...`);
      await rootClient.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database "${targetDbName}" created successfully!`);
    } else {
      console.log(`Database "${targetDbName}" already exists.`);
    }
  } catch (err) {
    console.warn(`Note: Could not check/create database via root 'postgres' db (${err.message}). Attempting direct connection to "${targetDbName}"...`);
  } finally {
    try { await rootClient.end(); } catch (e) {}
  }

  // Step 2: Connect directly to target database
  const targetClient = new pg.Client({ connectionString: targetUrl });
  try {
    await targetClient.connect();
    console.log(`Connected to database "${targetDbName}".`);

    // Step 3: Read and execute schema.sql
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing database/schema.sql...');
    await targetClient.query(schemaSql);
    console.log('Schema executed successfully! (Tables: users, company_demands, candidates, office_expenses, audit_logs, whatsapp_messages)');

    // Step 4: Verify tables
    const tablesRes = await targetClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nVerified tables in database:');
    tablesRes.rows.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.table_name}`);
    });

    console.log('\n================================================================');
    console.log('  SUCCESS! Local PostgreSQL database is ready for the Web Project!');
    console.log('  Run "npm run dev" to launch the application.');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\nERROR initializing PostgreSQL database:', err.message);
    console.error('\nTips for Local PostgreSQL:');
    console.error('1. Make sure your local PostgreSQL service is running:');
    console.error('   - Windows: Check "Services" app -> "postgresql-x64-..." is Running');
    console.error('   - Linux: sudo systemctl start postgresql');
    console.error('   - macOS: brew services start postgresql');
    console.error('2. If your PostgreSQL password is not "postgres", update .env:');
    console.error('   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dffems_agency"');
    process.exit(1);
  } finally {
    try { await targetClient.end(); } catch (e) {}
  }
}

initialize();
