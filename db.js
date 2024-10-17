require('dotenv').config();  // Load environment variables from .env file
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL // Use the provided database URL
});

module.exports = pool;
