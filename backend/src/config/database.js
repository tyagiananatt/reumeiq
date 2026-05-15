// ============================================================
// ResumeIQ — PostgreSQL Database Configuration
// Uses pg (node-postgres) for connection pooling
// ============================================================

'use strict';

const { Pool } = require('pg');
const { DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV } = require('./env');

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

/**
 * Execute a query with automatic connection management
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 */
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (NODE_ENV === 'development') {
      console.log(`📊 Query executed in ${duration}ms:`, text.substring(0, 50));
    }
    return res;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

/**
 * Get a client from the pool (for transactions)
 */
const getClient = () => pool.connect();

/**
 * Initialize database schema
 */
const initDatabase = async () => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create resumes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        raw_text TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'complete', 'error')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create analysis_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ats_score INTEGER NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
        format_score INTEGER,
        keyword_score INTEGER,
        experience_score INTEGER,
        readability_score INTEGER,
        skills_found JSONB DEFAULT '[]',
        missing_skills JSONB DEFAULT '[]',
        suggestions JSONB DEFAULT '[]',
        keywords JSONB DEFAULT '[]',
        sections JSONB DEFAULT '{}',
        strengths JSONB DEFAULT '[]',
        weaknesses JSONB DEFAULT '[]',
        word_count INTEGER,
        job_description TEXT,
        match_score INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
      CREATE INDEX IF NOT EXISTS idx_analysis_resume_id ON analysis_results(resume_id);
      CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON analysis_results(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply trigger to tables
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
      CREATE TRIGGER update_resumes_updated_at
        BEFORE UPDATE ON resumes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query('COMMIT');
    console.log('✅ Database schema initialized');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { query, getClient, pool, initDatabase };
