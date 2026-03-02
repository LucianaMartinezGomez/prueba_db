// Configura cliente PostgreSQL (`pg` Pool) usando `DATABASE_URL`
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL: Connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL: Unexpected error on idle client', err);
  process.exit(-1);
});

// Exportamos `query` para conveniencia y `pool` para usos avanzados
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};