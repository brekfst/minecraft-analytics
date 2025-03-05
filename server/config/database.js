const { Pool } = require('pg');
const Redis = require('ioredis');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to be established
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to database successfully');
    release();
  }
});

// Redis client for caching
let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  redis.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
    // Continue without Redis if it fails
    redis = null;
  });
} else {
  console.log('No Redis URL provided, skipping cache initialization');
}

// Generic query function with error handling
const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries for optimization
    if (duration > 100) {
      console.log('Slow query:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (err) {
    console.error('Query error:', err.message, { text });
    throw err;
  }
};

// Cache helper functions
const getCache = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
};

const setCache = async (key, data, expiry = 300) => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(data), 'EX', expiry);
  } catch (err) {
    console.error('Redis set error:', err);
  }
};

const clearCache = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.error('Redis clear cache error:', err);
  }
};

module.exports = {
  pool,
  query,
  getCache,
  setCache,
  clearCache
};